'use strict';

var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (val) {
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(val, salt);

				this.setDataValue('password', val); // Remember to set the data value, otherwise it won't be validated
       			this.setDataValue('salt', salt);
       			this.setDataValue('password_hash', hash);
			}
		}
	}, {
		hooks: {
			//strict user.email to lowercase
			beforeValidate: function (user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				};
			}
		},
		classMethods: {
			authentication: function (body) {
				var self = this;
				return new Promise(function (resolve, reject) {
					if (!_.isString(body.email) || !_.isString(body.password)) {
						return reject();
					};

					console.log(self);

					self.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						// check if email not exist,
						// and Load hash from your password DB is not match. then send response status 401
						// othewise, hanging response if email not exist
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						};

						// match & success
						resolve(user);
					},
					function (e) {
						reject();
					});
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			}
		}
	});
}