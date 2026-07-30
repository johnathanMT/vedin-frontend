/*
 * reveal.js — scroll-reveal for the static interest pages (cosmology.html, …).
 *
 * WHY THIS IS EXTERNAL: the site's production CSP is `script-src 'self'`
 * (no 'unsafe-inline'), so the old INLINE reveal script was silently blocked —
 * the IntersectionObserver never ran, every `.section` stayed at opacity:0, and
 * pages showed their title but no body. An external same-origin file is allowed.
 *
 * It adds `js-reveal` to <html> BEFORE first paint (loaded in <head>), so
 * sections start hidden and fade in. If this file is ever blocked or 404s,
 * `js-reveal` is never added and the CSS keeps every `.section` fully visible —
 * content is never trapped invisible again.
 */
document.documentElement.classList.add('js-reveal');

document.addEventListener('DOMContentLoaded', function () {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (x) {
      if (x.isIntersecting) x.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section').forEach(function (el) { obs.observe(el); });
});
