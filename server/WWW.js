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
    'onGetStatus': function(config) {
        this.socket.emit('status', {
            builds: this.builds,
            agents: this.agents,
        });
    },
});