module.exports = function(schema, options) {
  schema.add({
    createdAt: {type: Date, default: new Date()},
    updatedAt: {type: Date, default: new Date()}
  })

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });
}
