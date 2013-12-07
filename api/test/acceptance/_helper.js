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
    this.urlFor = function(path) {
      return "http://localhost:" + app.get("port") + path
    }
  }
}

module.exports.stopServer = function(done) {
  this.server.close(done)
}
