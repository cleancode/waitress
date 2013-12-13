process.env.NODE_ENV = 'test'

var http = require('http'),
    request = require('request'),
    path = require('path'),
    _ = require('lodash')


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
