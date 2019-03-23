'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var cors = require('cors');
var app = express();
var url = require('url');
var dns = require('dns');

// Basic Configuration
var port = process.env.PORT || 3000;

dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI);
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  short_url: Number,
  original_url: String
});

var UrlModel = mongoose.model('Url', urlSchema);

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/shorturl/:id', function(req, res) {
  UrlModel.findOne({ short_url: req.params.id }, function(err, data) {
    if (!data) {
      return res.json({ error: 'invalid URL' });
    }
    res.redirect(data.original_url);
  });
});

app.post('/api/shorturl/new', function(req, res) {
  const original_url = req.body.url;
  const postedUrl = url.parse(original_url);
  let short_url = 1;
  dns.lookup(postedUrl.hostname, err => {
    if (err) {
      return res.json({ error: 'invalid URL' });
    }
    UrlModel.findOne()
      .sort({ short_url: 'desc' })
      .exec(function(err, data) {
        if (data) {
          short_url = data.short_url + 1;
        }
        const savedUrl = new UrlModel({ short_url, original_url });
        savedUrl.save().then(() => res.json({ original_url, short_url }));
      });
  });
});

app.listen(port, function() {
  console.log('Node.js listening ...');
});
