var app = require("./../../app"),
    helper = require("./../_helper"),
    expect = require("chai").use(require("chai-things")).expect,
    Order = require("./../../models/order")

describe("Waitress", function() {
  describe("Order", function() {
    before(helper.loadFixtures(app))
    before(helper.forOrders)

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

    context("as JSON", function() {
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
  })
})
