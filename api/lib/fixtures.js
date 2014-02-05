var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  _ = require('lodash')


module.exports.load = function(db, callback, fixturePath) {
  var fixtures = {}
  fs.readdir(fixturePath || './fixtures', function(err, files) {
    _.forEach(files, function(file) {
      if (path.extname(file) === '.json') {
        fixtures[path.basename(file, '.json')] = JSON.parse(fs.readFileSync(path.join(fixturePath || './fixtures', file)))
      }
    })
    save(db, fixtures, callback)
  })
}

function save(db, fixtures, whenSavedAllFixtures) {
  async.each(
    _.map(fixtures, function(d, c) {return {documents: d, collection: c}}),
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
