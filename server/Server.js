module.exports = Server;
var Build = require('../common/Build');
var Client = require('./Client');
var Agent = require('./Agent');
var WWW = require('./WWW');
var serverUtils = require('../common/serverUtils');

    //patch on to support binding with multiple events at once

var path = require('path');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var io = require('socket.io');
var http = require('http');
var express = require('express');
var extend = require('extend');

var cache = {};
function Server() {
    this.agents = [];
    this.buildsQueue = [];
    this.clients = [];
    this.logs = [];
    this.wwws = [];
    this.platforms = {};
    this.builds = [];
};
Server.define({
    listen: function (conf) {
        var server = conf ? this : new Server();
        conf = conf || {};
        this.conf = conf;
        this.location = conf.location || path.resolve('builds');
        var app = this.app = express();
        var httpServer = this.server = http.createServer(app);
        var port = conf.port || 8300;
        var ios = this.socket = io.listen(httpServer);
        var www = __dirname + '/public';
        var htmlFiles = ['index.html'];
        var encoding = { encoding: 'utf-8' };
        htmlFiles.forEach(function (file) {
            var path = www + '/' + file;
            var lastTime = new Date();
            read();
            fs.watch(path, function (event, filename) {
                setTimeout(function() {
                if (lastTime < new Date()) {
                    lastTime = new Date(new Date().getTime() + 500);//500 ms treshold to avoid duplicates on windows
                    read(true);
                }
             }, 100);
            });
            function read(async) {
                if (async)
                    fs.readFile(path, encoding, function (err, content) {
                        cache[file] = err || content;
                    });
                else cache[file] = fs.readFileSync(path, encoding);
            }
        });

        ios.set('log level', 2);//show warnings
        app
            .use(app.router)
            .use(express.static(www))
            .get('/', function (req, res) {
                res.setHeader('Content-Type', 'text/html');
                var html = cache['index.html'].replace('<script id="start"></script>', '<script id="start">var serverBrowser = new ServerBrowser({0});</script>'.format(JSON.stringify({
                    protocol: conf.protocol,
                    host: conf.server,
                    port: conf.port,
                })));
                res.send(html);
            });


        this.agents.socket = ios
            .of('/agent')
            .on({
                'connection': function (socket) {
                    var agent = new Agent(socket);
                    agent.onConnect(server);
                    socket.on({
                        'disconnect': function () {
                            try {
                                agent.onDisconnect();
                                server.agents.remove(agent);
                                agent.platforms.forEach(function (platform) {
                                    server.platforms[platform].remove(agent);
                                });
                                if (agent.busy) {
                                    var build = agent.busy;
                                    this.log(agent.busy, build.client, "the agent {3} has been disconnected. The build on {2} will be added back to queue", build.platform, agent.id);
                                    build.agent = null;
                                    this.updateBuildStatus(build, 'queued');
                                    this.buildsQueue.push(build);
                                }
                            }
                            finally {
                                this.notifyStatusAllWWWs('disconnected', 'agent', agent.conf);
                            }
                        },
                        'register': function (conf) {
                            agent.id = conf && conf.id;
                            this.log(null, agent, "[A] agent connected supporting platforms [{2}]", agent.platforms.join(', '));
                            server.agents.push(agent);
                            agent.platforms.forEach(function (platform) {
                                (server.platforms[platform] = server.platforms[platform] || []).push(agent);
                            });
                            agent.conf.platforms = agent.platforms;
                            agent.conf.since = new Date();
                            conf.status = 'planned';
                            this.notifyStatusAllWWWs('connected', 'agent', agent.conf);
                        },
                    }, this);
                },
            }, this);


        this.clients.socket = ios
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
        this.wwws.socket = ios
            .of('/www')
            .on({
                'connection': function (socket) {
                    var www = new WWW(socket);
                    server.wwws.push(www);
                    www.onConnect(server);
                    socket.on({
                        'disconnect': function () {
                            www.onDisconnect();
                            this.wwws.remove(www);
                        },
                    }, this);
                    //socket.emit('news', { news: 'item' });
                },
            }, this);
        httpServer.listen(port);

        this.log(null, null, "listening on port {2}", port);
        this.processQueueInterval = setInterval(this.processQueue.bind(this), 1000);
    },
    stop: function () {
        clearInterval(this.processQueueInterval);
        this.socket.server.close();
        process.exit();
    },
    notifyStatusAllWWWs: function (kind, what, obj) {
        this.wwws.socket.emit('partial-status', arguments.length == 1 ? kind : {
            kind: kind,
            what: what,
            obj: obj,
        });
    },
    updateBuildStatus: function(build, status) {
        build.updateStatus(status);
        this.notifyStatusAllWWWs(status, 'build', build.serialize({platforms:1}));
    },
    processQueue: function () {
        var build = this.buildsQueue.shift();
        if (build) {
            var server = this;
            var platform = build.conf.platform;
            var startBuilding = false;
            var agents = server.platforms[platform];
            agents && agents.every(function (agent) {
                if (!agent.busy) {
                    agent.startBuild(build);
                    startBuilding = true;
                    return false;
                }
                return true;
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
        if (this.conf.mode != 'all' || !clientOrAgent) {
            console.log(message);
        }
        //broadcast the log to all wwws
        var msg = {
            date: new Date(),
            message: message,
        };
        if (buildId)
            msg.buildId = buildId;
        build = this.findBuildById(build);
        if (build && build.conf)
            build.conf.logs.push(msg);

        this.logs.unshift(msg);
        this.wwws.socket.emit('log', msg);
        this.notifyStatusAllWWWs('log', 'log', msg);
        clientOrAgent && clientOrAgent.emitLog(msg);
    },
    forwardLog: function (build, sender, message, to) {
        //timestamp message with server's time
        message && (message.date = new Date());

        if (!to) {
            build = this.findBuildById(build);
            to = build && build.client;
        }
        build && build.conf.logs.push(message);
        if (to && to != sender)
            to.emitLog(message);
        this.logs.unshift(message);
        this.notifyStatusAllWWWs('log', 'log', message);
    },
    findBuildById: function (build) {
        var buildFound = typeof build == "string" || build && build.id ? this.builds[build && build.id || build] || build && build.id && build : build;
        return buildFound;
    },
});