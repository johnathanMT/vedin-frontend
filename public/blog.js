/* ============================================================================
 * blog.js — all logic for blog.html, externalised so the page needs NO inline
 * <script> blocks and NO inline event-handler attributes. This lets the CSP use
 * a strict `script-src 'self'` (no 'unsafe-inline'). All DOM wiring uses
 * addEventListener. Loaded as a classic script AFTER api.js.
 * ========================================================================== */
(function () {
  'use strict';

  // TRACE: confirms blog.js ran AND that api.js loaded first (PortfolioAPI defined).
  // If you see "PortfolioAPI: undefined", api.js failed to load/parse before blog.js.
  console.log('[blog] blog.js loaded · PortfolioAPI:', typeof window.PortfolioAPI,
              '· API base:', (window.PortfolioAPI && PortfolioAPI.BASE_URL) || '(none)');

  const $app = document.getElementById('app');
  const API = (window.PortfolioAPI && PortfolioAPI.BASE_URL) || '';

  const REACTIONS = [
    { key: 'love', e: '❤️', l: 'Love it' }, { key: 'clap', e: '👏', l: 'Bravo' },
    { key: 'fire', e: '🔥', l: 'Fire' }, { key: 'idea', e: '💡', l: 'Insightful' },
    { key: 'great', e: '🙌', l: 'Great post!' }, { key: 'inspiring', e: '✨', l: 'Very inspiring!' },
    { key: 'helpful', e: '🙏', l: 'Helpful!' },
  ];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return ''; } };

  // Pull extra image URLs out of the article body so we can build a gallery.
  function extractImages(content, heroUrl) {
    const imgs = []; if (heroUrl) imgs.push(heroUrl);
    let text = content || '';
    text = text.replace(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g, (_, u) => { imgs.push(u); return ''; });
    text = text.replace(/(?:^|\s)(https?:\/\/\S+\.(?:jpe?g|png|webp|gif|avif)(?:\?\S*)?)/gi, (_, u) => { imgs.push(u); return ''; });
    return { images: [...new Set(imgs)], text: text.replace(/\n{3,}/g, '\n\n').trim() };
  }

  /* ---------------- LIST VIEW ---------------- */
  async function renderList() {
    $app.innerHTML = `
      <header class="list-head">
        <h1>The <b>Blog</b></h1>
        <div class="sub">// thoughts on code, care, and everything between</div>
        <div class="searchbar"><input id="q" placeholder="Search articles…"/><button id="qbtn">Search</button></div>
      </header>
      <div id="list" class="grid"><div class="spin">Loading articles…</div></div>`;

    const load = async () => {
      const search = document.getElementById('q').value.trim() || undefined;
      try {
        const r = await PortfolioAPI.getArticles({ page: 1, pageSize: 50, published: true, search });
        const items = r?.data?.items ?? [];
        document.getElementById('list').innerHTML = items.length ? items.map(cardHTML).join('') : `<p class="muted center">No articles found.</p>`;
      } catch (e) {
        // Log the full error/stack to the console BEFORE showing the friendly UI message.
        console.error('[blog] list load failed:', e);
        document.getElementById('list').innerHTML =
          `<p class="muted center">Couldn't load articles: ${esc(e.message)}<br>
           <button id="retry" class="ix-btn" style="margin-top:10px">Retry</button></p>`;
        document.getElementById('retry')?.addEventListener('click', load);
      }
    };
    document.getElementById('qbtn').addEventListener('click', load);
    document.getElementById('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
    load();
  }

  function cardHTML(a) {
    const img = a.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80';
    const reacts = Object.values(a.reactions || {}).reduce((x, y) => x + (y || 0), 0);
    return `<a class="card" href="blog.html?id=${a.id}">
      <div class="ph"><img src="${esc(img)}" alt="" loading="lazy"></div>
      <div class="body">
        <div class="meta">${esc(a.author || '')} · ${fmt(a.publishedDate || a.createdAt)}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc((a.content || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').slice(0, 120))}…</p>
        <div class="foot"><span>♥ ${a.likeCount || 0}</span><span>💬 ${reacts}</span></div>
      </div></a>`;
  }

  /* ---------------- ARTICLE (EDITORIAL) VIEW ---------------- */
  async function renderArticle(id) {
    try {
      const r = await PortfolioAPI.getArticle(id);
      const a = r?.data;
      if (!a) { $app.innerHTML = `<p class="spin">Article not found. <a href="blog.html">← All posts</a></p>`; return; }

      const fromContent = extractImages(a.content, a.imageUrl);
      const apiImgs = Array.isArray(a.imageUrls) ? a.imageUrls : [];
      const images = [...new Set([...apiImgs, ...fromContent.images])];
      const text = fromContent.text;
      const hero = images[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=85';
      const galleryImgs = images.slice(1);
      const paras = text.split(/\n{2,}/).filter(Boolean);
      let pull = ''; const panes = [];
      paras.forEach((p, i) => { if (i === 1 && p.length < 160 && !pull) { pull = p; } else { panes.push(p); } });
      const tags = (a.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

      $app.innerHTML = `
      <article class="article">
        <a class="backlink" href="blog.html">← All posts</a>
        <div class="hero"><div class="kicker">// reading · MTN.Digitosphere</div><img src="${esc(hero)}" alt="${esc(a.title)}"></div>

        <div class="headpane">
          <div class="by">by <b>${esc(a.author || 'Unknown')}</b> · ${fmt(a.publishedDate || a.createdAt)}</div>
          <h1>${esc(a.title)}</h1>
          ${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
        </div>

        ${(galleryImgs.length || a.videoUrl) ? galleryHTML(galleryImgs, a.videoUrl) : ''}

        <div class="body-editorial">
          ${panes.map((p, i) => {
            const out = `<div class="pane">${esc(p)}</div>`;
            return (pull && i === 0) ? out + `<blockquote class="pull">“${esc(pull)}”</blockquote>` : out;
          }).join('')}
        </div>

        ${interactionsHTML(a)}
      </article>`;
      wireGallery();
      wireInteractions(a);
    } catch (e) {
      // Log the full error/stack to the console BEFORE showing the friendly UI message.
      console.error('[blog] article load failed (id=' + id + '):', e);
      $app.innerHTML = `<p class="spin">Couldn't load this article: ${esc(e.message)}<br><a href="blog.html">← All posts</a></p>`;
    }
  }

  function galleryHTML(imgs, videoUrl) {
    const videoItem = videoUrl ? `<figure class="popitem popvideo">
      <span class="pop-badge" style="background:var(--magenta);color:#fff">▶ VIDEO</span>
      <video src="${esc(videoUrl)}" controls playsinline preload="metadata"></video>
    </figure>` : '';
    return `<section class="popwrap">
      <div class="lbl">✦ <b>GALLERY</b> ✦ revenge&nbsp;pop</div>
      <div class="popgal">
        ${videoItem}
        ${imgs.map((u, i) => `<figure class="popitem" data-full="${esc(u)}">
          ${(!videoUrl && i === 0) ? '<span class="pop-badge">POP!</span>' : ''}
          <img src="${esc(u)}" alt="" loading="lazy">
        </figure>`).join('')}
      </div>
    </section>`;
  }

  function wireGallery() {
    const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
    document.querySelectorAll('.popitem[data-full]').forEach((it) => {
      it.addEventListener('click', () => { lbimg.src = it.dataset.full; lb.classList.add('open'); });
    });
    const close = () => lb.classList.remove('open');
    document.getElementById('lbx').addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function interactionsHTML(a) {
    const counts = a.reactions || {};
    return `
    <section class="interactions">
      <div class="ix-row">
        <button class="ix-btn" id="likeBtn"><span id="heart">♡</span> <span id="likeN">${a.likeCount || 0}</span> <span class="muted">likes</span></button>
        <div class="share">
          <button class="sh sh-fb" data-net="facebook" title="Share on Facebook" aria-label="Share on Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/></svg>
          </button>
          <button class="sh" data-net="twitter" title="Share on X" aria-label="Share on X">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button class="sh" data-net="linkedin" title="Share on LinkedIn" aria-label="Share on LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
          </button>
          <button class="sh" data-net="copy" title="Copy link" aria-label="Copy link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        </div>
      </div>
      <div class="reactions">
        <div class="lbl">Quick reaction — pick one</div>
        <div class="chips" id="chips">
          ${REACTIONS.map((r) => `<button class="chip" data-key="${r.key}"><span>${r.e}</span><span>${r.l}</span>${counts[r.key] ? `<span class="n">${counts[r.key]}</span>` : ''}</button>`).join('')}
        </div>
        <p id="thanks" class="muted" style="margin-top:12px;display:none;color:var(--cyan)">Thanks for your reaction! 🎉</p>
      </div>
    </section>`;
  }

  function wireInteractions(a) {
    const id = a.id;
    const shareUrl = `${API}/share/${id}`;
    const likeKey = 'mtn_liked_' + id;
    let liked = localStorage.getItem(likeKey) === '1';
    let likeN = a.likeCount || 0;
    const heart = document.getElementById('heart'), likeNEl = document.getElementById('likeN'), likeBtn = document.getElementById('likeBtn');
    const paint = () => { heart.textContent = liked ? '♥' : '♡'; likeNEl.textContent = likeN; likeBtn.classList.toggle('liked', liked); };
    paint();
    likeBtn.addEventListener('click', async () => {
      liked = !liked; likeN += liked ? 1 : -1; localStorage.setItem(likeKey, liked ? '1' : '0'); paint();
      try { liked ? await PortfolioAPI.likeArticle(id) : await PortfolioAPI.unlikeArticle(id); } catch {}
    });

    let sent = false;
    document.querySelectorAll('#chips .chip').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (sent) return; sent = true; btn.classList.add('sent');
        let n = btn.querySelector('.n'); if (!n) { n = document.createElement('span'); n.className = 'n'; btn.appendChild(n); }
        n.textContent = String(parseInt(n.textContent || '0', 10) + 1);
        document.getElementById('thanks').style.display = 'block';
        try { await PortfolioAPI.reactArticle(id, btn.dataset.key); } catch {}
      });
    });

    document.querySelectorAll('.share button').forEach((b) => {
      b.addEventListener('click', () => {
        const u = encodeURIComponent(shareUrl), t = encodeURIComponent(a.title || '');
        const links = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
          twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        };
        if (b.dataset.net === 'copy') {
          navigator.clipboard?.writeText(shareUrl);
          const orig = b.innerHTML; b.classList.add('copied'); b.innerHTML = '✓';
          setTimeout(() => { b.innerHTML = orig; b.classList.remove('copied'); }, 1200);
        } else {
          // Opens the official share dialog as a centred popup; FB scrapes the
          // /share/{id} URL, whose server-rendered OG tags build the rich card.
          window.open(links[b.dataset.net], '_blank', 'noopener,noreferrer,width=600,height=560');
        }
      });
    });
  }

  /* ---------------- BOOT ---------------- */
  function boot() {
    try {
      if (window.PortfolioAPI && PortfolioAPI.wakeBackend) PortfolioAPI.wakeBackend();
      const id = new URLSearchParams(location.search).get('id');
      if (id) renderArticle(id); else renderList();
    } catch (err) {
      // Never leave the page silently blank — surface the failure.
      console.error('[blog] init failed:', err);
      const app = document.getElementById('app');
      if (app) app.innerHTML = '<p class="spin">Couldn\'t initialise the blog: ' + esc(err && err.message) + '</p>';
    }
  }

  // Runs immediately under defer (DOM already parsed); guard kept as a safety net.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
