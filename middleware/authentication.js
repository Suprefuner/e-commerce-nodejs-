const { UnauthenticatedError, UnauthorizedError } = require("../errors")
const { verifyJWT } = require("../utils")

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token
  if (!token) {
    throw new UnauthenticatedError(`Authentication Invalid`)
  }

  try {
    const { name, userId, role } = verifyJWT(token)
    req.user = { name, userId, role }
    next()
  } catch (err) {
    throw new UnauthorizedError(`Authorized`)
  }
}

const authorizePermission = (...whitelist) => {
  return (req, res, next) => {
    const { role } = req.user
    if (!whitelist.includes(role)) {
      throw new UnauthenticatedError(`Authentication Invalid`)
    }

    next()
  }
}

module.exports = { authenticateUser, authorizePermission }
