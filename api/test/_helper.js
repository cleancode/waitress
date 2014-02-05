process.env.NODE_ENV = 'test'

var http = require('http'),
    request = require('request'),
    path = require('path'),
    _ = require('lodash')


module.exports.loadFixtures = function(app) {
  return function(done) {
    require('mongodb').MongoClient.connect(app.get('db'), function(err, db) {
      require('./../lib/fixtures').load(db, done, path.join(__dirname, '..', 'fixtures'))
    })
  }
}

module.exports.startServer = function(app) {
  return function(done) {
    this.server = http.createServer(app).listen(app.get('port'), done)
    this.urlFor = function(path) {
      return 'http://localhost:' + app.get('port') + path
    }
  }
}

module.exports.stopServer = function(done) {
  this.server.close(done)
}
