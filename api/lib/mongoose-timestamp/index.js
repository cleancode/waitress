module.exports = function(schema, options) {
  schema.add({
    createdAt: {type: Date, default: function() {return new Date()}},
    updatedAt: {type: Date, default: function() {return new Date()}}
  })

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
}
