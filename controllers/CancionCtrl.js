const Cancion = require('../Model/Cancion.js');
const Path = require('path');
const mongoose = require('mongoose');

var dirVistas = Path.join(__dirname, '../View');

// Aca tengo que obtener o definir el evento
var evento = 1;

//POST - Insert una nueva Cancion
exports.addCancion = function(req, res) {
	console.log('POST');
	console.log(req.body);

	//var id =  mongoose.Types.ObjectId();
	//console.log("ID <"+ id);
	var cancion = new Cancion({
		//_id: id,
		idEvento: evento,
		titulo:    req.body.Nombre,
		votos: 	  0,
		estado:		'Votar'
	});

	cancion.save(function(err, cancion) {
		if(err) return res.status(500).send( err.message);
		Cancion.find(function(err, result) {
		if(err) res.send(500, err.message);
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
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

exports.quitarCancion = (req, res) => {
	console.log('Esta entrando por aca = ' + req.query.id.toString());
	console.log('Id <'+req.query.id.toString()+'>');
	Cancion.findByIdAndRemove({_id: req.query.id.toString()}, function(err) {
  	if(err) res.send(500, err.message);
		res.redirect('..');
		//res.status(200).jsonp(canciones);
	});
};

exports.sumarVoto = (req, res) => {
	console.log("Body: "+req.body);
	console.log("Se actualizara: "+ req.body._id);
	console.log("Titulo: "+ req.body.titulo);
	console.log("Titulo: "+ req.body);
	console.log("Long: "+ req.body.length);
	console.log("Algo: "+ req.body[0]);
	Cancion.findOneAndUpdate({_id :req.body._id}, {$inc : {'votos' : 1}}, function(err, result) {
	if(err) res.send(500, err.message);
	res.status(200).jsonp(result);
	//res.render(dirVistas + '/index.ejs',{canciones: result})
})
};

exports.restarVoto = (req, res) => {
	Cancion.findOneAndUpdate({_id :req.body.id}, {$inc : {'votos' : -1}}, function(err, result) {
	if(err) res.send(500, err.message);
	res.redirect('..');
	//res.render(dirVistas + '/index.ejs',{canciones: result})
})
};

//POST - Insert una nueva Cancion
exports.cancionSonando = function(req, res) {
	console.log('POST');
	console.log(req.body);

	var cancion = new Cancion({
		idEvento: evento,
		titulo:    req.body.Nombre,
		votos: 	  0
	});

	cancion.save(function(err, cancion) {
		if(err) return res.status(500).send( err.message);
		Cancion.find(function(err, result) {
		if(err) res.send(500, err.message);
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
	});
	});
};
