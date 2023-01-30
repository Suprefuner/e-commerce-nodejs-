const mongoose = require("mongoose")

const productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "product must have a name"],
      maxlength: [100, "Name can not be more than 100 chars"],
    },
    price: {
      type: Number,
      required: [true, "product must have a price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "product must have a description"],
      maxlength: [1000, "description can not be more than 1000 chars"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpg",
    },
    category: {
      type: String,
      required: [true, "product must have a category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "product must have a company"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      required: true,
      default: ["#222"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
)

productsSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
})

productsSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id })
})

const Product = mongoose.model("Product", productsSchema)
module.exports = Product
