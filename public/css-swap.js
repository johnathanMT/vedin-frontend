/*
 * css-swap.js — activates non-render-blocking stylesheets once downloaded.
 *
 * WHY EXTERNAL: the strict CSP (`script-src 'self'`) blocks inline scripts and
 * inline onload handlers, so the usual `media="print" onload=...` async-CSS
 * trick can't be used. This same-origin file is allowed.
 *
 * Targets any <link rel="preload" as="style" data-async-style> and flips it to a
 * live stylesheet. If this script is unavailable, the matching <noscript> block
 * loads the same stylesheets, so the page is never left unstyled.
 */
(function () {
  var links = document.querySelectorAll('link[rel="preload"][as="style"][data-async-style]');
  for (var i = 0; i < links.length; i++) links[i].rel = 'stylesheet';
})();
