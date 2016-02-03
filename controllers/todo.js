'use strict';

// var db = require('../db');
// var middleware = require('../middleware')(db);
var _ = require('underscore');

module.exports = function(app, middleware, db) {
	// GET /todos?completed=true&q=work
	app.get('/todos', middleware.requireAuthentication, function(req, res) {
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
	app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
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
	app.post('/todos', middleware.requireAuthentication, function (req, res) {
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
	app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
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
	app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
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
};