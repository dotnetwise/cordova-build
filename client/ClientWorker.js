module.exports = ClientWorker;
var ioc = require('socket.io/node_modules/socket.io-client');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var async = require('async');
var fileSize = require('filesize');
var shortid = require('shortid');
var Elapsed = require('elapsed');


var Build = require('../common/Build.js');
var serverUtils = require('../common/serverUtils');

function ClientWorker() {
    this.id = shortid.generate();
}
ClientWorker.define({
    connect: function (conf) {
        var url = '{0}://{1}{2}/{3}'.format(conf.protocol || "http", conf.server, conf.port == 80 ? '' : ':' + conf.port, 'client');
        this.conf = conf;
        this.location = path.resolve(conf.save || 'output');
        this.socket = ioc.connect(url);
        this.parseGroupFiles(conf);
        this.built = 0;
        this.socket.on({
            'connect': this.onConnect,
            'log': function (message) {
                console.log(message && message.message || message);
            },
            'build-success': this.onBuildSuccess,
            'build-failed': this.onBuildFailed,
        }, this);
    },
    disconnect: function () {
        try {
            this.buildCompleted = true;
            console.log("Client is disconnecting from the server since the build tasks completed.");
            //this.socket.disconnect();
        }
        catch (e) {
        }
        finally {
            if (!this.conf.listen.server && !this.conf.listen.agent)
                ;//process.exit();//the client worker should disconnect and close the process since the job was done!
        }
    },
    onConnect: function () {

        var client = this;
        var files = this.files;
        var platforms = this.conf.build;
        var build = this.build = new Build({
            status: 'uploading',
            name: this.conf.name,
            started: new Date(),
        }, client, null, platforms, files);

        client.socket.emit('register', {
            id: client.id,
            save: !!this.conf.save,
        });
        if (!this.buildCompleted) {
            this.log(build, 'Reading {2} file{3}...', files.length, files.length == 1 ? "" : "s");
            serverUtils.readFiles(files, '[CLIENT WORKER] the cordova build client', function (err) {
                if (err)
                    throw 'Error reading the input files\n{0}'.format(err);
                uploadFiles();
            });

            function uploadFiles() {
                try {
                    //registering the client, sends our client id
                    var size = 0; files.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; });
                    size && client.log(build, 'Uploading files to cordova build server...{0}'.format(fileSize(size)));
                    var serializedBuild = build.serialize({ files: 1 });
                    client.socket.emit('request-build', serializedBuild);
                }
                finally {
                    //free agent's memory of output files contents
                    serverUtils.freeMemFiles(files);
                }
            }
        }
    },
    onBuildFailed: function (result) {
        if (++this.built >= this.build.conf.platforms.length)
            this.disconnect();
    },
    onBuildSuccess: function (build) {
        var client = this;
        if (this.conf.save) {
            var id = build.masterId || build.id;
            var locationPath = path.resolve(this.location, id);
            var files = build.outputFiles;
            files.forEach(function (file) {
                var ext = path.extname(file.file);
                file.file = [build.number, build.number && '.' || '', path.basename(file.file, ext), ".", id, ext].join('');
            });
            serverUtils.writeFiles(locationPath, files, "the cordova build client {0} [c]".format(build.conf.platform), function (err) {
                if (err) {
                    client.server.log(build, client, "error saving build output files on the cordova build server\n{3}", err);
                    client.onBuildFailed(result);
                }
                else done();
            });
        }
        else done;
        function done() {
            serverUtils.freeMemFiles(build.outputFiles);
            client.log(build, "Build done! It took {2}.", new Date(build.conf.started).elapsed());
            if (++client.built >= client.conf.build.length)
                client.disconnect();
        }
    },
    log: function (build, message) {
        var buildId = build && build.id || build;
        var clientId = this.id;
        var args = Array.prototype.concat.apply([], arguments);
        Array.prototype.splice.call(args, 0, 2, clientId, buildId);
        message = ['Client', clientId ? ' @{0}' : '', buildId ? ' about #{1}' : '', ": ", message].join('');
        message = message.format.apply(message, args);
        console.log(message);
        //a client worker never emits logs to the server
        //this.emitLog({
        //    message: message,
        //    buildId: buildId,
        //});
    },
    emitLog: function (message) {
        this.socket.emit('log', message);
    },

    parseGroupFiles: function (conf) {
        var groups = ['files', 'wp8', 'ios', 'android'];
        var files = [];
        groups.forEach(function (group, isGroup) {
            conf[group].forEach(function (file) {
                var f = file.split(/;/);
                f.forEach(function (file) {
                    files.push({ file: file, group: isGroup ? group : null });
                });
            });
        });
        this.files = files;
    },
});