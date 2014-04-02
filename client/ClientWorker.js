module.exports = ClientWorker;
var ioc = require('socket.io/node_modules/socket.io-client');
var fs = require('fs');
var Build = require('../common/Build.js');
var async = require('async');
var fileSize = require('filesize');
var shortid = require('shortid');

function ClientWorker() {
    this.id = shortid.generate();
}
ClientWorker.define({
    connect: function (config) {
        var url = '{0}://{1}{2}/{3}'.format(config.protocol || "http", config.server, config.port == 80 ? '' : ':' + config.port, 'client');
        this.config = config;
        this.socket = ioc.connect(url);
        this.parseGroupFiles(config);
        this.built = 0;
        this.socket.on({
            'connect': this.onConnect,
            'log': function (message) {
                console.log(message && message.message || message);
            },
            'build-success': function (result) {
                var build = result.build;
                this.log(build, "Build done!");
                if (++this.built >= this.build.conf.platforms.length)
                    this.disconnect();
            },
            'build-failed': function (result) {
                this.log(build, "Build failed!");
                if (++this.built >= this.build.conf.platforms.length)
                    this.disconnect();
            },
        }, this);
    },
    disconnect: function () {
        try {
            this.socket.disconnect();
        }
        catch (e) {
            process.exit();
        }
    },
    onConnect: function () {

        var client = this;
        var files = this.files;
        var build = this.build = new Build({
            files: files,
            platforms: this.config.build || ['android', 'ios', 'wp8'],
        });

        client.socket.emit('register', {
            id: client.id,
        });
        this.log(build, 'Reading {2} file{3}...', files.length, files.length == 1 ? "" : "s");
        files.length ? async.each(files, function (item, cb) {
            fs.readFile(item.file, function (err, content) {
                if (!err) {
                    item.content = content;
                }
                // Calling cb makes it go to the next item.
                cb(err);
            });
        }, function (err) {// Final callback after each item has been iterated over.
            if (err)
                throw 'Error reading the input files\n{0}'.format(err);
            uploadFiles();
        }) : uploadFiles();

        function uploadFiles() {
            //registering the client, sends our client id
            var size = 0; files.forEach(function (file) { size += file.content.length; });
            size && client.log(build, 'Uploading files to cordova build server...{0}'.format(fileSize(size)));
            client.socket.emit('request-build', build);
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
    parseGroupFiles: function (config) {
        var groups = ['files', 'wp8', 'ios', 'android'];
        var files = [];
        groups.forEach(function (group, isGroup) {
            config[group].forEach(function (file) {
                var f = file.split(/;/);
                f.forEach(function (file) {
                    files.push({ file: file, group: isGroup ? group : null });
                });
            });
        });
        this.files = files;
    },
});
