require('fast-class');
require('array-sugar');
var Build = require('.\Build');
var io = require('socket.io');
module.exports = Function.define({ 
    constructor: function() {
        this.agents = [];
        this.buildsQueue = [];
        this.clients = [];
        this.platforms = {};
    },
    listen: function(config) {
        this.config = config;
        io.listen(config.port);
          var chat = io
      .of('/agent')
      .on('connection', function (agent) {
          agent.platforms = [];
          agent.emit('a message', {
              that: 'only'
            , '/agent': 'will get'
          });
          agent.on('register', function (registerDetails) {
              registerDetails.platforms = (typeof registerDetails.platforms == "string" ? registerDetails.platforms.split(/(;|,| )/) : registerDetails.platforms) || [];
              registerDetails.platforms.forEach(function (platform) {
                  agent.platforms.push(platform);
                  platforms[platform] = platforms[platform] || [];
                  platforms[platform].push(agent);
              });
          }).on('build-done', function (buildDetails) {

          });
          chat.emit('a message', {
              everyone: 'in'
            , '/agent': 'will get'
          });
      });

    var buildServer = io
        .of('/build')
        .on('connection', Client.clientConnected, function (clientSocket) {
            var client = new Client(clientSocket);
            clients.push(client);
            client.onConnect();
            //clientSocket.emit('news', { news: 'item' });
        });
    }
});

