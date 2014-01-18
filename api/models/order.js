var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Dish = require('./dish'),
    async = require('async'),
    _ = require('lodash')


var DishInOrder = (function(DishInOrder) {

  DishInOrder.add({
    name: String,
    category: String,
    portionsToDeliver: Number,
    portionsReadyInTheKitchen: {type: Number, default: 0},
  })

  DishInOrder.set('toObject', {virtuals: true})
  DishInOrder.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id
    }
  })

  DishInOrder.virtual('ready').get(function() {
    return this.portionsReadyInTheKitchen >= this.portionsToDeliver
  })

  return DishInOrder

})(new Schema())


var Order = (function(Order) {

  Order.add({
    table: String,
    dishes: [DishInOrder]
  })

  Order.plugin(require('mongoose-trackable'))

  Order.set('toObject', {virtuals: true})
  Order.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.dishes = _.groupBy(ret.dishes, function(dish) {
        return dish.category
      })
      delete ret._id
      delete ret.__v
    }
  })

  Order.virtual('ready').get(function() {
    return _(this.dishes).every(function(dish) {
      return dish.ready
    })
  })

  Order.statics.save = function(data, callAfterSave) {
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
      _.bind(
        function(err, dishes) {
          data.dishes = dishes
          this.create(data, callAfterSave)
        },
        this
      )
    )
  }

  Order.statics.createdBetween = function(fromTimestamp, toTimestamp, callback) {
    var query = this.where('createdAt')
      .gt(new Date(fromTimestamp))
      .lte(new Date(toTimestamp))

    if (callback) {
      return query.exec(callback)
    }
    return query
  }

  return Order

})(new Schema())


module.exports = mongoose.model('Order', Order)
