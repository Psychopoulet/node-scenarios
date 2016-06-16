
"use strict";

// private

	var _sSelectQuery = "SELECT id, code, name FROM actionstypes";

// module

module.exports = class DBActionsTypes extends require(require("path").join(__dirname, "_abstract.js")) {

	// formate data

		static formate(actiontype) {
			return actiontype;
		}

	// read

		last() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY actionstypes.id DESC LIMIT 0,1;", [], function(err, row) {
					
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

			if (data) {

				query += " WHERE 1 = 1";

				if (data.id) {
					query += " AND actionstypes.id = :id";
					options[":id"] = data.id;
				}
				if (data.code) {
					query += " AND actionstypes.code = :code";
					options[":code"] = data.code;
				}
				if (data.name) {
					query += " AND actionstypes.name = :name";
					options[":name"] = data.name;
				}
				
			}

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.all(query + " ORDER BY actionstypes.name ASC;", options, function(err, rows) {

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

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("INSERT INTO actionstypes (code, name) VALUES (:code, :name);", {
						":code": actiontype.code,
						":name": actiontype.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							that.last().then(resolve).catch(reject);
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

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("UPDATE actionstypes SET code = :code, name = :name WHERE id = :id;", {
						":id": actiontype.id,
						":code": actiontype.code,
						":name": actiontype.name
					}, function(err) {

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

				let that = this;
				return new Promise(function(resolve, reject) {

					that.db.run("DELETE FROM actionstypes WHERE id = :id;", { ":id" : actiontype.id }, function(err) {

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
