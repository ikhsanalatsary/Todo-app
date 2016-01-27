'use strict';

var Sequelize = require('sequelize'),
	sequelize = new Sequelize('undefined', 'undefined', 'undefined', {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/todo-api-database.sqlite'
	});

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
