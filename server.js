var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware');
var todos = [{
	id: 1,
	description: 'Go to school',
	completed: false
}, {
	id: 2, 
	description: 'learn nodejs',
	completed: false
}, {
	id: 3,
	description: 'breakfast',
	completed: true
}];

app.get('/todos', function(req, res) {
	res.json(todos);
});

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