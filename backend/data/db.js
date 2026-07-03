// ============================================================
// ModaAfrik — In-Memory Database + CRUD helpers
// ============================================================
const { v4: uuidv4 } = require('uuid');
const HASHED_PW = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

let categories = [
  { id: 'cat-001', name: 'Robes & Pagnes',       slug: 'robes-pagnes',       icon: '👗', productCount: 8 },
  { id: 'cat-002', name: 'Boubous & Gandouras',  slug: 'boubous',            icon: '🥻', productCount: 6 },
  { id: 'cat-003', name: 'Accessoires',          slug: 'accessoires',        icon: '👜', productCount: 5 },
  { id: 'cat-004', name: 'Chaussures',           slug: 'chaussures',         icon: '👡', productCount: 4 },
  { id: 'cat-005', name: 'Bijoux & Perles',      slug: 'bijoux',             icon: '💎', productCount: 4 },
  { id: 'cat-006', name: 'Enfants',              slug: 'enfants',            icon: '�', productCount: 3 },
  { id: 'cat-007', name: 'Hommes',               slug: 'hommes',             icon: '�', productCount: 5 },
];

let users = [
  { id:'usr-001', firstName:'Aminata', lastName:'Diallo', email:'admin@modaafrik.com',
    password:HASHED_PW, phone:'+221770000001', role:'admin', createdAt:'2024-01-01T00:00:00Z', isActive:true, avatar:null },
  { id:'usr-002', firstName:'Fatou', lastName:'Sow', email:'fatou@modaafrik.com',
    password:HASHED_PW, phone:'+221771110001', role:'vendor', createdAt:'2024-01-05T00:00:00Z', isActive:true,
    storeName:'Wax & Merveilles', storeDesc:'Créations uniques en tissu wax authentique du Sénégal.',
    storeCity:'Dakar', storeAddress:'Marché Sandaga, Stand 42', storeSlug:'wax-merveilles',
    rating:4.8, totalSales:1250000, avatar:null },
  { id:'usr-003', firstName:'Kofi', lastName:'Mensah', email:'kofi@modaafrik.com',
    password:HASHED_PW, phone:'+233242220002', role:'vendor', createdAt:'2024-01-10T00:00:00Z', isActive:true,
    storeName:'Kente Royal', storeDesc:'Tissus kente et vêtements traditionnels du Ghana.',
    storeCity:'Accra', storeAddress:'Makola Market', storeSlug:'kente-royal',
    rating:4.6, totalSales:980000, avatar:null },
  { id:'usr-004', firstName:'Aïssatou', lastName:'Bah', email:'aissatou@modaafrik.com',
    password:HASHED_PW, phone:'+224623330003', role:'vendor', createdAt:'2024-02-01T00:00:00Z', isActive:true,
    storeName:'Mode Guinéenne', storeDesc:'Boubous et tenues de cérémonie guinéennes de prestige.',
    storeCity:'Conakry', storeAddress:'Madina, Rue des Tailleurs', storeSlug:'mode-guineenne',
    rating:4.7, totalSales:750000, avatar:null },
  { id:'usr-005', firstName:'Ngozi', lastName:'Okonkwo', email:'ngozi@modaafrik.com',
    password:HASHED_PW, phone:'+234804440004', role:'vendor', createdAt:'2024-02-15T00:00:00Z', isActive:true,
    storeName:'Aso-Oke Palace', storeDesc:'Tissus aso-oke et ankara de qualité supérieure du Nigeria.',
    storeCity:'Lagos', storeAddress:'Balogun Market, Block C', storeSlug:'aso-oke-palace',
    rating:4.9, totalSales:2100000, avatar:null },
  { id:'usr-006', firstName:'Mariam', lastName:'Coulibaly', email:'mariam@modaafrik.com',
    password:HASHED_PW, phone:'+225075550005', role:'vendor', createdAt:'2024-03-01T00:00:00Z', isActive:true,
    storeName:'Bogolan Chic', storeDesc:'Bogolan et bazin riche, l\'élégance malienne modernisée.',
    storeCity:'Abidjan', storeAddress:'Treichville, Marché de la Mode', storeSlug:'bogolan-chic',
    rating:4.5, totalSales:620000, avatar:null },
  { id:'usr-010', firstName:'Mariame', lastName:'Keita', email:'mariame@gmail.com',
    password:HASHED_PW, phone:'+221701000010', role:'client', createdAt:'2024-02-20T00:00:00Z', isActive:true, avatar:null },
  { id:'usr-011', firstName:'Oumar', lastName:'Diop', email:'oumar@gmail.com',
    password:HASHED_PW, phone:'+221772000011', role:'client', createdAt:'2024-03-05T00:00:00Z', isActive:true, avatar:null },
];

// ─── Load products & orders from separate files ──────────────
let products = require('./products');
const { orders, reviews } = require('./orders');

// ─── INTERURBAIN SHIPPING RATES ──────────────────────────────
const shippingRates = {
  dakar:       { label:'Dakar',        price:2500 },
  abidjan:     { label:'Abidjan',      price:3000 },
  accra:       { label:'Accra',        price:3500 },
  lagos:       { label:'Lagos',        price:4000 },
  bamako:      { label:'Bamako',       price:3500 },
  conakry:     { label:'Conakry',      price:3000 },
  lome:        { label:'Lomé',         price:3000 },
  cotonou:     { label:'Cotonou',      price:3000 },
  ouagadougou: { label:'Ouagadougou',  price:4000 },
  niamey:      { label:'Niamey',       price:4500 },
  yaounde:     { label:'Yaoundé',      price:3500 },
  douala:      { label:'Douala',       price:3500 },
};

// ─── CRUD HELPERS ────────────────────────────────────────────
const db = {
  // Users
  users: {
    findAll:   ()          => users,
    findById:  (id)        => users.find(u => u.id === id),
    findByEmail:(email)    => users.find(u => u.email === email.toLowerCase()),
    create:    (data)      => { const u = { id: uuidv4(), ...data, createdAt: new Date().toISOString() }; users.push(u); return u; },
    update:    (id, data)  => { const i = users.findIndex(u => u.id === id); if (i<0) return null; users[i]={...users[i],...data}; return users[i]; },
    delete:    (id)        => { users = users.filter(u => u.id !== id); },
  },
  // Products
  products: {
    findAll:   ()          => products,
    findById:  (id)        => products.find(p => p.id === id),
    findByVendor:(vendorId)=> products.filter(p => p.vendorId === vendorId && p.isActive),
    create:    (data)      => { const p = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), isActive: true }; products.push(p); return p; },
    update:    (id, data)  => { const i = products.findIndex(p => p.id === id); if (i<0) return null; products[i]={...products[i],...data}; return products[i]; },
    delete:    (id)        => { const i = products.findIndex(p => p.id === id); if (i>=0) products[i].isActive = false; },
  },
  // Orders
  orders: {
    findAll:      ()             => orders,
    findById:     (id)           => orders.find(o => o.id === id),
    findByCustomer:(cid)         => orders.filter(o => o.customerId === cid),
    findByVendor: (vid)          => orders.filter(o => o.items.some(i => i.vendorId === vid)),
    create:       (data)         => { const o = { id: uuidv4(), ...data, createdAt: new Date().toISOString() }; orders.push(o); return o; },
    updateStatus: (id, status)   => { const i = orders.findIndex(o => o.id === id); if (i<0) return null; orders[i].status = status; orders[i].updatedAt = new Date().toISOString(); return orders[i]; },
  },
  // Reviews
  reviews: {
    findAll:      ()             => reviews,
    findByProduct:(pid)          => reviews.filter(r => r.productId === pid),
    create:       (data)         => { const r = { id: uuidv4(), ...data, createdAt: new Date().toISOString() }; reviews.push(r); return r; },
  },
  // Categories
  categories: {
    findAll:   () => categories,
    findBySlug:(slug) => categories.find(c => c.slug === slug),
  },
  // Shipping
  shippingRates,
};

module.exports = db;
