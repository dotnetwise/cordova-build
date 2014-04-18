module.exports = Agent;

var async = require('async');
var fs = require('fs');
var path = require('path');

var serverUtils = require('../common/serverUtils');
var Msg = require('../common/Msg.js');

var extend = require('extend');
var fileSize = require('filesize');
var mkdirp = require('mkdirp');
function Agent(socket) {
    this.socket = socket;
    this.platforms = [];
}
Agent.define({
    onConnect: function (server) {
        var agent = this;
        this.server = server;
        this.socket.on({
            'register': function (conf) {
                this.conf = conf = conf || {};
                conf.platforms = ((typeof conf.platforms == 'string' ? conf.platforms.split(/;|,/) : conf.platforms) || []).unique();
                conf.platforms.forEach(function (platform) {
                    this.platforms.push(platform);
                }, this);
            },
            'disconnect': this.onDisconnect,
            'uploading': this.onUploading,
            'building': this.onBuilding,
            'build-success': this.onBuildSuccess,
            'build-failed': this.onBuildFailed,
            'log': function (msg) {
                var build = this.server.builds[msg && msg.buildId];
                this.server.forwardLog(build, this, msg); 
            },
        }, this);
    },
    'onDisconnect': function () {
        this.server.notifyStatusAllWWWs('disconnected', 'agent', this.conf);
    },
    'onBuilding': function (buildId) {
        this.server.updateBuildStatus(buildId, 'building');
    },
    'onUploading': function (buildId) {
        this.server.updateBuildStatus(buildId, 'uploading');
    },
    'onBuildSuccess': function (responseBuild) {
        var build = this.server.findBuildById(responseBuild);
        var client = build.client;
        var agent = this;
        var server = this.server;
        var id = build.masterId || responseBuild.id;
        var locationPath = path.resolve(server.location, id);

        this.log(build, client, Msg.info, 'files uploaded. Storing them on the server', locationPath);

        var outputFiles = responseBuild.outputFiles;
        build.outputFiles = outputFiles;
        outputFiles.forEach(function (file) {
            file.file = [build.number, build.number && '.' || '', file.name || path.basename(file.file)].join('');
        });
        mkdirp(locationPath, function (err) {
            if (err) {
                this.log(build, client, Msg.error, 'error creating folder {2} on the cordova build server\n{3}', locationPath, err);
                this.server.updateBuildStatus(build, "failed");
            }
            else {
                serverUtils.writeFiles(locationPath, outputFiles, 'the cordova build agent worker output files on {0} [a]'.format(build.conf.platform), true, function (err) {
                    if (err) { 
                        serverUtils.freeMemFiles(build.outputFiles);
                        this.log(build, client, Msg.error, 'error saving build output files on the cordova build server\n{3}', err); 
                        this.server.updateBuildStatus(build, "failed");
                    }
                    else {
                        build.conf.completed = new Date();
                        var started = build.conf.started;
                        var masterBuild = build.master;
                        server.updateBuildStatus(build, 'success');
                        build.conf.duration = (started && started.format && started || new Date(started)).elapsed(build.conf.completed);
                        if (masterBuild) {
                            if (masterBuild.platforms.every(function (platform) {
                                return platform.conf.status == 'success' || platform.conf.status == 'failed';
                            })) {
                                masterBuild.conf.completed = new Date();
                                started = masterBuild.conf.started;
                                masterBuild.conf.duration = (started && started.format && started || new Date(started)).elapsed(masterBuild.conf.completed);
                                server.updateBuildStatus(masterBuild, 'success');
                            }
                        }
                        if (client.conf.save)
                            agent.log(build, client, Msg.info, 'Also sending the output files to the client');

                        client.socket.emit('build-success', build.serialize({
                            outputFiles: client.conf.save
                        })); 
                        agent.log(build, client, Msg.info, 'Build done, ready for a new one.');
                        serverUtils.freeMemFiles(build.outputFiles);
                        agent.busy = null;//free agent to take in another work
                        agent.updateStatus('ready');
                    }
                }.bind(this));
            }
        }.bind(this), this);
    },
    'onBuildFailed': function (build) {
        var foundBuild = this.server.builds[build && build.id || build];
        if (foundBuild) {
            if (foundBuild && foundBuild.master) {
                if (foundBuild.master.platforms.every(function (platform) {
                    return platform.conf.status == 'success' || platform.conf.status == 'failed';
                })) {
                    foundBuild.master.conf.completed = new Date();
                }
            }
            if (foundBuild && foundBuild.conf && foundBuild.conf.status != 'failed') {
                this.server.updateBuildStatus(foundBuild, 'failed');
                this.busy = null;
                this.updateStatus('ready');
            }
        }
        else {
            this.log(build, null, Msg.error, "The build {0} was requested to be failing but we couldn't identify such build");
        }
    },
    updateStatus: function(newStatus, platform) {
        this.conf.status = newStatus;
        this.conf.buildingPlatform = platform;
        this.server.notifyStatusAllWWWs('agent-status', 'agent', this.conf);
    },
    log: function (build, client, priority, message, args) {
        Array.prototype.splice.call(arguments, 1, 1, this, 'A');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        this.server.log(msg, client);
    },
    startBuild: function (build) {
        this.busy = build;
        this.updateStatus('building', build.conf.platform);
        this.server.updateBuildStatus(build, 'uploading');
        var client = build.client;
        var files = build.files;
        var server = this.server;
        build.agent = this;

        this.log(build, client, Msg.debug, 'Downloading {2} file{3} from the server...', files.length, files.length == 1 ? '' : 's');
        //console.log('FILES', files)
        serverUtils.readFiles(files, '[AGENT.startBuild] the cordova build server\n', function (err) {
            try {
                if (err) {
                    this.log(build, client, Msg.error, 'error while reading input files on the server for sending them to the agent worker: \n{2}', err);
                    this.server.updateBuildStatus(build, 'failed');
                    build.agent = null;
                    this.busy = null;
                    this.updateStatus('ready');
                }
                else {
                    var origFilePaths = files.map(function(file) { return file.file });
                    try {
                        var size = 0; files.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; });
                        //only send file names to the agent worker and not full paths
                        files.forEach(function (file) { file.file = path.basename(file.file); });

                        this.log(build, client, Msg.info, 'sending build to agent {2} on platform {3}...{4}', this.id, build.conf.platform, fileSize(size));
                        this.socket.emit('build', build.serialize({
                            files: 1,
                        }));
                    }
                    catch (e) {
                        //restore full file paths
                        this.log(build, client, Msg.error, 'error while sending build files to agent {2} on {3}...{4}', agent.id, build.conf.platform, fileSize(size));
                        build.agent = null;
                        this.busy = null;
                        this.updateStatus('ready');
                    }
                    finally 
                    {
                        files.forEach(function(file, index) { file.file = origFilePaths[index]; });
                    }
                }
            }
            finally {
                serverUtils.freeMemFiles(files);
            }
        }.bind(this));
    },
    emitLog: function (msg) {
        this.socket.emit('log', msg);
    },
});
