'use strict';
// ModaAfrik — Persistance JSON sur fichier
const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DIR = path.join(__dirname, 'json');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

function read(name, def) {
  if (def === undefined) def = [];
  try {
    const fp = path.join(DIR, name + '.json');
    if (!fs.existsSync(fp)) { write(name, def); return def; }
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (e) { console.error('[Store] read error', name, e.message); return def; }
}

function write(name, data) {
  try { fs.writeFileSync(path.join(DIR, name + '.json'), JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error('[Store] write error', name, e.message); }
}

// Admin par défaut
(function init() {
  const users = read('users', []);
  if (!users.find(u => u.role === 'admin')) {
    users.push({ id:'admin-0', firstName:'Admin', lastName:'ModaAfrik',
      email:'admin@modaafrik.cm', password: bcrypt.hashSync('ModaAfrik@Admin2025!', 10),
      phone:'', role:'admin', isActive:true, createdAt: new Date().toISOString() });
    write('users', users);
    console.log('[Store] Admin cree: admin@modaafrik.cm');
  }
  ['products','orders','reviews','vendors_pending'].forEach(n => {
    if (!fs.existsSync(path.join(DIR, n + '.json'))) write(n, []);
  });
})();

const SHIPPING = {
  douala:{label:'Douala',price:2000}, yaounde:{label:'Yaoundé',price:2000},
  bafoussam:{label:'Bafoussam',price:3500}, bamenda:{label:'Bamenda',price:3500},
  garoua:{label:'Garoua',price:5000}, maroua:{label:'Maroua',price:5500},
  ngaoundere:{label:'Ngaoundéré',price:4500}, bertoua:{label:'Bertoua',price:4000},
  ebolowa:{label:'Ebolowa',price:3000}, kribi:{label:'Kribi',price:3000},
  limbe:{label:'Limbé',price:2500}, buea:{label:'Buea',price:2500}, kumba:{label:'Kumba',price:3000},
};

const CATS = [
  {id:'cat-001',name:'Robes & Pagnes',slug:'robes-pagnes',icon:'👗'},
  {id:'cat-002',name:'Boubous',slug:'boubous',icon:'🥻'},
  {id:'cat-003',name:'Accessoires',slug:'accessoires',icon:'👜'},
  {id:'cat-004',name:'Chaussures',slug:'chaussures',icon:'👡'},
  {id:'cat-005',name:'Bijoux & Perles',slug:'bijoux',icon:'💎'},
  {id:'cat-006',name:'Enfants',slug:'enfants',icon:'👶'},
  {id:'cat-007',name:'Hommes',slug:'hommes',icon:'👔'},
];

const Store = {
  users: {
    findAll:    ()  => read('users',[]),
    findById:   (id)=> read('users',[]).find(u=>u.id===id),
    findByEmail:(em)=> read('users',[]).find(u=>u.email===em?.toLowerCase().trim()),
    findByRole: (r) => read('users',[]).filter(u=>u.role===r),
    create(data){ const users=read('users',[]); const u={id:uuidv4(),...data,createdAt:new Date().toISOString()}; users.push(u); write('users',users); return u; },
    update(id,data){ const a=read('users',[]); const i=a.findIndex(u=>u.id===id); if(i<0)return null; a[i]={...a[i],...data,updatedAt:new Date().toISOString()}; write('users',a); return a[i]; },
    delete(id){ write('users',read('users',[]).filter(u=>u.id!==id)); },
  },
  products: {
    findAll:      ()   => read('products',[]).filter(p=>p.isActive!==false),
    findAllAdmin: ()   => read('products',[]),
    findById:     (id) => read('products',[]).find(p=>p.id===id),
    findByVendor: (v)  => read('products',[]).filter(p=>p.vendorId===v&&p.isActive!==false),
    findFeatured: ()   => read('products',[]).filter(p=>p.isActive!==false&&p.isFeatured).slice(0,8),
    findNew:      ()   => read('products',[]).filter(p=>p.isActive!==false).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8),
    create(data){ const a=read('products',[]); const p={id:uuidv4(),...data,isActive:true,createdAt:new Date().toISOString()}; a.unshift(p); write('products',a); return p; },
    update(id,data){ const a=read('products',[]); const i=a.findIndex(p=>p.id===id); if(i<0)return null; a[i]={...a[i],...data,updatedAt:new Date().toISOString()}; write('products',a); return a[i]; },
    delete(id){ const a=read('products',[]); const i=a.findIndex(p=>p.id===id); if(i>=0){a[i].isActive=false;write('products',a);} },
    hardDelete(id){ write('products',read('products',[]).filter(p=>p.id!==id)); },
  },
  orders: {
    findAll:        ()    => read('orders',[]),
    findById:       (id)  => read('orders',[]).find(o=>o.id===id),
    findByCustomer: (cid) => read('orders',[]).filter(o=>o.customerId===cid),
    findByVendor:   (vid) => read('orders',[]).filter(o=>o.items?.some(i=>i.vendorId===vid)),
    create(data){ const a=read('orders',[]); const o={id:uuidv4(),...data,createdAt:new Date().toISOString()}; a.unshift(o); write('orders',a); return o; },
    updateStatus(id,status){ const a=read('orders',[]); const i=a.findIndex(o=>o.id===id); if(i<0)return null; a[i].status=status; a[i].updatedAt=new Date().toISOString(); write('orders',a); return a[i]; },
  },
  reviews: {
    findAll:       ()    => read('reviews',[]),
    findByProduct: (pid) => read('reviews',[]).filter(r=>r.productId===pid),
    create(data){ const a=read('reviews',[]); const r={id:uuidv4(),...data,createdAt:new Date().toISOString()}; a.unshift(r); write('reviews',a); return r; },
  },
  categories: {
    findAll:    ()     => { const cats=read('categories',CATS); return cats.map(c=>({...c,productCount:read('products',[]).filter(p=>p.isActive!==false&&p.category===c.slug).length})); },
    findBySlug: (slug) => read('categories',CATS).find(c=>c.slug===slug),
  },
  vendorsPending: {
    findAll:  ()   => read('vendors_pending',[]),
    findById: (id) => read('vendors_pending',[]).find(v=>v.id===id),
    add(data){ const a=read('vendors_pending',[]); const v={id:uuidv4(),...data,submittedAt:new Date().toISOString()}; a.unshift(v); write('vendors_pending',a); return v; },
    remove(id){ write('vendors_pending',read('vendors_pending',[]).filter(v=>v.id!==id)); },
  },
  shippingRates: SHIPPING,
  genId: uuidv4,
  read, write,
};

module.exports = Store;
