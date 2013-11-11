process.env.NODE_ENV = "test"

var http = require("http"),
    request = require("request")

module.exports.startServer = function(app) {
  return function(done) {
    this.server = http.createServer(app).listen(app.get("port"), done)
    this.route = function(route, expectation, done) {
      request.get("http://localhost:" + app.get("port") + route, function(err, res, body) {
        if (err) return done(err)
        expectation(err, res, body)
        done()
      })
    }
  }
}

module.exports.stopServer = function(done) {
  this.server.close(done)
}
