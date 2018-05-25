var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var eventoSchema = new Schema({
      //_id:       { type: String},
      id:         { type: String },
      codigo:     { type: String },
      //'Votar', 'P':Pendiente, 'A':Activo,'H':Historico
      estado:     { type: String }
});

module.exports = mongoose.model('evento', eventoSchema);
