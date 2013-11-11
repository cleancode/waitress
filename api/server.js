var app = require("./app"),
    http = require("http")

http.createServer(app).listen(app.get("port"), function() {
  console.log("Waitress server is running on port %d", app.get("port"))
})
