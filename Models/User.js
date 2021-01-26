const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { dishSchema } = require("./dish");
const { ProfileSchema } = require("../Models/profile");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  typeUser: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  answer: { type: String, required: true },
  profile: { type: ProfileSchema, default: {} },
  dishDeals: [dishSchema],
  cart: [dishSchema],
  joined: { type: Date, default: Date.now() },
});

UserSchema.pre("save", function (next) {
  console.log(this.password.length);
  if (this.password.length < 40) {
    bcrypt.hash(this.password, 10, (err, secret) => {
      this.password = secret;
      bcrypt.hash(this.answer, 10, (err, secret) => {
        this.answer = secret;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model("user", UserSchema);

module.exports = User;
