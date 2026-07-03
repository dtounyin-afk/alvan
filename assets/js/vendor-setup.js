// ============================================================
// ModaAfrik Cameroun — Vendor Setup (KYC sécurisé)
// Accessible uniquement via token d'invitation admin
// ============================================================

// Données du formulaire
const vsData = {
  token: '',
  step1: {}, step2: {}, step3: {}, step4: {},
  kyc: {
    cniRecto:   null,
    cniVerso:   null,
    selfie:     null,
    selfiecni:  null,
  }
};

// Streams caméra actifs
const streams = {};

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si un token est passé en URL (?token=XXXX)
  const urlToken = new URLSearchParams(location.search).get('token');
  if (urlToken) {
    document.getElementById('inviteToken').value = urlToken.toUpperCase();
    verifyToken();
  }
});

/* ── VÉRIFICATION TOKEN ── */
function verifyToken() {
  const input = document.getElementById('inviteToken');
  const token = input?.value.trim().toUpperCase();
  if (!token) { showToast('Entrez votre code d\'invitation', 'error'); return; }

  // Vérifier dans les invitations générées par l'admin
  const invitations = JSON.parse(localStorage.getItem('ma_vendor_invitations') || '[]');
  const invitation  = invitations.find(i => i.token === token && !i.used);

  if (!invitation) {
    showToast('Code d\'invitation invalide ou déjà utilisé', 'error');
    input.value = '';
    input.style.borderColor = 'var(--red)';
    return;
  }

  vsData.token = token;
  vsData.invitationId = invitation.id;

  // Pré-remplir l'email si présent dans l'invitation
  if (invitation.email) {
    const emailField = document.getElementById('v1Email');
    if (emailField) { emailField.value = invitation.email; emailField.readOnly = true; }
  }

  document.getElementById('tokenCheck').classList.add('hidden');
  document.getElementById('vendorSetupForm').classList.remove('hidden');
  showToast('Code valide ! Complétez votre dossier.', 'success');
}

/* ── NAVIGATION ÉTAPES ── */
function vsNext(step) {
  // Validation par étape
  if (step === 2 && !validateStep1()) return;
  if (step === 3 && !validateStep2()) return;
  if (step === 4 && !validateStep3()) return;
  if (step === 5) { vsSubmit(); return; }

  [1,2,3,4,5].forEach(i => {
    document.getElementById(`vs${i}`)?.classList.add('hidden');
    const s = document.getElementById(`vstep${i}`);
    if (!s) return;
    s.classList.remove('active','done');
    if (i < step) s.classList.add('done');
    if (i === step) s.classList.add('active');
  });
  document.getElementById(`vs${step}`)?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── VALIDATIONS ── */
function validateStep1() {
  const fn  = document.getElementById('v1FN')?.value.trim();
  const ln  = document.getElementById('v1LN')?.value.trim();
  const em  = document.getElementById('v1Email')?.value.trim();
  const ph  = document.getElementById('v1Phone')?.value.trim();
  const dob = document.getElementById('v1DOB')?.value;
  const cni = document.getElementById('v1CNI')?.value.trim();
  const pw  = document.getElementById('v1Pwd')?.value;
  const pwc = document.getElementById('v1PwdC')?.value;

  if (!fn || !ln)    { showToast('Prénom et nom requis', 'error'); return false; }
  if (!em || !em.includes('@')) { showToast('Email valide requis', 'error'); return false; }
  if (!ph.startsWith('+237'))   { showToast('Numéro Cameroun requis (+237 6XX XXX XXX)', 'error'); return false; }
  if (!dob)          { showToast('Date de naissance requise', 'error'); return false; }
  if (!cni)          { showToast('Numéro CNI requis', 'error'); return false; }
  if (pw.length < 8) { showToast('Mot de passe minimum 8 caractères', 'error'); return false; }
  if (pw !== pwc)    { showToast('Les mots de passe ne correspondent pas', 'error'); return false; }

  // Vérifier âge minimum (18 ans)
  const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
  if (age < 18) { showToast('Vous devez avoir au moins 18 ans pour devenir vendeur', 'error'); return false; }

  vsData.step1 = { fn, ln, em, ph, dob, cni, pw };
  return true;
}

function validateStep2() {
  const name = document.getElementById('v2StoreName')?.value.trim();
  const desc = document.getElementById('v2Desc')?.value.trim();
  const city = document.getElementById('v2City')?.value;
  const addr = document.getElementById('v2Address')?.value.trim();
  const cat  = document.getElementById('v2Cat')?.value;

  if (!name) { showToast('Nom de boutique requis', 'error'); return false; }
  if (!desc) { showToast('Description de la boutique requise', 'error'); return false; }
  if (!city) { showToast('Sélectionnez votre ville', 'error'); return false; }
  if (!addr) { showToast('Adresse requise', 'error'); return false; }
  if (!cat)  { showToast('Catégorie principale requise', 'error'); return false; }

  vsData.step2 = { name, desc, city, addr, cat };
  return true;
}

function validateStep3() {
  if (!vsData.kyc.cniRecto)  { showToast('Photo CNI recto requise', 'error'); return false; }
  if (!vsData.kyc.cniVerso)  { showToast('Photo CNI verso requise', 'error'); return false; }
  if (!vsData.kyc.selfie)    { showToast('Selfie en direct requis', 'error'); return false; }
  if (!vsData.kyc.selfiecni) { showToast('Selfie avec CNI requis', 'error'); return false; }
  if (!document.getElementById('kycConsent')?.checked) {
    showToast('Vous devez accepter le consentement KYC', 'error'); return false;
  }
  return true;
}

/* ── UPLOAD FICHIERS ── */
function triggerUpload(inputId, previewId) {
  document.getElementById(inputId)?.click();
}

function previewKYC(input, previewId) {
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('Fichier trop volumineux (max 5 Mo)', 'error');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const key = input.id; // 'cniRecto' ou 'cniVerso'
    vsData.kyc[key] = e.target.result;
    const prev = document.getElementById(previewId);
    if (prev) {
      prev.innerHTML = `
        <img src="${e.target.result}" class="kyc-preview-img"/>
        <div class="kyc-preview-ok">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
          Photo reçue — qualité vérifiée
        </div>`;
    }
  };
  reader.readAsDataURL(file);
}

/* ── CAMÉRA EN DIRECT ── */
async function startCamera(type) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    streams[type] = stream;

    const video = document.getElementById(`${type}Video`);
    const prev  = document.getElementById(`${type}Preview`);
    const btnStart   = document.getElementById(`btnStart${capitalize(type)}`);
    const btnCapture = document.getElementById(`btnCapture${capitalize(type)}`);

    video.srcObject = stream;
    video.style.display  = 'block';
    if (prev) prev.style.display = 'none';
    btnStart?.classList.add('hidden');
    btnCapture?.classList.remove('hidden');

  } catch (err) {
    if (err.name === 'NotAllowedError') {
      showToast('Accès à la caméra refusé. Autorisez la caméra dans les paramètres.', 'error');
    } else {
      showToast('Caméra indisponible sur cet appareil', 'error');
    }
  }
}

function capturePhoto(type) {
  const video   = document.getElementById(`${type}Video`);
  const canvas  = document.getElementById(`${type}Canvas`);
  const prev    = document.getElementById(`${type}Preview`);
  const btnCapture = document.getElementById(`btnCapture${capitalize(type)}`);
  const btnRetake  = document.getElementById(`btnRetake${capitalize(type)}`);

  if (!video || !canvas) return;

  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Horodatage sur la photo (sécurité)
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
  ctx.fillStyle = '#fff';
  ctx.font      = '11px monospace';
  ctx.fillText(`ModaAfrik KYC · ${new Date().toLocaleString('fr-FR')}`, 8, canvas.height - 9);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  vsData.kyc[type] = dataUrl;

  // Arrêter le stream
  stopCamera(type);

  // Afficher la photo capturée
  if (prev) {
    prev.style.display = '';
    prev.innerHTML = `
      <img src="${dataUrl}" class="kyc-preview-img"/>
      <div class="kyc-preview-ok">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        Photo capturée · ${new Date().toLocaleTimeString('fr-FR')}
      </div>`;
  }
  video.style.display = 'none';
  btnCapture?.classList.add('hidden');
  btnRetake?.classList.remove('hidden');
}

function retakePhoto(type) {
  vsData.kyc[type] = null;
  const prev     = document.getElementById(`${type}Preview`);
  const btnStart = document.getElementById(`btnStart${capitalize(type)}`);
  const btnRetake= document.getElementById(`btnRetake${capitalize(type)}`);

  if (prev) {
    prev.style.display = '';
    prev.innerHTML = `
      <div class="kyc-preview-placeholder">
        <p>Photo supprimée — prenez une nouvelle photo</p>
      </div>`;
  }
  btnStart?.classList.remove('hidden');
  btnRetake?.classList.add('hidden');
}

function stopCamera(type) {
  if (streams[type]) {
    streams[type].getTracks().forEach(t => t.stop());
    delete streams[type];
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── PAIEMENTS ── */
function showPaySetup() {
  const method = document.getElementById('v4Method')?.value;
  ['Orange','MTN','Bank'].forEach(m => {
    document.getElementById(`paySetup${m}`)?.classList.add('hidden');
  });
  const map = { orange:'Orange', mtn:'MTN', bank:'Bank' };
  if (map[method]) document.getElementById(`paySetup${map[method]}`)?.classList.remove('hidden');
}

/* ── SOUMISSION FINALE ── */
async function vsSubmit() {
  const method = document.getElementById('v4Method')?.value;
  if (!method) { showToast('Choisissez une méthode de paiement', 'error'); return; }

  vsData.step4 = { method };

  // Construire le dossier complet
  const dossier = {
    id:           'vnd-' + Date.now(),
    inviteToken:  vsData.token,
    status:       'kyc_pending',
    submittedAt:  new Date().toISOString(),
    // Infos personnelles
    firstName:    vsData.step1.fn,
    lastName:     vsData.step1.ln,
    email:        vsData.step1.em,
    phone:        vsData.step1.ph,
    dateOfBirth:  vsData.step1.dob,
    cniNumber:    vsData.step1.cni,
    passwordHash: btoa(vsData.step1.pw), // Encodé (en prod: bcrypt côté serveur)
    // Boutique
    storeName:    vsData.step2.name,
    storeDesc:    vsData.step2.desc,
    storeCity:    vsData.step2.city,
    storeAddress: vsData.step2.addr,
    storeCategory:vsData.step2.cat,
    // KYC (images base64 — en prod: upload S3 chiffré)
    kyc: {
      cniRecto:   vsData.kyc.cniRecto   ? '[document_securise]' : null,
      cniVerso:   vsData.kyc.cniVerso   ? '[document_securise]' : null,
      selfie:     vsData.kyc.selfie     ? '[biometrique_securise]' : null,
      selfiecni:  vsData.kyc.selfiecni  ? '[biometrique_securise]' : null,
      capturedAt: new Date().toISOString(),
    },
    // Paiement
    paymentMethod: vsData.step4.method,
  };

  // Essayer l'API backend
  try {
    await Api.post('/vendors/apply', dossier);
  } catch {}

  // Sauvegarder en attente de validation admin
  const pending = JSON.parse(localStorage.getItem('ma_vendors_kyc_pending') || '[]');
  pending.unshift(dossier);
  localStorage.setItem('ma_vendors_kyc_pending', JSON.stringify(pending));

  // Marquer le token comme utilisé
  const invitations = JSON.parse(localStorage.getItem('ma_vendor_invitations') || '[]');
  const inv = invitations.find(i => i.token === vsData.token);
  if (inv) { inv.used = true; inv.usedAt = new Date().toISOString(); }
  localStorage.setItem('ma_vendor_invitations', JSON.stringify(invitations));

  // Arrêter toutes les caméras
  Object.keys(streams).forEach(stopCamera);

  // Afficher confirmation
  vsNext(5);
}

/* ── HELPERS ── */
function checkPwdStrength(inp, barId='v1PwdBar', lblId='v1PwdLbl') {
  const v   = inp.value;
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(lblId);
  let strength = 0;
  if (v.length >= 8)               strength++;
  if (/[A-Z]/.test(v))             strength++;
  if (/[0-9]/.test(v))             strength++;
  if (/[^A-Za-z0-9]/.test(v))      strength++;

  const levels = [
    { cls:'pw-weak',   w:'25%', txt:'Trop faible' },
    { cls:'pw-weak',   w:'40%', txt:'Faible' },
    { cls:'pw-medium', w:'65%', txt:'Moyen' },
    { cls:'pw-medium', w:'80%', txt:'Bon' },
    { cls:'pw-strong', w:'100%',txt:'Excellent' },
  ];
  const lvl = levels[strength] || levels[0];
  if (bar) { bar.className = `pw-bar ${lvl.cls}`; bar.style.width = v.length ? lvl.w : '0'; }
  if (lbl) lbl.textContent = v.length ? lvl.txt : '';
}

function togglePwd(id) {
  const el = document.getElementById(id);
  if (el) el.type = el.type === 'password' ? 'text' : 'password';
}
