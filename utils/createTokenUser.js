exports.createTokenUser = (user) => ({
  name: user.name,
  userId: user._id,
  email: user.email,
  role: user.role,
})
