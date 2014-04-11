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
var Msg = require('../common/Msg.js');
var serverUtils = require('../common/serverUtils');
var sig = 'CW';

function ClientWorker(conf) {
    this.conf = conf;
    this.id = shortid.generate();
    this.url = '{0}{1}{2}/{3}'.format(conf.protocol || 'http://', conf.server, conf.port == 80 ? '' : ':' + conf.port, 'client');
    this.location = path.resolve(conf.save || 'output');
    this.parseGroupFiles(conf);
    this.built = 0;
    process.on('exit', function () {
        this.socket.socket.connected && this.socket.disconnect();
        this.socket.socket.connected = false;
    }.bind(this));
}
ClientWorker.define({
    connect: function () {
        var conf = this.conf;
        if (!this.socket) {
            console.log('Connecting client to:', this.url);
            this.socket = ioc.connect(this.url, {
                'reconnect': false,
                'force new connection': true, // <-- Add this!
                'sync disconnect on unload': true,
            }).on({
                'connect': this.onConnect,
                'disconnect': this.onDisconnect,
                'error': this.onError,
                'log': function (msg) {
                    var message = new Msg(msg);
                    console.log(message.toString());
                },
                'build-success': this.onBuildSuccess,
                'build-failed': this.onBuildFailed,
            }, this);
        }
    },
    'onError': function (err) {
        console.log('Client Worker socket reported error:', err);
        if (this.conf.mode != 'all' && !this.conf.agent) {
            console.log('Nothing to do. Exiting...');
            process.exit();
        }
        else {
            if (this.conf.agent) {
                console.log( "However this process won't close because there is an agent worker on {0} which will be trying to reconnect".format(this.conf.agent));
            }
        }
    },
    'onConnect': function () {
        console.log('CLIENT CONNECTED');
        var client = this;
        var files = this.files;
        var platforms = this.conf.build;
        var build = this.build = new Build({
            logs: [],
            status: 'uploading',
            name: this.conf.name,
            number: this.conf.number,
            started: new Date(),
        }, client, null, platforms, files);
        build.id = client.id;
        if (this.conf.iossignonly) 
            build.conf.iossignonly = true,
        build.conf.logs.push(new Msg(build, this, "CW", Msg.info, "The build is requested on {2}", platforms));

        client.socket.emit('register', {
            id: client.id,
            save: !!this.conf.save,
        });
        if (!this.buildCompleted) {
            client.socket.emit('register-build', build.serialize());
            this.log(build, Msg.info, 'Reading {2} file{3}...', files.length, files.length == 1 ? '' : 's');
            serverUtils.readFiles(files, 'the servers-side sister of the cordova build client', function (err) {
                if (err) {
                    this.log(build, Msg.error, 'Error reading the input files\n{0}'.format(err));
                    client.socket.emit('fail-build', build.serialize());
                    throw 'Error reading the input files\n{0}'.format(err);
                }
                uploadFiles();
            }.bind(this));

            function uploadFiles() {
                try {
                    //registering the client, sends our client id
                    var size = 0; files.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; });
                    size && client.log(build, Msg.info, 'Uploading files to cordova build server...{2}', fileSize(size));
                    var serializedBuild = build.serialize({ files: 1 });
                    client.socket.emit('upload-build', serializedBuild);
                }
                finally {
                    //free agent's memory of output files contents
                    serverUtils.freeMemFiles(files);
                }
            }
        }
    },
    'onDisconnect': function() {
        console.log('CLIENT DISCONNECTED');
    },
    'onBuildFailed': function (result) {
        if (++this.built >= this.build.conf.platforms.length)
            this.disconnect();
    },
    'onBuildSuccess': function (build) {
        var client = this;
        if (this.conf.save) {
            var id = build.masterId || build.id;
            var locationPath = path.resolve(this.location, id);
            var files = build.outputFiles;
            files.forEach(function (file) {
                var ext = path.extname(file.file);
                file.file = [build.number, build.number && '.' || '', path.basename(file.file, ext), '.', id, ext].join('');
            });
            serverUtils.writeFiles(locationPath, files, 'the cordova build client {0}'.format(build.conf.platform), function (err) {
                if (err) {
                    client.log(build, Msg.error, 'error saving build output files on the cordova build server\n{3}', err);
                    client.onBuildFailed(result);
                }
                else done();
            });
        }
        else done;
        function done() {
            serverUtils.freeMemFiles(build.outputFiles);
            client.log(build, Msg.info, 'Build done! It took {2}.', new Date(build.conf.started).elapsed());
            if (++client.built >= client.conf.build.length)
                client.disconnect();
        }
    },
    disconnect: function () {
        try {
            this.buildCompleted = true;
            console.log('Client is disconnecting from the server since the build tasks completed.');
            this.socket.socket.disconnect();
        }
        catch (e) {
        }
        finally {
            if (!this.conf.listen.server && !this.conf.listen.agent)
                process.exit();//the client worker should disconnect and close the process since the job was done!
        }
    },
    log: function (build, priority, message, args) {
        Array.prototype.splice.call(arguments, 1, 0, this, 'CW');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        if (!this.socket.socket.connected)
            console.log(msg.toString());
        else this.socket.emit('log', msg);
    },
    parseGroupFiles: function (conf) {
        var groups = ['files'].concat(conf.platforms);
        var files = [];
        groups.forEach(function (group, isGroup) {
            conf[group].forEach(function (file) {
                var f = file.split(/;|,/);
                f.forEach(function (file) {
                    files.push({ file: file, group: isGroup ? group : null });
                });
            });
        });
        this.files = files;
    },
});