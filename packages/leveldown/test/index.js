const nanoid = require("nanoid/non-secure").nanoid;
const tape = require("tape");
const suite = require("abstract-leveldown/test");
const Level = require("../").LevelDown;

module.exports = (path) => {
	suite({
		test: tape,
		factory: function () {
			return new Level(`${path}/${nanoid(7)}`);
		},
	});
};
