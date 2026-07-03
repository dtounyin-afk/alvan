// ============================================================
// ModaAfrik Cameroun — Cart Page
// ============================================================
document.addEventListener('DOMContentLoaded', renderCart);
window.addEventListener('cartUpdated', renderCart);

function renderCart() {
  const items = Cart.get();
  const root  = document.getElementById('cartRoot');
  if (!root) return;

  if (!items.length) {
    root.innerHTML = `
    <div class="cart-empty">
      <span class="cart-empty-icon">🛒</span>
      <h2>Votre panier est vide</h2>
      <p>Découvrez nos créations camerounaises uniques</p>
      <a href="shop.html" class="btn-primary">Explorer la boutique →</a>
    </div>`;
    return;
  }

  const sub = Cart.subtotal();
  root.innerHTML = `
  <div class="cart-layout">
    <div class="cart-items">
      ${items.map(item => `
      <div class="cart-item">
        <div class="ci-img" style="background:${item.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${item.emoji||'👗'}</div>
        <div>
          <div class="ci-vendor">✦ Vendeur ModaAfrik</div>
          <div class="ci-name">${item.name}</div>
          <div class="ci-variant">${[item.size, item.color].filter(Boolean).join(' · ')||'—'}</div>
          <div class="ci-controls">
            <div class="ci-qty">
              <button onclick="Cart.updateQty('${item.key}', ${item.qty - 1})">−</button>
              <input type="number" value="${item.qty}" min="1"
                onchange="Cart.updateQty('${item.key}', Number(this.value))"/>
              <button onclick="Cart.updateQty('${item.key}', ${item.qty + 1})">+</button>
            </div>
            <button class="ci-remove" onclick="Cart.remove('${item.key}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Supprimer
            </button>
          </div>
        </div>
        <div class="ci-price">${fmtPrice(item.price * item.qty)}</div>
      </div>`).join('')}
    </div>

    <div class="cart-sidebar">
      <h3>Récapitulatif</h3>
      <div class="cs-row">
        <span>Sous-total (${Cart.count()} article${Cart.count()>1?'s':''})</span>
        <span>${fmtPrice(sub)}</span>
      </div>
      <div class="cs-row">
        <span>Livraison</span>
        <span style="color:var(--text-3)">Calculée au checkout</span>
      </div>
      <div class="cs-total"><span>Total</span><span>${fmtPrice(sub)}</span></div>

      <div class="coupon-row">
        <input type="text" id="couponInput" placeholder="Code promo"/>
        <button onclick="applyCoupon()">Appliquer</button>
      </div>

      <a href="checkout.html" class="btn-checkout">Passer la commande →</a>
      <a href="shop.html" class="cart-continue">← Continuer les achats</a>

      <div class="cart-trust">
        <div class="cart-trust-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Paiement 100% sécurisé
        </div>
        <div class="cart-trust-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Livraison partout au Cameroun
        </div>
        <div class="cart-trust-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Retour sous 7 jours
        </div>
      </div>
    </div>
  </div>`;

  // GSAP entrance
  if (window.gsap) {
    gsap.from('.cart-item',    { opacity:0, x:-16, duration:.4, stagger:.07, ease:'power3.out' });
    gsap.from('.cart-sidebar', { opacity:0, x:16,  duration:.5, ease:'power3.out', delay:.15 });
  }
}

function applyCoupon() {
  const code = document.getElementById('couponInput')?.value.trim().toUpperCase();
  if (code === 'MODACAM10') showToast('Code promo appliqué : -10% !', 'success');
  else showToast('Code promo invalide', 'error');
}
