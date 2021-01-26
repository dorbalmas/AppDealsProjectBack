const { string } = require('@hapi/joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shoppingHistorySchema = new Schema({
 
    orderDate: { type: Date, default: Date.now() },
    code:String,
    cartList:[],

}
);

const shoppingHistory = mongoose.model('shoppingHistory', shoppingHistorySchema);

exports.shoppingHistorySchema = shoppingHistorySchema;
exports.shoppingHistory = shoppingHistory;
