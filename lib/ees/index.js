'use strict';

var express = require('express');

module.exports = function(ops) {
	var app = express();

	app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');

	var routes = require('./routes.js')(app);

	var epmApp = ops.epm;
  app.cacheIndex = {};

	return app;
};