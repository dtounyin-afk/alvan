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
document.addEventListener('DOMContentLoaded', () => { Cart.updateBadge(); initStickyHeader(); });
window.Cart = Cart;
window.Auth = Auth;
window.LocalStore = LocalStore;
window.showToast  = showToast;
window.fmtPrice   = fmtPrice;
window.starsHtml  = starsHtml;
