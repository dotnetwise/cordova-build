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
        splice.call(arguments, 0, 5, this.senderId, this.buildId);

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
            msg = [by, this.senderId ? ' @{0}' : '', this.buildId ? ' about #{1}' : '', ': ', this.message];
            msg = msg.join('');
        }
        msg = msg.format(this.senderId, this.buildId);
        return msg;
    }
}).defineStatic({
    debug: 5,
    build_output: 4,
    info: 3,
    warning: 2,
    error: 1,
});