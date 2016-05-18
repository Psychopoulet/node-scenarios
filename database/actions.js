
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" actions.id," +
		" actions.name," +
		" actions.params," +

		" actionstypes.id AS actiontype_id," +
		" actionstypes.name AS actiontype_name" +

	" FROM actions" +
		" INNER JOIN actionstypes ON actionstypes.id = actions.id_type";

	var _tabExecuters = {};

// module

module.exports = class DBActions extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(action) {

			action.type = {
				id : action.actiontype_id,
				name : action.actiontype_name
			};

				delete action.actiontype_id;
				delete action.actiontype_name;

			try {
				action.params = ('string' === typeof action.params && '' != action.params) ? JSON.parse(action.params) : null;
			}
			catch(e) {
				action.params = null;
			}
			

			return action;

		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY actions.id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBActions.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

				if (data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND actions.id = :id";
						options[':id'] = data.id;
					}
					if (data.name) {
						query += " AND actions.name = :name";
						options[':name'] = data.name;
					}

					if (data.type) {

						if (data.type.id) {
							query += " AND actionstypes.id = :actiontype_id";
							options[':actiontype_id'] = data.type.id;
						}
						if (data.type.name) {
							query += " AND actionstypes.name = :actiontype_name";
							options[':actiontype_name'] = data.type.name;
						}
						
					}
					
				}

				that.db.all(query + " ORDER BY actionstypes.name ASC, actions.name ASC;", options, function(err, rows) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(action, i) {
							rows[i] = DBActions.formate(action);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (action) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!action) {
					reject('There is no data.');
				}
				else if (!action.type) {
					reject('There is no action type.');
				}
					else if (!action.type.id) {
						reject('The action type is not valid.');
					}
				else if (!action.name) {
					reject('There is no name.');
				}
				else {

					if (!action.params) {
						action.params = '';
					}
					else if ('object' === typeof action.params) {

						try {
							action.params = JSON.stringify(action.params);
						}
						catch(e) {
							action.params = '';
						}

					}

					that.db.run("INSERT INTO actions (id_type, name, params) VALUES (:id_type, :name, :params);", {
						':id_type': action.type.id,
						':name': action.name,
						':params': action.params
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.lastInserted().then(resolve).catch(reject);
						}

					});

				}

			});

		}

		edit (action) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!action) {
					reject('There is no data.');
				}
					else if (!action.id) {
						reject('The action is not valid.');
					}
				else if (!action.type) {
					reject('There is no action type.');
				}
					else if (!action.type.id) {
						reject('The action type is not valid.');
					}
				else if (!action.name) {
					reject('There is no name.');
				}
				else {

					if (!action.params) {
						action.params = '';
					}
					else if ('object' === typeof action.params) {

						try {
							action.params = JSON.stringify(action.params);
						}
						catch(e) {
							action.params = '';
						}

					}

					that.db.run("UPDATE actions SET id_type = :id_type, name = :name, params = :params WHERE id = :id;", {
						':id': action.id,
						':id_type': action.type.id,
						':name': action.name,
						':params': action.params
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(action);
						}

					});

				}

			});

		}

		delete (action) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!action) {
					reject('There is no data.');
				}
					else if (!action.id) {
						reject('The action is not valid.');
					}
				else {

					that.db.run("DELETE FROM actions WHERE id = :id;", { ':id' : action.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				}

			});

		}

	// execute

		bindExecuter(actiontype, executer) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!actiontype) {
					reject("There is no action type.");
				}
					else if (!actiontype.id || !actiontype.code) {
						reject("The action type is incorrect.");
					}
				else if ('function' !== typeof executer) {
					reject("The executer is not a function.");
				}
				else {
					_tabExecuters[actiontype.code] = executer;
					resolve();
				}

			});

		}

		execute(action) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!action) {
					reject('There is no data.');
				}
				else if (!action.type) {
					reject('There is no action type.');
				}
					else if (!action.type.id || !actiontype.code) {
						reject('The action type is not valid.');
					}
				else {

					if (!_tabExecuters[action.type.code]) {
						resolve();
					}
					else {

						try {
							_tabExecuters[action.type.code](action);
							resolve();
						}
						catch(e) {
							reject((e.message) ? e.message : e);
						}

					}

				}

			});

		}

};
