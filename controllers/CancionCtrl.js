const Cancion = require('../Model/Cancion.js');

//POST - Insert una nueva Cancion
exports.addCancion = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var cancion = new Cancion({
		titulo:    req.body.Nombre,
		votos: 	  0
	});

	cancion.save(function(err, cancion) {
		if(err) return res.status(500).send( err.message);
    res.status(200).jsonp(cancion);
	});
};

exports.verCanciones = (req, res) => {
  Cancion.find(function(err, canciones) {
  if(err) res.send(500, err.message);
  console.log('GET /canciones')
  res.status(200).jsonp(canciones);
});
}
