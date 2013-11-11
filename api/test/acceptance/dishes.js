var helper = require("./_helper"),
    app = require("./../../app"),
    expect = require("chai").expect,
    _ = require("underscore"),
    async = require("async"),
    Dish = require("mongoose").model("Dish")

describe("Waitress", function() {
  describe("GET /dishes", function() {
    before(helper.startServer(app))
    beforeEach(function(done) {
      async.series([
        function(cb) {new Dish({name: "spaghetti", category: "primo"}).save(cb)},
        function(cb) {new Dish({name: "maccheroni", category: "primo"}).save(cb)}
      ], done)
    })

    it("should return json", function(done) {
      this.route("/dishes", function(err, res, body) {
        expect(res.headers["content-type"]).to.contain("application/json")
      }, done)
    })

    it("should return all the dishes", function(done) {
      this.route("/dishes", function(err, res, body) {
        var dishes = JSON.parse(body), names = _(dishes).pluck("name")
        expect(names).to.contain("spaghetti")
        expect(names).to.contain("maccheroni")
      }, done)
    })

    afterEach(function(done) {
      Dish.remove(done)
    })
    after(helper.stopServer)
  })
})
