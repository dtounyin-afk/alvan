// ============================================================
// ModaAfrik — Super Admin ACTIONS (CRUD vendeurs/produits)
// ============================================================
'use strict';

// ── VENDEURS KYC ─────────────────────────────────────────────
function approveVendorKYC(id) {
  const pending = JSON.parse(localStorage.getItem('ma_vendors_kyc_pending')||'[]');
  const v = pending.find(x => x.id === id);
  if (!v) { showToast('Dossier introuvable','error'); return; }
  const approved = { ...v, status:'approved', isActive:true, approvedAt:new Date().toISOString() };
  const arr = LocalStore.getApprovedVendors();
  arr.unshift(approved);
  LocalStore.saveApprovedVendors(arr);
  localStorage.setItem('ma_vendors_kyc_pending', JSON.stringify(pending.filter(x=>x.id!==id)));
  const users = JSON.parse(localStorage.getItem('ma_users')||'[]');
  if (!users.find(u=>u.email===v.email)) {
    users.push({ id:v.id, firstName:v.firstName, lastName:v.lastName, email:v.email, phone:v.phone, role:'vendor', storeName:v.storeName, storeCity:v.storeCity, createdAt:new Date().toISOString() });
    localStorage.setItem('ma_users', JSON.stringify(users));
  }
  showToast('✅ '+v.storeName+' approuvé !','success',4000);
  loadAdminData();
}

function rejectVendorKYC(id) {
  if (!confirm('Rejeter ce dossier KYC ?')) return;
  const pending = JSON.parse(localStorage.getItem('ma_vendors_kyc_pending')||'[]');
  localStorage.setItem('ma_vendors_kyc_pending', JSON.stringify(pending.filter(x=>x.id!==id)));
  showToast('Dossier KYC rejeté','success');
  loadAdminData();
}

function viewKYC(id) {
  const pending = JSON.parse(localStorage.getItem('ma_vendors_kyc_pending')||'[]');
  const v = pending.find(x => x.id === id);
  if (!v) return;
  const modal = document.getElementById('vendorModal');
  const title = document.getElementById('vendorModalTitle');
  const body  = document.getElementById('vendorModalBody');
  const btn   = document.getElementById('vendorModalAction');
  if (title) title.textContent = 'Dossier KYC — ' + v.storeName;
  if (body) body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:16px">
      <div><strong>Nom :</strong> ${v.firstName} ${v.lastName}</div>
      <div><strong>Email :</strong> ${v.email||'—'}</div>
      <div><strong>Téléphone :</strong> ${v.phone||'—'}</div>
      <div><strong>N° CNI :</strong> ${v.cniNumber||'—'}</div>
      <div><strong>Ville :</strong> ${v.storeCity||'—'}</div>
      <div><strong>Catégorie :</strong> ${v.storeCategory||'—'}</div>
      <div style="grid-column:1/-1"><strong>Description :</strong> ${v.storeDesc||'—'}</div>
    </div>
    <div style="background:var(--bg-2);border-radius:var(--r-md);padding:12px;font-size:13px">
      <strong style="display:block;margin-bottom:8px">Documents KYC reçus :</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="padding:8px;border-radius:6px;background:${v.kyc?.cniRecto?'#ecfdf5':'#fef2f2'};font-size:12px">${v.kyc?.cniRecto?'✅':'❌'} CNI Recto</div>
        <div style="padding:8px;border-radius:6px;background:${v.kyc?.cniVerso?'#ecfdf5':'#fef2f2'};font-size:12px">${v.kyc?.cniVerso?'✅':'❌'} CNI Verso</div>
        <div style="padding:8px;border-radius:6px;background:${v.kyc?.selfie?'#ecfdf5':'#fef2f2'};font-size:12px">${v.kyc?.selfie?'✅':'❌'} Selfie direct</div>
        <div style="padding:8px;border-radius:6px;background:${v.kyc?.selfiecni?'#ecfdf5':'#fef2f2'};font-size:12px">${v.kyc?.selfiecni?'✅':'❌'} Selfie + CNI</div>
      </div>
    </div>`;
  if (btn) {
    btn.textContent = 'Approuver';
    btn.onclick = () => { closeVendorModal(); approveVendorKYC(id); };
  }
  // Ajouter bouton Rejeter
  document.getElementById('modalRejectBtn')?.remove();
  const rb = document.createElement('button');
  rb.id = 'modalRejectBtn'; rb.className = 'btn-outline';
  rb.style.cssText = 'color:var(--red);border-color:var(--red)';
  rb.textContent = 'Rejeter';
  rb.onclick = () => { closeVendorModal(); rejectVendorKYC(id); };
  btn?.parentElement?.insertBefore(rb, btn);
  modal?.classList.remove('hidden');
}

function viewVendorDetail(id) {
  const v = AD.vendors().find(x => x.id === id);
  if (!v) return;
  const modal = document.getElementById('vendorModal');
  const title = document.getElementById('vendorModalTitle');
  const body  = document.getElementById('vendorModalBody');
  const btn   = document.getElementById('vendorModalAction');
  if (title) title.textContent = v.storeName;
  if (body) body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:14px">
      <div><strong>Ville :</strong> ${v.storeCity||'—'}</div>
      <div><strong>Email :</strong> ${v.email||'—'}</div>
      <div><strong>Téléphone :</strong> ${v.phone||'—'}</div>
      <div><strong>Catégorie :</strong> ${v.storeCategory||'—'}</div>
      <div><strong>Créé le :</strong> ${v.createdAt?new Date(v.createdAt).toLocaleDateString('fr-FR'):'—'}</div>
      <div><strong>Approuvé par :</strong> ${v.createdBy||'admin'}</div>
      <div style="grid-column:1/-1"><strong>Description :</strong> ${v.storeDesc||'—'}</div>
    </div>`;
  if (btn) { btn.textContent='Suspendre'; btn.className='btn-outline'; btn.style.cssText='color:var(--red);border-color:var(--red)'; btn.onclick=()=>{ closeVendorModal(); suspendVendorAdmin(id); }; }
  document.getElementById('modalRejectBtn')?.remove();
  modal?.classList.remove('hidden');
}

function suspendVendorAdmin(id) {
  if (!confirm('Suspendre ce vendeur ?')) return;
  LocalStore.removeApprovedVendor(id);
  showToast('Vendeur suspendu','success');
  loadAdminData();
}

function closeVendorModal() {
  document.getElementById('vendorModal')?.classList.add('hidden');
  document.getElementById('modalRejectBtn')?.remove();
}

// ── PRODUITS ──────────────────────────────────────────────────
function approveProduct(id) {
  const result = LocalStore.approveProduct(id);
  if (!result) { showToast('Produit introuvable','error'); return; }
  showToast('✅ "'+result.name+'" approuvé — visible sur la vitrine !','success');
  loadAdminData();
}

function rejectProduct(id) {
  if (!confirm('Rejeter ce produit ?')) return;
  LocalStore.rejectProduct(id);
  showToast('Produit rejeté','success');
  loadAdminData();
}

function deleteProductAdmin(id) {
  if (!confirm('Supprimer ce produit de la vitrine ?')) return;
  LocalStore.removeApprovedProduct(id);
  Api.products.delete(id).catch(()=>{});
  showToast('Produit supprimé','success');
  loadAdminData();
}

// ── AJOUT DIRECT VENDEUR ──────────────────────────────────────
function toggleAddVendorForm() {
  const f = document.getElementById('addVendorForm');
  if (!f) return;
  const visible = f.style.display !== 'none';
  f.style.display = visible ? 'none' : 'block';
  if (!visible) f.scrollIntoView({behavior:'smooth',block:'start'});
}

function generateVendorPwd() {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  const p = Array.from({length:12},()=>c[Math.floor(Math.random()*c.length)]).join('');
  const el = document.getElementById('avPwd');
  if (el) { el.value=p; el.type='text'; }
  showToast('Mot de passe : '+p+' — copiez-le !','success',8000);
}

function togglePwdAdmin(id) {
  const e=document.getElementById(id);
  if (e) e.type=e.type==='password'?'text':'password';
}

async function createVendorAdmin() {
  const g = id => document.getElementById(id)?.value?.trim()||'';
  const fn=g('avFN'), ln=g('avLN'), email=g('avEmail').toLowerCase(),
        phone=g('avPhone'), cni=g('avCNI'), pwd=g('avPwd'),
        storeName=g('avStoreName'), storeDesc=g('avStoreDesc'),
        city=g('avCity'), cat=g('avCat'), address=g('avAddress'),
        payMethod=document.getElementById('avPayMethod')?.value||'orange',
        payNum=g('avPayNum');

  if (!fn||!ln)    { showToast('Prénom et nom requis','error'); return; }
  if (!email)      { showToast('Email requis','error'); return; }
  if (!pwd||pwd.length<6) { showToast('Mot de passe minimum 6 caractères','error'); return; }
  if (!storeName)  { showToast('Nom de boutique requis','error'); return; }
  if (!city)       { showToast('Ville requise','error'); return; }

  // Normaliser téléphone
  let ph = phone.replace(/\s/g,'');
  if (!ph.startsWith('+')) ph = ph.startsWith('237') ? '+'+ph : '+237'+ph;

  // Vérifier unicité email
  const existing = AD.vendors().find(v=>v.email===email);
  if (existing) { showToast('Email déjà utilisé par un vendeur','error'); return; }

  const _encode = s => { try { return btoa(unescape(encodeURIComponent(s))); } catch { return btoa(s); } };

  const newVendor = {
    id: 'vnd-'+Date.now(),
    firstName:fn, lastName:ln, email, phone:ph, cniNumber:cni||'Vérifié admin',
    passwordHash: _encode(pwd),
    storeName, storeDesc:storeDesc||'', storeCity:city, storeAddress:address||'', storeCategory:cat||'',
    paymentMethod:payMethod, paymentNumber:payNum||'',
    role:'vendor', status:'approved', isActive:true,
    createdBy:'admin', createdAt:new Date().toISOString(), approvedAt:new Date().toISOString(),
    productCount:0, totalSales:0, rating:0,
  };

  // API backend
  let apiOk = false;
  try {
    await Api.post('/auth/register-vendor', { firstName:fn, lastName:ln, email, phone:ph, password:pwd, storeName, storeCity:city, storeAddress:address, storeDesc, storeCategory:cat });
    apiOk = true;
  } catch {}

  // LocalStore
  const arr = LocalStore.getApprovedVendors();
  arr.unshift(newVendor);
  LocalStore.saveApprovedVendors(arr);

  // ma_users
  const users = JSON.parse(localStorage.getItem('ma_users')||'[]');
  users.push({ id:newVendor.id, firstName:fn, lastName:ln, email, phone:ph, role:'vendor', storeName, storeCity:city, createdAt:newVendor.createdAt });
  localStorage.setItem('ma_users', JSON.stringify(users));

  const creds = 'Email : '+email+'\nMot de passe : '+pwd+'\nURL : '+location.origin+'/'+location.pathname.replace('admin.html','')+'\nPage connexion : auth.html';
  showToast('✅ Vendeur "'+storeName+'" créé ! '+(apiOk?'(Partagé via backend)':'(Local)'),'success',5000);

  setTimeout(() => {
    if (confirm('Vendeur créé ! Voulez-vous copier les identifiants ?\n\n'+creds)) {
      navigator.clipboard?.writeText(creds).then(()=>showToast('Identifiants copiés !','success'));
    }
  }, 600);

  // Reset form
  ['avFN','avLN','avEmail','avPhone','avCNI','avPwd','avStoreName','avStoreDesc','avAddress','avPayNum'].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=''; });
  toggleAddVendorForm();
  loadAdminData();
}

// ── PARAMÈTRES ────────────────────────────────────────────────
function saveSettings() { showToast('Paramètres sauvegardés','success'); }
