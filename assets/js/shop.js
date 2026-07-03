// ============================================================
// ModaAfrik Cameroun — Shop Page
// ============================================================
let allProducts = [], filteredProducts = [], currentPage = 1;
const PER_PAGE = 12;
let activeSizes = [];

document.addEventListener('DOMContentLoaded', async () => {
  readURLParams();
  await loadProducts();
  initSearch();
});

async function loadProducts() {
  // Source unique : produits approuvés dans LocalStore
  allProducts = LocalStore.getApprovedProducts();

  // Essayer l'API en bonus
  try {
    const r = await Api.products.list({ limit: 200 });
    if (r.products?.length) allProducts = r.products;
  } catch {}

  applyFilters();
}

function readURLParams() {
  const p = new URLSearchParams(location.search);
  if (p.get('cat')) {
    const cb = document.querySelector(`input[value="${p.get('cat')}"]`);
    if (cb) cb.checked = true;
    const lbl = getCatLabel(p.get('cat'));
    document.querySelectorAll('.current-cat').forEach(el => el.textContent = lbl);
  }
  if (p.get('search')) {
    const inp = document.getElementById('shopSearch');
    if (inp) inp.value = p.get('search');
  }
  if (p.get('sort')) {
    const sel = document.getElementById('sortSel');
    if (sel) sel.value = p.get('sort');
  }
}

function getCatLabel(slug) {
  return {'robes-pagnes':'Robes & Pagnes','boubous':'Boubous','hommes':'Hommes','enfants':'Enfants',
    'accessoires':'Accessoires','bijoux':'Bijoux','chaussures':'Chaussures'}[slug] || slug;
}

function applyFilters() {
  const cats    = [...document.querySelectorAll('#catFilters input:checked')].map(i => i.value);
  const minP    = Number(document.getElementById('fMin')?.value) || 0;
  const maxP    = Number(document.getElementById('fMax')?.value) || Infinity;
  const minR    = Number(document.getElementById('fRating')?.value) || 0;
  const sort    = document.getElementById('sortSel')?.value || '';
  const search  = document.getElementById('shopSearch')?.value.trim().toLowerCase() || '';
  const urlCat  = new URLSearchParams(location.search).get('cat');

  filteredProducts = allProducts.filter(p => {
    const price   = p.salePrice || p.price;
    const catOk   = cats.length ? cats.includes(p.category) : (!urlCat || p.category === urlCat);
    const priceOk = price >= minP && price <= maxP;
    const sizeOk  = activeSizes.length ? activeSizes.some(s => p.sizes?.includes(s)) : true;
    const rateOk  = (p.rating||0) >= minR;
    const searchOk= !search || p.name.toLowerCase().includes(search) || (p.tags||[]).some(t => t.includes(search));
    return catOk && priceOk && sizeOk && rateOk && searchOk && p.isActive !== false;
  });

  if (sort === 'price-asc')  filteredProducts.sort((a,b) => (a.salePrice||a.price)-(b.salePrice||b.price));
  if (sort === 'price-desc') filteredProducts.sort((a,b) => (b.salePrice||b.price)-(a.salePrice||a.price));
  if (sort === 'new')        filteredProducts.sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0));
  if (sort === 'popular')    filteredProducts.sort((a,b) => (b.reviewCount||0)-(a.reviewCount||0));
  if (sort === 'rating')     filteredProducts.sort((a,b) => (b.rating||0)-(a.rating||0));

  currentPage = 1;
  renderShopGrid();
  renderPagination();
  const el = document.getElementById('prodCount');
  if (el) el.textContent = filteredProducts.length;
}

function renderShopGrid() {
  const grid  = document.getElementById('shopGrid');
  if (!grid) return;
  const start = (currentPage-1) * PER_PAGE;
  const page  = filteredProducts.slice(start, start+PER_PAGE);
  if (!page.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--text-3)">
      <div style="font-size:48px;margin-bottom:16px">🔍</div>
      <p style="font-size:16px">Aucun produit trouvé.<br>Essayez d'autres filtres.</p></div>`;
    return;
  }
  grid.innerHTML = page.map(p => {
    const price  = p.salePrice || p.price;
    const oldP   = p.salePrice ? `<span class="price-old">${fmtPrice(p.price)}</span>` : '';
    const badge  = p.badge ? `<span class="product-badge badge-${p.badge}">${badgeLbl(p.badge)}</span>` : '';
    return `<div class="product-card" onclick="location.href='product.html?id=${p.id}'">
      <div class="product-img">
        <div class="product-img-bg" style="background:${p.gradient||'linear-gradient(135deg,#e8e0d0,#d4c8b8)'}">${p.emoji||'👗'}</div>
        ${badge}
        <button class="product-wish-btn" onclick="event.stopPropagation();toggleWishShop(this,'${p.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="product-quick-add" onclick="event.stopPropagation();shopQuickAdd('${p.id}')">+ Ajouter au panier</div>
      </div>
      <div class="product-body">
        <div class="product-vendor-tag">✦ ${p.vendor?.storeName||''}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row"><span class="price-main">${fmtPrice(price)}</span>${oldP}</div>
        <div class="product-rating">${starsHtml(p.rating||0)}<span>(${p.reviewCount||0})</span></div>
      </div>
    </div>`;
  }).join('');

  if (window.gsap) {
    grid.querySelectorAll('.product-card').forEach(c => {
      c.addEventListener('mouseenter', () => gsap.to(c.querySelector('.product-img-bg'),{scale:1.08,duration:.4,ease:'power2.out'}));
      c.addEventListener('mouseleave', () => gsap.to(c.querySelector('.product-img-bg'),{scale:1,duration:.4,ease:'power2.out'}));
    });
  }
}

function renderPagination() {
  const total = Math.ceil(filteredProducts.length / PER_PAGE);
  const pag   = document.getElementById('pagination');
  if (!pag) return;
  if (total <= 1) { pag.innerHTML=''; return; }
  let html = `<button class="size-tag" ${currentPage===1?'disabled':''} onclick="goPage(${currentPage-1})">←</button>`;
  for (let i=1; i<=total; i++) {
    if (i===1||i===total||Math.abs(i-currentPage)<=1)
      html += `<button class="size-tag ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    else if (Math.abs(i-currentPage)===2)
      html += `<span style="padding:0 4px;color:var(--text-3)">…</span>`;
  }
  html += `<button class="size-tag" ${currentPage===total?'disabled':''} onclick="goPage(${currentPage+1})">→</button>`;
  pag.innerHTML = html;
}

function goPage(n) {
  currentPage = n;
  renderShopGrid();
  renderPagination();
  window.scrollTo({top:200, behavior:'smooth'});
}

function toggleSize(el) {
  el.classList.toggle('active');
  activeSizes = [...document.querySelectorAll('.size-tag-filter.active')].map(e => e.dataset.size);
  applyFilters();
}

function resetFilters() {
  document.querySelectorAll('#catFilters input').forEach(i => i.checked=false);
  const fMin = document.getElementById('fMin'); if(fMin) fMin.value='';
  const fMax = document.getElementById('fMax'); if(fMax) fMax.value='';
  const fRat = document.getElementById('fRating'); if(fRat) fRat.value='0';
  const sortS = document.getElementById('sortSel'); if(sortS) sortS.value='';
  activeSizes = [];
  document.querySelectorAll('.size-tag-filter').forEach(t => t.classList.remove('active'));
  applyFilters();
}

function setView(v) {
  const grid = document.getElementById('shopGrid');
  const vg   = document.getElementById('vGrid');
  const vl   = document.getElementById('vList');
  if (!grid) return;
  grid.classList.toggle('list-view', v==='list');
  vg?.classList.toggle('active', v==='grid');
  vl?.classList.toggle('active', v==='list');
}

function initSearch() {
  document.getElementById('shopSearch')?.addEventListener('keydown', e => { if(e.key==='Enter') applyFilters(); });
}

function shopQuickAdd(id) {
  const p = allProducts.find(x => x.id===id);
  if (p) Cart.add(p, 1, p.sizes?.[0]||'', p.colors?.[0]||'');
}

function toggleWishShop(btn, id) {
  const w = JSON.parse(localStorage.getItem('ma_wishlist')||'[]');
  const i = w.indexOf(id);
  if (i>=0){w.splice(i,1);btn.querySelector('svg').setAttribute('fill','none');}
  else{w.push(id);btn.querySelector('svg').setAttribute('fill','#e11d48');}
  localStorage.setItem('ma_wishlist', JSON.stringify(w));
}

function badgeLbl(b) {
  return {bestseller:'🔥 Best-seller',new:'✨ Nouveau',promo:'💸 Promo',premium:'💎 Premium'}[b]||b;
}
