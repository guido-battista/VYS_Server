const Cancion = require('../Model/Cancion.js');
const Path = require('path');

var dirVistas = Path.join(__dirname, '../View');

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
		Cancion.find(function(err, result) {
		if(err) res.send(500, err.message);
		res.render(dirVistas + '/index.ejs',{canciones: result})
	});
	});
};

exports.verCanciones = (req, res) => {
  Cancion.find(function(err, canciones) {
  if(err) res.send(500, err.message);
  console.log('GET /canciones')
  res.status(200).jsonp(canciones);
});
};

exports.mostrarHome = (req, res) => {
	Cancion.find(function(err, result) {
  if(err) res.send(500, err.message);
	res.render(dirVistas + '/index.ejs',{canciones: result})
});
};
