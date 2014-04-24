module.exports = Msg;
require('./utils');
var extend = require('extend');
var concat = Array.prototype.concat;
var splice = Array.prototype.splice;
function Msg(build) {
    if (arguments.length == 1) {
        extend(this, build);
        this.date = this.date && new Date(this.date);
    }
    else {
        this.date = new Date();
        arguments.length && this.update.apply(this, arguments);
    }
}
Msg.define({
    update: function(build, sender, by, priority, message, args) {
        this.priority = priority;
        this.buildId = build && build.id || build;
        this.senderId = sender && sender.id || sender;
        this.by = by;
        var msg = message;
        if (build && build.conf && build.conf.number)
        	this.buildNumber = build.conf.number;
		if (sender && sender.name) 
			this.senderName = sender.name;
        splice.call(arguments, 0, 5, this.senderId, this.buildId);
        if (typeof msg != "string") {
            console.error('UPDATE ',  arguments);
        }
        this.message = ''.format.apply(msg || '', arguments);
    },
    toString: function(doNotIncludePrefix) {
        var by, msg;
        switch(this.by){
            case 'A': by = '[SA] Server'; break;
            case 'AW': by = '[AW] Agent'; break;
            case 'C': by = '[SC] Server'; break;
            case 'CW': by = '[CW] Client'; break;
            case 'S': by = '[S] Server'; break;
        }
        if (doNotIncludePrefix || this.priority == Msg.build_output && doNotIncludePrefix !== false) {
            msg = this.message;
        }
        else {        
        	msg = [by, this.senderName || this.senderId ? ' @{0}' : '', this.buildNumber || this.buildId ? ' about #{1}' : '', ': ', this.message];
            msg = msg.join('');
        }
        msg = msg.format(this.senderName || this.senderId, this.buildNumber || this.buildId);
        return msg;
    }
}).defineStatic({
    debug: 6,
    build_output: 5,
    info: 4,
    status: 3,
    warning: 2,
    error: 1,
});