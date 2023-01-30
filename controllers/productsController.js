const Products = require("../models/Products")
const { StatusCodes } = require("http-status-codes")
const { BadRequestError, NotFoundError } = require("../errors")
const path = require("path")

exports.createProduct = async (req, res) => {
  req.body.user = req.user.userId
  const product = await Products.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: "success",
    product,
  })
}

exports.getAllProducts = async (req, res) => {
  const products = await Products.find()

  res.status(StatusCodes.OK).json({
    status: "success",
    results: products.length,
    products,
  })
}

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params
  const product = await Products.findById(id)

  if (!product) throw new NotFoundError(`can't find product in id: ${id}`)

  res.status(StatusCodes.OK).json({
    status: "success",
    product,
  })
}

exports.updateProduct = async (req, res) => {
  const { id } = req.params
  const product = await Products.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  })

  if (!product) throw new NotFoundError(`can't find product in id: ${id}`)

  res.status(StatusCodes.OK).json({
    status: "success",
    product,
  })
}

exports.deleteProduct = async (req, res) => {
  const { id } = req.params
  const product = await Products.findById(id)

  if (!product) throw new BadRequestError(`can't find product in id: ${id}`)

  await product.remove()

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "product deleted",
  })
}
exports.uploadProductImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError(`no file uploaded`)
  }

  const productImage = req.files.image

  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError(`please upload image`)
  }

  const maxSize = 1024 * 1024

  if (productImage.size > maxSize) {
    throw new BadRequestError(`please upload image small than 1MB`)
  }
  const imagePath = path.join(
    __dirname,
    `../public/uploads/${productImage.name}`
  )
  await productImage.mv(imagePath)

  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` })
}
