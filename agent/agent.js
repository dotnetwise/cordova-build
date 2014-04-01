module.exports = agentApi;
function agentApi(config) {
    var $ = require('stringformat');
    var cordova = require('cordova');

    var ioc = require('socket.io/node_modules/socket.io-client');
    var fs = require('fs');
    var buildAgent = ioc.connect('http://' + config.server + ':' + config.port + '/agent');
    buildAgent.on({
        'connect': function (abc) {
            buildAgent.emit('register', {
                platforms: ['android', 'wp8'],
            });
        },
        'build': function (build) {
            switch (build.platform) {
                case 'wp8':
                    buildWP8(build);
                    break;
                case 'android':
                    buildAndroid(build);
                    break;
                case 'ios':
                    buildIOS(build);
                    break;
            }
        }
    });
    function genericBuild(build) {
        cordova.build({
            platform: build.platform
        });
    }
    function buildWP8(build) {
        genericBuild(build);
    }
    function buildIOS(build) {
        genericBuild(build);
    }
    function buildAndroid(build) {
        genericBuild(build);
    }

}