const Cancion = require('../Model/Cancion.js');
const Evento = require('../Model/Evento.js');
const Path = require('path');
const mongoose = require('mongoose');

//Firebase ---------------
const admin = require("firebase-admin");

var serviceAccount = require("../firebase/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://youdj-96cfe.firebaseio.com"
});
// ---------------------

var dirVistas = Path.join(__dirname, '../View');

var errores = {"0": "El evento está pausado, debe reanudarlo para continuar.",
               "1": "No se pudo generar la notificación."}

var enPausa = 0;

function agregarRespuesta(codigo,json){

		var a;
		if (Array.isArray(json))
		{
			a = "{estado:'"+codigo+"', respuesta:["+json+"]}";
		}
		else {
				a = "{estado:"+codigo+", respuesta"+json+"}";
		}

		var b = JSON.parse('{"agregado": "00"}');

		var c = Object.assign(json,b);

		return c;

		//return JSON.parse(a);
		//return JSON.parse('{ "name":"John", "age":30, "city":"New York"}');

}

// Aca tengo que obtener o definir el evento
//var evento = 1;
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
  Cancion.find({idEvento:req.query.idEvento, estado:{$in:["Votar","Sonando","Escuchada"]}}).sort({estado:"desc",votos:"desc",titulo:"asc"}).exec(function(err, canciones) {
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
					enPausa = evento.enPausa;
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
    if (evento.estado == 'H')
    {
      resultado['codigoRetorno'] = '03';
      resultado['descripcionRetorno'] = 'El evento ha finalizado';
      res.status(200).jsonp(resultado);
    }
		else if (evento.enPausa == '0')
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
					resultado['descripcionRetorno'] = 'El tema ya no está disponible para votar';
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
  if (enPausa == 0)
  {
	   Cancion.findOneAndUpdate({idEvento:evento, estado:"Sonando"} , {estado:"Escuchada"}, function(err, result) {
		     if(err) res.send(500, err.message);
		       Cancion.findOneAndUpdate({_id :req.query.id}, {estado:"Sonando"}, function(err, result) {
			          if(err) res.send(500, err.message);

     //Se genera una notificación con la canción sonando
           evento = sesion.idEvento;
           var topic = evento + "-sonando";
            var message = {
              data: {
                topic: 'sonando',
                titulo: "Sonando ahora",
                descripcion: result.titulo
              },
              topic: topic,
              //ttl: 1000
            };

          /*
            var message = {
            android: {
              ttl: 0, // 1 hour in milliseconds
              priority: 'normal',
              notification: {
                title: '¡No dejes de votar!',
                body: 'Revisá la lista y votá tu próximo tema',
              }
            },
            topic: topic
          };
          */

          // Send a message to devices subscribed to the provided topic.
            admin.messaging().send(message)
              .then((response) => {
              // Response is a message ID string.
                //res.redirect('..');
              })
              .catch((error) => {
                //res.redirect('/Error');
              });
      			res.redirect('..');
      			//res.render(dirVistas + '/index.ejs',{canciones: result})
      		})
      	})
      }
      else
      {
        //res.render(dirVistas + '/error.ejs',{descripcionError : "Esto es un error"});
        res.redirect('/mostrarError?numError=0');
      }
};

exports.cancionSonando = (req, res) => {
	resultado = {};
	Evento.findOne({id:req.query.idEvento},function(err, evento)
	{
		if(err) res.send(500, err.message);
    if (evento.estado == 'H')
    {
      resultado['codigoRetorno'] = '03';
      resultado['descripcionRetorno'] = 'El evento ha finalizado';
      res.status(200).jsonp(resultado);
    }
		else if (evento.enPausa == "1")
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
			if (evento==null)
				evento = {"_id":"null"};
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
      else if (evento.estado=='H')
      {
        mensaje = "El evento ya no se encuentra activo";
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
    enPausa = 1;
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
	})
};

exports.reaundar = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
	Evento.findOneAndUpdate({id:evento}, {enPausa:"0"}, function(err, result) {
		if(err) res.send(500, err.message);
    enPausa = 0;
		res.redirect('..');
		//res.render(dirVistas + '/index.ejs',{canciones: result})
	})
};

exports.enviarNotificacion = (req, res) => {

	// The topic name can be optionally prefixed with "/topics/".

  if (enPausa==1)
  {
    res.redirect('/mostrarError?numError=0');
    return;
  }
	evento = sesion.idEvento;
	var topic = evento + "-votar";

	// See documentation on defining a message payload.


	var message = {
  	data: {
			topic: 'votar',
    	titulo: '¡No dejes de votar!',
    	descripcion: 'Revisá la lista y votá tu próximo tema'
  	},
  	topic: topic,
		//ttl: 1000
	};

/*
	var message = {
  android: {
    ttl: 0, // 1 hour in milliseconds
    priority: 'normal',
    notification: {
      title: '¡No dejes de votar!',
      body: 'Revisá la lista y votá tu próximo tema',
    }
  },
  topic: topic
};
*/

// Send a message to devices subscribed to the provided topic.
	admin.messaging().send(message)
  	.then((response) => {
    // Response is a message ID string.
			res.redirect('..');
  	})
  	.catch((error) => {
			res.redirect('/mostrarError?numError=1');
  	});
}

exports.mostrarError = (req, res) => {
    //console.log("<"+errores[req.query.numError]);
    res.render(dirVistas + '/error.ejs',{descripcionError : errores[req.query.numError]});
};


exports.reconocerEvento = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
  var latitud = parseFloat(req.query.latitud);
  var longitud = parseFloat(req.query.longitud);
  var maxLatitud = latitud + 0.005;
  var minLatitud = latitud - 0.005;
  var maxLongitud = longitud + 0.005;
  var minLongitud = longitud - 0.005;
  Evento.find({latitud:{$gt:minLatitud,$lt:maxLatitud},longitud:{$gt:minLongitud,$lt:maxLongitud}}).exec(function(err, eventos) {
    if(err) res.send(500, err.message);
    res.status(200).jsonp(eventos);
  });
};

exports.eventosCercanos = (req, res) => {
	sesion = req.session;
	evento = sesion.idEvento;
  var latitud = parseFloat(req.query.latitud);
  var longitud = parseFloat(req.query.longitud);
  var maxLatitud = latitud + 0.05;
  var minLatitud = latitud - 0.05;
  var maxLongitud = longitud + 0.05;
  var minLongitud = longitud - 0.05;
  Evento.find({latitud:{$gt:minLatitud,$lt:maxLatitud},longitud:{$gt:minLongitud,$lt:maxLongitud}}).exec(function(err, eventos) {
    if(err) res.send(500, err.message);
    res.status(200).jsonp(eventos);
  });
};
