module.exports = Agent;
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
    startBuild: function (build, platform) {
        this.busy = true;
        var client = build.client;
        delete build.client;
        this.socket.emit('build', {
            build: build,
            platform: platform,
        });
        build.client = client;
    }
});