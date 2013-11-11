var helper = require("./_helper"),
    app = require("./../../app"),
    expect = require("chai").expect,
    http = require("http"),
    request = require("request")

describe("Waitress", function() {
  describe("GET /hello", function() {
    before(function(done) {
      this.server = http.createServer(app).listen(app.get("port"), done)
      request.get.route = function(route, expectation, done) {
        request.get("http://localhost:" + app.get("port") + route, function(err, res, body) {
          if (err) return done(err)
          expectation(err, res, body)
          done()
        })
      }
    })

    it("should reply with 200 OK status", function(done) {
      request.get.route("/hello", function(err, res, body) {
        expect(res.statusCode).to.equal(200)
      }, done)
    })

    it("should reply with 'Hello World' body", function(done) {
      request.get.route("/hello", function(err, res, body) {
        expect(body).to.equal("Hello World")
      }, done)
    })

    describe("?who=Gabriele", function() {
      it("should reply with 'Hello Gabriele' body", function(done) {
        request.get.route("/hello?who=Gabriele", function(err, res, body) {
          expect(body).to.equal("Hello Gabriele")
        }, done)
      })
    })

    after(function(done) {
      this.server.close(done)
    })
  })
})
