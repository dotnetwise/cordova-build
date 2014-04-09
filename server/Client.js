require('fast-class');
require('array-sugar');
var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var extend = require('extend');

var Build = require('../common/Build.js');
var Msg = require('../common/Msg.js');
var serverUtils = require('../common/serverUtils');
module.exports = Function.define({
    constructor: function (socket) {
        this.socket = socket;
        socket.on({
            'register': function (conf) {
                this.conf = conf || {};
            },
            'disconnect': this.onDisconnect,
            'register-build': this.onRegisterBuild,
            'upload-build': this.onUploadBuild,
            'fail-build': this.onFailBuild,
            'log': function (msg) {
                var build = this.server.builds[msg && msg.buildId];
                var client = this;
                this.server.forwardLog(build, this, msg, {
                    emitLog: function (msg) {
                        if (client.server.conf.mode == 'all') {
                            client.emitLog(msg);
                        }
                        else {
                            /* do nothing. We don't forward client messages back to client, that he sent to us and already displayed on its stdout*/
                        }
                    }
                });
            },
        }, this);
    },
    'onConnect': function (server) {
        this.server = server;
    },
    'onDisconnect': function () {
        this.server.clients.remove(this);
    },
    'onRegisterBuild': function (build) {
        var buildConf = build && build.conf;
        buildConf.started = new Date();
        if (this.validateBuildRequest(build)) {
            var buildObj = new Build(buildConf, this, null, buildConf.platform,
                build.files, null, build.id, null);
            //from now on keep a Build object
            build = buildObj;
            this.server.builds.push(build);
            this.server.builds[build.id] = build;
            var platforms = buildConf.platform;
            build.platforms = [];
            platforms.forEach(function (platform) {
                var conf = extend(true, {}, buildConf);
                var platformBuild = new Build(conf, this, null, platform, null, null, null, build);
                build.platforms.push(platformBuild);
                platformBuild.conf.logs = [];//separate logs from its master
                this.server.builds[platformBuild.id] = platformBuild;
            }, this);
            this.log(build, Msg.info, "The build '{0}' has been registered on: {2}", platforms.join(','));
            this.server.updateBuildStatus(build, build.conf.status);
        }
    },
    'onUploadBuild': function (build) {
        var buildConf = build && build.conf;
        var server = this.server;
        if (this.validateBuildRequest(build)) {
            var buildObj = server.builds[build.id];
            if (!buildObj) {
                this.log(build, Msg.error, "update-build: The client said is uploading a build didn't specify a config");
                return;
            }
            //TODO: decide whether to use client's log. for now assuming no
            //buildObj.logs = build.logs;
            buildObj.files = build.files;
            //from now on keep a Build object
            build = buildObj;

            var allFiles = build.files;
            var client = this;
            var path = require('path');
            var locationPath = path.resolve(server.location, build.id, 'input');


            serverUtils.writeFiles(locationPath, allFiles, 'the cordova build server', function (err) {
                if (err) {
                    this.log(build, Msg.error, 'The uploaded files could not be saved on the server: \n{2}', err);
                    server.updateBuildStatus(build, 'failed');
                }
                else {

                    this.log(build, Msg.status, 'Build has been queued on platforms: {2}', build.conf.platform);
                    server.updateBuildStatus(build, 'queued');
                    //if (build.platforms.length <= 1) {
                    //    build.conf.platform = build.conf.platform[0];
                    //    server.buildsQueue.push(build);
                    //    this.log(build, Msg.debug, 'build queued on {2}', build.conf.platform);
                    //}
                    //else 
                    build.platforms.forEach(function (platformBuild) {
                        var files = [];
                        allFiles.forEach(function (file) {
                            if (!file.group || file.group == platformBuild.conf.platform)
                                files.push(file);
                        });
                        platformBuild.files = files;
                        server.updateBuildStatus(platformBuild, 'queued', true);

                        server.buildsQueue.push(platformBuild);
                        this.log(platformBuild, Msg.info, 'build queued on {2}', platformBuild.conf.platform);
                    }, this);
                }
            }.bind(this));
        }
    },
    'onFailBuild': function (build) {
        var buildObj = this.server.builds[build && build.id];
        if (buildObj) {
            buildObj.platforms && buildObj.platforms.forEach(function (platformBuild) {
                platformBuild.conf.status = 'failed';
            });
            buildObj.conf.status = 'failed';
            this.server.updateBuildStatus(buildObj, 'failed');
        }
    },
    log: function (build, priority, message, args) {
        Array.prototype.splice.call(arguments, 1, 0, this, 'C');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        this.server.log(msg, this);//forward to this == to the client worker
    },
    validateBuildRequest: function (build, client) {
        var buildConf = build && build.conf;
        var server = this.server;
        if (!buildConf) {
            this.log(build, Msg.error, "The client requested a build didn't specify a config");
            this.server.updateBuildStatus(build, 'failed');
            return false;
        }
        else if (!buildConf.platform || !buildConf.platform.length) {
            this.log(build, Msg.error, "The client requested a build didn't specify any plaftorms to build against");
            this.server.updateBuildStatus(build, 'failed');
            return false;
        }
        Object.every(buildConf.platform, function (platform) {
            if (!platform || !server.platforms[platform] || !server.platforms[platform].length) {
                this.log(build, Msg.warning, "The client requested a build on platform '{2}', but there is no agent connected yet on that platform.", platform);
            }
            return true;
        }.bind(this));
        return true;
    },
    emitLog: function (msg) {
        this.socket.emit('log', msg);
    },
});