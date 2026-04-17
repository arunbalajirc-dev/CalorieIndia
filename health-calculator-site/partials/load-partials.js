/**
 * load-partials.js — Nutrition Tracker
 * Fetches partials/nav.html and partials/footer.html and injects them
 * into #site-nav and #site-footer elements on any page.
 * Works correctly on root-level pages and /blog/ subdirectory pages.
 */
(function () {
  'use strict';

  // Determine the path prefix to reach the partials/ directory
  var isSubdir = window.location.pathname.indexOf('/blog/') !== -1;
  var BASE = isSubdir ? '../partials/' : 'partials/';

  function loadPartial(url, targetId) {
    var el = document.getElementById(targetId);
    if (!el) return Promise.resolve();
    return fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.text();
      })
      .then(function (html) {
        el.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('[load-partials] ' + err.message);
      });
  }

  // Highlight the active nav link based on the current page filename
  function highlightActiveLink() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#ci-nav a[href], .ci-mobile-menu a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0];
      if (href && href === current) {
        a.style.color = '#2d6a4f';
        a.style.fontWeight = '700';
      }
    });
  }

  // Load nav → then highlight active link (nav must be in DOM first)
  loadPartial(BASE + 'nav.html', 'site-nav').then(highlightActiveLink);

  // Load footer independently
  loadPartial(BASE + 'footer.html', 'site-footer');
})();
