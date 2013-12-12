var app = require("./../../app"),
    helper = require("./../_helper"),
    expect = require("chai").use(require("chai-things")).expect,
    Order = require("./../../models/order"),
    _ = require("lodash")

describe("Order", function() {
  beforeEach(helper.loadFixtures(app))
  beforeEach(helper.forOrders)

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

  describe(".toJSON", function() {
    it("has dishes groupped by category", function(done) {
      var fiveDishes = _(5).times(function() {return {portions: _.random(2,4)}})
      Order.save(this.anOrderSpecification(fiveDishes), function(err, order) {
        var orderBackFromJSON = JSON.parse(JSON.stringify(order))
        var dishesCategories = _(order.dishes).chain()
          .map(function(dish) {return dish.category})
          .unique()
          .value()
        expect(orderBackFromJSON.dishes).to.have.keys(dishesCategories)
        done()
      })
    })
  })

  describe("::createdBetween query", function() {
    it("returns orders created between some timestamps", function(done) {
      Order.save(this.anOrderSpecification(), function(err, order) {
        var util = require("util")
        Order.createdBetween(1, order.createdAt, function(err, orders) {
          expect(orders).to.be.length(1)
          done()
        })
      })
    })

    it("returns nothing when first timestamps are in the future", function(done) {
      var inTheFuture = _.now() + 100000
      Order.save(this.anOrderSpecification(), function(err, order) {
        Order.createdBetween(inTheFuture, inTheFuture + 10, function(err, updatedAfter) {
          expect(updatedAfter).to.have.length(0)
          done()
        })
      })
    })

    // XXX: must be tested more but unfortunately mongoose-timestamp
    // doesn't support the injection of time, a pull request is mandatory :smile:
  })
})
