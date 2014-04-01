var ioc = require('socket.io/node_modules/socket.io-client');
var io = require('socket.io');
function rebind(obj, names) {
    Array.prototype.forEach.call(names, function (name) {
        var original = obj[name];
        obj[name] = function (type, listener, context) {
            if (typeof type != "object")
                return original.call(this, type, context ? listener.bind(context) : listener);
            else {
				context = listener;
                var r;
                Object.getOwnPropertyNames(type).forEach(function (typeName, listener) {
                    listener = type[typeName];
                    r = original.call(this, typeName, context ? listener.bind(context) : listener);
                }, this);
                return r;
            }
        }
    });
}
    //patch on to support binding with multiple events at once
rebind(io.Socket.prototype, ["on", "addListener"]);
rebind(ioc.Socket.prototype, ["on", "addListener"]);
rebind(ioc.SocketNamespace.prototype, ["on", "addListener"]);
rebind(ioc.EventEmitter.prototype, ["on", "addListener"]);