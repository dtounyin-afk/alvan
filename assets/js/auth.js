// ============================================================
// ModaAfrik Cameroun — Auth (Clients uniquement en public)
// Vendeurs : créés par le super admin uniquement
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn()) {
    const redirect = new URLSearchParams(location.search).get('redirect');
    const u = Auth.user();
    if (redirect) { location.href = redirect; return; }
    if (u?.role === 'admin')  { location.href = 'admin.html'; return; }
    if (u?.role === 'vendor') { location.href = 'vendor-dashboard.html'; return; }
    location.href = 'index.html';
  }
});

/* ── CONNEXION ── */
async function doLogin() {
  const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
  const pwd   = document.getElementById('loginPwd')?.value;
  if (!email) { showToast('Email requis', 'error'); return; }
  if (!pwd)   { showToast('Mot de passe requis', 'error'); return; }

  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span style="opacity:.7">Connexion…</span>'; }

  // 1. Essayer l'API backend
  try {
    const res = await Api.auth.login({ email, password: pwd });
    Auth.save(res.token, res.user);
    handleRedirect(res.user);
    return;
  } catch {}

  // 2. Vérifier dans le localStorage (admin + vendeurs approuvés + clients inscrits)
  const localUser = findLocalUser(email, pwd);
  if (localUser) {
    Auth.save('local_token_' + Date.now(), localUser);
    showToast(`Bienvenue ${localUser.firstName} !`, 'success');
    setTimeout(() => handleRedirect(localUser), 600);
    return;
  }

  showToast('Email ou mot de passe incorrect', 'error');
  if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Se connecter'; }
}

function findLocalUser(email, pwd) {
  // Admin hardcodé (en production: hash côté serveur)
  if (email === 'admin@modaafrik.cm' && pwd === 'ModaAfrik@Admin2025!') {
    return { id:'admin-0', firstName:'Admin', lastName:'ModaAfrik', email:'admin@modaafrik.cm', role:'admin' };
  }
  // Vendeurs approuvés (password stocké encodé)
  const vendors = LocalStore.getApprovedVendors();
  const vendor  = vendors.find(v => v.email === email);
  if (vendor && vendor.passwordHash && atob(vendor.passwordHash) === pwd) {
    return { id:vendor.id, firstName:vendor.firstName, lastName:vendor.lastName,
      email:vendor.email, phone:vendor.phone, role:'vendor',
      storeName:vendor.storeName, storeCity:vendor.storeCity };
  }
  // Clients inscrits
  const users  = JSON.parse(localStorage.getItem('ma_users') || '[]');
  const user   = users.find(u => u.email === email && u.role === 'client');
  if (user && user.passwordHash && atob(user.passwordHash) === pwd) {
    return { id:user.id, firstName:user.firstName, lastName:user.lastName,
      email:user.email, phone:user.phone, role:'client' };
  }
  return null;
}

function handleRedirect(user) {
  const redirect = new URLSearchParams(location.search).get('redirect');
  if (redirect) { location.href = redirect; return; }
  if (user.role === 'admin')  { location.href = 'admin.html'; return; }
  if (user.role === 'vendor') { location.href = 'vendor-dashboard.html'; return; }
  location.href = 'index.html';
}

/* ── INSCRIPTION CLIENT UNIQUEMENT ── */
async function doRegister() {
  const fn  = document.getElementById('regFN')?.value.trim();
  const ln  = document.getElementById('regLN')?.value.trim();
  const em  = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const ph  = document.getElementById('regPhone')?.value.trim();
  const pw  = document.getElementById('regPwd')?.value;
  const pwc = document.getElementById('regPwdConfirm')?.value;
  const cgv = document.getElementById('regCGV')?.checked;

  if (!fn || !ln) { showToast('Prénom et nom requis', 'error'); return; }
  if (!em || !em.includes('@')) { showToast('Email valide requis', 'error'); return; }
  if (!ph.startsWith('+237'))   { showToast('Numéro camerounais requis (+237 6XX XXX XXX)', 'error'); return; }
  if (pw.length < 8)            { showToast('Mot de passe minimum 8 caractères', 'error'); return; }
  if (pw !== pwc)               { showToast('Les mots de passe ne correspondent pas', 'error'); return; }
  if (!cgv)                     { showToast('Acceptez les conditions générales', 'error'); return; }

  // Vérifier que l'email n'est pas déjà utilisé
  const users = JSON.parse(localStorage.getItem('ma_users') || '[]');
  if (users.find(u => u.email === em)) {
    showToast('Cet email est déjà utilisé', 'error'); return;
  }

  // Essayer l'API
  try {
    const res = await Api.auth.register({ firstName:fn, lastName:ln, email:em, phone:ph, password:pw });
    Auth.save(res.token, res.user);
    showToast('Compte créé ! Bienvenue sur ModaAfrik 🎉', 'success');
    setTimeout(() => location.href = 'index.html', 700);
    return;
  } catch {}

  // Créer en local
  const newUser = {
    id:           'usr-' + Date.now(),
    firstName:    fn, lastName: ln,
    email:        em, phone: ph,
    role:         'client',
    passwordHash: btoa(pw),
    createdAt:    new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('ma_users', JSON.stringify(users));
  const safeUser = { id:newUser.id, firstName:fn, lastName:ln, email:em, phone:ph, role:'client' };
  Auth.save('local_' + Date.now(), safeUser);
  showToast('Compte créé ! Bienvenue sur ModaAfrik 🎉', 'success');
  setTimeout(() => location.href = 'index.html', 700);
}

/* ── HELPERS ── */
function togglePwd(id) {
  const el = document.getElementById(id);
  if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

function checkPwdStrength(inp) {
  const v   = inp.value;
  const bar = document.getElementById('pwStrength');
  const lbl = document.getElementById('pwLabel');
  let s = 0;
  if (v.length >= 8)          s++;
  if (/[A-Z]/.test(v))        s++;
  if (/[0-9]/.test(v))        s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const levels = [
    {cls:'pw-weak',   w:'25%', txt:'Trop faible'},
    {cls:'pw-weak',   w:'40%', txt:'Faible'},
    {cls:'pw-medium', w:'65%', txt:'Moyen'},
    {cls:'pw-medium', w:'80%', txt:'Bon'},
    {cls:'pw-strong', w:'100%',txt:'Excellent — ✓'},
  ];
  const lvl = levels[s] || levels[0];
  if (bar) { bar.className = `pw-bar ${v.length ? lvl.cls : ''}`; bar.style.width = v.length ? lvl.w : '0'; }
  if (lbl) lbl.textContent = v.length ? lvl.txt : '';
}
