var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    _ = require("underscore")


var dishInOrderSchema = new Schema(
  { dish: Schema.ObjectId,
    portionsToDeliver: Number,
    portionsReadyInTheKitchen: {type: Number, default: 0},
    portions: Number
  },
  { id: false, _id: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
)

dishInOrderSchema.virtual('ready').get(function() {
  return this.portionsReadyInTheKitchen >= this.portionsToDeliver
})

var orderSchema = new Schema(
  { table: Schema.ObjectId,
    dishes: [dishInOrderSchema]
  },
  { toObject: { virtuals: true },
    toJSON:
    { virtuals: true,
      transform: function(doc, ret) {
        delete ret._id
        delete ret.__v
      }
    }
  }
)


orderSchema.virtual("ready").get(function() {
  return _(this.dishes).every(function(dish) {
    return dish.ready
  })
})

var Order = mongoose.model("Order", orderSchema)


Order.from = function(data) {
  data.dishes = _(data.dishes).map(function(dish) {
    dish.portionsToDeliver = dish.portions
    return dish
  })
  return new Order(data)
}


module.exports = Order
