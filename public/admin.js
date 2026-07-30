/* ============================================================================
 * admin.js — all logic for admin.html, externalised so the page needs NO inline
 * <script> and NO inline event-handler attributes. CSP can then use a strict
 * `script-src 'self'`. Static controls are wired by id; dynamically-generated
 * buttons use a single delegated click listener keyed on `data-action`.
 * ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let editing = false, cache = {}, editingImages = [];
  const toast = (m, k = '') => { const t = $('toast'); t.textContent = m; t.className = 'show ' + k; setTimeout(() => { t.className = k; }, 2600); };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- AUTH STATE ---------------- */
  function renderState() {
    const on = PortfolioAPI.isLoggedIn();
    const u = on ? PortfolioAPI.getCurrentUser() : null;

    // Stale/invalid session (token but no stored user) → clear and restart.
    if (on && !u) {
      PortfolioAPI.logout();
      toast('Your session was outdated — please log in again.');
      return renderState();
    }

    $('loginBox').classList.toggle('hidden', on);
    $('manageBox').classList.toggle('hidden', !on);
    $('accountBox').classList.toggle('hidden', !on);   // change-password: any signed-in user

    if (!on) {
      $('editorBox').classList.add('hidden');
      $('who').textContent = 'authenticated access only';
      return;
    }

    $('who').textContent = `signed in as ${u.username} · role: ${u.role ?? 'unknown'}`;

    if (!PortfolioAPI.isAuthor()) {
      $('editorBox').classList.add('hidden');
      $('manageTitle').textContent = 'No access';
      $('manageList').innerHTML =
        `<small>Your account (role: ${esc(u.role ?? 'unknown')}) can't publish.
         Ask an admin to grant you the Author role.</small>
         <div class="admin-row"><button class="ghost" data-action="logout">Log out</button></div>`;
      return;
    }

    $('editorBox').classList.remove('hidden');
    $('manageTitle').textContent = PortfolioAPI.isAdmin() ? 'All articles' : 'My articles';
    loadManage();
  }

  async function doLogin() {
    try {
      await PortfolioAPI.login($('email').value.trim(), $('password').value);
      $('password').value = ''; toast('Logged in.', 'ok'); renderState();
    } catch (e) { toast(e.message, 'err'); }
  }
  function doLogout() { PortfolioAPI.logout(); resetEditor(); renderState(); toast('Logged out.'); }

  async function doChangePassword() {
    const cur = $('accCurPw').value, next = $('accNewPw').value;
    if (!cur || !next) return toast('Enter your current and new password.', 'err');
    try {
      await PortfolioAPI.changePassword(cur, next);
      $('accCurPw').value = ''; $('accNewPw').value = '';
      toast('Password updated.', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  }

  /* ---------------- EDITOR ---------------- */
  function resetEditor() {
    editing = false; $('editId').value = '';
    ['title', 'author', 'tags', 'content', 'image', 'video'].forEach((id) => { $(id).value = ''; });
    $('isPublished').value = 'true'; $('saveBtn').textContent = 'Publish'; $('editorTitle').textContent = 'New article';
    $('previews').innerHTML = ''; $('videoName').textContent = '';
    editingImages = []; renderExisting();
  }

  // Existing gallery images with delete + up/down reorder (delegated buttons).
  function renderExisting() {
    const wrap = $('existingWrap'), box = $('existingImages');
    if (!editingImages.length) { wrap.classList.add('hidden'); box.innerHTML = ''; return; }
    wrap.classList.remove('hidden');
    const btn = 'background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:6px;width:24px;height:22px;cursor:pointer;font-size:12px';
    box.innerHTML = editingImages.map((img, i) => `
      <div style="position:relative;width:88px">
        <img src="${esc(img.imageUrl)}" style="width:88px;height:88px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">
        <button data-action="del-img" data-id="${img.id}" title="Delete"
          style="position:absolute;top:-8px;right:-8px;background:var(--danger);color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:13px;line-height:1">×</button>
        <div style="display:flex;justify-content:center;gap:5px;margin-top:4px">
          <button data-action="move-img" data-id="${img.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} style="${btn}">↑</button>
          <button data-action="move-img" data-id="${img.id}" data-dir="1" ${i === editingImages.length - 1 ? 'disabled' : ''} style="${btn}">↓</button>
        </div>
      </div>`).join('');
  }

  async function delExisting(imageId) {
    if (!confirm('Delete this image permanently?')) return;
    try {
      await PortfolioAPI.deleteArticleImage($('editId').value, imageId);
      editingImages = editingImages.filter((x) => x.id !== imageId);
      renderExisting(); toast('Image deleted.', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  }

  async function moveExisting(imageId, dir) {
    const i = editingImages.findIndex((x) => x.id === imageId), j = i + dir;
    if (j < 0 || j >= editingImages.length) return;
    [editingImages[i], editingImages[j]] = [editingImages[j], editingImages[i]];
    renderExisting();
    try { await PortfolioAPI.reorderArticleImages($('editId').value, editingImages.map((x) => x.id)); }
    catch (e) { toast('Reorder failed: ' + e.message, 'err'); }
  }

  // Live previews of selected files.
  function previewImages() {
    const files = [...$('image').files];
    $('previews').innerHTML = files.map((f, i) => {
      const url = URL.createObjectURL(f);
      return `<div style="position:relative">
        <img src="${url}" style="width:74px;height:74px;object-fit:cover;border-radius:8px;border:1px solid var(--border)">
        ${i === 0 ? '<span style="position:absolute;top:-6px;left:-6px;background:var(--accent);color:#04130c;font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px">COVER</span>' : ''}
      </div>`;
    }).join('');
  }
  function previewVideo() {
    const f = $('video').files[0];
    $('videoName').textContent = f ? `🎬 ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)` : '';
  }

  /* ---------------- MANAGE LIST ---------------- */
  async function loadManage() {
    try {
      const opts = PortfolioAPI.isAdmin()
        ? { page: 1, pageSize: 100, published: 'all' }
        : { page: 1, pageSize: 100 };
      const resp = await PortfolioAPI.getArticles(opts);
      let items = resp?.data?.items ?? [];
      if (!PortfolioAPI.isAdmin()) {
        const myId = PortfolioAPI.getCurrentUser()?.id;
        items = items.filter((a) => a.authorInfo && a.authorInfo.id === myId);
      }
      cache = {}; items.forEach((a) => { cache[a.id] = a; });
      $('manageList').innerHTML = items.length ? items.map((a) => `
        <div class="manage">
          <div><strong>${esc(a.title)}</strong><br>
            <small>by ${esc(a.author || '')} · ${a.isPublished ? 'published' : 'draft'}</small></div>
          <div class="admin-row" style="margin:0">
            <button class="ghost" data-action="edit" data-id="${a.id}">Edit</button>
            <button class="ghost del" data-action="delete" data-id="${a.id}">Delete</button>
          </div>
        </div>`).join('') : '<small>No articles yet.</small>';
    } catch (e) { toast("Couldn't load: " + e.message, 'err'); }
  }

  function startEdit(id) {
    const a = cache[id]; if (!a) return; editing = true;
    $('editId').value = id; $('title').value = a.title || ''; $('author').value = a.author || '';
    $('tags').value = a.tags || ''; $('content').value = a.content || ''; $('isPublished').value = String(!!a.isPublished);
    $('saveBtn').textContent = 'Save changes'; $('editorTitle').textContent = 'Editing #' + id;
    editingImages = Array.isArray(a.images) ? a.images.slice() : [];
    renderExisting();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function doSave() {
    const p = {
      title: $('title').value.trim(), author: $('author').value.trim(),
      tags: $('tags').value.trim(), content: $('content').value, isPublished: $('isPublished').value === 'true',
    };
    const imgs = [...$('image').files];   // FileList → array; preserves ALL selected files
    if (imgs.length) { p.image = imgs[0]; p.galleryImages = imgs.slice(1); } // [0]=cover, rest=gallery
    const vid = $('video').files[0]; if (vid) p.video = vid;
    if (!p.title || !p.author) return toast('Title and Author are required.', 'err');
    if ((p.content || '').length < 10) return toast('Content must be at least 10 characters.', 'err');
    console.log(`[admin] saving — ${imgs.length} image(s) selected (cover + ${Math.max(0, imgs.length - 1)} gallery)${vid ? ', 1 video' : ''}`);
    try {
      if (editing) { await PortfolioAPI.updateArticle($('editId').value, p); toast('Updated.', 'ok'); }
      else { await PortfolioAPI.createArticle(p); toast('Published.', 'ok'); }
      resetEditor(); loadManage();
    } catch (e) {
      // Full error logged here; api.js also logs the raw backend response (status + body).
      console.error('[admin] save failed:', e);
      toast(e.message, 'err');
    }
  }

  async function doDelete(id) {
    if (!confirm('Delete this article?')) return;
    try { await PortfolioAPI.deleteArticle(id); toast('Deleted.', 'ok'); loadManage(); }
    catch (e) { toast(e.message, 'err'); }
  }

  /* ---------------- WIRING (no inline handlers) ---------------- */
  // One delegated listener handles every button via data-action (static + dynamic).
  function onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const id = el.dataset.id ? Number(el.dataset.id) : null;
    switch (el.dataset.action) {
      case 'login':    doLogin(); break;
      case 'logout':   doLogout(); break;
      case 'change-password': doChangePassword(); break;
      case 'save':     doSave(); break;
      case 'clear':    resetEditor(); break;
      case 'edit':     startEdit(id); break;
      case 'delete':   doDelete(id); break;
      case 'del-img':  delExisting(id); break;
      case 'move-img': moveExisting(id, Number(el.dataset.dir)); break;
    }
  }

  function boot() {
    try {
      document.addEventListener('click', onClick);
      $('image').addEventListener('change', previewImages);
      $('video').addEventListener('change', previewVideo);
      $('password').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
      if (window.PortfolioAPI && PortfolioAPI.wakeBackend) PortfolioAPI.wakeBackend();
      renderState();
    } catch (err) {
      console.error('[admin] init failed:', err);
      const w = document.querySelector('.wrap');
      if (w) w.insertAdjacentHTML('afterbegin', '<p style="color:#ff6b6b">Admin init error: ' + esc(err && err.message) + '</p>');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
