var helper = require('./../_helper'),
    app = require('./../../app'),
    expect = require('chai').expect,
    request = require('request'),
    _ = require('lodash')

describe('HTTP /dishes resource', function() {
  describe('GET /dishes', function() {
    before(helper.startServer(app))
    beforeEach(helper.loadFixtures(app))

    it('should return json', function(done) {
      request.get(this.urlFor('/dishes'), function(err, res, body) {
        expect(res.headers['content-type']).to.contain('application/json')
        done()
      })
    })

    it('should return all the dishes', function(done) {
      request.get(this.urlFor('/dishes'), function(err, res, body) {
        var dishes = JSON.parse(body), names = _.pluck(dishes, 'name')
        expect(names).to.contain('risotto ai porcini')
        expect(names).to.contain('filetto di manzo ai tre pepi')
        done()
      })
    })

    after(helper.stopServer)
  })
})
