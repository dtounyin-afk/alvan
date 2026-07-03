# ModaAfrik Cameroun — Marketplace de Mode

## Déploiement

### 1. Backend Node.js
```bash
cd backend
npm install
cp .env.example .env   # Remplir les clés API
node server.js         # Port 3001
```

### 2. Frontend
- Configurer `assets/js/api.js` avec l'URL de votre backend
- Héberger les fichiers HTML/CSS/JS sur votre hébergeur

---

## Paiements — Configuration

### Orange Money Cameroun
1. Créer un compte sur https://developer.orange.com
2. Créer une application Orange Money Webpay CM
3. Récupérer `client_id` et `client_secret`
4. Dans `.env` : `ORANGE_MONEY_TOKEN=client_id:client_secret` (en base64)

### MTN Mobile Money Cameroun  
1. S'inscrire sur https://momodeveloper.mtn.com
2. Souscrire au produit "Collection"
3. Créer un utilisateur API via Postman ou la sandbox
4. Dans `.env` : remplir `MTN_MOMO_API_KEY`, `MTN_MOMO_USER_ID`, `MTN_MOMO_API_SECRET`

### CinetPay
1. Créer un compte marchand sur https://cinetpay.com
2. Aller dans Paramètres → API
3. Copier `API Key` et `Site ID`
4. Dans `.env` : `CINETPAY_API_KEY` et `CINETPAY_SITE_ID`

### FedaPay
1. Créer un compte sur https://fedapay.com
2. Dashboard → API Keys → Copier la clé Live
3. Dans `.env` : `FEDAPAY_SECRET_KEY=sk_live_...`

### Mode Simulation (sans clés API)
Si les clés ne sont pas configurées, le backend renvoie une simulation pour tester le flux sans paiement réel.

---

## Compte Admin
- Email    : `admin@modaafrik.cm`
- Password : `ModaAfrik@Admin2025!`
- URL      : `/admin.html`

## Persistance données
Les données sont sauvegardées dans `backend/data/json/*.json` :
- `users.json` — Utilisateurs + vendeurs
- `products.json` — Produits publiés
- `orders.json` — Commandes
- `reviews.json` — Avis
- `vendors_pending.json` — Dossiers KYC en attente
