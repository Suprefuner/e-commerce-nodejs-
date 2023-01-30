const User = require("../models/User")
const { StatusCodes } = require("http-status-codes")
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors")
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission,
} = require("../utils")

exports.getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password")

  res.status(StatusCodes.OK).json({
    status: "success",
    users,
  })
}

exports.getSingleUser = async (req, res) => {
  const { id } = req.params

  const user = await User.findById(id).select("-password")

  checkPermission(req.user, user._id)

  if (!user) {
    throw new NotFoundError(`can't find the user with id: ${id}`)
  }

  res.status(StatusCodes.OK).json({
    status: "success",
    user,
  })
}
exports.showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({
    status: "success",
    user: req.user,
  })
}
exports.updateUser = async (req, res) => {
  const { name, email } = req.body

  if (!name || !email)
    throw new BadRequestError(`please provide name and email`)

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  )

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, tokenUser })

  res.status(StatusCodes.OK).json({
    status: "success",
    tokenUser,
  })
}
exports.updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword)
    throw new BadRequestError(`please provide old password and new password`)

  const user = await User.findById(req.user.userId)

  const isMatch = await user.comparePassword(oldPassword)
  if (!isMatch) throw new UnauthenticatedError(`Invalid Credentials`)

  user.password = newPassword
  await user.save()

  res.status(StatusCodes.OK).json({
    status: "success",
    message: "password updated",
  })

  res.send("update user password")
}
