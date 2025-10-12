const express = require('express');
const {
	AddProduct,
	GetAllProduct,
	DeleteProductByID,
	UpdateProduct,
	GetProductByID,
	AddProductToSubcategoryById,
	autoCompleteProduct,
} = require('../Controller/Products');
const router = express.Router();
const uploadProductImage = require('../multer/ProductImages');
router.get('/getAllProducts', GetAllProduct);

router.get('/:_id/getProductById', GetProductByID);

router.post('/addProduct', uploadProductImage, AddProduct);

router.post('/auto-complete/:value', autoCompleteProduct);

router.put('/RemoveWeddingPackage', DeleteProductByID);

router.put('/updateProduct', UpdateProduct);

router.post('/updateProductCategoryId/:_id', AddProductToSubcategoryById);

module.exports = router;
