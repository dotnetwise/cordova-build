(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./utils":3,"extend":8}],2:[function(require,module,exports){
module.exports = rebind;
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


},{}],3:[function(require,module,exports){
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

Date.prototype.elapsed = function (until) {
    return new Elapsed(this, until).optimal;
}

console.log = function () {
    Array.prototype.unshift.call(arguments, new Date().format("mm:ss.SS"));
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
},{"./patch.js":2,"Elapsed":4,"array-sugar":5,"date-format-lite":6,"fast-class":9,"socket.io/node_modules/socket.io-client":11}],4:[function(require,module,exports){
function Elapsed (from, to) {
	this.from = from;
	this.to = to || new Date();
	if (!(this.from instanceof Date && this.to instanceof Date)) return;

	this.set();
}

Elapsed.prototype.set = function() {
	this.elapsedTime = this.to - this.from;

	this.milliSeconds = this.elapsedTime;
	var divider = 1000;
	this.seconds = { num: Math.floor(this.elapsedTime / divider) };
	divider *= 60;
	this.minutes = { num: Math.floor(this.elapsedTime / divider) };
	divider *= 60;
	this.hours = { num: Math.floor(this.elapsedTime / divider) };
	divider *= 24;
	this.days = { num: Math.floor(this.elapsedTime / divider) };
	divider *= 7;
	this.weeks = { num: Math.floor(this.elapsedTime / divider) };
	divider *= (30 / 7);
	this.months = { num: Math.floor(this.elapsedTime / divider) };
	divider = divider / (30 / 7) / 7 * 365;
	this.years = { num: Math.floor(this.elapsedTime / divider) };

	this.seconds.text = this.seconds.num + ' second' + (this.seconds.num < 2 ? '' : 's');
	this.minutes.text = this.minutes.num + ' minute' + (this.minutes.num < 2 ? '' : 's');
	this.hours.text = this.hours.num + ' hour' + (this.hours.num < 2 ? '' : 's');
	this.days.text = this.days.num + ' day' + (this.days.num < 2 ? '' : 's');
	this.weeks.text = this.weeks.num + ' week' + (this.weeks.num < 2 ? '' : 's');
	this.months.text = this.months.num + ' month' + (this.months.num < 2 ? '' : 's');
	this.years.text = this.years.num + ' year' + (this.years.num < 2 ? '' : 's');

	if (this.years.num > 0) this.optimal = this.years.text;
	else if (this.months.num > 0) this.optimal = this.months.text;
	else if (this.weeks.num > 0) this.optimal = this.weeks.text;
	else if (this.days.num > 0) this.optimal = this.days.text;
	else if (this.hours.num > 0) this.optimal = this.hours.text;
	else if (this.minutes.num > 0) this.optimal = this.minutes.text;
	else if (this.seconds.num > 0) this.optimal = this.seconds.text;

	return this;
};

Elapsed.prototype.refresh = function(to) {
	if (!to) this.to = new Date();
	else this.to = to;
	if (!this.to instanceof Date) return;

	return this.set();
};

module.exports = Elapsed;
},{}],5:[function(require,module,exports){
(function (arr) {
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);	//thx to http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
	}

	/**
	 * returns an array of numbers from low to high including low and high
	 * @param {Number} low
	 * @param {Number} high
	 * @returns {Array}
	 */
	arr.range = function (low, high) {
		var r = [];
		if (isNumber(low) && (isNumber(high))) {
			while(high >= low){
				r.push(low);
				low++;
			}
		}
		return r;
	};
    var arrProt = arr.prototype;
	var props = {
        first: {
            get: function() {
				if (this.isEmpty) return undefined;
				return this[0];
            },
            set: function(val) {
                return this[0] = val;
            }
        },
        last: {
            get: function() {
				if (this.isEmpty) return undefined;
				return this[this.length - 1];
            },
            set: function(val) {
                return this[this.length - 1] = val;
            }
        },
        isEmpty: {
            get: function() {
                return this.length === 0;
            },
            set: undefined
        }
    };

    var methods = {
		/**
		 * traverses array and returns first element on which test function returns true
		 * @param test
		 * @param {Boolean} fromEnd pass true if you want to traverse array from end to beginning
		 * @returns {*|null|undefined} an element of an array, or undefined when passed param is not a function
		 */
		findOne: function (test, fromEnd) {
			var i;
			if (typeof test !== 'function') return undefined;
			if (fromEnd) {
				i = this.length;
				while(i--){
					if (test(this[i], i, this)) {
						return this[i];
					}
				}
			} else {
				i = 0;
				while(i < this.length){
					if (test(this[i], i, this)) {
						return this[i];
					}
					i++;
				}
			}
			return null;
		},
		/**
		 *	replace method
		 * @param {*} toReplace
		 * @param {*} itemWith
		 * @returns {Number|false} index when item was replaced, false when not
		 */
		replace: function (toReplace, itemWith) {
			var index = this.indexOf(toReplace);
			if (~index) {
				this[index] = itemWith;
				return index;
			} else {
				return false;
			}
		},
		/**
         * @param {*} val
         * @returns {boolean} true when item is in the array
         */
        contains: function (val) {
            return this.indexOf(val) !== -1;
        },
		/**
		 * Syntax:
		 *  array.insert(index, value1, value2, ..., valueN)
		 * @param {Number} index where item will be inserted, if bigger than length of an array, will be inserted at the end of an array, not
		 * @param [...] unlimited amount of values to insert
		 * @returns {Array}
		 */
		insert: function(index) {
			index = Math.min(index, this.length);
			arguments.length > 1
				&& this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
			    && this.insert.apply(this, arguments);
			return this;
		},
        /**
         * finds and removes the item from array
         * @param item
         * @returns {boolean} true when item was removed, else false
         */
        remove: function (item) {
            var index = this.indexOf(item);
            if (index !== -1) {
                this.splice(index, 1);
                return true;
            }
            return false;
        },
        /**
         * will erase the array
         */
        clear: function () {
            this.length = 0;
        },
		/**
         * will return a copy of the array
         */
        copy: function () {
            return this.slice(0);
        }
    };

    for(var prop in props){
        if (!arrProt.hasOwnProperty(prop)) {
            Object.defineProperty(arrProt, prop, {
                enumerable: false,
                configurable: false,
                set: props[prop].set,
                get: props[prop].get
            });
        }
    }
    for(var m in methods){
        if (!arrProt.hasOwnProperty(m)) {
            Object.defineProperty(arrProt, m, {
                enumerable: false,
                configurable: false,
                value: methods[m],
                writable: false
            });
        }
    }
})(Array);
},{}],6:[function(require,module,exports){



/*
* @version  0.5.0
* @author   Lauri Rooden - https://github.com/litejs/date-format-lite
* @license  MIT License  - http://lauri.rooden.ee/mit-license.txt
*/



!function(Date, proto) {
	var maskRe = /(["'])((?:[^\\]|\\.)*?)\1|YYYY|([MD])\3\3(\3?)|SS|([YMDHhmsW])(\5?)|[uUAZSwo]/g
	, yearFirstRe = /(\d{4})[-.\/](\d\d?)[-.\/](\d\d?)/
	, dateFirstRe = /(\d\d?)[-.\/](\d\d?)[-.\/](\d{4})/
	, timeRe = /(\d\d?):(\d\d):?(\d\d)?\.?(\d{3})?(?:\s*(?:(a)|(p))\.?m\.?)?(\s*(?:Z|GMT|UTC)?(?:([-+]\d\d):?(\d\d)?)?)?/i
	, wordRe = /.[a-z]+/g
	, unescapeRe = /\\(.)/g
	//, isoDateRe = /(\d{4})[-.\/]W(\d\d?)[-.\/](\d)/
	

	// ISO 8601 specifies numeric representations of date and time.
	//
	// The international standard date notation is
	// YYYY-MM-DD
	//
	// The international standard notation for the time of day is
	// hh:mm:ss
	//
	// Time zone
	//
	// The strings +hh:mm, +hhmm, or +hh (ahead of UTC)
	// -hh:mm, -hhmm, or -hh (time zones west of the zero meridian, which are behind UTC)
	//
	// 12:00Z = 13:00+01:00 = 0700-0500
	
	Date[proto].format = function(mask) {
		mask = Date.masks[mask] || mask || Date.masks["default"]

		var self = this
		, get = "get" + (mask.slice(0,4) == "UTC:" ? (mask=mask.slice(4), "UTC"):"")

		return mask.replace(maskRe, function(match, quote, text, MD, MD4, single, pad) {
			text = single == "Y"   ? self[get + "FullYear"]() % 100
				 : match == "YYYY" ? self[get + "FullYear"]()
				 : single == "M"   ? self[get + "Month"]()+1
				 : MD     == "M" ? Date.monthNames[ self[get + "Month"]()+(MD4 ? 12 : 0) ]
				 : single == "D"   ? self[get + "Date"]()
				 : MD     == "D" ? Date.dayNames[ self[get + "Day"]() + (MD4 ? 7:0 ) ]
				 : single == "H"   ? self[get + "Hours"]() % 12 || 12
				 : single == "h"   ? self[get + "Hours"]()
				 : single == "m"   ? self[get + "Minutes"]()
				 : single == "s"   ? self[get + "Seconds"]()
				 : match == "S"    ? self[get + "Milliseconds"]()
				 : match == "SS"   ? (quote = self[get + "Milliseconds"](), quote > 99 ? quote : (quote > 9 ? "0" : "00" ) + quote)
				 : match == "u"    ? (self/1000)>>>0
				 : match == "U"    ? +self
				 : match == "A"    ? Date[self[get + "Hours"]() > 11 ? "pm" : "am"]
				 : match == "Z"    ? "GMT " + (-self.getTimezoneOffset()/60)
				 : match == "w"    ? self[get + "Day"]() || 7
				 : single == "W"   ? (quote = new Date(+self + ((4 - (self[get + "Day"]()||7)) * 86400000)), Math.ceil(((quote.getTime()-quote["s" + get.slice(1) + "Month"](0,1)) / 86400000 + 1 ) / 7) )
				 : match == "o"    ? new Date(+self + ((4 - (self[get + "Day"]()||7)) * 86400000))[get + "FullYear"]()
				 : quote           ? text.replace(unescapeRe, "$1")
				 : match
			return pad && text < 10 ? "0"+text : text
		})
	}

	Date.am = "AM"
	Date.pm = "PM"

	Date.masks = {"default":"DDD MMM DD YYYY hh:mm:ss","isoUtcDateTime":'UTC:YYYY-MM-DD"T"hh:mm:ss"Z"'}
	Date.monthNames = "JanFebMarAprMayJunJulAugSepOctNovDecJanuaryFebruaryMarchAprilMayJuneJulyAugustSeptemberOctoberNovemberDecember".match(wordRe)
	Date.dayNames = "SunMonTueWedThuFriSatSundayMondayTuesdayWednesdayThursdayFridaySaturday".match(wordRe)

	//*/


	/*
	* // In Chrome Date.parse("01.02.2001") is Jan
	* n = +self || Date.parse(self) || ""+self;
	*/

	String[proto].date = Number[proto].date = function(format) {
		var m, temp
		, d = new Date
		, n = +this || ""+this

		if (isNaN(n)) {
			// Big endian date, starting with the year, eg. 2011-01-31
			if (m = n.match(yearFirstRe)) d.setFullYear(m[1], m[2]-1, m[3])

			else if (m = n.match(dateFirstRe)) {
				// Middle endian date, starting with the month, eg. 01/31/2011
				// Little endian date, starting with the day, eg. 31.01.2011
				temp = Date.middle_endian ? 1 : 2
				d.setFullYear(m[3], m[temp]-1, m[3-temp])
			}

			// Time
			m = n.match(timeRe) || [0, 0, 0]
			d.setHours( m[6] && m[1] < 12 ? +m[1]+12 : m[5] && m[1] == 12 ? 0 : m[1], m[2], m[3]|0, m[4]|0)
			// Timezone
			if (m[7]) {
				d.setTime(d-((d.getTimezoneOffset() + (m[8]|0)*60 + ((m[8]<0?-1:1)*(m[9]|0)))*60000))
			}
		} else d.setTime( n < 4294967296 ? n * 1000 : n )
		return format ? d.format(format) : d
	}

}(Date, "prototype")





},{}],7:[function(require,module,exports){
module.exports=require(4)
},{}],8:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

function isPlainObject(obj) {
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
		return false;

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
		return false;

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for ( key in obj ) {}

	return key === undefined || hasOwn.call( obj, key );
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],9:[function(require,module,exports){
(function (global){
﻿////For performance tests please see: http://jsperf.com/js-inheritance-performance/34 + http://jsperf.com/js-inheritance-performance/35 + http://jsperf.com/js-inheritance-performance/36

(function selfCall() {
	var isNode = typeof global != "undefined";
	if (!String.prototype.format) {
		var regexes = {};
		String.prototype.format = function format(parameters) {
			/// <summary>Equivalent to C# String.Format function</summary>
			/// <param name="parameters" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>

			for (var formatMessage = this, args = arguments, i = args.length; --i >= 0;)
				formatMessage = formatMessage.replace(regexes[i] || (regexes[i] = RegExp("\\{" + (i) + "\\}", "gm")), args[i]);
			return formatMessage;
		};
		if (!String.format) {
			String.format = function format(formatMessage, params) {
				/// <summary>Equivalent to C# String.Format function</summary>
				/// <param name="formatMessage" type="string">The message to be formatted. It should contain {0}, {1} etc. for all the given params</param>
				/// <param name="params" type="Object" parameterArray="true">Provide the matching arguments for the format i.e {0}, {1} etc.</param>
				for (var args = arguments, i = args.length; --i;)
					formatMessage = formatMessage.replace(regexes[i - 1] || (regexes[i - 1] = RegExp("\\{" + (i - 1) + "\\}", "gm")), args[i]);
				return formatMessage;
			};
		}
	}
	///#DEBUG
	if (typeof window != "undefined")
		window.WAssert = WAssert;
	function WAssert(trueishCondition, message, arg1, arg2, argEtc) {
		/// <summary>Returns an `assert function` if the condition is false an a `noop function` (a function which does nothing) if the condition is true. <br/>
		///  WAsserts will not be included in production code in anyways, hence the minifier will remove all the WAssert calls<br/><br/>
		///  You always need to call the WAssert function twice since the first call always returns a function i.e. WAssert(false, "{0} failed", "Condition")()
		/// </summary>
		/// <param name="trueishCondition" type="Boolean">The condition to be tested. It should be true so nothing happens, or false to assert the error message</param>
		/// <param name="message" type="String || Function">The message to be asserted. If passed a function it will be evaluated all the times, regardless of the condition</param>
		/// <param name="arg1" type="Object" optional="true">First argument to replace all of the {0} occurences from the message</param>
		/// <param name="arg2" type="Object" optional="true">Second argument to replace all of the {1} occurences from the message</param>
		/// <param name="argEtc" type="Object" optional="true" parameterArray="true">Third argument to replace all of the {3} occurences from the message.<br/> You can add as many arguments as you want and they will be replaced accordingly</param>
		if (typeof message === "function")
			message = message.apply(this, arguments) || "";
		if (typeof trueishCondition === "function" ? !trueishCondition.apply(this, arguments) : !trueishCondition) {
			var parameters = Array.prototype.slice.call(arguments, 1);
			var msg = typeof message == "string" ? String.format.apply(message, parameters) : message;
			return typeof console != "undefined" && !console.__throwErrorOnAssert && console.assert && console.assert.bind && console.assert.bind(console, trueishCondition, msg) || function consoleAssertThrow() { throw msg; };
		}
		return __;
	};
	///#ENDDEBUG

	var Function_prototype = Function.prototype;
	var Array_prototype = Array.prototype;
	var Array_prototype_forEach = Array_prototype.forEach;
	var Object_defineProperty = Object.defineProperty;
	var Object_defineProperties = typeof Object.defineProperties === "function"
	var supportsProto = {};

	supportsProto = supportsProto.__proto__ === Object.prototype;
	if (supportsProto) {
		try {
			supportsProto = {};
			supportsProto.__proto__ = { Object: 1 };
			supportsProto = supportsProto.Object === 1;//setting __proto__ in firefox is terribly slow!
		} catch (ex) { supportsProto = false; }
	}
	/* IE8 and older hack! */
	if (typeof Object.getPrototypeOf !== "function")
		Object.getPrototypeOf = supportsProto
			? function get__proto__(object) {
				return object.__proto__;
			}
			: function getConstructorHack(object) {
				// May break if the constructor has been tampered with
				return object == null || !object.constructor || object === Object.prototype ? null :
					(object.constructor.prototype === object ?
					Object.prototype
					: object.constructor.prototype);
			};
	function __() { };
	//for ancient browsers - polyfill Array.prototype.forEach
	if (!Array_prototype_forEach) {
		Array_prototype.forEach = Array_prototype_forEach = function forEach(fn, scope) {
			for (var i = 0, len = this.length; i < len; ++i) {
				fn.call(scope || this, this[i], i, this);
			}
		}
	}

	Function_prototype.fastClass = function fastClass(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.fastClass(function(base, baseCtor) { <br/>
		/// ___ this.constructor = function(name) { //the cosntructor can be optional <br/>
		/// ______ baseCtor.call(this, name); //call the baseCtor <br/>
		/// ___ };<br/>
		/// ___ this.draw = function() {  <br/>
		/// ______ return base.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { this.constructor = function() {..}; this.method1 = function() {...}... }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .fastClass on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>

		//this == constructor of the base "Class"
		var baseClass = this;
		var base = this.prototype;
		creator = creator || function fastClassCreator() { this.constructor = function fastClassCtor() { baseClass.apply(this, arguments); } };
		creator.prototype = base;

		//creating the derrived class' prototype
		var derrivedProrotype = new creator(base, this);
		var Derrived;
		//did you forget or not intend to add a constructor? We'll add one for you
		if (!derrivedProrotype.hasOwnProperty("constructor"))
			derrivedProrotype.constructor = function fastClassDefaultConstructor() { baseClass.apply(this, arguments); }
		Derrived = derrivedProrotype.constructor;
		//setting the derrivedPrototype to constructor's prototype
		Derrived.prototype = derrivedProrotype;

		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			var creatorResult = derrivedProrotype;
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseClass.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
		});

		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype in the creator function by setting creator.prototype = base on above
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		//returning the constructor
		return Derrived;
	};

	Function_prototype.inheritWith = !supportsProto ? function inheritWith(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var creatorResult = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : function inheritWithConstructor() {
			baseCtor.apply(this, arguments);
		}; //automatic constructor if ommited

		WAssert(false, !isNode && window.intellisense && function WAssertRedirectDefinition() {
			//trigger intellisense on VS2012 when pressing F12 (go to reference) to go to the creator rather than the defaultCtor
			intellisense.redirectDefinition(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : creator);
			intellisense.annotate(Derrived, creatorResult.hasOwnProperty('constructor') ? creatorResult.constructor : baseCtor);
			creatorResult.constructor = Derrived;//ensure we're forwarding deep base classes constructor's XMLDoc to inherited constructors if they don't provide one
			Object.getOwnPropertyNames(creatorResult).forEach(function (name) {
				var f = creatorResult[name];
				if (typeof f === "function") {
					intellisense.addEventListener('signaturehelp', function (event) {
						if (event.target != f) return;
						var args = [event.functionHelp];
						var p = baseCtor.prototype;
						while (p != Object.prototype) {
							args.push(p.hasOwnProperty(name) ? p[name] : null);
							p = Object.getPrototypeOf(p);
						}
						intellisense.inheritXMLDoc.apply(null, args);
					});
				}
			});
		});
		var derrivedPrototype;
		__.prototype = this.prototype;
		Derrived.prototype = derrivedPrototype = new __;


		creator = creatorResult;//change the first parameter with the creatorResult
		Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;

		return Derrived;
	} :// when browser supports __proto__ setting it is way faster than iterating the object
	function inheritWithProto(creator, mixins) {
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor returned by the creator parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith(function(base, baseCtor) { <br/>
		/// ___ return { <br/>
		/// ______ constructor: function(name) { //the cosntructor can be optional <br/>
		/// _________ baseCtor.call(this, name); //explicitelly call the base class by name <br/>
		/// ______ },<br/>
		/// ______ draw: function() {  <br/>
		/// _________ return base.call(this, "square"); //explicitely call the base class prototype's  method by name <br/>
		/// ______ },<br/>
		/// ___ };<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Function">function(base, baseCtor) { return { constructor: function() {..}...} }<br/>where base is BaseClass.prototype and baseCtor is BaseClass - aka the function you are calling .inheritWith on</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Inherits the function's prototype to a new function named constructor passed into the object as parameter
		///<br/><br/>
		/// var Square = Figure.inheritWith({ <br/>
		/// ___ constructor: function(name) { //the cosntructor can be optional <br/>
		/// ______ Figure.call(this, name); //call the baseCtor <br/>
		/// ___ },<br/>
		/// ___ draw: function() {  <br/>
		/// ______ return Figure.prototype.call(this, "square"); //call the base class prototype's method<br/>
		/// ___ },<br/>
		/// }); // you can specify any mixins here<br/>
		///</summary>
		/// <param name="creator" type="Object">An object containing members for the new function's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the derrived function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var baseCtor = this;
		var derrivedPrototype = (typeof creator === "function" ? creator.call(this, this.prototype, this) : creator) || {};
		var Derrived = derrivedPrototype.hasOwnProperty('constructor') ? derrivedPrototype.constructor : function inheritWithProtoDefaultConstructor() {
			baseCtor.apply(this, arguments);
		}; //automatic constructor if ommited
		Derrived.prototype = derrivedPrototype;
		derrivedPrototype.__proto__ = this.prototype;
		creator = null;//set the first parameter to null as we have already 'shared' the base prototype into derrivedPrototype by using __proto__
		arguments.length > 1 && Function_prototype.define.apply(Derrived, arguments);
		Derrived.constructor = Derrived;
		return Derrived;
	};
	Function_prototype.define = function define(prototype, mixins) {
		/// <summary>Define members on the prototype of the given function with the custom methods and fields specified in the prototype parameter.</summary>
		/// <param name="prototype" type="Function || Plain Object">{} or function(prototype, ctor) {}<br/>A custom object with the methods or properties to be added on Extendee.prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to this function's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		var constructor = this;
		var extendeePrototype = this.prototype;
		var creatorResult = prototype;
		if (prototype) {
			if (typeof prototype === "function")
				prototype = prototype.call(extendeePrototype, this.prototype, this);
			for (var key in prototype)
				extendeePrototype[key] = prototype[key];
		}
		prototype = null;
		//intellisense.logMessage("defining....");
		(arguments.length > 2 || mixins) && (extendeePrototype.hasOwnProperty("__mixins__") || (Object_defineProperties ? (Object_defineProperty(extendeePrototype, "__mixins__", { enumerable: false, value: [], writeable: false }).__mixins__.__hidden = true) : extendeePrototype.__mixins__ = [])) && Array_prototype_forEach.call(arguments, function forEachMixin(mixin, index, mixinValue, isFunction) {
			isFunction = typeof mixin === 'function';
			if (isFunction) {
				__.prototype = mixin.prototype;
				mixinValue = new mixin(extendeePrototype, constructor);
			}
			else mixinValue = mixin;
			if (mixinValue) {
				//store the functions in the __mixins__ member on the prototype so they will be called on Function.initMixins(instance) function
				isFunction && extendeePrototype.__mixins__.push(mixin);
				//copy the prototype members from the mixin.prototype to extendeePrototype so we are only doing this once
				for (var key in mixinValue)
					if (key != "constructor" && key != "prototype") {
						//intellisense.logMessage("injecting " + key + " into " + extendeePrototype.name);
						WAssert(true, function WAssertInjecting() {
							//trigger intellisense on VS2012 for mixins
							if (key in extendeePrototype) {
								//allow abastract members on class/mixins so they can be replaced
								if (extendeePrototype[key] && extendeePrototype[key].abstract)
									return;
								var msg = "The '{0}' mixin defines a '{1}' named '{2}' which is already defined on the class {3}!"
									.format(isFunction && mixin.name || (index - 1), typeof mixinValue[key] === "function" ? "function" : "member", key, constructor.name ? ("'" + constructor.name + "'") : '');
								console.log(msg)
								!isNode && window.intellisense && intellisense.logMessage(msg);
								throw msg;
							}
							//set a custom glyph icon for mixin functions
							if (typeof mixinValue[key] === "function" && mixin != mixinValue[key] && mixin != constructor && mixin !== extendeePrototype) {
								mixinValue[key].__glyph = "GlyphCppProject";
							}
						});
						extendeePrototype[key] = mixinValue[key];
					}
			}
		});
		WAssert(true, !isNode && window.intellisense && function WAssertExtending() {
			//trigger intellisense on VS2012 for base class members, because same as IE, VS2012 doesn't support __proto__
			//for (var i in extendeePrototype)
			//	if (!creatorResult.hasOwnProperty(i)) {
			//		creatorResult[i] = extendeePrototype[i];
			//	}
			//inject properties from the new constructor
			//extendeePrototype = {};
			//intellisense.logMessage("injecting ctor.properties into " + JSON.stringify(creatorResult) + /function (.*)\(.*\)/gi.exec(arguments.callee.caller.caller.caller.toString())[1])
			__.prototype = extendeePrototype;
			var proto = new __;
			constructor.call(proto);
			for (var i in proto) {
				//intellisense.logMessage(i)
				if (i !== "constructor")
					//if (proto.hasOwnProperty(i))
					if (!creatorResult.hasOwnProperty(i))
						creatorResult[i] = proto[i];
			}

		});
		return this;
	}


	Function.define = function Function_define(func, prototype, mixins) {
		/// <signature>
		/// <summary>Extends the given func's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="func" type="Function">Specify the constructor function you want to define i.e. function() {}</param>
		/// <param name="prototype" type="Plain Object" optional="true">Specify an object that contain the functions or members that should defined on the provided func's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		/// <signature>
		/// <summary>Extends the given constructor's prototype with provided members of prototype and ensures calling the mixins in the constructor</summary>
		/// <param name="prototype" type="Plain Object">Specify an object that contain the constructor and functions or members that should defined on the provided constructor's prototype</param>
		/// <param name="mixins"  type="Function || Plain Object" optional="true" parameterArray="true">Specify one ore more mixins to be added to the returned func's prototype. <br/>A Mixin is either a function which returns a plain object, or a plan object in itself. It contains method or properties to be added to this function's prototype</param>
		/// </signature>
		var result;
		var constructor = func || function defineDefaultConstructor() { }; //automatic constructor if ommited
		var applyDefine = arguments.length > 1;
		if (typeof func !== "function") {
			constructor = func.hasOwnProperty("constructor") ? func.constructor : function constructorDefaultObjConstructor() { };

			constructor.prototype = func;
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//VS2012 intellisense don't forward the actual creator as the function's prototype b/c we want to "inject" constructor's members into it
				function clone() {
					for (var i in func)
						if (func.hasOwnProperty(i))
							this[i] = func[i];
				}
				clone.prototype = Object.getPrototypeOf(func);
				constructor.prototype = new clone;
			});


			applyDefine = true;
		}
		else {
			func = prototype;
			prototype = null;
		}
		applyDefine && Function_prototype.define.apply(constructor, arguments);

		result = function defineInitMixinsConstructor() {
			// automatically call initMixins and then the first constructor
			Function.initMixins(this);
			constructor.apply(this, arguments);
		}
		//we are sharing constructor's prototype
		result.prototype = constructor.prototype;
		//forward the VS2012 intellisense to the given constructor function
		WAssert(true, !isNode && window.intellisense && function WAssert() {
			window.intellisense && intellisense.redirectDefinition(result, constructor);
		});
		result.constructor = result.prototype.constructor = constructor.constructor = constructor.prototype.constructor = result;
		return result;
	};

	Function_prototype.defineStatic = function (copyPropertiesFrom) {
		/// <summary>Copies all the members of the given object, including those on its prototype if any, to this function (and not on its prototype)<br/>For extending this functions' prototype use .define()</summary>
		/// <param name="copyPropertiesFrom" type="Object">The object to copy the properties from</param>
		if (copyPropertiesFrom)
			for (var i in copyPropertiesFrom) {
				this[i] = copyPropertiesFrom[i];
			}
		return this;
	}
	function defaultAbstractMethod() {
		WAssert(false, "Not implemented")();
	}
	defaultAbstractMethod.defineStatic({ abstract: true });
	Function.abstract = function (message, func) {
		/// <summary>Returns an abstract function that asserts the given message. Optionally you can add some code to happen before assertion too</summary>
		/// <param name="message" type="String || Function">The message to be thrown when the newly method will be called. <br/>Defaults to: Not implemented</param>
		/// <param name="func" type="Function" optional="true">Specify a custom function to be called before the assertion is thrown.</param>
		var result = message || func ? (function () {
			if (typeof message === "function")
				message.apply(this, arguments);
			if (typeof func === "function")
				func.apply(this, arguments);
			if (typeof message === "string")
				WAssert(false, message)();
			else defaultAbstractMethod();
		}).defineStatic({ abstract: true }) : defaultAbstractMethod;
		WAssert(true, !isNode && window.intellisense && function () {
			if (result != defaultAbstractMethod) {
				if (typeof message === "function")
					intellisense.redirectDefinition(result, message);
				if (typeof func === "function")
					intellisense.redirectDefinition(result, func);
			}
		});
		return result;
	}

	Function.initMixins = function initMixins(objectInstance) {
		/// <signature>
		/// <summary>Initializes the mixins on all of the prototypes of the given object instance<br/>This should only be called once per object, usually in the first constructor (the most base class)</summary>
		/// <param name="objectInstance" type="Object">The object instance for which the mixins needs to be initialized</param>
		/// </signature>
		if (objectInstance && !objectInstance.__initMixins__) {
			var p = objectInstance, mixins, length, i, mixin, calledMixins = {};
			objectInstance.__initMixins__ = 1;
			WAssert(true, !isNode && window.intellisense && function WAssert() {
				//hide __initMixins from VS2012 intellisense
				objectInstance.__initMixins__ = { __hidden: true };
			});
			while (p) {
				p = supportsProto ? p.__proto__ : Object.getPrototypeOf(p);
				if (p && p.hasOwnProperty("__mixins__") && (mixins = p.__mixins__) && (length = mixins.length))
					for (i = 0; mixin = mixins[i], i < length; i++) {
						//WAssert(true, window.intellisense && function WAssert() {
						//	//for correct VS2012 intellisense, at the time of mixin declaration we need to execute new mixin() rather than mixin.call(objectInstance, p, p.constructor) otherwise the glyph icons will look like they are defined on mixin / prototype rather than on the mixin itself
						//	if (!(mixin in calledMixins)) {
						//		calledMixins[mixin] = 1;
						//		new mixin(p, p.constructor);
						//	}
						//});
						if (!(mixin in calledMixins)) {
							calledMixins[mixin] = 1;
							mixin.call(objectInstance, p, p.constructor);
						}
					}
			}
			delete objectInstance.__initMixins__;
		}
	};

	if (Object_defineProperties) {
		var o = {
			0: [Function, "initMixins", "define", "abstract"],
			1: [Function_prototype, "fastClass", "inheritWith", "define", "defineStatic"]
		}
		for (var p in o)
			for (var props = o[p], obj = props[0], i = 1, prop; prop = props[i], i < props.length; i++) {
				Object_defineProperty(obj, prop, { enumerable: false, value: obj[prop] });
			}
	}

})();
////Uncomment this for a quick demo & self test
//////////////////OPTION 1: inheritWith////////////////////////
////Using Define: 
////Function.prototype.define(proto) copies the given value from proto to function.prototype i.e. A in this case

//////Aternative for Function.define we can do this:
////var A = function (val) {
////     Function.initMixins(this);// since this is a top function, we need to call initMixins to make sure they will be initialized.
////	this.val = val;
////}.define({
////	method1: function (x, y, z) {
////		this.x = x;
////		this.y = y;
////		this.z = z;
////	}
////});

////To define the top level (first) function there is a sugar (as well as the above alternative)
//var A = Function.define(function(val) {
//     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
//	this.val = val;
//}, {
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using inheritWith

//var B = A.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (y, z) {
//			base.method1.call(this, 'x', 'y', z);
//		}
//	};
//});

//var C = B.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, 'y', z);
//		}
//	};
//});

//var D = C.inheritWith(function (base, baseCtor) {
//	return {
//		constructor: function (val) { baseCtor.call(this, val) },
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	};
//});


//selfTest();

//////////////////OPTION 2: fastClass////////////////////////
////Using Define:

////Aternative for Function.define we can do this:
//var A = function (val) {
//     Function.initMixins(this);// since this is a top function, we need to call initMixins to make sure they will be initialized.
//	this.val = val;
//}.define({
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});

////To define the top level (first) function there is a sugar (as well as the above alternative)
//var A = Function.define(function A(val) {
//     // when we are definin a top function with Function.define we DON'T need to call initMixins because they will be called automatically for us
//	this.val = val;
//}, {
//	method1: function (x, y, z) {
//		this.x = x;
//		this.y = y;
//		this.z = z;
//	}
//});


////Follow derrivations using fastClass
//var B = A.fastClass(function (base, baseCtor) {
//	this.constructor = function B(val) { baseCtor.call(this, val) };
//	this.method1 = function (y, z) {
//		base.method1.call(this, 'x', y, z);
//	}
//});
//var C = B.fastClass(function (base, baseCtor) {
//	this.constructor = function C(val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, 'y', z);
//	};
//});

//var D = C.fastClass(function (base, baseCtor) {
//	this.constructor = function D(val) { baseCtor.call(this, val) };
//	this.method1 = function (z) {
//		base.method1.call(this, z);
//	};
//});

////selfTest();

//function selfTest() {
//	var a = new A("a");
//	a.method1("x", "y", "z");
//	console.assert(a.x == "x", "a.x should be set to 'x'");
//	console.assert(a.y == "y", "a.y should be set to 'y'");
//	console.assert(a.z == "z", "a.z should be set to 'z'");
//	var b = new B("b");
//	b.method1("y", "z");
//	console.assert(b.x == "x", "b.x should be set to 'x'");
//	console.assert(b.y == "y", "b.y should be set to 'y'");
//	console.assert(b.z == "z", "b.z should be set to 'z'");
//	var c = new C("c");
//	c.method1("z");
//	console.assert(c.x == "x", "c.x should be set to 'x'");
//	console.assert(c.y == "y", "c.y should be set to 'y'");
//	console.assert(c.z == "z", "c.z should be set to 'z'");

//	var d = new D("d");
//	d.method1("w");
//	console.assert(d.x == "x", "d.x should be set to 'x'");
//	console.assert(d.y == "y", "d.y should be set to 'y'");
//	console.assert(d.z == "w", "d.z should be set to 'w'");

//	var expecteds = {
//		"d instanceof A": true,
//		"d instanceof B": true,
//		"d instanceof C": true,
//		"d instanceof D": true,
//		"c instanceof A": true,
//		"c instanceof B": true,
//		"c instanceof C": true,
//		"b instanceof A": true,
//		"b instanceof B": true,
//		"b instanceof C": false,
//		"a instanceof A": true,
//		"a instanceof B": false,
//		"a instanceof C": false,
//"A.prototype.constructor === a.constructor && a.constructor === A.constructor": true,//this should not equal to A itself due to mixins base function
//"B.prototype.constructor === b.constructor && b.constructor === B && B == B.constructor": true,
//"C.prototype.constructor === c.constructor && c.constructor === C && B == B.constructor": true,
//"D.prototype.constructor === d.constructor && d.constructor === D && B == B.constructor": true,
//}
//	for (var expectedKey in expecteds) {
//		var expected = expecteds[expectedKey];
//		var actual = eval(expectedKey);//using eval for quick demo self test purposing -- using eval is not recommended otherwise
//		console.assert(!(expected ^ actual), expectedKey + " expected: " + expected + ", actual: " + actual);
//	}
//}
//console.log("If there are no asserts in the console then all tests have passed! yey :)")

////defining a mixin
//var Point = function Point() {
//	this.point = { x: 1, y: 2 };
//}.define({
//	x: function x(x) {
//		/// <param name="x" optional="true">Specify a value to set the point.x. Don't specify anything will retrieve point.x</param>
//		return arguments.length ? (this.point.x = x) && this || this : this.point.x;
//	},
//	y: function y(y) {
//		/// <param name="y" optional="true">Specify a value to set the point.y. Don't specify anything will retrieve point.y</param>
//		return arguments.length ? (this.point.y = y) && this || this : this.point.y;
//	}
//});

////referencing the mixin:
//var E = D.inheritWith(function (base, baseCtor) {
//	return {
//		//no constructor !! - it will be added automatically for us
//		method1: function (z) {
//			base.method1.call(this, z);
//		}
//	};
//}, Point//specifying zero or more mixins - comma separated
//);

//var e = new E();
//e.x(2);//sets e.point.x to 2
//console.log("mixin Point.x expected to return 2. Actual: ", e.x());//returns 2

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
// Knockout JavaScript library v3.1.0
// (c) Steven Sanderson - http://knockoutjs.com/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function(){
var DEBUG=true;
(function(undefined){
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    var window = this || (0, eval)('this'),
        document = window['document'],
        navigator = window['navigator'],
        jQuery = window["jQuery"],
        JSON = window["JSON"];
(function(factory) {
    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        var target = module['exports'] || exports; // module.exports is for Node.js
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        define(['exports'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['ko'] = {});
    }
}(function(koExports){
// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
var ko = typeof koExports !== 'undefined' ? koExports : {};
// Google Closure Compiler helpers (used only to make the minified file smaller)
ko.exportSymbol = function(koPath, object) {
	var tokens = koPath.split(".");

	// In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
	// At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
	var target = ko;

	for (var i = 0; i < tokens.length - 1; i++)
		target = target[tokens[i]];
	target[tokens[tokens.length - 1]] = object;
};
ko.exportProperty = function(owner, publicName, object) {
  owner[publicName] = object;
};
ko.version = "3.1.0";

ko.exportSymbol('version', ko.version);
ko.utils = (function () {
    function objectForEach(obj, action) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                action(prop, obj[prop]);
            }
        }
    }

    function extend(target, source) {
        if (source) {
            for(var prop in source) {
                if(source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    function setPrototypeOf(obj, proto) {
        obj.__proto__ = proto;
        return obj;
    }

    var canSetPrototype = ({ __proto__: [] } instanceof Array);

    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
    var knownEvents = {}, knownEventTypesByEventName = {};
    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
    objectForEach(knownEvents, function(eventType, knownEventsForType) {
        if (knownEventsForType.length) {
            for (var i = 0, j = knownEventsForType.length; i < j; i++)
                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
        }
    });
    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
    // If there is a future need to detect specific versions of IE10+, we will amend this.
    var ieVersion = document && (function() {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        ) {}
        return version > 4 ? version : undefined;
    }());
    var isIe6 = ieVersion === 6,
        isIe7 = ieVersion === 7;

    function isClickOnCheckableElement(element, eventType) {
        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
        if (eventType.toLowerCase() != "click") return false;
        var inputType = element.type;
        return (inputType == "checkbox") || (inputType == "radio");
    }

    return {
        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

        arrayForEach: function (array, action) {
            for (var i = 0, j = array.length; i < j; i++)
                action(array[i], i);
        },

        arrayIndexOf: function (array, item) {
            if (typeof Array.prototype.indexOf == "function")
                return Array.prototype.indexOf.call(array, item);
            for (var i = 0, j = array.length; i < j; i++)
                if (array[i] === item)
                    return i;
            return -1;
        },

        arrayFirst: function (array, predicate, predicateOwner) {
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate.call(predicateOwner, array[i], i))
                    return array[i];
            return null;
        },

        arrayRemoveItem: function (array, itemToRemove) {
            var index = ko.utils.arrayIndexOf(array, itemToRemove);
            if (index > 0) {
                array.splice(index, 1);
            }
            else if (index === 0) {
                array.shift();
            }
        },

        arrayGetDistinctValues: function (array) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++) {
                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
                    result.push(array[i]);
            }
            return result;
        },

        arrayMap: function (array, mapping) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                result.push(mapping(array[i], i));
            return result;
        },

        arrayFilter: function (array, predicate) {
            array = array || [];
            var result = [];
            for (var i = 0, j = array.length; i < j; i++)
                if (predicate(array[i], i))
                    result.push(array[i]);
            return result;
        },

        arrayPushAll: function (array, valuesToPush) {
            if (valuesToPush instanceof Array)
                array.push.apply(array, valuesToPush);
            else
                for (var i = 0, j = valuesToPush.length; i < j; i++)
                    array.push(valuesToPush[i]);
            return array;
        },

        addOrRemoveItem: function(array, value, included) {
            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
            if (existingEntryIndex < 0) {
                if (included)
                    array.push(value);
            } else {
                if (!included)
                    array.splice(existingEntryIndex, 1);
            }
        },

        canSetPrototype: canSetPrototype,

        extend: extend,

        setPrototypeOf: setPrototypeOf,

        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

        objectForEach: objectForEach,

        objectMap: function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        },

        emptyDomNode: function (domNode) {
            while (domNode.firstChild) {
                ko.removeNode(domNode.firstChild);
            }
        },

        moveCleanedNodesToContainerElement: function(nodes) {
            // Ensure it's a real array, as we're about to reparent the nodes and
            // we don't want the underlying collection to change while we're doing that.
            var nodesArray = ko.utils.makeArray(nodes);

            var container = document.createElement('div');
            for (var i = 0, j = nodesArray.length; i < j; i++) {
                container.appendChild(ko.cleanNode(nodesArray[i]));
            }
            return container;
        },

        cloneNodes: function (nodesArray, shouldCleanNodes) {
            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
                var clonedNode = nodesArray[i].cloneNode(true);
                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
            }
            return newNodesArray;
        },

        setDomNodeChildren: function (domNode, childNodes) {
            ko.utils.emptyDomNode(domNode);
            if (childNodes) {
                for (var i = 0, j = childNodes.length; i < j; i++)
                    domNode.appendChild(childNodes[i]);
            }
        },

        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
            if (nodesToReplaceArray.length > 0) {
                var insertionPoint = nodesToReplaceArray[0];
                var parent = insertionPoint.parentNode;
                for (var i = 0, j = newNodesArray.length; i < j; i++)
                    parent.insertBefore(newNodesArray[i], insertionPoint);
                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
                    ko.removeNode(nodesToReplaceArray[i]);
                }
            }
        },

        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
            //
            // Rules:
            //   [A] Any leading nodes that have been removed should be ignored
            //       These most likely correspond to memoization nodes that were already removed during binding
            //       See https://github.com/SteveSanderson/knockout/pull/440
            //   [B] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
            //       and include any nodes that have been inserted among the previous collection

            if (continuousNodeArray.length) {
                // The parent node can be a virtual element; so get the real parent node
                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

                // Rule [A]
                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
                    continuousNodeArray.shift();

                // Rule [B]
                if (continuousNodeArray.length > 1) {
                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
                    // Replace with the actual new continuous node set
                    continuousNodeArray.length = 0;
                    while (current !== last) {
                        continuousNodeArray.push(current);
                        current = current.nextSibling;
                        if (!current) // Won't happen, except if the developer has manually removed some DOM elements (then we're in an undefined scenario)
                            return;
                    }
                    continuousNodeArray.push(last);
                }
            }
            return continuousNodeArray;
        },

        setOptionNodeSelectionState: function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (ieVersion < 7)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        },

        stringTrim: function (string) {
            return string === null || string === undefined ? '' :
                string.trim ?
                    string.trim() :
                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
        },

        stringTokenize: function (string, delimiter) {
            var result = [];
            var tokens = (string || "").split(delimiter);
            for (var i = 0, j = tokens.length; i < j; i++) {
                var trimmed = ko.utils.stringTrim(tokens[i]);
                if (trimmed !== "")
                    result.push(trimmed);
            }
            return result;
        },

        stringStartsWith: function (string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length)
                return false;
            return string.substring(0, startsWith.length) === startsWith;
        },

        domNodeIsContainedBy: function (node, containedByNode) {
            if (node === containedByNode)
                return true;
            if (node.nodeType === 11)
                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
            if (containedByNode.contains)
                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
            if (containedByNode.compareDocumentPosition)
                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
            while (node && node != containedByNode) {
                node = node.parentNode;
            }
            return !!node;
        },

        domNodeIsAttachedToDocument: function (node) {
            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
        },

        anyDomNodeIsAttachedToDocument: function(nodes) {
            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
        },

        tagNameLower: function(element) {
            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
            return element && element.tagName && element.tagName.toLowerCase();
        },

        registerEventHandler: function (element, eventType, handler) {
            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
            if (!mustUseAttachEvent && jQuery) {
                jQuery(element)['bind'](eventType, handler);
            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
                element.addEventListener(eventType, handler, false);
            else if (typeof element.attachEvent != "undefined") {
                var attachEventHandler = function (event) { handler.call(element, event); },
                    attachEventName = "on" + eventType;
                element.attachEvent(attachEventName, attachEventHandler);

                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
                // so to avoid leaks, we have to remove them manually. See bug #856
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    element.detachEvent(attachEventName, attachEventHandler);
                });
            } else
                throw new Error("Browser doesn't support addEventListener or attachEvent");
        },

        triggerEvent: function (element, eventType) {
            if (!(element && element.nodeType))
                throw new Error("element must be a DOM node when calling triggerEvent");

            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
            // In both cases, we'll use the click method instead.
            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

            if (jQuery && !useClickWorkaround) {
                jQuery(element)['trigger'](eventType);
            } else if (typeof document.createEvent == "function") {
                if (typeof element.dispatchEvent == "function") {
                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
                    var event = document.createEvent(eventCategory);
                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                    element.dispatchEvent(event);
                }
                else
                    throw new Error("The supplied element doesn't support dispatchEvent");
            } else if (useClickWorkaround && element.click) {
                element.click();
            } else if (typeof element.fireEvent != "undefined") {
                element.fireEvent("on" + eventType);
            } else {
                throw new Error("Browser doesn't support triggering events");
            }
        },

        unwrapObservable: function (value) {
            return ko.isObservable(value) ? value() : value;
        },

        peekObservable: function (value) {
            return ko.isObservable(value) ? value.peek() : value;
        },

        toggleDomNodeCssClass: function (node, classNames, shouldHaveClass) {
            if (classNames) {
                var cssClassNameRegex = /\S+/g,
                    currentClassNames = node.className.match(cssClassNameRegex) || [];
                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
                    ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
                });
                node.className = currentClassNames.join(" ");
            }
        },

        setTextContent: function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            // We need there to be exactly one child: a text node.
            // If there are no children, more than one, or if it's not a text node,
            // we'll clear everything and create a single text node.
            var innerTextNode = ko.virtualElements.firstChild(element);
            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
            } else {
                innerTextNode.data = value;
            }

            ko.utils.forceRefresh(element);
        },

        setElementName: function(element, name) {
            element.name = name;

            // Workaround IE 6/7 issue
            // - https://github.com/SteveSanderson/knockout/issues/197
            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
            if (ieVersion <= 7) {
                try {
                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
                }
                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
            }
        },

        forceRefresh: function(node) {
            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
            if (ieVersion >= 9) {
                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
                var elem = node.nodeType == 1 ? node : node.parentNode;
                if (elem.style)
                    elem.style.zoom = elem.style.zoom;
            }
        },

        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
            if (ieVersion) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        },

        range: function (min, max) {
            min = ko.utils.unwrapObservable(min);
            max = ko.utils.unwrapObservable(max);
            var result = [];
            for (var i = min; i <= max; i++)
                result.push(i);
            return result;
        },

        makeArray: function(arrayLikeObject) {
            var result = [];
            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
                result.push(arrayLikeObject[i]);
            };
            return result;
        },

        isIe6 : isIe6,
        isIe7 : isIe7,
        ieVersion : ieVersion,

        getFormFields: function(form, fieldName) {
            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
            var isMatchingField = (typeof fieldName == 'string')
                ? function(field) { return field.name === fieldName }
                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
            var matches = [];
            for (var i = fields.length - 1; i >= 0; i--) {
                if (isMatchingField(fields[i]))
                    matches.push(fields[i]);
            };
            return matches;
        },

        parseJson: function (jsonString) {
            if (typeof jsonString == "string") {
                jsonString = ko.utils.stringTrim(jsonString);
                if (jsonString) {
                    if (JSON && JSON.parse) // Use native parsing where available
                        return JSON.parse(jsonString);
                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
                }
            }
            return null;
        },

        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
            if (!JSON || !JSON.stringify)
                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
        },

        postJson: function (urlOrForm, data, options) {
            options = options || {};
            var params = options['params'] || {};
            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
            var url = urlOrForm;

            // If we were given a form, use its 'action' URL and pick out any requested field values
            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
                var originalForm = urlOrForm;
                url = originalForm.action;
                for (var i = includeFields.length - 1; i >= 0; i--) {
                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
                    for (var j = fields.length - 1; j >= 0; j--)
                        params[fields[j].name] = fields[j].value;
                }
            }

            data = ko.utils.unwrapObservable(data);
            var form = document.createElement("form");
            form.style.display = "none";
            form.action = url;
            form.method = "post";
            for (var key in data) {
                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
                var input = document.createElement("input");
                input.name = key;
                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
                form.appendChild(input);
            }
            objectForEach(params, function(key, value) {
                var input = document.createElement("input");
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            options['submitter'] ? options['submitter'](form) : form.submit();
            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
        }
    }
}());

ko.exportSymbol('utils', ko.utils);
ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
ko.exportSymbol('utils.extend', ko.utils.extend);
ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
ko.exportSymbol('utils.postJson', ko.utils.postJson);
ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
ko.exportSymbol('utils.range', ko.utils.range);
ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

if (!Function.prototype['bind']) {
    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
    Function.prototype['bind'] = function (object) {
        var originalFunction = this, args = Array.prototype.slice.call(arguments), object = args.shift();
        return function () {
            return originalFunction.apply(object, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

ko.utils.domData = new (function () {
    var uniqueId = 0;
    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
    var dataStore = {};

    function getAll(node, createIfNotFound) {
        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
        if (!hasExistingDataStore) {
            if (!createIfNotFound)
                return undefined;
            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
            dataStore[dataStoreKey] = {};
        }
        return dataStore[dataStoreKey];
    }

    return {
        get: function (node, key) {
            var allDataForNode = getAll(node, false);
            return allDataForNode === undefined ? undefined : allDataForNode[key];
        },
        set: function (node, key, value) {
            if (value === undefined) {
                // Make sure we don't actually create a new domData key if we are actually deleting a value
                if (getAll(node, false) === undefined)
                    return;
            }
            var allDataForNode = getAll(node, true);
            allDataForNode[key] = value;
        },
        clear: function (node) {
            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
            if (dataStoreKey) {
                delete dataStore[dataStoreKey];
                node[dataStoreKeyExpandoPropertyName] = null;
                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
            }
            return false;
        },

        nextKey: function () {
            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
        }
    };
})();

ko.exportSymbol('utils.domData', ko.utils.domData);
ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

ko.utils.domNodeDisposal = new (function () {
    var domDataKey = ko.utils.domData.nextKey();
    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

    function getDisposeCallbacksCollection(node, createIfNotFound) {
        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
            allDisposeCallbacks = [];
            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
        }
        return allDisposeCallbacks;
    }
    function destroyCallbacksCollection(node) {
        ko.utils.domData.set(node, domDataKey, undefined);
    }

    function cleanSingleNode(node) {
        // Run all the dispose callbacks
        var callbacks = getDisposeCallbacksCollection(node, false);
        if (callbacks) {
            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
            for (var i = 0; i < callbacks.length; i++)
                callbacks[i](node);
        }

        // Erase the DOM data
        ko.utils.domData.clear(node);

        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
        ko.utils.domNodeDisposal["cleanExternalData"](node);

        // Clear any immediate-child comment nodes, as these wouldn't have been found by
        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
        if (cleanableNodeTypesWithDescendants[node.nodeType])
            cleanImmediateCommentTypeChildren(node);
    }

    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
        var child, nextChild = nodeWithChildren.firstChild;
        while (child = nextChild) {
            nextChild = child.nextSibling;
            if (child.nodeType === 8)
                cleanSingleNode(child);
        }
    }

    return {
        addDisposeCallback : function(node, callback) {
            if (typeof callback != "function")
                throw new Error("Callback must be a function");
            getDisposeCallbacksCollection(node, true).push(callback);
        },

        removeDisposeCallback : function(node, callback) {
            var callbacksCollection = getDisposeCallbacksCollection(node, false);
            if (callbacksCollection) {
                ko.utils.arrayRemoveItem(callbacksCollection, callback);
                if (callbacksCollection.length == 0)
                    destroyCallbacksCollection(node);
            }
        },

        cleanNode : function(node) {
            // First clean this node, where applicable
            if (cleanableNodeTypes[node.nodeType]) {
                cleanSingleNode(node);

                // ... then its descendants, where applicable
                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
                    // Clone the descendants list in case it changes during iteration
                    var descendants = [];
                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
                    for (var i = 0, j = descendants.length; i < j; i++)
                        cleanSingleNode(descendants[i]);
                }
            }
            return node;
        },

        removeNode : function(node) {
            ko.cleanNode(node);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        },

        "cleanExternalData" : function (node) {
            // Special support for jQuery here because it's so commonly used.
            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
            // so notify it to tear down any resources associated with the node & descendants here.
            if (jQuery && (typeof jQuery['cleanData'] == "function"))
                jQuery['cleanData']([node]);
        }
    }
})();
ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
ko.exportSymbol('cleanNode', ko.cleanNode);
ko.exportSymbol('removeNode', ko.removeNode);
ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
(function () {
    var leadingCommentRegex = /^(\s*)<!--(.*?)-->/;

    function simpleHtmlParse(html) {
        // Based on jQuery's "clean" function, but only accounting for table-related elements.
        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

        // Trim whitespace, otherwise indexOf won't work as expected
        var tags = ko.utils.stringTrim(html).toLowerCase(), div = document.createElement("div");

        // Finds the first match from the left column, and returns the corresponding "wrap" data from the right column
        var wrap = tags.match(/^<(thead|tbody|tfoot)/)              && [1, "<table>", "</table>"] ||
                   !tags.indexOf("<tr")                             && [2, "<table><tbody>", "</tbody></table>"] ||
                   (!tags.indexOf("<td") || !tags.indexOf("<th"))   && [3, "<table><tbody><tr>", "</tr></tbody></table>"] ||
                   /* anything else */                                 [0, "", ""];

        // Go to html and back, then peel off extra wrappers
        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
        if (typeof window['innerShiv'] == "function") {
            div.appendChild(window['innerShiv'](markup));
        } else {
            div.innerHTML = markup;
        }

        // Move to the right depth
        while (wrap[0]--)
            div = div.lastChild;

        return ko.utils.makeArray(div.lastChild.childNodes);
    }

    function jQueryHtmlParse(html) {
        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
        if (jQuery['parseHTML']) {
            return jQuery['parseHTML'](html) || []; // Ensure we always return an array and never null
        } else {
            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
            var elems = jQuery['clean']([html]);

            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
            if (elems && elems[0]) {
                // Find the top-most parent element that's a direct child of a document fragment
                var elem = elems[0];
                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
                    elem = elem.parentNode;
                // ... then detach it
                if (elem.parentNode)
                    elem.parentNode.removeChild(elem);
            }

            return elems;
        }
    }

    ko.utils.parseHtmlFragment = function(html) {
        return jQuery ? jQueryHtmlParse(html)   // As below, benefit from jQuery's optimisations where possible
                      : simpleHtmlParse(html);  // ... otherwise, this simple logic will do in most common cases.
    };

    ko.utils.setHtml = function(node, html) {
        ko.utils.emptyDomNode(node);

        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
        html = ko.utils.unwrapObservable(html);

        if ((html !== null) && (html !== undefined)) {
            if (typeof html != 'string')
                html = html.toString();

            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
            // for example <tr> elements which are not normally allowed to exist on their own.
            // If you've referenced jQuery we'll use that rather than duplicating its code.
            if (jQuery) {
                jQuery(node)['html'](html);
            } else {
                // ... otherwise, use KO's own parsing logic.
                var parsedNodes = ko.utils.parseHtmlFragment(html);
                for (var i = 0; i < parsedNodes.length; i++)
                    node.appendChild(parsedNodes[i]);
            }
        }
    };
})();

ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

ko.memoization = (function () {
    var memos = {};

    function randomMax8HexChars() {
        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
    }
    function generateRandomId() {
        return randomMax8HexChars() + randomMax8HexChars();
    }
    function findMemoNodes(rootNode, appendToArray) {
        if (!rootNode)
            return;
        if (rootNode.nodeType == 8) {
            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
            if (memoId != null)
                appendToArray.push({ domNode: rootNode, memoId: memoId });
        } else if (rootNode.nodeType == 1) {
            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
                findMemoNodes(childNodes[i], appendToArray);
        }
    }

    return {
        memoize: function (callback) {
            if (typeof callback != "function")
                throw new Error("You can only pass a function to ko.memoization.memoize()");
            var memoId = generateRandomId();
            memos[memoId] = callback;
            return "<!--[ko_memo:" + memoId + "]-->";
        },

        unmemoize: function (memoId, callbackParams) {
            var callback = memos[memoId];
            if (callback === undefined)
                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
            try {
                callback.apply(null, callbackParams || []);
                return true;
            }
            finally { delete memos[memoId]; }
        },

        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
            var memos = [];
            findMemoNodes(domNode, memos);
            for (var i = 0, j = memos.length; i < j; i++) {
                var node = memos[i].domNode;
                var combinedParams = [node];
                if (extraCallbackParamsArray)
                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
                if (node.parentNode)
                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
            }
        },

        parseMemoText: function (memoText) {
            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
            return match ? match[1] : null;
        }
    };
})();

ko.exportSymbol('memoization', ko.memoization);
ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
ko.extenders = {
    'throttle': function(target, timeout) {
        // Throttling means two things:

        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
        target['throttleEvaluation'] = timeout;

        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
        //     so the target cannot change value synchronously or faster than a certain rate
        var writeTimeoutInstance = null;
        return ko.dependentObservable({
            'read': target,
            'write': function(value) {
                clearTimeout(writeTimeoutInstance);
                writeTimeoutInstance = setTimeout(function() {
                    target(value);
                }, timeout);
            }
        });
    },

    'rateLimit': function(target, options) {
        var timeout, method, limitFunction;

        if (typeof options == 'number') {
            timeout = options;
        } else {
            timeout = options['timeout'];
            method = options['method'];
        }

        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
        target.limit(function(callback) {
            return limitFunction(callback, timeout);
        });
    },

    'notify': function(target, notifyWhen) {
        target["equalityComparer"] = notifyWhen == "always" ?
            null :  // null equalityComparer means to always notify
            valuesArePrimitiveAndEqual;
    }
};

var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
function valuesArePrimitiveAndEqual(a, b) {
    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
    return oldValueIsPrimitive ? (a === b) : false;
}

function throttle(callback, timeout) {
    var timeoutInstance;
    return function () {
        if (!timeoutInstance) {
            timeoutInstance = setTimeout(function() {
                timeoutInstance = undefined;
                callback();
            }, timeout);
        }
    };
}

function debounce(callback, timeout) {
    var timeoutInstance;
    return function () {
        clearTimeout(timeoutInstance);
        timeoutInstance = setTimeout(callback, timeout);
    };
}

function applyExtenders(requestedExtenders) {
    var target = this;
    if (requestedExtenders) {
        ko.utils.objectForEach(requestedExtenders, function(key, value) {
            var extenderHandler = ko.extenders[key];
            if (typeof extenderHandler == 'function') {
                target = extenderHandler(target, value) || target;
            }
        });
    }
    return target;
}

ko.exportSymbol('extenders', ko.extenders);

ko.subscription = function (target, callback, disposeCallback) {
    this.target = target;
    this.callback = callback;
    this.disposeCallback = disposeCallback;
    this.isDisposed = false;
    ko.exportProperty(this, 'dispose', this.dispose);
};
ko.subscription.prototype.dispose = function () {
    this.isDisposed = true;
    this.disposeCallback();
};

ko.subscribable = function () {
    ko.utils.setPrototypeOfOrExtend(this, ko.subscribable['fn']);
    this._subscriptions = {};
}

var defaultEvent = "change";

var ko_subscribable_fn = {
    subscribe: function (callback, callbackTarget, event) {
        var self = this;

        event = event || defaultEvent;
        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

        var subscription = new ko.subscription(self, boundCallback, function () {
            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
        });

        // This will force a computed with deferEvaluation to evaluate before any subscriptions
        // are registered.
        if (self.peek) {
            self.peek();
        }

        if (!self._subscriptions[event])
            self._subscriptions[event] = [];
        self._subscriptions[event].push(subscription);
        return subscription;
    },

    "notifySubscribers": function (valueToNotify, event) {
        event = event || defaultEvent;
        if (this.hasSubscriptionsForEvent(event)) {
            try {
                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
                    // In case a subscription was disposed during the arrayForEach cycle, check
                    // for isDisposed on each subscription before invoking its callback
                    if (!subscription.isDisposed)
                        subscription.callback(valueToNotify);
                }
            } finally {
                ko.dependencyDetection.end(); // End suppressing dependency detection
            }
        }
    },

    limit: function(limitFunction) {
        var self = this, selfIsObservable = ko.isObservable(self),
            isPending, previousValue, pendingValue, beforeChange = 'beforeChange';

        if (!self._origNotifySubscribers) {
            self._origNotifySubscribers = self["notifySubscribers"];
            self["notifySubscribers"] = function(value, event) {
                if (!event || event === defaultEvent) {
                    self._rateLimitedChange(value);
                } else if (event === beforeChange) {
                    self._rateLimitedBeforeChange(value);
                } else {
                    self._origNotifySubscribers(value, event);
                }
            };
        }

        var finish = limitFunction(function() {
            // If an observable provided a reference to itself, access it to get the latest value.
            // This allows computed observables to delay calculating their value until needed.
            if (selfIsObservable && pendingValue === self) {
                pendingValue = self();
            }
            isPending = false;
            if (self.isDifferent(previousValue, pendingValue)) {
                self._origNotifySubscribers(previousValue = pendingValue);
            }
        });

        self._rateLimitedChange = function(value) {
            isPending = true;
            pendingValue = value;
            finish();
        };
        self._rateLimitedBeforeChange = function(value) {
            if (!isPending) {
                previousValue = value;
                self._origNotifySubscribers(value, beforeChange);
            }
        };
    },

    hasSubscriptionsForEvent: function(event) {
        return this._subscriptions[event] && this._subscriptions[event].length;
    },

    getSubscriptionsCount: function () {
        var total = 0;
        ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
            total += subscriptions.length;
        });
        return total;
    },

    isDifferent: function(oldValue, newValue) {
        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
    },

    extend: applyExtenders
};

ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

// For browsers that support proto assignment, we overwrite the prototype of each
// observable instance. Since observables are functions, we need Function.prototype
// to still be in the prototype chain.
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
}

ko.subscribable['fn'] = ko_subscribable_fn;


ko.isSubscribable = function (instance) {
    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
};

ko.exportSymbol('subscribable', ko.subscribable);
ko.exportSymbol('isSubscribable', ko.isSubscribable);

ko.computedContext = ko.dependencyDetection = (function () {
    var outerFrames = [],
        currentFrame,
        lastId = 0;

    // Return a unique ID that can be assigned to an observable for dependency tracking.
    // Theoretically, you could eventually overflow the number storage size, resulting
    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
    // take over 285 years to reach that number.
    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
    function getId() {
        return ++lastId;
    }

    function begin(options) {
        outerFrames.push(currentFrame);
        currentFrame = options;
    }

    function end() {
        currentFrame = outerFrames.pop();
    }

    return {
        begin: begin,

        end: end,

        registerDependency: function (subscribable) {
            if (currentFrame) {
                if (!ko.isSubscribable(subscribable))
                    throw new Error("Only subscribable things can act as dependencies");
                currentFrame.callback(subscribable, subscribable._id || (subscribable._id = getId()));
            }
        },

        ignore: function (callback, callbackTarget, callbackArgs) {
            try {
                begin();
                return callback.apply(callbackTarget, callbackArgs || []);
            } finally {
                end();
            }
        },

        getDependenciesCount: function () {
            if (currentFrame)
                return currentFrame.computed.getDependenciesCount();
        },

        isInitial: function() {
            if (currentFrame)
                return currentFrame.isInitial;
        }
    };
})();

ko.exportSymbol('computedContext', ko.computedContext);
ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);
ko.observable = function (initialValue) {
    var _latestValue = initialValue;

    function observable() {
        if (arguments.length > 0) {
            // Write

            // Ignore writes if the value hasn't changed
            if (observable.isDifferent(_latestValue, arguments[0])) {
                observable.valueWillMutate();
                _latestValue = arguments[0];
                if (DEBUG) observable._latestValue = _latestValue;
                observable.valueHasMutated();
            }
            return this; // Permits chained assignments
        }
        else {
            // Read
            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
            return _latestValue;
        }
    }
    ko.subscribable.call(observable);
    ko.utils.setPrototypeOfOrExtend(observable, ko.observable['fn']);

    if (DEBUG) observable._latestValue = _latestValue;
    observable.peek = function() { return _latestValue };
    observable.valueHasMutated = function () { observable["notifySubscribers"](_latestValue); }
    observable.valueWillMutate = function () { observable["notifySubscribers"](_latestValue, "beforeChange"); }

    ko.exportProperty(observable, 'peek', observable.peek);
    ko.exportProperty(observable, "valueHasMutated", observable.valueHasMutated);
    ko.exportProperty(observable, "valueWillMutate", observable.valueWillMutate);

    return observable;
}

ko.observable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};

var protoProperty = ko.observable.protoProperty = "__ko_proto__";
ko.observable['fn'][protoProperty] = ko.observable;

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observable['fn'], ko.subscribable['fn']);
}

ko.hasPrototype = function(instance, prototype) {
    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
    if (instance[protoProperty] === prototype) return true;
    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
};

ko.isObservable = function (instance) {
    return ko.hasPrototype(instance, ko.observable);
}
ko.isWriteableObservable = function (instance) {
    // Observable
    if ((typeof instance == "function") && instance[protoProperty] === ko.observable)
        return true;
    // Writeable dependent observable
    if ((typeof instance == "function") && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
        return true;
    // Anything else
    return false;
}


ko.exportSymbol('observable', ko.observable);
ko.exportSymbol('isObservable', ko.isObservable);
ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
ko.observableArray = function (initialValues) {
    initialValues = initialValues || [];

    if (typeof initialValues != 'object' || !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
    return result.extend({'trackArrayChanges':true});
};

ko.observableArray['fn'] = {
    'remove': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var removedValues = [];
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        for (var i = 0; i < underlyingArray.length; i++) {
            var value = underlyingArray[i];
            if (predicate(value)) {
                if (removedValues.length === 0) {
                    this.valueWillMutate();
                }
                removedValues.push(value);
                underlyingArray.splice(i, 1);
                i--;
            }
        }
        if (removedValues.length) {
            this.valueHasMutated();
        }
        return removedValues;
    },

    'removeAll': function (arrayOfValues) {
        // If you passed zero args, we remove everything
        if (arrayOfValues === undefined) {
            var underlyingArray = this.peek();
            var allValues = underlyingArray.slice(0);
            this.valueWillMutate();
            underlyingArray.splice(0, underlyingArray.length);
            this.valueHasMutated();
            return allValues;
        }
        // If you passed an arg, we interpret it as an array of entries to remove
        if (!arrayOfValues)
            return [];
        return this['remove'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'destroy': function (valueOrPredicate) {
        var underlyingArray = this.peek();
        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
        this.valueWillMutate();
        for (var i = underlyingArray.length - 1; i >= 0; i--) {
            var value = underlyingArray[i];
            if (predicate(value))
                underlyingArray[i]["_destroy"] = true;
        }
        this.valueHasMutated();
    },

    'destroyAll': function (arrayOfValues) {
        // If you passed zero args, we destroy everything
        if (arrayOfValues === undefined)
            return this['destroy'](function() { return true });

        // If you passed an arg, we interpret it as an array of entries to destroy
        if (!arrayOfValues)
            return [];
        return this['destroy'](function (value) {
            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
        });
    },

    'indexOf': function (item) {
        var underlyingArray = this();
        return ko.utils.arrayIndexOf(underlyingArray, item);
    },

    'replace': function(oldItem, newItem) {
        var index = this['indexOf'](oldItem);
        if (index >= 0) {
            this.valueWillMutate();
            this.peek()[index] = newItem;
            this.valueHasMutated();
        }
    }
};

// Populate ko.observableArray.fn with read/write functions from native arrays
// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
        // (for consistency with mutating regular observables)
        var underlyingArray = this.peek();
        this.valueWillMutate();
        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
        this.valueHasMutated();
        return methodCallResult;
    };
});

// Populate ko.observableArray.fn with read-only functions from native arrays
ko.utils.arrayForEach(["slice"], function (methodName) {
    ko.observableArray['fn'][methodName] = function () {
        var underlyingArray = this();
        return underlyingArray[methodName].apply(underlyingArray, arguments);
    };
});

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.observableArray constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
}

ko.exportSymbol('observableArray', ko.observableArray);
var arrayChangeEventName = 'arrayChange';
ko.extenders['trackArrayChanges'] = function(target) {
    // Only modify the target observable once
    if (target.cacheDiffForKnownOperation) {
        return;
    }
    var trackingChanges = false,
        cachedDiff = null,
        pendingNotifications = 0,
        underlyingSubscribeFunction = target.subscribe;

    // Intercept "subscribe" calls, and for array change events, ensure change tracking is enabled
    target.subscribe = target['subscribe'] = function(callback, callbackTarget, event) {
        if (event === arrayChangeEventName) {
            trackChanges();
        }
        return underlyingSubscribeFunction.apply(this, arguments);
    };

    function trackChanges() {
        // Calling 'trackChanges' multiple times is the same as calling it once
        if (trackingChanges) {
            return;
        }

        trackingChanges = true;

        // Intercept "notifySubscribers" to track how many times it was called.
        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
        target['notifySubscribers'] = function(valueToNotify, event) {
            if (!event || event === defaultEvent) {
                ++pendingNotifications;
            }
            return underlyingNotifySubscribersFunction.apply(this, arguments);
        };

        // Each time the array changes value, capture a clone so that on the next
        // change it's possible to produce a diff
        var previousContents = [].concat(target.peek() || []);
        cachedDiff = null;
        target.subscribe(function(currentContents) {
            // Make a copy of the current contents and ensure it's an array
            currentContents = [].concat(currentContents || []);

            // Compute the diff and issue notifications, but only if someone is listening
            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
                var changes = getChanges(previousContents, currentContents);
                if (changes.length) {
                    target['notifySubscribers'](changes, arrayChangeEventName);
                }
            }

            // Eliminate references to the old, removed items, so they can be GCed
            previousContents = currentContents;
            cachedDiff = null;
            pendingNotifications = 0;
        });
    }

    function getChanges(previousContents, currentContents) {
        // We try to re-use cached diffs.
        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
        // notifications are issued immediately so we wouldn't be queueing up more than one.
        if (!cachedDiff || pendingNotifications > 1) {
            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, { 'sparse': true });
        }

        return cachedDiff;
    }

    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
        // Only run if we're currently tracking changes for this observable array
        // and there aren't any pending deferred notifications.
        if (!trackingChanges || pendingNotifications) {
            return;
        }
        var diff = [],
            arrayLength = rawArray.length,
            argsLength = args.length,
            offset = 0;

        function pushDiff(status, value, index) {
            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
        }
        switch (operationName) {
            case 'push':
                offset = arrayLength;
            case 'unshift':
                for (var index = 0; index < argsLength; index++) {
                    pushDiff('added', args[index], offset + index);
                }
                break;

            case 'pop':
                offset = arrayLength - 1;
            case 'shift':
                if (arrayLength) {
                    pushDiff('deleted', rawArray[offset], offset);
                }
                break;

            case 'splice':
                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
                    endAddIndex = startIndex + argsLength - 2,
                    endIndex = Math.max(endDeleteIndex, endAddIndex),
                    additions = [], deletions = [];
                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
                    if (index < endDeleteIndex)
                        deletions.push(pushDiff('deleted', rawArray[index], index));
                    if (index < endAddIndex)
                        additions.push(pushDiff('added', args[argsIndex], index));
                }
                ko.utils.findMovesInArrayComparison(deletions, additions);
                break;

            default:
                return;
        }
        cachedDiff = diff;
    };
};
ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
    var _latestValue,
        _needsEvaluation = true,
        _isBeingEvaluated = false,
        _suppressDisposalUntilDisposeWhenReturnsFalse = false,
        _isDisposed = false,
        readFunction = evaluatorFunctionOrOptions;

    if (readFunction && typeof readFunction == "object") {
        // Single-parameter syntax - everything is on this "options" param
        options = readFunction;
        readFunction = options["read"];
    } else {
        // Multi-parameter syntax - construct the options according to the params passed
        options = options || {};
        if (!readFunction)
            readFunction = options["read"];
    }
    if (typeof readFunction != "function")
        throw new Error("Pass a function that returns the value of the ko.computed");

    function addSubscriptionToDependency(subscribable, id) {
        if (!_subscriptionsToDependencies[id]) {
            _subscriptionsToDependencies[id] = subscribable.subscribe(evaluatePossiblyAsync);
            ++_dependenciesCount;
        }
    }

    function disposeAllSubscriptionsToDependencies() {
        _isDisposed = true;
        ko.utils.objectForEach(_subscriptionsToDependencies, function (id, subscription) {
            subscription.dispose();
        });
        _subscriptionsToDependencies = {};
        _dependenciesCount = 0;
        _needsEvaluation = false;
    }

    function evaluatePossiblyAsync() {
        var throttleEvaluationTimeout = dependentObservable['throttleEvaluation'];
        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
            clearTimeout(evaluationTimeoutInstance);
            evaluationTimeoutInstance = setTimeout(evaluateImmediate, throttleEvaluationTimeout);
        } else if (dependentObservable._evalRateLimited) {
            dependentObservable._evalRateLimited();
        } else {
            evaluateImmediate();
        }
    }

    function evaluateImmediate() {
        if (_isBeingEvaluated) {
            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
            return;
        }

        // Do not evaluate (and possibly capture new dependencies) if disposed
        if (_isDisposed) {
            return;
        }

        if (disposeWhen && disposeWhen()) {
            // See comment below about _suppressDisposalUntilDisposeWhenReturnsFalse
            if (!_suppressDisposalUntilDisposeWhenReturnsFalse) {
                dispose();
                return;
            }
        } else {
            // It just did return false, so we can stop suppressing now
            _suppressDisposalUntilDisposeWhenReturnsFalse = false;
        }

        _isBeingEvaluated = true;
        try {
            // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
            // Then, during evaluation, we cross off any that are in fact still being used.
            var disposalCandidates = _subscriptionsToDependencies, disposalCount = _dependenciesCount;
            ko.dependencyDetection.begin({
                callback: function(subscribable, id) {
                    if (!_isDisposed) {
                        if (disposalCount && disposalCandidates[id]) {
                            // Don't want to dispose this subscription, as it's still being used
                            _subscriptionsToDependencies[id] = disposalCandidates[id];
                            ++_dependenciesCount;
                            delete disposalCandidates[id];
                            --disposalCount;
                        } else {
                            // Brand new subscription - add it
                            addSubscriptionToDependency(subscribable, id);
                        }
                    }
                },
                computed: dependentObservable,
                isInitial: !_dependenciesCount        // If we're evaluating when there are no previous dependencies, it must be the first time
            });

            _subscriptionsToDependencies = {};
            _dependenciesCount = 0;

            try {
                var newValue = evaluatorFunctionTarget ? readFunction.call(evaluatorFunctionTarget) : readFunction();

            } finally {
                ko.dependencyDetection.end();

                // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
                if (disposalCount) {
                    ko.utils.objectForEach(disposalCandidates, function(id, toDispose) {
                        toDispose.dispose();
                    });
                }

                _needsEvaluation = false;
            }

            if (dependentObservable.isDifferent(_latestValue, newValue)) {
                dependentObservable["notifySubscribers"](_latestValue, "beforeChange");

                _latestValue = newValue;
                if (DEBUG) dependentObservable._latestValue = _latestValue;

                // If rate-limited, the notification will happen within the limit function. Otherwise,
                // notify as soon as the value changes. Check specifically for the throttle setting since
                // it overrides rateLimit.
                if (!dependentObservable._evalRateLimited || dependentObservable['throttleEvaluation']) {
                    dependentObservable["notifySubscribers"](_latestValue);
                }
            }
        } finally {
            _isBeingEvaluated = false;
        }

        if (!_dependenciesCount)
            dispose();
    }

    function dependentObservable() {
        if (arguments.length > 0) {
            if (typeof writeFunction === "function") {
                // Writing a value
                writeFunction.apply(evaluatorFunctionTarget, arguments);
            } else {
                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
            }
            return this; // Permits chained assignments
        } else {
            // Reading the value
            if (_needsEvaluation)
                evaluateImmediate();
            ko.dependencyDetection.registerDependency(dependentObservable);
            return _latestValue;
        }
    }

    function peek() {
        // Peek won't re-evaluate, except to get the initial value when "deferEvaluation" is set.
        // That's the only time that both of these conditions will be satisfied.
        if (_needsEvaluation && !_dependenciesCount)
            evaluateImmediate();
        return _latestValue;
    }

    function isActive() {
        return _needsEvaluation || _dependenciesCount > 0;
    }

    // By here, "options" is always non-null
    var writeFunction = options["write"],
        disposeWhenNodeIsRemoved = options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
        disposeWhenOption = options["disposeWhen"] || options.disposeWhen,
        disposeWhen = disposeWhenOption,
        dispose = disposeAllSubscriptionsToDependencies,
        _subscriptionsToDependencies = {},
        _dependenciesCount = 0,
        evaluationTimeoutInstance = null;

    if (!evaluatorFunctionTarget)
        evaluatorFunctionTarget = options["owner"];

    ko.subscribable.call(dependentObservable);
    ko.utils.setPrototypeOfOrExtend(dependentObservable, ko.dependentObservable['fn']);

    dependentObservable.peek = peek;
    dependentObservable.getDependenciesCount = function () { return _dependenciesCount; };
    dependentObservable.hasWriteFunction = typeof options["write"] === "function";
    dependentObservable.dispose = function () { dispose(); };
    dependentObservable.isActive = isActive;

    // Replace the limit function with one that delays evaluation as well.
    var originalLimit = dependentObservable.limit;
    dependentObservable.limit = function(limitFunction) {
        originalLimit.call(dependentObservable, limitFunction);
        dependentObservable._evalRateLimited = function() {
            dependentObservable._rateLimitedBeforeChange(_latestValue);

            _needsEvaluation = true;    // Mark as dirty

            // Pass the observable to the rate-limit code, which will access it when
            // it's time to do the notification.
            dependentObservable._rateLimitedChange(dependentObservable);
        }
    };

    ko.exportProperty(dependentObservable, 'peek', dependentObservable.peek);
    ko.exportProperty(dependentObservable, 'dispose', dependentObservable.dispose);
    ko.exportProperty(dependentObservable, 'isActive', dependentObservable.isActive);
    ko.exportProperty(dependentObservable, 'getDependenciesCount', dependentObservable.getDependenciesCount);

    // Add a "disposeWhen" callback that, on each evaluation, disposes if the node was removed without using ko.removeNode.
    if (disposeWhenNodeIsRemoved) {
        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
        // we'll prevent disposal until "disposeWhen" first returns false.
        _suppressDisposalUntilDisposeWhenReturnsFalse = true;

        // Only watch for the node's disposal if the value really is a node. It might not be,
        // e.g., { disposeWhenNodeIsRemoved: true } can be used to opt into the "only dispose
        // after first false result" behaviour even if there's no specific node to watch. This
        // technique is intended for KO's internal use only and shouldn't be documented or used
        // by application code, as it's likely to change in a future version of KO.
        if (disposeWhenNodeIsRemoved.nodeType) {
            disposeWhen = function () {
                return !ko.utils.domNodeIsAttachedToDocument(disposeWhenNodeIsRemoved) || (disposeWhenOption && disposeWhenOption());
            };
        }
    }

    // Evaluate, unless deferEvaluation is true
    if (options['deferEvaluation'] !== true)
        evaluateImmediate();

    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
    if (disposeWhenNodeIsRemoved && isActive() && disposeWhenNodeIsRemoved.nodeType) {
        dispose = function() {
            ko.utils.domNodeDisposal.removeDisposeCallback(disposeWhenNodeIsRemoved, dispose);
            disposeAllSubscriptionsToDependencies();
        };
        ko.utils.domNodeDisposal.addDisposeCallback(disposeWhenNodeIsRemoved, dispose);
    }

    return dependentObservable;
};

ko.isComputed = function(instance) {
    return ko.hasPrototype(instance, ko.dependentObservable);
};

var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
ko.dependentObservable[protoProp] = ko.observable;

ko.dependentObservable['fn'] = {
    "equalityComparer": valuesArePrimitiveAndEqual
};
ko.dependentObservable['fn'][protoProp] = ko.dependentObservable;

// Note that for browsers that don't support proto assignment, the
// inheritance chain is created manually in the ko.dependentObservable constructor
if (ko.utils.canSetPrototype) {
    ko.utils.setPrototypeOf(ko.dependentObservable['fn'], ko.subscribable['fn']);
}

ko.exportSymbol('dependentObservable', ko.dependentObservable);
ko.exportSymbol('computed', ko.dependentObservable); // Make "ko.computed" an alias for "ko.dependentObservable"
ko.exportSymbol('isComputed', ko.isComputed);

(function() {
    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

    ko.toJS = function(rootObject) {
        if (arguments.length == 0)
            throw new Error("When calling ko.toJS, pass the object you want to convert.");

        // We just unwrap everything at every level in the object graph
        return mapJsObjectGraph(rootObject, function(valueToMap) {
            // Loop because an observable's value might in turn be another observable wrapper
            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
                valueToMap = valueToMap();
            return valueToMap;
        });
    };

    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
        var plainJavaScriptObject = ko.toJS(rootObject);
        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
    };

    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
        visitedObjects = visitedObjects || new objectLookup();

        rootObject = mapInputCallback(rootObject);
        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
        if (!canHaveProperties)
            return rootObject;

        var outputProperties = rootObject instanceof Array ? [] : {};
        visitedObjects.save(rootObject, outputProperties);

        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
            var propertyValue = mapInputCallback(rootObject[indexer]);

            switch (typeof propertyValue) {
                case "boolean":
                case "number":
                case "string":
                case "function":
                    outputProperties[indexer] = propertyValue;
                    break;
                case "object":
                case "undefined":
                    var previouslyMappedValue = visitedObjects.get(propertyValue);
                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
                        ? previouslyMappedValue
                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
                    break;
            }
        });

        return outputProperties;
    }

    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
        if (rootObject instanceof Array) {
            for (var i = 0; i < rootObject.length; i++)
                visitorCallback(i);

            // For arrays, also respect toJSON property for custom mappings (fixes #278)
            if (typeof rootObject['toJSON'] == 'function')
                visitorCallback('toJSON');
        } else {
            for (var propertyName in rootObject) {
                visitorCallback(propertyName);
            }
        }
    };

    function objectLookup() {
        this.keys = [];
        this.values = [];
    };

    objectLookup.prototype = {
        constructor: objectLookup,
        save: function(key, value) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            if (existingIndex >= 0)
                this.values[existingIndex] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        },
        get: function(key) {
            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
        }
    };
})();

ko.exportSymbol('toJS', ko.toJS);
ko.exportSymbol('toJSON', ko.toJSON);
(function () {
    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
    ko.selectExtensions = {
        readValue : function(element) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    if (element[hasDomDataExpandoProperty] === true)
                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
                    return ko.utils.ieVersion <= 7
                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
                        : element.value;
                case 'select':
                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
                default:
                    return element.value;
            }
        },

        writeValue: function(element, value, allowUnset) {
            switch (ko.utils.tagNameLower(element)) {
                case 'option':
                    switch(typeof value) {
                        case "string":
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
                                delete element[hasDomDataExpandoProperty];
                            }
                            element.value = value;
                            break;
                        default:
                            // Store arbitrary object using DomData
                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
                            element[hasDomDataExpandoProperty] = true;

                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
                            element.value = typeof value === "number" ? value : "";
                            break;
                    }
                    break;
                case 'select':
                    if (value === "" || value === null)       // A blank string or null value will select the caption
                        value = undefined;
                    var selection = -1;
                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
                        optionValue = ko.selectExtensions.readValue(element.options[i]);
                        // Include special check to handle selecting a caption with a blank string value
                        if (optionValue == value || (optionValue == "" && value === undefined)) {
                            selection = i;
                            break;
                        }
                    }
                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
                        element.selectedIndex = selection;
                    }
                    break;
                default:
                    if ((value === null) || (value === undefined))
                        value = "";
                    element.value = value;
                    break;
            }
        }
    };
})();

ko.exportSymbol('selectExtensions', ko.selectExtensions);
ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
ko.expressionRewriting = (function () {
    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

    function getWriteableValue(expression) {
        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
            return false;
        var match = expression.match(javaScriptAssignmentTarget);
        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
    }

    // The following regular expressions will be used to split an object-literal string into tokens

        // These two match strings, either with double quotes or single quotes
    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
        // as a regular expression (this is handled by the parsing loop below).
        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
        // These characters have special meaning to the parser and must not appear in the middle of a
        // token, except as part of a string.
        specials = ',"\'{}()/:[\\]',
        // Match text (at least two characters) that does not contain any of the above special characters,
        // although some of the special characters are allowed to start it (all but the colon and comma).
        // The text can contain spaces, but leading or trailing spaces are skipped.
        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
        // Match any non-space character not matched already. This will match colons and commas, since they're
        // not matched by "everyThingElse", but will also match any other single character that wasn't already
        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
        oneNotSpace = '[^\\s]',

        // Create the actual regular expression by or-ing the above strings. The order is important.
        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

        // Match end of previous token to determine whether a slash is a division or regex.
        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

    function parseObjectLiteral(objectLiteralString) {
        // Trim leading and trailing spaces from the string
        var str = ko.utils.stringTrim(objectLiteralString);

        // Trim braces '{' surrounding the whole object literal
        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

        // Split into tokens
        var result = [], toks = str.match(bindingToken), key, values, depth = 0;

        if (toks) {
            // Append a comma so that we don't need a separate code block to deal with the last item
            toks.push(',');

            for (var i = 0, tok; tok = toks[i]; ++i) {
                var c = tok.charCodeAt(0);
                // A comma signals the end of a key/value pair if depth is zero
                if (c === 44) { // ","
                    if (depth <= 0) {
                        if (key)
                            result.push(values ? {key: key, value: values.join('')} : {'unknown': key});
                        key = values = depth = 0;
                        continue;
                    }
                // Simply skip the colon that separates the name and value
                } else if (c === 58) { // ":"
                    if (!values)
                        continue;
                // A set of slashes is initially matched as a regular expression, but could be division
                } else if (c === 47 && i && tok.length > 1) {  // "/"
                    // Look at the end of the previous token to determine if the slash is actually division
                    var match = toks[i-1].match(divisionLookBehind);
                    if (match && !keywordRegexLookBehind[match[0]]) {
                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
                        str = str.substr(str.indexOf(tok) + 1);
                        toks = str.match(bindingToken);
                        toks.push(',');
                        i = -1;
                        // Continue with just the slash
                        tok = '/';
                    }
                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
                    ++depth;
                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
                    --depth;
                // The key must be a single token; if it's a string, trim the quotes
                } else if (!key && !values) {
                    key = (c === 34 || c === 39) /* '"', "'" */ ? tok.slice(1, -1) : tok;
                    continue;
                }
                if (values)
                    values.push(tok);
                else
                    values = [tok];
            }
        }
        return result;
    }

    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
    var twoWayBindings = {};

    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
        bindingOptions = bindingOptions || {};

        function processKeyValue(key, val) {
            var writableVal;
            function callPreprocessHook(obj) {
                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
            }
            if (!callPreprocessHook(ko['getBindingHandler'](key)))
                return;

            if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
                // For two-way bindings, provide a write method in case the value
                // isn't a writable observable.
                propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
            }

            // Values are wrapped in a function so that each value can be accessed independently
            if (makeValueAccessors) {
                val = 'function(){return ' + val + ' }';
            }
            resultStrings.push("'" + key + "':" + val);
        }

        var resultStrings = [],
            propertyAccessorResultStrings = [],
            makeValueAccessors = bindingOptions['valueAccessors'],
            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
        });

        if (propertyAccessorResultStrings.length)
            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

        return resultStrings.join(",");
    }

    return {
        bindingRewriteValidators: [],

        twoWayBindings: twoWayBindings,

        parseObjectLiteral: parseObjectLiteral,

        preProcessBindings: preProcessBindings,

        keyValueArrayContainsKey: function(keyValueArray, key) {
            for (var i = 0; i < keyValueArray.length; i++)
                if (keyValueArray[i]['key'] == key)
                    return true;
            return false;
        },

        // Internal, private KO utility for updating model properties from within bindings
        // property:            If the property being updated is (or might be) an observable, pass it here
        //                      If it turns out to be a writable observable, it will be written to directly
        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
        // value:               The value to be written
        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
        //                      it is !== existing value on that writable observable
        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
            if (!property || !ko.isObservable(property)) {
                var propWriters = allBindings.get('_ko_property_writers');
                if (propWriters && propWriters[key])
                    propWriters[key](value);
            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
                property(value);
            }
        }
    };
})();

ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
// all bindings could use an official 'property writer' API without needing to declare that they might). However,
// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
// as an internal implementation detail in the short term.
// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
(function() {
    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
    // of that virtual hierarchy
    //
    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
    // without having to scatter special cases all over the binding and templating code.

    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
    // So, use node.text where available, and node.nodeValue elsewhere
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

    function isStartComment(node) {
        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function isEndComment(node) {
        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
    }

    function getVirtualChildren(startComment, allowUnbalanced) {
        var currentNode = startComment;
        var depth = 1;
        var children = [];
        while (currentNode = currentNode.nextSibling) {
            if (isEndComment(currentNode)) {
                depth--;
                if (depth === 0)
                    return children;
            }

            children.push(currentNode);

            if (isStartComment(currentNode))
                depth++;
        }
        if (!allowUnbalanced)
            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
        return null;
    }

    function getMatchingEndComment(startComment, allowUnbalanced) {
        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
        if (allVirtualChildren) {
            if (allVirtualChildren.length > 0)
                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
            return startComment.nextSibling;
        } else
            return null; // Must have no matching end comment, and allowUnbalanced is true
    }

    function getUnbalancedChildTags(node) {
        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
        var childNode = node.firstChild, captureRemaining = null;
        if (childNode) {
            do {
                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
                    captureRemaining.push(childNode);
                else if (isStartComment(childNode)) {
                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
                        childNode = matchingEndComment;
                    else
                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
                } else if (isEndComment(childNode)) {
                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
                }
            } while (childNode = childNode.nextSibling);
        }
        return captureRemaining;
    }

    ko.virtualElements = {
        allowedBindings: {},

        childNodes: function(node) {
            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
        },

        emptyNode: function(node) {
            if (!isStartComment(node))
                ko.utils.emptyDomNode(node);
            else {
                var virtualChildren = ko.virtualElements.childNodes(node);
                for (var i = 0, j = virtualChildren.length; i < j; i++)
                    ko.removeNode(virtualChildren[i]);
            }
        },

        setDomNodeChildren: function(node, childNodes) {
            if (!isStartComment(node))
                ko.utils.setDomNodeChildren(node, childNodes);
            else {
                ko.virtualElements.emptyNode(node);
                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
                for (var i = 0, j = childNodes.length; i < j; i++)
                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
            }
        },

        prepend: function(containerNode, nodeToPrepend) {
            if (!isStartComment(containerNode)) {
                if (containerNode.firstChild)
                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
                else
                    containerNode.appendChild(nodeToPrepend);
            } else {
                // Start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
            }
        },

        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
            if (!insertAfterNode) {
                ko.virtualElements.prepend(containerNode, nodeToInsert);
            } else if (!isStartComment(containerNode)) {
                // Insert after insertion point
                if (insertAfterNode.nextSibling)
                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
                else
                    containerNode.appendChild(nodeToInsert);
            } else {
                // Children of start comments must always have a parent and at least one following sibling (the end comment)
                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
            }
        },

        firstChild: function(node) {
            if (!isStartComment(node))
                return node.firstChild;
            if (!node.nextSibling || isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        nextSibling: function(node) {
            if (isStartComment(node))
                node = getMatchingEndComment(node);
            if (node.nextSibling && isEndComment(node.nextSibling))
                return null;
            return node.nextSibling;
        },

        hasBindingValue: isStartComment,

        virtualNodeBindingValue: function(node) {
            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
            return regexMatch ? regexMatch[1] : null;
        },

        normaliseVirtualElementDomStructure: function(elementVerified) {
            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
            // that are direct descendants of <ul> into the preceding <li>)
            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
                return;

            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
            // must be intended to appear *after* that child, so move them there.
            var childNode = elementVerified.firstChild;
            if (childNode) {
                do {
                    if (childNode.nodeType === 1) {
                        var unbalancedTags = getUnbalancedChildTags(childNode);
                        if (unbalancedTags) {
                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
                            var nodeToInsertBefore = childNode.nextSibling;
                            for (var i = 0; i < unbalancedTags.length; i++) {
                                if (nodeToInsertBefore)
                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
                                else
                                    elementVerified.appendChild(unbalancedTags[i]);
                            }
                        }
                    }
                } while (childNode = childNode.nextSibling);
            }
        }
    };
})();
ko.exportSymbol('virtualElements', ko.virtualElements);
ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
(function() {
    var defaultBindingAttributeName = "data-bind";

    ko.bindingProvider = function() {
        this.bindingCache = {};
    };

    ko.utils.extend(ko.bindingProvider.prototype, {
        'nodeHasBindings': function(node) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName) != null;   // Element
                case 8: return ko.virtualElements.hasBindingValue(node); // Comment node
                default: return false;
            }
        },

        'getBindings': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext);
            return bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
        },

        'getBindingAccessors': function(node, bindingContext) {
            var bindingsString = this['getBindingsString'](node, bindingContext);
            return bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, {'valueAccessors':true}) : null;
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'getBindingsString': function(node, bindingContext) {
            switch (node.nodeType) {
                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
                default: return null;
            }
        },

        // The following function is only used internally by this default provider.
        // It's not part of the interface definition for a general binding provider.
        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
            try {
                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
                return bindingFunction(bindingContext, node);
            } catch (ex) {
                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
                throw ex;
            }
        }
    });

    ko.bindingProvider['instance'] = new ko.bindingProvider();

    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
        return cache[cacheKey]
            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
    }

    function createBindingsStringEvaluator(bindingsString, options) {
        // Build the source for a function that evaluates "expression"
        // For each scope variable, add an extra level of "with" nesting
        // Example result: with(sc1) { with(sc0) { return (expression) } }
        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
        return new Function("$context", "$element", functionBody);
    }
})();

ko.exportSymbol('bindingProvider', ko.bindingProvider);
(function () {
    ko.bindingHandlers = {};

    // The following element types will not be recursed into during binding. In the future, we
    // may consider adding <template> to this list, because such elements' contents are always
    // intended to be bound in a different context from where they appear in the document.
    var bindingDoesNotRecurseIntoElementTypes = {
        // Don't want bindings that operate on text nodes to mutate <script> contents,
        // because it's unexpected and a potential XSS issue
        'script': true
    };

    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
    ko['getBindingHandler'] = function(bindingKey) {
        return ko.bindingHandlers[bindingKey];
    };

    // The ko.bindingContext constructor is only called directly to create the root context. For child
    // contexts, use bindingContext.createChildContext or bindingContext.extend.
    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {

        // The binding context object includes static properties for the current, parent, and root view models.
        // If a view model is actually stored in an observable, the corresponding binding context object, and
        // any child contexts, must be updated when the view model is changed.
        function updateContext() {
            // Most of the time, the context will directly get a view model object, but if a function is given,
            // we call the function to retrieve the view model. If the function accesses any obsevables or returns
            // an observable, the dependency is tracked, and those observables can later cause the binding
            // context to be updated.
            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

            if (parentContext) {
                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
                // parent context is updated, this context will also be updated.
                if (parentContext._subscribable)
                    parentContext._subscribable();

                // Copy $root and any custom properties from the parent context
                ko.utils.extend(self, parentContext);

                // Because the above copy overwrites our own properties, we need to reset them.
                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
                if (subscribable) {
                    self._subscribable = subscribable;
                }
            } else {
                self['$parents'] = [];
                self['$root'] = dataItem;

                // Export 'ko' in the binding context so it will be available in bindings and templates
                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
                // See https://github.com/SteveSanderson/knockout/issues/490
                self['ko'] = ko;
            }
            self['$rawData'] = dataItemOrObservable;
            self['$data'] = dataItem;
            if (dataItemAlias)
                self[dataItemAlias] = dataItem;

            // The extendCallback function is provided when creating a child context or extending a context.
            // It handles the specific actions needed to finish setting up the binding context. Actions in this
            // function could also add dependencies to this binding context.
            if (extendCallback)
                extendCallback(self, parentContext, dataItem);

            return self['$data'];
        }
        function disposeWhen() {
            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
        }

        var self = this,
            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
            nodes,
            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
        // the context object.
        if (subscribable.isActive()) {
            self._subscribable = subscribable;

            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
            subscribable['equalityComparer'] = null;

            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
            nodes = [];
            subscribable._addNode = function(node) {
                nodes.push(node);
                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
                    ko.utils.arrayRemoveItem(nodes, node);
                    if (!nodes.length) {
                        subscribable.dispose();
                        self._subscribable = subscribable = undefined;
                    }
                });
            };
        }
    }

    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
    // any obsevables, the new child context will automatically get a dependency on the parent context.
    // But this does not mean that the $data value of the child context will also get updated. If the child
    // view model also depends on the parent view model, you must provide a function that returns the correct
    // view model on each update.
    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
            // Extend the context hierarchy by setting the appropriate pointers
            self['$parentContext'] = parentContext;
            self['$parent'] = parentContext['$data'];
            self['$parents'] = (parentContext['$parents'] || []).slice(0);
            self['$parents'].unshift(self['$parent']);
            if (extendCallback)
                extendCallback(self);
        });
    };

    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
    // when an observable view model is updated.
    ko.bindingContext.prototype['extend'] = function(properties) {
        // If the parent context references an observable view model, "_subscribable" will always be the
        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
            // This "child" context doesn't directly track a parent observable view model,
            // so we need to manually set the $rawData value to match the parent.
            self['$rawData'] = parentContext['$rawData'];
            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
        });
    };

    // Returns the valueAccesor function for a binding value
    function makeValueAccessor(value) {
        return function() {
            return value;
        };
    }

    // Returns the value of a valueAccessor function
    function evaluateValueAccessor(valueAccessor) {
        return valueAccessor();
    }

    // Given a function that returns bindings, create and return a new object that contains
    // binding value-accessors functions. Each accessor function calls the original function
    // so that it always gets the latest value and all dependencies are captured. This is used
    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
    function makeAccessorsFromFunction(callback) {
        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
            return function() {
                return callback()[key];
            };
        });
    }

    // Given a bindings function or object, create and return a new object that contains
    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
    function makeBindingAccessors(bindings, context, node) {
        if (typeof bindings === 'function') {
            return makeAccessorsFromFunction(bindings.bind(null, context, node));
        } else {
            return ko.utils.objectMap(bindings, makeValueAccessor);
        }
    }

    // This function is used if the binding provider doesn't include a getBindingAccessors function.
    // It must be called with 'this' set to the provider instance.
    function getBindingsAndMakeAccessors(node, context) {
        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
    }

    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
        var validator = ko.virtualElements.allowedBindings[bindingName];
        if (!validator)
            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
    }

    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
        var currentChild,
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
            provider = ko.bindingProvider['instance'],
            preprocessNode = provider['preprocessNode'];

        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
        // trigger insertion of <template> contents at that point in the document.
        if (preprocessNode) {
            while (currentChild = nextInQueue) {
                nextInQueue = ko.virtualElements.nextSibling(currentChild);
                preprocessNode.call(provider, currentChild);
            }
            // Reset nextInQueue for the next loop
            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
        }

        while (currentChild = nextInQueue) {
            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
            nextInQueue = ko.virtualElements.nextSibling(currentChild);
            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
        }
    }

    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
        var shouldBindDescendants = true;

        // Perf optimisation: Apply bindings only if...
        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
        var isElement = (nodeVerified.nodeType === 1);
        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
        if (shouldApplyBindings)
            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
            //    hence bindingContextsMayDifferFromDomParentElement is false
            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
            //    hence bindingContextsMayDifferFromDomParentElement is true
            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
        }
    }

    var boundElementDomDataKey = ko.utils.domData.nextKey();


    function topologicalSortBindings(bindings) {
        // Depth-first sort
        var result = [],                // The list of key/handler pairs that we will return
            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
            if (!bindingsConsidered[bindingKey]) {
                var binding = ko['getBindingHandler'](bindingKey);
                if (binding) {
                    // First add dependencies (if any) of the current binding
                    if (binding['after']) {
                        cyclicDependencyStack.push(bindingKey);
                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
                            if (bindings[bindingDependencyKey]) {
                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
                                } else {
                                    pushBinding(bindingDependencyKey);
                                }
                            }
                        });
                        cyclicDependencyStack.length--;
                    }
                    // Next add the current binding
                    result.push({ key: bindingKey, handler: binding });
                }
                bindingsConsidered[bindingKey] = true;
            }
        });

        return result;
    }

    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
        if (!sourceBindings) {
            if (alreadyBound) {
                throw Error("You cannot apply bindings multiple times to the same element.");
            }
            ko.utils.domData.set(node, boundElementDomDataKey, true);
        }

        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
        // we can easily recover it just by scanning up the node's ancestors in the DOM
        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
            ko.storedBindingContextForNode(node, bindingContext);

        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
        var bindings;
        if (sourceBindings && typeof sourceBindings !== 'function') {
            bindings = sourceBindings;
        } else {
            var provider = ko.bindingProvider['instance'],
                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
            // the binding context is updated or if the binding provider accesses observables.
            var bindingsUpdater = ko.dependentObservable(
                function() {
                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
                    // Register a dependency on the binding context to support obsevable view models.
                    if (bindings && bindingContext._subscribable)
                        bindingContext._subscribable();
                    return bindings;
                },
                null, { disposeWhenNodeIsRemoved: node }
            );

            if (!bindings || !bindingsUpdater.isActive())
                bindingsUpdater = null;
        }

        var bindingHandlerThatControlsDescendantBindings;
        if (bindings) {
            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
            // the latest binding value and registers a dependency on the binding updater.
            var getValueAccessor = bindingsUpdater
                ? function(bindingKey) {
                    return function() {
                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
                    };
                } : function(bindingKey) {
                    return bindings[bindingKey];
                };

            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
            function allBindings() {
                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
            }
            // The following is the 3.x allBindings API
            allBindings['get'] = function(key) {
                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
            };
            allBindings['has'] = function(key) {
                return key in bindings;
            };

            // First put the bindings into the right order
            var orderedBindings = topologicalSortBindings(bindings);

            // Go through the sorted bindings, calling init and update for each
            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
                // so bindingKeyAndHandler.handler will always be nonnull.
                var handlerInitFn = bindingKeyAndHandler.handler["init"],
                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
                    bindingKey = bindingKeyAndHandler.key;

                if (node.nodeType === 8) {
                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
                }

                try {
                    // Run init, ignoring any dependencies
                    if (typeof handlerInitFn == "function") {
                        ko.dependencyDetection.ignore(function() {
                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

                            // If this binding handler claims to control descendant bindings, make a note of this
                            if (initResult && initResult['controlsDescendantBindings']) {
                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
                                bindingHandlerThatControlsDescendantBindings = bindingKey;
                            }
                        });
                    }

                    // Run update in its own computed wrapper
                    if (typeof handlerUpdateFn == "function") {
                        ko.dependentObservable(
                            function() {
                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
                            },
                            null,
                            { disposeWhenNodeIsRemoved: node }
                        );
                    }
                } catch (ex) {
                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
                    throw ex;
                }
            });
        }

        return {
            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
        };
    };

    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
    ko.storedBindingContextForNode = function (node, bindingContext) {
        if (arguments.length == 2) {
            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
            if (bindingContext._subscribable)
                bindingContext._subscribable._addNode(node);
        } else {
            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
        }
    }

    function getBindingContext(viewModelOrBindingContext) {
        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
            ? viewModelOrBindingContext
            : new ko.bindingContext(viewModelOrBindingContext);
    }

    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
            ko.virtualElements.normaliseVirtualElementDomStructure(node);
        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
    };

    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
        var context = getBindingContext(viewModelOrBindingContext);
        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
    };

    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
        if (!jQuery && window['jQuery']) {
            jQuery = window['jQuery'];
        }

        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
    };

    // Retrieving binding context from arbitrary nodes
    ko.contextFor = function(node) {
        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
        switch (node.nodeType) {
            case 1:
            case 8:
                var context = ko.storedBindingContextForNode(node);
                if (context) return context;
                if (node.parentNode) return ko.contextFor(node.parentNode);
                break;
        }
        return undefined;
    };
    ko.dataFor = function(node) {
        var context = ko.contextFor(node);
        return context ? context['$data'] : undefined;
    };

    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
    ko.exportSymbol('applyBindings', ko.applyBindings);
    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
    ko.exportSymbol('contextFor', ko.contextFor);
    ko.exportSymbol('dataFor', ko.dataFor);
})();
var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
ko.bindingHandlers['attr'] = {
    'update': function(element, valueAccessor, allBindings) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
        ko.utils.objectForEach(value, function(attrName, attrValue) {
            attrValue = ko.utils.unwrapObservable(attrValue);

            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
            // when someProp is a "no value"-like value (strictly null, false, or undefined)
            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
            if (toRemove)
                element.removeAttribute(attrName);

            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
            // property for IE <= 8.
            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
                attrName = attrHtmlToJavascriptMap[attrName];
                if (toRemove)
                    element.removeAttribute(attrName);
                else
                    element[attrName] = attrValue;
            } else if (!toRemove) {
                element.setAttribute(attrName, attrValue.toString());
            }

            // Treat "name" specially - although you can think of it as an attribute, it also needs
            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
            // entirely, and there's no strong reason to allow for such casing in HTML.
            if (attrName === "name") {
                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
            }
        });
    }
};
(function() {

ko.bindingHandlers['checked'] = {
    'after': ['value', 'attr'],
    'init': function (element, valueAccessor, allBindings) {
        function checkedValue() {
            return allBindings['has']('checkedValue')
                ? ko.utils.unwrapObservable(allBindings.get('checkedValue'))
                : element.value;
        }

        function updateModel() {
            // This updates the model value from the view value.
            // It runs in response to DOM events (click) and changes in checkedValue.
            var isChecked = element.checked,
                elemValue = useCheckedValue ? checkedValue() : isChecked;

            // When we're first setting up this computed, don't change any model state.
            if (ko.computedContext.isInitial()) {
                return;
            }

            // We can ignore unchecked radio buttons, because some other radio
            // button will be getting checked, and that one can take care of updating state.
            if (isRadio && !isChecked) {
                return;
            }

            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
            if (isValueArray) {
                if (oldElemValue !== elemValue) {
                    // When we're responding to the checkedValue changing, and the element is
                    // currently checked, replace the old elem value with the new elem value
                    // in the model array.
                    if (isChecked) {
                        ko.utils.addOrRemoveItem(modelValue, elemValue, true);
                        ko.utils.addOrRemoveItem(modelValue, oldElemValue, false);
                    }

                    oldElemValue = elemValue;
                } else {
                    // When we're responding to the user having checked/unchecked a checkbox,
                    // add/remove the element value to the model array.
                    ko.utils.addOrRemoveItem(modelValue, elemValue, isChecked);
                }
            } else {
                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
            }
        };

        function updateView() {
            // This updates the view value from the model value.
            // It runs in response to changes in the bound (checked) value.
            var modelValue = ko.utils.unwrapObservable(valueAccessor());

            if (isValueArray) {
                // When a checkbox is bound to an array, being checked represents its value being present in that array
                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
            } else if (isCheckbox) {
                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
                element.checked = modelValue;
            } else {
                // For radio buttons, being checked means that the radio button's value corresponds to the model value
                element.checked = (checkedValue() === modelValue);
            }
        };

        var isCheckbox = element.type == "checkbox",
            isRadio = element.type == "radio";

        // Only bind to check boxes and radio buttons
        if (!isCheckbox && !isRadio) {
            return;
        }

        var isValueArray = isCheckbox && (ko.utils.unwrapObservable(valueAccessor()) instanceof Array),
            oldElemValue = isValueArray ? checkedValue() : undefined,
            useCheckedValue = isRadio || isValueArray;

        // IE 6 won't allow radio buttons to be selected unless they have a name
        if (isRadio && !element.name)
            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

        // Set up two computeds to update the binding:

        // The first responds to changes in the checkedValue value and to element clicks
        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
        ko.utils.registerEventHandler(element, "click", updateModel);

        // The second responds to changes in the model value (the one associated with the checked binding)
        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
    }
};
ko.expressionRewriting.twoWayBindings['checked'] = true;

ko.bindingHandlers['checkedValue'] = {
    'update': function (element, valueAccessor) {
        element.value = ko.utils.unwrapObservable(valueAccessor());
    }
};

})();var classesWrittenByBindingKey = '__ko__cssValue';
ko.bindingHandlers['css'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (typeof value == "object") {
            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
            });
        } else {
            value = String(value || ''); // Make sure we don't try to store or set a non-string value
            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
            element[classesWrittenByBindingKey] = value;
            ko.utils.toggleDomNodeCssClass(element, value, true);
        }
    }
};
ko.bindingHandlers['enable'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value && element.disabled)
            element.removeAttribute("disabled");
        else if ((!value) && (!element.disabled))
            element.disabled = true;
    }
};

ko.bindingHandlers['disable'] = {
    'update': function (element, valueAccessor) {
        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
    }
};
// For certain common events (currently just 'click'), allow a simplified data-binding syntax
// e.g. click:handler instead of the usual full-length event:{click:handler}
function makeEventHandlerShortcut(eventName) {
    ko.bindingHandlers[eventName] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function () {
                var result = {};
                result[eventName] = valueAccessor();
                return result;
            };
            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
        }
    }
}

ko.bindingHandlers['event'] = {
    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var eventsToHandle = valueAccessor() || {};
        ko.utils.objectForEach(eventsToHandle, function(eventName) {
            if (typeof eventName == "string") {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    var handlerReturnValue;
                    var handlerFunction = valueAccessor()[eventName];
                    if (!handlerFunction)
                        return;

                    try {
                        // Take all the event args, and prefix with the viewmodel
                        var argsForHandler = ko.utils.makeArray(arguments);
                        viewModel = bindingContext['$data'];
                        argsForHandler.unshift(viewModel);
                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
                    } finally {
                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                            if (event.preventDefault)
                                event.preventDefault();
                            else
                                event.returnValue = false;
                        }
                    }

                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
                    if (!bubble) {
                        event.cancelBubble = true;
                        if (event.stopPropagation)
                            event.stopPropagation();
                    }
                });
            }
        });
    }
};
// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
ko.bindingHandlers['foreach'] = {
    makeTemplateValueAccessor: function(valueAccessor) {
        return function() {
            var modelValue = valueAccessor(),
                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

            // If unwrappedValue is the array, pass in the wrapped value on its own
            // The value will be unwrapped and tracked within the template binding
            // (See https://github.com/SteveSanderson/knockout/issues/523)
            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
            ko.utils.unwrapObservable(modelValue);
            return {
                'foreach': unwrappedValue['data'],
                'as': unwrappedValue['as'],
                'includeDestroyed': unwrappedValue['includeDestroyed'],
                'afterAdd': unwrappedValue['afterAdd'],
                'beforeRemove': unwrappedValue['beforeRemove'],
                'afterRender': unwrappedValue['afterRender'],
                'beforeMove': unwrappedValue['beforeMove'],
                'afterMove': unwrappedValue['afterMove'],
                'templateEngine': ko.nativeTemplateEngine.instance
            };
        };
    },
    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
    },
    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
    }
};
ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
ko.virtualElements.allowedBindings['foreach'] = true;
var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
var hasfocusLastValue = '__ko_hasfocusLastValue';
ko.bindingHandlers['hasfocus'] = {
    'init': function(element, valueAccessor, allBindings) {
        var handleElementFocusChange = function(isFocused) {
            // Where possible, ignore which event was raised and determine focus state using activeElement,
            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
            // from calling 'blur()' on the element when it loses focus.
            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
            element[hasfocusUpdatingProperty] = true;
            var ownerDoc = element.ownerDocument;
            if ("activeElement" in ownerDoc) {
                var active;
                try {
                    active = ownerDoc.activeElement;
                } catch(e) {
                    // IE9 throws if you access activeElement during page load (see issue #703)
                    active = ownerDoc.body;
                }
                isFocused = (active === element);
            }
            var modelValue = valueAccessor();
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
            element[hasfocusLastValue] = isFocused;
            element[hasfocusUpdatingProperty] = false;
        };
        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
    },
    'update': function(element, valueAccessor) {
        var value = !!ko.utils.unwrapObservable(valueAccessor()); //force boolean to compare with last value
        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
            value ? element.focus() : element.blur();
            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]); // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
        }
    }
};
ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
ko.bindingHandlers['html'] = {
    'init': function() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor) {
        // setHtml will unwrap the value if needed
        ko.utils.setHtml(element, valueAccessor());
    }
};
// Makes a binding like with or if
function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
    ko.bindingHandlers[bindingKey] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var didDisplayOnLastUpdate,
                savedNodes;
            ko.computed(function() {
                var dataValue = ko.utils.unwrapObservable(valueAccessor()),
                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
                    isFirstRender = !savedNodes,
                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

                if (needsRefresh) {
                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                    }

                    if (shouldDisplay) {
                        if (!isFirstRender) {
                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
                        }
                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
                    } else {
                        ko.virtualElements.emptyNode(element);
                    }

                    didDisplayOnLastUpdate = shouldDisplay;
                }
            }, null, { disposeWhenNodeIsRemoved: element });
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings[bindingKey] = true;
}

// Construct the actual binding handlers
makeWithIfBinding('if');
makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
makeWithIfBinding('with', true /* isWith */, false /* isNot */,
    function(bindingContext, dataValue) {
        return bindingContext['createChildContext'](dataValue);
    }
);
var captionPlaceholder = {};
ko.bindingHandlers['options'] = {
    'init': function(element) {
        if (ko.utils.tagNameLower(element) !== "select")
            throw new Error("options binding applies only to SELECT elements");

        // Remove all existing <option>s.
        while (element.length > 0) {
            element.remove(0);
        }

        // Ensures that the binding processor doesn't try to bind the options
        return { 'controlsDescendantBindings': true };
    },
    'update': function (element, valueAccessor, allBindings) {
        function selectedOptions() {
            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
        }

        var selectWasPreviouslyEmpty = element.length == 0;
        var previousScrollTop = (!selectWasPreviouslyEmpty && element.multiple) ? element.scrollTop : null;
        var unwrappedArray = ko.utils.unwrapObservable(valueAccessor());
        var includeDestroyed = allBindings.get('optionsIncludeDestroyed');
        var arrayToDomNodeChildrenOptions = {};
        var captionValue;
        var filteredArray;
        var previousSelectedValues;

        if (element.multiple) {
            previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
        } else {
            previousSelectedValues = element.selectedIndex >= 0 ? [ ko.selectExtensions.readValue(element.options[element.selectedIndex]) ] : [];
        }

        if (unwrappedArray) {
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // If caption is included, add it to the array
            if (allBindings['has']('optionsCaption')) {
                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
                // If caption value is null or undefined, don't show a caption
                if (captionValue !== null && captionValue !== undefined) {
                    filteredArray.unshift(captionPlaceholder);
                }
            }
        } else {
            // If a falsy value is provided (e.g. null), we'll simply empty the select element
        }

        function applyToObject(object, predicate, defaultValue) {
            var predicateType = typeof predicate;
            if (predicateType == "function")    // Given a function; run it against the data value
                return predicate(object);
            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
                return object[predicate];
            else                                // Given no optionsText arg; use the data value itself
                return defaultValue;
        }

        // The following functions can run at two different times:
        // The first is when the whole array is being updated directly from this binding handler.
        // The second is when an observable value for a specific array entry is updated.
        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
        var itemUpdate = false;
        function optionForArrayItem(arrayEntry, index, oldOptions) {
            if (oldOptions.length) {
                previousSelectedValues = oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
                itemUpdate = true;
            }
            var option = element.ownerDocument.createElement("option");
            if (arrayEntry === captionPlaceholder) {
                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
                ko.selectExtensions.writeValue(option, undefined);
            } else {
                // Apply a value to the option element
                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

                // Apply some text to the option element
                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
                ko.utils.setTextContent(option, optionText);
            }
            return [option];
        }

        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
        arrayToDomNodeChildrenOptions['beforeRemove'] =
            function (option) {
                element.removeChild(option);
            };

        function setSelectionCallback(arrayEntry, newOptions) {
            // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
            // That's why we first added them without selection. Now it's time to set the selection.
            if (previousSelectedValues.length) {
                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

                // If this option was changed from being selected during a single-item update, notify the change
                if (itemUpdate && !isSelected)
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
            }
        }

        var callback = setSelectionCallback;
        if (allBindings['has']('optionsAfterRender')) {
            callback = function(arrayEntry, newOptions) {
                setSelectionCallback(arrayEntry, newOptions);
                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
            }
        }

        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

        ko.dependencyDetection.ignore(function () {
            if (allBindings.get('valueAllowUnset') && allBindings['has']('value')) {
                // The model value is authoritative, so make sure its value is the one selected
                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
            } else {
                // Determine if the selection has changed as a result of updating the options list
                var selectionChanged;
                if (element.multiple) {
                    // For a multiple-select box, compare the new selection count to the previous one
                    // But if nothing was selected before, the selection can't have changed
                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
                } else {
                    // For a single-select box, compare the current value to the previous value
                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
                        : (previousSelectedValues.length || element.selectedIndex >= 0);
                }

                // Ensure consistency between model value and selected option.
                // If the dropdown was changed so that selection is no longer the same,
                // notify the value or selectedOptions binding.
                if (selectionChanged) {
                    ko.utils.triggerEvent(element, "change");
                }
            }
        });

        // Workaround for IE bug
        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
            element.scrollTop = previousScrollTop;
    }
};
ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
ko.bindingHandlers['selectedOptions'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        ko.utils.registerEventHandler(element, "change", function () {
            var value = valueAccessor(), valueToWrite = [];
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                if (node.selected)
                    valueToWrite.push(ko.selectExtensions.readValue(node));
            });
            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
        });
    },
    'update': function (element, valueAccessor) {
        if (ko.utils.tagNameLower(element) != "select")
            throw new Error("values binding applies only to SELECT elements");

        var newValue = ko.utils.unwrapObservable(valueAccessor());
        if (newValue && typeof newValue.length == "number") {
            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
                ko.utils.setOptionNodeSelectionState(node, isSelected);
            });
        }
    }
};
ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
ko.bindingHandlers['style'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor() || {});
        ko.utils.objectForEach(value, function(styleName, styleValue) {
            styleValue = ko.utils.unwrapObservable(styleValue);
            element.style[styleName] = styleValue || ""; // Empty string removes the value, whereas null/undefined have no effect
        });
    }
};
ko.bindingHandlers['submit'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        if (typeof valueAccessor() != "function")
            throw new Error("The value for a submit binding must be a function");
        ko.utils.registerEventHandler(element, "submit", function (event) {
            var handlerReturnValue;
            var value = valueAccessor();
            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
            finally {
                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;
                }
            }
        });
    }
};
ko.bindingHandlers['text'] = {
	'init': function() {
		// Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
		// It should also make things faster, as we no longer have to consider whether the text node might be bindable.
        return { 'controlsDescendantBindings': true };
	},
    'update': function (element, valueAccessor) {
        ko.utils.setTextContent(element, valueAccessor());
    }
};
ko.virtualElements.allowedBindings['text'] = true;
ko.bindingHandlers['uniqueName'] = {
    'init': function (element, valueAccessor) {
        if (valueAccessor()) {
            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
            ko.utils.setElementName(element, name);
        }
    }
};
ko.bindingHandlers['uniqueName'].currentIndex = 0;
ko.bindingHandlers['value'] = {
    'after': ['options', 'foreach'],
    'init': function (element, valueAccessor, allBindings) {
        // Always catch "change" event; possibly other events too if asked
        var eventsToCatch = ["change"];
        var requestedEventsToCatch = allBindings.get("valueUpdate");
        var propertyChangedFired = false;
        if (requestedEventsToCatch) {
            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
                requestedEventsToCatch = [requestedEventsToCatch];
            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
        }

        var valueUpdateHandler = function() {
            propertyChangedFired = false;
            var modelValue = valueAccessor();
            var elementValue = ko.selectExtensions.readValue(element);
            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
        }

        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
            ko.utils.registerEventHandler(element, "blur", function() {
                if (propertyChangedFired) {
                    valueUpdateHandler();
                }
            });
        }

        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
            // This is useful, for example, to catch "keydown" events after the browser has updated the control
            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
            var handler = valueUpdateHandler;
            if (ko.utils.stringStartsWith(eventName, "after")) {
                handler = function() { setTimeout(valueUpdateHandler, 0) };
                eventName = eventName.substring("after".length);
            }
            ko.utils.registerEventHandler(element, eventName, handler);
        });
    },
    'update': function (element, valueAccessor, allBindings) {
        var newValue = ko.utils.unwrapObservable(valueAccessor());
        var elementValue = ko.selectExtensions.readValue(element);
        var valueHasChanged = (newValue !== elementValue);

        if (valueHasChanged) {
            if (ko.utils.tagNameLower(element) === "select") {
                var allowUnset = allBindings.get('valueAllowUnset');
                var applyValueAction = function () {
                    ko.selectExtensions.writeValue(element, newValue, allowUnset);
                };
                applyValueAction();

                if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
                    // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
                    // because you're not allowed to have a model value that disagrees with a visible UI selection.
                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
                } else {
                    // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
                    // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
                    // to apply the value as well.
                    setTimeout(applyValueAction, 0);
                }
            } else {
                ko.selectExtensions.writeValue(element, newValue);
            }
        }
    }
};
ko.expressionRewriting.twoWayBindings['value'] = true;
ko.bindingHandlers['visible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && !isCurrentlyVisible)
            element.style.display = "";
        else if ((!value) && isCurrentlyVisible)
            element.style.display = "none";
    }
};
// 'click' is just a shorthand for the usual full-length event:{click:handler}
makeEventHandlerShortcut('click');
// If you want to make a custom template engine,
//
// [1] Inherit from this class (like ko.nativeTemplateEngine does)
// [2] Override 'renderTemplateSource', supplying a function with this signature:
//
//        function (templateSource, bindingContext, options) {
//            // - templateSource.text() is the text of the template you should render
//            // - bindingContext.$data is the data you should pass into the template
//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
//            //     and bindingContext.$root available in the template too
//            // - options gives you access to any other properties set on "data-bind: { template: options }"
//            //
//            // Return value: an array of DOM nodes
//        }
//
// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
//
//        function (script) {
//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
//        }
//
//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

ko.templateEngine = function () { };

ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options) {
    throw new Error("Override renderTemplateSource");
};

ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
    throw new Error("Override createJavaScriptEvaluatorBlock");
};

ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
    // Named template
    if (typeof template == "string") {
        templateDocument = templateDocument || document;
        var elem = templateDocument.getElementById(template);
        if (!elem)
            throw new Error("Cannot find template with ID " + template);
        return new ko.templateSources.domElement(elem);
    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
        // Anonymous template
        return new ko.templateSources.anonymousTemplate(template);
    } else
        throw new Error("Unknown template type: " + template);
};

ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    return this['renderTemplateSource'](templateSource, bindingContext, options);
};

ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
    // Skip rewriting if requested
    if (this['allowTemplateRewriting'] === false)
        return true;
    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
};

ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
    var templateSource = this['makeTemplateSource'](template, templateDocument);
    var rewritten = rewriterCallback(templateSource['text']());
    templateSource['text'](rewritten);
    templateSource['data']("isRewritten", true);
};

ko.exportSymbol('templateEngine', ko.templateEngine);

ko.templateRewriting = (function () {
    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

    function validateDataBindValuesForRewriting(keyValueArray) {
        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
        for (var i = 0; i < keyValueArray.length; i++) {
            var key = keyValueArray[i]['key'];
            if (allValidators.hasOwnProperty(key)) {
                var validator = allValidators[key];

                if (typeof validator === "function") {
                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
                    if (possibleErrorMessage)
                        throw new Error(possibleErrorMessage);
                } else if (!validator) {
                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
                }
            }
        }
    }

    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
        validateDataBindValuesForRewriting(dataBindKeyValueArray);
        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
        // extra indirection.
        var applyBindingsToNextSiblingScript =
            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
    }

    return {
        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
                templateEngine['rewriteTemplate'](template, function (htmlString) {
                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
                }, templateDocument);
        },

        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
            });
        },

        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
            return ko.memoization.memoize(function (domNode, bindingContext) {
                var nodeToBind = domNode.nextSibling;
                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
                }
            });
        }
    }
})();


// Exported only because it has to be referenced by string lookup from within rewritten template
ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
(function() {
    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
    //
    // Two are provided by default:
    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
    //                                           without reading/writing the actual element text content, since it will be overwritten
    //                                           with the rendered template output.
    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
    // Template sources need to have the following functions:
    //   text() 			- returns the template text from your storage location
    //   text(value)		- writes the supplied template text to your storage location
    //   data(key)			- reads values stored using data(key, value) - see below
    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
    //
    // Optionally, template sources can also have the following functions:
    //   nodes()            - returns a DOM element containing the nodes of this template, where available
    //   nodes(value)       - writes the given DOM element to your storage location
    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
    //
    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

    ko.templateSources = {};

    // ---- ko.templateSources.domElement -----

    ko.templateSources.domElement = function(element) {
        this.domElement = element;
    }

    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
        var tagNameLower = ko.utils.tagNameLower(this.domElement),
            elemContentsProperty = tagNameLower === "script" ? "text"
                                 : tagNameLower === "textarea" ? "value"
                                 : "innerHTML";

        if (arguments.length == 0) {
            return this.domElement[elemContentsProperty];
        } else {
            var valueToWrite = arguments[0];
            if (elemContentsProperty === "innerHTML")
                ko.utils.setHtml(this.domElement, valueToWrite);
            else
                this.domElement[elemContentsProperty] = valueToWrite;
        }
    };

    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
        if (arguments.length === 1) {
            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
        } else {
            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
        }
    };

    // ---- ko.templateSources.anonymousTemplate -----
    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

    var anonymousTemplatesDomDataKey = ko.utils.domData.nextKey();
    ko.templateSources.anonymousTemplate = function(element) {
        this.domElement = element;
    }
    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            if (templateData.textData === undefined && templateData.containerData)
                templateData.textData = templateData.containerData.innerHTML;
            return templateData.textData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {textData: valueToWrite});
        }
    };
    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
        if (arguments.length == 0) {
            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
            return templateData.containerData;
        } else {
            var valueToWrite = arguments[0];
            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {containerData: valueToWrite});
        }
    };

    ko.exportSymbol('templateSources', ko.templateSources);
    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
})();
(function () {
    var _templateEngine;
    ko.setTemplateEngine = function (templateEngine) {
        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
            throw new Error("templateEngine must inherit from ko.templateEngine");
        _templateEngine = templateEngine;
    }

    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
            nextInQueue = ko.virtualElements.nextSibling(node);
            action(node, nextInQueue);
        }
    }

    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

        if (continuousNodeArray.length) {
            var firstNode = continuousNodeArray[0],
                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
                parentNode = firstNode.parentNode,
                provider = ko.bindingProvider['instance'],
                preprocessNode = provider['preprocessNode'];

            if (preprocessNode) {
                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
                    var nodePreviousSibling = node.previousSibling;
                    var newNodes = preprocessNode.call(provider, node);
                    if (newNodes) {
                        if (node === firstNode)
                            firstNode = newNodes[0] || nextNodeInRange;
                        if (node === lastNode)
                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
                    }
                });

                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
                // first node needs to be in the array).
                continuousNodeArray.length = 0;
                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
                    return;
                }
                if (firstNode === lastNode) {
                    continuousNodeArray.push(firstNode);
                } else {
                    continuousNodeArray.push(firstNode, lastNode);
                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
                }
            }

            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
            // whereas a regular applyBindings won't introduce new memoized nodes
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.applyBindings(bindingContext, node);
            });
            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
                if (node.nodeType === 1 || node.nodeType === 8)
                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
            });

            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
        }
    }

    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
                                        : null;
    }

    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
        options = options || {};
        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
        var templateDocument = firstTargetNode && firstTargetNode.ownerDocument;
        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

        // Loosely check result is an array of DOM nodes
        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
            throw new Error("Template engine must return an array of DOM nodes");

        var haveAddedNodesToParent = false;
        switch (renderMode) {
            case "replaceChildren":
                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "replaceNode":
                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
                haveAddedNodesToParent = true;
                break;
            case "ignoreTargetNode": break;
            default:
                throw new Error("Unknown renderMode: " + renderMode);
        }

        if (haveAddedNodesToParent) {
            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
            if (options['afterRender'])
                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
        }

        return renderedNodesArray;
    }

    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
        options = options || {};
        if ((options['templateEngine'] || _templateEngine) == undefined)
            throw new Error("Set a template engine before calling renderTemplate");
        renderMode = renderMode || "replaceChildren";

        if (targetNodeOrNodeArray) {
            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
                function () {
                    // Ensure we've got a proper binding context to work with
                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
                        ? dataOrBindingContext
                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));

                    // Support selecting template as a function of the data being rendered
                    var templateName = ko.isObservable(template) ? template()
                        : typeof(template) == 'function' ? template(bindingContext['$data'], bindingContext) : template;

                    var renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);
                    if (renderMode == "replaceNode") {
                        targetNodeOrNodeArray = renderedNodesArray;
                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
                    }
                },
                null,
                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
            );
        } else {
            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
            return ko.memoization.memoize(function (domNode) {
                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
            });
        }
    };

    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
        var arrayItemContext;

        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
        var executeTemplateForArrayItem = function (arrayValue, index) {
            // Support selecting template as a function of the data being rendered
            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
                context['$index'] = index;
            });
            var templateName = typeof(template) == 'function' ? template(arrayValue, arrayItemContext) : template;
            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
        }

        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
            if (options['afterRender'])
                options['afterRender'](addedNodesArray, arrayValue);
        };

        return ko.dependentObservable(function () {
            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
                unwrappedArray = [unwrappedArray];

            // Filter out any entries marked as destroyed
            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
            });

            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

        }, null, { disposeWhenNodeIsRemoved: targetNode });
    };

    var templateComputedDomDataKey = ko.utils.domData.nextKey();
    function disposeOldComputedAndStoreNewOne(element, newComputed) {
        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
            oldComputed.dispose();
        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
    }

    ko.bindingHandlers['template'] = {
        'init': function(element, valueAccessor) {
            // Support anonymous templates
            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
            if (typeof bindingValue == "string" || bindingValue['name']) {
                // It's a named template - clear the element
                ko.virtualElements.emptyNode(element);
            } else {
                // It's an anonymous template - store the element contents, then clear the element
                var templateNodes = ko.virtualElements.childNodes(element),
                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
            }
            return { 'controlsDescendantBindings': true };
        },
        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor(),
                dataValue,
                options = ko.utils.unwrapObservable(value),
                shouldDisplay = true,
                templateComputed = null,
                templateName;

            if (typeof options == "string") {
                templateName = value;
                options = {};
            } else {
                templateName = options['name'];

                // Support "if"/"ifnot" conditions
                if ('if' in options)
                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
                if (shouldDisplay && 'ifnot' in options)
                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);

                dataValue = ko.utils.unwrapObservable(options['data']);
            }

            if ('foreach' in options) {
                // Render once for each data point (treating data set as empty if shouldDisplay==false)
                var dataArray = (shouldDisplay && options['foreach']) || [];
                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
            } else if (!shouldDisplay) {
                ko.virtualElements.emptyNode(element);
            } else {
                // Render once for this single data point (or use the viewModel if no data was provided)
                var innerBindingContext = ('data' in options) ?
                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
            }

            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
            disposeOldComputedAndStoreNewOne(element, templateComputed);
        }
    };

    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
            return null; // Named templates can be rewritten, so return "no error"
        return "This template engine does not support anonymous templates nested within its templates";
    };

    ko.virtualElements.allowedBindings['template'] = true;
})();

ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
ko.exportSymbol('renderTemplate', ko.renderTemplate);
// Go through the items that have been added and deleted and try to find matches between them.
ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
    if (left.length && right.length) {
        var failedCompares, l, r, leftItem, rightItem;
        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
            for (r = 0; rightItem = right[r]; ++r) {
                if (leftItem['value'] === rightItem['value']) {
                    leftItem['moved'] = rightItem['index'];
                    rightItem['moved'] = leftItem['index'];
                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
                    break;
                }
            }
            failedCompares += r;
        }
    }
};

ko.utils.compareArrays = (function () {
    var statusNotInOld = 'added', statusNotInNew = 'deleted';

    // Simple calculation based on Levenshtein distance.
    function compareArrays(oldArray, newArray, options) {
        // For backward compatibility, if the third arg is actually a bool, interpret
        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
        oldArray = oldArray || [];
        newArray = newArray || [];

        if (oldArray.length <= newArray.length)
            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
        else
            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
    }

    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
        var myMin = Math.min,
            myMax = Math.max,
            editDistanceMatrix = [],
            smlIndex, smlIndexMax = smlArray.length,
            bigIndex, bigIndexMax = bigArray.length,
            compareRange = (bigIndexMax - smlIndexMax) || 1,
            maxDistance = smlIndexMax + bigIndexMax + 1,
            thisRow, lastRow,
            bigIndexMaxForRow, bigIndexMinForRow;

        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
            lastRow = thisRow;
            editDistanceMatrix.push(thisRow = []);
            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
            bigIndexMinForRow = myMax(0, smlIndex - 1);
            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
                if (!bigIndex)
                    thisRow[bigIndex] = smlIndex + 1;
                else if (!smlIndex)  // Top row - transform empty array into new array via additions
                    thisRow[bigIndex] = bigIndex + 1;
                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
                else {
                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
                }
            }
        }

        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
                notInSml.push(editScript[editScript.length] = {     // added
                    'status': statusNotInSml,
                    'value': bigArray[--bigIndex],
                    'index': bigIndex });
            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
                notInBig.push(editScript[editScript.length] = {     // deleted
                    'status': statusNotInBig,
                    'value': smlArray[--smlIndex],
                    'index': smlIndex });
            } else {
                --bigIndex;
                --smlIndex;
                if (!options['sparse']) {
                    editScript.push({
                        'status': "retained",
                        'value': bigArray[bigIndex] });
                }
            }
        }

        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
        // smlIndexMax keeps the time complexity of this algorithm linear.
        ko.utils.findMovesInArrayComparison(notInSml, notInBig, smlIndexMax * 10);

        return editScript.reverse();
    }

    return compareArrays;
})();

ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
(function () {
    // Objective:
    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
    //   previously mapped - retain those nodes, and just insert/delete other ones

    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
    // You can use this, for example, to activate bindings on those nodes.

    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
        // Map this array value inside a dependentObservable so we re-map when any dependency changes
        var mappedNodes = [];
        var dependentObservable = ko.dependentObservable(function() {
            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

            // On subsequent evaluations, just replace the previously-inserted DOM nodes
            if (mappedNodes.length > 0) {
                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
                if (callbackAfterAddingNodes)
                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
            }

            // Replace the contents of the mappedNodes array, thereby updating the record
            // of which nodes would be deleted if valueToMap was itself later removed
            mappedNodes.length = 0;
            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
    }

    var lastMappingResultDomDataKey = ko.utils.domData.nextKey();

    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
        // Compare the provided array against the previous one
        array = array || [];
        options = options || {};
        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

        // Build the new mapping result
        var newMappingResult = [];
        var lastMappingResultIndex = 0;
        var newMappingResultIndex = 0;

        var nodesToDelete = [];
        var itemsToProcess = [];
        var itemsForBeforeRemoveCallbacks = [];
        var itemsForMoveCallbacks = [];
        var itemsForAfterAddCallbacks = [];
        var mapData;

        function itemMovedOrRetained(editScriptIndex, oldPosition) {
            mapData = lastMappingResult[oldPosition];
            if (newMappingResultIndex !== oldPosition)
                itemsForMoveCallbacks[editScriptIndex] = mapData;
            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
            mapData.indexObservable(newMappingResultIndex++);
            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
            newMappingResult.push(mapData);
            itemsToProcess.push(mapData);
        }

        function callCallback(callback, items) {
            if (callback) {
                for (var i = 0, n = items.length; i < n; i++) {
                    if (items[i]) {
                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
                            callback(node, i, items[i].arrayEntry);
                        });
                    }
                }
            }
        }

        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
            movedIndex = editScriptItem['moved'];
            switch (editScriptItem['status']) {
                case "deleted":
                    if (movedIndex === undefined) {
                        mapData = lastMappingResult[lastMappingResultIndex];

                        // Stop tracking changes to the mapping for these nodes
                        if (mapData.dependentObservable)
                            mapData.dependentObservable.dispose();

                        // Queue these nodes for later removal
                        nodesToDelete.push.apply(nodesToDelete, ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode));
                        if (options['beforeRemove']) {
                            itemsForBeforeRemoveCallbacks[i] = mapData;
                            itemsToProcess.push(mapData);
                        }
                    }
                    lastMappingResultIndex++;
                    break;

                case "retained":
                    itemMovedOrRetained(i, lastMappingResultIndex++);
                    break;

                case "added":
                    if (movedIndex !== undefined) {
                        itemMovedOrRetained(i, movedIndex);
                    } else {
                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
                        newMappingResult.push(mapData);
                        itemsToProcess.push(mapData);
                        if (!isFirstExecution)
                            itemsForAfterAddCallbacks[i] = mapData;
                    }
                    break;
            }
        }

        // Call beforeMove first before any changes have been made to the DOM
        callCallback(options['beforeMove'], itemsForMoveCallbacks);

        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
            // Get nodes for newly added items
            if (!mapData.mappedNodes)
                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

            // Put nodes in the right place if they aren't there already
            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
                if (node !== nextNode)
                    ko.virtualElements.insertAfter(domNode, node, lastNode);
            }

            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
            if (!mapData.initialized && callbackAfterAddingNodes) {
                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
                mapData.initialized = true;
            }
        }

        // If there's a beforeRemove callback, call it after reordering.
        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
        // Perhaps we'll make that change in the future if this scenario becomes more common.
        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

        // Finally call afterMove and afterAdd callbacks
        callCallback(options['afterMove'], itemsForMoveCallbacks);
        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);

        // Store a copy of the array items we just considered so we can difference it next time
        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);
    }
})();

ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
ko.nativeTemplateEngine = function () {
    this['allowTemplateRewriting'] = false;
}

ko.nativeTemplateEngine.prototype = new ko.templateEngine();
ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options) {
    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

    if (templateNodes) {
        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
    } else {
        var templateText = templateSource['text']();
        return ko.utils.parseHtmlFragment(templateText);
    }
};

ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
(function() {
    ko.jqueryTmplTemplateEngine = function () {
        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
        // doesn't expose a version number, so we have to infer it.
        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
        // which KO internally refers to as version "2", so older versions are no longer detected.
        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
            if (!jQuery || !(jQuery['tmpl']))
                return 0;
            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
            try {
                if (jQuery['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
                    return 2; // Final version of jquery.tmpl
                }
            } catch(ex) { /* Apparently not the version we were looking for */ }

            return 1; // Any older version that we don't support
        })();

        function ensureHasReferencedJQueryTemplates() {
            if (jQueryTmplVersion < 2)
                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
        }

        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
            return jQuery['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
        }

        this['renderTemplateSource'] = function(templateSource, bindingContext, options) {
            options = options || {};
            ensureHasReferencedJQueryTemplates();

            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                var templateText = templateSource['text']() || "";
                // Wrap in "with($whatever.koBindingContext) { ... }"
                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

                precompiled = jQuery['template'](null, templateText);
                templateSource['data']('precompiled', precompiled);
            }

            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
            var jQueryTemplateOptions = jQuery['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
            resultNodes['appendTo'](document.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

            jQuery['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
            return resultNodes;
        };

        this['createJavaScriptEvaluatorBlock'] = function(script) {
            return "{{ko_code ((function() { return " + script + " })()) }}";
        };

        this['addTemplate'] = function(templateName, templateMarkup) {
            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
        };

        if (jQueryTmplVersion > 0) {
            jQuery['tmpl']['tag']['ko_code'] = {
                open: "__.push($1 || '');"
            };
            jQuery['tmpl']['tag']['ko_with'] = {
                open: "with($1) {",
                close: "} "
            };
        }
    };

    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

    // Use this one by default *only if jquery.tmpl is referenced*
    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
})();
}));
}());
})();

},{}],11:[function(require,module,exports){
/*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */

var io = ('undefined' === typeof module ? {} : module.exports);
(function() {

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * IO namespace.
   *
   * @namespace
   */

  var io = exports;

  /**
   * Socket.IO version
   *
   * @api public
   */

  io.version = '0.9.16';

  /**
   * Protocol implemented.
   *
   * @api public
   */

  io.protocol = 1;

  /**
   * Available transports, these will be populated with the available transports
   *
   * @api public
   */

  io.transports = [];

  /**
   * Keep track of jsonp callbacks.
   *
   * @api private
   */

  io.j = [];

  /**
   * Keep track of our io.Sockets
   *
   * @api private
   */
  io.sockets = {};


  /**
   * Manages connections to hosts.
   *
   * @param {String} uri
   * @Param {Boolean} force creation of new socket (defaults to false)
   * @api public
   */

  io.connect = function (host, details) {
    var uri = io.util.parseUri(host)
      , uuri
      , socket;

    if (global && global.location) {
      uri.protocol = uri.protocol || global.location.protocol.slice(0, -1);
      uri.host = uri.host || (global.document
        ? global.document.domain : global.location.hostname);
      uri.port = uri.port || global.location.port;
    }

    uuri = io.util.uniqueUri(uri);

    var options = {
        host: uri.host
      , secure: 'https' == uri.protocol
      , port: uri.port || ('https' == uri.protocol ? 443 : 80)
      , query: uri.query || ''
    };

    io.util.merge(options, details);

    if (options['force new connection'] || !io.sockets[uuri]) {
      socket = new io.Socket(options);
    }

    if (!options['force new connection'] && socket) {
      io.sockets[uuri] = socket;
    }

    socket = socket || io.sockets[uuri];

    // if path is different from '' or /
    return socket.of(uri.path.length > 1 ? uri.path : '');
  };

})('object' === typeof module ? module.exports : (this.io = {}), this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, global) {

  /**
   * Utilities namespace.
   *
   * @namespace
   */

  var util = exports.util = {};

  /**
   * Parses an URI
   *
   * @author Steven Levithan <stevenlevithan.com> (MIT license)
   * @api public
   */

  var re = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

  var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password',
               'host', 'port', 'relative', 'path', 'directory', 'file', 'query',
               'anchor'];

  util.parseUri = function (str) {
    var m = re.exec(str || '')
      , uri = {}
      , i = 14;

    while (i--) {
      uri[parts[i]] = m[i] || '';
    }

    return uri;
  };

  /**
   * Produces a unique url that identifies a Socket.IO connection.
   *
   * @param {Object} uri
   * @api public
   */

  util.uniqueUri = function (uri) {
    var protocol = uri.protocol
      , host = uri.host
      , port = uri.port;

    if ('document' in global) {
      host = host || document.domain;
      port = port || (protocol == 'https'
        && document.location.protocol !== 'https:' ? 443 : document.location.port);
    } else {
      host = host || 'localhost';

      if (!port && protocol == 'https') {
        port = 443;
      }
    }

    return (protocol || 'http') + '://' + host + ':' + (port || 80);
  };

  /**
   * Mergest 2 query strings in to once unique query string
   *
   * @param {String} base
   * @param {String} addition
   * @api public
   */

  util.query = function (base, addition) {
    var query = util.chunkQuery(base || '')
      , components = [];

    util.merge(query, util.chunkQuery(addition || ''));
    for (var part in query) {
      if (query.hasOwnProperty(part)) {
        components.push(part + '=' + query[part]);
      }
    }

    return components.length ? '?' + components.join('&') : '';
  };

  /**
   * Transforms a querystring in to an object
   *
   * @param {String} qs
   * @api public
   */

  util.chunkQuery = function (qs) {
    var query = {}
      , params = qs.split('&')
      , i = 0
      , l = params.length
      , kv;

    for (; i < l; ++i) {
      kv = params[i].split('=');
      if (kv[0]) {
        query[kv[0]] = kv[1];
      }
    }

    return query;
  };

  /**
   * Executes the given function when the page is loaded.
   *
   *     io.util.load(function () { console.log('page loaded'); });
   *
   * @param {Function} fn
   * @api public
   */

  var pageLoaded = false;

  util.load = function (fn) {
    if ('document' in global && document.readyState === 'complete' || pageLoaded) {
      return fn();
    }

    util.on(global, 'load', fn, false);
  };

  /**
   * Adds an event.
   *
   * @api private
   */

  util.on = function (element, event, fn, capture) {
    if (element.attachEvent) {
      element.attachEvent('on' + event, fn);
    } else if (element.addEventListener) {
      element.addEventListener(event, fn, capture);
    }
  };

  /**
   * Generates the correct `XMLHttpRequest` for regular and cross domain requests.
   *
   * @param {Boolean} [xdomain] Create a request that can be used cross domain.
   * @returns {XMLHttpRequest|false} If we can create a XMLHttpRequest.
   * @api private
   */

  util.request = function (xdomain) {

    if (xdomain && 'undefined' != typeof XDomainRequest && !util.ua.hasCORS) {
      return new XDomainRequest();
    }

    if ('undefined' != typeof XMLHttpRequest && (!xdomain || util.ua.hasCORS)) {
      return new XMLHttpRequest();
    }

    if (!xdomain) {
      try {
        return new window[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
      } catch(e) { }
    }

    return null;
  };

  /**
   * XHR based transport constructor.
   *
   * @constructor
   * @api public
   */

  /**
   * Change the internal pageLoaded value.
   */

  if ('undefined' != typeof window) {
    util.load(function () {
      pageLoaded = true;
    });
  }

  /**
   * Defers a function to ensure a spinner is not displayed by the browser
   *
   * @param {Function} fn
   * @api public
   */

  util.defer = function (fn) {
    if (!util.ua.webkit || 'undefined' != typeof importScripts) {
      return fn();
    }

    util.load(function () {
      setTimeout(fn, 100);
    });
  };

  /**
   * Merges two objects.
   *
   * @api public
   */

  util.merge = function merge (target, additional, deep, lastseen) {
    var seen = lastseen || []
      , depth = typeof deep == 'undefined' ? 2 : deep
      , prop;

    for (prop in additional) {
      if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
        if (typeof target[prop] !== 'object' || !depth) {
          target[prop] = additional[prop];
          seen.push(additional[prop]);
        } else {
          util.merge(target[prop], additional[prop], depth - 1, seen);
        }
      }
    }

    return target;
  };

  /**
   * Merges prototypes from objects
   *
   * @api public
   */

  util.mixin = function (ctor, ctor2) {
    util.merge(ctor.prototype, ctor2.prototype);
  };

  /**
   * Shortcut for prototypical and static inheritance.
   *
   * @api private
   */

  util.inherit = function (ctor, ctor2) {
    function f() {};
    f.prototype = ctor2.prototype;
    ctor.prototype = new f;
  };

  /**
   * Checks if the given object is an Array.
   *
   *     io.util.isArray([]); // true
   *     io.util.isArray({}); // false
   *
   * @param Object obj
   * @api public
   */

  util.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  /**
   * Intersects values of two arrays into a third
   *
   * @api public
   */

  util.intersect = function (arr, arr2) {
    var ret = []
      , longest = arr.length > arr2.length ? arr : arr2
      , shortest = arr.length > arr2.length ? arr2 : arr;

    for (var i = 0, l = shortest.length; i < l; i++) {
      if (~util.indexOf(longest, shortest[i]))
        ret.push(shortest[i]);
    }

    return ret;
  };

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  util.indexOf = function (arr, o, i) {

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
         i < j && arr[i] !== o; i++) {}

    return j <= i ? -1 : i;
  };

  /**
   * Converts enumerables to array.
   *
   * @api public
   */

  util.toArray = function (enu) {
    var arr = [];

    for (var i = 0, l = enu.length; i < l; i++)
      arr.push(enu[i]);

    return arr;
  };

  /**
   * UA / engines detection namespace.
   *
   * @namespace
   */

  util.ua = {};

  /**
   * Whether the UA supports CORS for XHR.
   *
   * @api public
   */

  util.ua.hasCORS = 'undefined' != typeof XMLHttpRequest && (function () {
    try {
      var a = new XMLHttpRequest();
    } catch (e) {
      return false;
    }

    return a.withCredentials != undefined;
  })();

  /**
   * Detect webkit.
   *
   * @api public
   */

  util.ua.webkit = 'undefined' != typeof navigator
    && /webkit/i.test(navigator.userAgent);

   /**
   * Detect iPad/iPhone/iPod.
   *
   * @api public
   */

  util.ua.iDevice = 'undefined' != typeof navigator
      && /iPad|iPhone|iPod/i.test(navigator.userAgent);

})('undefined' != typeof io ? io : module.exports, this);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.EventEmitter = EventEmitter;

  /**
   * Event emitter constructor.
   *
   * @api public.
   */

  function EventEmitter () {};

  /**
   * Adds a listener
   *
   * @api public
   */

  EventEmitter.prototype.on = function (name, fn) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = fn;
    } else if (io.util.isArray(this.$events[name])) {
      this.$events[name].push(fn);
    } else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a volatile listener.
   *
   * @api public
   */

  EventEmitter.prototype.once = function (name, fn) {
    var self = this;

    function on () {
      self.removeListener(name, on);
      fn.apply(this, arguments);
    };

    on.listener = fn;
    this.on(name, on);

    return this;
  };

  /**
   * Removes a listener.
   *
   * @api public
   */

  EventEmitter.prototype.removeListener = function (name, fn) {
    if (this.$events && this.$events[name]) {
      var list = this.$events[name];

      if (io.util.isArray(list)) {
        var pos = -1;

        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1);

        if (!list.length) {
          delete this.$events[name];
        }
      } else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name];
      }
    }

    return this;
  };

  /**
   * Removes all listeners for an event.
   *
   * @api public
   */

  EventEmitter.prototype.removeAllListeners = function (name) {
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this;
  };

  /**
   * Gets all listeners for a certain event.
   *
   * @api publci
   */

  EventEmitter.prototype.listeners = function (name) {
    if (!this.$events) {
      this.$events = {};
    }

    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    if (!io.util.isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name];
  };

  /**
   * Emits an event.
   *
   * @api public
   */

  EventEmitter.prototype.emit = function (name) {
    if (!this.$events) {
      return false;
    }

    var handler = this.$events[name];

    if (!handler) {
      return false;
    }

    var args = Array.prototype.slice.call(arguments, 1);

    if ('function' == typeof handler) {
      handler.apply(this, args);
    } else if (io.util.isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    } else {
      return false;
    }

    return true;
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Based on JSON2 (http://www.JSON.org/js.html).
 */

(function (exports, nativeJSON) {
  "use strict";

  // use native JSON if it's available
  if (nativeJSON && nativeJSON.parse){
    return exports.JSON = {
      parse: nativeJSON.parse
    , stringify: nativeJSON.stringify
    };
  }

  var JSON = exports.JSON = {};

  function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? '0' + n : n;
  }

  function date(d, key) {
    return isFinite(d.valueOf()) ?
        d.getUTCFullYear()     + '-' +
        f(d.getUTCMonth() + 1) + '-' +
        f(d.getUTCDate())      + 'T' +
        f(d.getUTCHours())     + ':' +
        f(d.getUTCMinutes())   + ':' +
        f(d.getUTCSeconds())   + 'Z' : null;
  };

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      },
      rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

      escapable.lastIndex = 0;
      return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
              '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

      var i,          // The loop counter.
          k,          // The member key.
          v,          // The member value.
          length,
          mind = gap,
          partial,
          value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

      if (value instanceof Date) {
          value = date(key);
      }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

      if (typeof rep === 'function') {
          value = rep.call(holder, key, value);
      }

// What happens next depends on the value's type.

      switch (typeof value) {
      case 'string':
          return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

          return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

          if (!value) {
              return 'null';
          }

// Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

// Is the value an array?

          if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                  partial[i] = str(i, value) || 'null';
              }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

              v = partial.length === 0 ? '[]' : gap ?
                  '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                  '[' + partial.join(',') + ']';
              gap = mind;
              return v;
          }

// If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === 'object') {
              length = rep.length;
              for (i = 0; i < length; i += 1) {
                  if (typeof rep[i] === 'string') {
                      k = rep[i];
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          } else {

// Otherwise, iterate through all of the keys in the object.

              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = str(k, value);
                      if (v) {
                          partial.push(quote(k) + (gap ? ': ' : ':') + v);
                      }
                  }
              }
          }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

          v = partial.length === 0 ? '{}' : gap ?
              '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
              '{' + partial.join(',') + '}';
          gap = mind;
          return v;
      }
  }

// If the JSON object does not yet have a stringify method, give it one.

  JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
          indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
              (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
  };

// If the JSON object does not yet have a parse method, give it one.

  JSON.parse = function (text, reviver) {
  // The parse method takes a text and an optional reviver function, and returns
  // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

  // The walk method is used to recursively walk the resulting structure so
  // that modifications can be made.

          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.prototype.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return reviver.call(holder, key, value);
      }


  // Parsing happens in four stages. In the first stage, we replace certain
  // Unicode characters with escape sequences. JavaScript handles many characters
  // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
          text = text.replace(cx, function (a) {
              return '\\u' +
                  ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
          });
      }

  // In the second stage, we run the text against regular expressions that look
  // for non-JSON patterns. We are especially concerned with '()' and 'new'
  // because they can cause invocation, and '=' because it can cause mutation.
  // But just to be safe, we want to reject all unexpected forms.

  // We split the second stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
              .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

  // In the third stage we use the eval function to compile the text into a
  // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
  // in JavaScript: it can begin a block or an object literal. We wrap the text
  // in parens to eliminate the ambiguity.

          j = eval('(' + text + ')');

  // In the optional fourth stage, we recursively walk the new structure, passing
  // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === 'function' ?
              walk({'': j}, '') : j;
      }

  // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
  };

})(
    'undefined' != typeof io ? io : module.exports
  , typeof JSON !== 'undefined' ? JSON : undefined
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Parser namespace.
   *
   * @namespace
   */

  var parser = exports.parser = {};

  /**
   * Packet types.
   */

  var packets = parser.packets = [
      'disconnect'
    , 'connect'
    , 'heartbeat'
    , 'message'
    , 'json'
    , 'event'
    , 'ack'
    , 'error'
    , 'noop'
  ];

  /**
   * Errors reasons.
   */

  var reasons = parser.reasons = [
      'transport not supported'
    , 'client not handshaken'
    , 'unauthorized'
  ];

  /**
   * Errors advice.
   */

  var advice = parser.advice = [
      'reconnect'
  ];

  /**
   * Shortcuts.
   */

  var JSON = io.JSON
    , indexOf = io.util.indexOf;

  /**
   * Encodes a packet.
   *
   * @api private
   */

  parser.encodePacket = function (packet) {
    var type = indexOf(packets, packet.type)
      , id = packet.id || ''
      , endpoint = packet.endpoint || ''
      , ack = packet.ack
      , data = null;

    switch (packet.type) {
      case 'error':
        var reason = packet.reason ? indexOf(reasons, packet.reason) : ''
          , adv = packet.advice ? indexOf(advice, packet.advice) : '';

        if (reason !== '' || adv !== '')
          data = reason + (adv !== '' ? ('+' + adv) : '');

        break;

      case 'message':
        if (packet.data !== '')
          data = packet.data;
        break;

      case 'event':
        var ev = { name: packet.name };

        if (packet.args && packet.args.length) {
          ev.args = packet.args;
        }

        data = JSON.stringify(ev);
        break;

      case 'json':
        data = JSON.stringify(packet.data);
        break;

      case 'connect':
        if (packet.qs)
          data = packet.qs;
        break;

      case 'ack':
        data = packet.ackId
          + (packet.args && packet.args.length
              ? '+' + JSON.stringify(packet.args) : '');
        break;
    }

    // construct packet with required fragments
    var encoded = [
        type
      , id + (ack == 'data' ? '+' : '')
      , endpoint
    ];

    // data fragment is optional
    if (data !== null && data !== undefined)
      encoded.push(data);

    return encoded.join(':');
  };

  /**
   * Encodes multiple messages (payload).
   *
   * @param {Array} messages
   * @api private
   */

  parser.encodePayload = function (packets) {
    var decoded = '';

    if (packets.length == 1)
      return packets[0];

    for (var i = 0, l = packets.length; i < l; i++) {
      var packet = packets[i];
      decoded += '\ufffd' + packet.length + '\ufffd' + packets[i];
    }

    return decoded;
  };

  /**
   * Decodes a packet
   *
   * @api private
   */

  var regexp = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

  parser.decodePacket = function (data) {
    var pieces = data.match(regexp);

    if (!pieces) return {};

    var id = pieces[2] || ''
      , data = pieces[5] || ''
      , packet = {
            type: packets[pieces[1]]
          , endpoint: pieces[4] || ''
        };

    // whether we need to acknowledge the packet
    if (id) {
      packet.id = id;
      if (pieces[3])
        packet.ack = 'data';
      else
        packet.ack = true;
    }

    // handle different packet types
    switch (packet.type) {
      case 'error':
        var pieces = data.split('+');
        packet.reason = reasons[pieces[0]] || '';
        packet.advice = advice[pieces[1]] || '';
        break;

      case 'message':
        packet.data = data || '';
        break;

      case 'event':
        try {
          var opts = JSON.parse(data);
          packet.name = opts.name;
          packet.args = opts.args;
        } catch (e) { }

        packet.args = packet.args || [];
        break;

      case 'json':
        try {
          packet.data = JSON.parse(data);
        } catch (e) { }
        break;

      case 'connect':
        packet.qs = data || '';
        break;

      case 'ack':
        var pieces = data.match(/^([0-9]+)(\+)?(.*)/);
        if (pieces) {
          packet.ackId = pieces[1];
          packet.args = [];

          if (pieces[3]) {
            try {
              packet.args = pieces[3] ? JSON.parse(pieces[3]) : [];
            } catch (e) { }
          }
        }
        break;

      case 'disconnect':
      case 'heartbeat':
        break;
    };

    return packet;
  };

  /**
   * Decodes data payload. Detects multiple messages
   *
   * @return {Array} messages
   * @api public
   */

  parser.decodePayload = function (data) {
    // IE doesn't like data[i] for unicode chars, charAt works fine
    if (data.charAt(0) == '\ufffd') {
      var ret = [];

      for (var i = 1, length = ''; i < data.length; i++) {
        if (data.charAt(i) == '\ufffd') {
          ret.push(parser.decodePacket(data.substr(i + 1).substr(0, length)));
          i += Number(length) + 1;
          length = '';
        } else {
          length += data.charAt(i);
        }
      }

      return ret;
    } else {
      return [parser.decodePacket(data)];
    }
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.Transport = Transport;

  /**
   * This is the transport template for all supported transport methods.
   *
   * @constructor
   * @api public
   */

  function Transport (socket, sessid) {
    this.socket = socket;
    this.sessid = sessid;
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Transport, io.EventEmitter);


  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  Transport.prototype.heartbeats = function () {
    return true;
  };

  /**
   * Handles the response from the server. When a new response is received
   * it will automatically update the timeout, decode the message and
   * forwards the response to the onMessage function for further processing.
   *
   * @param {String} data Response from the server.
   * @api private
   */

  Transport.prototype.onData = function (data) {
    this.clearCloseTimeout();

    // If the connection in currently open (or in a reopening state) reset the close
    // timeout since we have just received data. This check is necessary so
    // that we don't reset the timeout on an explicitly disconnected connection.
    if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
      this.setCloseTimeout();
    }

    if (data !== '') {
      // todo: we should only do decodePayload for xhr transports
      var msgs = io.parser.decodePayload(data);

      if (msgs && msgs.length) {
        for (var i = 0, l = msgs.length; i < l; i++) {
          this.onPacket(msgs[i]);
        }
      }
    }

    return this;
  };

  /**
   * Handles packets.
   *
   * @api private
   */

  Transport.prototype.onPacket = function (packet) {
    this.socket.setHeartbeatTimeout();

    if (packet.type == 'heartbeat') {
      return this.onHeartbeat();
    }

    if (packet.type == 'connect' && packet.endpoint == '') {
      this.onConnect();
    }

    if (packet.type == 'error' && packet.advice == 'reconnect') {
      this.isOpen = false;
    }

    this.socket.onPacket(packet);

    return this;
  };

  /**
   * Sets close timeout
   *
   * @api private
   */

  Transport.prototype.setCloseTimeout = function () {
    if (!this.closeTimeout) {
      var self = this;

      this.closeTimeout = setTimeout(function () {
        self.onDisconnect();
      }, this.socket.closeTimeout);
    }
  };

  /**
   * Called when transport disconnects.
   *
   * @api private
   */

  Transport.prototype.onDisconnect = function () {
    if (this.isOpen) this.close();
    this.clearTimeouts();
    this.socket.onDisconnect();
    return this;
  };

  /**
   * Called when transport connects
   *
   * @api private
   */

  Transport.prototype.onConnect = function () {
    this.socket.onConnect();
    return this;
  };

  /**
   * Clears close timeout
   *
   * @api private
   */

  Transport.prototype.clearCloseTimeout = function () {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  };

  /**
   * Clear timeouts
   *
   * @api private
   */

  Transport.prototype.clearTimeouts = function () {
    this.clearCloseTimeout();

    if (this.reopenTimeout) {
      clearTimeout(this.reopenTimeout);
    }
  };

  /**
   * Sends a packet
   *
   * @param {Object} packet object.
   * @api private
   */

  Transport.prototype.packet = function (packet) {
    this.send(io.parser.encodePacket(packet));
  };

  /**
   * Send the received heartbeat message back to server. So the server
   * knows we are still connected.
   *
   * @param {String} heartbeat Heartbeat response from the server.
   * @api private
   */

  Transport.prototype.onHeartbeat = function (heartbeat) {
    this.packet({ type: 'heartbeat' });
  };

  /**
   * Called when the transport opens.
   *
   * @api private
   */

  Transport.prototype.onOpen = function () {
    this.isOpen = true;
    this.clearCloseTimeout();
    this.socket.onOpen();
  };

  /**
   * Notifies the base when the connection with the Socket.IO server
   * has been disconnected.
   *
   * @api private
   */

  Transport.prototype.onClose = function () {
    var self = this;

    /* FIXME: reopen delay causing a infinit loop
    this.reopenTimeout = setTimeout(function () {
      self.open();
    }, this.socket.options['reopen delay']);*/

    this.isOpen = false;
    this.socket.onClose();
    this.onDisconnect();
  };

  /**
   * Generates a connection url based on the Socket.IO URL Protocol.
   * See <https://github.com/learnboost/socket.io-node/> for more details.
   *
   * @returns {String} Connection url
   * @api private
   */

  Transport.prototype.prepareUrl = function () {
    var options = this.socket.options;

    return this.scheme() + '://'
      + options.host + ':' + options.port + '/'
      + options.resource + '/' + io.protocol
      + '/' + this.name + '/' + this.sessid;
  };

  /**
   * Checks if the transport is ready to start a connection.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Transport.prototype.ready = function (socket, fn) {
    fn.call(this);
  };
})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.Socket = Socket;

  /**
   * Create a new `Socket.IO client` which can establish a persistent
   * connection with a Socket.IO enabled server.
   *
   * @api public
   */

  function Socket (options) {
    this.options = {
        port: 80
      , secure: false
      , document: 'document' in global ? document : false
      , resource: 'socket.io'
      , transports: io.transports
      , 'connect timeout': 10000
      , 'try multiple transports': true
      , 'reconnect': true
      , 'reconnection delay': 500
      , 'reconnection limit': Infinity
      , 'reopen delay': 3000
      , 'max reconnection attempts': 10
      , 'sync disconnect on unload': false
      , 'auto connect': true
      , 'flash policy port': 10843
      , 'manualFlush': false
    };

    io.util.merge(this.options, options);

    this.connected = false;
    this.open = false;
    this.connecting = false;
    this.reconnecting = false;
    this.namespaces = {};
    this.buffer = [];
    this.doBuffer = false;

    if (this.options['sync disconnect on unload'] &&
        (!this.isXDomain() || io.util.ua.hasCORS)) {
      var self = this;
      io.util.on(global, 'beforeunload', function () {
        self.disconnectSync();
      }, false);
    }

    if (this.options['auto connect']) {
      this.connect();
    }
};

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(Socket, io.EventEmitter);

  /**
   * Returns a namespace listener/emitter for this socket
   *
   * @api public
   */

  Socket.prototype.of = function (name) {
    if (!this.namespaces[name]) {
      this.namespaces[name] = new io.SocketNamespace(this, name);

      if (name !== '') {
        this.namespaces[name].packet({ type: 'connect' });
      }
    }

    return this.namespaces[name];
  };

  /**
   * Emits the given event to the Socket and all namespaces
   *
   * @api private
   */

  Socket.prototype.publish = function () {
    this.emit.apply(this, arguments);

    var nsp;

    for (var i in this.namespaces) {
      if (this.namespaces.hasOwnProperty(i)) {
        nsp = this.of(i);
        nsp.$emit.apply(nsp, arguments);
      }
    }
  };

  /**
   * Performs the handshake
   *
   * @api private
   */

  function empty () { };

  Socket.prototype.handshake = function (fn) {
    var self = this
      , options = this.options;

    function complete (data) {
      if (data instanceof Error) {
        self.connecting = false;
        self.onError(data.message);
      } else {
        fn.apply(null, data.split(':'));
      }
    };

    var url = [
          'http' + (options.secure ? 's' : '') + ':/'
        , options.host + ':' + options.port
        , options.resource
        , io.protocol
        , io.util.query(this.options.query, 't=' + +new Date)
      ].join('/');

    if (this.isXDomain() && !io.util.ua.hasCORS) {
      var insertAt = document.getElementsByTagName('script')[0]
        , script = document.createElement('script');

      script.src = url + '&jsonp=' + io.j.length;
      insertAt.parentNode.insertBefore(script, insertAt);

      io.j.push(function (data) {
        complete(data);
        script.parentNode.removeChild(script);
      });
    } else {
      var xhr = io.util.request();

      xhr.open('GET', url, true);
      if (this.isXDomain()) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          xhr.onreadystatechange = empty;

          if (xhr.status == 200) {
            complete(xhr.responseText);
          } else if (xhr.status == 403) {
            self.onError(xhr.responseText);
          } else {
            self.connecting = false;            
            !self.reconnecting && self.onError(xhr.responseText);
          }
        }
      };
      xhr.send(null);
    }
  };

  /**
   * Find an available transport based on the options supplied in the constructor.
   *
   * @api private
   */

  Socket.prototype.getTransport = function (override) {
    var transports = override || this.transports, match;

    for (var i = 0, transport; transport = transports[i]; i++) {
      if (io.Transport[transport]
        && io.Transport[transport].check(this)
        && (!this.isXDomain() || io.Transport[transport].xdomainCheck(this))) {
        return new io.Transport[transport](this, this.sessionid);
      }
    }

    return null;
  };

  /**
   * Connects to the server.
   *
   * @param {Function} [fn] Callback.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.connect = function (fn) {
    if (this.connecting) {
      return this;
    }

    var self = this;
    self.connecting = true;
    
    this.handshake(function (sid, heartbeat, close, transports) {
      self.sessionid = sid;
      self.closeTimeout = close * 1000;
      self.heartbeatTimeout = heartbeat * 1000;
      if(!self.transports)
          self.transports = self.origTransports = (transports ? io.util.intersect(
              transports.split(',')
            , self.options.transports
          ) : self.options.transports);

      self.setHeartbeatTimeout();

      function connect (transports){
        if (self.transport) self.transport.clearTimeouts();

        self.transport = self.getTransport(transports);
        if (!self.transport) return self.publish('connect_failed');

        // once the transport is ready
        self.transport.ready(self, function () {
          self.connecting = true;
          self.publish('connecting', self.transport.name);
          self.transport.open();

          if (self.options['connect timeout']) {
            self.connectTimeoutTimer = setTimeout(function () {
              if (!self.connected) {
                self.connecting = false;

                if (self.options['try multiple transports']) {
                  var remaining = self.transports;

                  while (remaining.length > 0 && remaining.splice(0,1)[0] !=
                         self.transport.name) {}

                    if (remaining.length){
                      connect(remaining);
                    } else {
                      self.publish('connect_failed');
                    }
                }
              }
            }, self.options['connect timeout']);
          }
        });
      }

      connect(self.transports);

      self.once('connect', function (){
        clearTimeout(self.connectTimeoutTimer);

        fn && typeof fn == 'function' && fn();
      });
    });

    return this;
  };

  /**
   * Clears and sets a new heartbeat timeout using the value given by the
   * server during the handshake.
   *
   * @api private
   */

  Socket.prototype.setHeartbeatTimeout = function () {
    clearTimeout(this.heartbeatTimeoutTimer);
    if(this.transport && !this.transport.heartbeats()) return;

    var self = this;
    this.heartbeatTimeoutTimer = setTimeout(function () {
      self.transport.onClose();
    }, this.heartbeatTimeout);
  };

  /**
   * Sends a message.
   *
   * @param {Object} data packet.
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.packet = function (data) {
    if (this.connected && !this.doBuffer) {
      this.transport.packet(data);
    } else {
      this.buffer.push(data);
    }

    return this;
  };

  /**
   * Sets buffer state
   *
   * @api private
   */

  Socket.prototype.setBuffer = function (v) {
    this.doBuffer = v;

    if (!v && this.connected && this.buffer.length) {
      if (!this.options['manualFlush']) {
        this.flushBuffer();
      }
    }
  };

  /**
   * Flushes the buffer data over the wire.
   * To be invoked manually when 'manualFlush' is set to true.
   *
   * @api public
   */

  Socket.prototype.flushBuffer = function() {
    this.transport.payload(this.buffer);
    this.buffer = [];
  };
  

  /**
   * Disconnect the established connect.
   *
   * @returns {io.Socket}
   * @api public
   */

  Socket.prototype.disconnect = function () {
    if (this.connected || this.connecting) {
      if (this.open) {
        this.of('').packet({ type: 'disconnect' });
      }

      // handle disconnection immediately
      this.onDisconnect('booted');
    }

    return this;
  };

  /**
   * Disconnects the socket with a sync XHR.
   *
   * @api private
   */

  Socket.prototype.disconnectSync = function () {
    // ensure disconnection
    var xhr = io.util.request();
    var uri = [
        'http' + (this.options.secure ? 's' : '') + ':/'
      , this.options.host + ':' + this.options.port
      , this.options.resource
      , io.protocol
      , ''
      , this.sessionid
    ].join('/') + '/?disconnect=1';

    xhr.open('GET', uri, false);
    xhr.send(null);

    // handle disconnection immediately
    this.onDisconnect('booted');
  };

  /**
   * Check if we need to use cross domain enabled transports. Cross domain would
   * be a different port or different domain name.
   *
   * @returns {Boolean}
   * @api private
   */

  Socket.prototype.isXDomain = function () {

    var port = global.location.port ||
      ('https:' == global.location.protocol ? 443 : 80);

    return this.options.host !== global.location.hostname 
      || this.options.port != port;
  };

  /**
   * Called upon handshake.
   *
   * @api private
   */

  Socket.prototype.onConnect = function () {
    if (!this.connected) {
      this.connected = true;
      this.connecting = false;
      if (!this.doBuffer) {
        // make sure to flush the buffer
        this.setBuffer(false);
      }
      this.emit('connect');
    }
  };

  /**
   * Called when the transport opens
   *
   * @api private
   */

  Socket.prototype.onOpen = function () {
    this.open = true;
  };

  /**
   * Called when the transport closes.
   *
   * @api private
   */

  Socket.prototype.onClose = function () {
    this.open = false;
    clearTimeout(this.heartbeatTimeoutTimer);
  };

  /**
   * Called when the transport first opens a connection
   *
   * @param text
   */

  Socket.prototype.onPacket = function (packet) {
    this.of(packet.endpoint).onPacket(packet);
  };

  /**
   * Handles an error.
   *
   * @api private
   */

  Socket.prototype.onError = function (err) {
    if (err && err.advice) {
      if (err.advice === 'reconnect' && (this.connected || this.connecting)) {
        this.disconnect();
        if (this.options.reconnect) {
          this.reconnect();
        }
      }
    }

    this.publish('error', err && err.reason ? err.reason : err);
  };

  /**
   * Called when the transport disconnects.
   *
   * @api private
   */

  Socket.prototype.onDisconnect = function (reason) {
    var wasConnected = this.connected
      , wasConnecting = this.connecting;

    this.connected = false;
    this.connecting = false;
    this.open = false;

    if (wasConnected || wasConnecting) {
      this.transport.close();
      this.transport.clearTimeouts();
      if (wasConnected) {
        this.publish('disconnect', reason);

        if ('booted' != reason && this.options.reconnect && !this.reconnecting) {
          this.reconnect();
        }
      }
    }
  };

  /**
   * Called upon reconnection.
   *
   * @api private
   */

  Socket.prototype.reconnect = function () {
    this.reconnecting = true;
    this.reconnectionAttempts = 0;
    this.reconnectionDelay = this.options['reconnection delay'];

    var self = this
      , maxAttempts = this.options['max reconnection attempts']
      , tryMultiple = this.options['try multiple transports']
      , limit = this.options['reconnection limit'];

    function reset () {
      if (self.connected) {
        for (var i in self.namespaces) {
          if (self.namespaces.hasOwnProperty(i) && '' !== i) {
              self.namespaces[i].packet({ type: 'connect' });
          }
        }
        self.publish('reconnect', self.transport.name, self.reconnectionAttempts);
      }

      clearTimeout(self.reconnectionTimer);

      self.removeListener('connect_failed', maybeReconnect);
      self.removeListener('connect', maybeReconnect);

      self.reconnecting = false;

      delete self.reconnectionAttempts;
      delete self.reconnectionDelay;
      delete self.reconnectionTimer;
      delete self.redoTransports;

      self.options['try multiple transports'] = tryMultiple;
    };

    function maybeReconnect () {
      if (!self.reconnecting) {
        return;
      }

      if (self.connected) {
        return reset();
      };

      if (self.connecting && self.reconnecting) {
        return self.reconnectionTimer = setTimeout(maybeReconnect, 1000);
      }

      if (self.reconnectionAttempts++ >= maxAttempts) {
        if (!self.redoTransports) {
          self.on('connect_failed', maybeReconnect);
          self.options['try multiple transports'] = true;
          self.transports = self.origTransports;
          self.transport = self.getTransport();
          self.redoTransports = true;
          self.connect();
        } else {
          self.publish('reconnect_failed');
          reset();
        }
      } else {
        if (self.reconnectionDelay < limit) {
          self.reconnectionDelay *= 2; // exponential back off
        }

        self.connect();
        self.publish('reconnecting', self.reconnectionDelay, self.reconnectionAttempts);
        self.reconnectionTimer = setTimeout(maybeReconnect, self.reconnectionDelay);
      }
    };

    this.options['try multiple transports'] = false;
    this.reconnectionTimer = setTimeout(maybeReconnect, this.reconnectionDelay);

    this.on('connect', maybeReconnect);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.SocketNamespace = SocketNamespace;

  /**
   * Socket namespace constructor.
   *
   * @constructor
   * @api public
   */

  function SocketNamespace (socket, name) {
    this.socket = socket;
    this.name = name || '';
    this.flags = {};
    this.json = new Flag(this, 'json');
    this.ackPackets = 0;
    this.acks = {};
  };

  /**
   * Apply EventEmitter mixin.
   */

  io.util.mixin(SocketNamespace, io.EventEmitter);

  /**
   * Copies emit since we override it
   *
   * @api private
   */

  SocketNamespace.prototype.$emit = io.EventEmitter.prototype.emit;

  /**
   * Creates a new namespace, by proxying the request to the socket. This
   * allows us to use the synax as we do on the server.
   *
   * @api public
   */

  SocketNamespace.prototype.of = function () {
    return this.socket.of.apply(this.socket, arguments);
  };

  /**
   * Sends a packet.
   *
   * @api private
   */

  SocketNamespace.prototype.packet = function (packet) {
    packet.endpoint = this.name;
    this.socket.packet(packet);
    this.flags = {};
    return this;
  };

  /**
   * Sends a message
   *
   * @api public
   */

  SocketNamespace.prototype.send = function (data, fn) {
    var packet = {
        type: this.flags.json ? 'json' : 'message'
      , data: data
    };

    if ('function' == typeof fn) {
      packet.id = ++this.ackPackets;
      packet.ack = true;
      this.acks[packet.id] = fn;
    }

    return this.packet(packet);
  };

  /**
   * Emits an event
   *
   * @api public
   */
  
  SocketNamespace.prototype.emit = function (name) {
    var args = Array.prototype.slice.call(arguments, 1)
      , lastArg = args[args.length - 1]
      , packet = {
            type: 'event'
          , name: name
        };

    if ('function' == typeof lastArg) {
      packet.id = ++this.ackPackets;
      packet.ack = 'data';
      this.acks[packet.id] = lastArg;
      args = args.slice(0, args.length - 1);
    }

    packet.args = args;

    return this.packet(packet);
  };

  /**
   * Disconnects the namespace
   *
   * @api private
   */

  SocketNamespace.prototype.disconnect = function () {
    if (this.name === '') {
      this.socket.disconnect();
    } else {
      this.packet({ type: 'disconnect' });
      this.$emit('disconnect');
    }

    return this;
  };

  /**
   * Handles a packet
   *
   * @api private
   */

  SocketNamespace.prototype.onPacket = function (packet) {
    var self = this;

    function ack () {
      self.packet({
          type: 'ack'
        , args: io.util.toArray(arguments)
        , ackId: packet.id
      });
    };

    switch (packet.type) {
      case 'connect':
        this.$emit('connect');
        break;

      case 'disconnect':
        if (this.name === '') {
          this.socket.onDisconnect(packet.reason || 'booted');
        } else {
          this.$emit('disconnect', packet.reason);
        }
        break;

      case 'message':
      case 'json':
        var params = ['message', packet.data];

        if (packet.ack == 'data') {
          params.push(ack);
        } else if (packet.ack) {
          this.packet({ type: 'ack', ackId: packet.id });
        }

        this.$emit.apply(this, params);
        break;

      case 'event':
        var params = [packet.name].concat(packet.args);

        if (packet.ack == 'data')
          params.push(ack);

        this.$emit.apply(this, params);
        break;

      case 'ack':
        if (this.acks[packet.ackId]) {
          this.acks[packet.ackId].apply(this, packet.args);
          delete this.acks[packet.ackId];
        }
        break;

      case 'error':
        if (packet.advice){
          this.socket.onError(packet);
        } else {
          if (packet.reason == 'unauthorized') {
            this.$emit('connect_failed', packet.reason);
          } else {
            this.$emit('error', packet.reason);
          }
        }
        break;
    }
  };

  /**
   * Flag interface.
   *
   * @api private
   */

  function Flag (nsp, name) {
    this.namespace = nsp;
    this.name = name;
  };

  /**
   * Send a message
   *
   * @api public
   */

  Flag.prototype.send = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.send.apply(this.namespace, arguments);
  };

  /**
   * Emit an event
   *
   * @api public
   */

  Flag.prototype.emit = function () {
    this.namespace.flags[this.name] = true;
    this.namespace.emit.apply(this.namespace, arguments);
  };

})(
    'undefined' != typeof io ? io : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports.websocket = WS;

  /**
   * The WebSocket transport uses the HTML5 WebSocket API to establish an
   * persistent connection with the Socket.IO server. This transport will also
   * be inherited by the FlashSocket fallback as it provides a API compatible
   * polyfill for the WebSockets.
   *
   * @constructor
   * @extends {io.Transport}
   * @api public
   */

  function WS (socket) {
    io.Transport.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(WS, io.Transport);

  /**
   * Transport name
   *
   * @api public
   */

  WS.prototype.name = 'websocket';

  /**
   * Initializes a new `WebSocket` connection with the Socket.IO server. We attach
   * all the appropriate listeners to handle the responses from the server.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.open = function () {
    var query = io.util.query(this.socket.options.query)
      , self = this
      , Socket


    if (!Socket) {
      Socket = global.MozWebSocket || global.WebSocket;
    }

    this.websocket = new Socket(this.prepareUrl() + query);

    this.websocket.onopen = function () {
      self.onOpen();
      self.socket.setBuffer(false);
    };
    this.websocket.onmessage = function (ev) {
      self.onData(ev.data);
    };
    this.websocket.onclose = function () {
      self.onClose();
      self.socket.setBuffer(true);
    };
    this.websocket.onerror = function (e) {
      self.onError(e);
    };

    return this;
  };

  /**
   * Send a message to the Socket.IO server. The message will automatically be
   * encoded in the correct message format.
   *
   * @returns {Transport}
   * @api public
   */

  // Do to a bug in the current IDevices browser, we need to wrap the send in a 
  // setTimeout, when they resume from sleeping the browser will crash if 
  // we don't allow the browser time to detect the socket has been closed
  if (io.util.ua.iDevice) {
    WS.prototype.send = function (data) {
      var self = this;
      setTimeout(function() {
         self.websocket.send(data);
      },0);
      return this;
    };
  } else {
    WS.prototype.send = function (data) {
      this.websocket.send(data);
      return this;
    };
  }

  /**
   * Payload
   *
   * @api private
   */

  WS.prototype.payload = function (arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      this.packet(arr[i]);
    }
    return this;
  };

  /**
   * Disconnect the established `WebSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  WS.prototype.close = function () {
    this.websocket.close();
    return this;
  };

  /**
   * Handle the errors that `WebSocket` might be giving when we
   * are attempting to connect or send messages.
   *
   * @param {Error} e The error.
   * @api private
   */

  WS.prototype.onError = function (e) {
    this.socket.onError(e);
  };

  /**
   * Returns the appropriate scheme for the URI generation.
   *
   * @api private
   */
  WS.prototype.scheme = function () {
    return this.socket.options.secure ? 'wss' : 'ws';
  };

  /**
   * Checks if the browser has support for native `WebSockets` and that
   * it's not the polyfill created for the FlashSocket transport.
   *
   * @return {Boolean}
   * @api public
   */

  WS.check = function () {
    return ('WebSocket' in global && !('__addTask' in WebSocket))
          || 'MozWebSocket' in global;
  };

  /**
   * Check if the `WebSocket` transport support cross domain communications.
   *
   * @returns {Boolean}
   * @api public
   */

  WS.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('websocket');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.flashsocket = Flashsocket;

  /**
   * The FlashSocket transport. This is a API wrapper for the HTML5 WebSocket
   * specification. It uses a .swf file to communicate with the server. If you want
   * to serve the .swf file from a other server than where the Socket.IO script is
   * coming from you need to use the insecure version of the .swf. More information
   * about this can be found on the github page.
   *
   * @constructor
   * @extends {io.Transport.websocket}
   * @api public
   */

  function Flashsocket () {
    io.Transport.websocket.apply(this, arguments);
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(Flashsocket, io.Transport.websocket);

  /**
   * Transport name
   *
   * @api public
   */

  Flashsocket.prototype.name = 'flashsocket';

  /**
   * Disconnect the established `FlashSocket` connection. This is done by adding a 
   * new task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.open = function () {
    var self = this
      , args = arguments;

    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.open.apply(self, args);
    });
    return this;
  };
  
  /**
   * Sends a message to the Socket.IO server. This is done by adding a new
   * task to the FlashSocket. The rest will be handled off by the `WebSocket` 
   * transport.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.send = function () {
    var self = this, args = arguments;
    WebSocket.__addTask(function () {
      io.Transport.websocket.prototype.send.apply(self, args);
    });
    return this;
  };

  /**
   * Disconnects the established `FlashSocket` connection.
   *
   * @returns {Transport}
   * @api public
   */

  Flashsocket.prototype.close = function () {
    WebSocket.__tasks.length = 0;
    io.Transport.websocket.prototype.close.call(this);
    return this;
  };

  /**
   * The WebSocket fall back needs to append the flash container to the body
   * element, so we need to make sure we have access to it. Or defer the call
   * until we are sure there is a body element.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  Flashsocket.prototype.ready = function (socket, fn) {
    function init () {
      var options = socket.options
        , port = options['flash policy port']
        , path = [
              'http' + (options.secure ? 's' : '') + ':/'
            , options.host + ':' + options.port
            , options.resource
            , 'static/flashsocket'
            , 'WebSocketMain' + (socket.isXDomain() ? 'Insecure' : '') + '.swf'
          ];

      // Only start downloading the swf file when the checked that this browser
      // actually supports it
      if (!Flashsocket.loaded) {
        if (typeof WEB_SOCKET_SWF_LOCATION === 'undefined') {
          // Set the correct file based on the XDomain settings
          WEB_SOCKET_SWF_LOCATION = path.join('/');
        }

        if (port !== 843) {
          WebSocket.loadFlashPolicyFile('xmlsocket://' + options.host + ':' + port);
        }

        WebSocket.__initialize();
        Flashsocket.loaded = true;
      }

      fn.call(self);
    }

    var self = this;
    if (document.body) return init();

    io.util.load(init);
  };

  /**
   * Check if the FlashSocket transport is supported as it requires that the Adobe
   * Flash Player plug-in version `10.0.0` or greater is installed. And also check if
   * the polyfill is correctly loaded.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.check = function () {
    if (
        typeof WebSocket == 'undefined'
      || !('__initialize' in WebSocket) || !swfobject
    ) return false;

    return swfobject.getFlashPlayerVersion().major >= 10;
  };

  /**
   * Check if the FlashSocket transport can be used as cross domain / cross origin 
   * transport. Because we can't see which type (secure or insecure) of .swf is used
   * we will just return true.
   *
   * @returns {Boolean}
   * @api public
   */

  Flashsocket.xdomainCheck = function () {
    return true;
  };

  /**
   * Disable AUTO_INITIALIZATION
   */

  if (typeof window != 'undefined') {
    WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
  }

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('flashsocket');
})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if ('undefined' != typeof window) {
var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O[(['Active'].concat('Object').join('X'))]!=D){try{var ad=new window[(['Active'].concat('Object').join('X'))](W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?(['Active'].concat('').join('X')):"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();
}
// Copyright: Hiroshi Ichikawa <http://gimite.net/en/>
// License: New BSD License
// Reference: http://dev.w3.org/html5/websockets/
// Reference: http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol

(function() {
  
  if ('undefined' == typeof window || window.WebSocket) return;

  var console = window.console;
  if (!console || !console.log || !console.error) {
    console = {log: function(){ }, error: function(){ }};
  }
  
  if (!swfobject.hasFlashPlayerVersion("10.0.0")) {
    console.error("Flash Player >= 10.0.0 is required.");
    return;
  }
  if (location.protocol == "file:") {
    console.error(
      "WARNING: web-socket-js doesn't work in file:///... URL " +
      "unless you set Flash Security Settings properly. " +
      "Open the page via Web server i.e. http://...");
  }

  /**
   * This class represents a faux web socket.
   * @param {string} url
   * @param {array or string} protocols
   * @param {string} proxyHost
   * @param {int} proxyPort
   * @param {string} headers
   */
  WebSocket = function(url, protocols, proxyHost, proxyPort, headers) {
    var self = this;
    self.__id = WebSocket.__nextId++;
    WebSocket.__instances[self.__id] = self;
    self.readyState = WebSocket.CONNECTING;
    self.bufferedAmount = 0;
    self.__events = {};
    if (!protocols) {
      protocols = [];
    } else if (typeof protocols == "string") {
      protocols = [protocols];
    }
    // Uses setTimeout() to make sure __createFlash() runs after the caller sets ws.onopen etc.
    // Otherwise, when onopen fires immediately, onopen is called before it is set.
    setTimeout(function() {
      WebSocket.__addTask(function() {
        WebSocket.__flash.create(
            self.__id, url, protocols, proxyHost || null, proxyPort || 0, headers || null);
      });
    }, 0);
  };

  /**
   * Send data to the web socket.
   * @param {string} data  The data to send to the socket.
   * @return {boolean}  True for success, false for failure.
   */
  WebSocket.prototype.send = function(data) {
    if (this.readyState == WebSocket.CONNECTING) {
      throw "INVALID_STATE_ERR: Web Socket connection has not been established";
    }
    // We use encodeURIComponent() here, because FABridge doesn't work if
    // the argument includes some characters. We don't use escape() here
    // because of this:
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Functions#escape_and_unescape_Functions
    // But it looks decodeURIComponent(encodeURIComponent(s)) doesn't
    // preserve all Unicode characters either e.g. "\uffff" in Firefox.
    // Note by wtritch: Hopefully this will not be necessary using ExternalInterface.  Will require
    // additional testing.
    var result = WebSocket.__flash.send(this.__id, encodeURIComponent(data));
    if (result < 0) { // success
      return true;
    } else {
      this.bufferedAmount += result;
      return false;
    }
  };

  /**
   * Close this web socket gracefully.
   */
  WebSocket.prototype.close = function() {
    if (this.readyState == WebSocket.CLOSED || this.readyState == WebSocket.CLOSING) {
      return;
    }
    this.readyState = WebSocket.CLOSING;
    WebSocket.__flash.close(this.__id);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) {
      this.__events[type] = [];
    }
    this.__events[type].push(listener);
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {string} type
   * @param {function} listener
   * @param {boolean} useCapture
   * @return void
   */
  WebSocket.prototype.removeEventListener = function(type, listener, useCapture) {
    if (!(type in this.__events)) return;
    var events = this.__events[type];
    for (var i = events.length - 1; i >= 0; --i) {
      if (events[i] === listener) {
        events.splice(i, 1);
        break;
      }
    }
  };

  /**
   * Implementation of {@link <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-registration">DOM 2 EventTarget Interface</a>}
   *
   * @param {Event} event
   * @return void
   */
  WebSocket.prototype.dispatchEvent = function(event) {
    var events = this.__events[event.type] || [];
    for (var i = 0; i < events.length; ++i) {
      events[i](event);
    }
    var handler = this["on" + event.type];
    if (handler) handler(event);
  };

  /**
   * Handles an event from Flash.
   * @param {Object} flashEvent
   */
  WebSocket.prototype.__handleEvent = function(flashEvent) {
    if ("readyState" in flashEvent) {
      this.readyState = flashEvent.readyState;
    }
    if ("protocol" in flashEvent) {
      this.protocol = flashEvent.protocol;
    }
    
    var jsEvent;
    if (flashEvent.type == "open" || flashEvent.type == "error") {
      jsEvent = this.__createSimpleEvent(flashEvent.type);
    } else if (flashEvent.type == "close") {
      // TODO implement jsEvent.wasClean
      jsEvent = this.__createSimpleEvent("close");
    } else if (flashEvent.type == "message") {
      var data = decodeURIComponent(flashEvent.message);
      jsEvent = this.__createMessageEvent("message", data);
    } else {
      throw "unknown event type: " + flashEvent.type;
    }
    
    this.dispatchEvent(jsEvent);
  };
  
  WebSocket.prototype.__createSimpleEvent = function(type) {
    if (document.createEvent && window.Event) {
      var event = document.createEvent("Event");
      event.initEvent(type, false, false);
      return event;
    } else {
      return {type: type, bubbles: false, cancelable: false};
    }
  };
  
  WebSocket.prototype.__createMessageEvent = function(type, data) {
    if (document.createEvent && window.MessageEvent && !window.opera) {
      var event = document.createEvent("MessageEvent");
      event.initMessageEvent("message", false, false, data, null, null, window, null);
      return event;
    } else {
      // IE and Opera, the latter one truncates the data parameter after any 0x00 bytes.
      return {type: type, data: data, bubbles: false, cancelable: false};
    }
  };
  
  /**
   * Define the WebSocket readyState enumeration.
   */
  WebSocket.CONNECTING = 0;
  WebSocket.OPEN = 1;
  WebSocket.CLOSING = 2;
  WebSocket.CLOSED = 3;

  WebSocket.__flash = null;
  WebSocket.__instances = {};
  WebSocket.__tasks = [];
  WebSocket.__nextId = 0;
  
  /**
   * Load a new flash security policy file.
   * @param {string} url
   */
  WebSocket.loadFlashPolicyFile = function(url){
    WebSocket.__addTask(function() {
      WebSocket.__flash.loadManualPolicyFile(url);
    });
  };

  /**
   * Loads WebSocketMain.swf and creates WebSocketMain object in Flash.
   */
  WebSocket.__initialize = function() {
    if (WebSocket.__flash) return;
    
    if (WebSocket.__swfLocation) {
      // For backword compatibility.
      window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation;
    }
    if (!window.WEB_SOCKET_SWF_LOCATION) {
      console.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf");
      return;
    }
    var container = document.createElement("div");
    container.id = "webSocketContainer";
    // Hides Flash box. We cannot use display: none or visibility: hidden because it prevents
    // Flash from loading at least in IE. So we move it out of the screen at (-100, -100).
    // But this even doesn't work with Flash Lite (e.g. in Droid Incredible). So with Flash
    // Lite, we put it at (0, 0). This shows 1x1 box visible at left-top corner but this is
    // the best we can do as far as we know now.
    container.style.position = "absolute";
    if (WebSocket.__isFlashLite()) {
      container.style.left = "0px";
      container.style.top = "0px";
    } else {
      container.style.left = "-100px";
      container.style.top = "-100px";
    }
    var holder = document.createElement("div");
    holder.id = "webSocketFlash";
    container.appendChild(holder);
    document.body.appendChild(container);
    // See this article for hasPriority:
    // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
    swfobject.embedSWF(
      WEB_SOCKET_SWF_LOCATION,
      "webSocketFlash",
      "1" /* width */,
      "1" /* height */,
      "10.0.0" /* SWF version */,
      null,
      null,
      {hasPriority: true, swliveconnect : true, allowScriptAccess: "always"},
      null,
      function(e) {
        if (!e.success) {
          console.error("[WebSocket] swfobject.embedSWF failed");
        }
      });
  };
  
  /**
   * Called by Flash to notify JS that it's fully loaded and ready
   * for communication.
   */
  WebSocket.__onFlashInitialized = function() {
    // We need to set a timeout here to avoid round-trip calls
    // to flash during the initialization process.
    setTimeout(function() {
      WebSocket.__flash = document.getElementById("webSocketFlash");
      WebSocket.__flash.setCallerUrl(location.href);
      WebSocket.__flash.setDebug(!!window.WEB_SOCKET_DEBUG);
      for (var i = 0; i < WebSocket.__tasks.length; ++i) {
        WebSocket.__tasks[i]();
      }
      WebSocket.__tasks = [];
    }, 0);
  };
  
  /**
   * Called by Flash to notify WebSockets events are fired.
   */
  WebSocket.__onFlashEvent = function() {
    setTimeout(function() {
      try {
        // Gets events using receiveEvents() instead of getting it from event object
        // of Flash event. This is to make sure to keep message order.
        // It seems sometimes Flash events don't arrive in the same order as they are sent.
        var events = WebSocket.__flash.receiveEvents();
        for (var i = 0; i < events.length; ++i) {
          WebSocket.__instances[events[i].webSocketId].__handleEvent(events[i]);
        }
      } catch (e) {
        console.error(e);
      }
    }, 0);
    return true;
  };
  
  // Called by Flash.
  WebSocket.__log = function(message) {
    console.log(decodeURIComponent(message));
  };
  
  // Called by Flash.
  WebSocket.__error = function(message) {
    console.error(decodeURIComponent(message));
  };
  
  WebSocket.__addTask = function(task) {
    if (WebSocket.__flash) {
      task();
    } else {
      WebSocket.__tasks.push(task);
    }
  };
  
  /**
   * Test if the browser is running flash lite.
   * @return {boolean} True if flash lite is running, false otherwise.
   */
  WebSocket.__isFlashLite = function() {
    if (!window.navigator || !window.navigator.mimeTypes) {
      return false;
    }
    var mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
    if (!mimeType || !mimeType.enabledPlugin || !mimeType.enabledPlugin.filename) {
      return false;
    }
    return mimeType.enabledPlugin.filename.match(/flashlite/i) ? true : false;
  };
  
  if (!window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION) {
    if (window.addEventListener) {
      window.addEventListener("load", function(){
        WebSocket.__initialize();
      }, false);
    } else {
      window.attachEvent("onload", function(){
        WebSocket.__initialize();
      });
    }
  }
  
})();

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   *
   * @api public
   */

  exports.XHR = XHR;

  /**
   * XHR constructor
   *
   * @costructor
   * @api public
   */

  function XHR (socket) {
    if (!socket) return;

    io.Transport.apply(this, arguments);
    this.sendBuffer = [];
  };

  /**
   * Inherits from Transport.
   */

  io.util.inherit(XHR, io.Transport);

  /**
   * Establish a connection
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.open = function () {
    this.socket.setBuffer(false);
    this.onOpen();
    this.get();

    // we need to make sure the request succeeds since we have no indication
    // whether the request opened or not until it succeeded.
    this.setCloseTimeout();

    return this;
  };

  /**
   * Check if we need to send data to the Socket.IO server, if we have data in our
   * buffer we encode it and forward it to the `post` method.
   *
   * @api private
   */

  XHR.prototype.payload = function (payload) {
    var msgs = [];

    for (var i = 0, l = payload.length; i < l; i++) {
      msgs.push(io.parser.encodePacket(payload[i]));
    }

    this.send(io.parser.encodePayload(msgs));
  };

  /**
   * Send data to the Socket.IO server.
   *
   * @param data The message
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.send = function (data) {
    this.post(data);
    return this;
  };

  /**
   * Posts a encoded message to the Socket.IO server.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  function empty () { };

  XHR.prototype.post = function (data) {
    var self = this;
    this.socket.setBuffer(true);

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;
        self.posting = false;

        if (this.status == 200){
          self.socket.setBuffer(false);
        } else {
          self.onClose();
        }
      }
    }

    function onload () {
      this.onload = empty;
      self.socket.setBuffer(false);
    };

    this.sendXHR = this.request('POST');

    if (global.XDomainRequest && this.sendXHR instanceof XDomainRequest) {
      this.sendXHR.onload = this.sendXHR.onerror = onload;
    } else {
      this.sendXHR.onreadystatechange = stateChange;
    }

    this.sendXHR.send(data);
  };

  /**
   * Disconnects the established `XHR` connection.
   *
   * @returns {Transport}
   * @api public
   */

  XHR.prototype.close = function () {
    this.onClose();
    return this;
  };

  /**
   * Generates a configured XHR request
   *
   * @param {String} url The url that needs to be requested.
   * @param {String} method The method the request should use.
   * @returns {XMLHttpRequest}
   * @api private
   */

  XHR.prototype.request = function (method) {
    var req = io.util.request(this.socket.isXDomain())
      , query = io.util.query(this.socket.options.query, 't=' + +new Date);

    req.open(method || 'GET', this.prepareUrl() + query, true);

    if (method == 'POST') {
      try {
        if (req.setRequestHeader) {
          req.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        } else {
          // XDomainRequest
          req.contentType = 'text/plain';
        }
      } catch (e) {}
    }

    return req;
  };

  /**
   * Returns the scheme to use for the transport URLs.
   *
   * @api private
   */

  XHR.prototype.scheme = function () {
    return this.socket.options.secure ? 'https' : 'http';
  };

  /**
   * Check if the XHR transports are supported
   *
   * @param {Boolean} xdomain Check if we support cross domain requests.
   * @returns {Boolean}
   * @api public
   */

  XHR.check = function (socket, xdomain) {
    try {
      var request = io.util.request(xdomain),
          usesXDomReq = (global.XDomainRequest && request instanceof XDomainRequest),
          socketProtocol = (socket && socket.options && socket.options.secure ? 'https:' : 'http:'),
          isXProtocol = (global.location && socketProtocol != global.location.protocol);
      if (request && !(usesXDomReq && isXProtocol)) {
        return true;
      }
    } catch(e) {}

    return false;
  };

  /**
   * Check if the XHR transport supports cross domain requests.
   *
   * @returns {Boolean}
   * @api public
   */

  XHR.xdomainCheck = function (socket) {
    return XHR.check(socket, true);
  };

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);
/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io) {

  /**
   * Expose constructor.
   */

  exports.htmlfile = HTMLFile;

  /**
   * The HTMLFile transport creates a `forever iframe` based transport
   * for Internet Explorer. Regular forever iframe implementations will 
   * continuously trigger the browsers buzy indicators. If the forever iframe
   * is created inside a `htmlfile` these indicators will not be trigged.
   *
   * @constructor
   * @extends {io.Transport.XHR}
   * @api public
   */

  function HTMLFile (socket) {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(HTMLFile, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  HTMLFile.prototype.name = 'htmlfile';

  /**
   * Creates a new Ac...eX `htmlfile` with a forever loading iframe
   * that can be used to listen to messages. Inside the generated
   * `htmlfile` a reference will be made to the HTMLFile transport.
   *
   * @api private
   */

  HTMLFile.prototype.get = function () {
    this.doc = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
    this.doc.open();
    this.doc.write('<html></html>');
    this.doc.close();
    this.doc.parentWindow.s = this;

    var iframeC = this.doc.createElement('div');
    iframeC.className = 'socketio';

    this.doc.body.appendChild(iframeC);
    this.iframe = this.doc.createElement('iframe');

    iframeC.appendChild(this.iframe);

    var self = this
      , query = io.util.query(this.socket.options.query, 't='+ +new Date);

    this.iframe.src = this.prepareUrl() + query;

    io.util.on(window, 'unload', function () {
      self.destroy();
    });
  };

  /**
   * The Socket.IO server will write script tags inside the forever
   * iframe, this function will be used as callback for the incoming
   * information.
   *
   * @param {String} data The message
   * @param {document} doc Reference to the context
   * @api private
   */

  HTMLFile.prototype._ = function (data, doc) {
    // unescape all forward slashes. see GH-1251
    data = data.replace(/\\\//g, '/');
    this.onData(data);
    try {
      var script = doc.getElementsByTagName('script')[0];
      script.parentNode.removeChild(script);
    } catch (e) { }
  };

  /**
   * Destroy the established connection, iframe and `htmlfile`.
   * And calls the `CollectGarbage` function of Internet Explorer
   * to release the memory.
   *
   * @api private
   */

  HTMLFile.prototype.destroy = function () {
    if (this.iframe){
      try {
        this.iframe.src = 'about:blank';
      } catch(e){}

      this.doc = null;
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;

      CollectGarbage();
    }
  };

  /**
   * Disconnects the established connection.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  HTMLFile.prototype.close = function () {
    this.destroy();
    return io.Transport.XHR.prototype.close.call(this);
  };

  /**
   * Checks if the browser supports this transport. The browser
   * must have an `Ac...eXObject` implementation.
   *
   * @return {Boolean}
   * @api public
   */

  HTMLFile.check = function (socket) {
    if (typeof window != "undefined" && (['Active'].concat('Object').join('X')) in window){
      try {
        var a = new window[(['Active'].concat('Object').join('X'))]('htmlfile');
        return a && io.Transport.XHR.check(socket);
      } catch(e){}
    }
    return false;
  };

  /**
   * Check if cross domain requests are supported.
   *
   * @returns {Boolean}
   * @api public
   */

  HTMLFile.xdomainCheck = function () {
    // we can probably do handling for sub-domains, we should
    // test that it's cross domain but a subdomain here
    return false;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('htmlfile');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {

  /**
   * Expose constructor.
   */

  exports['xhr-polling'] = XHRPolling;

  /**
   * The XHR-polling transport uses long polling XHR requests to create a
   * "persistent" connection with the server.
   *
   * @constructor
   * @api public
   */

  function XHRPolling () {
    io.Transport.XHR.apply(this, arguments);
  };

  /**
   * Inherits from XHR transport.
   */

  io.util.inherit(XHRPolling, io.Transport.XHR);

  /**
   * Merge the properties from XHR transport
   */

  io.util.merge(XHRPolling, io.Transport.XHR);

  /**
   * Transport name
   *
   * @api public
   */

  XHRPolling.prototype.name = 'xhr-polling';

  /**
   * Indicates whether heartbeats is enabled for this transport
   *
   * @api private
   */

  XHRPolling.prototype.heartbeats = function () {
    return false;
  };

  /** 
   * Establish a connection, for iPhone and Android this will be done once the page
   * is loaded.
   *
   * @returns {Transport} Chaining.
   * @api public
   */

  XHRPolling.prototype.open = function () {
    var self = this;

    io.Transport.XHR.prototype.open.call(self);
    return false;
  };

  /**
   * Starts a XHR request to wait for incoming messages.
   *
   * @api private
   */

  function empty () {};

  XHRPolling.prototype.get = function () {
    if (!this.isOpen) return;

    var self = this;

    function stateChange () {
      if (this.readyState == 4) {
        this.onreadystatechange = empty;

        if (this.status == 200) {
          self.onData(this.responseText);
          self.get();
        } else {
          self.onClose();
        }
      }
    };

    function onload () {
      this.onload = empty;
      this.onerror = empty;
      self.retryCounter = 1;
      self.onData(this.responseText);
      self.get();
    };

    function onerror () {
      self.retryCounter ++;
      if(!self.retryCounter || self.retryCounter > 3) {
        self.onClose();  
      } else {
        self.get();
      }
    };

    this.xhr = this.request();

    if (global.XDomainRequest && this.xhr instanceof XDomainRequest) {
      this.xhr.onload = onload;
      this.xhr.onerror = onerror;
    } else {
      this.xhr.onreadystatechange = stateChange;
    }

    this.xhr.send(null);
  };

  /**
   * Handle the unclean close behavior.
   *
   * @api private
   */

  XHRPolling.prototype.onClose = function () {
    io.Transport.XHR.prototype.onClose.call(this);

    if (this.xhr) {
      this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = empty;
      try {
        this.xhr.abort();
      } catch(e){}
      this.xhr = null;
    }
  };

  /**
   * Webkit based browsers show a infinit spinner when you start a XHR request
   * before the browsers onload event is called so we need to defer opening of
   * the transport until the onload event is called. Wrapping the cb in our
   * defer method solve this.
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  XHRPolling.prototype.ready = function (socket, fn) {
    var self = this;

    io.util.defer(function () {
      fn.call(self);
    });
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('xhr-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

/**
 * socket.io
 * Copyright(c) 2011 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

(function (exports, io, global) {
  /**
   * There is a way to hide the loading indicator in Firefox. If you create and
   * remove a iframe it will stop showing the current loading indicator.
   * Unfortunately we can't feature detect that and UA sniffing is evil.
   *
   * @api private
   */

  var indicator = global.document && "MozAppearance" in
    global.document.documentElement.style;

  /**
   * Expose constructor.
   */

  exports['jsonp-polling'] = JSONPPolling;

  /**
   * The JSONP transport creates an persistent connection by dynamically
   * inserting a script tag in the page. This script tag will receive the
   * information of the Socket.IO server. When new information is received
   * it creates a new script tag for the new data stream.
   *
   * @constructor
   * @extends {io.Transport.xhr-polling}
   * @api public
   */

  function JSONPPolling (socket) {
    io.Transport['xhr-polling'].apply(this, arguments);

    this.index = io.j.length;

    var self = this;

    io.j.push(function (msg) {
      self._(msg);
    });
  };

  /**
   * Inherits from XHR polling transport.
   */

  io.util.inherit(JSONPPolling, io.Transport['xhr-polling']);

  /**
   * Transport name
   *
   * @api public
   */

  JSONPPolling.prototype.name = 'jsonp-polling';

  /**
   * Posts a encoded message to the Socket.IO server using an iframe.
   * The iframe is used because script tags can create POST based requests.
   * The iframe is positioned outside of the view so the user does not
   * notice it's existence.
   *
   * @param {String} data A encoded message.
   * @api private
   */

  JSONPPolling.prototype.post = function (data) {
    var self = this
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (!this.form) {
      var form = document.createElement('form')
        , area = document.createElement('textarea')
        , id = this.iframeId = 'socketio_iframe_' + this.index
        , iframe;

      form.className = 'socketio';
      form.style.position = 'absolute';
      form.style.top = '0px';
      form.style.left = '0px';
      form.style.display = 'none';
      form.target = id;
      form.method = 'POST';
      form.setAttribute('accept-charset', 'utf-8');
      area.name = 'd';
      form.appendChild(area);
      document.body.appendChild(form);

      this.form = form;
      this.area = area;
    }

    this.form.action = this.prepareUrl() + query;

    function complete () {
      initIframe();
      self.socket.setBuffer(false);
    };

    function initIframe () {
      if (self.iframe) {
        self.form.removeChild(self.iframe);
      }

      try {
        // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
        iframe = document.createElement('<iframe name="'+ self.iframeId +'">');
      } catch (e) {
        iframe = document.createElement('iframe');
        iframe.name = self.iframeId;
      }

      iframe.id = self.iframeId;

      self.form.appendChild(iframe);
      self.iframe = iframe;
    };

    initIframe();

    // we temporarily stringify until we figure out how to prevent
    // browsers from turning `\n` into `\r\n` in form inputs
    this.area.value = io.JSON.stringify(data);

    try {
      this.form.submit();
    } catch(e) {}

    if (this.iframe.attachEvent) {
      iframe.onreadystatechange = function () {
        if (self.iframe.readyState == 'complete') {
          complete();
        }
      };
    } else {
      this.iframe.onload = complete;
    }

    this.socket.setBuffer(true);
  };

  /**
   * Creates a new JSONP poll that can be used to listen
   * for messages from the Socket.IO server.
   *
   * @api private
   */

  JSONPPolling.prototype.get = function () {
    var self = this
      , script = document.createElement('script')
      , query = io.util.query(
             this.socket.options.query
          , 't='+ (+new Date) + '&i=' + this.index
        );

    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }

    script.async = true;
    script.src = this.prepareUrl() + query;
    script.onerror = function () {
      self.onClose();
    };

    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(script, insertAt);
    this.script = script;

    if (indicator) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
      }, 100);
    }
  };

  /**
   * Callback function for the incoming message stream from the Socket.IO server.
   *
   * @param {String} data The message
   * @api private
   */

  JSONPPolling.prototype._ = function (msg) {
    this.onData(msg);
    if (this.isOpen) {
      this.get();
    }
    return this;
  };

  /**
   * The indicator hack only works after onload
   *
   * @param {Socket} socket The socket instance that needs a transport
   * @param {Function} fn The callback
   * @api private
   */

  JSONPPolling.prototype.ready = function (socket, fn) {
    var self = this;
    if (!indicator) return fn.call(this);

    io.util.load(function () {
      fn.call(self);
    });
  };

  /**
   * Checks if browser supports this transport.
   *
   * @return {Boolean}
   * @api public
   */

  JSONPPolling.check = function () {
    return 'document' in global;
  };

  /**
   * Check if cross domain requests are supported
   *
   * @returns {Boolean}
   * @api public
   */

  JSONPPolling.xdomainCheck = function () {
    return true;
  };

  /**
   * Add the transport to your public io.transports array.
   *
   * @api private
   */

  io.transports.push('jsonp-polling');

})(
    'undefined' != typeof io ? io.Transport : module.exports
  , 'undefined' != typeof io ? io : module.parent.exports
  , this
);

if (typeof define === "function" && define.amd) {
  define([], function () { return io; });
}
})();
},{}],12:[function(require,module,exports){
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
    var url = '{0}://{1}{2}/{3}'.format(conf.protocol || 'http', conf.host || 'localhost', conf.port == 80 ? '' : ':' + conf.port, 'www');
    var as = $.cookie('as') !== 'false';
        console.log('as', as);
    this.as = observable(as);
    this.as.subscribe(function(as) {
        console.log('as', as);
        $.cookie('as', as,{expires:365});
    }.bind(this));

    inBrowser && ko.applyBindings(this, document.body);
    this.connect(url);
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
                    console.log("log", status.obj, build, this)
                    build && build.logs.unshift(msg);
                    //console.log('log', status.obj);
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
                case 'connected':
                case 'updated':
                    var o = list.map[status.obj.id];
                    var i = list.indexOf(o);
                    i < 0 ? list.unshift(status.obj) : list[i] = status.obj;
                    list.map[status.obj.id] = o;
                    //console.log('LIST', status, list);
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
        console.log('status', status);
            
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
            if (builds[0] && !this.selectedBuild())
                this.selectedBuild(builds[0]);
        }
    },
    parseselectedBuild: function (build) {
        if (build) {
            build.qr = this.statuses[build.status] || this.generateQR('/download/' + build.id);
        }
        build.platforms && build.platforms.forEach(function (platform) {
            platform.qr = this.statuses[build.status] || this.generateQR('/download/' + build.id);
        }, this);
        this.selectedBuild(build);
    },
    generateQR: function (url, level) {
        var uri = qr.toDataURL({
            value: url,
            level: level || 'H',
            size: 10,
        });
        console.warn(uri);
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
                this.__qr = this.QR();
            }
            var qr = conf.status == 'success' ? this.__qr : ServerBrowser.prototype.statuses[conf.status || 'unkown'];
            this.qr(qr);
        }
    },
    QR: function () {
        return ServerBrowser.prototype.generateQR('http://localhost/download/' + this.id);
    }
});


},{"../../../common/Msg.js":1,"../../../common/utils.js":3,"./qtip.js":13,"elapsed":7,"knockout":10,"socket.io/node_modules/socket.io-client":11}],13:[function(require,module,exports){
!function($) {
    /* CONFIG */

    xOffset = 10;
    yOffset = 30;

    // these 2 variable determine popup's distance from the cursor
    // you might want to adjust to get the right result

    /* END CONFIG */
    $(document).on("mouseenter", ".preview", function (e) {
        var $this = $(this);
        this.t = $this.attr("title");
        if (!this.t && !rel)
            return;

        this.title = "";
        var c = (this.t != "") ? "<br/>" + this.t : "";
        var rel = $this.attr("rel");
        $("body").append(["<div id='screenshot'>", rel ? "<img src='" : "", rel, rel ? "' alt='url preview' />": "",  c, "</div>"].join(''));
        $("#screenshot")
            .css("top", (e.pageY - xOffset) + "px")
            .css("left", (e.pageX + yOffset) + "px")
            .fadeIn("fast");
    }).on("mouseleave", ".preview", function (e) {
        this.title = this.t;
        $("#screenshot").remove();
    }).on("mousemove", ".preview", function (e) {
        $("#screenshot")
            .css("top", (e.pageY - xOffset) + "px")
            .css("left", (e.pageX + yOffset) + "px");
    });	
}(jQuery);

},{}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGxhdVxcQXBwRGF0YVxcUm9hbWluZ1xcbnBtXFxub2RlX21vZHVsZXNcXHdhdGNoaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImQ6L1dvcmsvRG90TmV0V2lzZS9OdWdnZXRzL2NvcmRvdmEtYnVpbGQvY29tbW9uL01zZy5qcyIsImQ6L1dvcmsvRG90TmV0V2lzZS9OdWdnZXRzL2NvcmRvdmEtYnVpbGQvY29tbW9uL3BhdGNoLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9jb21tb24vdXRpbHMuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9FbGFwc2VkL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvYXJyYXktc3VnYXIvYXJyYXktc3VnYXIuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9kYXRlLWZvcm1hdC1saXRlL2RhdGUtZm9ybWF0LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvZmFzdC1jbGFzcy9GYXN0Q2xhc3MuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9rbm9ja291dC9idWlsZC9vdXRwdXQva25vY2tvdXQtbGF0ZXN0LmRlYnVnLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvc29ja2V0LmlvL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2Rpc3Qvc29ja2V0LmlvLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9zZXJ2ZXIvcHVibGljL2pzL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9zZXJ2ZXIvcHVibGljL2pzL3F0aXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoeUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBNc2c7XHJcbnJlcXVpcmUoJy4vdXRpbHMnKTtcclxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xyXG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcclxudmFyIHNwbGljZSA9IEFycmF5LnByb3RvdHlwZS5zcGxpY2U7XHJcbmZ1bmN0aW9uIE1zZyhidWlsZCkge1xyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgIGV4dGVuZCh0aGlzLCBidWlsZCk7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5kYXRlICYmIG5ldyBEYXRlKHRoaXMuZGF0ZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGFyZ3VtZW50cy5sZW5ndGggJiYgdGhpcy51cGRhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH1cclxufVxyXG5Nc2cuZGVmaW5lKHtcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYnVpbGQsIHNlbmRlciwgYnksIHByaW9yaXR5LCBtZXNzYWdlLCBhcmdzKSB7XHJcbiAgICAgICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5O1xyXG4gICAgICAgIHRoaXMuYnVpbGRJZCA9IGJ1aWxkICYmIGJ1aWxkLmlkIHx8IGJ1aWxkO1xyXG4gICAgICAgIHRoaXMuc2VuZGVySWQgPSBzZW5kZXIgJiYgc2VuZGVyLmlkIHx8IHNlbmRlcjtcclxuICAgICAgICB0aGlzLmJ5ID0gYnk7XHJcbiAgICAgICAgdmFyIG1zZyA9IG1lc3NhZ2U7XHJcbiAgICAgICAgc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCA1LCB0aGlzLnNlbmRlcklkLCB0aGlzLmJ1aWxkSWQpO1xyXG5cclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSAnJy5mb3JtYXQuYXBwbHkobXNnIHx8ICcnLCBhcmd1bWVudHMpO1xyXG4gICAgfSxcclxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbihkb05vdEluY2x1ZGVQcmVmaXgpIHtcclxuICAgICAgICB2YXIgYnksIG1zZztcclxuICAgICAgICBzd2l0Y2godGhpcy5ieSl7XHJcbiAgICAgICAgICAgIGNhc2UgJ0EnOiBieSA9ICdbU0FdIFNlcnZlcic7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdBVyc6IGJ5ID0gJ1tBV10gQWdlbnQnOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnQyc6IGJ5ID0gJ1tTQ10gU2VydmVyJzsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0NXJzogYnkgPSAnW0NXXSBDbGllbnQnOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnUyc6IGJ5ID0gJ1tTXSBTZXJ2ZXInOyBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRvTm90SW5jbHVkZVByZWZpeCB8fCB0aGlzLnByaW9yaXR5ID09IE1zZy5idWlsZF9vdXRwdXQgJiYgZG9Ob3RJbmNsdWRlUHJlZml4ICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBtc2cgPSB0aGlzLm1lc3NhZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgeyAgICAgICAgXHJcbiAgICAgICAgICAgIG1zZyA9IFtieSwgdGhpcy5zZW5kZXJJZCA/ICcgQHswfScgOiAnJywgdGhpcy5idWlsZElkID8gJyBhYm91dCAjezF9JyA6ICcnLCAnOiAnLCB0aGlzLm1lc3NhZ2VdO1xyXG4gICAgICAgICAgICBtc2cgPSBtc2cuam9pbignJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1zZyA9IG1zZy5mb3JtYXQodGhpcy5zZW5kZXJJZCwgdGhpcy5idWlsZElkKTtcclxuICAgICAgICByZXR1cm4gbXNnO1xyXG4gICAgfVxyXG59KS5kZWZpbmVTdGF0aWMoe1xyXG4gICAgZGVidWc6IDUsXHJcbiAgICBidWlsZF9vdXRwdXQ6IDQsXHJcbiAgICBpbmZvOiAzLFxyXG4gICAgd2FybmluZzogMixcclxuICAgIGVycm9yOiAxLFxyXG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlYmluZDtcclxuZnVuY3Rpb24gcmViaW5kKG9iaiwgbmFtZXMpIHtcclxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobmFtZXMsIGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIG9yaWdpbmFsID0gb2JqW25hbWVdO1xyXG4gICAgICAgIG9ialtuYW1lXSA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciwgY29udGV4dCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT0gXCJvYmplY3RcIilcclxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbC5jYWxsKHRoaXMsIHR5cGUsIGNvbnRleHQgPyBsaXN0ZW5lci5iaW5kKGNvbnRleHQpIDogbGlzdGVuZXIpO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuXHRcdFx0XHRjb250ZXh0ID0gbGlzdGVuZXI7XHJcbiAgICAgICAgICAgICAgICB2YXIgcjtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHR5cGUpLmZvckVhY2goZnVuY3Rpb24gKHR5cGVOYW1lLCBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyID0gdHlwZVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgciA9IG9yaWdpbmFsLmNhbGwodGhpcywgdHlwZU5hbWUsIGNvbnRleHQgPyBsaXN0ZW5lci5iaW5kKGNvbnRleHQpIDogbGlzdGVuZXIpO1xyXG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcblxyXG4iLCJ2YXIgbG9nID0gY29uc29sZS5sb2c7XHJcbnJlcXVpcmUoXCJkYXRlLWZvcm1hdC1saXRlXCIpO1xyXG5yZXF1aXJlKCdmYXN0LWNsYXNzJyk7XHJcbnJlcXVpcmUoJ2FycmF5LXN1Z2FyJyk7XHJcbnZhciBFbGFwc2VkID0gcmVxdWlyZSgnRWxhcHNlZCcpO1xyXG52YXIgaW9jID0gcmVxdWlyZSgnc29ja2V0LmlvL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50Jyk7XHJcbnZhciBwYXRjaCA9IHJlcXVpcmUoJy4vcGF0Y2guanMnKTtcclxucGF0Y2goaW9jLlNvY2tldC5wcm90b3R5cGUsIFtcIm9uXCIsIFwiYWRkTGlzdGVuZXJcIl0pO1xyXG5wYXRjaChpb2MuU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZSwgW1wib25cIiwgXCJhZGRMaXN0ZW5lclwiXSk7XHJcbnBhdGNoKGlvYy5FdmVudEVtaXR0ZXIucHJvdG90eXBlLCBbXCJvblwiLCBcImFkZExpc3RlbmVyXCJdKTtcclxuXHJcbkRhdGUucHJvdG90eXBlLmVsYXBzZWQgPSBmdW5jdGlvbiAodW50aWwpIHtcclxuICAgIHJldHVybiBuZXcgRWxhcHNlZCh0aGlzLCB1bnRpbCkub3B0aW1hbDtcclxufVxyXG5cclxuY29uc29sZS5sb2cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbmV3IERhdGUoKS5mb3JtYXQoXCJtbTpzcy5TU1wiKSk7XHJcbiAgICBsb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufS5iaW5kKGNvbnNvbGUpO1xyXG52YXIgY2xhc3MydHlwZSA9IFtdO1xyXG5cIkJvb2xlYW4gTnVtYmVyIFN0cmluZyBGdW5jdGlvbiBBcnJheSBEYXRlIFJlZ0V4cCBPYmplY3QgRXJyb3JcIi5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgY2xhc3MydHlwZVtcIltvYmplY3QgXCIgKyBuYW1lICsgXCJdXCJdID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xyXG59KTtcclxuXHJcbk9iamVjdC5lYWNoID0gZnVuY3Rpb24gKG9iaiwgY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIHZhciB2YWx1ZSwgaSA9IDAsXHJcbiAgICAgICAgbGVuZ3RoID0gb2JqLmxlbmd0aCxcclxuICAgICAgICB0eXBlID0galF1ZXJ5LnR5cGUob2JqKSxcclxuICAgICAgICBpc0FycmF5ID0gdHlwZSA9PT0gXCJhcnJheVwiIHx8IHR5cGUgIT09IFwiZnVuY3Rpb25cIiAmJiAobGVuZ3RoID09PSAwIHx8IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID4gMCAmJiAobGVuZ3RoIC0gMSkgaW4gb2JqKTtcclxuXHJcbiAgICBpZiAoY29udGV4dCkge1xyXG4gICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKGNhbGxiYWNrLCBjb250ZXh0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQSBzcGVjaWFsLCBmYXN0LCBjYXNlIGZvciB0aGUgbW9zdCBjb21tb24gdXNlIG9mIGVhY2hcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgb2JqLmZvckVhY2goY2FsbGJhY2ssIG9iaik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKG9iaiwgaSwgb2JqW2ldLCBpLCBvYmopO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb2JqO1xyXG59XHJcbk9iamVjdC5ldmVyeSA9IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgdmFsdWUsIGkgPSAwLFxyXG4gICAgICAgIGxlbmd0aCA9IG9iai5sZW5ndGgsXHJcbiAgICAgICAgdHlwZSA9IG9iaiA9PT0gbnVsbCA/IFN0cmluZyhvYmopIDogdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgPyBjbGFzczJ0eXBlW2NsYXNzMnR5cGUudG9TdHJpbmcuY2FsbChvYmopXSB8fCBcIm9iamVjdFwiIDogdHlwZW9mIG9iaixcclxuICAgICAgICBpc0FycmF5ID0gdHlwZSA9PT0gXCJhcnJheVwiIHx8IHR5cGUgIT09IFwiZnVuY3Rpb25cIiAmJiAobGVuZ3RoID09PSAwIHx8IHR5cGVvZiBsZW5ndGggPT09IFwibnVtYmVyXCIgJiYgbGVuZ3RoID4gMCAmJiAobGVuZ3RoIC0gMSkgaW4gb2JqKTtcclxuXHJcbiAgICBpZiAoY29udGV4dCkge1xyXG4gICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIG9iai5ldmVyeShjYWxsYmFjaywgY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBIHNwZWNpYWwsIGZhc3QsIGNhc2UgZm9yIHRoZSBtb3N0IGNvbW1vbiB1c2Ugb2YgZWFjaFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICBvYmouZXZlcnkoY2FsbGJhY2ssIG9iaik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKG9iaiwgaSwgb2JqW2ldLCBpLCBvYmopO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxudmFyIFRZUEVfTUFQID0ge1xyXG4gICAgJ29iamVjdCc6IDEsXHJcbiAgICAnZnVuY3Rpb24nOiAxXHJcbn1cclxuQXJyYXkucHJvdG90eXBlLnVuaXF1ZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBtYXAgPSB7fSxcclxuICAgICAgICAgICAgb2JqZWN0cyA9IFtdLFxyXG4gICAgICAgICAgICB1bmlxdWUgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gdGhpc1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChUWVBFX01BUFt0eXBlb2YgdmFsXSAmJiB2YWwpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsLl9fdW5pcXVlX18pIHtcclxuICAgICAgICAgICAgICAgICAgICB1bmlxdWUucHVzaCh2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdHMucHVzaCh2YWwpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbC5fX3VuaXF1ZV9fID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghbWFwW3ZhbF0pIHtcclxuICAgICAgICAgICAgICAgIHVuaXF1ZS5wdXNoKHZhbCk7XHJcbiAgICAgICAgICAgICAgICBtYXBbdmFsXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoaSA9IG9iamVjdHMubGVuZ3RoOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBvYmplY3RzW2ldLl9fdW5pcXVlX187XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdW5pcXVlO1xyXG4gICAgfTtcclxufSkoKTsiLCJmdW5jdGlvbiBFbGFwc2VkIChmcm9tLCB0bykge1xuXHR0aGlzLmZyb20gPSBmcm9tO1xuXHR0aGlzLnRvID0gdG8gfHwgbmV3IERhdGUoKTtcblx0aWYgKCEodGhpcy5mcm9tIGluc3RhbmNlb2YgRGF0ZSAmJiB0aGlzLnRvIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybjtcblxuXHR0aGlzLnNldCgpO1xufVxuXG5FbGFwc2VkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbigpIHtcblx0dGhpcy5lbGFwc2VkVGltZSA9IHRoaXMudG8gLSB0aGlzLmZyb207XG5cblx0dGhpcy5taWxsaVNlY29uZHMgPSB0aGlzLmVsYXBzZWRUaW1lO1xuXHR2YXIgZGl2aWRlciA9IDEwMDA7XG5cdHRoaXMuc2Vjb25kcyA9IHsgbnVtOiBNYXRoLmZsb29yKHRoaXMuZWxhcHNlZFRpbWUgLyBkaXZpZGVyKSB9O1xuXHRkaXZpZGVyICo9IDYwO1xuXHR0aGlzLm1pbnV0ZXMgPSB7IG51bTogTWF0aC5mbG9vcih0aGlzLmVsYXBzZWRUaW1lIC8gZGl2aWRlcikgfTtcblx0ZGl2aWRlciAqPSA2MDtcblx0dGhpcy5ob3VycyA9IHsgbnVtOiBNYXRoLmZsb29yKHRoaXMuZWxhcHNlZFRpbWUgLyBkaXZpZGVyKSB9O1xuXHRkaXZpZGVyICo9IDI0O1xuXHR0aGlzLmRheXMgPSB7IG51bTogTWF0aC5mbG9vcih0aGlzLmVsYXBzZWRUaW1lIC8gZGl2aWRlcikgfTtcblx0ZGl2aWRlciAqPSA3O1xuXHR0aGlzLndlZWtzID0geyBudW06IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIGRpdmlkZXIpIH07XG5cdGRpdmlkZXIgKj0gKDMwIC8gNyk7XG5cdHRoaXMubW9udGhzID0geyBudW06IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIGRpdmlkZXIpIH07XG5cdGRpdmlkZXIgPSBkaXZpZGVyIC8gKDMwIC8gNykgLyA3ICogMzY1O1xuXHR0aGlzLnllYXJzID0geyBudW06IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIGRpdmlkZXIpIH07XG5cblx0dGhpcy5zZWNvbmRzLnRleHQgPSB0aGlzLnNlY29uZHMubnVtICsgJyBzZWNvbmQnICsgKHRoaXMuc2Vjb25kcy5udW0gPCAyID8gJycgOiAncycpO1xuXHR0aGlzLm1pbnV0ZXMudGV4dCA9IHRoaXMubWludXRlcy5udW0gKyAnIG1pbnV0ZScgKyAodGhpcy5taW51dGVzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cdHRoaXMuaG91cnMudGV4dCA9IHRoaXMuaG91cnMubnVtICsgJyBob3VyJyArICh0aGlzLmhvdXJzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cdHRoaXMuZGF5cy50ZXh0ID0gdGhpcy5kYXlzLm51bSArICcgZGF5JyArICh0aGlzLmRheXMubnVtIDwgMiA/ICcnIDogJ3MnKTtcblx0dGhpcy53ZWVrcy50ZXh0ID0gdGhpcy53ZWVrcy5udW0gKyAnIHdlZWsnICsgKHRoaXMud2Vla3MubnVtIDwgMiA/ICcnIDogJ3MnKTtcblx0dGhpcy5tb250aHMudGV4dCA9IHRoaXMubW9udGhzLm51bSArICcgbW9udGgnICsgKHRoaXMubW9udGhzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cdHRoaXMueWVhcnMudGV4dCA9IHRoaXMueWVhcnMubnVtICsgJyB5ZWFyJyArICh0aGlzLnllYXJzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cblx0aWYgKHRoaXMueWVhcnMubnVtID4gMCkgdGhpcy5vcHRpbWFsID0gdGhpcy55ZWFycy50ZXh0O1xuXHRlbHNlIGlmICh0aGlzLm1vbnRocy5udW0gPiAwKSB0aGlzLm9wdGltYWwgPSB0aGlzLm1vbnRocy50ZXh0O1xuXHRlbHNlIGlmICh0aGlzLndlZWtzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMud2Vla3MudGV4dDtcblx0ZWxzZSBpZiAodGhpcy5kYXlzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMuZGF5cy50ZXh0O1xuXHRlbHNlIGlmICh0aGlzLmhvdXJzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMuaG91cnMudGV4dDtcblx0ZWxzZSBpZiAodGhpcy5taW51dGVzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMubWludXRlcy50ZXh0O1xuXHRlbHNlIGlmICh0aGlzLnNlY29uZHMubnVtID4gMCkgdGhpcy5vcHRpbWFsID0gdGhpcy5zZWNvbmRzLnRleHQ7XG5cblx0cmV0dXJuIHRoaXM7XG59O1xuXG5FbGFwc2VkLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24odG8pIHtcblx0aWYgKCF0bykgdGhpcy50byA9IG5ldyBEYXRlKCk7XG5cdGVsc2UgdGhpcy50byA9IHRvO1xuXHRpZiAoIXRoaXMudG8gaW5zdGFuY2VvZiBEYXRlKSByZXR1cm47XG5cblx0cmV0dXJuIHRoaXMuc2V0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsYXBzZWQ7IiwiKGZ1bmN0aW9uIChhcnIpIHtcclxuXHRmdW5jdGlvbiBpc051bWJlcihuKSB7XHJcblx0XHRyZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1x0Ly90aHggdG8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODA4Mi92YWxpZGF0ZS1udW1iZXJzLWluLWphdmFzY3JpcHQtaXNudW1lcmljXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiByZXR1cm5zIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSBsb3cgdG8gaGlnaCBpbmNsdWRpbmcgbG93IGFuZCBoaWdoXHJcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGxvd1xyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBoaWdoXHJcblx0ICogQHJldHVybnMge0FycmF5fVxyXG5cdCAqL1xyXG5cdGFyci5yYW5nZSA9IGZ1bmN0aW9uIChsb3csIGhpZ2gpIHtcclxuXHRcdHZhciByID0gW107XHJcblx0XHRpZiAoaXNOdW1iZXIobG93KSAmJiAoaXNOdW1iZXIoaGlnaCkpKSB7XHJcblx0XHRcdHdoaWxlKGhpZ2ggPj0gbG93KXtcclxuXHRcdFx0XHRyLnB1c2gobG93KTtcclxuXHRcdFx0XHRsb3crKztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHI7XHJcblx0fTtcclxuICAgIHZhciBhcnJQcm90ID0gYXJyLnByb3RvdHlwZTtcclxuXHR2YXIgcHJvcHMgPSB7XHJcbiAgICAgICAgZmlyc3Q6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc0VtcHR5KSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdHJldHVybiB0aGlzWzBdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbMF0gPSB2YWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGxhc3Q6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRpZiAodGhpcy5pc0VtcHR5KSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdHJldHVybiB0aGlzW3RoaXMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0VtcHR5OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogdW5kZWZpbmVkXHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgbWV0aG9kcyA9IHtcclxuXHRcdC8qKlxyXG5cdFx0ICogdHJhdmVyc2VzIGFycmF5IGFuZCByZXR1cm5zIGZpcnN0IGVsZW1lbnQgb24gd2hpY2ggdGVzdCBmdW5jdGlvbiByZXR1cm5zIHRydWVcclxuXHRcdCAqIEBwYXJhbSB0ZXN0XHJcblx0XHQgKiBAcGFyYW0ge0Jvb2xlYW59IGZyb21FbmQgcGFzcyB0cnVlIGlmIHlvdSB3YW50IHRvIHRyYXZlcnNlIGFycmF5IGZyb20gZW5kIHRvIGJlZ2lubmluZ1xyXG5cdFx0ICogQHJldHVybnMgeyp8bnVsbHx1bmRlZmluZWR9IGFuIGVsZW1lbnQgb2YgYW4gYXJyYXksIG9yIHVuZGVmaW5lZCB3aGVuIHBhc3NlZCBwYXJhbSBpcyBub3QgYSBmdW5jdGlvblxyXG5cdFx0ICovXHJcblx0XHRmaW5kT25lOiBmdW5jdGlvbiAodGVzdCwgZnJvbUVuZCkge1xyXG5cdFx0XHR2YXIgaTtcclxuXHRcdFx0aWYgKHR5cGVvZiB0ZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cdFx0XHRpZiAoZnJvbUVuZCkge1xyXG5cdFx0XHRcdGkgPSB0aGlzLmxlbmd0aDtcclxuXHRcdFx0XHR3aGlsZShpLS0pe1xyXG5cdFx0XHRcdFx0aWYgKHRlc3QodGhpc1tpXSwgaSwgdGhpcykpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXNbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGkgPSAwO1xyXG5cdFx0XHRcdHdoaWxlKGkgPCB0aGlzLmxlbmd0aCl7XHJcblx0XHRcdFx0XHRpZiAodGVzdCh0aGlzW2ldLCBpLCB0aGlzKSkge1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpc1tpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGkrKztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9LFxyXG5cdFx0LyoqXHJcblx0XHQgKlx0cmVwbGFjZSBtZXRob2RcclxuXHRcdCAqIEBwYXJhbSB7Kn0gdG9SZXBsYWNlXHJcblx0XHQgKiBAcGFyYW0geyp9IGl0ZW1XaXRoXHJcblx0XHQgKiBAcmV0dXJucyB7TnVtYmVyfGZhbHNlfSBpbmRleCB3aGVuIGl0ZW0gd2FzIHJlcGxhY2VkLCBmYWxzZSB3aGVuIG5vdFxyXG5cdFx0ICovXHJcblx0XHRyZXBsYWNlOiBmdW5jdGlvbiAodG9SZXBsYWNlLCBpdGVtV2l0aCkge1xyXG5cdFx0XHR2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YodG9SZXBsYWNlKTtcclxuXHRcdFx0aWYgKH5pbmRleCkge1xyXG5cdFx0XHRcdHRoaXNbaW5kZXhdID0gaXRlbVdpdGg7XHJcblx0XHRcdFx0cmV0dXJuIGluZGV4O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gdmFsXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiBpdGVtIGlzIGluIHRoZSBhcnJheVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnRhaW5zOiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluZGV4T2YodmFsKSAhPT0gLTE7XHJcbiAgICAgICAgfSxcclxuXHRcdC8qKlxyXG5cdFx0ICogU3ludGF4OlxyXG5cdFx0ICogIGFycmF5Lmluc2VydChpbmRleCwgdmFsdWUxLCB2YWx1ZTIsIC4uLiwgdmFsdWVOKVxyXG5cdFx0ICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IHdoZXJlIGl0ZW0gd2lsbCBiZSBpbnNlcnRlZCwgaWYgYmlnZ2VyIHRoYW4gbGVuZ3RoIG9mIGFuIGFycmF5LCB3aWxsIGJlIGluc2VydGVkIGF0IHRoZSBlbmQgb2YgYW4gYXJyYXksIG5vdFxyXG5cdFx0ICogQHBhcmFtIFsuLi5dIHVubGltaXRlZCBhbW91bnQgb2YgdmFsdWVzIHRvIGluc2VydFxyXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxyXG5cdFx0ICovXHJcblx0XHRpbnNlcnQ6IGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHRoaXMubGVuZ3RoKTtcclxuXHRcdFx0YXJndW1lbnRzLmxlbmd0aCA+IDFcclxuXHRcdFx0XHQmJiB0aGlzLnNwbGljZS5hcHBseSh0aGlzLCBbaW5kZXgsIDBdLmNvbmNhdChbXS5wb3AuY2FsbChhcmd1bWVudHMpKSlcclxuXHRcdFx0ICAgICYmIHRoaXMuaW5zZXJ0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHRcdHJldHVybiB0aGlzO1xyXG5cdFx0fSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBmaW5kcyBhbmQgcmVtb3ZlcyB0aGUgaXRlbSBmcm9tIGFycmF5XHJcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cclxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSB3aGVuIGl0ZW0gd2FzIHJlbW92ZWQsIGVsc2UgZmFsc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXhPZihpdGVtKTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogd2lsbCBlcmFzZSB0aGUgYXJyYXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgfSxcclxuXHRcdC8qKlxyXG4gICAgICAgICAqIHdpbGwgcmV0dXJuIGEgY29weSBvZiB0aGUgYXJyYXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb3B5OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNsaWNlKDApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZm9yKHZhciBwcm9wIGluIHByb3BzKXtcclxuICAgICAgICBpZiAoIWFyclByb3QuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyclByb3QsIHByb3AsIHtcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHNldDogcHJvcHNbcHJvcF0uc2V0LFxyXG4gICAgICAgICAgICAgICAgZ2V0OiBwcm9wc1twcm9wXS5nZXRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yKHZhciBtIGluIG1ldGhvZHMpe1xyXG4gICAgICAgIGlmICghYXJyUHJvdC5oYXNPd25Qcm9wZXJ0eShtKSkge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJyUHJvdCwgbSwge1xyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IG1ldGhvZHNbbV0sXHJcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KShBcnJheSk7IiwiXG5cblxuLypcbiogQHZlcnNpb24gIDAuNS4wXG4qIEBhdXRob3IgICBMYXVyaSBSb29kZW4gLSBodHRwczovL2dpdGh1Yi5jb20vbGl0ZWpzL2RhdGUtZm9ybWF0LWxpdGVcbiogQGxpY2Vuc2UgIE1JVCBMaWNlbnNlICAtIGh0dHA6Ly9sYXVyaS5yb29kZW4uZWUvbWl0LWxpY2Vuc2UudHh0XG4qL1xuXG5cblxuIWZ1bmN0aW9uKERhdGUsIHByb3RvKSB7XG5cdHZhciBtYXNrUmUgPSAvKFtcIiddKSgoPzpbXlxcXFxdfFxcXFwuKSo/KVxcMXxZWVlZfChbTURdKVxcM1xcMyhcXDM/KXxTU3woW1lNREhobXNXXSkoXFw1Pyl8W3VVQVpTd29dL2dcblx0LCB5ZWFyRmlyc3RSZSA9IC8oXFxkezR9KVstLlxcL10oXFxkXFxkPylbLS5cXC9dKFxcZFxcZD8pL1xuXHQsIGRhdGVGaXJzdFJlID0gLyhcXGRcXGQ/KVstLlxcL10oXFxkXFxkPylbLS5cXC9dKFxcZHs0fSkvXG5cdCwgdGltZVJlID0gLyhcXGRcXGQ/KTooXFxkXFxkKTo/KFxcZFxcZCk/XFwuPyhcXGR7M30pPyg/OlxccyooPzooYSl8KHApKVxcLj9tXFwuPyk/KFxccyooPzpafEdNVHxVVEMpPyg/OihbLStdXFxkXFxkKTo/KFxcZFxcZCk/KT8pPy9pXG5cdCwgd29yZFJlID0gLy5bYS16XSsvZ1xuXHQsIHVuZXNjYXBlUmUgPSAvXFxcXCguKS9nXG5cdC8vLCBpc29EYXRlUmUgPSAvKFxcZHs0fSlbLS5cXC9dVyhcXGRcXGQ/KVstLlxcL10oXFxkKS9cblx0XG5cblx0Ly8gSVNPIDg2MDEgc3BlY2lmaWVzIG51bWVyaWMgcmVwcmVzZW50YXRpb25zIG9mIGRhdGUgYW5kIHRpbWUuXG5cdC8vXG5cdC8vIFRoZSBpbnRlcm5hdGlvbmFsIHN0YW5kYXJkIGRhdGUgbm90YXRpb24gaXNcblx0Ly8gWVlZWS1NTS1ERFxuXHQvL1xuXHQvLyBUaGUgaW50ZXJuYXRpb25hbCBzdGFuZGFyZCBub3RhdGlvbiBmb3IgdGhlIHRpbWUgb2YgZGF5IGlzXG5cdC8vIGhoOm1tOnNzXG5cdC8vXG5cdC8vIFRpbWUgem9uZVxuXHQvL1xuXHQvLyBUaGUgc3RyaW5ncyAraGg6bW0sICtoaG1tLCBvciAraGggKGFoZWFkIG9mIFVUQylcblx0Ly8gLWhoOm1tLCAtaGhtbSwgb3IgLWhoICh0aW1lIHpvbmVzIHdlc3Qgb2YgdGhlIHplcm8gbWVyaWRpYW4sIHdoaWNoIGFyZSBiZWhpbmQgVVRDKVxuXHQvL1xuXHQvLyAxMjowMFogPSAxMzowMCswMTowMCA9IDA3MDAtMDUwMFxuXHRcblx0RGF0ZVtwcm90b10uZm9ybWF0ID0gZnVuY3Rpb24obWFzaykge1xuXHRcdG1hc2sgPSBEYXRlLm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgRGF0ZS5tYXNrc1tcImRlZmF1bHRcIl1cblxuXHRcdHZhciBzZWxmID0gdGhpc1xuXHRcdCwgZ2V0ID0gXCJnZXRcIiArIChtYXNrLnNsaWNlKDAsNCkgPT0gXCJVVEM6XCIgPyAobWFzaz1tYXNrLnNsaWNlKDQpLCBcIlVUQ1wiKTpcIlwiKVxuXG5cdFx0cmV0dXJuIG1hc2sucmVwbGFjZShtYXNrUmUsIGZ1bmN0aW9uKG1hdGNoLCBxdW90ZSwgdGV4dCwgTUQsIE1ENCwgc2luZ2xlLCBwYWQpIHtcblx0XHRcdHRleHQgPSBzaW5nbGUgPT0gXCJZXCIgICA/IHNlbGZbZ2V0ICsgXCJGdWxsWWVhclwiXSgpICUgMTAwXG5cdFx0XHRcdCA6IG1hdGNoID09IFwiWVlZWVwiID8gc2VsZltnZXQgKyBcIkZ1bGxZZWFyXCJdKClcblx0XHRcdFx0IDogc2luZ2xlID09IFwiTVwiICAgPyBzZWxmW2dldCArIFwiTW9udGhcIl0oKSsxXG5cdFx0XHRcdCA6IE1EICAgICA9PSBcIk1cIiA/IERhdGUubW9udGhOYW1lc1sgc2VsZltnZXQgKyBcIk1vbnRoXCJdKCkrKE1ENCA/IDEyIDogMCkgXVxuXHRcdFx0XHQgOiBzaW5nbGUgPT0gXCJEXCIgICA/IHNlbGZbZ2V0ICsgXCJEYXRlXCJdKClcblx0XHRcdFx0IDogTUQgICAgID09IFwiRFwiID8gRGF0ZS5kYXlOYW1lc1sgc2VsZltnZXQgKyBcIkRheVwiXSgpICsgKE1ENCA/IDc6MCApIF1cblx0XHRcdFx0IDogc2luZ2xlID09IFwiSFwiICAgPyBzZWxmW2dldCArIFwiSG91cnNcIl0oKSAlIDEyIHx8IDEyXG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcImhcIiAgID8gc2VsZltnZXQgKyBcIkhvdXJzXCJdKClcblx0XHRcdFx0IDogc2luZ2xlID09IFwibVwiICAgPyBzZWxmW2dldCArIFwiTWludXRlc1wiXSgpXG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcInNcIiAgID8gc2VsZltnZXQgKyBcIlNlY29uZHNcIl0oKVxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIlNcIiAgICA/IHNlbGZbZ2V0ICsgXCJNaWxsaXNlY29uZHNcIl0oKVxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIlNTXCIgICA/IChxdW90ZSA9IHNlbGZbZ2V0ICsgXCJNaWxsaXNlY29uZHNcIl0oKSwgcXVvdGUgPiA5OSA/IHF1b3RlIDogKHF1b3RlID4gOSA/IFwiMFwiIDogXCIwMFwiICkgKyBxdW90ZSlcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJ1XCIgICAgPyAoc2VsZi8xMDAwKT4+PjBcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJVXCIgICAgPyArc2VsZlxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIkFcIiAgICA/IERhdGVbc2VsZltnZXQgKyBcIkhvdXJzXCJdKCkgPiAxMSA/IFwicG1cIiA6IFwiYW1cIl1cblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJaXCIgICAgPyBcIkdNVCBcIiArICgtc2VsZi5nZXRUaW1lem9uZU9mZnNldCgpLzYwKVxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIndcIiAgICA/IHNlbGZbZ2V0ICsgXCJEYXlcIl0oKSB8fCA3XG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcIldcIiAgID8gKHF1b3RlID0gbmV3IERhdGUoK3NlbGYgKyAoKDQgLSAoc2VsZltnZXQgKyBcIkRheVwiXSgpfHw3KSkgKiA4NjQwMDAwMCkpLCBNYXRoLmNlaWwoKChxdW90ZS5nZXRUaW1lKCktcXVvdGVbXCJzXCIgKyBnZXQuc2xpY2UoMSkgKyBcIk1vbnRoXCJdKDAsMSkpIC8gODY0MDAwMDAgKyAxICkgLyA3KSApXG5cdFx0XHRcdCA6IG1hdGNoID09IFwib1wiICAgID8gbmV3IERhdGUoK3NlbGYgKyAoKDQgLSAoc2VsZltnZXQgKyBcIkRheVwiXSgpfHw3KSkgKiA4NjQwMDAwMCkpW2dldCArIFwiRnVsbFllYXJcIl0oKVxuXHRcdFx0XHQgOiBxdW90ZSAgICAgICAgICAgPyB0ZXh0LnJlcGxhY2UodW5lc2NhcGVSZSwgXCIkMVwiKVxuXHRcdFx0XHQgOiBtYXRjaFxuXHRcdFx0cmV0dXJuIHBhZCAmJiB0ZXh0IDwgMTAgPyBcIjBcIit0ZXh0IDogdGV4dFxuXHRcdH0pXG5cdH1cblxuXHREYXRlLmFtID0gXCJBTVwiXG5cdERhdGUucG0gPSBcIlBNXCJcblxuXHREYXRlLm1hc2tzID0ge1wiZGVmYXVsdFwiOlwiREREIE1NTSBERCBZWVlZIGhoOm1tOnNzXCIsXCJpc29VdGNEYXRlVGltZVwiOidVVEM6WVlZWS1NTS1ERFwiVFwiaGg6bW06c3NcIlpcIid9XG5cdERhdGUubW9udGhOYW1lcyA9IFwiSmFuRmViTWFyQXByTWF5SnVuSnVsQXVnU2VwT2N0Tm92RGVjSmFudWFyeUZlYnJ1YXJ5TWFyY2hBcHJpbE1heUp1bmVKdWx5QXVndXN0U2VwdGVtYmVyT2N0b2Jlck5vdmVtYmVyRGVjZW1iZXJcIi5tYXRjaCh3b3JkUmUpXG5cdERhdGUuZGF5TmFtZXMgPSBcIlN1bk1vblR1ZVdlZFRodUZyaVNhdFN1bmRheU1vbmRheVR1ZXNkYXlXZWRuZXNkYXlUaHVyc2RheUZyaWRheVNhdHVyZGF5XCIubWF0Y2god29yZFJlKVxuXG5cdC8vKi9cblxuXG5cdC8qXG5cdCogLy8gSW4gQ2hyb21lIERhdGUucGFyc2UoXCIwMS4wMi4yMDAxXCIpIGlzIEphblxuXHQqIG4gPSArc2VsZiB8fCBEYXRlLnBhcnNlKHNlbGYpIHx8IFwiXCIrc2VsZjtcblx0Ki9cblxuXHRTdHJpbmdbcHJvdG9dLmRhdGUgPSBOdW1iZXJbcHJvdG9dLmRhdGUgPSBmdW5jdGlvbihmb3JtYXQpIHtcblx0XHR2YXIgbSwgdGVtcFxuXHRcdCwgZCA9IG5ldyBEYXRlXG5cdFx0LCBuID0gK3RoaXMgfHwgXCJcIit0aGlzXG5cblx0XHRpZiAoaXNOYU4obikpIHtcblx0XHRcdC8vIEJpZyBlbmRpYW4gZGF0ZSwgc3RhcnRpbmcgd2l0aCB0aGUgeWVhciwgZWcuIDIwMTEtMDEtMzFcblx0XHRcdGlmIChtID0gbi5tYXRjaCh5ZWFyRmlyc3RSZSkpIGQuc2V0RnVsbFllYXIobVsxXSwgbVsyXS0xLCBtWzNdKVxuXG5cdFx0XHRlbHNlIGlmIChtID0gbi5tYXRjaChkYXRlRmlyc3RSZSkpIHtcblx0XHRcdFx0Ly8gTWlkZGxlIGVuZGlhbiBkYXRlLCBzdGFydGluZyB3aXRoIHRoZSBtb250aCwgZWcuIDAxLzMxLzIwMTFcblx0XHRcdFx0Ly8gTGl0dGxlIGVuZGlhbiBkYXRlLCBzdGFydGluZyB3aXRoIHRoZSBkYXksIGVnLiAzMS4wMS4yMDExXG5cdFx0XHRcdHRlbXAgPSBEYXRlLm1pZGRsZV9lbmRpYW4gPyAxIDogMlxuXHRcdFx0XHRkLnNldEZ1bGxZZWFyKG1bM10sIG1bdGVtcF0tMSwgbVszLXRlbXBdKVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaW1lXG5cdFx0XHRtID0gbi5tYXRjaCh0aW1lUmUpIHx8IFswLCAwLCAwXVxuXHRcdFx0ZC5zZXRIb3VycyggbVs2XSAmJiBtWzFdIDwgMTIgPyArbVsxXSsxMiA6IG1bNV0gJiYgbVsxXSA9PSAxMiA/IDAgOiBtWzFdLCBtWzJdLCBtWzNdfDAsIG1bNF18MClcblx0XHRcdC8vIFRpbWV6b25lXG5cdFx0XHRpZiAobVs3XSkge1xuXHRcdFx0XHRkLnNldFRpbWUoZC0oKGQuZ2V0VGltZXpvbmVPZmZzZXQoKSArIChtWzhdfDApKjYwICsgKChtWzhdPDA/LTE6MSkqKG1bOV18MCkpKSo2MDAwMCkpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGQuc2V0VGltZSggbiA8IDQyOTQ5NjcyOTYgPyBuICogMTAwMCA6IG4gKVxuXHRcdHJldHVybiBmb3JtYXQgPyBkLmZvcm1hdChmb3JtYXQpIDogZFxuXHR9XG5cbn0oRGF0ZSwgXCJwcm90b3R5cGVcIilcblxuXG5cblxuIiwidmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0cmluZy5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IG9iai5ub2RlVHlwZSB8fCBvYmouc2V0SW50ZXJ2YWwpXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdHZhciBoYXNfb3duX2NvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QgPSBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc19vd25fY29uc3RydWN0b3IgJiYgIWhhc19pc19wcm9wZXJ0eV9vZl9tZXRob2QpXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yICgga2V5IGluIG9iaiApIHt9XG5cblx0cmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkIHx8IGhhc093bi5jYWxsKCBvYmosIGtleSApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0ICAgIHRhcmdldCA9IGFyZ3VtZW50c1swXSB8fCB7fSxcblx0ICAgIGkgPSAxLFxuXHQgICAgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0ICAgIGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICggdHlwZW9mIHRhcmdldCA9PT0gXCJib29sZWFuXCIgKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGNhc2Ugd2hlbiB0YXJnZXQgaXMgYSBzdHJpbmcgb3Igc29tZXRoaW5nIChwb3NzaWJsZSBpbiBkZWVwIGNvcHkpXG5cdGlmICggdHlwZW9mIHRhcmdldCAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdGFyZ2V0ICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoIDsgaSA8IGxlbmd0aDsgaSsrICkge1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAoIChvcHRpb25zID0gYXJndW1lbnRzWyBpIF0pICE9IG51bGwgKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKCBuYW1lIGluIG9wdGlvbnMgKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFsgbmFtZSBdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1sgbmFtZSBdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKCB0YXJnZXQgPT09IGNvcHkgKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBhcnJheXNcblx0XHRcdFx0aWYgKCBkZWVwICYmIGNvcHkgJiYgKCBpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoY29weSkpICkgKSB7XG5cdFx0XHRcdFx0aWYgKCBjb3B5SXNBcnJheSApIHtcblx0XHRcdFx0XHRcdGNvcHlJc0FycmF5ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBBcnJheS5pc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHR0YXJnZXRbIG5hbWUgXSA9IGV4dGVuZCggZGVlcCwgY2xvbmUsIGNvcHkgKTtcblxuXHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdH0gZWxzZSBpZiAoIGNvcHkgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHR0YXJnZXRbIG5hbWUgXSA9IGNvcHk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbu+7vy8vLy9Gb3IgcGVyZm9ybWFuY2UgdGVzdHMgcGxlYXNlIHNlZTogaHR0cDovL2pzcGVyZi5jb20vanMtaW5oZXJpdGFuY2UtcGVyZm9ybWFuY2UvMzQgKyBodHRwOi8vanNwZXJmLmNvbS9qcy1pbmhlcml0YW5jZS1wZXJmb3JtYW5jZS8zNSArIGh0dHA6Ly9qc3BlcmYuY29tL2pzLWluaGVyaXRhbmNlLXBlcmZvcm1hbmNlLzM2XHJcblxyXG4oZnVuY3Rpb24gc2VsZkNhbGwoKSB7XHJcblx0dmFyIGlzTm9kZSA9IHR5cGVvZiBnbG9iYWwgIT0gXCJ1bmRlZmluZWRcIjtcclxuXHRpZiAoIVN0cmluZy5wcm90b3R5cGUuZm9ybWF0KSB7XHJcblx0XHR2YXIgcmVnZXhlcyA9IHt9O1xyXG5cdFx0U3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiBmb3JtYXQocGFyYW1ldGVycykge1xyXG5cdFx0XHQvLy8gPHN1bW1hcnk+RXF1aXZhbGVudCB0byBDIyBTdHJpbmcuRm9ybWF0IGZ1bmN0aW9uPC9zdW1tYXJ5PlxyXG5cdFx0XHQvLy8gPHBhcmFtIG5hbWU9XCJwYXJhbWV0ZXJzXCIgdHlwZT1cIk9iamVjdFwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlByb3ZpZGUgdGhlIG1hdGNoaW5nIGFyZ3VtZW50cyBmb3IgdGhlIGZvcm1hdCBpLmUgezB9LCB7MX0gZXRjLjwvcGFyYW0+XHJcblxyXG5cdFx0XHRmb3IgKHZhciBmb3JtYXRNZXNzYWdlID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cywgaSA9IGFyZ3MubGVuZ3RoOyAtLWkgPj0gMDspXHJcblx0XHRcdFx0Zm9ybWF0TWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2UucmVwbGFjZShyZWdleGVzW2ldIHx8IChyZWdleGVzW2ldID0gUmVnRXhwKFwiXFxcXHtcIiArIChpKSArIFwiXFxcXH1cIiwgXCJnbVwiKSksIGFyZ3NbaV0pO1xyXG5cdFx0XHRyZXR1cm4gZm9ybWF0TWVzc2FnZTtcclxuXHRcdH07XHJcblx0XHRpZiAoIVN0cmluZy5mb3JtYXQpIHtcclxuXHRcdFx0U3RyaW5nLmZvcm1hdCA9IGZ1bmN0aW9uIGZvcm1hdChmb3JtYXRNZXNzYWdlLCBwYXJhbXMpIHtcclxuXHRcdFx0XHQvLy8gPHN1bW1hcnk+RXF1aXZhbGVudCB0byBDIyBTdHJpbmcuRm9ybWF0IGZ1bmN0aW9uPC9zdW1tYXJ5PlxyXG5cdFx0XHRcdC8vLyA8cGFyYW0gbmFtZT1cImZvcm1hdE1lc3NhZ2VcIiB0eXBlPVwic3RyaW5nXCI+VGhlIG1lc3NhZ2UgdG8gYmUgZm9ybWF0dGVkLiBJdCBzaG91bGQgY29udGFpbiB7MH0sIHsxfSBldGMuIGZvciBhbGwgdGhlIGdpdmVuIHBhcmFtczwvcGFyYW0+XHJcblx0XHRcdFx0Ly8vIDxwYXJhbSBuYW1lPVwicGFyYW1zXCIgdHlwZT1cIk9iamVjdFwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlByb3ZpZGUgdGhlIG1hdGNoaW5nIGFyZ3VtZW50cyBmb3IgdGhlIGZvcm1hdCBpLmUgezB9LCB7MX0gZXRjLjwvcGFyYW0+XHJcblx0XHRcdFx0Zm9yICh2YXIgYXJncyA9IGFyZ3VtZW50cywgaSA9IGFyZ3MubGVuZ3RoOyAtLWk7KVxyXG5cdFx0XHRcdFx0Zm9ybWF0TWVzc2FnZSA9IGZvcm1hdE1lc3NhZ2UucmVwbGFjZShyZWdleGVzW2kgLSAxXSB8fCAocmVnZXhlc1tpIC0gMV0gPSBSZWdFeHAoXCJcXFxce1wiICsgKGkgLSAxKSArIFwiXFxcXH1cIiwgXCJnbVwiKSksIGFyZ3NbaV0pO1xyXG5cdFx0XHRcdHJldHVybiBmb3JtYXRNZXNzYWdlO1xyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvLy8jREVCVUdcclxuXHRpZiAodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiKVxyXG5cdFx0d2luZG93LldBc3NlcnQgPSBXQXNzZXJ0O1xyXG5cdGZ1bmN0aW9uIFdBc3NlcnQodHJ1ZWlzaENvbmRpdGlvbiwgbWVzc2FnZSwgYXJnMSwgYXJnMiwgYXJnRXRjKSB7XHJcblx0XHQvLy8gPHN1bW1hcnk+UmV0dXJucyBhbiBgYXNzZXJ0IGZ1bmN0aW9uYCBpZiB0aGUgY29uZGl0aW9uIGlzIGZhbHNlIGFuIGEgYG5vb3AgZnVuY3Rpb25gIChhIGZ1bmN0aW9uIHdoaWNoIGRvZXMgbm90aGluZykgaWYgdGhlIGNvbmRpdGlvbiBpcyB0cnVlLiA8YnIvPlxyXG5cdFx0Ly8vICBXQXNzZXJ0cyB3aWxsIG5vdCBiZSBpbmNsdWRlZCBpbiBwcm9kdWN0aW9uIGNvZGUgaW4gYW55d2F5cywgaGVuY2UgdGhlIG1pbmlmaWVyIHdpbGwgcmVtb3ZlIGFsbCB0aGUgV0Fzc2VydCBjYWxsczxici8+PGJyLz5cclxuXHRcdC8vLyAgWW91IGFsd2F5cyBuZWVkIHRvIGNhbGwgdGhlIFdBc3NlcnQgZnVuY3Rpb24gdHdpY2Ugc2luY2UgdGhlIGZpcnN0IGNhbGwgYWx3YXlzIHJldHVybnMgYSBmdW5jdGlvbiBpLmUuIFdBc3NlcnQoZmFsc2UsIFwiezB9IGZhaWxlZFwiLCBcIkNvbmRpdGlvblwiKSgpXHJcblx0XHQvLy8gPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwidHJ1ZWlzaENvbmRpdGlvblwiIHR5cGU9XCJCb29sZWFuXCI+VGhlIGNvbmRpdGlvbiB0byBiZSB0ZXN0ZWQuIEl0IHNob3VsZCBiZSB0cnVlIHNvIG5vdGhpbmcgaGFwcGVucywgb3IgZmFsc2UgdG8gYXNzZXJ0IHRoZSBlcnJvciBtZXNzYWdlPC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIiB0eXBlPVwiU3RyaW5nIHx8IEZ1bmN0aW9uXCI+VGhlIG1lc3NhZ2UgdG8gYmUgYXNzZXJ0ZWQuIElmIHBhc3NlZCBhIGZ1bmN0aW9uIGl0IHdpbGwgYmUgZXZhbHVhdGVkIGFsbCB0aGUgdGltZXMsIHJlZ2FyZGxlc3Mgb2YgdGhlIGNvbmRpdGlvbjwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJhcmcxXCIgdHlwZT1cIk9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiPkZpcnN0IGFyZ3VtZW50IHRvIHJlcGxhY2UgYWxsIG9mIHRoZSB7MH0gb2NjdXJlbmNlcyBmcm9tIHRoZSBtZXNzYWdlPC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImFyZzJcIiB0eXBlPVwiT2JqZWN0XCIgb3B0aW9uYWw9XCJ0cnVlXCI+U2Vjb25kIGFyZ3VtZW50IHRvIHJlcGxhY2UgYWxsIG9mIHRoZSB7MX0gb2NjdXJlbmNlcyBmcm9tIHRoZSBtZXNzYWdlPC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImFyZ0V0Y1wiIHR5cGU9XCJPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5UaGlyZCBhcmd1bWVudCB0byByZXBsYWNlIGFsbCBvZiB0aGUgezN9IG9jY3VyZW5jZXMgZnJvbSB0aGUgbWVzc2FnZS48YnIvPiBZb3UgY2FuIGFkZCBhcyBtYW55IGFyZ3VtZW50cyBhcyB5b3Ugd2FudCBhbmQgdGhleSB3aWxsIGJlIHJlcGxhY2VkIGFjY29yZGluZ2x5PC9wYXJhbT5cclxuXHRcdGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IFwiXCI7XHJcblx0XHRpZiAodHlwZW9mIHRydWVpc2hDb25kaXRpb24gPT09IFwiZnVuY3Rpb25cIiA/ICF0cnVlaXNoQ29uZGl0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiAhdHJ1ZWlzaENvbmRpdGlvbikge1xyXG5cdFx0XHR2YXIgcGFyYW1ldGVycyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XHJcblx0XHRcdHZhciBtc2cgPSB0eXBlb2YgbWVzc2FnZSA9PSBcInN0cmluZ1wiID8gU3RyaW5nLmZvcm1hdC5hcHBseShtZXNzYWdlLCBwYXJhbWV0ZXJzKSA6IG1lc3NhZ2U7XHJcblx0XHRcdHJldHVybiB0eXBlb2YgY29uc29sZSAhPSBcInVuZGVmaW5lZFwiICYmICFjb25zb2xlLl9fdGhyb3dFcnJvck9uQXNzZXJ0ICYmIGNvbnNvbGUuYXNzZXJ0ICYmIGNvbnNvbGUuYXNzZXJ0LmJpbmQgJiYgY29uc29sZS5hc3NlcnQuYmluZChjb25zb2xlLCB0cnVlaXNoQ29uZGl0aW9uLCBtc2cpIHx8IGZ1bmN0aW9uIGNvbnNvbGVBc3NlcnRUaHJvdygpIHsgdGhyb3cgbXNnOyB9O1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIF9fO1xyXG5cdH07XHJcblx0Ly8vI0VORERFQlVHXHJcblxyXG5cdHZhciBGdW5jdGlvbl9wcm90b3R5cGUgPSBGdW5jdGlvbi5wcm90b3R5cGU7XHJcblx0dmFyIEFycmF5X3Byb3RvdHlwZSA9IEFycmF5LnByb3RvdHlwZTtcclxuXHR2YXIgQXJyYXlfcHJvdG90eXBlX2ZvckVhY2ggPSBBcnJheV9wcm90b3R5cGUuZm9yRWFjaDtcclxuXHR2YXIgT2JqZWN0X2RlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xyXG5cdHZhciBPYmplY3RfZGVmaW5lUHJvcGVydGllcyA9IHR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA9PT0gXCJmdW5jdGlvblwiXHJcblx0dmFyIHN1cHBvcnRzUHJvdG8gPSB7fTtcclxuXHJcblx0c3VwcG9ydHNQcm90byA9IHN1cHBvcnRzUHJvdG8uX19wcm90b19fID09PSBPYmplY3QucHJvdG90eXBlO1xyXG5cdGlmIChzdXBwb3J0c1Byb3RvKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRzdXBwb3J0c1Byb3RvID0ge307XHJcblx0XHRcdHN1cHBvcnRzUHJvdG8uX19wcm90b19fID0geyBPYmplY3Q6IDEgfTtcclxuXHRcdFx0c3VwcG9ydHNQcm90byA9IHN1cHBvcnRzUHJvdG8uT2JqZWN0ID09PSAxOy8vc2V0dGluZyBfX3Byb3RvX18gaW4gZmlyZWZveCBpcyB0ZXJyaWJseSBzbG93IVxyXG5cdFx0fSBjYXRjaCAoZXgpIHsgc3VwcG9ydHNQcm90byA9IGZhbHNlOyB9XHJcblx0fVxyXG5cdC8qIElFOCBhbmQgb2xkZXIgaGFjayEgKi9cclxuXHRpZiAodHlwZW9mIE9iamVjdC5nZXRQcm90b3R5cGVPZiAhPT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0T2JqZWN0LmdldFByb3RvdHlwZU9mID0gc3VwcG9ydHNQcm90b1xyXG5cdFx0XHQ/IGZ1bmN0aW9uIGdldF9fcHJvdG9fXyhvYmplY3QpIHtcclxuXHRcdFx0XHRyZXR1cm4gb2JqZWN0Ll9fcHJvdG9fXztcclxuXHRcdFx0fVxyXG5cdFx0XHQ6IGZ1bmN0aW9uIGdldENvbnN0cnVjdG9ySGFjayhvYmplY3QpIHtcclxuXHRcdFx0XHQvLyBNYXkgYnJlYWsgaWYgdGhlIGNvbnN0cnVjdG9yIGhhcyBiZWVuIHRhbXBlcmVkIHdpdGhcclxuXHRcdFx0XHRyZXR1cm4gb2JqZWN0ID09IG51bGwgfHwgIW9iamVjdC5jb25zdHJ1Y3RvciB8fCBvYmplY3QgPT09IE9iamVjdC5wcm90b3R5cGUgPyBudWxsIDpcclxuXHRcdFx0XHRcdChvYmplY3QuY29uc3RydWN0b3IucHJvdG90eXBlID09PSBvYmplY3QgP1xyXG5cdFx0XHRcdFx0T2JqZWN0LnByb3RvdHlwZVxyXG5cdFx0XHRcdFx0OiBvYmplY3QuY29uc3RydWN0b3IucHJvdG90eXBlKTtcclxuXHRcdFx0fTtcclxuXHRmdW5jdGlvbiBfXygpIHsgfTtcclxuXHQvL2ZvciBhbmNpZW50IGJyb3dzZXJzIC0gcG9seWZpbGwgQXJyYXkucHJvdG90eXBlLmZvckVhY2hcclxuXHRpZiAoIUFycmF5X3Byb3RvdHlwZV9mb3JFYWNoKSB7XHJcblx0XHRBcnJheV9wcm90b3R5cGUuZm9yRWFjaCA9IEFycmF5X3Byb3RvdHlwZV9mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbiwgc2NvcGUpIHtcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuXHRcdFx0XHRmbi5jYWxsKHNjb3BlIHx8IHRoaXMsIHRoaXNbaV0sIGksIHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRGdW5jdGlvbl9wcm90b3R5cGUuZmFzdENsYXNzID0gZnVuY3Rpb24gZmFzdENsYXNzKGNyZWF0b3IsIG1peGlucykge1xyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5oZXJpdHMgdGhlIGZ1bmN0aW9uJ3MgcHJvdG90eXBlIHRvIGEgbmV3IGZ1bmN0aW9uIG5hbWVkIGNvbnN0cnVjdG9yIHJldHVybmVkIGJ5IHRoZSBjcmVhdG9yIHBhcmFtZXRlclxyXG5cdFx0Ly8vPGJyLz48YnIvPlxyXG5cdFx0Ly8vIHZhciBTcXVhcmUgPSBGaWd1cmUuZmFzdENsYXNzKGZ1bmN0aW9uKGJhc2UsIGJhc2VDdG9yKSB7IDxici8+XHJcblx0XHQvLy8gX19fIHRoaXMuY29uc3RydWN0b3IgPSBmdW5jdGlvbihuYW1lKSB7IC8vdGhlIGNvc250cnVjdG9yIGNhbiBiZSBvcHRpb25hbCA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyBiYXNlQ3Rvci5jYWxsKHRoaXMsIG5hbWUpOyAvL2NhbGwgdGhlIGJhc2VDdG9yIDxici8+XHJcblx0XHQvLy8gX19fIH07PGJyLz5cclxuXHRcdC8vLyBfX18gdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7ICA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyByZXR1cm4gYmFzZS5jYWxsKHRoaXMsIFwic3F1YXJlXCIpOyAvL2NhbGwgdGhlIGJhc2UgY2xhc3MgcHJvdG90eXBlJ3MgbWV0aG9kPGJyLz5cclxuXHRcdC8vLyBfX18gfTs8YnIvPlxyXG5cdFx0Ly8vIH0pOyAvLyB5b3UgY2FuIHNwZWNpZnkgYW55IG1peGlucyBoZXJlPGJyLz5cclxuXHRcdC8vLzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImNyZWF0b3JcIiB0eXBlPVwiRnVuY3Rpb25cIj5mdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyB0aGlzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24oKSB7Li59OyB0aGlzLm1ldGhvZDEgPSBmdW5jdGlvbigpIHsuLi59Li4uIH08YnIvPndoZXJlIGJhc2UgaXMgQmFzZUNsYXNzLnByb3RvdHlwZSBhbmQgYmFzZUN0b3IgaXMgQmFzZUNsYXNzIC0gYWthIHRoZSBmdW5jdGlvbiB5b3UgYXJlIGNhbGxpbmcgLmZhc3RDbGFzcyBvbjwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgZGVycml2ZWQgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblxyXG5cdFx0Ly90aGlzID09IGNvbnN0cnVjdG9yIG9mIHRoZSBiYXNlIFwiQ2xhc3NcIlxyXG5cdFx0dmFyIGJhc2VDbGFzcyA9IHRoaXM7XHJcblx0XHR2YXIgYmFzZSA9IHRoaXMucHJvdG90eXBlO1xyXG5cdFx0Y3JlYXRvciA9IGNyZWF0b3IgfHwgZnVuY3Rpb24gZmFzdENsYXNzQ3JlYXRvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIGZhc3RDbGFzc0N0b3IoKSB7IGJhc2VDbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9IH07XHJcblx0XHRjcmVhdG9yLnByb3RvdHlwZSA9IGJhc2U7XHJcblxyXG5cdFx0Ly9jcmVhdGluZyB0aGUgZGVycml2ZWQgY2xhc3MnIHByb3RvdHlwZVxyXG5cdFx0dmFyIGRlcnJpdmVkUHJvcm90eXBlID0gbmV3IGNyZWF0b3IoYmFzZSwgdGhpcyk7XHJcblx0XHR2YXIgRGVycml2ZWQ7XHJcblx0XHQvL2RpZCB5b3UgZm9yZ2V0IG9yIG5vdCBpbnRlbmQgdG8gYWRkIGEgY29uc3RydWN0b3I/IFdlJ2xsIGFkZCBvbmUgZm9yIHlvdVxyXG5cdFx0aWYgKCFkZXJyaXZlZFByb3JvdHlwZS5oYXNPd25Qcm9wZXJ0eShcImNvbnN0cnVjdG9yXCIpKVxyXG5cdFx0XHRkZXJyaXZlZFByb3JvdHlwZS5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIGZhc3RDbGFzc0RlZmF1bHRDb25zdHJ1Y3RvcigpIHsgYmFzZUNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH1cclxuXHRcdERlcnJpdmVkID0gZGVycml2ZWRQcm9yb3R5cGUuY29uc3RydWN0b3I7XHJcblx0XHQvL3NldHRpbmcgdGhlIGRlcnJpdmVkUHJvdG90eXBlIHRvIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlXHJcblx0XHREZXJyaXZlZC5wcm90b3R5cGUgPSBkZXJyaXZlZFByb3JvdHlwZTtcclxuXHJcblx0XHRXQXNzZXJ0KGZhbHNlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydFJlZGlyZWN0RGVmaW5pdGlvbigpIHtcclxuXHRcdFx0Ly90cmlnZ2VyIGludGVsbGlzZW5zZSBvbiBWUzIwMTIgd2hlbiBwcmVzc2luZyBGMTIgKGdvIHRvIHJlZmVyZW5jZSkgdG8gZ28gdG8gdGhlIGNyZWF0b3IgcmF0aGVyIHRoYW4gdGhlIGRlZmF1bHRDdG9yXHJcblx0XHRcdHZhciBjcmVhdG9yUmVzdWx0ID0gZGVycml2ZWRQcm9yb3R5cGU7XHJcblx0XHRcdGludGVsbGlzZW5zZS5yZWRpcmVjdERlZmluaXRpb24oRGVycml2ZWQsIGNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yIDogY3JlYXRvcik7XHJcblx0XHRcdGludGVsbGlzZW5zZS5hbm5vdGF0ZShEZXJyaXZlZCwgY3JlYXRvclJlc3VsdC5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSA/IGNyZWF0b3JSZXN1bHQuY29uc3RydWN0b3IgOiBiYXNlQ3Rvcik7XHJcblx0XHRcdGNyZWF0b3JSZXN1bHQuY29uc3RydWN0b3IgPSBEZXJyaXZlZDsvL2Vuc3VyZSB3ZSdyZSBmb3J3YXJkaW5nIGRlZXAgYmFzZSBjbGFzc2VzIGNvbnN0cnVjdG9yJ3MgWE1MRG9jIHRvIGluaGVyaXRlZCBjb25zdHJ1Y3RvcnMgaWYgdGhleSBkb24ndCBwcm92aWRlIG9uZVxyXG5cdFx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjcmVhdG9yUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0dmFyIGYgPSBjcmVhdG9yUmVzdWx0W25hbWVdO1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgZiA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdFx0XHRpbnRlbGxpc2Vuc2UuYWRkRXZlbnRMaXN0ZW5lcignc2lnbmF0dXJlaGVscCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoZXZlbnQudGFyZ2V0ICE9IGYpIHJldHVybjtcclxuXHRcdFx0XHRcdFx0dmFyIGFyZ3MgPSBbZXZlbnQuZnVuY3Rpb25IZWxwXTtcclxuXHRcdFx0XHRcdFx0dmFyIHAgPSBiYXNlQ2xhc3MucHJvdG90eXBlO1xyXG5cdFx0XHRcdFx0XHR3aGlsZSAocCAhPSBPYmplY3QucHJvdG90eXBlKSB7XHJcblx0XHRcdFx0XHRcdFx0YXJncy5wdXNoKHAuaGFzT3duUHJvcGVydHkobmFtZSkgPyBwW25hbWVdIDogbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0cCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpbnRlbGxpc2Vuc2UuaW5oZXJpdFhNTERvYy5hcHBseShudWxsLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRjcmVhdG9yID0gbnVsbDsvL3NldCB0aGUgZmlyc3QgcGFyYW1ldGVyIHRvIG51bGwgYXMgd2UgaGF2ZSBhbHJlYWR5ICdzaGFyZWQnIHRoZSBiYXNlIHByb3RvdHlwZSBpbnRvIGRlcnJpdmVkUHJvdG90eXBlIGluIHRoZSBjcmVhdG9yIGZ1bmN0aW9uIGJ5IHNldHRpbmcgY3JlYXRvci5wcm90b3R5cGUgPSBiYXNlIG9uIGFib3ZlXHJcblx0XHRhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBGdW5jdGlvbl9wcm90b3R5cGUuZGVmaW5lLmFwcGx5KERlcnJpdmVkLCBhcmd1bWVudHMpO1xyXG5cdFx0RGVycml2ZWQuY29uc3RydWN0b3IgPSBEZXJyaXZlZDtcclxuXHRcdC8vcmV0dXJuaW5nIHRoZSBjb25zdHJ1Y3RvclxyXG5cdFx0cmV0dXJuIERlcnJpdmVkO1xyXG5cdH07XHJcblxyXG5cdEZ1bmN0aW9uX3Byb3RvdHlwZS5pbmhlcml0V2l0aCA9ICFzdXBwb3J0c1Byb3RvID8gZnVuY3Rpb24gaW5oZXJpdFdpdGgoY3JlYXRvciwgbWl4aW5zKSB7XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5Jbmhlcml0cyB0aGUgZnVuY3Rpb24ncyBwcm90b3R5cGUgdG8gYSBuZXcgZnVuY3Rpb24gbmFtZWQgY29uc3RydWN0b3IgcmV0dXJuZWQgYnkgdGhlIGNyZWF0b3IgcGFyYW1ldGVyXHJcblx0XHQvLy88YnIvPjxici8+XHJcblx0XHQvLy8gdmFyIFNxdWFyZSA9IEZpZ3VyZS5pbmhlcml0V2l0aChmdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyA8YnIvPlxyXG5cdFx0Ly8vIF9fXyByZXR1cm4geyA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyBjb25zdHJ1Y3RvcjogZnVuY3Rpb24obmFtZSkgeyAvL3RoZSBjb3NudHJ1Y3RvciBjYW4gYmUgb3B0aW9uYWwgPGJyLz5cclxuXHRcdC8vLyBfX19fX19fX18gYmFzZUN0b3IuY2FsbCh0aGlzLCBuYW1lKTsgLy9leHBsaWNpdGVsbHkgY2FsbCB0aGUgYmFzZSBjbGFzcyBieSBuYW1lIDxici8+XHJcblx0XHQvLy8gX19fX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX19fX18gZHJhdzogZnVuY3Rpb24oKSB7ICA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fX19fXyByZXR1cm4gYmFzZS5jYWxsKHRoaXMsIFwic3F1YXJlXCIpOyAvL2V4cGxpY2l0ZWx5IGNhbGwgdGhlIGJhc2UgY2xhc3MgcHJvdG90eXBlJ3MgIG1ldGhvZCBieSBuYW1lIDxici8+XHJcblx0XHQvLy8gX19fX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX18gfTs8YnIvPlxyXG5cdFx0Ly8vIH0pOyAvLyB5b3UgY2FuIHNwZWNpZnkgYW55IG1peGlucyBoZXJlPGJyLz5cclxuXHRcdC8vLzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImNyZWF0b3JcIiB0eXBlPVwiRnVuY3Rpb25cIj5mdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyByZXR1cm4geyBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7Li59Li4ufSB9PGJyLz53aGVyZSBiYXNlIGlzIEJhc2VDbGFzcy5wcm90b3R5cGUgYW5kIGJhc2VDdG9yIGlzIEJhc2VDbGFzcyAtIGFrYSB0aGUgZnVuY3Rpb24geW91IGFyZSBjYWxsaW5nIC5pbmhlcml0V2l0aCBvbjwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgZGVycml2ZWQgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5Jbmhlcml0cyB0aGUgZnVuY3Rpb24ncyBwcm90b3R5cGUgdG8gYSBuZXcgZnVuY3Rpb24gbmFtZWQgY29uc3RydWN0b3IgcGFzc2VkIGludG8gdGhlIG9iamVjdCBhcyBwYXJhbWV0ZXJcclxuXHRcdC8vLzxici8+PGJyLz5cclxuXHRcdC8vLyB2YXIgU3F1YXJlID0gRmlndXJlLmluaGVyaXRXaXRoKHsgPGJyLz5cclxuXHRcdC8vLyBfX18gY29uc3RydWN0b3I6IGZ1bmN0aW9uKG5hbWUpIHsgLy90aGUgY29zbnRydWN0b3IgY2FuIGJlIG9wdGlvbmFsIDxici8+XHJcblx0XHQvLy8gX19fX19fIEZpZ3VyZS5jYWxsKHRoaXMsIG5hbWUpOyAvL2NhbGwgdGhlIGJhc2VDdG9yIDxici8+XHJcblx0XHQvLy8gX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX18gZHJhdzogZnVuY3Rpb24oKSB7ICA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyByZXR1cm4gRmlndXJlLnByb3RvdHlwZS5jYWxsKHRoaXMsIFwic3F1YXJlXCIpOyAvL2NhbGwgdGhlIGJhc2UgY2xhc3MgcHJvdG90eXBlJ3MgbWV0aG9kPGJyLz5cclxuXHRcdC8vLyBfX18gfSw8YnIvPlxyXG5cdFx0Ly8vIH0pOyAvLyB5b3UgY2FuIHNwZWNpZnkgYW55IG1peGlucyBoZXJlPGJyLz5cclxuXHRcdC8vLzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImNyZWF0b3JcIiB0eXBlPVwiT2JqZWN0XCI+QW4gb2JqZWN0IGNvbnRhaW5pbmcgbWVtYmVycyBmb3IgdGhlIG5ldyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgZGVycml2ZWQgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHR2YXIgYmFzZUN0b3IgPSB0aGlzO1xyXG5cdFx0dmFyIGNyZWF0b3JSZXN1bHQgPSAodHlwZW9mIGNyZWF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IGNyZWF0b3IuY2FsbCh0aGlzLCB0aGlzLnByb3RvdHlwZSwgdGhpcykgOiBjcmVhdG9yKSB8fCB7fTtcclxuXHRcdHZhciBEZXJyaXZlZCA9IGNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gaW5oZXJpdFdpdGhDb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0YmFzZUN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH07IC8vYXV0b21hdGljIGNvbnN0cnVjdG9yIGlmIG9tbWl0ZWRcclxuXHJcblx0XHRXQXNzZXJ0KGZhbHNlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydFJlZGlyZWN0RGVmaW5pdGlvbigpIHtcclxuXHRcdFx0Ly90cmlnZ2VyIGludGVsbGlzZW5zZSBvbiBWUzIwMTIgd2hlbiBwcmVzc2luZyBGMTIgKGdvIHRvIHJlZmVyZW5jZSkgdG8gZ28gdG8gdGhlIGNyZWF0b3IgcmF0aGVyIHRoYW4gdGhlIGRlZmF1bHRDdG9yXHJcblx0XHRcdGludGVsbGlzZW5zZS5yZWRpcmVjdERlZmluaXRpb24oRGVycml2ZWQsIGNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yIDogY3JlYXRvcik7XHJcblx0XHRcdGludGVsbGlzZW5zZS5hbm5vdGF0ZShEZXJyaXZlZCwgY3JlYXRvclJlc3VsdC5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSA/IGNyZWF0b3JSZXN1bHQuY29uc3RydWN0b3IgOiBiYXNlQ3Rvcik7XHJcblx0XHRcdGNyZWF0b3JSZXN1bHQuY29uc3RydWN0b3IgPSBEZXJyaXZlZDsvL2Vuc3VyZSB3ZSdyZSBmb3J3YXJkaW5nIGRlZXAgYmFzZSBjbGFzc2VzIGNvbnN0cnVjdG9yJ3MgWE1MRG9jIHRvIGluaGVyaXRlZCBjb25zdHJ1Y3RvcnMgaWYgdGhleSBkb24ndCBwcm92aWRlIG9uZVxyXG5cdFx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjcmVhdG9yUmVzdWx0KS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XHJcblx0XHRcdFx0dmFyIGYgPSBjcmVhdG9yUmVzdWx0W25hbWVdO1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgZiA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblx0XHRcdFx0XHRpbnRlbGxpc2Vuc2UuYWRkRXZlbnRMaXN0ZW5lcignc2lnbmF0dXJlaGVscCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG5cdFx0XHRcdFx0XHRpZiAoZXZlbnQudGFyZ2V0ICE9IGYpIHJldHVybjtcclxuXHRcdFx0XHRcdFx0dmFyIGFyZ3MgPSBbZXZlbnQuZnVuY3Rpb25IZWxwXTtcclxuXHRcdFx0XHRcdFx0dmFyIHAgPSBiYXNlQ3Rvci5wcm90b3R5cGU7XHJcblx0XHRcdFx0XHRcdHdoaWxlIChwICE9IE9iamVjdC5wcm90b3R5cGUpIHtcclxuXHRcdFx0XHRcdFx0XHRhcmdzLnB1c2gocC5oYXNPd25Qcm9wZXJ0eShuYW1lKSA/IHBbbmFtZV0gOiBudWxsKTtcclxuXHRcdFx0XHRcdFx0XHRwID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHApO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGludGVsbGlzZW5zZS5pbmhlcml0WE1MRG9jLmFwcGx5KG51bGwsIGFyZ3MpO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0dmFyIGRlcnJpdmVkUHJvdG90eXBlO1xyXG5cdFx0X18ucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcblx0XHREZXJyaXZlZC5wcm90b3R5cGUgPSBkZXJyaXZlZFByb3RvdHlwZSA9IG5ldyBfXztcclxuXHJcblxyXG5cdFx0Y3JlYXRvciA9IGNyZWF0b3JSZXN1bHQ7Ly9jaGFuZ2UgdGhlIGZpcnN0IHBhcmFtZXRlciB3aXRoIHRoZSBjcmVhdG9yUmVzdWx0XHJcblx0XHRGdW5jdGlvbl9wcm90b3R5cGUuZGVmaW5lLmFwcGx5KERlcnJpdmVkLCBhcmd1bWVudHMpO1xyXG5cdFx0RGVycml2ZWQuY29uc3RydWN0b3IgPSBEZXJyaXZlZDtcclxuXHJcblx0XHRyZXR1cm4gRGVycml2ZWQ7XHJcblx0fSA6Ly8gd2hlbiBicm93c2VyIHN1cHBvcnRzIF9fcHJvdG9fXyBzZXR0aW5nIGl0IGlzIHdheSBmYXN0ZXIgdGhhbiBpdGVyYXRpbmcgdGhlIG9iamVjdFxyXG5cdGZ1bmN0aW9uIGluaGVyaXRXaXRoUHJvdG8oY3JlYXRvciwgbWl4aW5zKSB7XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5Jbmhlcml0cyB0aGUgZnVuY3Rpb24ncyBwcm90b3R5cGUgdG8gYSBuZXcgZnVuY3Rpb24gbmFtZWQgY29uc3RydWN0b3IgcmV0dXJuZWQgYnkgdGhlIGNyZWF0b3IgcGFyYW1ldGVyXHJcblx0XHQvLy88YnIvPjxici8+XHJcblx0XHQvLy8gdmFyIFNxdWFyZSA9IEZpZ3VyZS5pbmhlcml0V2l0aChmdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyA8YnIvPlxyXG5cdFx0Ly8vIF9fXyByZXR1cm4geyA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyBjb25zdHJ1Y3RvcjogZnVuY3Rpb24obmFtZSkgeyAvL3RoZSBjb3NudHJ1Y3RvciBjYW4gYmUgb3B0aW9uYWwgPGJyLz5cclxuXHRcdC8vLyBfX19fX19fX18gYmFzZUN0b3IuY2FsbCh0aGlzLCBuYW1lKTsgLy9leHBsaWNpdGVsbHkgY2FsbCB0aGUgYmFzZSBjbGFzcyBieSBuYW1lIDxici8+XHJcblx0XHQvLy8gX19fX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX19fX18gZHJhdzogZnVuY3Rpb24oKSB7ICA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fX19fXyByZXR1cm4gYmFzZS5jYWxsKHRoaXMsIFwic3F1YXJlXCIpOyAvL2V4cGxpY2l0ZWx5IGNhbGwgdGhlIGJhc2UgY2xhc3MgcHJvdG90eXBlJ3MgIG1ldGhvZCBieSBuYW1lIDxici8+XHJcblx0XHQvLy8gX19fX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX18gfTs8YnIvPlxyXG5cdFx0Ly8vIH0pOyAvLyB5b3UgY2FuIHNwZWNpZnkgYW55IG1peGlucyBoZXJlPGJyLz5cclxuXHRcdC8vLzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImNyZWF0b3JcIiB0eXBlPVwiRnVuY3Rpb25cIj5mdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyByZXR1cm4geyBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7Li59Li4ufSB9PGJyLz53aGVyZSBiYXNlIGlzIEJhc2VDbGFzcy5wcm90b3R5cGUgYW5kIGJhc2VDdG9yIGlzIEJhc2VDbGFzcyAtIGFrYSB0aGUgZnVuY3Rpb24geW91IGFyZSBjYWxsaW5nIC5pbmhlcml0V2l0aCBvbjwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgZGVycml2ZWQgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5Jbmhlcml0cyB0aGUgZnVuY3Rpb24ncyBwcm90b3R5cGUgdG8gYSBuZXcgZnVuY3Rpb24gbmFtZWQgY29uc3RydWN0b3IgcGFzc2VkIGludG8gdGhlIG9iamVjdCBhcyBwYXJhbWV0ZXJcclxuXHRcdC8vLzxici8+PGJyLz5cclxuXHRcdC8vLyB2YXIgU3F1YXJlID0gRmlndXJlLmluaGVyaXRXaXRoKHsgPGJyLz5cclxuXHRcdC8vLyBfX18gY29uc3RydWN0b3I6IGZ1bmN0aW9uKG5hbWUpIHsgLy90aGUgY29zbnRydWN0b3IgY2FuIGJlIG9wdGlvbmFsIDxici8+XHJcblx0XHQvLy8gX19fX19fIEZpZ3VyZS5jYWxsKHRoaXMsIG5hbWUpOyAvL2NhbGwgdGhlIGJhc2VDdG9yIDxici8+XHJcblx0XHQvLy8gX19fIH0sPGJyLz5cclxuXHRcdC8vLyBfX18gZHJhdzogZnVuY3Rpb24oKSB7ICA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyByZXR1cm4gRmlndXJlLnByb3RvdHlwZS5jYWxsKHRoaXMsIFwic3F1YXJlXCIpOyAvL2NhbGwgdGhlIGJhc2UgY2xhc3MgcHJvdG90eXBlJ3MgbWV0aG9kPGJyLz5cclxuXHRcdC8vLyBfX18gfSw8YnIvPlxyXG5cdFx0Ly8vIH0pOyAvLyB5b3UgY2FuIHNwZWNpZnkgYW55IG1peGlucyBoZXJlPGJyLz5cclxuXHRcdC8vLzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImNyZWF0b3JcIiB0eXBlPVwiT2JqZWN0XCI+QW4gb2JqZWN0IGNvbnRhaW5pbmcgbWVtYmVycyBmb3IgdGhlIG5ldyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgZGVycml2ZWQgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHR2YXIgYmFzZUN0b3IgPSB0aGlzO1xyXG5cdFx0dmFyIGRlcnJpdmVkUHJvdG90eXBlID0gKHR5cGVvZiBjcmVhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBjcmVhdG9yLmNhbGwodGhpcywgdGhpcy5wcm90b3R5cGUsIHRoaXMpIDogY3JlYXRvcikgfHwge307XHJcblx0XHR2YXIgRGVycml2ZWQgPSBkZXJyaXZlZFByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSA/IGRlcnJpdmVkUHJvdG90eXBlLmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gaW5oZXJpdFdpdGhQcm90b0RlZmF1bHRDb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0YmFzZUN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH07IC8vYXV0b21hdGljIGNvbnN0cnVjdG9yIGlmIG9tbWl0ZWRcclxuXHRcdERlcnJpdmVkLnByb3RvdHlwZSA9IGRlcnJpdmVkUHJvdG90eXBlO1xyXG5cdFx0ZGVycml2ZWRQcm90b3R5cGUuX19wcm90b19fID0gdGhpcy5wcm90b3R5cGU7XHJcblx0XHRjcmVhdG9yID0gbnVsbDsvL3NldCB0aGUgZmlyc3QgcGFyYW1ldGVyIHRvIG51bGwgYXMgd2UgaGF2ZSBhbHJlYWR5ICdzaGFyZWQnIHRoZSBiYXNlIHByb3RvdHlwZSBpbnRvIGRlcnJpdmVkUHJvdG90eXBlIGJ5IHVzaW5nIF9fcHJvdG9fX1xyXG5cdFx0YXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgRnVuY3Rpb25fcHJvdG90eXBlLmRlZmluZS5hcHBseShEZXJyaXZlZCwgYXJndW1lbnRzKTtcclxuXHRcdERlcnJpdmVkLmNvbnN0cnVjdG9yID0gRGVycml2ZWQ7XHJcblx0XHRyZXR1cm4gRGVycml2ZWQ7XHJcblx0fTtcclxuXHRGdW5jdGlvbl9wcm90b3R5cGUuZGVmaW5lID0gZnVuY3Rpb24gZGVmaW5lKHByb3RvdHlwZSwgbWl4aW5zKSB7XHJcblx0XHQvLy8gPHN1bW1hcnk+RGVmaW5lIG1lbWJlcnMgb24gdGhlIHByb3RvdHlwZSBvZiB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2l0aCB0aGUgY3VzdG9tIG1ldGhvZHMgYW5kIGZpZWxkcyBzcGVjaWZpZWQgaW4gdGhlIHByb3RvdHlwZSBwYXJhbWV0ZXIuPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwicHJvdG90eXBlXCIgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiPnt9IG9yIGZ1bmN0aW9uKHByb3RvdHlwZSwgY3Rvcikge308YnIvPkEgY3VzdG9tIG9iamVjdCB3aXRoIHRoZSBtZXRob2RzIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgb24gRXh0ZW5kZWUucHJvdG90eXBlPC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cIm1peGluc1wiICB0eXBlPVwiRnVuY3Rpb24gfHwgUGxhaW4gT2JqZWN0XCIgb3B0aW9uYWw9XCJ0cnVlXCIgcGFyYW1ldGVyQXJyYXk9XCJ0cnVlXCI+U3BlY2lmeSBvbmUgb3JlIG1vcmUgbWl4aW5zIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSB0aGlzO1xyXG5cdFx0dmFyIGV4dGVuZGVlUHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XHJcblx0XHR2YXIgY3JlYXRvclJlc3VsdCA9IHByb3RvdHlwZTtcclxuXHRcdGlmIChwcm90b3R5cGUpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBwcm90b3R5cGUgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0XHRwcm90b3R5cGUgPSBwcm90b3R5cGUuY2FsbChleHRlbmRlZVByb3RvdHlwZSwgdGhpcy5wcm90b3R5cGUsIHRoaXMpO1xyXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gcHJvdG90eXBlKVxyXG5cdFx0XHRcdGV4dGVuZGVlUHJvdG90eXBlW2tleV0gPSBwcm90b3R5cGVba2V5XTtcclxuXHRcdH1cclxuXHRcdHByb3RvdHlwZSA9IG51bGw7XHJcblx0XHQvL2ludGVsbGlzZW5zZS5sb2dNZXNzYWdlKFwiZGVmaW5pbmcuLi4uXCIpO1xyXG5cdFx0KGFyZ3VtZW50cy5sZW5ndGggPiAyIHx8IG1peGlucykgJiYgKGV4dGVuZGVlUHJvdG90eXBlLmhhc093blByb3BlcnR5KFwiX19taXhpbnNfX1wiKSB8fCAoT2JqZWN0X2RlZmluZVByb3BlcnRpZXMgPyAoT2JqZWN0X2RlZmluZVByb3BlcnR5KGV4dGVuZGVlUHJvdG90eXBlLCBcIl9fbWl4aW5zX19cIiwgeyBlbnVtZXJhYmxlOiBmYWxzZSwgdmFsdWU6IFtdLCB3cml0ZWFibGU6IGZhbHNlIH0pLl9fbWl4aW5zX18uX19oaWRkZW4gPSB0cnVlKSA6IGV4dGVuZGVlUHJvdG90eXBlLl9fbWl4aW5zX18gPSBbXSkpICYmIEFycmF5X3Byb3RvdHlwZV9mb3JFYWNoLmNhbGwoYXJndW1lbnRzLCBmdW5jdGlvbiBmb3JFYWNoTWl4aW4obWl4aW4sIGluZGV4LCBtaXhpblZhbHVlLCBpc0Z1bmN0aW9uKSB7XHJcblx0XHRcdGlzRnVuY3Rpb24gPSB0eXBlb2YgbWl4aW4gPT09ICdmdW5jdGlvbic7XHJcblx0XHRcdGlmIChpc0Z1bmN0aW9uKSB7XHJcblx0XHRcdFx0X18ucHJvdG90eXBlID0gbWl4aW4ucHJvdG90eXBlO1xyXG5cdFx0XHRcdG1peGluVmFsdWUgPSBuZXcgbWl4aW4oZXh0ZW5kZWVQcm90b3R5cGUsIGNvbnN0cnVjdG9yKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlIG1peGluVmFsdWUgPSBtaXhpbjtcclxuXHRcdFx0aWYgKG1peGluVmFsdWUpIHtcclxuXHRcdFx0XHQvL3N0b3JlIHRoZSBmdW5jdGlvbnMgaW4gdGhlIF9fbWl4aW5zX18gbWVtYmVyIG9uIHRoZSBwcm90b3R5cGUgc28gdGhleSB3aWxsIGJlIGNhbGxlZCBvbiBGdW5jdGlvbi5pbml0TWl4aW5zKGluc3RhbmNlKSBmdW5jdGlvblxyXG5cdFx0XHRcdGlzRnVuY3Rpb24gJiYgZXh0ZW5kZWVQcm90b3R5cGUuX19taXhpbnNfXy5wdXNoKG1peGluKTtcclxuXHRcdFx0XHQvL2NvcHkgdGhlIHByb3RvdHlwZSBtZW1iZXJzIGZyb20gdGhlIG1peGluLnByb3RvdHlwZSB0byBleHRlbmRlZVByb3RvdHlwZSBzbyB3ZSBhcmUgb25seSBkb2luZyB0aGlzIG9uY2VcclxuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gbWl4aW5WYWx1ZSlcclxuXHRcdFx0XHRcdGlmIChrZXkgIT0gXCJjb25zdHJ1Y3RvclwiICYmIGtleSAhPSBcInByb3RvdHlwZVwiKSB7XHJcblx0XHRcdFx0XHRcdC8vaW50ZWxsaXNlbnNlLmxvZ01lc3NhZ2UoXCJpbmplY3RpbmcgXCIgKyBrZXkgKyBcIiBpbnRvIFwiICsgZXh0ZW5kZWVQcm90b3R5cGUubmFtZSk7XHJcblx0XHRcdFx0XHRcdFdBc3NlcnQodHJ1ZSwgZnVuY3Rpb24gV0Fzc2VydEluamVjdGluZygpIHtcclxuXHRcdFx0XHRcdFx0XHQvL3RyaWdnZXIgaW50ZWxsaXNlbnNlIG9uIFZTMjAxMiBmb3IgbWl4aW5zXHJcblx0XHRcdFx0XHRcdFx0aWYgKGtleSBpbiBleHRlbmRlZVByb3RvdHlwZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly9hbGxvdyBhYmFzdHJhY3QgbWVtYmVycyBvbiBjbGFzcy9taXhpbnMgc28gdGhleSBjYW4gYmUgcmVwbGFjZWRcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChleHRlbmRlZVByb3RvdHlwZVtrZXldICYmIGV4dGVuZGVlUHJvdG90eXBlW2tleV0uYWJzdHJhY3QpXHJcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHRcdHZhciBtc2cgPSBcIlRoZSAnezB9JyBtaXhpbiBkZWZpbmVzIGEgJ3sxfScgbmFtZWQgJ3syfScgd2hpY2ggaXMgYWxyZWFkeSBkZWZpbmVkIG9uIHRoZSBjbGFzcyB7M30hXCJcclxuXHRcdFx0XHRcdFx0XHRcdFx0LmZvcm1hdChpc0Z1bmN0aW9uICYmIG1peGluLm5hbWUgfHwgKGluZGV4IC0gMSksIHR5cGVvZiBtaXhpblZhbHVlW2tleV0gPT09IFwiZnVuY3Rpb25cIiA/IFwiZnVuY3Rpb25cIiA6IFwibWVtYmVyXCIsIGtleSwgY29uc3RydWN0b3IubmFtZSA/IChcIidcIiArIGNvbnN0cnVjdG9yLm5hbWUgKyBcIidcIikgOiAnJyk7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhtc2cpXHJcblx0XHRcdFx0XHRcdFx0XHQhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgaW50ZWxsaXNlbnNlLmxvZ01lc3NhZ2UobXNnKTtcclxuXHRcdFx0XHRcdFx0XHRcdHRocm93IG1zZztcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0Ly9zZXQgYSBjdXN0b20gZ2x5cGggaWNvbiBmb3IgbWl4aW4gZnVuY3Rpb25zXHJcblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBtaXhpblZhbHVlW2tleV0gPT09IFwiZnVuY3Rpb25cIiAmJiBtaXhpbiAhPSBtaXhpblZhbHVlW2tleV0gJiYgbWl4aW4gIT0gY29uc3RydWN0b3IgJiYgbWl4aW4gIT09IGV4dGVuZGVlUHJvdG90eXBlKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRtaXhpblZhbHVlW2tleV0uX19nbHlwaCA9IFwiR2x5cGhDcHBQcm9qZWN0XCI7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0ZXh0ZW5kZWVQcm90b3R5cGVba2V5XSA9IG1peGluVmFsdWVba2V5XTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRXQXNzZXJ0KHRydWUsICFpc05vZGUgJiYgd2luZG93LmludGVsbGlzZW5zZSAmJiBmdW5jdGlvbiBXQXNzZXJ0RXh0ZW5kaW5nKCkge1xyXG5cdFx0XHQvL3RyaWdnZXIgaW50ZWxsaXNlbnNlIG9uIFZTMjAxMiBmb3IgYmFzZSBjbGFzcyBtZW1iZXJzLCBiZWNhdXNlIHNhbWUgYXMgSUUsIFZTMjAxMiBkb2Vzbid0IHN1cHBvcnQgX19wcm90b19fXHJcblx0XHRcdC8vZm9yICh2YXIgaSBpbiBleHRlbmRlZVByb3RvdHlwZSlcclxuXHRcdFx0Ly9cdGlmICghY3JlYXRvclJlc3VsdC5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cdFx0XHQvL1x0XHRjcmVhdG9yUmVzdWx0W2ldID0gZXh0ZW5kZWVQcm90b3R5cGVbaV07XHJcblx0XHRcdC8vXHR9XHJcblx0XHRcdC8vaW5qZWN0IHByb3BlcnRpZXMgZnJvbSB0aGUgbmV3IGNvbnN0cnVjdG9yXHJcblx0XHRcdC8vZXh0ZW5kZWVQcm90b3R5cGUgPSB7fTtcclxuXHRcdFx0Ly9pbnRlbGxpc2Vuc2UubG9nTWVzc2FnZShcImluamVjdGluZyBjdG9yLnByb3BlcnRpZXMgaW50byBcIiArIEpTT04uc3RyaW5naWZ5KGNyZWF0b3JSZXN1bHQpICsgL2Z1bmN0aW9uICguKilcXCguKlxcKS9naS5leGVjKGFyZ3VtZW50cy5jYWxsZWUuY2FsbGVyLmNhbGxlci5jYWxsZXIudG9TdHJpbmcoKSlbMV0pXHJcblx0XHRcdF9fLnByb3RvdHlwZSA9IGV4dGVuZGVlUHJvdG90eXBlO1xyXG5cdFx0XHR2YXIgcHJvdG8gPSBuZXcgX187XHJcblx0XHRcdGNvbnN0cnVjdG9yLmNhbGwocHJvdG8pO1xyXG5cdFx0XHRmb3IgKHZhciBpIGluIHByb3RvKSB7XHJcblx0XHRcdFx0Ly9pbnRlbGxpc2Vuc2UubG9nTWVzc2FnZShpKVxyXG5cdFx0XHRcdGlmIChpICE9PSBcImNvbnN0cnVjdG9yXCIpXHJcblx0XHRcdFx0XHQvL2lmIChwcm90by5oYXNPd25Qcm9wZXJ0eShpKSlcclxuXHRcdFx0XHRcdGlmICghY3JlYXRvclJlc3VsdC5oYXNPd25Qcm9wZXJ0eShpKSlcclxuXHRcdFx0XHRcdFx0Y3JlYXRvclJlc3VsdFtpXSA9IHByb3RvW2ldO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblxyXG5cclxuXHRGdW5jdGlvbi5kZWZpbmUgPSBmdW5jdGlvbiBGdW5jdGlvbl9kZWZpbmUoZnVuYywgcHJvdG90eXBlLCBtaXhpbnMpIHtcclxuXHRcdC8vLyA8c2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzdW1tYXJ5PkV4dGVuZHMgdGhlIGdpdmVuIGZ1bmMncyBwcm90b3R5cGUgd2l0aCBwcm92aWRlZCBtZW1iZXJzIG9mIHByb3RvdHlwZSBhbmQgZW5zdXJlcyBjYWxsaW5nIHRoZSBtaXhpbnMgaW4gdGhlIGNvbnN0cnVjdG9yPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwiZnVuY1wiIHR5cGU9XCJGdW5jdGlvblwiPlNwZWNpZnkgdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIHlvdSB3YW50IHRvIGRlZmluZSBpLmUuIGZ1bmN0aW9uKCkge308L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwicHJvdG90eXBlXCIgdHlwZT1cIlBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiPlNwZWNpZnkgYW4gb2JqZWN0IHRoYXQgY29udGFpbiB0aGUgZnVuY3Rpb25zIG9yIG1lbWJlcnMgdGhhdCBzaG91bGQgZGVmaW5lZCBvbiB0aGUgcHJvdmlkZWQgZnVuYydzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgcmV0dXJuZWQgZnVuYydzIHByb3RvdHlwZS4gPGJyLz5BIE1peGluIGlzIGVpdGhlciBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBwbGFpbiBvYmplY3QsIG9yIGEgcGxhbiBvYmplY3QgaW4gaXRzZWxmLiBJdCBjb250YWlucyBtZXRob2Qgb3IgcHJvcGVydGllcyB0byBiZSBhZGRlZCB0byB0aGlzIGZ1bmN0aW9uJ3MgcHJvdG90eXBlPC9wYXJhbT5cclxuXHRcdC8vLyA8L3NpZ25hdHVyZT5cclxuXHRcdC8vLyA8c2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzdW1tYXJ5PkV4dGVuZHMgdGhlIGdpdmVuIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlIHdpdGggcHJvdmlkZWQgbWVtYmVycyBvZiBwcm90b3R5cGUgYW5kIGVuc3VyZXMgY2FsbGluZyB0aGUgbWl4aW5zIGluIHRoZSBjb25zdHJ1Y3Rvcjwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cInByb3RvdHlwZVwiIHR5cGU9XCJQbGFpbiBPYmplY3RcIj5TcGVjaWZ5IGFuIG9iamVjdCB0aGF0IGNvbnRhaW4gdGhlIGNvbnN0cnVjdG9yIGFuZCBmdW5jdGlvbnMgb3IgbWVtYmVycyB0aGF0IHNob3VsZCBkZWZpbmVkIG9uIHRoZSBwcm92aWRlZCBjb25zdHJ1Y3RvcidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGUgcmV0dXJuZWQgZnVuYydzIHByb3RvdHlwZS4gPGJyLz5BIE1peGluIGlzIGVpdGhlciBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBwbGFpbiBvYmplY3QsIG9yIGEgcGxhbiBvYmplY3QgaW4gaXRzZWxmLiBJdCBjb250YWlucyBtZXRob2Qgb3IgcHJvcGVydGllcyB0byBiZSBhZGRlZCB0byB0aGlzIGZ1bmN0aW9uJ3MgcHJvdG90eXBlPC9wYXJhbT5cclxuXHRcdC8vLyA8L3NpZ25hdHVyZT5cclxuXHRcdHZhciByZXN1bHQ7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBmdW5jIHx8IGZ1bmN0aW9uIGRlZmluZURlZmF1bHRDb25zdHJ1Y3RvcigpIHsgfTsgLy9hdXRvbWF0aWMgY29uc3RydWN0b3IgaWYgb21taXRlZFxyXG5cdFx0dmFyIGFwcGx5RGVmaW5lID0gYXJndW1lbnRzLmxlbmd0aCA+IDE7XHJcblx0XHRpZiAodHlwZW9mIGZ1bmMgIT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRjb25zdHJ1Y3RvciA9IGZ1bmMuaGFzT3duUHJvcGVydHkoXCJjb25zdHJ1Y3RvclwiKSA/IGZ1bmMuY29uc3RydWN0b3IgOiBmdW5jdGlvbiBjb25zdHJ1Y3RvckRlZmF1bHRPYmpDb25zdHJ1Y3RvcigpIHsgfTtcclxuXHJcblx0XHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZ1bmM7XHJcblx0XHRcdFdBc3NlcnQodHJ1ZSwgIWlzTm9kZSAmJiB3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGZ1bmN0aW9uIFdBc3NlcnQoKSB7XHJcblx0XHRcdFx0Ly9WUzIwMTIgaW50ZWxsaXNlbnNlIGRvbid0IGZvcndhcmQgdGhlIGFjdHVhbCBjcmVhdG9yIGFzIHRoZSBmdW5jdGlvbidzIHByb3RvdHlwZSBiL2Mgd2Ugd2FudCB0byBcImluamVjdFwiIGNvbnN0cnVjdG9yJ3MgbWVtYmVycyBpbnRvIGl0XHJcblx0XHRcdFx0ZnVuY3Rpb24gY2xvbmUoKSB7XHJcblx0XHRcdFx0XHRmb3IgKHZhciBpIGluIGZ1bmMpXHJcblx0XHRcdFx0XHRcdGlmIChmdW5jLmhhc093blByb3BlcnR5KGkpKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0gPSBmdW5jW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRjbG9uZS5wcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnVuYyk7XHJcblx0XHRcdFx0Y29uc3RydWN0b3IucHJvdG90eXBlID0gbmV3IGNsb25lO1xyXG5cdFx0XHR9KTtcclxuXHJcblxyXG5cdFx0XHRhcHBseURlZmluZSA9IHRydWU7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZnVuYyA9IHByb3RvdHlwZTtcclxuXHRcdFx0cHJvdG90eXBlID0gbnVsbDtcclxuXHRcdH1cclxuXHRcdGFwcGx5RGVmaW5lICYmIEZ1bmN0aW9uX3Byb3RvdHlwZS5kZWZpbmUuYXBwbHkoY29uc3RydWN0b3IsIGFyZ3VtZW50cyk7XHJcblxyXG5cdFx0cmVzdWx0ID0gZnVuY3Rpb24gZGVmaW5lSW5pdE1peGluc0NvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHQvLyBhdXRvbWF0aWNhbGx5IGNhbGwgaW5pdE1peGlucyBhbmQgdGhlbiB0aGUgZmlyc3QgY29uc3RydWN0b3JcclxuXHRcdFx0RnVuY3Rpb24uaW5pdE1peGlucyh0aGlzKTtcclxuXHRcdFx0Y29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH1cclxuXHRcdC8vd2UgYXJlIHNoYXJpbmcgY29uc3RydWN0b3IncyBwcm90b3R5cGVcclxuXHRcdHJlc3VsdC5wcm90b3R5cGUgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGU7XHJcblx0XHQvL2ZvcndhcmQgdGhlIFZTMjAxMiBpbnRlbGxpc2Vuc2UgdG8gdGhlIGdpdmVuIGNvbnN0cnVjdG9yIGZ1bmN0aW9uXHJcblx0XHRXQXNzZXJ0KHRydWUsICFpc05vZGUgJiYgd2luZG93LmludGVsbGlzZW5zZSAmJiBmdW5jdGlvbiBXQXNzZXJ0KCkge1xyXG5cdFx0XHR3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGludGVsbGlzZW5zZS5yZWRpcmVjdERlZmluaXRpb24ocmVzdWx0LCBjb25zdHJ1Y3Rvcik7XHJcblx0XHR9KTtcclxuXHRcdHJlc3VsdC5jb25zdHJ1Y3RvciA9IHJlc3VsdC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvci5jb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IHJlc3VsdDtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fTtcclxuXHJcblx0RnVuY3Rpb25fcHJvdG90eXBlLmRlZmluZVN0YXRpYyA9IGZ1bmN0aW9uIChjb3B5UHJvcGVydGllc0Zyb20pIHtcclxuXHRcdC8vLyA8c3VtbWFyeT5Db3BpZXMgYWxsIHRoZSBtZW1iZXJzIG9mIHRoZSBnaXZlbiBvYmplY3QsIGluY2x1ZGluZyB0aG9zZSBvbiBpdHMgcHJvdG90eXBlIGlmIGFueSwgdG8gdGhpcyBmdW5jdGlvbiAoYW5kIG5vdCBvbiBpdHMgcHJvdG90eXBlKTxici8+Rm9yIGV4dGVuZGluZyB0aGlzIGZ1bmN0aW9ucycgcHJvdG90eXBlIHVzZSAuZGVmaW5lKCk8L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjb3B5UHJvcGVydGllc0Zyb21cIiB0eXBlPVwiT2JqZWN0XCI+VGhlIG9iamVjdCB0byBjb3B5IHRoZSBwcm9wZXJ0aWVzIGZyb208L3BhcmFtPlxyXG5cdFx0aWYgKGNvcHlQcm9wZXJ0aWVzRnJvbSlcclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBjb3B5UHJvcGVydGllc0Zyb20pIHtcclxuXHRcdFx0XHR0aGlzW2ldID0gY29weVByb3BlcnRpZXNGcm9tW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9XHJcblx0ZnVuY3Rpb24gZGVmYXVsdEFic3RyYWN0TWV0aG9kKCkge1xyXG5cdFx0V0Fzc2VydChmYWxzZSwgXCJOb3QgaW1wbGVtZW50ZWRcIikoKTtcclxuXHR9XHJcblx0ZGVmYXVsdEFic3RyYWN0TWV0aG9kLmRlZmluZVN0YXRpYyh7IGFic3RyYWN0OiB0cnVlIH0pO1xyXG5cdEZ1bmN0aW9uLmFic3RyYWN0ID0gZnVuY3Rpb24gKG1lc3NhZ2UsIGZ1bmMpIHtcclxuXHRcdC8vLyA8c3VtbWFyeT5SZXR1cm5zIGFuIGFic3RyYWN0IGZ1bmN0aW9uIHRoYXQgYXNzZXJ0cyB0aGUgZ2l2ZW4gbWVzc2FnZS4gT3B0aW9uYWxseSB5b3UgY2FuIGFkZCBzb21lIGNvZGUgdG8gaGFwcGVuIGJlZm9yZSBhc3NlcnRpb24gdG9vPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWVzc2FnZVwiIHR5cGU9XCJTdHJpbmcgfHwgRnVuY3Rpb25cIj5UaGUgbWVzc2FnZSB0byBiZSB0aHJvd24gd2hlbiB0aGUgbmV3bHkgbWV0aG9kIHdpbGwgYmUgY2FsbGVkLiA8YnIvPkRlZmF1bHRzIHRvOiBOb3QgaW1wbGVtZW50ZWQ8L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwiZnVuY1wiIHR5cGU9XCJGdW5jdGlvblwiIG9wdGlvbmFsPVwidHJ1ZVwiPlNwZWNpZnkgYSBjdXN0b20gZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGJlZm9yZSB0aGUgYXNzZXJ0aW9uIGlzIHRocm93bi48L3BhcmFtPlxyXG5cdFx0dmFyIHJlc3VsdCA9IG1lc3NhZ2UgfHwgZnVuYyA/IChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdG1lc3NhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0aWYgKHR5cGVvZiBmdW5jID09PSBcImZ1bmN0aW9uXCIpXHJcblx0XHRcdFx0ZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIpXHJcblx0XHRcdFx0V0Fzc2VydChmYWxzZSwgbWVzc2FnZSkoKTtcclxuXHRcdFx0ZWxzZSBkZWZhdWx0QWJzdHJhY3RNZXRob2QoKTtcclxuXHRcdH0pLmRlZmluZVN0YXRpYyh7IGFic3RyYWN0OiB0cnVlIH0pIDogZGVmYXVsdEFic3RyYWN0TWV0aG9kO1xyXG5cdFx0V0Fzc2VydCh0cnVlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAocmVzdWx0ICE9IGRlZmF1bHRBYnN0cmFjdE1ldGhvZCkge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdFx0aW50ZWxsaXNlbnNlLnJlZGlyZWN0RGVmaW5pdGlvbihyZXN1bHQsIG1lc3NhZ2UpO1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdFx0aW50ZWxsaXNlbnNlLnJlZGlyZWN0RGVmaW5pdGlvbihyZXN1bHQsIGZ1bmMpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRGdW5jdGlvbi5pbml0TWl4aW5zID0gZnVuY3Rpb24gaW5pdE1peGlucyhvYmplY3RJbnN0YW5jZSkge1xyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5pdGlhbGl6ZXMgdGhlIG1peGlucyBvbiBhbGwgb2YgdGhlIHByb3RvdHlwZXMgb2YgdGhlIGdpdmVuIG9iamVjdCBpbnN0YW5jZTxici8+VGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgb25jZSBwZXIgb2JqZWN0LCB1c3VhbGx5IGluIHRoZSBmaXJzdCBjb25zdHJ1Y3RvciAodGhlIG1vc3QgYmFzZSBjbGFzcyk8L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJvYmplY3RJbnN0YW5jZVwiIHR5cGU9XCJPYmplY3RcIj5UaGUgb2JqZWN0IGluc3RhbmNlIGZvciB3aGljaCB0aGUgbWl4aW5zIG5lZWRzIHRvIGJlIGluaXRpYWxpemVkPC9wYXJhbT5cclxuXHRcdC8vLyA8L3NpZ25hdHVyZT5cclxuXHRcdGlmIChvYmplY3RJbnN0YW5jZSAmJiAhb2JqZWN0SW5zdGFuY2UuX19pbml0TWl4aW5zX18pIHtcclxuXHRcdFx0dmFyIHAgPSBvYmplY3RJbnN0YW5jZSwgbWl4aW5zLCBsZW5ndGgsIGksIG1peGluLCBjYWxsZWRNaXhpbnMgPSB7fTtcclxuXHRcdFx0b2JqZWN0SW5zdGFuY2UuX19pbml0TWl4aW5zX18gPSAxO1xyXG5cdFx0XHRXQXNzZXJ0KHRydWUsICFpc05vZGUgJiYgd2luZG93LmludGVsbGlzZW5zZSAmJiBmdW5jdGlvbiBXQXNzZXJ0KCkge1xyXG5cdFx0XHRcdC8vaGlkZSBfX2luaXRNaXhpbnMgZnJvbSBWUzIwMTIgaW50ZWxsaXNlbnNlXHJcblx0XHRcdFx0b2JqZWN0SW5zdGFuY2UuX19pbml0TWl4aW5zX18gPSB7IF9faGlkZGVuOiB0cnVlIH07XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR3aGlsZSAocCkge1xyXG5cdFx0XHRcdHAgPSBzdXBwb3J0c1Byb3RvID8gcC5fX3Byb3RvX18gOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YocCk7XHJcblx0XHRcdFx0aWYgKHAgJiYgcC5oYXNPd25Qcm9wZXJ0eShcIl9fbWl4aW5zX19cIikgJiYgKG1peGlucyA9IHAuX19taXhpbnNfXykgJiYgKGxlbmd0aCA9IG1peGlucy5sZW5ndGgpKVxyXG5cdFx0XHRcdFx0Zm9yIChpID0gMDsgbWl4aW4gPSBtaXhpbnNbaV0sIGkgPCBsZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0XHQvL1dBc3NlcnQodHJ1ZSwgd2luZG93LmludGVsbGlzZW5zZSAmJiBmdW5jdGlvbiBXQXNzZXJ0KCkge1xyXG5cdFx0XHRcdFx0XHQvL1x0Ly9mb3IgY29ycmVjdCBWUzIwMTIgaW50ZWxsaXNlbnNlLCBhdCB0aGUgdGltZSBvZiBtaXhpbiBkZWNsYXJhdGlvbiB3ZSBuZWVkIHRvIGV4ZWN1dGUgbmV3IG1peGluKCkgcmF0aGVyIHRoYW4gbWl4aW4uY2FsbChvYmplY3RJbnN0YW5jZSwgcCwgcC5jb25zdHJ1Y3Rvcikgb3RoZXJ3aXNlIHRoZSBnbHlwaCBpY29ucyB3aWxsIGxvb2sgbGlrZSB0aGV5IGFyZSBkZWZpbmVkIG9uIG1peGluIC8gcHJvdG90eXBlIHJhdGhlciB0aGFuIG9uIHRoZSBtaXhpbiBpdHNlbGZcclxuXHRcdFx0XHRcdFx0Ly9cdGlmICghKG1peGluIGluIGNhbGxlZE1peGlucykpIHtcclxuXHRcdFx0XHRcdFx0Ly9cdFx0Y2FsbGVkTWl4aW5zW21peGluXSA9IDE7XHJcblx0XHRcdFx0XHRcdC8vXHRcdG5ldyBtaXhpbihwLCBwLmNvbnN0cnVjdG9yKTtcclxuXHRcdFx0XHRcdFx0Ly9cdH1cclxuXHRcdFx0XHRcdFx0Ly99KTtcclxuXHRcdFx0XHRcdFx0aWYgKCEobWl4aW4gaW4gY2FsbGVkTWl4aW5zKSkge1xyXG5cdFx0XHRcdFx0XHRcdGNhbGxlZE1peGluc1ttaXhpbl0gPSAxO1xyXG5cdFx0XHRcdFx0XHRcdG1peGluLmNhbGwob2JqZWN0SW5zdGFuY2UsIHAsIHAuY29uc3RydWN0b3IpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0ZGVsZXRlIG9iamVjdEluc3RhbmNlLl9faW5pdE1peGluc19fO1xyXG5cdFx0fVxyXG5cdH07XHJcblxyXG5cdGlmIChPYmplY3RfZGVmaW5lUHJvcGVydGllcykge1xyXG5cdFx0dmFyIG8gPSB7XHJcblx0XHRcdDA6IFtGdW5jdGlvbiwgXCJpbml0TWl4aW5zXCIsIFwiZGVmaW5lXCIsIFwiYWJzdHJhY3RcIl0sXHJcblx0XHRcdDE6IFtGdW5jdGlvbl9wcm90b3R5cGUsIFwiZmFzdENsYXNzXCIsIFwiaW5oZXJpdFdpdGhcIiwgXCJkZWZpbmVcIiwgXCJkZWZpbmVTdGF0aWNcIl1cclxuXHRcdH1cclxuXHRcdGZvciAodmFyIHAgaW4gbylcclxuXHRcdFx0Zm9yICh2YXIgcHJvcHMgPSBvW3BdLCBvYmogPSBwcm9wc1swXSwgaSA9IDEsIHByb3A7IHByb3AgPSBwcm9wc1tpXSwgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0T2JqZWN0X2RlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgeyBlbnVtZXJhYmxlOiBmYWxzZSwgdmFsdWU6IG9ialtwcm9wXSB9KTtcclxuXHRcdFx0fVxyXG5cdH1cclxuXHJcbn0pKCk7XHJcbi8vLy9VbmNvbW1lbnQgdGhpcyBmb3IgYSBxdWljayBkZW1vICYgc2VsZiB0ZXN0XHJcbi8vLy8vLy8vLy8vLy8vLy8vL09QVElPTiAxOiBpbmhlcml0V2l0aC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8vVXNpbmcgRGVmaW5lOiBcclxuLy8vL0Z1bmN0aW9uLnByb3RvdHlwZS5kZWZpbmUocHJvdG8pIGNvcGllcyB0aGUgZ2l2ZW4gdmFsdWUgZnJvbSBwcm90byB0byBmdW5jdGlvbi5wcm90b3R5cGUgaS5lLiBBIGluIHRoaXMgY2FzZVxyXG5cclxuLy8vLy8vQXRlcm5hdGl2ZSBmb3IgRnVuY3Rpb24uZGVmaW5lIHdlIGNhbiBkbyB0aGlzOlxyXG4vLy8vdmFyIEEgPSBmdW5jdGlvbiAodmFsKSB7XHJcbi8vLy8gICAgIEZ1bmN0aW9uLmluaXRNaXhpbnModGhpcyk7Ly8gc2luY2UgdGhpcyBpcyBhIHRvcCBmdW5jdGlvbiwgd2UgbmVlZCB0byBjYWxsIGluaXRNaXhpbnMgdG8gbWFrZSBzdXJlIHRoZXkgd2lsbCBiZSBpbml0aWFsaXplZC5cclxuLy8vL1x0dGhpcy52YWwgPSB2YWw7XHJcbi8vLy99LmRlZmluZSh7XHJcbi8vLy9cdG1ldGhvZDE6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcbi8vLy9cdFx0dGhpcy54ID0geDtcclxuLy8vL1x0XHR0aGlzLnkgPSB5O1xyXG4vLy8vXHRcdHRoaXMueiA9IHo7XHJcbi8vLy9cdH1cclxuLy8vL30pO1xyXG5cclxuLy8vL1RvIGRlZmluZSB0aGUgdG9wIGxldmVsIChmaXJzdCkgZnVuY3Rpb24gdGhlcmUgaXMgYSBzdWdhciAoYXMgd2VsbCBhcyB0aGUgYWJvdmUgYWx0ZXJuYXRpdmUpXHJcbi8vdmFyIEEgPSBGdW5jdGlvbi5kZWZpbmUoZnVuY3Rpb24odmFsKSB7XHJcbi8vICAgICAvLyB3aGVuIHdlIGFyZSBkZWZpbmluIGEgdG9wIGZ1bmN0aW9uIHdpdGggRnVuY3Rpb24uZGVmaW5lIHdlIERPTidUIG5lZWQgdG8gY2FsbCBpbml0TWl4aW5zIGJlY2F1c2UgdGhleSB3aWxsIGJlIGNhbGxlZCBhdXRvbWF0aWNhbGx5IGZvciB1c1xyXG4vL1x0dGhpcy52YWwgPSB2YWw7XHJcbi8vfSwge1xyXG4vL1x0bWV0aG9kMTogZnVuY3Rpb24gKHgsIHksIHopIHtcclxuLy9cdFx0dGhpcy54ID0geDtcclxuLy9cdFx0dGhpcy55ID0geTtcclxuLy9cdFx0dGhpcy56ID0gejtcclxuLy9cdH1cclxuLy99KTtcclxuXHJcblxyXG4vLy8vRm9sbG93IGRlcnJpdmF0aW9ucyB1c2luZyBpbmhlcml0V2l0aFxyXG5cclxuLy92YXIgQiA9IEEuaW5oZXJpdFdpdGgoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHRyZXR1cm4ge1xyXG4vL1x0XHRjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbCkgeyBiYXNlQ3Rvci5jYWxsKHRoaXMsIHZhbCkgfSxcclxuLy9cdFx0bWV0aG9kMTogZnVuY3Rpb24gKHksIHopIHtcclxuLy9cdFx0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCAneCcsICd5Jywgeik7XHJcbi8vXHRcdH1cclxuLy9cdH07XHJcbi8vfSk7XHJcblxyXG4vL3ZhciBDID0gQi5pbmhlcml0V2l0aChmdW5jdGlvbiAoYmFzZSwgYmFzZUN0b3IpIHtcclxuLy9cdHJldHVybiB7XHJcbi8vXHRcdGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAodmFsKSB7IGJhc2VDdG9yLmNhbGwodGhpcywgdmFsKSB9LFxyXG4vL1x0XHRtZXRob2QxOiBmdW5jdGlvbiAoeikge1xyXG4vL1x0XHRcdGJhc2UubWV0aG9kMS5jYWxsKHRoaXMsICd5Jywgeik7XHJcbi8vXHRcdH1cclxuLy9cdH07XHJcbi8vfSk7XHJcblxyXG4vL3ZhciBEID0gQy5pbmhlcml0V2l0aChmdW5jdGlvbiAoYmFzZSwgYmFzZUN0b3IpIHtcclxuLy9cdHJldHVybiB7XHJcbi8vXHRcdGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAodmFsKSB7IGJhc2VDdG9yLmNhbGwodGhpcywgdmFsKSB9LFxyXG4vL1x0XHRtZXRob2QxOiBmdW5jdGlvbiAoeikge1xyXG4vL1x0XHRcdGJhc2UubWV0aG9kMS5jYWxsKHRoaXMsIHopO1xyXG4vL1x0XHR9XHJcbi8vXHR9O1xyXG4vL30pO1xyXG5cclxuXHJcbi8vc2VsZlRlc3QoKTtcclxuXHJcbi8vLy8vLy8vLy8vLy8vLy8vL09QVElPTiAyOiBmYXN0Q2xhc3MvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vL1VzaW5nIERlZmluZTpcclxuXHJcbi8vLy9BdGVybmF0aXZlIGZvciBGdW5jdGlvbi5kZWZpbmUgd2UgY2FuIGRvIHRoaXM6XHJcbi8vdmFyIEEgPSBmdW5jdGlvbiAodmFsKSB7XHJcbi8vICAgICBGdW5jdGlvbi5pbml0TWl4aW5zKHRoaXMpOy8vIHNpbmNlIHRoaXMgaXMgYSB0b3AgZnVuY3Rpb24sIHdlIG5lZWQgdG8gY2FsbCBpbml0TWl4aW5zIHRvIG1ha2Ugc3VyZSB0aGV5IHdpbGwgYmUgaW5pdGlhbGl6ZWQuXHJcbi8vXHR0aGlzLnZhbCA9IHZhbDtcclxuLy99LmRlZmluZSh7XHJcbi8vXHRtZXRob2QxOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG4vL1x0XHR0aGlzLnggPSB4O1xyXG4vL1x0XHR0aGlzLnkgPSB5O1xyXG4vL1x0XHR0aGlzLnogPSB6O1xyXG4vL1x0fVxyXG4vL30pO1xyXG5cclxuLy8vL1RvIGRlZmluZSB0aGUgdG9wIGxldmVsIChmaXJzdCkgZnVuY3Rpb24gdGhlcmUgaXMgYSBzdWdhciAoYXMgd2VsbCBhcyB0aGUgYWJvdmUgYWx0ZXJuYXRpdmUpXHJcbi8vdmFyIEEgPSBGdW5jdGlvbi5kZWZpbmUoZnVuY3Rpb24gQSh2YWwpIHtcclxuLy8gICAgIC8vIHdoZW4gd2UgYXJlIGRlZmluaW4gYSB0b3AgZnVuY3Rpb24gd2l0aCBGdW5jdGlvbi5kZWZpbmUgd2UgRE9OJ1QgbmVlZCB0byBjYWxsIGluaXRNaXhpbnMgYmVjYXVzZSB0aGV5IHdpbGwgYmUgY2FsbGVkIGF1dG9tYXRpY2FsbHkgZm9yIHVzXHJcbi8vXHR0aGlzLnZhbCA9IHZhbDtcclxuLy99LCB7XHJcbi8vXHRtZXRob2QxOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG4vL1x0XHR0aGlzLnggPSB4O1xyXG4vL1x0XHR0aGlzLnkgPSB5O1xyXG4vL1x0XHR0aGlzLnogPSB6O1xyXG4vL1x0fVxyXG4vL30pO1xyXG5cclxuXHJcbi8vLy9Gb2xsb3cgZGVycml2YXRpb25zIHVzaW5nIGZhc3RDbGFzc1xyXG4vL3ZhciBCID0gQS5mYXN0Q2xhc3MoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHR0aGlzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24gQih2YWwpIHsgYmFzZUN0b3IuY2FsbCh0aGlzLCB2YWwpIH07XHJcbi8vXHR0aGlzLm1ldGhvZDEgPSBmdW5jdGlvbiAoeSwgeikge1xyXG4vL1x0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCAneCcsIHksIHopO1xyXG4vL1x0fVxyXG4vL30pO1xyXG4vL3ZhciBDID0gQi5mYXN0Q2xhc3MoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHR0aGlzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24gQyh2YWwpIHsgYmFzZUN0b3IuY2FsbCh0aGlzLCB2YWwpIH07XHJcbi8vXHR0aGlzLm1ldGhvZDEgPSBmdW5jdGlvbiAoeikge1xyXG4vL1x0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCAneScsIHopO1xyXG4vL1x0fTtcclxuLy99KTtcclxuXHJcbi8vdmFyIEQgPSBDLmZhc3RDbGFzcyhmdW5jdGlvbiAoYmFzZSwgYmFzZUN0b3IpIHtcclxuLy9cdHRoaXMuY29uc3RydWN0b3IgPSBmdW5jdGlvbiBEKHZhbCkgeyBiYXNlQ3Rvci5jYWxsKHRoaXMsIHZhbCkgfTtcclxuLy9cdHRoaXMubWV0aG9kMSA9IGZ1bmN0aW9uICh6KSB7XHJcbi8vXHRcdGJhc2UubWV0aG9kMS5jYWxsKHRoaXMsIHopO1xyXG4vL1x0fTtcclxuLy99KTtcclxuXHJcbi8vLy9zZWxmVGVzdCgpO1xyXG5cclxuLy9mdW5jdGlvbiBzZWxmVGVzdCgpIHtcclxuLy9cdHZhciBhID0gbmV3IEEoXCJhXCIpO1xyXG4vL1x0YS5tZXRob2QxKFwieFwiLCBcInlcIiwgXCJ6XCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYS54ID09IFwieFwiLCBcImEueCBzaG91bGQgYmUgc2V0IHRvICd4J1wiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGEueSA9PSBcInlcIiwgXCJhLnkgc2hvdWxkIGJlIHNldCB0byAneSdcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChhLnogPT0gXCJ6XCIsIFwiYS56IHNob3VsZCBiZSBzZXQgdG8gJ3onXCIpO1xyXG4vL1x0dmFyIGIgPSBuZXcgQihcImJcIik7XHJcbi8vXHRiLm1ldGhvZDEoXCJ5XCIsIFwielwiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGIueCA9PSBcInhcIiwgXCJiLnggc2hvdWxkIGJlIHNldCB0byAneCdcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChiLnkgPT0gXCJ5XCIsIFwiYi55IHNob3VsZCBiZSBzZXQgdG8gJ3knXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYi56ID09IFwielwiLCBcImIueiBzaG91bGQgYmUgc2V0IHRvICd6J1wiKTtcclxuLy9cdHZhciBjID0gbmV3IEMoXCJjXCIpO1xyXG4vL1x0Yy5tZXRob2QxKFwielwiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGMueCA9PSBcInhcIiwgXCJjLnggc2hvdWxkIGJlIHNldCB0byAneCdcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChjLnkgPT0gXCJ5XCIsIFwiYy55IHNob3VsZCBiZSBzZXQgdG8gJ3knXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYy56ID09IFwielwiLCBcImMueiBzaG91bGQgYmUgc2V0IHRvICd6J1wiKTtcclxuXHJcbi8vXHR2YXIgZCA9IG5ldyBEKFwiZFwiKTtcclxuLy9cdGQubWV0aG9kMShcIndcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChkLnggPT0gXCJ4XCIsIFwiZC54IHNob3VsZCBiZSBzZXQgdG8gJ3gnXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoZC55ID09IFwieVwiLCBcImQueSBzaG91bGQgYmUgc2V0IHRvICd5J1wiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGQueiA9PSBcIndcIiwgXCJkLnogc2hvdWxkIGJlIHNldCB0byAndydcIik7XHJcblxyXG4vL1x0dmFyIGV4cGVjdGVkcyA9IHtcclxuLy9cdFx0XCJkIGluc3RhbmNlb2YgQVwiOiB0cnVlLFxyXG4vL1x0XHRcImQgaW5zdGFuY2VvZiBCXCI6IHRydWUsXHJcbi8vXHRcdFwiZCBpbnN0YW5jZW9mIENcIjogdHJ1ZSxcclxuLy9cdFx0XCJkIGluc3RhbmNlb2YgRFwiOiB0cnVlLFxyXG4vL1x0XHRcImMgaW5zdGFuY2VvZiBBXCI6IHRydWUsXHJcbi8vXHRcdFwiYyBpbnN0YW5jZW9mIEJcIjogdHJ1ZSxcclxuLy9cdFx0XCJjIGluc3RhbmNlb2YgQ1wiOiB0cnVlLFxyXG4vL1x0XHRcImIgaW5zdGFuY2VvZiBBXCI6IHRydWUsXHJcbi8vXHRcdFwiYiBpbnN0YW5jZW9mIEJcIjogdHJ1ZSxcclxuLy9cdFx0XCJiIGluc3RhbmNlb2YgQ1wiOiBmYWxzZSxcclxuLy9cdFx0XCJhIGluc3RhbmNlb2YgQVwiOiB0cnVlLFxyXG4vL1x0XHRcImEgaW5zdGFuY2VvZiBCXCI6IGZhbHNlLFxyXG4vL1x0XHRcImEgaW5zdGFuY2VvZiBDXCI6IGZhbHNlLFxyXG4vL1wiQS5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IGEuY29uc3RydWN0b3IgJiYgYS5jb25zdHJ1Y3RvciA9PT0gQS5jb25zdHJ1Y3RvclwiOiB0cnVlLC8vdGhpcyBzaG91bGQgbm90IGVxdWFsIHRvIEEgaXRzZWxmIGR1ZSB0byBtaXhpbnMgYmFzZSBmdW5jdGlvblxyXG4vL1wiQi5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IGIuY29uc3RydWN0b3IgJiYgYi5jb25zdHJ1Y3RvciA9PT0gQiAmJiBCID09IEIuY29uc3RydWN0b3JcIjogdHJ1ZSxcclxuLy9cIkMucHJvdG90eXBlLmNvbnN0cnVjdG9yID09PSBjLmNvbnN0cnVjdG9yICYmIGMuY29uc3RydWN0b3IgPT09IEMgJiYgQiA9PSBCLmNvbnN0cnVjdG9yXCI6IHRydWUsXHJcbi8vXCJELnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9PT0gZC5jb25zdHJ1Y3RvciAmJiBkLmNvbnN0cnVjdG9yID09PSBEICYmIEIgPT0gQi5jb25zdHJ1Y3RvclwiOiB0cnVlLFxyXG4vL31cclxuLy9cdGZvciAodmFyIGV4cGVjdGVkS2V5IGluIGV4cGVjdGVkcykge1xyXG4vL1x0XHR2YXIgZXhwZWN0ZWQgPSBleHBlY3RlZHNbZXhwZWN0ZWRLZXldO1xyXG4vL1x0XHR2YXIgYWN0dWFsID0gZXZhbChleHBlY3RlZEtleSk7Ly91c2luZyBldmFsIGZvciBxdWljayBkZW1vIHNlbGYgdGVzdCBwdXJwb3NpbmcgLS0gdXNpbmcgZXZhbCBpcyBub3QgcmVjb21tZW5kZWQgb3RoZXJ3aXNlXHJcbi8vXHRcdGNvbnNvbGUuYXNzZXJ0KCEoZXhwZWN0ZWQgXiBhY3R1YWwpLCBleHBlY3RlZEtleSArIFwiIGV4cGVjdGVkOiBcIiArIGV4cGVjdGVkICsgXCIsIGFjdHVhbDogXCIgKyBhY3R1YWwpO1xyXG4vL1x0fVxyXG4vL31cclxuLy9jb25zb2xlLmxvZyhcIklmIHRoZXJlIGFyZSBubyBhc3NlcnRzIGluIHRoZSBjb25zb2xlIHRoZW4gYWxsIHRlc3RzIGhhdmUgcGFzc2VkISB5ZXkgOilcIilcclxuXHJcbi8vLy9kZWZpbmluZyBhIG1peGluXHJcbi8vdmFyIFBvaW50ID0gZnVuY3Rpb24gUG9pbnQoKSB7XHJcbi8vXHR0aGlzLnBvaW50ID0geyB4OiAxLCB5OiAyIH07XHJcbi8vfS5kZWZpbmUoe1xyXG4vL1x0eDogZnVuY3Rpb24geCh4KSB7XHJcbi8vXHRcdC8vLyA8cGFyYW0gbmFtZT1cInhcIiBvcHRpb25hbD1cInRydWVcIj5TcGVjaWZ5IGEgdmFsdWUgdG8gc2V0IHRoZSBwb2ludC54LiBEb24ndCBzcGVjaWZ5IGFueXRoaW5nIHdpbGwgcmV0cmlldmUgcG9pbnQueDwvcGFyYW0+XHJcbi8vXHRcdHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRoaXMucG9pbnQueCA9IHgpICYmIHRoaXMgfHwgdGhpcyA6IHRoaXMucG9pbnQueDtcclxuLy9cdH0sXHJcbi8vXHR5OiBmdW5jdGlvbiB5KHkpIHtcclxuLy9cdFx0Ly8vIDxwYXJhbSBuYW1lPVwieVwiIG9wdGlvbmFsPVwidHJ1ZVwiPlNwZWNpZnkgYSB2YWx1ZSB0byBzZXQgdGhlIHBvaW50LnkuIERvbid0IHNwZWNpZnkgYW55dGhpbmcgd2lsbCByZXRyaWV2ZSBwb2ludC55PC9wYXJhbT5cclxuLy9cdFx0cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodGhpcy5wb2ludC55ID0geSkgJiYgdGhpcyB8fCB0aGlzIDogdGhpcy5wb2ludC55O1xyXG4vL1x0fVxyXG4vL30pO1xyXG5cclxuLy8vL3JlZmVyZW5jaW5nIHRoZSBtaXhpbjpcclxuLy92YXIgRSA9IEQuaW5oZXJpdFdpdGgoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHRyZXR1cm4ge1xyXG4vL1x0XHQvL25vIGNvbnN0cnVjdG9yICEhIC0gaXQgd2lsbCBiZSBhZGRlZCBhdXRvbWF0aWNhbGx5IGZvciB1c1xyXG4vL1x0XHRtZXRob2QxOiBmdW5jdGlvbiAoeikge1xyXG4vL1x0XHRcdGJhc2UubWV0aG9kMS5jYWxsKHRoaXMsIHopO1xyXG4vL1x0XHR9XHJcbi8vXHR9O1xyXG4vL30sIFBvaW50Ly9zcGVjaWZ5aW5nIHplcm8gb3IgbW9yZSBtaXhpbnMgLSBjb21tYSBzZXBhcmF0ZWRcclxuLy8pO1xyXG5cclxuLy92YXIgZSA9IG5ldyBFKCk7XHJcbi8vZS54KDIpOy8vc2V0cyBlLnBvaW50LnggdG8gMlxyXG4vL2NvbnNvbGUubG9nKFwibWl4aW4gUG9pbnQueCBleHBlY3RlZCB0byByZXR1cm4gMi4gQWN0dWFsOiBcIiwgZS54KCkpOy8vcmV0dXJucyAyXHJcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvLyBLbm9ja291dCBKYXZhU2NyaXB0IGxpYnJhcnkgdjMuMS4wXG4vLyAoYykgU3RldmVuIFNhbmRlcnNvbiAtIGh0dHA6Ly9rbm9ja291dGpzLmNvbS9cbi8vIExpY2Vuc2U6IE1JVCAoaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHApXG5cbihmdW5jdGlvbigpe1xudmFyIERFQlVHPXRydWU7XG4oZnVuY3Rpb24odW5kZWZpbmVkKXtcbiAgICAvLyAoMCwgZXZhbCkoJ3RoaXMnKSBpcyBhIHJvYnVzdCB3YXkgb2YgZ2V0dGluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdFxuICAgIC8vIEZvciBkZXRhaWxzLCBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDExOTk4OC9yZXR1cm4tdGhpcy0wLWV2YWx0aGlzLzE0MTIwMDIzIzE0MTIwMDIzXG4gICAgdmFyIHdpbmRvdyA9IHRoaXMgfHwgKDAsIGV2YWwpKCd0aGlzJyksXG4gICAgICAgIGRvY3VtZW50ID0gd2luZG93Wydkb2N1bWVudCddLFxuICAgICAgICBuYXZpZ2F0b3IgPSB3aW5kb3dbJ25hdmlnYXRvciddLFxuICAgICAgICBqUXVlcnkgPSB3aW5kb3dbXCJqUXVlcnlcIl0sXG4gICAgICAgIEpTT04gPSB3aW5kb3dbXCJKU09OXCJdO1xuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICAvLyBTdXBwb3J0IHRocmVlIG1vZHVsZSBsb2FkaW5nIHNjZW5hcmlvc1xuICAgIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gWzFdIENvbW1vbkpTL05vZGUuanNcbiAgICAgICAgdmFyIHRhcmdldCA9IG1vZHVsZVsnZXhwb3J0cyddIHx8IGV4cG9ydHM7IC8vIG1vZHVsZS5leHBvcnRzIGlzIGZvciBOb2RlLmpzXG4gICAgICAgIGZhY3RvcnkodGFyZ2V0KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgICAvLyBbMl0gQU1EIGFub255bW91cyBtb2R1bGVcbiAgICAgICAgZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBbM10gTm8gbW9kdWxlIGxvYWRlciAocGxhaW4gPHNjcmlwdD4gdGFnKSAtIHB1dCBkaXJlY3RseSBpbiBnbG9iYWwgbmFtZXNwYWNlXG4gICAgICAgIGZhY3Rvcnkod2luZG93WydrbyddID0ge30pO1xuICAgIH1cbn0oZnVuY3Rpb24oa29FeHBvcnRzKXtcbi8vIEludGVybmFsbHksIGFsbCBLTyBvYmplY3RzIGFyZSBhdHRhY2hlZCB0byBrb0V4cG9ydHMgKGV2ZW4gdGhlIG5vbi1leHBvcnRlZCBvbmVzIHdob3NlIG5hbWVzIHdpbGwgYmUgbWluaWZpZWQgYnkgdGhlIGNsb3N1cmUgY29tcGlsZXIpLlxuLy8gSW4gdGhlIGZ1dHVyZSwgdGhlIGZvbGxvd2luZyBcImtvXCIgdmFyaWFibGUgbWF5IGJlIG1hZGUgZGlzdGluY3QgZnJvbSBcImtvRXhwb3J0c1wiIHNvIHRoYXQgcHJpdmF0ZSBvYmplY3RzIGFyZSBub3QgZXh0ZXJuYWxseSByZWFjaGFibGUuXG52YXIga28gPSB0eXBlb2Yga29FeHBvcnRzICE9PSAndW5kZWZpbmVkJyA/IGtvRXhwb3J0cyA6IHt9O1xuLy8gR29vZ2xlIENsb3N1cmUgQ29tcGlsZXIgaGVscGVycyAodXNlZCBvbmx5IHRvIG1ha2UgdGhlIG1pbmlmaWVkIGZpbGUgc21hbGxlcilcbmtvLmV4cG9ydFN5bWJvbCA9IGZ1bmN0aW9uKGtvUGF0aCwgb2JqZWN0KSB7XG5cdHZhciB0b2tlbnMgPSBrb1BhdGguc3BsaXQoXCIuXCIpO1xuXG5cdC8vIEluIHRoZSBmdXR1cmUsIFwia29cIiBtYXkgYmVjb21lIGRpc3RpbmN0IGZyb20gXCJrb0V4cG9ydHNcIiAoc28gdGhhdCBub24tZXhwb3J0ZWQgb2JqZWN0cyBhcmUgbm90IHJlYWNoYWJsZSlcblx0Ly8gQXQgdGhhdCBwb2ludCwgXCJ0YXJnZXRcIiB3b3VsZCBiZSBzZXQgdG86ICh0eXBlb2Yga29FeHBvcnRzICE9PSBcInVuZGVmaW5lZFwiID8ga29FeHBvcnRzIDoga28pXG5cdHZhciB0YXJnZXQgPSBrbztcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGggLSAxOyBpKyspXG5cdFx0dGFyZ2V0ID0gdGFyZ2V0W3Rva2Vuc1tpXV07XG5cdHRhcmdldFt0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdXSA9IG9iamVjdDtcbn07XG5rby5leHBvcnRQcm9wZXJ0eSA9IGZ1bmN0aW9uKG93bmVyLCBwdWJsaWNOYW1lLCBvYmplY3QpIHtcbiAgb3duZXJbcHVibGljTmFtZV0gPSBvYmplY3Q7XG59O1xua28udmVyc2lvbiA9IFwiMy4xLjBcIjtcblxua28uZXhwb3J0U3ltYm9sKCd2ZXJzaW9uJywga28udmVyc2lvbik7XG5rby51dGlscyA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gb2JqZWN0Rm9yRWFjaChvYmosIGFjdGlvbikge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbihwcm9wLCBvYmpbcHJvcF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgICAgIGZvcih2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZihzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKG9iaiwgcHJvdG8pIHtcbiAgICAgICAgb2JqLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cblxuICAgIHZhciBjYW5TZXRQcm90b3R5cGUgPSAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSk7XG5cbiAgICAvLyBSZXByZXNlbnQgdGhlIGtub3duIGV2ZW50IHR5cGVzIGluIGEgY29tcGFjdCB3YXksIHRoZW4gYXQgcnVudGltZSB0cmFuc2Zvcm0gaXQgaW50byBhIGhhc2ggd2l0aCBldmVudCBuYW1lIGFzIGtleSAoZm9yIGZhc3QgbG9va3VwKVxuICAgIHZhciBrbm93bkV2ZW50cyA9IHt9LCBrbm93bkV2ZW50VHlwZXNCeUV2ZW50TmFtZSA9IHt9O1xuICAgIHZhciBrZXlFdmVudFR5cGVOYW1lID0gKG5hdmlnYXRvciAmJiAvRmlyZWZveFxcLzIvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSA/ICdLZXlib2FyZEV2ZW50JyA6ICdVSUV2ZW50cyc7XG4gICAga25vd25FdmVudHNba2V5RXZlbnRUeXBlTmFtZV0gPSBbJ2tleXVwJywgJ2tleWRvd24nLCAna2V5cHJlc3MnXTtcbiAgICBrbm93bkV2ZW50c1snTW91c2VFdmVudHMnXSA9IFsnY2xpY2snLCAnZGJsY2xpY2snLCAnbW91c2Vkb3duJywgJ21vdXNldXAnLCAnbW91c2Vtb3ZlJywgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXTtcbiAgICBvYmplY3RGb3JFYWNoKGtub3duRXZlbnRzLCBmdW5jdGlvbihldmVudFR5cGUsIGtub3duRXZlbnRzRm9yVHlwZSkge1xuICAgICAgICBpZiAoa25vd25FdmVudHNGb3JUeXBlLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBrbm93bkV2ZW50c0ZvclR5cGUubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIGtub3duRXZlbnRUeXBlc0J5RXZlbnROYW1lW2tub3duRXZlbnRzRm9yVHlwZVtpXV0gPSBldmVudFR5cGU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgZXZlbnRzVGhhdE11c3RCZVJlZ2lzdGVyZWRVc2luZ0F0dGFjaEV2ZW50ID0geyAncHJvcGVydHljaGFuZ2UnOiB0cnVlIH07IC8vIFdvcmthcm91bmQgZm9yIGFuIElFOSBpc3N1ZSAtIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvNDA2XG5cbiAgICAvLyBEZXRlY3QgSUUgdmVyc2lvbnMgZm9yIGJ1ZyB3b3JrYXJvdW5kcyAodXNlcyBJRSBjb25kaXRpb25hbHMsIG5vdCBVQSBzdHJpbmcsIGZvciByb2J1c3RuZXNzKVxuICAgIC8vIE5vdGUgdGhhdCwgc2luY2UgSUUgMTAgZG9lcyBub3Qgc3VwcG9ydCBjb25kaXRpb25hbCBjb21tZW50cywgdGhlIGZvbGxvd2luZyBsb2dpYyBvbmx5IGRldGVjdHMgSUUgPCAxMC5cbiAgICAvLyBDdXJyZW50bHkgdGhpcyBpcyBieSBkZXNpZ24sIHNpbmNlIElFIDEwKyBiZWhhdmVzIGNvcnJlY3RseSB3aGVuIHRyZWF0ZWQgYXMgYSBzdGFuZGFyZCBicm93c2VyLlxuICAgIC8vIElmIHRoZXJlIGlzIGEgZnV0dXJlIG5lZWQgdG8gZGV0ZWN0IHNwZWNpZmljIHZlcnNpb25zIG9mIElFMTArLCB3ZSB3aWxsIGFtZW5kIHRoaXMuXG4gICAgdmFyIGllVmVyc2lvbiA9IGRvY3VtZW50ICYmIChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZlcnNpb24gPSAzLCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwgaUVsZW1zID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpJyk7XG5cbiAgICAgICAgLy8gS2VlcCBjb25zdHJ1Y3RpbmcgY29uZGl0aW9uYWwgSFRNTCBibG9ja3MgdW50aWwgd2UgaGl0IG9uZSB0aGF0IHJlc29sdmVzIHRvIGFuIGVtcHR5IGZyYWdtZW50XG4gICAgICAgIHdoaWxlIChcbiAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSAnPCEtLVtpZiBndCBJRSAnICsgKCsrdmVyc2lvbikgKyAnXT48aT48L2k+PCFbZW5kaWZdLS0+JyxcbiAgICAgICAgICAgIGlFbGVtc1swXVxuICAgICAgICApIHt9XG4gICAgICAgIHJldHVybiB2ZXJzaW9uID4gNCA/IHZlcnNpb24gOiB1bmRlZmluZWQ7XG4gICAgfSgpKTtcbiAgICB2YXIgaXNJZTYgPSBpZVZlcnNpb24gPT09IDYsXG4gICAgICAgIGlzSWU3ID0gaWVWZXJzaW9uID09PSA3O1xuXG4gICAgZnVuY3Rpb24gaXNDbGlja09uQ2hlY2thYmxlRWxlbWVudChlbGVtZW50LCBldmVudFR5cGUpIHtcbiAgICAgICAgaWYgKChrby51dGlscy50YWdOYW1lTG93ZXIoZWxlbWVudCkgIT09IFwiaW5wdXRcIikgfHwgIWVsZW1lbnQudHlwZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoZXZlbnRUeXBlLnRvTG93ZXJDYXNlKCkgIT0gXCJjbGlja1wiKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBpbnB1dFR5cGUgPSBlbGVtZW50LnR5cGU7XG4gICAgICAgIHJldHVybiAoaW5wdXRUeXBlID09IFwiY2hlY2tib3hcIikgfHwgKGlucHV0VHlwZSA9PSBcInJhZGlvXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGZpZWxkc0luY2x1ZGVkV2l0aEpzb25Qb3N0OiBbJ2F1dGhlbnRpY2l0eV90b2tlbicsIC9eX19SZXF1ZXN0VmVyaWZpY2F0aW9uVG9rZW4oXy4qKT8kL10sXG5cbiAgICAgICAgYXJyYXlGb3JFYWNoOiBmdW5jdGlvbiAoYXJyYXksIGFjdGlvbikge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgYWN0aW9uKGFycmF5W2ldLCBpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheUluZGV4T2Y6IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYXJyYXksIGl0ZW0pO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheUZpcnN0OiBmdW5jdGlvbiAoYXJyYXksIHByZWRpY2F0ZSwgcHJlZGljYXRlT3duZXIpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChwcmVkaWNhdGVPd25lciwgYXJyYXlbaV0sIGkpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXlbaV07XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheVJlbW92ZUl0ZW06IGZ1bmN0aW9uIChhcnJheSwgaXRlbVRvUmVtb3ZlKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBrby51dGlscy5hcnJheUluZGV4T2YoYXJyYXksIGl0ZW1Ub1JlbW92ZSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXJyYXkuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheUdldERpc3RpbmN0VmFsdWVzOiBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICAgICAgICAgIGFycmF5ID0gYXJyYXkgfHwgW107XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChrby51dGlscy5hcnJheUluZGV4T2YocmVzdWx0LCBhcnJheVtpXSkgPCAwKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5TWFwOiBmdW5jdGlvbiAoYXJyYXksIG1hcHBpbmcpIHtcbiAgICAgICAgICAgIGFycmF5ID0gYXJyYXkgfHwgW107XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtYXBwaW5nKGFycmF5W2ldLCBpKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5RmlsdGVyOiBmdW5jdGlvbiAoYXJyYXksIHByZWRpY2F0ZSkge1xuICAgICAgICAgICAgYXJyYXkgPSBhcnJheSB8fCBbXTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaV0sIGkpKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFycmF5UHVzaEFsbDogZnVuY3Rpb24gKGFycmF5LCB2YWx1ZXNUb1B1c2gpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZXNUb1B1c2ggaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoLmFwcGx5KGFycmF5LCB2YWx1ZXNUb1B1c2gpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmFsdWVzVG9QdXNoLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh2YWx1ZXNUb1B1c2hbaV0pO1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZE9yUmVtb3ZlSXRlbTogZnVuY3Rpb24oYXJyYXksIHZhbHVlLCBpbmNsdWRlZCkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nRW50cnlJbmRleCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZihrby51dGlscy5wZWVrT2JzZXJ2YWJsZShhcnJheSksIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ0VudHJ5SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVkKVxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbmNsdWRlZClcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkuc3BsaWNlKGV4aXN0aW5nRW50cnlJbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FuU2V0UHJvdG90eXBlOiBjYW5TZXRQcm90b3R5cGUsXG5cbiAgICAgICAgZXh0ZW5kOiBleHRlbmQsXG5cbiAgICAgICAgc2V0UHJvdG90eXBlT2Y6IHNldFByb3RvdHlwZU9mLFxuXG4gICAgICAgIHNldFByb3RvdHlwZU9mT3JFeHRlbmQ6IGNhblNldFByb3RvdHlwZSA/IHNldFByb3RvdHlwZU9mIDogZXh0ZW5kLFxuXG4gICAgICAgIG9iamVjdEZvckVhY2g6IG9iamVjdEZvckVhY2gsXG5cbiAgICAgICAgb2JqZWN0TWFwOiBmdW5jdGlvbihzb3VyY2UsIG1hcHBpbmcpIHtcbiAgICAgICAgICAgIGlmICghc291cmNlKVxuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gbWFwcGluZyhzb3VyY2VbcHJvcF0sIHByb3AsIHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfSxcblxuICAgICAgICBlbXB0eURvbU5vZGU6IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB3aGlsZSAoZG9tTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAga28ucmVtb3ZlTm9kZShkb21Ob2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVDbGVhbmVkTm9kZXNUb0NvbnRhaW5lckVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgICAgICAgICAvLyBFbnN1cmUgaXQncyBhIHJlYWwgYXJyYXksIGFzIHdlJ3JlIGFib3V0IHRvIHJlcGFyZW50IHRoZSBub2RlcyBhbmRcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdGhlIHVuZGVybHlpbmcgY29sbGVjdGlvbiB0byBjaGFuZ2Ugd2hpbGUgd2UncmUgZG9pbmcgdGhhdC5cbiAgICAgICAgICAgIHZhciBub2Rlc0FycmF5ID0ga28udXRpbHMubWFrZUFycmF5KG5vZGVzKTtcblxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBub2Rlc0FycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChrby5jbGVhbk5vZGUobm9kZXNBcnJheVtpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9uZU5vZGVzOiBmdW5jdGlvbiAobm9kZXNBcnJheSwgc2hvdWxkQ2xlYW5Ob2Rlcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBub2Rlc0FycmF5Lmxlbmd0aCwgbmV3Tm9kZXNBcnJheSA9IFtdOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNsb25lZE5vZGUgPSBub2Rlc0FycmF5W2ldLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBuZXdOb2Rlc0FycmF5LnB1c2goc2hvdWxkQ2xlYW5Ob2RlcyA/IGtvLmNsZWFuTm9kZShjbG9uZWROb2RlKSA6IGNsb25lZE5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld05vZGVzQXJyYXk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RG9tTm9kZUNoaWxkcmVuOiBmdW5jdGlvbiAoZG9tTm9kZSwgY2hpbGROb2Rlcykge1xuICAgICAgICAgICAga28udXRpbHMuZW1wdHlEb21Ob2RlKGRvbU5vZGUpO1xuICAgICAgICAgICAgaWYgKGNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGNoaWxkTm9kZXMubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLmFwcGVuZENoaWxkKGNoaWxkTm9kZXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlcGxhY2VEb21Ob2RlczogZnVuY3Rpb24gKG5vZGVUb1JlcGxhY2VPck5vZGVBcnJheSwgbmV3Tm9kZXNBcnJheSkge1xuICAgICAgICAgICAgdmFyIG5vZGVzVG9SZXBsYWNlQXJyYXkgPSBub2RlVG9SZXBsYWNlT3JOb2RlQXJyYXkubm9kZVR5cGUgPyBbbm9kZVRvUmVwbGFjZU9yTm9kZUFycmF5XSA6IG5vZGVUb1JlcGxhY2VPck5vZGVBcnJheTtcbiAgICAgICAgICAgIGlmIChub2Rlc1RvUmVwbGFjZUFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5zZXJ0aW9uUG9pbnQgPSBub2Rlc1RvUmVwbGFjZUFycmF5WzBdO1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnQgPSBpbnNlcnRpb25Qb2ludC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbmV3Tm9kZXNBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUobmV3Tm9kZXNBcnJheVtpXSwgaW5zZXJ0aW9uUG9pbnQpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbm9kZXNUb1JlcGxhY2VBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAga28ucmVtb3ZlTm9kZShub2Rlc1RvUmVwbGFjZUFycmF5W2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4VXBDb250aW51b3VzTm9kZUFycmF5OiBmdW5jdGlvbihjb250aW51b3VzTm9kZUFycmF5LCBwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAvLyBCZWZvcmUgYWN0aW5nIG9uIGEgc2V0IG9mIG5vZGVzIHRoYXQgd2VyZSBwcmV2aW91c2x5IG91dHB1dHRlZCBieSBhIHRlbXBsYXRlIGZ1bmN0aW9uLCB3ZSBoYXZlIHRvIHJlY29uY2lsZVxuICAgICAgICAgICAgLy8gdGhlbSBhZ2FpbnN0IHdoYXQgaXMgaW4gdGhlIERPTSByaWdodCBub3cuIEl0IG1heSBiZSB0aGF0IHNvbWUgb2YgdGhlIG5vZGVzIGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQsIG9yIHRoYXRcbiAgICAgICAgICAgIC8vIG5ldyBub2RlcyBtaWdodCBoYXZlIGJlZW4gaW5zZXJ0ZWQgaW4gdGhlIG1pZGRsZSwgZm9yIGV4YW1wbGUgYnkgYSBiaW5kaW5nLiBBbHNvLCB0aGVyZSBtYXkgcHJldmlvdXNseSBoYXZlIGJlZW5cbiAgICAgICAgICAgIC8vIGxlYWRpbmcgY29tbWVudCBub2RlcyAoY3JlYXRlZCBieSByZXdyaXR0ZW4gc3RyaW5nLWJhc2VkIHRlbXBsYXRlcykgdGhhdCBoYXZlIHNpbmNlIGJlZW4gcmVtb3ZlZCBkdXJpbmcgYmluZGluZy5cbiAgICAgICAgICAgIC8vIFNvLCB0aGlzIGZ1bmN0aW9uIHRyYW5zbGF0ZXMgdGhlIG9sZCBcIm1hcFwiIG91dHB1dCBhcnJheSBpbnRvIGl0cyBiZXN0IGd1ZXNzIG9mIHRoZSBzZXQgb2YgY3VycmVudCBET00gbm9kZXMuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gUnVsZXM6XG4gICAgICAgICAgICAvLyAgIFtBXSBBbnkgbGVhZGluZyBub2RlcyB0aGF0IGhhdmUgYmVlbiByZW1vdmVkIHNob3VsZCBiZSBpZ25vcmVkXG4gICAgICAgICAgICAvLyAgICAgICBUaGVzZSBtb3N0IGxpa2VseSBjb3JyZXNwb25kIHRvIG1lbW9pemF0aW9uIG5vZGVzIHRoYXQgd2VyZSBhbHJlYWR5IHJlbW92ZWQgZHVyaW5nIGJpbmRpbmdcbiAgICAgICAgICAgIC8vICAgICAgIFNlZSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvcHVsbC80NDBcbiAgICAgICAgICAgIC8vICAgW0JdIFdlIHdhbnQgdG8gb3V0cHV0IGEgY29udGludW91cyBzZXJpZXMgb2Ygbm9kZXMuIFNvLCBpZ25vcmUgYW55IG5vZGVzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gcmVtb3ZlZCxcbiAgICAgICAgICAgIC8vICAgICAgIGFuZCBpbmNsdWRlIGFueSBub2RlcyB0aGF0IGhhdmUgYmVlbiBpbnNlcnRlZCBhbW9uZyB0aGUgcHJldmlvdXMgY29sbGVjdGlvblxuXG4gICAgICAgICAgICBpZiAoY29udGludW91c05vZGVBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcGFyZW50IG5vZGUgY2FuIGJlIGEgdmlydHVhbCBlbGVtZW50OyBzbyBnZXQgdGhlIHJlYWwgcGFyZW50IG5vZGVcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gKHBhcmVudE5vZGUubm9kZVR5cGUgPT09IDggJiYgcGFyZW50Tm9kZS5wYXJlbnROb2RlKSB8fCBwYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgLy8gUnVsZSBbQV1cbiAgICAgICAgICAgICAgICB3aGlsZSAoY29udGludW91c05vZGVBcnJheS5sZW5ndGggJiYgY29udGludW91c05vZGVBcnJheVswXS5wYXJlbnROb2RlICE9PSBwYXJlbnROb2RlKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBSdWxlIFtCXVxuICAgICAgICAgICAgICAgIGlmIChjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBjb250aW51b3VzTm9kZUFycmF5WzBdLCBsYXN0ID0gY29udGludW91c05vZGVBcnJheVtjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHdpdGggdGhlIGFjdHVhbCBuZXcgY29udGludW91cyBub2RlIHNldFxuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBsYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnB1c2goY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudCkgLy8gV29uJ3QgaGFwcGVuLCBleGNlcHQgaWYgdGhlIGRldmVsb3BlciBoYXMgbWFudWFsbHkgcmVtb3ZlZCBzb21lIERPTSBlbGVtZW50cyAodGhlbiB3ZSdyZSBpbiBhbiB1bmRlZmluZWQgc2NlbmFyaW8pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVvdXNOb2RlQXJyYXkucHVzaChsYXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGludW91c05vZGVBcnJheTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25Ob2RlU2VsZWN0aW9uU3RhdGU6IGZ1bmN0aW9uIChvcHRpb25Ob2RlLCBpc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAvLyBJRTYgc29tZXRpbWVzIHRocm93cyBcInVua25vd24gZXJyb3JcIiBpZiB5b3UgdHJ5IHRvIHdyaXRlIHRvIC5zZWxlY3RlZCBkaXJlY3RseSwgd2hlcmVhcyBGaXJlZm94IHN0cnVnZ2xlcyB3aXRoIHNldEF0dHJpYnV0ZS4gUGljayBvbmUgYmFzZWQgb24gYnJvd3Nlci5cbiAgICAgICAgICAgIGlmIChpZVZlcnNpb24gPCA3KVxuICAgICAgICAgICAgICAgIG9wdGlvbk5vZGUuc2V0QXR0cmlidXRlKFwic2VsZWN0ZWRcIiwgaXNTZWxlY3RlZCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb3B0aW9uTm9kZS5zZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyaW5nVHJpbTogZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZyA9PT0gbnVsbCB8fCBzdHJpbmcgPT09IHVuZGVmaW5lZCA/ICcnIDpcbiAgICAgICAgICAgICAgICBzdHJpbmcudHJpbSA/XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZy50cmltKCkgOlxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcudG9TdHJpbmcoKS5yZXBsYWNlKC9eW1xcc1xceGEwXSt8W1xcc1xceGEwXSskL2csICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdHJpbmdUb2tlbml6ZTogZnVuY3Rpb24gKHN0cmluZywgZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICB2YXIgdG9rZW5zID0gKHN0cmluZyB8fCBcIlwiKS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSB0b2tlbnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRyaW1tZWQgPSBrby51dGlscy5zdHJpbmdUcmltKHRva2Vuc1tpXSk7XG4gICAgICAgICAgICAgICAgaWYgKHRyaW1tZWQgIT09IFwiXCIpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRyaW1tZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBzdHJpbmdTdGFydHNXaXRoOiBmdW5jdGlvbiAoc3RyaW5nLCBzdGFydHNXaXRoKSB7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgICAgIGlmIChzdGFydHNXaXRoLmxlbmd0aCA+IHN0cmluZy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5zdWJzdHJpbmcoMCwgc3RhcnRzV2l0aC5sZW5ndGgpID09PSBzdGFydHNXaXRoO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvbU5vZGVJc0NvbnRhaW5lZEJ5OiBmdW5jdGlvbiAobm9kZSwgY29udGFpbmVkQnlOb2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9PT0gY29udGFpbmVkQnlOb2RlKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDExKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gRml4ZXMgaXNzdWUgIzExNjIgLSBjYW4ndCB1c2Ugbm9kZS5jb250YWlucyBmb3IgZG9jdW1lbnQgZnJhZ21lbnRzIG9uIElFOFxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lZEJ5Tm9kZS5jb250YWlucylcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVkQnlOb2RlLmNvbnRhaW5zKG5vZGUubm9kZVR5cGUgPT09IDMgPyBub2RlLnBhcmVudE5vZGUgOiBub2RlKTtcbiAgICAgICAgICAgIGlmIChjb250YWluZWRCeU5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24pXG4gICAgICAgICAgICAgICAgcmV0dXJuIChjb250YWluZWRCeU5vZGUuY29tcGFyZURvY3VtZW50UG9zaXRpb24obm9kZSkgJiAxNikgPT0gMTY7XG4gICAgICAgICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9IGNvbnRhaW5lZEJ5Tm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gISFub2RlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudDogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5kb21Ob2RlSXNDb250YWluZWRCeShub2RlLCBub2RlLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhbnlEb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQ6IGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gISFrby51dGlscy5hcnJheUZpcnN0KG5vZGVzLCBrby51dGlscy5kb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRhZ05hbWVMb3dlcjogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgLy8gRm9yIEhUTUwgZWxlbWVudHMsIHRhZ05hbWUgd2lsbCBhbHdheXMgYmUgdXBwZXIgY2FzZTsgZm9yIFhIVE1MIGVsZW1lbnRzLCBpdCdsbCBiZSBsb3dlciBjYXNlLlxuICAgICAgICAgICAgLy8gUG9zc2libGUgZnV0dXJlIG9wdGltaXphdGlvbjogSWYgd2Uga25vdyBpdCdzIGFuIGVsZW1lbnQgZnJvbSBhbiBYSFRNTCBkb2N1bWVudCAobm90IEhUTUwpLFxuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBkbyB0aGUgLnRvTG93ZXJDYXNlKCkgYXMgaXQgd2lsbCBhbHdheXMgYmUgbG93ZXIgY2FzZSBhbnl3YXkuXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50LnRhZ05hbWUgJiYgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVnaXN0ZXJFdmVudEhhbmRsZXI6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIHZhciBtdXN0VXNlQXR0YWNoRXZlbnQgPSBpZVZlcnNpb24gJiYgZXZlbnRzVGhhdE11c3RCZVJlZ2lzdGVyZWRVc2luZ0F0dGFjaEV2ZW50W2V2ZW50VHlwZV07XG4gICAgICAgICAgICBpZiAoIW11c3RVc2VBdHRhY2hFdmVudCAmJiBqUXVlcnkpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoZWxlbWVudClbJ2JpbmQnXShldmVudFR5cGUsIGhhbmRsZXIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghbXVzdFVzZUF0dGFjaEV2ZW50ICYmIHR5cGVvZiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50LmF0dGFjaEV2ZW50ICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXR0YWNoRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7IGhhbmRsZXIuY2FsbChlbGVtZW50LCBldmVudCk7IH0sXG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaEV2ZW50TmFtZSA9IFwib25cIiArIGV2ZW50VHlwZTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KGF0dGFjaEV2ZW50TmFtZSwgYXR0YWNoRXZlbnRIYW5kbGVyKTtcblxuICAgICAgICAgICAgICAgIC8vIElFIGRvZXMgbm90IGRpc3Bvc2UgYXR0YWNoRXZlbnQgaGFuZGxlcnMgYXV0b21hdGljYWxseSAodW5saWtlIHdpdGggYWRkRXZlbnRMaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAvLyBzbyB0byBhdm9pZCBsZWFrcywgd2UgaGF2ZSB0byByZW1vdmUgdGhlbSBtYW51YWxseS4gU2VlIGJ1ZyAjODU2XG4gICAgICAgICAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjayhlbGVtZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5kZXRhY2hFdmVudChhdHRhY2hFdmVudE5hbWUsIGF0dGFjaEV2ZW50SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50XCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyaWdnZXJFdmVudDogZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50VHlwZSkge1xuICAgICAgICAgICAgaWYgKCEoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbGVtZW50IG11c3QgYmUgYSBET00gbm9kZSB3aGVuIGNhbGxpbmcgdHJpZ2dlckV2ZW50XCIpO1xuXG4gICAgICAgICAgICAvLyBGb3IgY2xpY2sgZXZlbnRzIG9uIGNoZWNrYm94ZXMgYW5kIHJhZGlvIGJ1dHRvbnMsIGpRdWVyeSB0b2dnbGVzIHRoZSBlbGVtZW50IGNoZWNrZWQgc3RhdGUgKmFmdGVyKiB0aGVcbiAgICAgICAgICAgIC8vIGV2ZW50IGhhbmRsZXIgcnVucyBpbnN0ZWFkIG9mICpiZWZvcmUqLiAoVGhpcyB3YXMgZml4ZWQgaW4gMS45IGZvciBjaGVja2JveGVzIGJ1dCBub3QgZm9yIHJhZGlvIGJ1dHRvbnMuKVxuICAgICAgICAgICAgLy8gSUUgZG9lc24ndCBjaGFuZ2UgdGhlIGNoZWNrZWQgc3RhdGUgd2hlbiB5b3UgdHJpZ2dlciB0aGUgY2xpY2sgZXZlbnQgdXNpbmcgXCJmaXJlRXZlbnRcIi5cbiAgICAgICAgICAgIC8vIEluIGJvdGggY2FzZXMsIHdlJ2xsIHVzZSB0aGUgY2xpY2sgbWV0aG9kIGluc3RlYWQuXG4gICAgICAgICAgICB2YXIgdXNlQ2xpY2tXb3JrYXJvdW5kID0gaXNDbGlja09uQ2hlY2thYmxlRWxlbWVudChlbGVtZW50LCBldmVudFR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoalF1ZXJ5ICYmICF1c2VDbGlja1dvcmthcm91bmQpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoZWxlbWVudClbJ3RyaWdnZXInXShldmVudFR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRXZlbnQgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudENhdGVnb3J5ID0ga25vd25FdmVudFR5cGVzQnlFdmVudE5hbWVbZXZlbnRUeXBlXSB8fCBcIkhUTUxFdmVudHNcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoZXZlbnRDYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMCwgMCwgMCwgMCwgMCwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdXBwbGllZCBlbGVtZW50IGRvZXNuJ3Qgc3VwcG9ydCBkaXNwYXRjaEV2ZW50XCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1c2VDbGlja1dvcmthcm91bmQgJiYgZWxlbWVudC5jbGljaykge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW1lbnQuZmlyZUV2ZW50ICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCcm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCB0cmlnZ2VyaW5nIGV2ZW50c1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1bndyYXBPYnNlcnZhYmxlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBrby5pc09ic2VydmFibGUodmFsdWUpID8gdmFsdWUoKSA6IHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBlZWtPYnNlcnZhYmxlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBrby5pc09ic2VydmFibGUodmFsdWUpID8gdmFsdWUucGVlaygpIDogdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9nZ2xlRG9tTm9kZUNzc0NsYXNzOiBmdW5jdGlvbiAobm9kZSwgY2xhc3NOYW1lcywgc2hvdWxkSGF2ZUNsYXNzKSB7XG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lcykge1xuICAgICAgICAgICAgICAgIHZhciBjc3NDbGFzc05hbWVSZWdleCA9IC9cXFMrL2csXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDbGFzc05hbWVzID0gbm9kZS5jbGFzc05hbWUubWF0Y2goY3NzQ2xhc3NOYW1lUmVnZXgpIHx8IFtdO1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChjbGFzc05hbWVzLm1hdGNoKGNzc0NsYXNzTmFtZVJlZ2V4KSwgZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbShjdXJyZW50Q2xhc3NOYW1lcywgY2xhc3NOYW1lLCBzaG91bGRIYXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG5vZGUuY2xhc3NOYW1lID0gY3VycmVudENsYXNzTmFtZXMuam9pbihcIiBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0VGV4dENvbnRlbnQ6IGZ1bmN0aW9uKGVsZW1lbnQsIHRleHRDb250ZW50KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHRleHRDb250ZW50KTtcbiAgICAgICAgICAgIGlmICgodmFsdWUgPT09IG51bGwpIHx8ICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSlcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiXCI7XG5cbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdGhlcmUgdG8gYmUgZXhhY3RseSBvbmUgY2hpbGQ6IGEgdGV4dCBub2RlLlxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIGNoaWxkcmVuLCBtb3JlIHRoYW4gb25lLCBvciBpZiBpdCdzIG5vdCBhIHRleHQgbm9kZSxcbiAgICAgICAgICAgIC8vIHdlJ2xsIGNsZWFyIGV2ZXJ5dGhpbmcgYW5kIGNyZWF0ZSBhIHNpbmdsZSB0ZXh0IG5vZGUuXG4gICAgICAgICAgICB2YXIgaW5uZXJUZXh0Tm9kZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKCFpbm5lclRleHROb2RlIHx8IGlubmVyVGV4dE5vZGUubm9kZVR5cGUgIT0gMyB8fCBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcoaW5uZXJUZXh0Tm9kZSkpIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuKGVsZW1lbnQsIFtlbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlubmVyVGV4dE5vZGUuZGF0YSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBrby51dGlscy5mb3JjZVJlZnJlc2goZWxlbWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0RWxlbWVudE5hbWU6IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUpIHtcbiAgICAgICAgICAgIGVsZW1lbnQubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgICAgIC8vIFdvcmthcm91bmQgSUUgNi83IGlzc3VlXG4gICAgICAgICAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMTk3XG4gICAgICAgICAgICAvLyAtIGh0dHA6Ly93d3cubWF0dHM0MTEuY29tL3Bvc3Qvc2V0dGluZ190aGVfbmFtZV9hdHRyaWJ1dGVfaW5faWVfZG9tL1xuICAgICAgICAgICAgaWYgKGllVmVyc2lvbiA8PSA3KSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5tZXJnZUF0dHJpYnV0ZXMoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIjxpbnB1dCBuYW1lPSdcIiArIGVsZW1lbnQubmFtZSArIFwiJy8+XCIpLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoKGUpIHt9IC8vIEZvciBJRTkgd2l0aCBkb2MgbW9kZSBcIklFOSBTdGFuZGFyZHNcIiBhbmQgYnJvd3NlciBtb2RlIFwiSUU5IENvbXBhdGliaWxpdHkgVmlld1wiXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9yY2VSZWZyZXNoOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBhbiBJRTkgcmVuZGVyaW5nIGJ1ZyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMjA5XG4gICAgICAgICAgICBpZiAoaWVWZXJzaW9uID49IDkpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgdGV4dCBub2RlcyBhbmQgY29tbWVudCBub2RlcyAobW9zdCBsaWtlbHkgdmlydHVhbCBlbGVtZW50cyksIHdlIHdpbGwgaGF2ZSB0byByZWZyZXNoIHRoZSBjb250YWluZXJcbiAgICAgICAgICAgICAgICB2YXIgZWxlbSA9IG5vZGUubm9kZVR5cGUgPT0gMSA/IG5vZGUgOiBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0uc3R5bGUpXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uc3R5bGUuem9vbSA9IGVsZW0uc3R5bGUuem9vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlbnN1cmVTZWxlY3RFbGVtZW50SXNSZW5kZXJlZENvcnJlY3RseTogZnVuY3Rpb24oc2VsZWN0RWxlbWVudCkge1xuICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgSUU5IHJlbmRlcmluZyBidWcgLSBpdCBkb2Vzbid0IHJlbGlhYmx5IGRpc3BsYXkgYWxsIHRoZSB0ZXh0IGluIGR5bmFtaWNhbGx5LWFkZGVkIHNlbGVjdCBib3hlcyB1bmxlc3MgeW91IGZvcmNlIGl0IHRvIHJlLXJlbmRlciBieSB1cGRhdGluZyB0aGUgd2lkdGguXG4gICAgICAgICAgICAvLyAoU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMzEyLCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU5MDg0OTQvc2VsZWN0LW9ubHktc2hvd3MtZmlyc3QtY2hhci1vZi1zZWxlY3RlZC1vcHRpb24pXG4gICAgICAgICAgICAvLyBBbHNvIGZpeGVzIElFNyBhbmQgSUU4IGJ1ZyB0aGF0IGNhdXNlcyBzZWxlY3RzIHRvIGJlIHplcm8gd2lkdGggaWYgZW5jbG9zZWQgYnkgJ2lmJyBvciAnd2l0aCcuIChTZWUgaXNzdWUgIzgzOSlcbiAgICAgICAgICAgIGlmIChpZVZlcnNpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWxXaWR0aCA9IHNlbGVjdEVsZW1lbnQuc3R5bGUud2lkdGg7XG4gICAgICAgICAgICAgICAgc2VsZWN0RWxlbWVudC5zdHlsZS53aWR0aCA9IDA7XG4gICAgICAgICAgICAgICAgc2VsZWN0RWxlbWVudC5zdHlsZS53aWR0aCA9IG9yaWdpbmFsV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmFuZ2U6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICAgICAgICAgICAgbWluID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShtaW4pO1xuICAgICAgICAgICAgbWF4ID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShtYXgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IG1pbjsgaSA8PSBtYXg7IGkrKylcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFrZUFycmF5OiBmdW5jdGlvbihhcnJheUxpa2VPYmplY3QpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXlMaWtlT2JqZWN0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGFycmF5TGlrZU9iamVjdFtpXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0llNiA6IGlzSWU2LFxuICAgICAgICBpc0llNyA6IGlzSWU3LFxuICAgICAgICBpZVZlcnNpb24gOiBpZVZlcnNpb24sXG5cbiAgICAgICAgZ2V0Rm9ybUZpZWxkczogZnVuY3Rpb24oZm9ybSwgZmllbGROYW1lKSB7XG4gICAgICAgICAgICB2YXIgZmllbGRzID0ga28udXRpbHMubWFrZUFycmF5KGZvcm0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJpbnB1dFwiKSkuY29uY2F0KGtvLnV0aWxzLm1ha2VBcnJheShmb3JtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidGV4dGFyZWFcIikpKTtcbiAgICAgICAgICAgIHZhciBpc01hdGNoaW5nRmllbGQgPSAodHlwZW9mIGZpZWxkTmFtZSA9PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uKGZpZWxkKSB7IHJldHVybiBmaWVsZC5uYW1lID09PSBmaWVsZE5hbWUgfVxuICAgICAgICAgICAgICAgIDogZnVuY3Rpb24oZmllbGQpIHsgcmV0dXJuIGZpZWxkTmFtZS50ZXN0KGZpZWxkLm5hbWUpIH07IC8vIFRyZWF0IGZpZWxkTmFtZSBhcyByZWdleCBvciBvYmplY3QgY29udGFpbmluZyBwcmVkaWNhdGVcbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZmllbGRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTWF0Y2hpbmdGaWVsZChmaWVsZHNbaV0pKVxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goZmllbGRzW2ldKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZUpzb246IGZ1bmN0aW9uIChqc29uU3RyaW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGpzb25TdHJpbmcgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGpzb25TdHJpbmcgPSBrby51dGlscy5zdHJpbmdUcmltKGpzb25TdHJpbmcpO1xuICAgICAgICAgICAgICAgIGlmIChqc29uU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChKU09OICYmIEpTT04ucGFyc2UpIC8vIFVzZSBuYXRpdmUgcGFyc2luZyB3aGVyZSBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb25TdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKG5ldyBGdW5jdGlvbihcInJldHVybiBcIiArIGpzb25TdHJpbmcpKSgpOyAvLyBGYWxsYmFjayBvbiBsZXNzIHNhZmUgcGFyc2luZyBmb3Igb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBzdHJpbmdpZnlKc29uOiBmdW5jdGlvbiAoZGF0YSwgcmVwbGFjZXIsIHNwYWNlKSB7ICAgLy8gcmVwbGFjZXIgYW5kIHNwYWNlIGFyZSBvcHRpb25hbFxuICAgICAgICAgICAgaWYgKCFKU09OIHx8ICFKU09OLnN0cmluZ2lmeSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBKU09OLnN0cmluZ2lmeSgpLiBTb21lIGJyb3dzZXJzIChlLmcuLCBJRSA8IDgpIGRvbid0IHN1cHBvcnQgaXQgbmF0aXZlbHksIGJ1dCB5b3UgY2FuIG92ZXJjb21lIHRoaXMgYnkgYWRkaW5nIGEgc2NyaXB0IHJlZmVyZW5jZSB0byBqc29uMi5qcywgZG93bmxvYWRhYmxlIGZyb20gaHR0cDovL3d3dy5qc29uLm9yZy9qc29uMi5qc1wiKTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGEpLCByZXBsYWNlciwgc3BhY2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3RKc29uOiBmdW5jdGlvbiAodXJsT3JGb3JtLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSBvcHRpb25zWydwYXJhbXMnXSB8fCB7fTtcbiAgICAgICAgICAgIHZhciBpbmNsdWRlRmllbGRzID0gb3B0aW9uc1snaW5jbHVkZUZpZWxkcyddIHx8IHRoaXMuZmllbGRzSW5jbHVkZWRXaXRoSnNvblBvc3Q7XG4gICAgICAgICAgICB2YXIgdXJsID0gdXJsT3JGb3JtO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSB3ZXJlIGdpdmVuIGEgZm9ybSwgdXNlIGl0cyAnYWN0aW9uJyBVUkwgYW5kIHBpY2sgb3V0IGFueSByZXF1ZXN0ZWQgZmllbGQgdmFsdWVzXG4gICAgICAgICAgICBpZigodHlwZW9mIHVybE9yRm9ybSA9PSAnb2JqZWN0JykgJiYgKGtvLnV0aWxzLnRhZ05hbWVMb3dlcih1cmxPckZvcm0pID09PSBcImZvcm1cIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JpZ2luYWxGb3JtID0gdXJsT3JGb3JtO1xuICAgICAgICAgICAgICAgIHVybCA9IG9yaWdpbmFsRm9ybS5hY3Rpb247XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGluY2x1ZGVGaWVsZHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkcyA9IGtvLnV0aWxzLmdldEZvcm1GaWVsZHMob3JpZ2luYWxGb3JtLCBpbmNsdWRlRmllbGRzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGZpZWxkcy5sZW5ndGggLSAxOyBqID49IDA7IGotLSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtc1tmaWVsZHNbal0ubmFtZV0gPSBmaWVsZHNbal0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRhID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShkYXRhKTtcbiAgICAgICAgICAgIHZhciBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImZvcm1cIik7XG4gICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGZvcm0uYWN0aW9uID0gdXJsO1xuICAgICAgICAgICAgZm9ybS5tZXRob2QgPSBcInBvc3RcIjtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gU2luY2UgJ2RhdGEnIHRoaXMgaXMgYSBtb2RlbCBvYmplY3QsIHdlIGluY2x1ZGUgYWxsIHByb3BlcnRpZXMgaW5jbHVkaW5nIHRob3NlIGluaGVyaXRlZCBmcm9tIGl0cyBwcm90b3R5cGVcbiAgICAgICAgICAgICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgICAgICAgICAgICAgaW5wdXQubmFtZSA9IGtleTtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IGtvLnV0aWxzLnN0cmluZ2lmeUpzb24oa28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShkYXRhW2tleV0pKTtcbiAgICAgICAgICAgICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iamVjdEZvckVhY2gocGFyYW1zLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgICAgIGlucHV0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcbiAgICAgICAgICAgIG9wdGlvbnNbJ3N1Ym1pdHRlciddID8gb3B0aW9uc1snc3VibWl0dGVyJ10oZm9ybSkgOiBmb3JtLnN1Ym1pdCgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGZvcm0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmb3JtKTsgfSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG59KCkpO1xuXG5rby5leHBvcnRTeW1ib2woJ3V0aWxzJywga28udXRpbHMpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheUZvckVhY2gnLCBrby51dGlscy5hcnJheUZvckVhY2gpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheUZpcnN0Jywga28udXRpbHMuYXJyYXlGaXJzdCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5RmlsdGVyJywga28udXRpbHMuYXJyYXlGaWx0ZXIpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheUdldERpc3RpbmN0VmFsdWVzJywga28udXRpbHMuYXJyYXlHZXREaXN0aW5jdFZhbHVlcyk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5SW5kZXhPZicsIGtvLnV0aWxzLmFycmF5SW5kZXhPZik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFycmF5TWFwJywga28udXRpbHMuYXJyYXlNYXApO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheVB1c2hBbGwnLCBrby51dGlscy5hcnJheVB1c2hBbGwpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheVJlbW92ZUl0ZW0nLCBrby51dGlscy5hcnJheVJlbW92ZUl0ZW0pO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5leHRlbmQnLCBrby51dGlscy5leHRlbmQpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5maWVsZHNJbmNsdWRlZFdpdGhKc29uUG9zdCcsIGtvLnV0aWxzLmZpZWxkc0luY2x1ZGVkV2l0aEpzb25Qb3N0KTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZ2V0Rm9ybUZpZWxkcycsIGtvLnV0aWxzLmdldEZvcm1GaWVsZHMpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5wZWVrT2JzZXJ2YWJsZScsIGtvLnV0aWxzLnBlZWtPYnNlcnZhYmxlKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMucG9zdEpzb24nLCBrby51dGlscy5wb3N0SnNvbik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnBhcnNlSnNvbicsIGtvLnV0aWxzLnBhcnNlSnNvbik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyJywga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zdHJpbmdpZnlKc29uJywga28udXRpbHMuc3RyaW5naWZ5SnNvbik7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnJhbmdlJywga28udXRpbHMucmFuZ2UpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy50b2dnbGVEb21Ob2RlQ3NzQ2xhc3MnLCBrby51dGlscy50b2dnbGVEb21Ob2RlQ3NzQ2xhc3MpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy50cmlnZ2VyRXZlbnQnLCBrby51dGlscy50cmlnZ2VyRXZlbnQpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy51bndyYXBPYnNlcnZhYmxlJywga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLm9iamVjdEZvckVhY2gnLCBrby51dGlscy5vYmplY3RGb3JFYWNoKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYWRkT3JSZW1vdmVJdGVtJywga28udXRpbHMuYWRkT3JSZW1vdmVJdGVtKTtcbmtvLmV4cG9ydFN5bWJvbCgndW53cmFwJywga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSk7IC8vIENvbnZlbmllbnQgc2hvcnRoYW5kLCBiZWNhdXNlIHRoaXMgaXMgdXNlZCBzbyBjb21tb25seVxuXG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZVsnYmluZCddKSB7XG4gICAgLy8gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgaXMgYSBzdGFuZGFyZCBwYXJ0IG9mIEVDTUFTY3JpcHQgNXRoIEVkaXRpb24gKERlY2VtYmVyIDIwMDksIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9wdWJsaWNhdGlvbnMvZmlsZXMvRUNNQS1TVC9FQ01BLTI2Mi5wZGYpXG4gICAgLy8gSW4gY2FzZSB0aGUgYnJvd3NlciBkb2Vzbid0IGltcGxlbWVudCBpdCBuYXRpdmVseSwgcHJvdmlkZSBhIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24uIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb24gdGhlIG9uZSBpbiBwcm90b3R5cGUuanNcbiAgICBGdW5jdGlvbi5wcm90b3R5cGVbJ2JpbmQnXSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsRnVuY3Rpb24gPSB0aGlzLCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSwgb2JqZWN0ID0gYXJncy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRnVuY3Rpb24uYXBwbHkob2JqZWN0LCBhcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxua28udXRpbHMuZG9tRGF0YSA9IG5ldyAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bmlxdWVJZCA9IDA7XG4gICAgdmFyIGRhdGFTdG9yZUtleUV4cGFuZG9Qcm9wZXJ0eU5hbWUgPSBcIl9fa29fX1wiICsgKG5ldyBEYXRlKS5nZXRUaW1lKCk7XG4gICAgdmFyIGRhdGFTdG9yZSA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZ2V0QWxsKG5vZGUsIGNyZWF0ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgdmFyIGRhdGFTdG9yZUtleSA9IG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV07XG4gICAgICAgIHZhciBoYXNFeGlzdGluZ0RhdGFTdG9yZSA9IGRhdGFTdG9yZUtleSAmJiAoZGF0YVN0b3JlS2V5ICE9PSBcIm51bGxcIikgJiYgZGF0YVN0b3JlW2RhdGFTdG9yZUtleV07XG4gICAgICAgIGlmICghaGFzRXhpc3RpbmdEYXRhU3RvcmUpIHtcbiAgICAgICAgICAgIGlmICghY3JlYXRlSWZOb3RGb3VuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZGF0YVN0b3JlS2V5ID0gbm9kZVtkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lXSA9IFwia29cIiArIHVuaXF1ZUlkKys7XG4gICAgICAgICAgICBkYXRhU3RvcmVbZGF0YVN0b3JlS2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhU3RvcmVbZGF0YVN0b3JlS2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIChub2RlLCBrZXkpIHtcbiAgICAgICAgICAgIHZhciBhbGxEYXRhRm9yTm9kZSA9IGdldEFsbChub2RlLCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm4gYWxsRGF0YUZvck5vZGUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGFsbERhdGFGb3JOb2RlW2tleV07XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKG5vZGUsIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IGFjdHVhbGx5IGNyZWF0ZSBhIG5ldyBkb21EYXRhIGtleSBpZiB3ZSBhcmUgYWN0dWFsbHkgZGVsZXRpbmcgYSB2YWx1ZVxuICAgICAgICAgICAgICAgIGlmIChnZXRBbGwobm9kZSwgZmFsc2UpID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhbGxEYXRhRm9yTm9kZSA9IGdldEFsbChub2RlLCB0cnVlKTtcbiAgICAgICAgICAgIGFsbERhdGFGb3JOb2RlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YVN0b3JlS2V5ID0gbm9kZVtkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIGlmIChkYXRhU3RvcmVLZXkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YVN0b3JlW2RhdGFTdG9yZUtleV07XG4gICAgICAgICAgICAgICAgbm9kZVtkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIEV4cG9zaW5nIFwiZGlkIGNsZWFuXCIgZmxhZyBwdXJlbHkgc28gc3BlY3MgY2FuIGluZmVyIHdoZXRoZXIgdGhpbmdzIGhhdmUgYmVlbiBjbGVhbmVkIHVwIGFzIGludGVuZGVkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dEtleTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICh1bmlxdWVJZCsrKSArIGRhdGFTdG9yZUtleUV4cGFuZG9Qcm9wZXJ0eU5hbWU7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21EYXRhJywga28udXRpbHMuZG9tRGF0YSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmRvbURhdGEuY2xlYXInLCBrby51dGlscy5kb21EYXRhLmNsZWFyKTsgLy8gRXhwb3J0aW5nIG9ubHkgc28gc3BlY3MgY2FuIGNsZWFyIHVwIGFmdGVyIHRoZW1zZWx2ZXMgZnVsbHlcblxua28udXRpbHMuZG9tTm9kZURpc3Bvc2FsID0gbmV3IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGRvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICB2YXIgY2xlYW5hYmxlTm9kZVR5cGVzID0geyAxOiB0cnVlLCA4OiB0cnVlLCA5OiB0cnVlIH07ICAgICAgIC8vIEVsZW1lbnQsIENvbW1lbnQsIERvY3VtZW50XG4gICAgdmFyIGNsZWFuYWJsZU5vZGVUeXBlc1dpdGhEZXNjZW5kYW50cyA9IHsgMTogdHJ1ZSwgOTogdHJ1ZSB9OyAvLyBFbGVtZW50LCBEb2N1bWVudFxuXG4gICAgZnVuY3Rpb24gZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgY3JlYXRlSWZOb3RGb3VuZCkge1xuICAgICAgICB2YXIgYWxsRGlzcG9zZUNhbGxiYWNrcyA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KG5vZGUsIGRvbURhdGFLZXkpO1xuICAgICAgICBpZiAoKGFsbERpc3Bvc2VDYWxsYmFja3MgPT09IHVuZGVmaW5lZCkgJiYgY3JlYXRlSWZOb3RGb3VuZCkge1xuICAgICAgICAgICAgYWxsRGlzcG9zZUNhbGxiYWNrcyA9IFtdO1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQobm9kZSwgZG9tRGF0YUtleSwgYWxsRGlzcG9zZUNhbGxiYWNrcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFsbERpc3Bvc2VDYWxsYmFja3M7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlc3Ryb3lDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUpIHtcbiAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQobm9kZSwgZG9tRGF0YUtleSwgdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGVhblNpbmdsZU5vZGUobm9kZSkge1xuICAgICAgICAvLyBSdW4gYWxsIHRoZSBkaXNwb3NlIGNhbGxiYWNrc1xuICAgICAgICB2YXIgY2FsbGJhY2tzID0gZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgZmFsc2UpO1xuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7IC8vIENsb25lLCBhcyB0aGUgYXJyYXkgbWF5IGJlIG1vZGlmaWVkIGR1cmluZyBpdGVyYXRpb24gKHR5cGljYWxseSwgY2FsbGJhY2tzIHdpbGwgcmVtb3ZlIHRoZW1zZWx2ZXMpXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICBjYWxsYmFja3NbaV0obm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFcmFzZSB0aGUgRE9NIGRhdGFcbiAgICAgICAga28udXRpbHMuZG9tRGF0YS5jbGVhcihub2RlKTtcblxuICAgICAgICAvLyBQZXJmb3JtIGNsZWFudXAgbmVlZGVkIGJ5IGV4dGVybmFsIGxpYnJhcmllcyAoY3VycmVudGx5IG9ubHkgalF1ZXJ5LCBidXQgY2FuIGJlIGV4dGVuZGVkKVxuICAgICAgICBrby51dGlscy5kb21Ob2RlRGlzcG9zYWxbXCJjbGVhbkV4dGVybmFsRGF0YVwiXShub2RlKTtcblxuICAgICAgICAvLyBDbGVhciBhbnkgaW1tZWRpYXRlLWNoaWxkIGNvbW1lbnQgbm9kZXMsIGFzIHRoZXNlIHdvdWxkbid0IGhhdmUgYmVlbiBmb3VuZCBieVxuICAgICAgICAvLyBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiKlwiKSBpbiBjbGVhbk5vZGUoKSAoY29tbWVudCBub2RlcyBhcmVuJ3QgZWxlbWVudHMpXG4gICAgICAgIGlmIChjbGVhbmFibGVOb2RlVHlwZXNXaXRoRGVzY2VuZGFudHNbbm9kZS5ub2RlVHlwZV0pXG4gICAgICAgICAgICBjbGVhbkltbWVkaWF0ZUNvbW1lbnRUeXBlQ2hpbGRyZW4obm9kZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW5JbW1lZGlhdGVDb21tZW50VHlwZUNoaWxkcmVuKG5vZGVXaXRoQ2hpbGRyZW4pIHtcbiAgICAgICAgdmFyIGNoaWxkLCBuZXh0Q2hpbGQgPSBub2RlV2l0aENoaWxkcmVuLmZpcnN0Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChjaGlsZCA9IG5leHRDaGlsZCkge1xuICAgICAgICAgICAgbmV4dENoaWxkID0gY2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICAgICAgY2xlYW5TaW5nbGVOb2RlKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGFkZERpc3Bvc2VDYWxsYmFjayA6IGZ1bmN0aW9uKG5vZGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICBnZXREaXNwb3NlQ2FsbGJhY2tzQ29sbGVjdGlvbihub2RlLCB0cnVlKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmVEaXNwb3NlQ2FsbGJhY2sgOiBmdW5jdGlvbihub2RlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrc0NvbGxlY3Rpb24gPSBnZXREaXNwb3NlQ2FsbGJhY2tzQ29sbGVjdGlvbihub2RlLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2tzQ29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UmVtb3ZlSXRlbShjYWxsYmFja3NDb2xsZWN0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrc0NvbGxlY3Rpb24ubGVuZ3RoID09IDApXG4gICAgICAgICAgICAgICAgICAgIGRlc3Ryb3lDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFuTm9kZSA6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIC8vIEZpcnN0IGNsZWFuIHRoaXMgbm9kZSwgd2hlcmUgYXBwbGljYWJsZVxuICAgICAgICAgICAgaWYgKGNsZWFuYWJsZU5vZGVUeXBlc1tub2RlLm5vZGVUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNsZWFuU2luZ2xlTm9kZShub2RlKTtcblxuICAgICAgICAgICAgICAgIC8vIC4uLiB0aGVuIGl0cyBkZXNjZW5kYW50cywgd2hlcmUgYXBwbGljYWJsZVxuICAgICAgICAgICAgICAgIGlmIChjbGVhbmFibGVOb2RlVHlwZXNXaXRoRGVzY2VuZGFudHNbbm9kZS5ub2RlVHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2xvbmUgdGhlIGRlc2NlbmRhbnRzIGxpc3QgaW4gY2FzZSBpdCBjaGFuZ2VzIGR1cmluZyBpdGVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlc2NlbmRhbnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UHVzaEFsbChkZXNjZW5kYW50cywgbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIikpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGRlc2NlbmRhbnRzLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuU2luZ2xlTm9kZShkZXNjZW5kYW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTm9kZSA6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGtvLmNsZWFuTm9kZShub2RlKTtcbiAgICAgICAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIFwiY2xlYW5FeHRlcm5hbERhdGFcIiA6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIHN1cHBvcnQgZm9yIGpRdWVyeSBoZXJlIGJlY2F1c2UgaXQncyBzbyBjb21tb25seSB1c2VkLlxuICAgICAgICAgICAgLy8gTWFueSBqUXVlcnkgcGx1Z2lucyAoaW5jbHVkaW5nIGpxdWVyeS50bXBsKSBzdG9yZSBkYXRhIHVzaW5nIGpRdWVyeSdzIGVxdWl2YWxlbnQgb2YgZG9tRGF0YVxuICAgICAgICAgICAgLy8gc28gbm90aWZ5IGl0IHRvIHRlYXIgZG93biBhbnkgcmVzb3VyY2VzIGFzc29jaWF0ZWQgd2l0aCB0aGUgbm9kZSAmIGRlc2NlbmRhbnRzIGhlcmUuXG4gICAgICAgICAgICBpZiAoalF1ZXJ5ICYmICh0eXBlb2YgalF1ZXJ5WydjbGVhbkRhdGEnXSA9PSBcImZ1bmN0aW9uXCIpKVxuICAgICAgICAgICAgICAgIGpRdWVyeVsnY2xlYW5EYXRhJ10oW25vZGVdKTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7XG5rby5jbGVhbk5vZGUgPSBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwuY2xlYW5Ob2RlOyAvLyBTaG9ydGhhbmQgbmFtZSBmb3IgY29udmVuaWVuY2VcbmtvLnJlbW92ZU5vZGUgPSBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwucmVtb3ZlTm9kZTsgLy8gU2hvcnRoYW5kIG5hbWUgZm9yIGNvbnZlbmllbmNlXG5rby5leHBvcnRTeW1ib2woJ2NsZWFuTm9kZScsIGtvLmNsZWFuTm9kZSk7XG5rby5leHBvcnRTeW1ib2woJ3JlbW92ZU5vZGUnLCBrby5yZW1vdmVOb2RlKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZG9tTm9kZURpc3Bvc2FsJywga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjaycsIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5hZGREaXNwb3NlQ2FsbGJhY2spO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21Ob2RlRGlzcG9zYWwucmVtb3ZlRGlzcG9zZUNhbGxiYWNrJywga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLnJlbW92ZURpc3Bvc2VDYWxsYmFjayk7XG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBsZWFkaW5nQ29tbWVudFJlZ2V4ID0gL14oXFxzKik8IS0tKC4qPyktLT4vO1xuXG4gICAgZnVuY3Rpb24gc2ltcGxlSHRtbFBhcnNlKGh0bWwpIHtcbiAgICAgICAgLy8gQmFzZWQgb24galF1ZXJ5J3MgXCJjbGVhblwiIGZ1bmN0aW9uLCBidXQgb25seSBhY2NvdW50aW5nIGZvciB0YWJsZS1yZWxhdGVkIGVsZW1lbnRzLlxuICAgICAgICAvLyBJZiB5b3UgaGF2ZSByZWZlcmVuY2VkIGpRdWVyeSwgdGhpcyB3b24ndCBiZSB1c2VkIGFueXdheSAtIEtPIHdpbGwgdXNlIGpRdWVyeSdzIFwiY2xlYW5cIiBmdW5jdGlvbiBkaXJlY3RseVxuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGVyZSdzIHN0aWxsIGFuIGlzc3VlIGluIElFIDwgOSB3aGVyZWJ5IGl0IHdpbGwgZGlzY2FyZCBjb21tZW50IG5vZGVzIHRoYXQgYXJlIHRoZSBmaXJzdCBjaGlsZCBvZlxuICAgICAgICAvLyBhIGRlc2NlbmRhbnQgbm9kZS4gRm9yIGV4YW1wbGU6IFwiPGRpdj48IS0tIG15Y29tbWVudCAtLT5hYmM8L2Rpdj5cIiB3aWxsIGdldCBwYXJzZWQgYXMgXCI8ZGl2PmFiYzwvZGl2PlwiXG4gICAgICAgIC8vIFRoaXMgd29uJ3QgYWZmZWN0IGFueW9uZSB3aG8gaGFzIHJlZmVyZW5jZWQgalF1ZXJ5LCBhbmQgdGhlcmUncyBhbHdheXMgdGhlIHdvcmthcm91bmQgb2YgaW5zZXJ0aW5nIGEgZHVtbXkgbm9kZVxuICAgICAgICAvLyAocG9zc2libHkgYSB0ZXh0IG5vZGUpIGluIGZyb250IG9mIHRoZSBjb21tZW50LiBTbywgS08gZG9lcyBub3QgYXR0ZW1wdCB0byB3b3JrYXJvdW5kIHRoaXMgSUUgaXNzdWUgYXV0b21hdGljYWxseSBhdCBwcmVzZW50LlxuXG4gICAgICAgIC8vIFRyaW0gd2hpdGVzcGFjZSwgb3RoZXJ3aXNlIGluZGV4T2Ygd29uJ3Qgd29yayBhcyBleHBlY3RlZFxuICAgICAgICB2YXIgdGFncyA9IGtvLnV0aWxzLnN0cmluZ1RyaW0oaHRtbCkudG9Mb3dlckNhc2UoKSwgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgICAgICAvLyBGaW5kcyB0aGUgZmlyc3QgbWF0Y2ggZnJvbSB0aGUgbGVmdCBjb2x1bW4sIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIFwid3JhcFwiIGRhdGEgZnJvbSB0aGUgcmlnaHQgY29sdW1uXG4gICAgICAgIHZhciB3cmFwID0gdGFncy5tYXRjaCgvXjwodGhlYWR8dGJvZHl8dGZvb3QpLykgICAgICAgICAgICAgICYmIFsxLCBcIjx0YWJsZT5cIiwgXCI8L3RhYmxlPlwiXSB8fFxuICAgICAgICAgICAgICAgICAgICF0YWdzLmluZGV4T2YoXCI8dHJcIikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIFsyLCBcIjx0YWJsZT48dGJvZHk+XCIsIFwiPC90Ym9keT48L3RhYmxlPlwiXSB8fFxuICAgICAgICAgICAgICAgICAgICghdGFncy5pbmRleE9mKFwiPHRkXCIpIHx8ICF0YWdzLmluZGV4T2YoXCI8dGhcIikpICAgJiYgWzMsIFwiPHRhYmxlPjx0Ym9keT48dHI+XCIsIFwiPC90cj48L3Rib2R5PjwvdGFibGU+XCJdIHx8XG4gICAgICAgICAgICAgICAgICAgLyogYW55dGhpbmcgZWxzZSAqLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFswLCBcIlwiLCBcIlwiXTtcblxuICAgICAgICAvLyBHbyB0byBodG1sIGFuZCBiYWNrLCB0aGVuIHBlZWwgb2ZmIGV4dHJhIHdyYXBwZXJzXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBhbHdheXMgcHJlZml4IHdpdGggc29tZSBkdW1teSB0ZXh0LCBiZWNhdXNlIG90aGVyd2lzZSwgSUU8OSB3aWxsIHN0cmlwIG91dCBsZWFkaW5nIGNvbW1lbnQgbm9kZXMgaW4gZGVzY2VuZGFudHMuIFRvdGFsIG1hZG5lc3MuXG4gICAgICAgIHZhciBtYXJrdXAgPSBcImlnbm9yZWQ8ZGl2PlwiICsgd3JhcFsxXSArIGh0bWwgKyB3cmFwWzJdICsgXCI8L2Rpdj5cIjtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3dbJ2lubmVyU2hpdiddID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKHdpbmRvd1snaW5uZXJTaGl2J10obWFya3VwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gbWFya3VwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW92ZSB0byB0aGUgcmlnaHQgZGVwdGhcbiAgICAgICAgd2hpbGUgKHdyYXBbMF0tLSlcbiAgICAgICAgICAgIGRpdiA9IGRpdi5sYXN0Q2hpbGQ7XG5cbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm1ha2VBcnJheShkaXYubGFzdENoaWxkLmNoaWxkTm9kZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGpRdWVyeUh0bWxQYXJzZShodG1sKSB7XG4gICAgICAgIC8vIGpRdWVyeSdzIFwicGFyc2VIVE1MXCIgZnVuY3Rpb24gd2FzIGludHJvZHVjZWQgaW4galF1ZXJ5IDEuOC4wIGFuZCBpcyBhIGRvY3VtZW50ZWQgcHVibGljIEFQSS5cbiAgICAgICAgaWYgKGpRdWVyeVsncGFyc2VIVE1MJ10pIHtcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnlbJ3BhcnNlSFRNTCddKGh0bWwpIHx8IFtdOyAvLyBFbnN1cmUgd2UgYWx3YXlzIHJldHVybiBhbiBhcnJheSBhbmQgbmV2ZXIgbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRm9yIGpRdWVyeSA8IDEuOC4wLCB3ZSBmYWxsIGJhY2sgb24gdGhlIHVuZG9jdW1lbnRlZCBpbnRlcm5hbCBcImNsZWFuXCIgZnVuY3Rpb24uXG4gICAgICAgICAgICB2YXIgZWxlbXMgPSBqUXVlcnlbJ2NsZWFuJ10oW2h0bWxdKTtcblxuICAgICAgICAgICAgLy8gQXMgb2YgalF1ZXJ5IDEuNy4xLCBqUXVlcnkgcGFyc2VzIHRoZSBIVE1MIGJ5IGFwcGVuZGluZyBpdCB0byBzb21lIGR1bW15IHBhcmVudCBub2RlcyBoZWxkIGluIGFuIGluLW1lbW9yeSBkb2N1bWVudCBmcmFnbWVudC5cbiAgICAgICAgICAgIC8vIFVuZm9ydHVuYXRlbHksIGl0IG5ldmVyIGNsZWFycyB0aGUgZHVtbXkgcGFyZW50IG5vZGVzIGZyb20gdGhlIGRvY3VtZW50IGZyYWdtZW50LCBzbyBpdCBsZWFrcyBtZW1vcnkgb3ZlciB0aW1lLlxuICAgICAgICAgICAgLy8gRml4IHRoaXMgYnkgZmluZGluZyB0aGUgdG9wLW1vc3QgZHVtbXkgcGFyZW50IGVsZW1lbnQsIGFuZCBkZXRhY2hpbmcgaXQgZnJvbSBpdHMgb3duZXIgZnJhZ21lbnQuXG4gICAgICAgICAgICBpZiAoZWxlbXMgJiYgZWxlbXNbMF0pIHtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSB0b3AtbW9zdCBwYXJlbnQgZWxlbWVudCB0aGF0J3MgYSBkaXJlY3QgY2hpbGQgb2YgYSBkb2N1bWVudCBmcmFnbWVudFxuICAgICAgICAgICAgICAgIHZhciBlbGVtID0gZWxlbXNbMF07XG4gICAgICAgICAgICAgICAgd2hpbGUgKGVsZW0ucGFyZW50Tm9kZSAmJiBlbGVtLnBhcmVudE5vZGUubm9kZVR5cGUgIT09IDExIC8qIGkuZS4sIERvY3VtZW50RnJhZ21lbnQgKi8pXG4gICAgICAgICAgICAgICAgICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgLy8gLi4uIHRoZW4gZGV0YWNoIGl0XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0ucGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBrby51dGlscy5wYXJzZUh0bWxGcmFnbWVudCA9IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgcmV0dXJuIGpRdWVyeSA/IGpRdWVyeUh0bWxQYXJzZShodG1sKSAgIC8vIEFzIGJlbG93LCBiZW5lZml0IGZyb20galF1ZXJ5J3Mgb3B0aW1pc2F0aW9ucyB3aGVyZSBwb3NzaWJsZVxuICAgICAgICAgICAgICAgICAgICAgIDogc2ltcGxlSHRtbFBhcnNlKGh0bWwpOyAgLy8gLi4uIG90aGVyd2lzZSwgdGhpcyBzaW1wbGUgbG9naWMgd2lsbCBkbyBpbiBtb3N0IGNvbW1vbiBjYXNlcy5cbiAgICB9O1xuXG4gICAga28udXRpbHMuc2V0SHRtbCA9IGZ1bmN0aW9uKG5vZGUsIGh0bWwpIHtcbiAgICAgICAga28udXRpbHMuZW1wdHlEb21Ob2RlKG5vZGUpO1xuXG4gICAgICAgIC8vIFRoZXJlJ3Mgbm8gbGVnaXRpbWF0ZSByZWFzb24gdG8gZGlzcGxheSBhIHN0cmluZ2lmaWVkIG9ic2VydmFibGUgd2l0aG91dCB1bndyYXBwaW5nIGl0LCBzbyB3ZSdsbCB1bndyYXAgaXRcbiAgICAgICAgaHRtbCA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoaHRtbCk7XG5cbiAgICAgICAgaWYgKChodG1sICE9PSBudWxsKSAmJiAoaHRtbCAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBodG1sICE9ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIC8vIGpRdWVyeSBjb250YWlucyBhIGxvdCBvZiBzb3BoaXN0aWNhdGVkIGNvZGUgdG8gcGFyc2UgYXJiaXRyYXJ5IEhUTUwgZnJhZ21lbnRzLFxuICAgICAgICAgICAgLy8gZm9yIGV4YW1wbGUgPHRyPiBlbGVtZW50cyB3aGljaCBhcmUgbm90IG5vcm1hbGx5IGFsbG93ZWQgdG8gZXhpc3Qgb24gdGhlaXIgb3duLlxuICAgICAgICAgICAgLy8gSWYgeW91J3ZlIHJlZmVyZW5jZWQgalF1ZXJ5IHdlJ2xsIHVzZSB0aGF0IHJhdGhlciB0aGFuIGR1cGxpY2F0aW5nIGl0cyBjb2RlLlxuICAgICAgICAgICAgaWYgKGpRdWVyeSkge1xuICAgICAgICAgICAgICAgIGpRdWVyeShub2RlKVsnaHRtbCddKGh0bWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAuLi4gb3RoZXJ3aXNlLCB1c2UgS08ncyBvd24gcGFyc2luZyBsb2dpYy5cbiAgICAgICAgICAgICAgICB2YXIgcGFyc2VkTm9kZXMgPSBrby51dGlscy5wYXJzZUh0bWxGcmFnbWVudChodG1sKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnNlZE5vZGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHBhcnNlZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnBhcnNlSHRtbEZyYWdtZW50Jywga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zZXRIdG1sJywga28udXRpbHMuc2V0SHRtbCk7XG5cbmtvLm1lbW9pemF0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWVtb3MgPSB7fTtcblxuICAgIGZ1bmN0aW9uIHJhbmRvbU1heDhIZXhDaGFycygpIHtcbiAgICAgICAgcmV0dXJuICgoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDAwMDAwKSB8IDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tSWQoKSB7XG4gICAgICAgIHJldHVybiByYW5kb21NYXg4SGV4Q2hhcnMoKSArIHJhbmRvbU1heDhIZXhDaGFycygpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmaW5kTWVtb05vZGVzKHJvb3ROb2RlLCBhcHBlbmRUb0FycmF5KSB7XG4gICAgICAgIGlmICghcm9vdE5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChyb290Tm9kZS5ub2RlVHlwZSA9PSA4KSB7XG4gICAgICAgICAgICB2YXIgbWVtb0lkID0ga28ubWVtb2l6YXRpb24ucGFyc2VNZW1vVGV4dChyb290Tm9kZS5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgaWYgKG1lbW9JZCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIGFwcGVuZFRvQXJyYXkucHVzaCh7IGRvbU5vZGU6IHJvb3ROb2RlLCBtZW1vSWQ6IG1lbW9JZCB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChyb290Tm9kZS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgY2hpbGROb2RlcyA9IHJvb3ROb2RlLmNoaWxkTm9kZXMsIGogPSBjaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBmaW5kTWVtb05vZGVzKGNoaWxkTm9kZXNbaV0sIGFwcGVuZFRvQXJyYXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWVtb2l6ZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2FuIG9ubHkgcGFzcyBhIGZ1bmN0aW9uIHRvIGtvLm1lbW9pemF0aW9uLm1lbW9pemUoKVwiKTtcbiAgICAgICAgICAgIHZhciBtZW1vSWQgPSBnZW5lcmF0ZVJhbmRvbUlkKCk7XG4gICAgICAgICAgICBtZW1vc1ttZW1vSWRdID0gY2FsbGJhY2s7XG4gICAgICAgICAgICByZXR1cm4gXCI8IS0tW2tvX21lbW86XCIgKyBtZW1vSWQgKyBcIl0tLT5cIjtcbiAgICAgICAgfSxcblxuICAgICAgICB1bm1lbW9pemU6IGZ1bmN0aW9uIChtZW1vSWQsIGNhbGxiYWNrUGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBtZW1vc1ttZW1vSWRdO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhbnkgbWVtbyB3aXRoIElEIFwiICsgbWVtb0lkICsgXCIuIFBlcmhhcHMgaXQncyBhbHJlYWR5IGJlZW4gdW5tZW1vaXplZC5cIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGNhbGxiYWNrUGFyYW1zIHx8IFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkgeyBkZWxldGUgbWVtb3NbbWVtb0lkXTsgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVubWVtb2l6ZURvbU5vZGVBbmREZXNjZW5kYW50czogZnVuY3Rpb24gKGRvbU5vZGUsIGV4dHJhQ2FsbGJhY2tQYXJhbXNBcnJheSkge1xuICAgICAgICAgICAgdmFyIG1lbW9zID0gW107XG4gICAgICAgICAgICBmaW5kTWVtb05vZGVzKGRvbU5vZGUsIG1lbW9zKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbWVtb3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBtZW1vc1tpXS5kb21Ob2RlO1xuICAgICAgICAgICAgICAgIHZhciBjb21iaW5lZFBhcmFtcyA9IFtub2RlXTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFDYWxsYmFja1BhcmFtc0FycmF5KVxuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoY29tYmluZWRQYXJhbXMsIGV4dHJhQ2FsbGJhY2tQYXJhbXNBcnJheSk7XG4gICAgICAgICAgICAgICAga28ubWVtb2l6YXRpb24udW5tZW1vaXplKG1lbW9zW2ldLm1lbW9JZCwgY29tYmluZWRQYXJhbXMpO1xuICAgICAgICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gXCJcIjsgLy8gTmV1dGVyIHRoaXMgbm9kZSBzbyB3ZSBkb24ndCB0cnkgdG8gdW5tZW1vaXplIGl0IGFnYWluXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpOyAvLyBJZiBwb3NzaWJsZSwgZXJhc2UgaXQgdG90YWxseSAobm90IGFsd2F5cyBwb3NzaWJsZSAtIHNvbWVvbmUgZWxzZSBtaWdodCBqdXN0IGhvbGQgYSByZWZlcmVuY2UgdG8gaXQgdGhlbiBjYWxsIHVubWVtb2l6ZURvbU5vZGVBbmREZXNjZW5kYW50cyBhZ2FpbilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZU1lbW9UZXh0OiBmdW5jdGlvbiAobWVtb1RleHQpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IG1lbW9UZXh0Lm1hdGNoKC9eXFxba29fbWVtb1xcOiguKj8pXFxdJC8pO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24nLCBrby5tZW1vaXphdGlvbik7XG5rby5leHBvcnRTeW1ib2woJ21lbW9pemF0aW9uLm1lbW9pemUnLCBrby5tZW1vaXphdGlvbi5tZW1vaXplKTtcbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24udW5tZW1vaXplJywga28ubWVtb2l6YXRpb24udW5tZW1vaXplKTtcbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24ucGFyc2VNZW1vVGV4dCcsIGtvLm1lbW9pemF0aW9uLnBhcnNlTWVtb1RleHQpO1xua28uZXhwb3J0U3ltYm9sKCdtZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMnLCBrby5tZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMpO1xua28uZXh0ZW5kZXJzID0ge1xuICAgICd0aHJvdHRsZSc6IGZ1bmN0aW9uKHRhcmdldCwgdGltZW91dCkge1xuICAgICAgICAvLyBUaHJvdHRsaW5nIG1lYW5zIHR3byB0aGluZ3M6XG5cbiAgICAgICAgLy8gKDEpIEZvciBkZXBlbmRlbnQgb2JzZXJ2YWJsZXMsIHdlIHRocm90dGxlICpldmFsdWF0aW9ucyogc28gdGhhdCwgbm8gbWF0dGVyIGhvdyBmYXN0IGl0cyBkZXBlbmRlbmNpZXNcbiAgICAgICAgLy8gICAgIG5vdGlmeSB1cGRhdGVzLCB0aGUgdGFyZ2V0IGRvZXNuJ3QgcmUtZXZhbHVhdGUgKGFuZCBoZW5jZSBkb2Vzbid0IG5vdGlmeSkgZmFzdGVyIHRoYW4gYSBjZXJ0YWluIHJhdGVcbiAgICAgICAgdGFyZ2V0Wyd0aHJvdHRsZUV2YWx1YXRpb24nXSA9IHRpbWVvdXQ7XG5cbiAgICAgICAgLy8gKDIpIEZvciB3cml0YWJsZSB0YXJnZXRzIChvYnNlcnZhYmxlcywgb3Igd3JpdGFibGUgZGVwZW5kZW50IG9ic2VydmFibGVzKSwgd2UgdGhyb3R0bGUgKndyaXRlcypcbiAgICAgICAgLy8gICAgIHNvIHRoZSB0YXJnZXQgY2Fubm90IGNoYW5nZSB2YWx1ZSBzeW5jaHJvbm91c2x5IG9yIGZhc3RlciB0aGFuIGEgY2VydGFpbiByYXRlXG4gICAgICAgIHZhciB3cml0ZVRpbWVvdXRJbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIHJldHVybiBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKHtcbiAgICAgICAgICAgICdyZWFkJzogdGFyZ2V0LFxuICAgICAgICAgICAgJ3dyaXRlJzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQod3JpdGVUaW1lb3V0SW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgIHdyaXRlVGltZW91dEluc3RhbmNlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0KHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdyYXRlTGltaXQnOiBmdW5jdGlvbih0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQsIG1ldGhvZCwgbGltaXRGdW5jdGlvbjtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBvcHRpb25zO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZW91dCA9IG9wdGlvbnNbJ3RpbWVvdXQnXTtcbiAgICAgICAgICAgIG1ldGhvZCA9IG9wdGlvbnNbJ21ldGhvZCddO1xuICAgICAgICB9XG5cbiAgICAgICAgbGltaXRGdW5jdGlvbiA9IG1ldGhvZCA9PSAnbm90aWZ5V2hlbkNoYW5nZXNTdG9wJyA/ICBkZWJvdW5jZSA6IHRocm90dGxlO1xuICAgICAgICB0YXJnZXQubGltaXQoZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBsaW1pdEZ1bmN0aW9uKGNhbGxiYWNrLCB0aW1lb3V0KTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdub3RpZnknOiBmdW5jdGlvbih0YXJnZXQsIG5vdGlmeVdoZW4pIHtcbiAgICAgICAgdGFyZ2V0W1wiZXF1YWxpdHlDb21wYXJlclwiXSA9IG5vdGlmeVdoZW4gPT0gXCJhbHdheXNcIiA/XG4gICAgICAgICAgICBudWxsIDogIC8vIG51bGwgZXF1YWxpdHlDb21wYXJlciBtZWFucyB0byBhbHdheXMgbm90aWZ5XG4gICAgICAgICAgICB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbDtcbiAgICB9XG59O1xuXG52YXIgcHJpbWl0aXZlVHlwZXMgPSB7ICd1bmRlZmluZWQnOjEsICdib29sZWFuJzoxLCAnbnVtYmVyJzoxLCAnc3RyaW5nJzoxIH07XG5mdW5jdGlvbiB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbChhLCBiKSB7XG4gICAgdmFyIG9sZFZhbHVlSXNQcmltaXRpdmUgPSAoYSA9PT0gbnVsbCkgfHwgKHR5cGVvZihhKSBpbiBwcmltaXRpdmVUeXBlcyk7XG4gICAgcmV0dXJuIG9sZFZhbHVlSXNQcmltaXRpdmUgPyAoYSA9PT0gYikgOiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gdGhyb3R0bGUoY2FsbGJhY2ssIHRpbWVvdXQpIHtcbiAgICB2YXIgdGltZW91dEluc3RhbmNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGltZW91dEluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aW1lb3V0SW5zdGFuY2UgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXRJbnN0YW5jZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBkZWJvdW5jZShjYWxsYmFjaywgdGltZW91dCkge1xuICAgIHZhciB0aW1lb3V0SW5zdGFuY2U7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJbnN0YW5jZSk7XG4gICAgICAgIHRpbWVvdXRJbnN0YW5jZSA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIHRpbWVvdXQpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFwcGx5RXh0ZW5kZXJzKHJlcXVlc3RlZEV4dGVuZGVycykge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuICAgIGlmIChyZXF1ZXN0ZWRFeHRlbmRlcnMpIHtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChyZXF1ZXN0ZWRFeHRlbmRlcnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBleHRlbmRlckhhbmRsZXIgPSBrby5leHRlbmRlcnNba2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXh0ZW5kZXJIYW5kbGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBleHRlbmRlckhhbmRsZXIodGFyZ2V0LCB2YWx1ZSkgfHwgdGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxua28uZXhwb3J0U3ltYm9sKCdleHRlbmRlcnMnLCBrby5leHRlbmRlcnMpO1xuXG5rby5zdWJzY3JpcHRpb24gPSBmdW5jdGlvbiAodGFyZ2V0LCBjYWxsYmFjaywgZGlzcG9zZUNhbGxiYWNrKSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZGlzcG9zZUNhbGxiYWNrID0gZGlzcG9zZUNhbGxiYWNrO1xuICAgIHRoaXMuaXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KHRoaXMsICdkaXNwb3NlJywgdGhpcy5kaXNwb3NlKTtcbn07XG5rby5zdWJzY3JpcHRpb24ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmRpc3Bvc2VDYWxsYmFjaygpO1xufTtcblxua28uc3Vic2NyaWJhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mT3JFeHRlbmQodGhpcywga28uc3Vic2NyaWJhYmxlWydmbiddKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0ge307XG59XG5cbnZhciBkZWZhdWx0RXZlbnQgPSBcImNoYW5nZVwiO1xuXG52YXIga29fc3Vic2NyaWJhYmxlX2ZuID0ge1xuICAgIHN1YnNjcmliZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjYWxsYmFja1RhcmdldCwgZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGV2ZW50ID0gZXZlbnQgfHwgZGVmYXVsdEV2ZW50O1xuICAgICAgICB2YXIgYm91bmRDYWxsYmFjayA9IGNhbGxiYWNrVGFyZ2V0ID8gY2FsbGJhY2suYmluZChjYWxsYmFja1RhcmdldCkgOiBjYWxsYmFjaztcblxuICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gbmV3IGtvLnN1YnNjcmlwdGlvbihzZWxmLCBib3VuZENhbGxiYWNrLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBrby51dGlscy5hcnJheVJlbW92ZUl0ZW0oc2VsZi5fc3Vic2NyaXB0aW9uc1tldmVudF0sIHN1YnNjcmlwdGlvbik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBmb3JjZSBhIGNvbXB1dGVkIHdpdGggZGVmZXJFdmFsdWF0aW9uIHRvIGV2YWx1YXRlIGJlZm9yZSBhbnkgc3Vic2NyaXB0aW9uc1xuICAgICAgICAvLyBhcmUgcmVnaXN0ZXJlZC5cbiAgICAgICAgaWYgKHNlbGYucGVlaykge1xuICAgICAgICAgICAgc2VsZi5wZWVrKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdKVxuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tldmVudF0gPSBbXTtcbiAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tldmVudF0ucHVzaChzdWJzY3JpcHRpb24pO1xuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH0sXG5cbiAgICBcIm5vdGlmeVN1YnNjcmliZXJzXCI6IGZ1bmN0aW9uICh2YWx1ZVRvTm90aWZ5LCBldmVudCkge1xuICAgICAgICBldmVudCA9IGV2ZW50IHx8IGRlZmF1bHRFdmVudDtcbiAgICAgICAgaWYgKHRoaXMuaGFzU3Vic2NyaXB0aW9uc0ZvckV2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmJlZ2luKCk7IC8vIEJlZ2luIHN1cHByZXNzaW5nIGRlcGVuZGVuY3kgZGV0ZWN0aW9uIChieSBzZXR0aW5nIHRoZSB0b3AgZnJhbWUgdG8gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGEgPSB0aGlzLl9zdWJzY3JpcHRpb25zW2V2ZW50XS5zbGljZSgwKSwgaSA9IDAsIHN1YnNjcmlwdGlvbjsgc3Vic2NyaXB0aW9uID0gYVtpXTsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEluIGNhc2UgYSBzdWJzY3JpcHRpb24gd2FzIGRpc3Bvc2VkIGR1cmluZyB0aGUgYXJyYXlGb3JFYWNoIGN5Y2xlLCBjaGVja1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgaXNEaXNwb3NlZCBvbiBlYWNoIHN1YnNjcmlwdGlvbiBiZWZvcmUgaW52b2tpbmcgaXRzIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3Vic2NyaXB0aW9uLmlzRGlzcG9zZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2sodmFsdWVUb05vdGlmeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmVuZCgpOyAvLyBFbmQgc3VwcHJlc3NpbmcgZGVwZW5kZW5jeSBkZXRlY3Rpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBsaW1pdDogZnVuY3Rpb24obGltaXRGdW5jdGlvbikge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsIHNlbGZJc09ic2VydmFibGUgPSBrby5pc09ic2VydmFibGUoc2VsZiksXG4gICAgICAgICAgICBpc1BlbmRpbmcsIHByZXZpb3VzVmFsdWUsIHBlbmRpbmdWYWx1ZSwgYmVmb3JlQ2hhbmdlID0gJ2JlZm9yZUNoYW5nZSc7XG5cbiAgICAgICAgaWYgKCFzZWxmLl9vcmlnTm90aWZ5U3Vic2NyaWJlcnMpIHtcbiAgICAgICAgICAgIHNlbGYuX29yaWdOb3RpZnlTdWJzY3JpYmVycyA9IHNlbGZbXCJub3RpZnlTdWJzY3JpYmVyc1wiXTtcbiAgICAgICAgICAgIHNlbGZbXCJub3RpZnlTdWJzY3JpYmVyc1wiXSA9IGZ1bmN0aW9uKHZhbHVlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIGlmICghZXZlbnQgfHwgZXZlbnQgPT09IGRlZmF1bHRFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yYXRlTGltaXRlZENoYW5nZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudCA9PT0gYmVmb3JlQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3JhdGVMaW1pdGVkQmVmb3JlQ2hhbmdlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vcmlnTm90aWZ5U3Vic2NyaWJlcnModmFsdWUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpbmlzaCA9IGxpbWl0RnVuY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBJZiBhbiBvYnNlcnZhYmxlIHByb3ZpZGVkIGEgcmVmZXJlbmNlIHRvIGl0c2VsZiwgYWNjZXNzIGl0IHRvIGdldCB0aGUgbGF0ZXN0IHZhbHVlLlxuICAgICAgICAgICAgLy8gVGhpcyBhbGxvd3MgY29tcHV0ZWQgb2JzZXJ2YWJsZXMgdG8gZGVsYXkgY2FsY3VsYXRpbmcgdGhlaXIgdmFsdWUgdW50aWwgbmVlZGVkLlxuICAgICAgICAgICAgaWYgKHNlbGZJc09ic2VydmFibGUgJiYgcGVuZGluZ1ZhbHVlID09PSBzZWxmKSB7XG4gICAgICAgICAgICAgICAgcGVuZGluZ1ZhbHVlID0gc2VsZigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoc2VsZi5pc0RpZmZlcmVudChwcmV2aW91c1ZhbHVlLCBwZW5kaW5nVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb3JpZ05vdGlmeVN1YnNjcmliZXJzKHByZXZpb3VzVmFsdWUgPSBwZW5kaW5nVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzZWxmLl9yYXRlTGltaXRlZENoYW5nZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpc1BlbmRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcGVuZGluZ1ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICBmaW5pc2goKTtcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5fcmF0ZUxpbWl0ZWRCZWZvcmVDaGFuZ2UgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKCFpc1BlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBwcmV2aW91c1ZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgc2VsZi5fb3JpZ05vdGlmeVN1YnNjcmliZXJzKHZhbHVlLCBiZWZvcmVDaGFuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBoYXNTdWJzY3JpcHRpb25zRm9yRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdWJzY3JpcHRpb25zW2V2ZW50XSAmJiB0aGlzLl9zdWJzY3JpcHRpb25zW2V2ZW50XS5sZW5ndGg7XG4gICAgfSxcblxuICAgIGdldFN1YnNjcmlwdGlvbnNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKHRoaXMuX3N1YnNjcmlwdGlvbnMsIGZ1bmN0aW9uKGV2ZW50TmFtZSwgc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgdG90YWwgKz0gc3Vic2NyaXB0aW9ucy5sZW5ndGg7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG90YWw7XG4gICAgfSxcblxuICAgIGlzRGlmZmVyZW50OiBmdW5jdGlvbihvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzWydlcXVhbGl0eUNvbXBhcmVyJ10gfHwgIXRoaXNbJ2VxdWFsaXR5Q29tcGFyZXInXShvbGRWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIH0sXG5cbiAgICBleHRlbmQ6IGFwcGx5RXh0ZW5kZXJzXG59O1xuXG5rby5leHBvcnRQcm9wZXJ0eShrb19zdWJzY3JpYmFibGVfZm4sICdzdWJzY3JpYmUnLCBrb19zdWJzY3JpYmFibGVfZm4uc3Vic2NyaWJlKTtcbmtvLmV4cG9ydFByb3BlcnR5KGtvX3N1YnNjcmliYWJsZV9mbiwgJ2V4dGVuZCcsIGtvX3N1YnNjcmliYWJsZV9mbi5leHRlbmQpO1xua28uZXhwb3J0UHJvcGVydHkoa29fc3Vic2NyaWJhYmxlX2ZuLCAnZ2V0U3Vic2NyaXB0aW9uc0NvdW50Jywga29fc3Vic2NyaWJhYmxlX2ZuLmdldFN1YnNjcmlwdGlvbnNDb3VudCk7XG5cbi8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgcHJvdG8gYXNzaWdubWVudCwgd2Ugb3ZlcndyaXRlIHRoZSBwcm90b3R5cGUgb2YgZWFjaFxuLy8gb2JzZXJ2YWJsZSBpbnN0YW5jZS4gU2luY2Ugb2JzZXJ2YWJsZXMgYXJlIGZ1bmN0aW9ucywgd2UgbmVlZCBGdW5jdGlvbi5wcm90b3R5cGVcbi8vIHRvIHN0aWxsIGJlIGluIHRoZSBwcm90b3R5cGUgY2hhaW4uXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa29fc3Vic2NyaWJhYmxlX2ZuLCBGdW5jdGlvbi5wcm90b3R5cGUpO1xufVxuXG5rby5zdWJzY3JpYmFibGVbJ2ZuJ10gPSBrb19zdWJzY3JpYmFibGVfZm47XG5cblxua28uaXNTdWJzY3JpYmFibGUgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICByZXR1cm4gaW5zdGFuY2UgIT0gbnVsbCAmJiB0eXBlb2YgaW5zdGFuY2Uuc3Vic2NyaWJlID09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgaW5zdGFuY2VbXCJub3RpZnlTdWJzY3JpYmVyc1wiXSA9PSBcImZ1bmN0aW9uXCI7XG59O1xuXG5rby5leHBvcnRTeW1ib2woJ3N1YnNjcmliYWJsZScsIGtvLnN1YnNjcmliYWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ2lzU3Vic2NyaWJhYmxlJywga28uaXNTdWJzY3JpYmFibGUpO1xuXG5rby5jb21wdXRlZENvbnRleHQgPSBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3V0ZXJGcmFtZXMgPSBbXSxcbiAgICAgICAgY3VycmVudEZyYW1lLFxuICAgICAgICBsYXN0SWQgPSAwO1xuXG4gICAgLy8gUmV0dXJuIGEgdW5pcXVlIElEIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvIGFuIG9ic2VydmFibGUgZm9yIGRlcGVuZGVuY3kgdHJhY2tpbmcuXG4gICAgLy8gVGhlb3JldGljYWxseSwgeW91IGNvdWxkIGV2ZW50dWFsbHkgb3ZlcmZsb3cgdGhlIG51bWJlciBzdG9yYWdlIHNpemUsIHJlc3VsdGluZ1xuICAgIC8vIGluIGR1cGxpY2F0ZSBJRHMuIEJ1dCBpbiBKYXZhU2NyaXB0LCB0aGUgbGFyZ2VzdCBleGFjdCBpbnRlZ3JhbCB2YWx1ZSBpcyAyXjUzXG4gICAgLy8gb3IgOSwwMDcsMTk5LDI1NCw3NDAsOTkyLiBJZiB5b3UgY3JlYXRlZCAxLDAwMCwwMDAgSURzIHBlciBzZWNvbmQsIGl0IHdvdWxkXG4gICAgLy8gdGFrZSBvdmVyIDI4NSB5ZWFycyB0byByZWFjaCB0aGF0IG51bWJlci5cbiAgICAvLyBSZWZlcmVuY2UgaHR0cDovL2Jsb2cudmpldXguY29tLzIwMTAvamF2YXNjcmlwdC9qYXZhc2NyaXB0LW1heF9pbnQtbnVtYmVyLWxpbWl0cy5odG1sXG4gICAgZnVuY3Rpb24gZ2V0SWQoKSB7XG4gICAgICAgIHJldHVybiArK2xhc3RJZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiZWdpbihvcHRpb25zKSB7XG4gICAgICAgIG91dGVyRnJhbWVzLnB1c2goY3VycmVudEZyYW1lKTtcbiAgICAgICAgY3VycmVudEZyYW1lID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbmQoKSB7XG4gICAgICAgIGN1cnJlbnRGcmFtZSA9IG91dGVyRnJhbWVzLnBvcCgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGJlZ2luOiBiZWdpbixcblxuICAgICAgICBlbmQ6IGVuZCxcblxuICAgICAgICByZWdpc3RlckRlcGVuZGVuY3k6IGZ1bmN0aW9uIChzdWJzY3JpYmFibGUpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWtvLmlzU3Vic2NyaWJhYmxlKHN1YnNjcmliYWJsZSkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk9ubHkgc3Vic2NyaWJhYmxlIHRoaW5ncyBjYW4gYWN0IGFzIGRlcGVuZGVuY2llc1wiKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50RnJhbWUuY2FsbGJhY2soc3Vic2NyaWJhYmxlLCBzdWJzY3JpYmFibGUuX2lkIHx8IChzdWJzY3JpYmFibGUuX2lkID0gZ2V0SWQoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlnbm9yZTogZnVuY3Rpb24gKGNhbGxiYWNrLCBjYWxsYmFja1RhcmdldCwgY2FsbGJhY2tBcmdzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGJlZ2luKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KGNhbGxiYWNrVGFyZ2V0LCBjYWxsYmFja0FyZ3MgfHwgW10pO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBlbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXREZXBlbmRlbmNpZXNDb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRGcmFtZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudEZyYW1lLmNvbXB1dGVkLmdldERlcGVuZGVuY2llc0NvdW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJbml0aWFsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RnJhbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZS5pc0luaXRpYWw7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQnLCBrby5jb21wdXRlZENvbnRleHQpO1xua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQuZ2V0RGVwZW5kZW5jaWVzQ291bnQnLCBrby5jb21wdXRlZENvbnRleHQuZ2V0RGVwZW5kZW5jaWVzQ291bnQpO1xua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZENvbnRleHQuaXNJbml0aWFsJywga28uY29tcHV0ZWRDb250ZXh0LmlzSW5pdGlhbCk7XG5rby5vYnNlcnZhYmxlID0gZnVuY3Rpb24gKGluaXRpYWxWYWx1ZSkge1xuICAgIHZhciBfbGF0ZXN0VmFsdWUgPSBpbml0aWFsVmFsdWU7XG5cbiAgICBmdW5jdGlvbiBvYnNlcnZhYmxlKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIFdyaXRlXG5cbiAgICAgICAgICAgIC8vIElnbm9yZSB3cml0ZXMgaWYgdGhlIHZhbHVlIGhhc24ndCBjaGFuZ2VkXG4gICAgICAgICAgICBpZiAob2JzZXJ2YWJsZS5pc0RpZmZlcmVudChfbGF0ZXN0VmFsdWUsIGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZhYmxlLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICAgICAgICAgIF9sYXRlc3RWYWx1ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIG9ic2VydmFibGUuX2xhdGVzdFZhbHVlID0gX2xhdGVzdFZhbHVlO1xuICAgICAgICAgICAgICAgIG9ic2VydmFibGUudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gUGVybWl0cyBjaGFpbmVkIGFzc2lnbm1lbnRzXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBSZWFkXG4gICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLnJlZ2lzdGVyRGVwZW5kZW5jeShvYnNlcnZhYmxlKTsgLy8gVGhlIGNhbGxlciBvbmx5IG5lZWRzIHRvIGJlIG5vdGlmaWVkIG9mIGNoYW5nZXMgaWYgdGhleSBkaWQgYSBcInJlYWRcIiBvcGVyYXRpb25cbiAgICAgICAgICAgIHJldHVybiBfbGF0ZXN0VmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAga28uc3Vic2NyaWJhYmxlLmNhbGwob2JzZXJ2YWJsZSk7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2ZPckV4dGVuZChvYnNlcnZhYmxlLCBrby5vYnNlcnZhYmxlWydmbiddKTtcblxuICAgIGlmIChERUJVRykgb2JzZXJ2YWJsZS5fbGF0ZXN0VmFsdWUgPSBfbGF0ZXN0VmFsdWU7XG4gICAgb2JzZXJ2YWJsZS5wZWVrID0gZnVuY3Rpb24oKSB7IHJldHVybiBfbGF0ZXN0VmFsdWUgfTtcbiAgICBvYnNlcnZhYmxlLnZhbHVlSGFzTXV0YXRlZCA9IGZ1bmN0aW9uICgpIHsgb2JzZXJ2YWJsZVtcIm5vdGlmeVN1YnNjcmliZXJzXCJdKF9sYXRlc3RWYWx1ZSk7IH1cbiAgICBvYnNlcnZhYmxlLnZhbHVlV2lsbE11dGF0ZSA9IGZ1bmN0aW9uICgpIHsgb2JzZXJ2YWJsZVtcIm5vdGlmeVN1YnNjcmliZXJzXCJdKF9sYXRlc3RWYWx1ZSwgXCJiZWZvcmVDaGFuZ2VcIik7IH1cblxuICAgIGtvLmV4cG9ydFByb3BlcnR5KG9ic2VydmFibGUsICdwZWVrJywgb2JzZXJ2YWJsZS5wZWVrKTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eShvYnNlcnZhYmxlLCBcInZhbHVlSGFzTXV0YXRlZFwiLCBvYnNlcnZhYmxlLnZhbHVlSGFzTXV0YXRlZCk7XG4gICAga28uZXhwb3J0UHJvcGVydHkob2JzZXJ2YWJsZSwgXCJ2YWx1ZVdpbGxNdXRhdGVcIiwgb2JzZXJ2YWJsZS52YWx1ZVdpbGxNdXRhdGUpO1xuXG4gICAgcmV0dXJuIG9ic2VydmFibGU7XG59XG5cbmtvLm9ic2VydmFibGVbJ2ZuJ10gPSB7XG4gICAgXCJlcXVhbGl0eUNvbXBhcmVyXCI6IHZhbHVlc0FyZVByaW1pdGl2ZUFuZEVxdWFsXG59O1xuXG52YXIgcHJvdG9Qcm9wZXJ0eSA9IGtvLm9ic2VydmFibGUucHJvdG9Qcm9wZXJ0eSA9IFwiX19rb19wcm90b19fXCI7XG5rby5vYnNlcnZhYmxlWydmbiddW3Byb3RvUHJvcGVydHldID0ga28ub2JzZXJ2YWJsZTtcblxuLy8gTm90ZSB0aGF0IGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgcHJvdG8gYXNzaWdubWVudCwgdGhlXG4vLyBpbmhlcml0YW5jZSBjaGFpbiBpcyBjcmVhdGVkIG1hbnVhbGx5IGluIHRoZSBrby5vYnNlcnZhYmxlIGNvbnN0cnVjdG9yXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa28ub2JzZXJ2YWJsZVsnZm4nXSwga28uc3Vic2NyaWJhYmxlWydmbiddKTtcbn1cblxua28uaGFzUHJvdG90eXBlID0gZnVuY3Rpb24oaW5zdGFuY2UsIHByb3RvdHlwZSkge1xuICAgIGlmICgoaW5zdGFuY2UgPT09IG51bGwpIHx8IChpbnN0YW5jZSA9PT0gdW5kZWZpbmVkKSB8fCAoaW5zdGFuY2VbcHJvdG9Qcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoaW5zdGFuY2VbcHJvdG9Qcm9wZXJ0eV0gPT09IHByb3RvdHlwZSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGtvLmhhc1Byb3RvdHlwZShpbnN0YW5jZVtwcm90b1Byb3BlcnR5XSwgcHJvdG90eXBlKTsgLy8gV2FsayB0aGUgcHJvdG90eXBlIGNoYWluXG59O1xuXG5rby5pc09ic2VydmFibGUgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICByZXR1cm4ga28uaGFzUHJvdG90eXBlKGluc3RhbmNlLCBrby5vYnNlcnZhYmxlKTtcbn1cbmtvLmlzV3JpdGVhYmxlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIC8vIE9ic2VydmFibGVcbiAgICBpZiAoKHR5cGVvZiBpbnN0YW5jZSA9PSBcImZ1bmN0aW9uXCIpICYmIGluc3RhbmNlW3Byb3RvUHJvcGVydHldID09PSBrby5vYnNlcnZhYmxlKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyBXcml0ZWFibGUgZGVwZW5kZW50IG9ic2VydmFibGVcbiAgICBpZiAoKHR5cGVvZiBpbnN0YW5jZSA9PSBcImZ1bmN0aW9uXCIpICYmIChpbnN0YW5jZVtwcm90b1Byb3BlcnR5XSA9PT0ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSkgJiYgKGluc3RhbmNlLmhhc1dyaXRlRnVuY3Rpb24pKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBbnl0aGluZyBlbHNlXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmtvLmV4cG9ydFN5bWJvbCgnb2JzZXJ2YWJsZScsIGtvLm9ic2VydmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCdpc09ic2VydmFibGUnLCBrby5pc09ic2VydmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCdpc1dyaXRlYWJsZU9ic2VydmFibGUnLCBrby5pc1dyaXRlYWJsZU9ic2VydmFibGUpO1xua28ub2JzZXJ2YWJsZUFycmF5ID0gZnVuY3Rpb24gKGluaXRpYWxWYWx1ZXMpIHtcbiAgICBpbml0aWFsVmFsdWVzID0gaW5pdGlhbFZhbHVlcyB8fCBbXTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFZhbHVlcyAhPSAnb2JqZWN0JyB8fCAhKCdsZW5ndGgnIGluIGluaXRpYWxWYWx1ZXMpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYXJndW1lbnQgcGFzc2VkIHdoZW4gaW5pdGlhbGl6aW5nIGFuIG9ic2VydmFibGUgYXJyYXkgbXVzdCBiZSBhbiBhcnJheSwgb3IgbnVsbCwgb3IgdW5kZWZpbmVkLlwiKTtcblxuICAgIHZhciByZXN1bHQgPSBrby5vYnNlcnZhYmxlKGluaXRpYWxWYWx1ZXMpO1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mT3JFeHRlbmQocmVzdWx0LCBrby5vYnNlcnZhYmxlQXJyYXlbJ2ZuJ10pO1xuICAgIHJldHVybiByZXN1bHQuZXh0ZW5kKHsndHJhY2tBcnJheUNoYW5nZXMnOnRydWV9KTtcbn07XG5cbmtvLm9ic2VydmFibGVBcnJheVsnZm4nXSA9IHtcbiAgICAncmVtb3ZlJzogZnVuY3Rpb24gKHZhbHVlT3JQcmVkaWNhdGUpIHtcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMucGVlaygpO1xuICAgICAgICB2YXIgcmVtb3ZlZFZhbHVlcyA9IFtdO1xuICAgICAgICB2YXIgcHJlZGljYXRlID0gdHlwZW9mIHZhbHVlT3JQcmVkaWNhdGUgPT0gXCJmdW5jdGlvblwiICYmICFrby5pc09ic2VydmFibGUodmFsdWVPclByZWRpY2F0ZSkgPyB2YWx1ZU9yUHJlZGljYXRlIDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZSA9PT0gdmFsdWVPclByZWRpY2F0ZTsgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bmRlcmx5aW5nQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHVuZGVybHlpbmdBcnJheVtpXTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZWRWYWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWVXaWxsTXV0YXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlbW92ZWRWYWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdW5kZXJseWluZ0FycmF5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW92ZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZW1vdmVkVmFsdWVzO1xuICAgIH0sXG5cbiAgICAncmVtb3ZlQWxsJzogZnVuY3Rpb24gKGFycmF5T2ZWYWx1ZXMpIHtcbiAgICAgICAgLy8gSWYgeW91IHBhc3NlZCB6ZXJvIGFyZ3MsIHdlIHJlbW92ZSBldmVyeXRoaW5nXG4gICAgICAgIGlmIChhcnJheU9mVmFsdWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciB1bmRlcmx5aW5nQXJyYXkgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgICAgIHZhciBhbGxWYWx1ZXMgPSB1bmRlcmx5aW5nQXJyYXkuc2xpY2UoMCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICAgICAgdW5kZXJseWluZ0FycmF5LnNwbGljZSgwLCB1bmRlcmx5aW5nQXJyYXkubGVuZ3RoKTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgICAgICAgICByZXR1cm4gYWxsVmFsdWVzO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHlvdSBwYXNzZWQgYW4gYXJnLCB3ZSBpbnRlcnByZXQgaXQgYXMgYW4gYXJyYXkgb2YgZW50cmllcyB0byByZW1vdmVcbiAgICAgICAgaWYgKCFhcnJheU9mVmFsdWVzKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gdGhpc1sncmVtb3ZlJ10oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4ga28udXRpbHMuYXJyYXlJbmRleE9mKGFycmF5T2ZWYWx1ZXMsIHZhbHVlKSA+PSAwO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgJ2Rlc3Ryb3knOiBmdW5jdGlvbiAodmFsdWVPclByZWRpY2F0ZSkge1xuICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIHZhciBwcmVkaWNhdGUgPSB0eXBlb2YgdmFsdWVPclByZWRpY2F0ZSA9PSBcImZ1bmN0aW9uXCIgJiYgIWtvLmlzT2JzZXJ2YWJsZSh2YWx1ZU9yUHJlZGljYXRlKSA/IHZhbHVlT3JQcmVkaWNhdGUgOiBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlID09PSB2YWx1ZU9yUHJlZGljYXRlOyB9O1xuICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICBmb3IgKHZhciBpID0gdW5kZXJseWluZ0FycmF5Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB1bmRlcmx5aW5nQXJyYXlbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKHZhbHVlKSlcbiAgICAgICAgICAgICAgICB1bmRlcmx5aW5nQXJyYXlbaV1bXCJfZGVzdHJveVwiXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZUhhc011dGF0ZWQoKTtcbiAgICB9LFxuXG4gICAgJ2Rlc3Ryb3lBbGwnOiBmdW5jdGlvbiAoYXJyYXlPZlZhbHVlcykge1xuICAgICAgICAvLyBJZiB5b3UgcGFzc2VkIHplcm8gYXJncywgd2UgZGVzdHJveSBldmVyeXRoaW5nXG4gICAgICAgIGlmIChhcnJheU9mVmFsdWVzID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICByZXR1cm4gdGhpc1snZGVzdHJveSddKGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZSB9KTtcblxuICAgICAgICAvLyBJZiB5b3UgcGFzc2VkIGFuIGFyZywgd2UgaW50ZXJwcmV0IGl0IGFzIGFuIGFycmF5IG9mIGVudHJpZXMgdG8gZGVzdHJveVxuICAgICAgICBpZiAoIWFycmF5T2ZWYWx1ZXMpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiB0aGlzWydkZXN0cm95J10oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4ga28udXRpbHMuYXJyYXlJbmRleE9mKGFycmF5T2ZWYWx1ZXMsIHZhbHVlKSA+PSAwO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgJ2luZGV4T2YnOiBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcygpO1xuICAgICAgICByZXR1cm4ga28udXRpbHMuYXJyYXlJbmRleE9mKHVuZGVybHlpbmdBcnJheSwgaXRlbSk7XG4gICAgfSxcblxuICAgICdyZXBsYWNlJzogZnVuY3Rpb24ob2xkSXRlbSwgbmV3SXRlbSkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzWydpbmRleE9mJ10ob2xkSXRlbSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wZWVrKClbaW5kZXhdID0gbmV3SXRlbTtcbiAgICAgICAgICAgIHRoaXMudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBQb3B1bGF0ZSBrby5vYnNlcnZhYmxlQXJyYXkuZm4gd2l0aCByZWFkL3dyaXRlIGZ1bmN0aW9ucyBmcm9tIG5hdGl2ZSBhcnJheXNcbi8vIEltcG9ydGFudDogRG8gbm90IGFkZCBhbnkgYWRkaXRpb25hbCBmdW5jdGlvbnMgaGVyZSB0aGF0IG1heSByZWFzb25hYmx5IGJlIHVzZWQgdG8gKnJlYWQqIGRhdGEgZnJvbSB0aGUgYXJyYXlcbi8vIGJlY2F1c2Ugd2UnbGwgZXZhbCB0aGVtIHdpdGhvdXQgY2F1c2luZyBzdWJzY3JpcHRpb25zLCBzbyBrby5jb21wdXRlZCBvdXRwdXQgY291bGQgZW5kIHVwIGdldHRpbmcgc3RhbGVcbmtvLnV0aWxzLmFycmF5Rm9yRWFjaChbXCJwb3BcIiwgXCJwdXNoXCIsIFwicmV2ZXJzZVwiLCBcInNoaWZ0XCIsIFwic29ydFwiLCBcInNwbGljZVwiLCBcInVuc2hpZnRcIl0sIGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAga28ub2JzZXJ2YWJsZUFycmF5WydmbiddW21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBVc2UgXCJwZWVrXCIgdG8gYXZvaWQgY3JlYXRpbmcgYSBzdWJzY3JpcHRpb24gaW4gYW55IGNvbXB1dGVkIHRoYXQgd2UncmUgZXhlY3V0aW5nIGluIHRoZSBjb250ZXh0IG9mXG4gICAgICAgIC8vIChmb3IgY29uc2lzdGVuY3kgd2l0aCBtdXRhdGluZyByZWd1bGFyIG9ic2VydmFibGVzKVxuICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgIHRoaXMudmFsdWVXaWxsTXV0YXRlKCk7XG4gICAgICAgIHRoaXMuY2FjaGVEaWZmRm9yS25vd25PcGVyYXRpb24odW5kZXJseWluZ0FycmF5LCBtZXRob2ROYW1lLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgbWV0aG9kQ2FsbFJlc3VsdCA9IHVuZGVybHlpbmdBcnJheVttZXRob2ROYW1lXS5hcHBseSh1bmRlcmx5aW5nQXJyYXksIGFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgICAgIHJldHVybiBtZXRob2RDYWxsUmVzdWx0O1xuICAgIH07XG59KTtcblxuLy8gUG9wdWxhdGUga28ub2JzZXJ2YWJsZUFycmF5LmZuIHdpdGggcmVhZC1vbmx5IGZ1bmN0aW9ucyBmcm9tIG5hdGl2ZSBhcnJheXNcbmtvLnV0aWxzLmFycmF5Rm9yRWFjaChbXCJzbGljZVwiXSwgZnVuY3Rpb24gKG1ldGhvZE5hbWUpIHtcbiAgICBrby5vYnNlcnZhYmxlQXJyYXlbJ2ZuJ11bbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bmRlcmx5aW5nQXJyYXkgPSB0aGlzKCk7XG4gICAgICAgIHJldHVybiB1bmRlcmx5aW5nQXJyYXlbbWV0aG9kTmFtZV0uYXBwbHkodW5kZXJseWluZ0FycmF5LCBhcmd1bWVudHMpO1xuICAgIH07XG59KTtcblxuLy8gTm90ZSB0aGF0IGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgcHJvdG8gYXNzaWdubWVudCwgdGhlXG4vLyBpbmhlcml0YW5jZSBjaGFpbiBpcyBjcmVhdGVkIG1hbnVhbGx5IGluIHRoZSBrby5vYnNlcnZhYmxlQXJyYXkgY29uc3RydWN0b3JcbmlmIChrby51dGlscy5jYW5TZXRQcm90b3R5cGUpIHtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZihrby5vYnNlcnZhYmxlQXJyYXlbJ2ZuJ10sIGtvLm9ic2VydmFibGVbJ2ZuJ10pO1xufVxuXG5rby5leHBvcnRTeW1ib2woJ29ic2VydmFibGVBcnJheScsIGtvLm9ic2VydmFibGVBcnJheSk7XG52YXIgYXJyYXlDaGFuZ2VFdmVudE5hbWUgPSAnYXJyYXlDaGFuZ2UnO1xua28uZXh0ZW5kZXJzWyd0cmFja0FycmF5Q2hhbmdlcyddID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgLy8gT25seSBtb2RpZnkgdGhlIHRhcmdldCBvYnNlcnZhYmxlIG9uY2VcbiAgICBpZiAodGFyZ2V0LmNhY2hlRGlmZkZvcktub3duT3BlcmF0aW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRyYWNraW5nQ2hhbmdlcyA9IGZhbHNlLFxuICAgICAgICBjYWNoZWREaWZmID0gbnVsbCxcbiAgICAgICAgcGVuZGluZ05vdGlmaWNhdGlvbnMgPSAwLFxuICAgICAgICB1bmRlcmx5aW5nU3Vic2NyaWJlRnVuY3Rpb24gPSB0YXJnZXQuc3Vic2NyaWJlO1xuXG4gICAgLy8gSW50ZXJjZXB0IFwic3Vic2NyaWJlXCIgY2FsbHMsIGFuZCBmb3IgYXJyYXkgY2hhbmdlIGV2ZW50cywgZW5zdXJlIGNoYW5nZSB0cmFja2luZyBpcyBlbmFibGVkXG4gICAgdGFyZ2V0LnN1YnNjcmliZSA9IHRhcmdldFsnc3Vic2NyaWJlJ10gPSBmdW5jdGlvbihjYWxsYmFjaywgY2FsbGJhY2tUYXJnZXQsIGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCA9PT0gYXJyYXlDaGFuZ2VFdmVudE5hbWUpIHtcbiAgICAgICAgICAgIHRyYWNrQ2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlcmx5aW5nU3Vic2NyaWJlRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdHJhY2tDaGFuZ2VzKCkge1xuICAgICAgICAvLyBDYWxsaW5nICd0cmFja0NoYW5nZXMnIG11bHRpcGxlIHRpbWVzIGlzIHRoZSBzYW1lIGFzIGNhbGxpbmcgaXQgb25jZVxuICAgICAgICBpZiAodHJhY2tpbmdDaGFuZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cmFja2luZ0NoYW5nZXMgPSB0cnVlO1xuXG4gICAgICAgIC8vIEludGVyY2VwdCBcIm5vdGlmeVN1YnNjcmliZXJzXCIgdG8gdHJhY2sgaG93IG1hbnkgdGltZXMgaXQgd2FzIGNhbGxlZC5cbiAgICAgICAgdmFyIHVuZGVybHlpbmdOb3RpZnlTdWJzY3JpYmVyc0Z1bmN0aW9uID0gdGFyZ2V0Wydub3RpZnlTdWJzY3JpYmVycyddO1xuICAgICAgICB0YXJnZXRbJ25vdGlmeVN1YnNjcmliZXJzJ10gPSBmdW5jdGlvbih2YWx1ZVRvTm90aWZ5LCBldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudCB8fCBldmVudCA9PT0gZGVmYXVsdEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgKytwZW5kaW5nTm90aWZpY2F0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlcmx5aW5nTm90aWZ5U3Vic2NyaWJlcnNGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEVhY2ggdGltZSB0aGUgYXJyYXkgY2hhbmdlcyB2YWx1ZSwgY2FwdHVyZSBhIGNsb25lIHNvIHRoYXQgb24gdGhlIG5leHRcbiAgICAgICAgLy8gY2hhbmdlIGl0J3MgcG9zc2libGUgdG8gcHJvZHVjZSBhIGRpZmZcbiAgICAgICAgdmFyIHByZXZpb3VzQ29udGVudHMgPSBbXS5jb25jYXQodGFyZ2V0LnBlZWsoKSB8fCBbXSk7XG4gICAgICAgIGNhY2hlZERpZmYgPSBudWxsO1xuICAgICAgICB0YXJnZXQuc3Vic2NyaWJlKGZ1bmN0aW9uKGN1cnJlbnRDb250ZW50cykge1xuICAgICAgICAgICAgLy8gTWFrZSBhIGNvcHkgb2YgdGhlIGN1cnJlbnQgY29udGVudHMgYW5kIGVuc3VyZSBpdCdzIGFuIGFycmF5XG4gICAgICAgICAgICBjdXJyZW50Q29udGVudHMgPSBbXS5jb25jYXQoY3VycmVudENvbnRlbnRzIHx8IFtdKTtcblxuICAgICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgZGlmZiBhbmQgaXNzdWUgbm90aWZpY2F0aW9ucywgYnV0IG9ubHkgaWYgc29tZW9uZSBpcyBsaXN0ZW5pbmdcbiAgICAgICAgICAgIGlmICh0YXJnZXQuaGFzU3Vic2NyaXB0aW9uc0ZvckV2ZW50KGFycmF5Q2hhbmdlRXZlbnROYW1lKSkge1xuICAgICAgICAgICAgICAgIHZhciBjaGFuZ2VzID0gZ2V0Q2hhbmdlcyhwcmV2aW91c0NvbnRlbnRzLCBjdXJyZW50Q29udGVudHMpO1xuICAgICAgICAgICAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbJ25vdGlmeVN1YnNjcmliZXJzJ10oY2hhbmdlcywgYXJyYXlDaGFuZ2VFdmVudE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRWxpbWluYXRlIHJlZmVyZW5jZXMgdG8gdGhlIG9sZCwgcmVtb3ZlZCBpdGVtcywgc28gdGhleSBjYW4gYmUgR0NlZFxuICAgICAgICAgICAgcHJldmlvdXNDb250ZW50cyA9IGN1cnJlbnRDb250ZW50cztcbiAgICAgICAgICAgIGNhY2hlZERpZmYgPSBudWxsO1xuICAgICAgICAgICAgcGVuZGluZ05vdGlmaWNhdGlvbnMgPSAwO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDaGFuZ2VzKHByZXZpb3VzQ29udGVudHMsIGN1cnJlbnRDb250ZW50cykge1xuICAgICAgICAvLyBXZSB0cnkgdG8gcmUtdXNlIGNhY2hlZCBkaWZmcy5cbiAgICAgICAgLy8gVGhlIHNjZW5hcmlvcyB3aGVyZSBwZW5kaW5nTm90aWZpY2F0aW9ucyA+IDEgYXJlIHdoZW4gdXNpbmcgcmF0ZS1saW1pdGluZyBvciB0aGUgRGVmZXJyZWQgVXBkYXRlc1xuICAgICAgICAvLyBwbHVnaW4sIHdoaWNoIHdpdGhvdXQgdGhpcyBjaGVjayB3b3VsZCBub3QgYmUgY29tcGF0aWJsZSB3aXRoIGFycmF5Q2hhbmdlIG5vdGlmaWNhdGlvbnMuIE5vcm1hbGx5LFxuICAgICAgICAvLyBub3RpZmljYXRpb25zIGFyZSBpc3N1ZWQgaW1tZWRpYXRlbHkgc28gd2Ugd291bGRuJ3QgYmUgcXVldWVpbmcgdXAgbW9yZSB0aGFuIG9uZS5cbiAgICAgICAgaWYgKCFjYWNoZWREaWZmIHx8IHBlbmRpbmdOb3RpZmljYXRpb25zID4gMSkge1xuICAgICAgICAgICAgY2FjaGVkRGlmZiA9IGtvLnV0aWxzLmNvbXBhcmVBcnJheXMocHJldmlvdXNDb250ZW50cywgY3VycmVudENvbnRlbnRzLCB7ICdzcGFyc2UnOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNhY2hlZERpZmY7XG4gICAgfVxuXG4gICAgdGFyZ2V0LmNhY2hlRGlmZkZvcktub3duT3BlcmF0aW9uID0gZnVuY3Rpb24ocmF3QXJyYXksIG9wZXJhdGlvbk5hbWUsIGFyZ3MpIHtcbiAgICAgICAgLy8gT25seSBydW4gaWYgd2UncmUgY3VycmVudGx5IHRyYWNraW5nIGNoYW5nZXMgZm9yIHRoaXMgb2JzZXJ2YWJsZSBhcnJheVxuICAgICAgICAvLyBhbmQgdGhlcmUgYXJlbid0IGFueSBwZW5kaW5nIGRlZmVycmVkIG5vdGlmaWNhdGlvbnMuXG4gICAgICAgIGlmICghdHJhY2tpbmdDaGFuZ2VzIHx8IHBlbmRpbmdOb3RpZmljYXRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpZmYgPSBbXSxcbiAgICAgICAgICAgIGFycmF5TGVuZ3RoID0gcmF3QXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgYXJnc0xlbmd0aCA9IGFyZ3MubGVuZ3RoLFxuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcblxuICAgICAgICBmdW5jdGlvbiBwdXNoRGlmZihzdGF0dXMsIHZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpZmZbZGlmZi5sZW5ndGhdID0geyAnc3RhdHVzJzogc3RhdHVzLCAndmFsdWUnOiB2YWx1ZSwgJ2luZGV4JzogaW5kZXggfTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICAgICAgICAgIG9mZnNldCA9IGFycmF5TGVuZ3RoO1xuICAgICAgICAgICAgY2FzZSAndW5zaGlmdCc6XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGFyZ3NMZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaERpZmYoJ2FkZGVkJywgYXJnc1tpbmRleF0sIG9mZnNldCArIGluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ3BvcCc6XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gYXJyYXlMZW5ndGggLSAxO1xuICAgICAgICAgICAgY2FzZSAnc2hpZnQnOlxuICAgICAgICAgICAgICAgIGlmIChhcnJheUxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoRGlmZignZGVsZXRlZCcsIHJhd0FycmF5W29mZnNldF0sIG9mZnNldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICAgICAgICAgIC8vIE5lZ2F0aXZlIHN0YXJ0IGluZGV4IG1lYW5zICdmcm9tIGVuZCBvZiBhcnJheScuIEFmdGVyIHRoYXQgd2UgY2xhbXAgdG8gWzAuLi5hcnJheUxlbmd0aF0uXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3NwbGljZVxuICAgICAgICAgICAgICAgIHZhciBzdGFydEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYXJnc1swXSA8IDAgPyBhcnJheUxlbmd0aCArIGFyZ3NbMF0gOiBhcmdzWzBdKSwgYXJyYXlMZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBlbmREZWxldGVJbmRleCA9IGFyZ3NMZW5ndGggPT09IDEgPyBhcnJheUxlbmd0aCA6IE1hdGgubWluKHN0YXJ0SW5kZXggKyAoYXJnc1sxXSB8fCAwKSwgYXJyYXlMZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICBlbmRBZGRJbmRleCA9IHN0YXJ0SW5kZXggKyBhcmdzTGVuZ3RoIC0gMixcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSBNYXRoLm1heChlbmREZWxldGVJbmRleCwgZW5kQWRkSW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbnMgPSBbXSwgZGVsZXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSBzdGFydEluZGV4LCBhcmdzSW5kZXggPSAyOyBpbmRleCA8IGVuZEluZGV4OyArK2luZGV4LCArK2FyZ3NJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBlbmREZWxldGVJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0aW9ucy5wdXNoKHB1c2hEaWZmKCdkZWxldGVkJywgcmF3QXJyYXlbaW5kZXhdLCBpbmRleCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCBlbmRBZGRJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9ucy5wdXNoKHB1c2hEaWZmKCdhZGRlZCcsIGFyZ3NbYXJnc0luZGV4XSwgaW5kZXgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAga28udXRpbHMuZmluZE1vdmVzSW5BcnJheUNvbXBhcmlzb24oZGVsZXRpb25zLCBhZGRpdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjYWNoZWREaWZmID0gZGlmZjtcbiAgICB9O1xufTtcbmtvLmNvbXB1dGVkID0ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucywgZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgX2xhdGVzdFZhbHVlLFxuICAgICAgICBfbmVlZHNFdmFsdWF0aW9uID0gdHJ1ZSxcbiAgICAgICAgX2lzQmVpbmdFdmFsdWF0ZWQgPSBmYWxzZSxcbiAgICAgICAgX3N1cHByZXNzRGlzcG9zYWxVbnRpbERpc3Bvc2VXaGVuUmV0dXJuc0ZhbHNlID0gZmFsc2UsXG4gICAgICAgIF9pc0Rpc3Bvc2VkID0gZmFsc2UsXG4gICAgICAgIHJlYWRGdW5jdGlvbiA9IGV2YWx1YXRvckZ1bmN0aW9uT3JPcHRpb25zO1xuXG4gICAgaWYgKHJlYWRGdW5jdGlvbiAmJiB0eXBlb2YgcmVhZEZ1bmN0aW9uID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgLy8gU2luZ2xlLXBhcmFtZXRlciBzeW50YXggLSBldmVyeXRoaW5nIGlzIG9uIHRoaXMgXCJvcHRpb25zXCIgcGFyYW1cbiAgICAgICAgb3B0aW9ucyA9IHJlYWRGdW5jdGlvbjtcbiAgICAgICAgcmVhZEZ1bmN0aW9uID0gb3B0aW9uc1tcInJlYWRcIl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTXVsdGktcGFyYW1ldGVyIHN5bnRheCAtIGNvbnN0cnVjdCB0aGUgb3B0aW9ucyBhY2NvcmRpbmcgdG8gdGhlIHBhcmFtcyBwYXNzZWRcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGlmICghcmVhZEZ1bmN0aW9uKVxuICAgICAgICAgICAgcmVhZEZ1bmN0aW9uID0gb3B0aW9uc1tcInJlYWRcIl07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVhZEZ1bmN0aW9uICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFzcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGtvLmNvbXB1dGVkXCIpO1xuXG4gICAgZnVuY3Rpb24gYWRkU3Vic2NyaXB0aW9uVG9EZXBlbmRlbmN5KHN1YnNjcmliYWJsZSwgaWQpIHtcbiAgICAgICAgaWYgKCFfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzW2lkXSkge1xuICAgICAgICAgICAgX3N1YnNjcmlwdGlvbnNUb0RlcGVuZGVuY2llc1tpZF0gPSBzdWJzY3JpYmFibGUuc3Vic2NyaWJlKGV2YWx1YXRlUG9zc2libHlBc3luYyk7XG4gICAgICAgICAgICArK19kZXBlbmRlbmNpZXNDb3VudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc3Bvc2VBbGxTdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMoKSB7XG4gICAgICAgIF9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzLCBmdW5jdGlvbiAoaWQsIHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIF9zdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMgPSB7fTtcbiAgICAgICAgX2RlcGVuZGVuY2llc0NvdW50ID0gMDtcbiAgICAgICAgX25lZWRzRXZhbHVhdGlvbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV2YWx1YXRlUG9zc2libHlBc3luYygpIHtcbiAgICAgICAgdmFyIHRocm90dGxlRXZhbHVhdGlvblRpbWVvdXQgPSBkZXBlbmRlbnRPYnNlcnZhYmxlWyd0aHJvdHRsZUV2YWx1YXRpb24nXTtcbiAgICAgICAgaWYgKHRocm90dGxlRXZhbHVhdGlvblRpbWVvdXQgJiYgdGhyb3R0bGVFdmFsdWF0aW9uVGltZW91dCA+PSAwKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoZXZhbHVhdGlvblRpbWVvdXRJbnN0YW5jZSk7XG4gICAgICAgICAgICBldmFsdWF0aW9uVGltZW91dEluc3RhbmNlID0gc2V0VGltZW91dChldmFsdWF0ZUltbWVkaWF0ZSwgdGhyb3R0bGVFdmFsdWF0aW9uVGltZW91dCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVwZW5kZW50T2JzZXJ2YWJsZS5fZXZhbFJhdGVMaW1pdGVkKSB7XG4gICAgICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9ldmFsUmF0ZUxpbWl0ZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV2YWx1YXRlSW1tZWRpYXRlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBldmFsdWF0ZUltbWVkaWF0ZSgpIHtcbiAgICAgICAgaWYgKF9pc0JlaW5nRXZhbHVhdGVkKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZXZhbHVhdGlvbiBvZiBhIGtvLmNvbXB1dGVkIGNhdXNlcyBzaWRlIGVmZmVjdHMsIGl0J3MgcG9zc2libGUgdGhhdCBpdCB3aWxsIHRyaWdnZXIgaXRzIG93biByZS1ldmFsdWF0aW9uLlxuICAgICAgICAgICAgLy8gVGhpcyBpcyBub3QgZGVzaXJhYmxlIChpdCdzIGhhcmQgZm9yIGEgZGV2ZWxvcGVyIHRvIHJlYWxpc2UgYSBjaGFpbiBvZiBkZXBlbmRlbmNpZXMgbWlnaHQgY2F1c2UgdGhpcywgYW5kIHRoZXkgYWxtb3N0XG4gICAgICAgICAgICAvLyBjZXJ0YWlubHkgZGlkbid0IGludGVuZCBpbmZpbml0ZSByZS1ldmFsdWF0aW9ucykuIFNvLCBmb3IgcHJlZGljdGFiaWxpdHksIHdlIHNpbXBseSBwcmV2ZW50IGtvLmNvbXB1dGVkcyBmcm9tIGNhdXNpbmdcbiAgICAgICAgICAgIC8vIHRoZWlyIG93biByZS1ldmFsdWF0aW9uLiBGdXJ0aGVyIGRpc2N1c3Npb24gYXQgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L3B1bGwvMzg3XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyBub3QgZXZhbHVhdGUgKGFuZCBwb3NzaWJseSBjYXB0dXJlIG5ldyBkZXBlbmRlbmNpZXMpIGlmIGRpc3Bvc2VkXG4gICAgICAgIGlmIChfaXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpc3Bvc2VXaGVuICYmIGRpc3Bvc2VXaGVuKCkpIHtcbiAgICAgICAgICAgIC8vIFNlZSBjb21tZW50IGJlbG93IGFib3V0IF9zdXBwcmVzc0Rpc3Bvc2FsVW50aWxEaXNwb3NlV2hlblJldHVybnNGYWxzZVxuICAgICAgICAgICAgaWYgKCFfc3VwcHJlc3NEaXNwb3NhbFVudGlsRGlzcG9zZVdoZW5SZXR1cm5zRmFsc2UpIHtcbiAgICAgICAgICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSXQganVzdCBkaWQgcmV0dXJuIGZhbHNlLCBzbyB3ZSBjYW4gc3RvcCBzdXBwcmVzc2luZyBub3dcbiAgICAgICAgICAgIF9zdXBwcmVzc0Rpc3Bvc2FsVW50aWxEaXNwb3NlV2hlblJldHVybnNGYWxzZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgX2lzQmVpbmdFdmFsdWF0ZWQgPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCB3ZSBhc3N1bWUgdGhhdCBub25lIG9mIHRoZSBzdWJzY3JpcHRpb25zIGFyZSBzdGlsbCBiZWluZyB1c2VkIChpLmUuLCBhbGwgYXJlIGNhbmRpZGF0ZXMgZm9yIGRpc3Bvc2FsKS5cbiAgICAgICAgICAgIC8vIFRoZW4sIGR1cmluZyBldmFsdWF0aW9uLCB3ZSBjcm9zcyBvZmYgYW55IHRoYXQgYXJlIGluIGZhY3Qgc3RpbGwgYmVpbmcgdXNlZC5cbiAgICAgICAgICAgIHZhciBkaXNwb3NhbENhbmRpZGF0ZXMgPSBfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzLCBkaXNwb3NhbENvdW50ID0gX2RlcGVuZGVuY2llc0NvdW50O1xuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5iZWdpbih7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKHN1YnNjcmliYWJsZSwgaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXNEaXNwb3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3Bvc2FsQ291bnQgJiYgZGlzcG9zYWxDYW5kaWRhdGVzW2lkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvbid0IHdhbnQgdG8gZGlzcG9zZSB0aGlzIHN1YnNjcmlwdGlvbiwgYXMgaXQncyBzdGlsbCBiZWluZyB1c2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmlwdGlvbnNUb0RlcGVuZGVuY2llc1tpZF0gPSBkaXNwb3NhbENhbmRpZGF0ZXNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsrX2RlcGVuZGVuY2llc0NvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBkaXNwb3NhbENhbmRpZGF0ZXNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tZGlzcG9zYWxDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnJhbmQgbmV3IHN1YnNjcmlwdGlvbiAtIGFkZCBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFN1YnNjcmlwdGlvblRvRGVwZW5kZW5jeShzdWJzY3JpYmFibGUsIGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tcHV0ZWQ6IGRlcGVuZGVudE9ic2VydmFibGUsXG4gICAgICAgICAgICAgICAgaXNJbml0aWFsOiAhX2RlcGVuZGVuY2llc0NvdW50ICAgICAgICAvLyBJZiB3ZSdyZSBldmFsdWF0aW5nIHdoZW4gdGhlcmUgYXJlIG5vIHByZXZpb3VzIGRlcGVuZGVuY2llcywgaXQgbXVzdCBiZSB0aGUgZmlyc3QgdGltZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF9zdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMgPSB7fTtcbiAgICAgICAgICAgIF9kZXBlbmRlbmNpZXNDb3VudCA9IDA7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQgPyByZWFkRnVuY3Rpb24uY2FsbChldmFsdWF0b3JGdW5jdGlvblRhcmdldCkgOiByZWFkRnVuY3Rpb24oKTtcblxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmVuZCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gRm9yIGVhY2ggc3Vic2NyaXB0aW9uIG5vIGxvbmdlciBiZWluZyB1c2VkLCByZW1vdmUgaXQgZnJvbSB0aGUgYWN0aXZlIHN1YnNjcmlwdGlvbnMgbGlzdCBhbmQgZGlzcG9zZSBpdFxuICAgICAgICAgICAgICAgIGlmIChkaXNwb3NhbENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goZGlzcG9zYWxDYW5kaWRhdGVzLCBmdW5jdGlvbihpZCwgdG9EaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b0Rpc3Bvc2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBfbmVlZHNFdmFsdWF0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkZXBlbmRlbnRPYnNlcnZhYmxlLmlzRGlmZmVyZW50KF9sYXRlc3RWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZVtcIm5vdGlmeVN1YnNjcmliZXJzXCJdKF9sYXRlc3RWYWx1ZSwgXCJiZWZvcmVDaGFuZ2VcIik7XG5cbiAgICAgICAgICAgICAgICBfbGF0ZXN0VmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoREVCVUcpIGRlcGVuZGVudE9ic2VydmFibGUuX2xhdGVzdFZhbHVlID0gX2xhdGVzdFZhbHVlO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgcmF0ZS1saW1pdGVkLCB0aGUgbm90aWZpY2F0aW9uIHdpbGwgaGFwcGVuIHdpdGhpbiB0aGUgbGltaXQgZnVuY3Rpb24uIE90aGVyd2lzZSxcbiAgICAgICAgICAgICAgICAvLyBub3RpZnkgYXMgc29vbiBhcyB0aGUgdmFsdWUgY2hhbmdlcy4gQ2hlY2sgc3BlY2lmaWNhbGx5IGZvciB0aGUgdGhyb3R0bGUgc2V0dGluZyBzaW5jZVxuICAgICAgICAgICAgICAgIC8vIGl0IG92ZXJyaWRlcyByYXRlTGltaXQuXG4gICAgICAgICAgICAgICAgaWYgKCFkZXBlbmRlbnRPYnNlcnZhYmxlLl9ldmFsUmF0ZUxpbWl0ZWQgfHwgZGVwZW5kZW50T2JzZXJ2YWJsZVsndGhyb3R0bGVFdmFsdWF0aW9uJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZVtcIm5vdGlmeVN1YnNjcmliZXJzXCJdKF9sYXRlc3RWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgX2lzQmVpbmdFdmFsdWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghX2RlcGVuZGVuY2llc0NvdW50KVxuICAgICAgICAgICAgZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlcGVuZGVudE9ic2VydmFibGUoKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3cml0ZUZ1bmN0aW9uID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBXcml0aW5nIGEgdmFsdWVcbiAgICAgICAgICAgICAgICB3cml0ZUZ1bmN0aW9uLmFwcGx5KGV2YWx1YXRvckZ1bmN0aW9uVGFyZ2V0LCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgd3JpdGUgYSB2YWx1ZSB0byBhIGtvLmNvbXB1dGVkIHVubGVzcyB5b3Ugc3BlY2lmeSBhICd3cml0ZScgb3B0aW9uLiBJZiB5b3Ugd2lzaCB0byByZWFkIHRoZSBjdXJyZW50IHZhbHVlLCBkb24ndCBwYXNzIGFueSBwYXJhbWV0ZXJzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzOyAvLyBQZXJtaXRzIGNoYWluZWQgYXNzaWdubWVudHNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlYWRpbmcgdGhlIHZhbHVlXG4gICAgICAgICAgICBpZiAoX25lZWRzRXZhbHVhdGlvbilcbiAgICAgICAgICAgICAgICBldmFsdWF0ZUltbWVkaWF0ZSgpO1xuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5yZWdpc3RlckRlcGVuZGVuY3koZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG4gICAgICAgICAgICByZXR1cm4gX2xhdGVzdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVlaygpIHtcbiAgICAgICAgLy8gUGVlayB3b24ndCByZS1ldmFsdWF0ZSwgZXhjZXB0IHRvIGdldCB0aGUgaW5pdGlhbCB2YWx1ZSB3aGVuIFwiZGVmZXJFdmFsdWF0aW9uXCIgaXMgc2V0LlxuICAgICAgICAvLyBUaGF0J3MgdGhlIG9ubHkgdGltZSB0aGF0IGJvdGggb2YgdGhlc2UgY29uZGl0aW9ucyB3aWxsIGJlIHNhdGlzZmllZC5cbiAgICAgICAgaWYgKF9uZWVkc0V2YWx1YXRpb24gJiYgIV9kZXBlbmRlbmNpZXNDb3VudClcbiAgICAgICAgICAgIGV2YWx1YXRlSW1tZWRpYXRlKCk7XG4gICAgICAgIHJldHVybiBfbGF0ZXN0VmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNBY3RpdmUoKSB7XG4gICAgICAgIHJldHVybiBfbmVlZHNFdmFsdWF0aW9uIHx8IF9kZXBlbmRlbmNpZXNDb3VudCA+IDA7XG4gICAgfVxuXG4gICAgLy8gQnkgaGVyZSwgXCJvcHRpb25zXCIgaXMgYWx3YXlzIG5vbi1udWxsXG4gICAgdmFyIHdyaXRlRnVuY3Rpb24gPSBvcHRpb25zW1wid3JpdGVcIl0sXG4gICAgICAgIGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCA9IG9wdGlvbnNbXCJkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWRcIl0gfHwgb3B0aW9ucy5kaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQgfHwgbnVsbCxcbiAgICAgICAgZGlzcG9zZVdoZW5PcHRpb24gPSBvcHRpb25zW1wiZGlzcG9zZVdoZW5cIl0gfHwgb3B0aW9ucy5kaXNwb3NlV2hlbixcbiAgICAgICAgZGlzcG9zZVdoZW4gPSBkaXNwb3NlV2hlbk9wdGlvbixcbiAgICAgICAgZGlzcG9zZSA9IGRpc3Bvc2VBbGxTdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMsXG4gICAgICAgIF9zdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMgPSB7fSxcbiAgICAgICAgX2RlcGVuZGVuY2llc0NvdW50ID0gMCxcbiAgICAgICAgZXZhbHVhdGlvblRpbWVvdXRJbnN0YW5jZSA9IG51bGw7XG5cbiAgICBpZiAoIWV2YWx1YXRvckZ1bmN0aW9uVGFyZ2V0KVxuICAgICAgICBldmFsdWF0b3JGdW5jdGlvblRhcmdldCA9IG9wdGlvbnNbXCJvd25lclwiXTtcblxuICAgIGtvLnN1YnNjcmliYWJsZS5jYWxsKGRlcGVuZGVudE9ic2VydmFibGUpO1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mT3JFeHRlbmQoZGVwZW5kZW50T2JzZXJ2YWJsZSwga28uZGVwZW5kZW50T2JzZXJ2YWJsZVsnZm4nXSk7XG5cbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLnBlZWsgPSBwZWVrO1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUuZ2V0RGVwZW5kZW5jaWVzQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfZGVwZW5kZW5jaWVzQ291bnQ7IH07XG4gICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5oYXNXcml0ZUZ1bmN0aW9uID0gdHlwZW9mIG9wdGlvbnNbXCJ3cml0ZVwiXSA9PT0gXCJmdW5jdGlvblwiO1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHsgZGlzcG9zZSgpOyB9O1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUuaXNBY3RpdmUgPSBpc0FjdGl2ZTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIGxpbWl0IGZ1bmN0aW9uIHdpdGggb25lIHRoYXQgZGVsYXlzIGV2YWx1YXRpb24gYXMgd2VsbC5cbiAgICB2YXIgb3JpZ2luYWxMaW1pdCA9IGRlcGVuZGVudE9ic2VydmFibGUubGltaXQ7XG4gICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5saW1pdCA9IGZ1bmN0aW9uKGxpbWl0RnVuY3Rpb24pIHtcbiAgICAgICAgb3JpZ2luYWxMaW1pdC5jYWxsKGRlcGVuZGVudE9ic2VydmFibGUsIGxpbWl0RnVuY3Rpb24pO1xuICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9ldmFsUmF0ZUxpbWl0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRlcGVuZGVudE9ic2VydmFibGUuX3JhdGVMaW1pdGVkQmVmb3JlQ2hhbmdlKF9sYXRlc3RWYWx1ZSk7XG5cbiAgICAgICAgICAgIF9uZWVkc0V2YWx1YXRpb24gPSB0cnVlOyAgICAvLyBNYXJrIGFzIGRpcnR5XG5cbiAgICAgICAgICAgIC8vIFBhc3MgdGhlIG9ic2VydmFibGUgdG8gdGhlIHJhdGUtbGltaXQgY29kZSwgd2hpY2ggd2lsbCBhY2Nlc3MgaXQgd2hlblxuICAgICAgICAgICAgLy8gaXQncyB0aW1lIHRvIGRvIHRoZSBub3RpZmljYXRpb24uXG4gICAgICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9yYXRlTGltaXRlZENoYW5nZShkZXBlbmRlbnRPYnNlcnZhYmxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby5leHBvcnRQcm9wZXJ0eShkZXBlbmRlbnRPYnNlcnZhYmxlLCAncGVlaycsIGRlcGVuZGVudE9ic2VydmFibGUucGVlayk7XG4gICAga28uZXhwb3J0UHJvcGVydHkoZGVwZW5kZW50T2JzZXJ2YWJsZSwgJ2Rpc3Bvc2UnLCBkZXBlbmRlbnRPYnNlcnZhYmxlLmRpc3Bvc2UpO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KGRlcGVuZGVudE9ic2VydmFibGUsICdpc0FjdGl2ZScsIGRlcGVuZGVudE9ic2VydmFibGUuaXNBY3RpdmUpO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KGRlcGVuZGVudE9ic2VydmFibGUsICdnZXREZXBlbmRlbmNpZXNDb3VudCcsIGRlcGVuZGVudE9ic2VydmFibGUuZ2V0RGVwZW5kZW5jaWVzQ291bnQpO1xuXG4gICAgLy8gQWRkIGEgXCJkaXNwb3NlV2hlblwiIGNhbGxiYWNrIHRoYXQsIG9uIGVhY2ggZXZhbHVhdGlvbiwgZGlzcG9zZXMgaWYgdGhlIG5vZGUgd2FzIHJlbW92ZWQgd2l0aG91dCB1c2luZyBrby5yZW1vdmVOb2RlLlxuICAgIGlmIChkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQpIHtcbiAgICAgICAgLy8gU2luY2UgdGhpcyBjb21wdXRlZCBpcyBhc3NvY2lhdGVkIHdpdGggYSBET00gbm9kZSwgYW5kIHdlIGRvbid0IHdhbnQgdG8gZGlzcG9zZSB0aGUgY29tcHV0ZWRcbiAgICAgICAgLy8gdW50aWwgdGhlIERPTSBub2RlIGlzICpyZW1vdmVkKiBmcm9tIHRoZSBkb2N1bWVudCAoYXMgb3Bwb3NlZCB0byBuZXZlciBoYXZpbmcgYmVlbiBpbiB0aGUgZG9jdW1lbnQpLFxuICAgICAgICAvLyB3ZSdsbCBwcmV2ZW50IGRpc3Bvc2FsIHVudGlsIFwiZGlzcG9zZVdoZW5cIiBmaXJzdCByZXR1cm5zIGZhbHNlLlxuICAgICAgICBfc3VwcHJlc3NEaXNwb3NhbFVudGlsRGlzcG9zZVdoZW5SZXR1cm5zRmFsc2UgPSB0cnVlO1xuXG4gICAgICAgIC8vIE9ubHkgd2F0Y2ggZm9yIHRoZSBub2RlJ3MgZGlzcG9zYWwgaWYgdGhlIHZhbHVlIHJlYWxseSBpcyBhIG5vZGUuIEl0IG1pZ2h0IG5vdCBiZSxcbiAgICAgICAgLy8gZS5nLiwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IHRydWUgfSBjYW4gYmUgdXNlZCB0byBvcHQgaW50byB0aGUgXCJvbmx5IGRpc3Bvc2VcbiAgICAgICAgLy8gYWZ0ZXIgZmlyc3QgZmFsc2UgcmVzdWx0XCIgYmVoYXZpb3VyIGV2ZW4gaWYgdGhlcmUncyBubyBzcGVjaWZpYyBub2RlIHRvIHdhdGNoLiBUaGlzXG4gICAgICAgIC8vIHRlY2huaXF1ZSBpcyBpbnRlbmRlZCBmb3IgS08ncyBpbnRlcm5hbCB1c2Ugb25seSBhbmQgc2hvdWxkbid0IGJlIGRvY3VtZW50ZWQgb3IgdXNlZFxuICAgICAgICAvLyBieSBhcHBsaWNhdGlvbiBjb2RlLCBhcyBpdCdzIGxpa2VseSB0byBjaGFuZ2UgaW4gYSBmdXR1cmUgdmVyc2lvbiBvZiBLTy5cbiAgICAgICAgaWYgKGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZC5ub2RlVHlwZSkge1xuICAgICAgICAgICAgZGlzcG9zZVdoZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFrby51dGlscy5kb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQoZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkKSB8fCAoZGlzcG9zZVdoZW5PcHRpb24gJiYgZGlzcG9zZVdoZW5PcHRpb24oKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXZhbHVhdGUsIHVubGVzcyBkZWZlckV2YWx1YXRpb24gaXMgdHJ1ZVxuICAgIGlmIChvcHRpb25zWydkZWZlckV2YWx1YXRpb24nXSAhPT0gdHJ1ZSlcbiAgICAgICAgZXZhbHVhdGVJbW1lZGlhdGUoKTtcblxuICAgIC8vIEF0dGFjaCBhIERPTSBub2RlIGRpc3Bvc2FsIGNhbGxiYWNrIHNvIHRoYXQgdGhlIGNvbXB1dGVkIHdpbGwgYmUgcHJvYWN0aXZlbHkgZGlzcG9zZWQgYXMgc29vbiBhcyB0aGUgbm9kZSBpc1xuICAgIC8vIHJlbW92ZWQgdXNpbmcga28ucmVtb3ZlTm9kZS4gQnV0IHNraXAgaWYgaXNBY3RpdmUgaXMgZmFsc2UgKHRoZXJlIHdpbGwgbmV2ZXIgYmUgYW55IGRlcGVuZGVuY2llcyB0byBkaXNwb3NlKS5cbiAgICBpZiAoZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkICYmIGlzQWN0aXZlKCkgJiYgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLm5vZGVUeXBlKSB7XG4gICAgICAgIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5yZW1vdmVEaXNwb3NlQ2FsbGJhY2soZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLCBkaXNwb3NlKTtcbiAgICAgICAgICAgIGRpc3Bvc2VBbGxTdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXMoKTtcbiAgICAgICAgfTtcbiAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjayhkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQsIGRpc3Bvc2UpO1xuICAgIH1cblxuICAgIHJldHVybiBkZXBlbmRlbnRPYnNlcnZhYmxlO1xufTtcblxua28uaXNDb21wdXRlZCA9IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGtvLmhhc1Byb3RvdHlwZShpbnN0YW5jZSwga28uZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG59O1xuXG52YXIgcHJvdG9Qcm9wID0ga28ub2JzZXJ2YWJsZS5wcm90b1Byb3BlcnR5OyAvLyA9PSBcIl9fa29fcHJvdG9fX1wiXG5rby5kZXBlbmRlbnRPYnNlcnZhYmxlW3Byb3RvUHJvcF0gPSBrby5vYnNlcnZhYmxlO1xuXG5rby5kZXBlbmRlbnRPYnNlcnZhYmxlWydmbiddID0ge1xuICAgIFwiZXF1YWxpdHlDb21wYXJlclwiOiB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbFxufTtcbmtvLmRlcGVuZGVudE9ic2VydmFibGVbJ2ZuJ11bcHJvdG9Qcm9wXSA9IGtvLmRlcGVuZGVudE9ic2VydmFibGU7XG5cbi8vIE5vdGUgdGhhdCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHByb3RvIGFzc2lnbm1lbnQsIHRoZVxuLy8gaW5oZXJpdGFuY2UgY2hhaW4gaXMgY3JlYXRlZCBtYW51YWxseSBpbiB0aGUga28uZGVwZW5kZW50T2JzZXJ2YWJsZSBjb25zdHJ1Y3RvclxuaWYgKGtvLnV0aWxzLmNhblNldFByb3RvdHlwZSkge1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mKGtvLmRlcGVuZGVudE9ic2VydmFibGVbJ2ZuJ10sIGtvLnN1YnNjcmliYWJsZVsnZm4nXSk7XG59XG5cbmtvLmV4cG9ydFN5bWJvbCgnZGVwZW5kZW50T2JzZXJ2YWJsZScsIGtvLmRlcGVuZGVudE9ic2VydmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCdjb21wdXRlZCcsIGtvLmRlcGVuZGVudE9ic2VydmFibGUpOyAvLyBNYWtlIFwia28uY29tcHV0ZWRcIiBhbiBhbGlhcyBmb3IgXCJrby5kZXBlbmRlbnRPYnNlcnZhYmxlXCJcbmtvLmV4cG9ydFN5bWJvbCgnaXNDb21wdXRlZCcsIGtvLmlzQ29tcHV0ZWQpO1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1heE5lc3RlZE9ic2VydmFibGVEZXB0aCA9IDEwOyAvLyBFc2NhcGUgdGhlICh1bmxpa2VseSkgcGF0aGFsb2dpY2FsIGNhc2Ugd2hlcmUgYW4gb2JzZXJ2YWJsZSdzIGN1cnJlbnQgdmFsdWUgaXMgaXRzZWxmIChvciBzaW1pbGFyIHJlZmVyZW5jZSBjeWNsZSlcblxuICAgIGtvLnRvSlMgPSBmdW5jdGlvbihyb290T2JqZWN0KSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXaGVuIGNhbGxpbmcga28udG9KUywgcGFzcyB0aGUgb2JqZWN0IHlvdSB3YW50IHRvIGNvbnZlcnQuXCIpO1xuXG4gICAgICAgIC8vIFdlIGp1c3QgdW53cmFwIGV2ZXJ5dGhpbmcgYXQgZXZlcnkgbGV2ZWwgaW4gdGhlIG9iamVjdCBncmFwaFxuICAgICAgICByZXR1cm4gbWFwSnNPYmplY3RHcmFwaChyb290T2JqZWN0LCBmdW5jdGlvbih2YWx1ZVRvTWFwKSB7XG4gICAgICAgICAgICAvLyBMb29wIGJlY2F1c2UgYW4gb2JzZXJ2YWJsZSdzIHZhbHVlIG1pZ2h0IGluIHR1cm4gYmUgYW5vdGhlciBvYnNlcnZhYmxlIHdyYXBwZXJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBrby5pc09ic2VydmFibGUodmFsdWVUb01hcCkgJiYgKGkgPCBtYXhOZXN0ZWRPYnNlcnZhYmxlRGVwdGgpOyBpKyspXG4gICAgICAgICAgICAgICAgdmFsdWVUb01hcCA9IHZhbHVlVG9NYXAoKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVRvTWFwO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAga28udG9KU09OID0gZnVuY3Rpb24ocm9vdE9iamVjdCwgcmVwbGFjZXIsIHNwYWNlKSB7ICAgICAvLyByZXBsYWNlciBhbmQgc3BhY2UgYXJlIG9wdGlvbmFsXG4gICAgICAgIHZhciBwbGFpbkphdmFTY3JpcHRPYmplY3QgPSBrby50b0pTKHJvb3RPYmplY3QpO1xuICAgICAgICByZXR1cm4ga28udXRpbHMuc3RyaW5naWZ5SnNvbihwbGFpbkphdmFTY3JpcHRPYmplY3QsIHJlcGxhY2VyLCBzcGFjZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1hcEpzT2JqZWN0R3JhcGgocm9vdE9iamVjdCwgbWFwSW5wdXRDYWxsYmFjaywgdmlzaXRlZE9iamVjdHMpIHtcbiAgICAgICAgdmlzaXRlZE9iamVjdHMgPSB2aXNpdGVkT2JqZWN0cyB8fCBuZXcgb2JqZWN0TG9va3VwKCk7XG5cbiAgICAgICAgcm9vdE9iamVjdCA9IG1hcElucHV0Q2FsbGJhY2socm9vdE9iamVjdCk7XG4gICAgICAgIHZhciBjYW5IYXZlUHJvcGVydGllcyA9ICh0eXBlb2Ygcm9vdE9iamVjdCA9PSBcIm9iamVjdFwiKSAmJiAocm9vdE9iamVjdCAhPT0gbnVsbCkgJiYgKHJvb3RPYmplY3QgIT09IHVuZGVmaW5lZCkgJiYgKCEocm9vdE9iamVjdCBpbnN0YW5jZW9mIERhdGUpKSAmJiAoIShyb290T2JqZWN0IGluc3RhbmNlb2YgU3RyaW5nKSkgJiYgKCEocm9vdE9iamVjdCBpbnN0YW5jZW9mIE51bWJlcikpICYmICghKHJvb3RPYmplY3QgaW5zdGFuY2VvZiBCb29sZWFuKSk7XG4gICAgICAgIGlmICghY2FuSGF2ZVByb3BlcnRpZXMpXG4gICAgICAgICAgICByZXR1cm4gcm9vdE9iamVjdDtcblxuICAgICAgICB2YXIgb3V0cHV0UHJvcGVydGllcyA9IHJvb3RPYmplY3QgaW5zdGFuY2VvZiBBcnJheSA/IFtdIDoge307XG4gICAgICAgIHZpc2l0ZWRPYmplY3RzLnNhdmUocm9vdE9iamVjdCwgb3V0cHV0UHJvcGVydGllcyk7XG5cbiAgICAgICAgdmlzaXRQcm9wZXJ0aWVzT3JBcnJheUVudHJpZXMocm9vdE9iamVjdCwgZnVuY3Rpb24oaW5kZXhlcikge1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5VmFsdWUgPSBtYXBJbnB1dENhbGxiYWNrKHJvb3RPYmplY3RbaW5kZXhlcl0pO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGVvZiBwcm9wZXJ0eVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRQcm9wZXJ0aWVzW2luZGV4ZXJdID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzbHlNYXBwZWRWYWx1ZSA9IHZpc2l0ZWRPYmplY3RzLmdldChwcm9wZXJ0eVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0UHJvcGVydGllc1tpbmRleGVyXSA9IChwcmV2aW91c2x5TWFwcGVkVmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgID8gcHJldmlvdXNseU1hcHBlZFZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG1hcEpzT2JqZWN0R3JhcGgocHJvcGVydHlWYWx1ZSwgbWFwSW5wdXRDYWxsYmFjaywgdmlzaXRlZE9iamVjdHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dFByb3BlcnRpZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmlzaXRQcm9wZXJ0aWVzT3JBcnJheUVudHJpZXMocm9vdE9iamVjdCwgdmlzaXRvckNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChyb290T2JqZWN0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm9vdE9iamVjdC5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICB2aXNpdG9yQ2FsbGJhY2soaSk7XG5cbiAgICAgICAgICAgIC8vIEZvciBhcnJheXMsIGFsc28gcmVzcGVjdCB0b0pTT04gcHJvcGVydHkgZm9yIGN1c3RvbSBtYXBwaW5ncyAoZml4ZXMgIzI3OClcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm9vdE9iamVjdFsndG9KU09OJ10gPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICB2aXNpdG9yQ2FsbGJhY2soJ3RvSlNPTicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHJvb3RPYmplY3QpIHtcbiAgICAgICAgICAgICAgICB2aXNpdG9yQ2FsbGJhY2socHJvcGVydHlOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvYmplY3RMb29rdXAoKSB7XG4gICAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xuICAgIH07XG5cbiAgICBvYmplY3RMb29rdXAucHJvdG90eXBlID0ge1xuICAgICAgICBjb25zdHJ1Y3Rvcjogb2JqZWN0TG9va3VwLFxuICAgICAgICBzYXZlOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdJbmRleCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZih0aGlzLmtleXMsIGtleSk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdJbmRleCA+PSAwKVxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzW2V4aXN0aW5nSW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nSW5kZXggPSBrby51dGlscy5hcnJheUluZGV4T2YodGhpcy5rZXlzLCBrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIChleGlzdGluZ0luZGV4ID49IDApID8gdGhpcy52YWx1ZXNbZXhpc3RpbmdJbmRleF0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd0b0pTJywga28udG9KUyk7XG5rby5leHBvcnRTeW1ib2woJ3RvSlNPTicsIGtvLnRvSlNPTik7XG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYXNEb21EYXRhRXhwYW5kb1Byb3BlcnR5ID0gJ19fa29fX2hhc0RvbURhdGFPcHRpb25WYWx1ZV9fJztcblxuICAgIC8vIE5vcm1hbGx5LCBTRUxFQ1QgZWxlbWVudHMgYW5kIHRoZWlyIE9QVElPTnMgY2FuIG9ubHkgdGFrZSB2YWx1ZSBvZiB0eXBlICdzdHJpbmcnIChiZWNhdXNlIHRoZSB2YWx1ZXNcbiAgICAvLyBhcmUgc3RvcmVkIG9uIERPTSBhdHRyaWJ1dGVzKS4ga28uc2VsZWN0RXh0ZW5zaW9ucyBwcm92aWRlcyBhIHdheSBmb3IgU0VMRUNUcy9PUFRJT05zIHRvIGhhdmUgdmFsdWVzXG4gICAgLy8gdGhhdCBhcmUgYXJiaXRyYXJ5IG9iamVjdHMuIFRoaXMgaXMgdmVyeSBjb252ZW5pZW50IHdoZW4gaW1wbGVtZW50aW5nIHRoaW5ncyBsaWtlIGNhc2NhZGluZyBkcm9wZG93bnMuXG4gICAga28uc2VsZWN0RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgcmVhZFZhbHVlIDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgc3dpdGNoIChrby51dGlscy50YWdOYW1lTG93ZXIoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdvcHRpb24nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudFtoYXNEb21EYXRhRXhwYW5kb1Byb3BlcnR5XSA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBrby51dGlscy5kb21EYXRhLmdldChlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnMub3B0aW9ucy5vcHRpb25WYWx1ZURvbURhdGFLZXkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udXRpbHMuaWVWZXJzaW9uIDw9IDdcbiAgICAgICAgICAgICAgICAgICAgICAgID8gKGVsZW1lbnQuZ2V0QXR0cmlidXRlTm9kZSgndmFsdWUnKSAmJiBlbGVtZW50LmdldEF0dHJpYnV0ZU5vZGUoJ3ZhbHVlJykuc3BlY2lmaWVkID8gZWxlbWVudC52YWx1ZSA6IGVsZW1lbnQudGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5zZWxlY3RlZEluZGV4ID49IDAgPyBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgd3JpdGVWYWx1ZTogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWUsIGFsbG93VW5zZXQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb3B0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KGVsZW1lbnQsIGtvLmJpbmRpbmdIYW5kbGVycy5vcHRpb25zLm9wdGlvblZhbHVlRG9tRGF0YUtleSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eSBpbiBlbGVtZW50KSB7IC8vIElFIDw9IDggdGhyb3dzIGVycm9ycyBpZiB5b3UgZGVsZXRlIG5vbi1leGlzdGVudCBwcm9wZXJ0aWVzIGZyb20gYSBET00gbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZWxlbWVudFtoYXNEb21EYXRhRXhwYW5kb1Byb3BlcnR5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBhcmJpdHJhcnkgb2JqZWN0IHVzaW5nIERvbURhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnMub3B0aW9ucy5vcHRpb25WYWx1ZURvbURhdGFLZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50W2hhc0RvbURhdGFFeHBhbmRvUHJvcGVydHldID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgdHJlYXRtZW50IG9mIG51bWJlcnMgaXMganVzdCBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS4gS08gMS4yLjEgd3JvdGUgbnVtZXJpY2FsIHZhbHVlcyB0byBlbGVtZW50LnZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgPyB2YWx1ZSA6IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBcIlwiIHx8IHZhbHVlID09PSBudWxsKSAgICAgICAvLyBBIGJsYW5rIHN0cmluZyBvciBudWxsIHZhbHVlIHdpbGwgc2VsZWN0IHRoZSBjYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGVsZW1lbnQub3B0aW9ucy5sZW5ndGgsIG9wdGlvblZhbHVlOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25WYWx1ZSA9IGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQub3B0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbmNsdWRlIHNwZWNpYWwgY2hlY2sgdG8gaGFuZGxlIHNlbGVjdGluZyBhIGNhcHRpb24gd2l0aCBhIGJsYW5rIHN0cmluZyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvblZhbHVlID09IHZhbHVlIHx8IChvcHRpb25WYWx1ZSA9PSBcIlwiICYmIHZhbHVlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dVbnNldCB8fCBzZWxlY3Rpb24gPj0gMCB8fCAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiBlbGVtZW50LnNpemUgPiAxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gc2VsZWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICgodmFsdWUgPT09IG51bGwpIHx8ICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3NlbGVjdEV4dGVuc2lvbnMnLCBrby5zZWxlY3RFeHRlbnNpb25zKTtcbmtvLmV4cG9ydFN5bWJvbCgnc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUnLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZSk7XG5rby5leHBvcnRTeW1ib2woJ3NlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZScsIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZSk7XG5rby5leHByZXNzaW9uUmV3cml0aW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgamF2YVNjcmlwdFJlc2VydmVkV29yZHMgPSBbXCJ0cnVlXCIsIFwiZmFsc2VcIiwgXCJudWxsXCIsIFwidW5kZWZpbmVkXCJdO1xuXG4gICAgLy8gTWF0Y2hlcyBzb21ldGhpbmcgdGhhdCBjYW4gYmUgYXNzaWduZWQgdG8tLWVpdGhlciBhbiBpc29sYXRlZCBpZGVudGlmaWVyIG9yIHNvbWV0aGluZyBlbmRpbmcgd2l0aCBhIHByb3BlcnR5IGFjY2Vzc29yXG4gICAgLy8gVGhpcyBpcyBkZXNpZ25lZCB0byBiZSBzaW1wbGUgYW5kIGF2b2lkIGZhbHNlIG5lZ2F0aXZlcywgYnV0IGNvdWxkIHByb2R1Y2UgZmFsc2UgcG9zaXRpdmVzIChlLmcuLCBhK2IuYykuXG4gICAgLy8gVGhpcyBhbHNvIHdpbGwgbm90IHByb3Blcmx5IGhhbmRsZSBuZXN0ZWQgYnJhY2tldHMgKGUuZy4sIG9iajFbb2JqMlsncHJvcCddXTsgc2VlICM5MTEpLlxuICAgIHZhciBqYXZhU2NyaXB0QXNzaWdubWVudFRhcmdldCA9IC9eKD86WyRfYS16XVskXFx3XSp8KC4rKShcXC5cXHMqWyRfYS16XVskXFx3XSp8XFxbLitcXF0pKSQvaTtcblxuICAgIGZ1bmN0aW9uIGdldFdyaXRlYWJsZVZhbHVlKGV4cHJlc3Npb24pIHtcbiAgICAgICAgaWYgKGtvLnV0aWxzLmFycmF5SW5kZXhPZihqYXZhU2NyaXB0UmVzZXJ2ZWRXb3JkcywgZXhwcmVzc2lvbikgPj0gMClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIG1hdGNoID0gZXhwcmVzc2lvbi5tYXRjaChqYXZhU2NyaXB0QXNzaWdubWVudFRhcmdldCk7XG4gICAgICAgIHJldHVybiBtYXRjaCA9PT0gbnVsbCA/IGZhbHNlIDogbWF0Y2hbMV0gPyAoJ09iamVjdCgnICsgbWF0Y2hbMV0gKyAnKScgKyBtYXRjaFsyXSkgOiBleHByZXNzaW9uO1xuICAgIH1cblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgcmVndWxhciBleHByZXNzaW9ucyB3aWxsIGJlIHVzZWQgdG8gc3BsaXQgYW4gb2JqZWN0LWxpdGVyYWwgc3RyaW5nIGludG8gdG9rZW5zXG5cbiAgICAgICAgLy8gVGhlc2UgdHdvIG1hdGNoIHN0cmluZ3MsIGVpdGhlciB3aXRoIGRvdWJsZSBxdW90ZXMgb3Igc2luZ2xlIHF1b3Rlc1xuICAgIHZhciBzdHJpbmdEb3VibGUgPSAnXCIoPzpbXlwiXFxcXFxcXFxdfFxcXFxcXFxcLikqXCInLFxuICAgICAgICBzdHJpbmdTaW5nbGUgPSBcIicoPzpbXidcXFxcXFxcXF18XFxcXFxcXFwuKSonXCIsXG4gICAgICAgIC8vIE1hdGNoZXMgYSByZWd1bGFyIGV4cHJlc3Npb24gKHRleHQgZW5jbG9zZWQgYnkgc2xhc2hlcyksIGJ1dCB3aWxsIGFsc28gbWF0Y2ggc2V0cyBvZiBkaXZpc2lvbnNcbiAgICAgICAgLy8gYXMgYSByZWd1bGFyIGV4cHJlc3Npb24gKHRoaXMgaXMgaGFuZGxlZCBieSB0aGUgcGFyc2luZyBsb29wIGJlbG93KS5cbiAgICAgICAgc3RyaW5nUmVnZXhwID0gJy8oPzpbXi9cXFxcXFxcXF18XFxcXFxcXFwuKSovXFx3KicsXG4gICAgICAgIC8vIFRoZXNlIGNoYXJhY3RlcnMgaGF2ZSBzcGVjaWFsIG1lYW5pbmcgdG8gdGhlIHBhcnNlciBhbmQgbXVzdCBub3QgYXBwZWFyIGluIHRoZSBtaWRkbGUgb2YgYVxuICAgICAgICAvLyB0b2tlbiwgZXhjZXB0IGFzIHBhcnQgb2YgYSBzdHJpbmcuXG4gICAgICAgIHNwZWNpYWxzID0gJyxcIlxcJ3t9KCkvOltcXFxcXScsXG4gICAgICAgIC8vIE1hdGNoIHRleHQgKGF0IGxlYXN0IHR3byBjaGFyYWN0ZXJzKSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gYW55IG9mIHRoZSBhYm92ZSBzcGVjaWFsIGNoYXJhY3RlcnMsXG4gICAgICAgIC8vIGFsdGhvdWdoIHNvbWUgb2YgdGhlIHNwZWNpYWwgY2hhcmFjdGVycyBhcmUgYWxsb3dlZCB0byBzdGFydCBpdCAoYWxsIGJ1dCB0aGUgY29sb24gYW5kIGNvbW1hKS5cbiAgICAgICAgLy8gVGhlIHRleHQgY2FuIGNvbnRhaW4gc3BhY2VzLCBidXQgbGVhZGluZyBvciB0cmFpbGluZyBzcGFjZXMgYXJlIHNraXBwZWQuXG4gICAgICAgIGV2ZXJ5VGhpbmdFbHNlID0gJ1teXFxcXHM6LC9dW14nICsgc3BlY2lhbHMgKyAnXSpbXlxcXFxzJyArIHNwZWNpYWxzICsgJ10nLFxuICAgICAgICAvLyBNYXRjaCBhbnkgbm9uLXNwYWNlIGNoYXJhY3RlciBub3QgbWF0Y2hlZCBhbHJlYWR5LiBUaGlzIHdpbGwgbWF0Y2ggY29sb25zIGFuZCBjb21tYXMsIHNpbmNlIHRoZXkncmVcbiAgICAgICAgLy8gbm90IG1hdGNoZWQgYnkgXCJldmVyeVRoaW5nRWxzZVwiLCBidXQgd2lsbCBhbHNvIG1hdGNoIGFueSBvdGhlciBzaW5nbGUgY2hhcmFjdGVyIHRoYXQgd2Fzbid0IGFscmVhZHlcbiAgICAgICAgLy8gbWF0Y2hlZCAoZm9yIGV4YW1wbGU6IGluIFwiYTogMSwgYjogMlwiLCBlYWNoIG9mIHRoZSBub24tc3BhY2UgY2hhcmFjdGVycyB3aWxsIGJlIG1hdGNoZWQgYnkgb25lTm90U3BhY2UpLlxuICAgICAgICBvbmVOb3RTcGFjZSA9ICdbXlxcXFxzXScsXG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBhY3R1YWwgcmVndWxhciBleHByZXNzaW9uIGJ5IG9yLWluZyB0aGUgYWJvdmUgc3RyaW5ncy4gVGhlIG9yZGVyIGlzIGltcG9ydGFudC5cbiAgICAgICAgYmluZGluZ1Rva2VuID0gUmVnRXhwKHN0cmluZ0RvdWJsZSArICd8JyArIHN0cmluZ1NpbmdsZSArICd8JyArIHN0cmluZ1JlZ2V4cCArICd8JyArIGV2ZXJ5VGhpbmdFbHNlICsgJ3wnICsgb25lTm90U3BhY2UsICdnJyksXG5cbiAgICAgICAgLy8gTWF0Y2ggZW5kIG9mIHByZXZpb3VzIHRva2VuIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc2xhc2ggaXMgYSBkaXZpc2lvbiBvciByZWdleC5cbiAgICAgICAgZGl2aXNpb25Mb29rQmVoaW5kID0gL1tcXF0pXCInQS1aYS16MC05XyRdKyQvLFxuICAgICAgICBrZXl3b3JkUmVnZXhMb29rQmVoaW5kID0geydpbic6MSwncmV0dXJuJzoxLCd0eXBlb2YnOjF9O1xuXG4gICAgZnVuY3Rpb24gcGFyc2VPYmplY3RMaXRlcmFsKG9iamVjdExpdGVyYWxTdHJpbmcpIHtcbiAgICAgICAgLy8gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbGluZyBzcGFjZXMgZnJvbSB0aGUgc3RyaW5nXG4gICAgICAgIHZhciBzdHIgPSBrby51dGlscy5zdHJpbmdUcmltKG9iamVjdExpdGVyYWxTdHJpbmcpO1xuXG4gICAgICAgIC8vIFRyaW0gYnJhY2VzICd7JyBzdXJyb3VuZGluZyB0aGUgd2hvbGUgb2JqZWN0IGxpdGVyYWxcbiAgICAgICAgaWYgKHN0ci5jaGFyQ29kZUF0KDApID09PSAxMjMpIHN0ciA9IHN0ci5zbGljZSgxLCAtMSk7XG5cbiAgICAgICAgLy8gU3BsaXQgaW50byB0b2tlbnNcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCB0b2tzID0gc3RyLm1hdGNoKGJpbmRpbmdUb2tlbiksIGtleSwgdmFsdWVzLCBkZXB0aCA9IDA7XG5cbiAgICAgICAgaWYgKHRva3MpIHtcbiAgICAgICAgICAgIC8vIEFwcGVuZCBhIGNvbW1hIHNvIHRoYXQgd2UgZG9uJ3QgbmVlZCBhIHNlcGFyYXRlIGNvZGUgYmxvY2sgdG8gZGVhbCB3aXRoIHRoZSBsYXN0IGl0ZW1cbiAgICAgICAgICAgIHRva3MucHVzaCgnLCcpO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgdG9rOyB0b2sgPSB0b2tzW2ldOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IHRvay5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIC8vIEEgY29tbWEgc2lnbmFscyB0aGUgZW5kIG9mIGEga2V5L3ZhbHVlIHBhaXIgaWYgZGVwdGggaXMgemVyb1xuICAgICAgICAgICAgICAgIGlmIChjID09PSA0NCkgeyAvLyBcIixcIlxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZXMgPyB7a2V5OiBrZXksIHZhbHVlOiB2YWx1ZXMuam9pbignJyl9IDogeyd1bmtub3duJzoga2V5fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSB2YWx1ZXMgPSBkZXB0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNpbXBseSBza2lwIHRoZSBjb2xvbiB0aGF0IHNlcGFyYXRlcyB0aGUgbmFtZSBhbmQgdmFsdWVcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDU4KSB7IC8vIFwiOlwiXG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgLy8gQSBzZXQgb2Ygc2xhc2hlcyBpcyBpbml0aWFsbHkgbWF0Y2hlZCBhcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiwgYnV0IGNvdWxkIGJlIGRpdmlzaW9uXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA0NyAmJiBpICYmIHRvay5sZW5ndGggPiAxKSB7ICAvLyBcIi9cIlxuICAgICAgICAgICAgICAgICAgICAvLyBMb29rIGF0IHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHRva2VuIHRvIGRldGVybWluZSBpZiB0aGUgc2xhc2ggaXMgYWN0dWFsbHkgZGl2aXNpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gdG9rc1tpLTFdLm1hdGNoKGRpdmlzaW9uTG9va0JlaGluZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCAmJiAha2V5d29yZFJlZ2V4TG9va0JlaGluZFttYXRjaFswXV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBzbGFzaCBpcyBhY3R1YWxseSBhIGRpdmlzaW9uIHB1bmN0dWF0b3I7IHJlLXBhcnNlIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0cmluZyAobm90IGluY2x1ZGluZyB0aGUgc2xhc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyKHN0ci5pbmRleE9mKHRvaykgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva3MgPSBzdHIubWF0Y2goYmluZGluZ1Rva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRva3MucHVzaCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCBqdXN0IHRoZSBzbGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rID0gJy8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gSW5jcmVtZW50IGRlcHRoIGZvciBwYXJlbnRoZXNlcywgYnJhY2VzLCBhbmQgYnJhY2tldHMgc28gdGhhdCBpbnRlcmlvciBjb21tYXMgYXJlIGlnbm9yZWRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDQwIHx8IGMgPT09IDEyMyB8fCBjID09PSA5MSkgeyAvLyAnKCcsICd7JywgJ1snXG4gICAgICAgICAgICAgICAgICAgICsrZGVwdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA0MSB8fCBjID09PSAxMjUgfHwgYyA9PT0gOTMpIHsgLy8gJyknLCAnfScsICddJ1xuICAgICAgICAgICAgICAgICAgICAtLWRlcHRoO1xuICAgICAgICAgICAgICAgIC8vIFRoZSBrZXkgbXVzdCBiZSBhIHNpbmdsZSB0b2tlbjsgaWYgaXQncyBhIHN0cmluZywgdHJpbSB0aGUgcXVvdGVzXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICgha2V5ICYmICF2YWx1ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gKGMgPT09IDM0IHx8IGMgPT09IDM5KSAvKiAnXCInLCBcIidcIiAqLyA/IHRvay5zbGljZSgxLCAtMSkgOiB0b2s7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodmFsdWVzKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaCh0b2spO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gW3Rva107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBUd28td2F5IGJpbmRpbmdzIGluY2x1ZGUgYSB3cml0ZSBmdW5jdGlvbiB0aGF0IGFsbG93IHRoZSBoYW5kbGVyIHRvIHVwZGF0ZSB0aGUgdmFsdWUgZXZlbiBpZiBpdCdzIG5vdCBhbiBvYnNlcnZhYmxlLlxuICAgIHZhciB0d29XYXlCaW5kaW5ncyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gcHJlUHJvY2Vzc0JpbmRpbmdzKGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5LCBiaW5kaW5nT3B0aW9ucykge1xuICAgICAgICBiaW5kaW5nT3B0aW9ucyA9IGJpbmRpbmdPcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NLZXlWYWx1ZShrZXksIHZhbCkge1xuICAgICAgICAgICAgdmFyIHdyaXRhYmxlVmFsO1xuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbFByZXByb2Nlc3NIb29rKG9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiAob2JqICYmIG9ialsncHJlcHJvY2VzcyddKSA/ICh2YWwgPSBvYmpbJ3ByZXByb2Nlc3MnXSh2YWwsIGtleSwgcHJvY2Vzc0tleVZhbHVlKSkgOiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjYWxsUHJlcHJvY2Vzc0hvb2soa29bJ2dldEJpbmRpbmdIYW5kbGVyJ10oa2V5KSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAodHdvV2F5QmluZGluZ3Nba2V5XSAmJiAod3JpdGFibGVWYWwgPSBnZXRXcml0ZWFibGVWYWx1ZSh2YWwpKSkge1xuICAgICAgICAgICAgICAgIC8vIEZvciB0d28td2F5IGJpbmRpbmdzLCBwcm92aWRlIGEgd3JpdGUgbWV0aG9kIGluIGNhc2UgdGhlIHZhbHVlXG4gICAgICAgICAgICAgICAgLy8gaXNuJ3QgYSB3cml0YWJsZSBvYnNlcnZhYmxlLlxuICAgICAgICAgICAgICAgIHByb3BlcnR5QWNjZXNzb3JSZXN1bHRTdHJpbmdzLnB1c2goXCInXCIgKyBrZXkgKyBcIic6ZnVuY3Rpb24oX3ope1wiICsgd3JpdGFibGVWYWwgKyBcIj1fen1cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFZhbHVlcyBhcmUgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uIHNvIHRoYXQgZWFjaCB2YWx1ZSBjYW4gYmUgYWNjZXNzZWQgaW5kZXBlbmRlbnRseVxuICAgICAgICAgICAgaWYgKG1ha2VWYWx1ZUFjY2Vzc29ycykge1xuICAgICAgICAgICAgICAgIHZhbCA9ICdmdW5jdGlvbigpe3JldHVybiAnICsgdmFsICsgJyB9JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFN0cmluZ3MucHVzaChcIidcIiArIGtleSArIFwiJzpcIiArIHZhbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0U3RyaW5ncyA9IFtdLFxuICAgICAgICAgICAgcHJvcGVydHlBY2Nlc3NvclJlc3VsdFN0cmluZ3MgPSBbXSxcbiAgICAgICAgICAgIG1ha2VWYWx1ZUFjY2Vzc29ycyA9IGJpbmRpbmdPcHRpb25zWyd2YWx1ZUFjY2Vzc29ycyddLFxuICAgICAgICAgICAga2V5VmFsdWVBcnJheSA9IHR5cGVvZiBiaW5kaW5nc1N0cmluZ09yS2V5VmFsdWVBcnJheSA9PT0gXCJzdHJpbmdcIiA/XG4gICAgICAgICAgICAgICAgcGFyc2VPYmplY3RMaXRlcmFsKGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5KSA6IGJpbmRpbmdzU3RyaW5nT3JLZXlWYWx1ZUFycmF5O1xuXG4gICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChrZXlWYWx1ZUFycmF5LCBmdW5jdGlvbihrZXlWYWx1ZSkge1xuICAgICAgICAgICAgcHJvY2Vzc0tleVZhbHVlKGtleVZhbHVlLmtleSB8fCBrZXlWYWx1ZVsndW5rbm93biddLCBrZXlWYWx1ZS52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eUFjY2Vzc29yUmVzdWx0U3RyaW5ncy5sZW5ndGgpXG4gICAgICAgICAgICBwcm9jZXNzS2V5VmFsdWUoJ19rb19wcm9wZXJ0eV93cml0ZXJzJywgXCJ7XCIgKyBwcm9wZXJ0eUFjY2Vzc29yUmVzdWx0U3RyaW5ncy5qb2luKFwiLFwiKSArIFwiIH1cIik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFN0cmluZ3Muam9pbihcIixcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzOiBbXSxcblxuICAgICAgICB0d29XYXlCaW5kaW5nczogdHdvV2F5QmluZGluZ3MsXG5cbiAgICAgICAgcGFyc2VPYmplY3RMaXRlcmFsOiBwYXJzZU9iamVjdExpdGVyYWwsXG5cbiAgICAgICAgcHJlUHJvY2Vzc0JpbmRpbmdzOiBwcmVQcm9jZXNzQmluZGluZ3MsXG5cbiAgICAgICAga2V5VmFsdWVBcnJheUNvbnRhaW5zS2V5OiBmdW5jdGlvbihrZXlWYWx1ZUFycmF5LCBrZXkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsdWVBcnJheS5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICBpZiAoa2V5VmFsdWVBcnJheVtpXVsna2V5J10gPT0ga2V5KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBJbnRlcm5hbCwgcHJpdmF0ZSBLTyB1dGlsaXR5IGZvciB1cGRhdGluZyBtb2RlbCBwcm9wZXJ0aWVzIGZyb20gd2l0aGluIGJpbmRpbmdzXG4gICAgICAgIC8vIHByb3BlcnR5OiAgICAgICAgICAgIElmIHRoZSBwcm9wZXJ0eSBiZWluZyB1cGRhdGVkIGlzIChvciBtaWdodCBiZSkgYW4gb2JzZXJ2YWJsZSwgcGFzcyBpdCBoZXJlXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIElmIGl0IHR1cm5zIG91dCB0byBiZSBhIHdyaXRhYmxlIG9ic2VydmFibGUsIGl0IHdpbGwgYmUgd3JpdHRlbiB0byBkaXJlY3RseVxuICAgICAgICAvLyBhbGxCaW5kaW5nczogICAgICAgICBBbiBvYmplY3Qgd2l0aCBhIGdldCBtZXRob2QgdG8gcmV0cmlldmUgYmluZGluZ3MgaW4gdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIFRoaXMgd2lsbCBiZSBzZWFyY2hlZCBmb3IgYSAnX2tvX3Byb3BlcnR5X3dyaXRlcnMnIHByb3BlcnR5IGluIGNhc2UgeW91J3JlIHdyaXRpbmcgdG8gYSBub24tb2JzZXJ2YWJsZVxuICAgICAgICAvLyBrZXk6ICAgICAgICAgICAgICAgICBUaGUga2V5IGlkZW50aWZ5aW5nIHRoZSBwcm9wZXJ0eSB0byBiZSB3cml0dGVuLiBFeGFtcGxlOiBmb3IgeyBoYXNGb2N1czogbXlWYWx1ZSB9LCB3cml0ZSB0byAnbXlWYWx1ZScgYnkgc3BlY2lmeWluZyB0aGUga2V5ICdoYXNGb2N1cydcbiAgICAgICAgLy8gdmFsdWU6ICAgICAgICAgICAgICAgVGhlIHZhbHVlIHRvIGJlIHdyaXR0ZW5cbiAgICAgICAgLy8gY2hlY2tJZkRpZmZlcmVudDogICAgSWYgdHJ1ZSwgYW5kIGlmIHRoZSBwcm9wZXJ0eSBiZWluZyB3cml0dGVuIGlzIGEgd3JpdGFibGUgb2JzZXJ2YWJsZSwgdGhlIHZhbHVlIHdpbGwgb25seSBiZSB3cml0dGVuIGlmXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIGl0IGlzICE9PSBleGlzdGluZyB2YWx1ZSBvbiB0aGF0IHdyaXRhYmxlIG9ic2VydmFibGVcbiAgICAgICAgd3JpdGVWYWx1ZVRvUHJvcGVydHk6IGZ1bmN0aW9uKHByb3BlcnR5LCBhbGxCaW5kaW5ncywga2V5LCB2YWx1ZSwgY2hlY2tJZkRpZmZlcmVudCkge1xuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eSB8fCAha28uaXNPYnNlcnZhYmxlKHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wV3JpdGVycyA9IGFsbEJpbmRpbmdzLmdldCgnX2tvX3Byb3BlcnR5X3dyaXRlcnMnKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvcFdyaXRlcnMgJiYgcHJvcFdyaXRlcnNba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgcHJvcFdyaXRlcnNba2V5XSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtvLmlzV3JpdGVhYmxlT2JzZXJ2YWJsZShwcm9wZXJ0eSkgJiYgKCFjaGVja0lmRGlmZmVyZW50IHx8IHByb3BlcnR5LnBlZWsoKSAhPT0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHkodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnZXhwcmVzc2lvblJld3JpdGluZycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcpO1xua28uZXhwb3J0U3ltYm9sKCdleHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9ycycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcuYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzKTtcbmtvLmV4cG9ydFN5bWJvbCgnZXhwcmVzc2lvblJld3JpdGluZy5wYXJzZU9iamVjdExpdGVyYWwnLCBrby5leHByZXNzaW9uUmV3cml0aW5nLnBhcnNlT2JqZWN0TGl0ZXJhbCk7XG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzJywga28uZXhwcmVzc2lvblJld3JpdGluZy5wcmVQcm9jZXNzQmluZGluZ3MpO1xuXG4vLyBNYWtpbmcgYmluZGluZ3MgZXhwbGljaXRseSBkZWNsYXJlIHRoZW1zZWx2ZXMgYXMgXCJ0d28gd2F5XCIgaXNuJ3QgaWRlYWwgaW4gdGhlIGxvbmcgdGVybSAoaXQgd291bGQgYmUgYmV0dGVyIGlmXG4vLyBhbGwgYmluZGluZ3MgY291bGQgdXNlIGFuIG9mZmljaWFsICdwcm9wZXJ0eSB3cml0ZXInIEFQSSB3aXRob3V0IG5lZWRpbmcgdG8gZGVjbGFyZSB0aGF0IHRoZXkgbWlnaHQpLiBIb3dldmVyLFxuLy8gc2luY2UgdGhpcyBpcyBub3QsIGFuZCBoYXMgbmV2ZXIgYmVlbiwgYSBwdWJsaWMgQVBJIChfa29fcHJvcGVydHlfd3JpdGVycyB3YXMgbmV2ZXIgZG9jdW1lbnRlZCksIGl0J3MgYWNjZXB0YWJsZVxuLy8gYXMgYW4gaW50ZXJuYWwgaW1wbGVtZW50YXRpb24gZGV0YWlsIGluIHRoZSBzaG9ydCB0ZXJtLlxuLy8gRm9yIHRob3NlIGRldmVsb3BlcnMgd2hvIHJlbHkgb24gX2tvX3Byb3BlcnR5X3dyaXRlcnMgaW4gdGhlaXIgY3VzdG9tIGJpbmRpbmdzLCB3ZSBleHBvc2UgX3R3b1dheUJpbmRpbmdzIGFzIGFuXG4vLyB1bmRvY3VtZW50ZWQgZmVhdHVyZSB0aGF0IG1ha2VzIGl0IHJlbGF0aXZlbHkgZWFzeSB0byB1cGdyYWRlIHRvIEtPIDMuMC4gSG93ZXZlciwgdGhpcyBpcyBzdGlsbCBub3QgYW4gb2ZmaWNpYWxcbi8vIHB1YmxpYyBBUEksIGFuZCB3ZSByZXNlcnZlIHRoZSByaWdodCB0byByZW1vdmUgaXQgYXQgYW55IHRpbWUgaWYgd2UgY3JlYXRlIGEgcmVhbCBwdWJsaWMgcHJvcGVydHkgd3JpdGVycyBBUEkuXG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcuX3R3b1dheUJpbmRpbmdzJywga28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5ncyk7XG5cbi8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBkZWZpbmUgdGhlIGZvbGxvd2luZyBhbGlhc2VzLiAoUHJldmlvdXNseSwgdGhlc2UgZnVuY3Rpb24gbmFtZXMgd2VyZSBtaXNsZWFkaW5nIGJlY2F1c2Vcbi8vIHRoZXkgcmVmZXJyZWQgdG8gSlNPTiBzcGVjaWZpY2FsbHksIGV2ZW4gdGhvdWdoIHRoZXkgYWN0dWFsbHkgd29yayB3aXRoIGFyYml0cmFyeSBKYXZhU2NyaXB0IG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb25zLilcbmtvLmV4cG9ydFN5bWJvbCgnanNvbkV4cHJlc3Npb25SZXdyaXRpbmcnLCBrby5leHByZXNzaW9uUmV3cml0aW5nKTtcbmtvLmV4cG9ydFN5bWJvbCgnanNvbkV4cHJlc3Npb25SZXdyaXRpbmcuaW5zZXJ0UHJvcGVydHlBY2Nlc3NvcnNJbnRvSnNvbicsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKTtcbihmdW5jdGlvbigpIHtcbiAgICAvLyBcIlZpcnR1YWwgZWxlbWVudHNcIiBpcyBhbiBhYnN0cmFjdGlvbiBvbiB0b3Agb2YgdGhlIHVzdWFsIERPTSBBUEkgd2hpY2ggdW5kZXJzdGFuZHMgdGhlIG5vdGlvbiB0aGF0IGNvbW1lbnQgbm9kZXNcbiAgICAvLyBtYXkgYmUgdXNlZCB0byByZXByZXNlbnQgaGllcmFyY2h5IChpbiBhZGRpdGlvbiB0byB0aGUgRE9NJ3MgbmF0dXJhbCBoaWVyYXJjaHkpLlxuICAgIC8vIElmIHlvdSBjYWxsIHRoZSBET00tbWFuaXB1bGF0aW5nIGZ1bmN0aW9ucyBvbiBrby52aXJ0dWFsRWxlbWVudHMsIHlvdSB3aWxsIGJlIGFibGUgdG8gcmVhZCBhbmQgd3JpdGUgdGhlIHN0YXRlXG4gICAgLy8gb2YgdGhhdCB2aXJ0dWFsIGhpZXJhcmNoeVxuICAgIC8vXG4gICAgLy8gVGhlIHBvaW50IG9mIGFsbCB0aGlzIGlzIHRvIHN1cHBvcnQgY29udGFpbmVybGVzcyB0ZW1wbGF0ZXMgKGUuZy4sIDwhLS0ga28gZm9yZWFjaDpzb21lQ29sbGVjdGlvbiAtLT5ibGFoPCEtLSAva28gLS0+KVxuICAgIC8vIHdpdGhvdXQgaGF2aW5nIHRvIHNjYXR0ZXIgc3BlY2lhbCBjYXNlcyBhbGwgb3ZlciB0aGUgYmluZGluZyBhbmQgdGVtcGxhdGluZyBjb2RlLlxuXG4gICAgLy8gSUUgOSBjYW5ub3QgcmVsaWFibHkgcmVhZCB0aGUgXCJub2RlVmFsdWVcIiBwcm9wZXJ0eSBvZiBhIGNvbW1lbnQgbm9kZSAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMTg2KVxuICAgIC8vIGJ1dCBpdCBkb2VzIGdpdmUgdGhlbSBhIG5vbnN0YW5kYXJkIGFsdGVybmF0aXZlIHByb3BlcnR5IGNhbGxlZCBcInRleHRcIiB0aGF0IGl0IGNhbiByZWFkIHJlbGlhYmx5LiBPdGhlciBicm93c2VycyBkb24ndCBoYXZlIHRoYXQgcHJvcGVydHkuXG4gICAgLy8gU28sIHVzZSBub2RlLnRleHQgd2hlcmUgYXZhaWxhYmxlLCBhbmQgbm9kZS5ub2RlVmFsdWUgZWxzZXdoZXJlXG4gICAgdmFyIGNvbW1lbnROb2Rlc0hhdmVUZXh0UHJvcGVydHkgPSBkb2N1bWVudCAmJiBkb2N1bWVudC5jcmVhdGVDb21tZW50KFwidGVzdFwiKS50ZXh0ID09PSBcIjwhLS10ZXN0LS0+XCI7XG5cbiAgICB2YXIgc3RhcnRDb21tZW50UmVnZXggPSBjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gL148IS0tXFxzKmtvKD86XFxzKyhbXFxzXFxTXSspKT9cXHMqLS0+JC8gOiAvXlxccyprbyg/OlxccysoW1xcc1xcU10rKSk/XFxzKiQvO1xuICAgIHZhciBlbmRDb21tZW50UmVnZXggPSAgIGNvbW1lbnROb2Rlc0hhdmVUZXh0UHJvcGVydHkgPyAvXjwhLS1cXHMqXFwva29cXHMqLS0+JC8gOiAvXlxccypcXC9rb1xccyokLztcbiAgICB2YXIgaHRtbFRhZ3NXaXRoT3B0aW9uYWxseUNsb3NpbmdDaGlsZHJlbiA9IHsgJ3VsJzogdHJ1ZSwgJ29sJzogdHJ1ZSB9O1xuXG4gICAgZnVuY3Rpb24gaXNTdGFydENvbW1lbnQobm9kZSkge1xuICAgICAgICByZXR1cm4gKG5vZGUubm9kZVR5cGUgPT0gOCkgJiYgc3RhcnRDb21tZW50UmVnZXgudGVzdChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRW5kQ29tbWVudChub2RlKSB7XG4gICAgICAgIHJldHVybiAobm9kZS5ub2RlVHlwZSA9PSA4KSAmJiBlbmRDb21tZW50UmVnZXgudGVzdChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFZpcnR1YWxDaGlsZHJlbihzdGFydENvbW1lbnQsIGFsbG93VW5iYWxhbmNlZCkge1xuICAgICAgICB2YXIgY3VycmVudE5vZGUgPSBzdGFydENvbW1lbnQ7XG4gICAgICAgIHZhciBkZXB0aCA9IDE7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IFtdO1xuICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGlzRW5kQ29tbWVudChjdXJyZW50Tm9kZSkpIHtcbiAgICAgICAgICAgICAgICBkZXB0aC0tO1xuICAgICAgICAgICAgICAgIGlmIChkZXB0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGN1cnJlbnROb2RlKTtcblxuICAgICAgICAgICAgaWYgKGlzU3RhcnRDb21tZW50KGN1cnJlbnROb2RlKSlcbiAgICAgICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYWxsb3dVbmJhbGFuY2VkKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgY2xvc2luZyBjb21tZW50IHRhZyB0byBtYXRjaDogXCIgKyBzdGFydENvbW1lbnQubm9kZVZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TWF0Y2hpbmdFbmRDb21tZW50KHN0YXJ0Q29tbWVudCwgYWxsb3dVbmJhbGFuY2VkKSB7XG4gICAgICAgIHZhciBhbGxWaXJ0dWFsQ2hpbGRyZW4gPSBnZXRWaXJ0dWFsQ2hpbGRyZW4oc3RhcnRDb21tZW50LCBhbGxvd1VuYmFsYW5jZWQpO1xuICAgICAgICBpZiAoYWxsVmlydHVhbENoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoYWxsVmlydHVhbENoaWxkcmVuLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFsbFZpcnR1YWxDaGlsZHJlblthbGxWaXJ0dWFsQ2hpbGRyZW4ubGVuZ3RoIC0gMV0ubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICByZXR1cm4gc3RhcnRDb21tZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBNdXN0IGhhdmUgbm8gbWF0Y2hpbmcgZW5kIGNvbW1lbnQsIGFuZCBhbGxvd1VuYmFsYW5jZWQgaXMgdHJ1ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVuYmFsYW5jZWRDaGlsZFRhZ3Mobm9kZSkge1xuICAgICAgICAvLyBlLmcuLCBmcm9tIDxkaXY+T0s8L2Rpdj48IS0tIGtvIGJsYWggLS0+PHNwYW4+QW5vdGhlcjwvc3Bhbj4sIHJldHVybnM6IDwhLS0ga28gYmxhaCAtLT48c3Bhbj5Bbm90aGVyPC9zcGFuPlxuICAgICAgICAvLyAgICAgICBmcm9tIDxkaXY+T0s8L2Rpdj48IS0tIC9rbyAtLT48IS0tIC9rbyAtLT4sICAgICAgICAgICAgIHJldHVybnM6IDwhLS0gL2tvIC0tPjwhLS0gL2tvIC0tPlxuICAgICAgICB2YXIgY2hpbGROb2RlID0gbm9kZS5maXJzdENoaWxkLCBjYXB0dXJlUmVtYWluaW5nID0gbnVsbDtcbiAgICAgICAgaWYgKGNoaWxkTm9kZSkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGlmIChjYXB0dXJlUmVtYWluaW5nKSAgICAgICAgICAgICAgICAgICAvLyBXZSBhbHJlYWR5IGhpdCBhbiB1bmJhbGFuY2VkIG5vZGUgYW5kIGFyZSBub3cganVzdCBzY29vcGluZyB1cCBhbGwgc3Vic2VxdWVudCBub2Rlc1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlUmVtYWluaW5nLnB1c2goY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc1N0YXJ0Q29tbWVudChjaGlsZE5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaGluZ0VuZENvbW1lbnQgPSBnZXRNYXRjaGluZ0VuZENvbW1lbnQoY2hpbGROb2RlLCAvKiBhbGxvd1VuYmFsYW5jZWQ6ICovIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hpbmdFbmRDb21tZW50KSAgICAgICAgICAgICAvLyBJdCdzIGEgYmFsYW5jZWQgdGFnLCBzbyBza2lwIGltbWVkaWF0ZWx5IHRvIHRoZSBlbmQgb2YgdGhpcyB2aXJ0dWFsIHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlID0gbWF0Y2hpbmdFbmRDb21tZW50O1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJlUmVtYWluaW5nID0gW2NoaWxkTm9kZV07IC8vIEl0J3MgdW5iYWxhbmNlZCwgc28gc3RhcnQgY2FwdHVyaW5nIGZyb20gdGhpcyBwb2ludFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNFbmRDb21tZW50KGNoaWxkTm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZVJlbWFpbmluZyA9IFtjaGlsZE5vZGVdOyAgICAgLy8gSXQncyB1bmJhbGFuY2VkIChpZiBpdCB3YXNuJ3QsIHdlJ2QgaGF2ZSBza2lwcGVkIG92ZXIgaXQgYWxyZWFkeSksIHNvIHN0YXJ0IGNhcHR1cmluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gd2hpbGUgKGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhcHR1cmVSZW1haW5pbmc7XG4gICAgfVxuXG4gICAga28udmlydHVhbEVsZW1lbnRzID0ge1xuICAgICAgICBhbGxvd2VkQmluZGluZ3M6IHt9LFxuXG4gICAgICAgIGNoaWxkTm9kZXM6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBpc1N0YXJ0Q29tbWVudChub2RlKSA/IGdldFZpcnR1YWxDaGlsZHJlbihub2RlKSA6IG5vZGUuY2hpbGROb2RlcztcbiAgICAgICAgfSxcblxuICAgICAgICBlbXB0eU5vZGU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGFydENvbW1lbnQobm9kZSkpXG4gICAgICAgICAgICAgICAga28udXRpbHMuZW1wdHlEb21Ob2RlKG5vZGUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpcnR1YWxDaGlsZHJlbiA9IGtvLnZpcnR1YWxFbGVtZW50cy5jaGlsZE5vZGVzKG5vZGUpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmlydHVhbENoaWxkcmVuLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAga28ucmVtb3ZlTm9kZSh2aXJ0dWFsQ2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldERvbU5vZGVDaGlsZHJlbjogZnVuY3Rpb24obm9kZSwgY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgaWYgKCFpc1N0YXJ0Q29tbWVudChub2RlKSlcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXREb21Ob2RlQ2hpbGRyZW4obm9kZSwgY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIHZhciBlbmRDb21tZW50Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7IC8vIE11c3QgYmUgdGhlIG5leHQgc2libGluZywgYXMgd2UganVzdCBlbXB0aWVkIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gY2hpbGROb2Rlcy5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIGVuZENvbW1lbnROb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNoaWxkTm9kZXNbaV0sIGVuZENvbW1lbnROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwcmVwZW5kOiBmdW5jdGlvbihjb250YWluZXJOb2RlLCBub2RlVG9QcmVwZW5kKSB7XG4gICAgICAgICAgICBpZiAoIWlzU3RhcnRDb21tZW50KGNvbnRhaW5lck5vZGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lck5vZGUuZmlyc3RDaGlsZClcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvUHJlcGVuZCwgY29udGFpbmVyTm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUuYXBwZW5kQ2hpbGQobm9kZVRvUHJlcGVuZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGNvbW1lbnRzIG11c3QgYWx3YXlzIGhhdmUgYSBwYXJlbnQgYW5kIGF0IGxlYXN0IG9uZSBmb2xsb3dpbmcgc2libGluZyAodGhlIGVuZCBjb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvUHJlcGVuZCwgY29udGFpbmVyTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKGNvbnRhaW5lck5vZGUsIG5vZGVUb0luc2VydCwgaW5zZXJ0QWZ0ZXJOb2RlKSB7XG4gICAgICAgICAgICBpZiAoIWluc2VydEFmdGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5wcmVwZW5kKGNvbnRhaW5lck5vZGUsIG5vZGVUb0luc2VydCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc1N0YXJ0Q29tbWVudChjb250YWluZXJOb2RlKSkge1xuICAgICAgICAgICAgICAgIC8vIEluc2VydCBhZnRlciBpbnNlcnRpb24gcG9pbnRcbiAgICAgICAgICAgICAgICBpZiAoaW5zZXJ0QWZ0ZXJOb2RlLm5leHRTaWJsaW5nKVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmluc2VydEJlZm9yZShub2RlVG9JbnNlcnQsIGluc2VydEFmdGVyTm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmFwcGVuZENoaWxkKG5vZGVUb0luc2VydCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENoaWxkcmVuIG9mIHN0YXJ0IGNvbW1lbnRzIG11c3QgYWx3YXlzIGhhdmUgYSBwYXJlbnQgYW5kIGF0IGxlYXN0IG9uZSBmb2xsb3dpbmcgc2libGluZyAodGhlIGVuZCBjb21tZW50KVxuICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvSW5zZXJ0LCBpbnNlcnRBZnRlck5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpcnN0Q2hpbGQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGFydENvbW1lbnQobm9kZSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIGlmICghbm9kZS5uZXh0U2libGluZyB8fCBpc0VuZENvbW1lbnQobm9kZS5uZXh0U2libGluZykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0U2libGluZzogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzU3RhcnRDb21tZW50KG5vZGUpKVxuICAgICAgICAgICAgICAgIG5vZGUgPSBnZXRNYXRjaGluZ0VuZENvbW1lbnQobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5uZXh0U2libGluZyAmJiBpc0VuZENvbW1lbnQobm9kZS5uZXh0U2libGluZykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNCaW5kaW5nVmFsdWU6IGlzU3RhcnRDb21tZW50LFxuXG4gICAgICAgIHZpcnR1YWxOb2RlQmluZGluZ1ZhbHVlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICB2YXIgcmVnZXhNYXRjaCA9IChjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gbm9kZS50ZXh0IDogbm9kZS5ub2RlVmFsdWUpLm1hdGNoKHN0YXJ0Q29tbWVudFJlZ2V4KTtcbiAgICAgICAgICAgIHJldHVybiByZWdleE1hdGNoID8gcmVnZXhNYXRjaFsxXSA6IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9ybWFsaXNlVmlydHVhbEVsZW1lbnREb21TdHJ1Y3R1cmU6IGZ1bmN0aW9uKGVsZW1lbnRWZXJpZmllZCkge1xuICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy8xNTVcbiAgICAgICAgICAgIC8vIChJRSA8PSA4IG9yIElFIDkgcXVpcmtzIG1vZGUgcGFyc2VzIHlvdXIgSFRNTCB3ZWlyZGx5LCB0cmVhdGluZyBjbG9zaW5nIDwvbGk+IHRhZ3MgYXMgaWYgdGhleSBkb24ndCBleGlzdCwgdGhlcmVieSBtb3ZpbmcgY29tbWVudCBub2Rlc1xuICAgICAgICAgICAgLy8gdGhhdCBhcmUgZGlyZWN0IGRlc2NlbmRhbnRzIG9mIDx1bD4gaW50byB0aGUgcHJlY2VkaW5nIDxsaT4pXG4gICAgICAgICAgICBpZiAoIWh0bWxUYWdzV2l0aE9wdGlvbmFsbHlDbG9zaW5nQ2hpbGRyZW5ba28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnRWZXJpZmllZCldKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgLy8gU2NhbiBpbW1lZGlhdGUgY2hpbGRyZW4gdG8gc2VlIGlmIHRoZXkgY29udGFpbiB1bmJhbGFuY2VkIGNvbW1lbnQgdGFncy4gSWYgdGhleSBkbywgdGhvc2UgY29tbWVudCB0YWdzXG4gICAgICAgICAgICAvLyBtdXN0IGJlIGludGVuZGVkIHRvIGFwcGVhciAqYWZ0ZXIqIHRoYXQgY2hpbGQsIHNvIG1vdmUgdGhlbSB0aGVyZS5cbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGUgPSBlbGVtZW50VmVyaWZpZWQuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bmJhbGFuY2VkVGFncyA9IGdldFVuYmFsYW5jZWRDaGlsZFRhZ3MoY2hpbGROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmJhbGFuY2VkVGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpeCB1cCB0aGUgRE9NIGJ5IG1vdmluZyB0aGUgdW5iYWxhbmNlZCB0YWdzIHRvIHdoZXJlIHRoZXkgbW9zdCBsaWtlbHkgd2VyZSBpbnRlbmRlZCB0byBiZSBwbGFjZWQgLSAqYWZ0ZXIqIHRoZSBjaGlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlVG9JbnNlcnRCZWZvcmUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1bmJhbGFuY2VkVGFncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZVRvSW5zZXJ0QmVmb3JlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZlcmlmaWVkLmluc2VydEJlZm9yZSh1bmJhbGFuY2VkVGFnc1tpXSwgbm9kZVRvSW5zZXJ0QmVmb3JlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFZlcmlmaWVkLmFwcGVuZENoaWxkKHVuYmFsYW5jZWRUYWdzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IHdoaWxlIChjaGlsZE5vZGUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cycsIGtvLnZpcnR1YWxFbGVtZW50cyk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3MnLCBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzKTtcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLmVtcHR5Tm9kZScsIGtvLnZpcnR1YWxFbGVtZW50cy5lbXB0eU5vZGUpO1xuLy9rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkJywga28udmlydHVhbEVsZW1lbnRzLmZpcnN0Q2hpbGQpOyAgICAgLy8gZmlyc3RDaGlsZCBpcyBub3QgbWluaWZpZWRcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLmluc2VydEFmdGVyJywga28udmlydHVhbEVsZW1lbnRzLmluc2VydEFmdGVyKTtcbi8va28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcnLCBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcpOyAgIC8vIG5leHRTaWJsaW5nIGlzIG5vdCBtaW5pZmllZFxua28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMucHJlcGVuZCcsIGtvLnZpcnR1YWxFbGVtZW50cy5wcmVwZW5kKTtcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLnNldERvbU5vZGVDaGlsZHJlbicsIGtvLnZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4pO1xuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0QmluZGluZ0F0dHJpYnV0ZU5hbWUgPSBcImRhdGEtYmluZFwiO1xuXG4gICAga28uYmluZGluZ1Byb3ZpZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYmluZGluZ0NhY2hlID0ge307XG4gICAgfTtcblxuICAgIGtvLnV0aWxzLmV4dGVuZChrby5iaW5kaW5nUHJvdmlkZXIucHJvdG90eXBlLCB7XG4gICAgICAgICdub2RlSGFzQmluZGluZ3MnOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBub2RlLmdldEF0dHJpYnV0ZShkZWZhdWx0QmluZGluZ0F0dHJpYnV0ZU5hbWUpICE9IG51bGw7ICAgLy8gRWxlbWVudFxuICAgICAgICAgICAgICAgIGNhc2UgODogcmV0dXJuIGtvLnZpcnR1YWxFbGVtZW50cy5oYXNCaW5kaW5nVmFsdWUobm9kZSk7IC8vIENvbW1lbnQgbm9kZVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAnZ2V0QmluZGluZ3MnOiBmdW5jdGlvbihub2RlLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGJpbmRpbmdzU3RyaW5nID0gdGhpc1snZ2V0QmluZGluZ3NTdHJpbmcnXShub2RlLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gYmluZGluZ3NTdHJpbmcgPyB0aGlzWydwYXJzZUJpbmRpbmdzU3RyaW5nJ10oYmluZGluZ3NTdHJpbmcsIGJpbmRpbmdDb250ZXh0LCBub2RlKSA6IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2dldEJpbmRpbmdBY2Nlc3NvcnMnOiBmdW5jdGlvbihub2RlLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGJpbmRpbmdzU3RyaW5nID0gdGhpc1snZ2V0QmluZGluZ3NTdHJpbmcnXShub2RlLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gYmluZGluZ3NTdHJpbmcgPyB0aGlzWydwYXJzZUJpbmRpbmdzU3RyaW5nJ10oYmluZGluZ3NTdHJpbmcsIGJpbmRpbmdDb250ZXh0LCBub2RlLCB7J3ZhbHVlQWNjZXNzb3JzJzp0cnVlfSkgOiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gaXMgb25seSB1c2VkIGludGVybmFsbHkgYnkgdGhpcyBkZWZhdWx0IHByb3ZpZGVyLlxuICAgICAgICAvLyBJdCdzIG5vdCBwYXJ0IG9mIHRoZSBpbnRlcmZhY2UgZGVmaW5pdGlvbiBmb3IgYSBnZW5lcmFsIGJpbmRpbmcgcHJvdmlkZXIuXG4gICAgICAgICdnZXRCaW5kaW5nc1N0cmluZyc6IGZ1bmN0aW9uKG5vZGUsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBub2RlLmdldEF0dHJpYnV0ZShkZWZhdWx0QmluZGluZ0F0dHJpYnV0ZU5hbWUpOyAgIC8vIEVsZW1lbnRcbiAgICAgICAgICAgICAgICBjYXNlIDg6IHJldHVybiBrby52aXJ0dWFsRWxlbWVudHMudmlydHVhbE5vZGVCaW5kaW5nVmFsdWUobm9kZSk7IC8vIENvbW1lbnQgbm9kZVxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gaXMgb25seSB1c2VkIGludGVybmFsbHkgYnkgdGhpcyBkZWZhdWx0IHByb3ZpZGVyLlxuICAgICAgICAvLyBJdCdzIG5vdCBwYXJ0IG9mIHRoZSBpbnRlcmZhY2UgZGVmaW5pdGlvbiBmb3IgYSBnZW5lcmFsIGJpbmRpbmcgcHJvdmlkZXIuXG4gICAgICAgICdwYXJzZUJpbmRpbmdzU3RyaW5nJzogZnVuY3Rpb24oYmluZGluZ3NTdHJpbmcsIGJpbmRpbmdDb250ZXh0LCBub2RlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nRnVuY3Rpb24gPSBjcmVhdGVCaW5kaW5nc1N0cmluZ0V2YWx1YXRvclZpYUNhY2hlKGJpbmRpbmdzU3RyaW5nLCB0aGlzLmJpbmRpbmdDYWNoZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmdGdW5jdGlvbihiaW5kaW5nQ29udGV4dCwgbm9kZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAgIGV4Lm1lc3NhZ2UgPSBcIlVuYWJsZSB0byBwYXJzZSBiaW5kaW5ncy5cXG5CaW5kaW5ncyB2YWx1ZTogXCIgKyBiaW5kaW5nc1N0cmluZyArIFwiXFxuTWVzc2FnZTogXCIgKyBleC5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBrby5iaW5kaW5nUHJvdmlkZXJbJ2luc3RhbmNlJ10gPSBuZXcga28uYmluZGluZ1Byb3ZpZGVyKCk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVCaW5kaW5nc1N0cmluZ0V2YWx1YXRvclZpYUNhY2hlKGJpbmRpbmdzU3RyaW5nLCBjYWNoZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgY2FjaGVLZXkgPSBiaW5kaW5nc1N0cmluZyArIChvcHRpb25zICYmIG9wdGlvbnNbJ3ZhbHVlQWNjZXNzb3JzJ10gfHwgJycpO1xuICAgICAgICByZXR1cm4gY2FjaGVbY2FjaGVLZXldXG4gICAgICAgICAgICB8fCAoY2FjaGVbY2FjaGVLZXldID0gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3IoYmluZGluZ3NTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVCaW5kaW5nc1N0cmluZ0V2YWx1YXRvcihiaW5kaW5nc1N0cmluZywgb3B0aW9ucykge1xuICAgICAgICAvLyBCdWlsZCB0aGUgc291cmNlIGZvciBhIGZ1bmN0aW9uIHRoYXQgZXZhbHVhdGVzIFwiZXhwcmVzc2lvblwiXG4gICAgICAgIC8vIEZvciBlYWNoIHNjb3BlIHZhcmlhYmxlLCBhZGQgYW4gZXh0cmEgbGV2ZWwgb2YgXCJ3aXRoXCIgbmVzdGluZ1xuICAgICAgICAvLyBFeGFtcGxlIHJlc3VsdDogd2l0aChzYzEpIHsgd2l0aChzYzApIHsgcmV0dXJuIChleHByZXNzaW9uKSB9IH1cbiAgICAgICAgdmFyIHJld3JpdHRlbkJpbmRpbmdzID0ga28uZXhwcmVzc2lvblJld3JpdGluZy5wcmVQcm9jZXNzQmluZGluZ3MoYmluZGluZ3NTdHJpbmcsIG9wdGlvbnMpLFxuICAgICAgICAgICAgZnVuY3Rpb25Cb2R5ID0gXCJ3aXRoKCRjb250ZXh0KXt3aXRoKCRkYXRhfHx7fSl7cmV0dXJue1wiICsgcmV3cml0dGVuQmluZGluZ3MgKyBcIn19fVwiO1xuICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiJGNvbnRleHRcIiwgXCIkZWxlbWVudFwiLCBmdW5jdGlvbkJvZHkpO1xuICAgIH1cbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnYmluZGluZ1Byb3ZpZGVyJywga28uYmluZGluZ1Byb3ZpZGVyKTtcbihmdW5jdGlvbiAoKSB7XG4gICAga28uYmluZGluZ0hhbmRsZXJzID0ge307XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGVsZW1lbnQgdHlwZXMgd2lsbCBub3QgYmUgcmVjdXJzZWQgaW50byBkdXJpbmcgYmluZGluZy4gSW4gdGhlIGZ1dHVyZSwgd2VcbiAgICAvLyBtYXkgY29uc2lkZXIgYWRkaW5nIDx0ZW1wbGF0ZT4gdG8gdGhpcyBsaXN0LCBiZWNhdXNlIHN1Y2ggZWxlbWVudHMnIGNvbnRlbnRzIGFyZSBhbHdheXNcbiAgICAvLyBpbnRlbmRlZCB0byBiZSBib3VuZCBpbiBhIGRpZmZlcmVudCBjb250ZXh0IGZyb20gd2hlcmUgdGhleSBhcHBlYXIgaW4gdGhlIGRvY3VtZW50LlxuICAgIHZhciBiaW5kaW5nRG9lc05vdFJlY3Vyc2VJbnRvRWxlbWVudFR5cGVzID0ge1xuICAgICAgICAvLyBEb24ndCB3YW50IGJpbmRpbmdzIHRoYXQgb3BlcmF0ZSBvbiB0ZXh0IG5vZGVzIHRvIG11dGF0ZSA8c2NyaXB0PiBjb250ZW50cyxcbiAgICAgICAgLy8gYmVjYXVzZSBpdCdzIHVuZXhwZWN0ZWQgYW5kIGEgcG90ZW50aWFsIFhTUyBpc3N1ZVxuICAgICAgICAnc2NyaXB0JzogdHJ1ZVxuICAgIH07XG5cbiAgICAvLyBVc2UgYW4gb3ZlcnJpZGFibGUgbWV0aG9kIGZvciByZXRyaWV2aW5nIGJpbmRpbmcgaGFuZGxlcnMgc28gdGhhdCBhIHBsdWdpbnMgbWF5IHN1cHBvcnQgZHluYW1pY2FsbHkgY3JlYXRlZCBoYW5kbGVyc1xuICAgIGtvWydnZXRCaW5kaW5nSGFuZGxlciddID0gZnVuY3Rpb24oYmluZGluZ0tleSkge1xuICAgICAgICByZXR1cm4ga28uYmluZGluZ0hhbmRsZXJzW2JpbmRpbmdLZXldO1xuICAgIH07XG5cbiAgICAvLyBUaGUga28uYmluZGluZ0NvbnRleHQgY29uc3RydWN0b3IgaXMgb25seSBjYWxsZWQgZGlyZWN0bHkgdG8gY3JlYXRlIHRoZSByb290IGNvbnRleHQuIEZvciBjaGlsZFxuICAgIC8vIGNvbnRleHRzLCB1c2UgYmluZGluZ0NvbnRleHQuY3JlYXRlQ2hpbGRDb250ZXh0IG9yIGJpbmRpbmdDb250ZXh0LmV4dGVuZC5cbiAgICBrby5iaW5kaW5nQ29udGV4dCA9IGZ1bmN0aW9uKGRhdGFJdGVtT3JBY2Nlc3NvciwgcGFyZW50Q29udGV4dCwgZGF0YUl0ZW1BbGlhcywgZXh0ZW5kQ2FsbGJhY2spIHtcblxuICAgICAgICAvLyBUaGUgYmluZGluZyBjb250ZXh0IG9iamVjdCBpbmNsdWRlcyBzdGF0aWMgcHJvcGVydGllcyBmb3IgdGhlIGN1cnJlbnQsIHBhcmVudCwgYW5kIHJvb3QgdmlldyBtb2RlbHMuXG4gICAgICAgIC8vIElmIGEgdmlldyBtb2RlbCBpcyBhY3R1YWxseSBzdG9yZWQgaW4gYW4gb2JzZXJ2YWJsZSwgdGhlIGNvcnJlc3BvbmRpbmcgYmluZGluZyBjb250ZXh0IG9iamVjdCwgYW5kXG4gICAgICAgIC8vIGFueSBjaGlsZCBjb250ZXh0cywgbXVzdCBiZSB1cGRhdGVkIHdoZW4gdGhlIHZpZXcgbW9kZWwgaXMgY2hhbmdlZC5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ29udGV4dCgpIHtcbiAgICAgICAgICAgIC8vIE1vc3Qgb2YgdGhlIHRpbWUsIHRoZSBjb250ZXh0IHdpbGwgZGlyZWN0bHkgZ2V0IGEgdmlldyBtb2RlbCBvYmplY3QsIGJ1dCBpZiBhIGZ1bmN0aW9uIGlzIGdpdmVuLFxuICAgICAgICAgICAgLy8gd2UgY2FsbCB0aGUgZnVuY3Rpb24gdG8gcmV0cmlldmUgdGhlIHZpZXcgbW9kZWwuIElmIHRoZSBmdW5jdGlvbiBhY2Nlc3NlcyBhbnkgb2JzZXZhYmxlcyBvciByZXR1cm5zXG4gICAgICAgICAgICAvLyBhbiBvYnNlcnZhYmxlLCB0aGUgZGVwZW5kZW5jeSBpcyB0cmFja2VkLCBhbmQgdGhvc2Ugb2JzZXJ2YWJsZXMgY2FuIGxhdGVyIGNhdXNlIHRoZSBiaW5kaW5nXG4gICAgICAgICAgICAvLyBjb250ZXh0IHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB2YXIgZGF0YUl0ZW1Pck9ic2VydmFibGUgPSBpc0Z1bmMgPyBkYXRhSXRlbU9yQWNjZXNzb3IoKSA6IGRhdGFJdGVtT3JBY2Nlc3NvcixcbiAgICAgICAgICAgICAgICBkYXRhSXRlbSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YUl0ZW1Pck9ic2VydmFibGUpO1xuXG4gICAgICAgICAgICBpZiAocGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gYSBcInBhcmVudFwiIGNvbnRleHQgaXMgZ2l2ZW4sIHJlZ2lzdGVyIGEgZGVwZW5kZW5jeSBvbiB0aGUgcGFyZW50IGNvbnRleHQuIFRodXMgd2hlbmV2ZXIgdGhlXG4gICAgICAgICAgICAgICAgLy8gcGFyZW50IGNvbnRleHQgaXMgdXBkYXRlZCwgdGhpcyBjb250ZXh0IHdpbGwgYWxzbyBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRDb250ZXh0Ll9zdWJzY3JpYmFibGUpXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudENvbnRleHQuX3N1YnNjcmliYWJsZSgpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ29weSAkcm9vdCBhbmQgYW55IGN1c3RvbSBwcm9wZXJ0aWVzIGZyb20gdGhlIHBhcmVudCBjb250ZXh0XG4gICAgICAgICAgICAgICAga28udXRpbHMuZXh0ZW5kKHNlbGYsIHBhcmVudENvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSB0aGUgYWJvdmUgY29weSBvdmVyd3JpdGVzIG91ciBvd24gcHJvcGVydGllcywgd2UgbmVlZCB0byByZXNldCB0aGVtLlxuICAgICAgICAgICAgICAgIC8vIER1cmluZyB0aGUgZmlyc3QgZXhlY3V0aW9uLCBcInN1YnNjcmliYWJsZVwiIGlzbid0IHNldCwgc28gZG9uJ3QgYm90aGVyIGRvaW5nIHRoZSB1cGRhdGUgdGhlbi5cbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaWJhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3N1YnNjcmliYWJsZSA9IHN1YnNjcmliYWJsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGZbJyRwYXJlbnRzJ10gPSBbXTtcbiAgICAgICAgICAgICAgICBzZWxmWyckcm9vdCddID0gZGF0YUl0ZW07XG5cbiAgICAgICAgICAgICAgICAvLyBFeHBvcnQgJ2tvJyBpbiB0aGUgYmluZGluZyBjb250ZXh0IHNvIGl0IHdpbGwgYmUgYXZhaWxhYmxlIGluIGJpbmRpbmdzIGFuZCB0ZW1wbGF0ZXNcbiAgICAgICAgICAgICAgICAvLyBldmVuIGlmICdrbycgaXNuJ3QgZXhwb3J0ZWQgYXMgYSBnbG9iYWwsIHN1Y2ggYXMgd2hlbiB1c2luZyBhbiBBTUQgbG9hZGVyLlxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzQ5MFxuICAgICAgICAgICAgICAgIHNlbGZbJ2tvJ10gPSBrbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGZbJyRyYXdEYXRhJ10gPSBkYXRhSXRlbU9yT2JzZXJ2YWJsZTtcbiAgICAgICAgICAgIHNlbGZbJyRkYXRhJ10gPSBkYXRhSXRlbTtcbiAgICAgICAgICAgIGlmIChkYXRhSXRlbUFsaWFzKVxuICAgICAgICAgICAgICAgIHNlbGZbZGF0YUl0ZW1BbGlhc10gPSBkYXRhSXRlbTtcblxuICAgICAgICAgICAgLy8gVGhlIGV4dGVuZENhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkIHdoZW4gY3JlYXRpbmcgYSBjaGlsZCBjb250ZXh0IG9yIGV4dGVuZGluZyBhIGNvbnRleHQuXG4gICAgICAgICAgICAvLyBJdCBoYW5kbGVzIHRoZSBzcGVjaWZpYyBhY3Rpb25zIG5lZWRlZCB0byBmaW5pc2ggc2V0dGluZyB1cCB0aGUgYmluZGluZyBjb250ZXh0LiBBY3Rpb25zIGluIHRoaXNcbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uIGNvdWxkIGFsc28gYWRkIGRlcGVuZGVuY2llcyB0byB0aGlzIGJpbmRpbmcgY29udGV4dC5cbiAgICAgICAgICAgIGlmIChleHRlbmRDYWxsYmFjaylcbiAgICAgICAgICAgICAgICBleHRlbmRDYWxsYmFjayhzZWxmLCBwYXJlbnRDb250ZXh0LCBkYXRhSXRlbSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxmWyckZGF0YSddO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGRpc3Bvc2VXaGVuKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVzICYmICFrby51dGlscy5hbnlEb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQobm9kZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgaXNGdW5jID0gdHlwZW9mKGRhdGFJdGVtT3JBY2Nlc3NvcikgPT0gXCJmdW5jdGlvblwiICYmICFrby5pc09ic2VydmFibGUoZGF0YUl0ZW1PckFjY2Vzc29yKSxcbiAgICAgICAgICAgIG5vZGVzLFxuICAgICAgICAgICAgc3Vic2NyaWJhYmxlID0ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSh1cGRhdGVDb250ZXh0LCBudWxsLCB7IGRpc3Bvc2VXaGVuOiBkaXNwb3NlV2hlbiwgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiB0cnVlIH0pO1xuXG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBiaW5kaW5nIGNvbnRleHQgaGFzIGJlZW4gaW5pdGlhbGl6ZWQsIGFuZCB0aGUgXCJzdWJzY3JpYmFibGVcIiBjb21wdXRlZCBvYnNlcnZhYmxlIGlzXG4gICAgICAgIC8vIHN1YnNjcmliZWQgdG8gYW55IG9ic2VydmFibGVzIHRoYXQgd2VyZSBhY2Nlc3NlZCBpbiB0aGUgcHJvY2Vzcy4gSWYgdGhlcmUgaXMgbm90aGluZyB0byB0cmFjaywgdGhlXG4gICAgICAgIC8vIGNvbXB1dGVkIHdpbGwgYmUgaW5hY3RpdmUsIGFuZCB3ZSBjYW4gc2FmZWx5IHRocm93IGl0IGF3YXkuIElmIGl0J3MgYWN0aXZlLCB0aGUgY29tcHV0ZWQgaXMgc3RvcmVkIGluXG4gICAgICAgIC8vIHRoZSBjb250ZXh0IG9iamVjdC5cbiAgICAgICAgaWYgKHN1YnNjcmliYWJsZS5pc0FjdGl2ZSgpKSB7XG4gICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmFibGUgPSBzdWJzY3JpYmFibGU7XG5cbiAgICAgICAgICAgIC8vIEFsd2F5cyBub3RpZnkgYmVjYXVzZSBldmVuIGlmIHRoZSBtb2RlbCAoJGRhdGEpIGhhc24ndCBjaGFuZ2VkLCBvdGhlciBjb250ZXh0IHByb3BlcnRpZXMgbWlnaHQgaGF2ZSBjaGFuZ2VkXG4gICAgICAgICAgICBzdWJzY3JpYmFibGVbJ2VxdWFsaXR5Q29tcGFyZXInXSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gYmUgYWJsZSB0byBkaXNwb3NlIG9mIHRoaXMgY29tcHV0ZWQgb2JzZXJ2YWJsZSB3aGVuIGl0J3Mgbm8gbG9uZ2VyIG5lZWRlZC4gVGhpcyB3b3VsZCBiZVxuICAgICAgICAgICAgLy8gZWFzeSBpZiB3ZSBoYWQgYSBzaW5nbGUgbm9kZSB0byB3YXRjaCwgYnV0IGJpbmRpbmcgY29udGV4dHMgY2FuIGJlIHVzZWQgYnkgbWFueSBkaWZmZXJlbnQgbm9kZXMsIGFuZFxuICAgICAgICAgICAgLy8gd2UgY2Fubm90IGFzc3VtZSB0aGF0IHRob3NlIG5vZGVzIGhhdmUgYW55IHJlbGF0aW9uIHRvIGVhY2ggb3RoZXIuIFNvIGluc3RlYWQgd2UgdHJhY2sgYW55IG5vZGUgdGhhdFxuICAgICAgICAgICAgLy8gdGhlIGNvbnRleHQgaXMgYXR0YWNoZWQgdG8sIGFuZCBkaXNwb3NlIHRoZSBjb21wdXRlZCB3aGVuIGFsbCBvZiB0aG9zZSBub2RlcyBoYXZlIGJlZW4gY2xlYW5lZC5cblxuICAgICAgICAgICAgLy8gQWRkIHByb3BlcnRpZXMgdG8gKnN1YnNjcmliYWJsZSogaW5zdGVhZCBvZiAqc2VsZiogYmVjYXVzZSBhbnkgcHJvcGVydGllcyBhZGRlZCB0byAqc2VsZiogbWF5IGJlIG92ZXJ3cml0dGVuIG9uIHVwZGF0ZXNcbiAgICAgICAgICAgIG5vZGVzID0gW107XG4gICAgICAgICAgICBzdWJzY3JpYmFibGUuX2FkZE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrKG5vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYXJyYXlSZW1vdmVJdGVtKG5vZGVzLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmFibGUgPSBzdWJzY3JpYmFibGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHRlbmQgdGhlIGJpbmRpbmcgY29udGV4dCBoaWVyYXJjaHkgd2l0aCBhIG5ldyB2aWV3IG1vZGVsIG9iamVjdC4gSWYgdGhlIHBhcmVudCBjb250ZXh0IGlzIHdhdGNoaW5nXG4gICAgLy8gYW55IG9ic2V2YWJsZXMsIHRoZSBuZXcgY2hpbGQgY29udGV4dCB3aWxsIGF1dG9tYXRpY2FsbHkgZ2V0IGEgZGVwZW5kZW5jeSBvbiB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAgLy8gQnV0IHRoaXMgZG9lcyBub3QgbWVhbiB0aGF0IHRoZSAkZGF0YSB2YWx1ZSBvZiB0aGUgY2hpbGQgY29udGV4dCB3aWxsIGFsc28gZ2V0IHVwZGF0ZWQuIElmIHRoZSBjaGlsZFxuICAgIC8vIHZpZXcgbW9kZWwgYWxzbyBkZXBlbmRzIG9uIHRoZSBwYXJlbnQgdmlldyBtb2RlbCwgeW91IG11c3QgcHJvdmlkZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY29ycmVjdFxuICAgIC8vIHZpZXcgbW9kZWwgb24gZWFjaCB1cGRhdGUuXG4gICAga28uYmluZGluZ0NvbnRleHQucHJvdG90eXBlWydjcmVhdGVDaGlsZENvbnRleHQnXSA9IGZ1bmN0aW9uIChkYXRhSXRlbU9yQWNjZXNzb3IsIGRhdGFJdGVtQWxpYXMsIGV4dGVuZENhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBuZXcga28uYmluZGluZ0NvbnRleHQoZGF0YUl0ZW1PckFjY2Vzc29yLCB0aGlzLCBkYXRhSXRlbUFsaWFzLCBmdW5jdGlvbihzZWxmLCBwYXJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICAvLyBFeHRlbmQgdGhlIGNvbnRleHQgaGllcmFyY2h5IGJ5IHNldHRpbmcgdGhlIGFwcHJvcHJpYXRlIHBvaW50ZXJzXG4gICAgICAgICAgICBzZWxmWyckcGFyZW50Q29udGV4dCddID0gcGFyZW50Q29udGV4dDtcbiAgICAgICAgICAgIHNlbGZbJyRwYXJlbnQnXSA9IHBhcmVudENvbnRleHRbJyRkYXRhJ107XG4gICAgICAgICAgICBzZWxmWyckcGFyZW50cyddID0gKHBhcmVudENvbnRleHRbJyRwYXJlbnRzJ10gfHwgW10pLnNsaWNlKDApO1xuICAgICAgICAgICAgc2VsZlsnJHBhcmVudHMnXS51bnNoaWZ0KHNlbGZbJyRwYXJlbnQnXSk7XG4gICAgICAgICAgICBpZiAoZXh0ZW5kQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgZXh0ZW5kQ2FsbGJhY2soc2VsZik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBFeHRlbmQgdGhlIGJpbmRpbmcgY29udGV4dCB3aXRoIG5ldyBjdXN0b20gcHJvcGVydGllcy4gVGhpcyBkb2Vzbid0IGNoYW5nZSB0aGUgY29udGV4dCBoaWVyYXJjaHkuXG4gICAgLy8gU2ltaWxhcmx5IHRvIFwiY2hpbGRcIiBjb250ZXh0cywgcHJvdmlkZSBhIGZ1bmN0aW9uIGhlcmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGNvcnJlY3QgdmFsdWVzIGFyZSBzZXRcbiAgICAvLyB3aGVuIGFuIG9ic2VydmFibGUgdmlldyBtb2RlbCBpcyB1cGRhdGVkLlxuICAgIGtvLmJpbmRpbmdDb250ZXh0LnByb3RvdHlwZVsnZXh0ZW5kJ10gPSBmdW5jdGlvbihwcm9wZXJ0aWVzKSB7XG4gICAgICAgIC8vIElmIHRoZSBwYXJlbnQgY29udGV4dCByZWZlcmVuY2VzIGFuIG9ic2VydmFibGUgdmlldyBtb2RlbCwgXCJfc3Vic2NyaWJhYmxlXCIgd2lsbCBhbHdheXMgYmUgdGhlXG4gICAgICAgIC8vIGxhdGVzdCB2aWV3IG1vZGVsIG9iamVjdC4gSWYgbm90LCBcIl9zdWJzY3JpYmFibGVcIiBpc24ndCBzZXQsIGFuZCB3ZSBjYW4gdXNlIHRoZSBzdGF0aWMgXCIkZGF0YVwiIHZhbHVlLlxuICAgICAgICByZXR1cm4gbmV3IGtvLmJpbmRpbmdDb250ZXh0KHRoaXMuX3N1YnNjcmliYWJsZSB8fCB0aGlzWyckZGF0YSddLCB0aGlzLCBudWxsLCBmdW5jdGlvbihzZWxmLCBwYXJlbnRDb250ZXh0KSB7XG4gICAgICAgICAgICAvLyBUaGlzIFwiY2hpbGRcIiBjb250ZXh0IGRvZXNuJ3QgZGlyZWN0bHkgdHJhY2sgYSBwYXJlbnQgb2JzZXJ2YWJsZSB2aWV3IG1vZGVsLFxuICAgICAgICAgICAgLy8gc28gd2UgbmVlZCB0byBtYW51YWxseSBzZXQgdGhlICRyYXdEYXRhIHZhbHVlIHRvIG1hdGNoIHRoZSBwYXJlbnQuXG4gICAgICAgICAgICBzZWxmWyckcmF3RGF0YSddID0gcGFyZW50Q29udGV4dFsnJHJhd0RhdGEnXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmV4dGVuZChzZWxmLCB0eXBlb2YocHJvcGVydGllcykgPT0gXCJmdW5jdGlvblwiID8gcHJvcGVydGllcygpIDogcHJvcGVydGllcyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB2YWx1ZUFjY2Vzb3IgZnVuY3Rpb24gZm9yIGEgYmluZGluZyB2YWx1ZVxuICAgIGZ1bmN0aW9uIG1ha2VWYWx1ZUFjY2Vzc29yKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlQWNjZXNzb3IgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBldmFsdWF0ZVZhbHVlQWNjZXNzb3IodmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICByZXR1cm4gdmFsdWVBY2Nlc3NvcigpO1xuICAgIH1cblxuICAgIC8vIEdpdmVuIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGJpbmRpbmdzLCBjcmVhdGUgYW5kIHJldHVybiBhIG5ldyBvYmplY3QgdGhhdCBjb250YWluc1xuICAgIC8vIGJpbmRpbmcgdmFsdWUtYWNjZXNzb3JzIGZ1bmN0aW9ucy4gRWFjaCBhY2Nlc3NvciBmdW5jdGlvbiBjYWxscyB0aGUgb3JpZ2luYWwgZnVuY3Rpb25cbiAgICAvLyBzbyB0aGF0IGl0IGFsd2F5cyBnZXRzIHRoZSBsYXRlc3QgdmFsdWUgYW5kIGFsbCBkZXBlbmRlbmNpZXMgYXJlIGNhcHR1cmVkLiBUaGlzIGlzIHVzZWRcbiAgICAvLyBieSBrby5hcHBseUJpbmRpbmdzVG9Ob2RlIGFuZCBnZXRCaW5kaW5nc0FuZE1ha2VBY2Nlc3NvcnMuXG4gICAgZnVuY3Rpb24gbWFrZUFjY2Vzc29yc0Zyb21GdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4ga28udXRpbHMub2JqZWN0TWFwKGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGNhbGxiYWNrKSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpW2tleV07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBHaXZlbiBhIGJpbmRpbmdzIGZ1bmN0aW9uIG9yIG9iamVjdCwgY3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgb2JqZWN0IHRoYXQgY29udGFpbnNcbiAgICAvLyBiaW5kaW5nIHZhbHVlLWFjY2Vzc29ycyBmdW5jdGlvbnMuIFRoaXMgaXMgdXNlZCBieSBrby5hcHBseUJpbmRpbmdzVG9Ob2RlLlxuICAgIGZ1bmN0aW9uIG1ha2VCaW5kaW5nQWNjZXNzb3JzKGJpbmRpbmdzLCBjb250ZXh0LCBub2RlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYmluZGluZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlQWNjZXNzb3JzRnJvbUZ1bmN0aW9uKGJpbmRpbmdzLmJpbmQobnVsbCwgY29udGV4dCwgbm9kZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm9iamVjdE1hcChiaW5kaW5ncywgbWFrZVZhbHVlQWNjZXNzb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGlmIHRoZSBiaW5kaW5nIHByb3ZpZGVyIGRvZXNuJ3QgaW5jbHVkZSBhIGdldEJpbmRpbmdBY2Nlc3NvcnMgZnVuY3Rpb24uXG4gICAgLy8gSXQgbXVzdCBiZSBjYWxsZWQgd2l0aCAndGhpcycgc2V0IHRvIHRoZSBwcm92aWRlciBpbnN0YW5jZS5cbiAgICBmdW5jdGlvbiBnZXRCaW5kaW5nc0FuZE1ha2VBY2Nlc3NvcnMobm9kZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gbWFrZUFjY2Vzc29yc0Zyb21GdW5jdGlvbih0aGlzWydnZXRCaW5kaW5ncyddLmJpbmQodGhpcywgbm9kZSwgY29udGV4dCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlVGhhdEJpbmRpbmdJc0FsbG93ZWRGb3JWaXJ0dWFsRWxlbWVudHMoYmluZGluZ05hbWUpIHtcbiAgICAgICAgdmFyIHZhbGlkYXRvciA9IGtvLnZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3NbYmluZGluZ05hbWVdO1xuICAgICAgICBpZiAoIXZhbGlkYXRvcilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBiaW5kaW5nICdcIiArIGJpbmRpbmdOYW1lICsgXCInIGNhbm5vdCBiZSB1c2VkIHdpdGggdmlydHVhbCBlbGVtZW50c1wiKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzSW50ZXJuYWwgKGJpbmRpbmdDb250ZXh0LCBlbGVtZW50T3JWaXJ0dWFsRWxlbWVudCwgYmluZGluZ0NvbnRleHRzTWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRDaGlsZCxcbiAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLmZpcnN0Q2hpbGQoZWxlbWVudE9yVmlydHVhbEVsZW1lbnQpLFxuICAgICAgICAgICAgcHJvdmlkZXIgPSBrby5iaW5kaW5nUHJvdmlkZXJbJ2luc3RhbmNlJ10sXG4gICAgICAgICAgICBwcmVwcm9jZXNzTm9kZSA9IHByb3ZpZGVyWydwcmVwcm9jZXNzTm9kZSddO1xuXG4gICAgICAgIC8vIFByZXByb2Nlc3NpbmcgYWxsb3dzIGEgYmluZGluZyBwcm92aWRlciB0byBtdXRhdGUgYSBub2RlIGJlZm9yZSBiaW5kaW5ncyBhcmUgYXBwbGllZCB0byBpdC4gRm9yIGV4YW1wbGUgaXQnc1xuICAgICAgICAvLyBwb3NzaWJsZSB0byBpbnNlcnQgbmV3IHNpYmxpbmdzIGFmdGVyIGl0LCBhbmQvb3IgcmVwbGFjZSB0aGUgbm9kZSB3aXRoIGEgZGlmZmVyZW50IG9uZS4gVGhpcyBjYW4gYmUgdXNlZCB0b1xuICAgICAgICAvLyBpbXBsZW1lbnQgY3VzdG9tIGJpbmRpbmcgc3ludGF4ZXMsIHN1Y2ggYXMge3sgdmFsdWUgfX0gZm9yIHN0cmluZyBpbnRlcnBvbGF0aW9uLCBvciBjdXN0b20gZWxlbWVudCB0eXBlcyB0aGF0XG4gICAgICAgIC8vIHRyaWdnZXIgaW5zZXJ0aW9uIG9mIDx0ZW1wbGF0ZT4gY29udGVudHMgYXQgdGhhdCBwb2ludCBpbiB0aGUgZG9jdW1lbnQuXG4gICAgICAgIGlmIChwcmVwcm9jZXNzTm9kZSkge1xuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRDaGlsZCA9IG5leHRJblF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgbmV4dEluUXVldWUgPSBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcoY3VycmVudENoaWxkKTtcbiAgICAgICAgICAgICAgICBwcmVwcm9jZXNzTm9kZS5jYWxsKHByb3ZpZGVyLCBjdXJyZW50Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVzZXQgbmV4dEluUXVldWUgZm9yIHRoZSBuZXh0IGxvb3BcbiAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLmZpcnN0Q2hpbGQoZWxlbWVudE9yVmlydHVhbEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnRDaGlsZCA9IG5leHRJblF1ZXVlKSB7XG4gICAgICAgICAgICAvLyBLZWVwIGEgcmVjb3JkIG9mIHRoZSBuZXh0IGNoaWxkICpiZWZvcmUqIGFwcGx5aW5nIGJpbmRpbmdzLCBpbiBjYXNlIHRoZSBiaW5kaW5nIHJlbW92ZXMgdGhlIGN1cnJlbnQgY2hpbGQgZnJvbSBpdHMgcG9zaXRpb25cbiAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGN1cnJlbnRDaGlsZCk7XG4gICAgICAgICAgICBhcHBseUJpbmRpbmdzVG9Ob2RlQW5kRGVzY2VuZGFudHNJbnRlcm5hbChiaW5kaW5nQ29udGV4dCwgY3VycmVudENoaWxkLCBiaW5kaW5nQ29udGV4dHNNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBseUJpbmRpbmdzVG9Ob2RlQW5kRGVzY2VuZGFudHNJbnRlcm5hbCAoYmluZGluZ0NvbnRleHQsIG5vZGVWZXJpZmllZCwgYmluZGluZ0NvbnRleHRNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCkge1xuICAgICAgICB2YXIgc2hvdWxkQmluZERlc2NlbmRhbnRzID0gdHJ1ZTtcblxuICAgICAgICAvLyBQZXJmIG9wdGltaXNhdGlvbjogQXBwbHkgYmluZGluZ3Mgb25seSBpZi4uLlxuICAgICAgICAvLyAoMSkgV2UgbmVlZCB0byBzdG9yZSB0aGUgYmluZGluZyBjb250ZXh0IG9uIHRoaXMgbm9kZSAoYmVjYXVzZSBpdCBtYXkgZGlmZmVyIGZyb20gdGhlIERPTSBwYXJlbnQgbm9kZSdzIGJpbmRpbmcgY29udGV4dClcbiAgICAgICAgLy8gICAgIE5vdGUgdGhhdCB3ZSBjYW4ndCBzdG9yZSBiaW5kaW5nIGNvbnRleHRzIG9uIG5vbi1lbGVtZW50cyAoZS5nLiwgdGV4dCBub2RlcyksIGFzIElFIGRvZXNuJ3QgYWxsb3cgZXhwYW5kbyBwcm9wZXJ0aWVzIGZvciB0aG9zZVxuICAgICAgICAvLyAoMikgSXQgbWlnaHQgaGF2ZSBiaW5kaW5ncyAoZS5nLiwgaXQgaGFzIGEgZGF0YS1iaW5kIGF0dHJpYnV0ZSwgb3IgaXQncyBhIG1hcmtlciBmb3IgYSBjb250YWluZXJsZXNzIHRlbXBsYXRlKVxuICAgICAgICB2YXIgaXNFbGVtZW50ID0gKG5vZGVWZXJpZmllZC5ub2RlVHlwZSA9PT0gMSk7XG4gICAgICAgIGlmIChpc0VsZW1lbnQpIC8vIFdvcmthcm91bmQgSUUgPD0gOCBIVE1MIHBhcnNpbmcgd2VpcmRuZXNzXG4gICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMubm9ybWFsaXNlVmlydHVhbEVsZW1lbnREb21TdHJ1Y3R1cmUobm9kZVZlcmlmaWVkKTtcblxuICAgICAgICB2YXIgc2hvdWxkQXBwbHlCaW5kaW5ncyA9IChpc0VsZW1lbnQgJiYgYmluZGluZ0NvbnRleHRNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCkgICAgICAgICAgICAgLy8gQ2FzZSAoMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCBrby5iaW5kaW5nUHJvdmlkZXJbJ2luc3RhbmNlJ11bJ25vZGVIYXNCaW5kaW5ncyddKG5vZGVWZXJpZmllZCk7ICAgICAgIC8vIENhc2UgKDIpXG4gICAgICAgIGlmIChzaG91bGRBcHBseUJpbmRpbmdzKVxuICAgICAgICAgICAgc2hvdWxkQmluZERlc2NlbmRhbnRzID0gYXBwbHlCaW5kaW5nc1RvTm9kZUludGVybmFsKG5vZGVWZXJpZmllZCwgbnVsbCwgYmluZGluZ0NvbnRleHQsIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpWydzaG91bGRCaW5kRGVzY2VuZGFudHMnXTtcblxuICAgICAgICBpZiAoc2hvdWxkQmluZERlc2NlbmRhbnRzICYmICFiaW5kaW5nRG9lc05vdFJlY3Vyc2VJbnRvRWxlbWVudFR5cGVzW2tvLnV0aWxzLnRhZ05hbWVMb3dlcihub2RlVmVyaWZpZWQpXSkge1xuICAgICAgICAgICAgLy8gV2UncmUgcmVjdXJzaW5nIGF1dG9tYXRpY2FsbHkgaW50byAocmVhbCBvciB2aXJ0dWFsKSBjaGlsZCBub2RlcyB3aXRob3V0IGNoYW5naW5nIGJpbmRpbmcgY29udGV4dHMuIFNvLFxuICAgICAgICAgICAgLy8gICogRm9yIGNoaWxkcmVuIG9mIGEgKnJlYWwqIGVsZW1lbnQsIHRoZSBiaW5kaW5nIGNvbnRleHQgaXMgY2VydGFpbmx5IHRoZSBzYW1lIGFzIG9uIHRoZWlyIERPTSAucGFyZW50Tm9kZSxcbiAgICAgICAgICAgIC8vICAgIGhlbmNlIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50IGlzIGZhbHNlXG4gICAgICAgICAgICAvLyAgKiBGb3IgY2hpbGRyZW4gb2YgYSAqdmlydHVhbCogZWxlbWVudCwgd2UgY2FuJ3QgYmUgc3VyZS4gRXZhbHVhdGluZyAucGFyZW50Tm9kZSBvbiB0aG9zZSBjaGlsZHJlbiBtYXlcbiAgICAgICAgICAgIC8vICAgIHNraXAgb3ZlciBhbnkgbnVtYmVyIG9mIGludGVybWVkaWF0ZSB2aXJ0dWFsIGVsZW1lbnRzLCBhbnkgb2Ygd2hpY2ggbWlnaHQgZGVmaW5lIGEgY3VzdG9tIGJpbmRpbmcgY29udGV4dCxcbiAgICAgICAgICAgIC8vICAgIGhlbmNlIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50IGlzIHRydWVcbiAgICAgICAgICAgIGFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzSW50ZXJuYWwoYmluZGluZ0NvbnRleHQsIG5vZGVWZXJpZmllZCwgLyogYmluZGluZ0NvbnRleHRzTWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQ6ICovICFpc0VsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGJvdW5kRWxlbWVudERvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcblxuXG4gICAgZnVuY3Rpb24gdG9wb2xvZ2ljYWxTb3J0QmluZGluZ3MoYmluZGluZ3MpIHtcbiAgICAgICAgLy8gRGVwdGgtZmlyc3Qgc29ydFxuICAgICAgICB2YXIgcmVzdWx0ID0gW10sICAgICAgICAgICAgICAgIC8vIFRoZSBsaXN0IG9mIGtleS9oYW5kbGVyIHBhaXJzIHRoYXQgd2Ugd2lsbCByZXR1cm5cbiAgICAgICAgICAgIGJpbmRpbmdzQ29uc2lkZXJlZCA9IHt9LCAgICAvLyBBIHRlbXBvcmFyeSByZWNvcmQgb2Ygd2hpY2ggYmluZGluZ3MgYXJlIGFscmVhZHkgaW4gJ3Jlc3VsdCdcbiAgICAgICAgICAgIGN5Y2xpY0RlcGVuZGVuY3lTdGFjayA9IFtdOyAvLyBLZWVwcyB0cmFjayBvZiBhIGRlcHRoLXNlYXJjaCBzbyB0aGF0LCBpZiB0aGVyZSdzIGEgY3ljbGUsIHdlIGtub3cgd2hpY2ggYmluZGluZ3MgY2F1c2VkIGl0XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goYmluZGluZ3MsIGZ1bmN0aW9uIHB1c2hCaW5kaW5nKGJpbmRpbmdLZXkpIHtcbiAgICAgICAgICAgIGlmICghYmluZGluZ3NDb25zaWRlcmVkW2JpbmRpbmdLZXldKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSBrb1snZ2V0QmluZGluZ0hhbmRsZXInXShiaW5kaW5nS2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoYmluZGluZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBGaXJzdCBhZGQgZGVwZW5kZW5jaWVzIChpZiBhbnkpIG9mIHRoZSBjdXJyZW50IGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdbJ2FmdGVyJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN5Y2xpY0RlcGVuZGVuY3lTdGFjay5wdXNoKGJpbmRpbmdLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGJpbmRpbmdbJ2FmdGVyJ10sIGZ1bmN0aW9uKGJpbmRpbmdEZXBlbmRlbmN5S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdzW2JpbmRpbmdEZXBlbmRlbmN5S2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoa28udXRpbHMuYXJyYXlJbmRleE9mKGN5Y2xpY0RlcGVuZGVuY3lTdGFjaywgYmluZGluZ0RlcGVuZGVuY3lLZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJDYW5ub3QgY29tYmluZSB0aGUgZm9sbG93aW5nIGJpbmRpbmdzLCBiZWNhdXNlIHRoZXkgaGF2ZSBhIGN5Y2xpYyBkZXBlbmRlbmN5OiBcIiArIGN5Y2xpY0RlcGVuZGVuY3lTdGFjay5qb2luKFwiLCBcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEJpbmRpbmcoYmluZGluZ0RlcGVuZGVuY3lLZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsaWNEZXBlbmRlbmN5U3RhY2subGVuZ3RoLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gTmV4dCBhZGQgdGhlIGN1cnJlbnQgYmluZGluZ1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7IGtleTogYmluZGluZ0tleSwgaGFuZGxlcjogYmluZGluZyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmluZGluZ3NDb25zaWRlcmVkW2JpbmRpbmdLZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBseUJpbmRpbmdzVG9Ob2RlSW50ZXJuYWwobm9kZSwgc291cmNlQmluZGluZ3MsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nQ29udGV4dE1heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIC8vIFByZXZlbnQgbXVsdGlwbGUgYXBwbHlCaW5kaW5ncyBjYWxscyBmb3IgdGhlIHNhbWUgbm9kZSwgZXhjZXB0IHdoZW4gYSBiaW5kaW5nIHZhbHVlIGlzIHNwZWNpZmllZFxuICAgICAgICB2YXIgYWxyZWFkeUJvdW5kID0ga28udXRpbHMuZG9tRGF0YS5nZXQobm9kZSwgYm91bmRFbGVtZW50RG9tRGF0YUtleSk7XG4gICAgICAgIGlmICghc291cmNlQmluZGluZ3MpIHtcbiAgICAgICAgICAgIGlmIChhbHJlYWR5Qm91bmQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIllvdSBjYW5ub3QgYXBwbHkgYmluZGluZ3MgbXVsdGlwbGUgdGltZXMgdG8gdGhlIHNhbWUgZWxlbWVudC5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChub2RlLCBib3VuZEVsZW1lbnREb21EYXRhS2V5LCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9wdGltaXphdGlvbjogRG9uJ3Qgc3RvcmUgdGhlIGJpbmRpbmcgY29udGV4dCBvbiB0aGlzIG5vZGUgaWYgaXQncyBkZWZpbml0ZWx5IHRoZSBzYW1lIGFzIG9uIG5vZGUucGFyZW50Tm9kZSwgYmVjYXVzZVxuICAgICAgICAvLyB3ZSBjYW4gZWFzaWx5IHJlY292ZXIgaXQganVzdCBieSBzY2FubmluZyB1cCB0aGUgbm9kZSdzIGFuY2VzdG9ycyBpbiB0aGUgRE9NXG4gICAgICAgIC8vIChub3RlOiBoZXJlLCBwYXJlbnQgbm9kZSBtZWFucyBcInJlYWwgRE9NIHBhcmVudFwiIG5vdCBcInZpcnR1YWwgcGFyZW50XCIsIGFzIHRoZXJlJ3Mgbm8gTygxKSB3YXkgdG8gZmluZCB0aGUgdmlydHVhbCBwYXJlbnQpXG4gICAgICAgIGlmICghYWxyZWFkeUJvdW5kICYmIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpXG4gICAgICAgICAgICBrby5zdG9yZWRCaW5kaW5nQ29udGV4dEZvck5vZGUobm9kZSwgYmluZGluZ0NvbnRleHQpO1xuXG4gICAgICAgIC8vIFVzZSBiaW5kaW5ncyBpZiBnaXZlbiwgb3RoZXJ3aXNlIGZhbGwgYmFjayBvbiBhc2tpbmcgdGhlIGJpbmRpbmdzIHByb3ZpZGVyIHRvIGdpdmUgdXMgc29tZSBiaW5kaW5nc1xuICAgICAgICB2YXIgYmluZGluZ3M7XG4gICAgICAgIGlmIChzb3VyY2VCaW5kaW5ncyAmJiB0eXBlb2Ygc291cmNlQmluZGluZ3MgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGJpbmRpbmdzID0gc291cmNlQmluZGluZ3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBrby5iaW5kaW5nUHJvdmlkZXJbJ2luc3RhbmNlJ10sXG4gICAgICAgICAgICAgICAgZ2V0QmluZGluZ3MgPSBwcm92aWRlclsnZ2V0QmluZGluZ0FjY2Vzc29ycyddIHx8IGdldEJpbmRpbmdzQW5kTWFrZUFjY2Vzc29ycztcblxuICAgICAgICAgICAgLy8gR2V0IHRoZSBiaW5kaW5nIGZyb20gdGhlIHByb3ZpZGVyIHdpdGhpbiBhIGNvbXB1dGVkIG9ic2VydmFibGUgc28gdGhhdCB3ZSBjYW4gdXBkYXRlIHRoZSBiaW5kaW5ncyB3aGVuZXZlclxuICAgICAgICAgICAgLy8gdGhlIGJpbmRpbmcgY29udGV4dCBpcyB1cGRhdGVkIG9yIGlmIHRoZSBiaW5kaW5nIHByb3ZpZGVyIGFjY2Vzc2VzIG9ic2VydmFibGVzLlxuICAgICAgICAgICAgdmFyIGJpbmRpbmdzVXBkYXRlciA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUoXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzID0gc291cmNlQmluZGluZ3MgPyBzb3VyY2VCaW5kaW5ncyhiaW5kaW5nQ29udGV4dCwgbm9kZSkgOiBnZXRCaW5kaW5ncy5jYWxsKHByb3ZpZGVyLCBub2RlLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGEgZGVwZW5kZW5jeSBvbiB0aGUgYmluZGluZyBjb250ZXh0IHRvIHN1cHBvcnQgb2JzZXZhYmxlIHZpZXcgbW9kZWxzLlxuICAgICAgICAgICAgICAgICAgICBpZiAoYmluZGluZ3MgJiYgYmluZGluZ0NvbnRleHQuX3N1YnNjcmliYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdDb250ZXh0Ll9zdWJzY3JpYmFibGUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmdzO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IG5vZGUgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCFiaW5kaW5ncyB8fCAhYmluZGluZ3NVcGRhdGVyLmlzQWN0aXZlKCkpXG4gICAgICAgICAgICAgICAgYmluZGluZ3NVcGRhdGVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncztcbiAgICAgICAgaWYgKGJpbmRpbmdzKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gdGhlIHZhbHVlIGFjY2Vzc29yIGZvciBhIGdpdmVuIGJpbmRpbmcuIFdoZW4gYmluZGluZ3MgYXJlIHN0YXRpYyAod29uJ3QgYmUgdXBkYXRlZCBiZWNhdXNlIG9mIGEgYmluZGluZ1xuICAgICAgICAgICAgLy8gY29udGV4dCB1cGRhdGUpLCBqdXN0IHJldHVybiB0aGUgdmFsdWUgYWNjZXNzb3IgZnJvbSB0aGUgYmluZGluZy4gT3RoZXJ3aXNlLCByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGFsd2F5cyBnZXRzXG4gICAgICAgICAgICAvLyB0aGUgbGF0ZXN0IGJpbmRpbmcgdmFsdWUgYW5kIHJlZ2lzdGVycyBhIGRlcGVuZGVuY3kgb24gdGhlIGJpbmRpbmcgdXBkYXRlci5cbiAgICAgICAgICAgIHZhciBnZXRWYWx1ZUFjY2Vzc29yID0gYmluZGluZ3NVcGRhdGVyXG4gICAgICAgICAgICAgICAgPyBmdW5jdGlvbihiaW5kaW5nS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBldmFsdWF0ZVZhbHVlQWNjZXNzb3IoYmluZGluZ3NVcGRhdGVyKClbYmluZGluZ0tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gOiBmdW5jdGlvbihiaW5kaW5nS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5nc1tiaW5kaW5nS2V5XTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBVc2Ugb2YgYWxsQmluZGluZ3MgYXMgYSBmdW5jdGlvbiBpcyBtYWludGFpbmVkIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgYnV0IGl0cyB1c2UgaXMgZGVwcmVjYXRlZFxuICAgICAgICAgICAgZnVuY3Rpb24gYWxsQmluZGluZ3MoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm9iamVjdE1hcChiaW5kaW5nc1VwZGF0ZXIgPyBiaW5kaW5nc1VwZGF0ZXIoKSA6IGJpbmRpbmdzLCBldmFsdWF0ZVZhbHVlQWNjZXNzb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBpcyB0aGUgMy54IGFsbEJpbmRpbmdzIEFQSVxuICAgICAgICAgICAgYWxsQmluZGluZ3NbJ2dldCddID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmdzW2tleV0gJiYgZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKGdldFZhbHVlQWNjZXNzb3Ioa2V5KSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYWxsQmluZGluZ3NbJ2hhcyddID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleSBpbiBiaW5kaW5ncztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHB1dCB0aGUgYmluZGluZ3MgaW50byB0aGUgcmlnaHQgb3JkZXJcbiAgICAgICAgICAgIHZhciBvcmRlcmVkQmluZGluZ3MgPSB0b3BvbG9naWNhbFNvcnRCaW5kaW5ncyhiaW5kaW5ncyk7XG5cbiAgICAgICAgICAgIC8vIEdvIHRocm91Z2ggdGhlIHNvcnRlZCBiaW5kaW5ncywgY2FsbGluZyBpbml0IGFuZCB1cGRhdGUgZm9yIGVhY2hcbiAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChvcmRlcmVkQmluZGluZ3MsIGZ1bmN0aW9uKGJpbmRpbmdLZXlBbmRIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRvcG9sb2dpY2FsU29ydEJpbmRpbmdzIGhhcyBhbHJlYWR5IGZpbHRlcmVkIG91dCBhbnkgbm9uZXhpc3RlbnQgYmluZGluZyBoYW5kbGVycyxcbiAgICAgICAgICAgICAgICAvLyBzbyBiaW5kaW5nS2V5QW5kSGFuZGxlci5oYW5kbGVyIHdpbGwgYWx3YXlzIGJlIG5vbm51bGwuXG4gICAgICAgICAgICAgICAgdmFyIGhhbmRsZXJJbml0Rm4gPSBiaW5kaW5nS2V5QW5kSGFuZGxlci5oYW5kbGVyW1wiaW5pdFwiXSxcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlclVwZGF0ZUZuID0gYmluZGluZ0tleUFuZEhhbmRsZXIuaGFuZGxlcltcInVwZGF0ZVwiXSxcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ0tleSA9IGJpbmRpbmdLZXlBbmRIYW5kbGVyLmtleTtcblxuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlVGhhdEJpbmRpbmdJc0FsbG93ZWRGb3JWaXJ0dWFsRWxlbWVudHMoYmluZGluZ0tleSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIGluaXQsIGlnbm9yaW5nIGFueSBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVySW5pdEZuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluaXRSZXN1bHQgPSBoYW5kbGVySW5pdEZuKG5vZGUsIGdldFZhbHVlQWNjZXNzb3IoYmluZGluZ0tleSksIGFsbEJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dFsnJGRhdGEnXSwgYmluZGluZ0NvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBiaW5kaW5nIGhhbmRsZXIgY2xhaW1zIHRvIGNvbnRyb2wgZGVzY2VuZGFudCBiaW5kaW5ncywgbWFrZSBhIG5vdGUgb2YgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbml0UmVzdWx0ICYmIGluaXRSZXN1bHRbJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdIYW5kbGVyVGhhdENvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdWx0aXBsZSBiaW5kaW5ncyAoXCIgKyBiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyArIFwiIGFuZCBcIiArIGJpbmRpbmdLZXkgKyBcIikgYXJlIHRyeWluZyB0byBjb250cm9sIGRlc2NlbmRhbnQgYmluZGluZ3Mgb2YgdGhlIHNhbWUgZWxlbWVudC4gWW91IGNhbm5vdCB1c2UgdGhlc2UgYmluZGluZ3MgdG9nZXRoZXIgb24gdGhlIHNhbWUgZWxlbWVudC5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRpbmdIYW5kbGVyVGhhdENvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzID0gYmluZGluZ0tleTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biB1cGRhdGUgaW4gaXRzIG93biBjb21wdXRlZCB3cmFwcGVyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlclVwZGF0ZUZuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAga28uZGVwZW5kZW50T2JzZXJ2YWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlclVwZGF0ZUZuKG5vZGUsIGdldFZhbHVlQWNjZXNzb3IoYmluZGluZ0tleSksIGFsbEJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dFsnJGRhdGEnXSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogbm9kZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgZXgubWVzc2FnZSA9IFwiVW5hYmxlIHRvIHByb2Nlc3MgYmluZGluZyBcXFwiXCIgKyBiaW5kaW5nS2V5ICsgXCI6IFwiICsgYmluZGluZ3NbYmluZGluZ0tleV0gKyBcIlxcXCJcXG5NZXNzYWdlOiBcIiArIGV4Lm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdzaG91bGRCaW5kRGVzY2VuZGFudHMnOiBiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyA9PT0gdW5kZWZpbmVkXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIHZhciBzdG9yZWRCaW5kaW5nQ29udGV4dERvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICBrby5zdG9yZWRCaW5kaW5nQ29udGV4dEZvck5vZGUgPSBmdW5jdGlvbiAobm9kZSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQobm9kZSwgc3RvcmVkQmluZGluZ0NvbnRleHREb21EYXRhS2V5LCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICBpZiAoYmluZGluZ0NvbnRleHQuX3N1YnNjcmliYWJsZSlcbiAgICAgICAgICAgICAgICBiaW5kaW5nQ29udGV4dC5fc3Vic2NyaWJhYmxlLl9hZGROb2RlKG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmRvbURhdGEuZ2V0KG5vZGUsIHN0b3JlZEJpbmRpbmdDb250ZXh0RG9tRGF0YUtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0ICYmICh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0IGluc3RhbmNlb2Yga28uYmluZGluZ0NvbnRleHQpXG4gICAgICAgICAgICA/IHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHRcbiAgICAgICAgICAgIDogbmV3IGtvLmJpbmRpbmdDb250ZXh0KHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpO1xuICAgIH1cblxuICAgIGtvLmFwcGx5QmluZGluZ0FjY2Vzc29yc1RvTm9kZSA9IGZ1bmN0aW9uIChub2RlLCBiaW5kaW5ncywgdmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCkge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkgLy8gSWYgaXQncyBhbiBlbGVtZW50LCB3b3JrYXJvdW5kIElFIDw9IDggSFRNTCBwYXJzaW5nIHdlaXJkbmVzc1xuICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLm5vcm1hbGlzZVZpcnR1YWxFbGVtZW50RG9tU3RydWN0dXJlKG5vZGUpO1xuICAgICAgICByZXR1cm4gYXBwbHlCaW5kaW5nc1RvTm9kZUludGVybmFsKG5vZGUsIGJpbmRpbmdzLCBnZXRCaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIGtvLmFwcGx5QmluZGluZ3NUb05vZGUgPSBmdW5jdGlvbiAobm9kZSwgYmluZGluZ3MsIHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBnZXRCaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGtvLmFwcGx5QmluZGluZ0FjY2Vzc29yc1RvTm9kZShub2RlLCBtYWtlQmluZGluZ0FjY2Vzc29ycyhiaW5kaW5ncywgY29udGV4dCwgbm9kZSksIGNvbnRleHQpO1xuICAgIH07XG5cbiAgICBrby5hcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50cyA9IGZ1bmN0aW9uKHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQsIHJvb3ROb2RlKSB7XG4gICAgICAgIGlmIChyb290Tm9kZS5ub2RlVHlwZSA9PT0gMSB8fCByb290Tm9kZS5ub2RlVHlwZSA9PT0gOClcbiAgICAgICAgICAgIGFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzSW50ZXJuYWwoZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCksIHJvb3ROb2RlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAga28uYXBwbHlCaW5kaW5ncyA9IGZ1bmN0aW9uICh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0LCByb290Tm9kZSkge1xuICAgICAgICAvLyBJZiBqUXVlcnkgaXMgbG9hZGVkIGFmdGVyIEtub2Nrb3V0LCB3ZSB3b24ndCBpbml0aWFsbHkgaGF2ZSBhY2Nlc3MgdG8gaXQuIFNvIHNhdmUgaXQgaGVyZS5cbiAgICAgICAgaWYgKCFqUXVlcnkgJiYgd2luZG93WydqUXVlcnknXSkge1xuICAgICAgICAgICAgalF1ZXJ5ID0gd2luZG93WydqUXVlcnknXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyb290Tm9kZSAmJiAocm9vdE5vZGUubm9kZVR5cGUgIT09IDEpICYmIChyb290Tm9kZS5ub2RlVHlwZSAhPT0gOCkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJrby5hcHBseUJpbmRpbmdzOiBmaXJzdCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHlvdXIgdmlldyBtb2RlbDsgc2Vjb25kIHBhcmFtZXRlciBzaG91bGQgYmUgYSBET00gbm9kZVwiKTtcbiAgICAgICAgcm9vdE5vZGUgPSByb290Tm9kZSB8fCB3aW5kb3cuZG9jdW1lbnQuYm9keTsgLy8gTWFrZSBcInJvb3ROb2RlXCIgcGFyYW1ldGVyIG9wdGlvbmFsXG5cbiAgICAgICAgYXBwbHlCaW5kaW5nc1RvTm9kZUFuZERlc2NlbmRhbnRzSW50ZXJuYWwoZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCksIHJvb3ROb2RlLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgLy8gUmV0cmlldmluZyBiaW5kaW5nIGNvbnRleHQgZnJvbSBhcmJpdHJhcnkgbm9kZXNcbiAgICBrby5jb250ZXh0Rm9yID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAvLyBXZSBjYW4gb25seSBkbyBzb21ldGhpbmcgbWVhbmluZ2Z1bCBmb3IgZWxlbWVudHMgYW5kIGNvbW1lbnQgbm9kZXMgKGluIHBhcnRpY3VsYXIsIG5vdCB0ZXh0IG5vZGVzLCBhcyBJRSBjYW4ndCBzdG9yZSBkb21kYXRhIGZvciB0aGVtKVxuICAgICAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IGtvLnN0b3JlZEJpbmRpbmdDb250ZXh0Rm9yTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dCkgcmV0dXJuIGNvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkgcmV0dXJuIGtvLmNvbnRleHRGb3Iobm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG4gICAga28uZGF0YUZvciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBrby5jb250ZXh0Rm9yKG5vZGUpO1xuICAgICAgICByZXR1cm4gY29udGV4dCA/IGNvbnRleHRbJyRkYXRhJ10gOiB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIGtvLmV4cG9ydFN5bWJvbCgnYmluZGluZ0hhbmRsZXJzJywga28uYmluZGluZ0hhbmRsZXJzKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2FwcGx5QmluZGluZ3MnLCBrby5hcHBseUJpbmRpbmdzKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2FwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzJywga28uYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHMpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgnYXBwbHlCaW5kaW5nQWNjZXNzb3JzVG9Ob2RlJywga28uYXBwbHlCaW5kaW5nQWNjZXNzb3JzVG9Ob2RlKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2FwcGx5QmluZGluZ3NUb05vZGUnLCBrby5hcHBseUJpbmRpbmdzVG9Ob2RlKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2NvbnRleHRGb3InLCBrby5jb250ZXh0Rm9yKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2RhdGFGb3InLCBrby5kYXRhRm9yKTtcbn0pKCk7XG52YXIgYXR0ckh0bWxUb0phdmFzY3JpcHRNYXAgPSB7ICdjbGFzcyc6ICdjbGFzc05hbWUnLCAnZm9yJzogJ2h0bWxGb3InIH07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ2F0dHInXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpIHx8IHt9O1xuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKHZhbHVlLCBmdW5jdGlvbihhdHRyTmFtZSwgYXR0clZhbHVlKSB7XG4gICAgICAgICAgICBhdHRyVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGF0dHJWYWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIFRvIGNvdmVyIGNhc2VzIGxpa2UgXCJhdHRyOiB7IGNoZWNrZWQ6c29tZVByb3AgfVwiLCB3ZSB3YW50IHRvIHJlbW92ZSB0aGUgYXR0cmlidXRlIGVudGlyZWx5XG4gICAgICAgICAgICAvLyB3aGVuIHNvbWVQcm9wIGlzIGEgXCJubyB2YWx1ZVwiLWxpa2UgdmFsdWUgKHN0cmljdGx5IG51bGwsIGZhbHNlLCBvciB1bmRlZmluZWQpXG4gICAgICAgICAgICAvLyAoYmVjYXVzZSB0aGUgYWJzZW5jZSBvZiB0aGUgXCJjaGVja2VkXCIgYXR0ciBpcyBob3cgdG8gbWFyayBhbiBlbGVtZW50IGFzIG5vdCBjaGVja2VkLCBldGMuKVxuICAgICAgICAgICAgdmFyIHRvUmVtb3ZlID0gKGF0dHJWYWx1ZSA9PT0gZmFsc2UpIHx8IChhdHRyVmFsdWUgPT09IG51bGwpIHx8IChhdHRyVmFsdWUgPT09IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICBpZiAodG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuXG4gICAgICAgICAgICAvLyBJbiBJRSA8PSA3IGFuZCBJRTggUXVpcmtzIE1vZGUsIHlvdSBoYXZlIHRvIHVzZSB0aGUgSmF2YXNjcmlwdCBwcm9wZXJ0eSBuYW1lIGluc3RlYWQgb2YgdGhlXG4gICAgICAgICAgICAvLyBIVE1MIGF0dHJpYnV0ZSBuYW1lIGZvciBjZXJ0YWluIGF0dHJpYnV0ZXMuIElFOCBTdGFuZGFyZHMgTW9kZSBzdXBwb3J0cyB0aGUgY29ycmVjdCBiZWhhdmlvcixcbiAgICAgICAgICAgIC8vIGJ1dCBpbnN0ZWFkIG9mIGZpZ3VyaW5nIG91dCB0aGUgbW9kZSwgd2UnbGwganVzdCBzZXQgdGhlIGF0dHJpYnV0ZSB0aHJvdWdoIHRoZSBKYXZhc2NyaXB0XG4gICAgICAgICAgICAvLyBwcm9wZXJ0eSBmb3IgSUUgPD0gOC5cbiAgICAgICAgICAgIGlmIChrby51dGlscy5pZVZlcnNpb24gPD0gOCAmJiBhdHRyTmFtZSBpbiBhdHRySHRtbFRvSmF2YXNjcmlwdE1hcCkge1xuICAgICAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ckh0bWxUb0phdmFzY3JpcHRNYXBbYXR0ck5hbWVdO1xuICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZSlcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudFthdHRyTmFtZV0gPSBhdHRyVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0b1JlbW92ZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRyZWF0IFwibmFtZVwiIHNwZWNpYWxseSAtIGFsdGhvdWdoIHlvdSBjYW4gdGhpbmsgb2YgaXQgYXMgYW4gYXR0cmlidXRlLCBpdCBhbHNvIG5lZWRzXG4gICAgICAgICAgICAvLyBzcGVjaWFsIGhhbmRsaW5nIG9uIG9sZGVyIHZlcnNpb25zIG9mIElFIChodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvcHVsbC8zMzMpXG4gICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgYmVpbmcgY2FzZS1zZW5zaXRpdmUgaGVyZSBiZWNhdXNlIFhIVE1MIHdvdWxkIHJlZ2FyZCBcIk5hbWVcIiBhcyBhIGRpZmZlcmVudCB0aGluZ1xuICAgICAgICAgICAgLy8gZW50aXJlbHksIGFuZCB0aGVyZSdzIG5vIHN0cm9uZyByZWFzb24gdG8gYWxsb3cgZm9yIHN1Y2ggY2FzaW5nIGluIEhUTUwuXG4gICAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09IFwibmFtZVwiKSB7XG4gICAgICAgICAgICAgICAga28udXRpbHMuc2V0RWxlbWVudE5hbWUoZWxlbWVudCwgdG9SZW1vdmUgPyBcIlwiIDogYXR0clZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuKGZ1bmN0aW9uKCkge1xuXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2NoZWNrZWQnXSA9IHtcbiAgICAnYWZ0ZXInOiBbJ3ZhbHVlJywgJ2F0dHInXSxcbiAgICAnaW5pdCc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICBmdW5jdGlvbiBjaGVja2VkVmFsdWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gYWxsQmluZGluZ3NbJ2hhcyddKCdjaGVja2VkVmFsdWUnKVxuICAgICAgICAgICAgICAgID8ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhbGxCaW5kaW5ncy5nZXQoJ2NoZWNrZWRWYWx1ZScpKVxuICAgICAgICAgICAgICAgIDogZWxlbWVudC52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsKCkge1xuICAgICAgICAgICAgLy8gVGhpcyB1cGRhdGVzIHRoZSBtb2RlbCB2YWx1ZSBmcm9tIHRoZSB2aWV3IHZhbHVlLlxuICAgICAgICAgICAgLy8gSXQgcnVucyBpbiByZXNwb25zZSB0byBET00gZXZlbnRzIChjbGljaykgYW5kIGNoYW5nZXMgaW4gY2hlY2tlZFZhbHVlLlxuICAgICAgICAgICAgdmFyIGlzQ2hlY2tlZCA9IGVsZW1lbnQuY2hlY2tlZCxcbiAgICAgICAgICAgICAgICBlbGVtVmFsdWUgPSB1c2VDaGVja2VkVmFsdWUgPyBjaGVja2VkVmFsdWUoKSA6IGlzQ2hlY2tlZDtcblxuICAgICAgICAgICAgLy8gV2hlbiB3ZSdyZSBmaXJzdCBzZXR0aW5nIHVwIHRoaXMgY29tcHV0ZWQsIGRvbid0IGNoYW5nZSBhbnkgbW9kZWwgc3RhdGUuXG4gICAgICAgICAgICBpZiAoa28uY29tcHV0ZWRDb250ZXh0LmlzSW5pdGlhbCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZSBjYW4gaWdub3JlIHVuY2hlY2tlZCByYWRpbyBidXR0b25zLCBiZWNhdXNlIHNvbWUgb3RoZXIgcmFkaW9cbiAgICAgICAgICAgIC8vIGJ1dHRvbiB3aWxsIGJlIGdldHRpbmcgY2hlY2tlZCwgYW5kIHRoYXQgb25lIGNhbiB0YWtlIGNhcmUgb2YgdXBkYXRpbmcgc3RhdGUuXG4gICAgICAgICAgICBpZiAoaXNSYWRpbyAmJiAhaXNDaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKHZhbHVlQWNjZXNzb3IpO1xuICAgICAgICAgICAgaWYgKGlzVmFsdWVBcnJheSkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRFbGVtVmFsdWUgIT09IGVsZW1WYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHdlJ3JlIHJlc3BvbmRpbmcgdG8gdGhlIGNoZWNrZWRWYWx1ZSBjaGFuZ2luZywgYW5kIHRoZSBlbGVtZW50IGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIGN1cnJlbnRseSBjaGVja2VkLCByZXBsYWNlIHRoZSBvbGQgZWxlbSB2YWx1ZSB3aXRoIHRoZSBuZXcgZWxlbSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBpbiB0aGUgbW9kZWwgYXJyYXkuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbShtb2RlbFZhbHVlLCBlbGVtVmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYWRkT3JSZW1vdmVJdGVtKG1vZGVsVmFsdWUsIG9sZEVsZW1WYWx1ZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb2xkRWxlbVZhbHVlID0gZWxlbVZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gd2UncmUgcmVzcG9uZGluZyB0byB0aGUgdXNlciBoYXZpbmcgY2hlY2tlZC91bmNoZWNrZWQgYSBjaGVja2JveCxcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkL3JlbW92ZSB0aGUgZWxlbWVudCB2YWx1ZSB0byB0aGUgbW9kZWwgYXJyYXkuXG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbShtb2RlbFZhbHVlLCBlbGVtVmFsdWUsIGlzQ2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLndyaXRlVmFsdWVUb1Byb3BlcnR5KG1vZGVsVmFsdWUsIGFsbEJpbmRpbmdzLCAnY2hlY2tlZCcsIGVsZW1WYWx1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgdXBkYXRlcyB0aGUgdmlldyB2YWx1ZSBmcm9tIHRoZSBtb2RlbCB2YWx1ZS5cbiAgICAgICAgICAgIC8vIEl0IHJ1bnMgaW4gcmVzcG9uc2UgdG8gY2hhbmdlcyBpbiB0aGUgYm91bmQgKGNoZWNrZWQpIHZhbHVlLlxuICAgICAgICAgICAgdmFyIG1vZGVsVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG5cbiAgICAgICAgICAgIGlmIChpc1ZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGEgY2hlY2tib3ggaXMgYm91bmQgdG8gYW4gYXJyYXksIGJlaW5nIGNoZWNrZWQgcmVwcmVzZW50cyBpdHMgdmFsdWUgYmVpbmcgcHJlc2VudCBpbiB0aGF0IGFycmF5XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0ga28udXRpbHMuYXJyYXlJbmRleE9mKG1vZGVsVmFsdWUsIGNoZWNrZWRWYWx1ZSgpKSA+PSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0NoZWNrYm94KSB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiBhIGNoZWNrYm94IGlzIGJvdW5kIHRvIGFueSBvdGhlciB2YWx1ZSAobm90IGFuIGFycmF5KSwgYmVpbmcgY2hlY2tlZCByZXByZXNlbnRzIHRoZSB2YWx1ZSBiZWluZyB0cnVlaXNoXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gbW9kZWxWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIHJhZGlvIGJ1dHRvbnMsIGJlaW5nIGNoZWNrZWQgbWVhbnMgdGhhdCB0aGUgcmFkaW8gYnV0dG9uJ3MgdmFsdWUgY29ycmVzcG9uZHMgdG8gdGhlIG1vZGVsIHZhbHVlXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gKGNoZWNrZWRWYWx1ZSgpID09PSBtb2RlbFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaXNDaGVja2JveCA9IGVsZW1lbnQudHlwZSA9PSBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICBpc1JhZGlvID0gZWxlbWVudC50eXBlID09IFwicmFkaW9cIjtcblxuICAgICAgICAvLyBPbmx5IGJpbmQgdG8gY2hlY2sgYm94ZXMgYW5kIHJhZGlvIGJ1dHRvbnNcbiAgICAgICAgaWYgKCFpc0NoZWNrYm94ICYmICFpc1JhZGlvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXNWYWx1ZUFycmF5ID0gaXNDaGVja2JveCAmJiAoa28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpIGluc3RhbmNlb2YgQXJyYXkpLFxuICAgICAgICAgICAgb2xkRWxlbVZhbHVlID0gaXNWYWx1ZUFycmF5ID8gY2hlY2tlZFZhbHVlKCkgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB1c2VDaGVja2VkVmFsdWUgPSBpc1JhZGlvIHx8IGlzVmFsdWVBcnJheTtcblxuICAgICAgICAvLyBJRSA2IHdvbid0IGFsbG93IHJhZGlvIGJ1dHRvbnMgdG8gYmUgc2VsZWN0ZWQgdW5sZXNzIHRoZXkgaGF2ZSBhIG5hbWVcbiAgICAgICAgaWYgKGlzUmFkaW8gJiYgIWVsZW1lbnQubmFtZSlcbiAgICAgICAgICAgIGtvLmJpbmRpbmdIYW5kbGVyc1sndW5pcXVlTmFtZSddWydpbml0J10oZWxlbWVudCwgZnVuY3Rpb24oKSB7IHJldHVybiB0cnVlIH0pO1xuXG4gICAgICAgIC8vIFNldCB1cCB0d28gY29tcHV0ZWRzIHRvIHVwZGF0ZSB0aGUgYmluZGluZzpcblxuICAgICAgICAvLyBUaGUgZmlyc3QgcmVzcG9uZHMgdG8gY2hhbmdlcyBpbiB0aGUgY2hlY2tlZFZhbHVlIHZhbHVlIGFuZCB0byBlbGVtZW50IGNsaWNrc1xuICAgICAgICBrby5jb21wdXRlZCh1cGRhdGVNb2RlbCwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGVsZW1lbnQgfSk7XG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiY2xpY2tcIiwgdXBkYXRlTW9kZWwpO1xuXG4gICAgICAgIC8vIFRoZSBzZWNvbmQgcmVzcG9uZHMgdG8gY2hhbmdlcyBpbiB0aGUgbW9kZWwgdmFsdWUgKHRoZSBvbmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjaGVja2VkIGJpbmRpbmcpXG4gICAgICAgIGtvLmNvbXB1dGVkKHVwZGF0ZVZpZXcsIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtZW50IH0pO1xuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWydjaGVja2VkJ10gPSB0cnVlO1xuXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2NoZWNrZWRWYWx1ZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICBlbGVtZW50LnZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgIH1cbn07XG5cbn0pKCk7dmFyIGNsYXNzZXNXcml0dGVuQnlCaW5kaW5nS2V5ID0gJ19fa29fX2Nzc1ZhbHVlJztcbmtvLmJpbmRpbmdIYW5kbGVyc1snY3NzJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKHZhbHVlLCBmdW5jdGlvbihjbGFzc05hbWUsIHNob3VsZEhhdmVDbGFzcykge1xuICAgICAgICAgICAgICAgIHNob3VsZEhhdmVDbGFzcyA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoc2hvdWxkSGF2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICBrby51dGlscy50b2dnbGVEb21Ob2RlQ3NzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lLCBzaG91bGRIYXZlQ2xhc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSB8fCAnJyk7IC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCB0cnkgdG8gc3RvcmUgb3Igc2V0IGEgbm9uLXN0cmluZyB2YWx1ZVxuICAgICAgICAgICAga28udXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzKGVsZW1lbnQsIGVsZW1lbnRbY2xhc3Nlc1dyaXR0ZW5CeUJpbmRpbmdLZXldLCBmYWxzZSk7XG4gICAgICAgICAgICBlbGVtZW50W2NsYXNzZXNXcml0dGVuQnlCaW5kaW5nS2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAga28udXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzKGVsZW1lbnQsIHZhbHVlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ2VuYWJsZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIGlmICh2YWx1ZSAmJiBlbGVtZW50LmRpc2FibGVkKVxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgZWxzZSBpZiAoKCF2YWx1ZSkgJiYgKCFlbGVtZW50LmRpc2FibGVkKSlcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1snZGlzYWJsZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICBrby5iaW5kaW5nSGFuZGxlcnNbJ2VuYWJsZSddWyd1cGRhdGUnXShlbGVtZW50LCBmdW5jdGlvbigpIHsgcmV0dXJuICFrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSkgfSk7XG4gICAgfVxufTtcbi8vIEZvciBjZXJ0YWluIGNvbW1vbiBldmVudHMgKGN1cnJlbnRseSBqdXN0ICdjbGljaycpLCBhbGxvdyBhIHNpbXBsaWZpZWQgZGF0YS1iaW5kaW5nIHN5bnRheFxuLy8gZS5nLiBjbGljazpoYW5kbGVyIGluc3RlYWQgb2YgdGhlIHVzdWFsIGZ1bGwtbGVuZ3RoIGV2ZW50OntjbGljazpoYW5kbGVyfVxuZnVuY3Rpb24gbWFrZUV2ZW50SGFuZGxlclNob3J0Y3V0KGV2ZW50TmFtZSkge1xuICAgIGtvLmJpbmRpbmdIYW5kbGVyc1tldmVudE5hbWVdID0ge1xuICAgICAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWVBY2Nlc3NvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgICAgICAgICAgcmVzdWx0W2V2ZW50TmFtZV0gPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ga28uYmluZGluZ0hhbmRsZXJzWydldmVudCddWydpbml0J10uY2FsbCh0aGlzLCBlbGVtZW50LCBuZXdWYWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1snZXZlbnQnXSA9IHtcbiAgICAnaW5pdCcgOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgdmFyIGV2ZW50c1RvSGFuZGxlID0gdmFsdWVBY2Nlc3NvcigpIHx8IHt9O1xuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKGV2ZW50c1RvSGFuZGxlLCBmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXZlbnROYW1lID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBldmVudE5hbWUsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGFuZGxlclJldHVyblZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGFuZGxlckZ1bmN0aW9uID0gdmFsdWVBY2Nlc3NvcigpW2V2ZW50TmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghaGFuZGxlckZ1bmN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUYWtlIGFsbCB0aGUgZXZlbnQgYXJncywgYW5kIHByZWZpeCB3aXRoIHRoZSB2aWV3bW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcmdzRm9ySGFuZGxlciA9IGtvLnV0aWxzLm1ha2VBcnJheShhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlld01vZGVsID0gYmluZGluZ0NvbnRleHRbJyRkYXRhJ107XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzRm9ySGFuZGxlci51bnNoaWZ0KHZpZXdNb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyUmV0dXJuVmFsdWUgPSBoYW5kbGVyRnVuY3Rpb24uYXBwbHkodmlld01vZGVsLCBhcmdzRm9ySGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFuZGxlclJldHVyblZhbHVlICE9PSB0cnVlKSB7IC8vIE5vcm1hbGx5IHdlIHdhbnQgdG8gcHJldmVudCBkZWZhdWx0IGFjdGlvbi4gRGV2ZWxvcGVyIGNhbiBvdmVycmlkZSB0aGlzIGJlIGV4cGxpY2l0bHkgcmV0dXJuaW5nIHRydWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBidWJibGUgPSBhbGxCaW5kaW5ncy5nZXQoZXZlbnROYW1lICsgJ0J1YmJsZScpICE9PSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFidWJibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG4vLyBcImZvcmVhY2g6IHNvbWVFeHByZXNzaW9uXCIgaXMgZXF1aXZhbGVudCB0byBcInRlbXBsYXRlOiB7IGZvcmVhY2g6IHNvbWVFeHByZXNzaW9uIH1cIlxuLy8gXCJmb3JlYWNoOiB7IGRhdGE6IHNvbWVFeHByZXNzaW9uLCBhZnRlckFkZDogbXlmbiB9XCIgaXMgZXF1aXZhbGVudCB0byBcInRlbXBsYXRlOiB7IGZvcmVhY2g6IHNvbWVFeHByZXNzaW9uLCBhZnRlckFkZDogbXlmbiB9XCJcbmtvLmJpbmRpbmdIYW5kbGVyc1snZm9yZWFjaCddID0ge1xuICAgIG1ha2VUZW1wbGF0ZVZhbHVlQWNjZXNzb3I6IGZ1bmN0aW9uKHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG1vZGVsVmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCksXG4gICAgICAgICAgICAgICAgdW53cmFwcGVkVmFsdWUgPSBrby51dGlscy5wZWVrT2JzZXJ2YWJsZShtb2RlbFZhbHVlKTsgICAgLy8gVW53cmFwIHdpdGhvdXQgc2V0dGluZyBhIGRlcGVuZGVuY3kgaGVyZVxuXG4gICAgICAgICAgICAvLyBJZiB1bndyYXBwZWRWYWx1ZSBpcyB0aGUgYXJyYXksIHBhc3MgaW4gdGhlIHdyYXBwZWQgdmFsdWUgb24gaXRzIG93blxuICAgICAgICAgICAgLy8gVGhlIHZhbHVlIHdpbGwgYmUgdW53cmFwcGVkIGFuZCB0cmFja2VkIHdpdGhpbiB0aGUgdGVtcGxhdGUgYmluZGluZ1xuICAgICAgICAgICAgLy8gKFNlZSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzUyMylcbiAgICAgICAgICAgIGlmICgoIXVud3JhcHBlZFZhbHVlKSB8fCB0eXBlb2YgdW53cmFwcGVkVmFsdWUubGVuZ3RoID09IFwibnVtYmVyXCIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgJ2ZvcmVhY2gnOiBtb2RlbFZhbHVlLCAndGVtcGxhdGVFbmdpbmUnOiBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5pbnN0YW5jZSB9O1xuXG4gICAgICAgICAgICAvLyBJZiB1bndyYXBwZWRWYWx1ZS5kYXRhIGlzIHRoZSBhcnJheSwgcHJlc2VydmUgYWxsIHJlbGV2YW50IG9wdGlvbnMgYW5kIHVud3JhcCBhZ2FpbiB2YWx1ZSBzbyB3ZSBnZXQgdXBkYXRlc1xuICAgICAgICAgICAga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShtb2RlbFZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2ZvcmVhY2gnOiB1bndyYXBwZWRWYWx1ZVsnZGF0YSddLFxuICAgICAgICAgICAgICAgICdhcyc6IHVud3JhcHBlZFZhbHVlWydhcyddLFxuICAgICAgICAgICAgICAgICdpbmNsdWRlRGVzdHJveWVkJzogdW53cmFwcGVkVmFsdWVbJ2luY2x1ZGVEZXN0cm95ZWQnXSxcbiAgICAgICAgICAgICAgICAnYWZ0ZXJBZGQnOiB1bndyYXBwZWRWYWx1ZVsnYWZ0ZXJBZGQnXSxcbiAgICAgICAgICAgICAgICAnYmVmb3JlUmVtb3ZlJzogdW53cmFwcGVkVmFsdWVbJ2JlZm9yZVJlbW92ZSddLFxuICAgICAgICAgICAgICAgICdhZnRlclJlbmRlcic6IHVud3JhcHBlZFZhbHVlWydhZnRlclJlbmRlciddLFxuICAgICAgICAgICAgICAgICdiZWZvcmVNb3ZlJzogdW53cmFwcGVkVmFsdWVbJ2JlZm9yZU1vdmUnXSxcbiAgICAgICAgICAgICAgICAnYWZ0ZXJNb3ZlJzogdW53cmFwcGVkVmFsdWVbJ2FmdGVyTW92ZSddLFxuICAgICAgICAgICAgICAgICd0ZW1wbGF0ZUVuZ2luZSc6IGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLmluc3RhbmNlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0sXG4gICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICByZXR1cm4ga28uYmluZGluZ0hhbmRsZXJzWyd0ZW1wbGF0ZSddWydpbml0J10oZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzWydmb3JlYWNoJ10ubWFrZVRlbXBsYXRlVmFsdWVBY2Nlc3Nvcih2YWx1ZUFjY2Vzc29yKSk7XG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIGtvLmJpbmRpbmdIYW5kbGVyc1sndGVtcGxhdGUnXVsndXBkYXRlJ10oZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzWydmb3JlYWNoJ10ubWFrZVRlbXBsYXRlVmFsdWVBY2Nlc3Nvcih2YWx1ZUFjY2Vzc29yKSwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpO1xuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9yc1snZm9yZWFjaCddID0gZmFsc2U7IC8vIENhbid0IHJld3JpdGUgY29udHJvbCBmbG93IGJpbmRpbmdzXG5rby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzWydmb3JlYWNoJ10gPSB0cnVlO1xudmFyIGhhc2ZvY3VzVXBkYXRpbmdQcm9wZXJ0eSA9ICdfX2tvX2hhc2ZvY3VzVXBkYXRpbmcnO1xudmFyIGhhc2ZvY3VzTGFzdFZhbHVlID0gJ19fa29faGFzZm9jdXNMYXN0VmFsdWUnO1xua28uYmluZGluZ0hhbmRsZXJzWydoYXNmb2N1cyddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgdmFyIGhhbmRsZUVsZW1lbnRGb2N1c0NoYW5nZSA9IGZ1bmN0aW9uKGlzRm9jdXNlZCkge1xuICAgICAgICAgICAgLy8gV2hlcmUgcG9zc2libGUsIGlnbm9yZSB3aGljaCBldmVudCB3YXMgcmFpc2VkIGFuZCBkZXRlcm1pbmUgZm9jdXMgc3RhdGUgdXNpbmcgYWN0aXZlRWxlbWVudCxcbiAgICAgICAgICAgIC8vIGFzIHRoaXMgYXZvaWRzIHBoYW50b20gZm9jdXMvYmx1ciBldmVudHMgcmFpc2VkIHdoZW4gY2hhbmdpbmcgdGFicyBpbiBtb2Rlcm4gYnJvd3NlcnMuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCBub3QgYWxsIEtPLXRhcmdldGVkIGJyb3dzZXJzIChGaXJlZm94IDIpIHN1cHBvcnQgYWN0aXZlRWxlbWVudC4gRm9yIHRob3NlIGJyb3dzZXJzLFxuICAgICAgICAgICAgLy8gcHJldmVudCBhIGxvc3Mgb2YgZm9jdXMgd2hlbiBjaGFuZ2luZyB0YWJzL3dpbmRvd3MgYnkgc2V0dGluZyBhIGZsYWcgdGhhdCBwcmV2ZW50cyBoYXNmb2N1c1xuICAgICAgICAgICAgLy8gZnJvbSBjYWxsaW5nICdibHVyKCknIG9uIHRoZSBlbGVtZW50IHdoZW4gaXQgbG9zZXMgZm9jdXMuXG4gICAgICAgICAgICAvLyBEaXNjdXNzaW9uIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9wdWxsLzM1MlxuICAgICAgICAgICAgZWxlbWVudFtoYXNmb2N1c1VwZGF0aW5nUHJvcGVydHldID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBvd25lckRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudDtcbiAgICAgICAgICAgIGlmIChcImFjdGl2ZUVsZW1lbnRcIiBpbiBvd25lckRvYykge1xuICAgICAgICAgICAgICAgIHZhciBhY3RpdmU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlID0gb3duZXJEb2MuYWN0aXZlRWxlbWVudDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSUU5IHRocm93cyBpZiB5b3UgYWNjZXNzIGFjdGl2ZUVsZW1lbnQgZHVyaW5nIHBhZ2UgbG9hZCAoc2VlIGlzc3VlICM3MDMpXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA9IG93bmVyRG9jLmJvZHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzRm9jdXNlZCA9IChhY3RpdmUgPT09IGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1vZGVsVmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCk7XG4gICAgICAgICAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLndyaXRlVmFsdWVUb1Byb3BlcnR5KG1vZGVsVmFsdWUsIGFsbEJpbmRpbmdzLCAnaGFzZm9jdXMnLCBpc0ZvY3VzZWQsIHRydWUpO1xuXG4gICAgICAgICAgICAvL2NhY2hlIHRoZSBsYXRlc3QgdmFsdWUsIHNvIHdlIGNhbiBhdm9pZCB1bm5lY2Vzc2FyaWx5IGNhbGxpbmcgZm9jdXMvYmx1ciBpbiB0aGUgdXBkYXRlIGZ1bmN0aW9uXG4gICAgICAgICAgICBlbGVtZW50W2hhc2ZvY3VzTGFzdFZhbHVlXSA9IGlzRm9jdXNlZDtcbiAgICAgICAgICAgIGVsZW1lbnRbaGFzZm9jdXNVcGRhdGluZ1Byb3BlcnR5XSA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgaGFuZGxlRWxlbWVudEZvY3VzSW4gPSBoYW5kbGVFbGVtZW50Rm9jdXNDaGFuZ2UuYmluZChudWxsLCB0cnVlKTtcbiAgICAgICAgdmFyIGhhbmRsZUVsZW1lbnRGb2N1c091dCA9IGhhbmRsZUVsZW1lbnRGb2N1c0NoYW5nZS5iaW5kKG51bGwsIGZhbHNlKTtcblxuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImZvY3VzXCIsIGhhbmRsZUVsZW1lbnRGb2N1c0luKTtcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJmb2N1c2luXCIsIGhhbmRsZUVsZW1lbnRGb2N1c0luKTsgLy8gRm9yIElFXG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiYmx1clwiLCAgaGFuZGxlRWxlbWVudEZvY3VzT3V0KTtcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJmb2N1c291dFwiLCAgaGFuZGxlRWxlbWVudEZvY3VzT3V0KTsgLy8gRm9yIElFXG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSAhIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTsgLy9mb3JjZSBib29sZWFuIHRvIGNvbXBhcmUgd2l0aCBsYXN0IHZhbHVlXG4gICAgICAgIGlmICghZWxlbWVudFtoYXNmb2N1c1VwZGF0aW5nUHJvcGVydHldICYmIGVsZW1lbnRbaGFzZm9jdXNMYXN0VmFsdWVdICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPyBlbGVtZW50LmZvY3VzKCkgOiBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnRyaWdnZXJFdmVudCwgbnVsbCwgW2VsZW1lbnQsIHZhbHVlID8gXCJmb2N1c2luXCIgOiBcImZvY3Vzb3V0XCJdKTsgLy8gRm9yIElFLCB3aGljaCBkb2Vzbid0IHJlbGlhYmx5IGZpcmUgXCJmb2N1c1wiIG9yIFwiYmx1clwiIGV2ZW50cyBzeW5jaHJvbm91c2x5XG4gICAgICAgIH1cbiAgICB9XG59O1xua28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5nc1snaGFzZm9jdXMnXSA9IHRydWU7XG5cbmtvLmJpbmRpbmdIYW5kbGVyc1snaGFzRm9jdXMnXSA9IGtvLmJpbmRpbmdIYW5kbGVyc1snaGFzZm9jdXMnXTsgLy8gTWFrZSBcImhhc0ZvY3VzXCIgYW4gYWxpYXNcbmtvLmV4cHJlc3Npb25SZXdyaXRpbmcudHdvV2F5QmluZGluZ3NbJ2hhc0ZvY3VzJ10gPSB0cnVlO1xua28uYmluZGluZ0hhbmRsZXJzWydodG1sJ10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gUHJldmVudCBiaW5kaW5nIG9uIHRoZSBkeW5hbWljYWxseS1pbmplY3RlZCBIVE1MIChhcyBkZXZlbG9wZXJzIGFyZSB1bmxpa2VseSB0byBleHBlY3QgdGhhdCwgYW5kIGl0IGhhcyBzZWN1cml0eSBpbXBsaWNhdGlvbnMpXG4gICAgICAgIHJldHVybiB7ICdjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyc6IHRydWUgfTtcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAvLyBzZXRIdG1sIHdpbGwgdW53cmFwIHRoZSB2YWx1ZSBpZiBuZWVkZWRcbiAgICAgICAga28udXRpbHMuc2V0SHRtbChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKCkpO1xuICAgIH1cbn07XG4vLyBNYWtlcyBhIGJpbmRpbmcgbGlrZSB3aXRoIG9yIGlmXG5mdW5jdGlvbiBtYWtlV2l0aElmQmluZGluZyhiaW5kaW5nS2V5LCBpc1dpdGgsIGlzTm90LCBtYWtlQ29udGV4dENhbGxiYWNrKSB7XG4gICAga28uYmluZGluZ0hhbmRsZXJzW2JpbmRpbmdLZXldID0ge1xuICAgICAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgZGlkRGlzcGxheU9uTGFzdFVwZGF0ZSxcbiAgICAgICAgICAgICAgICBzYXZlZE5vZGVzO1xuICAgICAgICAgICAga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGFWYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKSxcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkRGlzcGxheSA9ICFpc05vdCAhPT0gIWRhdGFWYWx1ZSwgLy8gZXF1aXZhbGVudCB0byBpc05vdCA/ICFkYXRhVmFsdWUgOiAhIWRhdGFWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0UmVuZGVyID0gIXNhdmVkTm9kZXMsXG4gICAgICAgICAgICAgICAgICAgIG5lZWRzUmVmcmVzaCA9IGlzRmlyc3RSZW5kZXIgfHwgaXNXaXRoIHx8IChzaG91bGREaXNwbGF5ICE9PSBkaWREaXNwbGF5T25MYXN0VXBkYXRlKTtcblxuICAgICAgICAgICAgICAgIGlmIChuZWVkc1JlZnJlc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBhIGNvcHkgb2YgdGhlIGlubmVyIG5vZGVzIG9uIHRoZSBpbml0aWFsIHVwZGF0ZSwgYnV0IG9ubHkgaWYgd2UgaGF2ZSBkZXBlbmRlbmNpZXMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0ZpcnN0UmVuZGVyICYmIGtvLmNvbXB1dGVkQ29udGV4dC5nZXREZXBlbmRlbmNpZXNDb3VudCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlZE5vZGVzID0ga28udXRpbHMuY2xvbmVOb2Rlcyhrby52aXJ0dWFsRWxlbWVudHMuY2hpbGROb2RlcyhlbGVtZW50KSwgdHJ1ZSAvKiBzaG91bGRDbGVhbk5vZGVzICovKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGREaXNwbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmlyc3RSZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuKGVsZW1lbnQsIGtvLnV0aWxzLmNsb25lTm9kZXMoc2F2ZWROb2RlcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAga28uYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHMobWFrZUNvbnRleHRDYWxsYmFjayA/IG1ha2VDb250ZXh0Q2FsbGJhY2soYmluZGluZ0NvbnRleHQsIGRhdGFWYWx1ZSkgOiBiaW5kaW5nQ29udGV4dCwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZGlkRGlzcGxheU9uTGFzdFVwZGF0ZSA9IHNob3VsZERpc3BsYXk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGVsZW1lbnQgfSk7XG4gICAgICAgICAgICByZXR1cm4geyAnY29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MnOiB0cnVlIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcuYmluZGluZ1Jld3JpdGVWYWxpZGF0b3JzW2JpbmRpbmdLZXldID0gZmFsc2U7IC8vIENhbid0IHJld3JpdGUgY29udHJvbCBmbG93IGJpbmRpbmdzXG4gICAga28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5nc1tiaW5kaW5nS2V5XSA9IHRydWU7XG59XG5cbi8vIENvbnN0cnVjdCB0aGUgYWN0dWFsIGJpbmRpbmcgaGFuZGxlcnNcbm1ha2VXaXRoSWZCaW5kaW5nKCdpZicpO1xubWFrZVdpdGhJZkJpbmRpbmcoJ2lmbm90JywgZmFsc2UgLyogaXNXaXRoICovLCB0cnVlIC8qIGlzTm90ICovKTtcbm1ha2VXaXRoSWZCaW5kaW5nKCd3aXRoJywgdHJ1ZSAvKiBpc1dpdGggKi8sIGZhbHNlIC8qIGlzTm90ICovLFxuICAgIGZ1bmN0aW9uKGJpbmRpbmdDb250ZXh0LCBkYXRhVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGJpbmRpbmdDb250ZXh0WydjcmVhdGVDaGlsZENvbnRleHQnXShkYXRhVmFsdWUpO1xuICAgIH1cbik7XG52YXIgY2FwdGlvblBsYWNlaG9sZGVyID0ge307XG5rby5iaW5kaW5nSGFuZGxlcnNbJ29wdGlvbnMnXSA9IHtcbiAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50KSAhPT0gXCJzZWxlY3RcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMgYmluZGluZyBhcHBsaWVzIG9ubHkgdG8gU0VMRUNUIGVsZW1lbnRzXCIpO1xuXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgZXhpc3RpbmcgPG9wdGlvbj5zLlxuICAgICAgICB3aGlsZSAoZWxlbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZXMgdGhhdCB0aGUgYmluZGluZyBwcm9jZXNzb3IgZG9lc24ndCB0cnkgdG8gYmluZCB0aGUgb3B0aW9uc1xuICAgICAgICByZXR1cm4geyAnY29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MnOiB0cnVlIH07XG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdGVkT3B0aW9ucygpIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5hcnJheUZpbHRlcihlbGVtZW50Lm9wdGlvbnMsIGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlLnNlbGVjdGVkOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxlY3RXYXNQcmV2aW91c2x5RW1wdHkgPSBlbGVtZW50Lmxlbmd0aCA9PSAwO1xuICAgICAgICB2YXIgcHJldmlvdXNTY3JvbGxUb3AgPSAoIXNlbGVjdFdhc1ByZXZpb3VzbHlFbXB0eSAmJiBlbGVtZW50Lm11bHRpcGxlKSA/IGVsZW1lbnQuc2Nyb2xsVG9wIDogbnVsbDtcbiAgICAgICAgdmFyIHVud3JhcHBlZEFycmF5ID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICB2YXIgaW5jbHVkZURlc3Ryb3llZCA9IGFsbEJpbmRpbmdzLmdldCgnb3B0aW9uc0luY2x1ZGVEZXN0cm95ZWQnKTtcbiAgICAgICAgdmFyIGFycmF5VG9Eb21Ob2RlQ2hpbGRyZW5PcHRpb25zID0ge307XG4gICAgICAgIHZhciBjYXB0aW9uVmFsdWU7XG4gICAgICAgIHZhciBmaWx0ZXJlZEFycmF5O1xuICAgICAgICB2YXIgcHJldmlvdXNTZWxlY3RlZFZhbHVlcztcblxuICAgICAgICBpZiAoZWxlbWVudC5tdWx0aXBsZSkge1xuICAgICAgICAgICAgcHJldmlvdXNTZWxlY3RlZFZhbHVlcyA9IGtvLnV0aWxzLmFycmF5TWFwKHNlbGVjdGVkT3B0aW9ucygpLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2aW91c1NlbGVjdGVkVmFsdWVzID0gZWxlbWVudC5zZWxlY3RlZEluZGV4ID49IDAgPyBbIGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdKSBdIDogW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodW53cmFwcGVkQXJyYXkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdW53cmFwcGVkQXJyYXkubGVuZ3RoID09IFwidW5kZWZpbmVkXCIpIC8vIENvZXJjZSBzaW5nbGUgdmFsdWUgaW50byBhcnJheVxuICAgICAgICAgICAgICAgIHVud3JhcHBlZEFycmF5ID0gW3Vud3JhcHBlZEFycmF5XTtcblxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBhbnkgZW50cmllcyBtYXJrZWQgYXMgZGVzdHJveWVkXG4gICAgICAgICAgICBmaWx0ZXJlZEFycmF5ID0ga28udXRpbHMuYXJyYXlGaWx0ZXIodW53cmFwcGVkQXJyYXksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5jbHVkZURlc3Ryb3llZCB8fCBpdGVtID09PSB1bmRlZmluZWQgfHwgaXRlbSA9PT0gbnVsbCB8fCAha28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShpdGVtWydfZGVzdHJveSddKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiBjYXB0aW9uIGlzIGluY2x1ZGVkLCBhZGQgaXQgdG8gdGhlIGFycmF5XG4gICAgICAgICAgICBpZiAoYWxsQmluZGluZ3NbJ2hhcyddKCdvcHRpb25zQ2FwdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgY2FwdGlvblZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNDYXB0aW9uJykpO1xuICAgICAgICAgICAgICAgIC8vIElmIGNhcHRpb24gdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQsIGRvbid0IHNob3cgYSBjYXB0aW9uXG4gICAgICAgICAgICAgICAgaWYgKGNhcHRpb25WYWx1ZSAhPT0gbnVsbCAmJiBjYXB0aW9uVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEFycmF5LnVuc2hpZnQoY2FwdGlvblBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiBhIGZhbHN5IHZhbHVlIGlzIHByb3ZpZGVkIChlLmcuIG51bGwpLCB3ZSdsbCBzaW1wbHkgZW1wdHkgdGhlIHNlbGVjdCBlbGVtZW50XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhcHBseVRvT2JqZWN0KG9iamVjdCwgcHJlZGljYXRlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBwcmVkaWNhdGVUeXBlID0gdHlwZW9mIHByZWRpY2F0ZTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGVUeXBlID09IFwiZnVuY3Rpb25cIikgICAgLy8gR2l2ZW4gYSBmdW5jdGlvbjsgcnVuIGl0IGFnYWluc3QgdGhlIGRhdGEgdmFsdWVcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZGljYXRlKG9iamVjdCk7XG4gICAgICAgICAgICBlbHNlIGlmIChwcmVkaWNhdGVUeXBlID09IFwic3RyaW5nXCIpIC8vIEdpdmVuIGEgc3RyaW5nOyB0cmVhdCBpdCBhcyBhIHByb3BlcnR5IG5hbWUgb24gdGhlIGRhdGEgdmFsdWVcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0W3ByZWRpY2F0ZV07XG4gICAgICAgICAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbiBubyBvcHRpb25zVGV4dCBhcmc7IHVzZSB0aGUgZGF0YSB2YWx1ZSBpdHNlbGZcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgY2FuIHJ1biBhdCB0d28gZGlmZmVyZW50IHRpbWVzOlxuICAgICAgICAvLyBUaGUgZmlyc3QgaXMgd2hlbiB0aGUgd2hvbGUgYXJyYXkgaXMgYmVpbmcgdXBkYXRlZCBkaXJlY3RseSBmcm9tIHRoaXMgYmluZGluZyBoYW5kbGVyLlxuICAgICAgICAvLyBUaGUgc2Vjb25kIGlzIHdoZW4gYW4gb2JzZXJ2YWJsZSB2YWx1ZSBmb3IgYSBzcGVjaWZpYyBhcnJheSBlbnRyeSBpcyB1cGRhdGVkLlxuICAgICAgICAvLyBvbGRPcHRpb25zIHdpbGwgYmUgZW1wdHkgaW4gdGhlIGZpcnN0IGNhc2UsIGJ1dCB3aWxsIGJlIGZpbGxlZCB3aXRoIHRoZSBwcmV2aW91c2x5IGdlbmVyYXRlZCBvcHRpb24gaW4gdGhlIHNlY29uZC5cbiAgICAgICAgdmFyIGl0ZW1VcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgZnVuY3Rpb24gb3B0aW9uRm9yQXJyYXlJdGVtKGFycmF5RW50cnksIGluZGV4LCBvbGRPcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob2xkT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwcmV2aW91c1NlbGVjdGVkVmFsdWVzID0gb2xkT3B0aW9uc1swXS5zZWxlY3RlZCA/IFsga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUob2xkT3B0aW9uc1swXSkgXSA6IFtdO1xuICAgICAgICAgICAgICAgIGl0ZW1VcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgICAgICAgaWYgKGFycmF5RW50cnkgPT09IGNhcHRpb25QbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldFRleHRDb250ZW50KG9wdGlvbiwgYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zQ2FwdGlvbicpKTtcbiAgICAgICAgICAgICAgICBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUob3B0aW9uLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBBcHBseSBhIHZhbHVlIHRvIHRoZSBvcHRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25WYWx1ZSA9IGFwcGx5VG9PYmplY3QoYXJyYXlFbnRyeSwgYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zVmFsdWUnKSwgYXJyYXlFbnRyeSk7XG4gICAgICAgICAgICAgICAga28uc2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlKG9wdGlvbiwga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShvcHRpb25WYWx1ZSkpO1xuXG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgc29tZSB0ZXh0IHRvIHRoZSBvcHRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciBvcHRpb25UZXh0ID0gYXBwbHlUb09iamVjdChhcnJheUVudHJ5LCBhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNUZXh0JyksIG9wdGlvblZhbHVlKTtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRUZXh0Q29udGVudChvcHRpb24sIG9wdGlvblRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtvcHRpb25dO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgdXNpbmcgYSBiZWZvcmVSZW1vdmUgY2FsbGJhY2ssIHdlIGRlbGF5IHRoZSByZW1vdmFsIHVudGlsIGFmdGVyIG5ldyBpdGVtcyBhcmUgYWRkZWQuIFRoaXMgZml4ZXMgYSBzZWxlY3Rpb25cbiAgICAgICAgLy8gcHJvYmxlbSBpbiBJRTw9OCBhbmQgRmlyZWZveC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9rbm9ja291dC9rbm9ja291dC9pc3N1ZXMvMTIwOFxuICAgICAgICBhcnJheVRvRG9tTm9kZUNoaWxkcmVuT3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10gPVxuICAgICAgICAgICAgZnVuY3Rpb24gKG9wdGlvbikge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0U2VsZWN0aW9uQ2FsbGJhY2soYXJyYXlFbnRyeSwgbmV3T3B0aW9ucykge1xuICAgICAgICAgICAgLy8gSUU2IGRvZXNuJ3QgbGlrZSB1cyB0byBhc3NpZ24gc2VsZWN0aW9uIHRvIE9QVElPTiBub2RlcyBiZWZvcmUgdGhleSdyZSBhZGRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAgICAvLyBUaGF0J3Mgd2h5IHdlIGZpcnN0IGFkZGVkIHRoZW0gd2l0aG91dCBzZWxlY3Rpb24uIE5vdyBpdCdzIHRpbWUgdG8gc2V0IHRoZSBzZWxlY3Rpb24uXG4gICAgICAgICAgICBpZiAocHJldmlvdXNTZWxlY3RlZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNTZWxlY3RlZCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZihwcmV2aW91c1NlbGVjdGVkVmFsdWVzLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShuZXdPcHRpb25zWzBdKSkgPj0gMDtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRPcHRpb25Ob2RlU2VsZWN0aW9uU3RhdGUobmV3T3B0aW9uc1swXSwgaXNTZWxlY3RlZCk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIG9wdGlvbiB3YXMgY2hhbmdlZCBmcm9tIGJlaW5nIHNlbGVjdGVkIGR1cmluZyBhIHNpbmdsZS1pdGVtIHVwZGF0ZSwgbm90aWZ5IHRoZSBjaGFuZ2VcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVVwZGF0ZSAmJiAhaXNTZWxlY3RlZClcbiAgICAgICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoa28udXRpbHMudHJpZ2dlckV2ZW50LCBudWxsLCBbZWxlbWVudCwgXCJjaGFuZ2VcIl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gc2V0U2VsZWN0aW9uQ2FsbGJhY2s7XG4gICAgICAgIGlmIChhbGxCaW5kaW5nc1snaGFzJ10oJ29wdGlvbnNBZnRlclJlbmRlcicpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGZ1bmN0aW9uKGFycmF5RW50cnksIG5ld09wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25DYWxsYmFjayhhcnJheUVudHJ5LCBuZXdPcHRpb25zKTtcbiAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNBZnRlclJlbmRlcicpLCBudWxsLCBbbmV3T3B0aW9uc1swXSwgYXJyYXlFbnRyeSAhPT0gY2FwdGlvblBsYWNlaG9sZGVyID8gYXJyYXlFbnRyeSA6IHVuZGVmaW5lZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyhlbGVtZW50LCBmaWx0ZXJlZEFycmF5LCBvcHRpb25Gb3JBcnJheUl0ZW0sIGFycmF5VG9Eb21Ob2RlQ2hpbGRyZW5PcHRpb25zLCBjYWxsYmFjayk7XG5cbiAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGFsbEJpbmRpbmdzLmdldCgndmFsdWVBbGxvd1Vuc2V0JykgJiYgYWxsQmluZGluZ3NbJ2hhcyddKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIG1vZGVsIHZhbHVlIGlzIGF1dGhvcml0YXRpdmUsIHNvIG1ha2Ugc3VyZSBpdHMgdmFsdWUgaXMgdGhlIG9uZSBzZWxlY3RlZFxuICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShlbGVtZW50LCBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGFsbEJpbmRpbmdzLmdldCgndmFsdWUnKSksIHRydWUgLyogYWxsb3dVbnNldCAqLyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBpZiB0aGUgc2VsZWN0aW9uIGhhcyBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHVwZGF0aW5nIHRoZSBvcHRpb25zIGxpc3RcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0aW9uQ2hhbmdlZDtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5tdWx0aXBsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgYSBtdWx0aXBsZS1zZWxlY3QgYm94LCBjb21wYXJlIHRoZSBuZXcgc2VsZWN0aW9uIGNvdW50IHRvIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQnV0IGlmIG5vdGhpbmcgd2FzIHNlbGVjdGVkIGJlZm9yZSwgdGhlIHNlbGVjdGlvbiBjYW4ndCBoYXZlIGNoYW5nZWRcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uQ2hhbmdlZCA9IHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoICYmIHNlbGVjdGVkT3B0aW9ucygpLmxlbmd0aCA8IHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBhIHNpbmdsZS1zZWxlY3QgYm94LCBjb21wYXJlIHRoZSBjdXJyZW50IHZhbHVlIHRvIHRoZSBwcmV2aW91cyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBCdXQgaWYgbm90aGluZyB3YXMgc2VsZWN0ZWQgYmVmb3JlIG9yIG5vdGhpbmcgaXMgc2VsZWN0ZWQgbm93LCBqdXN0IGxvb2sgZm9yIGEgY2hhbmdlIGluIHNlbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25DaGFuZ2VkID0gKHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoICYmIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA+PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgPyAoa28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudC5vcHRpb25zW2VsZW1lbnQuc2VsZWN0ZWRJbmRleF0pICE9PSBwcmV2aW91c1NlbGVjdGVkVmFsdWVzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiAocHJldmlvdXNTZWxlY3RlZFZhbHVlcy5sZW5ndGggfHwgZWxlbWVudC5zZWxlY3RlZEluZGV4ID49IDApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBjb25zaXN0ZW5jeSBiZXR3ZWVuIG1vZGVsIHZhbHVlIGFuZCBzZWxlY3RlZCBvcHRpb24uXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGRyb3Bkb3duIHdhcyBjaGFuZ2VkIHNvIHRoYXQgc2VsZWN0aW9uIGlzIG5vIGxvbmdlciB0aGUgc2FtZSxcbiAgICAgICAgICAgICAgICAvLyBub3RpZnkgdGhlIHZhbHVlIG9yIHNlbGVjdGVkT3B0aW9ucyBiaW5kaW5nLlxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25DaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLnRyaWdnZXJFdmVudChlbGVtZW50LCBcImNoYW5nZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIElFIGJ1Z1xuICAgICAgICBrby51dGlscy5lbnN1cmVTZWxlY3RFbGVtZW50SXNSZW5kZXJlZENvcnJlY3RseShlbGVtZW50KTtcblxuICAgICAgICBpZiAocHJldmlvdXNTY3JvbGxUb3AgJiYgTWF0aC5hYnMocHJldmlvdXNTY3JvbGxUb3AgLSBlbGVtZW50LnNjcm9sbFRvcCkgPiAyMClcbiAgICAgICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wID0gcHJldmlvdXNTY3JvbGxUb3A7XG4gICAgfVxufTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snb3B0aW9ucyddLm9wdGlvblZhbHVlRG9tRGF0YUtleSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpO1xua28uYmluZGluZ0hhbmRsZXJzWydzZWxlY3RlZE9wdGlvbnMnXSA9IHtcbiAgICAnYWZ0ZXInOiBbJ29wdGlvbnMnLCAnZm9yZWFjaCddLFxuICAgICdpbml0JzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKSwgdmFsdWVUb1dyaXRlID0gW107XG4gICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2goZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnNlbGVjdGVkKVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVRvV3JpdGUucHVzaChrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShub2RlKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcud3JpdGVWYWx1ZVRvUHJvcGVydHkodmFsdWUsIGFsbEJpbmRpbmdzLCAnc2VsZWN0ZWRPcHRpb25zJywgdmFsdWVUb1dyaXRlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgaWYgKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50KSAhPSBcInNlbGVjdFwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidmFsdWVzIGJpbmRpbmcgYXBwbGllcyBvbmx5IHRvIFNFTEVDVCBlbGVtZW50c1wiKTtcblxuICAgICAgICB2YXIgbmV3VmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIGlmIChuZXdWYWx1ZSAmJiB0eXBlb2YgbmV3VmFsdWUubGVuZ3RoID09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwib3B0aW9uXCIpLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzU2VsZWN0ZWQgPSBrby51dGlscy5hcnJheUluZGV4T2YobmV3VmFsdWUsIGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKG5vZGUpKSA+PSAwO1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldE9wdGlvbk5vZGVTZWxlY3Rpb25TdGF0ZShub2RlLCBpc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcbmtvLmV4cHJlc3Npb25SZXdyaXRpbmcudHdvV2F5QmluZGluZ3NbJ3NlbGVjdGVkT3B0aW9ucyddID0gdHJ1ZTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snc3R5bGUnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkgfHwge30pO1xuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKHZhbHVlLCBmdW5jdGlvbihzdHlsZU5hbWUsIHN0eWxlVmFsdWUpIHtcbiAgICAgICAgICAgIHN0eWxlVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHN0eWxlVmFsdWUpO1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtzdHlsZU5hbWVdID0gc3R5bGVWYWx1ZSB8fCBcIlwiOyAvLyBFbXB0eSBzdHJpbmcgcmVtb3ZlcyB0aGUgdmFsdWUsIHdoZXJlYXMgbnVsbC91bmRlZmluZWQgaGF2ZSBubyBlZmZlY3RcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snc3VibWl0J10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZUFjY2Vzc29yKCkgIT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHZhbHVlIGZvciBhIHN1Ym1pdCBiaW5kaW5nIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJzdWJtaXRcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlclJldHVyblZhbHVlO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgdHJ5IHsgaGFuZGxlclJldHVyblZhbHVlID0gdmFsdWUuY2FsbChiaW5kaW5nQ29udGV4dFsnJGRhdGEnXSwgZWxlbWVudCk7IH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyUmV0dXJuVmFsdWUgIT09IHRydWUpIHsgLy8gTm9ybWFsbHkgd2Ugd2FudCB0byBwcmV2ZW50IGRlZmF1bHQgYWN0aW9uLiBEZXZlbG9wZXIgY2FuIG92ZXJyaWRlIHRoaXMgYmUgZXhwbGljaXRseSByZXR1cm5pbmcgdHJ1ZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnByZXZlbnREZWZhdWx0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3RleHQnXSA9IHtcblx0J2luaXQnOiBmdW5jdGlvbigpIHtcblx0XHQvLyBQcmV2ZW50IGJpbmRpbmcgb24gdGhlIGR5bmFtaWNhbGx5LWluamVjdGVkIHRleHQgbm9kZSAoYXMgZGV2ZWxvcGVycyBhcmUgdW5saWtlbHkgdG8gZXhwZWN0IHRoYXQsIGFuZCBpdCBoYXMgc2VjdXJpdHkgaW1wbGljYXRpb25zKS5cblx0XHQvLyBJdCBzaG91bGQgYWxzbyBtYWtlIHRoaW5ncyBmYXN0ZXIsIGFzIHdlIG5vIGxvbmdlciBoYXZlIHRvIGNvbnNpZGVyIHdoZXRoZXIgdGhlIHRleHQgbm9kZSBtaWdodCBiZSBiaW5kYWJsZS5cbiAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuXHR9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICBrby51dGlscy5zZXRUZXh0Q29udGVudChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKCkpO1xuICAgIH1cbn07XG5rby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzWyd0ZXh0J10gPSB0cnVlO1xua28uYmluZGluZ0hhbmRsZXJzWyd1bmlxdWVOYW1lJ10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICBpZiAodmFsdWVBY2Nlc3NvcigpKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IFwia29fdW5pcXVlX1wiICsgKCsra28uYmluZGluZ0hhbmRsZXJzWyd1bmlxdWVOYW1lJ10uY3VycmVudEluZGV4KTtcbiAgICAgICAgICAgIGtvLnV0aWxzLnNldEVsZW1lbnROYW1lKGVsZW1lbnQsIG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndW5pcXVlTmFtZSddLmN1cnJlbnRJbmRleCA9IDA7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3ZhbHVlJ10gPSB7XG4gICAgJ2FmdGVyJzogWydvcHRpb25zJywgJ2ZvcmVhY2gnXSxcbiAgICAnaW5pdCc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICAvLyBBbHdheXMgY2F0Y2ggXCJjaGFuZ2VcIiBldmVudDsgcG9zc2libHkgb3RoZXIgZXZlbnRzIHRvbyBpZiBhc2tlZFxuICAgICAgICB2YXIgZXZlbnRzVG9DYXRjaCA9IFtcImNoYW5nZVwiXTtcbiAgICAgICAgdmFyIHJlcXVlc3RlZEV2ZW50c1RvQ2F0Y2ggPSBhbGxCaW5kaW5ncy5nZXQoXCJ2YWx1ZVVwZGF0ZVwiKTtcbiAgICAgICAgdmFyIHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gZmFsc2U7XG4gICAgICAgIGlmIChyZXF1ZXN0ZWRFdmVudHNUb0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3RlZEV2ZW50c1RvQ2F0Y2ggPT0gXCJzdHJpbmdcIikgLy8gQWxsb3cgYm90aCBpbmRpdmlkdWFsIGV2ZW50IG5hbWVzLCBhbmQgYXJyYXlzIG9mIGV2ZW50IG5hbWVzXG4gICAgICAgICAgICAgICAgcmVxdWVzdGVkRXZlbnRzVG9DYXRjaCA9IFtyZXF1ZXN0ZWRFdmVudHNUb0NhdGNoXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UHVzaEFsbChldmVudHNUb0NhdGNoLCByZXF1ZXN0ZWRFdmVudHNUb0NhdGNoKTtcbiAgICAgICAgICAgIGV2ZW50c1RvQ2F0Y2ggPSBrby51dGlscy5hcnJheUdldERpc3RpbmN0VmFsdWVzKGV2ZW50c1RvQ2F0Y2gpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhbHVlVXBkYXRlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJvcGVydHlDaGFuZ2VkRmlyZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBtb2RlbFZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnRWYWx1ZSA9IGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAga28uZXhwcmVzc2lvblJld3JpdGluZy53cml0ZVZhbHVlVG9Qcm9wZXJ0eShtb2RlbFZhbHVlLCBhbGxCaW5kaW5ncywgJ3ZhbHVlJywgZWxlbWVudFZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMTIyXG4gICAgICAgIC8vIElFIGRvZXNuJ3QgZmlyZSBcImNoYW5nZVwiIGV2ZW50cyBvbiB0ZXh0Ym94ZXMgaWYgdGhlIHVzZXIgc2VsZWN0cyBhIHZhbHVlIGZyb20gaXRzIGF1dG9jb21wbGV0ZSBsaXN0XG4gICAgICAgIHZhciBpZUF1dG9Db21wbGV0ZUhhY2tOZWVkZWQgPSBrby51dGlscy5pZVZlcnNpb24gJiYgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJpbnB1dFwiICYmIGVsZW1lbnQudHlwZSA9PSBcInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgZWxlbWVudC5hdXRvY29tcGxldGUgIT0gXCJvZmZcIiAmJiAoIWVsZW1lbnQuZm9ybSB8fCBlbGVtZW50LmZvcm0uYXV0b2NvbXBsZXRlICE9IFwib2ZmXCIpO1xuICAgICAgICBpZiAoaWVBdXRvQ29tcGxldGVIYWNrTmVlZGVkICYmIGtvLnV0aWxzLmFycmF5SW5kZXhPZihldmVudHNUb0NhdGNoLCBcInByb3BlcnR5Y2hhbmdlXCIpID09IC0xKSB7XG4gICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcInByb3BlcnR5Y2hhbmdlXCIsIGZ1bmN0aW9uICgpIHsgcHJvcGVydHlDaGFuZ2VkRmlyZWQgPSB0cnVlIH0pO1xuICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJmb2N1c1wiLCBmdW5jdGlvbiAoKSB7IHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gZmFsc2UgfSk7XG4gICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImJsdXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5Q2hhbmdlZEZpcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlVXBkYXRlSGFuZGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGV2ZW50c1RvQ2F0Y2gsIGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgLy8gVGhlIHN5bnRheCBcImFmdGVyPGV2ZW50bmFtZT5cIiBtZWFucyBcInJ1biB0aGUgaGFuZGxlciBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgZXZlbnRcIlxuICAgICAgICAgICAgLy8gVGhpcyBpcyB1c2VmdWwsIGZvciBleGFtcGxlLCB0byBjYXRjaCBcImtleWRvd25cIiBldmVudHMgYWZ0ZXIgdGhlIGJyb3dzZXIgaGFzIHVwZGF0ZWQgdGhlIGNvbnRyb2xcbiAgICAgICAgICAgIC8vIChvdGhlcndpc2UsIGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKHRoaXMpIHdpbGwgcmVjZWl2ZSB0aGUgY29udHJvbCdzIHZhbHVlICpiZWZvcmUqIHRoZSBrZXkgZXZlbnQpXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IHZhbHVlVXBkYXRlSGFuZGxlcjtcbiAgICAgICAgICAgIGlmIChrby51dGlscy5zdHJpbmdTdGFydHNXaXRoKGV2ZW50TmFtZSwgXCJhZnRlclwiKSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBmdW5jdGlvbigpIHsgc2V0VGltZW91dCh2YWx1ZVVwZGF0ZUhhbmRsZXIsIDApIH07XG4gICAgICAgICAgICAgICAgZXZlbnROYW1lID0gZXZlbnROYW1lLnN1YnN0cmluZyhcImFmdGVyXCIubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIHZhciBlbGVtZW50VmFsdWUgPSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgdmFyIHZhbHVlSGFzQ2hhbmdlZCA9IChuZXdWYWx1ZSAhPT0gZWxlbWVudFZhbHVlKTtcblxuICAgICAgICBpZiAodmFsdWVIYXNDaGFuZ2VkKSB7XG4gICAgICAgICAgICBpZiAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpID09PSBcInNlbGVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFsbG93VW5zZXQgPSBhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlQWxsb3dVbnNldCcpO1xuICAgICAgICAgICAgICAgIHZhciBhcHBseVZhbHVlQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUoZWxlbWVudCwgbmV3VmFsdWUsIGFsbG93VW5zZXQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXBwbHlWYWx1ZUFjdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFhbGxvd1Vuc2V0ICYmIG5ld1ZhbHVlICE9PSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB5b3UgdHJ5IHRvIHNldCBhIG1vZGVsIHZhbHVlIHRoYXQgY2FuJ3QgYmUgcmVwcmVzZW50ZWQgaW4gYW4gYWxyZWFkeS1wb3B1bGF0ZWQgZHJvcGRvd24sIHJlamVjdCB0aGF0IGNoYW5nZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB5b3UncmUgbm90IGFsbG93ZWQgdG8gaGF2ZSBhIG1vZGVsIHZhbHVlIHRoYXQgZGlzYWdyZWVzIHdpdGggYSB2aXNpYmxlIFVJIHNlbGVjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoa28udXRpbHMudHJpZ2dlckV2ZW50LCBudWxsLCBbZWxlbWVudCwgXCJjaGFuZ2VcIl0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIElFNiBidWc6IEl0IHdvbid0IHJlbGlhYmx5IGFwcGx5IHZhbHVlcyB0byBTRUxFQ1Qgbm9kZXMgZHVyaW5nIHRoZSBzYW1lIGV4ZWN1dGlvbiB0aHJlYWRcbiAgICAgICAgICAgICAgICAgICAgLy8gcmlnaHQgYWZ0ZXIgeW91J3ZlIGNoYW5nZWQgdGhlIHNldCBvZiBPUFRJT04gbm9kZXMgb24gaXQuIFNvIGZvciB0aGF0IG5vZGUgdHlwZSwgd2UnbGwgc2NoZWR1bGUgYSBzZWNvbmQgdGhyZWFkXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGFwcGx5IHRoZSB2YWx1ZSBhcyB3ZWxsLlxuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGFwcGx5VmFsdWVBY3Rpb24sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga28uc2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlKGVsZW1lbnQsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWyd2YWx1ZSddID0gdHJ1ZTtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndmlzaWJsZSddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIHZhciBpc0N1cnJlbnRseVZpc2libGUgPSAhKGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PSBcIm5vbmVcIik7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAhaXNDdXJyZW50bHlWaXNpYmxlKVxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgZWxzZSBpZiAoKCF2YWx1ZSkgJiYgaXNDdXJyZW50bHlWaXNpYmxlKVxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufTtcbi8vICdjbGljaycgaXMganVzdCBhIHNob3J0aGFuZCBmb3IgdGhlIHVzdWFsIGZ1bGwtbGVuZ3RoIGV2ZW50OntjbGljazpoYW5kbGVyfVxubWFrZUV2ZW50SGFuZGxlclNob3J0Y3V0KCdjbGljaycpO1xuLy8gSWYgeW91IHdhbnQgdG8gbWFrZSBhIGN1c3RvbSB0ZW1wbGF0ZSBlbmdpbmUsXG4vL1xuLy8gWzFdIEluaGVyaXQgZnJvbSB0aGlzIGNsYXNzIChsaWtlIGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lIGRvZXMpXG4vLyBbMl0gT3ZlcnJpZGUgJ3JlbmRlclRlbXBsYXRlU291cmNlJywgc3VwcGx5aW5nIGEgZnVuY3Rpb24gd2l0aCB0aGlzIHNpZ25hdHVyZTpcbi8vXG4vLyAgICAgICAgZnVuY3Rpb24gKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuLy8gICAgICAgICAgICAvLyAtIHRlbXBsYXRlU291cmNlLnRleHQoKSBpcyB0aGUgdGV4dCBvZiB0aGUgdGVtcGxhdGUgeW91IHNob3VsZCByZW5kZXJcbi8vICAgICAgICAgICAgLy8gLSBiaW5kaW5nQ29udGV4dC4kZGF0YSBpcyB0aGUgZGF0YSB5b3Ugc2hvdWxkIHBhc3MgaW50byB0aGUgdGVtcGxhdGVcbi8vICAgICAgICAgICAgLy8gICAtIHlvdSBtaWdodCBhbHNvIHdhbnQgdG8gbWFrZSBiaW5kaW5nQ29udGV4dC4kcGFyZW50LCBiaW5kaW5nQ29udGV4dC4kcGFyZW50cyxcbi8vICAgICAgICAgICAgLy8gICAgIGFuZCBiaW5kaW5nQ29udGV4dC4kcm9vdCBhdmFpbGFibGUgaW4gdGhlIHRlbXBsYXRlIHRvb1xuLy8gICAgICAgICAgICAvLyAtIG9wdGlvbnMgZ2l2ZXMgeW91IGFjY2VzcyB0byBhbnkgb3RoZXIgcHJvcGVydGllcyBzZXQgb24gXCJkYXRhLWJpbmQ6IHsgdGVtcGxhdGU6IG9wdGlvbnMgfVwiXG4vLyAgICAgICAgICAgIC8vXG4vLyAgICAgICAgICAgIC8vIFJldHVybiB2YWx1ZTogYW4gYXJyYXkgb2YgRE9NIG5vZGVzXG4vLyAgICAgICAgfVxuLy9cbi8vIFszXSBPdmVycmlkZSAnY3JlYXRlSmF2YVNjcmlwdEV2YWx1YXRvckJsb2NrJywgc3VwcGx5aW5nIGEgZnVuY3Rpb24gd2l0aCB0aGlzIHNpZ25hdHVyZTpcbi8vXG4vLyAgICAgICAgZnVuY3Rpb24gKHNjcmlwdCkge1xuLy8gICAgICAgICAgICAvLyBSZXR1cm4gdmFsdWU6IFdoYXRldmVyIHN5bnRheCBtZWFucyBcIkV2YWx1YXRlIHRoZSBKYXZhU2NyaXB0IHN0YXRlbWVudCAnc2NyaXB0JyBhbmQgb3V0cHV0IHRoZSByZXN1bHRcIlxuLy8gICAgICAgICAgICAvLyAgICAgICAgICAgICAgIEZvciBleGFtcGxlLCB0aGUganF1ZXJ5LnRtcGwgdGVtcGxhdGUgZW5naW5lIGNvbnZlcnRzICdzb21lU2NyaXB0JyB0byAnJHsgc29tZVNjcmlwdCB9J1xuLy8gICAgICAgIH1cbi8vXG4vLyAgICAgVGhpcyBpcyBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBhbGxvdyBkYXRhLWJpbmQgYXR0cmlidXRlcyB0byByZWZlcmVuY2UgYXJiaXRyYXJ5IHRlbXBsYXRlIHZhcmlhYmxlcy5cbi8vICAgICBJZiB5b3UgZG9uJ3Qgd2FudCB0byBhbGxvdyB0aGF0LCB5b3UgY2FuIHNldCB0aGUgcHJvcGVydHkgJ2FsbG93VGVtcGxhdGVSZXdyaXRpbmcnIHRvIGZhbHNlIChsaWtlIGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lIGRvZXMpXG4vLyAgICAgYW5kIHRoZW4geW91IGRvbid0IG5lZWQgdG8gb3ZlcnJpZGUgJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jaycuXG5cbmtvLnRlbXBsYXRlRW5naW5lID0gZnVuY3Rpb24gKCkgeyB9O1xuXG5rby50ZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGVbJ3JlbmRlclRlbXBsYXRlU291cmNlJ10gPSBmdW5jdGlvbiAodGVtcGxhdGVTb3VyY2UsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiT3ZlcnJpZGUgcmVuZGVyVGVtcGxhdGVTb3VyY2VcIik7XG59O1xuXG5rby50ZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGVbJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jayddID0gZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk92ZXJyaWRlIGNyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9ja1wiKTtcbn07XG5cbmtvLnRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsnbWFrZVRlbXBsYXRlU291cmNlJ10gPSBmdW5jdGlvbih0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgIC8vIE5hbWVkIHRlbXBsYXRlXG4gICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRlbXBsYXRlRG9jdW1lbnQgPSB0ZW1wbGF0ZURvY3VtZW50IHx8IGRvY3VtZW50O1xuICAgICAgICB2YXIgZWxlbSA9IHRlbXBsYXRlRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGUpO1xuICAgICAgICBpZiAoIWVsZW0pXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCB0ZW1wbGF0ZSB3aXRoIElEIFwiICsgdGVtcGxhdGUpO1xuICAgICAgICByZXR1cm4gbmV3IGtvLnRlbXBsYXRlU291cmNlcy5kb21FbGVtZW50KGVsZW0pO1xuICAgIH0gZWxzZSBpZiAoKHRlbXBsYXRlLm5vZGVUeXBlID09IDEpIHx8ICh0ZW1wbGF0ZS5ub2RlVHlwZSA9PSA4KSkge1xuICAgICAgICAvLyBBbm9ueW1vdXMgdGVtcGxhdGVcbiAgICAgICAgcmV0dXJuIG5ldyBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgIH0gZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHRlbXBsYXRlIHR5cGU6IFwiICsgdGVtcGxhdGUpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZW5kZXJUZW1wbGF0ZSddID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucywgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgIHZhciB0ZW1wbGF0ZVNvdXJjZSA9IHRoaXNbJ21ha2VUZW1wbGF0ZVNvdXJjZSddKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KTtcbiAgICByZXR1cm4gdGhpc1sncmVuZGVyVGVtcGxhdGVTb3VyY2UnXSh0ZW1wbGF0ZVNvdXJjZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydpc1RlbXBsYXRlUmV3cml0dGVuJ10gPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICAvLyBTa2lwIHJld3JpdGluZyBpZiByZXF1ZXN0ZWRcbiAgICBpZiAodGhpc1snYWxsb3dUZW1wbGF0ZVJld3JpdGluZyddID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIHRoaXNbJ21ha2VUZW1wbGF0ZVNvdXJjZSddKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KVsnZGF0YSddKFwiaXNSZXdyaXR0ZW5cIik7XG59O1xuXG5rby50ZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGVbJ3Jld3JpdGVUZW1wbGF0ZSddID0gZnVuY3Rpb24gKHRlbXBsYXRlLCByZXdyaXRlckNhbGxiYWNrLCB0ZW1wbGF0ZURvY3VtZW50KSB7XG4gICAgdmFyIHRlbXBsYXRlU291cmNlID0gdGhpc1snbWFrZVRlbXBsYXRlU291cmNlJ10odGVtcGxhdGUsIHRlbXBsYXRlRG9jdW1lbnQpO1xuICAgIHZhciByZXdyaXR0ZW4gPSByZXdyaXRlckNhbGxiYWNrKHRlbXBsYXRlU291cmNlWyd0ZXh0J10oKSk7XG4gICAgdGVtcGxhdGVTb3VyY2VbJ3RleHQnXShyZXdyaXR0ZW4pO1xuICAgIHRlbXBsYXRlU291cmNlWydkYXRhJ10oXCJpc1Jld3JpdHRlblwiLCB0cnVlKTtcbn07XG5cbmtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVFbmdpbmUnLCBrby50ZW1wbGF0ZUVuZ2luZSk7XG5cbmtvLnRlbXBsYXRlUmV3cml0aW5nID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWVtb2l6ZURhdGFCaW5kaW5nQXR0cmlidXRlU3ludGF4UmVnZXggPSAvKDwoW2Etel0rXFxkKikoPzpcXHMrKD8hZGF0YS1iaW5kXFxzKj1cXHMqKVthLXowLTlcXC1dKyg/Oj0oPzpcXFwiW15cXFwiXSpcXFwifFxcJ1teXFwnXSpcXCcpKT8pKlxccyspZGF0YS1iaW5kXFxzKj1cXHMqKFtcIiddKShbXFxzXFxTXSo/KVxcMy9naTtcbiAgICB2YXIgbWVtb2l6ZVZpcnR1YWxDb250YWluZXJCaW5kaW5nU3ludGF4UmVnZXggPSAvPCEtLVxccyprb1xcYlxccyooW1xcc1xcU10qPylcXHMqLS0+L2c7XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZURhdGFCaW5kVmFsdWVzRm9yUmV3cml0aW5nKGtleVZhbHVlQXJyYXkpIHtcbiAgICAgICAgdmFyIGFsbFZhbGlkYXRvcnMgPSBrby5leHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9ycztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlWYWx1ZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5VmFsdWVBcnJheVtpXVsna2V5J107XG4gICAgICAgICAgICBpZiAoYWxsVmFsaWRhdG9ycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9IGFsbFZhbGlkYXRvcnNba2V5XTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsaWRhdG9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvc3NpYmxlRXJyb3JNZXNzYWdlID0gdmFsaWRhdG9yKGtleVZhbHVlQXJyYXlbaV1bJ3ZhbHVlJ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2libGVFcnJvck1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocG9zc2libGVFcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHRlbXBsYXRlIGVuZ2luZSBkb2VzIG5vdCBzdXBwb3J0IHRoZSAnXCIgKyBrZXkgKyBcIicgYmluZGluZyB3aXRoaW4gaXRzIHRlbXBsYXRlc1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25zdHJ1Y3RNZW1vaXplZFRhZ1JlcGxhY2VtZW50KGRhdGFCaW5kQXR0cmlidXRlVmFsdWUsIHRhZ1RvUmV0YWluLCBub2RlTmFtZSwgdGVtcGxhdGVFbmdpbmUpIHtcbiAgICAgICAgdmFyIGRhdGFCaW5kS2V5VmFsdWVBcnJheSA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucGFyc2VPYmplY3RMaXRlcmFsKGRhdGFCaW5kQXR0cmlidXRlVmFsdWUpO1xuICAgICAgICB2YWxpZGF0ZURhdGFCaW5kVmFsdWVzRm9yUmV3cml0aW5nKGRhdGFCaW5kS2V5VmFsdWVBcnJheSk7XG4gICAgICAgIHZhciByZXdyaXR0ZW5EYXRhQmluZEF0dHJpYnV0ZVZhbHVlID0ga28uZXhwcmVzc2lvblJld3JpdGluZy5wcmVQcm9jZXNzQmluZGluZ3MoZGF0YUJpbmRLZXlWYWx1ZUFycmF5LCB7J3ZhbHVlQWNjZXNzb3JzJzp0cnVlfSk7XG5cbiAgICAgICAgLy8gRm9yIG5vIG9idmlvdXMgcmVhc29uLCBPcGVyYSBmYWlscyB0byBldmFsdWF0ZSByZXdyaXR0ZW5EYXRhQmluZEF0dHJpYnV0ZVZhbHVlIHVubGVzcyBpdCdzIHdyYXBwZWQgaW4gYW4gYWRkaXRpb25hbFxuICAgICAgICAvLyBhbm9ueW1vdXMgZnVuY3Rpb24sIGV2ZW4gdGhvdWdoIE9wZXJhJ3MgYnVpbHQtaW4gZGVidWdnZXIgY2FuIGV2YWx1YXRlIGl0IGFueXdheS4gTm8gb3RoZXIgYnJvd3NlciByZXF1aXJlcyB0aGlzXG4gICAgICAgIC8vIGV4dHJhIGluZGlyZWN0aW9uLlxuICAgICAgICB2YXIgYXBwbHlCaW5kaW5nc1RvTmV4dFNpYmxpbmdTY3JpcHQgPVxuICAgICAgICAgICAgXCJrby5fX3RyX2FtYnRucyhmdW5jdGlvbigkY29udGV4dCwkZWxlbWVudCl7cmV0dXJuKGZ1bmN0aW9uKCl7cmV0dXJueyBcIiArIHJld3JpdHRlbkRhdGFCaW5kQXR0cmlidXRlVmFsdWUgKyBcIiB9IH0pKCl9LCdcIiArIG5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgKyBcIicpXCI7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUVuZ2luZVsnY3JlYXRlSmF2YVNjcmlwdEV2YWx1YXRvckJsb2NrJ10oYXBwbHlCaW5kaW5nc1RvTmV4dFNpYmxpbmdTY3JpcHQpICsgdGFnVG9SZXRhaW47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZW5zdXJlVGVtcGxhdGVJc1Jld3JpdHRlbjogZnVuY3Rpb24gKHRlbXBsYXRlLCB0ZW1wbGF0ZUVuZ2luZSwgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgICAgICAgICAgaWYgKCF0ZW1wbGF0ZUVuZ2luZVsnaXNUZW1wbGF0ZVJld3JpdHRlbiddKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KSlcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUVuZ2luZVsncmV3cml0ZVRlbXBsYXRlJ10odGVtcGxhdGUsIGZ1bmN0aW9uIChodG1sU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrby50ZW1wbGF0ZVJld3JpdGluZy5tZW1vaXplQmluZGluZ0F0dHJpYnV0ZVN5bnRheChodG1sU3RyaW5nLCB0ZW1wbGF0ZUVuZ2luZSk7XG4gICAgICAgICAgICAgICAgfSwgdGVtcGxhdGVEb2N1bWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWVtb2l6ZUJpbmRpbmdBdHRyaWJ1dGVTeW50YXg6IGZ1bmN0aW9uIChodG1sU3RyaW5nLCB0ZW1wbGF0ZUVuZ2luZSkge1xuICAgICAgICAgICAgcmV0dXJuIGh0bWxTdHJpbmcucmVwbGFjZShtZW1vaXplRGF0YUJpbmRpbmdBdHRyaWJ1dGVTeW50YXhSZWdleCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3RNZW1vaXplZFRhZ1JlcGxhY2VtZW50KC8qIGRhdGFCaW5kQXR0cmlidXRlVmFsdWU6ICovIGFyZ3VtZW50c1s0XSwgLyogdGFnVG9SZXRhaW46ICovIGFyZ3VtZW50c1sxXSwgLyogbm9kZU5hbWU6ICovIGFyZ3VtZW50c1syXSwgdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICAgICAgfSkucmVwbGFjZShtZW1vaXplVmlydHVhbENvbnRhaW5lckJpbmRpbmdTeW50YXhSZWdleCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdE1lbW9pemVkVGFnUmVwbGFjZW1lbnQoLyogZGF0YUJpbmRBdHRyaWJ1dGVWYWx1ZTogKi8gYXJndW1lbnRzWzFdLCAvKiB0YWdUb1JldGFpbjogKi8gXCI8IS0tIGtvIC0tPlwiLCAvKiBub2RlTmFtZTogKi8gXCIjY29tbWVudFwiLCB0ZW1wbGF0ZUVuZ2luZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcHBseU1lbW9pemVkQmluZGluZ3NUb05leHRTaWJsaW5nOiBmdW5jdGlvbiAoYmluZGluZ3MsIG5vZGVOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4ga28ubWVtb2l6YXRpb24ubWVtb2l6ZShmdW5jdGlvbiAoZG9tTm9kZSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZVRvQmluZCA9IGRvbU5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVUb0JpbmQgJiYgbm9kZVRvQmluZC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUobm9kZVRvQmluZCwgYmluZGluZ3MsIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pKCk7XG5cblxuLy8gRXhwb3J0ZWQgb25seSBiZWNhdXNlIGl0IGhhcyB0byBiZSByZWZlcmVuY2VkIGJ5IHN0cmluZyBsb29rdXAgZnJvbSB3aXRoaW4gcmV3cml0dGVuIHRlbXBsYXRlXG5rby5leHBvcnRTeW1ib2woJ19fdHJfYW1idG5zJywga28udGVtcGxhdGVSZXdyaXRpbmcuYXBwbHlNZW1vaXplZEJpbmRpbmdzVG9OZXh0U2libGluZyk7XG4oZnVuY3Rpb24oKSB7XG4gICAgLy8gQSB0ZW1wbGF0ZSBzb3VyY2UgcmVwcmVzZW50cyBhIHJlYWQvd3JpdGUgd2F5IG9mIGFjY2Vzc2luZyBhIHRlbXBsYXRlLiBUaGlzIGlzIHRvIGVsaW1pbmF0ZSB0aGUgbmVlZCBmb3IgdGVtcGxhdGUgbG9hZGluZy9zYXZpbmdcbiAgICAvLyBsb2dpYyB0byBiZSBkdXBsaWNhdGVkIGluIGV2ZXJ5IHRlbXBsYXRlIGVuZ2luZSAoYW5kIG1lYW5zIHRoZXkgY2FuIGFsbCB3b3JrIHdpdGggYW5vbnltb3VzIHRlbXBsYXRlcywgZXRjLilcbiAgICAvL1xuICAgIC8vIFR3byBhcmUgcHJvdmlkZWQgYnkgZGVmYXVsdDpcbiAgICAvLyAgMS4ga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQgICAgICAgLSByZWFkcy93cml0ZXMgdGhlIHRleHQgY29udGVudCBvZiBhbiBhcmJpdHJhcnkgRE9NIGVsZW1lbnRcbiAgICAvLyAgMi4ga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c0VsZW1lbnQgLSB1c2VzIGtvLnV0aWxzLmRvbURhdGEgdG8gcmVhZC93cml0ZSB0ZXh0ICphc3NvY2lhdGVkKiB3aXRoIHRoZSBET00gZWxlbWVudCwgYnV0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aG91dCByZWFkaW5nL3dyaXRpbmcgdGhlIGFjdHVhbCBlbGVtZW50IHRleHQgY29udGVudCwgc2luY2UgaXQgd2lsbCBiZSBvdmVyd3JpdHRlblxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIHJlbmRlcmVkIHRlbXBsYXRlIG91dHB1dC5cbiAgICAvLyBZb3UgY2FuIGltcGxlbWVudCB5b3VyIG93biB0ZW1wbGF0ZSBzb3VyY2UgaWYgeW91IHdhbnQgdG8gZmV0Y2gvc3RvcmUgdGVtcGxhdGVzIHNvbWV3aGVyZSBvdGhlciB0aGFuIGluIERPTSBlbGVtZW50cy5cbiAgICAvLyBUZW1wbGF0ZSBzb3VyY2VzIG5lZWQgdG8gaGF2ZSB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uczpcbiAgICAvLyAgIHRleHQoKSBcdFx0XHQtIHJldHVybnMgdGhlIHRlbXBsYXRlIHRleHQgZnJvbSB5b3VyIHN0b3JhZ2UgbG9jYXRpb25cbiAgICAvLyAgIHRleHQodmFsdWUpXHRcdC0gd3JpdGVzIHRoZSBzdXBwbGllZCB0ZW1wbGF0ZSB0ZXh0IHRvIHlvdXIgc3RvcmFnZSBsb2NhdGlvblxuICAgIC8vICAgZGF0YShrZXkpXHRcdFx0LSByZWFkcyB2YWx1ZXMgc3RvcmVkIHVzaW5nIGRhdGEoa2V5LCB2YWx1ZSkgLSBzZWUgYmVsb3dcbiAgICAvLyAgIGRhdGEoa2V5LCB2YWx1ZSlcdC0gYXNzb2NpYXRlcyBcInZhbHVlXCIgd2l0aCB0aGlzIHRlbXBsYXRlIGFuZCB0aGUga2V5IFwia2V5XCIuIElzIHVzZWQgdG8gc3RvcmUgaW5mb3JtYXRpb24gbGlrZSBcImlzUmV3cml0dGVuXCIuXG4gICAgLy9cbiAgICAvLyBPcHRpb25hbGx5LCB0ZW1wbGF0ZSBzb3VyY2VzIGNhbiBhbHNvIGhhdmUgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gICAgLy8gICBub2RlcygpICAgICAgICAgICAgLSByZXR1cm5zIGEgRE9NIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbm9kZXMgb2YgdGhpcyB0ZW1wbGF0ZSwgd2hlcmUgYXZhaWxhYmxlXG4gICAgLy8gICBub2Rlcyh2YWx1ZSkgICAgICAgLSB3cml0ZXMgdGhlIGdpdmVuIERPTSBlbGVtZW50IHRvIHlvdXIgc3RvcmFnZSBsb2NhdGlvblxuICAgIC8vIElmIGEgRE9NIGVsZW1lbnQgaXMgYXZhaWxhYmxlIGZvciBhIGdpdmVuIHRlbXBsYXRlIHNvdXJjZSwgdGVtcGxhdGUgZW5naW5lcyBhcmUgZW5jb3VyYWdlZCB0byB1c2UgaXQgaW4gcHJlZmVyZW5jZSBvdmVyIHRleHQoKVxuICAgIC8vIGZvciBpbXByb3ZlZCBzcGVlZC4gSG93ZXZlciwgYWxsIHRlbXBsYXRlU291cmNlcyBtdXN0IHN1cHBseSB0ZXh0KCkgZXZlbiBpZiB0aGV5IGRvbid0IHN1cHBseSBub2RlcygpLlxuICAgIC8vXG4gICAgLy8gT25jZSB5b3UndmUgaW1wbGVtZW50ZWQgYSB0ZW1wbGF0ZVNvdXJjZSwgbWFrZSB5b3VyIHRlbXBsYXRlIGVuZ2luZSB1c2UgaXQgYnkgc3ViY2xhc3Npbmcgd2hhdGV2ZXIgdGVtcGxhdGUgZW5naW5lIHlvdSB3ZXJlXG4gICAgLy8gdXNpbmcgYW5kIG92ZXJyaWRpbmcgXCJtYWtlVGVtcGxhdGVTb3VyY2VcIiB0byByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgeW91ciBjdXN0b20gdGVtcGxhdGUgc291cmNlLlxuXG4gICAga28udGVtcGxhdGVTb3VyY2VzID0ge307XG5cbiAgICAvLyAtLS0tIGtvLnRlbXBsYXRlU291cmNlcy5kb21FbGVtZW50IC0tLS0tXG5cbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudC5wcm90b3R5cGVbJ3RleHQnXSA9IGZ1bmN0aW9uKC8qIHZhbHVlVG9Xcml0ZSAqLykge1xuICAgICAgICB2YXIgdGFnTmFtZUxvd2VyID0ga28udXRpbHMudGFnTmFtZUxvd2VyKHRoaXMuZG9tRWxlbWVudCksXG4gICAgICAgICAgICBlbGVtQ29udGVudHNQcm9wZXJ0eSA9IHRhZ05hbWVMb3dlciA9PT0gXCJzY3JpcHRcIiA/IFwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHRhZ05hbWVMb3dlciA9PT0gXCJ0ZXh0YXJlYVwiID8gXCJ2YWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiaW5uZXJIVE1MXCI7XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tRWxlbWVudFtlbGVtQ29udGVudHNQcm9wZXJ0eV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVUb1dyaXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgaWYgKGVsZW1Db250ZW50c1Byb3BlcnR5ID09PSBcImlubmVySFRNTFwiKVxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldEh0bWwodGhpcy5kb21FbGVtZW50LCB2YWx1ZVRvV3JpdGUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZG9tRWxlbWVudFtlbGVtQ29udGVudHNQcm9wZXJ0eV0gPSB2YWx1ZVRvV3JpdGU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGRhdGFEb21EYXRhUHJlZml4ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCkgKyBcIl9cIjtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudC5wcm90b3R5cGVbJ2RhdGEnXSA9IGZ1bmN0aW9uKGtleSAvKiwgdmFsdWVUb1dyaXRlICovKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4ga28udXRpbHMuZG9tRGF0YS5nZXQodGhpcy5kb21FbGVtZW50LCBkYXRhRG9tRGF0YVByZWZpeCArIGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrby51dGlscy5kb21EYXRhLnNldCh0aGlzLmRvbUVsZW1lbnQsIGRhdGFEb21EYXRhUHJlZml4ICsga2V5LCBhcmd1bWVudHNbMV0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIC0tLS0ga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlIC0tLS0tXG4gICAgLy8gQW5vbnltb3VzIHRlbXBsYXRlcyBhcmUgbm9ybWFsbHkgc2F2ZWQvcmV0cmlldmVkIGFzIERPTSBub2RlcyB0aHJvdWdoIFwibm9kZXNcIi5cbiAgICAvLyBGb3IgY29tcGF0aWJpbGl0eSwgeW91IGNhbiBhbHNvIHJlYWQgXCJ0ZXh0XCI7IGl0IHdpbGwgYmUgc2VyaWFsaXplZCBmcm9tIHRoZSBub2RlcyBvbiBkZW1hbmQuXG4gICAgLy8gV3JpdGluZyB0byBcInRleHRcIiBpcyBzdGlsbCBzdXBwb3J0ZWQsIGJ1dCB0aGVuIHRoZSB0ZW1wbGF0ZSBkYXRhIHdpbGwgbm90IGJlIGF2YWlsYWJsZSBhcyBET00gbm9kZXMuXG5cbiAgICB2YXIgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpO1xuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5kb21FbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlLnByb3RvdHlwZSA9IG5ldyBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudCgpO1xuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGU7XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlLnByb3RvdHlwZVsndGV4dCddID0gZnVuY3Rpb24oLyogdmFsdWVUb1dyaXRlICovKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBrby51dGlscy5kb21EYXRhLmdldCh0aGlzLmRvbUVsZW1lbnQsIGFub255bW91c1RlbXBsYXRlc0RvbURhdGFLZXkpIHx8IHt9O1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YS50ZXh0RGF0YSA9PT0gdW5kZWZpbmVkICYmIHRlbXBsYXRlRGF0YS5jb250YWluZXJEYXRhKVxuICAgICAgICAgICAgICAgIHRlbXBsYXRlRGF0YS50ZXh0RGF0YSA9IHRlbXBsYXRlRGF0YS5jb250YWluZXJEYXRhLmlubmVySFRNTDtcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZURhdGEudGV4dERhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVUb1dyaXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQodGhpcy5kb21FbGVtZW50LCBhbm9ueW1vdXNUZW1wbGF0ZXNEb21EYXRhS2V5LCB7dGV4dERhdGE6IHZhbHVlVG9Xcml0ZX0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudC5wcm90b3R5cGVbJ25vZGVzJ10gPSBmdW5jdGlvbigvKiB2YWx1ZVRvV3JpdGUgKi8pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlRGF0YSA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KHRoaXMuZG9tRWxlbWVudCwgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSkgfHwge307XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVEYXRhLmNvbnRhaW5lckRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVUb1dyaXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQodGhpcy5kb21FbGVtZW50LCBhbm9ueW1vdXNUZW1wbGF0ZXNEb21EYXRhS2V5LCB7Y29udGFpbmVyRGF0YTogdmFsdWVUb1dyaXRlfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28uZXhwb3J0U3ltYm9sKCd0ZW1wbGF0ZVNvdXJjZXMnLCBrby50ZW1wbGF0ZVNvdXJjZXMpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQnLCBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudCk7XG4gICAga28uZXhwb3J0U3ltYm9sKCd0ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUnLCBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUpO1xufSkoKTtcbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90ZW1wbGF0ZUVuZ2luZTtcbiAgICBrby5zZXRUZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZUVuZ2luZSkge1xuICAgICAgICBpZiAoKHRlbXBsYXRlRW5naW5lICE9IHVuZGVmaW5lZCkgJiYgISh0ZW1wbGF0ZUVuZ2luZSBpbnN0YW5jZW9mIGtvLnRlbXBsYXRlRW5naW5lKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRlbXBsYXRlRW5naW5lIG11c3QgaW5oZXJpdCBmcm9tIGtvLnRlbXBsYXRlRW5naW5lXCIpO1xuICAgICAgICBfdGVtcGxhdGVFbmdpbmUgPSB0ZW1wbGF0ZUVuZ2luZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZva2VGb3JFYWNoTm9kZUluQ29udGludW91c1JhbmdlKGZpcnN0Tm9kZSwgbGFzdE5vZGUsIGFjdGlvbikge1xuICAgICAgICB2YXIgbm9kZSwgbmV4dEluUXVldWUgPSBmaXJzdE5vZGUsIGZpcnN0T3V0T2ZSYW5nZU5vZGUgPSBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcobGFzdE5vZGUpO1xuICAgICAgICB3aGlsZSAobmV4dEluUXVldWUgJiYgKChub2RlID0gbmV4dEluUXVldWUpICE9PSBmaXJzdE91dE9mUmFuZ2VOb2RlKSkge1xuICAgICAgICAgICAgbmV4dEluUXVldWUgPSBrby52aXJ0dWFsRWxlbWVudHMubmV4dFNpYmxpbmcobm9kZSk7XG4gICAgICAgICAgICBhY3Rpb24obm9kZSwgbmV4dEluUXVldWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWN0aXZhdGVCaW5kaW5nc09uQ29udGludW91c05vZGVBcnJheShjb250aW51b3VzTm9kZUFycmF5LCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAvLyBUbyBiZSB1c2VkIG9uIGFueSBub2RlcyB0aGF0IGhhdmUgYmVlbiByZW5kZXJlZCBieSBhIHRlbXBsYXRlIGFuZCBoYXZlIGJlZW4gaW5zZXJ0ZWQgaW50byBzb21lIHBhcmVudCBlbGVtZW50XG4gICAgICAgIC8vIFdhbGtzIHRocm91Z2ggY29udGludW91c05vZGVBcnJheSAod2hpY2ggKm11c3QqIGJlIGNvbnRpbnVvdXMsIGkuZS4sIGFuIHVuaW50ZXJydXB0ZWQgc2VxdWVuY2Ugb2Ygc2libGluZyBub2RlcywgYmVjYXVzZVxuICAgICAgICAvLyB0aGUgYWxnb3JpdGhtIGZvciB3YWxraW5nIHRoZW0gcmVsaWVzIG9uIHRoaXMpLCBhbmQgZm9yIGVhY2ggdG9wLWxldmVsIGl0ZW0gaW4gdGhlIHZpcnR1YWwtZWxlbWVudCBzZW5zZSxcbiAgICAgICAgLy8gKDEpIERvZXMgYSByZWd1bGFyIFwiYXBwbHlCaW5kaW5nc1wiIHRvIGFzc29jaWF0ZSBiaW5kaW5nQ29udGV4dCB3aXRoIHRoaXMgbm9kZSBhbmQgdG8gYWN0aXZhdGUgYW55IG5vbi1tZW1vaXplZCBiaW5kaW5nc1xuICAgICAgICAvLyAoMikgVW5tZW1vaXplcyBhbnkgbWVtb3MgaW4gdGhlIERPTSBzdWJ0cmVlIChlLmcuLCB0byBhY3RpdmF0ZSBiaW5kaW5ncyB0aGF0IGhhZCBiZWVuIG1lbW9pemVkIGR1cmluZyB0ZW1wbGF0ZSByZXdyaXRpbmcpXG5cbiAgICAgICAgaWYgKGNvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgZmlyc3ROb2RlID0gY29udGludW91c05vZGVBcnJheVswXSxcbiAgICAgICAgICAgICAgICBsYXN0Tm9kZSA9IGNvbnRpbnVvdXNOb2RlQXJyYXlbY29udGludW91c05vZGVBcnJheS5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gZmlyc3ROb2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIgPSBrby5iaW5kaW5nUHJvdmlkZXJbJ2luc3RhbmNlJ10sXG4gICAgICAgICAgICAgICAgcHJlcHJvY2Vzc05vZGUgPSBwcm92aWRlclsncHJlcHJvY2Vzc05vZGUnXTtcblxuICAgICAgICAgICAgaWYgKHByZXByb2Nlc3NOb2RlKSB7XG4gICAgICAgICAgICAgICAgaW52b2tlRm9yRWFjaE5vZGVJbkNvbnRpbnVvdXNSYW5nZShmaXJzdE5vZGUsIGxhc3ROb2RlLCBmdW5jdGlvbihub2RlLCBuZXh0Tm9kZUluUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVQcmV2aW91c1NpYmxpbmcgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05vZGVzID0gcHJlcHJvY2Vzc05vZGUuY2FsbChwcm92aWRlciwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUgPT09IGZpcnN0Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5vZGUgPSBuZXdOb2Rlc1swXSB8fCBuZXh0Tm9kZUluUmFuZ2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZSA9PT0gbGFzdE5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5vZGUgPSBuZXdOb2Rlc1tuZXdOb2Rlcy5sZW5ndGggLSAxXSB8fCBub2RlUHJldmlvdXNTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHByZXByb2Nlc3NOb2RlIGNhbiBjaGFuZ2UgdGhlIG5vZGVzLCBpbmNsdWRpbmcgdGhlIGZpcnN0IGFuZCBsYXN0IG5vZGVzLCB1cGRhdGUgY29udGludW91c05vZGVBcnJheSB0byBtYXRjaC5cbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRoZSBmdWxsIHNldCwgaW5jbHVkaW5nIGlubmVyIG5vZGVzLCBiZWNhdXNlIHRoZSB1bm1lbW9pemUgc3RlcCBtaWdodCByZW1vdmUgdGhlIGZpcnN0IG5vZGUgKGFuZCBzbyB0aGUgcmVhbFxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IG5vZGUgbmVlZHMgdG8gYmUgaW4gdGhlIGFycmF5KS5cbiAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKCFmaXJzdE5vZGUpIHsgLy8gcHJlcHJvY2Vzc05vZGUgbWlnaHQgaGF2ZSByZW1vdmVkIGFsbCB0aGUgbm9kZXMsIGluIHdoaWNoIGNhc2UgdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZmlyc3ROb2RlID09PSBsYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnB1c2goZmlyc3ROb2RlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnB1c2goZmlyc3ROb2RlLCBsYXN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShjb250aW51b3VzTm9kZUFycmF5LCBwYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5lZWQgdG8gYXBwbHlCaW5kaW5ncyAqYmVmb3JlKiB1bm1lbW96aWF0aW9uLCBiZWNhdXNlIHVubWVtb2l6YXRpb24gbWlnaHQgaW50cm9kdWNlIGV4dHJhIG5vZGVzICh0aGF0IHdlIGRvbid0IHdhbnQgdG8gcmUtYmluZClcbiAgICAgICAgICAgIC8vIHdoZXJlYXMgYSByZWd1bGFyIGFwcGx5QmluZGluZ3Mgd29uJ3QgaW50cm9kdWNlIG5ldyBtZW1vaXplZCBub2Rlc1xuICAgICAgICAgICAgaW52b2tlRm9yRWFjaE5vZGVJbkNvbnRpbnVvdXNSYW5nZShmaXJzdE5vZGUsIGxhc3ROb2RlLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgfHwgbm9kZS5ub2RlVHlwZSA9PT0gOClcbiAgICAgICAgICAgICAgICAgICAga28uYXBwbHlCaW5kaW5ncyhiaW5kaW5nQ29udGV4dCwgbm9kZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGludm9rZUZvckVhY2hOb2RlSW5Db250aW51b3VzUmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIHx8IG5vZGUubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICAgICAgICAgIGtvLm1lbW9pemF0aW9uLnVubWVtb2l6ZURvbU5vZGVBbmREZXNjZW5kYW50cyhub2RlLCBbYmluZGluZ0NvbnRleHRdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgYW55IGNoYW5nZXMgZG9uZSBieSBhcHBseUJpbmRpbmdzIG9yIHVubWVtb2l6ZSBhcmUgcmVmbGVjdGVkIGluIHRoZSBhcnJheVxuICAgICAgICAgICAga28udXRpbHMuZml4VXBDb250aW51b3VzTm9kZUFycmF5KGNvbnRpbnVvdXNOb2RlQXJyYXksIHBhcmVudE5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkobm9kZU9yTm9kZUFycmF5KSB7XG4gICAgICAgIHJldHVybiBub2RlT3JOb2RlQXJyYXkubm9kZVR5cGUgPyBub2RlT3JOb2RlQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5vZGVPck5vZGVBcnJheS5sZW5ndGggPiAwID8gbm9kZU9yTm9kZUFycmF5WzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4ZWN1dGVUZW1wbGF0ZSh0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlck1vZGUsIHRlbXBsYXRlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdmFyIGZpcnN0VGFyZ2V0Tm9kZSA9IHRhcmdldE5vZGVPck5vZGVBcnJheSAmJiBnZXRGaXJzdE5vZGVGcm9tUG9zc2libGVBcnJheSh0YXJnZXROb2RlT3JOb2RlQXJyYXkpO1xuICAgICAgICB2YXIgdGVtcGxhdGVEb2N1bWVudCA9IGZpcnN0VGFyZ2V0Tm9kZSAmJiBmaXJzdFRhcmdldE5vZGUub3duZXJEb2N1bWVudDtcbiAgICAgICAgdmFyIHRlbXBsYXRlRW5naW5lVG9Vc2UgPSAob3B0aW9uc1sndGVtcGxhdGVFbmdpbmUnXSB8fCBfdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICBrby50ZW1wbGF0ZVJld3JpdGluZy5lbnN1cmVUZW1wbGF0ZUlzUmV3cml0dGVuKHRlbXBsYXRlLCB0ZW1wbGF0ZUVuZ2luZVRvVXNlLCB0ZW1wbGF0ZURvY3VtZW50KTtcbiAgICAgICAgdmFyIHJlbmRlcmVkTm9kZXNBcnJheSA9IHRlbXBsYXRlRW5naW5lVG9Vc2VbJ3JlbmRlclRlbXBsYXRlJ10odGVtcGxhdGUsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCB0ZW1wbGF0ZURvY3VtZW50KTtcblxuICAgICAgICAvLyBMb29zZWx5IGNoZWNrIHJlc3VsdCBpcyBhbiBhcnJheSBvZiBET00gbm9kZXNcbiAgICAgICAgaWYgKCh0eXBlb2YgcmVuZGVyZWROb2Rlc0FycmF5Lmxlbmd0aCAhPSBcIm51bWJlclwiKSB8fCAocmVuZGVyZWROb2Rlc0FycmF5Lmxlbmd0aCA+IDAgJiYgdHlwZW9mIHJlbmRlcmVkTm9kZXNBcnJheVswXS5ub2RlVHlwZSAhPSBcIm51bWJlclwiKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlIGVuZ2luZSBtdXN0IHJldHVybiBhbiBhcnJheSBvZiBET00gbm9kZXNcIik7XG5cbiAgICAgICAgdmFyIGhhdmVBZGRlZE5vZGVzVG9QYXJlbnQgPSBmYWxzZTtcbiAgICAgICAgc3dpdGNoIChyZW5kZXJNb2RlKSB7XG4gICAgICAgICAgICBjYXNlIFwicmVwbGFjZUNoaWxkcmVuXCI6XG4gICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLnNldERvbU5vZGVDaGlsZHJlbih0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlcmVkTm9kZXNBcnJheSk7XG4gICAgICAgICAgICAgICAgaGF2ZUFkZGVkTm9kZXNUb1BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwicmVwbGFjZU5vZGVcIjpcbiAgICAgICAgICAgICAgICBrby51dGlscy5yZXBsYWNlRG9tTm9kZXModGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJlZE5vZGVzQXJyYXkpO1xuICAgICAgICAgICAgICAgIGhhdmVBZGRlZE5vZGVzVG9QYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImlnbm9yZVRhcmdldE5vZGVcIjogYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gcmVuZGVyTW9kZTogXCIgKyByZW5kZXJNb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXZlQWRkZWROb2Rlc1RvUGFyZW50KSB7XG4gICAgICAgICAgICBhY3RpdmF0ZUJpbmRpbmdzT25Db250aW51b3VzTm9kZUFycmF5KHJlbmRlcmVkTm9kZXNBcnJheSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnNbJ2FmdGVyUmVuZGVyJ10pXG4gICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUob3B0aW9uc1snYWZ0ZXJSZW5kZXInXSwgbnVsbCwgW3JlbmRlcmVkTm9kZXNBcnJheSwgYmluZGluZ0NvbnRleHRbJyRkYXRhJ11dKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZW5kZXJlZE5vZGVzQXJyYXk7XG4gICAgfVxuXG4gICAga28ucmVuZGVyVGVtcGxhdGUgPSBmdW5jdGlvbiAodGVtcGxhdGUsIGRhdGFPckJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCB0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlck1vZGUpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGlmICgob3B0aW9uc1sndGVtcGxhdGVFbmdpbmUnXSB8fCBfdGVtcGxhdGVFbmdpbmUpID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldCBhIHRlbXBsYXRlIGVuZ2luZSBiZWZvcmUgY2FsbGluZyByZW5kZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgcmVuZGVyTW9kZSA9IHJlbmRlck1vZGUgfHwgXCJyZXBsYWNlQ2hpbGRyZW5cIjtcblxuICAgICAgICBpZiAodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KSB7XG4gICAgICAgICAgICB2YXIgZmlyc3RUYXJnZXROb2RlID0gZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KTtcblxuICAgICAgICAgICAgdmFyIHdoZW5Ub0Rpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAoIWZpcnN0VGFyZ2V0Tm9kZSkgfHwgIWtvLnV0aWxzLmRvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudChmaXJzdFRhcmdldE5vZGUpOyB9OyAvLyBQYXNzaXZlIGRpc3Bvc2FsIChvbiBuZXh0IGV2YWx1YXRpb24pXG4gICAgICAgICAgICB2YXIgYWN0aXZlbHlEaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQgPSAoZmlyc3RUYXJnZXROb2RlICYmIHJlbmRlck1vZGUgPT0gXCJyZXBsYWNlTm9kZVwiKSA/IGZpcnN0VGFyZ2V0Tm9kZS5wYXJlbnROb2RlIDogZmlyc3RUYXJnZXROb2RlO1xuXG4gICAgICAgICAgICByZXR1cm4ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSggLy8gU28gdGhlIERPTSBpcyBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgd2hlbiBhbnkgZGVwZW5kZW5jeSBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBFbnN1cmUgd2UndmUgZ290IGEgcHJvcGVyIGJpbmRpbmcgY29udGV4dCB0byB3b3JrIHdpdGhcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpbmRpbmdDb250ZXh0ID0gKGRhdGFPckJpbmRpbmdDb250ZXh0ICYmIChkYXRhT3JCaW5kaW5nQ29udGV4dCBpbnN0YW5jZW9mIGtvLmJpbmRpbmdDb250ZXh0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGF0YU9yQmluZGluZ0NvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IGtvLmJpbmRpbmdDb250ZXh0KGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YU9yQmluZGluZ0NvbnRleHQpKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTdXBwb3J0IHNlbGVjdGluZyB0ZW1wbGF0ZSBhcyBhIGZ1bmN0aW9uIG9mIHRoZSBkYXRhIGJlaW5nIHJlbmRlcmVkXG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZU5hbWUgPSBrby5pc09ic2VydmFibGUodGVtcGxhdGUpID8gdGVtcGxhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiB0eXBlb2YodGVtcGxhdGUpID09ICdmdW5jdGlvbicgPyB0ZW1wbGF0ZShiaW5kaW5nQ29udGV4dFsnJGRhdGEnXSwgYmluZGluZ0NvbnRleHQpIDogdGVtcGxhdGU7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlbmRlcmVkTm9kZXNBcnJheSA9IGV4ZWN1dGVUZW1wbGF0ZSh0YXJnZXROb2RlT3JOb2RlQXJyYXksIHJlbmRlck1vZGUsIHRlbXBsYXRlTmFtZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVuZGVyTW9kZSA9PSBcInJlcGxhY2VOb2RlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5vZGVPck5vZGVBcnJheSA9IHJlbmRlcmVkTm9kZXNBcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VGFyZ2V0Tm9kZSA9IGdldEZpcnN0Tm9kZUZyb21Qb3NzaWJsZUFycmF5KHRhcmdldE5vZGVPck5vZGVBcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgeyBkaXNwb3NlV2hlbjogd2hlblRvRGlzcG9zZSwgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBhY3RpdmVseURpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgeWV0IGhhdmUgYSBET00gbm9kZSB0byBldmFsdWF0ZSwgc28gdXNlIGEgbWVtbyBhbmQgcmVuZGVyIHRoZSB0ZW1wbGF0ZSBsYXRlciB3aGVuIHRoZXJlIGlzIGEgRE9NIG5vZGVcbiAgICAgICAgICAgIHJldHVybiBrby5tZW1vaXphdGlvbi5tZW1vaXplKGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgICAgICAgICAgICAga28ucmVuZGVyVGVtcGxhdGUodGVtcGxhdGUsIGRhdGFPckJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCBkb21Ob2RlLCBcInJlcGxhY2VOb2RlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28ucmVuZGVyVGVtcGxhdGVGb3JFYWNoID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBhcnJheU9yT2JzZXJ2YWJsZUFycmF5LCBvcHRpb25zLCB0YXJnZXROb2RlLCBwYXJlbnRCaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAvLyBTaW5jZSBzZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nIGFsd2F5cyBjYWxscyBleGVjdXRlVGVtcGxhdGVGb3JBcnJheUl0ZW0gYW5kIHRoZW5cbiAgICAgICAgLy8gYWN0aXZhdGVCaW5kaW5nc0NhbGxiYWNrIGZvciBhZGRlZCBpdGVtcywgd2UgY2FuIHN0b3JlIHRoZSBiaW5kaW5nIGNvbnRleHQgaW4gdGhlIGZvcm1lciB0byB1c2UgaW4gdGhlIGxhdHRlci5cbiAgICAgICAgdmFyIGFycmF5SXRlbUNvbnRleHQ7XG5cbiAgICAgICAgLy8gVGhpcyB3aWxsIGJlIGNhbGxlZCBieSBzZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nIHRvIGdldCB0aGUgbm9kZXMgdG8gYWRkIHRvIHRhcmdldE5vZGVcbiAgICAgICAgdmFyIGV4ZWN1dGVUZW1wbGF0ZUZvckFycmF5SXRlbSA9IGZ1bmN0aW9uIChhcnJheVZhbHVlLCBpbmRleCkge1xuICAgICAgICAgICAgLy8gU3VwcG9ydCBzZWxlY3RpbmcgdGVtcGxhdGUgYXMgYSBmdW5jdGlvbiBvZiB0aGUgZGF0YSBiZWluZyByZW5kZXJlZFxuICAgICAgICAgICAgYXJyYXlJdGVtQ29udGV4dCA9IHBhcmVudEJpbmRpbmdDb250ZXh0WydjcmVhdGVDaGlsZENvbnRleHQnXShhcnJheVZhbHVlLCBvcHRpb25zWydhcyddLCBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFsnJGluZGV4J10gPSBpbmRleDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlTmFtZSA9IHR5cGVvZih0ZW1wbGF0ZSkgPT0gJ2Z1bmN0aW9uJyA/IHRlbXBsYXRlKGFycmF5VmFsdWUsIGFycmF5SXRlbUNvbnRleHQpIDogdGVtcGxhdGU7XG4gICAgICAgICAgICByZXR1cm4gZXhlY3V0ZVRlbXBsYXRlKG51bGwsIFwiaWdub3JlVGFyZ2V0Tm9kZVwiLCB0ZW1wbGF0ZU5hbWUsIGFycmF5SXRlbUNvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciBzZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nIGhhcyBhZGRlZCBub2RlcyB0byB0YXJnZXROb2RlXG4gICAgICAgIHZhciBhY3RpdmF0ZUJpbmRpbmdzQ2FsbGJhY2sgPSBmdW5jdGlvbihhcnJheVZhbHVlLCBhZGRlZE5vZGVzQXJyYXksIGluZGV4KSB7XG4gICAgICAgICAgICBhY3RpdmF0ZUJpbmRpbmdzT25Db250aW51b3VzTm9kZUFycmF5KGFkZGVkTm9kZXNBcnJheSwgYXJyYXlJdGVtQ29udGV4dCk7XG4gICAgICAgICAgICBpZiAob3B0aW9uc1snYWZ0ZXJSZW5kZXInXSlcbiAgICAgICAgICAgICAgICBvcHRpb25zWydhZnRlclJlbmRlciddKGFkZGVkTm9kZXNBcnJheSwgYXJyYXlWYWx1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGtvLmRlcGVuZGVudE9ic2VydmFibGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVud3JhcHBlZEFycmF5ID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhcnJheU9yT2JzZXJ2YWJsZUFycmF5KSB8fCBbXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdW53cmFwcGVkQXJyYXkubGVuZ3RoID09IFwidW5kZWZpbmVkXCIpIC8vIENvZXJjZSBzaW5nbGUgdmFsdWUgaW50byBhcnJheVxuICAgICAgICAgICAgICAgIHVud3JhcHBlZEFycmF5ID0gW3Vud3JhcHBlZEFycmF5XTtcblxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBhbnkgZW50cmllcyBtYXJrZWQgYXMgZGVzdHJveWVkXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWRBcnJheSA9IGtvLnV0aWxzLmFycmF5RmlsdGVyKHVud3JhcHBlZEFycmF5LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNbJ2luY2x1ZGVEZXN0cm95ZWQnXSB8fCBpdGVtID09PSB1bmRlZmluZWQgfHwgaXRlbSA9PT0gbnVsbCB8fCAha28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShpdGVtWydfZGVzdHJveSddKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDYWxsIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcsIGlnbm9yaW5nIGFueSBvYnNlcnZhYmxlcyB1bndyYXBwZWQgd2l0aGluIChtb3N0IGxpa2VseSBmcm9tIGEgY2FsbGJhY2sgZnVuY3Rpb24pLlxuICAgICAgICAgICAgLy8gSWYgdGhlIGFycmF5IGl0ZW1zIGFyZSBvYnNlcnZhYmxlcywgdGhvdWdoLCB0aGV5IHdpbGwgYmUgdW53cmFwcGVkIGluIGV4ZWN1dGVUZW1wbGF0ZUZvckFycmF5SXRlbSBhbmQgbWFuYWdlZCB3aXRoaW4gc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZy5cbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcsIG51bGwsIFt0YXJnZXROb2RlLCBmaWx0ZXJlZEFycmF5LCBleGVjdXRlVGVtcGxhdGVGb3JBcnJheUl0ZW0sIG9wdGlvbnMsIGFjdGl2YXRlQmluZGluZ3NDYWxsYmFja10pO1xuXG4gICAgICAgIH0sIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiB0YXJnZXROb2RlIH0pO1xuICAgIH07XG5cbiAgICB2YXIgdGVtcGxhdGVDb21wdXRlZERvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICBmdW5jdGlvbiBkaXNwb3NlT2xkQ29tcHV0ZWRBbmRTdG9yZU5ld09uZShlbGVtZW50LCBuZXdDb21wdXRlZCkge1xuICAgICAgICB2YXIgb2xkQ29tcHV0ZWQgPSBrby51dGlscy5kb21EYXRhLmdldChlbGVtZW50LCB0ZW1wbGF0ZUNvbXB1dGVkRG9tRGF0YUtleSk7XG4gICAgICAgIGlmIChvbGRDb21wdXRlZCAmJiAodHlwZW9mKG9sZENvbXB1dGVkLmRpc3Bvc2UpID09ICdmdW5jdGlvbicpKVxuICAgICAgICAgICAgb2xkQ29tcHV0ZWQuZGlzcG9zZSgpO1xuICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChlbGVtZW50LCB0ZW1wbGF0ZUNvbXB1dGVkRG9tRGF0YUtleSwgKG5ld0NvbXB1dGVkICYmIG5ld0NvbXB1dGVkLmlzQWN0aXZlKCkpID8gbmV3Q29tcHV0ZWQgOiB1bmRlZmluZWQpO1xuICAgIH1cblxuICAgIGtvLmJpbmRpbmdIYW5kbGVyc1sndGVtcGxhdGUnXSA9IHtcbiAgICAgICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgICAgICAvLyBTdXBwb3J0IGFub255bW91cyB0ZW1wbGF0ZXNcbiAgICAgICAgICAgIHZhciBiaW5kaW5nVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJpbmRpbmdWYWx1ZSA9PSBcInN0cmluZ1wiIHx8IGJpbmRpbmdWYWx1ZVsnbmFtZSddKSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBhIG5hbWVkIHRlbXBsYXRlIC0gY2xlYXIgdGhlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJdCdzIGFuIGFub255bW91cyB0ZW1wbGF0ZSAtIHN0b3JlIHRoZSBlbGVtZW50IGNvbnRlbnRzLCB0aGVuIGNsZWFyIHRoZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlTm9kZXMgPSBrby52aXJ0dWFsRWxlbWVudHMuY2hpbGROb2RlcyhlbGVtZW50KSxcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0ga28udXRpbHMubW92ZUNsZWFuZWROb2Rlc1RvQ29udGFpbmVyRWxlbWVudCh0ZW1wbGF0ZU5vZGVzKTsgLy8gVGhpcyBhbHNvIHJlbW92ZXMgdGhlIG5vZGVzIGZyb20gdGhlaXIgY3VycmVudCBwYXJlbnRcbiAgICAgICAgICAgICAgICBuZXcga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlKGVsZW1lbnQpWydub2RlcyddKGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyAnY29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MnOiB0cnVlIH07XG4gICAgICAgIH0sXG4gICAgICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKSxcbiAgICAgICAgICAgICAgICBkYXRhVmFsdWUsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWUpLFxuICAgICAgICAgICAgICAgIHNob3VsZERpc3BsYXkgPSB0cnVlLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlQ29tcHV0ZWQgPSBudWxsLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlTmFtZTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlTmFtZSA9IG9wdGlvbnNbJ25hbWUnXTtcblxuICAgICAgICAgICAgICAgIC8vIFN1cHBvcnQgXCJpZlwiL1wiaWZub3RcIiBjb25kaXRpb25zXG4gICAgICAgICAgICAgICAgaWYgKCdpZicgaW4gb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkRGlzcGxheSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUob3B0aW9uc1snaWYnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZERpc3BsYXkgJiYgJ2lmbm90JyBpbiBvcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICBzaG91bGREaXNwbGF5ID0gIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUob3B0aW9uc1snaWZub3QnXSk7XG5cbiAgICAgICAgICAgICAgICBkYXRhVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG9wdGlvbnNbJ2RhdGEnXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgnZm9yZWFjaCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIC8vIFJlbmRlciBvbmNlIGZvciBlYWNoIGRhdGEgcG9pbnQgKHRyZWF0aW5nIGRhdGEgc2V0IGFzIGVtcHR5IGlmIHNob3VsZERpc3BsYXk9PWZhbHNlKVxuICAgICAgICAgICAgICAgIHZhciBkYXRhQXJyYXkgPSAoc2hvdWxkRGlzcGxheSAmJiBvcHRpb25zWydmb3JlYWNoJ10pIHx8IFtdO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlQ29tcHV0ZWQgPSBrby5yZW5kZXJUZW1wbGF0ZUZvckVhY2godGVtcGxhdGVOYW1lIHx8IGVsZW1lbnQsIGRhdGFBcnJheSwgb3B0aW9ucywgZWxlbWVudCwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc2hvdWxkRGlzcGxheSkge1xuICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5lbXB0eU5vZGUoZWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJlbmRlciBvbmNlIGZvciB0aGlzIHNpbmdsZSBkYXRhIHBvaW50IChvciB1c2UgdGhlIHZpZXdNb2RlbCBpZiBubyBkYXRhIHdhcyBwcm92aWRlZClcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJCaW5kaW5nQ29udGV4dCA9ICgnZGF0YScgaW4gb3B0aW9ucykgP1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nQ29udGV4dFsnY3JlYXRlQ2hpbGRDb250ZXh0J10oZGF0YVZhbHVlLCBvcHRpb25zWydhcyddKSA6ICAvLyBHaXZlbiBhbiBleHBsaXRpdCAnZGF0YScgdmFsdWUsIHdlIGNyZWF0ZSBhIGNoaWxkIGJpbmRpbmcgY29udGV4dCBmb3IgaXRcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ0NvbnRleHQ7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaXZlbiBubyBleHBsaWNpdCAnZGF0YScgdmFsdWUsIHdlIHJldGFpbiB0aGUgc2FtZSBiaW5kaW5nIGNvbnRleHRcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbXB1dGVkID0ga28ucmVuZGVyVGVtcGxhdGUodGVtcGxhdGVOYW1lIHx8IGVsZW1lbnQsIGlubmVyQmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJdCBvbmx5IG1ha2VzIHNlbnNlIHRvIGhhdmUgYSBzaW5nbGUgdGVtcGxhdGUgY29tcHV0ZWQgcGVyIGVsZW1lbnQgKG90aGVyd2lzZSB3aGljaCBvbmUgc2hvdWxkIGhhdmUgaXRzIG91dHB1dCBkaXNwbGF5ZWQ/KVxuICAgICAgICAgICAgZGlzcG9zZU9sZENvbXB1dGVkQW5kU3RvcmVOZXdPbmUoZWxlbWVudCwgdGVtcGxhdGVDb21wdXRlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQW5vbnltb3VzIHRlbXBsYXRlcyBjYW4ndCBiZSByZXdyaXR0ZW4uIEdpdmUgYSBuaWNlIGVycm9yIG1lc3NhZ2UgaWYgeW91IHRyeSB0byBkbyBpdC5cbiAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9yc1sndGVtcGxhdGUnXSA9IGZ1bmN0aW9uKGJpbmRpbmdWYWx1ZSkge1xuICAgICAgICB2YXIgcGFyc2VkQmluZGluZ1ZhbHVlID0ga28uZXhwcmVzc2lvblJld3JpdGluZy5wYXJzZU9iamVjdExpdGVyYWwoYmluZGluZ1ZhbHVlKTtcblxuICAgICAgICBpZiAoKHBhcnNlZEJpbmRpbmdWYWx1ZS5sZW5ndGggPT0gMSkgJiYgcGFyc2VkQmluZGluZ1ZhbHVlWzBdWyd1bmtub3duJ10pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gSXQgbG9va3MgbGlrZSBhIHN0cmluZyBsaXRlcmFsLCBub3QgYW4gb2JqZWN0IGxpdGVyYWwsIHNvIHRyZWF0IGl0IGFzIGEgbmFtZWQgdGVtcGxhdGUgKHdoaWNoIGlzIGFsbG93ZWQgZm9yIHJld3JpdGluZylcblxuICAgICAgICBpZiAoa28uZXhwcmVzc2lvblJld3JpdGluZy5rZXlWYWx1ZUFycmF5Q29udGFpbnNLZXkocGFyc2VkQmluZGluZ1ZhbHVlLCBcIm5hbWVcIikpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gTmFtZWQgdGVtcGxhdGVzIGNhbiBiZSByZXdyaXR0ZW4sIHNvIHJldHVybiBcIm5vIGVycm9yXCJcbiAgICAgICAgcmV0dXJuIFwiVGhpcyB0ZW1wbGF0ZSBlbmdpbmUgZG9lcyBub3Qgc3VwcG9ydCBhbm9ueW1vdXMgdGVtcGxhdGVzIG5lc3RlZCB3aXRoaW4gaXRzIHRlbXBsYXRlc1wiO1xuICAgIH07XG5cbiAgICBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzWyd0ZW1wbGF0ZSddID0gdHJ1ZTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnc2V0VGVtcGxhdGVFbmdpbmUnLCBrby5zZXRUZW1wbGF0ZUVuZ2luZSk7XG5rby5leHBvcnRTeW1ib2woJ3JlbmRlclRlbXBsYXRlJywga28ucmVuZGVyVGVtcGxhdGUpO1xuLy8gR28gdGhyb3VnaCB0aGUgaXRlbXMgdGhhdCBoYXZlIGJlZW4gYWRkZWQgYW5kIGRlbGV0ZWQgYW5kIHRyeSB0byBmaW5kIG1hdGNoZXMgYmV0d2VlbiB0aGVtLlxua28udXRpbHMuZmluZE1vdmVzSW5BcnJheUNvbXBhcmlzb24gPSBmdW5jdGlvbiAobGVmdCwgcmlnaHQsIGxpbWl0RmFpbGVkQ29tcGFyZXMpIHtcbiAgICBpZiAobGVmdC5sZW5ndGggJiYgcmlnaHQubGVuZ3RoKSB7XG4gICAgICAgIHZhciBmYWlsZWRDb21wYXJlcywgbCwgciwgbGVmdEl0ZW0sIHJpZ2h0SXRlbTtcbiAgICAgICAgZm9yIChmYWlsZWRDb21wYXJlcyA9IGwgPSAwOyAoIWxpbWl0RmFpbGVkQ29tcGFyZXMgfHwgZmFpbGVkQ29tcGFyZXMgPCBsaW1pdEZhaWxlZENvbXBhcmVzKSAmJiAobGVmdEl0ZW0gPSBsZWZ0W2xdKTsgKytsKSB7XG4gICAgICAgICAgICBmb3IgKHIgPSAwOyByaWdodEl0ZW0gPSByaWdodFtyXTsgKytyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlZnRJdGVtWyd2YWx1ZSddID09PSByaWdodEl0ZW1bJ3ZhbHVlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdEl0ZW1bJ21vdmVkJ10gPSByaWdodEl0ZW1bJ2luZGV4J107XG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0SXRlbVsnbW92ZWQnXSA9IGxlZnRJdGVtWydpbmRleCddO1xuICAgICAgICAgICAgICAgICAgICByaWdodC5zcGxpY2UociwgMSk7ICAgICAgICAgLy8gVGhpcyBpdGVtIGlzIG1hcmtlZCBhcyBtb3ZlZDsgc28gcmVtb3ZlIGl0IGZyb20gcmlnaHQgbGlzdFxuICAgICAgICAgICAgICAgICAgICBmYWlsZWRDb21wYXJlcyA9IHIgPSAwOyAgICAgLy8gUmVzZXQgZmFpbGVkIGNvbXBhcmVzIGNvdW50IGJlY2F1c2Ugd2UncmUgY2hlY2tpbmcgZm9yIGNvbnNlY3V0aXZlIGZhaWx1cmVzXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZhaWxlZENvbXBhcmVzICs9IHI7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5rby51dGlscy5jb21wYXJlQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhdHVzTm90SW5PbGQgPSAnYWRkZWQnLCBzdGF0dXNOb3RJbk5ldyA9ICdkZWxldGVkJztcblxuICAgIC8vIFNpbXBsZSBjYWxjdWxhdGlvbiBiYXNlZCBvbiBMZXZlbnNodGVpbiBkaXN0YW5jZS5cbiAgICBmdW5jdGlvbiBjb21wYXJlQXJyYXlzKG9sZEFycmF5LCBuZXdBcnJheSwgb3B0aW9ucykge1xuICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgaWYgdGhlIHRoaXJkIGFyZyBpcyBhY3R1YWxseSBhIGJvb2wsIGludGVycHJldFxuICAgICAgICAvLyBpdCBhcyB0aGUgb2xkIHBhcmFtZXRlciAnZG9udExpbWl0TW92ZXMnLiBOZXdlciBjb2RlIHNob3VsZCB1c2UgeyBkb250TGltaXRNb3ZlczogdHJ1ZSB9LlxuICAgICAgICBvcHRpb25zID0gKHR5cGVvZiBvcHRpb25zID09PSAnYm9vbGVhbicpID8geyAnZG9udExpbWl0TW92ZXMnOiBvcHRpb25zIH0gOiAob3B0aW9ucyB8fCB7fSk7XG4gICAgICAgIG9sZEFycmF5ID0gb2xkQXJyYXkgfHwgW107XG4gICAgICAgIG5ld0FycmF5ID0gbmV3QXJyYXkgfHwgW107XG5cbiAgICAgICAgaWYgKG9sZEFycmF5Lmxlbmd0aCA8PSBuZXdBcnJheS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZVNtYWxsQXJyYXlUb0JpZ0FycmF5KG9sZEFycmF5LCBuZXdBcnJheSwgc3RhdHVzTm90SW5PbGQsIHN0YXR1c05vdEluTmV3LCBvcHRpb25zKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVTbWFsbEFycmF5VG9CaWdBcnJheShuZXdBcnJheSwgb2xkQXJyYXksIHN0YXR1c05vdEluTmV3LCBzdGF0dXNOb3RJbk9sZCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGFyZVNtYWxsQXJyYXlUb0JpZ0FycmF5KHNtbEFycmF5LCBiaWdBcnJheSwgc3RhdHVzTm90SW5TbWwsIHN0YXR1c05vdEluQmlnLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBteU1pbiA9IE1hdGgubWluLFxuICAgICAgICAgICAgbXlNYXggPSBNYXRoLm1heCxcbiAgICAgICAgICAgIGVkaXREaXN0YW5jZU1hdHJpeCA9IFtdLFxuICAgICAgICAgICAgc21sSW5kZXgsIHNtbEluZGV4TWF4ID0gc21sQXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgYmlnSW5kZXgsIGJpZ0luZGV4TWF4ID0gYmlnQXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgY29tcGFyZVJhbmdlID0gKGJpZ0luZGV4TWF4IC0gc21sSW5kZXhNYXgpIHx8IDEsXG4gICAgICAgICAgICBtYXhEaXN0YW5jZSA9IHNtbEluZGV4TWF4ICsgYmlnSW5kZXhNYXggKyAxLFxuICAgICAgICAgICAgdGhpc1JvdywgbGFzdFJvdyxcbiAgICAgICAgICAgIGJpZ0luZGV4TWF4Rm9yUm93LCBiaWdJbmRleE1pbkZvclJvdztcblxuICAgICAgICBmb3IgKHNtbEluZGV4ID0gMDsgc21sSW5kZXggPD0gc21sSW5kZXhNYXg7IHNtbEluZGV4KyspIHtcbiAgICAgICAgICAgIGxhc3RSb3cgPSB0aGlzUm93O1xuICAgICAgICAgICAgZWRpdERpc3RhbmNlTWF0cml4LnB1c2godGhpc1JvdyA9IFtdKTtcbiAgICAgICAgICAgIGJpZ0luZGV4TWF4Rm9yUm93ID0gbXlNaW4oYmlnSW5kZXhNYXgsIHNtbEluZGV4ICsgY29tcGFyZVJhbmdlKTtcbiAgICAgICAgICAgIGJpZ0luZGV4TWluRm9yUm93ID0gbXlNYXgoMCwgc21sSW5kZXggLSAxKTtcbiAgICAgICAgICAgIGZvciAoYmlnSW5kZXggPSBiaWdJbmRleE1pbkZvclJvdzsgYmlnSW5kZXggPD0gYmlnSW5kZXhNYXhGb3JSb3c7IGJpZ0luZGV4KyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWJpZ0luZGV4KVxuICAgICAgICAgICAgICAgICAgICB0aGlzUm93W2JpZ0luZGV4XSA9IHNtbEluZGV4ICsgMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghc21sSW5kZXgpICAvLyBUb3Agcm93IC0gdHJhbnNmb3JtIGVtcHR5IGFycmF5IGludG8gbmV3IGFycmF5IHZpYSBhZGRpdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdGhpc1Jvd1tiaWdJbmRleF0gPSBiaWdJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc21sQXJyYXlbc21sSW5kZXggLSAxXSA9PT0gYmlnQXJyYXlbYmlnSW5kZXggLSAxXSlcbiAgICAgICAgICAgICAgICAgICAgdGhpc1Jvd1tiaWdJbmRleF0gPSBsYXN0Um93W2JpZ0luZGV4IC0gMV07ICAgICAgICAgICAgICAgICAgLy8gY29weSB2YWx1ZSAobm8gZWRpdClcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vcnRoRGlzdGFuY2UgPSBsYXN0Um93W2JpZ0luZGV4XSB8fCBtYXhEaXN0YW5jZTsgICAgICAgLy8gbm90IGluIGJpZyAoZGVsZXRpb24pXG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZXN0RGlzdGFuY2UgPSB0aGlzUm93W2JpZ0luZGV4IC0gMV0gfHwgbWF4RGlzdGFuY2U7ICAgIC8vIG5vdCBpbiBzbWFsbCAoYWRkaXRpb24pXG4gICAgICAgICAgICAgICAgICAgIHRoaXNSb3dbYmlnSW5kZXhdID0gbXlNaW4obm9ydGhEaXN0YW5jZSwgd2VzdERpc3RhbmNlKSArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVkaXRTY3JpcHQgPSBbXSwgbWVNaW51c09uZSwgbm90SW5TbWwgPSBbXSwgbm90SW5CaWcgPSBbXTtcbiAgICAgICAgZm9yIChzbWxJbmRleCA9IHNtbEluZGV4TWF4LCBiaWdJbmRleCA9IGJpZ0luZGV4TWF4OyBzbWxJbmRleCB8fCBiaWdJbmRleDspIHtcbiAgICAgICAgICAgIG1lTWludXNPbmUgPSBlZGl0RGlzdGFuY2VNYXRyaXhbc21sSW5kZXhdW2JpZ0luZGV4XSAtIDE7XG4gICAgICAgICAgICBpZiAoYmlnSW5kZXggJiYgbWVNaW51c09uZSA9PT0gZWRpdERpc3RhbmNlTWF0cml4W3NtbEluZGV4XVtiaWdJbmRleC0xXSkge1xuICAgICAgICAgICAgICAgIG5vdEluU21sLnB1c2goZWRpdFNjcmlwdFtlZGl0U2NyaXB0Lmxlbmd0aF0gPSB7ICAgICAvLyBhZGRlZFxuICAgICAgICAgICAgICAgICAgICAnc3RhdHVzJzogc3RhdHVzTm90SW5TbWwsXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IGJpZ0FycmF5Wy0tYmlnSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICAnaW5kZXgnOiBiaWdJbmRleCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc21sSW5kZXggJiYgbWVNaW51c09uZSA9PT0gZWRpdERpc3RhbmNlTWF0cml4W3NtbEluZGV4IC0gMV1bYmlnSW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgbm90SW5CaWcucHVzaChlZGl0U2NyaXB0W2VkaXRTY3JpcHQubGVuZ3RoXSA9IHsgICAgIC8vIGRlbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cyc6IHN0YXR1c05vdEluQmlnLFxuICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBzbWxBcnJheVstLXNtbEluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgJ2luZGV4Jzogc21sSW5kZXggfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC0tYmlnSW5kZXg7XG4gICAgICAgICAgICAgICAgLS1zbWxJbmRleDtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnNbJ3NwYXJzZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRTY3JpcHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3RhdHVzJzogXCJyZXRhaW5lZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogYmlnQXJyYXlbYmlnSW5kZXhdIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCBhIGxpbWl0IG9uIHRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgbm9uLW1hdGNoaW5nIGNvbXBhcmlzb25zOyBoYXZpbmcgaXQgYSBtdWx0aXBsZSBvZlxuICAgICAgICAvLyBzbWxJbmRleE1heCBrZWVwcyB0aGUgdGltZSBjb21wbGV4aXR5IG9mIHRoaXMgYWxnb3JpdGhtIGxpbmVhci5cbiAgICAgICAga28udXRpbHMuZmluZE1vdmVzSW5BcnJheUNvbXBhcmlzb24obm90SW5TbWwsIG5vdEluQmlnLCBzbWxJbmRleE1heCAqIDEwKTtcblxuICAgICAgICByZXR1cm4gZWRpdFNjcmlwdC5yZXZlcnNlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBhcmVBcnJheXM7XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmNvbXBhcmVBcnJheXMnLCBrby51dGlscy5jb21wYXJlQXJyYXlzKTtcbihmdW5jdGlvbiAoKSB7XG4gICAgLy8gT2JqZWN0aXZlOlxuICAgIC8vICogR2l2ZW4gYW4gaW5wdXQgYXJyYXksIGEgY29udGFpbmVyIERPTSBub2RlLCBhbmQgYSBmdW5jdGlvbiBmcm9tIGFycmF5IGVsZW1lbnRzIHRvIGFycmF5cyBvZiBET00gbm9kZXMsXG4gICAgLy8gICBtYXAgdGhlIGFycmF5IGVsZW1lbnRzIHRvIGFycmF5cyBvZiBET00gbm9kZXMsIGNvbmNhdGVuYXRlIHRvZ2V0aGVyIGFsbCB0aGVzZSBhcnJheXMsIGFuZCB1c2UgdGhlbSB0byBwb3B1bGF0ZSB0aGUgY29udGFpbmVyIERPTSBub2RlXG4gICAgLy8gKiBOZXh0IHRpbWUgd2UncmUgZ2l2ZW4gdGhlIHNhbWUgY29tYmluYXRpb24gb2YgdGhpbmdzICh3aXRoIHRoZSBhcnJheSBwb3NzaWJseSBoYXZpbmcgbXV0YXRlZCksIHVwZGF0ZSB0aGUgY29udGFpbmVyIERPTSBub2RlXG4gICAgLy8gICBzbyB0aGF0IGl0cyBjaGlsZHJlbiBpcyBhZ2FpbiB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGUgbWFwcGluZ3Mgb2YgdGhlIGFycmF5IGVsZW1lbnRzLCBidXQgZG9uJ3QgcmUtbWFwIGFueSBhcnJheSBlbGVtZW50cyB0aGF0IHdlXG4gICAgLy8gICBwcmV2aW91c2x5IG1hcHBlZCAtIHJldGFpbiB0aG9zZSBub2RlcywgYW5kIGp1c3QgaW5zZXJ0L2RlbGV0ZSBvdGhlciBvbmVzXG5cbiAgICAvLyBcImNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2Rlc1wiIHdpbGwgYmUgaW52b2tlZCBhZnRlciBhbnkgXCJtYXBwaW5nXCItZ2VuZXJhdGVkIG5vZGVzIGFyZSBpbnNlcnRlZCBpbnRvIHRoZSBjb250YWluZXIgbm9kZVxuICAgIC8vIFlvdSBjYW4gdXNlIHRoaXMsIGZvciBleGFtcGxlLCB0byBhY3RpdmF0ZSBiaW5kaW5ncyBvbiB0aG9zZSBub2Rlcy5cblxuICAgIGZ1bmN0aW9uIG1hcE5vZGVBbmRSZWZyZXNoV2hlbkNoYW5nZWQoY29udGFpbmVyTm9kZSwgbWFwcGluZywgdmFsdWVUb01hcCwgY2FsbGJhY2tBZnRlckFkZGluZ05vZGVzLCBpbmRleCkge1xuICAgICAgICAvLyBNYXAgdGhpcyBhcnJheSB2YWx1ZSBpbnNpZGUgYSBkZXBlbmRlbnRPYnNlcnZhYmxlIHNvIHdlIHJlLW1hcCB3aGVuIGFueSBkZXBlbmRlbmN5IGNoYW5nZXNcbiAgICAgICAgdmFyIG1hcHBlZE5vZGVzID0gW107XG4gICAgICAgIHZhciBkZXBlbmRlbnRPYnNlcnZhYmxlID0ga28uZGVwZW5kZW50T2JzZXJ2YWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBuZXdNYXBwZWROb2RlcyA9IG1hcHBpbmcodmFsdWVUb01hcCwgaW5kZXgsIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShtYXBwZWROb2RlcywgY29udGFpbmVyTm9kZSkpIHx8IFtdO1xuXG4gICAgICAgICAgICAvLyBPbiBzdWJzZXF1ZW50IGV2YWx1YXRpb25zLCBqdXN0IHJlcGxhY2UgdGhlIHByZXZpb3VzbHktaW5zZXJ0ZWQgRE9NIG5vZGVzXG4gICAgICAgICAgICBpZiAobWFwcGVkTm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnJlcGxhY2VEb21Ob2RlcyhtYXBwZWROb2RlcywgbmV3TWFwcGVkTm9kZXMpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMpXG4gICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2RlcywgbnVsbCwgW3ZhbHVlVG9NYXAsIG5ld01hcHBlZE5vZGVzLCBpbmRleF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBjb250ZW50cyBvZiB0aGUgbWFwcGVkTm9kZXMgYXJyYXksIHRoZXJlYnkgdXBkYXRpbmcgdGhlIHJlY29yZFxuICAgICAgICAgICAgLy8gb2Ygd2hpY2ggbm9kZXMgd291bGQgYmUgZGVsZXRlZCBpZiB2YWx1ZVRvTWFwIHdhcyBpdHNlbGYgbGF0ZXIgcmVtb3ZlZFxuICAgICAgICAgICAgbWFwcGVkTm9kZXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UHVzaEFsbChtYXBwZWROb2RlcywgbmV3TWFwcGVkTm9kZXMpO1xuICAgICAgICB9LCBudWxsLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogY29udGFpbmVyTm9kZSwgZGlzcG9zZVdoZW46IGZ1bmN0aW9uKCkgeyByZXR1cm4gIWtvLnV0aWxzLmFueURvbU5vZGVJc0F0dGFjaGVkVG9Eb2N1bWVudChtYXBwZWROb2Rlcyk7IH0gfSk7XG4gICAgICAgIHJldHVybiB7IG1hcHBlZE5vZGVzIDogbWFwcGVkTm9kZXMsIGRlcGVuZGVudE9ic2VydmFibGUgOiAoZGVwZW5kZW50T2JzZXJ2YWJsZS5pc0FjdGl2ZSgpID8gZGVwZW5kZW50T2JzZXJ2YWJsZSA6IHVuZGVmaW5lZCkgfTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdE1hcHBpbmdSZXN1bHREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG5cbiAgICBrby51dGlscy5zZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nID0gZnVuY3Rpb24gKGRvbU5vZGUsIGFycmF5LCBtYXBwaW5nLCBvcHRpb25zLCBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMpIHtcbiAgICAgICAgLy8gQ29tcGFyZSB0aGUgcHJvdmlkZWQgYXJyYXkgYWdhaW5zdCB0aGUgcHJldmlvdXMgb25lXG4gICAgICAgIGFycmF5ID0gYXJyYXkgfHwgW107XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB2YXIgaXNGaXJzdEV4ZWN1dGlvbiA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KGRvbU5vZGUsIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSkgPT09IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGxhc3RNYXBwaW5nUmVzdWx0ID0ga28udXRpbHMuZG9tRGF0YS5nZXQoZG9tTm9kZSwgbGFzdE1hcHBpbmdSZXN1bHREb21EYXRhS2V5KSB8fCBbXTtcbiAgICAgICAgdmFyIGxhc3RBcnJheSA9IGtvLnV0aWxzLmFycmF5TWFwKGxhc3RNYXBwaW5nUmVzdWx0LCBmdW5jdGlvbiAoeCkgeyByZXR1cm4geC5hcnJheUVudHJ5OyB9KTtcbiAgICAgICAgdmFyIGVkaXRTY3JpcHQgPSBrby51dGlscy5jb21wYXJlQXJyYXlzKGxhc3RBcnJheSwgYXJyYXksIG9wdGlvbnNbJ2RvbnRMaW1pdE1vdmVzJ10pO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBuZXcgbWFwcGluZyByZXN1bHRcbiAgICAgICAgdmFyIG5ld01hcHBpbmdSZXN1bHQgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RNYXBwaW5nUmVzdWx0SW5kZXggPSAwO1xuICAgICAgICB2YXIgbmV3TWFwcGluZ1Jlc3VsdEluZGV4ID0gMDtcblxuICAgICAgICB2YXIgbm9kZXNUb0RlbGV0ZSA9IFtdO1xuICAgICAgICB2YXIgaXRlbXNUb1Byb2Nlc3MgPSBbXTtcbiAgICAgICAgdmFyIGl0ZW1zRm9yQmVmb3JlUmVtb3ZlQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHZhciBpdGVtc0Zvck1vdmVDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdmFyIGl0ZW1zRm9yQWZ0ZXJBZGRDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgdmFyIG1hcERhdGE7XG5cbiAgICAgICAgZnVuY3Rpb24gaXRlbU1vdmVkT3JSZXRhaW5lZChlZGl0U2NyaXB0SW5kZXgsIG9sZFBvc2l0aW9uKSB7XG4gICAgICAgICAgICBtYXBEYXRhID0gbGFzdE1hcHBpbmdSZXN1bHRbb2xkUG9zaXRpb25dO1xuICAgICAgICAgICAgaWYgKG5ld01hcHBpbmdSZXN1bHRJbmRleCAhPT0gb2xkUG9zaXRpb24pXG4gICAgICAgICAgICAgICAgaXRlbXNGb3JNb3ZlQ2FsbGJhY2tzW2VkaXRTY3JpcHRJbmRleF0gPSBtYXBEYXRhO1xuICAgICAgICAgICAgLy8gU2luY2UgdXBkYXRpbmcgdGhlIGluZGV4IG1pZ2h0IGNoYW5nZSB0aGUgbm9kZXMsIGRvIHNvIGJlZm9yZSBjYWxsaW5nIGZpeFVwQ29udGludW91c05vZGVBcnJheVxuICAgICAgICAgICAgbWFwRGF0YS5pbmRleE9ic2VydmFibGUobmV3TWFwcGluZ1Jlc3VsdEluZGV4KyspO1xuICAgICAgICAgICAga28udXRpbHMuZml4VXBDb250aW51b3VzTm9kZUFycmF5KG1hcERhdGEubWFwcGVkTm9kZXMsIGRvbU5vZGUpO1xuICAgICAgICAgICAgbmV3TWFwcGluZ1Jlc3VsdC5wdXNoKG1hcERhdGEpO1xuICAgICAgICAgICAgaXRlbXNUb1Byb2Nlc3MucHVzaChtYXBEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGNhbGxDYWxsYmFjayhjYWxsYmFjaywgaXRlbXMpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gaXRlbXMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGl0ZW1zW2ldLm1hcHBlZE5vZGVzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobm9kZSwgaSwgaXRlbXNbaV0uYXJyYXlFbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlZGl0U2NyaXB0SXRlbSwgbW92ZWRJbmRleDsgZWRpdFNjcmlwdEl0ZW0gPSBlZGl0U2NyaXB0W2ldOyBpKyspIHtcbiAgICAgICAgICAgIG1vdmVkSW5kZXggPSBlZGl0U2NyaXB0SXRlbVsnbW92ZWQnXTtcbiAgICAgICAgICAgIHN3aXRjaCAoZWRpdFNjcmlwdEl0ZW1bJ3N0YXR1cyddKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImRlbGV0ZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vdmVkSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwRGF0YSA9IGxhc3RNYXBwaW5nUmVzdWx0W2xhc3RNYXBwaW5nUmVzdWx0SW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdG9wIHRyYWNraW5nIGNoYW5nZXMgdG8gdGhlIG1hcHBpbmcgZm9yIHRoZXNlIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwRGF0YS5kZXBlbmRlbnRPYnNlcnZhYmxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcERhdGEuZGVwZW5kZW50T2JzZXJ2YWJsZS5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFF1ZXVlIHRoZXNlIG5vZGVzIGZvciBsYXRlciByZW1vdmFsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlc1RvRGVsZXRlLnB1c2guYXBwbHkobm9kZXNUb0RlbGV0ZSwga28udXRpbHMuZml4VXBDb250aW51b3VzTm9kZUFycmF5KG1hcERhdGEubWFwcGVkTm9kZXMsIGRvbU5vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zWydiZWZvcmVSZW1vdmUnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zRm9yQmVmb3JlUmVtb3ZlQ2FsbGJhY2tzW2ldID0gbWFwRGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtc1RvUHJvY2Vzcy5wdXNoKG1hcERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxhc3RNYXBwaW5nUmVzdWx0SW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwicmV0YWluZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaXRlbU1vdmVkT3JSZXRhaW5lZChpLCBsYXN0TWFwcGluZ1Jlc3VsdEluZGV4KyspO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgXCJhZGRlZFwiOlxuICAgICAgICAgICAgICAgICAgICBpZiAobW92ZWRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtTW92ZWRPclJldGFpbmVkKGksIG1vdmVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwRGF0YSA9IHsgYXJyYXlFbnRyeTogZWRpdFNjcmlwdEl0ZW1bJ3ZhbHVlJ10sIGluZGV4T2JzZXJ2YWJsZToga28ub2JzZXJ2YWJsZShuZXdNYXBwaW5nUmVzdWx0SW5kZXgrKykgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld01hcHBpbmdSZXN1bHQucHVzaChtYXBEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zVG9Qcm9jZXNzLnB1c2gobWFwRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRmlyc3RFeGVjdXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXNGb3JBZnRlckFkZENhbGxiYWNrc1tpXSA9IG1hcERhdGE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxsIGJlZm9yZU1vdmUgZmlyc3QgYmVmb3JlIGFueSBjaGFuZ2VzIGhhdmUgYmVlbiBtYWRlIHRvIHRoZSBET01cbiAgICAgICAgY2FsbENhbGxiYWNrKG9wdGlvbnNbJ2JlZm9yZU1vdmUnXSwgaXRlbXNGb3JNb3ZlQ2FsbGJhY2tzKTtcblxuICAgICAgICAvLyBOZXh0IHJlbW92ZSBub2RlcyBmb3IgZGVsZXRlZCBpdGVtcyAob3IganVzdCBjbGVhbiBpZiB0aGVyZSdzIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrKVxuICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2gobm9kZXNUb0RlbGV0ZSwgb3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10gPyBrby5jbGVhbk5vZGUgOiBrby5yZW1vdmVOb2RlKTtcblxuICAgICAgICAvLyBOZXh0IGFkZC9yZW9yZGVyIHRoZSByZW1haW5pbmcgaXRlbXMgKHdpbGwgaW5jbHVkZSBkZWxldGVkIGl0ZW1zIGlmIHRoZXJlJ3MgYSBiZWZvcmVSZW1vdmUgY2FsbGJhY2spXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuZXh0Tm9kZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGRvbU5vZGUpLCBsYXN0Tm9kZSwgbm9kZTsgbWFwRGF0YSA9IGl0ZW1zVG9Qcm9jZXNzW2ldOyBpKyspIHtcbiAgICAgICAgICAgIC8vIEdldCBub2RlcyBmb3IgbmV3bHkgYWRkZWQgaXRlbXNcbiAgICAgICAgICAgIGlmICghbWFwRGF0YS5tYXBwZWROb2RlcylcbiAgICAgICAgICAgICAgICBrby51dGlscy5leHRlbmQobWFwRGF0YSwgbWFwTm9kZUFuZFJlZnJlc2hXaGVuQ2hhbmdlZChkb21Ob2RlLCBtYXBwaW5nLCBtYXBEYXRhLmFycmF5RW50cnksIGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2RlcywgbWFwRGF0YS5pbmRleE9ic2VydmFibGUpKTtcblxuICAgICAgICAgICAgLy8gUHV0IG5vZGVzIGluIHRoZSByaWdodCBwbGFjZSBpZiB0aGV5IGFyZW4ndCB0aGVyZSBhbHJlYWR5XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgbm9kZSA9IG1hcERhdGEubWFwcGVkTm9kZXNbal07IG5leHROb2RlID0gbm9kZS5uZXh0U2libGluZywgbGFzdE5vZGUgPSBub2RlLCBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZSAhPT0gbmV4dE5vZGUpXG4gICAgICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5pbnNlcnRBZnRlcihkb21Ob2RlLCBub2RlLCBsYXN0Tm9kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJ1biB0aGUgY2FsbGJhY2tzIGZvciBuZXdseSBhZGRlZCBub2RlcyAoZm9yIGV4YW1wbGUsIHRvIGFwcGx5IGJpbmRpbmdzLCBldGMuKVxuICAgICAgICAgICAgaWYgKCFtYXBEYXRhLmluaXRpYWxpemVkICYmIGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2Rlcykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2RlcyhtYXBEYXRhLmFycmF5RW50cnksIG1hcERhdGEubWFwcGVkTm9kZXMsIG1hcERhdGEuaW5kZXhPYnNlcnZhYmxlKTtcbiAgICAgICAgICAgICAgICBtYXBEYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYSBiZWZvcmVSZW1vdmUgY2FsbGJhY2ssIGNhbGwgaXQgYWZ0ZXIgcmVvcmRlcmluZy5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIGFzc3VtZSB0aGF0IHRoZSBiZWZvcmVSZW1vdmUgY2FsbGJhY2sgd2lsbCB1c3VhbGx5IGJlIHVzZWQgdG8gcmVtb3ZlIHRoZSBub2RlcyB1c2luZ1xuICAgICAgICAvLyBzb21lIHNvcnQgb2YgYW5pbWF0aW9uLCB3aGljaCBpcyB3aHkgd2UgZmlyc3QgcmVvcmRlciB0aGUgbm9kZXMgdGhhdCB3aWxsIGJlIHJlbW92ZWQuIElmIHRoZVxuICAgICAgICAvLyBjYWxsYmFjayBpbnN0ZWFkIHJlbW92ZXMgdGhlIG5vZGVzIHJpZ2h0IGF3YXksIGl0IHdvdWxkIGJlIG1vcmUgZWZmaWNpZW50IHRvIHNraXAgcmVvcmRlcmluZyB0aGVtLlxuICAgICAgICAvLyBQZXJoYXBzIHdlJ2xsIG1ha2UgdGhhdCBjaGFuZ2UgaW4gdGhlIGZ1dHVyZSBpZiB0aGlzIHNjZW5hcmlvIGJlY29tZXMgbW9yZSBjb21tb24uXG4gICAgICAgIGNhbGxDYWxsYmFjayhvcHRpb25zWydiZWZvcmVSZW1vdmUnXSwgaXRlbXNGb3JCZWZvcmVSZW1vdmVDYWxsYmFja3MpO1xuXG4gICAgICAgIC8vIEZpbmFsbHkgY2FsbCBhZnRlck1vdmUgYW5kIGFmdGVyQWRkIGNhbGxiYWNrc1xuICAgICAgICBjYWxsQ2FsbGJhY2sob3B0aW9uc1snYWZ0ZXJNb3ZlJ10sIGl0ZW1zRm9yTW92ZUNhbGxiYWNrcyk7XG4gICAgICAgIGNhbGxDYWxsYmFjayhvcHRpb25zWydhZnRlckFkZCddLCBpdGVtc0ZvckFmdGVyQWRkQ2FsbGJhY2tzKTtcblxuICAgICAgICAvLyBTdG9yZSBhIGNvcHkgb2YgdGhlIGFycmF5IGl0ZW1zIHdlIGp1c3QgY29uc2lkZXJlZCBzbyB3ZSBjYW4gZGlmZmVyZW5jZSBpdCBuZXh0IHRpbWVcbiAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQoZG9tTm9kZSwgbGFzdE1hcHBpbmdSZXN1bHREb21EYXRhS2V5LCBuZXdNYXBwaW5nUmVzdWx0KTtcbiAgICB9XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcnLCBrby51dGlscy5zZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nKTtcbmtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXNbJ2FsbG93VGVtcGxhdGVSZXdyaXRpbmcnXSA9IGZhbHNlO1xufVxuXG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGUgPSBuZXcga28udGVtcGxhdGVFbmdpbmUoKTtcbmtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lO1xua28ubmF0aXZlVGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZW5kZXJUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24gKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciB1c2VOb2Rlc0lmQXZhaWxhYmxlID0gIShrby51dGlscy5pZVZlcnNpb24gPCA5KSwgLy8gSUU8OSBjbG9uZU5vZGUgZG9lc24ndCB3b3JrIHByb3Blcmx5XG4gICAgICAgIHRlbXBsYXRlTm9kZXNGdW5jID0gdXNlTm9kZXNJZkF2YWlsYWJsZSA/IHRlbXBsYXRlU291cmNlWydub2RlcyddIDogbnVsbCxcbiAgICAgICAgdGVtcGxhdGVOb2RlcyA9IHRlbXBsYXRlTm9kZXNGdW5jID8gdGVtcGxhdGVTb3VyY2VbJ25vZGVzJ10oKSA6IG51bGw7XG5cbiAgICBpZiAodGVtcGxhdGVOb2Rlcykge1xuICAgICAgICByZXR1cm4ga28udXRpbHMubWFrZUFycmF5KHRlbXBsYXRlTm9kZXMuY2xvbmVOb2RlKHRydWUpLmNoaWxkTm9kZXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZVRleHQgPSB0ZW1wbGF0ZVNvdXJjZVsndGV4dCddKCk7XG4gICAgICAgIHJldHVybiBrby51dGlscy5wYXJzZUh0bWxGcmFnbWVudCh0ZW1wbGF0ZVRleHQpO1xuICAgIH1cbn07XG5cbmtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLmluc3RhbmNlID0gbmV3IGtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lKCk7XG5rby5zZXRUZW1wbGF0ZUVuZ2luZShrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5pbnN0YW5jZSk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnbmF0aXZlVGVtcGxhdGVFbmdpbmUnLCBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSk7XG4oZnVuY3Rpb24oKSB7XG4gICAga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBEZXRlY3Qgd2hpY2ggdmVyc2lvbiBvZiBqcXVlcnktdG1wbCB5b3UncmUgdXNpbmcuIFVuZm9ydHVuYXRlbHkganF1ZXJ5LXRtcGxcbiAgICAgICAgLy8gZG9lc24ndCBleHBvc2UgYSB2ZXJzaW9uIG51bWJlciwgc28gd2UgaGF2ZSB0byBpbmZlciBpdC5cbiAgICAgICAgLy8gTm90ZSB0aGF0IGFzIG9mIEtub2Nrb3V0IDEuMywgd2Ugb25seSBzdXBwb3J0IGpRdWVyeS50bXBsIDEuMC4wcHJlIGFuZCBsYXRlcixcbiAgICAgICAgLy8gd2hpY2ggS08gaW50ZXJuYWxseSByZWZlcnMgdG8gYXMgdmVyc2lvbiBcIjJcIiwgc28gb2xkZXIgdmVyc2lvbnMgYXJlIG5vIGxvbmdlciBkZXRlY3RlZC5cbiAgICAgICAgdmFyIGpRdWVyeVRtcGxWZXJzaW9uID0gdGhpcy5qUXVlcnlUbXBsVmVyc2lvbiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghalF1ZXJ5IHx8ICEoalF1ZXJ5Wyd0bXBsJ10pKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgLy8gU2luY2UgaXQgZXhwb3NlcyBubyBvZmZpY2lhbCB2ZXJzaW9uIG51bWJlciwgd2UgdXNlIG91ciBvd24gbnVtYmVyaW5nIHN5c3RlbS4gVG8gYmUgdXBkYXRlZCBhcyBqcXVlcnktdG1wbCBldm9sdmVzLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoalF1ZXJ5Wyd0bXBsJ11bJ3RhZyddWyd0bXBsJ11bJ29wZW4nXS50b1N0cmluZygpLmluZGV4T2YoJ19fJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSAxLjAuMHByZSwgY3VzdG9tIHRhZ3Mgc2hvdWxkIGFwcGVuZCBtYXJrdXAgdG8gYW4gYXJyYXkgY2FsbGVkIFwiX19cIlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMjsgLy8gRmluYWwgdmVyc2lvbiBvZiBqcXVlcnkudG1wbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2goZXgpIHsgLyogQXBwYXJlbnRseSBub3QgdGhlIHZlcnNpb24gd2Ugd2VyZSBsb29raW5nIGZvciAqLyB9XG5cbiAgICAgICAgICAgIHJldHVybiAxOyAvLyBBbnkgb2xkZXIgdmVyc2lvbiB0aGF0IHdlIGRvbid0IHN1cHBvcnRcbiAgICAgICAgfSkoKTtcblxuICAgICAgICBmdW5jdGlvbiBlbnN1cmVIYXNSZWZlcmVuY2VkSlF1ZXJ5VGVtcGxhdGVzKCkge1xuICAgICAgICAgICAgaWYgKGpRdWVyeVRtcGxWZXJzaW9uIDwgMilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3VyIHZlcnNpb24gb2YgalF1ZXJ5LnRtcGwgaXMgdG9vIG9sZC4gUGxlYXNlIHVwZ3JhZGUgdG8galF1ZXJ5LnRtcGwgMS4wLjBwcmUgb3IgbGF0ZXIuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZXhlY3V0ZVRlbXBsYXRlKGNvbXBpbGVkVGVtcGxhdGUsIGRhdGEsIGpRdWVyeVRlbXBsYXRlT3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGpRdWVyeVsndG1wbCddKGNvbXBpbGVkVGVtcGxhdGUsIGRhdGEsIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzWydyZW5kZXJUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24odGVtcGxhdGVTb3VyY2UsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIGVuc3VyZUhhc1JlZmVyZW5jZWRKUXVlcnlUZW1wbGF0ZXMoKTtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHdlIGhhdmUgc3RvcmVkIGEgcHJlY29tcGlsZWQgdmVyc2lvbiBvZiB0aGlzIHRlbXBsYXRlIChkb24ndCB3YW50IHRvIHJlcGFyc2Ugb24gZXZlcnkgcmVuZGVyKVxuICAgICAgICAgICAgdmFyIHByZWNvbXBpbGVkID0gdGVtcGxhdGVTb3VyY2VbJ2RhdGEnXSgncHJlY29tcGlsZWQnKTtcbiAgICAgICAgICAgIGlmICghcHJlY29tcGlsZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVTb3VyY2VbJ3RleHQnXSgpIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgLy8gV3JhcCBpbiBcIndpdGgoJHdoYXRldmVyLmtvQmluZGluZ0NvbnRleHQpIHsgLi4uIH1cIlxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVGV4dCA9IFwie3trb193aXRoICRpdGVtLmtvQmluZGluZ0NvbnRleHR9fVwiICsgdGVtcGxhdGVUZXh0ICsgXCJ7ey9rb193aXRofX1cIjtcblxuICAgICAgICAgICAgICAgIHByZWNvbXBpbGVkID0galF1ZXJ5Wyd0ZW1wbGF0ZSddKG51bGwsIHRlbXBsYXRlVGV4dCk7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVTb3VyY2VbJ2RhdGEnXSgncHJlY29tcGlsZWQnLCBwcmVjb21waWxlZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gW2JpbmRpbmdDb250ZXh0WyckZGF0YSddXTsgLy8gUHJld3JhcCB0aGUgZGF0YSBpbiBhbiBhcnJheSB0byBzdG9wIGpxdWVyeS50bXBsIGZyb20gdHJ5aW5nIHRvIHVud3JhcCBhbnkgYXJyYXlzXG4gICAgICAgICAgICB2YXIgalF1ZXJ5VGVtcGxhdGVPcHRpb25zID0galF1ZXJ5WydleHRlbmQnXSh7ICdrb0JpbmRpbmdDb250ZXh0JzogYmluZGluZ0NvbnRleHQgfSwgb3B0aW9uc1sndGVtcGxhdGVPcHRpb25zJ10pO1xuXG4gICAgICAgICAgICB2YXIgcmVzdWx0Tm9kZXMgPSBleGVjdXRlVGVtcGxhdGUocHJlY29tcGlsZWQsIGRhdGEsIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyk7XG4gICAgICAgICAgICByZXN1bHROb2Rlc1snYXBwZW5kVG8nXShkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKTsgLy8gVXNpbmcgXCJhcHBlbmRUb1wiIGZvcmNlcyBqUXVlcnkvalF1ZXJ5LnRtcGwgdG8gcGVyZm9ybSBuZWNlc3NhcnkgY2xlYW51cCB3b3JrXG5cbiAgICAgICAgICAgIGpRdWVyeVsnZnJhZ21lbnRzJ10gPSB7fTsgLy8gQ2xlYXIgalF1ZXJ5J3MgZnJhZ21lbnQgY2FjaGUgdG8gYXZvaWQgYSBtZW1vcnkgbGVhayBhZnRlciBhIGxhcmdlIG51bWJlciBvZiB0ZW1wbGF0ZSByZW5kZXJzXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0Tm9kZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpc1snY3JlYXRlSmF2YVNjcmlwdEV2YWx1YXRvckJsb2NrJ10gPSBmdW5jdGlvbihzY3JpcHQpIHtcbiAgICAgICAgICAgIHJldHVybiBcInt7a29fY29kZSAoKGZ1bmN0aW9uKCkgeyByZXR1cm4gXCIgKyBzY3JpcHQgKyBcIiB9KSgpKSB9fVwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbJ2FkZFRlbXBsYXRlJ10gPSBmdW5jdGlvbih0ZW1wbGF0ZU5hbWUsIHRlbXBsYXRlTWFya3VwKSB7XG4gICAgICAgICAgICBkb2N1bWVudC53cml0ZShcIjxzY3JpcHQgdHlwZT0ndGV4dC9odG1sJyBpZD0nXCIgKyB0ZW1wbGF0ZU5hbWUgKyBcIic+XCIgKyB0ZW1wbGF0ZU1hcmt1cCArIFwiPFwiICsgXCIvc2NyaXB0PlwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoalF1ZXJ5VG1wbFZlcnNpb24gPiAwKSB7XG4gICAgICAgICAgICBqUXVlcnlbJ3RtcGwnXVsndGFnJ11bJ2tvX2NvZGUnXSA9IHtcbiAgICAgICAgICAgICAgICBvcGVuOiBcIl9fLnB1c2goJDEgfHwgJycpO1wiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgalF1ZXJ5Wyd0bXBsJ11bJ3RhZyddWydrb193aXRoJ10gPSB7XG4gICAgICAgICAgICAgICAgb3BlbjogXCJ3aXRoKCQxKSB7XCIsXG4gICAgICAgICAgICAgICAgY2xvc2U6IFwifSBcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBrby5qcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmUucHJvdG90eXBlID0gbmV3IGtvLnRlbXBsYXRlRW5naW5lKCk7XG4gICAga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZTtcblxuICAgIC8vIFVzZSB0aGlzIG9uZSBieSBkZWZhdWx0ICpvbmx5IGlmIGpxdWVyeS50bXBsIGlzIHJlZmVyZW5jZWQqXG4gICAgdmFyIGpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZUluc3RhbmNlID0gbmV3IGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZSgpO1xuICAgIGlmIChqcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmVJbnN0YW5jZS5qUXVlcnlUbXBsVmVyc2lvbiA+IDApXG4gICAgICAgIGtvLnNldFRlbXBsYXRlRW5naW5lKGpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZUluc3RhbmNlKTtcblxuICAgIGtvLmV4cG9ydFN5bWJvbCgnanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lJywga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lKTtcbn0pKCk7XG59KSk7XG59KCkpO1xufSkoKTtcbiIsIi8qISBTb2NrZXQuSU8uanMgYnVpbGQ6MC45LjE2LCBkZXZlbG9wbWVudC4gQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPiBNSVQgTGljZW5zZWQgKi9cblxudmFyIGlvID0gKCd1bmRlZmluZWQnID09PSB0eXBlb2YgbW9kdWxlID8ge30gOiBtb2R1bGUuZXhwb3J0cyk7XG4oZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBJTyBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdmFyIGlvID0gZXhwb3J0cztcblxuICAvKipcbiAgICogU29ja2V0LklPIHZlcnNpb25cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgaW8udmVyc2lvbiA9ICcwLjkuMTYnO1xuXG4gIC8qKlxuICAgKiBQcm90b2NvbCBpbXBsZW1lbnRlZC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgaW8ucHJvdG9jb2wgPSAxO1xuXG4gIC8qKlxuICAgKiBBdmFpbGFibGUgdHJhbnNwb3J0cywgdGhlc2Ugd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCB0aGUgYXZhaWxhYmxlIHRyYW5zcG9ydHNcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cyA9IFtdO1xuXG4gIC8qKlxuICAgKiBLZWVwIHRyYWNrIG9mIGpzb25wIGNhbGxiYWNrcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLmogPSBbXTtcblxuICAvKipcbiAgICogS2VlcCB0cmFjayBvZiBvdXIgaW8uU29ja2V0c1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGlvLnNvY2tldHMgPSB7fTtcblxuXG4gIC8qKlxuICAgKiBNYW5hZ2VzIGNvbm5lY3Rpb25zIHRvIGhvc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJpXG4gICAqIEBQYXJhbSB7Qm9vbGVhbn0gZm9yY2UgY3JlYXRpb24gb2YgbmV3IHNvY2tldCAoZGVmYXVsdHMgdG8gZmFsc2UpXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLmNvbm5lY3QgPSBmdW5jdGlvbiAoaG9zdCwgZGV0YWlscykge1xuICAgIHZhciB1cmkgPSBpby51dGlsLnBhcnNlVXJpKGhvc3QpXG4gICAgICAsIHV1cmlcbiAgICAgICwgc29ja2V0O1xuXG4gICAgaWYgKGdsb2JhbCAmJiBnbG9iYWwubG9jYXRpb24pIHtcbiAgICAgIHVyaS5wcm90b2NvbCA9IHVyaS5wcm90b2NvbCB8fCBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wuc2xpY2UoMCwgLTEpO1xuICAgICAgdXJpLmhvc3QgPSB1cmkuaG9zdCB8fCAoZ2xvYmFsLmRvY3VtZW50XG4gICAgICAgID8gZ2xvYmFsLmRvY3VtZW50LmRvbWFpbiA6IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSk7XG4gICAgICB1cmkucG9ydCA9IHVyaS5wb3J0IHx8IGdsb2JhbC5sb2NhdGlvbi5wb3J0O1xuICAgIH1cblxuICAgIHV1cmkgPSBpby51dGlsLnVuaXF1ZVVyaSh1cmkpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIGhvc3Q6IHVyaS5ob3N0XG4gICAgICAsIHNlY3VyZTogJ2h0dHBzJyA9PSB1cmkucHJvdG9jb2xcbiAgICAgICwgcG9ydDogdXJpLnBvcnQgfHwgKCdodHRwcycgPT0gdXJpLnByb3RvY29sID8gNDQzIDogODApXG4gICAgICAsIHF1ZXJ5OiB1cmkucXVlcnkgfHwgJydcbiAgICB9O1xuXG4gICAgaW8udXRpbC5tZXJnZShvcHRpb25zLCBkZXRhaWxzKTtcblxuICAgIGlmIChvcHRpb25zWydmb3JjZSBuZXcgY29ubmVjdGlvbiddIHx8ICFpby5zb2NrZXRzW3V1cmldKSB7XG4gICAgICBzb2NrZXQgPSBuZXcgaW8uU29ja2V0KG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGlmICghb3B0aW9uc1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSAmJiBzb2NrZXQpIHtcbiAgICAgIGlvLnNvY2tldHNbdXVyaV0gPSBzb2NrZXQ7XG4gICAgfVxuXG4gICAgc29ja2V0ID0gc29ja2V0IHx8IGlvLnNvY2tldHNbdXVyaV07XG5cbiAgICAvLyBpZiBwYXRoIGlzIGRpZmZlcmVudCBmcm9tICcnIG9yIC9cbiAgICByZXR1cm4gc29ja2V0Lm9mKHVyaS5wYXRoLmxlbmd0aCA+IDEgPyB1cmkucGF0aCA6ICcnKTtcbiAgfTtcblxufSkoJ29iamVjdCcgPT09IHR5cGVvZiBtb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6ICh0aGlzLmlvID0ge30pLCB0aGlzKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBVdGlsaXRpZXMgbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHZhciB1dGlsID0gZXhwb3J0cy51dGlsID0ge307XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbiBVUklcbiAgICpcbiAgICogQGF1dGhvciBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT4gKE1JVCBsaWNlbnNlKVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB2YXIgcmUgPSAvXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShbXjpcXC8/Iy5dKyk6KT8oPzpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSgoKFxcLyg/OltePyNdKD8hW14/I1xcL10qXFwuW14/I1xcLy5dKyg/Ols/I118JCkpKSpcXC8/KT8oW14/I1xcL10qKSkoPzpcXD8oW14jXSopKT8oPzojKC4qKSk/KS87XG5cbiAgdmFyIHBhcnRzID0gWydzb3VyY2UnLCAncHJvdG9jb2wnLCAnYXV0aG9yaXR5JywgJ3VzZXJJbmZvJywgJ3VzZXInLCAncGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgJ2hvc3QnLCAncG9ydCcsICdyZWxhdGl2ZScsICdwYXRoJywgJ2RpcmVjdG9yeScsICdmaWxlJywgJ3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICdhbmNob3InXTtcblxuICB1dGlsLnBhcnNlVXJpID0gZnVuY3Rpb24gKHN0cikge1xuICAgIHZhciBtID0gcmUuZXhlYyhzdHIgfHwgJycpXG4gICAgICAsIHVyaSA9IHt9XG4gICAgICAsIGkgPSAxNDtcblxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIHVyaVtwYXJ0c1tpXV0gPSBtW2ldIHx8ICcnO1xuICAgIH1cblxuICAgIHJldHVybiB1cmk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFByb2R1Y2VzIGEgdW5pcXVlIHVybCB0aGF0IGlkZW50aWZpZXMgYSBTb2NrZXQuSU8gY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHVyaVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVuaXF1ZVVyaSA9IGZ1bmN0aW9uICh1cmkpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSB1cmkucHJvdG9jb2xcbiAgICAgICwgaG9zdCA9IHVyaS5ob3N0XG4gICAgICAsIHBvcnQgPSB1cmkucG9ydDtcblxuICAgIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCkge1xuICAgICAgaG9zdCA9IGhvc3QgfHwgZG9jdW1lbnQuZG9tYWluO1xuICAgICAgcG9ydCA9IHBvcnQgfHwgKHByb3RvY29sID09ICdodHRwcydcbiAgICAgICAgJiYgZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgIT09ICdodHRwczonID8gNDQzIDogZG9jdW1lbnQubG9jYXRpb24ucG9ydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhvc3QgPSBob3N0IHx8ICdsb2NhbGhvc3QnO1xuXG4gICAgICBpZiAoIXBvcnQgJiYgcHJvdG9jb2wgPT0gJ2h0dHBzJykge1xuICAgICAgICBwb3J0ID0gNDQzO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAocHJvdG9jb2wgfHwgJ2h0dHAnKSArICc6Ly8nICsgaG9zdCArICc6JyArIChwb3J0IHx8IDgwKTtcbiAgfTtcblxuICAvKipcbiAgICogTWVyZ2VzdCAyIHF1ZXJ5IHN0cmluZ3MgaW4gdG8gb25jZSB1bmlxdWUgcXVlcnkgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBhZGRpdGlvblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnF1ZXJ5ID0gZnVuY3Rpb24gKGJhc2UsIGFkZGl0aW9uKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdXRpbC5jaHVua1F1ZXJ5KGJhc2UgfHwgJycpXG4gICAgICAsIGNvbXBvbmVudHMgPSBbXTtcblxuICAgIHV0aWwubWVyZ2UocXVlcnksIHV0aWwuY2h1bmtRdWVyeShhZGRpdGlvbiB8fCAnJykpO1xuICAgIGZvciAodmFyIHBhcnQgaW4gcXVlcnkpIHtcbiAgICAgIGlmIChxdWVyeS5oYXNPd25Qcm9wZXJ0eShwYXJ0KSkge1xuICAgICAgICBjb21wb25lbnRzLnB1c2gocGFydCArICc9JyArIHF1ZXJ5W3BhcnRdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29tcG9uZW50cy5sZW5ndGggPyAnPycgKyBjb21wb25lbnRzLmpvaW4oJyYnKSA6ICcnO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcXVlcnlzdHJpbmcgaW4gdG8gYW4gb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBxc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmNodW5rUXVlcnkgPSBmdW5jdGlvbiAocXMpIHtcbiAgICB2YXIgcXVlcnkgPSB7fVxuICAgICAgLCBwYXJhbXMgPSBxcy5zcGxpdCgnJicpXG4gICAgICAsIGkgPSAwXG4gICAgICAsIGwgPSBwYXJhbXMubGVuZ3RoXG4gICAgICAsIGt2O1xuXG4gICAgZm9yICg7IGkgPCBsOyArK2kpIHtcbiAgICAgIGt2ID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgICBpZiAoa3ZbMF0pIHtcbiAgICAgICAgcXVlcnlba3ZbMF1dID0ga3ZbMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2hlbiB0aGUgcGFnZSBpcyBsb2FkZWQuXG4gICAqXG4gICAqICAgICBpby51dGlsLmxvYWQoZnVuY3Rpb24gKCkgeyBjb25zb2xlLmxvZygncGFnZSBsb2FkZWQnKTsgfSk7XG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHZhciBwYWdlTG9hZGVkID0gZmFsc2U7XG5cbiAgdXRpbC5sb2FkID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKCdkb2N1bWVudCcgaW4gZ2xvYmFsICYmIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgfHwgcGFnZUxvYWRlZCkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfVxuXG4gICAgdXRpbC5vbihnbG9iYWwsICdsb2FkJywgZm4sIGZhbHNlKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkcyBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHV0aWwub24gPSBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnQsIGZuLCBjYXB0dXJlKSB7XG4gICAgaWYgKGVsZW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBmbik7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGNhcHR1cmUpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIHRoZSBjb3JyZWN0IGBYTUxIdHRwUmVxdWVzdGAgZm9yIHJlZ3VsYXIgYW5kIGNyb3NzIGRvbWFpbiByZXF1ZXN0cy5cbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSBbeGRvbWFpbl0gQ3JlYXRlIGEgcmVxdWVzdCB0aGF0IGNhbiBiZSB1c2VkIGNyb3NzIGRvbWFpbi5cbiAgICogQHJldHVybnMge1hNTEh0dHBSZXF1ZXN0fGZhbHNlfSBJZiB3ZSBjYW4gY3JlYXRlIGEgWE1MSHR0cFJlcXVlc3QuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB1dGlsLnJlcXVlc3QgPSBmdW5jdGlvbiAoeGRvbWFpbikge1xuXG4gICAgaWYgKHhkb21haW4gJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhEb21haW5SZXF1ZXN0ICYmICF1dGlsLnVhLmhhc0NPUlMpIHtcbiAgICAgIHJldHVybiBuZXcgWERvbWFpblJlcXVlc3QoKTtcbiAgICB9XG5cbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICYmICgheGRvbWFpbiB8fCB1dGlsLnVhLmhhc0NPUlMpKSB7XG4gICAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF4ZG9tYWluKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IHdpbmRvd1soWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSldKCdNaWNyb3NvZnQuWE1MSFRUUCcpO1xuICAgICAgfSBjYXRjaChlKSB7IH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogWEhSIGJhc2VkIHRyYW5zcG9ydCBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGludGVybmFsIHBhZ2VMb2FkZWQgdmFsdWUuXG4gICAqL1xuXG4gIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2Ygd2luZG93KSB7XG4gICAgdXRpbC5sb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHBhZ2VMb2FkZWQgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmVycyBhIGZ1bmN0aW9uIHRvIGVuc3VyZSBhIHNwaW5uZXIgaXMgbm90IGRpc3BsYXllZCBieSB0aGUgYnJvd3NlclxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmRlZmVyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKCF1dGlsLnVhLndlYmtpdCB8fCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW1wb3J0U2NyaXB0cykge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfVxuXG4gICAgdXRpbC5sb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQoZm4sIDEwMCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0d28gb2JqZWN0cy5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5tZXJnZSA9IGZ1bmN0aW9uIG1lcmdlICh0YXJnZXQsIGFkZGl0aW9uYWwsIGRlZXAsIGxhc3RzZWVuKSB7XG4gICAgdmFyIHNlZW4gPSBsYXN0c2VlbiB8fCBbXVxuICAgICAgLCBkZXB0aCA9IHR5cGVvZiBkZWVwID09ICd1bmRlZmluZWQnID8gMiA6IGRlZXBcbiAgICAgICwgcHJvcDtcblxuICAgIGZvciAocHJvcCBpbiBhZGRpdGlvbmFsKSB7XG4gICAgICBpZiAoYWRkaXRpb25hbC5oYXNPd25Qcm9wZXJ0eShwcm9wKSAmJiB1dGlsLmluZGV4T2Yoc2VlbiwgcHJvcCkgPCAwKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGFyZ2V0W3Byb3BdICE9PSAnb2JqZWN0JyB8fCAhZGVwdGgpIHtcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBhZGRpdGlvbmFsW3Byb3BdO1xuICAgICAgICAgIHNlZW4ucHVzaChhZGRpdGlvbmFsW3Byb3BdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1dGlsLm1lcmdlKHRhcmdldFtwcm9wXSwgYWRkaXRpb25hbFtwcm9wXSwgZGVwdGggLSAxLCBzZWVuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlcyBwcm90b3R5cGVzIGZyb20gb2JqZWN0c1xuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLm1peGluID0gZnVuY3Rpb24gKGN0b3IsIGN0b3IyKSB7XG4gICAgdXRpbC5tZXJnZShjdG9yLnByb3RvdHlwZSwgY3RvcjIucHJvdG90eXBlKTtcbiAgfTtcblxuICAvKipcbiAgICogU2hvcnRjdXQgZm9yIHByb3RvdHlwaWNhbCBhbmQgc3RhdGljIGluaGVyaXRhbmNlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5pbmhlcml0ID0gZnVuY3Rpb24gKGN0b3IsIGN0b3IyKSB7XG4gICAgZnVuY3Rpb24gZigpIHt9O1xuICAgIGYucHJvdG90eXBlID0gY3RvcjIucHJvdG90eXBlO1xuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IGY7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIEFycmF5LlxuICAgKlxuICAgKiAgICAgaW8udXRpbC5pc0FycmF5KFtdKTsgLy8gdHJ1ZVxuICAgKiAgICAgaW8udXRpbC5pc0FycmF5KHt9KTsgLy8gZmFsc2VcbiAgICpcbiAgICogQHBhcmFtIE9iamVjdCBvYmpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbnRlcnNlY3RzIHZhbHVlcyBvZiB0d28gYXJyYXlzIGludG8gYSB0aGlyZFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmludGVyc2VjdCA9IGZ1bmN0aW9uIChhcnIsIGFycjIpIHtcbiAgICB2YXIgcmV0ID0gW11cbiAgICAgICwgbG9uZ2VzdCA9IGFyci5sZW5ndGggPiBhcnIyLmxlbmd0aCA/IGFyciA6IGFycjJcbiAgICAgICwgc2hvcnRlc3QgPSBhcnIubGVuZ3RoID4gYXJyMi5sZW5ndGggPyBhcnIyIDogYXJyO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzaG9ydGVzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICh+dXRpbC5pbmRleE9mKGxvbmdlc3QsIHNob3J0ZXN0W2ldKSlcbiAgICAgICAgcmV0LnB1c2goc2hvcnRlc3RbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFycmF5IGluZGV4T2YgY29tcGF0aWJpbGl0eS5cbiAgICpcbiAgICogQHNlZSBiaXQubHkvYTVEeGEyXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuaW5kZXhPZiA9IGZ1bmN0aW9uIChhcnIsIG8sIGkpIHtcblxuICAgIGZvciAodmFyIGogPSBhcnIubGVuZ3RoLCBpID0gaSA8IDAgPyBpICsgaiA8IDAgPyAwIDogaSArIGogOiBpIHx8IDA7XG4gICAgICAgICBpIDwgaiAmJiBhcnJbaV0gIT09IG87IGkrKykge31cblxuICAgIHJldHVybiBqIDw9IGkgPyAtMSA6IGk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGVudW1lcmFibGVzIHRvIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnRvQXJyYXkgPSBmdW5jdGlvbiAoZW51KSB7XG4gICAgdmFyIGFyciA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBlbnUubGVuZ3RoOyBpIDwgbDsgaSsrKVxuICAgICAgYXJyLnB1c2goZW51W2ldKTtcblxuICAgIHJldHVybiBhcnI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVBIC8gZW5naW5lcyBkZXRlY3Rpb24gbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHV0aWwudWEgPSB7fTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgVUEgc3VwcG9ydHMgQ09SUyBmb3IgWEhSLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLnVhLmhhc0NPUlMgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QgJiYgKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIGEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGEud2l0aENyZWRlbnRpYWxzICE9IHVuZGVmaW5lZDtcbiAgfSkoKTtcblxuICAvKipcbiAgICogRGV0ZWN0IHdlYmtpdC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51YS53ZWJraXQgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgbmF2aWdhdG9yXG4gICAgJiYgL3dlYmtpdC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgIC8qKlxuICAgKiBEZXRlY3QgaVBhZC9pUGhvbmUvaVBvZC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51YS5pRGV2aWNlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG5hdmlnYXRvclxuICAgICAgJiYgL2lQYWR8aVBob25lfGlQb2QvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG59KSgndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzLCB0aGlzKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZXIgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBhcGkgcHVibGljLlxuICAgKi9cblxuICBmdW5jdGlvbiBFdmVudEVtaXR0ZXIgKCkge307XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lclxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGlmICghdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBmbjtcbiAgICB9IGVsc2UgaWYgKGlvLnV0aWwuaXNBcnJheSh0aGlzLiRldmVudHNbbmFtZV0pKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0ucHVzaChmbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IFt0aGlzLiRldmVudHNbbmFtZV0sIGZuXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuICAvKipcbiAgICogQWRkcyBhIHZvbGF0aWxlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBvbiAoKSB7XG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKG5hbWUsIG9uKTtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIG9uLmxpc3RlbmVyID0gZm47XG4gICAgdGhpcy5vbihuYW1lLCBvbik7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgaWYgKHRoaXMuJGV2ZW50cyAmJiB0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHZhciBsaXN0ID0gdGhpcy4kZXZlbnRzW25hbWVdO1xuXG4gICAgICBpZiAoaW8udXRpbC5pc0FycmF5KGxpc3QpKSB7XG4gICAgICAgIHZhciBwb3MgPSAtMTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGZuIHx8IChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGZuKSkge1xuICAgICAgICAgICAgcG9zID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3MgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnNwbGljZShwb3MsIDEpO1xuXG4gICAgICAgIGlmICghbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy4kZXZlbnRzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGxpc3QgPT09IGZuIHx8IChsaXN0Lmxpc3RlbmVyICYmIGxpc3QubGlzdGVuZXIgPT09IGZuKSkge1xuICAgICAgICBkZWxldGUgdGhpcy4kZXZlbnRzW25hbWVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgZm9yIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy4kZXZlbnRzID0ge307XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodGhpcy4kZXZlbnRzICYmIHRoaXMuJGV2ZW50c1tuYW1lXSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyBhbGwgbGlzdGVuZXJzIGZvciBhIGNlcnRhaW4gZXZlbnQuXG4gICAqXG4gICAqIEBhcGkgcHVibGNpXG4gICAqL1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuJGV2ZW50cykge1xuICAgICAgdGhpcy4kZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIGlmICghaW8udXRpbC5pc0FycmF5KHRoaXMuJGV2ZW50c1tuYW1lXSkpIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IFt0aGlzLiRldmVudHNbbmFtZV1dO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiRldmVudHNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy4kZXZlbnRzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXIgPSB0aGlzLiRldmVudHNbbmFtZV07XG5cbiAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgaGFuZGxlcikge1xuICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9IGVsc2UgaWYgKGlvLnV0aWwuaXNBcnJheShoYW5kbGVyKSkge1xuICAgICAgdmFyIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqIEJhc2VkIG9uIEpTT04yIChodHRwOi8vd3d3LkpTT04ub3JnL2pzLmh0bWwpLlxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgbmF0aXZlSlNPTikge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICAvLyB1c2UgbmF0aXZlIEpTT04gaWYgaXQncyBhdmFpbGFibGVcbiAgaWYgKG5hdGl2ZUpTT04gJiYgbmF0aXZlSlNPTi5wYXJzZSl7XG4gICAgcmV0dXJuIGV4cG9ydHMuSlNPTiA9IHtcbiAgICAgIHBhcnNlOiBuYXRpdmVKU09OLnBhcnNlXG4gICAgLCBzdHJpbmdpZnk6IG5hdGl2ZUpTT04uc3RyaW5naWZ5XG4gICAgfTtcbiAgfVxuXG4gIHZhciBKU09OID0gZXhwb3J0cy5KU09OID0ge307XG5cbiAgZnVuY3Rpb24gZihuKSB7XG4gICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuO1xuICB9XG5cbiAgZnVuY3Rpb24gZGF0ZShkLCBrZXkpIHtcbiAgICByZXR1cm4gaXNGaW5pdGUoZC52YWx1ZU9mKCkpID9cbiAgICAgICAgZC5nZXRVVENGdWxsWWVhcigpICAgICArICctJyArXG4gICAgICAgIGYoZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgK1xuICAgICAgICBmKGQuZ2V0VVRDRGF0ZSgpKSAgICAgICsgJ1QnICtcbiAgICAgICAgZihkLmdldFVUQ0hvdXJzKCkpICAgICArICc6JyArXG4gICAgICAgIGYoZC5nZXRVVENNaW51dGVzKCkpICAgKyAnOicgK1xuICAgICAgICBmKGQuZ2V0VVRDU2Vjb25kcygpKSAgICsgJ1onIDogbnVsbDtcbiAgfTtcblxuICB2YXIgY3ggPSAvW1xcdTAwMDBcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZyxcbiAgICAgIGVzY2FwYWJsZSA9IC9bXFxcXFxcXCJcXHgwMC1cXHgxZlxceDdmLVxceDlmXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICBnYXAsXG4gICAgICBpbmRlbnQsXG4gICAgICBtZXRhID0geyAgICAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAgICdcXHQnOiAnXFxcXHQnLFxuICAgICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAgICdcXHInOiAnXFxcXHInLFxuICAgICAgICAgICdcIicgOiAnXFxcXFwiJyxcbiAgICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICAgIH0sXG4gICAgICByZXA7XG5cblxuICBmdW5jdGlvbiBxdW90ZShzdHJpbmcpIHtcblxuLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuLy8gYmFja3NsYXNoIGNoYXJhY3RlcnMsIHRoZW4gd2UgY2FuIHNhZmVseSBzbGFwIHNvbWUgcXVvdGVzIGFyb3VuZCBpdC5cbi8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuLy8gc2VxdWVuY2VzLlxuXG4gICAgICBlc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICAgIHJldHVybiBlc2NhcGFibGUudGVzdChzdHJpbmcpID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKGVzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICB2YXIgYyA9IG1ldGFbYV07XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJyA/IGMgOlxuICAgICAgICAgICAgICAnXFxcXHUnICsgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgIH0pICsgJ1wiJyA6ICdcIicgKyBzdHJpbmcgKyAnXCInO1xuICB9XG5cblxuICBmdW5jdGlvbiBzdHIoa2V5LCBob2xkZXIpIHtcblxuLy8gUHJvZHVjZSBhIHN0cmluZyBmcm9tIGhvbGRlcltrZXldLlxuXG4gICAgICB2YXIgaSwgICAgICAgICAgLy8gVGhlIGxvb3AgY291bnRlci5cbiAgICAgICAgICBrLCAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgICB2LCAgICAgICAgICAvLyBUaGUgbWVtYmVyIHZhbHVlLlxuICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICBtaW5kID0gZ2FwLFxuICAgICAgICAgIHBhcnRpYWwsXG4gICAgICAgICAgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuLy8gSWYgdGhlIHZhbHVlIGhhcyBhIHRvSlNPTiBtZXRob2QsIGNhbGwgaXQgdG8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICB2YWx1ZSA9IGRhdGUoa2V5KTtcbiAgICAgIH1cblxuLy8gSWYgd2Ugd2VyZSBjYWxsZWQgd2l0aCBhIHJlcGxhY2VyIGZ1bmN0aW9uLCB0aGVuIGNhbGwgdGhlIHJlcGxhY2VyIHRvXG4vLyBvYnRhaW4gYSByZXBsYWNlbWVudCB2YWx1ZS5cblxuICAgICAgaWYgKHR5cGVvZiByZXAgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICB9XG5cbi8vIFdoYXQgaGFwcGVucyBuZXh0IGRlcGVuZHMgb24gdGhlIHZhbHVlJ3MgdHlwZS5cblxuICAgICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgcmV0dXJuIHF1b3RlKHZhbHVlKTtcblxuICAgICAgY2FzZSAnbnVtYmVyJzpcblxuLy8gSlNPTiBudW1iZXJzIG11c3QgYmUgZmluaXRlLiBFbmNvZGUgbm9uLWZpbml0ZSBudW1iZXJzIGFzIG51bGwuXG5cbiAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gU3RyaW5nKHZhbHVlKSA6ICdudWxsJztcblxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudWxsJzpcblxuLy8gSWYgdGhlIHZhbHVlIGlzIGEgYm9vbGVhbiBvciBudWxsLCBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nLiBOb3RlOlxuLy8gdHlwZW9mIG51bGwgZG9lcyBub3QgcHJvZHVjZSAnbnVsbCcuIFRoZSBjYXNlIGlzIGluY2x1ZGVkIGhlcmUgaW5cbi8vIHRoZSByZW1vdGUgY2hhbmNlIHRoYXQgdGhpcyBnZXRzIGZpeGVkIHNvbWVkYXkuXG5cbiAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcblxuLy8gSWYgdGhlIHR5cGUgaXMgJ29iamVjdCcsIHdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb3Jcbi8vIG51bGwuXG5cbiAgICAgIGNhc2UgJ29iamVjdCc6XG5cbi8vIER1ZSB0byBhIHNwZWNpZmljYXRpb24gYmx1bmRlciBpbiBFQ01BU2NyaXB0LCB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0Jyxcbi8vIHNvIHdhdGNoIG91dCBmb3IgdGhhdCBjYXNlLlxuXG4gICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICAgIH1cblxuLy8gTWFrZSBhbiBhcnJheSB0byBob2xkIHRoZSBwYXJ0aWFsIHJlc3VsdHMgb2Ygc3RyaW5naWZ5aW5nIHRoaXMgb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgICAgZ2FwICs9IGluZGVudDtcbiAgICAgICAgICBwYXJ0aWFsID0gW107XG5cbi8vIElzIHRoZSB2YWx1ZSBhbiBhcnJheT9cblxuICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuXG4vLyBUaGUgdmFsdWUgaXMgYW4gYXJyYXkuIFN0cmluZ2lmeSBldmVyeSBlbGVtZW50LiBVc2UgbnVsbCBhcyBhIHBsYWNlaG9sZGVyXG4vLyBmb3Igbm9uLUpTT04gdmFsdWVzLlxuXG4gICAgICAgICAgICAgIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICBwYXJ0aWFsW2ldID0gc3RyKGksIHZhbHVlKSB8fCAnbnVsbCc7XG4gICAgICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIGVsZW1lbnRzIHRvZ2V0aGVyLCBzZXBhcmF0ZWQgd2l0aCBjb21tYXMsIGFuZCB3cmFwIHRoZW0gaW5cbi8vIGJyYWNrZXRzLlxuXG4gICAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMCA/ICdbXScgOiBnYXAgP1xuICAgICAgICAgICAgICAgICAgJ1tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnXScgOlxuICAgICAgICAgICAgICAgICAgJ1snICsgcGFydGlhbC5qb2luKCcsJykgKyAnXSc7XG4gICAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHJlcGxhY2VyIGlzIGFuIGFycmF5LCB1c2UgaXQgdG8gc2VsZWN0IHRoZSBtZW1iZXJzIHRvIGJlIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgaWYgKHJlcCAmJiB0eXBlb2YgcmVwID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBsZW5ndGggPSByZXAubGVuZ3RoO1xuICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgIGsgPSByZXBbaV07XG4gICAgICAgICAgICAgICAgICAgICAgdiA9IHN0cihrLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcblxuLy8gT3RoZXJ3aXNlLCBpdGVyYXRlIHRocm91Z2ggYWxsIG9mIHRoZSBrZXlzIGluIHRoZSBvYmplY3QuXG5cbiAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuLy8gSm9pbiBhbGwgb2YgdGhlIG1lbWJlciB0ZXh0cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLFxuLy8gYW5kIHdyYXAgdGhlbSBpbiBicmFjZXMuXG5cbiAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDAgPyAne30nIDogZ2FwID9cbiAgICAgICAgICAgICAgJ3tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnfScgOlxuICAgICAgICAgICAgICAneycgKyBwYXJ0aWFsLmpvaW4oJywnKSArICd9JztcbiAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgIHJldHVybiB2O1xuICAgICAgfVxuICB9XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHN0cmluZ2lmeSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gIEpTT04uc3RyaW5naWZ5ID0gZnVuY3Rpb24gKHZhbHVlLCByZXBsYWNlciwgc3BhY2UpIHtcblxuLy8gVGhlIHN0cmluZ2lmeSBtZXRob2QgdGFrZXMgYSB2YWx1ZSBhbmQgYW4gb3B0aW9uYWwgcmVwbGFjZXIsIGFuZCBhbiBvcHRpb25hbFxuLy8gc3BhY2UgcGFyYW1ldGVyLCBhbmQgcmV0dXJucyBhIEpTT04gdGV4dC4gVGhlIHJlcGxhY2VyIGNhbiBiZSBhIGZ1bmN0aW9uXG4vLyB0aGF0IGNhbiByZXBsYWNlIHZhbHVlcywgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyB0aGF0IHdpbGwgc2VsZWN0IHRoZSBrZXlzLlxuLy8gQSBkZWZhdWx0IHJlcGxhY2VyIG1ldGhvZCBjYW4gYmUgcHJvdmlkZWQuIFVzZSBvZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGNhblxuLy8gcHJvZHVjZSB0ZXh0IHRoYXQgaXMgbW9yZSBlYXNpbHkgcmVhZGFibGUuXG5cbiAgICAgIHZhciBpO1xuICAgICAgZ2FwID0gJyc7XG4gICAgICBpbmRlbnQgPSAnJztcblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG51bWJlciwgbWFrZSBhbiBpbmRlbnQgc3RyaW5nIGNvbnRhaW5pbmcgdGhhdFxuLy8gbWFueSBzcGFjZXMuXG5cbiAgICAgIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNwYWNlOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgaW5kZW50ICs9ICcgJztcbiAgICAgICAgICB9XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBzdHJpbmcsIGl0IHdpbGwgYmUgdXNlZCBhcyB0aGUgaW5kZW50IHN0cmluZy5cblxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaW5kZW50ID0gc3BhY2U7XG4gICAgICB9XG5cbi8vIElmIHRoZXJlIGlzIGEgcmVwbGFjZXIsIGl0IG11c3QgYmUgYSBmdW5jdGlvbiBvciBhbiBhcnJheS5cbi8vIE90aGVyd2lzZSwgdGhyb3cgYW4gZXJyb3IuXG5cbiAgICAgIHJlcCA9IHJlcGxhY2VyO1xuICAgICAgaWYgKHJlcGxhY2VyICYmIHR5cGVvZiByZXBsYWNlciAhPT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgICAodHlwZW9mIHJlcGxhY2VyICE9PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAgICB0eXBlb2YgcmVwbGFjZXIubGVuZ3RoICE9PSAnbnVtYmVyJykpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0pTT04uc3RyaW5naWZ5Jyk7XG4gICAgICB9XG5cbi8vIE1ha2UgYSBmYWtlIHJvb3Qgb2JqZWN0IGNvbnRhaW5pbmcgb3VyIHZhbHVlIHVuZGVyIHRoZSBrZXkgb2YgJycuXG4vLyBSZXR1cm4gdGhlIHJlc3VsdCBvZiBzdHJpbmdpZnlpbmcgdGhlIHZhbHVlLlxuXG4gICAgICByZXR1cm4gc3RyKCcnLCB7Jyc6IHZhbHVlfSk7XG4gIH07XG5cbi8vIElmIHRoZSBKU09OIG9iamVjdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIHBhcnNlIG1ldGhvZCwgZ2l2ZSBpdCBvbmUuXG5cbiAgSlNPTi5wYXJzZSA9IGZ1bmN0aW9uICh0ZXh0LCByZXZpdmVyKSB7XG4gIC8vIFRoZSBwYXJzZSBtZXRob2QgdGFrZXMgYSB0ZXh0IGFuZCBhbiBvcHRpb25hbCByZXZpdmVyIGZ1bmN0aW9uLCBhbmQgcmV0dXJuc1xuICAvLyBhIEphdmFTY3JpcHQgdmFsdWUgaWYgdGhlIHRleHQgaXMgYSB2YWxpZCBKU09OIHRleHQuXG5cbiAgICAgIHZhciBqO1xuXG4gICAgICBmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG5cbiAgLy8gVGhlIHdhbGsgbWV0aG9kIGlzIHVzZWQgdG8gcmVjdXJzaXZlbHkgd2FsayB0aGUgcmVzdWx0aW5nIHN0cnVjdHVyZSBzb1xuICAvLyB0aGF0IG1vZGlmaWNhdGlvbnMgY2FuIGJlIG1hZGUuXG5cbiAgICAgICAgICB2YXIgaywgdiwgdmFsdWUgPSBob2xkZXJba2V5XTtcbiAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdiA9IHdhbGsodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldml2ZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuXG5cbiAgLy8gUGFyc2luZyBoYXBwZW5zIGluIGZvdXIgc3RhZ2VzLiBJbiB0aGUgZmlyc3Qgc3RhZ2UsIHdlIHJlcGxhY2UgY2VydGFpblxuICAvLyBVbmljb2RlIGNoYXJhY3RlcnMgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLiBKYXZhU2NyaXB0IGhhbmRsZXMgbWFueSBjaGFyYWN0ZXJzXG4gIC8vIGluY29ycmVjdGx5LCBlaXRoZXIgc2lsZW50bHkgZGVsZXRpbmcgdGhlbSwgb3IgdHJlYXRpbmcgdGhlbSBhcyBsaW5lIGVuZGluZ3MuXG5cbiAgICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XG4gICAgICBjeC5sYXN0SW5kZXggPSAwO1xuICAgICAgaWYgKGN4LnRlc3QodGV4dCkpIHtcbiAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKGN4LCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ1xcXFx1JyArXG4gICAgICAgICAgICAgICAgICAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gIC8vIEluIHRoZSBzZWNvbmQgc3RhZ2UsIHdlIHJ1biB0aGUgdGV4dCBhZ2FpbnN0IHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGhhdCBsb29rXG4gIC8vIGZvciBub24tSlNPTiBwYXR0ZXJucy4gV2UgYXJlIGVzcGVjaWFsbHkgY29uY2VybmVkIHdpdGggJygpJyBhbmQgJ25ldydcbiAgLy8gYmVjYXVzZSB0aGV5IGNhbiBjYXVzZSBpbnZvY2F0aW9uLCBhbmQgJz0nIGJlY2F1c2UgaXQgY2FuIGNhdXNlIG11dGF0aW9uLlxuICAvLyBCdXQganVzdCB0byBiZSBzYWZlLCB3ZSB3YW50IHRvIHJlamVjdCBhbGwgdW5leHBlY3RlZCBmb3Jtcy5cblxuICAvLyBXZSBzcGxpdCB0aGUgc2Vjb25kIHN0YWdlIGludG8gNCByZWdleHAgb3BlcmF0aW9ucyBpbiBvcmRlciB0byB3b3JrIGFyb3VuZFxuICAvLyBjcmlwcGxpbmcgaW5lZmZpY2llbmNpZXMgaW4gSUUncyBhbmQgU2FmYXJpJ3MgcmVnZXhwIGVuZ2luZXMuIEZpcnN0IHdlXG4gIC8vIHJlcGxhY2UgdGhlIEpTT04gYmFja3NsYXNoIHBhaXJzIHdpdGggJ0AnIChhIG5vbi1KU09OIGNoYXJhY3RlcikuIFNlY29uZCwgd2VcbiAgLy8gcmVwbGFjZSBhbGwgc2ltcGxlIHZhbHVlIHRva2VucyB3aXRoICddJyBjaGFyYWN0ZXJzLiBUaGlyZCwgd2UgZGVsZXRlIGFsbFxuICAvLyBvcGVuIGJyYWNrZXRzIHRoYXQgZm9sbG93IGEgY29sb24gb3IgY29tbWEgb3IgdGhhdCBiZWdpbiB0aGUgdGV4dC4gRmluYWxseSxcbiAgLy8gd2UgbG9vayB0byBzZWUgdGhhdCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgYXJlIG9ubHkgd2hpdGVzcGFjZSBvciAnXScgb3JcbiAgLy8gJywnIG9yICc6JyBvciAneycgb3IgJ30nLiBJZiB0aGF0IGlzIHNvLCB0aGVuIHRoZSB0ZXh0IGlzIHNhZmUgZm9yIGV2YWwuXG5cbiAgICAgIGlmICgvXltcXF0sOnt9XFxzXSokL1xuICAgICAgICAgICAgICAudGVzdCh0ZXh0LnJlcGxhY2UoL1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZywgJ0AnKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nLCAnXScpXG4gICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKD86Xnw6fCwpKD86XFxzKlxcWykrL2csICcnKSkpIHtcblxuICAvLyBJbiB0aGUgdGhpcmQgc3RhZ2Ugd2UgdXNlIHRoZSBldmFsIGZ1bmN0aW9uIHRvIGNvbXBpbGUgdGhlIHRleHQgaW50byBhXG4gIC8vIEphdmFTY3JpcHQgc3RydWN0dXJlLiBUaGUgJ3snIG9wZXJhdG9yIGlzIHN1YmplY3QgdG8gYSBzeW50YWN0aWMgYW1iaWd1aXR5XG4gIC8vIGluIEphdmFTY3JpcHQ6IGl0IGNhbiBiZWdpbiBhIGJsb2NrIG9yIGFuIG9iamVjdCBsaXRlcmFsLiBXZSB3cmFwIHRoZSB0ZXh0XG4gIC8vIGluIHBhcmVucyB0byBlbGltaW5hdGUgdGhlIGFtYmlndWl0eS5cblxuICAgICAgICAgIGogPSBldmFsKCcoJyArIHRleHQgKyAnKScpO1xuXG4gIC8vIEluIHRoZSBvcHRpb25hbCBmb3VydGggc3RhZ2UsIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsIHBhc3NpbmdcbiAgLy8gZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gYSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZSB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICAgIHJldHVybiB0eXBlb2YgcmV2aXZlciA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgIHdhbGsoeycnOiBqfSwgJycpIDogajtcbiAgICAgIH1cblxuICAvLyBJZiB0aGUgdGV4dCBpcyBub3QgSlNPTiBwYXJzZWFibGUsIHRoZW4gYSBTeW50YXhFcnJvciBpcyB0aHJvd24uXG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignSlNPTi5wYXJzZScpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgdHlwZW9mIEpTT04gIT09ICd1bmRlZmluZWQnID8gSlNPTiA6IHVuZGVmaW5lZFxuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogUGFyc2VyIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgcGFyc2VyID0gZXhwb3J0cy5wYXJzZXIgPSB7fTtcblxuICAvKipcbiAgICogUGFja2V0IHR5cGVzLlxuICAgKi9cblxuICB2YXIgcGFja2V0cyA9IHBhcnNlci5wYWNrZXRzID0gW1xuICAgICAgJ2Rpc2Nvbm5lY3QnXG4gICAgLCAnY29ubmVjdCdcbiAgICAsICdoZWFydGJlYXQnXG4gICAgLCAnbWVzc2FnZSdcbiAgICAsICdqc29uJ1xuICAgICwgJ2V2ZW50J1xuICAgICwgJ2FjaydcbiAgICAsICdlcnJvcidcbiAgICAsICdub29wJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBFcnJvcnMgcmVhc29ucy5cbiAgICovXG5cbiAgdmFyIHJlYXNvbnMgPSBwYXJzZXIucmVhc29ucyA9IFtcbiAgICAgICd0cmFuc3BvcnQgbm90IHN1cHBvcnRlZCdcbiAgICAsICdjbGllbnQgbm90IGhhbmRzaGFrZW4nXG4gICAgLCAndW5hdXRob3JpemVkJ1xuICBdO1xuXG4gIC8qKlxuICAgKiBFcnJvcnMgYWR2aWNlLlxuICAgKi9cblxuICB2YXIgYWR2aWNlID0gcGFyc2VyLmFkdmljZSA9IFtcbiAgICAgICdyZWNvbm5lY3QnXG4gIF07XG5cbiAgLyoqXG4gICAqIFNob3J0Y3V0cy5cbiAgICovXG5cbiAgdmFyIEpTT04gPSBpby5KU09OXG4gICAgLCBpbmRleE9mID0gaW8udXRpbC5pbmRleE9mO1xuXG4gIC8qKlxuICAgKiBFbmNvZGVzIGEgcGFja2V0LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgcGFyc2VyLmVuY29kZVBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB2YXIgdHlwZSA9IGluZGV4T2YocGFja2V0cywgcGFja2V0LnR5cGUpXG4gICAgICAsIGlkID0gcGFja2V0LmlkIHx8ICcnXG4gICAgICAsIGVuZHBvaW50ID0gcGFja2V0LmVuZHBvaW50IHx8ICcnXG4gICAgICAsIGFjayA9IHBhY2tldC5hY2tcbiAgICAgICwgZGF0YSA9IG51bGw7XG5cbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHZhciByZWFzb24gPSBwYWNrZXQucmVhc29uID8gaW5kZXhPZihyZWFzb25zLCBwYWNrZXQucmVhc29uKSA6ICcnXG4gICAgICAgICAgLCBhZHYgPSBwYWNrZXQuYWR2aWNlID8gaW5kZXhPZihhZHZpY2UsIHBhY2tldC5hZHZpY2UpIDogJyc7XG5cbiAgICAgICAgaWYgKHJlYXNvbiAhPT0gJycgfHwgYWR2ICE9PSAnJylcbiAgICAgICAgICBkYXRhID0gcmVhc29uICsgKGFkdiAhPT0gJycgPyAoJysnICsgYWR2KSA6ICcnKTtcblxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICAgIGlmIChwYWNrZXQuZGF0YSAhPT0gJycpXG4gICAgICAgICAgZGF0YSA9IHBhY2tldC5kYXRhO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB2YXIgZXYgPSB7IG5hbWU6IHBhY2tldC5uYW1lIH07XG5cbiAgICAgICAgaWYgKHBhY2tldC5hcmdzICYmIHBhY2tldC5hcmdzLmxlbmd0aCkge1xuICAgICAgICAgIGV2LmFyZ3MgPSBwYWNrZXQuYXJncztcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShldik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHBhY2tldC5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICBpZiAocGFja2V0LnFzKVxuICAgICAgICAgIGRhdGEgPSBwYWNrZXQucXM7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdhY2snOlxuICAgICAgICBkYXRhID0gcGFja2V0LmFja0lkXG4gICAgICAgICAgKyAocGFja2V0LmFyZ3MgJiYgcGFja2V0LmFyZ3MubGVuZ3RoXG4gICAgICAgICAgICAgID8gJysnICsgSlNPTi5zdHJpbmdpZnkocGFja2V0LmFyZ3MpIDogJycpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBjb25zdHJ1Y3QgcGFja2V0IHdpdGggcmVxdWlyZWQgZnJhZ21lbnRzXG4gICAgdmFyIGVuY29kZWQgPSBbXG4gICAgICAgIHR5cGVcbiAgICAgICwgaWQgKyAoYWNrID09ICdkYXRhJyA/ICcrJyA6ICcnKVxuICAgICAgLCBlbmRwb2ludFxuICAgIF07XG5cbiAgICAvLyBkYXRhIGZyYWdtZW50IGlzIG9wdGlvbmFsXG4gICAgaWYgKGRhdGEgIT09IG51bGwgJiYgZGF0YSAhPT0gdW5kZWZpbmVkKVxuICAgICAgZW5jb2RlZC5wdXNoKGRhdGEpO1xuXG4gICAgcmV0dXJuIGVuY29kZWQuam9pbignOicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbmNvZGVzIG11bHRpcGxlIG1lc3NhZ2VzIChwYXlsb2FkKS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gbWVzc2FnZXNcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHBhcnNlci5lbmNvZGVQYXlsb2FkID0gZnVuY3Rpb24gKHBhY2tldHMpIHtcbiAgICB2YXIgZGVjb2RlZCA9ICcnO1xuXG4gICAgaWYgKHBhY2tldHMubGVuZ3RoID09IDEpXG4gICAgICByZXR1cm4gcGFja2V0c1swXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcGFja2V0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBwYWNrZXQgPSBwYWNrZXRzW2ldO1xuICAgICAgZGVjb2RlZCArPSAnXFx1ZmZmZCcgKyBwYWNrZXQubGVuZ3RoICsgJ1xcdWZmZmQnICsgcGFja2V0c1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVjb2RlZDtcbiAgfTtcblxuICAvKipcbiAgICogRGVjb2RlcyBhIHBhY2tldFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdmFyIHJlZ2V4cCA9IC8oW146XSspOihbMC05XSspPyhcXCspPzooW146XSspPzo/KFtcXHNcXFNdKik/LztcblxuICBwYXJzZXIuZGVjb2RlUGFja2V0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgcGllY2VzID0gZGF0YS5tYXRjaChyZWdleHApO1xuXG4gICAgaWYgKCFwaWVjZXMpIHJldHVybiB7fTtcblxuICAgIHZhciBpZCA9IHBpZWNlc1syXSB8fCAnJ1xuICAgICAgLCBkYXRhID0gcGllY2VzWzVdIHx8ICcnXG4gICAgICAsIHBhY2tldCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHBhY2tldHNbcGllY2VzWzFdXVxuICAgICAgICAgICwgZW5kcG9pbnQ6IHBpZWNlc1s0XSB8fCAnJ1xuICAgICAgICB9O1xuXG4gICAgLy8gd2hldGhlciB3ZSBuZWVkIHRvIGFja25vd2xlZGdlIHRoZSBwYWNrZXRcbiAgICBpZiAoaWQpIHtcbiAgICAgIHBhY2tldC5pZCA9IGlkO1xuICAgICAgaWYgKHBpZWNlc1szXSlcbiAgICAgICAgcGFja2V0LmFjayA9ICdkYXRhJztcbiAgICAgIGVsc2VcbiAgICAgICAgcGFja2V0LmFjayA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIGRpZmZlcmVudCBwYWNrZXQgdHlwZXNcbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHZhciBwaWVjZXMgPSBkYXRhLnNwbGl0KCcrJyk7XG4gICAgICAgIHBhY2tldC5yZWFzb24gPSByZWFzb25zW3BpZWNlc1swXV0gfHwgJyc7XG4gICAgICAgIHBhY2tldC5hZHZpY2UgPSBhZHZpY2VbcGllY2VzWzFdXSB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgICBwYWNrZXQuZGF0YSA9IGRhdGEgfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmVudCc6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIG9wdHMgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgIHBhY2tldC5uYW1lID0gb3B0cy5uYW1lO1xuICAgICAgICAgIHBhY2tldC5hcmdzID0gb3B0cy5hcmdzO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgICAgICBwYWNrZXQuYXJncyA9IHBhY2tldC5hcmdzIHx8IFtdO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFja2V0LmRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICBwYWNrZXQucXMgPSBkYXRhIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgdmFyIHBpZWNlcyA9IGRhdGEubWF0Y2goL14oWzAtOV0rKShcXCspPyguKikvKTtcbiAgICAgICAgaWYgKHBpZWNlcykge1xuICAgICAgICAgIHBhY2tldC5hY2tJZCA9IHBpZWNlc1sxXTtcbiAgICAgICAgICBwYWNrZXQuYXJncyA9IFtdO1xuXG4gICAgICAgICAgaWYgKHBpZWNlc1szXSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcGFja2V0LmFyZ3MgPSBwaWVjZXNbM10gPyBKU09OLnBhcnNlKHBpZWNlc1szXSkgOiBbXTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZGlzY29ubmVjdCc6XG4gICAgICBjYXNlICdoZWFydGJlYXQnOlxuICAgICAgICBicmVhaztcbiAgICB9O1xuXG4gICAgcmV0dXJuIHBhY2tldDtcbiAgfTtcblxuICAvKipcbiAgICogRGVjb2RlcyBkYXRhIHBheWxvYWQuIERldGVjdHMgbXVsdGlwbGUgbWVzc2FnZXNcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXl9IG1lc3NhZ2VzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhcnNlci5kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAvLyBJRSBkb2Vzbid0IGxpa2UgZGF0YVtpXSBmb3IgdW5pY29kZSBjaGFycywgY2hhckF0IHdvcmtzIGZpbmVcbiAgICBpZiAoZGF0YS5jaGFyQXQoMCkgPT0gJ1xcdWZmZmQnKSB7XG4gICAgICB2YXIgcmV0ID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSAnJzsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGRhdGEuY2hhckF0KGkpID09ICdcXHVmZmZkJykge1xuICAgICAgICAgIHJldC5wdXNoKHBhcnNlci5kZWNvZGVQYWNrZXQoZGF0YS5zdWJzdHIoaSArIDEpLnN1YnN0cigwLCBsZW5ndGgpKSk7XG4gICAgICAgICAgaSArPSBOdW1iZXIobGVuZ3RoKSArIDE7XG4gICAgICAgICAgbGVuZ3RoID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVuZ3RoICs9IGRhdGEuY2hhckF0KGkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbcGFyc2VyLmRlY29kZVBhY2tldChkYXRhKV07XG4gICAgfVxuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuVHJhbnNwb3J0ID0gVHJhbnNwb3J0O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSB0cmFuc3BvcnQgdGVtcGxhdGUgZm9yIGFsbCBzdXBwb3J0ZWQgdHJhbnNwb3J0IG1ldGhvZHMuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBUcmFuc3BvcnQgKHNvY2tldCwgc2Vzc2lkKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5zZXNzaWQgPSBzZXNzaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihUcmFuc3BvcnQsIGlvLkV2ZW50RW1pdHRlcik7XG5cblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgaGVhcnRiZWF0cyBpcyBlbmFibGVkIGZvciB0aGlzIHRyYW5zcG9ydFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5oZWFydGJlYXRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuIFdoZW4gYSBuZXcgcmVzcG9uc2UgaXMgcmVjZWl2ZWRcbiAgICogaXQgd2lsbCBhdXRvbWF0aWNhbGx5IHVwZGF0ZSB0aGUgdGltZW91dCwgZGVjb2RlIHRoZSBtZXNzYWdlIGFuZFxuICAgKiBmb3J3YXJkcyB0aGUgcmVzcG9uc2UgdG8gdGhlIG9uTWVzc2FnZSBmdW5jdGlvbiBmb3IgZnVydGhlciBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBSZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5jbGVhckNsb3NlVGltZW91dCgpO1xuXG4gICAgLy8gSWYgdGhlIGNvbm5lY3Rpb24gaW4gY3VycmVudGx5IG9wZW4gKG9yIGluIGEgcmVvcGVuaW5nIHN0YXRlKSByZXNldCB0aGUgY2xvc2VcbiAgICAvLyB0aW1lb3V0IHNpbmNlIHdlIGhhdmUganVzdCByZWNlaXZlZCBkYXRhLiBUaGlzIGNoZWNrIGlzIG5lY2Vzc2FyeSBzb1xuICAgIC8vIHRoYXQgd2UgZG9uJ3QgcmVzZXQgdGhlIHRpbWVvdXQgb24gYW4gZXhwbGljaXRseSBkaXNjb25uZWN0ZWQgY29ubmVjdGlvbi5cbiAgICBpZiAodGhpcy5zb2NrZXQuY29ubmVjdGVkIHx8IHRoaXMuc29ja2V0LmNvbm5lY3RpbmcgfHwgdGhpcy5zb2NrZXQucmVjb25uZWN0aW5nKSB7XG4gICAgICB0aGlzLnNldENsb3NlVGltZW91dCgpO1xuICAgIH1cblxuICAgIGlmIChkYXRhICE9PSAnJykge1xuICAgICAgLy8gdG9kbzogd2Ugc2hvdWxkIG9ubHkgZG8gZGVjb2RlUGF5bG9hZCBmb3IgeGhyIHRyYW5zcG9ydHNcbiAgICAgIHZhciBtc2dzID0gaW8ucGFyc2VyLmRlY29kZVBheWxvYWQoZGF0YSk7XG5cbiAgICAgIGlmIChtc2dzICYmIG1zZ3MubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbXNncy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB0aGlzLm9uUGFja2V0KG1zZ3NbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgcGFja2V0cy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdGhpcy5zb2NrZXQuc2V0SGVhcnRiZWF0VGltZW91dCgpO1xuXG4gICAgaWYgKHBhY2tldC50eXBlID09ICdoZWFydGJlYXQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5vbkhlYXJ0YmVhdCgpO1xuICAgIH1cblxuICAgIGlmIChwYWNrZXQudHlwZSA9PSAnY29ubmVjdCcgJiYgcGFja2V0LmVuZHBvaW50ID09ICcnKSB7XG4gICAgICB0aGlzLm9uQ29ubmVjdCgpO1xuICAgIH1cblxuICAgIGlmIChwYWNrZXQudHlwZSA9PSAnZXJyb3InICYmIHBhY2tldC5hZHZpY2UgPT0gJ3JlY29ubmVjdCcpIHtcbiAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQub25QYWNrZXQocGFja2V0KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIGNsb3NlIHRpbWVvdXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuc2V0Q2xvc2VUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5jbG9zZVRpbWVvdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5jbG9zZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5vbkRpc2Nvbm5lY3QoKTtcbiAgICAgIH0sIHRoaXMuc29ja2V0LmNsb3NlVGltZW91dCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0cmFuc3BvcnQgZGlzY29ubmVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uRGlzY29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pc09wZW4pIHRoaXMuY2xvc2UoKTtcbiAgICB0aGlzLmNsZWFyVGltZW91dHMoKTtcbiAgICB0aGlzLnNvY2tldC5vbkRpc2Nvbm5lY3QoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdHJhbnNwb3J0IGNvbm5lY3RzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uQ29ubmVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNvY2tldC5vbkNvbm5lY3QoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXJzIGNsb3NlIHRpbWVvdXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuY2xlYXJDbG9zZVRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuY2xvc2VUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5jbG9zZVRpbWVvdXQpO1xuICAgICAgdGhpcy5jbG9zZVRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgdGltZW91dHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNsZWFyQ2xvc2VUaW1lb3V0KCk7XG5cbiAgICBpZiAodGhpcy5yZW9wZW5UaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZW9wZW5UaW1lb3V0KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgcGFja2V0XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXQgb2JqZWN0LlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdGhpcy5zZW5kKGlvLnBhcnNlci5lbmNvZGVQYWNrZXQocGFja2V0KSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgdGhlIHJlY2VpdmVkIGhlYXJ0YmVhdCBtZXNzYWdlIGJhY2sgdG8gc2VydmVyLiBTbyB0aGUgc2VydmVyXG4gICAqIGtub3dzIHdlIGFyZSBzdGlsbCBjb25uZWN0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBoZWFydGJlYXQgSGVhcnRiZWF0IHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlci5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25IZWFydGJlYXQgPSBmdW5jdGlvbiAoaGVhcnRiZWF0KSB7XG4gICAgdGhpcy5wYWNrZXQoeyB0eXBlOiAnaGVhcnRiZWF0JyB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBvcGVucy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUub25PcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcbiAgICB0aGlzLmNsZWFyQ2xvc2VUaW1lb3V0KCk7XG4gICAgdGhpcy5zb2NrZXQub25PcGVuKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHRoZSBiYXNlIHdoZW4gdGhlIGNvbm5lY3Rpb24gd2l0aCB0aGUgU29ja2V0LklPIHNlcnZlclxuICAgKiBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLyogRklYTUU6IHJlb3BlbiBkZWxheSBjYXVzaW5nIGEgaW5maW5pdCBsb29wXG4gICAgdGhpcy5yZW9wZW5UaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9wZW4oKTtcbiAgICB9LCB0aGlzLnNvY2tldC5vcHRpb25zWydyZW9wZW4gZGVsYXknXSk7Ki9cblxuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5zb2NrZXQub25DbG9zZSgpO1xuICAgIHRoaXMub25EaXNjb25uZWN0KCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyBhIGNvbm5lY3Rpb24gdXJsIGJhc2VkIG9uIHRoZSBTb2NrZXQuSU8gVVJMIFByb3RvY29sLlxuICAgKiBTZWUgPGh0dHBzOi8vZ2l0aHViLmNvbS9sZWFybmJvb3N0L3NvY2tldC5pby1ub2RlLz4gZm9yIG1vcmUgZGV0YWlscy5cbiAgICpcbiAgICogQHJldHVybnMge1N0cmluZ30gQ29ubmVjdGlvbiB1cmxcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUucHJlcGFyZVVybCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMuc29ja2V0Lm9wdGlvbnM7XG5cbiAgICByZXR1cm4gdGhpcy5zY2hlbWUoKSArICc6Ly8nXG4gICAgICArIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydCArICcvJ1xuICAgICAgKyBvcHRpb25zLnJlc291cmNlICsgJy8nICsgaW8ucHJvdG9jb2xcbiAgICAgICsgJy8nICsgdGhpcy5uYW1lICsgJy8nICsgdGhpcy5zZXNzaWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgdHJhbnNwb3J0IGlzIHJlYWR5IHRvIHN0YXJ0IGEgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICBmbi5jYWxsKHRoaXMpO1xuICB9O1xufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuU29ja2V0ID0gU29ja2V0O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFNvY2tldC5JTyBjbGllbnRgIHdoaWNoIGNhbiBlc3RhYmxpc2ggYSBwZXJzaXN0ZW50XG4gICAqIGNvbm5lY3Rpb24gd2l0aCBhIFNvY2tldC5JTyBlbmFibGVkIHNlcnZlci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gU29ja2V0IChvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICBwb3J0OiA4MFxuICAgICAgLCBzZWN1cmU6IGZhbHNlXG4gICAgICAsIGRvY3VtZW50OiAnZG9jdW1lbnQnIGluIGdsb2JhbCA/IGRvY3VtZW50IDogZmFsc2VcbiAgICAgICwgcmVzb3VyY2U6ICdzb2NrZXQuaW8nXG4gICAgICAsIHRyYW5zcG9ydHM6IGlvLnRyYW5zcG9ydHNcbiAgICAgICwgJ2Nvbm5lY3QgdGltZW91dCc6IDEwMDAwXG4gICAgICAsICd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyc6IHRydWVcbiAgICAgICwgJ3JlY29ubmVjdCc6IHRydWVcbiAgICAgICwgJ3JlY29ubmVjdGlvbiBkZWxheSc6IDUwMFxuICAgICAgLCAncmVjb25uZWN0aW9uIGxpbWl0JzogSW5maW5pdHlcbiAgICAgICwgJ3Jlb3BlbiBkZWxheSc6IDMwMDBcbiAgICAgICwgJ21heCByZWNvbm5lY3Rpb24gYXR0ZW1wdHMnOiAxMFxuICAgICAgLCAnc3luYyBkaXNjb25uZWN0IG9uIHVubG9hZCc6IGZhbHNlXG4gICAgICAsICdhdXRvIGNvbm5lY3QnOiB0cnVlXG4gICAgICAsICdmbGFzaCBwb2xpY3kgcG9ydCc6IDEwODQzXG4gICAgICAsICdtYW51YWxGbHVzaCc6IGZhbHNlXG4gICAgfTtcblxuICAgIGlvLnV0aWwubWVyZ2UodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgdGhpcy5jb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZWNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICB0aGlzLm5hbWVzcGFjZXMgPSB7fTtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICAgIHRoaXMuZG9CdWZmZXIgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnNbJ3N5bmMgZGlzY29ubmVjdCBvbiB1bmxvYWQnXSAmJlxuICAgICAgICAoIXRoaXMuaXNYRG9tYWluKCkgfHwgaW8udXRpbC51YS5oYXNDT1JTKSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgaW8udXRpbC5vbihnbG9iYWwsICdiZWZvcmV1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZGlzY29ubmVjdFN5bmMoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zWydhdXRvIGNvbm5lY3QnXSkge1xuICAgICAgdGhpcy5jb25uZWN0KCk7XG4gICAgfVxufTtcblxuICAvKipcbiAgICogQXBwbHkgRXZlbnRFbWl0dGVyIG1peGluLlxuICAgKi9cblxuICBpby51dGlsLm1peGluKFNvY2tldCwgaW8uRXZlbnRFbWl0dGVyKTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIG5hbWVzcGFjZSBsaXN0ZW5lci9lbWl0dGVyIGZvciB0aGlzIHNvY2tldFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMubmFtZXNwYWNlc1tuYW1lXSkge1xuICAgICAgdGhpcy5uYW1lc3BhY2VzW25hbWVdID0gbmV3IGlvLlNvY2tldE5hbWVzcGFjZSh0aGlzLCBuYW1lKTtcblxuICAgICAgaWYgKG5hbWUgIT09ICcnKSB7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlc1tuYW1lXS5wYWNrZXQoeyB0eXBlOiAnY29ubmVjdCcgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubmFtZXNwYWNlc1tuYW1lXTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdHMgdGhlIGdpdmVuIGV2ZW50IHRvIHRoZSBTb2NrZXQgYW5kIGFsbCBuYW1lc3BhY2VzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnB1Ymxpc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgbnNwO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLm5hbWVzcGFjZXMpIHtcbiAgICAgIGlmICh0aGlzLm5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgbnNwID0gdGhpcy5vZihpKTtcbiAgICAgICAgbnNwLiRlbWl0LmFwcGx5KG5zcCwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBoYW5kc2hha2VcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHsgfTtcblxuICBTb2NrZXQucHJvdG90eXBlLmhhbmRzaGFrZSA9IGZ1bmN0aW9uIChmbikge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgZnVuY3Rpb24gY29tcGxldGUgKGRhdGEpIHtcbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgc2VsZi5jb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICAgIHNlbGYub25FcnJvcihkYXRhLm1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm4uYXBwbHkobnVsbCwgZGF0YS5zcGxpdCgnOicpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHVybCA9IFtcbiAgICAgICAgICAnaHR0cCcgKyAob3B0aW9ucy5zZWN1cmUgPyAncycgOiAnJykgKyAnOi8nXG4gICAgICAgICwgb3B0aW9ucy5ob3N0ICsgJzonICsgb3B0aW9ucy5wb3J0XG4gICAgICAgICwgb3B0aW9ucy5yZXNvdXJjZVxuICAgICAgICAsIGlvLnByb3RvY29sXG4gICAgICAgICwgaW8udXRpbC5xdWVyeSh0aGlzLm9wdGlvbnMucXVlcnksICd0PScgKyArbmV3IERhdGUpXG4gICAgICBdLmpvaW4oJy8nKTtcblxuICAgIGlmICh0aGlzLmlzWERvbWFpbigpICYmICFpby51dGlsLnVhLmhhc0NPUlMpIHtcbiAgICAgIHZhciBpbnNlcnRBdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXVxuICAgICAgICAsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG4gICAgICBzY3JpcHQuc3JjID0gdXJsICsgJyZqc29ucD0nICsgaW8uai5sZW5ndGg7XG4gICAgICBpbnNlcnRBdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIGluc2VydEF0KTtcblxuICAgICAgaW8uai5wdXNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGNvbXBsZXRlKGRhdGEpO1xuICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB4aHIgPSBpby51dGlsLnJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgICBpZiAodGhpcy5pc1hEb21haW4oKSkge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuXG4gICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICBjb21wbGV0ZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHhoci5zdGF0dXMgPT0gNDAzKSB7XG4gICAgICAgICAgICBzZWxmLm9uRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuY29ubmVjdGluZyA9IGZhbHNlOyAgICAgICAgICAgIFxuICAgICAgICAgICAgIXNlbGYucmVjb25uZWN0aW5nICYmIHNlbGYub25FcnJvcih4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB4aHIuc2VuZChudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZpbmQgYW4gYXZhaWxhYmxlIHRyYW5zcG9ydCBiYXNlZCBvbiB0aGUgb3B0aW9ucyBzdXBwbGllZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmdldFRyYW5zcG9ydCA9IGZ1bmN0aW9uIChvdmVycmlkZSkge1xuICAgIHZhciB0cmFuc3BvcnRzID0gb3ZlcnJpZGUgfHwgdGhpcy50cmFuc3BvcnRzLCBtYXRjaDtcblxuICAgIGZvciAodmFyIGkgPSAwLCB0cmFuc3BvcnQ7IHRyYW5zcG9ydCA9IHRyYW5zcG9ydHNbaV07IGkrKykge1xuICAgICAgaWYgKGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdXG4gICAgICAgICYmIGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdLmNoZWNrKHRoaXMpXG4gICAgICAgICYmICghdGhpcy5pc1hEb21haW4oKSB8fCBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XS54ZG9tYWluQ2hlY2sodGhpcykpKSB7XG4gICAgICAgIHJldHVybiBuZXcgaW8uVHJhbnNwb3J0W3RyYW5zcG9ydF0odGhpcywgdGhpcy5zZXNzaW9uaWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb25uZWN0cyB0byB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dIENhbGxiYWNrLlxuICAgKiBAcmV0dXJucyB7aW8uU29ja2V0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBpZiAodGhpcy5jb25uZWN0aW5nKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5jb25uZWN0aW5nID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmhhbmRzaGFrZShmdW5jdGlvbiAoc2lkLCBoZWFydGJlYXQsIGNsb3NlLCB0cmFuc3BvcnRzKSB7XG4gICAgICBzZWxmLnNlc3Npb25pZCA9IHNpZDtcbiAgICAgIHNlbGYuY2xvc2VUaW1lb3V0ID0gY2xvc2UgKiAxMDAwO1xuICAgICAgc2VsZi5oZWFydGJlYXRUaW1lb3V0ID0gaGVhcnRiZWF0ICogMTAwMDtcbiAgICAgIGlmKCFzZWxmLnRyYW5zcG9ydHMpXG4gICAgICAgICAgc2VsZi50cmFuc3BvcnRzID0gc2VsZi5vcmlnVHJhbnNwb3J0cyA9ICh0cmFuc3BvcnRzID8gaW8udXRpbC5pbnRlcnNlY3QoXG4gICAgICAgICAgICAgIHRyYW5zcG9ydHMuc3BsaXQoJywnKVxuICAgICAgICAgICAgLCBzZWxmLm9wdGlvbnMudHJhbnNwb3J0c1xuICAgICAgICAgICkgOiBzZWxmLm9wdGlvbnMudHJhbnNwb3J0cyk7XG5cbiAgICAgIHNlbGYuc2V0SGVhcnRiZWF0VGltZW91dCgpO1xuXG4gICAgICBmdW5jdGlvbiBjb25uZWN0ICh0cmFuc3BvcnRzKXtcbiAgICAgICAgaWYgKHNlbGYudHJhbnNwb3J0KSBzZWxmLnRyYW5zcG9ydC5jbGVhclRpbWVvdXRzKCk7XG5cbiAgICAgICAgc2VsZi50cmFuc3BvcnQgPSBzZWxmLmdldFRyYW5zcG9ydCh0cmFuc3BvcnRzKTtcbiAgICAgICAgaWYgKCFzZWxmLnRyYW5zcG9ydCkgcmV0dXJuIHNlbGYucHVibGlzaCgnY29ubmVjdF9mYWlsZWQnKTtcblxuICAgICAgICAvLyBvbmNlIHRoZSB0cmFuc3BvcnQgaXMgcmVhZHlcbiAgICAgICAgc2VsZi50cmFuc3BvcnQucmVhZHkoc2VsZiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYuY29ubmVjdGluZyA9IHRydWU7XG4gICAgICAgICAgc2VsZi5wdWJsaXNoKCdjb25uZWN0aW5nJywgc2VsZi50cmFuc3BvcnQubmFtZSk7XG4gICAgICAgICAgc2VsZi50cmFuc3BvcnQub3BlbigpO1xuXG4gICAgICAgICAgaWYgKHNlbGYub3B0aW9uc1snY29ubmVjdCB0aW1lb3V0J10pIHtcbiAgICAgICAgICAgIHNlbGYuY29ubmVjdFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpZiAoIXNlbGYuY29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jb25uZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgcmVtYWluaW5nID0gc2VsZi50cmFuc3BvcnRzO1xuXG4gICAgICAgICAgICAgICAgICB3aGlsZSAocmVtYWluaW5nLmxlbmd0aCA+IDAgJiYgcmVtYWluaW5nLnNwbGljZSgwLDEpWzBdICE9XG4gICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnQubmFtZSkge31cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgICAgY29ubmVjdChyZW1haW5pbmcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHNlbGYucHVibGlzaCgnY29ubmVjdF9mYWlsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgc2VsZi5vcHRpb25zWydjb25uZWN0IHRpbWVvdXQnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgY29ubmVjdChzZWxmLnRyYW5zcG9ydHMpO1xuXG4gICAgICBzZWxmLm9uY2UoJ2Nvbm5lY3QnLCBmdW5jdGlvbiAoKXtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuY29ubmVjdFRpbWVvdXRUaW1lcik7XG5cbiAgICAgICAgZm4gJiYgdHlwZW9mIGZuID09ICdmdW5jdGlvbicgJiYgZm4oKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbmQgc2V0cyBhIG5ldyBoZWFydGJlYXQgdGltZW91dCB1c2luZyB0aGUgdmFsdWUgZ2l2ZW4gYnkgdGhlXG4gICAqIHNlcnZlciBkdXJpbmcgdGhlIGhhbmRzaGFrZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuc2V0SGVhcnRiZWF0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5oZWFydGJlYXRUaW1lb3V0VGltZXIpO1xuICAgIGlmKHRoaXMudHJhbnNwb3J0ICYmICF0aGlzLnRyYW5zcG9ydC5oZWFydGJlYXRzKCkpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmhlYXJ0YmVhdFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi50cmFuc3BvcnQub25DbG9zZSgpO1xuICAgIH0sIHRoaXMuaGVhcnRiZWF0VGltZW91dCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgcGFja2V0LlxuICAgKiBAcmV0dXJucyB7aW8uU29ja2V0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnBhY2tldCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKHRoaXMuY29ubmVjdGVkICYmICF0aGlzLmRvQnVmZmVyKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5wYWNrZXQoZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgYnVmZmVyIHN0YXRlXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnNldEJ1ZmZlciA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdGhpcy5kb0J1ZmZlciA9IHY7XG5cbiAgICBpZiAoIXYgJiYgdGhpcy5jb25uZWN0ZWQgJiYgdGhpcy5idWZmZXIubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMub3B0aW9uc1snbWFudWFsRmx1c2gnXSkge1xuICAgICAgICB0aGlzLmZsdXNoQnVmZmVyKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGbHVzaGVzIHRoZSBidWZmZXIgZGF0YSBvdmVyIHRoZSB3aXJlLlxuICAgKiBUbyBiZSBpbnZva2VkIG1hbnVhbGx5IHdoZW4gJ21hbnVhbEZsdXNoJyBpcyBzZXQgdG8gdHJ1ZS5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5mbHVzaEJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudHJhbnNwb3J0LnBheWxvYWQodGhpcy5idWZmZXIpO1xuICAgIHRoaXMuYnVmZmVyID0gW107XG4gIH07XG4gIFxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IHRoZSBlc3RhYmxpc2hlZCBjb25uZWN0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7aW8uU29ja2V0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuY29ubmVjdGVkIHx8IHRoaXMuY29ubmVjdGluZykge1xuICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICB0aGlzLm9mKCcnKS5wYWNrZXQoeyB0eXBlOiAnZGlzY29ubmVjdCcgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGhhbmRsZSBkaXNjb25uZWN0aW9uIGltbWVkaWF0ZWx5XG4gICAgICB0aGlzLm9uRGlzY29ubmVjdCgnYm9vdGVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBzb2NrZXQgd2l0aCBhIHN5bmMgWEhSLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0U3luYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBlbnN1cmUgZGlzY29ubmVjdGlvblxuICAgIHZhciB4aHIgPSBpby51dGlsLnJlcXVlc3QoKTtcbiAgICB2YXIgdXJpID0gW1xuICAgICAgICAnaHR0cCcgKyAodGhpcy5vcHRpb25zLnNlY3VyZSA/ICdzJyA6ICcnKSArICc6LydcbiAgICAgICwgdGhpcy5vcHRpb25zLmhvc3QgKyAnOicgKyB0aGlzLm9wdGlvbnMucG9ydFxuICAgICAgLCB0aGlzLm9wdGlvbnMucmVzb3VyY2VcbiAgICAgICwgaW8ucHJvdG9jb2xcbiAgICAgICwgJydcbiAgICAgICwgdGhpcy5zZXNzaW9uaWRcbiAgICBdLmpvaW4oJy8nKSArICcvP2Rpc2Nvbm5lY3Q9MSc7XG5cbiAgICB4aHIub3BlbignR0VUJywgdXJpLCBmYWxzZSk7XG4gICAgeGhyLnNlbmQobnVsbCk7XG5cbiAgICAvLyBoYW5kbGUgZGlzY29ubmVjdGlvbiBpbW1lZGlhdGVseVxuICAgIHRoaXMub25EaXNjb25uZWN0KCdib290ZWQnKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgd2UgbmVlZCB0byB1c2UgY3Jvc3MgZG9tYWluIGVuYWJsZWQgdHJhbnNwb3J0cy4gQ3Jvc3MgZG9tYWluIHdvdWxkXG4gICAqIGJlIGEgZGlmZmVyZW50IHBvcnQgb3IgZGlmZmVyZW50IGRvbWFpbiBuYW1lLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuaXNYRG9tYWluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHBvcnQgPSBnbG9iYWwubG9jYXRpb24ucG9ydCB8fFxuICAgICAgKCdodHRwczonID09IGdsb2JhbC5sb2NhdGlvbi5wcm90b2NvbCA/IDQ0MyA6IDgwKTtcblxuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuaG9zdCAhPT0gZ2xvYmFsLmxvY2F0aW9uLmhvc3RuYW1lIFxuICAgICAgfHwgdGhpcy5vcHRpb25zLnBvcnQgIT0gcG9ydDtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHVwb24gaGFuZHNoYWtlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbkNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5jb25uZWN0aW5nID0gZmFsc2U7XG4gICAgICBpZiAoIXRoaXMuZG9CdWZmZXIpIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRvIGZsdXNoIHRoZSBidWZmZXJcbiAgICAgICAgdGhpcy5zZXRCdWZmZXIoZmFsc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KCdjb25uZWN0Jyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNwb3J0IG9wZW5zXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNwb3J0IGNsb3Nlcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5oZWFydGJlYXRUaW1lb3V0VGltZXIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNwb3J0IGZpcnN0IG9wZW5zIGEgY29ubmVjdGlvblxuICAgKlxuICAgKiBAcGFyYW0gdGV4dFxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHRoaXMub2YocGFja2V0LmVuZHBvaW50KS5vblBhY2tldChwYWNrZXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFuIGVycm9yLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAgIGlmIChlcnIgJiYgZXJyLmFkdmljZSkge1xuICAgICAgaWYgKGVyci5hZHZpY2UgPT09ICdyZWNvbm5lY3QnICYmICh0aGlzLmNvbm5lY3RlZCB8fCB0aGlzLmNvbm5lY3RpbmcpKSB7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlY29ubmVjdCkge1xuICAgICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnB1Ymxpc2goJ2Vycm9yJywgZXJyICYmIGVyci5yZWFzb24gPyBlcnIucmVhc29uIDogZXJyKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBkaXNjb25uZWN0cy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25EaXNjb25uZWN0ID0gZnVuY3Rpb24gKHJlYXNvbikge1xuICAgIHZhciB3YXNDb25uZWN0ZWQgPSB0aGlzLmNvbm5lY3RlZFxuICAgICAgLCB3YXNDb25uZWN0aW5nID0gdGhpcy5jb25uZWN0aW5nO1xuXG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNvbm5lY3RpbmcgPSBmYWxzZTtcbiAgICB0aGlzLm9wZW4gPSBmYWxzZTtcblxuICAgIGlmICh3YXNDb25uZWN0ZWQgfHwgd2FzQ29ubmVjdGluZykge1xuICAgICAgdGhpcy50cmFuc3BvcnQuY2xvc2UoKTtcbiAgICAgIHRoaXMudHJhbnNwb3J0LmNsZWFyVGltZW91dHMoKTtcbiAgICAgIGlmICh3YXNDb25uZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wdWJsaXNoKCdkaXNjb25uZWN0JywgcmVhc29uKTtcblxuICAgICAgICBpZiAoJ2Jvb3RlZCcgIT0gcmVhc29uICYmIHRoaXMub3B0aW9ucy5yZWNvbm5lY3QgJiYgIXRoaXMucmVjb25uZWN0aW5nKSB7XG4gICAgICAgICAgdGhpcy5yZWNvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHVwb24gcmVjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5yZWNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZWNvbm5lY3RpbmcgPSB0cnVlO1xuICAgIHRoaXMucmVjb25uZWN0aW9uQXR0ZW1wdHMgPSAwO1xuICAgIHRoaXMucmVjb25uZWN0aW9uRGVsYXkgPSB0aGlzLm9wdGlvbnNbJ3JlY29ubmVjdGlvbiBkZWxheSddO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIG1heEF0dGVtcHRzID0gdGhpcy5vcHRpb25zWydtYXggcmVjb25uZWN0aW9uIGF0dGVtcHRzJ11cbiAgICAgICwgdHJ5TXVsdGlwbGUgPSB0aGlzLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ11cbiAgICAgICwgbGltaXQgPSB0aGlzLm9wdGlvbnNbJ3JlY29ubmVjdGlvbiBsaW1pdCddO1xuXG4gICAgZnVuY3Rpb24gcmVzZXQgKCkge1xuICAgICAgaWYgKHNlbGYuY29ubmVjdGVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gc2VsZi5uYW1lc3BhY2VzKSB7XG4gICAgICAgICAgaWYgKHNlbGYubmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShpKSAmJiAnJyAhPT0gaSkge1xuICAgICAgICAgICAgICBzZWxmLm5hbWVzcGFjZXNbaV0ucGFja2V0KHsgdHlwZTogJ2Nvbm5lY3QnIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWxmLnB1Ymxpc2goJ3JlY29ubmVjdCcsIHNlbGYudHJhbnNwb3J0Lm5hbWUsIHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHMpO1xuICAgICAgfVxuXG4gICAgICBjbGVhclRpbWVvdXQoc2VsZi5yZWNvbm5lY3Rpb25UaW1lcik7XG5cbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoJ2Nvbm5lY3RfZmFpbGVkJywgbWF5YmVSZWNvbm5lY3QpO1xuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcignY29ubmVjdCcsIG1heWJlUmVjb25uZWN0KTtcblxuICAgICAgc2VsZi5yZWNvbm5lY3RpbmcgPSBmYWxzZTtcblxuICAgICAgZGVsZXRlIHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHM7XG4gICAgICBkZWxldGUgc2VsZi5yZWNvbm5lY3Rpb25EZWxheTtcbiAgICAgIGRlbGV0ZSBzZWxmLnJlY29ubmVjdGlvblRpbWVyO1xuICAgICAgZGVsZXRlIHNlbGYucmVkb1RyYW5zcG9ydHM7XG5cbiAgICAgIHNlbGYub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSA9IHRyeU11bHRpcGxlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtYXliZVJlY29ubmVjdCAoKSB7XG4gICAgICBpZiAoIXNlbGYucmVjb25uZWN0aW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuY29ubmVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZXNldCgpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHNlbGYuY29ubmVjdGluZyAmJiBzZWxmLnJlY29ubmVjdGluZykge1xuICAgICAgICByZXR1cm4gc2VsZi5yZWNvbm5lY3Rpb25UaW1lciA9IHNldFRpbWVvdXQobWF5YmVSZWNvbm5lY3QsIDEwMDApO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5yZWNvbm5lY3Rpb25BdHRlbXB0cysrID49IG1heEF0dGVtcHRzKSB7XG4gICAgICAgIGlmICghc2VsZi5yZWRvVHJhbnNwb3J0cykge1xuICAgICAgICAgIHNlbGYub24oJ2Nvbm5lY3RfZmFpbGVkJywgbWF5YmVSZWNvbm5lY3QpO1xuICAgICAgICAgIHNlbGYub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSA9IHRydWU7XG4gICAgICAgICAgc2VsZi50cmFuc3BvcnRzID0gc2VsZi5vcmlnVHJhbnNwb3J0cztcbiAgICAgICAgICBzZWxmLnRyYW5zcG9ydCA9IHNlbGYuZ2V0VHJhbnNwb3J0KCk7XG4gICAgICAgICAgc2VsZi5yZWRvVHJhbnNwb3J0cyA9IHRydWU7XG4gICAgICAgICAgc2VsZi5jb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3RfZmFpbGVkJyk7XG4gICAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNlbGYucmVjb25uZWN0aW9uRGVsYXkgPCBsaW1pdCkge1xuICAgICAgICAgIHNlbGYucmVjb25uZWN0aW9uRGVsYXkgKj0gMjsgLy8gZXhwb25lbnRpYWwgYmFjayBvZmZcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuY29ubmVjdCgpO1xuICAgICAgICBzZWxmLnB1Ymxpc2goJ3JlY29ubmVjdGluZycsIHNlbGYucmVjb25uZWN0aW9uRGVsYXksIHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHMpO1xuICAgICAgICBzZWxmLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgc2VsZi5yZWNvbm5lY3Rpb25EZWxheSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSA9IGZhbHNlO1xuICAgIHRoaXMucmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KG1heWJlUmVjb25uZWN0LCB0aGlzLnJlY29ubmVjdGlvbkRlbGF5KTtcblxuICAgIHRoaXMub24oJ2Nvbm5lY3QnLCBtYXliZVJlY29ubmVjdCk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuU29ja2V0TmFtZXNwYWNlID0gU29ja2V0TmFtZXNwYWNlO1xuXG4gIC8qKlxuICAgKiBTb2NrZXQgbmFtZXNwYWNlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gU29ja2V0TmFtZXNwYWNlIChzb2NrZXQsIG5hbWUpIHtcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLm5hbWUgPSBuYW1lIHx8ICcnO1xuICAgIHRoaXMuZmxhZ3MgPSB7fTtcbiAgICB0aGlzLmpzb24gPSBuZXcgRmxhZyh0aGlzLCAnanNvbicpO1xuICAgIHRoaXMuYWNrUGFja2V0cyA9IDA7XG4gICAgdGhpcy5hY2tzID0ge307XG4gIH07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihTb2NrZXROYW1lc3BhY2UsIGlvLkV2ZW50RW1pdHRlcik7XG5cbiAgLyoqXG4gICAqIENvcGllcyBlbWl0IHNpbmNlIHdlIG92ZXJyaWRlIGl0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLiRlbWl0ID0gaW8uRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IG5hbWVzcGFjZSwgYnkgcHJveHlpbmcgdGhlIHJlcXVlc3QgdG8gdGhlIHNvY2tldC4gVGhpc1xuICAgKiBhbGxvd3MgdXMgdG8gdXNlIHRoZSBzeW5heCBhcyB3ZSBkbyBvbiB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLm9mID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5vZi5hcHBseSh0aGlzLnNvY2tldCwgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBwYWNrZXQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLnBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICBwYWNrZXQuZW5kcG9pbnQgPSB0aGlzLm5hbWU7XG4gICAgdGhpcy5zb2NrZXQucGFja2V0KHBhY2tldCk7XG4gICAgdGhpcy5mbGFncyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2VcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEsIGZuKSB7XG4gICAgdmFyIHBhY2tldCA9IHtcbiAgICAgICAgdHlwZTogdGhpcy5mbGFncy5qc29uID8gJ2pzb24nIDogJ21lc3NhZ2UnXG4gICAgICAsIGRhdGE6IGRhdGFcbiAgICB9O1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGZuKSB7XG4gICAgICBwYWNrZXQuaWQgPSArK3RoaXMuYWNrUGFja2V0cztcbiAgICAgIHBhY2tldC5hY2sgPSB0cnVlO1xuICAgICAgdGhpcy5hY2tzW3BhY2tldC5pZF0gPSBmbjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdHMgYW4gZXZlbnRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIFxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICAgLCBsYXN0QXJnID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXG4gICAgICAsIHBhY2tldCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdldmVudCdcbiAgICAgICAgICAsIG5hbWU6IG5hbWVcbiAgICAgICAgfTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBsYXN0QXJnKSB7XG4gICAgICBwYWNrZXQuaWQgPSArK3RoaXMuYWNrUGFja2V0cztcbiAgICAgIHBhY2tldC5hY2sgPSAnZGF0YSc7XG4gICAgICB0aGlzLmFja3NbcGFja2V0LmlkXSA9IGxhc3RBcmc7XG4gICAgICBhcmdzID0gYXJncy5zbGljZSgwLCBhcmdzLmxlbmd0aCAtIDEpO1xuICAgIH1cblxuICAgIHBhY2tldC5hcmdzID0gYXJncztcblxuICAgIHJldHVybiB0aGlzLnBhY2tldChwYWNrZXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgbmFtZXNwYWNlXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJycpIHtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYWNrZXQoeyB0eXBlOiAnZGlzY29ubmVjdCcgfSk7XG4gICAgICB0aGlzLiRlbWl0KCdkaXNjb25uZWN0Jyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYSBwYWNrZXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gYWNrICgpIHtcbiAgICAgIHNlbGYucGFja2V0KHtcbiAgICAgICAgICB0eXBlOiAnYWNrJ1xuICAgICAgICAsIGFyZ3M6IGlvLnV0aWwudG9BcnJheShhcmd1bWVudHMpXG4gICAgICAgICwgYWNrSWQ6IHBhY2tldC5pZFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHN3aXRjaCAocGFja2V0LnR5cGUpIHtcbiAgICAgIGNhc2UgJ2Nvbm5lY3QnOlxuICAgICAgICB0aGlzLiRlbWl0KCdjb25uZWN0Jyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdkaXNjb25uZWN0JzpcbiAgICAgICAgaWYgKHRoaXMubmFtZSA9PT0gJycpIHtcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbkRpc2Nvbm5lY3QocGFja2V0LnJlYXNvbiB8fCAnYm9vdGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy4kZW1pdCgnZGlzY29ubmVjdCcsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICB2YXIgcGFyYW1zID0gWydtZXNzYWdlJywgcGFja2V0LmRhdGFdO1xuXG4gICAgICAgIGlmIChwYWNrZXQuYWNrID09ICdkYXRhJykge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKGFjayk7XG4gICAgICAgIH0gZWxzZSBpZiAocGFja2V0LmFjaykge1xuICAgICAgICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2FjaycsIGFja0lkOiBwYWNrZXQuaWQgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLiRlbWl0LmFwcGx5KHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdldmVudCc6XG4gICAgICAgIHZhciBwYXJhbXMgPSBbcGFja2V0Lm5hbWVdLmNvbmNhdChwYWNrZXQuYXJncyk7XG5cbiAgICAgICAgaWYgKHBhY2tldC5hY2sgPT0gJ2RhdGEnKVxuICAgICAgICAgIHBhcmFtcy5wdXNoKGFjayk7XG5cbiAgICAgICAgdGhpcy4kZW1pdC5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgaWYgKHRoaXMuYWNrc1twYWNrZXQuYWNrSWRdKSB7XG4gICAgICAgICAgdGhpcy5hY2tzW3BhY2tldC5hY2tJZF0uYXBwbHkodGhpcywgcGFja2V0LmFyZ3MpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmFja3NbcGFja2V0LmFja0lkXTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICBpZiAocGFja2V0LmFkdmljZSl7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25FcnJvcihwYWNrZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwYWNrZXQucmVhc29uID09ICd1bmF1dGhvcml6ZWQnKSB7XG4gICAgICAgICAgICB0aGlzLiRlbWl0KCdjb25uZWN0X2ZhaWxlZCcsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRlbWl0KCdlcnJvcicsIHBhY2tldC5yZWFzb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEZsYWcgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gRmxhZyAobnNwLCBuYW1lKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuc3A7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBhIG1lc3NhZ2VcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhZy5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm5hbWVzcGFjZS5mbGFnc1t0aGlzLm5hbWVdID0gdHJ1ZTtcbiAgICB0aGlzLm5hbWVzcGFjZS5zZW5kLmFwcGx5KHRoaXMubmFtZXNwYWNlLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0IGFuIGV2ZW50XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYWcucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UuZmxhZ3NbdGhpcy5uYW1lXSA9IHRydWU7XG4gICAgdGhpcy5uYW1lc3BhY2UuZW1pdC5hcHBseSh0aGlzLm5hbWVzcGFjZSwgYXJndW1lbnRzKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy53ZWJzb2NrZXQgPSBXUztcblxuICAvKipcbiAgICogVGhlIFdlYlNvY2tldCB0cmFuc3BvcnQgdXNlcyB0aGUgSFRNTDUgV2ViU29ja2V0IEFQSSB0byBlc3RhYmxpc2ggYW5cbiAgICogcGVyc2lzdGVudCBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoaXMgdHJhbnNwb3J0IHdpbGwgYWxzb1xuICAgKiBiZSBpbmhlcml0ZWQgYnkgdGhlIEZsYXNoU29ja2V0IGZhbGxiYWNrIGFzIGl0IHByb3ZpZGVzIGEgQVBJIGNvbXBhdGlibGVcbiAgICogcG9seWZpbGwgZm9yIHRoZSBXZWJTb2NrZXRzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gV1MgKHNvY2tldCkge1xuICAgIGlvLlRyYW5zcG9ydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KFdTLCBpby5UcmFuc3BvcnQpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUubmFtZSA9ICd3ZWJzb2NrZXQnO1xuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBhIG5ldyBgV2ViU29ja2V0YCBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFdlIGF0dGFjaFxuICAgKiBhbGwgdGhlIGFwcHJvcHJpYXRlIGxpc3RlbmVycyB0byBoYW5kbGUgdGhlIHJlc3BvbnNlcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBxdWVyeSA9IGlvLnV0aWwucXVlcnkodGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeSlcbiAgICAgICwgc2VsZiA9IHRoaXNcbiAgICAgICwgU29ja2V0XG5cblxuICAgIGlmICghU29ja2V0KSB7XG4gICAgICBTb2NrZXQgPSBnbG9iYWwuTW96V2ViU29ja2V0IHx8IGdsb2JhbC5XZWJTb2NrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy53ZWJzb2NrZXQgPSBuZXcgU29ja2V0KHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnkpO1xuXG4gICAgdGhpcy53ZWJzb2NrZXQub25vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vbk9wZW4oKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcbiAgICB0aGlzLndlYnNvY2tldC5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIHNlbGYub25EYXRhKGV2LmRhdGEpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBzZWxmLm9uRXJyb3IoZSk7XG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlci4gVGhlIG1lc3NhZ2Ugd2lsbCBhdXRvbWF0aWNhbGx5IGJlXG4gICAqIGVuY29kZWQgaW4gdGhlIGNvcnJlY3QgbWVzc2FnZSBmb3JtYXQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIC8vIERvIHRvIGEgYnVnIGluIHRoZSBjdXJyZW50IElEZXZpY2VzIGJyb3dzZXIsIHdlIG5lZWQgdG8gd3JhcCB0aGUgc2VuZCBpbiBhIFxuICAvLyBzZXRUaW1lb3V0LCB3aGVuIHRoZXkgcmVzdW1lIGZyb20gc2xlZXBpbmcgdGhlIGJyb3dzZXIgd2lsbCBjcmFzaCBpZiBcbiAgLy8gd2UgZG9uJ3QgYWxsb3cgdGhlIGJyb3dzZXIgdGltZSB0byBkZXRlY3QgdGhlIHNvY2tldCBoYXMgYmVlbiBjbG9zZWRcbiAgaWYgKGlvLnV0aWwudWEuaURldmljZSkge1xuICAgIFdTLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICBzZWxmLndlYnNvY2tldC5zZW5kKGRhdGEpO1xuICAgICAgfSwwKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgV1MucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgdGhpcy53ZWJzb2NrZXQuc2VuZChkYXRhKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUGF5bG9hZFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLnBheWxvYWQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnIubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLnBhY2tldChhcnJbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdCB0aGUgZXN0YWJsaXNoZWQgYFdlYlNvY2tldGAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMud2Vic29ja2V0LmNsb3NlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgZXJyb3JzIHRoYXQgYFdlYlNvY2tldGAgbWlnaHQgYmUgZ2l2aW5nIHdoZW4gd2VcbiAgICogYXJlIGF0dGVtcHRpbmcgdG8gY29ubmVjdCBvciBzZW5kIG1lc3NhZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Vycm9yfSBlIFRoZSBlcnJvci5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gKGUpIHtcbiAgICB0aGlzLnNvY2tldC5vbkVycm9yKGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcHByb3ByaWF0ZSBzY2hlbWUgZm9yIHRoZSBVUkkgZ2VuZXJhdGlvbi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBXUy5wcm90b3R5cGUuc2NoZW1lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5vcHRpb25zLnNlY3VyZSA/ICd3c3MnIDogJ3dzJztcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBicm93c2VyIGhhcyBzdXBwb3J0IGZvciBuYXRpdmUgYFdlYlNvY2tldHNgIGFuZCB0aGF0XG4gICAqIGl0J3Mgbm90IHRoZSBwb2x5ZmlsbCBjcmVhdGVkIGZvciB0aGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKCdXZWJTb2NrZXQnIGluIGdsb2JhbCAmJiAhKCdfX2FkZFRhc2snIGluIFdlYlNvY2tldCkpXG4gICAgICAgICAgfHwgJ01veldlYlNvY2tldCcgaW4gZ2xvYmFsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgYFdlYlNvY2tldGAgdHJhbnNwb3J0IHN1cHBvcnQgY3Jvc3MgZG9tYWluIGNvbW11bmljYXRpb25zLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCd3ZWJzb2NrZXQnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5mbGFzaHNvY2tldCA9IEZsYXNoc29ja2V0O1xuXG4gIC8qKlxuICAgKiBUaGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0LiBUaGlzIGlzIGEgQVBJIHdyYXBwZXIgZm9yIHRoZSBIVE1MNSBXZWJTb2NrZXRcbiAgICogc3BlY2lmaWNhdGlvbi4gSXQgdXNlcyBhIC5zd2YgZmlsZSB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBzZXJ2ZXIuIElmIHlvdSB3YW50XG4gICAqIHRvIHNlcnZlIHRoZSAuc3dmIGZpbGUgZnJvbSBhIG90aGVyIHNlcnZlciB0aGFuIHdoZXJlIHRoZSBTb2NrZXQuSU8gc2NyaXB0IGlzXG4gICAqIGNvbWluZyBmcm9tIHlvdSBuZWVkIHRvIHVzZSB0aGUgaW5zZWN1cmUgdmVyc2lvbiBvZiB0aGUgLnN3Zi4gTW9yZSBpbmZvcm1hdGlvblxuICAgKiBhYm91dCB0aGlzIGNhbiBiZSBmb3VuZCBvbiB0aGUgZ2l0aHViIHBhZ2UuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAZXh0ZW5kcyB7aW8uVHJhbnNwb3J0LndlYnNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gRmxhc2hzb2NrZXQgKCkge1xuICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChGbGFzaHNvY2tldCwgaW8uVHJhbnNwb3J0LndlYnNvY2tldCk7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5uYW1lID0gJ2ZsYXNoc29ja2V0JztcblxuICAvKipcbiAgICogRGlzY29ubmVjdCB0aGUgZXN0YWJsaXNoZWQgYEZsYXNoU29ja2V0YCBjb25uZWN0aW9uLiBUaGlzIGlzIGRvbmUgYnkgYWRkaW5nIGEgXG4gICAqIG5ldyB0YXNrIHRvIHRoZSBGbGFzaFNvY2tldC4gVGhlIHJlc3Qgd2lsbCBiZSBoYW5kbGVkIG9mZiBieSB0aGUgYFdlYlNvY2tldGAgXG4gICAqIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQucHJvdG90eXBlLm9wZW4uYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIFxuICAvKipcbiAgICogU2VuZHMgYSBtZXNzYWdlIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBUaGlzIGlzIGRvbmUgYnkgYWRkaW5nIGEgbmV3XG4gICAqIHRhc2sgdG8gdGhlIEZsYXNoU29ja2V0LiBUaGUgcmVzdCB3aWxsIGJlIGhhbmRsZWQgb2ZmIGJ5IHRoZSBgV2ViU29ja2V0YCBcbiAgICogdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgV2ViU29ja2V0Ll9fYWRkVGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LnByb3RvdHlwZS5zZW5kLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgZXN0YWJsaXNoZWQgYEZsYXNoU29ja2V0YCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgV2ViU29ja2V0Ll9fdGFza3MubGVuZ3RoID0gMDtcbiAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgV2ViU29ja2V0IGZhbGwgYmFjayBuZWVkcyB0byBhcHBlbmQgdGhlIGZsYXNoIGNvbnRhaW5lciB0byB0aGUgYm9keVxuICAgKiBlbGVtZW50LCBzbyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB3ZSBoYXZlIGFjY2VzcyB0byBpdC4gT3IgZGVmZXIgdGhlIGNhbGxcbiAgICogdW50aWwgd2UgYXJlIHN1cmUgdGhlcmUgaXMgYSBib2R5IGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gc29ja2V0Lm9wdGlvbnNcbiAgICAgICAgLCBwb3J0ID0gb3B0aW9uc1snZmxhc2ggcG9saWN5IHBvcnQnXVxuICAgICAgICAsIHBhdGggPSBbXG4gICAgICAgICAgICAgICdodHRwJyArIChvcHRpb25zLnNlY3VyZSA/ICdzJyA6ICcnKSArICc6LydcbiAgICAgICAgICAgICwgb3B0aW9ucy5ob3N0ICsgJzonICsgb3B0aW9ucy5wb3J0XG4gICAgICAgICAgICAsIG9wdGlvbnMucmVzb3VyY2VcbiAgICAgICAgICAgICwgJ3N0YXRpYy9mbGFzaHNvY2tldCdcbiAgICAgICAgICAgICwgJ1dlYlNvY2tldE1haW4nICsgKHNvY2tldC5pc1hEb21haW4oKSA/ICdJbnNlY3VyZScgOiAnJykgKyAnLnN3ZidcbiAgICAgICAgICBdO1xuXG4gICAgICAvLyBPbmx5IHN0YXJ0IGRvd25sb2FkaW5nIHRoZSBzd2YgZmlsZSB3aGVuIHRoZSBjaGVja2VkIHRoYXQgdGhpcyBicm93c2VyXG4gICAgICAvLyBhY3R1YWxseSBzdXBwb3J0cyBpdFxuICAgICAgaWYgKCFGbGFzaHNvY2tldC5sb2FkZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBXRUJfU09DS0VUX1NXRl9MT0NBVElPTiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBTZXQgdGhlIGNvcnJlY3QgZmlsZSBiYXNlZCBvbiB0aGUgWERvbWFpbiBzZXR0aW5nc1xuICAgICAgICAgIFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OID0gcGF0aC5qb2luKCcvJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9ydCAhPT0gODQzKSB7XG4gICAgICAgICAgV2ViU29ja2V0LmxvYWRGbGFzaFBvbGljeUZpbGUoJ3htbHNvY2tldDovLycgKyBvcHRpb25zLmhvc3QgKyAnOicgKyBwb3J0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIFdlYlNvY2tldC5fX2luaXRpYWxpemUoKTtcbiAgICAgICAgRmxhc2hzb2NrZXQubG9hZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZm4uY2FsbChzZWxmKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKGRvY3VtZW50LmJvZHkpIHJldHVybiBpbml0KCk7XG5cbiAgICBpby51dGlsLmxvYWQoaW5pdCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQgaXMgc3VwcG9ydGVkIGFzIGl0IHJlcXVpcmVzIHRoYXQgdGhlIEFkb2JlXG4gICAqIEZsYXNoIFBsYXllciBwbHVnLWluIHZlcnNpb24gYDEwLjAuMGAgb3IgZ3JlYXRlciBpcyBpbnN0YWxsZWQuIEFuZCBhbHNvIGNoZWNrIGlmXG4gICAqIHRoZSBwb2x5ZmlsbCBpcyBjb3JyZWN0bHkgbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgV2ViU29ja2V0ID09ICd1bmRlZmluZWQnXG4gICAgICB8fCAhKCdfX2luaXRpYWxpemUnIGluIFdlYlNvY2tldCkgfHwgIXN3Zm9iamVjdFxuICAgICkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHN3Zm9iamVjdC5nZXRGbGFzaFBsYXllclZlcnNpb24oKS5tYWpvciA+PSAxMDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydCBjYW4gYmUgdXNlZCBhcyBjcm9zcyBkb21haW4gLyBjcm9zcyBvcmlnaW4gXG4gICAqIHRyYW5zcG9ydC4gQmVjYXVzZSB3ZSBjYW4ndCBzZWUgd2hpY2ggdHlwZSAoc2VjdXJlIG9yIGluc2VjdXJlKSBvZiAuc3dmIGlzIHVzZWRcbiAgICogd2Ugd2lsbCBqdXN0IHJldHVybiB0cnVlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlIEFVVE9fSU5JVElBTElaQVRJT05cbiAgICovXG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBXRUJfU09DS0VUX0RJU0FCTEVfQVVUT19JTklUSUFMSVpBVElPTiA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnZmxhc2hzb2NrZXQnKTtcbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbik7XG4vKlx0U1dGT2JqZWN0IHYyLjIgPGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9zd2ZvYmplY3QvPiBcblx0aXMgcmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIDxodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocD4gXG4qL1xuaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiB3aW5kb3cpIHtcbnZhciBzd2ZvYmplY3Q9ZnVuY3Rpb24oKXt2YXIgRD1cInVuZGVmaW5lZFwiLHI9XCJvYmplY3RcIixTPVwiU2hvY2t3YXZlIEZsYXNoXCIsVz1cIlNob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoXCIscT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIsUj1cIlNXRk9iamVjdEV4cHJJbnN0XCIseD1cIm9ucmVhZHlzdGF0ZWNoYW5nZVwiLE89d2luZG93LGo9ZG9jdW1lbnQsdD1uYXZpZ2F0b3IsVD1mYWxzZSxVPVtoXSxvPVtdLE49W10sST1bXSxsLFEsRSxCLEo9ZmFsc2UsYT1mYWxzZSxuLEcsbT10cnVlLE09ZnVuY3Rpb24oKXt2YXIgYWE9dHlwZW9mIGouZ2V0RWxlbWVudEJ5SWQhPUQmJnR5cGVvZiBqLmdldEVsZW1lbnRzQnlUYWdOYW1lIT1EJiZ0eXBlb2Ygai5jcmVhdGVFbGVtZW50IT1ELGFoPXQudXNlckFnZW50LnRvTG93ZXJDYXNlKCksWT10LnBsYXRmb3JtLnRvTG93ZXJDYXNlKCksYWU9WT8vd2luLy50ZXN0KFkpOi93aW4vLnRlc3QoYWgpLGFjPVk/L21hYy8udGVzdChZKTovbWFjLy50ZXN0KGFoKSxhZj0vd2Via2l0Ly50ZXN0KGFoKT9wYXJzZUZsb2F0KGFoLnJlcGxhY2UoL14uKndlYmtpdFxcLyhcXGQrKFxcLlxcZCspPykuKiQvLFwiJDFcIikpOmZhbHNlLFg9IStcIlxcdjFcIixhZz1bMCwwLDBdLGFiPW51bGw7aWYodHlwZW9mIHQucGx1Z2lucyE9RCYmdHlwZW9mIHQucGx1Z2luc1tTXT09cil7YWI9dC5wbHVnaW5zW1NdLmRlc2NyaXB0aW9uO2lmKGFiJiYhKHR5cGVvZiB0Lm1pbWVUeXBlcyE9RCYmdC5taW1lVHlwZXNbcV0mJiF0Lm1pbWVUeXBlc1txXS5lbmFibGVkUGx1Z2luKSl7VD10cnVlO1g9ZmFsc2U7YWI9YWIucmVwbGFjZSgvXi4qXFxzKyhcXFMrXFxzK1xcUyskKS8sXCIkMVwiKTthZ1swXT1wYXJzZUludChhYi5yZXBsYWNlKC9eKC4qKVxcLi4qJC8sXCIkMVwiKSwxMCk7YWdbMV09cGFyc2VJbnQoYWIucmVwbGFjZSgvXi4qXFwuKC4qKVxccy4qJC8sXCIkMVwiKSwxMCk7YWdbMl09L1thLXpBLVpdLy50ZXN0KGFiKT9wYXJzZUludChhYi5yZXBsYWNlKC9eLipbYS16QS1aXSsoLiopJC8sXCIkMVwiKSwxMCk6MH19ZWxzZXtpZih0eXBlb2YgT1soWydBY3RpdmUnXS5jb25jYXQoJ09iamVjdCcpLmpvaW4oJ1gnKSldIT1EKXt0cnl7dmFyIGFkPW5ldyB3aW5kb3dbKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXShXKTtpZihhZCl7YWI9YWQuR2V0VmFyaWFibGUoXCIkdmVyc2lvblwiKTtpZihhYil7WD10cnVlO2FiPWFiLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7YWc9W3BhcnNlSW50KGFiWzBdLDEwKSxwYXJzZUludChhYlsxXSwxMCkscGFyc2VJbnQoYWJbMl0sMTApXX19fWNhdGNoKFope319fXJldHVybnt3MzphYSxwdjphZyx3azphZixpZTpYLHdpbjphZSxtYWM6YWN9fSgpLGs9ZnVuY3Rpb24oKXtpZighTS53Myl7cmV0dXJufWlmKCh0eXBlb2Ygai5yZWFkeVN0YXRlIT1EJiZqLnJlYWR5U3RhdGU9PVwiY29tcGxldGVcIil8fCh0eXBlb2Ygai5yZWFkeVN0YXRlPT1EJiYoai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF18fGouYm9keSkpKXtmKCl9aWYoIUope2lmKHR5cGVvZiBqLmFkZEV2ZW50TGlzdGVuZXIhPUQpe2ouYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixmLGZhbHNlKX1pZihNLmllJiZNLndpbil7ai5hdHRhY2hFdmVudCh4LGZ1bmN0aW9uKCl7aWYoai5yZWFkeVN0YXRlPT1cImNvbXBsZXRlXCIpe2ouZGV0YWNoRXZlbnQoeCxhcmd1bWVudHMuY2FsbGVlKTtmKCl9fSk7aWYoTz09dG9wKXsoZnVuY3Rpb24oKXtpZihKKXtyZXR1cm59dHJ5e2ouZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKFwibGVmdFwiKX1jYXRjaChYKXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMCk7cmV0dXJufWYoKX0pKCl9fWlmKE0ud2speyhmdW5jdGlvbigpe2lmKEope3JldHVybn1pZighL2xvYWRlZHxjb21wbGV0ZS8udGVzdChqLnJlYWR5U3RhdGUpKXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMCk7cmV0dXJufWYoKX0pKCl9cyhmKX19KCk7ZnVuY3Rpb24gZigpe2lmKEope3JldHVybn10cnl7dmFyIFo9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoQyhcInNwYW5cIikpO1oucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChaKX1jYXRjaChhYSl7cmV0dXJufUo9dHJ1ZTt2YXIgWD1VLmxlbmd0aDtmb3IodmFyIFk9MDtZPFg7WSsrKXtVW1ldKCl9fWZ1bmN0aW9uIEsoWCl7aWYoSil7WCgpfWVsc2V7VVtVLmxlbmd0aF09WH19ZnVuY3Rpb24gcyhZKXtpZih0eXBlb2YgTy5hZGRFdmVudExpc3RlbmVyIT1EKXtPLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsWSxmYWxzZSl9ZWxzZXtpZih0eXBlb2Ygai5hZGRFdmVudExpc3RlbmVyIT1EKXtqLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsWSxmYWxzZSl9ZWxzZXtpZih0eXBlb2YgTy5hdHRhY2hFdmVudCE9RCl7aShPLFwib25sb2FkXCIsWSl9ZWxzZXtpZih0eXBlb2YgTy5vbmxvYWQ9PVwiZnVuY3Rpb25cIil7dmFyIFg9Ty5vbmxvYWQ7Ty5vbmxvYWQ9ZnVuY3Rpb24oKXtYKCk7WSgpfX1lbHNle08ub25sb2FkPVl9fX19fWZ1bmN0aW9uIGgoKXtpZihUKXtWKCl9ZWxzZXtIKCl9fWZ1bmN0aW9uIFYoKXt2YXIgWD1qLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTt2YXIgYWE9QyhyKTthYS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIscSk7dmFyIFo9WC5hcHBlbmRDaGlsZChhYSk7aWYoWil7dmFyIFk9MDsoZnVuY3Rpb24oKXtpZih0eXBlb2YgWi5HZXRWYXJpYWJsZSE9RCl7dmFyIGFiPVouR2V0VmFyaWFibGUoXCIkdmVyc2lvblwiKTtpZihhYil7YWI9YWIuc3BsaXQoXCIgXCIpWzFdLnNwbGl0KFwiLFwiKTtNLnB2PVtwYXJzZUludChhYlswXSwxMCkscGFyc2VJbnQoYWJbMV0sMTApLHBhcnNlSW50KGFiWzJdLDEwKV19fWVsc2V7aWYoWTwxMCl7WSsrO3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCk7cmV0dXJufX1YLnJlbW92ZUNoaWxkKGFhKTtaPW51bGw7SCgpfSkoKX1lbHNle0goKX19ZnVuY3Rpb24gSCgpe3ZhciBhZz1vLmxlbmd0aDtpZihhZz4wKXtmb3IodmFyIGFmPTA7YWY8YWc7YWYrKyl7dmFyIFk9b1thZl0uaWQ7dmFyIGFiPW9bYWZdLmNhbGxiYWNrRm47dmFyIGFhPXtzdWNjZXNzOmZhbHNlLGlkOll9O2lmKE0ucHZbMF0+MCl7dmFyIGFlPWMoWSk7aWYoYWUpe2lmKEYob1thZl0uc3dmVmVyc2lvbikmJiEoTS53ayYmTS53azwzMTIpKXt3KFksdHJ1ZSk7aWYoYWIpe2FhLnN1Y2Nlc3M9dHJ1ZTthYS5yZWY9eihZKTthYihhYSl9fWVsc2V7aWYob1thZl0uZXhwcmVzc0luc3RhbGwmJkEoKSl7dmFyIGFpPXt9O2FpLmRhdGE9b1thZl0uZXhwcmVzc0luc3RhbGw7YWkud2lkdGg9YWUuZ2V0QXR0cmlidXRlKFwid2lkdGhcIil8fFwiMFwiO2FpLmhlaWdodD1hZS5nZXRBdHRyaWJ1dGUoXCJoZWlnaHRcIil8fFwiMFwiO2lmKGFlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpKXthaS5zdHlsZWNsYXNzPWFlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpfWlmKGFlLmdldEF0dHJpYnV0ZShcImFsaWduXCIpKXthaS5hbGlnbj1hZS5nZXRBdHRyaWJ1dGUoXCJhbGlnblwiKX12YXIgYWg9e307dmFyIFg9YWUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXJhbVwiKTt2YXIgYWM9WC5sZW5ndGg7Zm9yKHZhciBhZD0wO2FkPGFjO2FkKyspe2lmKFhbYWRdLmdldEF0dHJpYnV0ZShcIm5hbWVcIikudG9Mb3dlckNhc2UoKSE9XCJtb3ZpZVwiKXthaFtYW2FkXS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpXT1YW2FkXS5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKX19UChhaSxhaCxZLGFiKX1lbHNle3AoYWUpO2lmKGFiKXthYihhYSl9fX19fWVsc2V7dyhZLHRydWUpO2lmKGFiKXt2YXIgWj16KFkpO2lmKFomJnR5cGVvZiBaLlNldFZhcmlhYmxlIT1EKXthYS5zdWNjZXNzPXRydWU7YWEucmVmPVp9YWIoYWEpfX19fX1mdW5jdGlvbiB6KGFhKXt2YXIgWD1udWxsO3ZhciBZPWMoYWEpO2lmKFkmJlkubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2lmKHR5cGVvZiBZLlNldFZhcmlhYmxlIT1EKXtYPVl9ZWxzZXt2YXIgWj1ZLmdldEVsZW1lbnRzQnlUYWdOYW1lKHIpWzBdO2lmKFope1g9Wn19fXJldHVybiBYfWZ1bmN0aW9uIEEoKXtyZXR1cm4gIWEmJkYoXCI2LjAuNjVcIikmJihNLndpbnx8TS5tYWMpJiYhKE0ud2smJk0ud2s8MzEyKX1mdW5jdGlvbiBQKGFhLGFiLFgsWil7YT10cnVlO0U9Wnx8bnVsbDtCPXtzdWNjZXNzOmZhbHNlLGlkOlh9O3ZhciBhZT1jKFgpO2lmKGFlKXtpZihhZS5ub2RlTmFtZT09XCJPQkpFQ1RcIil7bD1nKGFlKTtRPW51bGx9ZWxzZXtsPWFlO1E9WH1hYS5pZD1SO2lmKHR5cGVvZiBhYS53aWR0aD09RHx8KCEvJSQvLnRlc3QoYWEud2lkdGgpJiZwYXJzZUludChhYS53aWR0aCwxMCk8MzEwKSl7YWEud2lkdGg9XCIzMTBcIn1pZih0eXBlb2YgYWEuaGVpZ2h0PT1EfHwoIS8lJC8udGVzdChhYS5oZWlnaHQpJiZwYXJzZUludChhYS5oZWlnaHQsMTApPDEzNykpe2FhLmhlaWdodD1cIjEzN1wifWoudGl0bGU9ai50aXRsZS5zbGljZSgwLDQ3KStcIiAtIEZsYXNoIFBsYXllciBJbnN0YWxsYXRpb25cIjt2YXIgYWQ9TS5pZSYmTS53aW4/KFsnQWN0aXZlJ10uY29uY2F0KCcnKS5qb2luKCdYJykpOlwiUGx1Z0luXCIsYWM9XCJNTXJlZGlyZWN0VVJMPVwiK08ubG9jYXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKC8mL2csXCIlMjZcIikrXCImTU1wbGF5ZXJUeXBlPVwiK2FkK1wiJk1NZG9jdGl0bGU9XCIrai50aXRsZTtpZih0eXBlb2YgYWIuZmxhc2h2YXJzIT1EKXthYi5mbGFzaHZhcnMrPVwiJlwiK2FjfWVsc2V7YWIuZmxhc2h2YXJzPWFjfWlmKE0uaWUmJk0ud2luJiZhZS5yZWFkeVN0YXRlIT00KXt2YXIgWT1DKFwiZGl2XCIpO1grPVwiU1dGT2JqZWN0TmV3XCI7WS5zZXRBdHRyaWJ1dGUoXCJpZFwiLFgpO2FlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFksYWUpO2FlLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7KGZ1bmN0aW9uKCl7aWYoYWUucmVhZHlTdGF0ZT09NCl7YWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhZSl9ZWxzZXtzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApfX0pKCl9dShhYSxhYixYKX19ZnVuY3Rpb24gcChZKXtpZihNLmllJiZNLndpbiYmWS5yZWFkeVN0YXRlIT00KXt2YXIgWD1DKFwiZGl2XCIpO1kucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoWCxZKTtYLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGcoWSksWCk7WS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKFkucmVhZHlTdGF0ZT09NCl7WS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFkpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfWVsc2V7WS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChnKFkpLFkpfX1mdW5jdGlvbiBnKGFiKXt2YXIgYWE9QyhcImRpdlwiKTtpZihNLndpbiYmTS5pZSl7YWEuaW5uZXJIVE1MPWFiLmlubmVySFRNTH1lbHNle3ZhciBZPWFiLmdldEVsZW1lbnRzQnlUYWdOYW1lKHIpWzBdO2lmKFkpe3ZhciBhZD1ZLmNoaWxkTm9kZXM7aWYoYWQpe3ZhciBYPWFkLmxlbmd0aDtmb3IodmFyIFo9MDtaPFg7WisrKXtpZighKGFkW1pdLm5vZGVUeXBlPT0xJiZhZFtaXS5ub2RlTmFtZT09XCJQQVJBTVwiKSYmIShhZFtaXS5ub2RlVHlwZT09OCkpe2FhLmFwcGVuZENoaWxkKGFkW1pdLmNsb25lTm9kZSh0cnVlKSl9fX19fXJldHVybiBhYX1mdW5jdGlvbiB1KGFpLGFnLFkpe3ZhciBYLGFhPWMoWSk7aWYoTS53ayYmTS53azwzMTIpe3JldHVybiBYfWlmKGFhKXtpZih0eXBlb2YgYWkuaWQ9PUQpe2FpLmlkPVl9aWYoTS5pZSYmTS53aW4pe3ZhciBhaD1cIlwiO2Zvcih2YXIgYWUgaW4gYWkpe2lmKGFpW2FlXSE9T2JqZWN0LnByb3RvdHlwZVthZV0pe2lmKGFlLnRvTG93ZXJDYXNlKCk9PVwiZGF0YVwiKXthZy5tb3ZpZT1haVthZV19ZWxzZXtpZihhZS50b0xvd2VyQ2FzZSgpPT1cInN0eWxlY2xhc3NcIil7YWgrPScgY2xhc3M9XCInK2FpW2FlXSsnXCInfWVsc2V7aWYoYWUudG9Mb3dlckNhc2UoKSE9XCJjbGFzc2lkXCIpe2FoKz1cIiBcIithZSsnPVwiJythaVthZV0rJ1wiJ319fX19dmFyIGFmPVwiXCI7Zm9yKHZhciBhZCBpbiBhZyl7aWYoYWdbYWRdIT1PYmplY3QucHJvdG90eXBlW2FkXSl7YWYrPSc8cGFyYW0gbmFtZT1cIicrYWQrJ1wiIHZhbHVlPVwiJythZ1thZF0rJ1wiIC8+J319YWEub3V0ZXJIVE1MPSc8b2JqZWN0IGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIicrYWgrXCI+XCIrYWYrXCI8L29iamVjdD5cIjtOW04ubGVuZ3RoXT1haS5pZDtYPWMoYWkuaWQpfWVsc2V7dmFyIFo9QyhyKTtaLnNldEF0dHJpYnV0ZShcInR5cGVcIixxKTtmb3IodmFyIGFjIGluIGFpKXtpZihhaVthY10hPU9iamVjdC5wcm90b3R5cGVbYWNdKXtpZihhYy50b0xvd2VyQ2FzZSgpPT1cInN0eWxlY2xhc3NcIil7Wi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLGFpW2FjXSl9ZWxzZXtpZihhYy50b0xvd2VyQ2FzZSgpIT1cImNsYXNzaWRcIil7Wi5zZXRBdHRyaWJ1dGUoYWMsYWlbYWNdKX19fX1mb3IodmFyIGFiIGluIGFnKXtpZihhZ1thYl0hPU9iamVjdC5wcm90b3R5cGVbYWJdJiZhYi50b0xvd2VyQ2FzZSgpIT1cIm1vdmllXCIpe2UoWixhYixhZ1thYl0pfX1hYS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChaLGFhKTtYPVp9fXJldHVybiBYfWZ1bmN0aW9uIGUoWixYLFkpe3ZhciBhYT1DKFwicGFyYW1cIik7YWEuc2V0QXR0cmlidXRlKFwibmFtZVwiLFgpO2FhLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsWSk7Wi5hcHBlbmRDaGlsZChhYSl9ZnVuY3Rpb24geShZKXt2YXIgWD1jKFkpO2lmKFgmJlgubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2lmKE0uaWUmJk0ud2luKXtYLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7KGZ1bmN0aW9uKCl7aWYoWC5yZWFkeVN0YXRlPT00KXtiKFkpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfWVsc2V7WC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKFgpfX19ZnVuY3Rpb24gYihaKXt2YXIgWT1jKFopO2lmKFkpe2Zvcih2YXIgWCBpbiBZKXtpZih0eXBlb2YgWVtYXT09XCJmdW5jdGlvblwiKXtZW1hdPW51bGx9fVkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChZKX19ZnVuY3Rpb24gYyhaKXt2YXIgWD1udWxsO3RyeXtYPWouZ2V0RWxlbWVudEJ5SWQoWil9Y2F0Y2goWSl7fXJldHVybiBYfWZ1bmN0aW9uIEMoWCl7cmV0dXJuIGouY3JlYXRlRWxlbWVudChYKX1mdW5jdGlvbiBpKFosWCxZKXtaLmF0dGFjaEV2ZW50KFgsWSk7SVtJLmxlbmd0aF09W1osWCxZXX1mdW5jdGlvbiBGKFope3ZhciBZPU0ucHYsWD1aLnNwbGl0KFwiLlwiKTtYWzBdPXBhcnNlSW50KFhbMF0sMTApO1hbMV09cGFyc2VJbnQoWFsxXSwxMCl8fDA7WFsyXT1wYXJzZUludChYWzJdLDEwKXx8MDtyZXR1cm4oWVswXT5YWzBdfHwoWVswXT09WFswXSYmWVsxXT5YWzFdKXx8KFlbMF09PVhbMF0mJllbMV09PVhbMV0mJllbMl0+PVhbMl0pKT90cnVlOmZhbHNlfWZ1bmN0aW9uIHYoYWMsWSxhZCxhYil7aWYoTS5pZSYmTS5tYWMpe3JldHVybn12YXIgYWE9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF07aWYoIWFhKXtyZXR1cm59dmFyIFg9KGFkJiZ0eXBlb2YgYWQ9PVwic3RyaW5nXCIpP2FkOlwic2NyZWVuXCI7aWYoYWIpe249bnVsbDtHPW51bGx9aWYoIW58fEchPVgpe3ZhciBaPUMoXCJzdHlsZVwiKTtaLnNldEF0dHJpYnV0ZShcInR5cGVcIixcInRleHQvY3NzXCIpO1ouc2V0QXR0cmlidXRlKFwibWVkaWFcIixYKTtuPWFhLmFwcGVuZENoaWxkKFopO2lmKE0uaWUmJk0ud2luJiZ0eXBlb2Ygai5zdHlsZVNoZWV0cyE9RCYmai5zdHlsZVNoZWV0cy5sZW5ndGg+MCl7bj1qLnN0eWxlU2hlZXRzW2ouc3R5bGVTaGVldHMubGVuZ3RoLTFdfUc9WH1pZihNLmllJiZNLndpbil7aWYobiYmdHlwZW9mIG4uYWRkUnVsZT09cil7bi5hZGRSdWxlKGFjLFkpfX1lbHNle2lmKG4mJnR5cGVvZiBqLmNyZWF0ZVRleHROb2RlIT1EKXtuLmFwcGVuZENoaWxkKGouY3JlYXRlVGV4dE5vZGUoYWMrXCIge1wiK1krXCJ9XCIpKX19fWZ1bmN0aW9uIHcoWixYKXtpZighbSl7cmV0dXJufXZhciBZPVg/XCJ2aXNpYmxlXCI6XCJoaWRkZW5cIjtpZihKJiZjKFopKXtjKFopLnN0eWxlLnZpc2liaWxpdHk9WX1lbHNle3YoXCIjXCIrWixcInZpc2liaWxpdHk6XCIrWSl9fWZ1bmN0aW9uIEwoWSl7dmFyIFo9L1tcXFxcXFxcIjw+XFwuO10vO3ZhciBYPVouZXhlYyhZKSE9bnVsbDtyZXR1cm4gWCYmdHlwZW9mIGVuY29kZVVSSUNvbXBvbmVudCE9RD9lbmNvZGVVUklDb21wb25lbnQoWSk6WX12YXIgZD1mdW5jdGlvbigpe2lmKE0uaWUmJk0ud2luKXt3aW5kb3cuYXR0YWNoRXZlbnQoXCJvbnVubG9hZFwiLGZ1bmN0aW9uKCl7dmFyIGFjPUkubGVuZ3RoO2Zvcih2YXIgYWI9MDthYjxhYzthYisrKXtJW2FiXVswXS5kZXRhY2hFdmVudChJW2FiXVsxXSxJW2FiXVsyXSl9dmFyIFo9Ti5sZW5ndGg7Zm9yKHZhciBhYT0wO2FhPFo7YWErKyl7eShOW2FhXSl9Zm9yKHZhciBZIGluIE0pe01bWV09bnVsbH1NPW51bGw7Zm9yKHZhciBYIGluIHN3Zm9iamVjdCl7c3dmb2JqZWN0W1hdPW51bGx9c3dmb2JqZWN0PW51bGx9KX19KCk7cmV0dXJue3JlZ2lzdGVyT2JqZWN0OmZ1bmN0aW9uKGFiLFgsYWEsWil7aWYoTS53MyYmYWImJlgpe3ZhciBZPXt9O1kuaWQ9YWI7WS5zd2ZWZXJzaW9uPVg7WS5leHByZXNzSW5zdGFsbD1hYTtZLmNhbGxiYWNrRm49WjtvW28ubGVuZ3RoXT1ZO3coYWIsZmFsc2UpfWVsc2V7aWYoWil7Wih7c3VjY2VzczpmYWxzZSxpZDphYn0pfX19LGdldE9iamVjdEJ5SWQ6ZnVuY3Rpb24oWCl7aWYoTS53Myl7cmV0dXJuIHooWCl9fSxlbWJlZFNXRjpmdW5jdGlvbihhYixhaCxhZSxhZyxZLGFhLFosYWQsYWYsYWMpe3ZhciBYPXtzdWNjZXNzOmZhbHNlLGlkOmFofTtpZihNLnczJiYhKE0ud2smJk0ud2s8MzEyKSYmYWImJmFoJiZhZSYmYWcmJlkpe3coYWgsZmFsc2UpO0soZnVuY3Rpb24oKXthZSs9XCJcIjthZys9XCJcIjt2YXIgYWo9e307aWYoYWYmJnR5cGVvZiBhZj09PXIpe2Zvcih2YXIgYWwgaW4gYWYpe2FqW2FsXT1hZlthbF19fWFqLmRhdGE9YWI7YWoud2lkdGg9YWU7YWouaGVpZ2h0PWFnO3ZhciBhbT17fTtpZihhZCYmdHlwZW9mIGFkPT09cil7Zm9yKHZhciBhayBpbiBhZCl7YW1bYWtdPWFkW2FrXX19aWYoWiYmdHlwZW9mIFo9PT1yKXtmb3IodmFyIGFpIGluIFope2lmKHR5cGVvZiBhbS5mbGFzaHZhcnMhPUQpe2FtLmZsYXNodmFycys9XCImXCIrYWkrXCI9XCIrWlthaV19ZWxzZXthbS5mbGFzaHZhcnM9YWkrXCI9XCIrWlthaV19fX1pZihGKFkpKXt2YXIgYW49dShhaixhbSxhaCk7aWYoYWouaWQ9PWFoKXt3KGFoLHRydWUpfVguc3VjY2Vzcz10cnVlO1gucmVmPWFufWVsc2V7aWYoYWEmJkEoKSl7YWouZGF0YT1hYTtQKGFqLGFtLGFoLGFjKTtyZXR1cm59ZWxzZXt3KGFoLHRydWUpfX1pZihhYyl7YWMoWCl9fSl9ZWxzZXtpZihhYyl7YWMoWCl9fX0sc3dpdGNoT2ZmQXV0b0hpZGVTaG93OmZ1bmN0aW9uKCl7bT1mYWxzZX0sdWE6TSxnZXRGbGFzaFBsYXllclZlcnNpb246ZnVuY3Rpb24oKXtyZXR1cm57bWFqb3I6TS5wdlswXSxtaW5vcjpNLnB2WzFdLHJlbGVhc2U6TS5wdlsyXX19LGhhc0ZsYXNoUGxheWVyVmVyc2lvbjpGLGNyZWF0ZVNXRjpmdW5jdGlvbihaLFksWCl7aWYoTS53Myl7cmV0dXJuIHUoWixZLFgpfWVsc2V7cmV0dXJuIHVuZGVmaW5lZH19LHNob3dFeHByZXNzSW5zdGFsbDpmdW5jdGlvbihaLGFhLFgsWSl7aWYoTS53MyYmQSgpKXtQKFosYWEsWCxZKX19LHJlbW92ZVNXRjpmdW5jdGlvbihYKXtpZihNLnczKXt5KFgpfX0sY3JlYXRlQ1NTOmZ1bmN0aW9uKGFhLFosWSxYKXtpZihNLnczKXt2KGFhLFosWSxYKX19LGFkZERvbUxvYWRFdmVudDpLLGFkZExvYWRFdmVudDpzLGdldFF1ZXJ5UGFyYW1WYWx1ZTpmdW5jdGlvbihhYSl7dmFyIFo9ai5sb2NhdGlvbi5zZWFyY2h8fGoubG9jYXRpb24uaGFzaDtpZihaKXtpZigvXFw/Ly50ZXN0KFopKXtaPVouc3BsaXQoXCI/XCIpWzFdfWlmKGFhPT1udWxsKXtyZXR1cm4gTChaKX12YXIgWT1aLnNwbGl0KFwiJlwiKTtmb3IodmFyIFg9MDtYPFkubGVuZ3RoO1grKyl7aWYoWVtYXS5zdWJzdHJpbmcoMCxZW1hdLmluZGV4T2YoXCI9XCIpKT09YWEpe3JldHVybiBMKFlbWF0uc3Vic3RyaW5nKChZW1hdLmluZGV4T2YoXCI9XCIpKzEpKSl9fX1yZXR1cm5cIlwifSxleHByZXNzSW5zdGFsbENhbGxiYWNrOmZ1bmN0aW9uKCl7aWYoYSl7dmFyIFg9YyhSKTtpZihYJiZsKXtYLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGwsWCk7aWYoUSl7dyhRLHRydWUpO2lmKE0uaWUmJk0ud2luKXtsLnN0eWxlLmRpc3BsYXk9XCJibG9ja1wifX1pZihFKXtFKEIpfX1hPWZhbHNlfX19fSgpO1xufVxuLy8gQ29weXJpZ2h0OiBIaXJvc2hpIEljaGlrYXdhIDxodHRwOi8vZ2ltaXRlLm5ldC9lbi8+XG4vLyBMaWNlbnNlOiBOZXcgQlNEIExpY2Vuc2Vcbi8vIFJlZmVyZW5jZTogaHR0cDovL2Rldi53My5vcmcvaHRtbDUvd2Vic29ja2V0cy9cbi8vIFJlZmVyZW5jZTogaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaGl4aWUtdGhld2Vic29ja2V0cHJvdG9jb2xcblxuKGZ1bmN0aW9uKCkge1xuICBcbiAgaWYgKCd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3cgfHwgd2luZG93LldlYlNvY2tldCkgcmV0dXJuO1xuXG4gIHZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG4gIGlmICghY29uc29sZSB8fCAhY29uc29sZS5sb2cgfHwgIWNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlID0ge2xvZzogZnVuY3Rpb24oKXsgfSwgZXJyb3I6IGZ1bmN0aW9uKCl7IH19O1xuICB9XG4gIFxuICBpZiAoIXN3Zm9iamVjdC5oYXNGbGFzaFBsYXllclZlcnNpb24oXCIxMC4wLjBcIikpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRmxhc2ggUGxheWVyID49IDEwLjAuMCBpcyByZXF1aXJlZC5cIik7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChsb2NhdGlvbi5wcm90b2NvbCA9PSBcImZpbGU6XCIpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgXCJXQVJOSU5HOiB3ZWItc29ja2V0LWpzIGRvZXNuJ3Qgd29yayBpbiBmaWxlOi8vLy4uLiBVUkwgXCIgK1xuICAgICAgXCJ1bmxlc3MgeW91IHNldCBGbGFzaCBTZWN1cml0eSBTZXR0aW5ncyBwcm9wZXJseS4gXCIgK1xuICAgICAgXCJPcGVuIHRoZSBwYWdlIHZpYSBXZWIgc2VydmVyIGkuZS4gaHR0cDovLy4uLlwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBmYXV4IHdlYiBzb2NrZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHBhcmFtIHthcnJheSBvciBzdHJpbmd9IHByb3RvY29sc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJveHlIb3N0XG4gICAqIEBwYXJhbSB7aW50fSBwcm94eVBvcnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlcnNcbiAgICovXG4gIFdlYlNvY2tldCA9IGZ1bmN0aW9uKHVybCwgcHJvdG9jb2xzLCBwcm94eUhvc3QsIHByb3h5UG9ydCwgaGVhZGVycykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLl9faWQgPSBXZWJTb2NrZXQuX19uZXh0SWQrKztcbiAgICBXZWJTb2NrZXQuX19pbnN0YW5jZXNbc2VsZi5fX2lkXSA9IHNlbGY7XG4gICAgc2VsZi5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNPTk5FQ1RJTkc7XG4gICAgc2VsZi5idWZmZXJlZEFtb3VudCA9IDA7XG4gICAgc2VsZi5fX2V2ZW50cyA9IHt9O1xuICAgIGlmICghcHJvdG9jb2xzKSB7XG4gICAgICBwcm90b2NvbHMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm90b2NvbHMgPT0gXCJzdHJpbmdcIikge1xuICAgICAgcHJvdG9jb2xzID0gW3Byb3RvY29sc107XG4gICAgfVxuICAgIC8vIFVzZXMgc2V0VGltZW91dCgpIHRvIG1ha2Ugc3VyZSBfX2NyZWF0ZUZsYXNoKCkgcnVucyBhZnRlciB0aGUgY2FsbGVyIHNldHMgd3Mub25vcGVuIGV0Yy5cbiAgICAvLyBPdGhlcndpc2UsIHdoZW4gb25vcGVuIGZpcmVzIGltbWVkaWF0ZWx5LCBvbm9wZW4gaXMgY2FsbGVkIGJlZm9yZSBpdCBpcyBzZXQuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24oKSB7XG4gICAgICAgIFdlYlNvY2tldC5fX2ZsYXNoLmNyZWF0ZShcbiAgICAgICAgICAgIHNlbGYuX19pZCwgdXJsLCBwcm90b2NvbHMsIHByb3h5SG9zdCB8fCBudWxsLCBwcm94eVBvcnQgfHwgMCwgaGVhZGVycyB8fCBudWxsKTtcbiAgICAgIH0pO1xuICAgIH0sIDApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gdGhlIHdlYiBzb2NrZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhICBUaGUgZGF0YSB0byBzZW5kIHRvIHRoZSBzb2NrZXQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59ICBUcnVlIGZvciBzdWNjZXNzLCBmYWxzZSBmb3IgZmFpbHVyZS5cbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DT05ORUNUSU5HKSB7XG4gICAgICB0aHJvdyBcIklOVkFMSURfU1RBVEVfRVJSOiBXZWIgU29ja2V0IGNvbm5lY3Rpb24gaGFzIG5vdCBiZWVuIGVzdGFibGlzaGVkXCI7XG4gICAgfVxuICAgIC8vIFdlIHVzZSBlbmNvZGVVUklDb21wb25lbnQoKSBoZXJlLCBiZWNhdXNlIEZBQnJpZGdlIGRvZXNuJ3Qgd29yayBpZlxuICAgIC8vIHRoZSBhcmd1bWVudCBpbmNsdWRlcyBzb21lIGNoYXJhY3RlcnMuIFdlIGRvbid0IHVzZSBlc2NhcGUoKSBoZXJlXG4gICAgLy8gYmVjYXVzZSBvZiB0aGlzOlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0NvcmVfSmF2YVNjcmlwdF8xLjVfR3VpZGUvRnVuY3Rpb25zI2VzY2FwZV9hbmRfdW5lc2NhcGVfRnVuY3Rpb25zXG4gICAgLy8gQnV0IGl0IGxvb2tzIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVVUklDb21wb25lbnQocykpIGRvZXNuJ3RcbiAgICAvLyBwcmVzZXJ2ZSBhbGwgVW5pY29kZSBjaGFyYWN0ZXJzIGVpdGhlciBlLmcuIFwiXFx1ZmZmZlwiIGluIEZpcmVmb3guXG4gICAgLy8gTm90ZSBieSB3dHJpdGNoOiBIb3BlZnVsbHkgdGhpcyB3aWxsIG5vdCBiZSBuZWNlc3NhcnkgdXNpbmcgRXh0ZXJuYWxJbnRlcmZhY2UuICBXaWxsIHJlcXVpcmVcbiAgICAvLyBhZGRpdGlvbmFsIHRlc3RpbmcuXG4gICAgdmFyIHJlc3VsdCA9IFdlYlNvY2tldC5fX2ZsYXNoLnNlbmQodGhpcy5fX2lkLCBlbmNvZGVVUklDb21wb25lbnQoZGF0YSkpO1xuICAgIGlmIChyZXN1bHQgPCAwKSB7IC8vIHN1Y2Nlc3NcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkQW1vdW50ICs9IHJlc3VsdDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENsb3NlIHRoaXMgd2ViIHNvY2tldCBncmFjZWZ1bGx5LlxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gV2ViU29ja2V0LkNMT1NFRCB8fCB0aGlzLnJlYWR5U3RhdGUgPT0gV2ViU29ja2V0LkNMT1NJTkcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gICAgV2ViU29ja2V0Ll9fZmxhc2guY2xvc2UodGhpcy5fX2lkKTtcbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZVxuICAgKiBAcmV0dXJuIHZvaWRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLl9fZXZlbnRzKSkge1xuICAgICAgdGhpcy5fX2V2ZW50c1t0eXBlXSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0yLUV2ZW50cy9ldmVudHMuaHRtbCNFdmVudHMtcmVnaXN0cmF0aW9uXCI+RE9NIDIgRXZlbnRUYXJnZXQgSW50ZXJmYWNlPC9hPn1cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VDYXB0dXJlXG4gICAqIEByZXR1cm4gdm9pZFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICBpZiAoISh0eXBlIGluIHRoaXMuX19ldmVudHMpKSByZXR1cm47XG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX19ldmVudHNbdHlwZV07XG4gICAgZm9yICh2YXIgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgaWYgKGV2ZW50c1tpXSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0yLUV2ZW50cy9ldmVudHMuaHRtbCNFdmVudHMtcmVnaXN0cmF0aW9uXCI+RE9NIDIgRXZlbnRUYXJnZXQgSW50ZXJmYWNlPC9hPn1cbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICogQHJldHVybiB2b2lkXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBldmVudHMgPSB0aGlzLl9fZXZlbnRzW2V2ZW50LnR5cGVdIHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBldmVudHNbaV0oZXZlbnQpO1xuICAgIH1cbiAgICB2YXIgaGFuZGxlciA9IHRoaXNbXCJvblwiICsgZXZlbnQudHlwZV07XG4gICAgaWYgKGhhbmRsZXIpIGhhbmRsZXIoZXZlbnQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFuIGV2ZW50IGZyb20gRmxhc2guXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBmbGFzaEV2ZW50XG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLl9faGFuZGxlRXZlbnQgPSBmdW5jdGlvbihmbGFzaEV2ZW50KSB7XG4gICAgaWYgKFwicmVhZHlTdGF0ZVwiIGluIGZsYXNoRXZlbnQpIHtcbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IGZsYXNoRXZlbnQucmVhZHlTdGF0ZTtcbiAgICB9XG4gICAgaWYgKFwicHJvdG9jb2xcIiBpbiBmbGFzaEV2ZW50KSB7XG4gICAgICB0aGlzLnByb3RvY29sID0gZmxhc2hFdmVudC5wcm90b2NvbDtcbiAgICB9XG4gICAgXG4gICAgdmFyIGpzRXZlbnQ7XG4gICAgaWYgKGZsYXNoRXZlbnQudHlwZSA9PSBcIm9wZW5cIiB8fCBmbGFzaEV2ZW50LnR5cGUgPT0gXCJlcnJvclwiKSB7XG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZVNpbXBsZUV2ZW50KGZsYXNoRXZlbnQudHlwZSk7XG4gICAgfSBlbHNlIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJjbG9zZVwiKSB7XG4gICAgICAvLyBUT0RPIGltcGxlbWVudCBqc0V2ZW50Lndhc0NsZWFuXG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZVNpbXBsZUV2ZW50KFwiY2xvc2VcIik7XG4gICAgfSBlbHNlIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgIHZhciBkYXRhID0gZGVjb2RlVVJJQ29tcG9uZW50KGZsYXNoRXZlbnQubWVzc2FnZSk7XG4gICAgICBqc0V2ZW50ID0gdGhpcy5fX2NyZWF0ZU1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwidW5rbm93biBldmVudCB0eXBlOiBcIiArIGZsYXNoRXZlbnQudHlwZTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGpzRXZlbnQpO1xuICB9O1xuICBcbiAgV2ViU29ja2V0LnByb3RvdHlwZS5fX2NyZWF0ZVNpbXBsZUV2ZW50ID0gZnVuY3Rpb24odHlwZSkge1xuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCAmJiB3aW5kb3cuRXZlbnQpIHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgICBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBidWJibGVzOiBmYWxzZSwgY2FuY2VsYWJsZTogZmFsc2V9O1xuICAgIH1cbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuX19jcmVhdGVNZXNzYWdlRXZlbnQgPSBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICYmIHdpbmRvdy5NZXNzYWdlRXZlbnQgJiYgIXdpbmRvdy5vcGVyYSkge1xuICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNZXNzYWdlRXZlbnRcIik7XG4gICAgICBldmVudC5pbml0TWVzc2FnZUV2ZW50KFwibWVzc2FnZVwiLCBmYWxzZSwgZmFsc2UsIGRhdGEsIG51bGwsIG51bGwsIHdpbmRvdywgbnVsbCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElFIGFuZCBPcGVyYSwgdGhlIGxhdHRlciBvbmUgdHJ1bmNhdGVzIHRoZSBkYXRhIHBhcmFtZXRlciBhZnRlciBhbnkgMHgwMCBieXRlcy5cbiAgICAgIHJldHVybiB7dHlwZTogdHlwZSwgZGF0YTogZGF0YSwgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlfTtcbiAgICB9XG4gIH07XG4gIFxuICAvKipcbiAgICogRGVmaW5lIHRoZSBXZWJTb2NrZXQgcmVhZHlTdGF0ZSBlbnVtZXJhdGlvbi5cbiAgICovXG4gIFdlYlNvY2tldC5DT05ORUNUSU5HID0gMDtcbiAgV2ViU29ja2V0Lk9QRU4gPSAxO1xuICBXZWJTb2NrZXQuQ0xPU0lORyA9IDI7XG4gIFdlYlNvY2tldC5DTE9TRUQgPSAzO1xuXG4gIFdlYlNvY2tldC5fX2ZsYXNoID0gbnVsbDtcbiAgV2ViU29ja2V0Ll9faW5zdGFuY2VzID0ge307XG4gIFdlYlNvY2tldC5fX3Rhc2tzID0gW107XG4gIFdlYlNvY2tldC5fX25leHRJZCA9IDA7XG4gIFxuICAvKipcbiAgICogTG9hZCBhIG5ldyBmbGFzaCBzZWN1cml0eSBwb2xpY3kgZmlsZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKi9cbiAgV2ViU29ja2V0LmxvYWRGbGFzaFBvbGljeUZpbGUgPSBmdW5jdGlvbih1cmwpe1xuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5sb2FkTWFudWFsUG9saWN5RmlsZSh1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb2FkcyBXZWJTb2NrZXRNYWluLnN3ZiBhbmQgY3JlYXRlcyBXZWJTb2NrZXRNYWluIG9iamVjdCBpbiBGbGFzaC5cbiAgICovXG4gIFdlYlNvY2tldC5fX2luaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoV2ViU29ja2V0Ll9fZmxhc2gpIHJldHVybjtcbiAgICBcbiAgICBpZiAoV2ViU29ja2V0Ll9fc3dmTG9jYXRpb24pIHtcbiAgICAgIC8vIEZvciBiYWNrd29yZCBjb21wYXRpYmlsaXR5LlxuICAgICAgd2luZG93LldFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OID0gV2ViU29ja2V0Ll9fc3dmTG9jYXRpb247XG4gICAgfVxuICAgIGlmICghd2luZG93LldFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiW1dlYlNvY2tldF0gc2V0IFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OIHRvIGxvY2F0aW9uIG9mIFdlYlNvY2tldE1haW4uc3dmXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjb250YWluZXIuaWQgPSBcIndlYlNvY2tldENvbnRhaW5lclwiO1xuICAgIC8vIEhpZGVzIEZsYXNoIGJveC4gV2UgY2Fubm90IHVzZSBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBiZWNhdXNlIGl0IHByZXZlbnRzXG4gICAgLy8gRmxhc2ggZnJvbSBsb2FkaW5nIGF0IGxlYXN0IGluIElFLiBTbyB3ZSBtb3ZlIGl0IG91dCBvZiB0aGUgc2NyZWVuIGF0ICgtMTAwLCAtMTAwKS5cbiAgICAvLyBCdXQgdGhpcyBldmVuIGRvZXNuJ3Qgd29yayB3aXRoIEZsYXNoIExpdGUgKGUuZy4gaW4gRHJvaWQgSW5jcmVkaWJsZSkuIFNvIHdpdGggRmxhc2hcbiAgICAvLyBMaXRlLCB3ZSBwdXQgaXQgYXQgKDAsIDApLiBUaGlzIHNob3dzIDF4MSBib3ggdmlzaWJsZSBhdCBsZWZ0LXRvcCBjb3JuZXIgYnV0IHRoaXMgaXNcbiAgICAvLyB0aGUgYmVzdCB3ZSBjYW4gZG8gYXMgZmFyIGFzIHdlIGtub3cgbm93LlxuICAgIGNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBpZiAoV2ViU29ja2V0Ll9faXNGbGFzaExpdGUoKSkge1xuICAgICAgY29udGFpbmVyLnN0eWxlLmxlZnQgPSBcIjBweFwiO1xuICAgICAgY29udGFpbmVyLnN0eWxlLnRvcCA9IFwiMHB4XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gXCItMTAwcHhcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSBcIi0xMDBweFwiO1xuICAgIH1cbiAgICB2YXIgaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBob2xkZXIuaWQgPSBcIndlYlNvY2tldEZsYXNoXCI7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhvbGRlcik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIC8vIFNlZSB0aGlzIGFydGljbGUgZm9yIGhhc1ByaW9yaXR5OlxuICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9hczMvbW9iaWxlL1dTNGJlYmNkNjZhNzQyNzVjMzZjZmI4MTM3MTI0MzE4ZWViYzYtN2ZmZC5odG1sXG4gICAgc3dmb2JqZWN0LmVtYmVkU1dGKFxuICAgICAgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04sXG4gICAgICBcIndlYlNvY2tldEZsYXNoXCIsXG4gICAgICBcIjFcIiAvKiB3aWR0aCAqLyxcbiAgICAgIFwiMVwiIC8qIGhlaWdodCAqLyxcbiAgICAgIFwiMTAuMC4wXCIgLyogU1dGIHZlcnNpb24gKi8sXG4gICAgICBudWxsLFxuICAgICAgbnVsbCxcbiAgICAgIHtoYXNQcmlvcml0eTogdHJ1ZSwgc3dsaXZlY29ubmVjdCA6IHRydWUsIGFsbG93U2NyaXB0QWNjZXNzOiBcImFsd2F5c1wifSxcbiAgICAgIG51bGwsXG4gICAgICBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghZS5zdWNjZXNzKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIltXZWJTb2NrZXRdIHN3Zm9iamVjdC5lbWJlZFNXRiBmYWlsZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIENhbGxlZCBieSBGbGFzaCB0byBub3RpZnkgSlMgdGhhdCBpdCdzIGZ1bGx5IGxvYWRlZCBhbmQgcmVhZHlcbiAgICogZm9yIGNvbW11bmljYXRpb24uXG4gICAqL1xuICBXZWJTb2NrZXQuX19vbkZsYXNoSW5pdGlhbGl6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBXZSBuZWVkIHRvIHNldCBhIHRpbWVvdXQgaGVyZSB0byBhdm9pZCByb3VuZC10cmlwIGNhbGxzXG4gICAgLy8gdG8gZmxhc2ggZHVyaW5nIHRoZSBpbml0aWFsaXphdGlvbiBwcm9jZXNzLlxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViU29ja2V0Rmxhc2hcIik7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5zZXRDYWxsZXJVcmwobG9jYXRpb24uaHJlZik7XG4gICAgICBXZWJTb2NrZXQuX19mbGFzaC5zZXREZWJ1ZyghIXdpbmRvdy5XRUJfU09DS0VUX0RFQlVHKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgV2ViU29ja2V0Ll9fdGFza3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgV2ViU29ja2V0Ll9fdGFza3NbaV0oKTtcbiAgICAgIH1cbiAgICAgIFdlYlNvY2tldC5fX3Rhc2tzID0gW107XG4gICAgfSwgMCk7XG4gIH07XG4gIFxuICAvKipcbiAgICogQ2FsbGVkIGJ5IEZsYXNoIHRvIG5vdGlmeSBXZWJTb2NrZXRzIGV2ZW50cyBhcmUgZmlyZWQuXG4gICAqL1xuICBXZWJTb2NrZXQuX19vbkZsYXNoRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gR2V0cyBldmVudHMgdXNpbmcgcmVjZWl2ZUV2ZW50cygpIGluc3RlYWQgb2YgZ2V0dGluZyBpdCBmcm9tIGV2ZW50IG9iamVjdFxuICAgICAgICAvLyBvZiBGbGFzaCBldmVudC4gVGhpcyBpcyB0byBtYWtlIHN1cmUgdG8ga2VlcCBtZXNzYWdlIG9yZGVyLlxuICAgICAgICAvLyBJdCBzZWVtcyBzb21ldGltZXMgRmxhc2ggZXZlbnRzIGRvbid0IGFycml2ZSBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IGFyZSBzZW50LlxuICAgICAgICB2YXIgZXZlbnRzID0gV2ViU29ja2V0Ll9fZmxhc2gucmVjZWl2ZUV2ZW50cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIFdlYlNvY2tldC5fX2luc3RhbmNlc1tldmVudHNbaV0ud2ViU29ja2V0SWRdLl9faGFuZGxlRXZlbnQoZXZlbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgIH0sIDApO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICBcbiAgLy8gQ2FsbGVkIGJ5IEZsYXNoLlxuICBXZWJTb2NrZXQuX19sb2cgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coZGVjb2RlVVJJQ29tcG9uZW50KG1lc3NhZ2UpKTtcbiAgfTtcbiAgXG4gIC8vIENhbGxlZCBieSBGbGFzaC5cbiAgV2ViU29ja2V0Ll9fZXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc29sZS5lcnJvcihkZWNvZGVVUklDb21wb25lbnQobWVzc2FnZSkpO1xuICB9O1xuICBcbiAgV2ViU29ja2V0Ll9fYWRkVGFzayA9IGZ1bmN0aW9uKHRhc2spIHtcbiAgICBpZiAoV2ViU29ja2V0Ll9fZmxhc2gpIHtcbiAgICAgIHRhc2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgV2ViU29ja2V0Ll9fdGFza3MucHVzaCh0YXNrKTtcbiAgICB9XG4gIH07XG4gIFxuICAvKipcbiAgICogVGVzdCBpZiB0aGUgYnJvd3NlciBpcyBydW5uaW5nIGZsYXNoIGxpdGUuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgZmxhc2ggbGl0ZSBpcyBydW5uaW5nLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBXZWJTb2NrZXQuX19pc0ZsYXNoTGl0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghd2luZG93Lm5hdmlnYXRvciB8fCAhd2luZG93Lm5hdmlnYXRvci5taW1lVHlwZXMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG1pbWVUeXBlID0gd2luZG93Lm5hdmlnYXRvci5taW1lVHlwZXNbXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiXTtcbiAgICBpZiAoIW1pbWVUeXBlIHx8ICFtaW1lVHlwZS5lbmFibGVkUGx1Z2luIHx8ICFtaW1lVHlwZS5lbmFibGVkUGx1Z2luLmZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtaW1lVHlwZS5lbmFibGVkUGx1Z2luLmZpbGVuYW1lLm1hdGNoKC9mbGFzaGxpdGUvaSkgPyB0cnVlIDogZmFsc2U7XG4gIH07XG4gIFxuICBpZiAoIXdpbmRvdy5XRUJfU09DS0VUX0RJU0FCTEVfQVVUT19JTklUSUFMSVpBVElPTikge1xuICAgIGlmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIFdlYlNvY2tldC5fX2luaXRpYWxpemUoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmF0dGFjaEV2ZW50KFwib25sb2FkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgIFdlYlNvY2tldC5fX2luaXRpYWxpemUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBcbn0pKCk7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBleHBvcnRzLlhIUiA9IFhIUjtcblxuICAvKipcbiAgICogWEhSIGNvbnN0cnVjdG9yXG4gICAqXG4gICAqIEBjb3N0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFhIUiAoc29ja2V0KSB7XG4gICAgaWYgKCFzb2NrZXQpIHJldHVybjtcblxuICAgIGlvLlRyYW5zcG9ydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuc2VuZEJ1ZmZlciA9IFtdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KFhIUiwgaW8uVHJhbnNwb3J0KTtcblxuICAvKipcbiAgICogRXN0YWJsaXNoIGEgY29ubmVjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICB0aGlzLm9uT3BlbigpO1xuICAgIHRoaXMuZ2V0KCk7XG5cbiAgICAvLyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgcmVxdWVzdCBzdWNjZWVkcyBzaW5jZSB3ZSBoYXZlIG5vIGluZGljYXRpb25cbiAgICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IG9wZW5lZCBvciBub3QgdW50aWwgaXQgc3VjY2VlZGVkLlxuICAgIHRoaXMuc2V0Q2xvc2VUaW1lb3V0KCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgd2UgbmVlZCB0byBzZW5kIGRhdGEgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIsIGlmIHdlIGhhdmUgZGF0YSBpbiBvdXJcbiAgICogYnVmZmVyIHdlIGVuY29kZSBpdCBhbmQgZm9yd2FyZCBpdCB0byB0aGUgYHBvc3RgIG1ldGhvZC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUucGF5bG9hZCA9IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgdmFyIG1zZ3MgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gcGF5bG9hZC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIG1zZ3MucHVzaChpby5wYXJzZXIuZW5jb2RlUGFja2V0KHBheWxvYWRbaV0pKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmQoaW8ucGFyc2VyLmVuY29kZVBheWxvYWQobXNncykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIGRhdGEgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIFRoZSBtZXNzYWdlXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdGhpcy5wb3N0KGRhdGEpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQb3N0cyBhIGVuY29kZWQgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgQSBlbmNvZGVkIG1lc3NhZ2UuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBlbXB0eSAoKSB7IH07XG5cbiAgWEhSLnByb3RvdHlwZS5wb3N0ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuXG4gICAgZnVuY3Rpb24gc3RhdGVDaGFuZ2UgKCkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgIHRoaXMub25yZWFkeXN0YXRlY2hhbmdlID0gZW1wdHk7XG4gICAgICAgIHNlbGYucG9zdGluZyA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDApe1xuICAgICAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbmxvYWQgKCkge1xuICAgICAgdGhpcy5vbmxvYWQgPSBlbXB0eTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcblxuICAgIHRoaXMuc2VuZFhIUiA9IHRoaXMucmVxdWVzdCgnUE9TVCcpO1xuXG4gICAgaWYgKGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiB0aGlzLnNlbmRYSFIgaW5zdGFuY2VvZiBYRG9tYWluUmVxdWVzdCkge1xuICAgICAgdGhpcy5zZW5kWEhSLm9ubG9hZCA9IHRoaXMuc2VuZFhIUi5vbmVycm9yID0gb25sb2FkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNlbmRYSFIub25yZWFkeXN0YXRlY2hhbmdlID0gc3RhdGVDaGFuZ2U7XG4gICAgfVxuXG4gICAgdGhpcy5zZW5kWEhSLnNlbmQoZGF0YSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBlc3RhYmxpc2hlZCBgWEhSYCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub25DbG9zZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSBjb25maWd1cmVkIFhIUiByZXF1ZXN0XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIHVybCB0aGF0IG5lZWRzIHRvIGJlIHJlcXVlc3RlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZCBUaGUgbWV0aG9kIHRoZSByZXF1ZXN0IHNob3VsZCB1c2UuXG4gICAqIEByZXR1cm5zIHtYTUxIdHRwUmVxdWVzdH1cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICB2YXIgcmVxID0gaW8udXRpbC5yZXF1ZXN0KHRoaXMuc29ja2V0LmlzWERvbWFpbigpKVxuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkodGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeSwgJ3Q9JyArICtuZXcgRGF0ZSk7XG5cbiAgICByZXEub3BlbihtZXRob2QgfHwgJ0dFVCcsIHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnksIHRydWUpO1xuXG4gICAgaWYgKG1ldGhvZCA9PSAnUE9TVCcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyZXEuc2V0UmVxdWVzdEhlYWRlcikge1xuICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gWERvbWFpblJlcXVlc3RcbiAgICAgICAgICByZXEuY29udGVudFR5cGUgPSAndGV4dC9wbGFpbic7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2NoZW1lIHRvIHVzZSBmb3IgdGhlIHRyYW5zcG9ydCBVUkxzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5zY2hlbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0Lm9wdGlvbnMuc2VjdXJlID8gJ2h0dHBzJyA6ICdodHRwJztcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIFhIUiB0cmFuc3BvcnRzIGFyZSBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtCb29sZWFufSB4ZG9tYWluIENoZWNrIGlmIHdlIHN1cHBvcnQgY3Jvc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLmNoZWNrID0gZnVuY3Rpb24gKHNvY2tldCwgeGRvbWFpbikge1xuICAgIHRyeSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IGlvLnV0aWwucmVxdWVzdCh4ZG9tYWluKSxcbiAgICAgICAgICB1c2VzWERvbVJlcSA9IChnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgcmVxdWVzdCBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSxcbiAgICAgICAgICBzb2NrZXRQcm90b2NvbCA9IChzb2NrZXQgJiYgc29ja2V0Lm9wdGlvbnMgJiYgc29ja2V0Lm9wdGlvbnMuc2VjdXJlID8gJ2h0dHBzOicgOiAnaHR0cDonKSxcbiAgICAgICAgICBpc1hQcm90b2NvbCA9IChnbG9iYWwubG9jYXRpb24gJiYgc29ja2V0UHJvdG9jb2wgIT0gZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sKTtcbiAgICAgIGlmIChyZXF1ZXN0ICYmICEodXNlc1hEb21SZXEgJiYgaXNYUHJvdG9jb2wpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge31cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIFhIUiB0cmFuc3BvcnQgc3VwcG9ydHMgY3Jvc3MgZG9tYWluIHJlcXVlc3RzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICByZXR1cm4gWEhSLmNoZWNrKHNvY2tldCwgdHJ1ZSk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLmh0bWxmaWxlID0gSFRNTEZpbGU7XG5cbiAgLyoqXG4gICAqIFRoZSBIVE1MRmlsZSB0cmFuc3BvcnQgY3JlYXRlcyBhIGBmb3JldmVyIGlmcmFtZWAgYmFzZWQgdHJhbnNwb3J0XG4gICAqIGZvciBJbnRlcm5ldCBFeHBsb3Jlci4gUmVndWxhciBmb3JldmVyIGlmcmFtZSBpbXBsZW1lbnRhdGlvbnMgd2lsbCBcbiAgICogY29udGludW91c2x5IHRyaWdnZXIgdGhlIGJyb3dzZXJzIGJ1enkgaW5kaWNhdG9ycy4gSWYgdGhlIGZvcmV2ZXIgaWZyYW1lXG4gICAqIGlzIGNyZWF0ZWQgaW5zaWRlIGEgYGh0bWxmaWxlYCB0aGVzZSBpbmRpY2F0b3JzIHdpbGwgbm90IGJlIHRyaWdnZWQuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAZXh0ZW5kcyB7aW8uVHJhbnNwb3J0LlhIUn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gSFRNTEZpbGUgKHNvY2tldCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoSFRNTEZpbGUsIGlvLlRyYW5zcG9ydC5YSFIpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUubmFtZSA9ICdodG1sZmlsZSc7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQWMuLi5lWCBgaHRtbGZpbGVgIHdpdGggYSBmb3JldmVyIGxvYWRpbmcgaWZyYW1lXG4gICAqIHRoYXQgY2FuIGJlIHVzZWQgdG8gbGlzdGVuIHRvIG1lc3NhZ2VzLiBJbnNpZGUgdGhlIGdlbmVyYXRlZFxuICAgKiBgaHRtbGZpbGVgIGEgcmVmZXJlbmNlIHdpbGwgYmUgbWFkZSB0byB0aGUgSFRNTEZpbGUgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmRvYyA9IG5ldyB3aW5kb3dbKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSgnaHRtbGZpbGUnKTtcbiAgICB0aGlzLmRvYy5vcGVuKCk7XG4gICAgdGhpcy5kb2Mud3JpdGUoJzxodG1sPjwvaHRtbD4nKTtcbiAgICB0aGlzLmRvYy5jbG9zZSgpO1xuICAgIHRoaXMuZG9jLnBhcmVudFdpbmRvdy5zID0gdGhpcztcblxuICAgIHZhciBpZnJhbWVDID0gdGhpcy5kb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaWZyYW1lQy5jbGFzc05hbWUgPSAnc29ja2V0aW8nO1xuXG4gICAgdGhpcy5kb2MuYm9keS5hcHBlbmRDaGlsZChpZnJhbWVDKTtcbiAgICB0aGlzLmlmcmFtZSA9IHRoaXMuZG9jLmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuXG4gICAgaWZyYW1lQy5hcHBlbmRDaGlsZCh0aGlzLmlmcmFtZSk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnksICd0PScrICtuZXcgRGF0ZSk7XG5cbiAgICB0aGlzLmlmcmFtZS5zcmMgPSB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5O1xuXG4gICAgaW8udXRpbC5vbih3aW5kb3csICd1bmxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogVGhlIFNvY2tldC5JTyBzZXJ2ZXIgd2lsbCB3cml0ZSBzY3JpcHQgdGFncyBpbnNpZGUgdGhlIGZvcmV2ZXJcbiAgICogaWZyYW1lLCB0aGlzIGZ1bmN0aW9uIHdpbGwgYmUgdXNlZCBhcyBjYWxsYmFjayBmb3IgdGhlIGluY29taW5nXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAcGFyYW0ge2RvY3VtZW50fSBkb2MgUmVmZXJlbmNlIHRvIHRoZSBjb250ZXh0XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuXyA9IGZ1bmN0aW9uIChkYXRhLCBkb2MpIHtcbiAgICAvLyB1bmVzY2FwZSBhbGwgZm9yd2FyZCBzbGFzaGVzLiBzZWUgR0gtMTI1MVxuICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoL1xcXFxcXC8vZywgJy8nKTtcbiAgICB0aGlzLm9uRGF0YShkYXRhKTtcbiAgICB0cnkge1xuICAgICAgdmFyIHNjcmlwdCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgIH0gY2F0Y2ggKGUpIHsgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBlc3RhYmxpc2hlZCBjb25uZWN0aW9uLCBpZnJhbWUgYW5kIGBodG1sZmlsZWAuXG4gICAqIEFuZCBjYWxscyB0aGUgYENvbGxlY3RHYXJiYWdlYCBmdW5jdGlvbiBvZiBJbnRlcm5ldCBFeHBsb3JlclxuICAgKiB0byByZWxlYXNlIHRoZSBtZW1vcnkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBIVE1MRmlsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pZnJhbWUpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5pZnJhbWUuc3JjID0gJ2Fib3V0OmJsYW5rJztcbiAgICAgIH0gY2F0Y2goZSl7fVxuXG4gICAgICB0aGlzLmRvYyA9IG51bGw7XG4gICAgICB0aGlzLmlmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuaWZyYW1lKTtcbiAgICAgIHRoaXMuaWZyYW1lID0gbnVsbDtcblxuICAgICAgQ29sbGVjdEdhcmJhZ2UoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBlc3RhYmxpc2hlZCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fSBDaGFpbmluZy5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIHJldHVybiBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhpcyB0cmFuc3BvcnQuIFRoZSBicm93c2VyXG4gICAqIG11c3QgaGF2ZSBhbiBgQWMuLi5lWE9iamVjdGAgaW1wbGVtZW50YXRpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLmNoZWNrID0gZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgJiYgKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpIGluIHdpbmRvdyl7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgYSA9IG5ldyB3aW5kb3dbKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSgnaHRtbGZpbGUnKTtcbiAgICAgICAgcmV0dXJuIGEgJiYgaW8uVHJhbnNwb3J0LlhIUi5jaGVjayhzb2NrZXQpO1xuICAgICAgfSBjYXRjaChlKXt9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgY3Jvc3MgZG9tYWluIHJlcXVlc3RzIGFyZSBzdXBwb3J0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBIVE1MRmlsZS54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gd2UgY2FuIHByb2JhYmx5IGRvIGhhbmRsaW5nIGZvciBzdWItZG9tYWlucywgd2Ugc2hvdWxkXG4gICAgLy8gdGVzdCB0aGF0IGl0J3MgY3Jvc3MgZG9tYWluIGJ1dCBhIHN1YmRvbWFpbiBoZXJlXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHRyYW5zcG9ydCB0byB5b3VyIHB1YmxpYyBpby50cmFuc3BvcnRzIGFycmF5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgaW8udHJhbnNwb3J0cy5wdXNoKCdodG1sZmlsZScpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0c1sneGhyLXBvbGxpbmcnXSA9IFhIUlBvbGxpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBYSFItcG9sbGluZyB0cmFuc3BvcnQgdXNlcyBsb25nIHBvbGxpbmcgWEhSIHJlcXVlc3RzIHRvIGNyZWF0ZSBhXG4gICAqIFwicGVyc2lzdGVudFwiIGNvbm5lY3Rpb24gd2l0aCB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gWEhSUG9sbGluZyAoKSB7XG4gICAgaW8uVHJhbnNwb3J0LlhIUi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFhIUiB0cmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChYSFJQb2xsaW5nLCBpby5UcmFuc3BvcnQuWEhSKTtcblxuICAvKipcbiAgICogTWVyZ2UgdGhlIHByb3BlcnRpZXMgZnJvbSBYSFIgdHJhbnNwb3J0XG4gICAqL1xuXG4gIGlvLnV0aWwubWVyZ2UoWEhSUG9sbGluZywgaW8uVHJhbnNwb3J0LlhIUik7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLm5hbWUgPSAneGhyLXBvbGxpbmcnO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciBoZWFydGJlYXRzIGlzIGVuYWJsZWQgZm9yIHRoaXMgdHJhbnNwb3J0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5oZWFydGJlYXRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKiogXG4gICAqIEVzdGFibGlzaCBhIGNvbm5lY3Rpb24sIGZvciBpUGhvbmUgYW5kIEFuZHJvaWQgdGhpcyB3aWxsIGJlIGRvbmUgb25jZSB0aGUgcGFnZVxuICAgKiBpcyBsb2FkZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9IENoYWluaW5nLlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlvLlRyYW5zcG9ydC5YSFIucHJvdG90eXBlLm9wZW4uY2FsbChzZWxmKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhIFhIUiByZXF1ZXN0IHRvIHdhaXQgZm9yIGluY29taW5nIG1lc3NhZ2VzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gZW1wdHkgKCkge307XG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pc09wZW4pIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHN0YXRlQ2hhbmdlICgpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICBzZWxmLm9uRGF0YSh0aGlzLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgc2VsZi5nZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmxvYWQgKCkge1xuICAgICAgdGhpcy5vbmxvYWQgPSBlbXB0eTtcbiAgICAgIHRoaXMub25lcnJvciA9IGVtcHR5O1xuICAgICAgc2VsZi5yZXRyeUNvdW50ZXIgPSAxO1xuICAgICAgc2VsZi5vbkRhdGEodGhpcy5yZXNwb25zZVRleHQpO1xuICAgICAgc2VsZi5nZXQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25lcnJvciAoKSB7XG4gICAgICBzZWxmLnJldHJ5Q291bnRlciArKztcbiAgICAgIGlmKCFzZWxmLnJldHJ5Q291bnRlciB8fCBzZWxmLnJldHJ5Q291bnRlciA+IDMpIHtcbiAgICAgICAgc2VsZi5vbkNsb3NlKCk7ICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuZ2V0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMueGhyID0gdGhpcy5yZXF1ZXN0KCk7XG5cbiAgICBpZiAoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIHRoaXMueGhyIGluc3RhbmNlb2YgWERvbWFpblJlcXVlc3QpIHtcbiAgICAgIHRoaXMueGhyLm9ubG9hZCA9IG9ubG9hZDtcbiAgICAgIHRoaXMueGhyLm9uZXJyb3IgPSBvbmVycm9yO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBzdGF0ZUNoYW5nZTtcbiAgICB9XG5cbiAgICB0aGlzLnhoci5zZW5kKG51bGwpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIHVuY2xlYW4gY2xvc2UgYmVoYXZpb3IuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIucHJvdG90eXBlLm9uQ2xvc2UuY2FsbCh0aGlzKTtcblxuICAgIGlmICh0aGlzLnhocikge1xuICAgICAgdGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gdGhpcy54aHIub25sb2FkID0gdGhpcy54aHIub25lcnJvciA9IGVtcHR5O1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy54aHIuYWJvcnQoKTtcbiAgICAgIH0gY2F0Y2goZSl7fVxuICAgICAgdGhpcy54aHIgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogV2Via2l0IGJhc2VkIGJyb3dzZXJzIHNob3cgYSBpbmZpbml0IHNwaW5uZXIgd2hlbiB5b3Ugc3RhcnQgYSBYSFIgcmVxdWVzdFxuICAgKiBiZWZvcmUgdGhlIGJyb3dzZXJzIG9ubG9hZCBldmVudCBpcyBjYWxsZWQgc28gd2UgbmVlZCB0byBkZWZlciBvcGVuaW5nIG9mXG4gICAqIHRoZSB0cmFuc3BvcnQgdW50aWwgdGhlIG9ubG9hZCBldmVudCBpcyBjYWxsZWQuIFdyYXBwaW5nIHRoZSBjYiBpbiBvdXJcbiAgICogZGVmZXIgbWV0aG9kIHNvbHZlIHRoaXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbiAoc29ja2V0LCBmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlvLnV0aWwuZGVmZXIoZnVuY3Rpb24gKCkge1xuICAgICAgZm4uY2FsbChzZWxmKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgneGhyLXBvbGxpbmcnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcbiAgLyoqXG4gICAqIFRoZXJlIGlzIGEgd2F5IHRvIGhpZGUgdGhlIGxvYWRpbmcgaW5kaWNhdG9yIGluIEZpcmVmb3guIElmIHlvdSBjcmVhdGUgYW5kXG4gICAqIHJlbW92ZSBhIGlmcmFtZSBpdCB3aWxsIHN0b3Agc2hvd2luZyB0aGUgY3VycmVudCBsb2FkaW5nIGluZGljYXRvci5cbiAgICogVW5mb3J0dW5hdGVseSB3ZSBjYW4ndCBmZWF0dXJlIGRldGVjdCB0aGF0IGFuZCBVQSBzbmlmZmluZyBpcyBldmlsLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdmFyIGluZGljYXRvciA9IGdsb2JhbC5kb2N1bWVudCAmJiBcIk1vekFwcGVhcmFuY2VcIiBpblxuICAgIGdsb2JhbC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0c1snanNvbnAtcG9sbGluZyddID0gSlNPTlBQb2xsaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgSlNPTlAgdHJhbnNwb3J0IGNyZWF0ZXMgYW4gcGVyc2lzdGVudCBjb25uZWN0aW9uIGJ5IGR5bmFtaWNhbGx5XG4gICAqIGluc2VydGluZyBhIHNjcmlwdCB0YWcgaW4gdGhlIHBhZ2UuIFRoaXMgc2NyaXB0IHRhZyB3aWxsIHJlY2VpdmUgdGhlXG4gICAqIGluZm9ybWF0aW9uIG9mIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBXaGVuIG5ldyBpbmZvcm1hdGlvbiBpcyByZWNlaXZlZFxuICAgKiBpdCBjcmVhdGVzIGEgbmV3IHNjcmlwdCB0YWcgZm9yIHRoZSBuZXcgZGF0YSBzdHJlYW0uXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAZXh0ZW5kcyB7aW8uVHJhbnNwb3J0Lnhoci1wb2xsaW5nfVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBKU09OUFBvbGxpbmcgKHNvY2tldCkge1xuICAgIGlvLlRyYW5zcG9ydFsneGhyLXBvbGxpbmcnXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5pbmRleCA9IGlvLmoubGVuZ3RoO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaW8uai5wdXNoKGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIHNlbGYuXyhtc2cpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBJbmhlcml0cyBmcm9tIFhIUiBwb2xsaW5nIHRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEpTT05QUG9sbGluZywgaW8uVHJhbnNwb3J0Wyd4aHItcG9sbGluZyddKTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ2pzb25wLXBvbGxpbmcnO1xuXG4gIC8qKlxuICAgKiBQb3N0cyBhIGVuY29kZWQgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlciB1c2luZyBhbiBpZnJhbWUuXG4gICAqIFRoZSBpZnJhbWUgaXMgdXNlZCBiZWNhdXNlIHNjcmlwdCB0YWdzIGNhbiBjcmVhdGUgUE9TVCBiYXNlZCByZXF1ZXN0cy5cbiAgICogVGhlIGlmcmFtZSBpcyBwb3NpdGlvbmVkIG91dHNpZGUgb2YgdGhlIHZpZXcgc28gdGhlIHVzZXIgZG9lcyBub3RcbiAgICogbm90aWNlIGl0J3MgZXhpc3RlbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBBIGVuY29kZWQgbWVzc2FnZS5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeShcbiAgICAgICAgICAgICB0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5XG4gICAgICAgICAgLCAndD0nKyAoK25ldyBEYXRlKSArICcmaT0nICsgdGhpcy5pbmRleFxuICAgICAgICApO1xuXG4gICAgaWYgKCF0aGlzLmZvcm0pIHtcbiAgICAgIHZhciBmb3JtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpXG4gICAgICAgICwgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgICAgICAgLCBpZCA9IHRoaXMuaWZyYW1lSWQgPSAnc29ja2V0aW9faWZyYW1lXycgKyB0aGlzLmluZGV4XG4gICAgICAgICwgaWZyYW1lO1xuXG4gICAgICBmb3JtLmNsYXNzTmFtZSA9ICdzb2NrZXRpbyc7XG4gICAgICBmb3JtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGZvcm0uc3R5bGUudG9wID0gJzBweCc7XG4gICAgICBmb3JtLnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGZvcm0udGFyZ2V0ID0gaWQ7XG4gICAgICBmb3JtLm1ldGhvZCA9ICdQT1NUJztcbiAgICAgIGZvcm0uc2V0QXR0cmlidXRlKCdhY2NlcHQtY2hhcnNldCcsICd1dGYtOCcpO1xuICAgICAgYXJlYS5uYW1lID0gJ2QnO1xuICAgICAgZm9ybS5hcHBlbmRDaGlsZChhcmVhKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbiAgICAgIHRoaXMuZm9ybSA9IGZvcm07XG4gICAgICB0aGlzLmFyZWEgPSBhcmVhO1xuICAgIH1cblxuICAgIHRoaXMuZm9ybS5hY3Rpb24gPSB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5O1xuXG4gICAgZnVuY3Rpb24gY29tcGxldGUgKCkge1xuICAgICAgaW5pdElmcmFtZSgpO1xuICAgICAgc2VsZi5zb2NrZXQuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW5pdElmcmFtZSAoKSB7XG4gICAgICBpZiAoc2VsZi5pZnJhbWUpIHtcbiAgICAgICAgc2VsZi5mb3JtLnJlbW92ZUNoaWxkKHNlbGYuaWZyYW1lKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gaWU2IGR5bmFtaWMgaWZyYW1lcyB3aXRoIHRhcmdldD1cIlwiIHN1cHBvcnQgKHRoYW5rcyBDaHJpcyBMYW1iYWNoZXIpXG4gICAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJzxpZnJhbWUgbmFtZT1cIicrIHNlbGYuaWZyYW1lSWQgKydcIj4nKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIGlmcmFtZS5uYW1lID0gc2VsZi5pZnJhbWVJZDtcbiAgICAgIH1cblxuICAgICAgaWZyYW1lLmlkID0gc2VsZi5pZnJhbWVJZDtcblxuICAgICAgc2VsZi5mb3JtLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgICBzZWxmLmlmcmFtZSA9IGlmcmFtZTtcbiAgICB9O1xuXG4gICAgaW5pdElmcmFtZSgpO1xuXG4gICAgLy8gd2UgdGVtcG9yYXJpbHkgc3RyaW5naWZ5IHVudGlsIHdlIGZpZ3VyZSBvdXQgaG93IHRvIHByZXZlbnRcbiAgICAvLyBicm93c2VycyBmcm9tIHR1cm5pbmcgYFxcbmAgaW50byBgXFxyXFxuYCBpbiBmb3JtIGlucHV0c1xuICAgIHRoaXMuYXJlYS52YWx1ZSA9IGlvLkpTT04uc3RyaW5naWZ5KGRhdGEpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZm9ybS5zdWJtaXQoKTtcbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICBpZiAodGhpcy5pZnJhbWUuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGlmcmFtZS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLmlmcmFtZS5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlmcmFtZS5vbmxvYWQgPSBjb21wbGV0ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5zZXRCdWZmZXIodHJ1ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgSlNPTlAgcG9sbCB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpc3RlblxuICAgKiBmb3IgbWVzc2FnZXMgZnJvbSB0aGUgU29ja2V0LklPIHNlcnZlci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkoXG4gICAgICAgICAgICAgdGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeVxuICAgICAgICAgICwgJ3Q9JysgKCtuZXcgRGF0ZSkgKyAnJmk9JyArIHRoaXMuaW5kZXhcbiAgICAgICAgKTtcblxuICAgIGlmICh0aGlzLnNjcmlwdCkge1xuICAgICAgdGhpcy5zY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnNjcmlwdCk7XG4gICAgICB0aGlzLnNjcmlwdCA9IG51bGw7XG4gICAgfVxuXG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZTtcbiAgICBzY3JpcHQuc3JjID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcbiAgICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgIH07XG5cbiAgICB2YXIgaW5zZXJ0QXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgaW5zZXJ0QXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2NyaXB0LCBpbnNlcnRBdCk7XG4gICAgdGhpcy5zY3JpcHQgPSBzY3JpcHQ7XG5cbiAgICBpZiAoaW5kaWNhdG9yKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIGluY29taW5nIG1lc3NhZ2Ugc3RyZWFtIGZyb20gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIFRoZSBtZXNzYWdlXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLl8gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgdGhpcy5vbkRhdGEobXNnKTtcbiAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgIHRoaXMuZ2V0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5kaWNhdG9yIGhhY2sgb25seSB3b3JrcyBhZnRlciBvbmxvYWRcbiAgICpcbiAgICogQHBhcmFtIHtTb2NrZXR9IHNvY2tldCBUaGUgc29ja2V0IGluc3RhbmNlIHRoYXQgbmVlZHMgYSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFpbmRpY2F0b3IpIHJldHVybiBmbi5jYWxsKHRoaXMpO1xuXG4gICAgaW8udXRpbC5sb2FkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBicm93c2VyIHN1cHBvcnRzIHRoaXMgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBKU09OUFBvbGxpbmcuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdkb2N1bWVudCcgaW4gZ2xvYmFsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBjcm9zcyBkb21haW4gcmVxdWVzdHMgYXJlIHN1cHBvcnRlZFxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnanNvbnAtcG9sbGluZycpO1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gaW87IH0pO1xufVxufSkoKTsiLCJ2YXIgaW9jID0gcmVxdWlyZSgnc29ja2V0LmlvL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50Jyk7XHJcbnJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbi91dGlscy5qcycpO1xyXG52YXIgTXNnID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9uL01zZy5qcycpO1xyXG5yZXF1aXJlKCcuL3F0aXAuanMnKTtcclxudmFyIGtvID0gcmVxdWlyZSgna25vY2tvdXQnKTtcclxudmFyIEVsYXBzZWQgPSByZXF1aXJlKCdlbGFwc2VkJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNlcnZlckJyb3dzZXI7XHJcbnZhciBpbkJyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcclxuaWYgKGluQnJvd3Nlcikge1xyXG4gICAgd2luZG93LlNlcnZlckJyb3dzZXIgPSBTZXJ2ZXJCcm93c2VyO1xyXG4gICAgd2luZG93LmtvID0ga287XHJcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnW2RhdGV0aW1lXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCR0aGlzLmF0dHIoJ2RhdGV0aW1lJykpO1xyXG4gICAgICAgICAgICB2YXIgZm9ybWF0ID0gJHRoaXMuYXR0cignZGF0ZXRpbWUtZm9ybWF0Jyk7XHJcbiAgICAgICAgICAgIHZhciBlbGFwc2VkID0gZGF0ZS5lbGFwc2VkKCk7XHJcbiAgICAgICAgICAgICR0aGlzLnRleHQoZWxhcHNlZCAmJiAoZm9ybWF0ID8gZm9ybWF0LmZvcm1hdChlbGFwc2VkKSA6IGVsYXBzZWQpKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sIDEwMDApO1xyXG59XHJcbnZhciBvYnNlcnZhYmxlID0ga28ub2JzZXJ2YWJsZTtcclxudmFyIG9ic2VydmFibGVBcnJheSA9IGtvLm9ic2VydmFibGVBcnJheTtcclxud2luZG93LnVud3JhcCA9IGtvLnVud3JhcDtcclxua28uYmluZGluZ0hhbmRsZXJzLmhpZGRlbiA9IHtcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcclxuICAgICAgICB2YXIgaXNWaXNpYmxlID0gIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcclxuICAgICAgICBrby5iaW5kaW5nSGFuZGxlcnMudmlzaWJsZS51cGRhdGUoZWxlbWVudCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gaXNWaXNpYmxlOyB9KTtcclxuICAgIH1cclxufTtcclxuZnVuY3Rpb24gU2VydmVyQnJvd3Nlcihjb25mKSB7XHJcbiAgICB0aGlzLmNvbmYgPSBjb25mO1xyXG4gICAgdGhpcy5sb2dzID0gb2JzZXJ2YWJsZUFycmF5KFtdKTtcclxuICAgIHRoaXMuYWdlbnRzID0gb2JzZXJ2YWJsZUFycmF5KFtdKTtcclxuICAgIHRoaXMuYnVpbGRzID0gb2JzZXJ2YWJsZUFycmF5KFtdKTtcclxuICAgIHRoaXMuY2xpZW50cyA9IG9ic2VydmFibGVBcnJheShbXSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkQnVpbGQgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLnNlbGVjdGVkQnVpbGQgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLnNlbGVjdGVkQnVpbGQudGFiID0gb2JzZXJ2YWJsZSgnI25vQnVpbGQnKTtcclxuICAgIHRoaXMuc3RhdHVzID0gb2JzZXJ2YWJsZSgnY29ubmVjdGluZycpO1xyXG4gICAgdGhpcy5kaXNjb25uZWN0ZWRTaW5jZSA9IG9ic2VydmFibGUoKTtcclxuICAgIHZhciB1cmwgPSAnezB9Oi8vezF9ezJ9L3szfScuZm9ybWF0KGNvbmYucHJvdG9jb2wgfHwgJ2h0dHAnLCBjb25mLmhvc3QgfHwgJ2xvY2FsaG9zdCcsIGNvbmYucG9ydCA9PSA4MCA/ICcnIDogJzonICsgY29uZi5wb3J0LCAnd3d3Jyk7XHJcbiAgICB2YXIgYXMgPSAkLmNvb2tpZSgnYXMnKSAhPT0gJ2ZhbHNlJztcbiAgICAgICAgY29uc29sZS5sb2coJ2FzJywgYXMpO1xuICAgIHRoaXMuYXMgPSBvYnNlcnZhYmxlKGFzKTtcbiAgICB0aGlzLmFzLnN1YnNjcmliZShmdW5jdGlvbihhcykge1xuICAgICAgICBjb25zb2xlLmxvZygnYXMnLCBhcyk7XG4gICAgICAgICQuY29va2llKCdhcycsIGFzLHtleHBpcmVzOjM2NX0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cclxuICAgIGluQnJvd3NlciAmJiBrby5hcHBseUJpbmRpbmdzKHRoaXMsIGRvY3VtZW50LmJvZHkpO1xyXG4gICAgdGhpcy5jb25uZWN0KHVybCk7XHJcbn1cclxuU2VydmVyQnJvd3Nlci5kZWZpbmUoe1xyXG4gICAgc3RhdHVzZXM6IHtcclxuICAgICAgICAnYnVpbGRpbmcnOiAnaW1nL3BsYXRmb3Jtcy9idWlsZGluZy5naWYnLFxyXG4gICAgICAgICd1cGxvYWRpbmcnOiAnaW1nL3BsYXRmb3Jtcy93b3JraW5nLmdpZicsXHJcbiAgICAgICAgJ3F1ZXVlZCc6ICdpbWcvcGxhdGZvcm1zL3F1ZXVlLmdpZicsXHJcbiAgICAgICAgJ3dvcmtpbmcnOiAnaW1nL3BsYXRmb3Jtcy93b3JraW5nLmdpZicsXHJcbiAgICAgICAgJ2ZhaWxlZCc6ICdpbWcvcGxhdGZvcm1zL2ZhaWwucG5nJyxcclxuICAgICAgICAndW5rbm93bic6ICdpbWcvcGxhdGZvcm1zL3Vua25vd24ucG5nJyxcclxuICAgIH0sXHJcbiAgICBwbGF0Zm9ybU5hbWVzOiB7XHJcbiAgICAgICAgJ2lvcyc6ICdJT1MnLFxyXG4gICAgICAgICd3cDgnOiAnV2luZG93cyBQaG9uZSA4JyxcclxuICAgICAgICAnYW5kcm9pZCc6ICdBbmRyb2lkJyxcclxuICAgIH0sXHJcbiAgICBjb25uZWN0OiBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBpb2MuY29ubmVjdCh1cmwpO1xyXG4gICAgICAgIHRoaXMuc29ja2V0LmhlYXJ0YmVhdFRpbWVvdXQgPSAxMDAwOyAvLyByZWNvbm5lY3QgaWYgbm90IHJlY2VpdmVkIGhlYXJ0YmVhdCBmb3IgMjAgc2Vjb25kc1xyXG5cclxuICAgICAgICB0aGlzLnNvY2tldC5vbih7XHJcbiAgICAgICAgICAgICdjb25uZWN0JzogdGhpcy5vbkNvbm5lY3QsXHJcbiAgICAgICAgICAgICdkaXNjb25uZWN0JzogdGhpcy5vbkRpc2Nvbm5lY3QsXHJcbiAgICAgICAgICAgICdzdGF0dXMnOiB0aGlzLm9uU3RhdHVzLFxyXG4gICAgICAgICAgICAnbmV3cyc6IHRoaXMub25QYXJ0aWFsU3RhdHVzLFxyXG4gICAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSxcclxuICAgICdvbkNvbm5lY3QnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMoJ2Nvbm5lY3RlZCcpO1xyXG4gICAgfSxcclxuICAgICdvbkRpc2Nvbm5lY3QnOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0ZWRTaW5jZShuZXcgRGF0ZSgpKTtcclxuICAgICAgICB0aGlzLnN0YXR1cygnZGlzY29ubmVjdGVkJyk7XHJcbiAgICAgICAgdGhpcy5hZ2VudHMoW10pO1xyXG4gICAgICAgIHRoaXMuYnVpbGRzKFtdKTtcclxuICAgICAgICB0aGlzLmNsaWVudHMoW10pO1xyXG4gICAgICAgIC8vdGhpcy5sb2dzKFtdKTsgIC0tIGRvIG5vdCBjbGVhciBsb2dzXHJcbiAgICAgICAgdGhpcy5hZ2VudHMubWFwID0ge307XHJcbiAgICAgICAgdGhpcy5idWlsZHMubWFwID0ge307XHJcbiAgICAgICAgdGhpcy5jbGllbnRzLm1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMubG9ncy5tYXAgPSB7fTtcclxuICAgIH0sXHJcbiAgICAnb25QYXJ0aWFsU3RhdHVzJzogZnVuY3Rpb24gKHN0YXR1cykge1xyXG4gICAgICAgIC8vY29uc29sZS53YXJuKCdwYXJ0aWFsIHN0YXR1cycsIHN0YXR1cyk7XHJcbiAgICAgICAgc3dpdGNoIChzdGF0dXMgJiYgc3RhdHVzLndoYXQpIHtcclxuICAgICAgICAgICAgY2FzZSAnYWdlbnQnOlxyXG4gICAgICAgICAgICAgICAgdXBkYXRlLmNhbGwodGhpcywgdGhpcy5hZ2VudHMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2J1aWxkJzpcclxuICAgICAgICAgICAgICAgIHVwZGF0ZS5jYWxsKHRoaXMsIHRoaXMuYnVpbGRzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdjbGllbnQnOlxyXG4gICAgICAgICAgICAgICAgdXBkYXRlLmNhbGwodGhpcywgdGhpcy5jbGllbnRzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsb2cnOlxyXG4gICAgICAgICAgICAgICAgdXBkYXRlLmNhbGwodGhpcywgdGhpcy5sb2dzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGUobGlzdCkge1xyXG4gICAgICAgICAgICBsaXN0Lm1hcCA9IGxpc3QubWFwIHx8IHt9O1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXR1cyAmJiBzdGF0dXMua2luZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbG9nJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnVpbGQgPSBzdGF0dXMub2JqO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBuZXcgTXNnKGJ1aWxkKTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQobXNnKTtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZCA9IHRoaXMuYnVpbGRzLm1hcFtidWlsZCAmJiBidWlsZC5idWlsZElkXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvZ1wiLCBzdGF0dXMub2JqLCBidWlsZCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICBidWlsZCAmJiBidWlsZC5sb2dzLnVuc2hpZnQobXNnKTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdsb2cnLCBzdGF0dXMub2JqKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3F1ZXVlZCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdidWlsZGluZyc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICdmYWlsZWQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3VjY2Vzcyc6XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXAgPSBsaXN0Lm1hcDtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnVpbGQgPSBzdGF0dXMub2JqO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRvU2VsZWN0QnVpbGQgPSB0aGlzLmFzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdEJ1aWxkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEJ1aWxkID0gdGhpcy5zZWxlY3RlZEJ1aWxkO1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkID0gZnVuY3Rpb24gKGJ1aWxkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG1hcFtidWlsZC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2bSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0udXBkYXRlKGJ1aWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0gPSBuZXcgQnVpbGRWTShidWlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBbYnVpbGQuaWRdID0gdm07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9TZWxlY3RCdWlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0QnVpbGQgPSB2bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQodm0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSAgdGhpcy5wbGF0Zm9ybXMucHVzaCh2bSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMgIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVySWQgPSB0aGlzICYmIHRoaXMuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5tYXN0ZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChhcmd1bWVudHMuY2FsbGVlLmJpbmQodm0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdEJ1aWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRCdWlsZChzZWxlY3RCdWlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bTtcclxuICAgICAgICAgICAgICAgICAgICB9LmNhbGwoMSwgYnVpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidWlsZCAmJiAhc2VsZWN0ZWRCdWlsZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQnVpbGQoYnVpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVkJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbyA9IGxpc3QubWFwW3N0YXR1cy5vYmouaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gbGlzdC5pbmRleE9mKG8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgPCAwID8gbGlzdC51bnNoaWZ0KHN0YXR1cy5vYmopIDogbGlzdFtpXSA9IHN0YXR1cy5vYmo7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5tYXBbc3RhdHVzLm9iai5pZF0gPSBvO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0xJU1QnLCBzdGF0dXMsIGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGlzY29ubmVjdGVkJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBzdGF0dXMub2JqLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucmVtb3ZlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmlkID09IGlkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBsaXN0Lm1hcFtzdGF0dXMub2JqLmlkXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMSVNUJywgc3RhdHVzLm9iai5pZCwgc3RhdHVzLCBsaXN0Lm1hcCwgbGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1cy5vYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgICdvblN0YXR1cyc6IGZ1bmN0aW9uIChzdGF0dXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnc3RhdHVzJywgc3RhdHVzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYgKHN0YXR1cykge1xyXG4gICAgICAgICAgICBzdGF0dXMuYWdlbnRzID0gc3RhdHVzLmFnZW50cyB8fCBbXTtcclxuICAgICAgICAgICAgdGhpcy5sb2dzKChzdGF0dXMubG9ncyB8fFtdKS5tYXAoZnVuY3Rpb24obG9nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE1zZyhsb2cpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLm1hcCA9IHt9O1xyXG4gICAgICAgICAgICBzdGF0dXMuYWdlbnRzICYmIHN0YXR1cy5hZ2VudHMuZm9yRWFjaChmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWdlbnRzLm1hcFthZ2VudC5pZF0gPSBhZ2VudDtcclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBtYXAgPSB0aGlzLmJ1aWxkcy5tYXAgPSB7fTtcclxuICAgICAgICAgICAgdmFyIGJ1aWxkcyA9IFtdO1xyXG4gICAgICAgICAgICBzdGF0dXMuYnVpbGRzICYmIHN0YXR1cy5idWlsZHMuZm9yRWFjaChmdW5jdGlvbiAoYnVpbGQpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2bSA9IG1hcFtidWlsZC5pZF07XHJcbiAgICAgICAgICAgICAgICBpZiAodm0pIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS51cGRhdGUoYnVpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2bSA9IG5ldyBCdWlsZFZNKGJ1aWxkKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXBbYnVpbGQuaWRdID0gdm07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcyA9PSAxID8gYnVpbGRzLnVuc2hpZnQodm0pIDogdGhpcy5wbGF0Zm9ybXMucHVzaCh2bSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcyAhPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVySWQgPSB0aGlzICYmIHRoaXMuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVyID0gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChhcmd1bWVudHMuY2FsbGVlLmJpbmQodm0pKTtcclxuICAgICAgICAgICAgfS5iaW5kKDEpKTtcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMoc3RhdHVzLmFnZW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGRzKGJ1aWxkcyk7XHJcbiAgICAgICAgICAgIGlmIChidWlsZHNbMF0gJiYgIXRoaXMuc2VsZWN0ZWRCdWlsZCgpKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEJ1aWxkKGJ1aWxkc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBhcnNlc2VsZWN0ZWRCdWlsZDogZnVuY3Rpb24gKGJ1aWxkKSB7XHJcbiAgICAgICAgaWYgKGJ1aWxkKSB7XHJcbiAgICAgICAgICAgIGJ1aWxkLnFyID0gdGhpcy5zdGF0dXNlc1tidWlsZC5zdGF0dXNdIHx8IHRoaXMuZ2VuZXJhdGVRUignL2Rvd25sb2FkLycgKyBidWlsZC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChmdW5jdGlvbiAocGxhdGZvcm0pIHtcclxuICAgICAgICAgICAgcGxhdGZvcm0ucXIgPSB0aGlzLnN0YXR1c2VzW2J1aWxkLnN0YXR1c10gfHwgdGhpcy5nZW5lcmF0ZVFSKCcvZG93bmxvYWQvJyArIGJ1aWxkLmlkKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkQnVpbGQoYnVpbGQpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUVI6IGZ1bmN0aW9uICh1cmwsIGxldmVsKSB7XHJcbiAgICAgICAgdmFyIHVyaSA9IHFyLnRvRGF0YVVSTCh7XHJcbiAgICAgICAgICAgIHZhbHVlOiB1cmwsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCB8fCAnSCcsXHJcbiAgICAgICAgICAgIHNpemU6IDEwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUud2Fybih1cmkpO1xyXG4gICAgICAgIHJldHVybiB1cmk7XHJcbiAgICB9LFxyXG4gICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncmVmcmVzaCcpO1xyXG4gICAgfSxcclxufSk7XHJcbmZ1bmN0aW9uIEJ1aWxkVk0oYnVpbGQpIHtcclxuICAgIHRoaXMuY29uZiA9IGJ1aWxkICYmIGJ1aWxkLmNvbmY7XHJcbiAgICB0aGlzLm5hbWUgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLmlkID0gYnVpbGQgJiYgYnVpbGQuaWQ7XHJcbiAgICB0aGlzLnBsYXRmb3JtcyA9IG9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5wbGF0Zm9ybSA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMuc3RhcnRlZCA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMubG9ncyA9IG9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5jb21wbGV0ZWQgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLmR1cmF0aW9uID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy5zdGF0dXMgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLnFyID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy51cGRhdGUoYnVpbGQpO1xyXG59XHJcbnZhciBzdGF0dXNlcyA9IFsndW5rbm93bicsICdwbGFubmVkJywgJ3N1Y2Nlc3MnLCAncXVldWVkJywgJ2J1aWxkaW5nJywgJ3VwbG9hZGluZycsICdmYWlsZWQnXVxyXG5CdWlsZFZNLmRlZmluZSh7XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChidWlsZCkge1xyXG4gICAgICAgIGlmIChidWlsZCAmJiBidWlsZC5jb25mKSB7XHJcbiAgICAgICAgICAgIHZhciBjb25mID0gYnVpbGQuY29uZjtcclxuICAgICAgICAgICAgdGhpcy5jb25mID0gY29uZjtcclxuICAgICAgICAgICAgdGhpcy5uYW1lKGNvbmYubmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMucGxhdGZvcm0oY29uZi5wbGF0Zm9ybSk7XHJcbiAgICAgICAgICAgIHRoaXMuaWQgPSBidWlsZC5pZDtcclxuICAgICAgICAgICAgdGhpcy5jb25mICYmICh0aGlzLmNvbmYubG9ncyA9ICh0aGlzLmNvbmYubG9ncyB8fCBbXSkubWFwKGZ1bmN0aW9uKGxvZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBNc2cobG9nKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB0aGlzLmxvZ3ModGhpcy5jb25mLmxvZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWQoY29uZi5zdGFydGVkICYmIG5ldyBEYXRlKGNvbmYuc3RhcnRlZCkpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlZChjb25mLmNvbXBsZXRlZCAmJiBuZXcgRGF0ZShjb25mLmNvbXBsZXRlZCkpO1xyXG4gICAgICAgICAgICB0aGlzLmR1cmF0aW9uKGNvbmYuZHVyYXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyhjb25mLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1hc3Rlcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hc3RlclN0YXR1cyA9IDA7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGxhdGZvcm1CdWlsZHMgPSB0aGlzLm1hc3Rlci5wbGF0Zm9ybXMoKTtcclxuICAgICAgICAgICAgICAgIHBsYXRmb3JtQnVpbGRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkLCBpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IHN0YXR1c2VzLmluZGV4T2YoY2hpbGQuc3RhdHVzKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID4gbWFzdGVyU3RhdHVzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXN0ZXJTdGF0dXMgPSBpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbWFzdGVyU3RhdHVzID0gc3RhdHVzZXNbbWFzdGVyU3RhdHVzXSB8fCAndW5rb3duJztcclxuICAgICAgICAgICAgICAgIHRoaXMubWFzdGVyLmNvbmYuc3RhdHVzID0gbWFzdGVyU3RhdHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXN0ZXIuc3RhdHVzKG1hc3RlclN0YXR1cyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcXIgPSBtYXN0ZXJTdGF0dXMgPT0gJ3N1Y2Nlc3MnID8gdGhpcy5tYXN0ZXIuX19xciA6IFNlcnZlckJyb3dzZXIucHJvdG90eXBlLnN0YXR1c2VzW21hc3RlclN0YXR1c107XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hc3Rlci5xcihxcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9xciAhPSBidWlsZC5pZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcXIgPSBidWlsZC5pZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX19xciA9IHRoaXMuUVIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcXIgPSBjb25mLnN0YXR1cyA9PSAnc3VjY2VzcycgPyB0aGlzLl9fcXIgOiBTZXJ2ZXJCcm93c2VyLnByb3RvdHlwZS5zdGF0dXNlc1tjb25mLnN0YXR1cyB8fCAndW5rb3duJ107XHJcbiAgICAgICAgICAgIHRoaXMucXIocXIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBRUjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBTZXJ2ZXJCcm93c2VyLnByb3RvdHlwZS5nZW5lcmF0ZVFSKCdodHRwOi8vbG9jYWxob3N0L2Rvd25sb2FkLycgKyB0aGlzLmlkKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4iLCIhZnVuY3Rpb24oJCkge1xyXG4gICAgLyogQ09ORklHICovXHJcblxyXG4gICAgeE9mZnNldCA9IDEwO1xyXG4gICAgeU9mZnNldCA9IDMwO1xyXG5cclxuICAgIC8vIHRoZXNlIDIgdmFyaWFibGUgZGV0ZXJtaW5lIHBvcHVwJ3MgZGlzdGFuY2UgZnJvbSB0aGUgY3Vyc29yXHJcbiAgICAvLyB5b3UgbWlnaHQgd2FudCB0byBhZGp1c3QgdG8gZ2V0IHRoZSByaWdodCByZXN1bHRcclxuXHJcbiAgICAvKiBFTkQgQ09ORklHICovXHJcbiAgICAkKGRvY3VtZW50KS5vbihcIm1vdXNlZW50ZXJcIiwgXCIucHJldmlld1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgdGhpcy50ID0gJHRoaXMuYXR0cihcInRpdGxlXCIpO1xyXG4gICAgICAgIGlmICghdGhpcy50ICYmICFyZWwpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IFwiXCI7XHJcbiAgICAgICAgdmFyIGMgPSAodGhpcy50ICE9IFwiXCIpID8gXCI8YnIvPlwiICsgdGhpcy50IDogXCJcIjtcclxuICAgICAgICB2YXIgcmVsID0gJHRoaXMuYXR0cihcInJlbFwiKTtcclxuICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQoW1wiPGRpdiBpZD0nc2NyZWVuc2hvdCc+XCIsIHJlbCA/IFwiPGltZyBzcmM9J1wiIDogXCJcIiwgcmVsLCByZWwgPyBcIicgYWx0PSd1cmwgcHJldmlldycgLz5cIjogXCJcIiwgIGMsIFwiPC9kaXY+XCJdLmpvaW4oJycpKTtcclxuICAgICAgICAkKFwiI3NjcmVlbnNob3RcIilcclxuICAgICAgICAgICAgLmNzcyhcInRvcFwiLCAoZS5wYWdlWSAtIHhPZmZzZXQpICsgXCJweFwiKVxyXG4gICAgICAgICAgICAuY3NzKFwibGVmdFwiLCAoZS5wYWdlWCArIHlPZmZzZXQpICsgXCJweFwiKVxyXG4gICAgICAgICAgICAuZmFkZUluKFwiZmFzdFwiKTtcclxuICAgIH0pLm9uKFwibW91c2VsZWF2ZVwiLCBcIi5wcmV2aWV3XCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRoaXMudDtcclxuICAgICAgICAkKFwiI3NjcmVlbnNob3RcIikucmVtb3ZlKCk7XHJcbiAgICB9KS5vbihcIm1vdXNlbW92ZVwiLCBcIi5wcmV2aWV3XCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgJChcIiNzY3JlZW5zaG90XCIpXHJcbiAgICAgICAgICAgIC5jc3MoXCJ0b3BcIiwgKGUucGFnZVkgLSB4T2Zmc2V0KSArIFwicHhcIilcclxuICAgICAgICAgICAgLmNzcyhcImxlZnRcIiwgKGUucGFnZVggKyB5T2Zmc2V0KSArIFwicHhcIik7XHJcbiAgICB9KTtcdFxyXG59KGpRdWVyeSk7XHJcbiJdfQ==
