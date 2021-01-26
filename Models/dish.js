const { string } = require('@hapi/joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dishSchema = new Schema({
  name: String,
  priceBeforeDiscount : Number,
  discount : String,
  priceAfterDiscount: Number,
  category: String,
  hoursOfDeal:String,
  description : String,
  image: { type: String, default: 'https://picsum.photos/200' },
  joined: { type: Date, default: Date.now() }

}
);

const dish = mongoose.model('dish', dishSchema);

exports.dishSchema = dishSchema;
exports.dish = dish;
