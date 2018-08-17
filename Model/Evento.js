var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var eventoSchema = new Schema({
      //_id:       { type: String},
      id:         { type: String },
      codigo:     { type: String },
      //P':Pendiente, 'A':Activo,'H':Historico
      estado:     { type: String },
      pass:       { type: String },
      intervalo:  { type: Number },
      enPausa:    { type: String },
      latitud:    { type: Number },
      longitud:   { type: Number },
      nombre:     { type: String },
      dj:         { type: String },
      lugar:      { type: String }
      //0:Votando, 1:En pausa
});

module.exports = mongoose.model('evento', eventoSchema);
