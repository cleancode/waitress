var expect = require('chai').use(require('sinon-chai')).expect,
    sinon = require('sinon'),
    sse = require('./../../lib/connect-mongoose-sse')

describe('connect-mongoose-sse', function() {
  xit('is a function', function() {
    expect(sse).to.be.a('function')
  })

  xit('is a function that returns a function', function() {
    expect(sse()).to.be.a('function')
    expect(sse()).to.have.length(3)
  })

  context('when Request doesn\'t Accept text/event-stream', function() {
    beforeEach(function() {
      this.req = {
        headers: {'accept': 'application/json'}
      }
      this.res = sinon.spy()
      this.next = sinon.spy()
    })

    xit('will call next', function() {
      sse()(this.req, this.res, this.next)

      expect(this.next).to.have.been.calledOnce
    })
  })

  context('when Request Accept text/event-stream', function() {
    beforeEach(function() {
      this.req = {
        headers: {'accept': 'text/event-stream'}
      }
      this.res = {
        writeHead: sinon.spy(),
        write: sinon.spy(),
        end: sinon.spy()
      }
      this.next = sinon.spy()
      this.model = {
        collection: {name: 'model-collection-name'},
        createdBetween: sinon.spy(function(from, to, callback) {
          callback(null, [])
        })
      }
    })

    xit('will call createdBetween on Model', function() {
      sse(this.model)(this.req, this.res, this.next)

      expect(this.model.createdBetween).to.have.been.calledOnce
      expect(this.next).to.not.have.been.called
    })

    xit('will set required headers', function() {
      sse(this.model)(this.req, this.res, this.next)

      expect(this.res.writeHead).to.have.been.calledWith(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
    })

    context('and have Last-Event-ID header', function() {
      xit('will call createdBetween on Model with Last-Event-ID value', function() {
        this.req.headers['last-event-id'] = '1'

        sse(this.model)(this.req, this.res, this.next)

        expect(this.model.createdBetween).to.have.been.calledWith(1)
      })
    })

    context('when Model.createdBetween returns nothing', function() {
      xit('will write nothing', function() {
        sse(this.model)(this.req, this.res, this.next)

        expect(this.res.write).to.not.have.been.called
      })
    })

    context('when Model.createdBetween returns some documents', function() {
      xit('will write the event', function() {
        var documents = [{id: 1}, {id: 2}, {id: 3}]

        this.model.createdBetween = sinon.spy(function(from, to, callback) {
          callback(null, documents)
        })

        this.res.write = sinon.spy(function(event) {
          var lines = event.split('\n')

          expect(lines).to.have.length(5)
          expect(lines[0]).to.match(/^id: \d+$/)
          expect(lines[1]).to.eq('event: model-collection-name')
          expect(lines[2]).to.eq('data: ' + JSON.stringify(documents))
        })

        sse(this.model)(this.req, this.res, this.next)

        expect(this.res.write).to.have.been.called
      })
    })

    context('when Model.createdBetween returns an error', function() {
      xit('will reply with 500', function() {
        this.model.createdBetween = sinon.spy(function(from, to, callback) {
          callback('unknown-error')
        })

        sse(this.model)(this.req, this.res, this.next)

        expect(this.res.writeHead).to.have.been.calledWith(500)
      })
    })
  })
})
