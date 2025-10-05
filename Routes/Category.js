const express = require('express');
const {
	AddCategory,
	GetAllCategory,
	UpdateCategory,
	DeleteCategoryByID,
	GetCategoryByID,
	AddSubCategory,
} = require('../Controller/Categories');
const uploadCategoryImage = require('../multer/CategoryMulter');
const CateRouter = express.Router();

CateRouter.get('/getAllCategories', GetAllCategory);
CateRouter.get('/getCategoryById/:categoryID', GetCategoryByID);
CateRouter.post('/addCategory', uploadCategoryImage, AddCategory);
CateRouter.post('/add-sub-category', AddSubCategory);
CateRouter.put('/deleteCategory/:categoryID', DeleteCategoryByID);
CateRouter.patch('/updateCategory/:categoryID', UpdateCategory);

module.exports = CateRouter;
