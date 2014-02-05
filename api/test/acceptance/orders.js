var helper = require('./../_helper'),
    app = require('./../../app'),
    Order = require('./../../models/order'),
    expect = require('chai').expect,
    request = require('request')

describe('HTTP /orders resource', function() {
  before(helper.startServer(app))
  beforeEach(helper.loadFixtures(app))
  beforeEach(helper.forOrders)

  describe('POST /orders', function() {
    it('stores an order', function(done) {
      request.post(
        {url: this.urlFor('/orders'), json: this.anOrderSpecification()},
        function(err, res, body) {
          expect(res.statusCode).to.equal(201)
          expect(res.headers).to.contain.keys('location')
          Order.find({_id: body.id}).exec(function(err, docs) {
            expect(docs).to.not.be.empty
            done()
          })
        }
      );
    })
  })

  describe('POST /orders/ready', function() {
    it('states that an order is ready', function(done) {
      var self = this
      Order.save(self.anOrderSpecification(), function(err, order) {
        expect(order).to.have.property('ready', false)
        request.post(
          {url: self.urlFor('/orders/ready'), json: [order.id]},
          function(err, res, body) {
            expect(res.statusCode).to.equal(204)
            Order.findById(order.id, function(err, orderExpectedToBeReady) {
              expect(orderExpectedToBeReady).to.have.property('ready', true)
              done()
            })
          }
        )
      })
    })
  })

  describe('GET /orders', function() {
    it('returns all orders', function(done) {
      var self = this
      Order.save(self.anOrderSpecification(), function(err, order) {
        request.get(self.urlFor('/orders'), function(err, res, body) {
          expect(res.headers['content-type']).to.contain('application/json')
          expect(JSON.stringify([order])).to.eq(body)
          done()
        })
      })
    })

    describe('with header Accept: test/event-stream', function() {
      describe('when header Last-Event-Id is 0', function() {
        it('returns a server sent event with all orders', function(done) {
          var self = this,
              options = {
                url: self.urlFor('/orders'),
                headers: {
                  'Accept': 'text/event-stream'
                }
              }

          Order.save(self.anOrderSpecification(), function(err, order) {
            request.get(options, function(err, res, body) {
              expect(res.statusCode).to.equal(200)
              expect(res.headers['content-type']).to.contain('text/event-stream')

              var textLinesInBody = body.split('\n')
              expect(textLinesInBody[0]).to.match(/id:/)
              expect(textLinesInBody[1]).to.eq('event: orders')
              expect(textLinesInBody[2]).to.eq('data: ' + JSON.stringify([order]))

              done()
            })
          })
        })
      })
    })
  })

  describe('GET /orders/:id', function() {
    it('returns all orders', function(done) {
      var self = this
      Order.save(self.anOrderSpecification(), function(err, order) {
        request.get(self.urlFor('/orders/' + order.id), function(err, res, body) {
          expect(res.headers['content-type']).to.contain('application/json')
          expect(JSON.stringify(order)).to.eq(body)
          done()
        })
      })
    })
  })

  after(helper.stopServer)
})
