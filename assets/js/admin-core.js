// ============================================================
// ModaAfrik — Super Admin CORE (auth + navigation)
// ============================================================
'use strict';

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const u = Auth.user();
  if (!u || u.role !== 'admin') {
    showAdminLogin();
  } else {
    startAdmin();
  }
});

function showAdminLogin() {
  const ov = document.createElement('div');
  ov.id = 'adminOv';
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#f5f0e8;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `
    <div style="background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.15);display:grid;grid-template-columns:1fr 1fr;max-width:760px;width:100%;overflow:hidden">
      <div style="background:linear-gradient(160deg,#111,#2c1810);padding:44px 36px;display:flex;flex-direction:column;justify-content:center;gap:16px">
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px">
          <div style="width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center">
            <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#e8a838"/></svg>
          </div>ModaAfrik
        </div>
        <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;line-height:1.2">Panneau Admin</div>
        <div style="font-size:13px;color:rgba(255,255,255,.5)">Accès réservé à l'administrateur.</div>
      </div>
      <div style="padding:44px 36px">
        <h2 style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#1a1a1a;margin-bottom:20px">Connexion</h2>
        <div id="aErr" style="display:none;background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:10px 14px;font-size:13px;color:#991b1b;margin-bottom:14px">Identifiants incorrects</div>
        <div style="margin-bottom:12px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:5px">Email</label>
          <input id="aEm" type="email" placeholder="admin@modaafrik.cm" style="width:100%;padding:11px 13px;border:1.5px solid #e2dbd0;border-radius:10px;font-size:14px;outline:none;color:#1a1a1a" onkeydown="if(event.key==='Enter')document.getElementById('aPw').focus()"/>
        </div>
        <div style="margin-bottom:18px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:5px">Mot de passe</label>
          <input id="aPw" type="password" placeholder="Mot de passe" style="width:100%;padding:11px 13px;border:1.5px solid #e2dbd0;border-radius:10px;font-size:14px;outline:none;color:#1a1a1a" onkeydown="if(event.key==='Enter')doAdminLogin()"/>
        </div>
        <button onclick="doAdminLogin()" id="aBtn" style="width:100%;padding:12px;border-radius:50px;background:linear-gradient(135deg,#111,#333);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer">Accéder →</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => document.getElementById('aEm')?.focus(), 100);
}

function doAdminLogin() {
  const em  = document.getElementById('aEm')?.value.trim().toLowerCase();
  const pw  = document.getElementById('aPw')?.value;
  const err = document.getElementById('aErr');
  const btn = document.getElementById('aBtn');
  if (!em || !pw) { if(err){err.style.display='block';err.textContent='Remplissez tous les champs.';} return; }
  if (em === 'admin@modaafrik.cm' && pw === 'ModaAfrik@Admin2025!') {
    Auth.save('adm_' + Date.now(), { id:'admin-0', firstName:'Admin', lastName:'ModaAfrik', email:em, role:'admin' });
    document.getElementById('adminOv')?.remove();
    startAdmin();
  } else {
    if (err) { err.style.display='block'; err.textContent='Email ou mot de passe incorrect.'; }
    if (btn) { btn.disabled=true; btn.textContent='Patientez 3s…'; setTimeout(()=>{ btn.disabled=false; btn.textContent='Accéder →'; },3000); }
  }
}

function startAdmin() {
  // Afficher sidebar + main
  document.querySelector('.dash-sidebar') && (document.querySelector('.dash-sidebar').style.display='');
  document.querySelector('.dash-main')    && (document.querySelector('.dash-main').style.display='');
  // Activer overview
  showAdmin('overview', document.querySelector('.sidebar-link'));
  loadAdminData();
}

// ── NAVIGATION ────────────────────────────────────────────────
function showAdmin(id, link) {
  document.querySelectorAll('.admin-sec').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById('asec-' + id);
  if (sec) sec.classList.remove('hidden');
  if (link) link.classList.add('active');
  const titles = { overview:'Vue d\'ensemble', vendors:'Vendeurs', products:'Produits', orders:'Commandes', users:'Utilisateurs', payments:'Paiements', commissions:'Commissions', settings:'Paramètres' };
  const t = document.getElementById('adminTitle');
  if (t) t.textContent = titles[id] || id;
  if (window.innerWidth < 768) document.getElementById('adminSidebar')?.classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}

function toggleSidebar() {
  document.getElementById('adminSidebar')?.classList.toggle('open');
}

// ── DONNÉES ──────────────────────────────────────────────────
const AD = {
  vendors()  { return LocalStore.getApprovedVendors(); },
  pending()  { try { return JSON.parse(localStorage.getItem('ma_vendors_kyc_pending')||'[]'); } catch { return []; } },
  products() { return LocalStore.getApprovedProducts(); },
  pendProds(){ return LocalStore.getPendingProducts(); },
  orders()   { try { return JSON.parse(localStorage.getItem('ma_client_orders')||'[]'); } catch { return []; } },
  users()    { try { return JSON.parse(localStorage.getItem('ma_users')||'[]'); } catch { return []; } },
};

// Helper
function setEl(id, val) { const e=document.getElementById(id); if(e) e.textContent=val; }

// ── CHARGER ───────────────────────────────────────────────────
async function loadAdminData() {
  try {
    const [vr,pr] = await Promise.all([Api.vendors.list(), Api.products.list({limit:200})]);
    if (vr.vendors?.length) LocalStore.saveApprovedVendors(vr.vendors);
    if (pr.products?.length) LocalStore.saveApprovedProducts(pr.products);
  } catch {}

  const vendors  = AD.vendors();
  const pending  = AD.pending();
  const products = AD.products();
  const pProds   = AD.pendProds();
  const orders   = AD.orders();
  const comm     = orders.reduce((s,o)=>s+Math.round((o.subtotal||o.total||0)*0.10),0);

  setEl('aRevTotal',       fmtPrice(comm));
  setEl('aVendors',        vendors.length);
  setEl('aPendingVendors', pending.length + ' dossier(s) KYC');
  setEl('aProducts',       products.length);
  setEl('aOrders',         orders.length);

  const b = document.getElementById('pendingVendorsBadge');
  if (b) { b.textContent=pending.length; b.style.display=pending.length?'flex':'none'; }

  renderChart(orders);
  renderPendingList(pending);
  renderRecentOrders(orders.slice(0,5));
  renderVendorTable(vendors, pending);
  renderProductTable(products, pProds);
  renderOrderTable(orders);
  renderUserTable(AD.users());
  renderPayTable(orders);
  renderCommTable(vendors, orders);
  renderCities();
  renderInvites();
}
