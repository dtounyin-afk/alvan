// ============================================================
// ModaAfrik Cameroun — Vendors Page
// Source: LocalStore uniquement (aucune donnée mock)
// ============================================================
let allVendors = [];
let activeCity = '';

document.addEventListener('DOMContentLoaded', async () => {
  const h = document.getElementById('header');
  window.addEventListener('scroll', () => h?.classList.toggle('scrolled', scrollY > 40), {passive:true});
  await loadVendors();
});

async function loadVendors() {
  // Source unique : vendeurs approuvés dans LocalStore
  allVendors = LocalStore.getApprovedVendors();

  // Essayer l'API
  try {
    const r = await Api.vendors.list();
    if (r.vendors?.length) allVendors = r.vendors;
  } catch {}

  renderVendors(allVendors);
}

function renderVendors(vendors) {
  const grid = document.getElementById('vendorsGrid');
  if (!grid) return;

  if (!vendors || !vendors.length) {
    grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--text-3)">
      <div style="font-size:56px;margin-bottom:16px">🏪</div>
      <h3 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text);margin-bottom:8px">Aucun vendeur disponible</h3>
      <p style="font-size:14px">Les boutiques approuvées par l'administrateur apparaîtront ici.</p>
    </div>`;
    return;
  }

  grid.innerHTML = vendors.map(v => {
    const approved = LocalStore.getApprovedProducts().filter(p => p.vendorId === v.id);
    const count    = v.productCount || approved.length || 0;
    return `
    <div class="vendor-big-card" onclick="location.href='vendor.html?id=${v.id}'">
      <div class="vbc-header">
        ${v.logo ? `<img src="${v.logo}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block;border:3px solid rgba(232,168,56,.3)" alt="${v.storeName}"/>` :
          `<div class="vbc-av">${v.storeName?.[0]||'V'}</div>`}
        <div class="vbc-name">${v.storeName}</div>
        <div class="vbc-city">📍 ${v.storeCity||'—'}</div>
        ${v.storeCategory ? `<div style="font-size:11px;color:var(--text-3);margin-top:3px">${v.storeCategory}</div>` : ''}
        ${v.createdBy === 'admin' || v.approvedAt ? `<span class="vbc-badge">✓ Vérifié</span>` : ''}
      </div>
      <div class="vbc-body">
        <div class="vbc-stats">
          <div class="vbc-stat"><strong>${v.rating ? ('+v.rating').toFixed?.(1) || '—' : '—'}</strong><span>Note</span></div>
          <div class="vbc-stat"><strong>${count}</strong><span>Produits</span></div>
          <div class="vbc-stat"><strong>${v.totalSales ? Math.round(v.totalSales/1000)+'K' : '—'}</strong><span>FCFA</span></div>
        </div>
        ${v.storeDesc ? `<div class="vbc-desc">${v.storeDesc}</div>` : '<div class="vbc-desc" style="color:var(--text-3)">Boutique ModaAfrik Cameroun</div>'}
        <div class="btn-primary" style="text-align:center;display:block;border-radius:var(--r-full);font-size:13px;padding:10px;cursor:pointer">Voir la boutique →</div>
      </div>
    </div>`;
  }).join('');

  if (window.gsap) {
    gsap.from('.vendor-big-card', {opacity:0, y:24, duration:.45, stagger:.07, ease:'power3.out'});
  }
}

function filterVendors(q) {
  const s = (q||'').toLowerCase();
  const filtered = allVendors.filter(v =>
    (!s || v.storeName?.toLowerCase().includes(s) || v.storeCity?.toLowerCase().includes(s)) &&
    (!activeCity || v.storeCity === activeCity)
  );
  renderVendors(filtered);
}

function filterCity(city, btn) {
  activeCity = city;
  document.querySelectorAll('#cityFilters .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  filterVendors(document.getElementById('vendorSearch')?.value || '');
}
