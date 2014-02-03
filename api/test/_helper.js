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

module.exports.forOrders = function(done) {
  var self = this,
      mongodb = require('mongodb'),
      Dish = require('./../models/dish')

  Dish.find().exec(function(err, docs) {
    self.allDishIds = _(docs).pluck('_id').shuffle().value()
    self.anOrderSpecification = function() {
      var dishes = _.flatten(arguments)
      if (dishes.length === 0) {
        dishes = _(self.allDishIds).sample(3).map(function(id) {
          return {
            id: id,
            portions: _.random(1, 5)
          }
        })
      }
      return {
        table: new mongodb.ObjectID(),
        dishes: dishes.map(function(dishInOrder) {
          if (!dishInOrder.dish) {
            dishInOrder.id = self.allDishIds.pop()
          }
          return dishInOrder
        }).valueOf()
      }
    }
    done()
  })
}
