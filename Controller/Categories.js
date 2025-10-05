const Categories = require('../Schemas/Categories');
const categoriesSchema = require('../Schemas/Categories');

const AddCategory = async (req, res) => {
	const { CategoryName, CategoryDescription, SubCategory } = req.body;
	const newCategory = new categoriesSchema({
		CategoryName,
		CategoryDescription,
		SubCategory,
		catImage: req.file.filename,
	});

	try {
		const saveNewCategory = await newCategory.save();
		if (saveNewCategory) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Category added successfully' },
				response: [],
			});
		} else {
			res.status(500).json({
				baseResponse: { status: 0, messsage: 'problem in adding category' },
				response: [],
			});
		}
	} catch (err) {
		res.status(500).json({
			baseResponse: { status: 1, messsage: err.message },
			response: [],
		});
	}
};

const GetAllCategory = async (req, res) => {
	try {
		const GetAllCateory = await categoriesSchema.find({});
		if (GetAllCateory.length !== 0) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Category fetched successfully' },
				response: GetAllCateory,
			});
		} else {
			res.status(500).json({
				baseResponse: { status: 0, messsage: 'No Category found' },
				response: [],
			});
		}
	} catch (err) {
		res.status(500).json({
			baseResponse: { status: 1, messsage: err.message },
			response: [],
		});
	}
};
const GetCategoryByID = async (req, res) => {
	const { categoryID } = req.params;

	try {
		const GetCategory = await categoriesSchema.findOne({
			_id: categoryID,
		});
		if (GetCategory) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Category fetched successfully' },
				response: GetCategory,
			});
		} else {
			res.status(500).json({
				baseResponse: { status: 0, messsage: 'No category found' },
				response: [],
			});
		}
	} catch (err) {
		res.status(500).json({
			baseResponse: { status: 1, messsage: err.message },
			response: [],
		});
	}
};
const UpdateCategory = async (req, res) => {
	const categoryID = req.params.categoryID;
	const { CategoryName, CategoryDescription, SubCategory } = req.body;

	try {
		if (categoryID) {
			await categoriesSchema.findOneAndUpdate(
				{ _id: categoryID },
				{ $set: { CategoryName, CategoryDescription, SubCategory } }
			);
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Category updated successfully' },
				response: [],
			});
		} else {
			res.status(500).json({
				baseResponse: {
					status: 0,
					messsage: 'Category is not updated',
				},
				response: [],
			});
		}
	} catch (err) {
		res.status(500).json({
			baseResponse: { status: 1, messsage: err.message },
			response: [],
		});
	}
};
const DeleteCategoryByID = async (req, res) => {
	const categoryID = req.params.categoryID;
	try {
		const DeleteCategory = await categoriesSchema.deleteOne({
			_id: categoryID,
		});
		if (DeleteCategory.deletedCount !== 0) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Category deleted successfully' },
				response: [],
			});
		} else {
			res.status(500).json({
				baseResponse: {
					status: 0,
					messsage: 'No Category found or Category is not deleted',
				},
				response: [],
			});
		}
	} catch (err) {
		res.status(500).json({
			baseResponse: { status: 1, messsage: err.message },
			response: [],
		});
	}
};
const AddSubCategory = async (req, res) => {
	try {
		const { categoryId, subCategoryName, CategoryDescription } = req.body;

		if (!categoryId || !subCategoryName) {
			return res.status(400).json({
				success: false,
				message: 'categoryId and subCategoryName are required',
			});
		}

		// 🔍 Find the category by ID
		let category = await Categories.findById(categoryId);

		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			});
		}

		// 🔎 Check if subcategory already exists
		const subCategoryExists = category.SubCategory.some(
			(sub) =>
				sub.subCategoryName.toLowerCase() === subCategoryName.toLowerCase()
		);

		if (subCategoryExists) {
			return res.status(400).json({
				success: false,
				message: 'Subcategory already exists in this category',
			});
		}

		// ✅ Add new subcategory
		category.SubCategory.push({ subCategoryName });

		// Optional: update category description or image if provided
		if (CategoryDescription) category.CategoryDescription = CategoryDescription;

		await category.save();

		return res.status(200).json({
			success: true,
			message: 'Subcategory added successfully',
			data: category,
		});
	} catch (error) {
		console.error('❌ Error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message,
		});
	}
};
module.exports = {
	AddCategory,
	GetAllCategory,
	GetCategoryByID,
	UpdateCategory,
	DeleteCategoryByID,
	AddSubCategory,
};
