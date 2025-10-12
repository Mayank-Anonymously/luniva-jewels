const Product = require('../Schemas/ProductSchema');
const ProductSchema = require('../Schemas/ProductSchema');

const AddProduct = async (req, res) => {
	const {
		title,
		description,
		price,
		priceSale,
		categoryId,
		categoryName,
		productSku,
		productCode,
		inStock,
		quantity,
		stockQuantity,
	} = req.body;

	try {
		// Extract all uploaded image filenames
		const imageFilenames = req.files?.map((file) => file.filename) || [];

		const newProduct = new ProductSchema({
			title,
			description,
			price,
			priceSale,
			image: imageFilenames, // Now an array
			categoryId,
			categoryName,
			productSku,
			productCode,
			inStock,
			quantity,
			stockQuantity,
		});

		const saveNewProduct = await newProduct.save();

		if (saveNewProduct) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Product added successfully' },
				response: saveNewProduct,
			});
		} else {
			res.status(400).json({
				baseResponse: { status: 0, messsage: 'Bad Request' },
				response: [],
			});
		}
	} catch (err) {
		console.error(err.message);
		res.status(500).json({
			baseResponse: { status: 0, messsage: err.message },
			response: [],
		});
	}
};

const GetAllProduct = async (req, res) => {
	try {
		const GetAllProduct = await ProductSchema.find({});
		if (GetAllProduct.length !== 0) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Product fetched successfully' },
				response: GetAllProduct,
			});
		} else {
			res.status(500).json({
				baseResponse: { status: 0, messsage: 'No Product found' },
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
const GetProductByID = async (req, res) => {
	const { _id } = req.params;

	try {
		const GetProduct = await ProductSchema.findOne({
			_id: _id,
		});
		if (GetProduct) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Product fetched successfully' },
				response: GetProduct,
			});
		} else {
			res.status(500).json({
				baseResponse: { status: 0, messsage: 'No Product found' },
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
const UpdateProduct = async (req, res) => {
	const productId = req.params.ProductID;
	const {
		productName,
		description,
		price,
		categoryId,
		existingImages = [],
	} = req.body;

	try {
		const newImages = req.files?.map((file) => file.filename) || [];
		const allImages = [...existingImages, ...newImages];

		await ProductSchema.findByIdAndUpdate(productId, {
			ProductName: productName,
			ProductDescription: description,
			price,
			categoryId,
			image: allImages, // replace or merge image array
		});

		res.status(200).json({
			success: true,
			message: 'Product updated successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Product update failed',
		});
	}
};

const DeleteProductByID = async (req, res) => {
	const ProductID = req.params.ProductID;
	try {
		const DeleteProduct = await ProductSchema.deleteOne({
			_id: ProductID,
		});
		if (DeleteProduct.deletedCount !== 0) {
			res.status(200).json({
				baseResponse: { status: 1, messsage: 'Product deleted successfully' },
				response: [],
			});
		} else {
			res.status(500).json({
				baseResponse: {
					status: 0,
					messsage: 'No Product found or Product is not deleted',
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

const AddProductToSubcategoryById = async (req, res) => {
	try {
		const { _id } = req.params; // Product ID to update
		const { productName, description, price, images, categoryId } = req.body;

		if (!_id) {
			return res.status(400).json({
				success: false,
				message: '_id is required',
			});
		}

		// Find product by ID
		const product = await Product.findById(_id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			});
		}

		// Update fields if provided
		if (productName) product.productName = productName;
		if (description) product.description = description;
		if (price) product.price = price;
		if (images) product.images = images;
		if (categoryId) product.categoryId = categoryId;

		await product.save();

		res.status(200).json({
			success: true,
			message: 'Product updated successfully',
			data: product,
		});
	} catch (error) {
		console.error('❌ Error updating product:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message,
		});
	}
};
const autoCompleteProduct = async () => {
	const { value } = req.params;

	const findValueWithProductOrcategory = await Product.find({
		$or: [
			{ title: { $regex: value, $options: 'i' } }, // search in title, case-insensitive
			{ category: { $regex: value, $options: 'i' } }, // search in category, case-insensitive
		],
	});
	console.log(
		'findValueWithProductOrcategory:',
		findValueWithProductOrcategory
	);
};
module.exports = {
	AddProduct,
	GetAllProduct,
	GetProductByID,
	UpdateProduct,
	DeleteProductByID,
	AddProductToSubcategoryById,
	autoCompleteProduct,
};
