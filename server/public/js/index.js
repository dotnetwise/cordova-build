var ioc = require('socket.io/node_modules/socket.io-client');
require('../../../common/utils.js');
module.exports = ServerBrowser;
if (typeof window !== "undefined") {
    window.ServerBrowser = ServerBrowser;
}
function ServerBrowser(config) {
    this.config = config;
    var url = '{0}://{1}{2}/{3}'.format(config.protocol || "http", config.host || 'localhost', config.port == 80 ? '' : ':' + config.port, 'www');
    console.log(url);
    this.socket = ioc.connect(url);
    this.socket.on({
        'connect': this.onConnect,
        'status': this.onStatus,
        'log': this.onLog,
    }, this);
}
ServerBrowser.define({
    'onConnect': function () {
        console.log('connected');
        this.socket.emit('get-status');
    },
    'onStatus': function () {
    },
    'onLog': function(message) {
        console.log(message && message.message || message);
    },
});
