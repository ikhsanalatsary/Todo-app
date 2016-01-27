'use strict';
module.exports = function (sequelize, dataTypes) {
	// body...
	return sequelize.define('todo', {
		description: {
			type: dataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}
		},
		completed: {
			type: dataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
}