var helper = require("./_helper"),
    app = require("./../../app"),
    Dish = require("./../../models/dish"),
    Order = require("./../../models/order"),
    expect = require("chai").expect,
    request = require("request"),
    _ = require("underscore")

describe("Waitress", function() {
  describe("POST /orders", function() {
    before(helper.loadFixtures(app))
    before(helper.startServer(app))

    it("should store an Order", function(done) {
      request.post({url: this.urlFor("/orders"), json: this.orderToCreate}, function(err, res, body) {
        Order.find({_id: body.id}).exec(function(err, docs) {
          expect(docs).to.not.be.empty
          done()
        })
      });
    })

    it("should return 201", function(done) {
      request.post({url: this.urlFor("/orders"), json: this.orderToCreate}, function(err, res, body) {
        expect(res.statusCode).to.equal(201)
        done()
      });
    })

    it("should return a Location header", function(done) {
      request.post({url: this.urlFor("/orders"), json: this.orderToCreate}, function(err, res, body) {
        expect(res.headers).to.contain.keys("location")
        done()
      });
    })

    after(helper.stopServer)

    before(function(done) {
      var self = this
      Dish.find().exec(function(err, docs) {
        self.orderToCreate = {
          dishes: _(docs).chain()
            .pluck("_id")
            .sample(3)
            .map(function(id) {
              return {
                dish: id,
                portions: _.random(1, 5)
              }
            })
            .value(),
          table: new require("mongodb").ObjectID()
        }
        done()
      })
    })
  })
})
