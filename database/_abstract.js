
"use strict";

// module

module.exports = class DBAbstract {

	constructor (db) {
		this.db = db;
	}

	// formate data

		static formate(data) {
			return data;
		}

	// read

		searchOne(data) {

			return this.search(data).then(function(data) {

				return new Promise(function(resolve, reject) {

					if (data && data.length) {
						resolve(data[0]);
					}
					else {
						resolve(null);
					}

				});

			});

		}

};
