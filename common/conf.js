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
commandLine.addArgument('noui', { type: 'boolean' });
commandLine.addArgument('proxy', { type: 'string' });
commandLine.addArgument('proxyport', { type: 'number' });
commandLine.addArgument('proxyprotocol', { type: 'string' });
commandLine.addArgument('ui', { type: 'string' });
commandLine.addArgument('uiport', { type: 'number' });
commandLine.addArgument('uiprotocol', { type: 'string' });
commandLine.addArgument('mode', { type: 'string', required: true, allowedValues: ['server', 'client', 'agent', 'all'] });
//commandLine.addArgument('iossignonly', { type: 'boolean', required: false});
var conf = commandLine.parseNode.apply(commandLine, process.argv);

var listen = {};
if (conf.mode == 'server' || conf.mode == 'all') {
    commandLine.addArgument('location', { type: 'string' });
    listen.server = true;
}
if (conf.mode == 'client' || conf.mode == 'all' || conf.build) {
    commandLine.addArgument('platforms', { type: 'string', required: false });
    commandLine.addArgument('files', { type: 'string', required: false });
    commandLine.addArgument('wp8', { type: 'string', required: false });
    commandLine.addArgument('ios', { type: 'string', required: false });
    commandLine.addArgument('android', { type: 'string', required: false });
    commandLine.addArgument('build', { type: 'string', required: true  });
    commandLine.addArgument('number', { type: 'string', required: false });
    //commandLine.addArgument('iossignonly', { type: 'boolean', required: false});
    if (conf.build && conf.build.indexOf && conf.build.indexOf('ios') >= 0) {
        if (!conf.iosprojectpath) throw new Error('-iosprojectpath:"platforms/ios/build/device/your-project-name.app" was not being specified!');
        if (!conf.iosprovisioningpath) throw new Error('-iosprovisioningpath:"path-to-your-provision-file.mobileprovision" was not being specified!');
        if (!conf.iosprovisioningname) throw new Error('-iosprovisioningname:"your-provision-name" was not being specified!');
            
        commandLine.addArgument('iosprovisioningpath', { type: 'string', required: true});
        commandLine.addArgument('iosprovisioningname', { type: 'string', required: true});
        commandLine.addArgument('iosprojectpath', { type: 'string', required: true});
    }
    listen.client = true;
}
if (conf.mode == 'agent' || conf.mode == 'all' || conf.agent) {
    commandLine.addArgument('agent', { type: 'string', required: true });
    commandLine.addArgument('agentwork', { type: 'string', required: false });
    listen.agent = true;
}
if (conf.mode == 'ui' || conf.mode == 'server' || conf.mode == 'all') {
    commandLine.addArgument('uiport', { type: 'number', required: false });
    listen.ui = true;
}

function parseArgs() {
    //console.log(commandLine.toString()); // Will print the usage syntax.
    conf = commandLine.parseNode.apply(commandLine, process.argv);
    conf.protocol = conf.protocol || 'http://';
    conf.port = conf.port || 8300;
    conf.server = conf.server || 'localhost';
    conf.listen = listen;
    conf.platforms = (conf.platforms || 'wp8,android,ios').split(/;|,/g);
    conf.wp8 = (conf.wp8 || '').split(/;|,/g);
    conf.android = (conf.android || '').split(/;|,/g);
    conf.ios = (conf.ios || '').split(/;|,/g);
    conf.files = (conf.files || '').split(/;|,/g);
    conf.iosprojpath = conf.iosprojpath || 'platforms/ios/build/device/Safetybank.app';

    return conf;
}