var expect = require("chai").use(require("sinon-chai")).expect,
    sinon = require("sinon"),
    sse = require("./../../lib/connect-mongoose-sse")

describe("connect-mongoose-sse", function() {
  it("is a function", function() {
    expect(sse).to.be.a("function")
  })

  it("is a function that returns a function", function() {
    expect(sse()).to.be.a("function")
  })

  context("when Request doesn't Accept text/event-stream", function() {
    beforeEach(function() {
      this.req = {
        accepts: sinon.stub().returns(false)
      }
      this.res = sinon.spy()
      this.next = sinon.spy()
    })

    it("will call next", function() {
      ;(sse())(this.req, this.res, this.next)

      expect(this.req.accepts).to.have.been.calledWith("text/event-stream")
      expect(this.next).to.have.been.calledOnce
    })
  })

  context("when Request Accept text/event-stream", function() {
    beforeEach(function() {
      this.req = {
        accepts: sinon.stub().returns(true),
        headers: {}
      }
      this.res = {
        writeHead: sinon.spy(),
        write: sinon.spy(),
        end: sinon.spy()
      }
      this.next = sinon.spy()
      this.model = {
        collection: {name: "model-collection-name"},
        createdBetween: sinon.spy(function(from, to, callback) {
          callback(null, [])
        })
      }
    })

    it("will call createdBetween on Model", function() {
      ;(sse(this.model))(this.req, this.res, this.next)

      expect(this.model.createdBetween).to.have.been.calledOnce
      expect(this.next).to.not.have.been.called
    })

    it("will set required headers", function() {
      ;(sse(this.model))(this.req, this.res, this.next)

      expect(this.res.writeHead).to.have.been.calledWith(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      })
    })

    context("and have Last-Event-ID header", function() {
      it("will call createdBetween on Model with Last-Event-ID value", function() {
        this.req.headers["last-event-id"] = "some-id"

        ;(sse(this.model))(this.req, this.res, this.next)

        expect(this.model.createdBetween).to.have.been.calledWith("some-id")
      })
    })

    context("when Model.createdBetween returns nothing", function() {
      it("will write nothing", function() {
        ;(sse(this.model))(this.req, this.res, this.next)

        expect(this.res.write).to.not.have.been.called
      })
    })

    context("when Model.createdBetween returns some documents", function() {
      it("will write the event", function() {
        var documents = [{id: 1}, {id: 2}, {id: 3}]

        this.model.createdBetween = sinon.spy(function(from, to, callback) {
          callback(null, documents)
        })

        this.res.write = sinon.spy(function(event) {
          var lines = event.split("\n")

          expect(lines).to.have.length(5)
          expect(lines[0]).to.match(/^id: \d+$/)
          expect(lines[1]).to.eq("event: model-collection-name")
          expect(lines[2]).to.eq("data: " + JSON.stringify(documents))
        })

        ;(sse(this.model))(this.req, this.res, this.next)

        expect(this.res.write).to.have.been.called
      })
    })

    context("when Model.createdBetween returns an error", function() {
      it("will reply with 500", function() {
        this.model.createdBetween = sinon.spy(function(from, to, callback) {
          callback("unknown-error")
        })

        ;(sse(this.model))(this.req, this.res, this.next)

        expect(this.res.writeHead).to.have.been.calledWith(500)
      })
    })
  })
})
