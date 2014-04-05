var ioc = require('socket.io/node_modules/socket.io-client');
require('../../../common/utils.js');
var ko = require('knockout');
var Elapsed = require('elapsed');

module.exports = ServerBrowser;
var inBrowser = typeof window !== "undefined";
if (inBrowser) {
    window.ServerBrowser = ServerBrowser;
    window.ko = ko;
    setInterval(function () {
        $('[datetime]').each(function () {
            var $this = $(this);
            var date = new Date($this.attr("datetime"));
            $this.text(date.elapsed()); 
        }); 
    }, 5000);
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
    this.builds = observableArray([]);
    this.client = observableArray([]);
    this.latestBuild = observable();
    this.latestBuild.tab = observable('#noBuild');
    this.statuses = {
        'queued': 'img/platforms/queue.gif',
        'working': 'img/platforms/working.gif',
        'failed': 'img/platforms/fail.png',
    };
    var url = '{0}://{1}{2}/{3}'.format(conf.protocol || "http", conf.host || 'localhost', conf.port == 80 ? '' : ':' + conf.port, 'www');
    this.generateQR("Ana are mere");
    console.log(url);
    inBrowser && ko.applyBindings(this, document.body);
    this.connect(url);
}
ServerBrowser.define({
    connect: function (url) {
        this.socket = ioc.connect(url);
        this.socket.heartbeatTimeout = 1000; // reconnect if not received heartbeat for 20 seconds

        this.socket.on({
            'connect': this.onConnect,
            'status': this.onStatus,
            'log': this.onLog,
            'partial-status': this.onPartialStatus,
        }, this);
    },
    'onConnect': function () {
        console.log('connected');
        this.socket.emit('get-status');
    },
    'onPartialStatus': function (status) {
        console.warn('partial status', status);
        switch (status && status.what) {
            case 'agent':
                update(this.agents);
                break;
            case 'build':
                update(this.builds);
                break;
            case 'client':
                update(this.clients);
                break;
        }
        function update(list) {
            list.map = list.map || {};
            switch (status && status.kind) {
                case 'started':
                case 'connected':
                case 'failed':
                case 'completed':
                case 'updated':
                    var o = list.map[status.obj.id];
                    var i = list.indexOf(o);
                    i < 0 ? list.push(status.obj) : list[i] = status.obj;
                    list.map[status.obj.id] = o;
                    console.log("LIST", status, list);
                    break;
                case 'disconnected':
                    var id = status.obj.id;
                    list.remove(function(item) { 
                        return item.id == id;
                    });
                    delete list.map[status.obj.id];
                    console.log("LIST", status.obj.id, status, list.map, list);
                    break;
            }
            return status.obj;
        }
    },
    'onStatus': function (status) {
        console.log("status", status);
        if (status) {
            status.agents = status.agents || [];
            //this.parseLatestBuild(status.latestBuild || {
            //    status: 'failed',
            //    id: 1234,
            //    started: new Date(),
            //    duration: '3 minutes',
            //    completed: new Date(),
            //    logs: [{ date: new Date(), message: 'some log1' }, { message: 'some log 2' }],
            //    platforms: [{
            //        platform: 'wp8',
            //        platformName: 'Windows Phone 8',
            //        hint: 'WP8 hint',
            //        file: 'wp8',
            //        status: 'success',
            //        started: new Date(),
            //        duration: '3 minutes',
            //        completed: new Date(),
            //        logs: [{ date: new Date(), message: 'some log1' }, { date: new Date(), message: 'some log 2' }],
            //    }, {
            //        platform: 'android',
            //        platformName: 'Android',
            //        file: 'apk',
            //        status: 'success',
            //        started: new Date(),
            //        duration: '3 minutes',
            //        completed: new Date(),
            //        logs: ['some log1', 'some log 2'],
            //    }, {
            //        platform: 'ios',
            //        platformName: 'IOS',
            //        file: 'ipa',
            //        status: 'success',
            //        started: new Date(),
            //        duration: '3 minutes',
            //        completed: new Date(),
            //        logs: ['some log1', 'some log 2'],
            //    }]
            //});

            this.agents.map = {};
            status.agents && status.agents.forEach(function(agent) {
                this.agents.map[agent.id] = agent;
            }, this);
            this.agents(status.agents);
        }
    },
    'onLog': function (message) {
        console.log(message && message.message || message);
    },
    parseLatestBuild: function (build) {
        if (build) {
            build.qr = this.statuses[build.status] || this.generateQR('/download/' + build.id);
        }
        build.platforms && build.platforms.forEach(function (platform) {
            platform.qr = this.statuses[build.status] || this.generateQR('/download/' + build.id);
        }, this);
        this.latestBuild(build);
    },
    generateQR: function (url, level) {
        var uri = qr.toDataURL({
            value: url,
            level: level || 'H',
            size: 8,
        });
        console.warn(uri);
        return uri;
    }
});
