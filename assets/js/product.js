// ============================================================
// ModaAfrik Cameroun — Product Page
// ============================================================
let currentProduct = null;
let selectedSize   = '';
let selectedColor  = '';
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('scroll', () =>
    document.getElementById('header')?.classList.toggle('scrolled', scrollY > 40), { passive: true });

  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = 'shop.html'; return; }
  await loadProduct(id);
});

/* ── CHARGEMENT PRODUIT ── */
async function loadProduct(id) {
  // 1. API backend
  try {
    const data = await Api.products.get(id);
    if (data.product) currentProduct = data.product;
  } catch {}

  // 2. LocalStore — produits approuvés uniquement (publiés par vendeur)
  if (!currentProduct) {
    const approved = LocalStore.getApprovedProducts();
    const found    = approved.find(p => p.id === id);
    if (found) {
      currentProduct = {
        ...found,
        reviews: JSON.parse(localStorage.getItem('ma_reviews_' + id) || '[]'),
        vendor: found.vendor || {
          storeName: found.storeName || 'Boutique',
          storeCity: found.storeCity || 'Cameroun',
          rating: found.rating || 0,
        },
      };
    }
  }

  // 3. Pas trouvé (produit non approuvé ou inexistant)
  if (!currentProduct) {
    if (layout) layout.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 20px">
        <div style="font-size:64px;margin-bottom:16px">🔍</div>
        <h3 style="font-family:'Syne',sans-serif;font-size:22px;margin-bottom:8px;color:var(--text)">Produit introuvable</h3>
        <p style="color:var(--text-2);margin-bottom:20px">Ce produit n'existe pas ou a été supprimé.</p>
        <a href="shop.html" class="btn-primary">← Retour à la boutique</a>
      </div>`;
    return;
  }

  renderProduct(currentProduct);
  renderReviews(currentProduct.reviews || []);
  renderRelated(currentProduct);

  // GSAP entrance
  window.addEventListener('load', () => {
    if (!window.gsap) return;
    gsap.from('.product-gallery', { opacity:0, x:-30, duration:.6, ease:'power3.out' });
    gsap.from('.product-info > *',{ opacity:0, y:20, duration:.5, stagger:.07, ease:'power3.out', delay:.1 });
  });
}

/* ── RENDU PRODUIT ── */
function renderProduct(p) {
  const price    = p.salePrice || p.price;
  const discount = p.salePrice ? Math.round((1 - p.salePrice/p.price)*100) : 0;
  document.title = `${p.name} — ModaAfrik Cameroun`;

  // Breadcrumb
  const bc = document.getElementById('breadcrumb');
  if (bc) bc.innerHTML = `
    <a href="index.html">Accueil</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
    <a href="shop.html">Boutique</a>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
    <span>${p.name}</span>`;

  const layout = document.getElementById('productLayout');
  if (!layout) return;

  // Thumbs (on simule avec l'emoji principal)
  const thumbs = [p.emoji||'👗','✨','🎀','🌟'].map((e,i) =>
    `<div class="g-thumb ${i===0?'active':''}" onclick="switchThumb(this,'${e}','${p.gradient||''}')">${e}</div>`).join('');

  // Colors
  const colorMap = { 'noir':'#111', 'blanc':'#fff', 'rouge':'#dc2626', 'bleu':'#2563eb', 'vert':'#16a34a',
    'or':'#d97706', 'or jaune':'#d97706', 'indigo':'#4338ca', 'camel':'#a16207',
    'marron':'#78350f', 'multicolore':'linear-gradient(135deg,#e67e22,#27ae60,#3498db)',
    'bleu/blanc':'#2563eb', 'rouge/jaune':'#dc2626', 'rose/gold':'#ec4899', 'bordeaux':'#881337' };

  const colorsHtml = p.colors?.length ? `
  <div class="pi-variants">
    <div class="pv-label">Couleur : <span id="colorLabel">${p.colors[0]}</span></div>
    <div class="color-swatches">
      ${p.colors.map((c,i) => `<div class="cs-dot ${i===0?'active':''}" title="${c}"
        style="background:${colorMap[c.toLowerCase()]||'#ccc'}"
        onclick="selectColor(this,'${c}')"></div>`).join('')}
    </div>
  </div>` : '';

  const sizesHtml = p.sizes?.length ? `
  <div class="pi-variants" style="margin-top:16px">
    <div class="pv-label">Taille : <span id="sizeLabel">${p.sizes[0]}</span></div>
    <div class="size-buttons">
      ${p.sizes.map((s,i) => `<button class="sz-btn ${i===0?'active':''}" onclick="selectSize(this,'${s}')">${s}</button>`).join('')}
    </div>
  </div>` : '';

  const stock = p.stock || 0;
  const stockBadge = stock > 5
    ? `<span style="font-size:12px;color:var(--green);margin-left:auto;font-weight:600">● En stock (${stock})</span>`
    : stock > 0
    ? `<span style="font-size:12px;color:#f59e0b;margin-left:auto;font-weight:600">⚠ Dernières pièces (${stock})</span>`
    : `<span style="font-size:12px;color:var(--red);margin-left:auto;font-weight:600">Rupture de stock</span>`;

  layout.innerHTML = `
  <div class="product-gallery">
    <div class="gallery-main" id="galleryMain">
      <div class="gallery-main-bg" id="mainBg" style="background:${p.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'};font-size:110px">${p.emoji||'👗'}</div>
      <span class="gallery-zoom-hint">🔍 Zoom</span>
    </div>
    <div class="gallery-thumbs">${thumbs}</div>
  </div>

  <div class="product-info">
    <div class="pi-vendor">
      <div class="pi-vendor-av">${p.vendor?.storeName?.[0]||'V'}</div>
      <a href="vendor.html?id=${p.vendorId}" class="pi-vendor-name">✦ ${p.vendor?.storeName||'Boutique'}</a>
      <span class="pi-verified">✓ Vérifié</span>
    </div>

    <h1 class="pi-title">${p.name}</h1>

    <div class="pi-rating">
      <span class="pi-stars">${'★'.repeat(Math.round(p.rating||0))}${'☆'.repeat(5-Math.round(p.rating||0))}</span>
      <span class="pi-reviews">${p.rating?.toFixed(1)||'0.0'} · ${p.reviewCount||0} avis</span>
      ${stockBadge}
    </div>

    <div class="pi-price">
      <span class="pi-price-main">${fmtPrice(price)}</span>
      ${p.salePrice ? `<span class="pi-price-old">${fmtPrice(p.price)}</span><span class="pi-price-disc">-${discount}%</span>` : ''}
    </div>

    ${colorsHtml}
    ${sizesHtml}

    <div class="pi-actions">
      <div class="pi-qty">
        <button onclick="changeQty(-1)">−</button>
        <input type="number" id="qtyInput" value="1" min="1" max="${stock||99}"/>
        <button onclick="changeQty(1)">+</button>
      </div>
      <button class="btn-primary pi-add-btn" onclick="addToCart()" ${!stock?'disabled':''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Ajouter au panier
      </button>
      <button class="pi-wish-btn" id="wishBtn" onclick="toggleWish()" title="Favoris">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>

    <div class="pi-delivery">
      <div class="pd-row">
        <span class="pd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg></span>
        <div><strong style="font-size:13px">Retrait en boutique</strong><div style="font-size:12px;color:var(--text-3)">${p.vendor?.storeCity||'Cameroun'} · disponible sous 2h</div></div>
        <span class="pd-free">Gratuit</span>
      </div>
      <div class="pd-row">
        <span class="pd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1l-5 8h9.8"/><path d="M12 6h5l-2 8"/></svg></span>
        <div><strong style="font-size:13px">Livraison même ville</strong><div style="font-size:12px;color:var(--text-3)">Sous 24h</div></div>
        <span style="font-weight:700;font-size:13px;color:var(--text-2)">1 000 FCFA</span>
      </div>
      <div class="pd-row">
        <span class="pd-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
        <div><strong style="font-size:13px">Expédition interurbaine</strong><div style="font-size:12px;color:var(--text-3)">2–5 jours ouvrés</div></div>
        <span style="font-weight:700;font-size:13px;color:var(--text-2)">dès 2 000 FCFA</span>
      </div>
    </div>
  </div>`;

  // Set defaults
  selectedSize  = p.sizes?.[0]  || '';
  selectedColor = p.colors?.[0] || '';

  // Description tab
  const tabDesc = document.getElementById('tab-desc');
  if (tabDesc) tabDesc.innerHTML = `
    <p style="font-size:15px;color:var(--text-2);line-height:1.8">${p.description || p.shortDesc || 'Aucune description disponible.'}</p>
    ${p.sizes?.length ? `<div style="margin-top:16px"><strong style="font-size:13px">Tailles disponibles :</strong> <span style="color:var(--text-2)">${p.sizes.join(', ')}</span></div>` : ''}
    ${p.colors?.length ? `<div style="margin-top:8px"><strong style="font-size:13px">Couleurs disponibles :</strong> <span style="color:var(--text-2)">${p.colors.join(', ')}</span></div>` : ''}`;

  // Vendor tab
  const tabVendor = document.getElementById('tab-vendor');
  if (tabVendor) tabVendor.innerHTML = `
    <div style="display:flex;gap:18px;align-items:flex-start;padding:18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--shadow-card)">
      <div style="width:54px;height:54px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--bg);flex-shrink:0">${p.vendor?.storeName?.[0]||'V'}</div>
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;margin-bottom:4px">${p.vendor?.storeName||'Boutique'}</div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:4px">📍 ${p.vendor?.storeCity||'Cameroun'}</div>
        <div style="font-size:13px;color:#f59e0b;margin-bottom:12px">★ ${p.vendor?.rating?.toFixed(1)||'5.0'}</div>
        <a href="vendor.html?id=${p.vendorId}" class="btn-outline btn-sm">Voir la boutique →</a>
      </div>
    </div>`;
}

/* ── INTERACTIONS ── */
function switchThumb(el, emoji, gradient) {
  document.querySelectorAll('.g-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const bg = document.getElementById('mainBg');
  if (bg) { bg.textContent = emoji; if (gradient) bg.style.background = gradient; }
}

function selectColor(el, color) {
  document.querySelectorAll('.cs-dot').forEach(e => { e.classList.remove('active'); e.style.borderColor='transparent'; });
  el.classList.add('active'); el.style.borderColor = 'var(--text)';
  selectedColor = color;
  const lbl = document.getElementById('colorLabel'); if(lbl) lbl.textContent = color;
}

function selectSize(el, size) {
  document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedSize = size;
  const lbl = document.getElementById('sizeLabel'); if(lbl) lbl.textContent = size;
}

function changeQty(d) {
  const inp = document.getElementById('qtyInput');
  if (!inp) return;
  inp.value = Math.max(1, Math.min(Number(inp.max)||99, Number(inp.value)+d));
}

function addToCart() {
  if (!currentProduct) return;
  const qty = Number(document.getElementById('qtyInput')?.value) || 1;
  Cart.add(currentProduct, qty, selectedSize, selectedColor);
}

function toggleWish() {
  const btn = document.getElementById('wishBtn');
  const w   = JSON.parse(localStorage.getItem('ma_wishlist')||'[]');
  const i   = w.indexOf(currentProduct.id);
  if (i>=0) { w.splice(i,1); btn.classList.remove('active'); btn.querySelector('svg').setAttribute('fill','none'); }
  else       { w.push(currentProduct.id); btn.classList.add('active'); btn.querySelector('svg').setAttribute('fill','#ef4444'); }
  localStorage.setItem('ma_wishlist', JSON.stringify(w));
}

/* ── AVIS ── */
function renderReviews(reviews) {
  const cnt = document.getElementById('rvCount'); if(cnt) cnt.textContent = reviews.length;
  const list = document.getElementById('reviewsList');
  if (!list) return;
  if (!reviews.length) {
    list.innerHTML = '<p style="color:var(--text-3);font-size:14px;padding:12px 0">Aucun avis pour l\'instant. Soyez le premier !</p>';
    return;
  }
  list.innerHTML = reviews.map(r => `
  <div class="review-card">
    <div class="review-header">
      <div class="review-av">${r.userName?.[0]||'?'}</div>
      <div><div class="review-user">${r.userName}</div><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div></div>
      <div class="review-date">${new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
    </div>
    <div class="review-text">${r.comment}</div>
  </div>`).join('');
}

function setRating(n) {
  selectedRating = n;
  document.querySelectorAll('.star-input span').forEach((s,i) => s.classList.toggle('lit', i < n));
}

async function submitReview() {
  if (!selectedRating) { showToast('Choisissez une note', 'error'); return; }
  const comment = document.getElementById('rvText')?.value.trim();
  if (!comment)  { showToast('Écrivez votre avis', 'error'); return; }
  if (!Auth.isLoggedIn()) { location.href = 'auth.html?redirect=' + encodeURIComponent(location.href); return; }
  try {
    await Api.products.addReview(currentProduct.id, { rating: selectedRating, comment });
  } catch {}
  // Ajouter localement
  const user = Auth.user();
  const newR = { id:'rv-'+Date.now(), productId:currentProduct.id, userId:user.id,
    userName:`${user.firstName} ${user.lastName?.[0]}.`, rating:selectedRating, comment, createdAt:new Date().toISOString() };
  if (!currentProduct.reviews) currentProduct.reviews = [];
  currentProduct.reviews.unshift(newR);
  renderReviews(currentProduct.reviews);
  showToast('Avis publié !', 'success');
  const txt = document.getElementById('rvText'); if(txt) txt.value = '';
  setRating(0);
}

/* ── ONGLETS ── */
function openTab(btn, id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  btn.classList.add('active');
  document.getElementById(`tab-${id}`)?.classList.remove('hidden');
}

/* ── PRODUITS SIMILAIRES ── */
function renderRelated(p) {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;
  const local  = window.LocalStore?.getProducts() || [];
  const mocks  = window.MOCK_PRODUCTS || [];
  const all    = [...local, ...mocks];
  const related= all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  if (!related.length) { grid.parentElement?.classList.add('hidden'); return; }
  grid.innerHTML = related.map(rp => {
    const price = rp.salePrice || rp.price;
    return `<div class="product-card" onclick="location.href='product.html?id=${rp.id}'">
      <div class="product-img">
        <div class="product-img-bg" style="background:${rp.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${rp.emoji||'👗'}</div>
        <div class="product-quick-add" onclick="event.stopPropagation();Cart.add(${JSON.stringify(rp).replace(/"/g,'&quot;')},1,'','')">+ Ajouter</div>
      </div>
      <div class="product-body">
        <div class="product-name">${rp.name}</div>
        <div class="product-price-row"><span class="price-main">${fmtPrice(price)}</span></div>
      </div>
    </div>`;
  }).join('');
}
