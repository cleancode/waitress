var express = require('express'),
    app = module.exports = express(),
    mongoose = require('mongoose'),
    util = require('util')


var Dish = mongoose.model('Dish', new mongoose.Schema(
  {
    name: String,
    category: String
  },
  {
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id
        delete ret.__v
      }
    }
  }
))


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

if (require.main === module) {
  mongoose.connection.on('connected', function() {
    require('./lib/fixtures').load(mongoose.connection.db, function() {
      require('http').createServer(app).listen(app.get('port'), function() {
        console.log('Waitress server is running on port %d', app.get('port'))
      })
    })
  })
}
