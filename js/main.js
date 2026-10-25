/* Ecom Growth Station */
(function () {
  'use strict';
  var CONTACT_EMAIL = 'your@email.com'; // <- replace with the company email

  document.querySelectorAll('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Day/night theme (remembered across pages) ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var root = document.documentElement;
  function setTheme(theme, save) {
    var isLight = theme === 'light';
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to night view' : 'Switch to day view');
    themeToggle.querySelector('.theme-icon').textContent = isLight ? '☾' : '☼';
    themeToggle.querySelector('.theme-label').textContent = isLight ? 'Night view' : 'Day view';
    if (save) { try { localStorage.setItem('egs-theme', isLight ? 'light' : 'dark'); } catch (e) {} }
  }
  setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark', false);
  themeToggle.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true);
  });

  /* ---------- Hero orb (canvas) ---------- */
  var canvas = document.getElementById('orbCanvas');
  if (canvas) {
  var ctx = canvas.getContext('2d');
  var W, H, dpr, cx, cy, R;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var stars = [];
  var points = [];
  var sparks = [];
  var N = 420;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W * (window.innerWidth < 768 ? 0.5 : parseFloat(canvas.dataset.x || 0.5)); cy = H * parseFloat(canvas.dataset.y || 0.48);
    R = Math.min(W, H) * 0.3;
  }

  function init() {
    stars = [];
    for (var i = 0; i < 140; i++) {
      stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + .2, a: Math.random() * .6 + .1, s: Math.random() * 2 + 1 });
    }
    points = [];
    // Fibonacci sphere
    var ga = Math.PI * (3 - Math.sqrt(5));
    for (var j = 0; j < N; j++) {
      var y = 1 - (j / (N - 1)) * 2;
      var rad = Math.sqrt(1 - y * y);
      var th = ga * j;
      points.push({ x: Math.cos(th) * rad, y: y, z: Math.sin(th) * rad });
    }
    sparks = [];
    for (var k = 0; k < 9; k++) sparks.push(newSpark());
  }

  function newSpark() {
    return { i: Math.floor(Math.random() * N), life: Math.random() * 200, max: 120 + Math.random() * 180 };
  }

  var rot = 0, t = 0;
  function frame() {
    t += 0.016;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    if (!reduce) rot += 0.0035;

    ctx.clearRect(0, 0, W, H);

    // stars
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var tw = st.a * (0.6 + 0.4 * Math.sin(t * st.s + s));
      ctx.fillStyle = 'rgba(160,200,230,' + tw + ')';
      ctx.beginPath();
      ctx.arc(st.x * W + mouse.x * st.r * 6, st.y * H + mouse.y * st.r * 6, st.r, 0, 6.283);
      ctx.fill();
    }

    var ox = cx + mouse.x * 18, oy = cy + mouse.y * 12;
    var pulse = 1 + Math.sin(t * 1.2) * 0.015;
    var r = R * pulse;
    var isLight = root.getAttribute('data-theme') === 'light';

    if (isLight) {
      var lightOffset = r * 0.14;
      var lightBlur = r * 0.32;
      var body = ctx.createLinearGradient(ox - r, oy - r, ox + r, oy + r);
      body.addColorStop(0, '#f3f6fb');
      body.addColorStop(1, '#d5dbe6');

      ctx.save();
      ctx.shadowColor = 'rgba(163,177,198,0.85)';
      ctx.shadowBlur = lightBlur;
      ctx.shadowOffsetX = lightOffset;
      ctx.shadowOffsetY = lightOffset;
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.283); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,1)';
      ctx.shadowBlur = lightBlur;
      ctx.shadowOffsetX = -lightOffset;
      ctx.shadowOffsetY = -lightOffset;
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.283); ctx.fill();
      ctx.restore();

      var inner = ctx.createLinearGradient(ox - r, oy - r, ox + r, oy + r);
      inner.addColorStop(0, '#d5dbe6');
      inner.addColorStop(1, '#f3f6fb');
      ctx.fillStyle = inner;
      ctx.beginPath(); ctx.arc(ox, oy, r * 0.86, 0, 6.283); ctx.fill();
    } else {
      var g = ctx.createRadialGradient(ox, oy, r * 0.8, ox, oy, r * 1.9);
      g.addColorStop(0, 'rgba(20,110,210,0.30)');
      g.addColorStop(0.5, 'rgba(10,60,130,0.10)');
      g.addColorStop(1, 'rgba(2,4,11,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox, oy, r * 1.9, 0, 6.283); ctx.fill();

      var core = ctx.createRadialGradient(ox - r * .25, oy - r * .25, r * .1, ox, oy, r);
      core.addColorStop(0, '#07162e');
      core.addColorStop(1, '#030a18');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.283); ctx.fill();

      ctx.save();
      ctx.shadowColor = 'rgba(30,130,230,0.9)';
      ctx.shadowBlur = 40;
      ctx.strokeStyle = 'rgba(40,140,235,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox, oy, r, 0, 6.283); ctx.stroke();
      ctx.restore();
    }

    // rotate points
    var cosY = Math.cos(rot + mouse.x * 0.4), sinY = Math.sin(rot + mouse.x * 0.4);
    var cosX = Math.cos(0.35 + mouse.y * 0.3), sinX = Math.sin(0.35 + mouse.y * 0.3);
    var proj = new Array(N);
    for (var i = 0; i < N; i++) {
      var p = points[i];
      // wobble gives the surface a living, organic feel
      var wob = 1 + 0.035 * Math.sin(p.x * 4 + t) * Math.cos(p.y * 4 - t * 0.8);
      var x = p.x * wob, y = p.y * wob, z = p.z * wob;
      var x1 = x * cosY + z * sinY;
      var z1 = -x * sinY + z * cosY;
      var y1 = y * cosX - z1 * sinX;
      var z2 = y * sinX + z1 * cosX;
      proj[i] = { x: ox + x1 * r, y: oy + y1 * r, z: z2 };
    }

    // connections on front hemisphere (network of marketplaces / supply lines)
    ctx.lineWidth = 0.8;
    var maxD = r * 0.2;
    for (var a = 0; a < N; a++) {
      var pa = proj[a];
      if (pa.z < -0.1) continue;
      for (var b = a + 1; b < Math.min(a + 14, N); b++) {
        var pb = proj[b];
        if (pb.z < -0.1) continue;
        var dx = pa.x - pb.x, dy = pa.y - pb.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          var al = (1 - d / maxD) * (0.15 + 0.4 * Math.max(pa.z, 0));
          ctx.strokeStyle = (isLight ? 'rgba(80,105,200,' : 'rgba(40,140,235,') + al + ')';
          ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        }
      }
    }

    // dots
    for (var d2 = 0; d2 < N; d2++) {
      var q = proj[d2];
      var depth = (q.z + 1) / 2;
      ctx.fillStyle = (isLight ? 'rgba(70,95,195,' : 'rgba(70,170,255,') + (isLight ? 0.15 + depth * 0.7 : 0.12 + depth * 0.6) + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, 0.8 + depth * 1.6, 0, 6.283); ctx.fill();
    }

    // ember sparks (new orders landing)
    for (var k = 0; k < sparks.length; k++) {
      var sp = sparks[k];
      sp.life++;
      if (sp.life > sp.max) { sparks[k] = newSpark(); sparks[k].life = 0; continue; }
      var pr = proj[sp.i];
      if (pr.z < 0) continue;
      var prog = sp.life / sp.max;
      var alpha = Math.sin(prog * Math.PI);
      ctx.save();
      ctx.shadowColor = 'rgba(255,122,47,' + alpha + ')';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255,140,60,' + alpha + ')';
      ctx.beginPath(); ctx.arc(pr.x, pr.y, 2.4 + alpha * 1.6, 0, 6.283); ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  resize(); init(); frame();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  }

  /* ---------- Nav ---------- */
  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });

  var progress = document.getElementById('scrollProgress');
  function onScroll() {
    var st = window.scrollY;
    nav.classList.toggle('scrolled', st > 60);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll + counters ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = parseInt(el.dataset.count, 10), cur = 0;
    var step = Math.max(1, Math.round(target / 40));
    var timer = setInterval(function () {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = cur;
    }, 30);
  }

  /* ---------- Forms: validate, then open the visitor's mail app ---------- */
  document.querySelectorAll('form[data-subject]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, lines = [], pick = '';
      form.querySelectorAll('[name]').forEach(function (f) {
        f.classList.remove('is-invalid');
        var v = (f.value || '').trim();
        var bad = (f.required && !v) || (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        if (bad) { f.classList.add('is-invalid'); ok = false; }
        if (v) lines.push((f.dataset.label || f.name) + ': ' + v);
        if (f.name === 'service' && v) pick = v;
      });
      if (!ok) { status.textContent = 'Please fill in the highlighted fields.'; return; }
      var subject = form.dataset.subject + (pick ? ' - ' + pick : '');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      status.textContent = 'Thanks! Opening your mail app...';
      form.reset();
    });
  });
})();
