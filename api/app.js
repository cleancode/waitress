var express = require("express"),
    mongoose = require("mongoose")
    util = require("util")

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

app.get("/dishes", function(req, res) {
  mongoose.model("Dish").find().exec(function(err, docs) {
    res.json(docs)
  })
})

mongoose.connect(app.get("db"))

mongoose.model("Dish", new mongoose.Schema(
  {name: String, category: String},
  {toJSON: {transform: function(doc, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }}}
))

module.exports = app
