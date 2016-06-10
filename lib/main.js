
"use strict";

// deps

	const 	path = require("path"),
			fs = require("fs"),

			SimpleContainer = require("simplecontainer"),
			sqlite3 = require("sqlite3"),

			Junctions = require(path.join(__dirname, "models", "junctions.js")),
			Triggers = require(path.join(__dirname, "models", "triggers.js")),
			Scenarios = require(path.join(__dirname, "models", "scenarios.js")),
			Actions = require(path.join(__dirname, "models", "actions.js")),
			ActionsTypes = require(path.join(__dirname, "models", "actionstypes.js")),
			ConditionsTypes = require(path.join(__dirname, "models", "conditionstypes.js")),
			Conditions = require(path.join(__dirname, "models", "conditions.js"));

// private

	var _db = null, _container = null, _dbFile = path.join(__dirname, "database.sqlite3");

	function _createDatabase() {

		return new Promise(function(resolve, reject) {

			let db = null,
				createFile = path.join(__dirname, "create.sql");

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

							fs.readFile(createFile, { "encoding": "utf8", "flag": "r" }, function(err, sqlfile) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {

									db = new sqlite3.Database(_dbFile);

									db.serialize(function() {

										let sql = "", queries = [];

										sqlfile.replace(/\r/g, "\n").replace(/\n\n/g, "\n").split("\n").forEach(function(query) {

											if (query) {

												query  = query.trim();

												if ("" !== query && 0 > query.indexOf("--")) {
													sql += query;
												}

											}

										});

										sqlfile = null;

										sql.split(";").forEach(function(query) {

											if ("" !== query) {
												queries.push(query + ";");
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
						_container	.set("db", _db)
									.set("junctions", new Junctions(_container))
									.set("triggers", new Triggers(_container))
									.set("scenarios", new Scenarios(_container))
									.set("actions", new Actions(_container))
									.set("actionstypes", new ActionsTypes(_container))
									.set("conditionstypes", new ConditionsTypes(_container))
									.set("conditions", new Conditions(_container))
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
									_container	.set("db", _db)
												.set("junctions", new Junctions(_container))
												.set("triggers", new Triggers(_container))
												.set("scenarios", new Scenarios(_container))
												.set("actions", new Actions(_container))
												.set("actionstypes", new ActionsTypes(_container))
												.set("conditionstypes", new ConditionsTypes(_container))
												.set("conditions", new Conditions(_container))
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
