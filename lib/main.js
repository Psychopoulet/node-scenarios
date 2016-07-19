
"use strict";

// deps

	const 	path = require("path"),
			fs = require("fs"),
			sqlite3 = require("sqlite3").verbose();

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

				return this.search(data).then((data) => {
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

	function _addExecFunctions(db) {

		db.begin = (callback) => {
			db.run("BEGIN TRANSACTION;", callback);
		};

		db.commit = (callback) => {
			db.run("COMMIT TRANSACTION;", callback);
		};

		db.rollback = (callback) => {
			db.run("ROLLBACK TRANSACTION;", callback);
		};

		db.execTrans = (queries, callback) => {

			db.begin(() => {

				db.exec(queries, (err) => {

					callback = ("function" === typeof callback) ? callback : () => {};

					if (err) {
						
						db.rollback((_err) => {

							if (_err) {

								callback(
									((err.message) ? err.message : err) +
									" | " +
									((_err.message) ? _err.message : _err)
								);

							}
							else {
								callback(err);
							}
							
						});

					}
					else {
						db.commit(callback);
					}

				});

			});

		};

		db.execFileTrans = (file, callback) => {

			fs.stat(file, (err, stats) => {

				callback = ("function" === typeof callback) ? callback : () => {};

				if (err || !stats || !stats.isFile()) {
					callback("There is no '" + file + "' file.");
				}
				else {

					fs.readFile(file, { "encoding": "utf8", "flag": "r" }, (err, sqlfile) => {

						if (err) {
							callback((err.message) ? err.message : err);
						}
						else {

							let sql = "", queries = [];
							sqlfile.replace(/\r/g, "\n").replace(/\n\n/g, "\n").split("\n").forEach((query) => {

								if (query) {

									query  = query.trim();

									if ("" !== query && 0 > query.indexOf("--")) {
										sql += " " + query;
									}

								}

							});

							sqlfile = null;

							sql.split(";").forEach((query) => {

								query  = query.trim();

								if ("" !== query) {
									queries.push(query + ";");
								}

							});

							sqlfile = null;

							db.execTrans(queries.join(" "), callback);

						}

					});

				}

			});


		};

		return db;

	}

	function _createDatabase(file) {

		_dbFile = ("string" === typeof file) ? file : path.join(__dirname, "database.sqlite3");

		return new Promise((resolve, reject) => {

			fs.stat(_dbFile, (err, stats) => {

				if (!err && stats && stats.isFile()) {
					
					new sqlite3.Database(_dbFile, sqlite3.OPEN_READWRITE, function (err) {

						if (err) {
							reject(err);
						}
						else {

							this.serialize((err) => {

								if (err) {
									reject(err);
								}
								else {
									resolve(_addExecFunctions(this));
								}

							});
							
						}

					});

				}
				else {

					new sqlite3.Database(_dbFile, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (err) {

						if (err) {
							reject(err);
						}
						else {

							this.serialize((err) => {

								if (err) {
									reject(err);
								}
								else {

									let db = _addExecFunctions(this);

									db.execFileTrans(path.join(__dirname, "create.sql"), (err) => {

										if (err) {
											reject((err.message) ? err.message : err);
										}
										else {
											resolve(db);
										}

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
				
				return _createDatabase(dir).then((db) => {

					_db = db;

					return new Promise((resolve, reject) => {

						db.run("PRAGMA foreign_keys = ON;", [], (err) => {

							if (err) {

								SimpleScenarios.delete().then(() => {
									reject(err);
								}).catch(() => {
									reject(err);
								});

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

					});
					
				}).catch((err) => {

					return SimpleScenarios.delete().then(() => {
						return Promise.reject(err);
					}).catch(() => {
						return Promise.reject(err);
					});

				});
				
			}

		}

	}

	static release() {

		return new Promise((resolve, reject) => {

			if (_db) {

				_db.close((err) => {

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

		return new Promise((resolve, reject) => {

			fs.stat(_dbFile, (err, stats) => {

				if (!(!err && stats && stats.isFile())) {
					resolve();
				}
				else {

					SimpleScenarios.release().then(() => {

						fs.unlink(_dbFile, (err) => {

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
