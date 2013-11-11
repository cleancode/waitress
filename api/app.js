var express = require("express"),
    util = require("util")

module.exports = express()
  .set("port", process.env.PORT || 3000)
  .get("/hello", function(req, res) {
    res.end(
      util.format("Hello %s", req.query.who || "World")
    )
  })
