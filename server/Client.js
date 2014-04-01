require('fast-class');
require('array-sugar');
var Build = require('../Build');
module.exports = Function.define({
	constructor: function (socket) {
		this.socket = socket;
		socket.on({
			'disconnect': this.onDisconnect,
			'request-build': this.requestBuild,
		}, this);
	},
	onConnect: function (server) {
		this.server = server;
	},
	onDisconnect: function () {
		this.server.clients.remove(this);
	},
	requestBuild: function (buildConf) {
		if (this.validateBuildRequest(buildConf)) {
            var platforms = buildConf.platforms;
            delete buildConf.platforms;
            platforms.forEach(function(platform) { 
			    this.server.buildsQueue.push(new Build(buildConf, this, platform));
            }, this);
		}
	},
	validateBuildRequest: function (buildConf) {
		if (!buildConf)
			this.socket.emit("request-build: The client requested a build didn't specify a config");
		else if (!buildConf.platforms || !buildConf.platforms.length)
			this.socket.emit("request-build: The client requested a build didn't specify any plaftorms to build against");
		else if (!Object.every(this.server.platforms, function (p, platform) {
            if (!platform || !this.server.platforms[platform] || !this.server.platforms[platform].length) {
                this.socket.emit("request-build: The client requested a build on platform '{0}', but there is no agent listening on that platform.".format(platform));
                return false;
		}
            return true;
		}, this))
			return false;
		return true;
	},

});