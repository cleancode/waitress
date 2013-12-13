var helper = require('./../_helper'),
    app = require('./../../app'),
    request = require('request'),
    expect = require('chai').expect

describe('HTTP /hello resource', function() {
  before(helper.startServer(app))

  describe('GET /hello', function() {
    it('should reply with 200 OK status', function(done) {
      request.get(this.urlFor('/hello'), function(err, res, body) {
        expect(res.statusCode).to.equal(200)
        done()
      })
    })

    it('should reply with "Hello World" body', function(done) {
      request.get(this.urlFor('/hello'), function(err, res, body) {
        expect(body).to.equal('Hello World')
        done()
      })
    })

    describe('?who=Gabriele', function() {
      it('should reply with "Hello Gabriele" body', function(done) {
        request.get(this.urlFor('/hello?who=Gabriele'), function(err, res, body) {
          expect(body).to.equal('Hello Gabriele')
          done()
        })
      })
    })
  })
  after(helper.stopServer)
})
