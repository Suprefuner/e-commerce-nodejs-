const Order = require("../models/Order")
const Product = require("../models/Products")
const { StatusCodes } = require("http-status-codes")
const { checkPermission } = require("../utils/checkPermission")
const { NotFoundError, BadRequestError } = require("../errors")
const { restart } = require("nodemon")

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue"
  return { client_secret, amount }
}

exports.createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError(`no cart items provided`)
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError(`please provide tax and shipping fee`)
  }

  let orderItems = []
  let subtotal = 0

  for (const item of cartItems) {
    const dbProduct = await Product.findById(item.product)

    if (!dbProduct) {
      throw new NotFoundError(`can't find product with id:${item.product}`)
    }

    const { name, price, image, _id } = dbProduct
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    }

    orderItems = [...orderItems, singleOrderItem]
    subtotal += item.amount * price
  }

  const total = tax + shippingFee + subtotal
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  })

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  })

  res.status(StatusCodes.CREATED).json({
    status: "success",
    order,
    clientSecret: order.clientSecret,
  })
}
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()

  if (!orders || orders.length < 1) {
    throw new NotFoundError(`can't find order`)
  }

  res.status(StatusCodes.CREATED).json({
    status: "success",
    results: orders.length,
    orders,
  })
}
exports.getSingleOrder = async (req, res) => {
  const { id } = req.params
  const order = await Order.findById(id)

  if (!order) {
    throw new NotFoundError(`can't find order`)
  }

  checkPermission(req.user, order.user)

  res.status(StatusCodes.OK).json({
    status: "success",
    order,
  })
}
exports.getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })

  if (!orders || orders.length < 1) {
    throw new NotFoundError(`can't find order`)
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    results: orders.length,
    orders,
  })
}
exports.updateOrder = async (req, res) => {
  const { id } = req.params
  const { paymentIntentId } = req.body

  const order = await Order.findById(id)

  if (!order) {
    throw new NotFoundError(`can't find order`)
  }

  checkPermission(req.user, order.user)

  order.paymentIntentId = paymentIntentId
  order.status = "paid"
  await order.save()

  res.status(StatusCodes.OK).json({
    status: "success",
    order,
  })
}
