require("dotenv").config()
require("express-async-errors")

const express = require("express")
const app = express()

const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
const rateLimiter = require("express-rate-limit")
const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")

const connectDB = require("./db/connect")
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

const userRouter = require("./routes/userRouter")
const authRouter = require("./routes/authRouter")
const productRouter = require("./routes/productRouter")
const reviewRouter = require("./routes/reviewRouter")
const orderRouter = require("./routes/orderRouter")

app.set("trust proxy")
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
)
app.use(helmet())
app.use(xss())
app.use(cors())
app.use(mongoSanitize())

app.use(morgan("tiny"))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static("./public"))
app.use(fileUpload())

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/orders", orderRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`server is listening on port ${port}`))
  } catch (err) {
    console.log(err)
  }
}

start()
