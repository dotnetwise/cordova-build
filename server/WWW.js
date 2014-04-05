module.exports = WWW;
var fileSize = require('filesize');
function WWW(socket) {
    this.socket = socket;
}
WWW.define({
    onConnect: function (server) {
        var www = this;
        this.server = server;
        this.socket.on({
            'get-status': this.onGetStatus,
            //'log': function (message) {
            //    server.forwardLog(message && message.buildId, agent, message);
            //},
        }, this);
    },
    onDisconnect: function () {

    },  
    'onGetStatus': function () {
        //console.log('get-status');
        var server = this.server;
        var response = {
            'status': 1,
            logs: server.logs,
            builds: server.builds.map(function (build) { return build.conf; }),
            agents: server.agents.map(function (agent) { return agent.conf; }),
            latestBuild: server.latestBuild,
        };
        this.socket.emit('status', response);
    },
});