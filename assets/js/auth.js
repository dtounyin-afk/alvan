// ============================================================
// ModaAfrik Cameroun — Auth
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn()) {
    const redirect = new URLSearchParams(location.search).get('redirect');
    const u = Auth.user();
    if (redirect) { location.href = decodeURIComponent(redirect); return; }
    if (u?.role === 'admin')  { location.href = 'admin.html'; return; }
    if (u?.role === 'vendor') { location.href = 'vendor-dashboard.html'; return; }
    location.href = 'index.html';
  }
});

/* ── CONNEXION ── */
async function doLogin() {
  const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
  const pwd   = document.getElementById('loginPwd')?.value;
  if (!email) { showToast('Entrez votre email', 'error'); return; }
  if (!pwd)   { showToast('Entrez votre mot de passe', 'error'); return; }

  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }

  // 1. API backend (si disponible)
  try {
    const res = await Api.auth.login({ email, password: pwd });
    if (res.token && res.user) {
      Auth.save(res.token, res.user);
      showToast('Connexion réussie !', 'success');
      setTimeout(() => handleRedirect(res.user), 400);
      return;
    }
  } catch { /* Backend indisponible — mode local */ }

  // 2. Vérification locale
  const localUser = findLocalUser(email, pwd);
  if (localUser) {
    Auth.save('local_' + Date.now(), localUser);
    showToast('Bienvenue ' + localUser.firstName + ' !', 'success');
    setTimeout(() => handleRedirect(localUser), 400);
    return;
  }

  showToast('Email ou mot de passe incorrect', 'error');
  if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }
}

/* ── RECHERCHE UTILISATEUR LOCAL ── */
function findLocalUser(email, pwd) {
  // Admin hardcodé
  if (email === 'admin@modaafrik.cm' && pwd === 'ModaAfrik@Admin2025!') {
    return { id:'admin-0', firstName:'Admin', lastName:'ModaAfrik', email, role:'admin' };
  }

  // Vendeurs approuvés (mot de passe encodé en base64)
  try {
    const vendors = LocalStore.getApprovedVendors();
    const v = vendors.find(x => x.email === email);
    if (v && v.passwordHash) {
      const stored = safeAtob(v.passwordHash);
      if (stored && stored === pwd) {
        return {
          id: v.id, firstName: v.firstName, lastName: v.lastName,
          email: v.email, phone: v.phone, role: 'vendor',
          storeName: v.storeName, storeCity: v.storeCity,
          storeDesc: v.storeDesc, storeAddress: v.storeAddress,
        };
      }
    }
  } catch {}

  // Clients inscrits
  try {
    const users = JSON.parse(localStorage.getItem('ma_users') || '[]');
    const u = users.find(x => x.email === email);
    if (u && u.passwordHash) {
      const stored = safeAtob(u.passwordHash);
      if (stored && stored === pwd) {
        return { id:u.id, firstName:u.firstName, lastName:u.lastName, email:u.email, phone:u.phone||'', role:'client' };
      }
    }
  } catch {}

  return null;
}

// btoa sécurisé (pas de crash sur chars spéciaux)
function safeAtob(str) {
  try { return atob(str); } catch { return null; }
}
function safeBtoa(str) {
  try { return btoa(unescape(encodeURIComponent(str))); } catch { return btoa(str); }
}

function handleRedirect(user) {
  const redirect = new URLSearchParams(location.search).get('redirect');
  if (redirect) { location.href = decodeURIComponent(redirect); return; }
  if (user.role === 'admin')  { location.href = 'admin.html'; return; }
  if (user.role === 'vendor') { location.href = 'vendor-dashboard.html'; return; }
  location.href = 'index.html';
}

/* ── INSCRIPTION CLIENT ── */
async function doRegister() {
  const fn  = document.getElementById('regFN')?.value.trim();
  const ln  = document.getElementById('regLN')?.value.trim();
  const em  = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const ph  = document.getElementById('regPhone')?.value.trim();
  const pw  = document.getElementById('regPwd')?.value;
  const pwc = document.getElementById('regPwdConfirm')?.value;
  const cgv = document.getElementById('regCGV')?.checked;

  // Validations
  if (!fn || !ln) { showToast('Prénom et nom requis', 'error'); return; }
  if (!em || !em.includes('@')) { showToast('Email valide requis', 'error'); return; }
  if (!ph) { showToast('Numéro de téléphone requis', 'error'); return; }
  if (!pw || pw.length < 6) { showToast('Mot de passe minimum 6 caractères', 'error'); return; }
  if (pwc && pw !== pwc) { showToast('Les mots de passe ne correspondent pas', 'error'); return; }
  if (!cgv) { showToast('Acceptez les conditions générales', 'error'); return; }

  // Normaliser le téléphone
  let phone = ph.replace(/\s/g, '');
  if (!phone.startsWith('+')) {
    if (phone.startsWith('237')) phone = '+' + phone;
    else if (phone.startsWith('6') || phone.startsWith('2')) phone = '+237' + phone;
    else phone = '+237' + phone;
  }

  // Vérifier unicité email
  const users = JSON.parse(localStorage.getItem('ma_users') || '[]');
  if (users.find(u => u.email === em)) {
    showToast('Cet email est déjà utilisé', 'error'); return;
  }

  // 1. API backend
  try {
    const res = await Api.auth.register({ firstName:fn, lastName:ln, email:em, phone, password:pw });
    if (res.token && res.user) {
      Auth.save(res.token, res.user);
      showToast('Compte créé ! Bienvenue sur ModaAfrik 🎉', 'success');
      setTimeout(() => location.href = 'index.html', 600);
      return;
    }
  } catch { /* Backend indisponible — enregistrement local */ }

  // 2. Enregistrement local
  const newUser = {
    id:           'usr-' + Date.now(),
    firstName: fn, lastName: ln, email: em, phone,
    role:         'client',
    passwordHash: safeBtoa(pw),
    createdAt:    new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('ma_users', JSON.stringify(users));

  const safeUser = { id:newUser.id, firstName:fn, lastName:ln, email:em, phone, role:'client' };
  Auth.save('local_' + Date.now(), safeUser);
  showToast('Compte créé ! Bienvenue sur ModaAfrik 🎉', 'success');
  setTimeout(() => location.href = 'index.html', 600);
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
  if (v.length >= 8)           s++;
  if (/[A-Z]/.test(v))         s++;
  if (/[0-9]/.test(v))         s++;
  if (/[^A-Za-z0-9]/.test(v))  s++;
  const levels = [
    { cls:'pw-weak',   w:'25%', txt:'Trop faible' },
    { cls:'pw-weak',   w:'40%', txt:'Faible'       },
    { cls:'pw-medium', w:'65%', txt:'Moyen'        },
    { cls:'pw-medium', w:'80%', txt:'Bon'          },
    { cls:'pw-strong', w:'100%',txt:'Excellent ✓'  },
  ];
  const lvl = levels[Math.min(s, 4)];
  if (bar) { bar.className = 'pw-bar ' + (v.length ? lvl.cls : ''); bar.style.width = v.length ? lvl.w : '0'; }
  if (lbl) lbl.textContent = v.length ? lvl.txt : '';
}

// Aussi corriger la création de vendeur dans admin.js
function safeBtoaExport(str) { return safeBtoa(str); }
window.safeBtoa = safeBtoa;
