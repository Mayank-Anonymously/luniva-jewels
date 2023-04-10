const yup = require("yup");
const PackagesValidation = yup.object({
  body: yup.object({
    id: yup.number(),
    name: yup.string(),
    description: yup.string(),
    price: yup.number(),
  }),
});
const validation = (schema) => async (req, res, next) => {
  try {
    await schema.validate({ body: req.body });
    return next();
  } catch (err) {
    return res.status(500).json({
      baseResponse: { type: err.name, message: err.message, status: 0 },
    });
  }
};

let validate = validation(PackagesValidation);

module.exports = validate;
