// ============================================================
// ModaAfrik — Cart + Auth + Helpers
// ============================================================

/* ── CART ── */
const Cart = {
  KEY: 'ma_cart',
  get()  { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); this.updateBadge(); window.dispatchEvent(new Event('cartUpdated')); },
  add(product, qty=1, size='', color='') {
    const items = this.get();
    const key   = `${product.id}_${size}_${color}`;
    const idx   = items.findIndex(i => i.key === key);
    if (idx >= 0) items[idx].qty += qty;
    else items.push({ key, productId:product.id, name:product.name, price:product.salePrice||product.price,
      emoji:product.emoji||'👗', gradient:product.gradient||'linear-gradient(135deg,#1a1a2e,#0f3460)',
      vendorId:product.vendorId||'', size, color, qty });
    this.save(items);
    this.flyToCart(product);
    showToast('"'+product.name+'" ajouté au panier !', 'success');
  },
  remove(key)       { this.save(this.get().filter(i => i.key !== key)); },
  updateQty(key,qty){ const items=this.get(); const i=items.findIndex(x=>x.key===key); if(i>=0){if(qty<=0)items.splice(i,1);else items[i].qty=qty;} this.save(items); },
  clear()           { this.save([]); },
  count()           { return this.get().reduce((s,i)=>s+i.qty,0); },
  subtotal()        { return this.get().reduce((s,i)=>s+i.price*i.qty,0); },
  updateBadge() {
    const n = this.count();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = n; el.style.display = n > 0 ? 'flex' : 'none';
    });
  },
  flyToCart(product) {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon || !window.gsap) return;
    const rect = cartIcon.getBoundingClientRect();
    const fly  = document.createElement('div');
    fly.style.cssText = `position:fixed;z-index:9999;width:56px;height:56px;border-radius:12px;
      display:flex;align-items:center;justify-content:center;font-size:26px;pointer-events:none;
      background:${product.gradient||'linear-gradient(135deg,#e8a838,#f0c060)'};
      top:50%;left:50%;transform:translate(-50%,-50%)`;
    fly.textContent = product.emoji || '👗';
    document.body.appendChild(fly);
    gsap.to(fly, { x:rect.left-window.innerWidth/2+rect.width/2, y:rect.top-window.innerHeight/2+rect.height/2,
      scale:.15, opacity:0, duration:.65, ease:'power3.in', onComplete:()=>{ fly.remove(); this.updateBadge(); } });
  }
};

/* ── AUTH ── */
const Auth = {
  save(token, user) { localStorage.setItem('ma_token',token); localStorage.setItem('ma_user',JSON.stringify(user)); },
  token()     { return localStorage.getItem('ma_token'); },
  user()      { try { return JSON.parse(localStorage.getItem('ma_user')); } catch { return null; } },
  isLoggedIn(){ return !!this.token(); },
  isVendor()  { const u=this.user(); return u?.role==='vendor'||u?.role==='admin'; },
  logout()    { localStorage.removeItem('ma_token'); localStorage.removeItem('ma_user'); location.href='auth.html'; },
};

/* ── HELPERS ── */
function showToast(msg, type='default', dur=3200) {
  let t = document.getElementById('_toast');
  if (!t) { t=document.createElement('div'); t.id='_toast'; t.className='toast'; document.body.appendChild(t); }
  const icons = { success:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>',
    error:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' };
  t.innerHTML = (icons[type]||'') + msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(()=>t.classList.remove('show'), dur);
}

function fmtPrice(n) { return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'; }

function starsHtml(r) {
  r = Math.min(5, Math.max(0, r||0));
  const full = Math.floor(r), half = (r%1)>=.4?1:0, empty = 5-full-half;
  return '<span class="stars">' + '★'.repeat(full) + (half?'½':'') + '☆'.repeat(empty) + '</span>';
}

function initStickyHeader() {
  const h = document.getElementById('header');
  if (!h) return;
  const fn = () => h.classList.toggle('scrolled', scrollY > 40);
  window.addEventListener('scroll', fn, {passive:true}); fn();
}

/* ── LOCAL PRODUCT STORE ── */
// ARCHITECTURE :
// - Vendeur publie → statut 'pending_review' (invisible sur vitrine)
// - Super admin approuve → statut 'approved' (visible sur vitrine)
// - LocalStore sépare les deux pools
const LocalStore = {
  PENDING_KEY:   'ma_products_pending',   // produits vendeurs en attente admin
  APPROVED_KEY:  'ma_products_approved',  // produits approuvés par admin (vitrine)
  VENDORS_KEY:   'ma_vendors_pending',    // vendeurs en attente
  APPROVED_V_KEY:'ma_vendors_approved',   // vendeurs approuvés

  // ── PRODUITS EN ATTENTE (soumis par vendeurs) ──
  getPendingProducts()       { try { return JSON.parse(localStorage.getItem(this.PENDING_KEY))||[]; } catch { return []; } },
  savePendingProducts(arr)   { localStorage.setItem(this.PENDING_KEY, JSON.stringify(arr)); },
  addPendingProduct(p)       { const arr=this.getPendingProducts(); arr.unshift({...p, status:'pending_review', submittedAt:new Date().toISOString()}); this.savePendingProducts(arr); return arr[0]; },
  deletePendingProduct(id)   { this.savePendingProducts(this.getPendingProducts().filter(p=>p.id!==id)); },

  // ── PRODUITS APPROUVÉS (visibles sur vitrine) ──
  getApprovedProducts()      { try { return JSON.parse(localStorage.getItem(this.APPROVED_KEY))||[]; } catch { return []; } },
  saveApprovedProducts(arr)  { localStorage.setItem(this.APPROVED_KEY, JSON.stringify(arr)); },
  approveProduct(id)         {
    const pending = this.getPendingProducts();
    const p       = pending.find(x => x.id === id);
    if (!p) return null;
    const approved = {...p, status:'approved', approvedAt:new Date().toISOString(), isActive:true};
    const arr = this.getApprovedProducts();
    arr.unshift(approved);
    this.saveApprovedProducts(arr);
    this.deletePendingProduct(id);
    return approved;
  },
  rejectProduct(id)          { this.deletePendingProduct(id); },
  removeApprovedProduct(id)  { this.saveApprovedProducts(this.getApprovedProducts().filter(p=>p.id!==id)); },
  updateApprovedProduct(id, data) {
    const arr = this.getApprovedProducts();
    const i   = arr.findIndex(p=>p.id===id);
    if (i>=0) { arr[i]={...arr[i],...data}; this.saveApprovedProducts(arr); return arr[i]; }
    return null;
  },

  // ── VENDEURS EN ATTENTE ──
  getPendingVendors()        { try { return JSON.parse(localStorage.getItem(this.VENDORS_KEY))||[]; } catch { return []; } },
  savePendingVendors(arr)    { localStorage.setItem(this.VENDORS_KEY, JSON.stringify(arr)); },
  addPendingVendor(v)        { const arr=this.getPendingVendors(); arr.unshift({...v, status:'pending', submittedAt:new Date().toISOString()}); this.savePendingVendors(arr); return arr[0]; },

  // ── VENDEURS APPROUVÉS ──
  getApprovedVendors()       { try { return JSON.parse(localStorage.getItem(this.APPROVED_V_KEY))||[]; } catch { return []; } },
  saveApprovedVendors(arr)   { localStorage.setItem(this.APPROVED_V_KEY, JSON.stringify(arr)); },
  approveVendor(id)          {
    const pending = this.getPendingVendors();
    const v       = pending.find(x => x.id === id);
    if (!v) return null;
    const approved = {...v, status:'approved', approvedAt:new Date().toISOString(), isActive:true};
    const arr = this.getApprovedVendors();
    arr.unshift(approved);
    this.saveApprovedVendors(arr);
    this.savePendingVendors(pending.filter(x=>x.id!==id));
    return approved;
  },
  removeApprovedVendor(id)   { this.saveApprovedVendors(this.getApprovedVendors().filter(v=>v.id!==id)); },

  // ── COMPAT (anciens noms conservés pour le dashboard vendeur) ──
  getProducts()   { return this.getPendingProducts(); },   // dashboard vendeur voit ses propres produits en attente
  addProduct(p)   { return this.addPendingProduct(p); },
  deleteProduct(id){ this.deletePendingProduct(id); },
  getStores()     { return this.getPendingVendors(); },
  addStore(s)     { return this.addPendingVendor(s); },
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  initStickyHeader();
  initUserMenu();
  initMobileSearch();
  fixNavbarOffset();
});

/* ── FIX NAVBAR OFFSET ──────────────────────────────────────
   Mesure la hauteur réelle du header et compense le contenu
── */
function fixNavbarOffset() {
  const header = document.getElementById('header');
  if (!header) return;
  // Ne pas appliquer sur dashboard/admin (pas de header fixe principal)
  const isDash = document.querySelector('.dash-body, .dashboard-body');
  if (isDash) return;

  function apply() {
    const h = header.offsetHeight || 100;
    document.documentElement.style.setProperty('--nav-h', h + 'px');
    // Appliquer le padding-top aux main/container principaux
    const targets = document.querySelectorAll(
      'main:not(.dash-content), .shop-page, .cart-main, .product-page, .orders-page, .vp-page'
    );
    targets.forEach(el => {
      // Seulement si pas déjà défini manuellement
      const current = parseFloat(window.getComputedStyle(el).paddingTop);
      if (current < h - 10) {
        el.style.paddingTop = h + 'px';
      }
    });
  }
  apply();
  window.addEventListener('resize', apply, { passive: true });
  window.addEventListener('load',   apply);
}
window.Cart = Cart;
window.Auth = Auth;
window.LocalStore = LocalStore;
window.showToast  = showToast;
window.fmtPrice   = fmtPrice;
window.starsHtml  = starsHtml;

/* ── USER MENU (header) ── */
function initUserMenu() {
  const u = Auth.user();
  // Chercher tous les liens "compte" dans le header
  const accountLinks = document.querySelectorAll('a[href="auth.html"].nav-icon, a[title="Compte"].nav-icon, a[title="Mon compte"].nav-icon');

  accountLinks.forEach(link => {
    if (u) {
      // Remplacer le lien par un bouton avec menu déroulant
      const initials = (u.firstName?.[0] || '') + (u.lastName?.[0] || '');
      const wrapper  = document.createElement('div');
      wrapper.className = 'user-menu-wrap';
      wrapper.innerHTML = `
        <button class="nav-icon user-menu-btn" onclick="toggleUserMenu(this)" title="${u.firstName} ${u.lastName}">
          <span class="user-initials">${initials.toUpperCase() || '?'}</span>
        </button>
        <div class="user-dropdown" style="display:none">
          <div class="ud-header">
            <div class="ud-initials">${initials.toUpperCase() || '?'}</div>
            <div>
              <div class="ud-name">${u.firstName} ${u.lastName}</div>
              <div class="ud-role">${roleLabel(u.role)}</div>
            </div>
          </div>
          <div class="ud-divider"></div>
          ${u.role === 'admin'  ? `<a href="admin.html" class="ud-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Panneau admin</a>` : ''}
          ${u.role === 'vendor' ? `<a href="vendor-dashboard.html" class="ud-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Mon dashboard</a>` : ''}
          ${u.role === 'client' ? `<a href="orders.html" class="ud-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>Mes commandes</a>` : ''}
          <div class="ud-divider"></div>
          <button class="ud-item ud-logout" onclick="Auth.logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>`;
      link.parentNode.replaceChild(wrapper, link);
    }
  });

  // Fermer le menu si clic ailleurs
  document.addEventListener('click', e => {
    if (!e.target.closest('.user-menu-wrap')) {
      document.querySelectorAll('.user-dropdown').forEach(d => d.style.display = 'none');
    }
  });
}

function toggleUserMenu(btn) {
  const dropdown = btn.nextElementSibling;
  if (!dropdown) return;
  const isOpen = dropdown.style.display !== 'none';
  document.querySelectorAll('.user-dropdown').forEach(d => d.style.display = 'none');
  dropdown.style.display = isOpen ? 'none' : 'block';
}

function roleLabel(role) {
  return { admin:'Super Administrateur', vendor:'Vendeur', client:'Client' }[role] || role;
}

/* ── MOBILE SEARCH BAR ── */
function initMobileSearch() {
  const navActions = document.querySelector('.nav-actions');
  const navbar     = document.querySelector('.navbar');
  const header     = document.getElementById('header');
  if (!navActions || !navbar || !header) return;

  // Eviter double injection
  if (document.querySelector('.mobile-search-toggle-btn')) return;

  // Créer le bouton toggle de recherche pour mobile
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'nav-icon mobile-search-toggle-btn';
  toggleBtn.title = 'Rechercher';
  toggleBtn.innerHTML = `
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>`;
  
  // Insérer avant le panier ou le profil dans nav-actions
  navActions.insertBefore(toggleBtn, navActions.firstChild);

  // Créer la rangée de recherche mobile
  const searchRow = document.createElement('div');
  searchRow.className = 'mobile-search-row';
  searchRow.style.display = 'none';
  searchRow.innerHTML = `
    <div class="mobile-search-input-wrap">
      <input type="text" placeholder="Rechercher sur ModaAfrik..." class="mobile-search-input" />
      <button class="mobile-search-submit">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  `;

  // Insérer juste après la navbar
  header.insertBefore(searchRow, navbar.nextSibling);

  // Gérer le toggle
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = searchRow.style.display !== 'none';
    searchRow.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      searchRow.querySelector('.mobile-search-input').focus();
    }
  });

  const doMobileSearch = () => {
    const q = searchRow.querySelector('.mobile-search-input').value.trim();
    if (q) {
      location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }
  };

  searchRow.querySelector('.mobile-search-submit').addEventListener('click', doMobileSearch);
  searchRow.querySelector('.mobile-search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doMobileSearch();
  });

  // Fermer la recherche mobile si clic en dehors
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-search-row') && !e.target.closest('.mobile-search-toggle-btn')) {
      searchRow.style.display = 'none';
    }
  });
}
