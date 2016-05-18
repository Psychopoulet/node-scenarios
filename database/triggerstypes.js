
"use strict";

// private

	var _sSelectQuery = "SELECT id, code, name FROM triggerstypes";

// module

module.exports = class DBActionsTypes extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(triggertype) {
			return triggertype;
		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY triggerstypes.id DESC LIMIT 0,1;", [], function(err, row) {
					
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
						query += " AND triggerstypes.id = :id";
						options[':id'] = data.id;
					}
					if (data.code) {
						query += " AND triggerstypes.code = :code";
						options[':code'] = data.code;
					}
					if (data.name) {
						query += " AND triggerstypes.name = :name";
						options[':name'] = data.name;
					}
					
				}

				that.db.all(query + " ORDER BY triggerstypes.name ASC;", options, function(err, rows) {

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

		add (triggertype) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!triggertype) {
					reject('There is no data.');
				}
				else if (!triggertype.code) {
					reject('There is no code.');
				}
				else if (!triggertype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("INSERT INTO triggerstypes (code, name) VALUES (:code, :name);", {
						':code': triggertype.code,
						':name': triggertype.name
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

		edit (triggertype) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!triggertype) {
					reject('There is no data.');
				}
					else if (!triggertype.id) {
						reject('The trigger type is incorrect.');
					}
				else if (!triggertype.code) {
					reject('There is no code.');
				}
				else if (!triggertype.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("UPDATE triggerstypes SET code = :code, name = :name WHERE id = :id;", {
						':id': triggertype.id,
						':code': triggertype.code,
						':name': triggertype.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(triggertype);
						}

					});

				}

			});

		}

		delete (triggertype) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!triggertype) {
					reject('There is no data.');
				}
					else if (!triggertype.id) {
						reject('The trigger type is incorrect.');
					}
				else {

					that.db.run("DELETE FROM triggerstypes WHERE id = :id;", { ':id' : triggertype.id }, function(err) {

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
