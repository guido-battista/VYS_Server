const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const CancionCtrl = require('./controllers/CancionCtrl.js');
const queryString = require('querystring');

//Seteo de sesion
const session = require('express-session');
app.use(session({ secret: 'secreto',
                  resave: true,
                  saveUninitialized: true}));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(bodyParser.json());
//app.use(methodOverride());

const MongoClient = require('mongodb').MongoClient;

var db;

var port = process.env.PORT || 3000;

var conString;

if (port == 3000)
{
  //Dessarrollo
  var conString = 'mongodb://you_dj_desa:you_dj_desa_01@ds123822.mlab.com:23822/you_dj_desa'
}
else
{
  //Produccion
  var conString = 'mongodb://vys_client:vys_client@ds255889.mlab.com:55889/vys_db'
}

app.use(express.static(__dirname + '/Images'));


//mongoose.connect('mongodb://vys_client:vys_client@ds255889.mlab.com:55889/vys_db', function(err, res) {
mongoose.connect(conString, function(err, res) {
  if(err) {
    console.log('ERROR: connecting to Database. ' + err);
  }
  app.listen(port, function() {
    console.log("Node server running on " + port);
  });
});

app.get('/',CancionCtrl.mostrarHome);

app.post('/cancion', CancionCtrl.addCancion);

app.get('/canciones', CancionCtrl.obtenerCanciones);

app.get('/quitar',CancionCtrl.quitarCancion);

app.get('/quitarTodo',CancionCtrl.quitarTodo);

app.get('/quitarTodoEscuchado',CancionCtrl.quitarTodoEscuchado);

app.get('/elegir',CancionCtrl.elegirCancion);

app.post('/sumarVoto',CancionCtrl.sumarVoto);

app.post('/restarVoto',CancionCtrl.restarVoto);

app.get('/sonando',CancionCtrl.cancionSonando);

app.post('/terminarCancionSonando',CancionCtrl.terminarCancionSonando);

app.get('/evento',CancionCtrl.obtenerEvento);

app.post('/cargarEvento',CancionCtrl.cargarEvento);

app.get('/download', function(req, res){
  var file = __dirname + '/Download/com.companyname.YouDJ.v0.0.apk';
  res.download(file); // Set disposition and send it.
});

app.get('/download2', function(req, res){
  var file = __dirname + '/Download/com.companyname.YouDJ.v0.1.apk';
  res.download(file); // Set disposition and send it.
});

app.get('/login',CancionCtrl.login);

app.post('/login',CancionCtrl.intentLogin);

app.post('/logout',CancionCtrl.logout);

app.post('/cargarArchivos',CancionCtrl.cargarArchivos);

app.get('/ponerVotar',CancionCtrl.ponerVotar);

app.get('/ponerVotarTodo',CancionCtrl.ponerVotarTodo);

app.get('/quitarVotar',CancionCtrl.quitarVotar);

app.get('/quitarVotarTodo',CancionCtrl.quitarVotarTodo);

app.get('/prueba',CancionCtrl.prueba);

app.post('/pausar',CancionCtrl.pausar);

app.post('/reanudar',CancionCtrl.reaundar);

app.post('/enviarNotificacion',CancionCtrl.enviarNotificacion);

app.get('/mostrarError',CancionCtrl.mostrarError);

app.get('/reconocerEvento',CancionCtrl.reconocerEvento);

app.get('/eventosCercanos',CancionCtrl.eventosCercanos);

//app.get('/sonandoAhora',CancionCtrl.obtenerSonandoAhora);
