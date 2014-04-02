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
                conf = conf || {};
                conf.platforms = ((typeof conf.platforms == "string" ? conf.platforms.split(/;|,| /) : conf.platforms) || []).unique();
                conf.platforms.forEach(function (platform) {
                    agent.platforms.push(platform);
                });
            },
        });
    },
    onDisconnect: function () {

    },
    startBuild: function (build) {
        this.busy = true;
        var client = build.client;
        delete build.client;
        delete build.agent;
        var size = 0; build.conf.files.forEach(function (file) { size += file.content.length; });
        console.log("Server[A]: sending build {0} to agent {1} on platform {2}...{3}".format(build.id, this.socket.id, build.platform, fileSize(size)));
        this.socket.emit('build', build);
        build.client = client;
        build.agent = this;
    },
    sendLog: function (message) {
        this.socket.emit('log', message);
    },
});