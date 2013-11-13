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

if (require.main === module) {
  mongoose.connection.on("connected", function() {
    require("./lib/fixtures").load(mongoose.connection.db, function() {
      require("http").createServer(app).listen(app.get("port"), function() {
        console.log("Waitress server is running on port %d", app.get("port"))
      })
    })
  })
}

module.exports = app
