
"use strict";

// private

	var _sSelectQuery = "SELECT id, code, name FROM conditionstypes";

// module

module.exports = class DBActionsTypes extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// formate data

		static formate(conditiontype) {
			return conditiontype;
		}

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY conditionstypes.id DESC LIMIT 0,1;", [], (err, row) => {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBActionsTypes.formate(row) : null);
					}

				});

			});

		}

		search(data) {

			let options = {}, query = _sSelectQuery;

			if ("undefined" !== typeof data) {

				query += " WHERE 1 = 1";

				if ("undefined" !== typeof data.id) {
					query += " AND conditionstypes.id = :id";
					options[":id"] = data.id;
				}
				if ("undefined" !== typeof data.code) {
					query += " AND conditionstypes.code = :code";
					options[":code"] = data.code;
				}
				if ("undefined" !== typeof data.name) {
					query += " AND conditionstypes.name = :name";
					options[":name"] = data.name;
				}
				
			}

			return new Promise((resolve, reject) => {

				this.db.all(query + " ORDER BY conditionstypes.name ASC;", options, (err, rows) => {

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

		add (conditiontype) {

			if ("undefined" === conditiontype) {
				return Promise.reject("There is no data.");
			}
			else if ("undefined" === conditiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if ("undefined" === conditiontype.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO conditionstypes (code, name) VALUES (:code, :name);", {
						":code": conditiontype.code,
						":name": conditiontype.name
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

		edit (conditiontype) {

			if ("undefined" === conditiontype) {
				return Promise.reject("There is no data.");
			}
				else if ("undefined" === conditiontype.id) {
					return Promise.reject("The action type is incorrect.");
				}
			else if ("undefined" === conditiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if ("undefined" === conditiontype.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE conditionstypes SET code = :code, name = :name WHERE id = :id;", {
						":id": conditiontype.id,
						":code": conditiontype.code,
						":name": conditiontype.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(conditiontype);
						}

					});

				});

			}

		}

		delete (conditiontype) {
			
			if ("undefined" === conditiontype) {
				return Promise.reject("There is no data.");
			}
				else if ("undefined" === conditiontype.id) {
					return Promise.reject("The action type is incorrect.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM conditionstypes WHERE id = :id;", { ":id" : conditiontype.id }, (err) => {

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
