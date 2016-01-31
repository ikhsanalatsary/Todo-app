'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var db = require('./db');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware');
var todos = [];
var todoNextId = 1; //increment unique id


app.use(bodyParser.json());

// GET /todos?completed=true&q=work
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	};

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		var like = '%' + query.q.toLowerCase() + '%';
		where.description = {
			$like: like
		};
	};

	db.todo.findAll({where: where}).then(function (todos) {
		if (todos) {
			res.json(todos);
		} else{
			res.status(404).send();
		};
	}, function (e) {
		res.status(500).send();
	});
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId)
		.then(function (todo) {
			if (todo) {
				res.json(todo);
			} else {
				res.status(404).send();
			}
		},
			function (e) {
				res.status(500).send(e);
			})
				.catch(function (e) {
					res.send(e);
				});

});

// POST /todos
app.post('/todos', function (req, res) {
	// Strict only allow for expected key
	var body = _.pick(req.body, 'description', 'completed');

	// Check validate data types
	if (!_.isString(body.description) || !_.isBoolean(body.completed) || body.description.trim().length === 0) {
		return res.status(400).send();
	};

	// Reference, remove bounce of space poor finger
	body.description = body.description.trim();

	db.todo.create({
		description: body.description,
		completed: body.completed
	})
		.then(function (todo) {
			res.json(todo);
		}, 
			function (e) {
				res.status(400).json(e);
			})
				.catch(function (e) {
					res.send(e);
				});

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	})
	.then(function (rowsDeleted) {
		if (!rowsDeleted) {
			res.status(404).json({
				"error": "No data found from id = " + todoId
			});
		}else{
			res.status(204).send();
		};
	},
	function (e) {
		res.status(500).send();
	});
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	// Strict only allow for expected key
	var body = _.pick(req.body, 'description', 'completed');
	// store key is valid to this object
	var attributes = {};


	if (body.hasOwnProperty('completed')) {
		// Change by reference
		attributes.completed = body.completed;
	};

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;

		// Reference, remove bounce of space poor finger
		attributes.description = attributes.description.trim();
	};

	db.todo.findById(todoId)
		.then(function (todo) {
			if (todo) {
				todo.update(attributes)
					.then(function (todo) {
						res.json(todo);
					},
					function (e) {
						res.status(400).json(e);
					});
			} else{
				res.status(404).send();
			};
		},
		function (e) {
			res.status(500).send();
		});
});

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
	// var attributes = {};

	if (typeof body.email !== 'string' || typeof body.password !== 'string') {
		return res.status(400).send();
	};
	
	db.user.findOne({
		where: {
			email: body.email
		}
	}).then(function(user) {
		// check if email not exist,
		// and Load hash from your password DB is not match. then send response status 401
		// othewise, hanging response if email not exist
		if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
			return res.status(401).send();
		};

		// match & success
		res.json(user.toPublicJSON());
	},
	function (e) {
		res.status(500).send();
	});
});


app.use(middleware.logger);

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