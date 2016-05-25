
"use strict";

// deps

	const 	path = require('path'),
			fs = require('fs'),

			SimpleContainer = require('simplecontainer'),
			sqlite3 = require('sqlite3'),

			Triggers = require(path.join(__dirname, 'database', 'triggers.js')),
			Scenarios = require(path.join(__dirname, 'database', 'scenarios.js')),
			Actions = require(path.join(__dirname, 'database', 'actions.js')),
			ActionsTypes = require(path.join(__dirname, 'database', 'actionstypes.js')),
			ConditionsTypes = require(path.join(__dirname, 'database', 'conditionstypes.js'));

// private

	var _db = null, _container = null, _dbFile = path.join(__dirname, 'database', 'database.sqlite3');

	function _createDatabase() {

		return new Promise(function(resolve, reject) {

			let db = null,
				createFile = path.join(__dirname, 'database', 'create.sql');

			fs.stat(_dbFile, function(err, stats) {

				if (!err && stats && stats.isFile()) {
					db = new sqlite3.Database(_dbFile);
					db.serialize(function() { resolve(db); });
				}
				else {

					fs.stat(createFile, function(err, stats) {

						if (err || !stats || !stats.isFile()) {
							reject("There is no '" + createFile + "' file.");
						}
						else {

							fs.readFile(createFile, { 'encoding': 'utf8', 'flag': 'r' }, function(err, sqlfile) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {

									db = new sqlite3.Database(_dbFile);

									db.serialize(function() {

										let sql = '', queries = [];

										sqlfile.replace(/\r/g, "\n").replace(/\n\n/g, "\n").split("\n").forEach(function(query) {

											if (query) {

												query  = query.trim();

												if ('' != query && 0 > query.indexOf('--')) {
													sql += query;
												}

											}

										});

										sqlfile = null;

										sql.split(';').forEach(function(query) {

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
									.set('scenarios', new Scenarios(db))
									.set('actions', new Actions(db))
									.set('actionstypes', new ActionsTypes(db))
									.set('conditionstypes', new ConditionsTypes(db))
					);

				}
				else {
				
					_createDatabase().then(function(db) {

						_db = db;

						db.run("PRAGMA foreign_keys = ON;", [], function(err) {

							if (err) {
								SimpleScenarios.delete().then(function() { reject(err.message); }).catch(function() { reject(err.message); });
							}
							else {

								resolve(
									_container	.set('triggers', new Triggers(db))
												.set('scenarios', new Scenarios(db))
												.set('actions', new Actions(db))
												.set('actionstypes', new ActionsTypes(db))
												.set('conditionstypes', new ConditionsTypes(db))
								);

							}

						});

					}).catch(function(err) {
						SimpleScenarios.delete().then(function() { reject(err); }).catch(function() { reject(err); });
					});
					
				}
				
			}

		});

	}

	static release() {

		return new Promise(function(resolve, reject) {

			if (_db) {

				_db.close(function(err) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						_db = null;
						resolve();
					}

				});

			}
			else {
				resolve();
			}

		});

	}

	static delete() {

		return new Promise(function(resolve, reject) {

			fs.stat(_dbFile, function(err, stats) {

				if (!(!err && stats && stats.isFile())) {
					resolve();
				}
				else {

					SimpleScenarios.release().then(function() {

						fs.unlink(_dbFile, function(err) {

							if (err) {
								reject((err.message) ? err.message : err);
							}
							else {
								resolve();
							}

						});

					}).catch(reject);

				}
				
			});

		});

	}

};
