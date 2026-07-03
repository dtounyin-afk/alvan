// ============================================================
// ModaAfrik Cameroun — API Client
// Auto-détecte l'URL du backend
// ============================================================

// Détecter automatiquement l'URL de l'API
const API_BASE = (() => {
  // Si variable d'environnement définie (build)
  if (typeof API_URL !== 'undefined') return API_URL;
  // Si on est sur le même domaine que le backend (production)
  const h = window.location.hostname;
  // Localhost / WAMP / dev
  if (h === 'localhost' || h === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  // Sur un serveur distant : même origine port 3001 ou /api
  return window.location.protocol + '//' + h + ':3001/api';
})();

const Api = {
  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = localStorage.getItem('ma_token');
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  },

  async _req(method, path, body) {
    const opts = { method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HTTP ' + res.status);
    return data;
  },

  get:  (p)    => Api._req('GET',    p),
  post: (p, b) => Api._req('POST',   p, b),
  put:  (p, b) => Api._req('PUT',    p, b),
  del:  (p)    => Api._req('DELETE', p),

  auth: {
    login:          (d) => Api.post('/auth/login', d),
    register:       (d) => Api.post('/auth/register', d),
    registerVendor: (d) => Api.post('/auth/register-vendor', d),
    me:             ()  => Api.get('/auth/me'),
    updateMe:       (d) => Api.put('/auth/me', d),
  },
  products: {
    list:        (q={}) => Api.get('/products?' + new URLSearchParams(q)),
    featured:    ()     => Api.get('/products/featured'),
    newArrivals: ()     => Api.get('/products/new'),
    get:         (id)   => Api.get('/products/' + id),
    create:      (d)    => Api.post('/products', d),
    update:      (id,d) => Api.put('/products/' + id, d),
    delete:      (id)   => Api.del('/products/' + id),
    addReview:   (id,d) => Api.post('/products/' + id + '/reviews', d),
    byVendor:    (vid)  => Api.get('/products/vendor/' + vid),
  },
  orders: {
    create:       (d)   => Api.post('/orders', d),
    list:         ()    => Api.get('/orders'),
    vendorOrders: ()    => Api.get('/orders/vendor'),
    get:          (id)  => Api.get('/orders/' + id),
    updateStatus: (id, status) => Api.put('/orders/' + id + '/status', { status }),
  },
  vendors: {
    list:   ()    => Api.get('/vendors'),
    get:    (id)  => Api.get('/vendors/' + id),
    stats:  ()    => Api.get('/vendors/dashboard/stats'),
    update: (d)   => Api.put('/vendors/dashboard', d),
  },
  categories: { list: () => Api.get('/categories') },
  upload: {
    product: async (files) => {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const h   = {};
      const tok = localStorage.getItem('ma_token');
      if (tok) h['Authorization'] = 'Bearer ' + tok;
      const res  = await fetch(API_BASE + '/upload/product', { method:'POST', headers:h, body:fd });
      return res.json();
    },
    avatar: async (file) => {
      const fd = new FormData(); fd.append('avatar', file);
      const h  = {};
      const tok = localStorage.getItem('ma_token');
      if (tok) h['Authorization'] = 'Bearer ' + tok;
      const res = await fetch(API_BASE + '/upload/avatar', { method:'POST', headers:h, body:fd });
      return res.json();
    },
    logo: async (file) => {
      const fd = new FormData(); fd.append('logo', file);
      const h  = {};
      const tok = localStorage.getItem('ma_token');
      if (tok) h['Authorization'] = 'Bearer ' + tok;
      const res = await fetch(API_BASE + '/upload/logo', { method:'POST', headers:h, body:fd });
      return res.json();
    },
  },
};

window.Api      = Api;
window.API_BASE = API_BASE;
