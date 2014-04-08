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
var Msg = require('../common/Msg.js');
var serverUtils = require('../common/serverUtils');

var zipArchiver;
function AgentWorker(conf, options) {
    this.id = shortid.generate();
    this.conf = conf || {};
    this.url = '{0}{1}{2}/{3}'.format(conf.protocol || 'http://', conf.server, conf.port == 80 ? '' : ':' + conf.port, 'agent');
    this.workFolder = conf.workFolder || 'work';

    process.on('exit', function () {
        this.socket.socket.connected && this.socket.disconnect();
        this.socket.socket.connected = false;
    }.bind(this));

}
AgentWorker.define({
    connect: function () {
        var conf = this.conf;
        if (!this.socket) {
            console.log('Connecting agent supporting', conf.agent, 'to:', this.url);
            this.socket = ioc.connect(this.url, {
                'max reconnection attempts': Infinity,
                'force new connection': true, // <-- Add this!
                'reconnect': true,
                'sync disconnect on unload': true,
            }).on({
                'connect': this.onConnect,
                'disconnect': this.onDisconnect,
                'error': this.onError,
                'build': this.onBuild,
                'log': function (msg) {
                    var message = new Msg(msg);
                    console.log(message.toString());
                },
            }, this);
            this.ensureWorkFolder();
            this.detectZipArchiver();
        }
        else {
            this.socket.reconnect();
        }
    },
    'onConnect': function () {
        console.log('AGENT WORKER CONNECTED supporting platforms:', this.conf.agent);
        this.socket.emit('register', {
            id: this.id,
            platforms: this.conf.agent || ['android', 'wp8'],
        });
    },
    'onDisconnect': function () {
        console.log('AGENT WORKER DISCONNECTED with platforms:', this.conf.agent);
    },
    'onError': function (err) {
        if (err && (err.code == 'ECONNREFUSED' || err.indexOf && err.indexOf('ECONNREFUSED') >= 0)) {
            if (!this._reconnecting) {
                var self = this;
                this._reconnecting = function () {
                    self.socket.socket.reconnect();
                }.defer(500);
                self.socket.on('connect', function () {
                    clearTimeout(self._reconnecting);
                    self._reconnecting = 1;
                    self.socket.removeListener('connect', arguments.callee);
                });
            }
        }
        else console.log('Agent Worker socket reported error:', err);
    },
    'onBuild': function (build) {
        if (!build) {
            this.buildFailed(build, 'No build configuration was specified!')
        }
        else if (!build.conf.platform) {
            this.buildFailed(build, 'No platform was specified for the requested build!');
        }
        else {
            this.socket.emit('building', build.id);
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
    log: function (build, priority, message, args) {
        Array.prototype.splice.call(arguments, 1, 0, this, 'AW');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        if (this.conf.mode != 'all' || !this.socket.socket.connected)
            console.log(msg.toString());
        this.socket.emit('log', msg);
    },
    ensureWorkFolder: function () {
        var workFolder = this.workFolder = path.resolve(this.workFolder);
        var agent = this;
        fs.exists(workFolder, function (exists) {
            !exists && fs.mkdir(workFolder, function (err) {
                if (err) agent.log(null, Msg.error, 'Cannot create folder: {2}', workFolder);
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
                    if (err) {
                        agent.log(build, Msg.error, 'Error executing 7z\n{2}\n{3}', err, stdErr);
                        this.buildFailed(build);
                    }
                    else done();
                });
                break;
            case 'keka7z':
                exec('/Applications/Keka.app/Contents/Resources/keka7z x {0} -o{1} -y >nul'.format(file, target), args, function (err) {
                    if (err) {
                        agent.log(build, Msg.error, 'error executing keka7z\n{2}', err);
                        this.buildFailed(build);
                    }
                    else done();
                });
                break;
            case 'unzip':
                exec('unzip -uo {0} -d {1} >nul'.format(file, target), args, function (err) {
                    if (err) {
                        agent.log(build, Msg.error, 'error executing unzip\n{2}', err);
                        this.buildFailed(build);
                    }
                    else done();
                });
                break;
            default:
                agent.log(build, Msg.error, 'cannot find 7z: {2}', zipArchiver || 'searched 7z, /Applications/Keka.app/Contents/Resources/keka7z, unzip');
                this.buildFailed(build);
                break;
        }
    },
    genericBuild: function (build, done) {
        var agent = this;
        var locationPath = path.resolve(agent.workFolder, 'input', build.id);
        var files = build.files;
        serverUtils.writeFiles(locationPath, files, 'the cordova build agent worker on {0} [a]'.format(build.conf.platform), function (err) {
            serverUtils.freeMemFiles(files);
            if (err) {
                agent.log(build, Msg.error, 'error while saving files on agent worker:\n{2}', err);
                this.buildFailed(build);
            }
            else {
                agent.log(build, Msg.info, 'extracting archives for {2}...', build.conf.platform);

                async.each(files, function (item, cb) {
                    agent.extractArchive(build, item.file, agent.workFolder, {
                        cwd: agent.workFolder,
                    }, function (err, content) {
                        // Calling cb makes it go to the next item.
                        cb(err);
                    });
                }, function (err) {// Final callback after each item has been iterated over.
                    if (err) {
                        agent.log(build, Msg.error, 'error extracting archive files\n{2}', err);
                        this.buildFailed(build);
                    }
                    else {
                        agent.log(build, Msg.info, 'building cordova on {2}...', build.conf.platform);

                        var cmd = 'cordova build {0} --{1}'.format(build.conf.platform, build.mode || 'release');
                        var run = exec(cmd, {
                            cwd: agent.workFolder,
                        }, cordovaExecuted);
                        run.stdout.on('data', function (data) {
                            if (data)//get rid of new lines at the end
                                data = data.replace(/\r?\n?$/m, '');
                            agent.log(build, Msg.build_output, data);
                        });

                        //cordovaExecuted(null, 'BUILD FAKE DONE', null);
                        function cordovaExecuted(err, stdout, stderr) {
                            err && agent.log(build, Msg.error, 'error:\n{2}', err);
                            //stdout && agent.log(build, Msg.info, '\n{2}', stdout);
                            stderr && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);
                            var e = stderr || err;
                            e && agent.buildFailed(build, e);

                            done.call(agent, e, stdout);
                        }

                        run && run.on('close', function (code) {
                            if (code) {
                                agent.log(build, Msg.error, 'child process exited with code ' + code);
                                agent.buildFailed(build);
                            }
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
            if (err) {
                this.log(build, Msg.error, 'error globbing {2}', globFiles);
                this.buildFailed(build);
            }
            else {
                files = files.map(function (file) {
                    return { file: path.resolve(workFolder, file) };
                });
                this.socket.emit('uploading', build.id);//change build status to uploading..
                serverUtils.readFiles(files, '[Agent WORKER] cordova build agent worker output files', function (err) {
                    if (err) {
                        serverUtils.freeMemFiles(files);
                        agent.buildFailed(build, err);
                    } else {
                        uploadFiles(files);
                    }
                }.bind(this));
            }
        }.bind(this));
        function uploadFiles(outputFiles) {
            try {
                build.outputFiles = outputFiles;
                var size = 0; outputFiles.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; })
                size && agent.log(build, Msg.info, 'Uploading results file(s) to cordova build server...{0}'.format(fileSize(size)));

                agent.socket.emit('build-success', build.serialize({
                    outputFiles: 1
                }));
            }
            finally {
                //free agent's memory of output files contents
                serverUtils.freeMemFiles(outputFiles);
            }
        }
    },
    buildFailed: function (build, err) {
        serverUtils.freeMemFiles(build.files);
        this.socket.emit('build-failed', build.serialize());
    },
});
