
"use strict";

// deps

	const 	path = require('path'),
			Actions = require(path.join(__dirname, 'actions.js'))/*,
			Conditions = require(path.join(__dirname, 'conditions.js'))*/;

// private

	var _sSelectQuery = "" +
	"SELECT" +

		" scenarios.id," +
		" scenarios.name," +
		" scenarios.active," +

		" actions.id AS action_id," +
		" actions.name AS action_name," +
		" actions.params AS action_params," +

			" actionstypes.id AS actiontype_id," +
			" actionstypes.name AS actiontype_name," +

		" conditions.id AS condition_id," +
		" conditions.name AS condition_name" +

	" FROM scenarios" +
		" LEFT JOIN junctions ON junctions.id = scenarios.id_start" +
		" LEFT JOIN actions ON actions.id = junctions.id_action" +
			" LEFT JOIN actionstypes ON actionstypes.id = actions.id_type" +
		" LEFT JOIN conditions ON conditions.id = junctions.id_condition";

// module

module.exports = class DBScenarios extends require(path.join(__dirname, '_abstract.js')) {

	// formate data

		static formate(scenario) {

			scenario.active = (1 === scenario.active) ? true : false;

			scenario.action = (scenario.action_id) ? Actions.formate({
				'id': scenario.action_id,
				'name': scenario.action_name,
				'params': scenario.action_params,
				'actiontype_id': scenario.actiontype_id,
				'actiontype_name': scenario.actiontype_name
			}) : null;

				delete scenario.action_id;
				delete scenario.action_name;
				delete scenario.action_params;
					delete scenario.actiontype_id;
					delete scenario.actiontype_name;

			scenario.condition = null;

				delete scenario.condition_id;
				delete scenario.condition_name;

			return scenario;

		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY scenarios.id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBScenarios.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

				if (data) {

					if (data.trigger && data.trigger.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_trigger = :id_trigger";
						options[':id_trigger'] = data.trigger.id;

					}

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND scenarios.id = :id";
						options[':id'] = data.id;
					}
					if (data.name) {
						query += " AND scenarios.name = :name";
						options[':name'] = data.name;
					}
					if (data.active) {
						query += " AND scenarios.active = :active";
						options[':active'] = data.active;
					}

					if (data.trigger && !data.trigger.id) {
						query += " AND 1 = 0";
					}
					
				}

				that.db.all(query + " ORDER BY scenarios.name ASC;", options, function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(row, i) {
							rows[i] = DBScenarios.formate(row);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject('There is no data.');
				}
				else if (!scenario.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("INSERT INTO scenarios (name, active) VALUES (:name, :active);", {
						':name': scenario.name,
						':active': (scenario.active && true === scenario.active || 1 == scenario.active) ? '1' : '0'
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

		edit (scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject('There is no data.');
				}
					else if (!scenario.id) {
						reject('The scenario is incorrect.');
					}
				else if (!scenario.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("UPDATE scenarios SET name = :name, active = :active WHERE id = :id;", {
						':id': scenario.id,
						':name': scenario.name,
						':active': (scenario.active && true === scenario.active || 1 == scenario.active) ? '1' : '0'
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(scenario);
						}

					});

				}

			});

		}

		delete (scenario) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject('There is no data.');
				}
					else if (!scenario.id) {
						reject('The scenario is incorrect.');
					}
				else {

					that.db.run("DELETE FROM scenarios WHERE id = :id;", { ':id' : scenario.id }, function(err) {

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

		linkToTrigger (scenario, trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject('There is no scenario data.');
				}
					else if (!scenario.id) {
						reject('There is no valid scenario data.');
					}
				else if (!trigger) {
					reject('There is no trigger data.');
				}
					else if (!trigger.id) {
						reject('There is no valid trigger data.');
					}
				else {

					that.db.run("INSERT INTO scenariostriggers (id_scenario, id_trigger) VALUES (:id_scenario, :id_trigger);", {
						':id_scenario': scenario.id,
						':id_trigger': trigger.id
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

		unlinkToTrigger (scenario, trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!scenario) {
					reject('There is no scenario data.');
				}
					else if (!scenario.id) {
						reject('There is no valid scenario data.');
					}
				else if (!trigger) {
					reject('There is no trigger data.');
				}
					else if (!trigger.id) {
						reject('There is no valid trigger data.');
					}
				else {

					that.db.run("DELETE FROM scenariostriggers WHERE id_scenario = :id_scenario AND id_trigger = :id_trigger;", {
						':id_scenario': scenario.id,
						':id_trigger': trigger.id
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
