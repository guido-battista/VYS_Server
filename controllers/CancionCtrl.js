const Cancion = require('../Model/Cancion.js');
const Path = require('path');
const mongoose = require('mongoose');

var dirVistas = Path.join(__dirname, '../View');

// Aca tengo que obtener o definir el evento
var evento = 1;

//POST - Insert una nueva Cancion
exports.addCancion = function(req, res) {
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
  	res.status(200).jsonp(canciones);
});
};

exports.mostrarHome = (req, res) => {
	Cancion.find({idEvento:evento},function(err, result) {
  	if(err) res.send(500, err.message);
		var aVotar = result.filter((a)=>a.estado=="Votar");
		var yaEscuchadas = result.filter((a)=>a.estado=="Escuchada");
		var sonando = result.filter((a)=>a.estado=="Sonando");
		res.render(dirVistas + '/index.ejs',{aVotar : aVotar, yaEscuchadas : yaEscuchadas, sonando:sonando});
	});
};

exports.quitarCancion = (req, res) => {
	Cancion.findByIdAndRemove({_id: req.query.id.toString()}, function(err) {
  	if(err) res.send(500, err.message);
		res.redirect('..');
		//res.status(200).jsonp(canciones);
	});
};

exports.sumarVoto = (req, res) => {
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
exports.elegirCancion = function(req, res) {
	Cancion.findOneAndUpdate({idEvento:evento, estado:"Sonando"} , {estado:"Escuchada"}, function(err, result) {
		if(err) res.send(500, err.message);
		Cancion.findOneAndUpdate({_id :req.query.id}, {estado:"Sonando"}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
			//res.render(dirVistas + '/index.ejs',{canciones: result})
		})
	})
};

exports.cancionSonando = (req, res) => {
	console.log("Evento:"+req.query.idEvento);
	Cancion.findOne({idEvento:req.query.idEvento,estado:"Sonando"},function(err, canciones) {
  	if(err) res.send(500, err.message);
  	res.status(200).jsonp(canciones);
	});
};
