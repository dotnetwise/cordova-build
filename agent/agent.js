module.exports = agentApi;
function agentApi(config) {
    var $ = require('stringformat');
    var cordova = require('cordova');
    var exec = require('child_process').exec;
    var async = require('async');

    var ioc = require('socket.io/node_modules/socket.io-client');
    var fs = require('fs');
    var path = require('path');
    var buildAgent = ioc.connect('http://' + config.server + ':' + config.port + '/agent');
    buildAgent.on({
        'connect': function (abc) {
            buildAgent.emit('register', {
                platforms: ['android', 'wp8'],
            });
        },
        'build': function (build) {
            switch (build.platform) {
                case 'wp8':
                    buildWP8(build);
                    break;
                case 'android':
                    buildAndroid(build);
                    break;
                case 'ios':
                    buildIOS(build);
                    break;
            }
        },
        'log': function(message) {
            console.log(message);
        }
    });
    var zipArchiver = null;
    exec('7z', function (err) {
        if (!err)
            zipArchiver = '7z';
        else exec('/Applications/Keka.app/Contents/Resources/keka7z', function (err) {
            if (!err)
                zipArchiver = 'keka7z';
            else exec('unzip', function (err) {
                if (!err)
                    zipArchiver = 'unzip';
            });
        });
    });

    function extractArchive(file, target, args, done) {
        switch (zipArchiver) {
            case '7z':
                exec('7z x {0} -o{1} -y >nul'.format(file, target), args, function (err) {
                    if (err)
                        console.log("Agent: error executing 7z\n{0}".format(err));
                    else done();
                });
                break;
            case 'keka7z':
                exec('/Applications/Keka.app/Contents/Resources/keka7z x {0} -o{1} -y >nul'.format(file, target), args, function (err) {
                    if (err)
                        console.log("Agent: error executing keka7z\n{0}".format(err));
                    else done();
                });
                break;
            case 'unzip':
                exec('unzip -uo {0} -d {1} >nul'.format(file, target), args, function (err) {
                    if (err)
                        console.log("Agent: error executing unzip\n{0}".format(err));
                    else done();
                });
                break;
            default:
                console.log('Agent: cannot find 7z: {0}'.format(zipArchiver || 'searched 7z, keka7z, unzip'));
                break;
        }
    }
    var tmpFolder = 'work';
    tmpFolder = path.resolve(tmpFolder);
    fs.exists(tmpFolder, function (exists) {
        !exists && fs.mkdir(tmpFolder, function (err) {
            if (err) console.log('Agent: cannot create folder: {0}'.format(tmpFolder));
        });
    });
    function genericBuild(build) {
        process.env.PWD = tmpFolder;
        console.log('Agent: extracting archives...{0}'.format(build.id));
        async.each(build.conf.files, function (item, cb) {
            extractArchive(item.file, tmpFolder, {
                cwd: tmpFolder,
            }, function (err, content) {
                // Calling cb makes it go to the next item.
                cb(err);
            });
        }, function (err) {// Final callback after each item has been iterated over.
            if (err)
                console.error('Agent: Error extracting archive files\n{0}'.format(err));
            else {
                console.log('Agent: building cordova...');
                cordova.build({
                    verbose: true,
                    platforms: [build.platform],
                    options: [],
                }, function(err) {

                });
            }
        });
    }

    function buildWP8(build) {
        genericBuild(build);
    }
    function buildIOS(build) {
        genericBuild(build);
    }
    function buildAndroid(build) {
        genericBuild(build);
    }
}