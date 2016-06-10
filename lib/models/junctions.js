
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
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!action) {
					reject("There is no action.");
				}
					else if (!action.id) {
						reject("The action is incorrect.");
					}
				else {

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

				}

			});
			
		}

		createConditionJunctionId (condition) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!condition) {
					reject("There is no condition.");
				}
					else if (!condition.id) {
						reject("The condition is incorrect.");
					}
				else {

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

				}

			});
			
		}

		deleteById (junctionid) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if ("number" !== typeof junctionid) {
					reject("The junction is incorrect.");
				}
				else {

					that.db.run("DELETE FROM junctions WHERE junctions.id = :id;", { ":id" : junctionid }, function(err) {

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
