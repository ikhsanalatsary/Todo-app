var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware');
var todos = [];
var todoNextId = 1; //increment unique id

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res) {
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	// Refactor use underscore
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

});

// POST /todos
app.post('/todos', function (req, res) {
	// Strict only allow for expected key
	var body = _.pick(req.body, 'description', 'completed');

	// Check validate data types
	if (!_.isString(body.description) || !_.isBoolean(body.completed) || body.description.trim().length ===0) {
		return res.status(400).send();
	};

	// Reference, remove bounce of space poor finger
	body.description = body.description.trim();

	// set increment unique id
	body.id = todoNextId++;

	// Push body to todos array
	todos.push(body);

	// send back response to user
	res.json(body);

});

// DELETE /todos/id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	if (!matchedTodo) {
		res.status(404).json({"error": "no value for that id"});
	} else {
		// Remove todo by id & update to todos array
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});

app.use(middleware.logger);

app.get('/about', middleware.requireAuthentication, function (req, res) {
	res.send('About Us');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function (error) {
	if (error) {
		throw error
	};
	console.log('Server running on port ' + PORT + '!');
});