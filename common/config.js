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
var config = commandLine.parseNode.apply(commandLine, process.argv);

var listen = {};
if (config.mode == 'server' || config.mode == 'all') {
    listen.server = true;
}
if (config.mode == 'client' || config.mode == 'all') {
    commandLine.addArgument('files', { type: 'string', required: false });
    commandLine.addArgument('wp8', { type: 'string', required: false });
    commandLine.addArgument('ios', { type: 'string', required: false });
    commandLine.addArgument('android', { type: 'string', required: false });
    commandLine.addArgument('build', { type: 'string', required: true  });
    listen.client = true;
}
if (config.mode == 'agent' || config.mode == 'all') {
    commandLine.addArgument('agent', { type: 'string', required: true });
    listen.agent = true;
}

function parseArgs() {
    //console.log(commandLine.toString()); // Will print the usage syntax.
    config = commandLine.parseNode.apply(commandLine, process.argv);
    config.protocol = config.protocol || 'http';
    config.port = config.port || 8300;
    config.server = config.server || 'localhost';
    config.listen = listen;
    config.wp8 = (config.wp8 || '').split(/;,/g);
    config.android = (config.android || '').split(/;,/g);
    config.ios = (config.ios || '').split(/;,/g);
    config.files = (config.files || '').split(/;,/g);

    return config;
}