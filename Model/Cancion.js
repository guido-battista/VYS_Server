var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var cancionSchema = new Schema({
  //_id:       { type: String},
  idEvento:  { type: String },
  titulo:    { type: String },
  votos:     { type: Number },
  //'Votar', 'Escuchada','Baja'
  estado:    { type: String }
});

module.exports = mongoose.model('canciones', cancionSchema);
