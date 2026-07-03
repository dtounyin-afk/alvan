// ============================================================
// ModaAfrik Cameroun — Home Page
// La vitrine n'affiche que les éléments approuvés par l'admin
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadHomeData();
});

window.addEventListener('load', () => {
  initGSAP();
});

async function loadHomeData() {
  // Produits approuvés par l'admin (localStorage clé 'ma_approved_products')
  const approvedProducts = LocalStore.getApprovedProducts();
  const approvedVendors  = LocalStore.getApprovedVendors();

  // Essayer l'API backend
  try {
    const [featRes, newRes, venRes] = await Promise.all([
      Api.products.featured(),
      Api.products.newArrivals(),
      Api.vendors.list(),
    ]);
    if (featRes.products?.length) renderCollections(featRes.products, 'featuredGrid');
    else renderCollections(approvedProducts.filter(p => p.isFeatured), 'featuredGrid');

    if (newRes.products?.length) renderProducts(newRes.products, 'homeProductsGrid');
    else renderProducts(approvedProducts.slice(0, 4), 'homeProductsGrid');

    if (venRes.vendors?.length) renderVendors(venRes.vendors, 'homeVendorsGrid');
    else renderVendors(approvedVendors, 'homeVendorsGrid');
    return;
  } catch {}

  // Fallback : uniquement les produits approuvés par l'admin
  renderCollections(approvedProducts.filter(p => p.isFeatured), 'featuredGrid');
  renderProducts(approvedProducts.slice(0, 4), 'homeProductsGrid');
  renderVendors(approvedVendors, 'homeVendorsGrid');
}

/* ── Collections (featured) ── */
function renderCollections(products, id) {
  const grid = document.getElementById(id);
  if (!grid) return;
  if (!products || !products.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-3)">
      <p style="font-size:14px">Aucun produit en vedette pour le moment.</p>
    </div>`;
    return;
  }
  grid.innerHTML = products.slice(0, 5).map(p => `
  <a class="coll-feature" href="product.html?id=${p.id}">
    <div class="coll-feature-img" style="background:${p.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${p.emoji||'👗'}</div>
    <div class="coll-feature-info">
      <div class="coll-feature-name">${p.name}</div>
      <div class="coll-feature-sub">${fmtPrice(p.salePrice||p.price)}</div>
    </div>
    <div class="coll-feature-arrow"><div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,18 15,12 9,6"/></svg>
    </div></div>
  </a>`).join('');
}

/* ── Grille produits ── */
function renderProducts(products, id) {
  const grid = document.getElementById(id);
  if (!grid) return;
  if (!products || !products.length) {
    grid.innerHTML = `<div class="products-empty">
      <p>Aucun produit disponible pour le moment.</p>
    </div>`;
    return;
  }
  grid.innerHTML = products.map(p => productCardHTML(p)).join('');
  attachHover(grid);
}

function productCardHTML(p) {
  const price  = p.salePrice || p.price;
  const oldP   = p.salePrice ? `<span class="price-old">${fmtPrice(p.price)}</span>` : '';
  const badge  = p.badge ? `<span class="product-badge badge-${p.badge}">${badgeLbl(p.badge)}</span>` : '';
  const vendor = p.vendor?.storeName || '';
  return `<div class="product-card" onclick="location.href='product.html?id=${p.id}'">
    <div class="product-img">
      <div class="product-img-bg" style="background:${p.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${p.emoji||'👗'}</div>
      ${badge}
      <button class="product-wish-btn" onclick="event.stopPropagation();toggleWish(this,'${p.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="product-quick-add" onclick="event.stopPropagation();quickAdd('${p.id}')">+ Ajouter au panier</div>
    </div>
    <div class="product-body">
      <div class="product-vendor-tag">✦ ${vendor}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price-row"><span class="price-main">${fmtPrice(price)}</span>${oldP}</div>
      <div class="product-rating">${starsHtml(p.rating||0)}<span>(${p.reviewCount||0})</span></div>
    </div>
  </div>`;
}

/* ── Vendeurs ── */
function renderVendors(vendors, id) {
  const grid = document.getElementById(id);
  if (!grid) return;
  if (!vendors || !vendors.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3)">
      <p style="font-size:14px">Aucun vendeur approuvé pour le moment.</p>
    </div>`;
    return;
  }
  grid.innerHTML = vendors.slice(0, 6).map(v => `
  <div class="vendor-card" onclick="location.href='vendor.html?id=${v.id}'">
    <div class="vendor-av">${v.storeName?.[0]||'V'}</div>
    <div class="vendor-name">${v.storeName}</div>
    <div class="vendor-city">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${v.storeCity}
    </div>
    <div class="vendor-stats">${v.productCount||0} produits</div>
    <div class="vendor-rating">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
      ${(+v.rating||0).toFixed(1)||'—'}
    </div>
  </div>`).join('');
}

function attachHover(grid) {
  if (!window.gsap) return;
  grid.querySelectorAll('.product-card').forEach(c => {
    c.addEventListener('mouseenter', () => gsap.to(c.querySelector('.product-img-bg'), {scale:1.08, duration:.4, ease:'power2.out'}));
    c.addEventListener('mouseleave', () => gsap.to(c.querySelector('.product-img-bg'), {scale:1,    duration:.4, ease:'power2.out'}));
  });
}

function quickAdd(id) {
  const allApproved = LocalStore.getApprovedProducts();
  const p = allApproved.find(x => x.id === id);
  if (p) Cart.add(p, 1, p.sizes?.[0]||'', p.colors?.[0]||'');
}

function toggleWish(btn, id) {
  const w = JSON.parse(localStorage.getItem('ma_wishlist')||'[]');
  const i = w.indexOf(id);
  if (i>=0) { w.splice(i,1); btn.querySelector('svg').setAttribute('fill','none'); btn.classList.remove('active'); }
  else       { w.push(id);   btn.querySelector('svg').setAttribute('fill','#ef4444'); btn.classList.add('active'); }
  localStorage.setItem('ma_wishlist', JSON.stringify(w));
}

function badgeLbl(b) {
  return {bestseller:'🔥 Best-seller', new:'✨ Nouveau', promo:'💸 Promo', premium:'💎 Premium'}[b] || b;
}

/* ── GSAP ── */
function initGSAP() {
  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-label',   {opacity:0, y:16, duration:.5, ease:'power3.out', delay:.1});
  gsap.from('.hero-title',   {opacity:0, y:40, duration:.7, ease:'power3.out', delay:.2});
  gsap.from('.hero-desc',    {opacity:0, y:20, duration:.5, ease:'power3.out', delay:.4});
  gsap.from('.hero-cta>*',   {opacity:0, y:20, duration:.4, stagger:.1, ease:'power3.out', delay:.5});
  gsap.from('.trust-item',   {opacity:0, y:16, duration:.35, stagger:.08, ease:'power3.out', delay:.6});
  if (window.ScrollTrigger) {
    ['.overview-grid','.collections-grid','.solutions-grid'].forEach(sel => {
      gsap.from(sel, {opacity:0, y:30, duration:.6, ease:'power3.out',
        scrollTrigger:{trigger:sel, start:'top 88%', toggleActions:'play none none none'}});
    });
    document.querySelectorAll('.products-grid,.vendors-grid').forEach(g => {
      if (!g.children.length) return;
      gsap.from(g.children, {opacity:0, y:24, duration:.45, stagger:.06, ease:'power3.out',
        scrollTrigger:{trigger:g, start:'top 85%', toggleActions:'play none none none'}});
    });
  }
}
