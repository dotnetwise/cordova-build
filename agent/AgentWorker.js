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


var Build = require('../common/Build.js');
var serverUtils = require('../common/serverUtils');

var zipArchiver;
function AgentWorker() {
    this.id = shortid.generate();
}
AgentWorker.define({
    connect: function (conf) {
        var url = '{0}://{1}{2}/{3}'.format(conf.protocol || "http", conf.server, conf.port == 80 ? '' : ':' + conf.port, 'agent');
        this.conf = conf;
        this.workFolder = conf.workFolder || 'work';
        this.socket = ioc.connect(url);
        this.socket.on({
            'connect': this.onConnect,
            'build': this.onBuild,
            'log': function (message) {
                console.log(message && message.message || message);
            },
        }, this);
        this.ensureWorkFolder();
        this.detectZipArchiver();
    },
    'onConnect': function () {
        this.socket.emit('register', {
            id: this.id,
            platforms: this.conf.agent || ['android', 'wp8'],
        });
    },
    'onBuild': function (build) {
        if (!build) {
            this.buildFailed(build, "No build configuration was specified!")
        }
        else if (!build.conf.platform) {
            this.buildFailed(build, "No platform was specified for the requested build!");
        }
        else {
            var buildObj = new Build(build.conf, null, this, build.conf.platform, build.files, null, build.id, build.masterId);
            build = buildObj;
            switch (build.conf.platform) {
                case 'wp8':
                    this.buildWP8(build);
                    break;
                case 'android':
                    this.buildAndroid(build);
                    break;
                case 'ios':
                    this.buildIOS(build);
                    break;
                default:
                    this.buildFailed(build, "Platform '{0}' was requested for this build but the agent doesn't support it!");
                    break;
            }
        }
    },
    log: function (build, message) {
        var buildId = build && build.id || build;
        var clientId = this.id;
        var args = Array.prototype.concat.apply([], arguments);
        Array.prototype.splice.call(args, 0, 2, clientId, buildId);
        message = ['Agent', clientId ? ' @{0}' : '', buildId ? ' about #{1}' : '', ": ", message].join('');
        message = message.format.apply(message, args);
        if (this.conf.mode != "all" || !this.socket.socket.connected)
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
                exec('7z x {0} -o{1} -y'.format(file, target), args, function (err, stdout, stdErr) {
                    if (err)
                        agent.log(build, "Error executing 7z\n{2}\n{3}", err, stdErr);
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
        var locationPath = path.resolve(agent.workFolder, 'input', build.id);
        var files = build.files;
        serverUtils.writeFiles(locationPath, files, "the cordova build agent worker on {0} [a]".format(build.conf.platform), function (err) {
            if (err) { this.log(build, err); }
            else {
                agent.log(build, 'extracting archives for {2}...', build.conf.platform);

                async.each(files, function (item, cb) {
                    agent.extractArchive(build, item.file, agent.workFolder, {
                        cwd: agent.workFolder,
                    }, function (err, content) {
                        //free agent's memory of input files' contents
                        delete item.content;
                        // Calling cb makes it go to the next item.
                        cb(err);
                    });
                }, function (err) {// Final callback after each item has been iterated over.
                    if (err)
                        agent.log(build, 'error extracting archive files\n{2}', err);
                    else {
                        agent.log(build, 'building cordova on {2}...', build.conf.platform);

                        var cmd = 'cordova build {0} --{1}'.format(build.conf.platform, build.mode || 'release');
                        var run = null && exec(cmd, {
                            cwd: agent.workFolder,
                        }, cordovaExecuted);
                        cordovaExecuted(null, "BUILD FAKE DONE", null);
                        function cordovaExecuted(err, stdout, stderr) {
                            err && agent.log(build, "error:\n{2}", err);
                            stdout && agent.log(build, "\n{2}", stdout);
                            stderr && agent.log(build, 'stderror:\n{2}\n', stderr);
                            var e = err || stderr;
                            e && agent.buildFailed(build, e);

                            done.call(agent, e, stdout);
                        }
                        //run.stdout.on('data', function (stdout) {
                        //    agent.log(build, "\n{2}", stdout);
                        //});
                        //run.stderr.on('data', function (stderr) {
                        //    agent.log(build, 'stderror:\n{2}\n', stderr);
                        //});

                        //run.on('error', function (err) {
                        //    agent.log(build, 'error\n{2}\n', err);
                        //});

                        run && run.on('close', function (code) {
                            code && agent.log(build, 'child process exited with code ' + code);
                        });

                    }
                });
            }
        }.bind(this));
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
            serverUtils.readFiles(files, '[Agent WORKER] cordova build agent worker output files', function (err) {
                if (err) {
                    agent.buildFailed(build, err);
                } else {
                    uploadFiles(files);
                }
            }.bind(this));
        }.bind(this));
        function uploadFiles(outputFiles) {
            build.outputFiles = outputFiles;
            var size = 0; outputFiles.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; })
            size && agent.log(build, 'Uploading results file(s) to cordova build server...{0}'.format(fileSize(size)));

            agent.socket.emit('build-success', build.serialize({
                outputFiles: 1
            }));
            //free agent's memory of output files contents
            outputFiles.forEach(function (file) { delete file.content.data; });
        }
    },
    buildFailed: function (build, err) {
        serverUtils.freeMemFiles(build.files);
        this.socket.emit('build-failed', build.serialize());
    },
});