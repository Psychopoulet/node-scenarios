
"use strict";

// private

	// attrs

		var _sSelectQuery = "SELECT triggers.id, triggers.code, triggers.name FROM triggers";

	// methods

		function _executeScenario(that, scenarios, i, data) {

			if (i >= scenarios.length) {
				return Promise.resolve();
			}
			else {

				return that.container.get("scenarios").execute(scenarios[i], data).then(function() {

					if (i < scenarios.length) {
						return _executeScenario(that, scenarios, i+1, data);
					}
					else {
						return Promise.resolve();
					}

				});

			}

		}

// module

module.exports = class DBTriggers extends require(require("path").join(__dirname, "_abstract.js")) {

	// read

		last() {

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

			let that = this;
			return new Promise(function(resolve, reject) {

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

			if (!trigger) {
				return Promise.reject("There is no data.");
			}
			else if (!trigger.code) {
				return Promise.reject("There is no code.");
			}
			else if (!trigger.name) {
				return Promise.reject("There is no name.");
			}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("INSERT INTO triggers (code, name) VALUES (:code, :name);", {
						":code": trigger.code,
						":name": trigger.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.last().then(resolve).catch(reject);
						}

					});

				});

			}

		}

		edit (trigger) {

			if (!trigger) {
				return Promise.reject("There is no data.");
			}
				else if (!trigger.id) {
					return Promise.reject("The trigger is not valid.");
				}
			else if (!trigger.code) {
				return Promise.reject("There is no code.");
			}
			else if (!trigger.name) {
				return Promise.reject("There is no name.");
			}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

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

				});

			}

		}

		delete (trigger) {
			
			if (!trigger) {
				return Promise.reject("There is no data.");
			}
				else if (!trigger.id) {
					return Promise.reject("The trigger is not valid.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("DELETE FROM triggers WHERE id = :id;", { ":id" : trigger.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve();
						}

					});

				});

			}

		}

		linkToScenario (scenario, trigger) {

			if (!scenario) {
				return Promise.reject("There is no scenario data.");
			}
				else if (!scenario.id) {
					return Promise.reject("There is no valid scenario data.");
				}
			else if (!trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if (!trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

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

				});

			}

		}

		unlinkToScenario (scenario, trigger) {

			if (!scenario) {
				return Promise.reject("There is no scenario data.");
			}
				else if (!scenario.id) {
					return Promise.reject("There is no valid scenario data.");
				}
			else if (!trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if (!trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

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

				});

			}

		}

	// execute

		execute (trigger, data) {

			if (!trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if (!trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				let that = this;
				this.container.get("scenarios").search({ trigger: trigger }).then(function(scenarios) {

					if (0 >= scenarios.length) {
						return Promise.resolve();
					}
					else {
						return _executeScenario(that, scenarios, 0, data);
					}

				});

			}

		}

};
