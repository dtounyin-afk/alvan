// ============================================================
// ModaAfrik Cameroun — Données de référence
// Vitrine vide — aucun produit fictif
// Seul le super admin peut ajouter des éléments sur la vitrine
// ============================================================

// Villes du Cameroun avec tarifs de livraison
const CAMEROON_CITIES = {
  douala:      { label:'Douala',        price:2000 },
  yaounde:     { label:'Yaoundé',       price:2000 },
  bafoussam:   { label:'Bafoussam',     price:3500 },
  bamenda:     { label:'Bamenda',       price:3500 },
  garoua:      { label:'Garoua',        price:5000 },
  maroua:      { label:'Maroua',        price:5500 },
  ngaoundere:  { label:'Ngaoundéré',    price:4500 },
  bertoua:     { label:'Bertoua',       price:4000 },
  ebolowa:     { label:'Ebolowa',       price:3000 },
  kribi:       { label:'Kribi',         price:3000 },
  limbe:       { label:'Limbé',         price:2500 },
  buea:        { label:'Buea',          price:2500 },
  kumba:       { label:'Kumba',         price:3000 },
  nkongsamba:  { label:'Nkongsamba',    price:3000 },
  edea:        { label:'Edéa',          price:2500 },
  sangmelima:  { label:'Sangmélima',    price:3500 },
  mbalmayo:    { label:'Mbalmayo',      price:2500 },
  foumban:     { label:'Foumban',       price:4000 },
  bangangte:   { label:'Bangangté',     price:3500 },
};

// Vitrine : VIDE — seul le super admin ajoute les produits
const MOCK_PRODUCTS = [];
const MOCK_VENDORS  = [];
const MOCK_ORDERS   = [];
const MOCK_REVIEWS  = [];

window.CAMEROON_CITIES = CAMEROON_CITIES;
window.MOCK_PRODUCTS   = MOCK_PRODUCTS;
window.MOCK_VENDORS    = MOCK_VENDORS;
window.MOCK_ORDERS     = MOCK_ORDERS;
window.MOCK_REVIEWS    = MOCK_REVIEWS;
