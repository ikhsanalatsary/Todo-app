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
user(app, db);
todo(app, middleware, db);
// app.use('/users', user(app));
// app.use('/todos', todo(app));

// app.use(middleware.logger);

app.get('/about', middleware.requireAuthentication, function (req, res) {
	res.send('About Us');
});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync().then(function () {
	app.listen(PORT, function (error) {
		if (error) {
			throw error
		};
		console.log('Server running on port ' + PORT + '!');
	});
});