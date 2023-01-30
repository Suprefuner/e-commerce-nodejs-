const Review = require("../models/Review")
const Product = require("../models/Products")
const { StatusCodes } = require("http-status-codes")
const { checkPermission } = require("../utils/checkPermission")
const { NotFoundError, BadRequestError } = require("../errors")

exports.createReview = async (req, res) => {
  const { product: productId } = req.body
  const product = await Product.findById(productId)
  if (!product) {
    throw new NotFoundError(`can't find product with id:${id}`)
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  })

  if (alreadySubmitted) {
    throw new BadRequestError(`already submitted comment`)
  }

  req.body.user = req.user.userId
  const review = await Review.create(req.body)

  res.status(StatusCodes.CREATED).json({
    status: "success",
    review,
  })
}

exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find().populate({
    path: "product",
    select: "name company price",
  })

  res.status(StatusCodes.OK).json({
    status: "success",
    results: reviews.length,
    reviews,
  })
}

exports.getSingleReview = async (req, res) => {
  const { id } = req.params
  const review = await Review.findById(id)

  if (!review) {
    throw new NotFoundError(`can't find review with id:${id}`)
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    review,
  })
}

exports.updateReview = async (req, res) => {
  const { id } = req.params
  const { rating, title, comment } = req.body
  const review = await Review.findById(id)

  if (!review) {
    throw new NotFoundError(`can't find review with id:${id}`)
  }

  checkPermission(req.user, review.user)

  review.rating = rating
  review.title = title
  review.comment = comment

  await review.save()

  res.status(StatusCodes.OK).json({
    status: "success",
    review,
  })
}

exports.deleteReview = async (req, res) => {
  const { id } = req.params
  const review = await Review.findById(id)

  if (!review) {
    throw new NotFoundError(`can't find review with id:${id}`)
  }

  checkPermission(req.user, review.user)

  await review.remove()

  res.status(StatusCodes.OK).json({
    status: "success",
    msg: "review deleted",
  })
}

exports.getSingleProductReview = async (req, res) => {
  const { id } = req.params
  const reviews = await Review.find({ product: id })
  res.status(StatusCodes.OK).json({
    status: "success",
    results: reviews.length,
    reviews,
  })
}
