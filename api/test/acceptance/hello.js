var helper = require("./_helper"),
    app = require("./../../app"),
    expect = require("chai").expect

describe("Waitress", function() {
  describe("GET /hello", function() {
    before(helper.startServer(app))

    it("should reply with 200 OK status", function(done) {
      this.route("/hello", function(err, res, body) {
        expect(res.statusCode).to.equal(200)
      }, done)
    })

    it("should reply with 'Hello World' body", function(done) {
      this.route("/hello", function(err, res, body) {
        expect(body).to.equal("Hello World")
      }, done)
    })

    describe("?who=Gabriele", function() {
      it("should reply with 'Hello Gabriele' body", function(done) {
        this.route("/hello?who=Gabriele", function(err, res, body) {
          expect(body).to.equal("Hello Gabriele")
        }, done)
      })
    })

    after(helper.stopServer)
  })
})
