const CartSchema = require("../Schemas/Cart");

const AddToCart = async (req, res) => {
  const {
    productId,
    title,
    description,
    price,
    priceSale,
    image,
    categoryId,
    categoryName,
    productSku,
    productCode,
    inStock,
    quantity,
  } = req.body;
  const NewItems = new CartSchema({
    productId,
    title,
    description,
    price,
    priceSale,
    image,
    categoryId,
    categoryName,
    productSku,
    productCode,
    inStock,
    quantity,
  });

  if (productId) {
    await NewItems.save();
    res.status(200).json({
      baseResponse: {
        message: "Item Added Successfully",
        status: 1,
      },
      response: NewItems,
    });
  } else {
    res.status(500).json({
      baseResponse: {
        message: "Item Not Added",
        status: 0,
      },
      response: [],
    });
  }
};
const GetAllItems = async (req, res) => {
  const GetAllCartItems = await CartSchema.find({});

  if (GetAllCartItems !== null || GetAllCartItems.length !== 0) {
    res.status(200).json({
      baseResponse: {
        message: "All Items Fetched Successfully",
        status: 1,
      },
      response: GetAllCartItems,
    });
  } else {
    res.status(500).json({
      baseResponse: {
        message: "Items Not Fetched Successfully ",
        status: 0,
      },
      response: [],
    });
  }

  //   const GetAllItems = CartSchema.find({});
  //   array.forEach((element) => {});
};

module.exports = {
  AddToCart,
  GetAllItems,
};
