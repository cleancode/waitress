var fs = require("fs"),
  path = require("path"),
  async = require("async"),
  _ = require("underscore")


module.exports.load = function(db, callback, fixture_path) {
  var fixtures = {}
  fs.readdir(fixture_path || "./fixtures", function(err, files) {
    _(files).each(function(file) {
      if (path.extname(file) === ".json") {
        fixtures[path.basename(file, ".json")] = JSON.parse(fs.readFileSync(path.join(fixture_path || "./fixtures", file)))
      }
    })
    save(db, fixtures, callback)
  })
}

function save(db, fixtures, whenSavedAllFixtures) {
  async.each(
    _(fixtures).map(function(d, c) {return {documents: d, collection: c}}),
    function(fixture, whenSavedFixture) {
      db.collection(fixture.collection, function(err, collection) {
        collection.remove({}, function(err, result) {
          if (fixture.documents.length === 0) {
            return whenSavedFixture()
          }
          collection.insert(fixture.documents, whenSavedFixture)
        })
      })
    },
    whenSavedAllFixtures
  )
}
