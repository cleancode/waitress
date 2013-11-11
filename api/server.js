var express = require("express"),
    util = require("util")

var app = express()

app.set("port", process.env.PORT || 3000)

app.get("/hello", function(req, res) {
  res.end(
    util.format("Hello %s", req.query.who || "World")
  )
})

app.listen(app.get("port"), function() {
  console.log("Waitress server is running on port %d", app.get("port"))
})
