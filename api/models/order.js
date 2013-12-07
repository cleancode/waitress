var mongoose = require("mongoose"),
    Schema = mongoose.Schema


module.exports = mongoose.model("Order", new Schema(
  { table: Schema.ObjectId,
    dishes: [
      new Schema({dish: Schema.ObjectId, portions: Number}, {_id: false})
    ]
  },
  { toJSON: {transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
    }
  }}
))
