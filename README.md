# ModaAfrik — Marketplace de Mode Camerounaise

Plateforme e-commerce marketplace dédiée à la mode camerounaise.

## Stack technique
- **Frontend** : HTML5, CSS3, JavaScript vanilla, GSAP 3
- **Backend** : Node.js + Express (API REST)
- **Stockage** : In-memory (dev) / localStorage (frontend)

## Structure
```
pg-ecomerce/
├── index.html              # Accueil
├── shop.html               # Catalogue
├── product.html            # Fiche produit
├── cart.html               # Panier
├── checkout.html           # Tunnel paiement (3 étapes)
├── auth.html               # Connexion / Inscription clients
├── vendor-setup.html       # Activation compte vendeur (KYC)
├── vendor-dashboard.html   # Dashboard vendeur
├── admin.html              # Super Admin
├── assets/
│   ├── css/                # Styles (main, home, shop, product, checkout, dashboard, admin, auth)
│   └── js/                 # Scripts (api, cart, data, home, shop, product, checkout, auth, dashboard, admin, vendor-setup)
└── backend/
    ├── server.js           # Express API
    ├── routes/             # auth, products, orders, vendors, categories, cart, upload
    ├── middleware/         # auth JWT, upload multer
    └── data/               # db.js, products.js, orders.js
```

## Démarrage backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev   # port 3001
```

## Sécurité & Rôles
| Rôle    | Accès                                      |
|---------|--------------------------------------------|
| Admin   | admin.html — gestion complète du site      |
| Vendeur | vendor-dashboard.html — via invitation KYC |
| Client  | auth.html — inscription publique           |

### Flux vendeur (KYC obligatoire)
1. Admin génère un code d'invitation → envoie le lien au futur vendeur
2. Vendeur remplit le formulaire KYC (CNI recto/verso + selfies en direct)
3. Admin valide le dossier → compte activé
4. Vendeur soumet ses produits → Admin approuve → visible sur la vitrine

## Paiements (Cameroun)
- Orange Money (+237)
- MTN MoMo (+237)
- CinetPay
- FedaPay

## Connexion admin
```
Email    : admin@modaafrik.cm
Password : ModaAfrik@Admin2025!
```
