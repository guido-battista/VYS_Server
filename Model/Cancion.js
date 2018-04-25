var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var cancionSchema = new Schema({
  title:    { type: String },
  votos:     { type: Number },
});

module.exports = mongoose.model('Cancion', cancionSchema);
