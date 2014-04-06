require('fast-class');
require('array-sugar');
var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var extend = require('extend');

var Build = require('../common/Build.js');
var serverUtils = require('../common/serverUtils');
module.exports = Function.define({
    constructor: function (socket) {
        this.socket = socket;
        socket.on({
            'register': function (conf) {
                this.conf = conf || {};
            },
            'disconnect': this.onDisconnect,
            'request-build': this.onRequestBuild,
        }, this);
    },
    'onConnect': function (server) {
        this.server = server;
    },
    'onDisconnect': function () {
        this.server.clients.remove(this);
    },
    'onRequestBuild': function (build) {
        var buildConf = build && build.conf;
        if (this.validateBuildRequest(build)) {
            var buildObj = new Build(buildConf, this, null, buildConf.platform,
                build.files, null, build.id, build.masterId);
            //from now on keep a Build object
            build = buildObj;

            var platforms = buildConf.platform;
            var allFiles = build.files;
            var client = this;
            var server = this.server;
            var path = require('path');
            var locationPath = path.resolve(this.server.location, build.id, 'input');


            serverUtils.writeFiles(locationPath, allFiles, "the cordova build server [c]", function (err) {
                if (err) { this.server.log(build, client, err); }
                else {
                    server.builds.push(build);
                    server.builds[build.id] = build;//save the master build
                    build.platforms = [];

                    build.updateStatus('queued');
                    server.buildsQueue.push(build);
                    if (platforms.length <= 1) {
                        server.log(build, this, '[C] build queued on {2}', platforms[0]);
                    }
                    else platforms.forEach(function (platform) {
                        var files = [];
                        allFiles.forEach(function (file) {
                            if (!file.group || file.group == platform)
                                files.push(file);
                        });
                        var conf = extend(true, {}, buildConf);
                        var platformBuild = new Build(conf, this, null, platform, files, null, null, build.id);
                        build.platforms.push(platformBuild);
                        platformBuild.conf.logs = [];//separate logs from its master
                        console.log("BEFORE", build.id, files);
                        server.builds[platformBuild.id] = platformBuild;
                        platformBuild.updateStatus('queued');   
                        server.buildsQueue.push(platformBuild);
                        server.log(platformBuild, this, '[C] build queued on {2}', platform);
                    }, this);
                }
            }.bind(this));
        }
    },
    validateBuildRequest: function (build, client) {
        var buildConf = build && build.conf;
        var server = this.server;
        if (!buildConf) {
            server.log(build, this, "request-build: The client requested a build didn't specify a config");
            return false;
        }
        else if (!buildConf.platform || !buildConf.platform.length) {
            server.log(build, this, "request-build: The client requested a build didn't specify any plaftorms to build against");
            return false;
        }
        else if (!Object.every(buildConf.platform, function (platform) {
            if (!platform || !this.server.platforms[platform] || !this.server.platforms[platform].length) {
                server.log(build, this, "request-build: The client requested a build on platform '{2}', but there is no agent listening on that platform.", platform);
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