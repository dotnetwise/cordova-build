module.exports = Agent;
var fileSize = require('filesize');
function Agent(socket) {
    this.socket = socket;
    this.platforms = [];
}
Agent.define({
    onConnect: function (server) {
        var agent = this;
        this.server = server;
        this.socket.on({
            'register': function (conf) {
                this.conf = conf = conf || {};
                conf.platforms = ((typeof conf.platforms == "string" ? conf.platforms.split(/;|,| /) : conf.platforms) || []).unique();
                conf.platforms.forEach(function (platform) {
                    this.platforms.push(platform);
                }, this);
            },
            'build-success': agent.onBuildSuccess,
            'build-fail': agent.onBuildFailed,
            'log': function(message) {
                server.forwardLog(message && message.buildId, agent, message);
            },
        }, this);
    },
    onDisconnect: function () {

    },
    onBuildSuccess: function(result) {
        var build = this.server.findBuildById(result.build);
        var client = build.client;
        var agent = build.agent;
        this.busy = false;
        client.socket.emit('build-success', result);
    },
    onBuildFailed: function(build) {
        this.busy = false;
    },
    startBuild: function (build) {
        this.busy = build;
        var client = build.client;
        delete build.client;
        delete build.agent;
        var size = 0; build.conf.files.forEach(function (file) { size += file.content.length; });
        try {
            this.server.log(build.id, client, "[A] sending build to agent {2} on platform {3}...{4}", this.id, build.platform, fileSize(size));
            this.socket.emit('build', build);
        }
        catch (e) {
            this.server.log(build.id, client, "[A] error while sending build to agent {2} on {3}...{4}", agent.id, build.platform, fileSize(size));
        }
        finally {
            build.client = client;
            build.agent = this;
        }
    },
    emitLog: function (message) {
        this.socket.emit('log', message);
    },
});