'use strict';

// var db = require('../db');
// var middleware = require('../middleware')(db);
var _ = require('underscore');

module.exports = function (app, db) {
	// POST /users
	app.post('/users', function (req, res) {
		var body = _.pick(req.body, 'email', 'password');

		db.user.create(body)
			.then(function (user) {
				res.json(user.toPublicJSON());
			},
			function (e) {
				res.status(400).json(e);
			});
	});

	// POST /users/login
	app.post('/users/login', function (req, res) {
		var body = _.pick(req.body, 'email', 'password');

		db.user.authentication(body).then(function (user) {
			var userToken = user.generateToken('authentication');

			if (userToken) {
				// res.header('Auth', userToken).json(user.toPublicJSON());
				res.header('Auth', userToken).send({
					token: userToken,
					user: user.toPublicJSON()
				});
			} else {
				res.status(401).send();
			};
		},
		function (e) {
			res.status(401).send();
		});

	});
}