'use strict';

var Sequelize = require('sequelize'),
	env = process.env.NODE_ENV || 'development',
	sequelize;

	if (env === 'production') {
		sequelize = new Sequelize(process.env.DATABASE_URL, {
			'dialect': 'postgres'
		});
	} else{
		sequelize = new Sequelize('undefined', 'undefined', 'undefined', {
			'dialect': 'sqlite',
			'storage': __dirname + '/data/todo-api-database.sqlite'
		});
	};

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
