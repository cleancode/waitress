var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    _ = require("underscore")


var Order = mongoose.model("Order", new Schema(
  { table: Schema.ObjectId,
    dishes: [
      new Schema(
        { dish: Schema.ObjectId,
          portionsToDeliver: Number,
          portionsReadyInTheKitchen: {type: Number, default: 0},
          portions: Number
        },
        { _id: false }
      )
    ]
  },
  { toJSON: {transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }}
))

Order.from = function(data) {
  data.dishes = _(data.dishes).map(function(dish) {
    dish.portionsToDeliver = dish.portions
    return dish
  })
  return new Order(data)
}


module.exports = Order
