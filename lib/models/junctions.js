
"use strict";

// module

module.exports = class DBJunctions extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get("SELECT junctions.id FROM junctions ORDER BY junctions.id DESC LIMIT 0,1;", [], (err, row) => {

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
			
			if ("undefined" === action) {
				return Promise.reject("There is no action.");
			}
				else if ("undefined" === action.id) {
					return Promise.reject("The action is incorrect.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO junctions (id_action) VALUES (:id_action);", { ":id_action" : action.id }, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {

							this.last().then((junction) => {

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
			
			if ("undefined" === condition) {
				return Promise.reject("There is no condition.");
			}
				else if ("undefined" === condition.id) {
					return Promise.reject("The condition is incorrect.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO junctions (id_condition) VALUES (:id_condition);", { ":id_condition" : condition.id }, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {

							this.last().then((junction) => {

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

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM junctions WHERE junctions.id = :id;", { ":id" : junctionid }, (err) => {

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
