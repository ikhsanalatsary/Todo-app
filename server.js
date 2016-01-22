var express = require('express');
var bodyParser = require('body-parser');
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
	var matchedTodo;

	todos.forEach(function (todo) {
		if(todoId === todo.id) {
			matchedTodo = todo;
		}
	});

	if(matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

});

// POST /todos
app.post('/todos', function (req, res) {
	var body = req.body;

	body.id = todoNextId++;
	// console.log(body);
	todos.push(body);

	// console.log('description: ' + body.description);
	res.json(body);
	// res.json(todos);
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