var express = require("express"), util = require("util")

var app = express()

app.configure(function() {
  app.set("port", process.env.PORT || 3000)
  app.set("db", process.env.MONGODB_URL || "mongodb://localhost/waitress")
})

app.configure("test", function() {
  app.set("port", 9191)
  app.set("db", "mongodb://localhost/waitress-test")
})

app.get("/hello", function(req, res) {
  res.end(
    util.format("Hello %s", req.query.who || "World")
  )
})


module.exports = app
