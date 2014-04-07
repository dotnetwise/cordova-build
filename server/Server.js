module.exports = Server;
var Build = require('../common/Build');
var Msg = require('../common/Msg.js');
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
                                this.log(new Msg(null, agent, 'S', Msg.debug, 'The agent with id {0} has disconnected. Bye!'), agent);
                                agent.onDisconnect();
                                server.agents.remove(agent);
                                agent.platforms.forEach(function (platform) {
                                    server.platforms[platform].remove(agent);
                                });
                                if (agent.busy) {
                                    var build = agent.busy;
                                    this.log(new Msg(build, agent, 'S', Msg.warning, 'the agent {3} has been disconnected. The build on {2} will be added back to queue', build.platform, agent.id), build.client);
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
                            this.log(new Msg(null, agent, 'S', Msg.debug, 'An agent with id {0} has just connected supporting the platforms [{2}]', agent.platforms.join(', ')), null);
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
                            this.log(new Msg(null, client, 'S', Msg.debug, 'A client with id {0} has just connected. Welcome!'), client);
                        },
                        'disconnect': function () {
                            this.log(new Msg(null, client, 'S', Msg.debug, 'The client with id {0} has disconnected. Bye!'), client);
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

        this.log(new Msg(null, null, 'S', Msg.info, 'listening on port {2}', port), null);
        this.processQueueInterval = setInterval(this.processQueue.bind(this), 1000);
    },
    stop: function () {
        clearInterval(this.processQueueInterval);
        this.socket.server.close();
        process.exit();
    },
    notifyStatusAllWWWs: function (kind, what, obj) {
        this.wwws.socket.emit('news', arguments.length == 1 ? kind : {
            kind: kind,
            what: what,
            obj: obj,
        });
    },
    updateBuildStatus: function(build, status) {
        var buildParam = build;
        if (build && !build.updateStatus) {
            //self detect build if an id was passed
            build = this.builds[build];
        }
        if (build && build.updateStatus) {
            build.updateStatus(status);
            this.notifyStatusAllWWWs(status, 'build', build.serialize({platforms:1}));
        }
        else {
            this.log(buildParam, null, 'S', Msg.error, "A request to change a build's status to {2} was made but that build cannot be found. We have tried to identify it by {3}", status, buildParam);
        }
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
    log: function (msg, forwardToClientOrAgent) {
        if (this.conf.mode != 'all' || !forwardToClientOrAgent) {
            console.log(msg.toString());
        }
        //broadcast the log to all wwws
        var build = this.findBuildById(msg.buildId);
        if (build && build.conf)
            build.conf.logs.unshift(msg);

        this.logs.unshift(msg);
        this.notifyStatusAllWWWs('log', 'log', msg);
        forwardToClientOrAgent && forwardToClientOrAgent.emitLog(msg);
    },
    forwardLog: function (build, sender, msg, to) {
        //timestamp msg with server's time
        msg && (msg.date = new Date());

        if (!to) {
            build = this.findBuildById(build);
            to = build && build.client;
        }
        build && build.conf.logs.push(msg);
        if (to && to != sender)
            to.emitLog(msg);
        this.logs.unshift(msg);
        this.notifyStatusAllWWWs('log', 'log', msg);
    },
    findBuildById: function (build) {
        var buildFound = typeof build == 'string' || build && build.id ? this.builds[build && build.id || build] || build && build.id && build : build;
        return buildFound;
    },
});