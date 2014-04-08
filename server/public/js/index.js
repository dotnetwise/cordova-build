var ioc = require('socket.io/node_modules/socket.io-client');
require('../../../common/utils.js');
var Msg = require('../../../common/Msg.js');
require('./qtip.js');
var ko = require('knockout');
var Elapsed = require('elapsed');

module.exports = ServerBrowser;
var inBrowser = typeof window !== 'undefined';
if (inBrowser) {
    window.ServerBrowser = ServerBrowser;
    window.ko = ko;
    setInterval(function () {
        $('[datetime]').each(function () {
            var $this = $(this);
            var date = new Date($this.attr('datetime'));
            var format = $this.attr('datetime-format');
            var elapsed = date.elapsed();
            $this.text(elapsed && (format ? format.format(elapsed) : elapsed));
        });
    }, 1000);
}
var observable = ko.observable;
var observableArray = ko.observableArray;
window.unwrap = ko.unwrap;
ko.bindingHandlers.hidden = {
    update: function (element, valueAccessor) {
        var isVisible = !ko.utils.unwrapObservable(valueAccessor());
        ko.bindingHandlers.visible.update(element, function () { return isVisible; });
    }
};
function ServerBrowser(conf) {
    this.conf = conf;
    this.logs = observableArray([]);
    this.agents = observableArray([]);
    this.builds = observableArray([]);
    this.clients = observableArray([]);
    this.selectedBuild = observable();
    this.selectedBuild = observable();
    this.selectedBuild.tab = observable('#noBuild');
    this.status = observable('connecting');
    this.disconnectedSince = observable();
    var url = '{0}{1}{2}/{3}'.format(conf.protocol || 'http://', conf.host || 'localhost', conf.port == 80 ? '' : ':' + conf.port, 'www');
    var as = $.cookie('as') !== 'false';
    this.as = observable(as);
    this.as.subscribe(function(as) {
        $.cookie('as', as,{expires:365});
    }.bind(this));

    inBrowser && ko.applyBindings(this, document.body);
    this.connect(url, {
        //Note that max reconnection attemps does not mean that the io client will stop to reconnect to the server after 10 failed attempts. If it was able to reconnect to the server 10 times and loses the connection for the 11th time, it will stop to reconnect.
        'max reconnection attempts': Infinity, // defaults to 10 
        'sync disconnect on unload': true,
        'reconnect': true,
        'auto connect': true,
        //'force new connection': true, // <-- Add this!
    });
}
ServerBrowser.define({
    statuses: {
        'building': 'img/platforms/building.gif',
        'uploading': 'img/platforms/working.gif',
        'queued': 'img/platforms/queue.gif',
        'working': 'img/platforms/working.gif',
        'failed': 'img/platforms/fail.png',
        'unknown': 'img/platforms/unknown.png',
    },
    platformNames: {
        'ios': 'IOS',
        'wp8': 'Windows Phone 8',
        'android': 'Android',
    },
    connect: function (url) {
        this.socket = ioc.connect(url);
        this.socket.heartbeatTimeout = 1000; // reconnect if not received heartbeat for 20 seconds

        this.socket.on({
            'connect': this.onConnect,
            'disconnect': this.onDisconnect,
            'error': this.onError,
            'status': this.onStatus,
            'news': this.onPartialStatus,
        }, this);
    },
    'onConnect': function () {
        this.status('connected');
    },
    'onDisconnect': function () {
        this.disconnectedSince(new Date());
        this.status('disconnected');
        this.agents([]);
        this.builds([]);
        this.clients([]);
        //this.logs([]);  -- do not clear logs
        this.agents.map = {};
        this.builds.map = {};
        this.clients.map = {};
        this.logs.map = {};
    },
    'onError': function (err) {
        if (err && (err.code == 'ECONNREFUSED' || err.indexOf && err.indexOf('ECONNREFUSED') >= 0)) {
            if (!this._reconnecting) {
                var self = this;
                this._reconnecting = function () {
                    self.socket.reconnect();
                }.defer(500);
                self.socket.on('connect', function () {
                    clearTimeout(self._reconnecting);
                    self._reconnecting = 1;
                    self.socket.removeListener('connect', arguments.callee);
                });
            }
        }
        else console.log('Agent Worker socket reported error:', err);
    },
    'onPartialStatus': function (status) {
        //console.warn('partial status', status);
        switch (status && status.what) {
            case 'agent':
                update.call(this, this.agents);
                break;
            case 'build':
                update.call(this, this.builds);
                break;
            case 'client':
                update.call(this, this.clients);
                break;
            case 'log':
                update.call(this, this.logs);
                break;
        }
        function update(list) {
            list.map = list.map || {};
            switch (status && status.kind) {
                case 'log':
                    var build = status.obj;
                    var msg = new Msg(build);
                    list.unshift(msg);
                    build = this.builds.map[build && build.buildId];
                    //console.log("log", status.obj, build, this)
                    build && build.logs.unshift(msg);
                    break;
                case 'queued':
                case 'building':
                case 'failed':
                case 'success':
                default:
                    var map = list.map;
                    var build = status.obj;
                    var autoSelectBuild = this.as();
                    var selectBuild = null;
                    selectedBuild = this.selectedBuild;
                    build = function (build) {
                        var vm = map[build.id];
                        if (vm) {
                            vm.update(build)
                        }
                        else {
                            vm = new BuildVM(build);
                            map[build.id] = vm;
                            if (this == 1) {
                                if (autoSelectBuild)
                                    selectBuild = vm;
                                list.unshift(vm);
                             } else  this.platforms.push(vm);
                        }
                        if (this != 1) {
                            vm.masterId = this && this.id;
                            vm.master = this;
                        }
                        build.platforms && build.platforms.forEach(arguments.callee.bind(vm));
                        if (selectBuild)
                            selectedBuild(selectBuild);
                        return vm;
                    }.call(1, build);
                    if (build && !selectedBuild()) {
                        selectedBuild(build);
                    }
                    break;
                case 'agent-status':
                case 'connected':
                case 'updated':
                    var item = status.obj;
                    var o = list.map[item.id];
                    var i = list.indexOf(o); 
                    i < 0 ? list.unshift(item) : list.splice(i, 1, item);
                    list.map[item.id] = item;
                    break;
                case 'disconnected':
                    var id = status.obj.id;
                    list.remove(function (item) {
                        return item.id == id;
                    });
                    delete list.map[status.obj.id];
                    //console.log('LIST', status.obj.id, status, list.map, list);
                    break;
            }
            return status.obj;
        }
    },
    'onStatus': function (status) {
        //console.log('status', status);
            
        if (status) {
            status.agents = status.agents || [];
            this.logs((status.logs ||[]).map(function(log) {
                return new Msg(log);
            }));
            this.agents.map = {};
            status.agents && status.agents.forEach(function (agent) {
                this.agents.map[agent.id] = agent;
            }, this);
            var map = this.builds.map = {};
            var builds = [];
            status.builds && status.builds.forEach(function (build) {
                var vm = map[build.id];
                if (vm) {
                    vm.update(build)
                }
                else {
                    vm = new BuildVM(build);
                    map[build.id] = vm;
                    this == 1 ? builds.unshift(vm) : this.platforms.push(vm);
                }
                if (this != 1) {
                    vm.masterId = this && this.id;
                    vm.master = this;
                }
                build.platforms && build.platforms.forEach(arguments.callee.bind(vm));
            }.bind(1));
            
            this.agents(status.agents);
            this.builds(builds);
            if (builds[0]) {
                var sb = this.selectedBuild();
                if (!sb || !this.builds.map[sb.id])
                    this.selectedBuild(builds[0]);
            }
            else this.selectedBuild(null);
        }
    },
    generateQR: function (url, level) {
        var uri = qr.toDataURL({
            value: url,
            level: level || 'H',
            size: 10,
        });
        //console.warn(uri);
        return uri;
    },
    refresh: function() {
        this.socket.emit('refresh');
    },
});
function BuildVM(build) {
    this.conf = build && build.conf;
    this.name = observable();
    this.id = build && build.id;
    this.platforms = observableArray();
    this.platform = observable();
    this.started = observable();
    this.logs = observableArray();
    this.completed = observable();
    this.duration = observable();
    this.status = observable();
    this.qr = observable();
    this.link = observable();
    this.update(build);
}
var statuses = ['unknown', 'planned', 'success', 'queued', 'building', 'uploading', 'failed']
BuildVM.define({
    update: function (build) {
        if (build && build.conf) {
            var conf = build.conf;
            this.conf = conf;
            this.name(conf.name);
            this.platform(conf.platform);
            this.id = build.id;
            this.conf && (this.conf.logs = (this.conf.logs || []).map(function(log) {
                return new Msg(log);
            }));
            this.logs(this.conf.logs);
            this.started(conf.started && new Date(conf.started));
            this.completed(conf.completed && new Date(conf.completed));
            this.duration(conf.duration);
            this.status(conf.status);
            if (this.master) {
                var masterStatus = 0;
                var platformBuilds = this.master.platforms();
                platformBuilds.forEach(function (child, i) {
                    i = statuses.indexOf(child.status());
                    if (i > masterStatus)
                        masterStatus = i;
                });

                masterStatus = statuses[masterStatus] || 'unkown';
                this.master.conf.status = masterStatus;
                this.master.status(masterStatus);
                var qr = masterStatus == 'success' ? this.master.__qr : ServerBrowser.prototype.statuses[masterStatus];
                this.master.qr(qr);
            }

            if (this._qr != build.id) {
                this._qr = build.id;
                this.link(this.__qr = this.QR());
            }
            var qr = conf.status == 'success' ? this.__qr : ServerBrowser.prototype.statuses[conf.status || 'unkown'];
            this.qr(qr);
        }
    },
    QR: function () {
        var l = location;
        var platform = this.conf && typeof this.conf.platform == 'string' && this.conf.platform;
        return ServerBrowser.prototype.generateQR([l.protocol, '//', l.host, '/download/', this.id, platform ? '/' : '', platform ? platform : ''].join(''));
    }
});

