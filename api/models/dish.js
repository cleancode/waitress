var mongoose = require('mongoose')

module.exports = mongoose.model('Dish', new mongoose.Schema(
  { name: String,
    category: String
  },
  { toJSON: {transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }}
))
