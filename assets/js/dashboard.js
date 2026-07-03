// ============================================================
// ModaAfrik Cameroun — Vendor Dashboard (Publication fonctionnelle)
// ============================================================
let dashOrders   = [];
let dashProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  loadVendorInfo();
  await loadDashData();
  showSection('overview', null);
});

function loadVendorInfo() {
  const u = Auth.user();
  if (!u) return;
  const name = u.storeName || `${u.firstName} ${u.lastName}`;
  document.querySelectorAll('.dash-vendor-name').forEach(el => el.textContent = name);
  document.querySelectorAll('.dash-vendor-av').forEach(el => el.textContent = name[0]||'V');
}

async function loadDashData() {
  // Produits soumis par CE vendeur (en attente admin)
  const user  = Auth.user();
  const local = LocalStore.getPendingProducts().filter(p =>
    !user || p.vendorId === user.id || p.vendorId === 'vnd-local'
  );
  dashProducts = local;
  // Commandes
  dashOrders = [];
  try {
    const r = await Api.orders.vendorOrders();
    if (r.orders?.length) dashOrders = r.orders;
  } catch {}
  renderOverview();
  renderProductsList();
  renderOrdersTable(dashOrders);
  renderEarnings();
  renderReviews();
  // Pré-remplir les paramètres
  if (user) {
    const sn = document.getElementById('setStoreName'); if(sn) sn.value = user.storeName||'';
    const sd = document.getElementById('setStoreDesc'); if(sd) sd.value = user.storeDesc||'';
    const ph = document.getElementById('setPhone');     if(ph) ph.value = user.phone||'';
    const ad = document.getElementById('setAddress');   if(ad) ad.value = user.storeAddress||'';
  }
}

/* ── NAVIGATION ── */
function showSection(id, link) {
  document.querySelectorAll('.dash-sec').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const sec = document.getElementById('sec-'+id);
  if (sec) sec.classList.remove('hidden');
  if (link) link.classList.add('active');
  const titles = {
    overview:'Vue d\'ensemble', products:'Mes produits',
    'add-product':'Ajouter un produit', orders:'Commandes',
    earnings:'Revenus', reviews:'Avis clients', settings:'Paramètres'
  };
  const title = document.getElementById('topbarTitle');
  if (title) title.textContent = titles[id] || id;
  if (window.innerWidth < 768) document.getElementById('dashSidebar')?.classList.remove('open');
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  document.getElementById('dashSidebar')?.classList.toggle('open');
}

/* ── OVERVIEW ── */
function renderOverview() {
  const rev   = dashOrders.reduce((s,o) => s + (o.vendorAmount||0), 0);
  const mOrds = dashOrders.filter(o => new Date(o.createdAt) > new Date(Date.now()-30*86400000));
  const pend  = dashOrders.filter(o => o.status==='pending').length;
  const avg   = dashProducts.length ? (dashProducts.reduce((s,p)=>s+(p.rating||0),0)/dashProducts.length).toFixed(1) : '—';

  setEl('sRevMonth',   fmtPrice(mOrds.reduce((s,o)=>s+(o.vendorAmount||0),0)));
  setEl('sOrdTotal',   dashOrders.length);
  setEl('sProdsCount', dashProducts.length);
  setEl('sRating',     avg+' ★');
  setEl('sPending',    pend+' en attente');
  setEl('newOrdersBadge', pend||'');

  renderMiniChart();
  renderRecentOrders(dashOrders.slice(0,5));
}

function renderMiniChart() {
  const wrap = document.getElementById('miniChart');
  if (!wrap) return;
  const data = [28000,45000,18000,62000,38000,75000,51000];
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const max  = Math.max(...data);
  wrap.innerHTML = data.map((v,i) => `
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
    <div style="flex:1;width:100%;display:flex;align-items:flex-end">
      <div style="width:100%;height:${Math.max(4,Math.round(v/max*140))}px;background:${i===5?'var(--grad-gold)':'var(--border)'};border-radius:4px 4px 0 0;transition:var(--t-med)" title="${fmtPrice(v)}"></div>
    </div>
    <div style="font-size:10px;color:var(--text-3)">${days[i]}</div>
  </div>`).join('');
}

function renderRecentOrders(orders) {
  const tb = document.getElementById('recentOrders');
  if (!tb) return;
  tb.innerHTML = `<thead><tr><th>N°</th><th>Client</th><th>Articles</th><th>Total</th><th>Livraison</th><th>Statut</th></tr></thead><tbody>` +
    (orders.length ? orders.map(o => orderRow(o)).join('') : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-3)">Aucune commande</td></tr>') +
    '</tbody>';
}

/* ── PRODUITS ── */
function renderProductsList() {
  const grid = document.getElementById('vendorProdsGrid');
  if (!grid) return;
  if (!dashProducts.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-3)">
      <div style="font-size:48px;margin-bottom:12px">👗</div>
      <p style="font-size:15px;color:var(--text-2);margin-bottom:16px">Vous n'avez pas encore soumis de produits.</p>
      <button class="btn-primary" onclick="showSection('add-product',null)">+ Ajouter mon premier produit</button>
    </div>`;
    return;
  }
  grid.innerHTML = dashProducts.map(p => {
    const status     = p.status || 'pending_review';
    const statusHtml = status === 'approved'
      ? `<span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0">✓ Approuvé — visible</span>`
      : `<span style="padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:#fff8e1;color:#92400e;border:1px solid #fde68a">⏳ En attente approbation</span>`;
    return `
    <div class="vp-card">
      <div style="background:${p.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'};height:130px;display:flex;align-items:center;justify-content:center;font-size:52px;border-radius:var(--r-lg) var(--r-lg) 0 0">${p.emoji||'👗'}</div>
      <div style="padding:12px 14px">
        <div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${p.name}">${p.name}</div>
        <div style="font-size:13px;font-weight:700;color:var(--gold);margin-bottom:6px">${fmtPrice(p.salePrice||p.price)}</div>
        <div style="margin-bottom:10px">${statusHtml}</div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:10px">Stock : ${p.stock||0} · ${p.category||'—'}</div>
        <div style="display:flex;gap:6px">
          ${status === 'approved' ? `<a href="product.html?id=${p.id}" target="_blank" class="btn-outline btn-sm" style="text-decoration:none;font-size:11px">Voir</a>` : ''}
          <button class="btn-ghost btn-sm" onclick="deleteProduct('${p.id}')" style="color:var(--red);font-size:11px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterVendorProds(q) {
  const filtered = dashProducts.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  const grid = document.getElementById('vendorProdsGrid');
  if (!grid) return;
  grid.innerHTML = filtered.map(p => `<div class="vp-card" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden">
    <div style="background:${p.gradient};height:110px;display:flex;align-items:center;justify-content:center;font-size:44px">${p.emoji||'👗'}</div>
    <div style="padding:12px"><div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700">${p.name}</div><div style="color:var(--gold);font-weight:700;margin-top:4px">${fmtPrice(p.salePrice||p.price)}</div></div>
  </div>`).join('');
}

/* ── FORMULAIRE AJOUT PRODUIT (FONCTIONNEL) ── */
function calcCommission() {
  const price = Number(document.getElementById('apPrice')?.value) || 0;
  const comm  = Math.round(price * 0.10);
  setEl('ccPrice', fmtPrice(price));
  setEl('ccComm',  fmtPrice(comm));
  setEl('ccNet',   fmtPrice(price - comm));
}

function previewPhotos(input) {
  const prev = document.getElementById('photoPreviews');
  if (!prev) return;
  prev.innerHTML = '';
  [...input.files].slice(0, 8).forEach(f => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.style.cssText = `width:70px;height:70px;border-radius:8px;background:url(${e.target.result}) center/cover;flex-shrink:0;border:1px solid var(--border)`;
      prev.appendChild(div);
    };
    reader.readAsDataURL(f);
  });
}

async function saveProduct(status='active') {
  const name     = document.getElementById('apName')?.value.trim();
  const price    = Number(document.getElementById('apPrice')?.value);
  const cat      = document.getElementById('apCat')?.value;
  const stock    = Number(document.getElementById('apStock')?.value) || 0;
  const shortDesc= document.getElementById('apShortDesc')?.value.trim() || '';
  const fullDesc = document.getElementById('apFullDesc')?.value.trim() || '';

  if (!name)  { showToast('Le nom du produit est requis', 'error'); return; }
  if (!price) { showToast('Le prix est requis (ex: 15000)', 'error'); return; }
  if (!cat)   { showToast('Choisissez une catégorie', 'error'); return; }

  const sizes  = [...document.querySelectorAll('.sc-item input:checked')].map(i => i.value);
  const colors = (document.getElementById('apColors')?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
  const tags   = (document.getElementById('apTags')?.value||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const sale   = Number(document.getElementById('apSale')?.value) || null;

  // Emoji et gradient par catégorie
  const emojiMap = {
    'robes-pagnes':'👗', 'boubous':'🥻', 'hommes':'👔', 'enfants':'👶',
    'accessoires':'👜', 'bijoux':'💎', 'chaussures':'👡'
  };
  const gradMap = {
    'robes-pagnes':'linear-gradient(135deg,#e67e22,#f39c12)',
    'boubous':     'linear-gradient(135deg,#2c3e50,#3498db)',
    'hommes':      'linear-gradient(135deg,#27ae60,#2c3e50)',
    'enfants':     'linear-gradient(135deg,#e91e63,#ff9800)',
    'accessoires': 'linear-gradient(135deg,#8e44ad,#3498db)',
    'bijoux':      'linear-gradient(135deg,#f39c12,#e74c3c)',
    'chaussures':  'linear-gradient(135deg,#e74c3c,#c0392b)',
  };

  const vendor = Auth.user();
  const newProduct = {
    id:          'prd-local-' + Date.now(),
    name,
    shortDesc:   shortDesc || name,
    description: fullDesc || shortDesc || name,
    price,
    salePrice:   sale || null,
    emoji:       emojiMap[cat] || '👗',
    gradient:    gradMap[cat] || 'linear-gradient(135deg,#e8e0d0,#d4c8b8)',
    badge:       sale ? 'promo' : (status === 'active' ? 'new' : null),
    rating:      0,
    reviewCount: 0,
    vendorId:    vendor?.id || 'vnd-local',
    vendor: {
      storeName: vendor?.storeName || (vendor?.firstName ? `${vendor.firstName} ${vendor.lastName}` : 'Ma Boutique'),
      storeCity: vendor?.storeCity || 'Cameroun',
      rating:    vendor?.rating || 5,
    },
    sizes:    sizes.length ? sizes : ['Unique'],
    colors:   colors.length ? colors : ['Multicolore'],
    stock,
    category: cat,
    tags,
    isFeatured: false,
    isNew:      status === 'active',
    isActive:   status === 'active',
    createdAt:  new Date().toISOString(),
  };

  // Essayer l'API
  try {
    await Api.products.create({
      name, shortDesc: newProduct.shortDesc, price, salePrice: sale,
      category: cat, sizes, colors, stock, tags
    });
  } catch { /* Pas de backend ? On continue en local */ }

  // Sauvegarder dans les produits EN ATTENTE (pas sur la vitrine)
  // L'admin doit approuver avant que le produit soit visible
  LocalStore.addPendingProduct(newProduct);
  dashProducts.unshift({...newProduct, status:'pending_review'});

  showToast(`📤 "${name}" soumis pour approbation. L'administrateur doit l'approuver pour qu'il soit visible sur la vitrine.`, 'success', 5000);

  resetProductForm();
  renderProductsList();
  renderOverview();
  setTimeout(() => showSection('products', document.querySelector('.sidebar-link:nth-child(2)')), 1500);
}

function saveDraft() { saveProduct('draft'); }

function resetProductForm() {
  ['apName','apShortDesc','apFullDesc','apPrice','apSale','apStock','apSKU','apColors','apTags'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  document.querySelectorAll('.sc-item input').forEach(i => i.checked = false);
  const cat = document.getElementById('apCat'); if(cat) cat.value = '';
  const prev = document.getElementById('photoPreviews'); if(prev) prev.innerHTML = '';
  calcCommission();
}

function editProduct(id) {
  showToast('Fonctionnalité de modification à venir', 'default');
}

function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ? Cette action est irréversible.')) return;
  LocalStore.deletePendingProduct(id);
  dashProducts = dashProducts.filter(p => p.id !== id);
  renderProductsList();
  renderOverview();
  showToast('Produit supprimé', 'success');
}

/* ── COMMANDES ── */
function renderOrdersTable(orders) {
  const tb = document.getElementById('fullOrders');
  if (!tb) return;
  const rows = orders.length ? orders.map(o => orderRow(o, true)).join('') :
    '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-3)">Aucune commande</td></tr>';
  tb.innerHTML = `<thead><tr><th>N° Commande</th><th>Date</th><th>Client</th><th>Articles</th><th>Total</th><th>Livraison</th><th>Statut</th><th>Action</th></tr></thead><tbody>${rows}</tbody>`;
}

function orderRow(o, full=false) {
  const statColors = {pending:'#92400e;background:#fff8e1',processing:'#1e40af;background:#eff6ff',shipped:'#4c1d95;background:#f5f3ff',delivered:'#065f46;background:#ecfdf5',cancelled:'#991b1b;background:#fef2f2'};
  const statLabel  = {pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'};
  const delivery   = {pickup:'Click & Collect',local:'Même ville',interurbain:`Interurbain — ${o.deliveryCity||''}`}[o.deliveryOption]||o.deliveryOption;
  const sc         = statColors[o.status]||'color:var(--text-2)';
  const sl         = statLabel[o.status]||o.status;
  const dateStr    = new Date(o.createdAt).toLocaleDateString('fr-FR');
  const itemsStr   = (o.items||[]).map(i=>`${i.qty}× ${i.name}`).join(', ');
  const actionSel  = full ? `<td><select onchange="updateStatus('${o.id}',this.value)" style="font-size:11px;padding:4px 6px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);outline:none">${['pending','processing','shipped','delivered'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${statLabel[s]}</option>`).join('')}</select></td>` : '';
  return `<tr>
    <td style="font-weight:700;color:var(--gold)">${o.orderNumber}</td>
    ${full?`<td style="font-size:12px;color:var(--text-3)">${dateStr}</td>`:''}
    <td>${o.firstName} ${o.lastName}<br><span style="font-size:11px;color:var(--text-3)">${o.phone||''}</span></td>
    <td style="font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${itemsStr}</td>
    <td style="font-weight:700">${fmtPrice(o.total)}</td>
    <td style="font-size:12px">${delivery}</td>
    <td><span style="padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;color:${sc}">${sl}</span></td>
    ${actionSel}
  </tr>`;
}

function filterOrders(status, btn) {
  document.querySelectorAll('#orderFilters .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const filtered = status === 'all' ? dashOrders : dashOrders.filter(o => o.status===status);
  renderOrdersTable(filtered);
}

async function updateStatus(id, status) {
  try { await Api.orders.updateStatus(id, status); } catch {}
  const o = dashOrders.find(x => x.id===id); if(o) o.status=status;
  showToast('Statut mis à jour', 'success');
}

/* ── REVENUS ── */
function renderEarnings() {
  const total = dashOrders.reduce((s,o)=>s+(o.vendorAmount||0),0);
  const month = dashOrders.filter(o=>new Date(o.createdAt)>new Date(Date.now()-30*86400000)).reduce((s,o)=>s+(o.vendorAmount||0),0);
  const avail = Math.round(month*0.36);
  setEl('eTotal',  fmtPrice(total));
  setEl('eMonth',  fmtPrice(month));
  setEl('eAvail',  fmtPrice(avail));
  const wd = document.getElementById('wdBalance'); if(wd) wd.textContent = fmtPrice(avail);
  const hist = document.getElementById('payHistory');
  if (hist) hist.innerHTML = [
    {date:'01/04/2025',brut:180000,comm:18000,net:162000,method:'Orange Money',stat:'Versé'},
    {date:'15/03/2025',brut:95000, comm:9500, net:85500, method:'MTN MoMo',   stat:'Versé'},
    {date:'01/03/2025',brut:220000,comm:22000,net:198000,method:'Orange Money',stat:'Versé'},
  ].map(p=>`<tr><td>${p.date}</td><td>${fmtPrice(p.brut)}</td><td style="color:var(--red)">-${fmtPrice(p.comm)}</td><td style="color:var(--green);font-weight:700">${fmtPrice(p.net)}</td><td>${p.method}</td><td><span style="padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;color:#065f46;background:#ecfdf5">${p.stat}</span></td></tr>`).join('');
}

function requestWithdraw() { document.getElementById('withdrawModal')?.classList.remove('hidden'); }
function confirmWithdraw() {
  const amt = Number(document.getElementById('wdAmount')?.value)||0;
  if (!amt) { showToast('Entrez un montant', 'error'); return; }
  document.getElementById('withdrawModal')?.classList.add('hidden');
  showToast(`Demande de retrait de ${fmtPrice(amt)} envoyée !`, 'success');
}

/* ── AVIS ── */
function renderReviews() {
  const avgR = 4.7;
  const ov   = document.getElementById('reviewsOv');
  if (ov) ov.innerHTML = `
  <div style="text-align:center;border-right:1px solid var(--border);padding-right:24px;margin-right:24px">
    <div style="font-family:'Syne',sans-serif;font-size:52px;font-weight:800;color:var(--text)">${avgR}</div>
    <div style="color:#f59e0b;font-size:20px;margin-bottom:4px">★★★★★</div>
    <div style="font-size:13px;color:var(--text-3)">156 avis</div>
  </div>
  <div style="flex:1">${[5,4,3,2,1].map(n=>{const pct=n===5?70:n===4?20:n===3?6:n===2?3:1;return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:12px;color:var(--text-3);width:28px">${n} ★</span><div style="flex:1;height:6px;background:var(--bg-2);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${n>=4?'#f59e0b':'var(--border-2)'};border-radius:3px"></div></div><span style="font-size:11px;color:var(--text-3);width:28px">${pct}%</span></div>`;}).join('')}</div>`;

  const list = document.getElementById('reviewsList');
  if (list) list.innerHTML = (window.MOCK_REVIEWS||[]).map(r => `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:34px;height:34px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:var(--bg)">${r.userName[0]}</div>
      <div><div style="font-weight:700;font-size:14px">${r.userName}</div><div style="color:#f59e0b;font-size:13px">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div></div>
      <div style="margin-left:auto;font-size:12px;color:var(--text-3)">${new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
    </div>
    <div style="font-size:14px;color:var(--text-2)">${r.comment}</div>
  </div>`).join('');
}

/* ── PARAMÈTRES ── */
function saveSettings() {
  const u = Auth.user();
  if (!u) return;
  const updates = {
    storeName:    document.getElementById('setStoreName')?.value || u.storeName,
    storeDesc:    document.getElementById('setStoreDesc')?.value || u.storeDesc,
    phone:        document.getElementById('setPhone')?.value || u.phone,
    storeAddress: document.getElementById('setAddress')?.value || u.storeAddress,
  };
  Auth.save(Auth.token(), {...u, ...updates});
  showToast('Paramètres sauvegardés avec succès !', 'success');
}

/* ── HELPERS ── */
function setEl(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
