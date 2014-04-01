module.exports = clientApi;

function clientApi(config) {
    
    var ioc = require('socket.io/node_modules/socket.io-client');
    var fs = require('fs');
    //var chat = ioc.connect('http://' + config.server + ':' + config.port + '/chat');
    var buildClient = ioc.connect('http://' + config.server + ':' + config.port + '/client');

    //chat.on('connect', function () {
    //    chat.emit('hi!');
    //});
    //chat.on('chat', function () {
    //    console.log("aa");
    //});

    buildClient.on('connect', function (abc) {
        fs.readFile(config.zip, function(err, zip) {
            if (err) 
                throw "Cannot read '{0}'\n{1}".format(config.zip, err);
            buildClient.emit('request-build', {
                zip: {
                    fileName: config.zip,
                    content: zip,
                },
                platforms: config.build || ['android', 'ios', 'wp8'],
            });
        });
        //buildClient.on('build', function (data) {
        //    console.log(123);
        //    news.emit('woot');
        //});
    });
}
