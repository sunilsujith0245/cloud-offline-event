/* ═══════════════════════════════════════════════════════════════════
   CONFIG — the only lines you normally need to edit in this file
   ═══════════════════════════════════════════════════════════════════ */
var PF = {
  /* paste your payment link between the quotes (Razorpay, Instamojo, etc.)
     every button with class "js-pay" will open it                         */
  PAYMENT_LINK: '',

  EVENT_START: '2026-10-10T09:00:00+05:30',
  EVENT_END:   '2026-10-10T18:00:00+05:30',
  EVENT_TITLE: 'Pro Foodpreneur Intensive · Edition 02',
  EVENT_PLACE: 'Bannerghatta Road, Bangalore (exact venue shared after registration)',

  EVENT_DATE_TZ: 'Asia/Kolkata'
};
/* ═══════════════════════════════════════════════════════════════════ */


var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var HOVER  = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function clamp(v, a, b){ return Math.min(b, Math.max(a, v)); }
function pad2(n){ return String(n).padStart(2, '0'); }

/* run a callback once, when an element first scrolls into view */
function onView(el, cb, opts){
  if (!el) return;
  if (!('IntersectionObserver' in window)){ cb(el); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ cb(e.target); io.unobserve(e.target); } });
  }, opts || { threshold: .25 });
  io.observe(el);
}

/* one shared, frame-throttled scroll loop */
var scrollJobs = [], ticking = false;
function onScroll(fn){ scrollJobs.push(fn); }
function runScroll(){ ticking = false; scrollJobs.forEach(function(f){ f(); }); }
window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
window.addEventListener('resize', function(){ requestAnimationFrame(runScroll); });


/* ═══════════════════════════════════════════════════════════════════
   GLOBAL — seat counts, payment links, media placeholders, reveals
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  /* every visible date follows PF.EVENT_START — change that one line and
     the pill, booking card, docket, pass, price card and footer all follow */
  (function stampDates(){
    var slots = $$('[data-ev]');
    if (!slots.length) return;
    var d = new Date(PF.EVENT_START);
    if (isNaN(d.getTime())) return;
    function part(o){
      try { return new Intl.DateTimeFormat('en-IN',
        Object.assign({ timeZone: PF.EVENT_DATE_TZ }, o)).format(d); }
      catch (e){ return null; }
    }
    var dayNum = part({day:'numeric'}), monShort = part({month:'short'});
    if (!dayNum || !monShort) return;
    var monLong = part({month:'long'}), wdLong = part({weekday:'long'}),
        wdShort = part({weekday:'short'}), year = part({year:'numeric'});
    var F = {
      daynum:    dayNum,
      mon:       monShort,
      short:     dayNum + ' ' + monShort,
      caps:      (dayNum + ' ' + monShort).toUpperCase(),
      fullshort: wdShort + ' ' + dayNum + ' ' + monShort,
      full:      wdShort + ', ' + dayNum + ' ' + monShort + ' ' + year,
      day:       dayNum + ' ' + monLong,
      longday:   wdLong + ' ' + dayNum + ' ' + monLong
    };
    slots.forEach(function(el){
      var t = F[el.getAttribute('data-ev')];
      if (t) el.textContent = t;
    });
  })();

  if (PF.PAYMENT_LINK){
    $$('.js-pay').forEach(function(a){ a.href = PF.PAYMENT_LINK; });
  }

  $$('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* missing photo / video → show the labelled placeholder instead of a broken icon */
  function markEmpty(el){
    var m = el.closest('.media, .logo');
    if (m) m.classList.add('is-empty');
  }
  document.addEventListener('error', function(e){
    var t = e.target;
    if (t && t.closest && /^(IMG|SOURCE|VIDEO)$/.test(t.tagName)) markEmpty(t);
  }, true);
  $$('.media img, .logo img').forEach(function(img){
    if (!img.getAttribute('src') || (img.complete && img.naturalWidth === 0)) markEmpty(img);
  });
  $$('.media video').forEach(function(v){ if (v.networkState === 3) markEmpty(v); });

  /* fade-up on scroll */
  var els = $$('.reveal');
  if (!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  els.forEach(function(e){ io.observe(e); });
})();


/* ═══════════════════════════════════════════════════════════════════
   HERO — ticker, seat ring, countdown, spotlight, embers, video
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var tt = document.getElementById('tickerTrack');
  if (tt) tt.innerHTML += tt.innerHTML;

  var TARGET = new Date(PF.EVENT_START).getTime();
  var el = {
    d: document.getElementById('cdD'), h: document.getElementById('cdH'),
    m: document.getElementById('cdM'), s: document.getElementById('cdS')
  };
  function tick(){
    var gap = Math.max(0, TARGET - Date.now());
    var sec = Math.floor(gap / 1000);
    el.d.textContent = pad2(Math.floor(sec / 86400));
    el.h.textContent = pad2(Math.floor(sec / 3600) % 24);
    el.m.textContent = pad2(Math.floor(sec / 60) % 60);
    el.s.textContent = pad2(sec % 60);
  }
  if (el.d){ tick(); setInterval(tick, 1000); }

  var hero = document.getElementById('hero'), spot = document.getElementById('spot');
  if (hero && spot && HOVER){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      spot.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  var cv = document.getElementById('embers');
  if (cv && !REDUCE){
    var cx = cv.getContext('2d'), W = 0, H = 0, dots = [], raf;
    var s = getComputedStyle(document.documentElement);
    var cols = [
      s.getPropertyValue('--brand-gold').trim()  || '#F2C94C',
      s.getPropertyValue('--brand-amber').trim() || '#FF8A50',
      s.getPropertyValue('--brand-coral').trim() || '#E14B3D'
    ];
    function seed(){
      var n = Math.max(26, Math.min(70, Math.round(W / 26)));
      dots = [];
      for (var i = 0; i < n; i++){
        dots.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.1 + .5,
                    vy: -(Math.random() * .34 + .1), vx: (Math.random() - .5) * .22,
                    a: Math.random() * .5 + .12, c: cols[(Math.random() * cols.length) | 0] });
      }
    }
    function size(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function frame(){
      cx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++){
        var d = dots[i];
        d.y += d.vy; d.x += d.vx;
        if (d.y < -8){ d.y = H + 8; d.x = Math.random() * W; }
        if (d.x < -8) d.x = W + 8;
        if (d.x > W + 8) d.x = -8;
        cx.globalAlpha = d.a; cx.fillStyle = d.c;
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.2832); cx.fill();
      }
      cx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    size(); frame();
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
    });
  }

  var vid = document.getElementById('heroVideo'), sb = document.getElementById('soundBtn');
  if (vid && sb){
    sb.addEventListener('click', function(){
      vid.muted = !vid.muted;
      sb.textContent = vid.muted ? '🔇' : '🔊';
      sb.setAttribute('aria-pressed', String(!vid.muted));
      if (!vid.muted) vid.play().catch(function(){});
    });
    vid.play().catch(function(){
      var kick = function(){ vid.play().catch(function(){}); };
      window.addEventListener('pointerdown', kick, { once: true });
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION B — the docket
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  if (!REDUCE) document.body.classList.add('anim');

  /* docket → detail screen */
  var DATA = [
    { n: '01', h: 'Clarity on the right format',
      p: 'Home kitchen, cloud kitchen, café or QSR. You will know which one fits your goals, your budget and the hours you actually have — before you spend a rupee on rent or equipment.',
      proof: 'Covered in', proofB: 'Six food business models you can start today' },
    { n: '02', h: 'A menu priced to make money',
      p: 'We work through food cost, contribution margin and break-even on your own dishes, so every item on the menu earns its place instead of quietly losing money on every order.',
      proof: 'Covered in', proofB: 'Unit economics: costs, margins & profit' },
    { n: '03', h: 'A kitchen that runs without you',
      p: 'How to hire, train and manage a kitchen team — with the opening and closing checklists, onboarding form and marination SOP you can put on the wall the next morning.',
      proof: 'Covered in', proofB: 'Hiring & managing your kitchen team' },
    { n: '04', h: 'A brand that stands out',
      p: 'A name, a position and a menu that separate you from every other outlet on the delivery apps — built in the room through the brand building exercise, not left for later.',
      proof: 'Covered in', proofB: 'Brand building exercise + menu engineering' }
  ];

  var tabs = $$('.dk-item'), scBody = document.getElementById('scBody');
  var rails = document.querySelectorAll('.sc-rail i'), panel = document.getElementById('panel');
  var stamp = document.getElementById('stamp'), seen = {};

  function render(i, animate){
    var d = DATA[i];
    scBody.innerHTML =
      '<div class="sc-num">' + d.n + '</div><h3>' + d.h + '</h3><p>' + d.p + '</p>' +
      '<span class="sc-proof">' + d.proof + ' <b>' + d.proofB + '</b></span>';
    if (animate && !REDUCE){ scBody.classList.remove('fadein'); void scBody.offsetWidth; scBody.classList.add('fadein'); }
    tabs.forEach(function(t, k){
      t.setAttribute('aria-selected', String(k === i));
      t.setAttribute('tabindex', k === i ? '0' : '-1');
      if (k === i) t.classList.add('done');
    });
    rails.forEach(function(r, k){ r.classList.toggle('on', k <= i); });
    panel.setAttribute('aria-labelledby', 'tab' + i);
    seen[i] = true;
    if (Object.keys(seen).length === DATA.length) stamp.classList.add('on');
  }

  if (tabs.length && scBody){
    var timer = null;
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ if (timer) clearInterval(timer); render(i, true); });
      t.addEventListener('keydown', function(e){
        var next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1
                 : e.key === 'ArrowUp'   || e.key === 'ArrowLeft'  ? i - 1 : null;
        if (next === null) return;
        e.preventDefault();
        var j = (next + DATA.length) % DATA.length;
        tabs[j].focus(); render(j, true);
      });
    });
    render(0, false);

    if (!REDUCE){
      var step = 0;
      onView(document.getElementById('walk'), function(){
        timer = setInterval(function(){
          step++;
          if (step >= DATA.length){ clearInterval(timer); return; }
          render(step, true);
        }, 3200);
      }, { threshold: .45 });
    }
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION C — flip board (old way → Pro Foodpreneur way)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var cards = $$('#board .flip');
  if (!cards.length) return;
  var num = $('#shiftNum'), score = $('#shiftScore'), segs = $$('#shift [data-shift]');

  function update(){
    var n = cards.filter(function(c){ return c.classList.contains('is-on'); }).length;
    num.textContent = n + '/' + cards.length;
    score.style.setProperty('--s', n / cards.length);
    var state = n === cards.length ? 'new' : n === 0 ? 'old' : '';
    segs.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.shift === state)); });
  }
  function set(c, on){
    c.classList.toggle('is-on', on);
    c.setAttribute('aria-pressed', String(on));
    $('.flip-old', c).setAttribute('aria-hidden', String(on));
    $('.flip-new', c).setAttribute('aria-hidden', String(!on));
  }
  function all(on){
    cards.forEach(function(c, i){
      setTimeout(function(){ set(c, on); update(); }, REDUCE ? 0 : i * 110);
    });
  }

  cards.forEach(function(c){
    set(c, false);
    c.addEventListener('click', function(){ set(c, !c.classList.contains('is-on')); update(); });
  });
  segs.forEach(function(b){ b.addEventListener('click', function(){ all(b.dataset.shift === 'new'); }); });
  update();

  onView($('#board'), function(){ setTimeout(function(){ all(true); }, 600); }, { threshold: .5 });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION D — agenda sun clock (follows your scroll through the day)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var wrap = $('#phases'), clock = $('#clock');
  if (!wrap || !clock) return;
  var sun = $('#sun'), glow = $('#sunGlow'), arc = $('#arcFg');
  var tEl = $('#clockTime'), pEl = $('#clockPhase'), phases = $$('.phase', wrap);

  var L = arc.getTotalLength();
  arc.style.strokeDasharray = L;
  arc.style.strokeDashoffset = L;

  function hm(iso){ var m = /T(\d\d):(\d\d)/.exec(iso); return m ? (+m[1]) * 60 + (+m[2]) : 540; }
  var startMin = hm(PF.EVENT_START), span = hm(PF.EVENT_END) - startMin;
  function fmt(m){
    m = Math.round(m / 5) * 5;
    var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + pad2(mm) + ' ' + ap;
  }

  onScroll(function(){
    var r = wrap.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh * .5 - r.top) / r.height, 0, 1);
    var a = Math.PI * p;
    var x = (120 - 100 * Math.cos(a)).toFixed(1), y = (120 - 100 * Math.sin(a)).toFixed(1);
    sun.setAttribute('cx', x); sun.setAttribute('cy', y);
    glow.setAttribute('cx', x); glow.setAttribute('cy', y);
    arc.style.strokeDashoffset = L * (1 - p);
    clock.style.setProperty('--p', p.toFixed(3));
    tEl.textContent = fmt(startMin + p * span);

    var act = phases[0];
    phases.forEach(function(ph){ if (ph.getBoundingClientRect().top < vh * .55) act = ph; });
    phases.forEach(function(ph){ ph.classList.toggle('is-active', ph === act); });
    pEl.textContent = act.dataset.phase;
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION E — who should attend (stage matcher)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var tiles = $$('#personas .persona');
  if (!tiles.length) return;
  var title = $('#fitTitle'), body = $('#fitBody'), bars = $$('#fitBars i'), panel = $('#fitPanel');

  function show(i, byUser){
    var t = tiles[i];
    tiles.forEach(function(x, k){ x.setAttribute('aria-pressed', String(k === i)); });
    title.textContent = $('.persona-title', t).textContent;
    var tpl = $('template', t);
    if (tpl){ body.innerHTML = ''; body.appendChild(tpl.content.cloneNode(true)); }
    var w = (t.dataset.weights || '0,0,0').split(',');
    bars.forEach(function(b, k){ b.style.setProperty('--v', w[k] || 0); });
    if (!REDUCE){ panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }

    /* on phones/tablets the panel sits below the tiles — bring it into view */
    if (byUser && window.innerWidth <= 1000){
      var r = panel.getBoundingClientRect();
      if (r.top > window.innerHeight * .7) panel.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
    }
  }
  tiles.forEach(function(t, i){ t.addEventListener('click', function(){ show(i, true); }); });
  show(0, false);
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION F — event pass: add to calendar
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var s = new Date(PF.EVENT_START), e = new Date(PF.EVENT_END);
  function z(d){ return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function esc(t){ return t.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  var details = 'One-day offline bootcamp with Coach Karthikeyan. The exact venue is shared after registration.';

  var g = $('#gcalBtn');
  if (g) g.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(PF.EVENT_TITLE) +
    '&dates=' + z(s) + '/' + z(e) +
    '&location=' + encodeURIComponent(PF.EVENT_PLACE) +
    '&details=' + encodeURIComponent(details);

  var b = $('#icsBtn');
  if (b) b.addEventListener('click', function(){
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pro Foodpreneur//Intensive//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:pfi-' + z(s) + '@profoodpreneur.com',
      'DTSTAMP:' + z(new Date()),
      'DTSTART:' + z(s), 'DTEND:' + z(e),
      'SUMMARY:' + esc(PF.EVENT_TITLE),
      'LOCATION:' + esc(PF.EVENT_PLACE),
      'DESCRIPTION:' + esc(details),
      'BEGIN:VALARM', 'TRIGGER:-PT12H', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(PF.EVENT_TITLE) + ' tomorrow', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'pro-foodpreneur-intensive.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION G — bonus kit: unlock sequence + 3D tilt
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var kit = $('#kit');
  if (!kit) return;
  var cards = $$('.kitcard', kit), cnt = $('#kitCount'), tot = $('#kitTotal');
  tot.textContent = pad2(cards.length);
  cnt.textContent = '00';

  onView(kit, function(){
    cards.forEach(function(c, i){
      setTimeout(function(){ c.classList.add('is-open'); cnt.textContent = pad2(i + 1); }, REDUCE ? 0 : 200 + i * 240);
    });
  }, { threshold: .2 });

  if (HOVER && !REDUCE) cards.forEach(function(c){
    var inner = $('.kitcard-in', c);
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      inner.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      inner.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', function(){
      inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg');
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION H — carousel (arrows, drag, progress) + reel players
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  $$('[data-carousel]').forEach(function(root){
    var sec = root.closest('.sec') || document;
    var track = $('.car-track', root), prev = $('[data-prev]', sec), next = $('[data-next]', sec), bar = $('.car-bar', root);

    function step(){
      var f = track.children[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return f ? f.getBoundingClientRect().width + gap : 300;
    }
    function upd(){
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (bar) bar.style.setProperty('--p', ((track.scrollLeft + track.clientWidth) / track.scrollWidth).toFixed(3));
    }
    if (prev) prev.addEventListener('click', function(){ track.scrollBy({ left: -step(), behavior: REDUCE ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function(){ track.scrollBy({ left:  step(), behavior: REDUCE ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();

    /* click-and-drag with a mouse (touch already swipes natively) */
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function(e){
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5){ moved = true; track.classList.add('dragging'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function(){
      if (!down) return;
      down = false; track.classList.remove('dragging');
    });
    track.addEventListener('click', function(e){
      if (moved){ e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  var reels = $$('.reel');
  function stopOthers(except){
    reels.forEach(function(r){ var v = $('video', r); if (r !== except && v && !v.paused) v.pause(); });
  }
  reels.forEach(function(r){
    var v = $('video', r), btn = $('.reel-play', r), prog = $('.reel-prog', r);
    if (!v || !btn) return;
    btn.addEventListener('click', function(){
      if ($('.media.is-empty', r)) return;
      if (v.paused){
        stopOthers(r);
        v.muted = false;
        v.play().catch(function(){ v.muted = true; v.play().catch(function(){}); });
      } else v.pause();
    });
    v.addEventListener('play',  function(){ r.classList.add('is-playing'); });
    v.addEventListener('pause', function(){ r.classList.remove('is-playing'); });
    v.addEventListener('ended', function(){ r.classList.remove('is-playing'); v.currentTime = 0; });
    v.addEventListener('timeupdate', function(){
      if (prog && v.duration) prog.style.setProperty('--t', (v.currentTime / v.duration).toFixed(3));
    });
  });

  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ var v = $('video', e.target); if (!e.isIntersecting && v && !v.paused) v.pause(); });
    }, { threshold: .3 });
    reels.forEach(function(r){ io.observe(r); });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION I — gallery: hover previews + full-screen lightbox
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var grid = $('#galleryGrid');
  if (!grid) return;
  var frames = $$('.frame', grid);
  $('#galCount').textContent = frames.length;

  /* optional captions on the tile itself */
  frames.forEach(function(f){
    var c = f.dataset.caption;
    if (c){ var s = document.createElement('span'); s.className = 'frame-cap'; s.textContent = c; f.appendChild(s); }
    var v = $('video', f);
    if (v && HOVER){
      f.addEventListener('pointerenter', function(){ v.muted = true; v.play().catch(function(){}); });
      f.addEventListener('pointerleave', function(){ v.pause(); });
    }
  });

  var lb = $('#lightbox'), stage = $('#lbStage'), cap = $('#lbCap'), count = $('#lbCount');
  var list = [], idx = 0, swiped = false;

  function render(){
    var f = list[idx], node;
    stage.innerHTML = '';
    if (f.dataset.video){
      node = document.createElement('video');
      node.src = f.dataset.video; node.controls = true; node.autoplay = true; node.playsInline = true;
    } else {
      var img = $('img', f);
      node = document.createElement('img');
      node.src = f.dataset.full || img.currentSrc || img.src;
      node.alt = img.alt || '';
    }
    stage.appendChild(node);
    var im = $('img', f);
    cap.textContent = f.dataset.caption || (im ? im.alt : '');
    count.textContent = (idx + 1) + ' / ' + list.length;
  }
  function open(f){
    list = frames.filter(function(x){ return !$('.media.is-empty', x); });
    if (!list.length) return;
    idx = Math.max(0, list.indexOf(f));
    render();
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  }
  function close(){ if (lb.close) lb.close(); else { lb.removeAttribute('open'); onClose(); } }
  function onClose(){ stage.innerHTML = ''; document.documentElement.style.overflow = ''; }
  function go(d){ idx = (idx + d + list.length) % list.length; render(); }

  frames.forEach(function(f){
    f.addEventListener('click', function(){ if (!$('.media.is-empty', f)) open(f); });
  });
  $('#lbPrev').addEventListener('click', function(){ go(-1); });
  $('#lbNext').addEventListener('click', function(){ go(1); });
  $('#lbClose').addEventListener('click', close);
  lb.addEventListener('close', onClose);
  lb.addEventListener('keydown', function(e){
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  lb.addEventListener('click', function(e){
    if (swiped){ swiped = false; return; }
    if (e.target === lb || e.target === stage) close();
  });
  var sx = null;
  stage.addEventListener('pointerdown', function(e){ sx = e.clientX; });
  stage.addEventListener('pointerup', function(e){
    if (sx === null) return;
    var dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50){ swiped = true; go(dx < 0 ? 1 : -1); }
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION J — success stories: stacking cards
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var st = $$('#stack .story');
  if (!st.length) return;
  st.forEach(function(s, i){ s.style.setProperty('--i', i); });
  var wide = window.matchMedia('(min-width: 741px)');

  onScroll(function(){
    if (!wide.matches || REDUCE){ st.forEach(function(s){ s.style.removeProperty('--p'); }); return; }
    for (var i = 0; i < st.length - 1; i++){
      var a = st[i].getBoundingClientRect(), b = st[i + 1].getBoundingClientRect();
      var p = clamp(1 - (b.top - a.top) / a.height, 0, 1);
      st[i].style.setProperty('--p', p.toFixed(3));
    }
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION K — coach numbers count up
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  if (REDUCE) return;
  $$('[data-count]').forEach(function(el){
    var to = +el.dataset.count;
    el.textContent = '0';
    onView(el, function(){
      var t0 = performance.now(), dur = 1500;
      (function f(t){
        var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * e).toLocaleString('en-IN');
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }, { threshold: .6 });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION L — price card: holographic tilt
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var h = $('#holo');
  if (h && HOVER && !REDUCE){
    h.addEventListener('pointermove', function(e){
      var r = h.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      h.style.setProperty('--hx', (x * 100).toFixed(1) + '%');
      h.style.setProperty('--hy', (y * 100).toFixed(1) + '%');
      h.style.setProperty('--ry', ((x - .5) * 12).toFixed(2) + 'deg');
      h.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
    });
    h.addEventListener('pointerleave', function(){
      h.style.setProperty('--rx', '0deg'); h.style.setProperty('--ry', '0deg');
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   SECTION M — FAQ: smooth open/close + search
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var items = $$('.faq-item');
  items.forEach(function(d){
    var s = $('summary', d), a = $('.faq-a', d);
    s.addEventListener('click', function(e){
      if (REDUCE || !a.animate) return;
      e.preventDefault();
      if (d.open){
        var h = a.offsetHeight;
        a.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 240, easing: 'ease' })
         .onfinish = function(){ d.open = false; };
      } else {
        d.open = true;
        var h2 = a.offsetHeight;
        a.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    });
  });

  var q = $('#faqSearch'), empty = $('#faqEmpty');
  if (q) q.addEventListener('input', function(){
    var v = q.value.trim().toLowerCase(), n = 0;
    items.forEach(function(d){
      var hit = !v || d.textContent.toLowerCase().indexOf(v) !== -1;
      d.hidden = !hit;
      if (hit) n++;
    });
    empty.hidden = n !== 0;
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   FINAL — marquee, sticky bar, progress line
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  $$('[data-marquee]').forEach(function(m){ m.innerHTML += m.innerHTML; });

  var line = $('.progress'), bar = $('#stickybar'), hero = $('#hero'), btn = bar && $('.btn', bar);
  var near = {};
  if ('IntersectionObserver' in window){
    ['reserve', 'final'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function(es){
        es.forEach(function(e){ near[id] = e.isIntersecting; });
        run();
      }, { threshold: .15 }).observe(el);
    });
  }
  function run(){
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (line) line.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    if (bar){
      var show = window.scrollY > (hero ? hero.offsetHeight * .75 : 400) && !near.reserve && !near.final;
      bar.classList.toggle('on', show);
      bar.setAttribute('aria-hidden', String(!show));
      if (btn) btn.tabIndex = show ? 0 : -1;
    }
  }
  onScroll(run);
})();

runScroll();

/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  MOTION LAYER                                                      ║
   ║  Runs after everything above, so it only adds — nothing here       ║
   ║  replaces existing behaviour.                                      ║
   ║    1 · ATMOSPHERES  — inject + trigger one entrance per section    ║
   ║    2 · LINE LIFT    — headings arrive line by line                 ║
   ║    3 · MAGNETISM    — the main CTA leans toward the cursor         ║
   ║    4 · PARALLAX     — photos drift against the scroll              ║
   ║    5 · PULSE        — the countdown breathes on the second         ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
(function () {
  'use strict';

  /* ═══════ 1 · ATMOSPHERES ═══════
     Each section gets its own backdrop layer with its own way of arriving.
     The element is injected rather than written into the HTML so the
     markup stays readable and a section can be deleted without leaving
     an orphan div behind. */
  var ATMOSPHERES = [
    'walk',     /* warm dawn rising from the floor      */
    'shift',    /* coral bloom + curtain lift           */
    'agenda',   /* sunrise sweeping left to right       */
    'fit',      /* iris opening from the centre         */
    'glance',   /* silk sheet sliding diagonally        */
    'bonus',    /* gold dust lifting off the kit        */
    'voices',   /* vignette breathing with the reels    */
    'gallery',  /* scan line passing down the sheet     */
    'stories',  /* paper grain drifting                 */
    'coach',    /* warm key light from the portrait     */
    'reserve',  /* prism shimmer across the price card  */
    'faq',      /* slow contour rings                   */
    'final'     /* embers rising for the close          */
  ];

  ATMOSPHERES.forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;

    var layer = document.createElement('div');
    layer.className = 'atm atm--' + id;
    layer.setAttribute('aria-hidden', 'true');
    sec.insertBefore(layer, sec.firstChild);

    if (REDUCE || !('IntersectionObserver' in window)) {
      layer.classList.add('is-in');
      return;
    }

    /* fire a little before the section is centred, so the backdrop has
       already settled by the time the reader gets to the words */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        layer.classList.add('is-in');
        io.disconnect();
      });
    }, { threshold: 0, rootMargin: '0px 0px -18% 0px' });
    io.observe(sec);
  });


  /* ═══════ 2 · LINE LIFT ═══════
     A heading block that fades up as one slab reads like a slide.
     Lifting the eyebrow, headline and standfirst separately, a beat
     apart, reads like something was composed. */
  $$('.sec-head, .walk-head').forEach(function (head) {
    /* the parent's own reveal is removed so the two don't double up */
    head.classList.remove('reveal', 'in');

    var kids = Array.prototype.filter.call(head.children, function (n) {
      return n.nodeType === 1;
    });

    /* a split head holds two columns — lift their contents, not the columns */
    if (head.classList.contains('sec-head--split')) {
      var flat = [];
      kids.forEach(function (col) {
        if (col.children.length) {
          Array.prototype.forEach.call(col.children, function (n) { flat.push(n); });
        } else {
          flat.push(col);
        }
      });
      kids = flat;
    }

    kids.forEach(function (el, i) {
      el.classList.add('lift');
      el.style.setProperty('--d', (i * 110) + 'ms');
    });

    if (REDUCE || !('IntersectionObserver' in window)) {
      kids.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        kids.forEach(function (el) { el.classList.add('in'); });
        io.disconnect();
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    io.observe(head);
  });


  /* ═══════ 3 · MAGNETISM ═══════
     The primary CTA leans a few pixels toward the pointer. Capped low on
     purpose: past about 8px it stops feeling considered and starts
     feeling like the button is dodging the click. */
  if (HOVER && !REDUCE) {
    $$('.btn--fire').forEach(function (btn) {
      var raf = null;

      btn.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          btn.style.setProperty('--mxp', clamp(dx * 7, -7, 7).toFixed(1) + 'px');
          btn.style.setProperty('--myp', clamp(dy * 5, -5, 5).toFixed(1) + 'px');
        });
      });

      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--mxp', '0px');
        btn.style.setProperty('--myp', '0px');
      });
    });
  }


  /* ═══════ 4 · PARALLAX ═══════
     Photos drift slowly against the scroll. Only the slots currently on
     screen are tracked — the page has 30-odd media tiles and moving all
     of them every frame would cost more than the effect is worth. */
  if (!REDUCE) {
    var slots = $$('.media > img, .media > video');
    if (slots.length) {
      var live = [];

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            var i = live.indexOf(e.target);
            if (e.isIntersecting && i === -1) live.push(e.target);
            else if (!e.isIntersecting && i !== -1) live.splice(i, 1);
          });
        }, { rootMargin: '12% 0px' });
        slots.forEach(function (el) { io.observe(el); });
      } else {
        live = slots;
      }

      onScroll(function () {
        var vh = window.innerHeight;
        live.forEach(function (el) {
          var r = el.getBoundingClientRect();
          /* -1 above the fold → +1 below it */
          var p = ((r.top + r.height / 2) - vh / 2) / vh;
          el.style.setProperty('--py', (clamp(p, -1, 1) * -14).toFixed(1) + 'px');
        });
      });
    }
  }


  /* ═══════ 5 · PULSE ═══════
     The seconds box warms for a moment on each tick — the one piece of
     the page that is genuinely live, so it should look it. */
  if (!REDUCE) {
    var secBox = $('#cdS') && $('#cdS').parentNode;
    if (secBox) {
      setInterval(function () {
        secBox.classList.add('tick');
        setTimeout(function () { secBox.classList.remove('tick'); }, 420);
      }, 1000);
    }
  }

})();

runScroll();


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  MOBILE LAYER                                                      ║
   ║  Only runs at ≤740px. Desktop behaviour is untouched.              ║
   ║    1 · SWIPE ROWS  — dots, focus scaling, keeps the active card    ║
   ║    2 · ACCORDION   — agenda phases open one at a time              ║
   ║    3 · READ MORE   — the coach bio starts clamped                  ║
   ║    4 · TAP TILT    — kit cards tilt with scroll instead of hover   ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
(function () {
  'use strict';

  var mq = window.matchMedia('(max-width: 740px)');
  if (!mq.matches) return;          /* desktop keeps every original effect */

  /* ═══════ 1 · SWIPE ROWS ═══════
     Four grids become horizontal snap rows in CSS. Here we add the dots,
     and scale whichever card is nearest the centre so the row reads as
     one focused item rather than a flat strip. This is the motion that
     replaces the pointer tilt, which never fired on touch. */
  [
    { sel: '.stack',    item: '.story',   label: 'Swipe for more stories' },
    { sel: '.kit',      item: '.kitcard', label: 'Swipe through the kit'  },
    { sel: '.personas', item: '.persona', label: 'Swipe to find your stage' },
    { sel: '.contact',  item: '.frame',   label: 'Swipe through the room' }
  ].forEach(function (cfg) {

    var row = $(cfg.sel);
    if (!row) return;
    var items = $$(cfg.item, row);
    if (items.length < 2) return;

    /* dots + a one-line hint, inserted after the row */
    var dots = document.createElement('div');
    dots.className = 'mdots';
    dots.setAttribute('aria-hidden', 'true');
    items.forEach(function () { dots.appendChild(document.createElement('i')); });

    var hint = document.createElement('span');
    hint.className = 'mswipe';
    hint.textContent = cfg.label;

    row.parentNode.insertBefore(dots, row.nextSibling);
    row.parentNode.insertBefore(hint, dots.nextSibling);

    var pips = $$('i', dots);
    var raf = null;

    function sync() {
      raf = null;
      var mid = row.scrollLeft + row.clientWidth / 2;
      var best = 0, bestD = Infinity;

      items.forEach(function (el, i) {
        var c = el.offsetLeft + el.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < bestD) { bestD = d; best = i; }
      });

      items.forEach(function (el, i) { el.classList.toggle('focus', i === best); });
      pips.forEach(function (p, i) { p.classList.toggle('on', i === best); });
    }

    row.addEventListener('scroll', function () {
      if (!raf) raf = requestAnimationFrame(sync);
    }, { passive: true });

    sync();
    /* the row starts off-screen, so re-sync once it is actually laid out */
    setTimeout(sync, 300);
  });

  /* stories: the copy is clamped to four lines — tap the card to open it */
  $$('.stack .story').forEach(function (card) {
    var p = $('.story-body p', card);
    if (!p) return;
    card.addEventListener('click', function () { card.classList.toggle('open'); });
  });


  /* ═══════ 2 · ACCORDION ═══════
     On desktop the three phases are all open and the sun clock tracks
     your scroll past them. On a phone that was 1,500px of agenda, so
     only one phase stays open here. */
  var phases = $$('.phase');
  if (phases.length) {
    phases.forEach(function (ph, i) {
      var head = $('.phase-head', ph);
      if (!head) return;

      if (i === 0) ph.classList.add('open');

      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', String(i === 0));

      function toggle() {
        var wasOpen = ph.classList.contains('open');
        phases.forEach(function (o) {
          o.classList.remove('open');
          var h = $('.phase-head', o);
          if (h) h.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          ph.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
        }
      }

      head.addEventListener('click', toggle);
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  }


  /* ═══════ 3 · READ MORE ═══════
     The coach story is four paragraphs. Two are enough to earn the tap. */
  var copy = $('.coach-copy');
  if (copy && $$('.coach-copy > p').length > 2) {
    copy.classList.add('clamped');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'coach-more';
    btn.textContent = 'Read his story';
    btn.setAttribute('aria-expanded', 'false');

    var journey = $('.journey', copy);
    copy.insertBefore(btn, journey || null);

    btn.addEventListener('click', function () {
      var open = copy.classList.toggle('clamped') === false;
      btn.textContent = open ? 'Show less' : 'Read his story';
      btn.setAttribute('aria-expanded', String(open));
    });
  }


  /* ═══════ 4 · TAP TILT ═══════
     The kit cards had a pointer-driven 3D tilt that touch never saw.
     Here the tilt comes from where the card sits in the viewport, so it
     turns gently as you scroll past — same effect, no pointer needed. */
  if (!REDUCE) {
    var tilts = $$('.kitcard-in');
    if (tilts.length) {
      onScroll(function () {
        var vh = window.innerHeight;
        tilts.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var p = ((r.top + r.height / 2) - vh / 2) / vh;   /* -1 … +1 */
          el.style.setProperty('--rx', (clamp(p, -1, 1) * -5).toFixed(2) + 'deg');
        });
      });
    }
  }

})();

runScroll();