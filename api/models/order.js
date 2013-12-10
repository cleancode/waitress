var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Dish = require("./dish"),
    async = require("async")
    _ = require("underscore")


var dishInOrderSchema = new Schema(
  { name: String,
    category: String,
    portionsToDeliver: Number,
    portionsReadyInTheKitchen: {type: Number, default: 0},
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
  { table: String,
    dishes: [dishInOrderSchema]
  },
  { toObject: { virtuals: true },
    toJSON:
    { virtuals: true,
      transform: function(doc, ret) {
        ret.dishes = _(ret.dishes).groupBy(function(dish) {
          return dish.category
        })
        delete ret._id
        delete ret.__v
      }
    }
  }
)


orderSchema.plugin(require("mongoose-timestamp"))
orderSchema.virtual("ready").get(function() {
  return _(this.dishes).every(function(dish) {
    return dish.ready
  })
})

orderSchema.statics.save = function(data, callAfterSave) {
  async.map(
    data.dishes,
    function(dish, done) {
      dish.portionsToDeliver = dish.portions
      Dish.findOne({_id: dish.id}).exec(function(err, dishFromStorage) {
        delete dish.id
        dish.name = dishFromStorage.name
        dish.category = dishFromStorage.category
        done(err, dish)
      })
    },
    function(err, dishes) {
      data.dishes = dishes
      new Order(data).save(callAfterSave)
    }
  )
}

orderSchema.statics.updatedAfter = function(timestamp, callback) {
  var query = this.where("updatedAt").gt(new Date(timestamp))
  if (callback) {
    return query.exec(callback)
  }
  return query
}

var Order = mongoose.model("Order", orderSchema)


module.exports = Order
