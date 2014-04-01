module.exports = Server;
require('fast-class');
require('array-sugar');
var Build = require('../common/Build');
var Client = require('./Client');
var Agent = require('./Agent');
var io = require('socket.io');

function Server() {
    this.agents = [];
    this.buildsQueue = [];
    this.clients = [];
    this.platforms = {};
};
Server.define({
    listen: function (config) {
        var server = config ? this : new Server();
        config = config || {};
        this.config = config;
        var ios = this.socket = io.listen(config.port || 8300);

        var agents = ios
            .of('/agent')
            .on('connection', function (socket) {
                var agent = new Agent(socket);
                agent.onConnect(this);
                //socket.on({
                //    'disconnect': function () {
                //        agent.onDisconnect();
                //        server.agents.remove(agent);
                //        agent.platforms.forEach(function (platform) {
                //            server.platforms[platform].remove(agent);
                //        });
                //    },
                socket.on({
                    'register': function (conf) {
                        server.agents.push(socket);
                        agent.platforms.forEach(function (platform) {
                            (server.platforms[platform] = server.platforms[platform] || []).push(agent);
                        });
                    }
                });
                //clientSocket.emit('news', { news: 'item' });
            });


        var clients = ios
            .of('/client')
            .on('connection', function (clientSocket) {
                var client = new Client(clientSocket);
                server.clients.push(client);
                client.onConnect(server);
                clientSocket.on('disconnect', function () {
                    client.onDisconnect();
                    server.clients.remove(client);
                });
                //clientSocket.emit('news', { news: 'item' });
            });

        this.processQueueInterval = setInterval(this.processQueue.bind(this), 1000);
    },
    stop: function () {
        this.socket.server.close();
        clearInterval(this.processQueueInterval);
    },
    processQueue: function () {
        var build = this.buildsQueue.shift();
        if (build) {
            var server = this;
            var platform = build.platform;
                var startBuilding = false;
            var agents = server.platforms[platform];
            agents && agents.forEach(function (agent) {
                if (!agent.busy) {
                    agent.startBuild(build, platform);
                    startBuilding = true;
                    return false;
                }
            });
            if (!startBuilding)
                this.buildsQueue.push(build);
        }
    }
});

    //var chat = io
    //   .of('/agent')
    //   .on('connection', function (agent) {
    //       agent.platforms = [];
    //       agent.emit('a message', {
    //           that: 'only'
    //         , '/agent': 'will get'
    //       });
    //       agent.on('register', function (registerDetails) {
    //           registerDetails.platforms = (typeof registerDetails.platforms == "string" ? registerDetails.platforms.split(/(;|,| )/) : registerDetails.platforms) || [];
    //           registerDetails.platforms.forEach(function (platform) {
    //               agent.platforms.push(platform);
    //               platforms[platform] = platforms[platform] || [];
    //               platforms[platform].push(agent);
    //           });
    //       }).on('build-done', function (buildDetails) {

    //       });
    //       chat.emit('a message', {
    //           everyone: 'in'
    //         , '/agent': 'will get'
    //       });
    //   });