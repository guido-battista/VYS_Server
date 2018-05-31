var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var eventoSchema = new Schema({
      //_id:       { type: String},
      id:         { type: String },
      codigo:     { type: String },
      estado:     { type: String },
      pass:       { type: String },
      intervalo:  { type: Number}
      //'Votar', 'P':Pendiente, 'A':Activo,'H':Historico

});

module.exports = mongoose.model('evento', eventoSchema);
