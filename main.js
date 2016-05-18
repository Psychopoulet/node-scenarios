
"use strict";

// deps

	const 	path = require('path'),
			fs = require('fs'),

			SimpleContainer = require('simplecontainer'),
			sqlite3 = require('sqlite3'),

			Triggers = require(path.join(__dirname, 'database', 'triggers.js')),
			TriggersTypes = require(path.join(__dirname, 'database', 'triggerstypes.js')),
			Actions = require(path.join(__dirname, 'database', 'actions.js')),
			ActionsTypes = require(path.join(__dirname, 'database', 'actionstypes.js'));

// private

	var _db = null, _container = null;

	function _createDatabase() {

		return new Promise(function(resolve, reject) {

			let db = null,
				dbFile = path.join(__dirname, 'database', 'database.sqlite3'),
				createFile = path.join(__dirname, 'database', 'create.sql');

			fs.stat(dbFile, function(err, stats) {

				if (!err && stats && stats.isFile()) {
					db = new sqlite3.Database(dbFile);
					db.serialize(function() { resolve(db); });
				}
				else {

					fs.stat(createFile, function(err, stats) {

						if (err || !stats || !stats.isFile()) {
							reject("There is no '" + createFile + "' file.");
						}
						else {

							fs.readFile(createFile, { 'encoding': 'utf8', 'flag': 'r' }, function(err, sql) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {

									db = new sqlite3.Database(dbFile);

									db.serialize(function() {

										let queries = [];

										sql.split(';').forEach(function(query) {

											query = query.trim()
														.replace(/--(.*)\s/g, "")
														.replace(/\s/g, " ")
														.replace(/  /g, " ");

											if ('' != query) {
												queries.push(query + ';');
											}

										});

										function executeQueries(i) {

											if (i >= queries.length) {
												resolve(db);
											}
											else {

												db.run(queries[i], [], function(err) {

													if (err) {
														reject((err.message) ? err.message : err);
													}
													else {
														executeQueries(i + 1);
													}

												});

											}

										}

										executeQueries(0);
							
									});

								}

							});

						}

					});

				}

			});

		});

	}

// module

module.exports = class SimpleScenarios {

	static init() {

		return new Promise(function(resolve, reject) {

			if (_db && _container) {
				resolve(_container);
			}
			else {

				if (_container) {
					_container.clear();
				}
				else {
					_container = new SimpleContainer();
				}

				if (_db) {

					resolve(
						_container	.set('triggers', new Triggers(db))
									.set('triggerstypes', new TriggersTypes(db))
									.set('actions', new Actions(db))
									.set('actionstypes', new ActionsTypes(db))
					);

				}
				else {
				
					_createDatabase().then(function(db) {

						_db = db;

						resolve(
							_container	.set('triggers', new Triggers(db))
										.set('triggerstypes', new TriggersTypes(db))
										.set('actions', new Actions(db))
										.set('actionstypes', new ActionsTypes(db))
						);
				
					});
					
				}
				
			}

		});

	}

	static release() {

		return new Promise(function(resolve, reject) {

			if (_db) {

				_db.close(function() {
					_db = null; resolve();
				});

			}
			else {
				resolve();
			}

		});

	}

};
