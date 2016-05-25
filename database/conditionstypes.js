
"use strict";

// private

	var _sSelectQuery = "SELECT id, code, name FROM conditionstypes";

// module

module.exports = class DBActionsTypes extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(conditiontype) {
			return conditiontype;
		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY conditionstypes.id DESC LIMIT 0,1;", [], function(err, row) {
					
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
						query += " AND conditionstypes.id = :id";
						options[':id'] = data.id;
					}
					if (data.code) {
						query += " AND conditionstypes.code = :code";
						options[':code'] = data.code;
					}
					if (data.name) {
						query += " AND conditionstypes.name = :name";
						options[':name'] = data.name;
					}
					
				}

				that.db.all(query + " ORDER BY conditionstypes.name ASC;", options, function(err, rows) {

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

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!conditiontype) {
					reject('There is no data.');
				}
				else if (!conditiontype.code) {
					reject('There is no code.');
				}
				else if (!conditiontype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("INSERT INTO conditionstypes (code, name) VALUES (:code, :name);", {
						':code': conditiontype.code,
						':name': conditiontype.name
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

		edit (conditiontype) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!conditiontype) {
					reject('There is no data.');
				}
					else if (!conditiontype.id) {
						reject('The action type is incorrect.');
					}
				else if (!conditiontype.code) {
					reject('There is no code.');
				}
				else if (!conditiontype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("UPDATE conditionstypes SET code = :code, name = :name WHERE id = :id;", {
						':id': conditiontype.id,
						':code': conditiontype.code,
						':name': conditiontype.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(conditiontype);
						}

					});

				}

			});

		}

		delete (conditiontype) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!conditiontype) {
					reject('There is no data.');
				}
					else if (!conditiontype.id) {
						reject('The action type is incorrect.');
					}
				else {

					that.db.run("DELETE FROM conditionstypes WHERE id = :id;", { ':id' : conditiontype.id }, function(err) {

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
