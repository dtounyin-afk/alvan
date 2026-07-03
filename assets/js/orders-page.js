// ============================================================
// ModaAfrik Cameroun — Page "Mes commandes" (client)
// ============================================================
let allClientOrders = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Rediriger si pas connecté
  if (!Auth.isLoggedIn()) {
    location.href = 'auth.html?redirect=' + encodeURIComponent(location.href);
    return;
  }
  // Afficher nom utilisateur
  const u = Auth.user();
  if (u) {
    const titleEl = document.querySelector('.orders-title');
    if (titleEl) titleEl.textContent = 'Mes commandes';
  }
  await loadOrders();
});

async function loadOrders() {
  // 1. Essayer l'API
  try {
    const res = await Api.orders.list();
    if (res.orders?.length) {
      allClientOrders = res.orders;
      renderOrders(allClientOrders);
      return;
    }
  } catch {}

  // 2. Commandes stockées localement (après checkout)
  try {
    const local = JSON.parse(localStorage.getItem('ma_client_orders') || '[]');
    allClientOrders = local;
  } catch { allClientOrders = []; }

  renderOrders(allClientOrders);
}

function renderOrders(orders) {
  const list  = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  if (!list) return;

  if (!orders || !orders.length) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  list.innerHTML = orders.map(o => orderCardHTML(o)).join('');
}

function orderCardHTML(o) {
  const delivMap = { pickup:'🏪 Retrait en boutique', local:'🛵 Livraison même ville', interurbain:'🚚 Expédition — '+o.deliveryCity };
  const stepConfig = [
    { label:'Commandé',    icon:'📋', keys:['pending','processing','shipped','delivered','cancelled'] },
    { label:'Préparation', icon:'📦', keys:['processing','shipped','delivered'] },
    { label:'Expédié',     icon:'🚚', keys:['shipped','delivered'] },
    { label:'Livré',       icon:'✅', keys:['delivered'] },
  ];
  const timelineHtml = stepConfig.map((s, i) => {
    const done   = s.keys.includes(o.status);
    const active = (i === 0 && o.status === 'pending') ||
                   (i === 1 && o.status === 'processing') ||
                   (i === 2 && o.status === 'shipped') ||
                   (i === 3 && o.status === 'delivered');
    return `<div class="ot-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
      <div class="ot-dot">${done || active ? '✓' : (i+1)}</div>
      <div class="ot-label">${s.label}</div>
    </div>`;
  }).join('<div style="flex:1;height:2px;background:var(--border);margin-top:14px;align-self:flex-start"></div>');

  const itemsHtml = (o.items||[]).map(item => `
    <div class="order-item">
      <div class="oi-img" style="background:${item.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${item.emoji||'👗'}</div>
      <div style="flex:1;min-width:0">
        <div class="oi-name">${item.name}</div>
        <div class="oi-meta">${[item.size,item.color].filter(Boolean).join(' · ')||'—'} · Qté: ${item.qty}</div>
      </div>
      <div class="oi-price">${fmtPrice(item.price * item.qty)}</div>
    </div>`).join('');

  const statusClass = { pending:'os-pending', processing:'os-processing', shipped:'os-shipped', delivered:'os-delivered', cancelled:'os-cancelled' }[o.status] || 'os-pending';
  const statusLabel = { pending:'En attente', processing:'En préparation', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée' }[o.status] || o.status;

  return `
  <div class="order-card">
    <div class="order-card-header">
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <div>
          <div class="order-number-badge">${o.orderNumber||('#'+o.id?.slice(-5))}</div>
          <div class="order-date">Passée le ${new Date(o.createdAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</div>
        </div>
        <span class="order-status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:var(--gold)">${fmtPrice(o.total)}</div>
    </div>

    ${o.status !== 'cancelled' ? `<div class="order-timeline">${timelineHtml}</div>` : ''}

    <div class="order-items">${itemsHtml}</div>

    <div class="order-card-footer">
      <div class="order-delivery-info">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        ${delivMap[o.deliveryOption]||o.deliveryOption||'—'}
        ${o.deliveryCost > 0 ? `<span style="color:var(--text-3)">· ${fmtPrice(o.deliveryCost)}</span>` : '<span style="color:var(--green)">· Gratuit</span>'}
      </div>
      <div class="order-actions">
        <button class="btn-outline btn-sm" onclick="showOrderDetail('${o.id||o.orderNumber}')">Voir le détail</button>
        ${o.status === 'delivered' ? `<a href="shop.html" class="btn-primary btn-sm">Racheter</a>` : ''}
        ${o.status === 'pending' ? `<button class="btn-ghost btn-sm" style="color:var(--red)" onclick="cancelOrder('${o.id||o.orderNumber}')">Annuler</button>` : ''}
      </div>
    </div>
  </div>`;
}

function filterOrders(status, btn) {
  document.querySelectorAll('.orders-filters .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const filtered = status === 'all' ? allClientOrders : allClientOrders.filter(o => o.status === status);
  renderOrders(filtered);
}

function showOrderDetail(id) {
  const o = allClientOrders.find(x => x.id === id || x.orderNumber === id);
  if (!o) return;
  const modal = document.getElementById('orderDetailModal');
  const title = document.getElementById('orderDetailTitle');
  const body  = document.getElementById('orderDetailBody');
  if (title) title.textContent = o.orderNumber || '#' + id;
  if (body) body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:20px">
      <div><strong>Client :</strong> ${o.firstName} ${o.lastName}</div>
      <div><strong>Téléphone :</strong> ${o.phone||'—'}</div>
      <div><strong>Adresse :</strong> ${o.address||'—'}</div>
      <div><strong>Ville :</strong> ${o.city||o.deliveryCity||'—'}</div>
      <div><strong>Livraison :</strong> ${{pickup:'Click & Collect',local:'Même ville',interurbain:'Interurbain'}[o.deliveryOption]||o.deliveryOption||'—'}</div>
      <div><strong>Paiement :</strong> ${{orange_money:'Orange Money',mtn_momo:'MTN MoMo',cinetpay:'CinetPay',fedapay:'FedaPay'}[o.paymentMethod]||o.paymentMethod||'—'}</div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:16px">
      ${(o.items||[]).map(item => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
          <div style="width:48px;height:56px;border-radius:8px;background:${item.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'};display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">${item.emoji||'👗'}</div>
          <div style="flex:1"><div style="font-weight:700;font-size:13px">${item.name}</div><div style="font-size:11px;color:var(--text-3);margin-top:2px">${[item.size,item.color].filter(Boolean).join(' · ')} · Qté ${item.qty}</div></div>
          <div style="font-weight:700;color:var(--gold)">${fmtPrice(item.price*item.qty)}</div>
        </div>`).join('')}
      <div style="display:flex;justify-content:space-between;font-size:14px;padding-top:4px">
        <span style="color:var(--text-2)">Sous-total</span><span>${fmtPrice(o.subtotal||o.total)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:6px">
        <span style="color:var(--text-2)">Livraison</span><span>${o.deliveryCost > 0 ? fmtPrice(o.deliveryCost) : 'Gratuit'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-family:'Syne',sans-serif;font-size:17px;font-weight:800;margin-top:10px;padding-top:10px;border-top:2px solid var(--border)">
        <span>Total</span><span style="color:var(--gold)">${fmtPrice(o.total)}</span>
      </div>
    </div>`;
  modal?.classList.remove('hidden');
}

function cancelOrder(id) {
  if (!confirm('Annuler cette commande ?')) return;
  const o = allClientOrders.find(x => x.id === id || x.orderNumber === id);
  if (o) {
    o.status = 'cancelled';
    // Sauvegarder localement
    try { localStorage.setItem('ma_client_orders', JSON.stringify(allClientOrders)); } catch {}
    renderOrders(allClientOrders);
    showToast('Commande annulée', 'success');
  }
}
