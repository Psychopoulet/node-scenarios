
"use strict";

// module

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
	function DBAbstract(container) {
		_classCallCheck(this, DBAbstract);

		this.db = container.get("db");
	}

	// formate data

	_createClass(DBAbstract, [{
		key: "searchOne",

		// read

		value: function searchOne(data) {

			return this.search(data).then(function (data) {

				return new Promise(function (resolve) {

					if (data && data.length) {
						resolve(data[0]);
					} else {
						resolve(null);
					}
				});
			});
		}
	}], [{
		key: "formate",
		value: function formate(data) {
			return data;
		}
	}]);

	return DBAbstract;
})();