var $ = require('stringformat')
var config = require("./common/config.js")();
var listen = config.listen;

if (listen.server) {
    var Server = require('./server/Server.js');
    var server = config.serverInstance = new Server();
    server.listen(config);
}
if (listen.client) {
    config.build = (config.build || 'ios,android,wp8').split(/,|;/g);
    var ClientWorker = require('./client/ClientWorker.js');
    var client = new ClientWorker();
    client.connect(config);
}
if (listen.agent) {
    var AgentWorker = require('./agent/AgentWorker.js');
    var agent = new AgentWorker();
    agent.connect(config);
}
