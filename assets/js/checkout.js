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
  const citySel = document.getElementById('citySel');
  if (opt === 'interurbain') {
    citySel?.classList.remove('hidden');
    deliveryCost = 0;
  } else {
    citySel?.classList.add('hidden');
    deliveryCity = '';
    deliveryCost = opt === 'local' ? 1000 : 0;
    renderSummary();
  }
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
  if (!document.getElementById('cgv')?.checked) { showToast('Veuillez accepter les conditions générales', 'error'); return; }
  if (!paymentMethod) { showToast('Choisissez une méthode de paiement', 'error'); return; }
  if (paymentMethod === 'orange_money' || paymentMethod === 'mtn_momo') {
    const phone = document.getElementById('mmPhone')?.value.trim();
    if (!phone || !phone.startsWith('+237')) { showToast('Entrez un numéro camerounais valide (+237 6XX XXX XXX)', 'error'); return; }
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
    if (Auth.isLoggedIn()) {
      const res = await Api.orders.create(payload);
      orderNum  = res.order.orderNumber;
    } else {
      orderNum = 'MA-' + String(Date.now()).slice(-5);
    }
    Cart.clear();
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
