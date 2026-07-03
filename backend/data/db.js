// ============================================================
// ModaAfrik — Database (délègue vers Store persistant)
// ============================================================
const Store = require('./store');

// Compat : exporter Store directement sous le nom db
// Toutes les routes utilisent db.users, db.products, etc.
const db = {
  users:      Store.users,
  products:   Store.products,
  orders:     Store.orders,
  reviews:    Store.reviews,
  categories: Store.categories,
  shippingRates: Store.shippingRates,
};

module.exports = db;
