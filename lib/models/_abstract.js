
"use strict";

// module

module.exports = class DBAbstract {

	constructor (container) {
		this.container = container;
		this.db = container.get("db");
	}

	// formate data

		static formate(data) {
			return data;
		}

	// read

		searchOne(data) {

			return this.search(data).then(function(data) {
				return Promise.resolve((data && data.length) ? data[0] : null);
			});

		}

};
