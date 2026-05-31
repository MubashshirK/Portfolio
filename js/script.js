(function(){
  var elements = document.querySelectorAll('[data-reveal]:not([data-revealed])');
  if (!elements.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (var i=0;i<elements.length;i++) elements[i].dataset.revealed='true';
    return;
  }
  var observer = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (!entries[i].isIntersecting) continue;
      entries[i].target.dataset.revealed='true';
      observer.unobserve(entries[i].target);
    }
  },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  for (var j=0;j<elements.length;j++) observer.observe(elements[j]);
})();

(function(){
  var nav = document.querySelector('header.nav');
  if (!nav) return;
  var SHOW_TOP=100, DELTA=6, lastY=window.scrollY||0;
  function onScroll(){
    var y=window.scrollY||0, d=y-lastY;
    if(y<=SHOW_TOP){nav.classList.remove('is-hidden');}
    else if(d>DELTA){nav.classList.add('is-hidden');}
    else if(d<-DELTA){nav.classList.remove('is-hidden');}
    lastY=y;
  }
  window.addEventListener('scroll',onScroll,{passive:true});
})();

// Pill filter (cosmetic)
(function(){
  document.querySelectorAll('.pill').forEach(function(p){
    p.addEventListener('click',function(){
      p.closest('.pills').querySelectorAll('.pill').forEach(function(x){x.classList.remove('active')});
      p.classList.add('active');
    });
  });
})();

// Mobile menu toggle
(function(){
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function(){
    var open = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    toggle.setAttribute('aria-expanded', open);
  });
  // Close menu when a link is clicked
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var id=a.getAttribute('href').slice(1);
    var el=id?document.getElementById(id):null;
    if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}
  });
});

// Fit footer mega name to container width
(function(){
  var word = document.querySelector('.foot-mega .word');
  if (!word) return;
  function fit(){
    var container = word.parentElement;
    var maxW = container.clientWidth;
    if (maxW <= 0) return;
    var size = 180;
    word.style.fontSize = size + 'px';
    while(word.scrollWidth > maxW && size > 12){
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
  function revealMega(){
    var rect = word.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh - 40 && rect.bottom > 0){
      word.dataset.revealed = 'true';
      window.removeEventListener('scroll', revealMega);
      window.removeEventListener('resize', revealMega);
    }
  }
  window.addEventListener('scroll', revealMega, {passive:true});
  window.addEventListener('resize', revealMega, {passive:true});
  window.addEventListener('load', revealMega);
  revealMega();
})();


// Scroll-to-top button + page-length progress ring
(function(){
  var btn = document.getElementById('scroll-top');
  if (!btn) return;
  var progress = btn.querySelector('.st-progress');
  var CIRC = 2 * Math.PI * 21; // ring circumference (r=21)
  var SHOW_AT = 400;           // px scrolled before button appears
  var ticking = false;

  if (progress) progress.style.strokeDasharray = CIRC;

  function update(){
    ticking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    if (progress) progress.style.strokeDashoffset = CIRC * (1 - pct);
    btn.classList.toggle('is-visible', scrollTop > SHOW_AT);
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});

  btn.addEventListener('click', function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
  });

  update();
})();
