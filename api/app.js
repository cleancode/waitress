var express = require('express'),
    mongoose = require('mongoose'),
    app = module.exports = express(),
    sse = require('./lib/connect-mongoose-sse'),
    util = require('util'),
    async = require('async')

var Dish = require('./models/dish'),
    Order = require('./models/order')

app.configure(function() {
  app.set('port', process.env.PORT || 3000)
  app.set('db', process.env.MONGODB_URL || 'mongodb://localhost/waitress')
})

app.configure('test', function() {
  app.set('port', 9191)
  app.set('db', 'mongodb://localhost/waitress-test')
})

app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.json())
app.use(require('cors')())

mongoose.connect(app.get('db'))

app.get('/hello', function(req, res) {
  res.end(
    util.format('Hello %s', req.query.who || 'World')
  )
})

app.get('/dishes', function(req, res) {
  Dish.find().exec(function(err, docs) {
    res.json(docs)
  })
})

app.post('/orders', function(req, res) {
  Order.save(req.body, function(err, order) {
    res.location(util.format('/order/%s', order.id))
    res.json(201, order)
  })
})

app.get('/orders', sse(Order), function(req, res) {
  Order.find(function(err, orders) {
    res.json(orders)
  })
})

app.get('/orders/:id', function(req, res) {
  Order.findById(req.params.id, function(err, order) {
    res.json(order)
  })
})

app.post('/orders/ready', function(req, res) {
  async.map(
    req.body,
    function(orderThatIsReady, done) {
      Order.findById(orderThatIsReady, function(err, orderThatIsReady) {
        orderThatIsReady.dishes.forEach(function(dish) {
          dish.portionsReadyInTheKitchen = dish.portionsToDeliver
        })
        orderThatIsReady.save(done)
      })
    },
    function(err, all) {
      res.send(204)
    }
  )
})

if (require.main === module) {
  mongoose.connection.on('connected', function() {
    require('./lib/fixtures').load(mongoose.connection.db, function() {
      require('http').createServer(app).listen(app.get('port'), function() {
        console.log('Waitress server is running on port %d', app.get('port'))
      })
    })
  })
}

