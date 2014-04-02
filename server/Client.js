require('fast-class');
require('array-sugar');
var extend = require('extend');
var Build = require('../common/Build.js');
module.exports = Function.define({
    constructor: function (socket) {
        this.socket = socket;
        socket.on({
            'register': function (conf) {
                this.conf = conf || {};
            },
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
    requestBuild: function (build) {
        var buildConf = build.conf;
        if (this.validateBuildRequest(buildConf)) {
            var platforms = buildConf.platforms;
            var allFiles = buildConf.files;
            delete buildConf.platforms;
            delete buildConf.files;
            platforms.forEach(function (platform) {
                var files = [];
                allFiles.forEach(function (file) {
                    if (!file.group || file.group == platform)
                        files.push(file);
                });
                var config = extend({ files: files }, buildConf);
                var platformBuild = new Build(config, this, platform);
                platformBuild.client = this;
                platformBuild.id = build.id;
                this.server.builds[platformBuild.id] = platformBuild;
                this.server.buildsQueue.push(platformBuild);
                this.server.log(platformBuild.id, this, '[C] build queued on {2}', platform);
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
    emitLog: function (message) {
        this.socket.emit('log', message);
    },
});