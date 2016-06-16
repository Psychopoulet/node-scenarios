
"use strict";

// module

module.exports = class DBJunctions extends require(require("path").join(__dirname, "_abstract.js")) {

	// read

		last() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get("SELECT junctions.id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], function(err, row) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? row : null);
					}

				});

			});

		}

	// write

		createActionJunctionId (action) {
			
			if (!action) {
				return Promise.reject("There is no action.");
			}
				else if (!action.id) {
					return Promise.reject("The action is incorrect.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("INSERT INTO junctions (id_action) VALUES (:id_action);", { ":id_action" : action.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {

							that.last().then(function(junction) {

								if (!junction) {
									reject("Impossible to create this action junction.");
								}
								else {
									resolve(junction.id);
								}

							}).catch(reject);

						}

					});

				});

			}
			
		}

		createConditionJunctionId (condition) {
			
			if (!condition) {
				return Promise.reject("There is no condition.");
			}
				else if (!condition.id) {
					return Promise.reject("The condition is incorrect.");
				}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("INSERT INTO junctions (id_condition) VALUES (:id_condition);", { ":id_condition" : condition.id }, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {

							that.last().then(function(junction) {

								if (!junction) {
									reject("Impossible to create this action junction.");
								}
								else {
									resolve(junction.id);
								}

							}).catch(reject);

						}

					});

				});

			}
			
		}

		deleteById (junctionid) {
			
			if ("number" !== typeof junctionid) {
				return Promise.reject("The junction is incorrect.");
			}
			else {

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("DELETE FROM junctions WHERE junctions.id = :id;", { ":id" : junctionid }, function(err) {

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

};
