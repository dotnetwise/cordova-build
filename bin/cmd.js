#!/usr/bin/env node

 
var extend = require('extend');
var cordovaBuild = require('../');
var conf = require('../common/conf.js')();
var listen = conf.listen;

//process.on('uncaughtException', function(err) {
//    console.log(err);
//    process.stdin.resume();
//    console.log("press enter to close");
//    process.stdin.setEncoding('utf8');
 
//    process.stdin.on('data', function (chunk) {
//        process.exit(err && err.code)
//    });
//});
process.openStdin().on('keypress', function (chunk, key) {
    if (key && key.name === 'c' && key.ctrl) {
        process.emit('SIGINT');
        process.exit();
    }
});

if (process.platform === 'win32') {
    var readLine = require('readline');
    var rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', function () {
        process.emit('SIGINT');
    });

}

if (listen.server || listen.ui) {
    var server = conf.serverInstance = new cordovaBuild.Server(conf);
    server.listen();
}
if (listen.agent) {
    var platforms = conf.agent.split(/,|;/g);
    var agents = [];
    platforms.forEach(function(platform) {
        var config = extend(true, {}, conf);
        config.agent = platform;
        var agent = new cordovaBuild.AgentWorker(config);
        agents.push(agent);
        agent.connect();
    });
    
}

if (listen.client) {
    conf.build = (conf.build || 'ios,android,wp8').split(/,|;/g);
    var client = new cordovaBuild.ClientWorker(conf);
    client.connect();
}