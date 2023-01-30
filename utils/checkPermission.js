const { UnauthorizedError } = require("../errors")

exports.checkPermission = (requestUser, resourceUserId) => {
  if (requestUser.role === "admin") return
  if (requestUser.userId === resourceUserId.toString()) return
  throw new UnauthorizedError(`not authorized to access this route`)
}
