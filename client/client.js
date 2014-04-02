module.exports = clientApi;

function clientApi(config) {

    var ioc = require('socket.io/node_modules/socket.io-client');
    var fs = require('fs');
    var Build = require('../common/Build.js');
    var async = require('async');
    var fileSize = require('filesize');
    //var chat = ioc.connect('http://' + config.server + ':' + config.port + '/chat');
    var buildClient = ioc.connect('http://' + config.server + ':' + config.port + '/client');

    //chat.on('connect', function () {
    //    chat.emit('hi!');
    //});
    //chat.on('chat', function () {
    //    console.log('aa');
    //});
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

    buildClient.on({
        'connect': function (abc) {
            console.log('Client: reading {0} files...'.format(files.length));
            async.each(files, function (item, cb) {
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
                var size = 0; files.forEach(function (file) { size += file.content.length; });
                console.log('Client: uploading files...{0}'.format(fileSize(size)));
                buildClient.emit('request-build', new Build({
                    files: files,
                    platforms: config.build || ['android', 'ios', 'wp8'],
                }));
            });
        },
        'log': function (data) {
            console.log(data);
        },
        'build-done': function (build) {
            console.log("Client: build {0} done!", build.uuid);
        },
    });;
}
