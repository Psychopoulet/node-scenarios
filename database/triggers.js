
"use strict";

// private

	var _sSelectQuery = "" +
	" SELECT" +

		" triggers.id," +
		" triggers.name," +

		" triggerstypes.id AS triggertype_id," +
		" triggerstypes.name AS triggertype_name" +

	" FROM triggers" +
		" INNER JOIN triggerstypes ON triggerstypes.id = triggers.id_type";

	var _tabExecuters = {};

// module

module.exports = class DBTriggers extends require(require('path').join(__dirname, '_abstract.js')) {

	// formate data

		static formate(trigger) {

			trigger.type = {
				id : trigger.triggertype_id,
				name : trigger.triggertype_name
			};

				delete trigger.triggertype_id;
				delete trigger.triggertype_name;

			return trigger;

		}

	// read

		lastInserted() {

			let that = this;
			return new Promise(function(resolve, reject) {

				that.db.get(_sSelectQuery + " ORDER BY triggers.id DESC LIMIT 0,1;", [], function(err, row) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {
						resolve((row) ? DBTriggers.formate(row) : null);
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
						query += " AND triggers.id = :id";
						options[':id'] = data.id;
					}
					if (data.name) {
						query += " AND triggers.name = :name";
						options[':name'] = data.name;
					}

					if (data.type) {

						if (data.type.id) {
							query += " AND triggerstypes.id = :triggertype_id";
							options[':triggertype_id'] = data.type.id;
						}
						if (data.type.name) {
							query += " AND triggerstypes.name = :triggertype_name";
							options[':triggertype_name'] = data.type.name;
						}
						
					}
					
				}

				that.db.all(query + " ORDER BY triggerstypes.name ASC, triggers.name ASC;", options, function(err, rows) {
					
					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						rows.forEach(function(trigger, i) {
							rows[i] = DBTriggers.formate(trigger);
						});

						resolve(rows);

					}

				});

			});

		}

	// write

		add (trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject('There is no data.');
				}
				else if (!trigger.type) {
					reject('There is no trigger type.');
				}
					else if (!trigger.type.id) {
						reject('The trigger type is not valid.');
					}
				else if (!trigger.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("INSERT INTO triggers (id_type, name) VALUES (:id_type, :name);", {
						':id_type': trigger.type.id,
						':name': trigger.name
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

		edit (trigger) {

			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject('There is no data.');
				}
					else if (!trigger.id) {
						reject('The trigger is not valid.');
					}
				else if (!trigger.type) {
					reject('There is no trigger type.');
				}
					else if (!trigger.type.id) {
						reject('The trigger type is not valid.');
					}
				else if (!trigger.name) {
					reject('There is no name.');
				}
				else {

					that.db.run("UPDATE triggers SET id_type = :id_type, name = :name WHERE id = :id;", {
						':id': trigger.id,
						':id_type': trigger.type.id,
						':name': trigger.name
					}, function(err) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {
							resolve(trigger);
						}

					});

				}

			});

		}

		delete (trigger) {
			
			let that = this;
			return new Promise(function(resolve, reject) {

				if (!trigger) {
					reject('There is no data.');
				}
					else if (!trigger.id) {
						reject('The trigger is not valid.');
					}
				else {

					that.db.run("DELETE FROM triggers WHERE id = :id;", { ':id' : trigger.id }, function(err) {

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
