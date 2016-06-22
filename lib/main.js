
"use strict";

// deps

	const 	path = require("path"),
			fs = require("fs");

// private

	class DBAbstract {

		constructor (container) {
			this.container = container;
			this.db = container.get("db");
		}

		// formate data

			undefinedMethod(method) {
				return Promise.reject("There is no \"" + method + "\" method defined for \"" + this.constructor.name + "\" class");
			}

			static formate(data) {
				return data;
			}

		// read

			searchOne(data) {

				return this.search(data).then(function(data) {
					return Promise.resolve((data && data.length) ? data[0] : null);
				});

			}

			last() { return this.undefinedMethod("last"); }
			search() { return this.undefinedMethod("search"); }

		// write

			add() { return this.undefinedMethod("add"); }
			edit() { return this.undefinedMethod("edit"); }
			delete() { return this.undefinedMethod("delete"); }

	}

// private

	var _db = null, _container = null, _models = path.join(__dirname, "models"), _dbFile = "";

	function _createDatabase(file) {

		_dbFile = ("string" === typeof file) ? file : path.join(__dirname, "database.sqlite3");

		return new Promise(function(resolve, reject) {

			let db = null,
				createFile = path.join(__dirname, "create.sql");

			fs.stat(_dbFile, function(err, stats) {

				if (!err && stats && stats.isFile()) {
					db = new (require("sqlite3")).Database(_dbFile);
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

									db = new (require("sqlite3")).Database(_dbFile);

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

	static get abstract() {
		return DBAbstract;
	}

	static init(dir) {

		if (_db && _container) {
			return Promise.resolve(_container);
		}
		else {

			if (_container) {
				_container.clear();
			}
			else {
				_container = new (require("node-containerpattern"))();
			}

			if (_db) {

				return Promise.resolve(

					_container	.set("db", _db)
								.set("junctions", new (require(path.join(_models, "junctions.js")))(_container))
								.set("triggers", new (require(path.join(_models, "triggers.js")))(_container))
								.set("scenarios", new (require(path.join(_models, "scenarios.js")))(_container))
								.set("actions", new (require(path.join(_models, "actions.js")))(_container))
								.set("actionstypes", new (require(path.join(_models, "actionstypes.js")))(_container))
								.set("conditionstypes", new (require(path.join(_models, "conditionstypes.js")))(_container))
								.set("conditions", new (require(path.join(_models, "conditions.js")))(_container))

				);

			}
			else {
				
				return new Promise(function(resolve, reject) {

					_createDatabase(dir).then(function(db) {

						_db = db;

						db.run("PRAGMA foreign_keys = ON;", [], function(err) {

							if (err) {
								SimpleScenarios.delete().then(function() { reject(err.message); }).catch(function() { reject(err.message); });
							}
							else {

								resolve(

									_container	.set("db", _db)
												.set("junctions", new (require(path.join(_models, "junctions.js")))(_container))
												.set("triggers", new (require(path.join(_models, "triggers.js")))(_container))
												.set("scenarios", new (require(path.join(_models, "scenarios.js")))(_container))
												.set("actions", new (require(path.join(_models, "actions.js")))(_container))
												.set("actionstypes", new (require(path.join(_models, "actionstypes.js")))(_container))
												.set("conditionstypes", new (require(path.join(_models, "conditionstypes.js")))(_container))
												.set("conditions", new (require(path.join(_models, "conditions.js")))(_container))

								);

							}

						});

					}).catch(function(err) {
						SimpleScenarios.delete().then(function() { reject(err); }).catch(function() { reject(err); });
					});
					
				});
				
			}

		}

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
