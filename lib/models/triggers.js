
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

				return that.container.get("scenarios").execute(scenarios[i], data).then(() => {

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

module.exports = class DBTriggers extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY triggers.id DESC LIMIT 0,1;", [], (err, row) => {
					
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

			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null !== data) {

					if (data.scenario && data.scenario.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_scenario = :id_scenario";
						options[":id_scenario"] = data.scenario.id;

					}

					query += " WHERE 1 = 1";

					if ("undefined" !== typeof data.id) {
						query += " AND triggers.id = :id";
						options[":id"] = data.id;
					}
					else if ("undefined" !== typeof data.code) {
						query += " AND triggers.code = :code";
						options[":code"] = data.code;
					}
					else {

						if ("undefined" !== typeof data.name) {
							query += " AND triggers.name = :name";
							options[":name"] = data.name;
						}

						if ("undefined" !== typeof data.scenario && !data.scenario.id) {
							query += " AND 1 = 0";
						}
					
					}
					
				}

				this.db.all(query + " ORDER BY triggers.name ASC;", options, (err, rows) => {
					
					if (err) {
						reject(err);
					}
					else {

						rows.forEach((trigger, i) => {
							rows[i] = DBTriggers.formate(trigger);
						});

						resolve(rows);

					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
			});

		}

	// write

		add (trigger) {

			if ("undefined" === trigger) {
				return Promise.reject("There is no data.");
			}
			else if ("undefined" === trigger.code) {
				return Promise.reject("There is no code.");
			}
			else if ("undefined" === trigger.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO triggers (code, name) VALUES (:code, :name);", {
						":code": trigger.code,
						":name": trigger.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							this.last().then(resolve).catch(reject);
						}

					});

				});

			}

		}

		edit (trigger) {

			if ("undefined" === trigger) {
				return Promise.reject("There is no data.");
			}
				else if ("undefined" === trigger.id) {
					return Promise.reject("The trigger is not valid.");
				}
			else if ("undefined" === trigger.code) {
				return Promise.reject("There is no code.");
			}
			else if ("undefined" === trigger.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE triggers SET code = :code, name = :name WHERE id = :id;", {
						":id": trigger.id,
						":code": trigger.code,
						":name": trigger.name
					}, (err) => {

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
			
			if ("undefined" === trigger) {
				return Promise.reject("There is no data.");
			}
				else if ("undefined" === trigger.id) {
					return Promise.reject("The trigger is not valid.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM triggers WHERE id = :id;", { ":id" : trigger.id }, (err) => {

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

			if ("undefined" === scenario) {
				return Promise.reject("There is no scenario data.");
			}
				else if ("undefined" === scenario.id) {
					return Promise.reject("There is no valid scenario data.");
				}
			else if ("undefined" === trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if ("undefined" === trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO scenariostriggers (id_scenario, id_trigger) VALUES (:id_scenario, :id_trigger);", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, (err) => {

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

			if ("undefined" === scenario) {
				return Promise.reject("There is no scenario data.");
			}
				else if ("undefined" === scenario.id) {
					return Promise.reject("There is no valid scenario data.");
				}
			else if ("undefined" === trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if ("undefined" === trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM scenariostriggers WHERE id_scenario = :id_scenario AND id_trigger = :id_trigger;", {
						":id_scenario": scenario.id,
						":id_trigger": trigger.id
					}, (err) => {

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

			if ("undefined" === trigger) {
				return Promise.reject("There is no trigger data.");
			}
				else if ("undefined" === trigger.id) {
					return Promise.reject("There is no valid trigger data.");
				}
			else {

				this.container.get("scenarios").search({ trigger: trigger }).then((scenarios) => {

					if (0 >= scenarios.length) {
						return Promise.resolve();
					}
					else {
						return _executeScenario(this, scenarios, 0, data);
					}

				});

			}

		}

};
