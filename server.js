'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var db = require('./db');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var user = require('./controllers/user');
var todo = require('./controllers/todo');
var middleware = require('./middleware')(db);

app.set('port', process.env.PORT || 3000);

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

io.on('connection', function () {
	console.log('Todos connected via socket.io!');
});

db.sequelize.sync().then(function () {
	http.listen(app.get('port'), function () {
		console.log('Server running on port :3000!');
	});
});