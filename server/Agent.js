module.exports = Agent;

var async = require('async');
var fs = require('fs.extra');
var path = require('path');

var serverUtils = require('../common/serverUtils');
var Msg = require('../common/Msg.js');

var extend = require('extend');
var fileSize = require('filesize');
var mkdirp = require('mkdirp');
var CircularJSON = require('circular-json');
function Agent(socket) {
	this.socket = socket;
	this.platforms = [];
}
Agent.define({
	onConnect: function (server) {
		var agent = this;
		this.server = server;
		this.socket.on({
			'disconnect': this.onDisconnect,
			'register': this.onRegister,
			'uploading': this.onUploading,
			'building': this.onBuilding,
			'build-success': this.onBuildSuccess,
			'build-failed': this.onBuildFailed,
			'log': function (msg) {
				var build = this.server.builds[msg && msg.buildId];
				this.server.forwardLog(build, this, msg);
			},
		}, this);
	},
	'onDisconnect': function () {
		this.server.notifyStatusAllWWWs('disconnected', 'agent', this.conf);
	},
	'onRegister': function (conf) {
		this.conf = conf = conf || {};
		conf.platforms = ((typeof conf.platforms == 'string' ? conf.platforms.split(/;|,/) : conf.platforms) || []).unique();
		conf.platforms.forEach(function (platform) {
			this.platforms.push(platform);
		}, this);
	},
	'onUploading': function (buildId) {
		this.server.updateBuildStatus(buildId, 'uploading');
	},
	'onBuilding': function (buildId) {
		this.server.updateBuildStatus(buildId, 'building');
	},
	'onBuildSuccess': function (responseBuild) {
		var build = this.server.findBuildById(responseBuild);
		if (!build)
			this.log(null, null, Msg.error, 'Build with id {2} is not defined on the server', responseBuild && responseBuild.id || responseBuild);

		var client = build.client;
		var agent = this;
		var server = this.server;
		var id = build.masterId || responseBuild.id;
		var locationPath = path.resolve(server.location, build.master && build.master.Id() || build.Id());

		this.log(build, client, Msg.info, 'files uploaded. Storing them on the server', locationPath);

		var outputFiles = responseBuild.outputFiles;
		build.outputFiles = outputFiles;
		outputFiles.forEach(function (file) {
			file.file = [build.conf.number, build.conf.number && '.' || '', file.name || path.basename(file.file)].join('');
		});
		mkdirp(locationPath, function (err) {
			if (err) {
				this.log(build, client, Msg.error, 'error creating folder {2} on the cordova build server\n{3}', locationPath, err);
				this.server.updateBuildStatus(build, "failed");
			}
			else {
				serverUtils.writeFiles(locationPath, outputFiles, 'the cordova build agent worker output files on {0} [a]'.format(build.conf.platform), true, function (err) {
					if (err) {
						serverUtils.freeMemFiles(build.outputFiles);
						this.log(build, client, Msg.error, 'error saving build output files on the cordova build server\n{3}', err);
						this.server.updateBuildStatus(build, "failed");
					}
					else {
						build.conf.completed = new Date();
						var started = build.conf.started;
						var masterBuild = build.master;
						server.updateBuildStatus(build, 'success');
						build.conf.duration = (started && started.format && started || new Date(started).elapsed(build.conf.completed));
						if (masterBuild) {
							if (masterBuild.platforms.every(function (platform) {
                                return platform.conf.status == 'success' || platform.conf.status == 'failed';
							})) {
								masterBuild.conf.completed = new Date();
								started = masterBuild.conf.started;
								masterBuild.conf.duration = (started && started.format && started || new Date(started).elapsed(masterBuild.conf.completed));
								server.updateBuildStatus(masterBuild, 'success');
							}
						}
						if (build.conf.save)
							agent.log(build, client, Msg.info, 'Also sending the output files to the client');

						client && client.socket.emit('build-success', build.serialize({
							outputFiles: build.conf.save
						}));
						agent.log(build, client, Msg.info, 'Build done, ready for a new one.');
						serverUtils.freeMemFiles(build.outputFiles);
						serverUtils.cleanLastFolders(server.conf.keep, server.location + "/*", function (err, stats) {
							err && agent.log(build, Msg.debug, 'Error while cleaning up last {2} folders in SERVER builds output folder {3}:\n{4}', server.conf.keep, server.location, err);
							var buildPath = path.resolve(locationPath, 'build.json');
							build.save(buildPath, function (err, e, bp, json) {
								err && agent.log(build, Msg.debug, err);
								agent.busy = null;//free agent to take in another work
								agent.updateStatus('ready');
								stats.forEach(function (stat) {
									var buildId = path.basename(stat.path);
									var build = server.findBuildById(buildId);
									build && server.updateBuildStatus(build, 'deleted', true);
								});
							});
						});
					}
				}.bind(this));
			}
		}.bind(this), this);
	},
	'onBuildFailed': function (build) {
		var agent = this;
		var foundBuild = this.server.builds[build && build.id || build];
		if (foundBuild) {
			if (foundBuild.master) {
				if (foundBuild.master.platforms.every(function (platform) {
					return platform.conf.status == 'success' || platform.conf.status == 'failed';
				})) {
					foundBuild.master.conf.completed = new Date();
				}
			}
			if (foundBuild.conf && foundBuild.conf.status != 'failed') {
				this.server.updateBuildStatus(foundBuild, 'failed');
				this.busy = null;
				this.updateStatus('ready');
			}
			var buildPath = path.resolve(this.server.location, foundBuild.master && foundBuild.master.Id() || foundBuild.Id(), 'build.json');
			foundBuild.save(buildPath, function (err, e, bp, json) {
				err && agent.log(foundBuild, foundBuild.client, Msg.debug, err);
			});
		}
		else {
			this.log(build, null, Msg.error, "The build {0} was requested to be failing but we couldn't identify such build");
		}
	},
	updateStatus: function (newStatus, platform) {
		this.conf.status = newStatus;
		this.conf.buildingPlatform = platform;
		this.server.notifyStatusAllWWWs('agent-status', 'agent', this.conf);
	},
	log: function (build, client, priority, message, args) {
		Array.prototype.splice.call(arguments, 1, 1, this, 'A');
		var msg = new Msg();
		msg.update.apply(msg, arguments);

		this.server.log(msg, client);
	},
	startBuild: function (build) {
		this.busy = build;
		this.updateStatus('building', build.conf.platform);
		this.server.updateBuildStatus(build, 'uploading');
		var client = build.client;
		var files = build.files;
		var server = this.server;
		build.agent = this;

		this.log(build, client, Msg.debug, 'Downloading {2} file{3} from the server...', files.length, files.length == 1 ? '' : 's');
		//console.log('FILES', files)
		serverUtils.readFiles(files, '[AGENT.startBuild] the cordova build server\n', function (err) {
			try {
				if (err) {
					this.log(build, client, Msg.error, 'error while reading input files on the server for sending them to the agent worker: \n{2}', err);
					this.server.updateBuildStatus(build, 'failed');
					build.agent = null;
					this.busy = null;
					this.updateStatus('ready');
				}
				else {
					var origFilePaths = files.map(function (file) { return file.file });
					try {
						var size = 0; files.forEach(function (file) { size += file && file.content && file.content.data && file.content.data.length || 0; });
						//only send file names to the agent worker and not full paths
						files.forEach(function (file) { file.file = path.basename(file.file); });

						this.log(build, client, Msg.info, 'sending build to agent {2} on platform {3}...{4}', this.id, build.conf.platform, fileSize(size));
						this.socket.emit('build', build.serialize({
							files: 1,
						}));
					}
					catch (e) {
						//restore full file paths
						this.log(build, client, Msg.error, 'error while sending build files to agent {2} on {3}...{4}', agent.id, build.conf.platform, fileSize(size));
						build.agent = null;
						this.busy = null;
						this.updateStatus('ready');
					}
					finally {
						files.forEach(function (file, index) { file.file = origFilePaths[index]; });
					}
				}
			}
			finally {
				serverUtils.freeMemFiles(files);
			}
		}.bind(this));
	},
	emitLog: function (msg) {
		this.socket.emit('log', msg);
	},
});
