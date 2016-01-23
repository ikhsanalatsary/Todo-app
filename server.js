var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware');
var todos = [];
var todoNextId = 1; //increment unique id

app.use(bodyParser.json());

// GET /todos?completed=true&q=work
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function (todo) {
			// console.log(todo);
			return todo['description'].toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; // > -1 will return empty array if false 
		});
	};

	res.json(filteredTodos);
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

// DELETE /todos/:id
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

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	// Strict only allow for expected key
	var body = _.pick(req.body, 'description', 'completed');
	// store key is valid to this object
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		// Change by reference
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;

		// Reference, remove bounce of space poor finger
		validAttributes.description = validAttributes.description.trim();
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	//update todo use extend method
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
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