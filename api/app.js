var express = require("express"),
    mongoose = require("mongoose"),
    app = module.exports = express(),
    util = require("util")

var Dish = require("./models/dish"),
    Order = require("./models/order")

app.configure(function() {
  app.set("port", process.env.PORT || 3000)
  app.set("db", process.env.MONGODB_URL || "mongodb://localhost/waitress")
})

app.configure("test", function() {
  app.set("port", 9191)
  app.set("db", "mongodb://localhost/waitress-test")
})

app.use(express.favicon())
app.use(express.logger("dev"))
app.use(express.json())
app.use(require("cors")())

mongoose.connect(app.get("db"))

app.get("/hello", function(req, res) {
  res.end(
    util.format("Hello %s", req.query.who || "World")
  )
})

app.get("/dishes", function(req, res) {
  Dish.find().exec(function(err, docs) {
    res.json(docs)
  })
})

app.post("/orders", function(req, res) {
  new Order(req.body).save(function(err, order) {
    res.location(util.format("/order/%s", order.id))
    res.json(201, order)
  })
})

app.get("/orders", function(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.write("id: 1234\nevent: orders\ndata: [{\"msg\":\"asdasdas\"}]\n\n")
  res.end()
})

if (require.main === module) {
  mongoose.connection.on("connected", function() {
    require("./lib/fixtures").load(mongoose.connection.db, function() {
      require("http").createServer(app).listen(app.get("port"), function() {
        console.log("Waitress server is running on port %d", app.get("port"))
      })
    })
  })
}

