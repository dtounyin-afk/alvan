// ============================================================
// ModaAfrik — Orders & Reviews Data
// ============================================================
let orders = [
  {
    id:'ord-001', orderNumber:'MA-00001', customerId:'usr-010',
    items:[{productId:'prd-001',name:'Robe Wax Soleil d\'Afrique',qty:1,price:18500,size:'M',color:'Orange',vendorId:'usr-002'}],
    deliveryOption:'local', deliveryCity:'Dakar', deliveryCost:1000,
    subtotal:18500, total:19500, commission:1850, vendorAmount:16650,
    paymentMethod:'orange_money', status:'delivered',
    firstName:'Mariame', lastName:'Keita', phone:'+221701000010', address:'Plateau, Dakar',
    createdAt:'2024-04-10T09:00:00Z'
  },
  {
    id:'ord-002', orderNumber:'MA-00002', customerId:'usr-011',
    items:[{productId:'prd-002',name:'Grand Boubou Brodé Prestige',qty:1,price:38000,size:'L',color:'Blanc',vendorId:'usr-004'}],
    deliveryOption:'interurbain', deliveryCity:'Abidjan', deliveryCost:3500,
    subtotal:38000, total:41500, commission:3800, vendorAmount:34200,
    paymentMethod:'cinetpay', status:'shipped',
    firstName:'Oumar', lastName:'Diop', phone:'+221772000011', address:'Cocody, Abidjan',
    createdAt:'2024-04-12T11:30:00Z'
  },
  {
    id:'ord-003', orderNumber:'MA-00003', customerId:'usr-010',
    items:[
      {productId:'prd-005',name:'Collier Perles Yoruba Or',qty:2,price:15000,size:'Unique',color:'Or',vendorId:'usr-005'},
      {productId:'prd-004',name:'Sac Cuir Bogolan Artisan',qty:1,price:19500,size:'Unique',color:'Noir',vendorId:'usr-006'}
    ],
    deliveryOption:'pickup', deliveryCity:'', deliveryCost:0,
    subtotal:49500, total:49500, commission:4950, vendorAmount:44550,
    paymentMethod:'mtn_momo', status:'processing',
    firstName:'Mariame', lastName:'Keita', phone:'+221701000010', address:'',
    createdAt:'2024-04-18T14:20:00Z'
  },
  {
    id:'ord-004', orderNumber:'MA-00004', customerId:'usr-011',
    items:[{productId:'prd-007',name:'Robe Ankara Fleurs Lagos',qty:1,price:17500,size:'S',color:'Bleu/Blanc',vendorId:'usr-005'}],
    deliveryOption:'local', deliveryCity:'Lagos', deliveryCost:1000,
    subtotal:17500, total:18500, commission:1750, vendorAmount:15750,
    paymentMethod:'fedapay', status:'pending',
    firstName:'Oumar', lastName:'Diop', phone:'+221772000011', address:'Victoria Island, Lagos',
    createdAt:'2024-04-20T08:45:00Z'
  },
  {
    id:'ord-005', orderNumber:'MA-00005', customerId:'usr-010',
    items:[{productId:'prd-010',name:'Bracelet Or Ashanti',qty:1,price:85000,size:'Unique — M/L',color:'Or jaune',vendorId:'usr-003'}],
    deliveryOption:'interurbain', deliveryCity:'Dakar', deliveryCost:2500,
    subtotal:85000, total:87500, commission:8500, vendorAmount:76500,
    paymentMethod:'cinetpay', status:'delivered',
    firstName:'Mariame', lastName:'Keita', phone:'+221701000010', address:'Almadies, Dakar',
    createdAt:'2024-03-25T16:00:00Z'
  },
];

let reviews = [
  { id:'rev-001', productId:'prd-001', userId:'usr-010', userName:'Mariame K.', rating:5,
    comment:'Superbe robe, tissu de qualité et coupe parfaite ! Je l\'ai portée pour un mariage et j\'ai reçu pleins de compliments.', createdAt:'2024-04-12T00:00:00Z' },
  { id:'rev-002', productId:'prd-001', userId:'usr-011', userName:'Oumar D.', rating:5,
    comment:'Commandé pour ma femme, elle est ravie. Livraison rapide et emballage soigné.', createdAt:'2024-04-15T00:00:00Z' },
  { id:'rev-003', productId:'prd-001', userId:'usr-012', userName:'Hawa B.', rating:4,
    comment:'Très belle robe, la couleur est fidèle aux photos. Taille bien.', createdAt:'2024-04-18T00:00:00Z' },
  { id:'rev-004', productId:'prd-002', userId:'usr-010', userName:'Mariame K.', rating:5,
    comment:'Grand boubou somptueux, les broderies sont magnifiques. Mon mari est très élégant avec.', createdAt:'2024-04-14T00:00:00Z' },
  { id:'rev-005', productId:'prd-005', userId:'usr-013', userName:'Ibrahim C.', rating:5,
    comment:'Magnifique collier, très original. Livré dans un beau coffret.', createdAt:'2024-04-16T00:00:00Z' },
  { id:'rev-006', productId:'prd-007', userId:'usr-014', userName:'Kadiatou C.', rating:4,
    comment:'Belle robe, tissu de qualité. La coupe est flatteuse.', createdAt:'2024-04-17T00:00:00Z' },
  { id:'rev-007', productId:'prd-010', userId:'usr-010', userName:'Mariame K.', rating:5,
    comment:'Bracelet sublime, vraiment du travail d\'orfèvre. Très satisfaite !', createdAt:'2024-04-02T00:00:00Z' },
  { id:'rev-008', productId:'prd-012', userId:'usr-015', userName:'Moussa K.', rating:5,
    comment:'Commandé pour ma mère, elle est très heureuse. Qualité irréprochable.', createdAt:'2024-04-19T00:00:00Z' },
];

module.exports = { orders, reviews };
