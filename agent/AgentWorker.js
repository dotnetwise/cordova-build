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
var tee = path.resolve(__dirname, '../bin/tee.exe');
var egrep = path.resolve(__dirname, '../bin/egrep.exe');


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
                'cancel': this.onCancelBuild,
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
        this.emit('register', {
            id: this.id,
            name: this.conf.agentname,
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
    'onCancelBuild': function () {
        this.build.conf.status = 'cancelled';
        try {
            this.exec && this.exec.kill();
        }
        catch (e) {
        }
    },
    'onBuild': function (build) {
        if (!build) {
            return this.buildFailed(build, 'No build configuration was specified!')
        }
        if (!build.conf || !build.conf.platform) {
            return this.buildFailed(build, 'No platform was specified for the requested build!');
        }
        this.emit('building', build.id);
        var buildObj = new Build(build.conf, null, this, build.conf.platform, build.files, null, build.id, build.masterId);
        this.build = build = buildObj;
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
    },
    emit: function () {
        if (!this.build || this.build.conf && this.build.conf.status != 'cancelled') {
            return this.socket.emit.apply(this.socket, arguments);
        }
        return false;
    },
    log: function (build, priority, message, args) {
        if (/Command failed/i.test(message)) {
            try {
                throw new Error("agent worker stack");
            }
            catch (e) {
                message += e.stack;
            }
        }
        splice.call(arguments, 1, 0, this, 'AW');
        var msg = new Msg();
        msg.update.apply(msg, arguments);

        if (this.conf.mode != 'all' || !this.socket.socket.connected)
            console.log(msg.toString());
        this.emit('log', msg);
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
        var zipper = exec('7z', { maxBuffer: maxBuffer }, function (err) {
            if (!err)
                zipArchiver = '7z';
            else zipper = exec('/Applications/Keka.app/Contents/Resources/keka7z', { maxBuffer: maxBuffer }, function (err) {
                if (!err)
                    zipArchiver = 'keka7z';
                //else exec('unzip', { maxBuffer: maxBuffer }, function (err) {
                //    if (!err)
                //        zipArchiver = 'unzip';
                //});
            });
        });
    },
    modifyArchive: function (build, modifier, file, spaceSeparatedNames, opts, done) {
        var agent = this;
        var verb = modifier == 'a' ? 'adding' : 'removing';
        var into = modifier == 'a' ? 'to' : 'from';
        var errMsg = 'Error {2} {3} {4} archive via {5}\n{6}\n{7}';
        switch (zipArchiver) {
            case '7z':
                var zipper = exec('7z {0} -tzip {1} {2}'.format(modifier, file, spaceSeparatedNames), opts, function (err, stdout, stderr) {
                    if (build.conf.status === 'cancelled') return;
                    //stdout && agent.log(build, Msg.debug, '{2}', stdout);
                    if (err) return agent.buildFailed(build, errMsg, verb, spaceSeparatedNames, into, '7z', err, stderr);
                    done();
                });
                break;
            case 'keka7z':
                var zipper = exec('/Applications/Keka.app/Contents/Resources/keka7z d -tzip {0} {1}'.format(file, spaceSeparatedNames), opts, function (err, stdout, stderr) {
                    if (build.conf.status === 'cancelled') return;
                    //stdout && agent.log(build, Msg.debug, '{2}', stdout);
                    if (err) return agent.buildFailed(build, errMsg, verb, spaceSeparatedNames, into, 'keka7z', err, stderr);
                    done();
                });
                break;
                //case 'unzip':
                //    exec('unzip -uo {0} -d {1} '.format(file, target), opts, function (err, stdout, stderr) {
                //        stdout && agent.log(build, Msg.debug, '{2}', stdout);
                //        if (err || stderr) return agent.buildFailed(build, 'error executing unzip\n{2}\n{3}', err, stderr);
                //        done();
                //    });
                //    break;
            default:
                return agent.buildFailed(build, 'cannot find 7z: {2}', zipArchiver || 'searched 7z, /Applications/Keka.app/Contents/Resources/keka7z');
        }
    },
    extractArchive: function (build, file, target, opts, done) {
        var agent = this;
        switch (zipArchiver) {
            case '7z':
                var zipper = exec('7z x {0} -o{1} -y >nul'.format(file, target), opts, function (err, stdout, stderr) {
                    if (build.conf.status === 'cancelled') return;
                    //stdout && agent.log(build, Msg.debug, '{2}', stdout);
                    if (err) return agent.buildFailed(build, 'Error executing 7z\n{2}\n{3}', err, stderr);
                    done();
                });
                break;
            case 'keka7z':
                var zipper = exec('/Applications/Keka.app/Contents/Resources/keka7z x {0} -o{1} -y'.format(file, target), opts, function (err, stdout, stderr) {
                    if (build.conf.status === 'cancelled') return;
                    //stdout && agent.log(build, Msg.debug, '{2}', stdout);
                    if (err) return agent.buildFailed(build, 'error executing keka7z\n{2}\n{3}', err, stderr);
                    done();
                });
                break;
                //case 'unzip':
                //    exec('unzip -uo {0} -d {1} '.format(file, target), opts, function (err, stdout, stderr) {
                //        stdout && agent.log(build, Msg.debug, '{2}', stdout);
                //        if (err || stderr) return agent.buildFailed(build, 'error executing unzip\n{2}\n{3}', err, stderr);
                //        done();
                //    });
                //    break;
            default:
                return agent.buildFailed(build, 'cannot find 7z: {2}', zipArchiver || 'searched 7z, /Applications/Keka.app/Contents/Resources/keka7z');
        }
    },
    genericBuild: function (build, filesDone, done, onExecutingCordovaBuild, command) {
        command = command || "cordova build {0} {1} --{2}";
        var agent = this;
        var locationPath = path.resolve(agent.workFolder, build.Id());
        var files = build.files;

        function buildFailed(args) {
            splice.call(arguments, 0, 0, build);
            return agent.buildFailed.apply(agent, arguments);
            //splice.call(arguments, 0, 1);
            //done.apply(agent, arguments);
        }

        return s1Cleanup();
        function s1Cleanup() {
            if (build.conf.status === 'cancelled') return;
            serverUtils.cleanLastFolders(agent.conf.keep, agent.workFolder + '/*', s1CleanupDone);
        }
        function s1CleanupDone(err) {
            if (build.conf.status === 'cancelled') return;
            err && agent.log(build, Msg.debug, 'Error while cleaning up last {2} folders in AGENT {3} working folder {4}:\n{5}', agent.conf.keep, agent.conf.platform, agent.workFolder, err);
            agent.ensureWorkFolder(s2EmptyWorkFolder);
        }

        function s2EmptyWorkFolder(err) {
            if (build.conf.status === 'cancelled') return;
            if (err) return buildFailed('error creating the working folder {2}\n{3}', agent.workFolder, err);
            var glob = locationPath;
            if (!/(\/|\\)$/.test(glob))
                glob += '/';
            glob += '*';
            multiGlob.glob(glob, function (err, files) {
                if (err) return s2WriteFiles(null);
                async.each(files, function (file, cb) {
                    fs.remove(file, function (err) {
                        cb(err);
                    });
                }, s3WriteFiles);
            });
        }

        function s3WriteFiles(err) {
            if (build.conf.status === 'cancelled') return;
            if (err) return buildFailed('error cleaning the working folder {2}\n{3}', agent.workFolder, err);
            files.forEach(function (file) {
                file.file = path.resolve(locationPath, path.basename(file.file));
            });
            serverUtils.writeFiles(locationPath, files, 'the cordova build agent worker on {0}'.format(build.conf.platform), s4ProcessFiles);
        }

        function s4ProcessFiles(err) {
            if (build.conf.status === 'cancelled') return;
            serverUtils.freeMemFiles(files);
            if (err) return buildFailed('error while saving files on agent worker:\n{2}', err);
            agent.log(build, Msg.info, 'extracting archives for {2}...', build.conf.platform);

            async.each(files, s5ExtractFile, s6AllFilesExtracted);
        };
        function s5ExtractFile(item, cb) {
            if (build.conf.status === 'cancelled') return;
            agent.log(build, Msg.debug, 'extracting {2} to {3}', item.file, locationPath);
            agent.extractArchive(build, item.file, locationPath, {
                cwd: locationPath,
                maxBuffer: maxBuffer,
            }, cb);
        };

        function s6AllFilesExtracted(err) {// Final callback after each item has been iterated over.
            if (build.conf.status === 'cancelled') return;
            if (err) return buildFailed('error extracting archive files\n{2}', err);
            if (filesDone)
                filesDone.call(agent, s6ModifyConfigXML);
            else s6ModifyConfigXML();
        }
        function s6ModifyConfigXML(cmd) {
            command = cmd || command;
            if (build.conf.status === 'cancelled') return;
            var bundleid = build.conf[build.conf.platform + 'bundleid'] || build.conf.bundleid;
            if (bundleid) {
                var configPath = path.resolve(agent.workFolder, build.Id(), 'config.xml');
                agent.log(build, Msg.info, 'Changing bundleid to {2} in config.xml', bundleid);
                fs.readFile(configPath, 'utf8', function (err, data) {
                    if (err) {
                        if (err) return buildFailed('error reading {2}\n{3}', configPath, err);
                    }
                    var result = data.replace(/\<widget id\=(\"|\').*?(\"|\')/g, "<widget id=\"{0}\"".format(bundleid));

                    fs.writeFile(configPath, result, 'utf8', function (err) {
                        if (err) return buildFailed('error writing bundleid {2} into {3}\n{4}', bundleid, configPath, err);
                        s6DecideExecuteCordovaBuild();
                    });
                });
            }
            else s6DecideExecuteCordovaBuild();
        }
        function s6DecideExecuteCordovaBuild() {
            if (build.conf.status === 'cancelled') return;
            if (onExecutingCordovaBuild)
                onExecutingCordovaBuild.call(agent, build, function (err, executeStandardCordovaBuild, args) {
                    executeStandardCordovaBuild !== false && s7BuildCordova(err, args);
                }, s8BuildExecuted, buildFailed);
            else s7BuildCordova();
        }
        function s7BuildCordova(err, args) {
            if (build.conf.status === 'cancelled') return;
            if (err) return buildFailed('error starting build\n{2}', err);
            agent.log(build, Msg.info, 'building cordova on {2}...', build.conf.platform);

            var cmd = command.format(build.conf.platform, args || '', build.conf.buildmode || 'release');
            if (build.conf.platform == 'ios')
                cmd += ' | tee "' + path.resolve(locationPath, 'build.ios.xcodebuild.log') + '" | egrep -A 5 -i "(error|warning|succeeded|fail|codesign|running|return)"';
            if (build.conf.platform == 'android')
                cmd += ' | "platforms\\android\\cordova\\lib\\tee.exe" "build.android.log" | "platforms\\android\\cordova\\lib\\egrep.exe" -i -A 6 "(error|warning|success|sign)"';

            agent.log(build, Msg.status, 'Executing {2}', cmd);
            var cordova_build = exec(cmd, {
                cwd: locationPath,
                maxBuffer: maxBuffer,
            }, s8BuildExecuted)
            .on('close', function (code) {
                if (build.conf.status === 'cancelled') return;
                if (code && code != 1) return buildFailed('child process exited with code ' + code);
            });
            cordova_build.stdout.on('data', function (data) {
                if (data)//get rid of new lines at the end
                    data = data.replace(/\r?\n?$/m, '');
                agent.log(build, Msg.build_output, data);
            });
            cordova_build.stderr.on('data', function (data) {
                if (data)//get rid of new lines at the end                    data = data.replace(/\r?\n?$/m, '');                agent.log(build, Msg.error, data);
            });

        }
        function s8BuildExecuted(err, stdout, stderr) {
            if (build.conf.status === 'cancelled') return;
            if (stdout)
                agent.log(build, Msg.build_output, stdout);
            var e;
            if (err && (!err.code || err.code != 1)) {
                e = 1;
                agent.log(build, Msg.error, 'error:\n{2}', err);
            }
            if (stderr)
                ((err && err.message || err && err.indexOf && err || '').indexOf(stderr) < 0) && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);

            var e;
            if (e) return agent.buildFailed(build);

            done.call(agent, e);
        }
    },
    buildWP8: function (build) {
        this.genericBuild(build, null, function (err) {
            if (build.conf.status === 'cancelled') return;
            !err && this.buildSuccess(build, ['platforms/wp8/**/*.xap', 'build.wp8.log']);
        });
    },
    buildIOS: function (build) {
        var agent = this;
        this.genericBuild(build, function (startBuild) {
            if (build.conf.status === 'cancelled') return;
            var workFolder = path.resolve(agent.workFolder, build.Id());
            var globs = path.resolve(workFolder, 'platforms/ios/cordova/**/*');
            var hooks = 'hooks/**/*.bat';
            multiGlob.glob(hooks, { cwd: workFolder }, function (err, hooks) {
                hooks.forEach(function (file) {
                    file = path.resolve(workFolder, file);
                    console.log('remove hook: ' + file);
                    try { fs.removeSync(file); }
                    catch (e) {
                        agent.buildFailed(build, e);
                    }
                });
                start();
            });
            function start() {
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
            }
        }, function (err) {
            if (build.conf.status === 'cancelled') return;
            if (err) return buildFailed(err);
            function buildFailed() {
                splice.call(arguments, 0, 0, build);
                return agent.buildFailed.apply(agent, arguments);
            }
            agent.log(build, Msg.info, 'creating a new signed ipa');
            var buildId = build.Id();
            if (!build.conf.iosprojectpath) return buildFailed('-iosprojectpath:"platforms/ios/build/device/your-project-name.app" was not being specified!');
            if (!build.conf.iosprovisioningpath) return buildFailed('-iosprovisioningpath:"path-to-your-provision-file.mobileprovision" was not being specified!');
            if (!build.conf.ioscodesignidentity) return buildFailed('-ioscodesignidentity:"your-provision-name" was not being specified!');
            var pathOfIpa = path.resolve(agent.workFolder, buildId, "platforms/ios/", path.basename(build.conf.iosprojectpath || 'app.app', '.app') + '.ipa');
            var pathOfInfo_plist = path.resolve(agent.workFolder, buildId, build.conf.iosprojectpath, 'Info.plist');
            var iosProjectPath = path.resolve(agent.workFolder, buildId, build.conf.iosprojectpath);
            if (!fs.statSync(iosProjectPath).isDirectory()) return buildFailed('-iosprojectpath:"{2}" does not exist or not a directory! Full path: {3}', build.conf.iosprojectpath, iosProjectPath);
            if (!fs.existsSync(build.conf.iosprovisioningpath)) return buildFailed('-iosprovisioningpath:"{2}" file does not exist!', build.conf.iosprojectpath);

            var xcodebuildLogPath = path.resolve(agent.workFolder, buildId, 'build.ios.xcodebuild.log');
            var signLogPath = path.resolve(agent.workFolder, buildId, 'build.ios.sign.xcrun.log');
            var execPath = '/usr/bin/xcrun -sdk iphoneos PackageApplication -v "{0}" -o "{1}" --sign "{2}" --embed "{3}" | tee "{4}" | egrep -A 5 -i "(return|sign|invalid|error|warning|succeeded|fail|running)"'.format(iosProjectPath, pathOfIpa, build.conf.ioscodesignidentity, build.conf.iosprovisioningpath, signLogPath);
            agent.log(build, Msg.status, 'executing: {2}', execPath);
            var xcrunExec = agent.exec(build, execPath, { maxBuffer: maxBuffer }, xcrunFinish, 'sign process exited with code {2}');

            function xcrunFinish(err, stdout, stderr) {
                if (build.conf.status === 'cancelled') return;
                stdout && agent.log(build, Msg.build_output, '{2}', stdout);
                err && agent.log(build, Msg.error, 'error:\n{2}', err);
                stderr && (err && err.message || '').indexOf(stderr) < 0 && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);
                var e = stderr || err;
                if (e) return agent.buildFailed(build, '');
                agent.log(build, Msg.status, 'Converting Info.plist as xml: \nplutil -convert xml1 {2}', pathOfInfo_plist);
                var plutilExec = agent.exec(build, 'plutil -convert xml1 ' + pathOfInfo_plist, { maxBuffer: maxBuffer }, function (err, stdout, stderr) {
                    if (err || stderr)
                        return agent.buildFailed(build, 'plutil erro converting Info.plist as xml: \n{2}\n{3}', err, stderr);
                    agent.log(build, Msg.info, 'Output files: \n{2}\n{3}', pathOfIpa, pathOfInfo_plist);
                    agent.buildSuccess(build, [pathOfIpa, pathOfInfo_plist, signLogPath, xcodebuildLogPath]);
                }, 'plutil process exited with code');
            }

        }, function (build, buildCordova) {
            buildCordova(null, true, "--device{0}{1}".format(build.conf.ioscodesignidentity && " CODE_SIGN_IDENTITY='{0}'".format(build.conf.ioscodesignidentity) || '', build.conf.iosprovisioningpath && " PROVISIONING_PROFILE='{0}'".format(build.conf.iosprovisioningpath) || ''));//pass the --device argument only on ios
        });
    },
    exec: function (build, cmd, opts, callback, exitCodeError) {
        var agent = this;
        var process = exec(cmd, function (err, stdout, stderr) {
            if (build.conf.status === 'cancelled') return;
            stdout && agent.log(build, Msg.build_output, '{2}', stdout);
            err && (!err.code || err.code != 1) && agent.log(build, Msg.error, 'error:\n{2}', err);
            stderr && (err && err.message || '').indexOf(stderr) < 0 && agent.log(build, Msg.error, 'stderror:\n{2}', stderr);
            callback.apply(agent, arguments);
            if (stderr || err && (!err.code || err.code != 1)) return agent.buildFailed(build, '');
        }).on('close', function (code) {
            if (build.conf.status === 'cancelled') return;
            if (code && code != 1) return agent.buildFailed(build, exitCodeError || 'process exited with error code {2}', code);
        });
        process.stdout.on('data', function (data) {
            if (/error\:/gi.test(data || ''))
                return agent.buildFailed(build, data);
            agent.log(build, Msg.build_output, data);
        });
        process.stderr.on('data', function (data) {
            agent.log(build, Msg.error, data);
        });
        return process;
    },
    buildAndroid: function (build) {
        var agent = this;
        var workFolder = path.resolve(agent.workFolder, build.Id());
        var androidFolder = path.resolve(workFolder, 'platforms/android');
        var assetsFolder = path.resolve(androidFolder, 'assets/www');
        var signLogPath = path.resolve(workFolder, 'build.android.sign.jarsign.log');
        var alignLogPath = path.resolve(workFolder, 'build.android.zipalign.log');
        var command;
        var apkGlobPath = ['platforms/android/**/*.apk'];
        var updateAssetsWWW = false;
        agent.genericBuild(build, filesDone, buildDone, null, command);

        function filesDone(callback) {
            agent.log(build, Msg.info, "Searching for existing apks for a faster build");
            var cordovaLibPath = path.resolve(androidFolder, 'CordovaLib');
            fs.exists(cordovaLibPath, function (cordovaLibPathExists) {
                if (!cordovaLibPathExists && build.conf.androidreleaseapk) {
                    var source = build.conf[build.conf.buildmode == 'release' ? 'androidreleaseapk': 'androiddebugapk'];
                    var dest = path.resolve(androidfolder, path.basename(source));
                    fs.copy(source, dest, function(err) {
                         if (build.conf.status === 'cancelled') return;
                         if (err) return agent.buildFailed(build, 'Error copying apk {2} to {3}\n{4}', source, dest, err);
                         apkGlobPath = [dest];
                         updateAssetsWWW = true;
                         agent.log(build, Msg.info, "Apk found {2}. Updating only assets/www for a faster build", apkGlobPath[0]);
                         ensureAssetsFolder("cordova prepare {0} {1}");
                    });
                }
                else ensureAssetsFolder();
            });
            function ensureAssetsFolder(command) {
                agent.log(build, Msg.info, "Ensuring android work folder {2}", assetsFolder);
                mkdirp(assetsFolder, runCordovaBuild.bind(agent, command));
            }
            function runCordovaBuild(command, err) {
                 if (build.conf.status === 'cancelled') return;
                 if (err) return agent.buildFailed(build, 'Error ensuring assets/www folder: {2}', err);
                callback(command);
            }
        }
        function buildDone(err) {
            if (build.conf.status === 'cancelled') return;
            if (updateAssetsWWW) {
                agent.modifyArchive(build, 'd', apkGlobPath[0], 'assets', {
                    cwd: androidFolder,
                    maxBuffer: maxBuffer,
                }, injectAssetsWWWInAPK);
                function injectAssetsWWWInAPK() {
                    agent.modifyArchive(build, 'a', apkGlobPath[0], 'assets', {
                        cwd: androidFolder,
                        maxBuffer: maxBuffer,
                    }, sign);
                }
            }
            else sign();
        }
        function sign() {
            //build.conf.androidsign = "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore d:\\cordova-build\\certificates\\android\\safetybank.live.keystore -storepass Safetybank@14 -keypass Safetybank@14 {0} sftb";
            if (build.conf.androidsign) {
                var androidsign = build.conf.androidsign;
                multiGlob.glob(apkGlobPath, {
                    cwd: workFolder,
                }, function (err, apks) {
                    //we should sign unaligned apks
                    apks = apks.filter(function (apk, i) { return !i; });
                    apkGlobPath = apks;
                    agent.modifyArchive(build, 'd', apks[0], 'META-INF', {
                        cwd: workFolder,
                        maxBuffer: maxBuffer,
                    }, jarSigner);
                    function jarSigner() {
                        if (build.conf.status === 'cancelled') return;
                        agent.log(build, Msg.debug, 'APK Files:\n{2}', apks.join('\n'));
                        apks = apks.map(function (apk) { return path.resolve(workFolder, apk); });
                        androidsign = androidsign.format.apply(androidsign, apks) + ' 2>&1 | "{0}" "{1}" | "{2}" -i -E -v "(tsacert|signing|warning|adding)"'.format(tee, signLogPath, egrep);
                        agent.log(build, Msg.status, androidsign);
                        agent.exec(build, androidsign, { maxBuffer: maxBuffer }, function (err, stdout, stderr) {
                            if (err || stderr) return;
                            zipAlign(apks[0]);
                        }, 'android sign process exited with code {2}');
                    }
                });
            }
            else done();
            function zipAlign(apk) {
                var output = apk.replace('-unsigned', '').replace('-unaligned', '');
                var key = build.conf.androidsign.match(/(.*)(\\|\/| )(.*)(\.keystore)/i);
                key = key && key[3];
                key = key && ("-" + key);
                output = path.resolve(path.dirname(apk), path.basename(output, '.apk') +key+'-signed-aligend.apk');
                if (apk == output)
                    output = output.replace('.apk', '-updated.apk');
                var zipalign = 'zipalign -f -v 4  "{0}" "{1}"'.format(apk, output);
                zipalign = zipalign + ' 2>&1 | "{0}" "{1}" | "{2}" -i -A 5 "(success)""'.format(tee, alignLogPath, egrep);
                agent.exec(build, zipalign, {
                    cwd: workFolder,
                    maxBuffer: maxBuffer,
                }, function (err, stdout, stderr) {
                    if (err && (!err.code || err.code != 1) || stdout || build.conf.status === 'cancelled') return;
                    apkGlobPath = [output];
                    done();
                }, 'android zipalign process exited with code {2}');
            }
            function done(err) {
                !err && agent.buildSuccess(build, apkGlobPath.concat(['build.android.log', signLogPath, alignLogPath]));
            }
        }
    },
    buildSuccess: function (build, globFiles) {
        if (build.conf.status === 'cancelled') return;
        var agent = this;
        var workFolder = path.resolve(agent.workFolder, build.Id());
        multiGlob.glob(globFiles, {
            cwd: workFolder,
        }, function (err, files) {

            if (build.conf.status === 'cancelled') return;
            if (err) return agent.buildFailed(build, 'error globbing {2}', globFiles);
            files = files.map(function (file) {
                return { file: path.resolve(workFolder, file) };
            });
            agent.emit('uploading', build.id);//change build status to uploading..
            serverUtils.readFiles(files, '[Agent WORKER] cordova build agent worker output files', function (err) {
                if (build.conf.status === 'cancelled') return;
                if (err) {
                    serverUtils.freeMemFiles(files);
                    return agent.buildFailed(build, err);
                }
                uploadFiles(files);
            });
        });
        function uploadFiles(outputFiles) {
            try {
                build.outputFiles = outputFiles;
                var size = 0; outputFiles.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; })
                size && agent.log(build, Msg.info, 'Uploading results file(s) to cordova build server...{0}'.format(fileSize(size)));
                var paths = []; outputFiles.forEach(function (file) {
                    paths.push(file.file);
                    if (build.conf.name) {
                        var ext = path.extname(file.file);
                        switch (ext) {
                            case '.ipa':
                            case '.apk':
                            case '.xap':
                                file.name = build.conf.name ? build.conf.name + ext : file.file;
                                break;
                        }
                    }
                    file.file = path.basename(file.file);
                });

                agent.emit('build-success', build.serialize({
                    outputFiles: 1,
                    content: 1
                }));
                outputFiles.forEach(function (file, index) { file.file = paths[index]; });
            }
            finally {
                //free agent's memory of output files contents
                serverUtils.freeMemFiles(outputFiles);
                var buildPath = path.resolve(agent.workFolder, build.Id(), 'build.' + build.conf.platform + '.json');
                build.save(buildPath, function (err, e, bp, json) {
                    err && agent.log(build, Msg.debug, err);
                });
            }
        }
    },
    buildFailed: function (build, err, args) {
        if (build.conf.status === 'cancelled') return;
        try {
            throw new Error("failed with stack");
        }
        catch (e) {
            err = err + '\n' + e.stack;
        }
        var agent = this;
        if (err) {
            splice.call(arguments, 1, 0, Msg.error);
            this.log.apply(this, arguments);
            this.log.call(this, build, Msg.error, '*** BUILD FAILED on {2} ***', build && build.conf && build.conf.platform || 'unknown platform');
        }

        serverUtils.freeMemFiles(build.files);
        var buildPath = path.resolve(this.workFolder, build.Id(), 'build.' + build.conf.platform + '.json');
        build.save(buildPath, function (err, e, bp, json) {
            err && agent.log(build, Msg.debug, err);
        });
        this.emit('build-failed', build.serialize());
    },
});
