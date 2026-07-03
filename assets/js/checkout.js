// ============================================================
// ModaAfrik Cameroun — Checkout
// ============================================================
let deliveryOption = '', deliveryCity = '', deliveryCost = 0, paymentMethod = '';

document.addEventListener('DOMContentLoaded', () => {
  renderSummary();
  // Pre-fill if logged in
  const u = Auth.user();
  if (u) {
    const fn = document.getElementById('ckFirstName'); if(fn) fn.value = u.firstName||'';
    const ln = document.getElementById('ckLastName');  if(ln) ln.value = u.lastName||'';
    const em = document.getElementById('ckEmail');     if(em) em.value = u.email||'';
    const ph = document.getElementById('ckPhone');     if(ph) ph.value = u.phone||'';
  }
  // Build city select from Cameroon data
  const sel = document.getElementById('citySelect');
  if (sel && window.CAMEROON_CITIES) {
    sel.innerHTML = '<option value="">— Sélectionner une ville —</option>' +
      Object.entries(CAMEROON_CITIES).map(([k,v]) =>
        `<option value="${k}">${v.label} — ${fmtPrice(v.price)}</option>`
      ).join('');
  }
  // Redirect if cart empty
  if (Cart.count() === 0) { location.href = 'cart.html'; }
});

/* ── ÉTAPES ── */
function goStep(n) {
  if (n === 2) {
    if (!document.getElementById('ckFirstName')?.value.trim() ||
        !document.getElementById('ckLastName')?.value.trim()  ||
        !document.getElementById('ckPhone')?.value.trim()) {
      showToast('Remplissez tous les champs obligatoires', 'error'); return;
    }
  }
  if (n === 3) {
    if (!deliveryOption) { showToast('Choisissez un mode de livraison', 'error'); return; }
    if (deliveryOption === 'interurbain' && !deliveryCity) { showToast('Sélectionnez votre ville', 'error'); return; }
  }
  [1,2,3].forEach(i => {
    document.getElementById(`step${i}`)?.classList.add('hidden');
    const si = document.getElementById(`si${i}`);
    if (!si) return;
    si.classList.remove('active','done');
    if (i < n) si.classList.add('done');
    if (i === n) si.classList.add('active');
  });
  document.getElementById(`step${n}`)?.classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ── LIVRAISON ── */
function selectDelivery(opt) {
  deliveryOption = opt;
  document.querySelectorAll('.delivery-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById(`opt-${opt}`)?.classList.add('selected');

  const citySel    = document.getElementById('citySel');
  const paySection = document.getElementById('step3PaySection');

  if (opt === 'pickup') {
    // Click & Collect = paiement CASH en boutique, pas besoin de paiement en ligne
    citySel?.classList.add('hidden');
    deliveryCity = '';
    deliveryCost = 0;
    // Masquer les méthodes de paiement en ligne, afficher message cash
    if (paySection) {
      paySection.innerHTML = `
        <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:var(--r-lg);padding:20px;text-align:center">
          <div style="font-size:40px;margin-bottom:10px">🏪</div>
          <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#065f46;margin-bottom:6px">Paiement en espèces à la boutique</div>
          <p style="font-size:14px;color:#047857;max-width:360px;margin:0 auto">
            Vous avez choisi le retrait en boutique. Le paiement se fait directement <strong>en cash</strong> lors de votre passage chez le vendeur. Aucun paiement en ligne requis.
          </p>
          <div style="margin-top:14px;padding:10px 16px;background:#fff;border-radius:var(--r-md);font-size:13px;color:#065f46;display:inline-flex;align-items:center;gap:8px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Présentez la confirmation de commande au vendeur
          </div>
        </div>`;
      paymentMethod = 'cash_on_pickup';
    }
  } else {
    citySel?.classList.toggle('hidden', opt !== 'interurbain');
    if (opt !== 'interurbain') { deliveryCity = ''; }
    deliveryCost = opt === 'local' ? 1000 : 0;
    // Restaurer les méthodes de paiement en ligne
    if (paySection) paySection.innerHTML = buildPayMethodsHTML();
    paymentMethod = '';
  }
  renderSummary();
}

function buildPayMethodsHTML() {
  return `
    <div class="pay-methods">
      <label class="payment-opt" id="pay-orange_money" onclick="selectPayment('orange_money')">
        <input type="radio" name="payment" value="orange_money"/>
        <div class="pm-logo" style="background:#FF6600"><span style="color:#fff;font-weight:800;font-size:13px">OM</span></div>
        <div class="pm-info"><strong>Orange Money</strong><small>+237 Orange CM</small></div>
      </label>
      <label class="payment-opt" id="pay-mtn_momo" onclick="selectPayment('mtn_momo')">
        <input type="radio" name="payment" value="mtn_momo"/>
        <div class="pm-logo" style="background:#FFCC00"><span style="color:#000;font-weight:800;font-size:11px">MTN</span></div>
        <div class="pm-info"><strong>MTN MoMo</strong><small>+237 MTN CM</small></div>
      </label>
      <label class="payment-opt" id="pay-cinetpay" onclick="selectPayment('cinetpay')">
        <input type="radio" name="payment" value="cinetpay"/>
        <div class="pm-logo" style="background:#003087"><span style="color:#fff;font-weight:800;font-size:12px">CP</span></div>
        <div class="pm-info"><strong>CinetPay</strong><small>Carte / Mobile</small></div>
      </label>
      <label class="payment-opt" id="pay-fedapay" onclick="selectPayment('fedapay')">
        <input type="radio" name="payment" value="fedapay"/>
        <div class="pm-logo" style="background:#00875A"><span style="color:#fff;font-weight:800;font-size:12px">FP</span></div>
        <div class="pm-info"><strong>FedaPay</strong><small>Carte / Mobile</small></div>
      </label>
    </div>
    <div id="formMobile" class="pay-form hidden"></div>
    <div id="formCard"   class="pay-form hidden"></div>`;
}

function updateShipping() {
  deliveryCity = document.getElementById('citySelect')?.value || '';
  if (!deliveryCity) { deliveryCost = 0; renderSummary(); return; }
  const rate = window.CAMEROON_CITIES?.[deliveryCity];
  deliveryCost = rate?.price || 2500;
  const infoBox = document.getElementById('cityInfoBox');
  const infoTxt = document.getElementById('cityInfoTxt');
  if (infoBox && infoTxt && rate) {
    infoTxt.textContent = `Expédition vers ${rate.label} — ${fmtPrice(deliveryCost)}`;
    infoBox.classList.remove('hidden');
  }
  renderSummary();
}

/* ── PAIEMENT ── */
function selectPayment(method) {
  paymentMethod = method;
  document.querySelectorAll('.payment-opt').forEach(el => el.classList.remove('selected'));
  document.getElementById(`pay-${method}`)?.classList.add('selected');
  document.querySelectorAll('.pay-form').forEach(el => el.classList.add('hidden'));
  if (['orange_money','mtn_momo'].includes(method)) {
    const fm = document.getElementById('formMobile');
    fm?.classList.remove('hidden');
    const lbl = document.getElementById('mobileLabel');
    if (lbl) lbl.textContent = method === 'orange_money' ? 'Numéro Orange Money (+237)' : 'Numéro MTN MoMo (+237)';
    const ph = document.getElementById('mmPhone');
    if (ph) ph.placeholder = '+237 6XX XXX XXX';
  } else {
    document.getElementById('formCard')?.classList.remove('hidden');
  }
}

/* ── RÉCAPITULATIF ── */
function renderSummary() {
  const items = Cart.get();
  const sub   = Cart.subtotal();
  const total = sub + deliveryCost;

  const container = document.getElementById('summaryItems');
  if (container) {
    container.innerHTML = items.map(i => `
    <div class="s-item">
      <div class="s-img" style="background:${i.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">
        ${i.emoji||'👗'}<span class="s-qty">${i.qty}</span>
      </div>
      <div class="s-name">${i.name}<br><small style="color:var(--text-3)">${[i.size,i.color].filter(Boolean).join(' · ')}</small></div>
      <div class="s-price">${fmtPrice(i.price*i.qty)}</div>
    </div>`).join('');
  }

  const sub_el   = document.getElementById('sumSub');   if(sub_el)   sub_el.textContent   = fmtPrice(sub);
  const ship_el  = document.getElementById('sumShip');  if(ship_el)  ship_el.textContent  = deliveryCost ? fmtPrice(deliveryCost) : (deliveryOption==='pickup'?'Gratuit':'—');
  const total_el = document.getElementById('sumTotal'); if(total_el) total_el.textContent = fmtPrice(total);
  const btn_el   = document.getElementById('btnTotal'); if(btn_el)   btn_el.textContent   = fmtPrice(total);
}

/* ── TRAITEMENT PAIEMENT ── */
async function processPayment() {
  // Cash on pickup : pas de paiement en ligne
  if (paymentMethod === 'cash_on_pickup') {
    if (!document.getElementById('cgv')?.checked) { showToast('Veuillez accepter les conditions générales', 'error'); return; }
  } else {
    if (!document.getElementById('cgv')?.checked) { showToast('Veuillez accepter les conditions générales', 'error'); return; }
    if (!paymentMethod) { showToast('Choisissez une méthode de paiement', 'error'); return; }
    if (['orange_money','mtn_momo'].includes(paymentMethod)) {
      const phone = document.getElementById('mmPhone')?.value.trim();
      if (!phone || phone.length < 8) { showToast('Entrez un numéro de téléphone valide (+237 6XX XXX XXX)', 'error'); return; }
    }
  }

  const btn = document.getElementById('btnPay');
  const txt = document.getElementById('btnPayTxt');
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = 'Traitement en cours…';

  const items      = Cart.get();
  const sub        = Cart.subtotal();
  const total      = sub + deliveryCost;
  const orderRef   = 'MA-' + Date.now();
  const user       = Auth.user();

  const payload = {
    items: items.map(i => ({ productId:i.productId, qty:i.qty, size:i.size, color:i.color, name:i.name, price:i.price, emoji:i.emoji, gradient:i.gradient, vendorId:i.vendorId })),
    deliveryOption, deliveryCity, deliveryCost,
    subtotal: sub, total,
    paymentMethod, orderRef,
    firstName: document.getElementById('ckFirstName')?.value || user?.firstName || '',
    lastName:  document.getElementById('ckLastName')?.value  || user?.lastName  || '',
    email:     document.getElementById('ckEmail')?.value     || user?.email     || '',
    phone:     document.getElementById('ckPhone')?.value     || user?.phone     || '',
    address:   document.getElementById('ckAddress')?.value   || '',
    city:      document.getElementById('ckCity')?.value      || deliveryCity   || '',
    customerId:user?.id || 'guest',
    status:    paymentMethod === 'cash_on_pickup' ? 'pending' : 'awaiting_payment',
    commission: Math.round(sub * 0.10),
    vendorAmount: Math.round(sub * 0.90),
  };

  // ── Paiement en ligne ──
  if (paymentMethod !== 'cash_on_pickup') {
    try {
      let payResult = null;

      if (paymentMethod === 'orange_money') {
        const phone = document.getElementById('mmPhone')?.value.trim();
        payResult = await Api.post('/payment/orange-money/initiate', { phone, amount:total, orderRef, description:'Commande ModaAfrik '+orderRef });
        if (payResult.success && !payResult.simulated && payResult.paymentUrl) {
          // Sauvegarder commande avant redirection
          saveOrderLocally(payload, orderRef);
          window.location.href = payResult.paymentUrl;
          return;
        }
        if (payResult.simulated) showToast('⚠️ Mode test Orange Money — Vérifiez vos clés API', 'default', 6000);
      }

      else if (paymentMethod === 'mtn_momo') {
        const phone = document.getElementById('mmPhone')?.value.trim();
        payResult = await Api.post('/payment/mtn-momo/initiate', { phone, amount:total, orderRef, description:'Commande ModaAfrik '+orderRef });
        if (payResult.success) {
          if (payResult.simulated) showToast('⚠️ Mode test MTN MoMo', 'default', 4000);
          else {
            showToast('📱 Notification envoyée sur votre téléphone. Validez le paiement.', 'success', 8000);
            // Attendre confirmation (polling)
            await waitMTNConfirmation(payResult.referenceId, orderRef, payload, btn, txt);
            return;
          }
        }
      }

      else if (paymentMethod === 'cinetpay') {
        payResult = await Api.post('/payment/cinetpay/initiate', {
          amount: total, orderRef,
          customerName:  (payload.firstName + ' ' + payload.lastName).trim(),
          customerEmail: payload.email, customerPhone: payload.phone,
          description:   'Commande ModaAfrik ' + orderRef,
        });
        if (payResult.success && !payResult.simulated && payResult.paymentUrl) {
          saveOrderLocally(payload, orderRef);
          window.open(payResult.paymentUrl, '_blank');
          // Afficher instruction
          document.getElementById('confirmMsg').textContent = 'Complétez le paiement dans l\'onglet CinetPay qui vient de s\'ouvrir.';
          finalizeOrder(orderRef, payload);
          return;
        }
        if (payResult.simulated) showToast('⚠️ Mode test CinetPay', 'default', 4000);
      }

      else if (paymentMethod === 'fedapay') {
        payResult = await Api.post('/payment/fedapay/initiate', {
          amount: total, orderRef,
          customerFirstname: payload.firstName, customerLastname: payload.lastName,
          customerEmail: payload.email, customerPhone: payload.phone,
        });
        if (payResult.success && !payResult.simulated && payResult.paymentUrl) {
          saveOrderLocally(payload, orderRef);
          window.open(payResult.paymentUrl, '_blank');
          document.getElementById('confirmMsg').textContent = 'Complétez le paiement dans l\'onglet FedaPay qui vient de s\'ouvrir.';
          finalizeOrder(orderRef, payload);
          return;
        }
        if (payResult.simulated) showToast('⚠️ Mode test FedaPay', 'default', 4000);
      }
    } catch (e) {
      console.warn('[Payment] API error, continuing locally:', e.message);
    }
  }

  // Finaliser la commande
  finalizeOrder(orderRef, payload);
}

async function waitMTNConfirmation(referenceId, orderRef, payload, btn, txt) {
  const MAX_TRIES = 12; // 60 secondes
  let tries = 0;
  if (txt) txt.textContent = 'En attente de confirmation MTN…';

  const check = async () => {
    tries++;
    try {
      const r = await Api.get('/payment/mtn-momo/status/' + referenceId);
      if (r.status === 'SUCCESSFUL') {
        finalizeOrder(orderRef, payload);
        return;
      } else if (r.status === 'FAILED') {
        if (btn) btn.disabled = false;
        if (txt) txt.textContent = 'Confirmer la commande';
        showToast('Paiement MTN échoué. Réessayez.', 'error');
        return;
      }
    } catch {}
    if (tries < MAX_TRIES) {
      setTimeout(check, 5000);
    } else {
      // Timeout — on laisse quand même finaliser avec statut "pending"
      showToast('Délai dépassé. La commande sera confirmée à réception du paiement.', 'default', 6000);
      finalizeOrder(orderRef, payload);
    }
  };
  setTimeout(check, 5000);
}

function saveOrderLocally(payload, orderRef) {
  const orders = JSON.parse(localStorage.getItem('ma_client_orders') || '[]');
  orders.unshift({ ...payload, id:orderRef, orderNumber:orderRef, createdAt:new Date().toISOString() });
  localStorage.setItem('ma_client_orders', JSON.stringify(orders));
}

function finalizeOrder(orderRef, payload) {
  // Sauvegarder commande
  const items = Cart.get();
  const orderData = {
    ...payload, id:orderRef, orderNumber:orderRef,
    items: items.length ? items : payload.items,
    status: paymentMethod === 'cash_on_pickup' ? 'pending' : 'processing',
    createdAt: new Date().toISOString(),
  };

  // Via API
  Auth.isLoggedIn() && Api.orders.create(payload).catch(() => {});

  // Local
  const orders = JSON.parse(localStorage.getItem('ma_client_orders') || '[]');
  if (!orders.find(o => o.id === orderRef)) orders.unshift(orderData);
  localStorage.setItem('ma_client_orders', JSON.stringify(orders));

  Cart.clear();

  // Afficher confirmation
  const modal = document.getElementById('confirmModal');
  const onEl  = document.getElementById('orderNum');
  const pmEl  = document.getElementById('payMethodConfirm');
  if (modal) modal.classList.remove('hidden');
  if (onEl)  onEl.textContent  = orderRef;
  if (pmEl)  pmEl.textContent  = payMethodLabel(paymentMethod);

  const btn = document.getElementById('btnPay');
  const txt = document.getElementById('btnPayTxt');
  if (btn) { btn.disabled = false; }
  if (txt) { txt.textContent = 'Confirmer la commande'; }
}

  const btn = document.getElementById('btnPay');
  if (btn) { btn.disabled = true; btn.querySelector('#btnPayTxt').textContent = 'Traitement en cours…'; }

  const items = Cart.get().map(i => ({productId:i.productId, qty:i.qty, size:i.size, color:i.color}));
  const payload = {
    items, deliveryOption, deliveryCity, paymentMethod,
    firstName: document.getElementById('ckFirstName')?.value||'',
    lastName:  document.getElementById('ckLastName')?.value||'',
    email:     document.getElementById('ckEmail')?.value||'',
    phone:     document.getElementById('ckPhone')?.value||'',
    address:   document.getElementById('ckAddress')?.value||'',
    city:      document.getElementById('ckCity')?.value||'',
  };

  try {
    let orderNum;
    const token = Auth.token();
    const isLocalUser = token && token.startsWith('local_');

    if (Auth.isLoggedIn() && !isLocalUser) {
      try {
        const res = await Api.orders.create(payload);
        orderNum  = res.order.orderNumber;
        saveOrderLocally(res.order);
      } catch (err) {
        console.warn('API order creation failed, using local fallback:', err);
        orderNum = saveLocalOrderFallback(payload);
      }
    } else {
      orderNum = saveLocalOrderFallback(payload);
    }

  const itemsSnapshot = Cart.get(); // snapshot avant clear
  Cart.clear();

  // Sauvegarder la commande dans l'historique client
  try {
    const clientOrders = JSON.parse(localStorage.getItem('ma_client_orders') || '[]');
    clientOrders.unshift({
      id:             orderNum,
      orderNumber:    orderNum,
      items:          itemsSnapshot.map(i => ({
        name: i.name, qty: i.qty, price: i.price,
        size: i.size, color: i.color,
        emoji: i.emoji, gradient: i.gradient,
      })),
      deliveryOption, deliveryCity, deliveryCost,
      subtotal:       itemsSnapshot.reduce((s,i) => s + i.price*i.qty, 0),
      total:          itemsSnapshot.reduce((s,i) => s + i.price*i.qty, 0) + deliveryCost,
      paymentMethod,
      status:         'pending',
      firstName:      payload.firstName,
      lastName:       payload.lastName,
      phone:          payload.phone,
      address:        payload.address,
      city:           payload.city,
      createdAt:      new Date().toISOString(),
    });
    localStorage.setItem('ma_client_orders', JSON.stringify(clientOrders));
  } catch {}

  const modal = document.getElementById('confirmModal');
    const onEl  = document.getElementById('orderNum');
    const pmEl  = document.getElementById('payMethodConfirm');
    if (modal) modal.classList.remove('hidden');
    if (onEl)  onEl.textContent  = orderNum;
    if (pmEl)  pmEl.textContent  = payMethodLabel(paymentMethod);
  } catch(e) {
    showToast(e.message || 'Erreur de paiement, réessayez.', 'error');
    if (btn) { btn.disabled=false; btn.querySelector('#btnPayTxt').textContent='Confirmer et payer'; }
  }
}

/* ── LOCAL FALLBACK HELPERS ── */
function saveOrderLocally(order) {
  try {
    const localOrders = JSON.parse(localStorage.getItem('ma_orders') || '[]');
    if (!localOrders.some(o => o.id === order.id)) {
      localOrders.push(order);
      localStorage.setItem('ma_orders', JSON.stringify(localOrders));
    }
  } catch(e) {
    console.error('Error saving order locally:', e);
  }
}

function saveLocalOrderFallback(payload) {
  const localOrders = JSON.parse(localStorage.getItem('ma_orders') || '[]');
  const nextNum = localOrders.length + 1;
  const orderNumber = 'MA-' + String(nextNum).padStart(5, '0');
  
  const enrichedItems = Cart.get().map(i => ({
    productId: i.productId || i.id,
    name: i.name,
    qty: i.qty,
    price: i.price,
    size: i.size || '',
    color: i.color || '',
    vendorId: i.vendorId || 'usr-002',
    emoji: i.emoji || '👗',
    gradient: i.gradient || ''
  }));

  const subtotal = Cart.subtotal();
  const total = subtotal + deliveryCost;
  const commission = Math.round(subtotal * 0.10);
  const vendorAmount = subtotal - commission;
  const u = Auth.user() || {};

  const order = {
    id: 'ord-' + Date.now(),
    orderNumber,
    customerId: u.id || 'usr-010',
    items: enrichedItems,
    deliveryOption,
    deliveryCity,
    deliveryCost,
    subtotal,
    total,
    commission,
    vendorAmount,
    paymentMethod,
    status: 'pending',
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    address: payload.address,
    createdAt: new Date().toISOString()
  };

  localOrders.push(order);
  localStorage.setItem('ma_orders', JSON.stringify(localOrders));
  return orderNumber;
}

function payMethodLabel(m) {
  return {orange_money:'Orange Money',mtn_momo:'MTN MoMo',cinetpay:'CinetPay',fedapay:'FedaPay'}[m]||m;
}

/* ── CARD FORMATTING ── */
function fmtCard(inp) {
  inp.value = inp.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim();
  const prev = document.getElementById('prevNum');
  if (prev) prev.textContent = inp.value || '•••• •••• •••• ••••';
}
function fmtExp(inp) {
  inp.value = inp.value.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1/$2');
  const prev = document.getElementById('prevExp');
  if (prev) prev.textContent = inp.value || 'MM/AA';
}
function updateCardName(inp) {
  const prev = document.getElementById('prevName');
  if (prev) prev.textContent = inp.value.toUpperCase()||'NOM DU TITULAIRE';
}
