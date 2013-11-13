process.env.NODE_ENV = "test"

var http = require("http"),
    request = require("request"),
    _ = require("underscore")


module.exports.loadFixtures = function(app) {
  return function(done) {
    require("mongodb").MongoClient.connect(app.get("db"), function(err, db) {
      require("./../../lib/fixtures").load(db, done)
    })
  }
}

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
