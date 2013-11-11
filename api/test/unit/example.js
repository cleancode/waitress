var expect = require("chai").expect

describe("mocha with chai", function() {
  describe("simple tests", function() {
    it("true should be true", function() {
      expect(true).to.be.true
    })

    it("equality", function() {
      expect("foo").to.equal("foo")
    })

    it("not equality", function() {
      expect("foo").to.not.equal("bar")
    })
  })
})
