// ============================================================
// ModaAfrik — Super Admin RENDER (tables + charts)
// ============================================================
'use strict';

// ── CHART ────────────────────────────────────────────────────
function renderChart(orders) {
  const w = document.getElementById('adminChart');
  if (!w) return;
  const mn = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const vals = mn.map((_,i) => orders.filter(o=>new Date(o.createdAt||0).getMonth()===i).reduce((s,o)=>s+Math.round((o.subtotal||o.total||0)*0.10),0));
  const max  = Math.max(...vals, 1);
  w.innerHTML = vals.map((v,i)=>`
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="width:100%;border-radius:4px 4px 0 0;height:${Math.max(4,Math.round(v/max*140))}px;background:${v>0?'var(--grad-gold)':'var(--border)'};cursor:pointer;transition:.2s" title="${mn[i]}: ${fmtPrice(v)}"></div>
      <div style="font-size:10px;color:var(--text-3)">${mn[i]}</div>
    </div>`).join('');
}

// ── VENDEURS EN ATTENTE ───────────────────────────────────────
function renderPendingList(pending) {
  const el = document.getElementById('pendingVendorsList');
  if (!el) return;
  if (!pending.length) { el.innerHTML='<p style="text-align:center;color:var(--text-3);padding:20px;font-size:14px">Aucun dossier KYC en attente</p>'; return; }
  el.innerHTML = pending.slice(0,4).map(v=>`
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="width:38px;height:38px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:var(--bg);flex-shrink:0">${v.storeName?.[0]||'V'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.storeName}</div>
        <div style="font-size:11px;color:var(--text-3)">${v.firstName} ${v.lastName} · 📍${v.storeCity}</div>
      </div>
      <div style="display:flex;gap:5px;flex-shrink:0">
        <button class="btn-primary btn-sm" onclick="approveVendorKYC('${v.id}')">Approuver</button>
        <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="rejectVendorKYC('${v.id}')">✕</button>
      </div>
    </div>`).join('');
}

// ── DERNIÈRES COMMANDES (overview) ───────────────────────────
function renderRecentOrders(orders) {
  const tb = document.getElementById('adminRecentOrders');
  if (!tb) return;
  const SL = {pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'};
  tb.innerHTML = `<thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Paiement</th><th>Statut</th></tr></thead><tbody>` +
    (orders.length ? orders.map(o=>`<tr>
      <td style="font-weight:700;color:var(--gold)">${o.orderNumber||o.id?.slice(-6)||'—'}</td>
      <td>${o.firstName||''} ${o.lastName||''}</td>
      <td style="font-weight:700">${fmtPrice(o.total||0)}</td>
      <td>${pmBadge(o.paymentMethod)}</td>
      <td><span class="sbadge-${o.status==='delivered'?'active':o.status==='cancelled'?'suspended':'pending'}">${SL[o.status]||o.status||'—'}</span></td>
    </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-3)">Aucune commande</td></tr>') + '</tbody>';
}

// ── TABLE VENDEURS ────────────────────────────────────────────
function renderVendorTable(vendors, pending) {
  const tb = document.getElementById('vendorsAdminTable');
  if (!tb) return;
  const SL = {pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée'};
  const rows = [
    ...pending.map(v=>`<tr style="background:#fffbf0">
      <td><strong>${v.storeName}</strong><br><small style="color:var(--text-3)">${v.firstName} ${v.lastName}</small></td>
      <td><small>${v.email||'—'}</small><br><small style="color:var(--text-3)">${v.phone||'—'}</small></td>
      <td>📍${v.storeCity||'—'}</td><td>—</td><td>—</td>
      <td>${new Date(v.submittedAt||v.createdAt||Date.now()).toLocaleDateString('fr-FR')}</td>
      <td><span class="sbadge-pending">⏳ KYC</span></td>
      <td><div style="display:flex;gap:5px">
        <button class="btn-outline btn-sm" onclick="viewKYC('${v.id}')">Dossier</button>
        <button class="btn-primary btn-sm" onclick="approveVendorKYC('${v.id}')">Approuver</button>
        <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="rejectVendorKYC('${v.id}')">✕</button>
      </div></td>
    </tr>`),
    ...vendors.map(v=>`<tr>
      <td><strong>${v.storeName}</strong><br><small style="color:var(--text-3)">${v.firstName||''} ${v.lastName||''}</small></td>
      <td><small>${v.email||'—'}</small><br><small style="color:var(--text-3)">${v.phone||'—'}</small></td>
      <td>📍${v.storeCity||'—'}</td>
      <td>${AD.products().filter(p=>p.vendorId===v.id).length}</td>
      <td style="color:var(--gold);font-weight:700">${fmtPrice(v.totalSales||0)}</td>
      <td>${new Date(v.createdAt||Date.now()).toLocaleDateString('fr-FR')}</td>
      <td><span class="sbadge-active">✓ Actif</span></td>
      <td><div style="display:flex;gap:5px">
        <button class="btn-outline btn-sm" onclick="viewVendorDetail('${v.id}')">Voir</button>
        <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="suspendVendorAdmin('${v.id}')">Suspendre</button>
      </div></td>
    </tr>`)
  ].join('');
  tb.innerHTML = `<thead><tr><th>Boutique</th><th>Contact</th><th>Ville</th><th>Produits</th><th>Ventes</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-3)">Aucun vendeur</td></tr>'}</tbody>`;
}

function filterVendorsAdmin(f, btn) {
  document.querySelectorAll('#asec-vendors .size-tag').forEach(b=>b.classList.remove('active'));
  btn?.classList.add('active');
  const v=AD.vendors(), p=AD.pending();
  if (f==='pending') renderVendorTable([],p);
  else if (f==='active') renderVendorTable(v,[]);
  else renderVendorTable(v,p);
}

function searchVendorsAdmin(q) {
  const s=q.toLowerCase();
  const fv=AD.vendors().filter(v=>!s||v.storeName?.toLowerCase().includes(s)||v.email?.toLowerCase().includes(s)||v.storeCity?.toLowerCase().includes(s));
  const fp=AD.pending().filter(v=>!s||v.storeName?.toLowerCase().includes(s));
  renderVendorTable(fv,fp);
}

// ── TABLE PRODUITS ────────────────────────────────────────────
function renderProductTable(approved, pending) {
  const tb = document.getElementById('productsAdminTable');
  if (!tb) return;
  const rows = [
    ...pending.map(p=>`<tr style="background:#fffbf0">
      <td><span style="font-size:18px;margin-right:6px">${p.emoji||'👗'}</span><strong>${p.name}</strong></td>
      <td>${p.vendor?.storeName||p.vendorId||'—'}</td>
      <td style="color:var(--gold);font-weight:700">${fmtPrice(p.salePrice||p.price)}</td>
      <td>${p.category||'—'}</td><td>${p.stock||0}</td>
      <td><span class="sbadge-pending">En attente</span></td>
      <td><div style="display:flex;gap:5px">
        <button class="btn-primary btn-sm" onclick="approveProduct('${p.id}')">Approuver</button>
        <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="rejectProduct('${p.id}')">✕</button>
      </div></td>
    </tr>`),
    ...approved.map(p=>`<tr>
      <td><span style="font-size:18px;margin-right:6px">${p.emoji||'👗'}</span><strong>${p.name}</strong></td>
      <td>${p.vendor?.storeName||'—'}</td>
      <td style="color:var(--gold);font-weight:700">${fmtPrice(p.salePrice||p.price)}</td>
      <td>${p.category||'—'}</td><td>${p.stock||0}</td>
      <td><span class="sbadge-active">✓ Approuvé</span></td>
      <td><div style="display:flex;gap:5px">
        <a href="product.html?id=${p.id}" target="_blank" class="btn-outline btn-sm">Voir</a>
        <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="deleteProductAdmin('${p.id}')">🗑</button>
      </div></td>
    </tr>`)
  ].join('');
  tb.innerHTML = `<thead><tr><th>Produit</th><th>Vendeur</th><th>Prix</th><th>Catégorie</th><th>Stock</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-3)">Aucun produit</td></tr>'}</tbody>`;
}

function filterProductsAdmin(q) {
  const s=q.toLowerCase();
  renderProductTable(AD.products().filter(p=>!q||p.name.toLowerCase().includes(s)), AD.pendProds().filter(p=>!q||p.name.toLowerCase().includes(s)));
}

// ── TABLE COMMANDES ───────────────────────────────────────────
function renderOrderTable(orders) {
  renderTable('ordersAdminTable', orders);
  renderTable('adminRecentOrders', orders.slice(0,5));
}

function renderTable(tbId, orders) {
  const tb = document.getElementById(tbId);
  if (!tb) return;
  const SL={pending:'En attente',processing:'Préparation',shipped:'Expédiée',delivered:'Livrée',cancelled:'Annulée'};
  const BC={delivered:'sbadge-active',cancelled:'sbadge-suspended',pending:'sbadge-pending',processing:'sbadge-pending',shipped:'sbadge-pending'};
  tb.innerHTML=`<thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Commission</th><th>Livraison</th><th>Paiement</th><th>Statut</th></tr></thead><tbody>`+
    (orders.length?orders.map(o=>`<tr>
      <td style="font-weight:700;color:var(--gold)">${o.orderNumber||o.id?.slice(-6)||'—'}</td>
      <td>${o.firstName||''} ${o.lastName||''}</td>
      <td style="font-weight:700">${fmtPrice(o.total||0)}</td>
      <td style="color:var(--red)">${fmtPrice(Math.round((o.subtotal||o.total||0)*0.10))}</td>
      <td style="font-size:12px">${{pickup:'Click&Collect',local:'Même ville',interurbain:'Interurbain'}[o.deliveryOption]||o.deliveryOption||'—'}</td>
      <td>${pmBadge(o.paymentMethod)}</td>
      <td><span class="${BC[o.status]||'sbadge-pending'}">${SL[o.status]||o.status||'—'}</span></td>
    </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-3)">Aucune commande</td></tr>')+'</tbody>';
}

function filterOrdersAdmin(f, btn) {
  document.querySelectorAll('#asec-orders .size-tag').forEach(b=>b.classList.remove('active'));
  btn?.classList.add('active');
  const filtered = f==='all'?AD.orders():AD.orders().filter(o=>o.status===f);
  renderTable('ordersAdminTable', filtered);
}

// ── UTILISATEURS ──────────────────────────────────────────────
function renderUserTable(users) {
  const tb = document.getElementById('usersAdminTable');
  if (!tb) return;
  const allVend = AD.vendors();
  const combined = [
    ...users.filter(u=>u.role==='client'),
    ...allVend.map(v=>({id:v.id, firstName:v.firstName, lastName:v.lastName, email:v.email, role:'vendor', createdAt:v.createdAt}))
  ];
  tb.innerHTML=`<thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscription</th><th>Action</th></tr></thead><tbody>`+
    (combined.length?combined.map(u=>`<tr>
      <td><strong>${u.firstName||''} ${u.lastName||''}</strong></td>
      <td style="font-size:12px;color:var(--text-2)">${u.email||'—'}</td>
      <td><span class="${u.role==='vendor'?'sbadge-pending':u.role==='admin'?'sbadge-suspended':'sbadge-active'}" style="font-size:10px">${u.role?.toUpperCase()||'CLIENT'}</span></td>
      <td style="font-size:11px;color:var(--text-3)">${u.createdAt?new Date(u.createdAt).toLocaleDateString('fr-FR'):'—'}</td>
      <td><button class="btn-ghost btn-sm" style="color:var(--red)" onclick="showToast('Utilisateur suspendu','success')">Suspendre</button></td>
    </tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-3)">Aucun utilisateur</td></tr>')+'</tbody>';
}

// ── PAIEMENTS ─────────────────────────────────────────────────
function renderPayTable(orders) {
  const om=orders.filter(o=>o.paymentMethod==='orange_money');
  const mt=orders.filter(o=>o.paymentMethod==='mtn_momo');
  const ca=orders.filter(o=>['cinetpay','fedapay'].includes(o.paymentMethod));
  const cp=orders.filter(o=>o.paymentMethod==='cash_on_pickup');
  setEl('omTotal',   fmtPrice(om.reduce((s,o)=>s+(o.total||0),0))+' ('+om.length+')');
  setEl('mtnTotal',  fmtPrice(mt.reduce((s,o)=>s+(o.total||0),0))+' ('+mt.length+')');
  setEl('cardTotal', fmtPrice(ca.reduce((s,o)=>s+(o.total||0),0))+' ('+ca.length+')');
  const tb=document.getElementById('paymentsTable');
  if (!tb) return;
  tb.innerHTML=`<thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Commission</th><th>Méthode</th><th>Statut</th></tr></thead><tbody>`+
    (orders.length?orders.map(o=>`<tr>
      <td style="font-weight:700;color:var(--gold)">${o.orderNumber||'—'}</td>
      <td>${o.firstName||''} ${o.lastName||''}</td>
      <td style="font-weight:700">${fmtPrice(o.total||0)}</td>
      <td style="color:var(--red)">${fmtPrice(Math.round((o.subtotal||o.total||0)*0.10))}</td>
      <td>${pmBadge(o.paymentMethod)}</td>
      <td><span class="${o.status==='delivered'?'sbadge-active':'sbadge-pending'}">${o.status||'—'}</span></td>
    </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-3)">Aucune transaction</td></tr>')+'</tbody>';
}

// ── COMMISSIONS ───────────────────────────────────────────────
function renderCommTable(vendors, orders) {
  const tb=document.getElementById('commTable');
  if (!tb) return;
  tb.innerHTML=`<thead><tr><th>Vendeur</th><th>Ventes</th><th>Commission</th><th>Net vendeur</th><th>Taux perso</th></tr></thead><tbody>`+
    (vendors.length?vendors.map(v=>{
      const vO=orders.filter(o=>o.items?.some(i=>i.vendorId===v.id));
      const vs=vO.reduce((s,o)=>s+(o.subtotal||0),0);
      return `<tr>
        <td><strong>${v.storeName}</strong></td>
        <td>${fmtPrice(vs)}</td>
        <td style="color:var(--red);font-weight:700">${fmtPrice(Math.round(vs*0.10))}</td>
        <td style="color:var(--green);font-weight:700">${fmtPrice(Math.round(vs*0.90))}</td>
        <td><input type="number" value="10" min="5" max="30" style="width:58px;padding:4px 8px;border:1.5px solid var(--border);border-radius:6px;background:var(--surface);text-align:center;font-size:13px;font-weight:700;outline:none" onchange="showToast('Taux mis à jour','success')"/>%</td>
      </tr>`;
    }).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-3)">Aucun vendeur</td></tr>')+'</tbody>';
}

function saveCommRate() { showToast('Taux mis à jour : '+document.getElementById('commRate')?.value+'%','success'); }

// ── VILLES ────────────────────────────────────────────────────
function renderCities() {
  const w=document.getElementById('citiesAdmin');
  if (!w||!window.CAMEROON_CITIES) return;
  w.innerHTML=Object.entries(CAMEROON_CITIES).map(([k,v])=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="flex:1;font-size:14px;font-weight:600">📍 ${v.label}</span>
      <input type="number" value="${v.price}" style="width:110px;padding:6px 10px;border:1.5px solid var(--border);border-radius:var(--r-sm);background:var(--surface);color:var(--text);font-size:13px;outline:none;text-align:center" onchange="CAMEROON_CITIES['${k}'].price=Number(this.value);showToast('${v.label} mis à jour','success')"/>
      <span style="font-size:12px;color:var(--text-3)">FCFA</span>
    </div>`).join('');
}

// ── INVITATIONS ───────────────────────────────────────────────
function renderInvites() {
  const w=document.getElementById('invitationsSection');
  if (!w) return;
  const invs=JSON.parse(localStorage.getItem('ma_vendor_invitations')||'[]');
  w.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h3 style="font-family:'Syne',sans-serif;font-size:15px;font-weight:800">Invitations vendeurs</h3>
      <button class="btn-primary btn-sm" onclick="generateInvitation()">+ Générer</button>
    </div>
    <p style="font-size:13px;color:var(--text-2);margin-bottom:14px">Envoyez ces liens aux futurs vendeurs. Usage unique.</p>
    ${invs.length?`<table class="orders-table"><thead><tr><th>Code</th><th>Email</th><th>Date</th><th>Statut</th><th>Lien</th></tr></thead><tbody>
      ${invs.map(i=>`<tr>
        <td style="font-family:monospace;font-weight:700;letter-spacing:2px">${i.token}</td>
        <td style="color:var(--text-2)">${i.email||'—'}</td>
        <td style="font-size:11px;color:var(--text-3)">${new Date(i.createdAt).toLocaleDateString('fr-FR')}</td>
        <td><span class="${i.used?'sbadge-suspended':'sbadge-active'}">${i.used?'Utilisé':'Disponible'}</span></td>
        <td>${!i.used?`<button class="btn-ghost btn-sm" onclick="copyLink('${i.token}')">Copier</button>`:'—'}</td>
      </tr>`).join('')}
    </tbody></table>`:'<p style="text-align:center;padding:20px;color:var(--text-3);font-size:14px">Aucune invitation générée</p>'}`;
}

function generateInvitation() {
  const email=prompt('Email du futur vendeur (optionnel):');
  const tok=Array.from({length:8},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');
  const token=tok.slice(0,4)+'-'+tok.slice(4);
  const invs=JSON.parse(localStorage.getItem('ma_vendor_invitations')||'[]');
  invs.unshift({id:'inv-'+Date.now(), token, email:email?.trim().toLowerCase()||null, createdAt:new Date().toISOString(), used:false});
  localStorage.setItem('ma_vendor_invitations',JSON.stringify(invs));
  copyLink(token);
  showToast('Invitation créée : '+token,'success',6000);
  loadAdminData();
}

function copyLink(token) {
  const base=location.href.replace('admin.html','');
  const url=base+'vendor-setup.html?token='+token;
  navigator.clipboard?.writeText(url).then(()=>showToast('Lien copié !','success')).catch(()=>prompt('Copiez ce lien:',url));
}

// ── HELPERS BADGES ────────────────────────────────────────────
function pmBadge(m) {
  const map={orange_money:'<span class="pm-badge-om">Orange Money</span>',mtn_momo:'<span class="pm-badge-mtn">MTN MoMo</span>',cinetpay:'<span class="pm-badge-cp">CinetPay</span>',fedapay:'<span class="pm-badge-fp">FedaPay</span>',cash_on_pickup:'<span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;background:#ecfdf5;color:#065f46">💵 Cash boutique</span>'};
  return map[m]||`<span style="font-size:11px;color:var(--text-3)">${m||'—'}</span>`;
}
