const express = require("express")
const router = express.Router()

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/productsController")

// const { getSingleProductReview } = require("../controllers/reviewController")

const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication")

router
  .route("/")
  .post(authenticateUser, authorizePermission("admin"), createProduct)
  .get(getAllProducts)

router
  .route("/uploadImage")
  .post(authenticateUser, authorizePermission("admin"), uploadProductImage)

router
  .route("/:id")
  .get(getSingleProduct)
  .patch(authenticateUser, authorizePermission("admin"), updateProduct)
  .delete(authenticateUser, authorizePermission("admin"), deleteProduct)

// router.route("/:id/review").get(getSingleProductReview)

module.exports = router
