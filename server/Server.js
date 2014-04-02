module.exports = Server;
var Build = require('../common/Build');
var Client = require('./Client');
var Agent = require('./Agent');
var io = require('socket.io');
var async = require('async');

function Server() {
    this.agents = [];
    this.buildsQueue = [];
    this.clients = [];
    this.platforms = {};
    this.builds = {};
};
Server.define({
    listen: function (config) {
        var server = config ? this : new Server();
        config = config || {};
        this.config = config;
        var port = config.port || 8300;
        var ios = this.socket = io.listen(port);
        ios.set('log level', 2);//show warnings

        var agents = ios
            .of('/agent')
            .on({
                'connection': function (socket) {
                    var agent = new Agent(socket);
                    agent.onConnect(server);
                    socket.on({
                        'disconnect': function () {
                            agent.onDisconnect();
                            server.agents.remove(agent);
                            agent.platforms.forEach(function (platform) {
                                server.platforms[platform].remove(agent);
                            });
                        },
                        'register': function (conf) {
                            agent.id = conf && conf.id;
                            this.log(null, agent, "[A] agent connected supporting platforms [{2}]", agent.platforms.join(', '));
                            server.agents.push(socket);
                            agent.platforms.forEach(function (platform) {
                                (server.platforms[platform] = server.platforms[platform] || []).push(agent);
                            });
                        },
                    }, this);
                },
            }, this);


        var clients = ios
            .of('/client')
            .on({
                'connection': function (socket) {
                    var client = new Client(socket);
                    server.clients.push(client);
                    client.onConnect(server);
                    socket.on({
                        'register': function (conf) {
                            client.id = conf.id;
                            this.clients[conf.id] = client;
                            this.log(null, client, "[C] client {0} connected");
                        },
                        'disconnect': function () {
                            client.onDisconnect();
                            this.clients.remove(client);
                        },
                    }, this);
                    //socket.emit('news', { news: 'item' });
                },
            }, this);
        this.log(null, null, "listening on port {2}", port);
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
                    agent.startBuild(build);
                    startBuilding = true;
                    return false;
                }
            });
            if (!startBuilding)
                this.buildsQueue.push(build);
        }
    },
    log: function (build, forwardTo, message) {
        var clientOrAgent = forwardTo;
        var buildId = build && build.id || build;
        var clientId = clientOrAgent && clientOrAgent.id;
        var args = Array.prototype.concat.apply([], arguments);
        Array.prototype.splice.call(args, 0, 3, clientId, buildId);
        message = ['Server', clientId ? ' @{0}' : '', buildId ? ' about #{1}' : '', ": ", message].join('');
        message = message.format.apply(message, args);
        if (this.config.mode != 'all' || !clientOrAgent) {
            console.log(message);
        }
        clientOrAgent && clientOrAgent.emitLog({
            message: message,
            buildId: buildId,
        });
    },
    forwardLog: function (build, sender, message, to) {
        if (!to) {
            build = this.findBuildById(build);
            to = build && build.client;
        }
        if (to && to != sender)
            to.emitLog(message);
    },
    findBuildById: function(build) {
        var buildFound = typeof build == "string" || build && build.id ? this.builds[build && build.id || build] : build;
        return buildFound;
    },
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