var helper = require("./../_helper"),
    app = require("./../../app"),
    Order = require("./../../models/order"),
    expect = require("chai").expect,
    request = require("request")

describe("Waitress", function() {
  describe("POST /orders", function() {
    before(helper.loadFixtures(app))
    before(helper.startServer(app))
    before(helper.forOrders)

    it("should store an Order", function(done) {
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

    after(helper.stopServer)
  })
})
