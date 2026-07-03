const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_ROOT = path.join(__dirname, '../../assets/uploads');
['products','avatars','logos'].forEach(d => {
  const p = path.join(UPLOAD_ROOT, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive:true });
});

const buildStorage = (sub) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOAD_ROOT, sub)),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
});

const imageFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp|gif/.test(path.extname(file.originalname).toLowerCase()) &&
             /image\//.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error('Seules les images sont acceptées (jpg/png/webp)'));
};

const MAX = 5 * 1024 * 1024;

const uploadProduct = multer({ storage: buildStorage('products'), fileFilter: imageFilter, limits:{ fileSize:MAX } });
const uploadAvatar  = multer({ storage: buildStorage('avatars'),  fileFilter: imageFilter, limits:{ fileSize:MAX } });
const uploadLogo    = multer({ storage: buildStorage('logos'),    fileFilter: imageFilter, limits:{ fileSize:MAX } });

module.exports = { uploadProduct, uploadAvatar, uploadLogo };
