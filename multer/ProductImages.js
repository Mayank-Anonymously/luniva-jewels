const multer = require('multer');
const { existsSync, mkdirSync } = require('fs');
const path = require('path');

// Optional: Ensure 'images' directory exists
const IMAGE_DIR = path.join(__dirname, 'images');
if (!existsSync(IMAGE_DIR)) {
	mkdirSync(IMAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, IMAGE_DIR);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext);
		cb(null, `${base}-${uniqueSuffix}${ext}`);
	},
});

const uploadProductImages = multer({
	storage: storage,
	limits: {
		files: 5, // max 10 files per request
	},
}).array('image', 5); // 'images' is the field name in form-data

module.exports = uploadProductImages;
