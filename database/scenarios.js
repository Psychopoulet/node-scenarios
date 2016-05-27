
"use strict";

// deps

	const path = require('path');

// private

	var _sSelectQuery = "" +
	"SELECT" +

		" scenarios.id," +
		" scenarios.name," +
		" scenarios.active," +

		" actions.id AS action_id," +
		" actions.name AS action_name," +

		" conditions.id AS condition_id," +
		" conditions.name AS condition_name" +

	" FROM scenarios" +
		" LEFT JOIN junctions ON junctions.id = scenarios.id_start" +
			" LEFT JOIN actions ON actions.id = junctions.id_action" +
			" LEFT JOIN conditions ON conditions.id = junctions.id_condition",
	_container;

// module

module.exports = class DBScenarios extends require(path.join(__dirname, '_abstract.js')) {

	constructor (container) {
		super(container);
		_container = container;
	}

	// formate data

		static formate(scenario) {

			scenario.active = (1 === scenario.active) ? true : false;

			if (scenario.action_id) {

				scenario.start = {
					'id': scenario.action_id,
					'name': scenario.action_name,
					'junction': 'action'
				};

			}
			else if (scenario.condition_id) {

				scenario.start = {
					'id': scenario.condition_id,
					'name': scenario.condition_name,
					'junction': 'condition'
				};

			}
			else {
				scenario.start = null;
			}

				delete scenario.action_id;
				delete scenario.action_name;

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

		search(scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

				if (scenario) {

					if (scenario.trigger && scenario.trigger.id) {

						query += " INNER JOIN scenariostriggers ON scenariostriggers.id_trigger = :id_trigger";
						options[':id_trigger'] = scenario.trigger.id;

					}

					query += " WHERE 1 = 1";

					if (scenario.id) {
						query += " AND scenarios.id = :id";
						options[':id'] = scenario.id;
					}
					if (scenario.name) {
						query += " AND scenarios.name = :name";
						options[':name'] = scenario.name;
					}
					if ('undefined' !== typeof scenario.active) {
						query += " AND scenarios.active = :active";
						options[':active'] = (scenario.active) ? '1' : '0';
					}

					if (scenario.trigger && !scenario.trigger.id) {
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
						':active': ('undefined' !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? '1' : '0'
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

					scenario.junction = (scenario.junction) ? scenario.junction : null;

					that.db.run("UPDATE scenarios SET name = :name, active = :active, id_start = :start WHERE id = :id;", {
						':id': scenario.id,
						':name': scenario.name,
						':active': ('undefined' !== typeof scenario.active && (true === scenario.active || 1 == scenario.active)) ? '1' : '0',
						':start': scenario.junction
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							delete scenario.junction;
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

		// triggers

			linkToTrigger (scenario, trigger) {
				return _container.get('triggers').linkToScenario(scenario, trigger);
			}

			unlinkToTrigger (scenario, trigger) {
				return _container.get('triggers').unlinkToScenario(scenario, trigger);
			}

		// start

			linkStartAction (scenario, action) {

				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject('There is no data.');
					}
						else if (!scenario.id) {
							reject('The scenario is incorrect.');
						}
					else if (!action) {
						reject('There is no action.');
					}
						else if (!action.id) {
							reject('The action is incorrect.');
						}
					else {

						that.unlinkStart(scenario).then(function(scenario) {

							that.db.run("INSERT INTO junctions (id_action) VALUES (:id_action);", { ':id_action' : action.id }, function(err) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {

									that.db.get("SELECT id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], function(err, row) {
										
										if (err) {
											reject((err.message) ? err.message : err);
										}
										else if (!row) {
											reject("Impossible to create this start point.");
										}
										else {

											scenario.junction = row.id;

											that.edit(scenario).then(function() {
												return that.searchOne({ id: scenario.id });
											}).then(function(scenario) {
												resolve(scenario);
											}).catch(reject);

										}

									});

								}

							});

						}).catch(reject);

					}

				});

			}

			linkStartCondition (scenario, condition) {
				
				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject('There is no data.');
					}
						else if (!scenario.id) {
							reject('The scenario is incorrect.');
						}
					else if (!condition) {
						reject('There is no condition.');
					}
						else if (!condition.id) {
							reject('The condition is incorrect.');
						}
					else {

						that.unlinkStart(scenario).then(function() {

							that.db.run("INSERT INTO junctions (id_condition) VALUES (:id_condition);", { ':id_condition' : condition.id }, function(err) {

								if (err) {
									reject((err.message) ? err.message : err);
								}
								else {

									that.db.get("SELECT id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], function(err, row) {
										
										if (err) {
											reject((err.message) ? err.message : err);
										}
										else if (!row) {
											reject("Impossible to create this start point.");
										}
										else {

											scenario.junction = row.id;

											that.edit(scenario).then(function() {
												return that.searchOne({ id: scenario.id });
											}).then(function(scenario) {
												resolve(scenario);
											}).catch(reject);

										}

									});

								}

							});

						});

					}

				});

			}

			unlinkStart (scenario) {
				
				let that = this;
				return new Promise(function(resolve, reject) {

					if (!scenario) {
						reject('There is no data.');
					}
						else if (!scenario.id) {
							reject('The scenario is incorrect.');
						}
					else {

						that.searchOne({ id: scenario.id }).then(function(scenario) {

							if (!scenario.start) {
								resolve(scenario);
							}
							else {

								that.db.run("DELETE FROM junctions WHERE id = :id;", { ':id' : scenario.start.id }, function(err) {

									if (err) {
										reject((err.message) ? err.message : err);
									}
									else {

										scenario.junction = null;

										that.edit(scenario).then(function() {
											return that.searchOne({ id: scenario.id });
										}).then(function(scenario) {
											resolve(scenario);
										}).catch(reject);

									}

								});

							}

						}).catch(reject);

					}

				});
				
			}

	// run

		getWay(scenario) {

			let that = this;
			return new Promise(function(resolve, reject) {

				return that.searchOne({ id: scenario.id }).then(function(scenario) {

					if (!scenario) {
						reject('Impossible to find this scenario.');
					}
					else {

						if (!scenario.start) {
							resolve(scenario);
						}
						else  {

							let junction = scenario.start.junction;

							if ('action' === junction) {

								_container.get('actions').searchOne({ id: scenario.start.id }).then(function(action) {

									condition.junction = junction;
									scenario.start = action;

									resolve(scenario);

								});

							}
							else if ('condition' === junction) {

								_container.get('conditions').searchOne({ id: scenario.start.id }).then(function(condition) {

									condition.junction = junction;
									scenario.start = condition;

									resolve(scenario);

								});

							}
							else {
								reject("Unknown scenario start junction '" + junction + "'");
							}

						}

					}

				});

			});

		}

		run(scenario) {

			let that = this;
			return this.getWay(way).then(function() {

				console.log('test');

			});

		}

};
