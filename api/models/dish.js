var mongoose = require('mongoose')

module.exports = mongoose.model('Dish', new mongoose.Schema(
  {
    name: String,
    category: String
  },
  {
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id
        delete ret.__v
      }
    }
  }
))
