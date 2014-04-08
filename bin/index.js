var $ = require('stringformat')
var conf = require("./common/conf.js")();
var listen = conf.listen;
	
process.openStdin().on("keypress", function(chunk, key) {
  if(key && key.name === "c" && key.ctrl) {
    process.emit("SIGINT");
    process.exit();
  }
});

if (process.platform === "win32"){
var readLine = require ("readline");
    var rl = readLine.createInterface ({
        input: process.stdin,
        output: process.stdout
    });

    rl.on ("SIGINT", function (){
        process.emit ("SIGINT");
    });

}

if (listen.server || listen.ui) {
    var Server = require('./server/Server.js');
    var server = conf.serverInstance = new Server(conf);
    server.listen();
}
if (listen.agent) {
//    require('nodetime').profile({
//    accountKey: '4b55187db0af80f8ff871a511ae9699744637a1a',
//    appName: 'cordova-build'
//});
    var AgentWorker = require('./agent/AgentWorker.js');
    var agent = new AgentWorker(conf);
    agent.connect();
}

if (listen.client) {
    conf.build = (conf.build || 'ios,android,wp8').split(/,|;/g);
    var ClientWorker = require('./client/ClientWorker.js');
    var client = new ClientWorker(conf);
    client.connect();
}