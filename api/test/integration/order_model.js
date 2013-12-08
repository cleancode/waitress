var helper = require("./../acceptance/_helper"),
    app = require("./../../app"),
    Dish = require("./../../models/dish"),
    Order = require("./../../models/order"),
    expect = require("chai").use(require("chai-things")).expect,
    mongodb = require("mongodb"),
    _ = require("underscore")

describe("Waitress", function() {
  describe("Order", function() {
    before(helper.loadFixtures(app))

    it("can be created from specification data", function(done) {
      Order.save(this.anOrderSpecification(), function(err, order) {
        expect(err).to.eq(null)
        done()
      })
    })

    it("has dishes with portionsToDeliver field", function(done) {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })

      Order.save(orderWithThreePortionsOfOneDish, function(err, order) {
        expect(order.dishes).all.have.property("portionsToDeliver", portionsToDeliver)
        done()
      })
    })

    it("has dishes with portionsReadyInTheKitchen field", function(done) {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })

      Order.save(orderWithThreePortionsOfOneDish, function(err, order) {
        expect(order.dishes).all.have.property("portionsReadyInTheKitchen", 0)
        done()
      })
    })

    it("has dishes with ready field", function() {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })


      Order.save(orderWithThreePortionsOfOneDish, function(err, order) {
        expect(order.dishes).all.have.property("ready", false)

        order.dishes.forEach(function(dish) {
          dish.portionsReadyInTheKitchen = portionsToDeliver
        })
        expect(order.dishes).all.have.property("ready", true)
      })
    })

    it("has ready field", function() {
      var portionsToDeliver = 3,
          orderWithThreePortionsOfOneDish = this.anOrderSpecification({
            portions: portionsToDeliver
          })

      Order.save(orderWithThreePortionsOfOneDish, function(err, order) {
        expect(order).to.have.property("ready", false)

        order.dishes.forEach(function(dish) {
          dish.portionsReadyInTheKitchen = portionsToDeliver
        })

        expect(order).to.have.property("ready", true)
      })
    })

    before(function(done) {
      var self = this
      Dish.find().exec(function(err, docs) {
        self.allDishIds = _(docs).chain().pluck("_id").shuffle().value()
        self.anOrderSpecification = function() {
          var dishes = _(arguments).flatten()
          if (dishes.length === 0) {
            dishes = _(self.allDishIds).sample(3).map(function(id) {
              return {
                id: id,
                portions: _.random(1, 5)
              }
            })
          }
          return {
            table: new mongodb.ObjectID(),
            dishes: dishes.map(function(dishInOrder) {
              if (!dishInOrder.dish) {
                dishInOrder.id = self.allDishIds.pop()
              }
              return dishInOrder
            })
          }
        }
        done()
      })
    })
  })
})
