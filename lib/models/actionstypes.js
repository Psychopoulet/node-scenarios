
"use strict";

// private

	var _sSelectQuery = "SELECT id, code, name FROM actionstypes";

// module

module.exports = class DBActionsTypes extends require(require("path").join(__dirname, "..", "main.js")).abstract {

	// formate data

		static formate(actiontype) {
			return actiontype;
		}

	// read

		last() {

			return new Promise((resolve, reject) => {

				this.db.get(_sSelectQuery + " ORDER BY actionstypes.id DESC LIMIT 0,1;", [], (err, row) => {
					
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
						query += " AND actionstypes.id = :id";
						options[":id"] = data.id;
					}
						else if (data.ids && data.ids instanceof Array) {
							data.ids = JSON.stringify(data.ids)
							query += " AND actionstypes.id IN(" + data.ids.substring(1, data.ids.length - 1) + ")"
						}
					else if (data.code) {
						query += " AND actionstypes.code = :code";
						options[":code"] = data.code;
					}
						else if (data.codes && data.codes instanceof Array) {
							data.codes = JSON.stringify(data.codes)
							query += " AND actionstypes.code IN(" + data.codes.substring(1, data.codes.length - 1) + ")"
						}
					else {

						if (data.name) {
							query += " AND actionstypes.name = :name";
							options[":name"] = data.name;
						}
					
					}

				}

				this.db.all(query + " ORDER BY actionstypes.name ASC;", options, (err, rows) => {

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

		add (actiontype) {

			if (!actiontype) {
				return Promise.reject("There is no data.");
			}
			else if (!actiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if (!actiontype.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("INSERT INTO actionstypes (code, name) VALUES (:code, :name);", {
						":code": actiontype.code,
						":name": actiontype.name
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

		edit (actiontype) {

			if (!actiontype) {
				return Promise.reject("There is no data.");
			}
				else if (!actiontype.id) {
					return Promise.reject("The action type is incorrect.");
				}
			else if (!actiontype.code) {
				return Promise.reject("There is no code.");
			}
			else if (!actiontype.name) {
				return Promise.reject("There is no name.");
			}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("UPDATE actionstypes SET code = :code, name = :name WHERE id = :id;", {
						":id": actiontype.id,
						":code": actiontype.code,
						":name": actiontype.name
					}, (err) => {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(actiontype);
						}

					});

				});

			}

		}

		delete (actiontype) {
			
			if (!actiontype) {
				return Promise.reject("There is no data.");
			}
				else if (!actiontype.id) {
					return Promise.reject("The action type is incorrect.");
				}
			else {

				return new Promise((resolve, reject) => {

					this.db.run("DELETE FROM actionstypes WHERE id = :id;", { ":id" : actiontype.id }, (err) => {

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
