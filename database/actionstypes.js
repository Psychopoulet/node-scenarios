
"use strict";

// private

	var _sSelectQuery = "SELECT id, name FROM actionstypes";

// module

module.exports = class DBActionsTypes extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(actiontype) {
			return actiontype;
		}

	// read

		lastInserted() {

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

			let that = this;
			return new Promise(function(resolve, reject) {

				let options = {}, query = _sSelectQuery;

				if (data) {

					query += " WHERE 1 = 1";

					if (data.id) {
						query += " AND actionstypes.id = :id";
						options[':id'] = data.id;
					}
					if (data.name) {
						query += " AND actionstypes.name = :name";
						options[':name'] = data.name;
					}
					
				}

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

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!actiontype) {
					reject('There is no data.');
				}
				else if (!actiontype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("INSERT INTO actionstypes (name) VALUES (:name);", {
						':name': actiontype.name
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

		edit (actiontype) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!actiontype) {
					reject('There is no data.');
				}
					else if (!actiontype.id) {
						reject('The action type is incorrect.');
					}
				else if (!actiontype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("UPDATE actionstypes SET name = :name WHERE id = :id;", {
						':id': actiontype.id,
						':name': actiontype.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(actiontype);
						}

					});

				}

			});

		}

		delete (actiontype) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!actiontype) {
					reject('There is no data.');
				}
					else if (!actiontype.id) {
						reject('The action type is incorrect.');
					}
				else {

					that.db.run("DELETE FROM actionstypes WHERE id = :id;", { ':id' : actiontype.id }, function(err) {

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
