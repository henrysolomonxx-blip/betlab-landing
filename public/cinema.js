// Cinematic layer for the landing page: opening sequence, reveal-on-scroll,
// and "the climb", a pinned scene where scrolling evolves the rank badge
// from Bronze to GOAT. The hand-over between two badges uses the same trick
// as the app's rank-up moment: both paintings sit on black and are blended
// with `screen`, the new one masked to the inside of a growing circle and the
// old one to the outside, with a bright ring on the moving edge.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  root.classList.add('cine');

  // ---- reveal on scroll -------------------------------------------------
  function tag(selector, group) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('rv');
      el.style.setProperty('--d', group ? i % group : 0);
    });
  }
  tag('.section .head', 0);
  tag('.steps li', 3);
  tag('.card', 3);
  tag('.tiles > div', 3);
  tag('.claims > div', 3);
  tag('.faq details', 0);
  tag('.join-frame', 0);
  document.querySelectorAll('.rows li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  document.querySelectorAll('.card').forEach(function (card) {
    card.querySelectorAll('.kv div, .legs li, .lands').forEach(function (el, i) { el.style.setProperty('--n', i); });
  });
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { seen.observe(el); });

  // ---- the climb --------------------------------------------------------
  var climb = document.querySelector('.climb');
  var bar = document.querySelector('.top-bar');
  if (!climb) return;
  var pin = climb.querySelector('.climb-pin');
  var badges = climb.querySelectorAll('.climb-stage img');
  var lines = climb.querySelectorAll('.climb-line');
  var ticks = climb.querySelectorAll('.climb-rail li');
  var edge = climb.querySelector('.climb-edge');
  var hint = climb.querySelector('.climb-hint');
  var COLORS = ['217,154,99', '207,212,220', '245,181,58', '169,224,238', '142,197,255', '157,255,77', '255,122,138', '255,213,74'];
  var LAST = badges.length - 1;
  var HOLD = 0.42;        // share of each tier spent holding still before the next one grows through
  var TAIL = 0.7;         // extra hold on the final tier
  var G = 'radial-gradient(circle farthest-side at 50% 50%, ';

  function mask(el, value) { el.style.webkitMaskImage = value; el.style.maskImage = value; }
  function smooth(u) { return u * u * (3 - 2 * u); }

  var lastKey = '';
  function draw() {
    ticking = false;
    var rect = climb.getBoundingClientRect();
    var span = rect.height - window.innerHeight;
    var t = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
    var p = Math.min(LAST, t * (LAST + TAIL));
    var cur = Math.min(LAST, Math.floor(p));
    var f = p - cur;
    var u = cur >= LAST ? 0 : Math.max(0, (f - HOLD) / (1 - HOLD));
    var key = cur + ':' + u.toFixed(3);
    if (key === lastKey) return;
    lastKey = key;
    var r = 150 * smooth(u);

    for (var i = 0; i < badges.length; i++) {
      var b = badges[i];
      if (i === cur) {
        b.style.opacity = '1';
        mask(b, u > 0 ? G + 'transparent ' + (r - 3) + '%, #000 ' + r + '%)' : '');
        b.style.transform = '';
      } else if (i === cur + 1 && u > 0) {
        b.style.opacity = '1';
        mask(b, G + '#000 ' + (r - 3) + '%, transparent ' + r + '%)');
        b.style.transform = 'scale(' + (1 + 0.05 * Math.sin(Math.PI * u)) + ')';
      } else {
        b.style.opacity = '0';
      }
    }
    if (u > 0 && r < 135) {
      edge.style.opacity = '1';
      edge.style.background = G + 'transparent ' + (r - 9) + '%, rgba(255,255,255,0.3) ' + (r - 3) + '%, #fff ' + (r - 0.5) + '%, transparent ' + (r + 1.5) + '%)';
    } else {
      edge.style.opacity = '0';
    }

    var shown = u > 0.5 ? cur + 1 : cur;   // the copy changes as the new badge takes over
    var x = cur + (u > 0 ? smooth(u) : 0);
    for (var j = 0; j < lines.length; j++) {
      var d = x - j;
      var o = Math.max(0, 1 - Math.abs(d) * 2.4);
      lines[j].style.opacity = o.toFixed(3);
      lines[j].style.transform = 'translateY(' + (-d * 46).toFixed(1) + 'px)';
      lines[j].setAttribute('aria-hidden', j === shown ? 'false' : 'true');
    }
    for (var k = 0; k < ticks.length; k++) {
      ticks[k].style.background = k <= shown ? 'rgb(' + COLORS[k] + ')' : '';
    }
    pin.style.setProperty('--glow', COLORS[shown]);
    if (hint) hint.style.opacity = t > 0.02 ? '0' : '1';
  }

  var ticking = false;
  function onScroll() {
    if (bar) bar.classList.toggle('scrolled', window.scrollY > 8);
    if (!ticking) { ticking = true; requestAnimationFrame(draw); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
