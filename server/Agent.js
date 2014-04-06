module.exports = Agent;

var async = require('async');
var fs = require('fs');
var path = require('path');

var serverUtils = require('../common/serverUtils');

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
                conf.platforms = ((typeof conf.platforms == "string" ? conf.platforms.split(/;|,| /) : conf.platforms) || []).unique();
                conf.platforms.forEach(function (platform) {
                    this.platforms.push(platform);
                }, this);
            },
            'disconnect': agent.onDisconnect,
            'build-success': agent.onBuildSuccess,
            'build-fail': agent.onBuildFailed,
            'log': function (message) {
                server.forwardLog(message && message.buildId, agent, message);
            },
        }, this);
    },
    'onDisconnect': function () {
        this.server.notifyStatusAllWWWs('disconnected', 'agent', this.conf);
    },
    'onBuildSuccess': function (responseBuild) {
        var build = this.server.findBuildById(responseBuild);
        var client = build.client;
        var agent = this;
        var server = this.server;
        var id = build.masterId || responseBuild.id;
        var locationPath = path.resolve(server.location, id);

        var outputFiles = responseBuild.outputFiles;
        build.outputFiles = outputFiles;
        outputFiles.forEach(function (file) {
            var ext = path.extname(file.file);
            file.file = [build.number, build.number && '.' || '', path.basename(file.file, ext), ".", id, ext].join('');
        });
        mkdirp(locationPath, function (err) {
            if (err)
                server.log(build, client, "error creating folder {2} on the cordova build server [A]\n{3}", locationPath, err);
            else {
                serverUtils.writeFiles(locationPath, outputFiles, "the cordova build agent worker output files on {0} [a]".format(build.conf.platform), function (err) {
                    if (err) { server.log(build, client, "error saving build output files on the cordova build server\n{3}", err); }
                    else {
                        
                        server.updateBuildStatus(build, 'success');
                        client.socket.emit('build-success', build.serialize({
                            outputFiles: client.conf.save
                        }));

                        agent.busy = null;//free agent to take in another work
                    }
                    serverUtils.freeMemFiles(build.outputFiles);
                }.bind(this));
            }
        });
    },
    'onBuildFailed': function (build) {
        this.busy = false;
        this.server.updateBuildStatus(build, 'failed');
    },
    startBuild: function (build) {
        this.busy = build;
        this.server.updateBuildStatus(build, 'building');
        var client = build.client;
        var files = build.files;
        var server = this.server;
        build.agent = this;

        server.log(build, client, 'Reading {2} file{3} from the server...', files.length, files.length == 1 ? "" : "s");
        //console.log("FILES", files)
        serverUtils.readFiles(files, '[AGENT.startBuild] the cordova build server\n', function (err) {
            try {
                if (err) {
                    this.server.log(build, client, err);
                    build.agent = null;
                    this.busy = null;
                }
                else {
                    try {
                        var size = 0; files.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; });

                        server.log(build, client, "[A] sending build to agent {2} on platform {3}...{4}", this.id, build.conf.platform, fileSize(size));
                        this.socket.emit('build', build.serialize({
                            files: 1,
                        }));
                    }
                    catch (e) {
                        server.log(build, client, "[A] error while sending build to agent {2} on {3}...{4}", agent.id, build.conf.platform, fileSize(size));
                        build.agent = null;
                        this.busy = null;
                    }

                }
            }
            finally {
                serverUtils.freeMemFiles(files);
            }
        }.bind(this));
    },
    emitLog: function (message) {
        this.socket.emit('log', message);
    },
});
