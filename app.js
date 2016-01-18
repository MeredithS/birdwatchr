var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var geocoder = require('geocoder');

// Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.set('view engine', 'ejs')

// db
var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/birdr_app_dev';
MongoClient.connect(mongoUrl, function(err, database) {
  if (err) { throw err; }
  db = database;
  process.on('exit', db.close);
});

// Routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/sightings', function(req,res){
  db.collection('sightings').find({}).limit(3).sort({date:-1}).toArray(function(err,results){
    // console.log(results)
    res.json({sightings: results})
  })
})

app.get('/sightings/new', function(req, res){
  res.render('form');
});

app.post('/sightings', function(req, res){
  var sighting = req.body
  sighting.date = new Date();
  geocoder.geocode(sighting.Location, function(err,result){
    sighting.latLong = result.results[0].geometry.location;
    db.collection('sightings').insert(sighting, function(err, result){
    res.json(result);
    })
  });
});

app.get('/demo', function(req, res){
  res.render('demo');
});

// JSON API routes

// TODO implement updating and delete for API

app.get('/api/sightings', function(req, res){
  db.collection('sightings').find({}).toArray(function(err, results){
    if (err) {
      res.json({status: 500, error: err});
    } else {
      res.json({status: 200, sightings: results});
    }
  })
});

app.post('/api/sightings', function(req, res){
  var sighting = req.body.sighting;
  db.collection('sightings').insert(sighting, function(err, result){
    if (err) {
      res.json({status: 500, error: err})
    } else {
      res.json({status: 200, sightings: result})
    }
  });
});

app.get('/api/sightings/:id', function(req, res){
  var id = req.params.id;
  db.collection('sightings').findOne({_id: ObjectId(id)}, function(err, result){
    // TODO handle errors
    res.json({ sighting: result });
  });
});


app.listen(process.env.PORT || 3000);
