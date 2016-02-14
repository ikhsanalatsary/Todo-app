'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db');
var app = express();
var user = require('./controllers/user');
var todo = require('./controllers/todo');
var middleware = require('./middleware')(db);

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
// app.use(middleware.logger);
user(app, db);
todo(app, middleware, db);
app.get('/me', middleware.requireAuthentication, function (req, res) {
	if (req.user) {
		res.send(req.user);
	}
});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force:true}).then(function () {
	app.listen(PORT, function (error) {
		if (error) {
			throw error
		};
		console.log('Server running on port ' + PORT + '!');
	});
});