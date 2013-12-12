var helper = require("./../_helper"),
    app = require("./../../app"),
    Order = require("./../../models/order"),
    expect = require("chai").expect,
    request = require("request")

describe("HTTP /orders resource", function() {
  before(helper.startServer(app))
  beforeEach(helper.loadFixtures(app))
  beforeEach(helper.forOrders)

  describe("POST /orders", function() {
    it("stores an order", function(done) {
      request.post(
        {url: this.urlFor("/orders"), json: this.anOrderSpecification()},
        function(err, res, body) {
          expect(res.statusCode).to.equal(201)
          expect(res.headers).to.contain.keys("location")
          Order.find({_id: body.id}).exec(function(err, docs) {
            expect(docs).to.not.be.empty
            done()
          })
        }
      );
    })
  })

  describe("GET /orders", function() {
    it("returns all orders", function(done) {
      var self = this
      Order.save(self.anOrderSpecification(), function(err, order) {
        request.get(self.urlFor("/orders"), function(err, res, body) {
          expect(res.headers["content-type"]).to.contain("application/json")
          expect(JSON.stringify([order])).to.eq(body)
          done()
        })
      })
    })
  })

  after(helper.stopServer)
})
