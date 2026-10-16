/* ═══════════════════════════════════════════════════════════════════
   CONFIG — the only lines you normally need to edit in this file
   ═══════════════════════════════════════════════════════════════════ */
var PF = {
  /* paste your checkout link between the quotes. Every button with
     class "js-pay" opens it. If a button has data-tier, the tier is
     appended as ?tier=silver so you can tell them apart.   */



     PAYMENT_LINKS: {
  platinum: 'PASTE_PLATINUM_PAYMENT_LINK',
  gold: 'PASTE_GOLD_PAYMENT_LINK',
  silver: 'PASTE_SILVER_PAYMENT_LINK'
},
  /* paste your waitlist form link. Every "js-wait" link opens it.   */
  WAITLIST_LINK: 'https://forms.gle/2F4EUnFvXYE85Be29',

  EVENT_START: '2026-10-31T09:00:00+05:30',
  EVENT_END:   '2026-10-31T18:00:00+05:30',
  EVENT_TITLE: 'Pro Foodpreneur Intensive · Hyderabad',
  EVENT_PLACE: 'The Park, Hyderabad (venue subject to change)',
  EVENT_TZ:    'Asia/Kolkata',

  /* seats. "left" is what is still open in each tier; "total" is the
     number of chairs drawn in that tier on the seating plan.        */
  TIERS: [
    { id:'platinum', label:'Platinum', price:'₹6,999', total:10, left:10, rows:2 },
    { id:'gold',     label:'Gold',     price:'₹2,999', total:15, left:15, rows:3 },
    { id:'silver',   label:'Silver',   price:'₹1,999', total:25, left:25, rows:5 }
  ]
};


/* Book Now → Section 2; tier Reserve → payment */
$$('.js-pay').forEach(function(a) {
  if (a.tagName !== 'A') return;

  var tier = a.getAttribute('data-tier');

  if (tier && PF.PAYMENT_LINKS[tier]) {
    // Platinum / Gold / Silver Reserve buttons
    a.href = PF.PAYMENT_LINKS[tier];
  } else if (!tier) {
    // Book Now buttons without a tier
    a.href = '#seating';

    a.addEventListener('click', function(e) {
      e.preventDefault();

      var seating = document.getElementById('seating');

      if (seating) {
        seating.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
});


/* ═══════════════════════════════════════════════════════════════════ */


var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var HOVER  = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
var MOBILE = window.matchMedia && matchMedia('(max-width: 740px)').matches;

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
   GLOBAL — seats, dates, links, placeholders, reveals
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var totalSeats = PF.TIERS.reduce(function(n,t){ return n + t.total; }, 0);
  var leftSeats  = PF.TIERS.reduce(function(n,t){ return n + t.left;  }, 0);

  $$('[data-seats-total]').forEach(function(el){ el.textContent = totalSeats; });
  $$('[data-seats-left]').forEach(function(el){ el.textContent = leftSeats; });
  PF.TIERS.forEach(function(t){
    $$('[data-left="' + t.id + '"]').forEach(function(el){ el.textContent = t.left; });
  });

  /* every visible date follows PF.EVENT_START */
  (function stampDates(){
    var slots = $$('[data-ev]');
    if (!slots.length) return;
    var d = new Date(PF.EVENT_START);
    if (isNaN(d.getTime())) return;
    function part(o){
      try { return new Intl.DateTimeFormat('en-IN', Object.assign({ timeZone: PF.EVENT_TZ }, o)).format(d); }
      catch (e){ return null; }
    }
    var day = part({ day:'numeric' }), monLong = part({ month:'long' }), monShort = part({ month:'short' });
    var wdLong = part({ weekday:'long' }), year = part({ year:'numeric' });
    if (!day || !monShort) return;
    var n = +day, suf = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
    var F = {
      full:    day + suf + ' ' + monShort + ', ' + wdLong,
      short:   day + ' ' + monShort,
      day:     day + suf + ' ' + monLong,
      longday: wdLong + ' ' + day + suf + ' ' + monLong,
      year:    year
    };
    slots.forEach(function(el){
      var t = F[el.getAttribute('data-ev')];
      if (t) el.textContent = t;
    });
  })();

  /* checkout + waitlist links */
  if (PF.PAYMENT_LINK){
    $$('.js-pay').forEach(function(a){
      if (a.tagName !== 'A') return;
      var tier = a.getAttribute('data-tier');
      a.href = PF.PAYMENT_LINK + (tier ? (PF.PAYMENT_LINK.indexOf('?') > -1 ? '&' : '?') + 'tier=' + tier : '');
    });
  }
  if (PF.WAITLIST_LINK){
    $$('.js-wait').forEach(function(a){ if (a.tagName === 'A'){ a.href = PF.WAITLIST_LINK; a.target = '_blank'; a.rel = 'noopener'; } });
  }

  $$('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* missing photo / video → labelled placeholder, never a broken icon */
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

  /* reveals */
  var els = $$('.reveal');
  if (!('IntersectionObserver' in window) || REDUCE){
    els.forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function(e){ io.observe(e); });
  }

  /* headings arrive line by line */
  $$('.sec-head').forEach(function(head){
    head.classList.remove('reveal', 'in');
    var kids = Array.prototype.filter.call(head.children, function(n){ return n.nodeType === 1; });
    if (head.classList.contains('sec-head--split')){
      var flat = [];
      kids.forEach(function(col){
        if (col.children.length) Array.prototype.forEach.call(col.children, function(n){ flat.push(n); });
        else flat.push(col);
      });
      kids = flat;
    }
    kids.forEach(function(el, i){ el.classList.add('lift'); el.style.setProperty('--d', (i * 110) + 'ms'); });
    if (REDUCE || !('IntersectionObserver' in window)){ kids.forEach(function(el){ el.classList.add('in'); }); return; }
    onView(head, function(){ kids.forEach(function(el){ el.classList.add('in'); }); }, { threshold:.2, rootMargin:'0px 0px -8% 0px' });
  });

  /* atmospheres — one per section, each with its own entrance */
  ['seating','walk','shift','covers','who','glance','bonus','voices','gallery','stories','coach','pricing','faq','final']
  .forEach(function(id){
    var sec = document.getElementById(id);
    if (!sec) return;
    var layer = document.createElement('div');
    layer.className = 'atm atm--' + id;
    layer.setAttribute('aria-hidden', 'true');
    sec.insertBefore(layer, sec.firstChild);
    if (REDUCE || !('IntersectionObserver' in window)){ layer.classList.add('is-in'); return; }
    onView(sec, function(){ layer.classList.add('is-in'); }, { threshold:0, rootMargin:'0px 0px -18% 0px' });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   HERO — ticker, countdowns, spotlight, embers, video
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var tt = $('#tickerTrack');
  if (tt) tt.innerHTML += tt.innerHTML;

  var TARGET = new Date(PF.EVENT_START).getTime();
  var clocks = [
    { d:$('#cdD'),  h:$('#cdH'),  m:$('#cdM'),  s:$('#cdS')  },
    { d:$('#cd2D'), h:$('#cd2H'), m:$('#cd2M'), s:$('#cd2S') }
  ].filter(function(c){ return c.d && c.h && c.m && c.s; });

  if (clocks.length){
    function tick(){
      var gap = Math.max(0, TARGET - Date.now());
      var sec = Math.floor(gap / 1000);
      var d = pad2(Math.floor(sec / 86400)), h = pad2(Math.floor(sec / 3600) % 24),
          m = pad2(Math.floor(sec / 60) % 60), s = pad2(sec % 60);
      clocks.forEach(function(c){ c.d.textContent = d; c.h.textContent = h; c.m.textContent = m; c.s.textContent = s; });
    }
    tick();
    setInterval(tick, 1000);

    /* the seconds box warms on each tick — the one live thing on the page */
    if (!REDUCE){
      var secBox = $('#cdS') && $('#cdS').parentNode;
      if (secBox) setInterval(function(){
        secBox.classList.add('tick');
        setTimeout(function(){ secBox.classList.remove('tick'); }, 420);
      }, 1000);
    }
  }

  var hero = $('#hero'), spot = $('#spot');
  if (hero && spot && HOVER){
    hero.addEventListener('pointermove', function(e){
      var r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      spot.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive:true });
  }

  /* ember particles — colours come from :root, so re-skinning works */
  var cv = $('#embers');
  if (cv && !REDUCE){
    var cx = cv.getContext('2d'), W = 0, H = 0, dots = [], raf;
    var cs = getComputedStyle(document.documentElement);
    var cols = [
      (cs.getPropertyValue('--brand-gold')  || '').trim() || '#F2C94C',
      (cs.getPropertyValue('--brand-amber') || '').trim() || '#FF8A50',
      (cs.getPropertyValue('--brand-coral') || '').trim() || '#E14B3D'
    ];
    function seed(){
      var n = Math.max(24, Math.min(70, Math.round(W / 26)));
      dots = [];
      for (var i = 0; i < n; i++){
        dots.push({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*2.1+.5,
                    vy:-(Math.random()*.34+.1), vx:(Math.random()-.5)*.22,
                    a:Math.random()*.5+.12, c:cols[(Math.random()*cols.length)|0] });
      }
    }
    function size(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = W*dpr; cv.height = H*dpr;
      cx.setTransform(dpr,0,0,dpr,0,0);
      seed();
    }
    function frame(){
      cx.clearRect(0,0,W,H);
      for (var i = 0; i < dots.length; i++){
        var d = dots[i];
        d.y += d.vy; d.x += d.vx;
        if (d.y < -8){ d.y = H+8; d.x = Math.random()*W; }
        if (d.x < -8) d.x = W+8;
        if (d.x > W+8) d.x = -8;
        cx.globalAlpha = d.a; cx.fillStyle = d.c;
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.2832); cx.fill();
      }
      cx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    size(); if (W && H) frame();
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
    });
  }

  var vid = $('#heroVideo'), sb = $('#soundBtn');
  if (vid){
    if (sb) sb.addEventListener('click', function(){
      vid.muted = !vid.muted;
      sb.textContent = vid.muted ? '🔇' : '🔊';
      sb.setAttribute('aria-pressed', String(!vid.muted));
      if (!vid.muted) vid.play().catch(function(){});
    });
    var pl = vid.play();
    if (pl && pl.catch) pl.catch(function(){
      window.addEventListener('pointerdown', function kick(){ vid.play().catch(function(){}); }, { once:true });
    });
  }

  /* magnetic primary buttons */
  if (HOVER && !REDUCE){
    $$('.btn--fire').forEach(function(btn){
      var r2 = null;
      btn.addEventListener('pointermove', function(e){
        if (r2) return;
        r2 = requestAnimationFrame(function(){
          r2 = null;
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
          var dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
          btn.style.setProperty('--mxp', clamp(dx*7,-7,7).toFixed(1) + 'px');
          btn.style.setProperty('--myp', clamp(dy*5,-5,5).toFixed(1) + 'px');
        });
      });
      btn.addEventListener('pointerleave', function(){
        btn.style.setProperty('--mxp','0px'); btn.style.setProperty('--myp','0px');
      });
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   SEATING — stage + three tier blocks of seat squares
   Seats are drawn from PF.TIERS, so changing a count in CONFIG redraws
   the block and updates every number on the page.
   Animation, in order:
     1 · each tier's seats power on one at a time when it arrives
     2 · a shimmer runs across the row once they have landed
     3 · the active tier's open seats breathe
     4 · seats lift in a wave under the cursor (desktop) or as the
         block passes the middle of the screen (touch)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var house = $('.house');
  if (!house) return;

  /* ── 1 · build the seats ── */
  PF.TIERS.forEach(function(t){
    var box = $('[data-seats="' + t.id + '"]');
    if (!box) return;
    for (var i = 0; i < t.total; i++){
      var s = document.createElement('span');
      /* the open ones sit at the front of the block */
      s.className = 'seat ' + (i < t.left ? 'seat--open' : 'seat--res');
      s.style.setProperty('--sd', (i * 38) + 'ms');
      box.appendChild(s);
    }
    /* the shimmer waits until the last seat has landed */
    var block = box.closest('.tb');
    if (block) block.style.setProperty('--sweep', (t.total * 38 + 260) + 'ms');
  });

  /* ── 2 · power on, tier by tier ── */
  $$('.tb').forEach(function(tb){
    onView(tb, function(){
      tb.classList.add('lit');
      /* the seats-left figure counts up alongside the seats */
      var n = $('.tb-left b', tb);
      if (!n || REDUCE) return;
      var to = +n.textContent || 0, t0 = performance.now(), dur = Math.max(600, to * 38);
      (function f(t){
        var k = clamp((t - t0) / dur, 0, 1);
        n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }, { threshold:.3 });
  });

  /* ── 3 · focus a tier ── */
  var blocks = $$('.tb');
  function focusTier(id){
    house.setAttribute('data-focus', id);
    blocks.forEach(function(b){ b.classList.toggle('is-active', b.getAttribute('data-tier') === id); });
  }
  blocks.forEach(function(b){
    b.addEventListener('click', function(e){
      if (e.target.closest('.tb-btn')) return;      /* let Reserve through */
      focusTier(b.getAttribute('data-tier'));
    });
    if (HOVER) b.addEventListener('mouseenter', function(){ focusTier(b.getAttribute('data-tier')); });
  });
  if (blocks.length) focusTier(blocks[0].getAttribute('data-tier'));

  if (REDUCE) return;

  /* ── 4 · the wave ──
     On a pointer device the seats nearest the cursor lift, so running
     the mouse along a row feels like brushing a keyboard. On touch
     there is no cursor, so the wave is driven by where the block sits
     in the viewport instead — it rolls across as you scroll past. */
  if (HOVER){
    $$('.tb-seats').forEach(function(row){
      var seats = $$('.seat', row), raf = null;

      row.addEventListener('pointermove', function(e){
        if (raf) return;
        raf = requestAnimationFrame(function(){
          raf = null;
          seats.forEach(function(s){
            var r = s.getBoundingClientRect();
            var d = Math.abs(e.clientX - (r.left + r.width / 2));
            s.style.setProperty('--lift', Math.max(0, 1 - d / 90).toFixed(3));
          });
        });
      });
      row.addEventListener('pointerleave', function(){
        seats.forEach(function(s){ s.style.setProperty('--lift', '0'); });
      });
    });
  } else {
    var rows = $$('.tb-seats');
    onScroll(function(){
      var vh = window.innerHeight;
      rows.forEach(function(row){
        var r = row.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var seats = $$('.seat', row);
        /* 0 → 1 as the row crosses the middle of the screen */
        var p = clamp(1 - Math.abs((r.top + r.height / 2) - vh / 2) / (vh / 2), 0, 1);
        seats.forEach(function(s, i){
          var phase = Math.sin(p * Math.PI * 2 + i * 0.5);
          s.style.setProperty('--lift', Math.max(0, phase * p).toFixed(3));
        });
      });
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   THE SHIFT — flip board
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
    cards.forEach(function(c, i){ setTimeout(function(){ set(c, on); update(); }, REDUCE ? 0 : i * 110); });
  }

  cards.forEach(function(c){
    set(c, false);
    c.addEventListener('click', function(){ set(c, !c.classList.contains('is-on')); update(); });
  });
  segs.forEach(function(b){ b.addEventListener('click', function(){
    var seg = $('#shift .seg'); if (seg) seg.classList.add('engaged');
    all(b.dataset.shift === 'new');
  }); });
    update();
  onView($('#board'), function(){ setTimeout(function(){ all(true); }, 3000); }, { threshold:.5 });
})();


/* ═══════════════════════════════════════════════════════════════════
   THE DAY COVERS — sun clock + phases
   The sun walks the arc as you scroll the three phases: position on
   the arc, the dashed arc filling in behind it, the live clock time
   and the active phase all come off one scroll value. Start and end
   times are read from PF.EVENT_START / EVENT_END, so changing the day
   in CONFIG moves the clock with it.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var wrap = $('#phases'), clock = $('#clock');
  if (!wrap || !clock) return;
  var sun = $('#sun'), glow = $('#sunGlow'), arc = $('#arcFg');
  var tEl = $('#clockTime'), pEl = $('#clockPhase'), phases = $$('.phase', wrap);
  if (!sun || !arc) return;

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
    if (glow){ glow.setAttribute('cx', x); glow.setAttribute('cy', y); }
    arc.style.strokeDashoffset = L * (1 - p);
    tEl.textContent = fmt(startMin + p * span);

    var act = phases[0];
    phases.forEach(function(ph){ if (ph.getBoundingClientRect().top < vh * .55) act = ph; });
    phases.forEach(function(ph){ ph.classList.toggle('is-active', ph === act); });
    pEl.textContent = act.dataset.phase;
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   PHASES — "You leave with" reveals; accordion on mobile
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var phases = $$('.phase');
  if (!phases.length) return;

  phases.forEach(function(ph){ onView(ph, function(){ ph.classList.add('in'); }, { threshold:.3 }); });

  if (!MOBILE) return;

  phases.forEach(function(ph, i){
    var head = $('.phase-head', ph);
    if (!head) return;
    if (i === 0) ph.classList.add('open');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-expanded', String(i === 0));

    function toggle(){
      var wasOpen = ph.classList.contains('open');
      phases.forEach(function(o){
        o.classList.remove('open');
        var h = $('.phase-head', o);
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen){ ph.classList.add('open'); head.setAttribute('aria-expanded','true'); }
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   EVENT PASS — add to calendar
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var s = new Date(PF.EVENT_START), e = new Date(PF.EVENT_END);
  function z(d){ return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); }
  function esc(t){ return t.replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
  var details = 'One-day offline bootcamp with Coach Karthikeyan. Venue is subject to change.';

  var g = $('#gcalBtn');
  if (g) g.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(PF.EVENT_TITLE) +
    '&dates=' + z(s) + '/' + z(e) +
    '&location=' + encodeURIComponent(PF.EVENT_PLACE) +
    '&details=' + encodeURIComponent(details);

  var b = $('#icsBtn');
  if (b) b.addEventListener('click', function(){
    var ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Pro Foodpreneur//Intensive//EN','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT','UID:pfi-' + z(s) + '@profoodpreneur.com','DTSTAMP:' + z(new Date()),
      'DTSTART:' + z(s),'DTEND:' + z(e),'SUMMARY:' + esc(PF.EVENT_TITLE),
      'LOCATION:' + esc(PF.EVENT_PLACE),'DESCRIPTION:' + esc(details),
      'BEGIN:VALARM','TRIGGER:-PT12H','ACTION:DISPLAY','DESCRIPTION:' + esc(PF.EVENT_TITLE) + ' tomorrow','END:VALARM',
      'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([ics], { type:'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'pro-foodpreneur-intensive.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   BONUS KIT — unlock sequence + pointer tilt (desktop)
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var kit = $('#kit');
  if (!kit) return;
  var cards = $$('.kitcard', kit), cnt = $('#kitCount'), tot = $('#kitTotal');
  tot.textContent = pad2(cards.length);
  cnt.textContent = '00';

  onView(kit, function(){
    cards.forEach(function(c, i){
      setTimeout(function(){ c.classList.add('is-open'); cnt.textContent = pad2(i + 1); }, REDUCE ? 0 : 200 + i * 210);
    });
  }, { threshold:.2 });

  if (HOVER && !REDUCE) cards.forEach(function(c){
    var inner = $('.kitcard-in', c);
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      inner.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      inner.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', function(){
      inner.style.setProperty('--rx','0deg'); inner.style.setProperty('--ry','0deg');
    });
  });

  /* on touch the tilt comes from scroll position instead of the pointer */
  if (!HOVER && !REDUCE){
    var inners = $$('.kitcard-in', kit);
    onScroll(function(){
      var vh = window.innerHeight;
      inners.forEach(function(el){
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = ((r.top + r.height/2) - vh/2) / vh;
        el.style.setProperty('--rx', (clamp(p,-1,1) * -5).toFixed(2) + 'deg');
      });
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIAL CAROUSEL — arrows, drag, progress + reel players
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  $$('[data-carousel]').forEach(function(root){
    var sec = root.closest('.sec') || document;
    var track = $('.car-track', root), prev = $('[data-prev]', sec), next = $('[data-next]', sec), bar = $('.car-bar', root);
    if (!track) return;

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
    if (prev) prev.addEventListener('click', function(){ track.scrollBy({ left:-step(), behavior: REDUCE ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function(){ track.scrollBy({ left: step(), behavior: REDUCE ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', upd, { passive:true });
    window.addEventListener('resize', upd);
    upd();

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
    window.addEventListener('pointerup', function(){ if (down){ down = false; track.classList.remove('dragging'); } });
    track.addEventListener('click', function(e){ if (moved){ e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
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
    }, { threshold:.3 });
    reels.forEach(function(r){ io.observe(r); });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   GALLERY — hover previews + full-screen lightbox
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  var grid = $('#galleryGrid');
  if (!grid) return;
  var frames = $$('.frame', grid);
  var gc = $('#galCount'); if (gc) gc.textContent = frames.length;

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
  if (!lb) return;
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
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open','');
    document.documentElement.style.overflow = 'hidden';
  }
  function onClose(){ stage.innerHTML = ''; document.documentElement.style.overflow = ''; }
  function close(){ if (lb.close) lb.close(); else { lb.removeAttribute('open'); onClose(); } }
  function go(d){ idx = (idx + d + list.length) % list.length; render(); }

  frames.forEach(function(f){ f.addEventListener('click', function(){ if (!$('.media.is-empty', f)) open(f); }); });
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
   SUCCESS STORIES — stacking case files (ported from Page 1)
   Each card pins slightly lower than the last. As the next one rises
   over it, the card beneath scales down and darkens, so the set reads
   as a pile being dealt. Desktop only — on a phone the cards are a
   swipe row instead, and pinning would fight the horizontal scroll.
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
   COACH NUMBERS — count up on view
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
    }, { threshold:.6 });
  });
})();


/* ═══════════════════════════════════════════════════════════════════
   FAQ — smooth open/close + search
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
        a.animate([{ height:h+'px', opacity:1 }, { height:'0px', opacity:0 }], { duration:240, easing:'ease' })
         .onfinish = function(){ d.open = false; };
      } else {
        d.open = true;
        var h2 = a.offsetHeight;
        a.animate([{ height:'0px', opacity:0 }, { height:h2+'px', opacity:1 }], { duration:320, easing:'cubic-bezier(.2,.8,.2,1)' });
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
   AUTO-MOVING SECTIONS — desktop and mobile
   One timer per block. How it moves depends on what the block is:
     · a horizontally scrollable row (every grid on mobile, and the
       testimonial carousel on both) scrolls to the next card
     · a grid that does not scroll (desktop) walks a .focus highlight
       through the cards instead, so the layout is left alone
   Either way it pauses on hover or touch, resumes after a few seconds
   idle, and stops while the block is off screen.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  if (REDUCE) return;

  var BLOCKS = [
    { sel:'.outs',      item:'.out',     ms:4200, label:'Swipe · what you walk out with' },
    { sel:'.stages',    item:'.stage',   ms:4600, label:'Swipe to find your stage' },
    { sel:'.kit',       item:'.kitcard', ms:4000, label:'Swipe through the kit' },
    { sel:'.stack',     item:'.story',   ms:5200, label:'Swipe for more stories', mobileOnly:true },
    { sel:'.contact',   item:'.frame',   ms:3200, label:'Swipe through the room' },
    { sel:'.car-track', item:'.reel',    ms:5600, label:'Swipe for more' },
    { sel:'.plans',     item:'.plan',    ms:3800, label:'' },
    { sel:'#tiers',     item:'.tb',      ms:3600, label:'' }
  ];

  BLOCKS.forEach(function(cfg){
    var row = $(cfg.sel);
    if (!row) return;
    var items = $$(cfg.item, row);
    if (items.length < 2) return;

    /* the stories pile is scroll-driven on desktop — leave it alone there */
    if (cfg.mobileOnly && !MOBILE) return;

    var scrolls = row.scrollWidth > row.clientWidth + 8;
    var current = 0;

    /* ── dots + hint, only for the swipe rows on a phone ── */
    var pips = [];
    if (MOBILE && cfg.label && scrolls){
      var dots = document.createElement('div');
      dots.className = 'mdots';
      dots.setAttribute('aria-hidden','true');
      items.forEach(function(){ dots.appendChild(document.createElement('i')); });
      var hint = document.createElement('span');
      hint.className = 'mswipe';
      hint.textContent = cfg.label;
      row.parentNode.insertBefore(dots, row.nextSibling);
      row.parentNode.insertBefore(hint, dots.nextSibling);
      pips = $$('i', dots);
    }

    /* ── a dwell bar so the movement reads as deliberate ── */
    var bar = document.createElement('div');
    bar.className = 'autobar';
    bar.setAttribute('aria-hidden','true');
    bar.style.setProperty('--dur', cfg.ms + 'ms');
    bar.appendChild(document.createElement('i'));
    (row.parentNode || row).insertBefore(bar, row.nextSibling);

    function paint(i){
      current = i;
      items.forEach(function(el, k){
        el.classList.toggle('focus', k === i);
        /* pricing and seating use their own active class */
        if (el.classList.contains('plan') || el.classList.contains('tb')) el.classList.toggle('is-active', k === i);
      });
      pips.forEach(function(p, k){ p.classList.toggle('on', k === i); });
      if (row.id === 'tiers'){
        var h = $('.house');
        if (h) h.setAttribute('data-focus', items[i].getAttribute('data-tier'));
      }
      /* restart the dwell bar */
      bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
    }

    /* while a scrollable row is dragged, follow the nearest card */
    var raf = null;
    function sync(){
      raf = null;
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, bestD = Infinity;
      items.forEach(function(el, i){
        var d = Math.abs((el.offsetLeft + el.offsetWidth / 2) - mid);
        if (d < bestD){ bestD = d; best = i; }
      });
      if (best !== current) paint(best);
    }
    if (scrolls) row.addEventListener('scroll', function(){ if (!raf) raf = requestAnimationFrame(sync); }, { passive:true });

    function advance(){
      var next = (current + 1) % items.length;
      if (scrolls){
        var el = items[next];
        row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.offsetWidth) / 2, behavior:'smooth' });
        paint(next);
      } else {
        paint(next);
      }
    }

    var timer = null, visible = false, held = false, idle = null;
    function start(){
      if (timer || !visible || held) return;
      bar.classList.remove('hold');
      timer = setInterval(advance, cfg.ms);
      bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
    }
    function stop(){
      if (timer){ clearInterval(timer); timer = null; }
      bar.classList.add('hold');
    }
    function hold(){
      held = true; stop();
      clearTimeout(idle);
      idle = setTimeout(function(){ held = false; start(); }, 6000);
    }

    ['pointerdown','touchstart','wheel'].forEach(function(ev){ row.addEventListener(ev, hold, { passive:true }); });
    row.addEventListener('mouseenter', function(){ held = true; stop(); clearTimeout(idle); });
    row.addEventListener('mouseleave', function(){ held = false; start(); });

    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(e){ visible = e.isIntersecting; if (visible) start(); else stop(); });
      }, { threshold:.3 }).observe(row);
    } else { visible = true; start(); }

    document.addEventListener('visibilitychange', function(){ if (document.hidden) stop(); else start(); });

    paint(0);
  });

  /* AS FEATURED IN — duplicate the logos so the rail loops seamlessly */
  var logos = $('.press-rail .logos');
  if (logos) logos.innerHTML += logos.innerHTML;
})();


/* ═══════════════════════════════════════════════════════════════════
   MOBILE EXTRAS — clamped story copy, coach read-more
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  if (!MOBILE) return;

  $$('.stack .story').forEach(function(card){
    card.addEventListener('click', function(){ card.classList.toggle('open'); });
  });

  var copy = $('.coach-copy');
  if (copy && $$('.coach-copy > p').length > 2){
    copy.classList.add('clamped');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'coach-more';
    btn.textContent = 'Read his story';
    btn.setAttribute('aria-expanded','false');
    copy.insertBefore(btn, $('.journey', copy) || null);
    btn.addEventListener('click', function(){
      var open = copy.classList.toggle('clamped') === false;
      btn.textContent = open ? 'Show less' : 'Read his story';
      btn.setAttribute('aria-expanded', String(open));
    });
  }
})();


/* ═══════════════════════════════════════════════════════════════════
   FINAL — marquee, sticky bar, progress line, media parallax
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  $$('[data-marquee]').forEach(function(m){ m.innerHTML += m.innerHTML; });

  var line = $('.progress'), bar = $('#stickybar'), hero = $('#hero'), btn = bar && $('.btn', bar);
  var near = {};
  if ('IntersectionObserver' in window){
    ['pricing','final'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function(es){
        es.forEach(function(e){ near[id] = e.isIntersecting; });
        run();
      }, { threshold:.15 }).observe(el);
    });
  }
  function run(){
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (line) line.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    if (bar){
      var show = window.scrollY > (hero ? hero.offsetHeight * .75 : 400) && !near.pricing && !near.final;
      bar.classList.toggle('on', show);
      bar.setAttribute('aria-hidden', String(!show));
      if (btn) btn.tabIndex = show ? 0 : -1;
    }
  }
  onScroll(run);

  /* gentle parallax on photos, only for the ones on screen */
  if (!REDUCE){
    var slots = $$('.media > img, .media > video'), live = [];
    if (slots.length){
      if ('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(es){
          es.forEach(function(e){
            var i = live.indexOf(e.target);
            if (e.isIntersecting && i === -1) live.push(e.target);
            else if (!e.isIntersecting && i !== -1) live.splice(i, 1);
          });
        }, { rootMargin:'12% 0px' });
        slots.forEach(function(el){ io.observe(el); });
      } else live = slots;

      onScroll(function(){
        var vh = window.innerHeight;
        live.forEach(function(el){
          var r = el.getBoundingClientRect();
          var p = ((r.top + r.height/2) - vh/2) / vh;
          el.style.setProperty('--py', (clamp(p,-1,1) * -14).toFixed(1) + 'px');
        });
      });
    }
  }
})();

runScroll();





(() => {
  const grid = document.getElementById(
    "edition-gallery-grid"
  );

  if (!grid) return;

  const galleryImages = [
    {
      src: "image&video/g1.webp",
      layout: "hero",
      position: "center 100%",
      alt: "Edition 1 group photo"
    },
    {
      src: "image&video/t1.webp",
      layout: "tile",
      position: "center 25%",
      alt: "Coach at Edition 1"
    },
    {
      src: "image&video/t2.webp",
      layout: "tile",
      position: "center 35%",
      alt: "Menu psychology session"
    },
    {
      src: "image&video/t3.webp",
      layout: "tile",
      position: "center 25%",
      alt: "Coach teaching attendees"
    },
    {
      src: "image&video/t4.webp",
      layout: "tile",
      position: "center 50%",
      alt: "Attendees inside the session"
    },
    {
      src: "image&video/s.webp",
      layout: "wide",
      position: "center 50%",
      alt: "Edition 1 event moments"
    }
  ];

  galleryImages.forEach((photo) => {
    const item = document.createElement("div");

    item.className =
      `edition-gallery__item edition-gallery__item--${photo.layout}`;

    const img = document.createElement("img");

    img.alt = photo.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.style.objectPosition = photo.position;

    img.addEventListener("load", () => {
      img.classList.add("is-loaded");
    });

    img.addEventListener("error", () => {
      item.classList.add("image-error");
    });

    img.src = photo.src;

    item.appendChild(img);
    grid.appendChild(item);
  });
})();
