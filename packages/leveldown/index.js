const LevelDown = require("./lib/index").LevelDown;

function leveldown(location) {
	return new LevelDown(location);
}
leveldown.prototype = LevelDown.prototype;

module.exports = leveldown;
