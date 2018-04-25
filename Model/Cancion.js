var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var cancionSchema = new Schema({
  titulo:    { type: String },
  votos:     { type: Number }
});

module.exports = mongoose.model('canciones', cancionSchema);
