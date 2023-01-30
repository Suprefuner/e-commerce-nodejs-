const User = require("../models/User")
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors")
const { StatusCodes } = require("http-status-codes")
const { attachCookiesToResponse, createTokenUser } = require("../utils")

exports.register = async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })

  if (existingUser)
    throw new BadRequestError(
      `email already existed, please use another email to register`
    )

  const firstRegister = await User.countDocuments()
  const role = firstRegister ? "user" : "admin"

  const user = await User.create({
    name,
    email,
    password,
    role,
  })

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({ res, tokenUser })

  res.status(StatusCodes.CREATED).json({
    status: "success",
    user: tokenUser,
  })
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    throw new BadRequestError(`please provide both email and password`)

  const user = await User.findOne({ email })

  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthenticatedError(`Invalid Credential`)
  }

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({ res, tokenUser })

  res.status(StatusCodes.OK).json({
    user: tokenUser,
  })
}
exports.logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  })

  res.status(StatusCodes.OK).json({})
}
