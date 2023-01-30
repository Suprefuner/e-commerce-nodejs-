const jwt = require("jsonwebtoken")

const createJWT = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  })

exports.verifyJWT = (token) => jwt.verify(token, process.env.JWT_SECRET)

exports.attachCookiesToResponse = ({ res, tokenUser }) => {
  const token = createJWT(tokenUser)
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  })
}
