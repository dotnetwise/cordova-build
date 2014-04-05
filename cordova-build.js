var $ = require('stringformat')
var conf = require("./common/conf.js")();
var listen = conf.listen;
process.on('exit', function () {
 //handle your on exit code
 console.log("Exiting, have a nice day");
});
	
var tty = require("tty");

process.openStdin().on("keypress", function(chunk, key) {
  if(key && key.name === "c" && key.ctrl) {
    process.exit();
  }
});

process.on('exit', function () {
  // We get here because we don't have
  // any active handles left.
  console.log('exit');
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

if (listen.server) {
    var Server = require('./server/Server.js');
    var server = conf.serverInstance = new Server();
    server.listen(conf);
}
if (listen.client) {
    conf.build = (conf.build || 'ios,android,wp8').split(/,|;/g);
    var ClientWorker = require('./client/ClientWorker.js');
    var client = new ClientWorker();
    client.connect(conf);
}
if (listen.agent) {
    var AgentWorker = require('./agent/AgentWorker.js');
    var agent = new AgentWorker();
    agent.connect(conf);
}
