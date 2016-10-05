
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

			return new Promise((resolve, reject) => {

				let options = {}, query = _sSelectQuery;

				if ("object" === typeof data && null !== data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND conditionstypes.id = :id";
						options[":id"] = data.id;
					}
						else if (data.ids && data.ids instanceof Array) {
							data.ids = JSON.stringify(data.ids)
							query += " AND conditionstypes.id IN(" + data.ids.substring(1, data.ids.length - 1) + ")"
						}
					else if (data.code) {
						query += " AND conditionstypes.code = :code";
						options[":code"] = data.code;
					}
						else if (data.codes && data.codes instanceof Array) {
							data.codes = JSON.stringify(data.codes)
							query += " AND conditionstypes.code IN(" + data.codes.substring(1, data.codes.length - 1) + ")"
						}
					else {

						if (data.name) {
							query += " AND conditionstypes.name = :name";
							options[":name"] = data.name;
						}
					
					}
					
				}

				this.db.all(query + " ORDER BY conditionstypes.name ASC;", options, (err, rows) => {

					if (err) {
						reject(err);
					}
					else {
						resolve(rows);
					}

				});

			}).catch((err) => {
				return Promise.reject((err.message) ? err.message : err);
			});

		}

	// write

		add (conditiontype) {

			if (!conditiontype) {
				return Promise.reject("There is no data.");
			}
			else if (!conditiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if (!conditiontype.name) {
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

			if (!conditiontype) {
				return Promise.reject("There is no data.");
			}
				else if (!conditiontype.id) {
					return Promise.reject("The action type is incorrect.");
				}
			else if (!conditiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if (!conditiontype.name) {
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
			
			if (!conditiontype) {
				return Promise.reject("There is no data.");
			}
				else if (!conditiontype.id) {
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
