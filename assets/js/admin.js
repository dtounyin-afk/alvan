// ============================================================
// ModaAfrik Cameroun — Super Admin (SÉCURISÉ)
// ============================================================

// ============================================================
// ModaAfrik Cameroun — Super Admin (SÉCURISÉ)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const u = Auth.user();

  if (!u || u.role !== 'admin') {
    // Afficher overlay de connexion (sans effacer le body = les scripts restent chargés)
    showAdminLoginOverlay();
    return;
  }

  initAdminPanel();
});

/* ── OVERLAY DE CONNEXION (ne remplace PAS le body) ── */
function showAdminLoginOverlay() {
  // Masquer le contenu admin
  document.querySelector('.dash-sidebar')  && (document.querySelector('.dash-sidebar').style.display  = 'none');
  document.querySelector('.dash-main')     && (document.querySelector('.dash-main').style.display     = 'none');

  // Créer un overlay par-dessus tout
  const overlay = document.createElement('div');
  overlay.id = 'adminLoginOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);display:grid;grid-template-columns:1fr 1fr;max-width:820px;width:100%">
      <div style="background:linear-gradient(160deg,#1a1a1a,#2c1810);padding:48px 40px;display:flex;flex-direction:column;justify-content:center;gap:20px">
        <div style="font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#fff;display:flex;align-items:center;gap:10px">
          <div style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center">
            <svg width="13" height="13" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#e8a838"/></svg>
          </div>ModaAfrik
        </div>
        <div style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:#fff;line-height:1.2">Panneau d'administration</div>
        <div style="font-size:14px;color:rgba(255,255,255,.5);line-height:1.6">Accès réservé exclusivement au super administrateur.</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.3);margin-top:auto">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Connexion sécurisée
        </div>
      </div>
      <div style="padding:48px 40px">
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#1a1a1a;margin-bottom:8px">Connexion Admin</h2>
        <p style="font-size:13px;color:#999;margin-bottom:24px">Identifiants administrateur requis</p>
        <div id="aLoginErr" style="display:none;background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:10px 14px;font-size:13px;color:#991b1b;margin-bottom:16px">Email ou mot de passe incorrect</div>
        <div style="margin-bottom:14px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:6px">Email</label>
          <input id="aEmail" type="email" placeholder="admin@modaafrik.cm" autocomplete="username"
            style="width:100%;padding:12px 14px;border:1.5px solid #e2dbd0;border-radius:12px;font-size:14px;outline:none;background:#fff;color:#1a1a1a"
            onkeydown="if(event.key==='Enter')document.getElementById('aPwd').focus()"/>
        </div>
        <div style="margin-bottom:20px">
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:6px">Mot de passe</label>
          <input id="aPwd" type="password" placeholder="Mot de passe admin" autocomplete="current-password"
            style="width:100%;padding:12px 14px;border:1.5px solid #e2dbd0;border-radius:12px;font-size:14px;outline:none;background:#fff;color:#1a1a1a"
            onkeydown="if(event.key==='Enter')adminLogin()"/>
        </div>
        <button onclick="adminLogin()" id="aLoginBtn"
          style="width:100%;padding:13px;border-radius:50px;background:linear-gradient(135deg,#1a1a1a,#333);color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer">
          Se connecter →
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Focus auto sur l'email
  setTimeout(() => document.getElementById('aEmail')?.focus(), 100);
}

function adminLogin() {
  const email = document.getElementById('aEmail')?.value.trim().toLowerCase();
  const pwd   = document.getElementById('aPwd')?.value;
  const err   = document.getElementById('aLoginErr');
  const btn   = document.getElementById('aLoginBtn');

  if (!email || !pwd) { if(err){err.textContent='Remplissez tous les champs';err.style.display='block';} return; }

  if (email === 'admin@modaafrik.cm' && pwd === 'ModaAfrik@Admin2025!') {
    const adminUser = { id:'admin-0', firstName:'Admin', lastName:'ModaAfrik', email, role:'admin' };
    Auth.save('admin_' + Date.now(), adminUser);
    // Enlever overlay et afficher le panel
    document.getElementById('adminLoginOverlay')?.remove();
    document.querySelector('.dash-sidebar') && (document.querySelector('.dash-sidebar').style.display = '');
    document.querySelector('.dash-main')    && (document.querySelector('.dash-main').style.display    = '');
    initAdminPanel();
  } else {
    if (err) { err.textContent='Email ou mot de passe incorrect'; err.style.display='block'; }
    if (btn) {
      btn.disabled    = true;
      btn.textContent = 'Réessayez dans 3 secondes…';
      setTimeout(() => { btn.disabled=false; btn.textContent='Se connecter →'; }, 3000);
    }
  }
}

/* ── INITIALISATION PANEL ADMIN ── */
function initAdminPanel() {
  // Activer le premier lien de la sidebar
  const firstLink = document.querySelector('.sidebar-link');
  if (firstLink) firstLink.classList.add('active');
  // Afficher la section overview
  document.getElementById('asec-overview')?.classList.remove('hidden');
  loadAdminData();
}

// ── Données admin ──────────────────────────────────────────
function getAllVendors()    { return LocalStore.getApprovedVendors(); }
function getPendingVendors(){ try { return JSON.parse(localStorage.getItem('ma_vendors_kyc_pending')||'[]'); } catch { return []; } }
function getAllProducts()   { return LocalStore.getApprovedProducts(); }
function getPendingProducts(){ return LocalStore.getPendingProducts(); }
function getAllOrders()     { try { return JSON.parse(localStorage.getItem('ma_client_orders')||'[]'); } catch { return []; } }
function getAllUsers()      { try { return JSON.parse(localStorage.getItem('ma_users')||'[]'); } catch { return []; } }

/* ── NAVIGATION ── */
function showAdmin(id, link) {
  // Masquer toutes les sections admin
  document.querySelectorAll('.admin-sec').forEach(s => s.classList.add('hidden'));
  // Désactiver tous les liens
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  // Afficher la section demandée
  const sec = document.getElementById('asec-' + id);
  if (sec) sec.classList.remove('hidden');
  // Activer le lien
  if (link) link.classList.add('active');
  // Titre topbar
  const titles = {
    overview:    'Vue d\'ensemble',
    vendors:     'Gestion vendeurs',
    products:    'Gestion produits',
    orders:      'Toutes les commandes',
    users:       'Utilisateurs',
    payments:    'Paiements & Transactions',
    commissions: 'Commissions',
    settings:    'Paramètres du site',
  };
  const titleEl = document.getElementById('adminTitle');
  if (titleEl) titleEl.textContent = titles[id] || id;
  // Fermer sidebar sur mobile
  if (window.innerWidth < 768) {
    document.getElementById('adminSidebar')?.classList.remove('open');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  document.getElementById('adminSidebar')?.classList.toggle('open');
}

// ── CHARGER DONNÉES ──────────────────────────────────────────
async function loadAdminData() {
  // Essayer de charger depuis l'API backend
  try {
    const [vr, pr] = await Promise.all([Api.vendors.list(), Api.products.list({limit:200})]);
    if (vr.vendors?.length) LocalStore.saveApprovedVendors(vr.vendors);
    if (pr.products?.length) LocalStore.saveApprovedProducts(pr.products);
  } catch { /* Backend indisponible : utiliser LocalStore */ }

  const vendors        = getAllVendors();
  const pendingVendors = getPendingVendors();
  const products       = getAllProducts();
  const pendingProds   = getPendingProducts();
  const orders         = getAllOrders();
  const commTotal      = orders.reduce((s,o) => s + (o.commission || Math.round((o.subtotal||o.total||0)*0.10)), 0);

  setEl('aRevTotal',       fmtPrice(commTotal));
  setEl('aVendors',        vendors.length);
  setEl('aPendingVendors', `${pendingVendors.length} dossier(s) KYC en attente`);
  setEl('aProducts',       products.length);
  setEl('aOrders',         orders.length);

  const badge = document.getElementById('pendingVendorsBadge');
  if (badge) { badge.textContent = pendingVendors.length; badge.style.display = pendingVendors.length ? 'flex' : 'none'; }

  renderAdminChart(orders);
  renderPendingVendors(pendingVendors);
  renderAdminRecentOrders(orders.slice(0,6));
  renderVendorsTable(vendors, pendingVendors);
  renderProductsTable(products, pendingProds);
  renderOrdersTable(orders);
  renderUsersTable(getAllUsers());
  renderPaymentsTable(orders);
  renderCommTable(vendors, orders);
  renderCitiesAdmin();
  renderInvitations();
}

// ── GRAPHIQUE COMMISSIONS ────────────────────────────────────
function renderAdminChart(orders) {
  const wrap = document.getElementById('adminChart');
  if (!wrap) return;
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul'];
  const values = orders.length
    ? months.map((_,i) => orders.filter(o => new Date(o.createdAt).getMonth() === i).reduce((s,o)=>s+(o.commission||0),0))
    : [0,0,0,0,0,0,0];
  const max = Math.max(...values, 1);
  wrap.innerHTML = values.map((v,i) => `
  <div class="admin-comm-bar" style="height:${Math.max(4, Math.round(v/max*140))}px">
    <div class="bar-tip">${fmtPrice(v)}</div>
    <div class="bar-label">${months[i]}</div>
  </div>`).join('');
}

// ── VENDEURS EN ATTENTE KYC ──────────────────────────────────
function renderPendingVendors(pending) {
  const list = document.getElementById('pendingVendorsList');
  if (!list) return;
  if (!pending.length) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-3);padding:20px;font-size:14px">Aucun dossier KYC en attente</p>';
    return;
  }
  list.innerHTML = pending.slice(0,4).map(v => `
  <div class="pending-vendor-row">
    <div class="pv-av">${v.firstName?.[0]||'V'}</div>
    <div class="pv-info">
      <div class="pv-name">${v.storeName}</div>
      <div class="pv-city">${v.firstName} ${v.lastName} · 📍 ${v.storeCity}</div>
      <div class="pv-date">Soumis le ${new Date(v.submittedAt).toLocaleDateString('fr-FR')}</div>
    </div>
    <div class="pv-actions">
      <button class="btn-outline btn-sm" onclick="viewKYC('${v.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        KYC
      </button>
      <button class="btn-primary btn-sm" onclick="approveVendorKYC('${v.id}')">Approuver</button>
    </div>
  </div>`).join('');
}

// ── TABLE VENDEURS ───────────────────────────────────────────
let allVendorsData = [];
function renderVendorsTable(vendors, pending=[]) {
  allVendorsData = [...vendors, ...pending.map(p => ({...p, _isPending:true}))];
  const tb = document.getElementById('vendorsAdminTable');
  if (!tb) return;

  if (!vendors.length && !pending.length) {
    tb.innerHTML = `<thead><tr><th>Boutique</th><th>Contact</th><th>Ville</th><th>Produits</th><th>Ventes</th><th>Créé le</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody><tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-3)">Aucun vendeur enregistré</td></tr></tbody>`;
    return;
  }

  const allRows = [
    // KYC en attente
    ...pending.map(v => `<tr class="row-pending">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:#fff8e1;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:#92400e;flex-shrink:0">${v.storeName?.[0]||'V'}</div>
          <div>
            <div style="font-weight:700;font-size:13px">${v.storeName}</div>
            <div style="font-size:11px;color:var(--text-3)">${v.firstName} ${v.lastName}</div>
          </div>
        </div>
      </td>
      <td><div style="font-size:12px">${v.email||'—'}</div><div style="font-size:11px;color:var(--text-3)">${v.phone||'—'}</div></td>
      <td style="font-size:13px">📍 ${v.storeCity||'—'}</td>
      <td style="color:var(--text-3);font-size:12px">—</td>
      <td style="color:var(--text-3);font-size:12px">—</td>
      <td style="font-size:11px;color:var(--text-3)">${new Date(v.submittedAt||v.createdAt||Date.now()).toLocaleDateString('fr-FR')}</td>
      <td><span class="sbadge-pending">⏳ KYC en attente</span></td>
      <td>
        <div class="td-actions">
          <button class="btn-outline btn-sm" onclick="viewKYC('${v.id}')">Voir dossier</button>
          <button class="btn-primary btn-sm" onclick="approveVendorKYC('${v.id}')">Approuver</button>
          <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="rejectVendorKYC('${v.id}')">Rejeter</button>
        </div>
      </td>
    </tr>`),

    // Vendeurs approuvés
    ...vendors.map(v => `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:var(--bg);flex-shrink:0">${v.storeName?.[0]||'V'}</div>
          <div>
            <div style="font-weight:700;font-size:13px">${v.storeName}</div>
            <div style="font-size:11px;color:var(--text-3)">${v.firstName||''} ${v.lastName||''}</div>
          </div>
        </div>
      </td>
      <td><div style="font-size:12px">${v.email||'—'}</div><div style="font-size:11px;color:var(--text-3)">${v.phone||'—'}</div></td>
      <td style="font-size:13px">📍 ${v.storeCity||'—'}</td>
      <td style="font-weight:700;font-size:13px">${getAllProducts().filter(p=>p.vendorId===v.id).length}</td>
      <td style="font-weight:700;color:var(--gold);font-size:13px">${fmtPrice(v.totalSales||0)}</td>
      <td style="font-size:11px;color:var(--text-3)">${new Date(v.createdAt||v.approvedAt||Date.now()).toLocaleDateString('fr-FR')}</td>
      <td><span class="sbadge-active">✓ Actif</span>${v.createdBy==='admin'?'<br><span style="font-size:10px;color:var(--text-3)">Créé par admin</span>':''}</td>
      <td>
        <div class="td-actions">
          <button class="btn-outline btn-sm" onclick="viewVendor('${v.id}')">Détails</button>
          <button class="btn-ghost btn-sm" onclick="editVendorAdmin('${v.id}')" title="Modifier">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="suspendVendorAdmin('${v.id}')" title="Suspendre">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </button>
        </div>
      </td>
    </tr>`),
  ].join('');

  tb.innerHTML = `<thead><tr>
    <th>Boutique</th><th>Contact</th><th>Ville</th>
    <th>Produits</th><th>Ventes</th><th>Créé le</th><th>Statut</th><th>Actions</th>
  </tr></thead><tbody>${allRows}</tbody>`;
}

function filterVendorsAdmin(filter, btn) {
  document.querySelectorAll('#asec-vendors .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const vendors = getAllVendors();
  const pending = getPendingVendors();
  if (filter === 'pending')  renderVendorsTable([], pending);
  else if (filter === 'active') renderVendorsTable(vendors, []);
  else renderVendorsTable(vendors, pending);
}

function editVendorAdmin(id) {
  const v = getAllVendors().find(x => x.id === id);
  if (!v) return;
  const newName = prompt('Nouveau nom de boutique :', v.storeName);
  if (newName && newName.trim()) {
    const approved = LocalStore.getApprovedVendors();
    const i = approved.findIndex(x => x.id === id);
    if (i >= 0) {
      approved[i].storeName = newName.trim();
      LocalStore.saveApprovedVendors(approved);
      showToast('Boutique mise à jour', 'success');
      loadAdminData();
    }
  }
}




// ── TABLE COMMANDES ──────────────────────────────────────────
let allOrdersData = [];
function renderOrdersTable(orders) {
  allOrdersData = orders;
  const tb = document.getElementById('ordersAdminTable') || document.getElementById('adminRecentOrders');
  if (!tb) return;
  const statLabel = {pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'};
  const statBadge = (s) => `sbadge-${s==='delivered'?'active':s==='cancelled'?'suspended':'pending'}`;
  const rows = orders.map(o => `<tr>
    <td style="font-weight:700;color:var(--gold)">${o.orderNumber}</td>
    <td>${o.firstName} ${o.lastName}</td>
    <td>${(o.items||[]).map(i=>`${i.qty}× ${i.name}`).join(', ').substring(0,40)}</td>
    <td style="font-weight:700">${fmtPrice(o.total)}</td>
    <td style="color:var(--red);font-weight:700">${fmtPrice(o.commission||0)}</td>
    <td>${{pickup:'Click & Collect',local:'Même ville',interurbain:'Interurbain'}[o.deliveryOption]||o.deliveryOption}</td>
    <td>${payMethodBadge(o.paymentMethod)}</td>
    <td><span class="${statBadge(o.status)}">${statLabel[o.status]||o.status}</span></td>
  </tr>`).join('');
  tb.innerHTML = `<thead><tr><th>N°</th><th>Client</th><th>Articles</th><th>Total</th><th>Commission</th><th>Livraison</th><th>Paiement</th><th>Statut</th></tr></thead><tbody>${rows||'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-3)">Aucune commande</td></tr>'}</tbody>`;
}

function filterOrdersAdmin(status, btn) {
  document.querySelectorAll('#asec-orders .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const filtered = status === 'all' ? allOrdersData : allOrdersData.filter(o => o.status === status);
  renderOrdersTable(filtered);
}

// ── TABLE ADMIN OVERVIEW ─────────────────────────────────────
function renderAdminRecentOrders(orders) {
  const tb = document.getElementById('adminRecentOrders');
  if (!tb) return;
  const statLabel = {pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée'};
  const rows = orders.map(o => `<tr>
    <td style="font-weight:700;color:var(--gold)">${o.orderNumber}</td>
    <td>${o.firstName} ${o.lastName}</td>
    <td style="font-weight:700">${fmtPrice(o.total)}</td>
    <td style="font-weight:700;color:var(--red)">${fmtPrice(o.commission||0)}</td>
    <td>${payMethodBadge(o.paymentMethod)}</td>
    <td><span class="${o.status==='delivered'?'sbadge-active':'sbadge-pending'}">${statLabel[o.status]||o.status}</span></td>
  </tr>`).join('');
  tb.innerHTML = `<thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Commission</th><th>Paiement</th><th>Statut</th></tr></thead><tbody>${rows}</tbody>`;
}

// ── UTILISATEURS ─────────────────────────────────────────────
function renderUsersTable(users) {
  const tb = document.getElementById('usersAdminTable');
  if (!tb) return;
  const rows = users.map(u => `<tr>
    <td><strong>${u.name}</strong></td>
    <td style="color:var(--text-2)">${u.email}</td>
    <td><span class="${u.role==='admin'?'sbadge-suspended':u.role==='vendor'?'sbadge-pending':'sbadge-active'}" style="font-size:10px">${u.role.toUpperCase()}</span></td>
    <td style="color:var(--text-3)">${u.createdAt}</td>
    <td>${u.orders}</td>
    <td>
      <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="showToast('Utilisateur suspendu','success')">Suspendre</button>
    </td>
  </tr>`).join('');
  tb.innerHTML = `<thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscription</th><th>Commandes</th><th>Action</th></tr></thead><tbody>${rows}</tbody>`;
}

// ── PAIEMENTS ────────────────────────────────────────────────
function renderPaymentsTable(orders) {
  // Stats par méthode
  const om  = orders.filter(o=>o.paymentMethod==='orange_money');
  const mtn = orders.filter(o=>o.paymentMethod==='mtn_momo');
  const card= orders.filter(o=>['cinetpay','fedapay'].includes(o.paymentMethod));
  setEl('omTotal',   `${fmtPrice(om.reduce((s,o)=>s+o.total,0))} (${om.length})`);
  setEl('mtnTotal',  `${fmtPrice(mtn.reduce((s,o)=>s+o.total,0))} (${mtn.length})`);
  setEl('cardTotal', `${fmtPrice(card.reduce((s,o)=>s+o.total,0))} (${card.length})`);

  const tb = document.getElementById('paymentsTable');
  if (!tb) return;
  const rows = orders.map(o => `<tr>
    <td style="font-weight:700;color:var(--gold)">${o.orderNumber}</td>
    <td>${new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
    <td>${o.firstName} ${o.lastName}</td>
    <td style="font-weight:700">${fmtPrice(o.subtotal)}</td>
    <td>${fmtPrice(o.deliveryCost||0)}</td>
    <td style="font-weight:700;color:var(--text)">${fmtPrice(o.total)}</td>
    <td style="font-weight:700;color:var(--red)">${fmtPrice(o.commission||0)}</td>
    <td style="font-weight:700;color:var(--green)">${fmtPrice(o.vendorAmount||0)}</td>
    <td>${payMethodBadge(o.paymentMethod)}</td>
    <td><span class="${o.status==='delivered'?'sbadge-active':'sbadge-pending'}">${o.status}</span></td>
  </tr>`).join('');
  tb.innerHTML = `<thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Sous-total</th><th>Livraison</th><th>Total</th><th>Commission</th><th>Vendeur</th><th>Méthode</th><th>Statut</th></tr></thead><tbody>${rows}</tbody>`;
}

// ── COMMISSIONS ──────────────────────────────────────────────
function renderCommTable(vendors, orders) {
  const tb = document.getElementById('commTable');
  if (!tb) return;
  const rows = vendors.map(v => {
    const vOrders = orders.filter(o => o.items?.some(i => i.vendorId === v.id));
    const vSales  = vOrders.reduce((s,o) => s + o.subtotal, 0);
    const vComm   = Math.round(vSales * 0.10);
    return `<tr>
      <td><strong>${v.storeName}</strong></td>
      <td>📍 ${v.storeCity}</td>
      <td>${fmtPrice(vSales)}</td>
      <td style="font-weight:700;color:var(--red)">${fmtPrice(vComm)}</td>
      <td style="font-weight:700;color:var(--green)">${fmtPrice(vSales - vComm)}</td>
      <td><input type="number" value="10" min="5" max="30" style="width:60px;padding:4px 8px;border:1.5px solid var(--border);border-radius:6px;background:var(--surface);text-align:center;font-size:13px;font-weight:700;outline:none;" onchange="showToast('Taux mis à jour pour ${v.storeName}','success')"/>%</td>
    </tr>`;
  }).join('');
  tb.innerHTML = `<thead><tr><th>Vendeur</th><th>Ville</th><th>Ventes</th><th>Commission (10%)</th><th>Net vendeur</th><th>Taux perso</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-3)">Aucun vendeur</td></tr>'}</tbody>`;
}

function saveCommRate() {
  const rate = document.getElementById('commRate')?.value;
  showToast(`Taux de commission global mis à jour : ${rate}%`, 'success');
}

// ── VILLES DE LIVRAISON ──────────────────────────────────────
function renderCitiesAdmin() {
  const wrap = document.getElementById('citiesAdmin');
  if (!wrap || !window.CAMEROON_CITIES) return;
  wrap.innerHTML = Object.entries(CAMEROON_CITIES).map(([k,v]) => `
  <div class="city-row">
    <span class="city-name">📍 ${v.label}</span>
    <div class="city-price">
      <input type="number" value="${v.price}" onchange="CAMEROON_CITIES['${k}'].price=Number(this.value);showToast('Tarif ${v.label} mis à jour','success')"/>
    </div>
    <span style="font-size:12px;color:var(--text-3)">FCFA</span>
  </div>`).join('');
}

function addCity() { showToast('Fonctionnalité d\'ajout de ville bientôt disponible', 'default'); }

// ── ACTIONS KYC VENDEURS ─────────────────────────────────────
function viewKYC(id) {
  const pending = getPendingVendors();
  const v = pending.find(x => x.id === id);
  if (!v) return;
  const modal = document.getElementById('vendorModal');
  const title = document.getElementById('vendorModalTitle');
  const body  = document.getElementById('vendorModalBody');
  const action= document.getElementById('vendorModalAction');

  if (title) title.textContent = `Dossier KYC — ${v.storeName}`;
  if (body) body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:16px">
      <div><strong>Nom complet :</strong> ${v.firstName} ${v.lastName}</div>
      <div><strong>Email :</strong> ${v.email}</div>
      <div><strong>Téléphone :</strong> ${v.phone}</div>
      <div><strong>N° CNI :</strong> ${v.cniNumber}</div>
      <div><strong>Date naissance :</strong> ${v.dateOfBirth}</div>
      <div><strong>Ville boutique :</strong> ${v.storeCity}</div>
      <div style="grid-column:1/-1"><strong>Description :</strong> ${v.storeDesc||'—'}</div>
    </div>
    <div style="background:var(--bg-2);border-radius:var(--r-md);padding:12px;font-size:13px">
      <div style="font-weight:700;margin-bottom:8px">Documents KYC reçus :</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:8px;background:${v.kyc?.cniRecto?'#ecfdf5':'#fef2f2'};border-radius:6px;font-size:12px">
          ${v.kyc?.cniRecto ? '✅' : '❌'} CNI Recto
        </div>
        <div style="padding:8px;background:${v.kyc?.cniVerso?'#ecfdf5':'#fef2f2'};border-radius:6px;font-size:12px">
          ${v.kyc?.cniVerso ? '✅' : '❌'} CNI Verso
        </div>
        <div style="padding:8px;background:${v.kyc?.selfie?'#ecfdf5':'#fef2f2'};border-radius:6px;font-size:12px">
          ${v.kyc?.selfie ? '✅' : '❌'} Selfie en direct
        </div>
        <div style="padding:8px;background:${v.kyc?.selfiecni?'#ecfdf5':'#fef2f2'};border-radius:6px;font-size:12px">
          ${v.kyc?.selfiecni ? '✅' : '❌'} Selfie + CNI
        </div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-3)">Capturé le : ${new Date(v.kyc?.capturedAt||v.submittedAt).toLocaleString('fr-FR')}</div>
    </div>`;

  if (action) {
    action.textContent = 'Approuver le dossier';
    action.className   = 'btn-primary';
    action.onclick     = () => { closeVendorModal(); approveVendorKYC(id); };
  }

  // Ajouter bouton "Rejeter"
  const existingReject = document.getElementById('modalRejectBtn');
  if (existingReject) existingReject.remove();
  const rejectBtn = document.createElement('button');
  rejectBtn.id        = 'modalRejectBtn';
  rejectBtn.className = 'btn-outline';
  rejectBtn.textContent = 'Rejeter';
  rejectBtn.style.color = 'var(--red)';
  rejectBtn.style.borderColor = 'var(--red)';
  rejectBtn.onclick   = () => { closeVendorModal(); rejectVendorKYC(id); };
  action?.parentElement?.insertBefore(rejectBtn, action);

  modal?.classList.remove('hidden');
}

async function approveVendorKYC(id) {
  const pending = getPendingVendors();
  const v = pending.find(x => x.id === id);
  if (!v) { showToast('Dossier introuvable', 'error'); return; }

  const approvedVendor = {
    ...v, status:'approved', isActive:true,
    approvedAt: new Date().toISOString(),
    productCount: 0, totalSales: 0, rating: 0,
  };

  // Publier via API
  try {
    await Api.post('/auth/register-vendor', {
      firstName:v.firstName, lastName:v.lastName, email:v.email,
      phone:v.phone, password: (() => { try { return decodeURIComponent(escape(atob(v.passwordHash||''))); } catch { return atob(v.passwordHash||btoa('TempPass2025!')); } })(),
      storeName:v.storeName, storeCity:v.storeCity,
      storeDesc:v.storeDesc, storeCategory:v.storeCategory,
    });
  } catch {}

  // LocalStore
  LocalStore.saveApprovedVendors([...LocalStore.getApprovedVendors(), approvedVendor]);
  const remaining = pending.filter(x => x.id !== id);
  localStorage.setItem('ma_vendors_kyc_pending', JSON.stringify(remaining));

  // ma_users
  const users = JSON.parse(localStorage.getItem('ma_users')||'[]');
  users.push({ id:v.id, firstName:v.firstName, lastName:v.lastName, email:v.email, phone:v.phone, role:'vendor', storeName:v.storeName, storeCity:v.storeCity, createdAt:new Date().toISOString() });
  localStorage.setItem('ma_users', JSON.stringify(users));

  showToast(`✅ ${v.storeName} approuvé ! Le vendeur peut se connecter.`, 'success', 4000);
  loadAdminData();
}

function rejectVendorKYC(id) {
  if (!confirm('Rejeter et supprimer ce dossier KYC ?')) return;
  const pending = getPendingVendors();
  const remaining = pending.filter(x => x.id !== id);
  localStorage.setItem('ma_vendors_kyc_pending', JSON.stringify(remaining));
  showToast('Dossier KYC rejeté', 'success');
  loadAdminData();
}

function suspendVendorAdmin(id) {
  if (!confirm('Suspendre ce vendeur ?')) return;
  LocalStore.removeApprovedVendor(id);
  showToast('Vendeur suspendu', 'success');
  loadAdminData();
}

// ── FORMULAIRE AJOUT VENDEUR ADMIN ──────────────────────────
function toggleAddVendorForm() {
  const form = document.getElementById('addVendorForm');
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  if (form.style.display === 'block') {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function generateVendorPwd() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  const inp = document.getElementById('avPwd');
  if (inp) {
    inp.value = pwd;
    inp.type  = 'text';
    showToast('Mot de passe généré : ' + pwd + ' — copiez-le !', 'success', 8000);
  }
}

function togglePwdAdmin(id) {
  const el = document.getElementById(id);
  if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

function createVendorAdmin() {
  const fn        = document.getElementById('avFN')?.value.trim();
  const ln        = document.getElementById('avLN')?.value.trim();
  const email     = document.getElementById('avEmail')?.value.trim().toLowerCase();
  const phone     = document.getElementById('avPhone')?.value.trim();
  const cni       = document.getElementById('avCNI')?.value.trim();
  const pwd       = document.getElementById('avPwd')?.value;
  const storeName = document.getElementById('avStoreName')?.value.trim();
  const storeDesc = document.getElementById('avStoreDesc')?.value.trim();
  const city      = document.getElementById('avCity')?.value;
  const cat       = document.getElementById('avCat')?.value;
  const address   = document.getElementById('avAddress')?.value.trim();
  const payMethod = document.getElementById('avPayMethod')?.value;
  const payNum    = document.getElementById('avPayNum')?.value.trim();

  // Validations
  if (!fn || !ln)    { showToast('Prénom et nom requis', 'error'); return; }
  if (!email)        { showToast('Email requis', 'error'); return; }
  if (!phone)        { showToast('Téléphone requis', 'error'); return; }
  if (!pwd || pwd.length < 8) { showToast('Mot de passe minimum 8 caractères', 'error'); return; }
  if (!storeName)    { showToast('Nom de boutique requis', 'error'); return; }
  if (!city)         { showToast('Ville requise', 'error'); return; }

  // Vérifier unicité email
  const existing = LocalStore.getApprovedVendors().find(v => v.email === email);
  if (existing) { showToast('Cet email est déjà utilisé par un vendeur', 'error'); return; }

  // Créer directement approuvé (admin = vérifié)
  const _safeBtoa = str => { try { return btoa(unescape(encodeURIComponent(str))); } catch { return btoa(str); } };
  const newVendor = {
    id:            'vnd-' + Date.now(),
    firstName: fn, lastName: ln, email, phone,
    cniNumber:     cni || 'Vérifié par admin',
    passwordHash:  _safeBtoa(pwd),
    storeName, storeDesc: storeDesc||'', storeCity: city,
    storeAddress: address||'', storeCategory: cat||'',
    paymentMethod: payMethod, paymentNumber: payNum||'',
    role: 'vendor', status: 'approved', isActive: true,
    createdBy: 'admin', createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    productCount: 0, totalSales: 0, rating: 0,
  };

  // ── Publier via API backend (partagé entre tous) ──
  let apiOk = false;
  try {
    await Api.post('/auth/register-vendor', {
      firstName:fn, lastName:ln, email, phone, password:pwd,
      storeName, storeCity:city, storeAddress:address,
      storeDesc, storeCategory:cat,
    });
    apiOk = true;
  } catch {}

  // ── Sauvegarder en LocalStore ──
  const approved = LocalStore.getApprovedVendors();
  approved.unshift(newVendor);
  LocalStore.saveApprovedVendors(approved);

  // Aussi dans ma_users
  const users = JSON.parse(localStorage.getItem('ma_users')||'[]');
  users.push({ id:newVendor.id, firstName:fn, lastName:ln, email, phone, role:'vendor', storeName, storeCity:city, createdAt:newVendor.createdAt });
  localStorage.setItem('ma_users', JSON.stringify(users));

  const msg = apiOk
    ? `✅ Vendeur "${storeName}" créé et publié sur la plateforme !`
    : `✅ Vendeur "${storeName}" créé localement.`;
  showToast(msg, 'success', 5000);

  // Afficher les identifiants à copier
  setTimeout(() => {
    const info = `📋 Identifiants vendeur "${storeName}" :\n\nEmail : ${email}\nMot de passe : ${pwd}\n\nPage de connexion : ${location.origin}/auth.html`;
    if (confirm('Vendeur créé ! Voulez-vous voir les identifiants à transmettre ?\n\n' + info + '\n\nCliquez OK pour copier.')) {
      navigator.clipboard?.writeText(info).then(() => showToast('Identifiants copiés !', 'success'));
    }
  }, 500);

  // Reset formulaire
  ['avFN','avLN','avEmail','avPhone','avCNI','avPwd','avStoreName','avStoreDesc','avAddress','avPayNum'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  toggleAddVendorForm();
  loadAdminData();
}

function searchVendorsAdmin(q) {
  const approved = getAllVendors();
  const pending  = getPendingVendors();
  const sq       = q.toLowerCase();
  const filtA    = approved.filter(v => !q || v.storeName?.toLowerCase().includes(sq) || v.email?.toLowerCase().includes(sq) || v.storeCity?.toLowerCase().includes(sq));
  const filtP    = pending.filter(v  => !q || v.storeName?.toLowerCase().includes(sq) || v.email?.toLowerCase().includes(sq) || v.storeCity?.toLowerCase().includes(sq));
  renderVendorsTable(filtA, filtP);
}
function renderInvitations() {
  // Chercher ou créer la section invitations dans les paramètres
  const wrap = document.getElementById('invitationsSection');
  if (!wrap) return;

  const invitations = JSON.parse(localStorage.getItem('ma_vendor_invitations') || '[]');
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-family:'Syne',sans-serif;font-size:15px;font-weight:800">Invitations vendeurs</h3>
      <button class="btn-primary btn-sm" onclick="generateInvitation()">+ Générer une invitation</button>
    </div>
    <p style="font-size:13px;color:var(--text-2);margin-bottom:16px">Seuls les vendeurs invités par vous peuvent s'inscrire. Chaque code est à usage unique.</p>
    ${invitations.length ? `
    <table class="orders-table">
      <thead><tr><th>Code</th><th>Email cible</th><th>Généré le</th><th>Statut</th><th>Lien</th></tr></thead>
      <tbody>
        ${invitations.map(inv => `<tr>
          <td style="font-family:monospace;font-weight:700;letter-spacing:2px">${inv.token}</td>
          <td style="color:var(--text-2)">${inv.email||'—'}</td>
          <td style="font-size:12px;color:var(--text-3)">${new Date(inv.createdAt).toLocaleDateString('fr-FR')}</td>
          <td><span class="${inv.used?'sbadge-suspended':'sbadge-active'}">${inv.used?'Utilisé':'Disponible'}</span></td>
          <td>
            ${!inv.used ? `<button class="btn-ghost btn-sm" onclick="copyInviteLink('${inv.token}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copier
            </button>` : '—'}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>` : '<p style="text-align:center;padding:20px;color:var(--text-3);font-size:14px">Aucune invitation générée</p>'}`;
}

function generateInvitation() {
  const email = prompt('Email du futur vendeur (optionnel — laisser vide pour un code générique) :');
  const token = generateToken();
  const invitations = JSON.parse(localStorage.getItem('ma_vendor_invitations') || '[]');
  invitations.unshift({
    id:        'inv-' + Date.now(),
    token,
    email:     email?.trim().toLowerCase() || null,
    createdAt: new Date().toISOString(),
    used:      false,
  });
  localStorage.setItem('ma_vendor_invitations', JSON.stringify(invitations));
  showToast(`Invitation générée : ${token}`, 'success', 5000);
  loadAdminData();
  copyInviteLink(token);
}

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) { token += chars[Math.floor(Math.random() * chars.length)]; }
  return token.slice(0,4) + '-' + token.slice(4);
}

function copyInviteLink(token) {
  const baseUrl = location.origin + location.pathname.replace('admin.html', '');
  const link    = `${baseUrl}vendor-setup.html?token=${token}`;
  navigator.clipboard?.writeText(link).then(() => {
    showToast('Lien copié dans le presse-papiers !', 'success');
  }).catch(() => {
    prompt('Copiez ce lien et envoyez-le au vendeur :', link);
  });
}

// ── TABLE PRODUITS (avec approbation) ─────────────────────────
let allProductsData = [];
function renderProductsTable(approved, pending=[]) {
  allProductsData = [...approved, ...pending.map(p => ({...p, _isPending:true}))];
  const tb = document.getElementById('productsAdminTable');
  if (!tb) return;

  const allRows = [
    ...pending.map(p => `<tr style="background:#fffbf0">
      <td><span style="font-size:18px;margin-right:8px">${p.emoji||'👗'}</span><strong>${p.name}</strong></td>
      <td style="color:var(--text-2)">${p.vendor?.storeName||p.vendorId||'—'}</td>
      <td style="font-weight:700;color:var(--gold)">${fmtPrice(p.salePrice||p.price)}</td>
      <td style="font-size:11px">${p.category}</td>
      <td><span class="sbadge-pending">En attente</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn-primary btn-sm" onclick="approveProduct('${p.id}')">Approuver</button>
          <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="rejectProduct('${p.id}')">Rejeter</button>
        </div>
      </td>
    </tr>`),
    ...approved.map(p => `<tr>
      <td><span style="font-size:18px;margin-right:8px">${p.emoji||'👗'}</span><strong>${p.name}</strong></td>
      <td style="color:var(--text-2)">${p.vendor?.storeName||'—'}</td>
      <td style="font-weight:700;color:var(--gold)">${fmtPrice(p.salePrice||p.price)}</td>
      <td style="font-size:11px">${p.category}</td>
      <td><span class="sbadge-active">Approuvé ✓</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <a href="product.html?id=${p.id}" target="_blank" class="btn-outline btn-sm">Voir</a>
          <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="deleteProductAdmin('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`),
  ].join('');

  tb.innerHTML = `<thead><tr><th>Produit</th><th>Vendeur</th><th>Prix</th><th>Catégorie</th><th>Statut</th><th>Actions</th></tr></thead>
    <tbody>${allRows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-3)">Aucun produit</td></tr>'}</tbody>`;
}

function filterProductsAdmin(q) {
  const all = [...getAllProducts(), ...getPendingProducts()];
  const filtered = all.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  renderProductsTable(filtered.filter(p=>!p._isPending), filtered.filter(p=>p._isPending));
}

function approveProduct(id) {
  const result = LocalStore.approveProduct(id);
  if (!result) { showToast('Produit introuvable', 'error'); return; }
  showToast(`✅ "${result.name}" approuvé et visible sur la vitrine !`, 'success');
  loadAdminData();
}

function rejectProduct(id) {
  if (!confirm('Rejeter et supprimer ce produit ?')) return;
  LocalStore.rejectProduct(id);
  showToast('Produit rejeté', 'success');
  loadAdminData();
}

function deleteProductAdmin(id) {
  if (!confirm('Supprimer ce produit de la vitrine ?')) return;
  LocalStore.removeApprovedProduct(id);
  showToast('Produit retiré de la vitrine', 'success');
  loadAdminData();
}

function viewVendor(id) {
  const v = getAllVendors().find(x => x.id === id);
  if (!v) return;
  const modal = document.getElementById('vendorModal');
  const title = document.getElementById('vendorModalTitle');
  const body  = document.getElementById('vendorModalBody');
  const action= document.getElementById('vendorModalAction');
  if (title) title.textContent = v.storeName;
  if (body) body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px">
      <div><strong>Ville :</strong> ${v.storeCity}</div>
      <div><strong>Catégorie :</strong> ${v.storeCategory||'—'}</div>
      <div><strong>Email :</strong> ${v.email}</div>
      <div><strong>Téléphone :</strong> ${v.phone}</div>
      <div><strong>Approuvé le :</strong> ${v.approvedAt ? new Date(v.approvedAt).toLocaleDateString('fr-FR') : '—'}</div>
      <div style="grid-column:1/-1"><strong>Description :</strong> ${v.storeDesc||'—'}</div>
    </div>`;
  if (action) { action.textContent = 'Suspendre'; action.className='btn-outline'; action.style.color='var(--red)'; action.style.borderColor='var(--red)'; action.onclick = () => { closeVendorModal(); suspendVendorAdmin(id); }; }
  modal?.classList.remove('hidden');
}

function closeVendorModal() {
  document.getElementById('vendorModal')?.classList.add('hidden');
  document.getElementById('modalRejectBtn')?.remove();
}

// ── HELPERS ─────────────────────────────────────────────────
function payMethodBadge(method) {
  const map = {
    orange_money: '<span class="pm-badge-om">Orange Money</span>',
    mtn_momo:     '<span class="pm-badge-mtn">MTN MoMo</span>',
    cinetpay:     '<span class="pm-badge-cp">CinetPay</span>',
    fedapay:      '<span class="pm-badge-fp">FedaPay</span>',
  };
  return map[method] || `<span style="font-size:11px;color:var(--text-3)">${method||'—'}</span>`;
}

function setEl(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }
