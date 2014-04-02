module.exports = AgentWorker;
var $ = require('stringformat');
var async = require('async');
var shortid = require('shortid');
var fileSize = require('filesize');
var multiGlob = require('multi-glob');

var ioc = require('socket.io/node_modules/socket.io-client');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var zipArchiver;
function AgentWorker() {
    this.id = shortid.generate();
}
AgentWorker.define({
    connect: function (config) {
        var url = '{0}://{1}{2}/{3}'.format(config.protocol || "http", config.server, config.port == 80 ? '' : ':' + config.port, 'agent');
        this.config = config;
        this.workFolder = config.workFolder || 'work';
        this.socket = ioc.connect(url);
        this.socket.on({
            'connect': this.onConnect,
            'build': function (build) {
                switch (build.platform) {
                    case 'wp8':
                        this.buildWP8(build);
                        break;
                    case 'android':
                        this.buildAndroid(build);
                        break;
                    case 'ios':
                        this.buildIOS(build);
                        break;
                }
            },
            'log': function (message) {
                console.log(message && message.message || message);
            },
        }, this);
        this.ensureWorkFolder();
        this.detectZipArchiver();
    },
    onConnect: function () {
        this.socket.emit('register', {
            id: this.id,
            platforms: ['android', 'wp8'],
        });
    },
    log: function (build, message) {
        var buildId = build && build.id || build;
        var clientId = this.id;
        var args = Array.prototype.concat.apply([], arguments);
        Array.prototype.splice.call(args, 0, 2, clientId, buildId);
        message = ['Agent', clientId ? ' @{0}' : '', buildId ? ' about #{1}' : '', ": ", message].join('');
        message = message.format.apply(message, args);
        if (this.config.mode != "all" || !this.socket.socket.connected)
            console.log(message);
        this.emitLog({
            message: message,
            buildId: buildId,
        });
    },
    emitLog: function (message) {
        this.socket.emit('log', message);
    },
    ensureWorkFolder: function () {
        var workFolder = this.workFolder = path.resolve(this.workFolder);
        var agent = this;
        fs.exists(workFolder, function (exists) {
            !exists && fs.mkdir(workFolder, function (err) {
                if (err) agent.log(null, 'Cannot create folder: {2}', workFolder);
            });
        });
        process.env.PWD = workFolder;
    },
    detectZipArchiver: function () {
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
    },
    extractArchive: function (build, file, target, args, done) {
        var agent = this;
        switch (zipArchiver) {
            case '7z':
                exec('7z x {0} -o{1} -y >nul'.format(file, target), args, function (err) {
                    if (err)
                        agent.log(build, "Error executing 7z\n{2}", err);
                    else done();
                });
                break;
            case 'keka7z':
                exec('/Applications/Keka.app/Contents/Resources/keka7z x {0} -o{1} -y >nul'.format(file, target), args, function (err) {
                    if (err)
                        agent.log(build, "error executing keka7z\n{2}", err);
                    else done();
                });
                break;
            case 'unzip':
                exec('unzip -uo {0} -d {1} >nul'.format(file, target), args, function (err) {
                    if (err)
                        agent.log(build, "error executing unzip\n{2}", err);
                    else done();
                });
                break;
            default:
                agent.log(build, 'cannot find 7z: {2}', zipArchiver || 'searched 7z, keka7z, unzip');
                break;
        }
    },
    genericBuild: function (build, done) {
        var agent = this;
        agent.log(build, 'extracting archives for {2}...', build.platform);
        var files = build.conf.files;
        var agent = this;
        async.each(files, function (item, cb) {
            agent.extractArchive(build, item.file, agent.workFolder, {
                cwd: agent.workFolder,
            }, function (err, content) {
                // Calling cb makes it go to the next item.
                cb(err);
            });
        }, function (err) {// Final callback after each item has been iterated over.
            if (err)
                agent.log(build, 'error extracting archive files\n{2}', err);
            else {
                agent.log(build, 'building cordova on {2}...', build.platform);

                var cmd = 'cordova build {0} --{1}'.format(build.platform, build.mode || 'release');
                var run = exec(cmd, {
                    cwd: agent.workFolder,
                }, function (err, stdout, stderr) {
                    err && agent.log(build, "error:\n{2}", err);
                    stdout && agent.log(build, "\n{2}", stdout);
                    stderr && agent.log(build, 'stderror:\n{2}\n', stderr);
                    var e = err || stderr;
                    e && agent.buildFailed(build, e);

                    done.call(agent, e, stdout);
                });
                //run.stdout.on('data', function (stdout) {
                //    agent.log(build, "\n{2}", stdout);
                //});
                //run.stderr.on('data', function (stderr) {
                //    agent.log(build, 'stderror:\n{2}\n', stderr);
                //});

                //run.on('error', function (err) {
                //    agent.log(build, 'error\n{2}\n', err);
                //});

                run.on('close', function (code) {
                    code && agent.log(build, 'child process exited with code ' + code);
                });

            }
        });
    },
    buildWP8: function (build) {
        this.genericBuild(build, function (err, log) {
            !err && this.buildSuccess(build, log, 'platforms/wp8/Bin/Release/*.xap');
        });
    },
    buildIOS: function (build) {
        this.genericBuild(build, function (err, log) {
            !err && this.buildSuccess(build, log, 'platforms/wp8/Bin/Release/*.ipa');
        });
    },
    buildAndroid: function (build) {
        this.genericBuild(build, function (err, log) {
            !err && this.buildSuccess(build, log, 'platforms/android/ant-build/*.apk');
        });
    },
    buildSuccess: function (build, log, globFiles) {
        var agent = this;
        var workFolder = this.workFolder;
        multiGlob.glob(globFiles, {
            cwd: workFolder,
        }, function (err, files) {
            err && this.log(build, "error globbing {2}", globFiles);
            files = files.map(function (file) {
                return { file: path.resolve(workFolder, file) };
            });
            files.length ? async.each(files, function (item, cb) {
                fs.readFile(item.file, function (err, content) {
                    if (!err) {
                        item.content = content;
                    }
                    else {
                        agent.log(build, 'Error reading the output file {2}\n{3}'.format(item.file, err));
                    }
                    // Calling cb makes it go to the next item.
                    cb(err);
                });
            }, function (err) {// Final callback after each item has been iterated over.
                if (!err)
                    uploadFiles(files);
                else agent.buildFailed(build, err);
            }) : uploadFiles(files);
        }.bind(this));
        function uploadFiles(files) {
            var inputFiles = build.conf.files;            
            delete build.conf.files;
            build.outputFiles = files;
            var size = 0; files.forEach(function (file) { size += file.content.length; });
            size && agent.log(build, 'Uploading results file(s) to cordova build server...{0}'.format(fileSize(size)));

            agent.socket.emit('build-success', {
                build: build,
                log: log,
            });
            build.conf.files = inputFiles
        }
    },
    buildFailed: function (build, err) {
        var files = build.conf.files;
        delete build.conf.files;
        agent.socket.emit('build-failed', {
            build: build,
            log: err,
        });
        build.conf.files = files;
    },
});