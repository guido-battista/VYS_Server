const express = require('express');
const app = express();
const bodyParser= require('body-parser');

app.use(bodyParser.urlencoded({extended: true}))

const MongoClient = require('mongodb').MongoClient;

var db;

MongoClient.connect('mongodb://vys_client:vys_client@ds255889.mlab.com:55889/vys_db', (err, client) => {
  if (err) return console.log(err)
  db = client.db('vys_db') // whatever your database name is
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  // Note: __dirname is directory that contains the JavaScript source code. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})

app.post('/quotes', (req, res) => {
  db.collection('quotes').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})