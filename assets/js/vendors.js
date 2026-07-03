// ============================================================
// ModaAfrik — Vendors Page
// ============================================================
const ALL_VENDORS = [
  {id:'usr-002',storeName:'Wax & Merveilles',storeCity:'Dakar',storeDesc:'Créations uniques en tissu wax authentique du Sénégal. Robes, tailleurs, ensembles sur mesure.',rating:4.8,totalSales:1250000,productCount:18,badge:'Top vendeur'},
  {id:'usr-003',storeName:'Kente Royal',storeCity:'Accra',storeDesc:'Tissus kente et vêtements traditionnels du Ghana. Chaque pièce est tissée à la main par nos artisans.',rating:4.6,totalSales:980000,productCount:12,badge:null},
  {id:'usr-004',storeName:'Mode Guinéenne',storeCity:'Conakry',storeDesc:'Boubous et tenues de cérémonie guinéennes de prestige. Bazin riche et mousseline.',rating:4.7,totalSales:750000,productCount:15,badge:'Certifié'},
  {id:'usr-005',storeName:'Aso-Oke Palace',storeCity:'Lagos',storeDesc:'Tissus aso-oke et ankara du Nigeria. Spécialiste des tenues de mariage et cérémonies.',rating:4.9,totalSales:2100000,productCount:24,badge:'Top vendeur'},
  {id:'usr-006',storeName:'Bogolan Chic',storeCity:'Abidjan',storeDesc:'Bogolan et bazin riche, élégance malienne modernisée. Sacs, accessoires et vêtements.',rating:4.5,totalSales:620000,productCount:10,badge:null},
  {id:'usr-007',storeName:'Bazin Prestige',storeCity:'Bamako',storeDesc:'Grand Boubous cérémoniaux du Mali. Broderies dorées et tissu bazin de première qualité.',rating:4.4,totalSales:430000,productCount:8,badge:null},
  {id:'usr-008',storeName:'Bijoux Teranga',storeCity:'Dakar',storeDesc:'Bijoux artisanaux en or, argent, perles et cauris. L\'artisanat sénégalais à son sommet.',rating:4.7,totalSales:890000,productCount:32,badge:'Certifié'},
  {id:'usr-009',storeName:'Lagos Street Style',storeCity:'Lagos',storeDesc:'Mode contemporaine africaine, streetwear et casual chic inspiré des rues de Lagos.',rating:4.3,totalSales:540000,productCount:20,badge:null},
];

let activeCity = '';

document.addEventListener('DOMContentLoaded', async () => {
  const h = document.getElementById('header');
  window.addEventListener('scroll', () => h?.classList.toggle('scrolled', scrollY > 40), {passive:true});

  try {
    const res = await Api.vendors.list();
    renderVendors(res.vendors);
  } catch {
    renderVendors(ALL_VENDORS);
  }
});

function renderVendors(data) {
  const grid = document.getElementById('vendorsGrid');
  if (!data.length) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-3);padding:60px;grid-column:1/-1">Aucun vendeur trouvé.</p>';
    return;
  }
  grid.innerHTML = data.map(v => `
  <div class="vendor-big-card" onclick="location.href='vendor.html?id=${v.id}'">
    <div class="vbc-header">
      <div class="vbc-av">${v.storeName[0]}</div>
      <div class="vbc-name">${v.storeName}</div>
      <div class="vbc-city">📍 ${v.storeCity}</div>
      ${v.badge ? `<span class="vbc-badge">✓ ${v.badge}</span>` : ''}
    </div>
    <div class="vbc-body">
      <div class="vbc-stats">
        <div class="vbc-stat"><strong>★ ${(+v.rating).toFixed(1)}</strong><span>Note</span></div>
        <div class="vbc-stat"><strong>${v.productCount || 0}</strong><span>Produits</span></div>
        <div class="vbc-stat"><strong>${v.totalSales ? Math.round(v.totalSales/1000)+'K' : '—'}</strong><span>FCFA</span></div>
      </div>
      <div class="vbc-desc">${v.storeDesc || ''}</div>
      <div class="btn-primary" style="text-align:center;display:block;border-radius:var(--r-full);font-size:13px;padding:10px">Voir la boutique →</div>
    </div>
  </div>`).join('');

  if (window.gsap) {
    gsap.from('.vendor-big-card', {opacity:0, y:24, duration:.45, stagger:.07, ease:'power3.out'});
  }
}

function filterVendors(q) {
  const s = q.toLowerCase();
  const filtered = ALL_VENDORS.filter(v =>
    (!s || v.storeName.toLowerCase().includes(s) || v.storeCity.toLowerCase().includes(s)) &&
    (!activeCity || v.storeCity === activeCity)
  );
  renderVendors(filtered);
}

function filterCity(city, btn) {
  activeCity = city;
  document.querySelectorAll('#cityFilters .size-tag').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const q = document.getElementById('vendorSearch')?.value || '';
  filterVendors(q);
}
