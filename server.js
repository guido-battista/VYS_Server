const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const CancionCtrl = require('./controllers/CancionCtrl.js');
const queryString = require('querystring');

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

//app.get('/sonandoAhora',CancionCtrl.obtenerSonandoAhora);
