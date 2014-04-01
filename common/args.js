module.exports = parseArgs;
require('./common/utils.js')
var CommandLine = require('node-commandline').CommandLine;
var commandLine = new CommandLine('node .\\server'); // Construct the model.
commandLine.addArgument('server', { type: 'string' });
commandLine.addArgument('port', { type: 'number' });
commandLine.addArgument('mode', { type: 'string', required: true, allowedValues: ['server', 'client', 'agent', 'all'] });
var config = commandLine.parseNode.apply(commandLine, process.argv);

var listen = {};
if (config.mode == 'server' || config.mode == 'all') {
    listen.server = true;
}
if (config.mode == 'client' || config.mode == 'all') {
    commandLine.addArgument('zip', { type: 'string', required: true });
    commandLine.addArgument('build', { type: 'string', required: true  });
    listen.client = true;
}
if (config.mode == 'agent' || config.mode == 'all') {
    listen.agent = true;
}

function parseArgs() {
    //console.log(commandLine.toString()); // Will print the usage syntax.
    config = commandLine.parseNode.apply(commandLine, process.argv);
    config.port = config.port || 8300;
    config.server = config.server || 'localhost';
    config.listen = listen;

    return config;
}