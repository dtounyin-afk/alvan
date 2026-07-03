// ============================================================
// ModaAfrik — Products Data
// ============================================================
let products = [
  {
    id:'prd-001', name:'Robe Wax Soleil d\'Afrique', shortDesc:'Robe évasée en wax imprimé soleil, coupe moderne.',
    description:'Magnifique robe évasée confectionnée dans un tissu wax 100% coton certifié. Imprimé soleil iconique, coupe mi-longue flatteuse pour toutes les morphologies. Finitions soignées à la main par nos artisanes sénégalaises.',
    price:18500, salePrice:null, category:'robes-pagnes',
    colors:['Orange','Jaune','Rouge'], sizes:['S','M','L','XL'],
    stock:15, vendorId:'usr-002', rating:4.9, reviewCount:47,
    badge:'bestseller', tags:['wax','robe','femme','soleil'],
    gradient:'linear-gradient(135deg,#e67e22,#f39c12)',
    emoji:'👗', isFeatured:true, isNew:false,
    createdAt:'2024-02-10T00:00:00Z', isActive:true
  },
  {
    id:'prd-002', name:'Grand Boubou Brodé Prestige', shortDesc:'Boubou en bazin riche, broderies or sur col et poignets.',
    description:'Grand boubou trois pièces en bazin riche GETZNER authentique. Broderies dorées réalisées à la main sur le col, les manches et les poignets. Tissu fluide et lumineux, idéal pour les cérémonies et mariages.',
    price:45000, salePrice:38000, category:'boubous',
    colors:['Blanc','Bleu ciel','Champagne'], sizes:['M','L','XL','XXL'],
    stock:8, vendorId:'usr-004', rating:4.8, reviewCount:32,
    badge:'promo', tags:['boubou','bazin','cérémonie','brodé'],
    gradient:'linear-gradient(135deg,#2c3e50,#3498db)',
    emoji:'🥻', isFeatured:true, isNew:false,
    createdAt:'2024-01-20T00:00:00Z', isActive:true
  },
  {
    id:'prd-003', name:'Ensemble Kente Royale', shortDesc:'Ensemble 2 pièces en tissu kente du Ghana, authentique.',
    description:'Ensemble composé d\'un top et d\'un pantalon en tissu kente tissé à la main au Ghana. Motifs géométriques traditionnels en fils d\'or et vert. Chaque pièce est unique, numérotée par l\'artisan tisserand.',
    price:32000, salePrice:null, category:'hommes',
    colors:['Multicolore'], sizes:['S','M','L','XL'],
    stock:6, vendorId:'usr-003', rating:4.7, reviewCount:28,
    badge:'new', tags:['kente','ghana','ensemble','homme'],
    gradient:'linear-gradient(135deg,#27ae60,#f39c12)',
    emoji:'👔', isFeatured:true, isNew:true,
    createdAt:'2024-04-01T00:00:00Z', isActive:true
  },
  {
    id:'prd-004', name:'Sac Cuir Bogolan Artisan', shortDesc:'Sac à main en cuir véritable avec motif bogolan peint à la main.',
    description:'Sac à main fabriqué en cuir véritable tanné naturellement. Le rabat est orné d\'un motif bogolan authentique peint à la main par nos artisans maliens. Bandoulière amovible, doublure en coton wax.',
    price:22000, salePrice:19500, category:'accessoires',
    colors:['Marron','Noir'], sizes:['Unique'],
    stock:12, vendorId:'usr-006', rating:4.6, reviewCount:19,
    badge:'promo', tags:['sac','bogolan','cuir','accessoire'],
    gradient:'linear-gradient(135deg,#8e44ad,#3498db)',
    emoji:'👜', isFeatured:true, isNew:false,
    createdAt:'2024-03-05T00:00:00Z', isActive:true
  },
  {
    id:'prd-005', name:'Collier Perles Yoruba Or', shortDesc:'Collier multicouches en perles de verre dorées, style Yoruba.',
    description:'Parure de cou en perles de verre soufflé importées d\'Italie, montées à la main selon la tradition bijoutière Yoruba du Nigeria. 7 rangs de perles dorées, fermoir en argent massif 925.',
    price:15000, salePrice:null, category:'bijoux',
    colors:['Or','Bordeaux','Turquoise'], sizes:['Unique'],
    stock:20, vendorId:'usr-005', rating:4.9, reviewCount:63,
    badge:'bestseller', tags:['bijoux','collier','yoruba','perles'],
    gradient:'linear-gradient(135deg,#f39c12,#e74c3c)',
    emoji:'💎', isFeatured:true, isNew:false,
    createdAt:'2024-01-15T00:00:00Z', isActive:true
  },
  {
    id:'prd-006', name:'Sandales Cuir Tressé Artisan', shortDesc:'Sandales plates en cuir tressé, fabrication artisanale.',
    description:'Sandales fabriquées à la main par des cordonniers artisans dakarois. Cuir pleine fleur tressé, semelle en caoutchouc naturel antidérapante. Disponibles en demi-pointures sur demande.',
    price:12000, salePrice:null, category:'chaussures',
    colors:['Camel','Noir','Bordeaux'], sizes:['36','37','38','39','40','41','42'],
    stock:18, vendorId:'usr-002', rating:4.5, reviewCount:41,
    badge:'new', tags:['sandales','cuir','artisan','chaussures'],
    gradient:'linear-gradient(135deg,#e74c3c,#c0392b)',
    emoji:'👡', isFeatured:false, isNew:true,
    createdAt:'2024-04-10T00:00:00Z', isActive:true
  },
  {
    id:'prd-007', name:'Robe Ankara Fleurs Lagos', shortDesc:'Robe midi en tissu ankara imprimé floral, style Lagos.',
    description:'Robe midi taille haute en tissu ankara 100% coton waxé hollandais. Imprimé floral XXL tendance, dos boutonné, manches courtes évasées. La coupe met en valeur la silhouette avec élégance.',
    price:21000, salePrice:17500, category:'robes-pagnes',
    colors:['Bleu/Blanc','Rouge/Jaune','Vert/Or'], sizes:['XS','S','M','L','XL'],
    stock:10, vendorId:'usr-005', rating:4.7, reviewCount:55,
    badge:'promo', tags:['ankara','robe','floral','lagos'],
    gradient:'linear-gradient(135deg,#1abc9c,#2980b9)',
    emoji:'👗', isFeatured:true, isNew:false,
    createdAt:'2024-02-25T00:00:00Z', isActive:true
  },
  {
    id:'prd-008', name:'Tenue Enfant Wax Festive', shortDesc:'Ensemble 2 pièces enfant en wax, pour cérémonies.',
    description:'Adorable ensemble deux pièces pour enfant (haut + culotte/short) en tissu wax premium. Coutures surpiquées de couleur contrastante, boutons nacrés. Disponible de 2 à 12 ans.',
    price:9500, salePrice:null, category:'enfants',
    colors:['Rose/Gold','Bleu/Orange','Vert/Jaune'], sizes:['2ans','4ans','6ans','8ans','10ans','12ans'],
    stock:25, vendorId:'usr-002', rating:4.8, reviewCount:34,
    badge:'new', tags:['enfant','wax','ensemble','festif'],
    gradient:'linear-gradient(135deg,#e91e63,#ff9800)',
    emoji:'👶', isFeatured:false, isNew:true,
    createdAt:'2024-04-15T00:00:00Z', isActive:true
  },
  {
    id:'prd-009', name:'Chemise Batik Indigo Homme', shortDesc:'Chemise homme en coton batik indigo, coupe slim.',
    description:'Chemise slim fit confectionnée en coton batik teint à l\'indigo naturel. Teinture à la main par des artisans maliens selon la technique ancestrale. Chaque chemise est unique grâce aux variations naturelles de la teinte.',
    price:14000, salePrice:null, category:'hommes',
    colors:['Indigo','Indigo clair'], sizes:['S','M','L','XL','XXL'],
    stock:14, vendorId:'usr-006', rating:4.6, reviewCount:22,
    badge:null, tags:['chemise','batik','indigo','homme'],
    gradient:'linear-gradient(135deg,#2c3e50,#4ca1af)',
    emoji:'👔', isFeatured:false, isNew:false,
    createdAt:'2024-03-20T00:00:00Z', isActive:true
  },
  {
    id:'prd-010', name:'Bracelet Or Ashanti', shortDesc:'Bracelet en or 18 carats, style traditionnel Ashanti.',
    description:'Bracelet artisanal en or jaune 18 carats (750/1000). Motifs géométriques Ashanti gravés à la main. Fermoir à charnière sécurisé. Certificat d\'authenticité fourni. Livré dans son écrin de luxe.',
    price:85000, salePrice:null, category:'bijoux',
    colors:['Or jaune','Or blanc'], sizes:['Unique — S/M','Unique — M/L'],
    stock:5, vendorId:'usr-003', rating:5.0, reviewCount:12,
    badge:'premium', tags:['bracelet','or','ashanti','bijou'],
    gradient:'linear-gradient(135deg,#f7971e,#ffd200)',
    emoji:'💍', isFeatured:true, isNew:false,
    createdAt:'2024-02-01T00:00:00Z', isActive:true
  },
  {
    id:'prd-011', name:'Pagne Tissé Kita Mali', shortDesc:'Pagne tissé main, motifs géométriques traditionnels Kita.',
    description:'Pagne en coton tissé à la main sur métier traditionnel dans la région de Kita au Mali. Motifs géométriques bicolores, résistant et lavable. 6 mètres de tissu idéal pour confection sur mesure.',
    price:16000, salePrice:13500, category:'robes-pagnes',
    colors:['Bleu/Blanc','Brun/Crème','Rouge/Noir'], sizes:['6m'],
    stock:22, vendorId:'usr-006', rating:4.4, reviewCount:18,
    badge:'promo', tags:['pagne','tissé','mali','coton'],
    gradient:'linear-gradient(135deg,#360033,#0b8793)',
    emoji:'🧶', isFeatured:false, isNew:false,
    createdAt:'2024-03-10T00:00:00Z', isActive:true
  },
  {
    id:'prd-012', name:'Boubou Femme Dentelle Dorée', shortDesc:'Boubou femme 2 pièces avec application de dentelle dorée.',
    description:'Boubou femme deux pièces en mousseline de soie légère. Application de dentelle brodée dorée sur l\'encolure et les manches. Accompagné de son sous-robe assortie. Tenue idéale pour baptêmes et mariages.',
    price:38000, salePrice:null, category:'boubous',
    colors:['Blanc cassé','Rosé','Mauve'], sizes:['S','M','L','XL','XXL'],
    stock:7, vendorId:'usr-004', rating:4.9, reviewCount:29,
    badge:'premium', tags:['boubou','femme','dentelle','cérémonie'],
    gradient:'linear-gradient(135deg,#c94b4b,#4b134f)',
    emoji:'🥻', isFeatured:true, isNew:false,
    createdAt:'2024-02-18T00:00:00Z', isActive:true
  },
];

module.exports = products;
