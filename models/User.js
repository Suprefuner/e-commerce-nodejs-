const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `user must have a name`],
    trim: true,
    maxlength: 20,
  },
  email: {
    type: String,
    required: [true, `user must have a email`],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `Please provide valid  email`,
    },
  },
  password: {
    type: String,
    required: [true, `user must have a password`],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
})

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (pw) {
  return await bcrypt.compare(pw, this.password)
}

const User = mongoose.model("User", userSchema)
module.exports = User
