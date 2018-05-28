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


mongoose.connect('mongodb://vys_client:vys_client@ds255889.mlab.com:55889/vys_db', function(err, res) {
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

app.get('/elegir',CancionCtrl.elegirCancion);

app.post('/sumarVoto',CancionCtrl.sumarVoto);

app.post('/restarVoto',CancionCtrl.restarVoto);

app.get('/sonando',CancionCtrl.cancionSonando);

app.post('/terminarCancionSonando',CancionCtrl.terminarCancionSonando);

app.get('/evento',CancionCtrl.obtenerEvento);

app.post('/cargarEvento',CancionCtrl.cargarEvento);

app.get('/download', function(req, res){
  var file = __dirname + '/Download/com.companyname.YouDJ.apk';
  res.download(file); // Set disposition and send it.
});

app.get('/login',CancionCtrl.login);

app.post('/login',CancionCtrl.intentLogin);

app.post('/logout',CancionCtrl.logout);

//app.get('/sonandoAhora',CancionCtrl.obtenerSonandoAhora);
