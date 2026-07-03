// ============================================================
// ModaAfrik Cameroun — Routes Paiement
// Orange Money CM, MTN MoMo CM, CinetPay, FedaPay
// ============================================================
const router  = require('express').Router();
const https   = require('https');
const fetch   = (...args) => import('node-fetch').then(m => m.default(...args));

// ── ORANGE MONEY CAMEROUN ─────────────────────────────────────
// Docs: https://developer.orange.com/apis/om-webpay-cm
router.post('/orange-money/initiate', async (req, res) => {
  const { phone, amount, orderRef, description } = req.body;
  if (!phone || !amount || !orderRef) {
    return res.status(422).json({ success:false, message:'phone, amount, orderRef requis' });
  }

  const OM_TOKEN  = process.env.ORANGE_MONEY_TOKEN  || '';
  const OM_MERCHANT = process.env.ORANGE_MONEY_MERCHANT_KEY || '';

  if (!OM_TOKEN || !OM_MERCHANT) {
    // Mode simulation si clés absentes
    return res.json({
      success: true,
      simulated: true,
      message: `Simulation Orange Money — Numéro: ${phone}, Montant: ${amount} FCFA`,
      payToken: 'SIM_OM_' + Date.now(),
      notifToken: 'NOTIF_' + Date.now(),
    });
  }

  try {
    // 1. Obtenir le token de paiement
    const tokenRes = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(OM_TOKEN).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Initier le paiement USSD push
    const payRes = await fetch('https://api.orange.com/orange-money-webpay/cm/v1/webpayment', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'X-AUTH-TOKEN': OM_MERCHANT },
      body: JSON.stringify({
        merchant_key: OM_MERCHANT,
        currency: 'XAF',
        order_id: orderRef,
        amount: String(amount),
        return_url: process.env.FRONTEND_URL + '/checkout.html?status=success',
        cancel_url: process.env.FRONTEND_URL + '/checkout.html?status=cancel',
        notif_url: (process.env.BACKEND_URL || 'https://modaafrik.cm/api') + '/payment/orange-money/notify',
        lang: 'fr',
        reference: description || 'Commande ModaAfrik',
      }),
    });
    const payData = await payRes.json();
    res.json({ success:true, payToken:payData.pay_token, paymentUrl:payData.payment_url, notifToken:payData.notif_token });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erreur Orange Money: ' + e.message });
  }
});

// Notification webhook Orange Money
router.post('/orange-money/notify', (req, res) => {
  console.log('[OM Notify]', req.body);
  // En production: vérifier le token et mettre à jour la commande
  res.json({ status: 200 });
});

// ── MTN MOMO CAMEROUN ─────────────────────────────────────────
// Docs: https://momodeveloper.mtn.com
router.post('/mtn-momo/initiate', async (req, res) => {
  const { phone, amount, orderRef, description } = req.body;
  if (!phone || !amount || !orderRef) {
    return res.status(422).json({ success:false, message:'phone, amount, orderRef requis' });
  }

  const MTN_KEY    = process.env.MTN_MOMO_API_KEY    || '';
  const MTN_USER   = process.env.MTN_MOMO_USER_ID    || '';
  const MTN_SECRET = process.env.MTN_MOMO_API_SECRET || '';
  const MTN_ENV    = process.env.MTN_MOMO_ENV        || 'sandbox';
  const BASE_URL   = MTN_ENV === 'production' ? 'https://proxy.momoapi.mtn.com' : 'https://sandbox.momodeveloper.mtn.com';

  if (!MTN_KEY || !MTN_USER) {
    return res.json({
      success: true, simulated: true,
      message: `Simulation MTN MoMo — Numéro: ${phone}, Montant: ${amount} FCFA`,
      referenceId: 'SIM_MTN_' + Date.now(),
    });
  }

  try {
    // 1. Token d'accès
    const creds = Buffer.from(MTN_USER + ':' + MTN_SECRET).toString('base64');
    const tokRes = await fetch(BASE_URL + '/collection/token/', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + creds, 'Ocp-Apim-Subscription-Key': MTN_KEY },
    });
    const tokData  = await tokRes.json();
    const token    = tokData.access_token;
    const refId    = require('uuid').v4();

    // 2. Request to Pay
    const payRes = await fetch(BASE_URL + '/collection/v1_0/requesttopay', {
      method: 'POST',
      headers: {
        'Authorization':              'Bearer ' + token,
        'X-Reference-Id':             refId,
        'X-Target-Environment':       MTN_ENV,
        'Ocp-Apim-Subscription-Key':  MTN_KEY,
        'Content-Type':               'application/json',
      },
      body: JSON.stringify({
        amount:   String(amount),
        currency: 'XAF',
        externalId: orderRef,
        payer: { partyIdType:'MSISDN', partyId: phone.replace('+','') },
        payerMessage: description || 'Paiement ModaAfrik',
        payeeNote:    'Commande ' + orderRef,
      }),
    });

    if (payRes.status === 202) {
      res.json({ success:true, referenceId:refId, message:'Notification envoyée sur le téléphone' });
    } else {
      const err = await payRes.text();
      res.status(400).json({ success:false, message:'Erreur MTN: ' + err });
    }
  } catch (e) {
    res.status(500).json({ success:false, message:'Erreur MTN MoMo: ' + e.message });
  }
});

// Vérifier statut paiement MTN
router.get('/mtn-momo/status/:referenceId', async (req, res) => {
  const MTN_KEY   = process.env.MTN_MOMO_API_KEY  || '';
  const MTN_USER  = process.env.MTN_MOMO_USER_ID  || '';
  const MTN_SEC   = process.env.MTN_MOMO_API_SECRET || '';
  const MTN_ENV   = process.env.MTN_MOMO_ENV      || 'sandbox';
  const BASE_URL  = MTN_ENV === 'production' ? 'https://proxy.momoapi.mtn.com' : 'https://sandbox.momodeveloper.mtn.com';

  if (!MTN_KEY) return res.json({ success:true, status:'SUCCESSFUL', simulated:true });

  try {
    const creds  = Buffer.from(MTN_USER + ':' + MTN_SEC).toString('base64');
    const tokRes = await fetch(BASE_URL + '/collection/token/', { method:'POST', headers:{'Authorization':'Basic '+creds,'Ocp-Apim-Subscription-Key':MTN_KEY} });
    const token  = (await tokRes.json()).access_token;
    const sRes   = await fetch(BASE_URL + '/collection/v1_0/requesttopay/' + req.params.referenceId, {
      headers:{ 'Authorization':'Bearer '+token, 'X-Target-Environment':MTN_ENV, 'Ocp-Apim-Subscription-Key':MTN_KEY }
    });
    const data = await sRes.json();
    res.json({ success:true, status:data.status, data });
  } catch (e) {
    res.status(500).json({ success:false, message:e.message });
  }
});

// ── CINETPAY ──────────────────────────────────────────────────
// Docs: https://docs.cinetpay.com
router.post('/cinetpay/initiate', async (req, res) => {
  const { amount, orderRef, customerName, customerEmail, customerPhone, description } = req.body;

  const CP_KEY    = process.env.CINETPAY_API_KEY  || '';
  const CP_SITE   = process.env.CINETPAY_SITE_ID  || '';
  const FRONTEND  = process.env.FRONTEND_URL || 'https://modaafrik.cm';

  if (!CP_KEY || !CP_SITE) {
    return res.json({
      success: true, simulated: true,
      paymentUrl: FRONTEND + '/checkout.html?status=simulated&ref=' + orderRef,
      message: 'Simulation CinetPay — Montant: ' + amount + ' FCFA',
    });
  }

  try {
    const payload = {
      apikey:            CP_KEY,
      site_id:           CP_SITE,
      transaction_id:    orderRef,
      amount:            amount,
      currency:          'XAF',
      description:       description || 'Commande ModaAfrik',
      return_url:        FRONTEND + '/checkout.html?status=success&ref=' + orderRef,
      notify_url:        (process.env.BACKEND_URL||'https://api.modaafrik.cm') + '/api/payment/cinetpay/notify',
      customer_name:     customerName  || '',
      customer_email:    customerEmail || '',
      customer_phone_number: customerPhone || '',
      customer_address:  'Cameroun',
      customer_city:     'Douala',
      customer_country:  'CM',
      customer_state:    'CM',
      customer_zip_code: '00000',
      channels:          'ALL',
      lang:              'fr',
      metadata:          orderRef,
    };
    const r = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    });
    const data = await r.json();
    if (data.code === '201') {
      res.json({ success:true, paymentUrl:data.data.payment_url, payToken:data.data.payment_token });
    } else {
      res.status(400).json({ success:false, message:data.message||'Erreur CinetPay' });
    }
  } catch (e) {
    res.status(500).json({ success:false, message:'Erreur CinetPay: ' + e.message });
  }
});

router.post('/cinetpay/notify', (req, res) => {
  console.log('[CinetPay Notify]', req.body);
  res.json({ code:'00', message:'Accepted' });
});

// ── FEDAPAY ───────────────────────────────────────────────────
// Docs: https://docs.fedapay.com
router.post('/fedapay/initiate', async (req, res) => {
  const { amount, orderRef, customerFirstname, customerLastname, customerEmail, customerPhone } = req.body;

  const FP_KEY   = process.env.FEDAPAY_SECRET_KEY || '';
  const FP_ENV   = process.env.FEDAPAY_ENV        || 'sandbox';
  const BASE     = FP_ENV === 'production' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com';
  const FRONTEND = process.env.FRONTEND_URL || 'https://modaafrik.cm';

  if (!FP_KEY) {
    return res.json({
      success:true, simulated:true,
      paymentUrl: FRONTEND + '/checkout.html?status=simulated&ref=' + orderRef,
      message: 'Simulation FedaPay — Montant: ' + amount + ' FCFA',
    });
  }

  try {
    // 1. Créer la transaction
    const txRes = await fetch(BASE + '/v1/transactions', {
      method:'POST',
      headers:{ 'Authorization':'Bearer '+FP_KEY, 'Content-Type':'application/json', 'FedaPay-Version':'v1' },
      body: JSON.stringify({
        description: 'Commande ModaAfrik ' + orderRef,
        amount:      amount,
        currency:    { iso:'XAF' },
        callback_url:FRONTEND + '/checkout.html?status=success&ref=' + orderRef,
        customer:    { firstname:customerFirstname||'', lastname:customerLastname||'', email:customerEmail||'', phone_number:{ number:customerPhone||'', country:'CM' } },
      }),
    });
    const txData = await txRes.json();
    if (!txData.v1?.transaction?.id) return res.status(400).json({ success:false, message:'Erreur FedaPay: '+JSON.stringify(txData) });

    // 2. Générer le token de paiement
    const tokRes = await fetch(BASE + '/v1/transactions/' + txData.v1.transaction.id + '/token', {
      method:'GET',
      headers:{ 'Authorization':'Bearer '+FP_KEY, 'FedaPay-Version':'v1' },
    });
    const tokData = await tokRes.json();
    res.json({ success:true, paymentUrl:'https://checkout.fedapay.com/checkout/payment/'+tokData.v1?.token, token:tokData.v1?.token });
  } catch (e) {
    res.status(500).json({ success:false, message:'Erreur FedaPay: ' + e.message });
  }
});

module.exports = router;
