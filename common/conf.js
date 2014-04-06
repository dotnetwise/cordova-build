module.exports = parseArgs;
require('./utils.js');
var io = require('socket.io');
//patch on to support binding with multiple events at once
var patch = require('./patch.js');
patch(io.Socket.prototype, ["on", "addListener"]);
patch(process.EventEmitter.prototype, ["on", "addListener"]);

var CommandLine = require('node-commandline').CommandLine;
var commandLine = new CommandLine('node .\\server'); // Construct the model.
commandLine.addArgument('protocol', { type: 'string' });
commandLine.addArgument('server', { type: 'string' });
commandLine.addArgument('port', { type: 'number' });
commandLine.addArgument('mode', { type: 'string', required: true, allowedValues: ['server', 'client', 'agent', 'all'] });
var conf = commandLine.parseNode.apply(commandLine, process.argv);

var listen = {};
if (conf.mode == 'server' || conf.mode == 'all') {
    commandLine.addArgument('location', { type: 'string' });
    listen.server = true;
}
if (conf.mode == 'client' || conf.mode == 'all') {
    commandLine.addArgument('files', { type: 'string', required: false });
    commandLine.addArgument('wp8', { type: 'string', required: false });
    commandLine.addArgument('ios', { type: 'string', required: false });
    commandLine.addArgument('android', { type: 'string', required: false });
    commandLine.addArgument('build', { type: 'string', required: true  });
    commandLine.addArgument('number', { type: 'string', required: false });
    listen.client = true;
}
if (conf.mode == 'agent' || conf.mode == 'all' || conf.agent) {
    commandLine.addArgument('agent', { type: 'string', required: true });
    listen.agent = true;
}

function parseArgs() {
    //console.log(commandLine.toString()); // Will print the usage syntax.
    conf = commandLine.parseNode.apply(commandLine, process.argv);
    conf.protocol = conf.protocol || 'http';
    conf.port = conf.port || 8300;
    conf.server = conf.server || 'localhost';
    conf.listen = listen;
    conf.wp8 = (conf.wp8 || '').split(/;,/g);
    conf.android = (conf.android || '').split(/;,/g);
    conf.ios = (conf.ios || '').split(/;,/g);
    conf.files = (conf.files || '').split(/;,/g);

    return conf;
}