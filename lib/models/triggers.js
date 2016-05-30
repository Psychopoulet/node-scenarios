
"use strict";

// private

	var _sSelectQuery = "SELECT triggers.id, triggers.code, triggers.name FROM triggers";

// module

module.exports = class DBTriggers extends require(require("path").join(__dirname, "_abstract.js")) {

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY triggers.id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBTriggers.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

				if (data) {

					if (data.scenario && data.scenario.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_scenario = :id_scenario";
						options[":id_scenario"] = data.scenario.id;

					}

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND triggers.id = :id";
						options[":id"] = data.id;
					}
					if (data.name) {
						query += " AND triggers.name = :name";
						options[":name"] = data.name;
					}

					if (data.scenario && !data.scenario.id) {
						query += " AND 1 = 0";
					}
					
				}

				that.db.all(query + " ORDER BY triggers.name ASC;", options, function(err, rows) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(trigger, i) {
							rows[i] = DBTriggers.formate(trigger);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				}
				else if (!trigger.code) {
					reject("There is no code.");
				}
				else if (!trigger.name) {
					reject("There is no name.");
				}
				else {

					that.db.run("INSERT INTO triggers (code, name) VALUES (:code, :name);", {
						":code": trigger.code,
						":name": trigger.name
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

		edit (trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				}
					else if (!trigger.id) {
						reject("The trigger is not valid.");
					}
				else if (!trigger.code) {
					reject("There is no code.");
				}
				else if (!trigger.name) {
					reject("There is no name.");
				}
				else {

					that.db.run("UPDATE triggers SET code = :code, name = :name WHERE id = :id;", {
						":id": trigger.id,
						":code": trigger.code,
						":name": trigger.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(trigger);
						}

					});

				}

			});

		}

		delete (trigger) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject("There is no data.");
				}
					else if (!trigger.id) {
						reject("The trigger is not valid.");
					}
				else {

					that.db.run("DELETE FROM triggers WHERE id = :id;", { ":id" : trigger.id }, function(err) {

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

		linkToScenario (scenario, trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject("There is no scenario data.");
				}
					else if (!scenario.id) {
						reject("There is no valid scenario data.");
					}
				else if (!trigger) {
					reject("There is no trigger data.");
				}
					else if (!trigger.id) {
						reject("There is no valid trigger data.");
					}
				else {

					that.db.run("INSERT INTO scenariostriggers (id_scenario, id_trigger) VALUES (:id_scenario, :id_trigger);", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, function(err) {

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

		unlinkToScenario (scenario, trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject("There is no scenario data.");
				}
					else if (!scenario.id) {
						reject("There is no valid scenario data.");
					}
				else if (!trigger) {
					reject("There is no trigger data.");
				}
					else if (!trigger.id) {
						reject("There is no valid trigger data.");
					}
				else {

					that.db.run("DELETE FROM scenariostriggers WHERE id_scenario = :id_scenario AND id_trigger = :id_trigger;", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, function(err) {

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

};
