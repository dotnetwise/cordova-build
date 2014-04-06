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
            'register-build': this.onRegisterBuild,
            'upload-build': this.onUploadBuild,
            'fail-build': this.onFailBuild,
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
            this.server.updateBuildStatus(build, build.conf.status);
        }
    },
    'onUploadBuild': function (build) {
        var buildConf = build && build.conf;
        var server = this.server;
        if (this.validateBuildRequest(build)) {
            var buildObj = server.builds[build.id];
            if (!buildObj) {
                server.log(build, this, "update-build: The client said is uploading a build didn't specify a config");
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


            serverUtils.writeFiles(locationPath, allFiles, "the cordova build server [c]", function (err) {
                if (err) { 
                    server.log(build, client, err); 
                    server.updateBuildStatus(build, 'failed');
                }
                else {

                    server.updateBuildStatus(build, 'queued');
                    if (build.platforms.length <= 1) {
                        server.log(build, this, '[C] build queued on {2}', build.platform || build.conf.platform[0]);
                    }
                    else build.platforms.forEach(function (platformBuild) {
                        var files = [];
                        allFiles.forEach(function (file) {
                            if (!file.group || file.group == platformBuild.platform)
                                files.push(file);
                        });
                        platformBuild.files = files;
                        platformBuild.updateStatus('queued');   
                        
                        server.buildsQueue.push(platformBuild);
                        server.log(platformBuild, this, '[C] build queued on {2}', platformBuild.conf.platform);
                    }, this);
                }
            }.bind(this));
        }
    },
    'onFailBuild': function (build) {
            var buildObj = this.server.builds[build && build.id];
            if (buildObj) {
                buildObj.platforms && buildObj.platforms.forEach(function(platformBuild){
                    platformBuild.conf.status = 'failed';
                });
                buildObj.conf.status = 'failed';
                this.server.updateBuildStatus(buildObj, 'failed');
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