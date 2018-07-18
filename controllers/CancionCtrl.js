const Cancion = require('../Model/Cancion.js');
const Evento = require('../Model/Evento.js');
const Path = require('path');
const mongoose = require('mongoose');

var dirVistas = Path.join(__dirname, '../View');

function agregarRespuesta(codigo,json){

		var a;
		if (Array.isArray(json))
		{
			a = "{estado:'"+codigo+"', respuesta:["+json+"]}";
		}
		else {
				a = "{estado:"+codigo+", respuesta"+json+"}";
		}

		console.log("Antes del JSON");
		var b = JSON.parse('{"agregado": "00"}');

		console.log("Antes del Object");
		var c = Object.assign(json,b);

		console.log(c);

		return c;

		//return JSON.parse(a);
		//return JSON.parse('{ "name":"John", "age":30, "city":"New York"}');

}

// Aca tengo que obtener o definir el evento
var evento = 1;
var session;

//POST - Insert una nueva Cancion
exports.addCancion = function(req, res) {
	//var id =  mongoose.Types.ObjectId();
	//console.log("ID <"+ id);
	sesion = req.session;
	evento = sesion.idEvento;
	var cancion = new Cancion({
		//_id: id,
		idEvento: evento,
		titulo:    req.body.Nombre,
		votos: 	  0,
		estado:		'Pendiente'
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

exports.obtenerCanciones = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
  Cancion.find({idEvento:req.query.idEvento}).sort({estado:"desc",votos:"desc",titulo:"asc"}).exec(function(err, canciones) {
  	if(err) res.send(500, err.message);
  	res.status(200).jsonp(canciones);
});
};

exports.mostrarHome = (req, res) => {
	sesion = req.session;
	if(sesion.idEvento) {
		evento = sesion.idEvento;
		Cancion.find({idEvento:evento}).sort({estado:"desc",votos:"desc",titulo:"asc"}).exec(function(err, result) {
  		if(err) res.send(500, err.message);
				Evento.findOne({id:evento},function(err, evento){
					if(err) res.send(500, err.message);
					var aVotar = result.filter(function(a){return a.estado=="Votar" || a.estado=="Pendiente"});
					var yaEscuchadas = result.filter((a)=>a.estado=="Escuchada");
					var sonando = result.filter((a)=>a.estado=="Sonando");
					var enPausa = evento.enPausa;
					//console.log("En pausa:" + enPausa);
					res.render(dirVistas + '/index.ejs',{aVotar : aVotar, yaEscuchadas : yaEscuchadas, sonando:sonando, enPausa:enPausa});
				})
		})
	}
	else
		{
		//res.render(dirVistas + '/login.ejs',{error : "false", mensaje :"Pass incorrecto"});
			res.redirect('/login');
		}
};

exports.quitarCancion = (req, res) => {
	Cancion.findByIdAndRemove({_id: req.query.id.toString()}, function(err) {
  	if(err) res.send(500, err.message);
		res.redirect('..');
		//res.status(200).jsonp(canciones);
	});
};

exports.quitarTodo = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
	Cancion.remove({idEvento:evento,"$or":[{estado:"Pendiente"},{estado:"Votar"}]}, function(err) {
  	if(err) res.send(500, err.message);
		res.redirect('..');
		//res.status(200).jsonp(canciones);
	});
};

exports.sumarVoto = (req, res) => {
	var resultado = {};
	Evento.findOne({id:req.body.idEvento},function(err, evento)
	{
  	if(err) res.send(500, err.message);
		if (evento.enPausa == '0')
		{
				Cancion.findOneAndUpdate({_id :req.body._id,estado:"Votar"}, {$inc : {'votos' : 1}}, function(err, result) {
				if(err) res.send(500, err.message);
				if (result != null)
				{
					resultado['codigoRetorno'] = '00';
					resultado['descripcionRetorno'] = 'Voto Contabilizado';
				}
				else
				{
					resultado['codigoRetorno'] = '01';
					resultado['descripcionRetorno'] = 'El tema ya no esta disponible para votar';
				}
				//res.status(200).jsonp(result);
				res.status(200).jsonp(resultado);
				//res.render(dirVistas + '/index.ejs',{canciones: result})
			})
		}
		else
		{
			resultado['codigoRetorno'] = '02';
			resultado['descripcionRetorno'] = 'El DJ pausó la votación';
			res.status(200).jsonp(resultado);
		}
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
	sesion = req.session;
	evento = sesion.idEvento;
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
	resultado = {};
	Evento.findOne({id:req.query.idEvento},function(err, evento)
	{
		if(err) res.send(500, err.message);
		if (evento.enPausa == "1")
		{
			resultado["codigoRetorno"] = '01';
			resultado["descripcionRetorno"] = "El DJ pausó la votación";
			//console.log("Devuelvo resultado");
			res.status(200).jsonp(resultado);
		}
		else
		{
		Cancion.findOne({idEvento:req.query.idEvento,estado:"Sonando"},function(err, canciones) {
  		if(err) res.send(500, err.message);
			if(canciones != null)
			{
				resultado["codigoRetorno"] = '00';
				resultado["descripcionRetorno"] = "";
				resultado["cancionSonando"] = canciones.titulo;
				//console.log("Devuelvo resultado");
				res.status(200).jsonp(resultado);
			}
			else
			{
				resultado["codigoRetorno"] = '02';
				resultado["descripcionRetorno"] = "El DJ no cargó la canción sonando";
				resultado["cancionSonando"] = "";
				//console.log("Devuelvo resultado");
				res.status(200).jsonp(resultado);
			}
  		//res.status(200).jsonp(resultado);
		});
		}
	})
};

exports.terminarCancionSonando = (req, res) => {
		Cancion.findOneAndUpdate({idEvento:evento, estado:"Sonando"} , {estado:"Escuchada"}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
		});
};

exports.obtenerEvento = (req, res) => {
  Evento.findOne({id:req.query.idEvento},function(err, evento) {
  	if(err) res.send(500, err.message);
  	res.status(200).jsonp(evento);
});
};

exports.cargarEvento = function(req, res) {
	//var id =  mongoose.Types.ObjectId();
	//console.log("ID <"+ id);
	var evento = new Evento({
		//_id: id,
		id: 		"3",
		codigo:	"1234",
		estado:	"P"
	});

	evento.save(function(err, evento) {
		if(err) return res.status(500).send( err.message);
		res.redirect('..');
	});
};

exports.login = (req, res) => {
	res.render(dirVistas + '/login.ejs',{error : "false", mensaje :""});
};

exports.intentLogin = (req, res) => {
	var mensaje = "";
	var error= "false";
	Evento.findOne({id:req.body.idEvento},function(err, evento) {
  		if(err) res.send(500, err.message);
			if (evento == null)
			{
				mensaje = "Evento inexistente";
				error = "true";
			}
			else if(req.body.passEvento != evento.pass)
			{
				mensaje = "Contraseña incorrecta";
				error = "true";
			}
			if (error == "true")
			{
				res.render(dirVistas + '/login.ejs',{error : "true", mensaje :mensaje});
			}
			else
			{
				//Login correcto!!!!
				sesion = req.session;
				sesion.idEvento=req.body.idEvento;
				res.redirect('/');
			}
	});
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

exports.cargarArchivos = (req, res) => {
	//sesion = req.session;
	//evento = session.idEvento;
	//console.log("Archivos < "+req.body.files.toString());

	var archivos = req.body.files.toString().split(",");
	archivos = archivos.filter(function(a){return a.includes(".mp3") || a.includes(".mp4")});

	guardarCanciones(archivos,req,res);
	//while(cancion != null)
	//{
	//	console.log("Cancion = "+cancion);
	//		cancion = canciones.pop();
	//}
};

function guardarCanciones (archivos,req,res)
{
	var archivo = archivos.pop();

	if(archivo!=null)
	{
		archivo = archivo.replace(".mp3", "");
		archivo = archivo.replace(".mp4", "");
		sesion = req.session;
		evento = sesion.idEvento;
		var cancion = new Cancion({
			//_id: id,
			idEvento: evento,
			titulo:    archivo,
			votos: 	  0,
			estado:		'Pendiente'
		});

		cancion.save(function(err, cancion) {
			if(err) return res.status(500).send( err.message);
			Cancion.find(function(err, result) {
			if(err) res.send(500, err.message);
			guardarCanciones(archivos,req,res);
			//res.render(dirVistas + '/index.ejs',{canciones: result})
			});
		});
	}
	else
	{
			res.redirect('/');
	}
};


exports.ponerVotar = function(req, res) {
		Cancion.findOneAndUpdate({_id :req.query.id}, {estado:"Votar"}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
			//res.render(dirVistas + '/index.ejs',{canciones: result})
		})
};

exports.ponerVotarTodo = function(req, res) {
		sesion = req.session;
		evento = sesion.idEvento;
		Cancion.updateMany({idEvento:evento,estado:"Pendiente"}, {estado:"Votar"}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
			//res.render(dirVistas + '/index.ejs',{canciones: result})
		})
};

exports.quitarVotar = function(req, res) {
		Cancion.findOneAndUpdate({_id :req.query.id}, {estado:"Pendiente",votos:0}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
			//res.render(dirVistas + '/index.ejs',{canciones: result})
		})
};

exports.quitarVotarTodo = function(req, res) {
		sesion = req.session;
		evento = sesion.idEvento;
		Cancion.updateMany({idEvento:evento,estado:"Votar"}, {estado:"Pendiente",votos:0}, function(err, result) {
			if(err) res.send(500, err.message);
			res.redirect('..');
			//res.render(dirVistas + '/index.ejs',{canciones: result})
		})
};

exports.quitarTodoEscuchado = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;;
	Cancion.remove({idEvento:evento,estado:"Escuchada"}, function(err) {
  	if(err) res.send(500, err.message);
		res.redirect('..');
		//res.status(200).jsonp(canciones);
	});
};

exports.prueba = (req, res) => {
  Cancion.find({idEvento:2}).sort({estado:"desc",votos:"desc",titulo:"asc"}).exec(function(err, canciones) {
  	if(err) res.send(500, err.message);
		//var retorno = "{estado:'00'}";
  	res.status(200).jsonp(agregarRespuesta("00",canciones));
		//res.status(200).jsonp(canciones);
});
};

exports.pausar = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
	Evento.findOneAndUpdate({id:evento}, {enPausa:"1"}, function(err, result) {
		if(err) res.send(500, err.message);
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
	})
};

exports.reaundar = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
	Evento.findOneAndUpdate({id:evento}, {enPausa:"0"}, function(err, result) {
		if(err) res.send(500, err.message);
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
	})
};
