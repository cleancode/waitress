var express = require('express'),
    app = module.exports = express(),
    util = require('util')

app.configure(function() {
  app.set('port', process.env.PORT || 3000)
})

app.configure('test', function() {
  app.set('port', 9191)
})

app.get('/hello', function(req, res) {
  res.end(
    util.format('Hello %s', req.query.who || 'World')
  )
})

if (require.main === module) {
  require('http').createServer(app).listen(app.get('port'), function() {
    console.log('Waitress server is running on port %d', app.get('port'))
  })
}
