const express = require('express');
const {
	AddProduct,
	GetAllProduct,
	DeleteProductByID,
	UpdateProduct,
	GetProductByID,
	AddProductToSubcategoryById,
} = require('../Controller/Products');
const router = express.Router();
const uploadProductImage = require('../multer/ProductImages');
router.get('/getAllProducts', GetAllProduct);

router.get('/:ProductID/getProductById', GetProductByID);

router.post('/addProduct', uploadProductImage, AddProduct);

router.put('/RemoveWeddingPackage', DeleteProductByID);

router.put('/updateProduct', UpdateProduct);

router.post('/updateProductCategoryId/:_id', AddProductToSubcategoryById);

module.exports = router;
