(function () {
  var elements = document.querySelectorAll('[data-reveal]:not([data-revealed])');
  if (!elements.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (var i = 0; i < elements.length; i++) elements[i].dataset.revealed = 'true';
    // Instantly reveal skill blocks and exp cards
    var sbs = document.querySelectorAll('.skills-visual > .skill-block, .exp-grid > .exp-card');
    for (var s = 0; s < sbs.length; s++) sbs[s].dataset.revealed = 'true';
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      observer.unobserve(entries[i].target);
      (function (el) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.dataset.revealed = 'true';
            // When capabilities-art reveals, stagger the skill blocks
            if (el.classList.contains('capabilities-art')) {
              var blocks = el.querySelectorAll('.skills-visual > .skill-block');
              for (var k = 0; k < blocks.length; k++) {
                (function (block) {
                  requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                      block.dataset.revealed = 'true';
                    });
                  });
                })(blocks[k]);
              }
            }
            // When exp-grid reveals, stagger the experience cards
            if (el.classList.contains('exp-grid')) {
              var cards = el.querySelectorAll('.exp-card');
              for (var k = 0; k < cards.length; k++) {
                (function (card) {
                  requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                      card.dataset.revealed = 'true';
                    });
                  });
                })(cards[k]);
              }
            }
          });
        });
      })(entries[i].target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

  for (var j = 0; j < elements.length; j++) observer.observe(elements[j]);
})();

(function () {
  var nav = document.querySelector('header.nav');
  if (!nav) return;
  var SHOW_TOP = 100, DELTA = 6, lastY = window.scrollY || 0;
  function onScroll() {
    var y = window.scrollY || 0, d = y - lastY;
    if (y <= SHOW_TOP) { nav.classList.remove('is-hidden'); }
    else if (d > DELTA) { nav.classList.add('is-hidden'); }
    else if (d < -DELTA) { nav.classList.remove('is-hidden'); }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Pill filter (cosmetic)
(function () {
  document.querySelectorAll('.pill').forEach(function (p) {
    p.addEventListener('click', function () {
      p.closest('.pills').querySelectorAll('.pill').forEach(function (x) { x.classList.remove('active') });
      p.classList.add('active');
    });
  });
})();

// Mobile menu toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    toggle.setAttribute('aria-expanded', open);
  });
  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Smooth wheel scrolling (lerp-based, desktop only)
(function () {
  // Skip entirely for users who prefer reduced motion, or on touch-primary devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Bail out on touch devices — native momentum scroll is already smooth there
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  var target = window.scrollY || 0; // where we want to be
  var current = target;              // where we are right now (interpolated)
  var rafId = null;
  var EASE = 0.072; // lower = slower/smoother, higher = snappier (0.05–0.12 is a good range)
  var STEP_CAP = 240;   // max px per wheel tick — prevents huge jumps on fast scrolls

  // Keep target in sync when scroll is driven externally (e.g. scrollIntoView from nav links).
  // Only update when our own RAF loop is not running — if it is running, we own the scroll.
  window.addEventListener('scroll', function () {
    if (!rafId) {
      target = window.scrollY || 0;
      current = target;
    }
  }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    current = lerp(current, target, EASE);
    // Stop the loop once we're close enough (sub-pixel)
    if (Math.abs(target - current) < 0.5) {
      current = target;
      rafId = null;
      window.scrollTo(0, current);
      return;
    }
    window.scrollTo(0, current);
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('wheel', function (e) {
    // Only handle vertical wheel on the document itself
    if (e.ctrlKey) return; // let browser handle pinch-zoom
    e.preventDefault();

    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    // Cap each wheel tick so a fast flick doesn't overshoot wildly
    var delta = Math.max(-STEP_CAP, Math.min(STEP_CAP, e.deltaY));
    target = Math.max(0, Math.min(maxScroll, target + delta));

    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: false });
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Fit footer mega name to container width
(function () {
  var word = document.querySelector('.foot-mega .word');
  if (!word) return;
  function fit() {
    var container = word.parentElement;
    // Use offsetWidth so we measure the container's own layout width,
    // not the scroll width (which would grow if the word already overflows).
    var maxW = container.offsetWidth;
    if (maxW <= 0) return;
    // Start from the CSS clamp max so we always shrink, never grow into overflow.
    var size = 180;
    word.style.fontSize = size + 'px';
    // scrollWidth is reliable here because .foot-mega has overflow:hidden,
    // so it won't pollute the document scroll width during the loop.
    while (word.scrollWidth > maxW && size > 12) {
      size -= 2;
      word.style.fontSize = size + 'px';
    }
  }
  fit();
  window.addEventListener('resize', fit);
  // Re-fit once web fonts finish loading (they render wider than the
  // fallback font and would otherwise overflow and get clipped on mobile)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }
  window.addEventListener('load', fit);

  // Reliable reveal for the footer mega name. The global reveal observer
  // excludes the bottom 8% of the viewport, but this element is the last
  // thing on the page and can sit permanently inside that zone on mobile,
  // so it would never reveal. Use a lenient check tied to scroll/resize.
  function revealMega() {
    var rect = word.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh - 40 && rect.bottom > 0) {
      word.dataset.revealed = 'true';
      window.removeEventListener('scroll', revealMega);
      window.removeEventListener('resize', revealMega);
    }
  }
  window.addEventListener('scroll', revealMega, { passive: true });
  window.addEventListener('resize', revealMega, { passive: true });
  window.addEventListener('load', revealMega);
  revealMega();
})();


// Scroll-to-top button + page-length progress ring
(function () {
  var btn = document.getElementById('scroll-top');
  if (!btn) return;
  var progress = btn.querySelector('.st-progress');
  var CIRC = 2 * Math.PI * 21; // ring circumference (r=21)
  var SHOW_AT = 400;           // px scrolled before button appears
  var ticking = false;

  if (progress) progress.style.strokeDasharray = CIRC;

  function update() {
    ticking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (progress) progress.style.strokeDashoffset = CIRC * (1 - pct);
    btn.classList.toggle('is-visible', scrollTop > SHOW_AT);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  btn.addEventListener('click', function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  update();
})();

// Wire ticker — row 1 (scrolls left)
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var row = document.querySelector('.wire-row:not(.reverse)');
  if (!row) return;
  var track = row.querySelector('.marquee-track');
  if (!track) return;

  var SPEED_NORMAL = 0.10;
  var SPEED_SLOW = 0.03;
  var EASE = 0.06;

  var dist = 0, speed = SPEED_NORMAL, targetSpeed = SPEED_NORMAL, lastTime = null, halfW = 0;

  function measure() { halfW = track.scrollWidth / 2; }
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);

  row.addEventListener('mouseenter', function () { targetSpeed = SPEED_SLOW; });
  row.addEventListener('mouseleave', function () { targetSpeed = SPEED_NORMAL; });

  function tick(ts) {
    if (lastTime === null) lastTime = ts;
    var dt = Math.min(ts - lastTime, 64);
    lastTime = ts;
    speed += (targetSpeed - speed) * EASE;
    dist += speed * dt;
    if (halfW > 0) dist = dist % halfW;
    track.style.transform = 'translateX(' + (-dist) + 'px)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// Wire ticker — row 2 (scrolls right, opposite direction)
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var row = document.querySelector('.wire-row.reverse');
  if (!row) return;
  var track = row.querySelector('.marquee-track');
  if (!track) return;

  var SPEED_NORMAL = 0.14;
  var SPEED_SLOW = 0.03;
  var EASE = 0.06;

  var halfW = 0;
  var dist = 0;
  var ready = false;
  var speed = SPEED_NORMAL, targetSpeed = SPEED_NORMAL, lastTime = null;

  function measure() {
    var w = track.scrollWidth / 2;
    if (w <= 0) return;
    if (!ready) {
      halfW = w;
      dist = -halfW;
      ready = true;
    } else {
      halfW = w;
    }
  }
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener('load', measure);
  window.addEventListener('resize', measure);

  row.addEventListener('mouseenter', function () { targetSpeed = SPEED_SLOW; });
  row.addEventListener('mouseleave', function () { targetSpeed = SPEED_NORMAL; });

  function tick(ts) {
    if (lastTime === null) lastTime = ts;
    var dt = Math.min(ts - lastTime, 64);
    lastTime = ts;
    speed += (targetSpeed - speed) * EASE;
    dist += speed * dt;
    // dist runs from -halfW to 0; use modulo to avoid overshoot jitter
    if (halfW > 0 && dist >= 0) dist = -halfW + (dist % halfW);
    track.style.transform = 'translateX(' + dist + 'px)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
