'use strict';

var path = require('path');
var express = require('express');

module.exports = function(ops) {
  var app = express();

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  var routes = require('./routes')(app);

  // uploader
  var options = {
    tmpDir: __dirname + '/../../repos/local/.epm/tmp',
    uploadDir: __dirname + '/../../repos/local',
    uploadUrl: '/uploaded/files/',
    storage: {
      type: 'local'
    }
  };

  var uploader = require('blueimp-file-upload-expressjs')(options);

  app.get('/upload', function(req, res) {
    uploader.get(req, res, function(obj) {
      res.send(JSON.stringify(obj));
    });
  });
 
  app.post('/upload', function(req, res) {
    uploader.post(req, res, function(obj) {
      res.send(JSON.stringify(obj));
    });
  });
 
  app.delete('/uploaded/files/:name', function(req, res) {
    uploader.delete(req, res, function(obj) {
      res.send(JSON.stringify(obj));
    });
  });

  return app;
};