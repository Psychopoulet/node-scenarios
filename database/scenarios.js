
"use strict";

// private

	var _sSelectQuery = "SELECT id, name FROM scenarios";

// module

module.exports = class DBScenarios extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(scenario) {
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

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND scenarios.id = :id";
						options[':id'] = data.id;
					}
					if (data.name) {
						query += " AND scenarios.name = :name";
						options[':name'] = data.name;
					}
					
				}

				that.db.all(query + " ORDER BY scenarios.name ASC;", options, function(err, rows) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
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

					that.db.run("INSERT INTO scenarios (name) VALUES (:name);", {
						':name': scenario.name
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

					that.db.run("UPDATE scenarios SET name = :name WHERE id = :id;", {
						':id': scenario.id,
						':name': scenario.name
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

};
