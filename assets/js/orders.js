// ============================================================
// ModaAfrik Cameroun — Orders History
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Authentification check
  const u = Auth.user();
  if (!u) {
    location.href = 'auth.html?redirect=orders.html';
    return;
  }

  // Set greeting name
  const nameEl = document.getElementById('greetingName');
  if (nameEl) {
    nameEl.textContent = `${u.firstName} ${u.lastName}`;
  }

  // 2. Fetch orders
  let orders = [];
  const root = document.getElementById('ordersRoot');

  try {
    // Try to get from API if not local login
    const token = Auth.token();
    if (token && !token.startsWith('local_')) {
      const res = await Api.orders.list();
      if (res && res.success) {
        orders = res.orders || [];
      }
    }
  } catch (e) {
    console.warn('API error, falling back to local storage:', e);
  }

  // Fallback to local storage ma_orders
  if (orders.length === 0) {
    try {
      const allLocalOrders = JSON.parse(localStorage.getItem('ma_orders') || '[]');
      // Filter by customerId
      orders = allLocalOrders.filter(o => o.customerId === u.id);
      // Sort by date desc
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error('Error reading local orders:', err);
    }
  }

  // 3. Render orders
  if (!orders.length) {
    root.innerHTML = `
      <div class="orders-empty">
        <div class="orders-empty-icon">📦</div>
        <h3>Aucune commande pour le moment</h3>
        <p style="color:var(--text-2); margin-bottom: 24px;">Vous n'avez pas encore passé de commande sur ModaAfrik Cameroun.</p>
        <a href="shop.html" class="btn-gold">Découvrir les collections →</a>
      </div>`;
    return;
  }

  root.innerHTML = `<div class="orders-list">${orders.map(o => renderOrderCard(o)).join('')}</div>`;

  // Animate card entries with GSAP
  if (window.gsap) {
    gsap.from('.order-card', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out'
    });
  }
});

function renderOrderCard(o) {
  const dateStr = new Date(o.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusMap = {
    pending:    { text: 'En attente', class: 'status-pending' },
    processing: { text: 'En préparation', class: 'status-processing' },
    shipped:    { text: 'Expédiée', class: 'status-shipped' },
    delivered:  { text: 'Livrée', class: 'status-delivered' },
    cancelled:  { text: 'Annulée', class: 'status-cancelled' }
  };
  const st = statusMap[o.status] || { text: o.status, class: 'status-pending' };

  const payMap = {
    orange_money: 'Orange Money',
    mtn_momo:     'MTN MoMo',
    cinetpay:     'CinetPay',
    fedapay:      'FedaPay',
    card:         'Carte Bancaire'
  };
  const paymentLabel = payMap[o.paymentMethod] || o.paymentMethod;

  const delivMap = {
    pickup: 'Retrait en boutique (Gratuit)',
    local: 'Livraison locale (Douala/Yaoundé)',
    interurbain: 'Livraison interurbaine'
  };
  const deliveryLabel = delivMap[o.deliveryOption] || o.deliveryOption;

  return `
    <div class="order-card" id="card-${o.id}">
      <div class="order-card-header" onclick="toggleDetails('${o.id}')">
        <div class="och-left">
          <span class="order-number-badge">${o.orderNumber}</span>
          <span class="order-date">${dateStr}</span>
        </div>
        <div class="och-right">
          <span class="status-badge ${st.class}">${st.text}</span>
          <span class="toggle-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
          </span>
        </div>
      </div>
      
      <div class="order-card-summary">
        <div class="ocs-left">
          <span class="ocs-label">Total de la commande :</span>
          <strong class="ocs-price">${fmtPrice(o.total)}</strong>
        </div>
        <div class="ocs-right">
          <span class="ocs-items-count">${o.items.length} article(s)</span>
        </div>
      </div>

      <div class="order-card-details" style="display:none" id="details-${o.id}">
        <div class="ocd-grid">
          
          <div class="ocd-col">
            <h4>Informations de livraison</h4>
            <p><strong>Mode :</strong> ${deliveryLabel}</p>
            ${o.deliveryCity ? `<p><strong>Ville :</strong> ${o.deliveryCity}</p>` : ''}
            ${o.address ? `<p><strong>Adresse :</strong> ${o.address}</p>` : ''}
            <p><strong>Destinataire :</strong> ${o.firstName} ${o.lastName}</p>
            <p><strong>Téléphone :</strong> ${o.phone}</p>
          </div>

          <div class="ocd-col">
            <h4>Paiement</h4>
            <p><strong>Méthode :</strong> ${paymentLabel}</p>
            <p><strong>Sous-total :</strong> ${fmtPrice(o.subtotal)}</p>
            <p><strong>Frais de livraison :</strong> ${o.deliveryCost ? fmtPrice(o.deliveryCost) : 'Gratuit'}</p>
            <p class="ocd-total-row"><strong>Total payé :</strong> <span class="ocd-total-price">${fmtPrice(o.total)}</span></p>
          </div>

        </div>

        <div class="ocd-items-section">
          <h4>Articles commandés</h4>
          <div class="ocd-items-list">
            ${o.items.map(item => `
              <div class="ocd-item">
                <div class="ocd-item-img" style="background:${item.gradient || 'linear-gradient(135deg,#ede8de,#c8bfb0)'}">
                  ${item.emoji || '👗'}
                </div>
                <div class="ocd-item-info">
                  <div class="ocd-item-name">${item.name}</div>
                  <div class="ocd-item-meta">
                    ${item.size ? `<span>Taille: <strong>${item.size}</strong></span>` : ''}
                    ${item.color ? `<span>Couleur: <strong>${item.color}</strong></span>` : ''}
                    <span>Qté: <strong>${item.qty}</strong></span>
                  </div>
                </div>
                <div class="ocd-item-price">${fmtPrice(item.price * item.qty)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleDetails(orderId) {
  const details = document.getElementById(`details-${orderId}`);
  const card = document.getElementById(`card-${orderId}`);
  if (!details || !card) return;

  const isOpen = details.style.display !== 'none';
  const arrow = card.querySelector('.toggle-arrow svg');

  if (isOpen) {
    // Close
    if (window.gsap) {
      gsap.to(details, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          details.style.display = 'none';
          details.style.height = '';
        }
      });
      gsap.to(arrow, { rotate: 0, duration: 0.3 });
    } else {
      details.style.display = 'none';
    }
    card.classList.remove('expanded');
  } else {
    // Open
    details.style.display = 'block';
    const height = details.scrollHeight;
    details.style.height = '0px';
    details.style.opacity = '0';
    
    if (window.gsap) {
      gsap.to(details, {
        height: height,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          details.style.height = '';
        }
      });
      gsap.to(arrow, { rotate: 180, duration: 0.4 });
    } else {
      details.style.height = '';
      details.style.opacity = '1';
    }
    card.classList.add('expanded');
  }
}
