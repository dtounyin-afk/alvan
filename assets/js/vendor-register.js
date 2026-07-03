// ============================================================
// ModaAfrik — Vendor Register Logic
// ============================================================
function vrNext(step) {
  if (step === 2) {
    const fn = document.getElementById('v1FN').value.trim();
    const ln = document.getElementById('v1LN').value.trim();
    const em = document.getElementById('v1Email').value.trim();
    const ph = document.getElementById('v1Phone').value.trim();
    const pw = document.getElementById('v1Pwd').value;
    const pc = document.getElementById('v1PwdC').value;
    if (!fn||!ln||!em||!ph||!pw) { showToast('Remplissez tous les champs requis','error'); return; }
    if (pw.length < 6)           { showToast('Mot de passe minimum 6 caractères','error'); return; }
    if (pw !== pc)               { showToast('Les mots de passe ne correspondent pas','error'); return; }
  }
  if (step === 3) {
    if (!document.getElementById('v2Store').value.trim()) { showToast('Le nom de boutique est requis','error'); return; }
    if (!document.getElementById('v2City').value)         { showToast('Sélectionnez votre ville','error'); return; }
  }

  [1,2,3,4].forEach(i => {
    document.getElementById(`vrp${i}`)?.classList.add('hidden');
    const s = document.getElementById(`vrs${i}`);
    if (!s) return;
    s.classList.remove('active','done');
    if (i < step)  s.classList.add('done');
    if (i === step) s.classList.add('active');
  });
  document.getElementById(`vrp${step}`)?.classList.remove('hidden');
  scrollTo({ top: 0, behavior: 'smooth' });
}

async function vrSubmit() {
  const method = document.getElementById('v3Method').value;
  if (!method) { showToast('Choisissez une méthode de paiement','error'); return; }

  const data = {
    firstName:   document.getElementById('v1FN').value.trim(),
    lastName:    document.getElementById('v1LN').value.trim(),
    email:       document.getElementById('v1Email').value.trim(),
    phone:       document.getElementById('v1Phone').value.trim(),
    password:    document.getElementById('v1Pwd').value,
    storeName:   document.getElementById('v2Store').value.trim(),
    storeCity:   document.getElementById('v2City').value,
    storeAddress:document.getElementById('v2Addr').value.trim(),
    storeDesc:   document.getElementById('v2Desc').value.trim(),
  };

  try {
    const res = await Api.auth.registerVendor(data);
    Auth.save(res.token, res.user);
    vrNext(4);
  } catch {
    // Offline demo
    Auth.save('demo_vendor_'+Date.now(), { ...data, id:'usr-'+Date.now(), role:'vendor' });
    vrNext(4);
  }
}

function showPayFields() {
  const v = document.getElementById('v3Method').value;
  document.querySelectorAll('.pay-fields').forEach(el => el.classList.add('hidden'));
  if (v) document.getElementById(`pf-${v}`)?.classList.remove('hidden');
}

function togglePwd(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function checkStrength(inp) {
  const v = inp.value;
  const bar = document.getElementById('v1PwdStr');
  if (!bar) return;
  if (v.length >= 10 && /[A-Z]/.test(v) && /\d/.test(v)) bar.className = 'pw-strength pw-strong';
  else if (v.length >= 6) bar.className = 'pw-strength pw-medium';
  else if (v.length > 0)  bar.className = 'pw-strength pw-weak';
  else bar.className = 'pw-strength';
}
