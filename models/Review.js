const mongoose = require("mongoose")

const reviewsSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "product must have a title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      maxlength: [100, "Name can not be more than 100 chars"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      require: true,
    },
  },
  {
    timestamps: true,
  }
)

reviewsSchema.index({ product: 1, user: 1 }, { unique: true })

reviewsSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ])

  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: Math.ceil(result[0]?.numOfReviews || 0),
      }
    )
  } catch (err) {
    console.log(err)
  }
}

reviewsSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product)
})

reviewsSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product)
})

const Review = mongoose.model("Review", reviewsSchema)
module.exports = Review
