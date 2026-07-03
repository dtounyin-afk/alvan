// ============================================================
// ModaAfrik — API Client
// ============================================================
const API_BASE = 'http://localhost:3001/api';

const Api = {
  _headers() {
    const h = {'Content-Type':'application/json'};
    const t = localStorage.getItem('ma_token');
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  },
  async _req(method, path, body) {
    const opts = {method, headers:this._headers()};
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'HTTP '+res.status);
    return data;
  },
  get:    (p)    => Api._req('GET',    p),
  post:   (p, b) => Api._req('POST',   p, b),
  put:    (p, b) => Api._req('PUT',    p, b),
  del:    (p)    => Api._req('DELETE', p),

  auth: {
    login:          (d) => Api.post('/auth/login', d),
    register:       (d) => Api.post('/auth/register', d),
    registerVendor: (d) => Api.post('/auth/register-vendor', d),
    me:             ()  => Api.get('/auth/me'),
    updateMe:       (d) => Api.put('/auth/me', d),
  },
  products: {
    list:       (q={}) => Api.get('/products?'+new URLSearchParams(q)),
    featured:   ()     => Api.get('/products/featured'),
    newArrivals:()     => Api.get('/products/new'),
    get:        (id)   => Api.get('/products/'+id),
    create:     (d)    => Api.post('/products', d),
    update:     (id,d) => Api.put('/products/'+id, d),
    delete:     (id)   => Api.del('/products/'+id),
    addReview:  (id,d) => Api.post('/products/'+id+'/reviews', d),
  },
  orders: {
    create:       (d)  => Api.post('/orders', d),
    list:         ()   => Api.get('/orders'),
    vendorOrders: ()   => Api.get('/orders/vendor'),
    get:          (id) => Api.get('/orders/'+id),
    updateStatus: (id,status) => Api.put('/orders/'+id+'/status', {status}),
  },
  vendors: {
    list:   ()    => Api.get('/vendors'),
    get:    (id)  => Api.get('/vendors/'+id),
    stats:  ()    => Api.get('/vendors/dashboard/stats'),
    update: (d)   => Api.put('/vendors/dashboard', d),
  },
  categories: { list: () => Api.get('/categories') },
};

window.Api = Api;
