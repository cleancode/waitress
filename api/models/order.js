var mongoose = require('mongoose'),
    Schema = mongoose.Schema


var DishInOrder = (function(DishInOrder) {

  DishInOrder.add({
    id: Schema.ObjectId,
    portions: Number,
  })

  return DishInOrder

})(new Schema())


var Order = (function(Order) {

  Order.add({
    table: String,
    dishes: [DishInOrder],
  })

  Order.statics.save = function(data, callAfterSave) {
    this.create(data, callAfterSave)
  }

  return Order

})(new Schema())


module.exports = mongoose.model('Order', Order)
