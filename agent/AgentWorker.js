module.exports = AgentWorker;
var $ = require('stringformat');
var async = require('async');
var shortid = require('shortid');
var fileSize = require('filesize');
var multiGlob = require('multi-glob');

var ioc = require('socket.io/node_modules/socket.io-client');
var fs = require('fs.extra');
var path = require('path');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');


var Build = require('../common/Build.js');
var Msg = require('../common/Msg.js');
var splice = Array.prototype.splice;
var serverUtils = require('../common/serverUtils');
var maxBuffer = 524288;

var zipArchiver;
function AgentWorker(conf, options) {
    this.id = shortid.generate();
    this.conf = conf || {};
    this.url = '{0}{1}{2}/{3}'.format(conf.protocol || 'http://', conf.server, conf.port == 80 ? '' : ':' + conf.port, 'agent');
    this.workFolder = conf.agentwork || 'work';

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
        //if (err && (err.code == 'ETIMEDOUT'err.code == 'ECONNREFUSED' || err.indexOf && err.indexOf('ECONNREFUSED') >= 0)) {
        if (!this._reconnecting) {
            console.log('Agent Worker will attempt to reconnect because it the socket reported an error:', err);
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
        //}
        //else 
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
                    this.buildFailed(build, "Platform '{2}' was requested for this build but this agent doesn't support it!", build.conf.platform);
                    break;
            }
        }
    },
    log: function (build, priority, message, args) {
        splice.call(arguments, 1, 0, this, 'AW');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        if (this.conf.mode != 'all' || !this.socket.socket.connected)
            console.log(msg.toString());
        this.socket.emit('log', msg);
    },
    ensureWorkFolder: function (done) {
        var workFolder = this.workFolder = path.resolve(this.workFolder);
        var agent = this;

        mkdirp(workFolder, function (err) {
            if (err) {
                agent.log(null, Msg.error, 'Cannot create folder: {2}', workFolder);
                process.env.PWD = workFolder;
            }
            done && done(err, workFolder);
        });
    },
    detectZipArchiver: function () {
        exec('7z', { maxBuffer: maxBuffer }, function (err) {
            if (!err)
                zipArchiver = '7z';
            else exec('/Applications/Keka.app/Contents/Resources/keka7z', { maxBuffer: maxBuffer }, function (err) {
                if (!err)
                    zipArchiver = 'keka7z';
                else exec('unzip', { maxBuffer: maxBuffer }, function (err) {
                    if (!err)
                        zipArchiver = 'unzip';
                });
            });
        });
    },
    extractArchive: function (build, file, target, opts, done) {
        var agent = this;
        switch (zipArchiver) {
            case '7z':
                exec('7z x {0} -o{1} -y'.format(file, target), opts, function (err, stdout, stderr) {
                    if (err || stderr) return agent.buildFailed(build, 'Error executing 7z\n{2}\n{3}', err, stderr);
                    done();
                });
                break;
            case 'keka7z':
                exec('/Applications/Keka.app/Contents/Resources/keka7z x {0} -o{1} -y >nul'.format(file, target), opts, function (err) {
                    if (err || stderr) return agent.buildFailed(build, 'error executing keka7z\n{2}', err);
                    done();
                });
                break;
            case 'unzip':
                exec('unzip -uo {0} -d {1} >nul'.format(file, target), opts, function (err) {
                    if (err || stderr) return agent.buildFailed(build, 'error executing unzip\n{2}', err);
                    done();
                });
                break;
            default:
                agent.buildFailed(build, 'cannot find 7z: {2}', zipArchiver || 'searched 7z, /Applications/Keka.app/Contents/Resources/keka7z, unzip');
                break;
        }
    },
    genericBuild: function (build, filesDone, done, onExecutingCordovaBuild) {
        var agent = this;
        var locationPath = path.resolve(agent.workFolder, build.id);
        var files = build.files;

        function buildFailed(args) {
            splice.call(arguments, 0, 0, build);
            agent.buildFailed.apply(agent, arguments);
            splice.call(arguments, 0, 1);
            done.apply(agent, arguments);
        }

        return agent.ensureWorkFolder(s1EmptyWorkFolder);

        function s1EmptyWorkFolder(err) {
            if (err) return buildFailed('error creating the working folder {2}\n{3}', agent.workFolder, err);
            var glob = agent.workFolder;
            if (!/(\/|\\)$/.test(glob))
                glob += '/';
            glob += '*';
            multiGlob.glob(glob, function (err, files) {
                if (err) return s2WriteFiles(err);
                async.each(files, function (file, cb) {
                    fs.remove(file, function (err) {
                        cb(err);
                    });
                }, s2WriteFiles);
            });
        }

        function s2WriteFiles(err) {
            if (err) return buildFailed('error cleaning the working folder {2}\n{3}', agent.workFolder, err);
            serverUtils.writeFiles(locationPath, files, 'the cordova build agent worker on {0}'.format(build.conf.platform), s4ProcessFiles);
        }

        function s4ProcessFiles(err) {
            serverUtils.freeMemFiles(files);
            if (err) return buildFailed('error while saving files on agent worker:\n{2}', err);
            agent.log(build, Msg.info, 'extracting archives for {2}...', build.conf.platform);

            async.each(files, s5ExtractFile, s6AllFilesExtracted);
        };
        function s5ExtractFile(item, cb) {
            agent.extractArchive(build, item.file, agent.workFolder, {
                cwd: agent.workFolder,
                maxBuffer: maxBuffer,
            }, cb);
        };

        function s6AllFilesExtracted(err) {// Final callback after each item has been iterated over.
            if (err) return buildFailed('error extracting archive files\n{2}', err);
            if (filesDone)
                filesDone.call(agent, s6DecideExecuteCordovaBuild);
            else s6DecideExecuteCordovaBuild();
        }
        function s6DecideExecuteCordovaBuild() {
            if (onExecutingCordovaBuild)
                onExecutingCordovaBuild.call(agent, build, function (executeStandardCordovaBuild) {
                    executeStandardCordovaBuild !== false && s7BuildCordova();
                }, s8BuildExecuted, buildFailed);
            else s7BuildCordova();
        }
        function s7BuildCordova(err) {
            if (err) return buildFailed('error starting build\n{2}', err);
            agent.log(build, Msg.info, 'building cordova on {2}...', build.conf.platform);

            var cmd = 'cordova build {0} --device --{1}'.format(build.conf.platform, build.mode || 'release');
            agent.log(build, Msg.info, 'Executing {2}', cmd);
            var cordova_build = exec(cmd, {
                cwd: agent.workFolder,
                maxBuffer: maxBuffer,
            }, s8BuildExecuted)
            .on('close', function (code) {
                if (code) return buildFailed('child process exited with code ' + code);
            });
            cordova_build.stdout.on('data', function (data) {
                if (data)//get rid of new lines at the end
                    data = data.replace(/\r?\n?$/m, '');
                agent.log(build, Msg.build_output, data);
            });
            cordova_build.stderr.on('data', function (data) {                if (data)//get rid of new lines at the end                    data = data.replace(/\r?\n?$/m, '');                agent.log(build, Msg.error, data);            });
        }
        function s8BuildExecuted(err, stdout, stderr) {
            if (stdout) 
                agent.log(build, Msg.build_output, stdout);
            if (err)
                 agent.log(build, Msg.error, 'error:\n{2}', err);
            if (stderr)
                 ((err && err.message || err && err.indexOf && err || '').indexOf(stderr) < 0) && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);
            
            var e = stderr || err;
            if (e) return agent.buildFailed(build);

            done.call(agent, e);
        }
    },
    buildWP8: function (build) {
        this.genericBuild(build, null, function (err) {
            !err && this.buildSuccess(build, 'platforms/wp8/Bin/Release/*.xap');
        });
    },
    buildIOS: function (build) {
        var agent = this;
        this.genericBuild(build, function (startBuild) {
            var globs = path.resolve(agent.workFolder, 'platforms/ios/cordova/**/*');
            //console.log('globs', globs)
            multiGlob.glob(globs, function (err, files) {
                if (err) return startBuild(err);
                async.each(files, function (file, cb) {
                    //console.log('chmodding', file)
                    fs.chmod(file, 511 /*777 on nix machines in base 8*/, function (err) {
                        cb.defer(0, null, err);
                    });
                }, function (err) {
                    startBuild.defer(0, agent, err);
                });
            });
        }, function (err) {
            if (err)
                return buildFailed(err);
            function buildFailed() {
                splice.call(arguments, 0, 0, build);
                return agent.buildFailed.apply(agent, arguments);
            }
            agent.log(build, Msg.info, 'creating a new signed ipa');
            if (!build.conf.iosprojectpath) return buildFailed('-iosprojectpath:"platforms/ios/build/device/your-project-name.app" was not being specified!');
            if (!build.conf.iosprovisioningpath) return buildFailed('-iosprovisioningpath:"path-to-your-provision-file.mobileprovision" was not being specified!');
            if (!build.conf.iosprovisioningname) return buildFailed('-iosprovisioningname:"your-provision-name" was not being specified!');
            var pathOfIpa = path.resolve(agent.workFolder, "platforms/ios/", path.basename(build.conf.iosprojectpath || 'app.app', '.app') + '.ipa');
            var iosProjectPath = path.resolve(agent.workFolder, build.conf.iosprojectpath);
            if (!fs.statSync(iosProjectPath).isDirectory()) return buildFailed('-iosprojectpath:"{2}" does not exist or not a directory! Full path: {3}', build.conf.iosprojectpath, iosProjectPath);
            if (!fs.existsSync(build.conf.iosprovisioningpath)) return buildFailed('-iosprovisioningpath:"{2}" file does not exist!', build.conf.iosprojectpath);

            var execPath = '/usr/bin/xcrun -sdk iphoneos PackageApplication -v "{0}" -o "{1}" -embed "{2}"'.format(iosProjectPath, pathOfIpa, build.conf.iosprovisioningname, build.conf.iosprovisioningpath);
            agent.log(build, Msg.info, 'executing: {2}', execPath);
            var xcrun = exec(execPath, { maxBuffer: maxBuffer }, function (err, stdout, stderr) {
                stdout && agent.log(build, Msg.build_output, '{2}', stdout);
                err && agent.log(build, Msg.error, 'error:\n{2}', err);
                stderr && (err && err.message || '').indexOf(stderr) < 0 && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);
                var e = stderr || err;
                if (e) return agent.buildFailed(build, '');
                agent.buildSuccess(build, pathOfIpa);
            }).on('close', function (code) {
                if (code) return agent.buildFailed(build, 'sign process exited with code {2}', code);
            });
            xcrun.stdout.on('data', function (data) {
                agent.log(build, Msg.build_output, data);
            });;
            xcrun.stderr.on('data', function (data) {                agent.log(build, Msg.error, data);            });;
        });
    },
    buildAndroid: function (build) {
        var agent = this;
        this.genericBuild(build, null, function (err) {
            !err && agent.buildSuccess(build, 'platforms/android/ant-build/*.apk');
        });
    },
    buildSuccess: function (build, globFiles) {

        var agent = this;
        var workFolder = agent.workFolder;
        multiGlob.glob(globFiles, {
            cwd: workFolder,
        }, function (err, files) {
            if (err) return agent.buildFailed(build, 'error globbing {2}', globFiles);
            files = files.map(function (file) {
                return { file: path.resolve(workFolder, file) };
            });
            agent.socket.emit('uploading', build.id);//change build status to uploading..
            serverUtils.readFiles(files, '[Agent WORKER] cordova build agent worker output files', function (err) {
                if (err) {
                    serverUtils.freeMemFiles(files);
                    agent.buildFailed(build, err);
                } else {
                    uploadFiles(files);
                }
            });
        });
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
    buildFailed: function (build, err, args) {
        if (err) {
            splice.call(arguments, 1, 0, Msg.error);
            this.log.apply(this, arguments);
            this.log.call(this, build, Msg.error, '*** BUILD FAILED on {2} ***', build && build.conf && build.conf.platform || 'unknown platform');
        }

        serverUtils.freeMemFiles(build.files);
        this.socket.emit('build-failed', build.serialize());
    },
});
