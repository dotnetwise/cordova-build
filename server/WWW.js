module.exports = WWW;
var fileSize = require('filesize');
function WWW(socket) {
    this.socket = socket;
}
WWW.define({
    'onConnect': function (server) {
        var www = this;
        this.server = server;
        this.socket.on({
            'refresh': this.onRefresh,
            'disconnect': this.onDisconnect,
            //'log': function (message) {
            //    server.forwardLog(message && message.buildId, agent, message);
            //},
        }, this);
        this.onRefresh();
    },
    'onDisconnect': function () {

    },  
    'onRefresh': function () {
        //console.log('get-status');
        var server = this.server;
        var response = {
            'status': 1,
            logs: server.logs,
            builds: server.builds.map(function (build) { return build.serialize({platforms: 1}); }),
            agents: server.agents.map(function (agent) { return agent.conf; }),
            clients: server.clients.map(function (client) { return client.conf; }),
            latestBuild: server.latestBuild,
        };
        this.socket.emit('status', response);
    },
});