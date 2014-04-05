var log = console.log;
require("date-format-lite");
require('fast-class');
require('array-sugar');
var Elapsed = require('Elapsed');
var ioc = require('socket.io/node_modules/socket.io-client');
var patch = require('./patch.js');
patch(ioc.Socket.prototype, ["on", "addListener"]);
patch(ioc.SocketNamespace.prototype, ["on", "addListener"]);
patch(ioc.EventEmitter.prototype, ["on", "addListener"]);

Date.prototype.elapsed = function () {
    return new Elapsed(this, new Date()).optimal;
}

console.log = function () {
    Array.prototype.unshift.call(arguments, new Date().format("hh:mm:ss.S"));
    log.apply(this, arguments);
}.bind(console);
var class2type = [];
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach(function (name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
});

Object.each = function (obj, callback, context) {
    var value, i = 0,
        length = obj.length,
        type = jQuery.type(obj),
        isArray = type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);

    if (context) {
        if (isArray) {
            obj.forEach(callback, context);
        } else {
            for (i in obj) {
                value = callback.call(context, obj[i], i, obj);

                if (value === false) {
                    break;
                }
            }
        }

        // A special, fast, case for the most common use of each
    } else {
        if (isArray) {
            obj.forEach(callback, obj);
        } else {
            for (i in obj) {
                value = callback.call(obj, i, obj[i], i, obj);

                if (value === false) {
                    break;
                }
            }
        }
    }

    return obj;
}
Object.every = function (obj, callback, context) {
    var value, i = 0,
        length = obj.length,
        type = obj === null ? String(obj) : typeof obj === "object" || typeof obj === "function" ? class2type[class2type.toString.call(obj)] || "object" : typeof obj,
        isArray = type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj);

    if (context) {
        if (isArray) {
            obj.every(callback, context);
        } else {
            for (i in obj) {
                value = callback.call(context, obj[i], i, obj);

                if (value === false) {
                    return false;
                }
            }
        }

        // A special, fast, case for the most common use of each
    } else {
        if (isArray) {
            obj.every(callback, obj);
        } else {
            for (i in obj) {
                value = callback.call(obj, i, obj[i], i, obj);

                if (value === false) {
                    return false;
                }
            }
        }
    }

    return true;
}
var TYPE_MAP = {
    'object': 1,
    'function': 1
}
Array.prototype.unique = (function () {
    return function () {
        var map = {},
            objects = [],
            unique = [];
        for (var i = 0, len = this.length; i < len; i++) {
            var val = this[i];

            if (TYPE_MAP[typeof val] && val) {
                if (!val.__unique__) {
                    unique.push(val);
                    objects.push(val);
                    val.__unique__ = 1;
                }
            }
            else if (!map[val]) {
                unique.push(val);
                map[val] = 1;
            }
        }

        for (i = objects.length; i--;) {
            delete objects[i].__unique__;
        }

        return unique;
    };
})();