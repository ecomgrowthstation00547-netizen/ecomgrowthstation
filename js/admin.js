/* Ecom Growth Station - admin dashboard (Supabase Auth + RLS) */
(function () {
  'use strict';
  var CFG = window.EGS_CONFIG || {};
  function $(id) { return document.getElementById(id); }

  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY || !window.supabase) {
    $('notConfigured').hidden = false;
    return;
  }
  var sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  var modal = new bootstrap.Modal($('detailModal'));
  var all = [], current = null;

  var TYPES = { hire: 'Hire us', contact: 'Contact', academy: 'Academy', join: 'Join the team' };
  var STATUSES = ['new', 'contacted', 'closed'];
  var LABELS = { name: 'Name', email: 'Email', whatsapp: 'WhatsApp', business: 'Business', service: 'Service', track: 'Track', platform: 'Marketplace', stage: 'Stage', store: 'Store link', level: 'Experience level', experience: 'Experience', city: 'City / country', profile: 'CV / profile', message: 'Message' };

  function fmt(d) { return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function show(view) {
    $('loginView').hidden = view !== 'login';
    $('dashView').hidden = view !== 'dash';
    $('logoutBtn').hidden = view !== 'dash';
    if (view !== 'dash') $('adminUser').textContent = '';
  }

  /* ---------- Auth ---------- */
  $('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('lEmail').value.trim(), pass = $('lPass').value;
    var st = $('loginStatus');
    if (!email || !pass) { st.textContent = 'Enter your email and password.'; return; }
    $('loginBtn').disabled = true; st.textContent = 'Signing in...';
    sb.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
      $('loginBtn').disabled = false;
      if (res.error) { st.textContent = 'Invalid email or password.'; return; }
      $('lPass').value = '';
      st.textContent = '';
      enter(res.data.user);
    });
  });
  $('logoutBtn').addEventListener('click', function () { sb.auth.signOut(); });
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT') { all = []; show('login'); } });

  function enter(user) {
    return sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle().then(function (res) {
      if (res.error || !res.data) {
        $('loginStatus').textContent = 'This account does not have admin access.';
        return sb.auth.signOut();
      }
      $('adminUser').textContent = user.email;
      show('dash');
      load();
    });
  }

  /* ---------- Data ---------- */
  function load() {
    $('listStatus').textContent = 'Loading...';
    sb.from('submissions').select('*').order('created_at', { ascending: false }).limit(1000).then(function (res) {
      if (res.error) { $('listStatus').textContent = 'Could not load enquiries: ' + res.error.message; return; }
      all = res.data || [];
      render();
    });
  }

  function filtered() {
    var q = $('search').value.trim().toLowerCase(), t = $('fType').value, s = $('fStatus').value;
    return all.filter(function (r) {
      if (t && r.form_type !== t) return false;
      if (s && r.status !== s) return false;
      if (q) {
        var hay = [r.name, r.email, r.whatsapp, r.service, r.message].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function render() {
    var week = Date.now() - 7 * 864e5;
    $('stTotal').textContent = all.length;
    $('stNew').textContent = all.filter(function (r) { return r.status === 'new'; }).length;
    $('stWeek').textContent = all.filter(function (r) { return new Date(r.created_at).getTime() > week; }).length;
    $('stDone').textContent = all.filter(function (r) { return r.status === 'closed'; }).length;

    var rows = filtered(), body = $('rows');
    body.textContent = '';
    rows.forEach(function (r) {
      var tr = el('tr', r.status === 'new' ? 'row-new' : '');
      tr.appendChild(el('td', '', fmt(r.created_at)));
      tr.appendChild(el('td', '', TYPES[r.form_type] || r.form_type));
      tr.appendChild(el('td', '', r.name));
      var c = el('td', '', r.email); c.appendChild(el('span', 'sub', r.whatsapp || '')); tr.appendChild(c);
      tr.appendChild(el('td', '', r.service || '-'));
      var st = el('td'); var sv = STATUSES.indexOf(r.status) > -1 ? r.status : 'new';
      st.appendChild(el('span', 'pill ' + sv, sv)); tr.appendChild(st);
      tr.appendChild(el('td', '', 'View'));
      tr.addEventListener('click', function () { openDetail(r.id); });
      body.appendChild(tr);
    });
    $('listStatus').textContent = all.length ? 'Showing ' + rows.length + ' of ' + all.length + ' enquiries.' : 'No enquiries yet. They will appear here as soon as someone submits a form.';
  }

  ['search', 'fType', 'fStatus'].forEach(function (id) { $(id).addEventListener('input', render); });
  $('refreshBtn').addEventListener('click', load);

  /* ---------- Detail ---------- */
  function openDetail(id) {
    current = all.filter(function (r) { return r.id === id; })[0];
    if (!current) return;
    $('dType').textContent = TYPES[current.form_type] || current.form_type;
    $('dName').textContent = current.name;
    var dl = $('dList'); dl.textContent = '';
    function add(k, v) { if (!v) return; dl.appendChild(el('dt', '', k)); dl.appendChild(el('dd', '', v)); }
    add('Received', fmt(current.created_at));
    var d = current.details || {};
    Object.keys(d).forEach(function (k) { add(LABELS[k] || k, String(d[k])); });
    $('dStatus').value = STATUSES.indexOf(current.status) > -1 ? current.status : 'new';
    $('dNotes').value = current.notes || '';
    $('dMail').href = 'mailto:' + current.email + '?subject=' + encodeURIComponent('Re: your enquiry to Ecom Growth Station');
    var digits = String(current.whatsapp || '').replace(/\D/g, '');
    if (digits.charAt(0) === '0') digits = '92' + digits.slice(1);
    $('dWa').hidden = !digits;
    $('dWa').href = digits ? 'https://wa.me/' + digits : '#';
    modal.show();
  }

  $('dSave').addEventListener('click', function () {
    if (!current) return;
    var patch = { status: $('dStatus').value, notes: $('dNotes').value.trim() || null };
    $('dSave').disabled = true;
    sb.from('submissions').update(patch).eq('id', current.id).then(function (res) {
      $('dSave').disabled = false;
      if (res.error) { alert('Could not save: ' + res.error.message); return; }
      current.status = patch.status; current.notes = patch.notes;
      render(); modal.hide();
    });
  });

  $('dDelete').addEventListener('click', function () {
    if (!current || !confirm('Delete this enquiry permanently?')) return;
    sb.from('submissions').delete().eq('id', current.id).then(function (res) {
      if (res.error) { alert('Could not delete: ' + res.error.message); return; }
      all = all.filter(function (r) { return r.id !== current.id; });
      render(); modal.hide();
    });
  });

  /* ---------- CSV export ---------- */
  function cell(v) {
    v = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; // block spreadsheet formula injection
    return '"' + v.replace(/"/g, '""') + '"';
  }
  $('csvBtn').addEventListener('click', function () {
    var cols = ['created_at', 'form_type', 'name', 'email', 'whatsapp', 'service', 'message', 'status', 'notes'];
    var lines = [cols.join(',')].concat(filtered().map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(','); }));
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = 'enquiries-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Start ---------- */
  sb.auth.getSession().then(function (res) {
    if (res.data && res.data.session) enter(res.data.session.user); else show('login');
  });
})();
