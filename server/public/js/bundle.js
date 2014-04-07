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
        console.warn('partial status', status);
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
                    list.unshift(new Msg(status.obj));
                    console.log('log', status.obj);
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
                        build.conf && (build.conf.logs = (build.conf.logs || []).map(function(log) {
                            return new Msg(log);
                        }));
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
                 build.conf && (build.conf.logs = (build.conf.logs || []).map(function(log) {
                    return new Msg(log);
                }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGxhdVxcQXBwRGF0YVxcUm9hbWluZ1xcbnBtXFxub2RlX21vZHVsZXNcXHdhdGNoaWZ5XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImQ6L1dvcmsvRG90TmV0V2lzZS9OdWdnZXRzL2NvcmRvdmEtYnVpbGQvY29tbW9uL01zZy5qcyIsImQ6L1dvcmsvRG90TmV0V2lzZS9OdWdnZXRzL2NvcmRvdmEtYnVpbGQvY29tbW9uL3BhdGNoLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9jb21tb24vdXRpbHMuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9FbGFwc2VkL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvYXJyYXktc3VnYXIvYXJyYXktc3VnYXIuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9kYXRlLWZvcm1hdC1saXRlL2RhdGUtZm9ybWF0LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvZmFzdC1jbGFzcy9GYXN0Q2xhc3MuanMiLCJkOi9Xb3JrL0RvdE5ldFdpc2UvTnVnZ2V0cy9jb3Jkb3ZhLWJ1aWxkL25vZGVfbW9kdWxlcy9rbm9ja291dC9idWlsZC9vdXRwdXQva25vY2tvdXQtbGF0ZXN0LmRlYnVnLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9ub2RlX21vZHVsZXMvc29ja2V0LmlvL25vZGVfbW9kdWxlcy9zb2NrZXQuaW8tY2xpZW50L2Rpc3Qvc29ja2V0LmlvLmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9zZXJ2ZXIvcHVibGljL2pzL2luZGV4LmpzIiwiZDovV29yay9Eb3ROZXRXaXNlL051Z2dldHMvY29yZG92YS1idWlsZC9zZXJ2ZXIvcHVibGljL2pzL3F0aXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5cEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoeUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gTXNnO1xyXG5yZXF1aXJlKCcuL3V0aWxzJyk7XHJcbnZhciBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKTtcclxudmFyIGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XHJcbnZhciBzcGxpY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlO1xyXG5mdW5jdGlvbiBNc2coYnVpbGQpIHtcclxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcclxuICAgICAgICBleHRlbmQodGhpcywgYnVpbGQpO1xyXG4gICAgICAgIHRoaXMuZGF0ZSA9IHRoaXMuZGF0ZSAmJiBuZXcgRGF0ZSh0aGlzLmRhdGUpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBhcmd1bWVudHMubGVuZ3RoICYmIHRoaXMudXBkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9XHJcbn1cclxuTXNnLmRlZmluZSh7XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGJ1aWxkLCBzZW5kZXIsIGJ5LCBwcmlvcml0eSwgbWVzc2FnZSwgYXJncykge1xyXG4gICAgICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eTtcclxuICAgICAgICB0aGlzLmJ1aWxkSWQgPSBidWlsZCAmJiBidWlsZC5pZCB8fCBidWlsZDtcclxuICAgICAgICB0aGlzLnNlbmRlcklkID0gc2VuZGVyICYmIHNlbmRlci5pZCB8fCBzZW5kZXI7XHJcbiAgICAgICAgdGhpcy5ieSA9IGJ5O1xyXG4gICAgICAgIHZhciBtc2cgPSBtZXNzYWdlO1xyXG4gICAgICAgIHNwbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgNSwgdGhpcy5zZW5kZXJJZCwgdGhpcy5idWlsZElkKTtcclxuXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gJycuZm9ybWF0LmFwcGx5KG1zZyB8fCAnJywgYXJndW1lbnRzKTtcclxuICAgIH0sXHJcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oZG9Ob3RJbmNsdWRlUHJlZml4KSB7XHJcbiAgICAgICAgdmFyIGJ5LCBtc2c7XHJcbiAgICAgICAgc3dpdGNoKHRoaXMuYnkpe1xyXG4gICAgICAgICAgICBjYXNlICdBJzogYnkgPSAnW1NBXSBTZXJ2ZXInOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnQVcnOiBieSA9ICdbQVddIEFnZW50JzsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0MnOiBieSA9ICdbU0NdIFNlcnZlcic7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdDVyc6IGJ5ID0gJ1tDV10gQ2xpZW50JzsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ1MnOiBieSA9ICdbU10gU2VydmVyJzsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkb05vdEluY2x1ZGVQcmVmaXggfHwgdGhpcy5wcmlvcml0eSA9PSBNc2cuYnVpbGRfb3V0cHV0ICYmIGRvTm90SW5jbHVkZVByZWZpeCAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgbXNnID0gdGhpcy5tZXNzYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgICAgICAgIFxyXG4gICAgICAgICAgICBtc2cgPSBbYnksIHRoaXMuc2VuZGVySWQgPyAnIEB7MH0nIDogJycsIHRoaXMuYnVpbGRJZCA/ICcgYWJvdXQgI3sxfScgOiAnJywgJzogJywgdGhpcy5tZXNzYWdlXTtcclxuICAgICAgICAgICAgbXNnID0gbXNnLmpvaW4oJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtc2cgPSBtc2cuZm9ybWF0KHRoaXMuc2VuZGVySWQsIHRoaXMuYnVpbGRJZCk7XHJcbiAgICAgICAgcmV0dXJuIG1zZztcclxuICAgIH1cclxufSkuZGVmaW5lU3RhdGljKHtcclxuICAgIGRlYnVnOiA1LFxyXG4gICAgYnVpbGRfb3V0cHV0OiA0LFxyXG4gICAgaW5mbzogMyxcclxuICAgIHdhcm5pbmc6IDIsXHJcbiAgICBlcnJvcjogMSxcclxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSByZWJpbmQ7XHJcbmZ1bmN0aW9uIHJlYmluZChvYmosIG5hbWVzKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG5hbWVzLCBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHZhciBvcmlnaW5hbCA9IG9ialtuYW1lXTtcclxuICAgICAgICBvYmpbbmFtZV0gPSBmdW5jdGlvbiAodHlwZSwgbGlzdGVuZXIsIGNvbnRleHQpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9IFwib2JqZWN0XCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWwuY2FsbCh0aGlzLCB0eXBlLCBjb250ZXh0ID8gbGlzdGVuZXIuYmluZChjb250ZXh0KSA6IGxpc3RlbmVyKTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcblx0XHRcdFx0Y29udGV4dCA9IGxpc3RlbmVyO1xyXG4gICAgICAgICAgICAgICAgdmFyIHI7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0eXBlKS5mb3JFYWNoKGZ1bmN0aW9uICh0eXBlTmFtZSwgbGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IHR5cGVbdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSBvcmlnaW5hbC5jYWxsKHRoaXMsIHR5cGVOYW1lLCBjb250ZXh0ID8gbGlzdGVuZXIuYmluZChjb250ZXh0KSA6IGxpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuIiwidmFyIGxvZyA9IGNvbnNvbGUubG9nO1xyXG5yZXF1aXJlKFwiZGF0ZS1mb3JtYXQtbGl0ZVwiKTtcclxucmVxdWlyZSgnZmFzdC1jbGFzcycpO1xyXG5yZXF1aXJlKCdhcnJheS1zdWdhcicpO1xyXG52YXIgRWxhcHNlZCA9IHJlcXVpcmUoJ0VsYXBzZWQnKTtcclxudmFyIGlvYyA9IHJlcXVpcmUoJ3NvY2tldC5pby9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudCcpO1xyXG52YXIgcGF0Y2ggPSByZXF1aXJlKCcuL3BhdGNoLmpzJyk7XHJcbnBhdGNoKGlvYy5Tb2NrZXQucHJvdG90eXBlLCBbXCJvblwiLCBcImFkZExpc3RlbmVyXCJdKTtcclxucGF0Y2goaW9jLlNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUsIFtcIm9uXCIsIFwiYWRkTGlzdGVuZXJcIl0pO1xyXG5wYXRjaChpb2MuRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwgW1wib25cIiwgXCJhZGRMaXN0ZW5lclwiXSk7XHJcblxyXG5EYXRlLnByb3RvdHlwZS5lbGFwc2VkID0gZnVuY3Rpb24gKHVudGlsKSB7XHJcbiAgICByZXR1cm4gbmV3IEVsYXBzZWQodGhpcywgdW50aWwpLm9wdGltYWw7XHJcbn1cclxuXHJcbmNvbnNvbGUubG9nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuY2FsbChhcmd1bWVudHMsIG5ldyBEYXRlKCkuZm9ybWF0KFwibW06c3MuU1NcIikpO1xyXG4gICAgbG9nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn0uYmluZChjb25zb2xlKTtcclxudmFyIGNsYXNzMnR5cGUgPSBbXTtcclxuXCJCb29sZWFuIE51bWJlciBTdHJpbmcgRnVuY3Rpb24gQXJyYXkgRGF0ZSBSZWdFeHAgT2JqZWN0IEVycm9yXCIuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgIGNsYXNzMnR5cGVbXCJbb2JqZWN0IFwiICsgbmFtZSArIFwiXVwiXSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcclxufSk7XHJcblxyXG5PYmplY3QuZWFjaCA9IGZ1bmN0aW9uIChvYmosIGNhbGxiYWNrLCBjb250ZXh0KSB7XHJcbiAgICB2YXIgdmFsdWUsIGkgPSAwLFxyXG4gICAgICAgIGxlbmd0aCA9IG9iai5sZW5ndGgsXHJcbiAgICAgICAgdHlwZSA9IGpRdWVyeS50eXBlKG9iaiksXHJcbiAgICAgICAgaXNBcnJheSA9IHR5cGUgPT09IFwiYXJyYXlcIiB8fCB0eXBlICE9PSBcImZ1bmN0aW9uXCIgJiYgKGxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgbGVuZ3RoID09PSBcIm51bWJlclwiICYmIGxlbmd0aCA+IDAgJiYgKGxlbmd0aCAtIDEpIGluIG9iaik7XHJcblxyXG4gICAgaWYgKGNvbnRleHQpIHtcclxuICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICBvYmouZm9yRWFjaChjYWxsYmFjaywgY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChpIGluIG9iaikge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEEgc3BlY2lhbCwgZmFzdCwgY2FzZSBmb3IgdGhlIG1vc3QgY29tbW9uIHVzZSBvZiBlYWNoXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChpc0FycmF5KSB7XHJcbiAgICAgICAgICAgIG9iai5mb3JFYWNoKGNhbGxiYWNrLCBvYmopO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAoaSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChvYmosIGksIG9ialtpXSwgaSwgb2JqKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9iajtcclxufVxyXG5PYmplY3QuZXZlcnkgPSBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaywgY29udGV4dCkge1xyXG4gICAgdmFyIHZhbHVlLCBpID0gMCxcclxuICAgICAgICBsZW5ndGggPSBvYmoubGVuZ3RoLFxyXG4gICAgICAgIHR5cGUgPSBvYmogPT09IG51bGwgPyBTdHJpbmcob2JqKSA6IHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiID8gY2xhc3MydHlwZVtjbGFzczJ0eXBlLnRvU3RyaW5nLmNhbGwob2JqKV0gfHwgXCJvYmplY3RcIiA6IHR5cGVvZiBvYmosXHJcbiAgICAgICAgaXNBcnJheSA9IHR5cGUgPT09IFwiYXJyYXlcIiB8fCB0eXBlICE9PSBcImZ1bmN0aW9uXCIgJiYgKGxlbmd0aCA9PT0gMCB8fCB0eXBlb2YgbGVuZ3RoID09PSBcIm51bWJlclwiICYmIGxlbmd0aCA+IDAgJiYgKGxlbmd0aCAtIDEpIGluIG9iaik7XHJcblxyXG4gICAgaWYgKGNvbnRleHQpIHtcclxuICAgICAgICBpZiAoaXNBcnJheSkge1xyXG4gICAgICAgICAgICBvYmouZXZlcnkoY2FsbGJhY2ssIGNvbnRleHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAoaSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQSBzcGVjaWFsLCBmYXN0LCBjYXNlIGZvciB0aGUgbW9zdCBjb21tb24gdXNlIG9mIGVhY2hcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKGlzQXJyYXkpIHtcclxuICAgICAgICAgICAgb2JqLmV2ZXJ5KGNhbGxiYWNrLCBvYmopO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAoaSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gY2FsbGJhY2suY2FsbChvYmosIGksIG9ialtpXSwgaSwgb2JqKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbnZhciBUWVBFX01BUCA9IHtcclxuICAgICdvYmplY3QnOiAxLFxyXG4gICAgJ2Z1bmN0aW9uJzogMVxyXG59XHJcbkFycmF5LnByb3RvdHlwZS51bmlxdWUgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbWFwID0ge30sXHJcbiAgICAgICAgICAgIG9iamVjdHMgPSBbXSxcclxuICAgICAgICAgICAgdW5pcXVlID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IHRoaXNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoVFlQRV9NQVBbdHlwZW9mIHZhbF0gJiYgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbC5fX3VuaXF1ZV9fKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlLnB1c2godmFsKTtcclxuICAgICAgICAgICAgICAgICAgICBvYmplY3RzLnB1c2godmFsKTtcclxuICAgICAgICAgICAgICAgICAgICB2YWwuX191bmlxdWVfXyA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW1hcFt2YWxdKSB7XHJcbiAgICAgICAgICAgICAgICB1bmlxdWUucHVzaCh2YWwpO1xyXG4gICAgICAgICAgICAgICAgbWFwW3ZhbF0gPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGkgPSBvYmplY3RzLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICAgICAgICBkZWxldGUgb2JqZWN0c1tpXS5fX3VuaXF1ZV9fO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuaXF1ZTtcclxuICAgIH07XHJcbn0pKCk7IiwiZnVuY3Rpb24gRWxhcHNlZCAoZnJvbSwgdG8pIHtcblx0dGhpcy5mcm9tID0gZnJvbTtcblx0dGhpcy50byA9IHRvIHx8IG5ldyBEYXRlKCk7XG5cdGlmICghKHRoaXMuZnJvbSBpbnN0YW5jZW9mIERhdGUgJiYgdGhpcy50byBpbnN0YW5jZW9mIERhdGUpKSByZXR1cm47XG5cblx0dGhpcy5zZXQoKTtcbn1cblxuRWxhcHNlZC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oKSB7XG5cdHRoaXMuZWxhcHNlZFRpbWUgPSB0aGlzLnRvIC0gdGhpcy5mcm9tO1xuXG5cdHRoaXMubWlsbGlTZWNvbmRzID0gdGhpcy5lbGFwc2VkVGltZTtcblx0dmFyIGRpdmlkZXIgPSAxMDAwO1xuXHR0aGlzLnNlY29uZHMgPSB7IG51bTogTWF0aC5mbG9vcih0aGlzLmVsYXBzZWRUaW1lIC8gZGl2aWRlcikgfTtcblx0ZGl2aWRlciAqPSA2MDtcblx0dGhpcy5taW51dGVzID0geyBudW06IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIGRpdmlkZXIpIH07XG5cdGRpdmlkZXIgKj0gNjA7XG5cdHRoaXMuaG91cnMgPSB7IG51bTogTWF0aC5mbG9vcih0aGlzLmVsYXBzZWRUaW1lIC8gZGl2aWRlcikgfTtcblx0ZGl2aWRlciAqPSAyNDtcblx0dGhpcy5kYXlzID0geyBudW06IE1hdGguZmxvb3IodGhpcy5lbGFwc2VkVGltZSAvIGRpdmlkZXIpIH07XG5cdGRpdmlkZXIgKj0gNztcblx0dGhpcy53ZWVrcyA9IHsgbnVtOiBNYXRoLmZsb29yKHRoaXMuZWxhcHNlZFRpbWUgLyBkaXZpZGVyKSB9O1xuXHRkaXZpZGVyICo9ICgzMCAvIDcpO1xuXHR0aGlzLm1vbnRocyA9IHsgbnVtOiBNYXRoLmZsb29yKHRoaXMuZWxhcHNlZFRpbWUgLyBkaXZpZGVyKSB9O1xuXHRkaXZpZGVyID0gZGl2aWRlciAvICgzMCAvIDcpIC8gNyAqIDM2NTtcblx0dGhpcy55ZWFycyA9IHsgbnVtOiBNYXRoLmZsb29yKHRoaXMuZWxhcHNlZFRpbWUgLyBkaXZpZGVyKSB9O1xuXG5cdHRoaXMuc2Vjb25kcy50ZXh0ID0gdGhpcy5zZWNvbmRzLm51bSArICcgc2Vjb25kJyArICh0aGlzLnNlY29uZHMubnVtIDwgMiA/ICcnIDogJ3MnKTtcblx0dGhpcy5taW51dGVzLnRleHQgPSB0aGlzLm1pbnV0ZXMubnVtICsgJyBtaW51dGUnICsgKHRoaXMubWludXRlcy5udW0gPCAyID8gJycgOiAncycpO1xuXHR0aGlzLmhvdXJzLnRleHQgPSB0aGlzLmhvdXJzLm51bSArICcgaG91cicgKyAodGhpcy5ob3Vycy5udW0gPCAyID8gJycgOiAncycpO1xuXHR0aGlzLmRheXMudGV4dCA9IHRoaXMuZGF5cy5udW0gKyAnIGRheScgKyAodGhpcy5kYXlzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cdHRoaXMud2Vla3MudGV4dCA9IHRoaXMud2Vla3MubnVtICsgJyB3ZWVrJyArICh0aGlzLndlZWtzLm51bSA8IDIgPyAnJyA6ICdzJyk7XG5cdHRoaXMubW9udGhzLnRleHQgPSB0aGlzLm1vbnRocy5udW0gKyAnIG1vbnRoJyArICh0aGlzLm1vbnRocy5udW0gPCAyID8gJycgOiAncycpO1xuXHR0aGlzLnllYXJzLnRleHQgPSB0aGlzLnllYXJzLm51bSArICcgeWVhcicgKyAodGhpcy55ZWFycy5udW0gPCAyID8gJycgOiAncycpO1xuXG5cdGlmICh0aGlzLnllYXJzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMueWVhcnMudGV4dDtcblx0ZWxzZSBpZiAodGhpcy5tb250aHMubnVtID4gMCkgdGhpcy5vcHRpbWFsID0gdGhpcy5tb250aHMudGV4dDtcblx0ZWxzZSBpZiAodGhpcy53ZWVrcy5udW0gPiAwKSB0aGlzLm9wdGltYWwgPSB0aGlzLndlZWtzLnRleHQ7XG5cdGVsc2UgaWYgKHRoaXMuZGF5cy5udW0gPiAwKSB0aGlzLm9wdGltYWwgPSB0aGlzLmRheXMudGV4dDtcblx0ZWxzZSBpZiAodGhpcy5ob3Vycy5udW0gPiAwKSB0aGlzLm9wdGltYWwgPSB0aGlzLmhvdXJzLnRleHQ7XG5cdGVsc2UgaWYgKHRoaXMubWludXRlcy5udW0gPiAwKSB0aGlzLm9wdGltYWwgPSB0aGlzLm1pbnV0ZXMudGV4dDtcblx0ZWxzZSBpZiAodGhpcy5zZWNvbmRzLm51bSA+IDApIHRoaXMub3B0aW1hbCA9IHRoaXMuc2Vjb25kcy50ZXh0O1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuRWxhcHNlZC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKHRvKSB7XG5cdGlmICghdG8pIHRoaXMudG8gPSBuZXcgRGF0ZSgpO1xuXHRlbHNlIHRoaXMudG8gPSB0bztcblx0aWYgKCF0aGlzLnRvIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuO1xuXG5cdHJldHVybiB0aGlzLnNldCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGFwc2VkOyIsIihmdW5jdGlvbiAoYXJyKSB7XHJcblx0ZnVuY3Rpb24gaXNOdW1iZXIobikge1xyXG5cdFx0cmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKTtcdC8vdGh4IHRvIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTgwODIvdmFsaWRhdGUtbnVtYmVycy1pbi1qYXZhc2NyaXB0LWlzbnVtZXJpY1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogcmV0dXJucyBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gbG93IHRvIGhpZ2ggaW5jbHVkaW5nIGxvdyBhbmQgaGlnaFxyXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBsb3dcclxuXHQgKiBAcGFyYW0ge051bWJlcn0gaGlnaFxyXG5cdCAqIEByZXR1cm5zIHtBcnJheX1cclxuXHQgKi9cclxuXHRhcnIucmFuZ2UgPSBmdW5jdGlvbiAobG93LCBoaWdoKSB7XHJcblx0XHR2YXIgciA9IFtdO1xyXG5cdFx0aWYgKGlzTnVtYmVyKGxvdykgJiYgKGlzTnVtYmVyKGhpZ2gpKSkge1xyXG5cdFx0XHR3aGlsZShoaWdoID49IGxvdyl7XHJcblx0XHRcdFx0ci5wdXNoKGxvdyk7XHJcblx0XHRcdFx0bG93Kys7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiByO1xyXG5cdH07XHJcbiAgICB2YXIgYXJyUHJvdCA9IGFyci5wcm90b3R5cGU7XHJcblx0dmFyIHByb3BzID0ge1xyXG4gICAgICAgIGZpcnN0OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNFbXB0eSkgcmV0dXJuIHVuZGVmaW5lZDtcclxuXHRcdFx0XHRyZXR1cm4gdGhpc1swXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWzBdID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsYXN0OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0aWYgKHRoaXMuaXNFbXB0eSkgcmV0dXJuIHVuZGVmaW5lZDtcclxuXHRcdFx0XHRyZXR1cm4gdGhpc1t0aGlzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXSA9IHZhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFbXB0eToge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoID09PSAwO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IHVuZGVmaW5lZFxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIG1ldGhvZHMgPSB7XHJcblx0XHQvKipcclxuXHRcdCAqIHRyYXZlcnNlcyBhcnJheSBhbmQgcmV0dXJucyBmaXJzdCBlbGVtZW50IG9uIHdoaWNoIHRlc3QgZnVuY3Rpb24gcmV0dXJucyB0cnVlXHJcblx0XHQgKiBAcGFyYW0gdGVzdFxyXG5cdFx0ICogQHBhcmFtIHtCb29sZWFufSBmcm9tRW5kIHBhc3MgdHJ1ZSBpZiB5b3Ugd2FudCB0byB0cmF2ZXJzZSBhcnJheSBmcm9tIGVuZCB0byBiZWdpbm5pbmdcclxuXHRcdCAqIEByZXR1cm5zIHsqfG51bGx8dW5kZWZpbmVkfSBhbiBlbGVtZW50IG9mIGFuIGFycmF5LCBvciB1bmRlZmluZWQgd2hlbiBwYXNzZWQgcGFyYW0gaXMgbm90IGEgZnVuY3Rpb25cclxuXHRcdCAqL1xyXG5cdFx0ZmluZE9uZTogZnVuY3Rpb24gKHRlc3QsIGZyb21FbmQpIHtcclxuXHRcdFx0dmFyIGk7XHJcblx0XHRcdGlmICh0eXBlb2YgdGVzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHVuZGVmaW5lZDtcclxuXHRcdFx0aWYgKGZyb21FbmQpIHtcclxuXHRcdFx0XHRpID0gdGhpcy5sZW5ndGg7XHJcblx0XHRcdFx0d2hpbGUoaS0tKXtcclxuXHRcdFx0XHRcdGlmICh0ZXN0KHRoaXNbaV0sIGksIHRoaXMpKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzW2ldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpID0gMDtcclxuXHRcdFx0XHR3aGlsZShpIDwgdGhpcy5sZW5ndGgpe1xyXG5cdFx0XHRcdFx0aWYgKHRlc3QodGhpc1tpXSwgaSwgdGhpcykpIHtcclxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXNbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpKys7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fSxcclxuXHRcdC8qKlxyXG5cdFx0ICpcdHJlcGxhY2UgbWV0aG9kXHJcblx0XHQgKiBAcGFyYW0geyp9IHRvUmVwbGFjZVxyXG5cdFx0ICogQHBhcmFtIHsqfSBpdGVtV2l0aFxyXG5cdFx0ICogQHJldHVybnMge051bWJlcnxmYWxzZX0gaW5kZXggd2hlbiBpdGVtIHdhcyByZXBsYWNlZCwgZmFsc2Ugd2hlbiBub3RcclxuXHRcdCAqL1xyXG5cdFx0cmVwbGFjZTogZnVuY3Rpb24gKHRvUmVwbGFjZSwgaXRlbVdpdGgpIHtcclxuXHRcdFx0dmFyIGluZGV4ID0gdGhpcy5pbmRleE9mKHRvUmVwbGFjZSk7XHJcblx0XHRcdGlmICh+aW5kZXgpIHtcclxuXHRcdFx0XHR0aGlzW2luZGV4XSA9IGl0ZW1XaXRoO1xyXG5cdFx0XHRcdHJldHVybiBpbmRleDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvKipcclxuICAgICAgICAgKiBAcGFyYW0geyp9IHZhbFxyXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHdoZW4gaXRlbSBpcyBpbiB0aGUgYXJyYXlcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb250YWluczogZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCkgIT09IC0xO1xyXG4gICAgICAgIH0sXHJcblx0XHQvKipcclxuXHRcdCAqIFN5bnRheDpcclxuXHRcdCAqICBhcnJheS5pbnNlcnQoaW5kZXgsIHZhbHVlMSwgdmFsdWUyLCAuLi4sIHZhbHVlTilcclxuXHRcdCAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCB3aGVyZSBpdGVtIHdpbGwgYmUgaW5zZXJ0ZWQsIGlmIGJpZ2dlciB0aGFuIGxlbmd0aCBvZiBhbiBhcnJheSwgd2lsbCBiZSBpbnNlcnRlZCBhdCB0aGUgZW5kIG9mIGFuIGFycmF5LCBub3RcclxuXHRcdCAqIEBwYXJhbSBbLi4uXSB1bmxpbWl0ZWQgYW1vdW50IG9mIHZhbHVlcyB0byBpbnNlcnRcclxuXHRcdCAqIEByZXR1cm5zIHtBcnJheX1cclxuXHRcdCAqL1xyXG5cdFx0aW5zZXJ0OiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHRpbmRleCA9IE1hdGgubWluKGluZGV4LCB0aGlzLmxlbmd0aCk7XHJcblx0XHRcdGFyZ3VtZW50cy5sZW5ndGggPiAxXHJcblx0XHRcdFx0JiYgdGhpcy5zcGxpY2UuYXBwbHkodGhpcywgW2luZGV4LCAwXS5jb25jYXQoW10ucG9wLmNhbGwoYXJndW1lbnRzKSkpXHJcblx0XHRcdCAgICAmJiB0aGlzLmluc2VydC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdFx0XHRyZXR1cm4gdGhpcztcclxuXHRcdH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZmluZHMgYW5kIHJlbW92ZXMgdGhlIGl0ZW0gZnJvbSBhcnJheVxyXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXHJcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiBpdGVtIHdhcyByZW1vdmVkLCBlbHNlIGZhbHNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGV4T2YoaXRlbSk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHdpbGwgZXJhc2UgdGhlIGFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIH0sXHJcblx0XHQvKipcclxuICAgICAgICAgKiB3aWxsIHJldHVybiBhIGNvcHkgb2YgdGhlIGFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29weTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zbGljZSgwKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZvcih2YXIgcHJvcCBpbiBwcm9wcyl7XHJcbiAgICAgICAgaWYgKCFhcnJQcm90Lmhhc093blByb3BlcnR5KHByb3ApKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcnJQcm90LCBwcm9wLCB7XHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBzZXQ6IHByb3BzW3Byb3BdLnNldCxcclxuICAgICAgICAgICAgICAgIGdldDogcHJvcHNbcHJvcF0uZ2V0XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvcih2YXIgbSBpbiBtZXRob2RzKXtcclxuICAgICAgICBpZiAoIWFyclByb3QuaGFzT3duUHJvcGVydHkobSkpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFyclByb3QsIG0sIHtcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBtZXRob2RzW21dLFxyXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkoQXJyYXkpOyIsIlxuXG5cbi8qXG4qIEB2ZXJzaW9uICAwLjUuMFxuKiBAYXV0aG9yICAgTGF1cmkgUm9vZGVuIC0gaHR0cHM6Ly9naXRodWIuY29tL2xpdGVqcy9kYXRlLWZvcm1hdC1saXRlXG4qIEBsaWNlbnNlICBNSVQgTGljZW5zZSAgLSBodHRwOi8vbGF1cmkucm9vZGVuLmVlL21pdC1saWNlbnNlLnR4dFxuKi9cblxuXG5cbiFmdW5jdGlvbihEYXRlLCBwcm90bykge1xuXHR2YXIgbWFza1JlID0gLyhbXCInXSkoKD86W15cXFxcXXxcXFxcLikqPylcXDF8WVlZWXwoW01EXSlcXDNcXDMoXFwzPyl8U1N8KFtZTURIaG1zV10pKFxcNT8pfFt1VUFaU3dvXS9nXG5cdCwgeWVhckZpcnN0UmUgPSAvKFxcZHs0fSlbLS5cXC9dKFxcZFxcZD8pWy0uXFwvXShcXGRcXGQ/KS9cblx0LCBkYXRlRmlyc3RSZSA9IC8oXFxkXFxkPylbLS5cXC9dKFxcZFxcZD8pWy0uXFwvXShcXGR7NH0pL1xuXHQsIHRpbWVSZSA9IC8oXFxkXFxkPyk6KFxcZFxcZCk6PyhcXGRcXGQpP1xcLj8oXFxkezN9KT8oPzpcXHMqKD86KGEpfChwKSlcXC4/bVxcLj8pPyhcXHMqKD86WnxHTVR8VVRDKT8oPzooWy0rXVxcZFxcZCk6PyhcXGRcXGQpPyk/KT8vaVxuXHQsIHdvcmRSZSA9IC8uW2Etel0rL2dcblx0LCB1bmVzY2FwZVJlID0gL1xcXFwoLikvZ1xuXHQvLywgaXNvRGF0ZVJlID0gLyhcXGR7NH0pWy0uXFwvXVcoXFxkXFxkPylbLS5cXC9dKFxcZCkvXG5cdFxuXG5cdC8vIElTTyA4NjAxIHNwZWNpZmllcyBudW1lcmljIHJlcHJlc2VudGF0aW9ucyBvZiBkYXRlIGFuZCB0aW1lLlxuXHQvL1xuXHQvLyBUaGUgaW50ZXJuYXRpb25hbCBzdGFuZGFyZCBkYXRlIG5vdGF0aW9uIGlzXG5cdC8vIFlZWVktTU0tRERcblx0Ly9cblx0Ly8gVGhlIGludGVybmF0aW9uYWwgc3RhbmRhcmQgbm90YXRpb24gZm9yIHRoZSB0aW1lIG9mIGRheSBpc1xuXHQvLyBoaDptbTpzc1xuXHQvL1xuXHQvLyBUaW1lIHpvbmVcblx0Ly9cblx0Ly8gVGhlIHN0cmluZ3MgK2hoOm1tLCAraGhtbSwgb3IgK2hoIChhaGVhZCBvZiBVVEMpXG5cdC8vIC1oaDptbSwgLWhobW0sIG9yIC1oaCAodGltZSB6b25lcyB3ZXN0IG9mIHRoZSB6ZXJvIG1lcmlkaWFuLCB3aGljaCBhcmUgYmVoaW5kIFVUQylcblx0Ly9cblx0Ly8gMTI6MDBaID0gMTM6MDArMDE6MDAgPSAwNzAwLTA1MDBcblx0XG5cdERhdGVbcHJvdG9dLmZvcm1hdCA9IGZ1bmN0aW9uKG1hc2spIHtcblx0XHRtYXNrID0gRGF0ZS5tYXNrc1ttYXNrXSB8fCBtYXNrIHx8IERhdGUubWFza3NbXCJkZWZhdWx0XCJdXG5cblx0XHR2YXIgc2VsZiA9IHRoaXNcblx0XHQsIGdldCA9IFwiZ2V0XCIgKyAobWFzay5zbGljZSgwLDQpID09IFwiVVRDOlwiID8gKG1hc2s9bWFzay5zbGljZSg0KSwgXCJVVENcIik6XCJcIilcblxuXHRcdHJldHVybiBtYXNrLnJlcGxhY2UobWFza1JlLCBmdW5jdGlvbihtYXRjaCwgcXVvdGUsIHRleHQsIE1ELCBNRDQsIHNpbmdsZSwgcGFkKSB7XG5cdFx0XHR0ZXh0ID0gc2luZ2xlID09IFwiWVwiICAgPyBzZWxmW2dldCArIFwiRnVsbFllYXJcIl0oKSAlIDEwMFxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIllZWVlcIiA/IHNlbGZbZ2V0ICsgXCJGdWxsWWVhclwiXSgpXG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcIk1cIiAgID8gc2VsZltnZXQgKyBcIk1vbnRoXCJdKCkrMVxuXHRcdFx0XHQgOiBNRCAgICAgPT0gXCJNXCIgPyBEYXRlLm1vbnRoTmFtZXNbIHNlbGZbZ2V0ICsgXCJNb250aFwiXSgpKyhNRDQgPyAxMiA6IDApIF1cblx0XHRcdFx0IDogc2luZ2xlID09IFwiRFwiICAgPyBzZWxmW2dldCArIFwiRGF0ZVwiXSgpXG5cdFx0XHRcdCA6IE1EICAgICA9PSBcIkRcIiA/IERhdGUuZGF5TmFtZXNbIHNlbGZbZ2V0ICsgXCJEYXlcIl0oKSArIChNRDQgPyA3OjAgKSBdXG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcIkhcIiAgID8gc2VsZltnZXQgKyBcIkhvdXJzXCJdKCkgJSAxMiB8fCAxMlxuXHRcdFx0XHQgOiBzaW5nbGUgPT0gXCJoXCIgICA/IHNlbGZbZ2V0ICsgXCJIb3Vyc1wiXSgpXG5cdFx0XHRcdCA6IHNpbmdsZSA9PSBcIm1cIiAgID8gc2VsZltnZXQgKyBcIk1pbnV0ZXNcIl0oKVxuXHRcdFx0XHQgOiBzaW5nbGUgPT0gXCJzXCIgICA/IHNlbGZbZ2V0ICsgXCJTZWNvbmRzXCJdKClcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJTXCIgICAgPyBzZWxmW2dldCArIFwiTWlsbGlzZWNvbmRzXCJdKClcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJTU1wiICAgPyAocXVvdGUgPSBzZWxmW2dldCArIFwiTWlsbGlzZWNvbmRzXCJdKCksIHF1b3RlID4gOTkgPyBxdW90ZSA6IChxdW90ZSA+IDkgPyBcIjBcIiA6IFwiMDBcIiApICsgcXVvdGUpXG5cdFx0XHRcdCA6IG1hdGNoID09IFwidVwiICAgID8gKHNlbGYvMTAwMCk+Pj4wXG5cdFx0XHRcdCA6IG1hdGNoID09IFwiVVwiICAgID8gK3NlbGZcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJBXCIgICAgPyBEYXRlW3NlbGZbZ2V0ICsgXCJIb3Vyc1wiXSgpID4gMTEgPyBcInBtXCIgOiBcImFtXCJdXG5cdFx0XHRcdCA6IG1hdGNoID09IFwiWlwiICAgID8gXCJHTVQgXCIgKyAoLXNlbGYuZ2V0VGltZXpvbmVPZmZzZXQoKS82MClcblx0XHRcdFx0IDogbWF0Y2ggPT0gXCJ3XCIgICAgPyBzZWxmW2dldCArIFwiRGF5XCJdKCkgfHwgN1xuXHRcdFx0XHQgOiBzaW5nbGUgPT0gXCJXXCIgICA/IChxdW90ZSA9IG5ldyBEYXRlKCtzZWxmICsgKCg0IC0gKHNlbGZbZ2V0ICsgXCJEYXlcIl0oKXx8NykpICogODY0MDAwMDApKSwgTWF0aC5jZWlsKCgocXVvdGUuZ2V0VGltZSgpLXF1b3RlW1wic1wiICsgZ2V0LnNsaWNlKDEpICsgXCJNb250aFwiXSgwLDEpKSAvIDg2NDAwMDAwICsgMSApIC8gNykgKVxuXHRcdFx0XHQgOiBtYXRjaCA9PSBcIm9cIiAgICA/IG5ldyBEYXRlKCtzZWxmICsgKCg0IC0gKHNlbGZbZ2V0ICsgXCJEYXlcIl0oKXx8NykpICogODY0MDAwMDApKVtnZXQgKyBcIkZ1bGxZZWFyXCJdKClcblx0XHRcdFx0IDogcXVvdGUgICAgICAgICAgID8gdGV4dC5yZXBsYWNlKHVuZXNjYXBlUmUsIFwiJDFcIilcblx0XHRcdFx0IDogbWF0Y2hcblx0XHRcdHJldHVybiBwYWQgJiYgdGV4dCA8IDEwID8gXCIwXCIrdGV4dCA6IHRleHRcblx0XHR9KVxuXHR9XG5cblx0RGF0ZS5hbSA9IFwiQU1cIlxuXHREYXRlLnBtID0gXCJQTVwiXG5cblx0RGF0ZS5tYXNrcyA9IHtcImRlZmF1bHRcIjpcIkRERCBNTU0gREQgWVlZWSBoaDptbTpzc1wiLFwiaXNvVXRjRGF0ZVRpbWVcIjonVVRDOllZWVktTU0tRERcIlRcImhoOm1tOnNzXCJaXCInfVxuXHREYXRlLm1vbnRoTmFtZXMgPSBcIkphbkZlYk1hckFwck1heUp1bkp1bEF1Z1NlcE9jdE5vdkRlY0phbnVhcnlGZWJydWFyeU1hcmNoQXByaWxNYXlKdW5lSnVseUF1Z3VzdFNlcHRlbWJlck9jdG9iZXJOb3ZlbWJlckRlY2VtYmVyXCIubWF0Y2god29yZFJlKVxuXHREYXRlLmRheU5hbWVzID0gXCJTdW5Nb25UdWVXZWRUaHVGcmlTYXRTdW5kYXlNb25kYXlUdWVzZGF5V2VkbmVzZGF5VGh1cnNkYXlGcmlkYXlTYXR1cmRheVwiLm1hdGNoKHdvcmRSZSlcblxuXHQvLyovXG5cblxuXHQvKlxuXHQqIC8vIEluIENocm9tZSBEYXRlLnBhcnNlKFwiMDEuMDIuMjAwMVwiKSBpcyBKYW5cblx0KiBuID0gK3NlbGYgfHwgRGF0ZS5wYXJzZShzZWxmKSB8fCBcIlwiK3NlbGY7XG5cdCovXG5cblx0U3RyaW5nW3Byb3RvXS5kYXRlID0gTnVtYmVyW3Byb3RvXS5kYXRlID0gZnVuY3Rpb24oZm9ybWF0KSB7XG5cdFx0dmFyIG0sIHRlbXBcblx0XHQsIGQgPSBuZXcgRGF0ZVxuXHRcdCwgbiA9ICt0aGlzIHx8IFwiXCIrdGhpc1xuXG5cdFx0aWYgKGlzTmFOKG4pKSB7XG5cdFx0XHQvLyBCaWcgZW5kaWFuIGRhdGUsIHN0YXJ0aW5nIHdpdGggdGhlIHllYXIsIGVnLiAyMDExLTAxLTMxXG5cdFx0XHRpZiAobSA9IG4ubWF0Y2goeWVhckZpcnN0UmUpKSBkLnNldEZ1bGxZZWFyKG1bMV0sIG1bMl0tMSwgbVszXSlcblxuXHRcdFx0ZWxzZSBpZiAobSA9IG4ubWF0Y2goZGF0ZUZpcnN0UmUpKSB7XG5cdFx0XHRcdC8vIE1pZGRsZSBlbmRpYW4gZGF0ZSwgc3RhcnRpbmcgd2l0aCB0aGUgbW9udGgsIGVnLiAwMS8zMS8yMDExXG5cdFx0XHRcdC8vIExpdHRsZSBlbmRpYW4gZGF0ZSwgc3RhcnRpbmcgd2l0aCB0aGUgZGF5LCBlZy4gMzEuMDEuMjAxMVxuXHRcdFx0XHR0ZW1wID0gRGF0ZS5taWRkbGVfZW5kaWFuID8gMSA6IDJcblx0XHRcdFx0ZC5zZXRGdWxsWWVhcihtWzNdLCBtW3RlbXBdLTEsIG1bMy10ZW1wXSlcblx0XHRcdH1cblxuXHRcdFx0Ly8gVGltZVxuXHRcdFx0bSA9IG4ubWF0Y2godGltZVJlKSB8fCBbMCwgMCwgMF1cblx0XHRcdGQuc2V0SG91cnMoIG1bNl0gJiYgbVsxXSA8IDEyID8gK21bMV0rMTIgOiBtWzVdICYmIG1bMV0gPT0gMTIgPyAwIDogbVsxXSwgbVsyXSwgbVszXXwwLCBtWzRdfDApXG5cdFx0XHQvLyBUaW1lem9uZVxuXHRcdFx0aWYgKG1bN10pIHtcblx0XHRcdFx0ZC5zZXRUaW1lKGQtKChkLmdldFRpbWV6b25lT2Zmc2V0KCkgKyAobVs4XXwwKSo2MCArICgobVs4XTwwPy0xOjEpKihtWzldfDApKSkqNjAwMDApKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBkLnNldFRpbWUoIG4gPCA0Mjk0OTY3Mjk2ID8gbiAqIDEwMDAgOiBuIClcblx0XHRyZXR1cm4gZm9ybWF0ID8gZC5mb3JtYXQoZm9ybWF0KSA6IGRcblx0fVxuXG59KERhdGUsIFwicHJvdG90eXBlXCIpXG5cblxuXG5cbiIsInZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcblx0aWYgKCFvYmogfHwgdG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJyB8fCBvYmoubm9kZVR5cGUgfHwgb2JqLnNldEludGVydmFsKVxuXHRcdHJldHVybiBmYWxzZTtcblxuXHR2YXIgaGFzX293bl9jb25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNfaXNfcHJvcGVydHlfb2ZfbWV0aG9kID0gaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNfb3duX2NvbnN0cnVjdG9yICYmICFoYXNfaXNfcHJvcGVydHlfb2ZfbWV0aG9kKVxuXHRcdHJldHVybiBmYWxzZTtcblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoIGtleSBpbiBvYmogKSB7fVxuXG5cdHJldHVybiBrZXkgPT09IHVuZGVmaW5lZCB8fCBoYXNPd24uY2FsbCggb2JqLCBrZXkgKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmUsXG5cdCAgICB0YXJnZXQgPSBhcmd1bWVudHNbMF0gfHwge30sXG5cdCAgICBpID0gMSxcblx0ICAgIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsXG5cdCAgICBkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAoIHR5cGVvZiB0YXJnZXQgPT09IFwiYm9vbGVhblwiICkge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fVxuXG5cdC8vIEhhbmRsZSBjYXNlIHdoZW4gdGFyZ2V0IGlzIGEgc3RyaW5nIG9yIHNvbWV0aGluZyAocG9zc2libGUgaW4gZGVlcCBjb3B5KVxuXHRpZiAoIHR5cGVvZiB0YXJnZXQgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHRhcmdldCAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKCA7IGkgPCBsZW5ndGg7IGkrKyApIHtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKCAob3B0aW9ucyA9IGFyZ3VtZW50c1sgaSBdKSAhPSBudWxsICkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yICggbmFtZSBpbiBvcHRpb25zICkge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbIG5hbWUgXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbIG5hbWUgXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICggdGFyZ2V0ID09PSBjb3B5ICkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdGlmICggZGVlcCAmJiBjb3B5ICYmICggaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGNvcHkpKSApICkge1xuXHRcdFx0XHRcdGlmICggY29weUlzQXJyYXkgKSB7XG5cdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgQXJyYXkuaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0dGFyZ2V0WyBuYW1lIF0gPSBleHRlbmQoIGRlZXAsIGNsb25lLCBjb3B5ICk7XG5cblx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBjb3B5ICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dGFyZ2V0WyBuYW1lIF0gPSBjb3B5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG7vu78vLy8vRm9yIHBlcmZvcm1hbmNlIHRlc3RzIHBsZWFzZSBzZWU6IGh0dHA6Ly9qc3BlcmYuY29tL2pzLWluaGVyaXRhbmNlLXBlcmZvcm1hbmNlLzM0ICsgaHR0cDovL2pzcGVyZi5jb20vanMtaW5oZXJpdGFuY2UtcGVyZm9ybWFuY2UvMzUgKyBodHRwOi8vanNwZXJmLmNvbS9qcy1pbmhlcml0YW5jZS1wZXJmb3JtYW5jZS8zNlxyXG5cclxuKGZ1bmN0aW9uIHNlbGZDYWxsKCkge1xyXG5cdHZhciBpc05vZGUgPSB0eXBlb2YgZ2xvYmFsICE9IFwidW5kZWZpbmVkXCI7XHJcblx0aWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xyXG5cdFx0dmFyIHJlZ2V4ZXMgPSB7fTtcclxuXHRcdFN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gZm9ybWF0KHBhcmFtZXRlcnMpIHtcclxuXHRcdFx0Ly8vIDxzdW1tYXJ5PkVxdWl2YWxlbnQgdG8gQyMgU3RyaW5nLkZvcm1hdCBmdW5jdGlvbjwvc3VtbWFyeT5cclxuXHRcdFx0Ly8vIDxwYXJhbSBuYW1lPVwicGFyYW1ldGVyc1wiIHR5cGU9XCJPYmplY3RcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5Qcm92aWRlIHRoZSBtYXRjaGluZyBhcmd1bWVudHMgZm9yIHRoZSBmb3JtYXQgaS5lIHswfSwgezF9IGV0Yy48L3BhcmFtPlxyXG5cclxuXHRcdFx0Zm9yICh2YXIgZm9ybWF0TWVzc2FnZSA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHMsIGkgPSBhcmdzLmxlbmd0aDsgLS1pID49IDA7KVxyXG5cdFx0XHRcdGZvcm1hdE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlLnJlcGxhY2UocmVnZXhlc1tpXSB8fCAocmVnZXhlc1tpXSA9IFJlZ0V4cChcIlxcXFx7XCIgKyAoaSkgKyBcIlxcXFx9XCIsIFwiZ21cIikpLCBhcmdzW2ldKTtcclxuXHRcdFx0cmV0dXJuIGZvcm1hdE1lc3NhZ2U7XHJcblx0XHR9O1xyXG5cdFx0aWYgKCFTdHJpbmcuZm9ybWF0KSB7XHJcblx0XHRcdFN0cmluZy5mb3JtYXQgPSBmdW5jdGlvbiBmb3JtYXQoZm9ybWF0TWVzc2FnZSwgcGFyYW1zKSB7XHJcblx0XHRcdFx0Ly8vIDxzdW1tYXJ5PkVxdWl2YWxlbnQgdG8gQyMgU3RyaW5nLkZvcm1hdCBmdW5jdGlvbjwvc3VtbWFyeT5cclxuXHRcdFx0XHQvLy8gPHBhcmFtIG5hbWU9XCJmb3JtYXRNZXNzYWdlXCIgdHlwZT1cInN0cmluZ1wiPlRoZSBtZXNzYWdlIHRvIGJlIGZvcm1hdHRlZC4gSXQgc2hvdWxkIGNvbnRhaW4gezB9LCB7MX0gZXRjLiBmb3IgYWxsIHRoZSBnaXZlbiBwYXJhbXM8L3BhcmFtPlxyXG5cdFx0XHRcdC8vLyA8cGFyYW0gbmFtZT1cInBhcmFtc1wiIHR5cGU9XCJPYmplY3RcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5Qcm92aWRlIHRoZSBtYXRjaGluZyBhcmd1bWVudHMgZm9yIHRoZSBmb3JtYXQgaS5lIHswfSwgezF9IGV0Yy48L3BhcmFtPlxyXG5cdFx0XHRcdGZvciAodmFyIGFyZ3MgPSBhcmd1bWVudHMsIGkgPSBhcmdzLmxlbmd0aDsgLS1pOylcclxuXHRcdFx0XHRcdGZvcm1hdE1lc3NhZ2UgPSBmb3JtYXRNZXNzYWdlLnJlcGxhY2UocmVnZXhlc1tpIC0gMV0gfHwgKHJlZ2V4ZXNbaSAtIDFdID0gUmVnRXhwKFwiXFxcXHtcIiArIChpIC0gMSkgKyBcIlxcXFx9XCIsIFwiZ21cIikpLCBhcmdzW2ldKTtcclxuXHRcdFx0XHRyZXR1cm4gZm9ybWF0TWVzc2FnZTtcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHR9XHJcblx0Ly8vI0RFQlVHXHJcblx0aWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIilcclxuXHRcdHdpbmRvdy5XQXNzZXJ0ID0gV0Fzc2VydDtcclxuXHRmdW5jdGlvbiBXQXNzZXJ0KHRydWVpc2hDb25kaXRpb24sIG1lc3NhZ2UsIGFyZzEsIGFyZzIsIGFyZ0V0Yykge1xyXG5cdFx0Ly8vIDxzdW1tYXJ5PlJldHVybnMgYW4gYGFzc2VydCBmdW5jdGlvbmAgaWYgdGhlIGNvbmRpdGlvbiBpcyBmYWxzZSBhbiBhIGBub29wIGZ1bmN0aW9uYCAoYSBmdW5jdGlvbiB3aGljaCBkb2VzIG5vdGhpbmcpIGlmIHRoZSBjb25kaXRpb24gaXMgdHJ1ZS4gPGJyLz5cclxuXHRcdC8vLyAgV0Fzc2VydHMgd2lsbCBub3QgYmUgaW5jbHVkZWQgaW4gcHJvZHVjdGlvbiBjb2RlIGluIGFueXdheXMsIGhlbmNlIHRoZSBtaW5pZmllciB3aWxsIHJlbW92ZSBhbGwgdGhlIFdBc3NlcnQgY2FsbHM8YnIvPjxici8+XHJcblx0XHQvLy8gIFlvdSBhbHdheXMgbmVlZCB0byBjYWxsIHRoZSBXQXNzZXJ0IGZ1bmN0aW9uIHR3aWNlIHNpbmNlIHRoZSBmaXJzdCBjYWxsIGFsd2F5cyByZXR1cm5zIGEgZnVuY3Rpb24gaS5lLiBXQXNzZXJ0KGZhbHNlLCBcInswfSBmYWlsZWRcIiwgXCJDb25kaXRpb25cIikoKVxyXG5cdFx0Ly8vIDwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cInRydWVpc2hDb25kaXRpb25cIiB0eXBlPVwiQm9vbGVhblwiPlRoZSBjb25kaXRpb24gdG8gYmUgdGVzdGVkLiBJdCBzaG91bGQgYmUgdHJ1ZSBzbyBub3RoaW5nIGhhcHBlbnMsIG9yIGZhbHNlIHRvIGFzc2VydCB0aGUgZXJyb3IgbWVzc2FnZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtZXNzYWdlXCIgdHlwZT1cIlN0cmluZyB8fCBGdW5jdGlvblwiPlRoZSBtZXNzYWdlIHRvIGJlIGFzc2VydGVkLiBJZiBwYXNzZWQgYSBmdW5jdGlvbiBpdCB3aWxsIGJlIGV2YWx1YXRlZCBhbGwgdGhlIHRpbWVzLCByZWdhcmRsZXNzIG9mIHRoZSBjb25kaXRpb248L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwiYXJnMVwiIHR5cGU9XCJPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIj5GaXJzdCBhcmd1bWVudCB0byByZXBsYWNlIGFsbCBvZiB0aGUgezB9IG9jY3VyZW5jZXMgZnJvbSB0aGUgbWVzc2FnZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJhcmcyXCIgdHlwZT1cIk9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiPlNlY29uZCBhcmd1bWVudCB0byByZXBsYWNlIGFsbCBvZiB0aGUgezF9IG9jY3VyZW5jZXMgZnJvbSB0aGUgbWVzc2FnZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJhcmdFdGNcIiB0eXBlPVwiT2JqZWN0XCIgb3B0aW9uYWw9XCJ0cnVlXCIgcGFyYW1ldGVyQXJyYXk9XCJ0cnVlXCI+VGhpcmQgYXJndW1lbnQgdG8gcmVwbGFjZSBhbGwgb2YgdGhlIHszfSBvY2N1cmVuY2VzIGZyb20gdGhlIG1lc3NhZ2UuPGJyLz4gWW91IGNhbiBhZGQgYXMgbWFueSBhcmd1bWVudHMgYXMgeW91IHdhbnQgYW5kIHRoZXkgd2lsbCBiZSByZXBsYWNlZCBhY2NvcmRpbmdseTwvcGFyYW0+XHJcblx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBcIlwiO1xyXG5cdFx0aWYgKHR5cGVvZiB0cnVlaXNoQ29uZGl0aW9uID09PSBcImZ1bmN0aW9uXCIgPyAhdHJ1ZWlzaENvbmRpdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogIXRydWVpc2hDb25kaXRpb24pIHtcclxuXHRcdFx0dmFyIHBhcmFtZXRlcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xyXG5cdFx0XHR2YXIgbXNnID0gdHlwZW9mIG1lc3NhZ2UgPT0gXCJzdHJpbmdcIiA/IFN0cmluZy5mb3JtYXQuYXBwbHkobWVzc2FnZSwgcGFyYW1ldGVycykgOiBtZXNzYWdlO1xyXG5cdFx0XHRyZXR1cm4gdHlwZW9mIGNvbnNvbGUgIT0gXCJ1bmRlZmluZWRcIiAmJiAhY29uc29sZS5fX3Rocm93RXJyb3JPbkFzc2VydCAmJiBjb25zb2xlLmFzc2VydCAmJiBjb25zb2xlLmFzc2VydC5iaW5kICYmIGNvbnNvbGUuYXNzZXJ0LmJpbmQoY29uc29sZSwgdHJ1ZWlzaENvbmRpdGlvbiwgbXNnKSB8fCBmdW5jdGlvbiBjb25zb2xlQXNzZXJ0VGhyb3coKSB7IHRocm93IG1zZzsgfTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBfXztcclxuXHR9O1xyXG5cdC8vLyNFTkRERUJVR1xyXG5cclxuXHR2YXIgRnVuY3Rpb25fcHJvdG90eXBlID0gRnVuY3Rpb24ucHJvdG90eXBlO1xyXG5cdHZhciBBcnJheV9wcm90b3R5cGUgPSBBcnJheS5wcm90b3R5cGU7XHJcblx0dmFyIEFycmF5X3Byb3RvdHlwZV9mb3JFYWNoID0gQXJyYXlfcHJvdG90eXBlLmZvckVhY2g7XHJcblx0dmFyIE9iamVjdF9kZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcclxuXHR2YXIgT2JqZWN0X2RlZmluZVByb3BlcnRpZXMgPSB0eXBlb2YgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgPT09IFwiZnVuY3Rpb25cIlxyXG5cdHZhciBzdXBwb3J0c1Byb3RvID0ge307XHJcblxyXG5cdHN1cHBvcnRzUHJvdG8gPSBzdXBwb3J0c1Byb3RvLl9fcHJvdG9fXyA9PT0gT2JqZWN0LnByb3RvdHlwZTtcclxuXHRpZiAoc3VwcG9ydHNQcm90bykge1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0c3VwcG9ydHNQcm90byA9IHt9O1xyXG5cdFx0XHRzdXBwb3J0c1Byb3RvLl9fcHJvdG9fXyA9IHsgT2JqZWN0OiAxIH07XHJcblx0XHRcdHN1cHBvcnRzUHJvdG8gPSBzdXBwb3J0c1Byb3RvLk9iamVjdCA9PT0gMTsvL3NldHRpbmcgX19wcm90b19fIGluIGZpcmVmb3ggaXMgdGVycmlibHkgc2xvdyFcclxuXHRcdH0gY2F0Y2ggKGV4KSB7IHN1cHBvcnRzUHJvdG8gPSBmYWxzZTsgfVxyXG5cdH1cclxuXHQvKiBJRTggYW5kIG9sZGVyIGhhY2shICovXHJcblx0aWYgKHR5cGVvZiBPYmplY3QuZ2V0UHJvdG90eXBlT2YgIT09IFwiZnVuY3Rpb25cIilcclxuXHRcdE9iamVjdC5nZXRQcm90b3R5cGVPZiA9IHN1cHBvcnRzUHJvdG9cclxuXHRcdFx0PyBmdW5jdGlvbiBnZXRfX3Byb3RvX18ob2JqZWN0KSB7XHJcblx0XHRcdFx0cmV0dXJuIG9iamVjdC5fX3Byb3RvX187XHJcblx0XHRcdH1cclxuXHRcdFx0OiBmdW5jdGlvbiBnZXRDb25zdHJ1Y3RvckhhY2sob2JqZWN0KSB7XHJcblx0XHRcdFx0Ly8gTWF5IGJyZWFrIGlmIHRoZSBjb25zdHJ1Y3RvciBoYXMgYmVlbiB0YW1wZXJlZCB3aXRoXHJcblx0XHRcdFx0cmV0dXJuIG9iamVjdCA9PSBudWxsIHx8ICFvYmplY3QuY29uc3RydWN0b3IgfHwgb2JqZWN0ID09PSBPYmplY3QucHJvdG90eXBlID8gbnVsbCA6XHJcblx0XHRcdFx0XHQob2JqZWN0LmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gb2JqZWN0ID9cclxuXHRcdFx0XHRcdE9iamVjdC5wcm90b3R5cGVcclxuXHRcdFx0XHRcdDogb2JqZWN0LmNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XHJcblx0XHRcdH07XHJcblx0ZnVuY3Rpb24gX18oKSB7IH07XHJcblx0Ly9mb3IgYW5jaWVudCBicm93c2VycyAtIHBvbHlmaWxsIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoXHJcblx0aWYgKCFBcnJheV9wcm90b3R5cGVfZm9yRWFjaCkge1xyXG5cdFx0QXJyYXlfcHJvdG90eXBlLmZvckVhY2ggPSBBcnJheV9wcm90b3R5cGVfZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4sIHNjb3BlKSB7XHJcblx0XHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcblx0XHRcdFx0Zm4uY2FsbChzY29wZSB8fCB0aGlzLCB0aGlzW2ldLCBpLCB0aGlzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0RnVuY3Rpb25fcHJvdG90eXBlLmZhc3RDbGFzcyA9IGZ1bmN0aW9uIGZhc3RDbGFzcyhjcmVhdG9yLCBtaXhpbnMpIHtcclxuXHRcdC8vLyA8c2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzdW1tYXJ5PkluaGVyaXRzIHRoZSBmdW5jdGlvbidzIHByb3RvdHlwZSB0byBhIG5ldyBmdW5jdGlvbiBuYW1lZCBjb25zdHJ1Y3RvciByZXR1cm5lZCBieSB0aGUgY3JlYXRvciBwYXJhbWV0ZXJcclxuXHRcdC8vLzxici8+PGJyLz5cclxuXHRcdC8vLyB2YXIgU3F1YXJlID0gRmlndXJlLmZhc3RDbGFzcyhmdW5jdGlvbihiYXNlLCBiYXNlQ3RvcikgeyA8YnIvPlxyXG5cdFx0Ly8vIF9fXyB0aGlzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24obmFtZSkgeyAvL3RoZSBjb3NudHJ1Y3RvciBjYW4gYmUgb3B0aW9uYWwgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gYmFzZUN0b3IuY2FsbCh0aGlzLCBuYW1lKTsgLy9jYWxsIHRoZSBiYXNlQ3RvciA8YnIvPlxyXG5cdFx0Ly8vIF9fXyB9Ozxici8+XHJcblx0XHQvLy8gX19fIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkgeyAgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gcmV0dXJuIGJhc2UuY2FsbCh0aGlzLCBcInNxdWFyZVwiKTsgLy9jYWxsIHRoZSBiYXNlIGNsYXNzIHByb3RvdHlwZSdzIG1ldGhvZDxici8+XHJcblx0XHQvLy8gX19fIH07PGJyLz5cclxuXHRcdC8vLyB9KTsgLy8geW91IGNhbiBzcGVjaWZ5IGFueSBtaXhpbnMgaGVyZTxici8+XHJcblx0XHQvLy88L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjcmVhdG9yXCIgdHlwZT1cIkZ1bmN0aW9uXCI+ZnVuY3Rpb24oYmFzZSwgYmFzZUN0b3IpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKCkgey4ufTsgdGhpcy5tZXRob2QxID0gZnVuY3Rpb24oKSB7Li4ufS4uLiB9PGJyLz53aGVyZSBiYXNlIGlzIEJhc2VDbGFzcy5wcm90b3R5cGUgYW5kIGJhc2VDdG9yIGlzIEJhc2VDbGFzcyAtIGFrYSB0aGUgZnVuY3Rpb24geW91IGFyZSBjYWxsaW5nIC5mYXN0Q2xhc3Mgb248L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIGRlcnJpdmVkIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDwvc2lnbmF0dXJlPlxyXG5cclxuXHRcdC8vdGhpcyA9PSBjb25zdHJ1Y3RvciBvZiB0aGUgYmFzZSBcIkNsYXNzXCJcclxuXHRcdHZhciBiYXNlQ2xhc3MgPSB0aGlzO1xyXG5cdFx0dmFyIGJhc2UgPSB0aGlzLnByb3RvdHlwZTtcclxuXHRcdGNyZWF0b3IgPSBjcmVhdG9yIHx8IGZ1bmN0aW9uIGZhc3RDbGFzc0NyZWF0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBmdW5jdGlvbiBmYXN0Q2xhc3NDdG9yKCkgeyBiYXNlQ2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSB9O1xyXG5cdFx0Y3JlYXRvci5wcm90b3R5cGUgPSBiYXNlO1xyXG5cclxuXHRcdC8vY3JlYXRpbmcgdGhlIGRlcnJpdmVkIGNsYXNzJyBwcm90b3R5cGVcclxuXHRcdHZhciBkZXJyaXZlZFByb3JvdHlwZSA9IG5ldyBjcmVhdG9yKGJhc2UsIHRoaXMpO1xyXG5cdFx0dmFyIERlcnJpdmVkO1xyXG5cdFx0Ly9kaWQgeW91IGZvcmdldCBvciBub3QgaW50ZW5kIHRvIGFkZCBhIGNvbnN0cnVjdG9yPyBXZSdsbCBhZGQgb25lIGZvciB5b3VcclxuXHRcdGlmICghZGVycml2ZWRQcm9yb3R5cGUuaGFzT3duUHJvcGVydHkoXCJjb25zdHJ1Y3RvclwiKSlcclxuXHRcdFx0ZGVycml2ZWRQcm9yb3R5cGUuY29uc3RydWN0b3IgPSBmdW5jdGlvbiBmYXN0Q2xhc3NEZWZhdWx0Q29uc3RydWN0b3IoKSB7IGJhc2VDbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9XHJcblx0XHREZXJyaXZlZCA9IGRlcnJpdmVkUHJvcm90eXBlLmNvbnN0cnVjdG9yO1xyXG5cdFx0Ly9zZXR0aW5nIHRoZSBkZXJyaXZlZFByb3RvdHlwZSB0byBjb25zdHJ1Y3RvcidzIHByb3RvdHlwZVxyXG5cdFx0RGVycml2ZWQucHJvdG90eXBlID0gZGVycml2ZWRQcm9yb3R5cGU7XHJcblxyXG5cdFx0V0Fzc2VydChmYWxzZSwgIWlzTm9kZSAmJiB3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGZ1bmN0aW9uIFdBc3NlcnRSZWRpcmVjdERlZmluaXRpb24oKSB7XHJcblx0XHRcdC8vdHJpZ2dlciBpbnRlbGxpc2Vuc2Ugb24gVlMyMDEyIHdoZW4gcHJlc3NpbmcgRjEyIChnbyB0byByZWZlcmVuY2UpIHRvIGdvIHRvIHRoZSBjcmVhdG9yIHJhdGhlciB0aGFuIHRoZSBkZWZhdWx0Q3RvclxyXG5cdFx0XHR2YXIgY3JlYXRvclJlc3VsdCA9IGRlcnJpdmVkUHJvcm90eXBlO1xyXG5cdFx0XHRpbnRlbGxpc2Vuc2UucmVkaXJlY3REZWZpbml0aW9uKERlcnJpdmVkLCBjcmVhdG9yUmVzdWx0Lmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpID8gY3JlYXRvclJlc3VsdC5jb25zdHJ1Y3RvciA6IGNyZWF0b3IpO1xyXG5cdFx0XHRpbnRlbGxpc2Vuc2UuYW5ub3RhdGUoRGVycml2ZWQsIGNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yIDogYmFzZUN0b3IpO1xyXG5cdFx0XHRjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yID0gRGVycml2ZWQ7Ly9lbnN1cmUgd2UncmUgZm9yd2FyZGluZyBkZWVwIGJhc2UgY2xhc3NlcyBjb25zdHJ1Y3RvcidzIFhNTERvYyB0byBpbmhlcml0ZWQgY29uc3RydWN0b3JzIGlmIHRoZXkgZG9uJ3QgcHJvdmlkZSBvbmVcclxuXHRcdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3JlYXRvclJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0XHRcdHZhciBmID0gY3JlYXRvclJlc3VsdFtuYW1lXTtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGYgPT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRcdFx0aW50ZWxsaXNlbnNlLmFkZEV2ZW50TGlzdGVuZXIoJ3NpZ25hdHVyZWhlbHAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGV2ZW50LnRhcmdldCAhPSBmKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW2V2ZW50LmZ1bmN0aW9uSGVscF07XHJcblx0XHRcdFx0XHRcdHZhciBwID0gYmFzZUNsYXNzLnByb3RvdHlwZTtcclxuXHRcdFx0XHRcdFx0d2hpbGUgKHAgIT0gT2JqZWN0LnByb3RvdHlwZSkge1xyXG5cdFx0XHRcdFx0XHRcdGFyZ3MucHVzaChwLmhhc093blByb3BlcnR5KG5hbWUpID8gcFtuYW1lXSA6IG51bGwpO1xyXG5cdFx0XHRcdFx0XHRcdHAgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0aW50ZWxsaXNlbnNlLmluaGVyaXRYTUxEb2MuYXBwbHkobnVsbCwgYXJncyk7XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y3JlYXRvciA9IG51bGw7Ly9zZXQgdGhlIGZpcnN0IHBhcmFtZXRlciB0byBudWxsIGFzIHdlIGhhdmUgYWxyZWFkeSAnc2hhcmVkJyB0aGUgYmFzZSBwcm90b3R5cGUgaW50byBkZXJyaXZlZFByb3RvdHlwZSBpbiB0aGUgY3JlYXRvciBmdW5jdGlvbiBieSBzZXR0aW5nIGNyZWF0b3IucHJvdG90eXBlID0gYmFzZSBvbiBhYm92ZVxyXG5cdFx0YXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgRnVuY3Rpb25fcHJvdG90eXBlLmRlZmluZS5hcHBseShEZXJyaXZlZCwgYXJndW1lbnRzKTtcclxuXHRcdERlcnJpdmVkLmNvbnN0cnVjdG9yID0gRGVycml2ZWQ7XHJcblx0XHQvL3JldHVybmluZyB0aGUgY29uc3RydWN0b3JcclxuXHRcdHJldHVybiBEZXJyaXZlZDtcclxuXHR9O1xyXG5cclxuXHRGdW5jdGlvbl9wcm90b3R5cGUuaW5oZXJpdFdpdGggPSAhc3VwcG9ydHNQcm90byA/IGZ1bmN0aW9uIGluaGVyaXRXaXRoKGNyZWF0b3IsIG1peGlucykge1xyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5oZXJpdHMgdGhlIGZ1bmN0aW9uJ3MgcHJvdG90eXBlIHRvIGEgbmV3IGZ1bmN0aW9uIG5hbWVkIGNvbnN0cnVjdG9yIHJldHVybmVkIGJ5IHRoZSBjcmVhdG9yIHBhcmFtZXRlclxyXG5cdFx0Ly8vPGJyLz48YnIvPlxyXG5cdFx0Ly8vIHZhciBTcXVhcmUgPSBGaWd1cmUuaW5oZXJpdFdpdGgoZnVuY3Rpb24oYmFzZSwgYmFzZUN0b3IpIHsgPGJyLz5cclxuXHRcdC8vLyBfX18gcmV0dXJuIHsgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gY29uc3RydWN0b3I6IGZ1bmN0aW9uKG5hbWUpIHsgLy90aGUgY29zbnRydWN0b3IgY2FuIGJlIG9wdGlvbmFsIDxici8+XHJcblx0XHQvLy8gX19fX19fX19fIGJhc2VDdG9yLmNhbGwodGhpcywgbmFtZSk7IC8vZXhwbGljaXRlbGx5IGNhbGwgdGhlIGJhc2UgY2xhc3MgYnkgbmFtZSA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyB9LDxici8+XHJcblx0XHQvLy8gX19fX19fIGRyYXc6IGZ1bmN0aW9uKCkgeyAgPGJyLz5cclxuXHRcdC8vLyBfX19fX19fX18gcmV0dXJuIGJhc2UuY2FsbCh0aGlzLCBcInNxdWFyZVwiKTsgLy9leHBsaWNpdGVseSBjYWxsIHRoZSBiYXNlIGNsYXNzIHByb3RvdHlwZSdzICBtZXRob2QgYnkgbmFtZSA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyB9LDxici8+XHJcblx0XHQvLy8gX19fIH07PGJyLz5cclxuXHRcdC8vLyB9KTsgLy8geW91IGNhbiBzcGVjaWZ5IGFueSBtaXhpbnMgaGVyZTxici8+XHJcblx0XHQvLy88L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjcmVhdG9yXCIgdHlwZT1cIkZ1bmN0aW9uXCI+ZnVuY3Rpb24oYmFzZSwgYmFzZUN0b3IpIHsgcmV0dXJuIHsgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkgey4ufS4uLn0gfTxici8+d2hlcmUgYmFzZSBpcyBCYXNlQ2xhc3MucHJvdG90eXBlIGFuZCBiYXNlQ3RvciBpcyBCYXNlQ2xhc3MgLSBha2EgdGhlIGZ1bmN0aW9uIHlvdSBhcmUgY2FsbGluZyAuaW5oZXJpdFdpdGggb248L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIGRlcnJpdmVkIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDwvc2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5oZXJpdHMgdGhlIGZ1bmN0aW9uJ3MgcHJvdG90eXBlIHRvIGEgbmV3IGZ1bmN0aW9uIG5hbWVkIGNvbnN0cnVjdG9yIHBhc3NlZCBpbnRvIHRoZSBvYmplY3QgYXMgcGFyYW1ldGVyXHJcblx0XHQvLy88YnIvPjxici8+XHJcblx0XHQvLy8gdmFyIFNxdWFyZSA9IEZpZ3VyZS5pbmhlcml0V2l0aCh7IDxici8+XHJcblx0XHQvLy8gX19fIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihuYW1lKSB7IC8vdGhlIGNvc250cnVjdG9yIGNhbiBiZSBvcHRpb25hbCA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyBGaWd1cmUuY2FsbCh0aGlzLCBuYW1lKTsgLy9jYWxsIHRoZSBiYXNlQ3RvciA8YnIvPlxyXG5cdFx0Ly8vIF9fXyB9LDxici8+XHJcblx0XHQvLy8gX19fIGRyYXc6IGZ1bmN0aW9uKCkgeyAgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gcmV0dXJuIEZpZ3VyZS5wcm90b3R5cGUuY2FsbCh0aGlzLCBcInNxdWFyZVwiKTsgLy9jYWxsIHRoZSBiYXNlIGNsYXNzIHByb3RvdHlwZSdzIG1ldGhvZDxici8+XHJcblx0XHQvLy8gX19fIH0sPGJyLz5cclxuXHRcdC8vLyB9KTsgLy8geW91IGNhbiBzcGVjaWZ5IGFueSBtaXhpbnMgaGVyZTxici8+XHJcblx0XHQvLy88L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjcmVhdG9yXCIgdHlwZT1cIk9iamVjdFwiPkFuIG9iamVjdCBjb250YWluaW5nIG1lbWJlcnMgZm9yIHRoZSBuZXcgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIGRlcnJpdmVkIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDwvc2lnbmF0dXJlPlxyXG5cdFx0dmFyIGJhc2VDdG9yID0gdGhpcztcclxuXHRcdHZhciBjcmVhdG9yUmVzdWx0ID0gKHR5cGVvZiBjcmVhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBjcmVhdG9yLmNhbGwodGhpcywgdGhpcy5wcm90b3R5cGUsIHRoaXMpIDogY3JlYXRvcikgfHwge307XHJcblx0XHR2YXIgRGVycml2ZWQgPSBjcmVhdG9yUmVzdWx0Lmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpID8gY3JlYXRvclJlc3VsdC5jb25zdHJ1Y3RvciA6IGZ1bmN0aW9uIGluaGVyaXRXaXRoQ29uc3RydWN0b3IoKSB7XHJcblx0XHRcdGJhc2VDdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9OyAvL2F1dG9tYXRpYyBjb25zdHJ1Y3RvciBpZiBvbW1pdGVkXHJcblxyXG5cdFx0V0Fzc2VydChmYWxzZSwgIWlzTm9kZSAmJiB3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGZ1bmN0aW9uIFdBc3NlcnRSZWRpcmVjdERlZmluaXRpb24oKSB7XHJcblx0XHRcdC8vdHJpZ2dlciBpbnRlbGxpc2Vuc2Ugb24gVlMyMDEyIHdoZW4gcHJlc3NpbmcgRjEyIChnbyB0byByZWZlcmVuY2UpIHRvIGdvIHRvIHRoZSBjcmVhdG9yIHJhdGhlciB0aGFuIHRoZSBkZWZhdWx0Q3RvclxyXG5cdFx0XHRpbnRlbGxpc2Vuc2UucmVkaXJlY3REZWZpbml0aW9uKERlcnJpdmVkLCBjcmVhdG9yUmVzdWx0Lmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpID8gY3JlYXRvclJlc3VsdC5jb25zdHJ1Y3RvciA6IGNyZWF0b3IpO1xyXG5cdFx0XHRpbnRlbGxpc2Vuc2UuYW5ub3RhdGUoRGVycml2ZWQsIGNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yIDogYmFzZUN0b3IpO1xyXG5cdFx0XHRjcmVhdG9yUmVzdWx0LmNvbnN0cnVjdG9yID0gRGVycml2ZWQ7Ly9lbnN1cmUgd2UncmUgZm9yd2FyZGluZyBkZWVwIGJhc2UgY2xhc3NlcyBjb25zdHJ1Y3RvcidzIFhNTERvYyB0byBpbmhlcml0ZWQgY29uc3RydWN0b3JzIGlmIHRoZXkgZG9uJ3QgcHJvdmlkZSBvbmVcclxuXHRcdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3JlYXRvclJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xyXG5cdFx0XHRcdHZhciBmID0gY3JlYXRvclJlc3VsdFtuYW1lXTtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGYgPT09IFwiZnVuY3Rpb25cIikge1xyXG5cdFx0XHRcdFx0aW50ZWxsaXNlbnNlLmFkZEV2ZW50TGlzdGVuZXIoJ3NpZ25hdHVyZWhlbHAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0aWYgKGV2ZW50LnRhcmdldCAhPSBmKSByZXR1cm47XHJcblx0XHRcdFx0XHRcdHZhciBhcmdzID0gW2V2ZW50LmZ1bmN0aW9uSGVscF07XHJcblx0XHRcdFx0XHRcdHZhciBwID0gYmFzZUN0b3IucHJvdG90eXBlO1xyXG5cdFx0XHRcdFx0XHR3aGlsZSAocCAhPSBPYmplY3QucHJvdG90eXBlKSB7XHJcblx0XHRcdFx0XHRcdFx0YXJncy5wdXNoKHAuaGFzT3duUHJvcGVydHkobmFtZSkgPyBwW25hbWVdIDogbnVsbCk7XHJcblx0XHRcdFx0XHRcdFx0cCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRpbnRlbGxpc2Vuc2UuaW5oZXJpdFhNTERvYy5hcHBseShudWxsLCBhcmdzKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHRcdHZhciBkZXJyaXZlZFByb3RvdHlwZTtcclxuXHRcdF9fLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xyXG5cdFx0RGVycml2ZWQucHJvdG90eXBlID0gZGVycml2ZWRQcm90b3R5cGUgPSBuZXcgX187XHJcblxyXG5cclxuXHRcdGNyZWF0b3IgPSBjcmVhdG9yUmVzdWx0Oy8vY2hhbmdlIHRoZSBmaXJzdCBwYXJhbWV0ZXIgd2l0aCB0aGUgY3JlYXRvclJlc3VsdFxyXG5cdFx0RnVuY3Rpb25fcHJvdG90eXBlLmRlZmluZS5hcHBseShEZXJyaXZlZCwgYXJndW1lbnRzKTtcclxuXHRcdERlcnJpdmVkLmNvbnN0cnVjdG9yID0gRGVycml2ZWQ7XHJcblxyXG5cdFx0cmV0dXJuIERlcnJpdmVkO1xyXG5cdH0gOi8vIHdoZW4gYnJvd3NlciBzdXBwb3J0cyBfX3Byb3RvX18gc2V0dGluZyBpdCBpcyB3YXkgZmFzdGVyIHRoYW4gaXRlcmF0aW5nIHRoZSBvYmplY3RcclxuXHRmdW5jdGlvbiBpbmhlcml0V2l0aFByb3RvKGNyZWF0b3IsIG1peGlucykge1xyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5oZXJpdHMgdGhlIGZ1bmN0aW9uJ3MgcHJvdG90eXBlIHRvIGEgbmV3IGZ1bmN0aW9uIG5hbWVkIGNvbnN0cnVjdG9yIHJldHVybmVkIGJ5IHRoZSBjcmVhdG9yIHBhcmFtZXRlclxyXG5cdFx0Ly8vPGJyLz48YnIvPlxyXG5cdFx0Ly8vIHZhciBTcXVhcmUgPSBGaWd1cmUuaW5oZXJpdFdpdGgoZnVuY3Rpb24oYmFzZSwgYmFzZUN0b3IpIHsgPGJyLz5cclxuXHRcdC8vLyBfX18gcmV0dXJuIHsgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gY29uc3RydWN0b3I6IGZ1bmN0aW9uKG5hbWUpIHsgLy90aGUgY29zbnRydWN0b3IgY2FuIGJlIG9wdGlvbmFsIDxici8+XHJcblx0XHQvLy8gX19fX19fX19fIGJhc2VDdG9yLmNhbGwodGhpcywgbmFtZSk7IC8vZXhwbGljaXRlbGx5IGNhbGwgdGhlIGJhc2UgY2xhc3MgYnkgbmFtZSA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyB9LDxici8+XHJcblx0XHQvLy8gX19fX19fIGRyYXc6IGZ1bmN0aW9uKCkgeyAgPGJyLz5cclxuXHRcdC8vLyBfX19fX19fX18gcmV0dXJuIGJhc2UuY2FsbCh0aGlzLCBcInNxdWFyZVwiKTsgLy9leHBsaWNpdGVseSBjYWxsIHRoZSBiYXNlIGNsYXNzIHByb3RvdHlwZSdzICBtZXRob2QgYnkgbmFtZSA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyB9LDxici8+XHJcblx0XHQvLy8gX19fIH07PGJyLz5cclxuXHRcdC8vLyB9KTsgLy8geW91IGNhbiBzcGVjaWZ5IGFueSBtaXhpbnMgaGVyZTxici8+XHJcblx0XHQvLy88L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjcmVhdG9yXCIgdHlwZT1cIkZ1bmN0aW9uXCI+ZnVuY3Rpb24oYmFzZSwgYmFzZUN0b3IpIHsgcmV0dXJuIHsgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkgey4ufS4uLn0gfTxici8+d2hlcmUgYmFzZSBpcyBCYXNlQ2xhc3MucHJvdG90eXBlIGFuZCBiYXNlQ3RvciBpcyBCYXNlQ2xhc3MgLSBha2EgdGhlIGZ1bmN0aW9uIHlvdSBhcmUgY2FsbGluZyAuaW5oZXJpdFdpdGggb248L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIGRlcnJpdmVkIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDwvc2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzaWduYXR1cmU+XHJcblx0XHQvLy8gPHN1bW1hcnk+SW5oZXJpdHMgdGhlIGZ1bmN0aW9uJ3MgcHJvdG90eXBlIHRvIGEgbmV3IGZ1bmN0aW9uIG5hbWVkIGNvbnN0cnVjdG9yIHBhc3NlZCBpbnRvIHRoZSBvYmplY3QgYXMgcGFyYW1ldGVyXHJcblx0XHQvLy88YnIvPjxici8+XHJcblx0XHQvLy8gdmFyIFNxdWFyZSA9IEZpZ3VyZS5pbmhlcml0V2l0aCh7IDxici8+XHJcblx0XHQvLy8gX19fIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihuYW1lKSB7IC8vdGhlIGNvc250cnVjdG9yIGNhbiBiZSBvcHRpb25hbCA8YnIvPlxyXG5cdFx0Ly8vIF9fX19fXyBGaWd1cmUuY2FsbCh0aGlzLCBuYW1lKTsgLy9jYWxsIHRoZSBiYXNlQ3RvciA8YnIvPlxyXG5cdFx0Ly8vIF9fXyB9LDxici8+XHJcblx0XHQvLy8gX19fIGRyYXc6IGZ1bmN0aW9uKCkgeyAgPGJyLz5cclxuXHRcdC8vLyBfX19fX18gcmV0dXJuIEZpZ3VyZS5wcm90b3R5cGUuY2FsbCh0aGlzLCBcInNxdWFyZVwiKTsgLy9jYWxsIHRoZSBiYXNlIGNsYXNzIHByb3RvdHlwZSdzIG1ldGhvZDxici8+XHJcblx0XHQvLy8gX19fIH0sPGJyLz5cclxuXHRcdC8vLyB9KTsgLy8geW91IGNhbiBzcGVjaWZ5IGFueSBtaXhpbnMgaGVyZTxici8+XHJcblx0XHQvLy88L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJjcmVhdG9yXCIgdHlwZT1cIk9iamVjdFwiPkFuIG9iamVjdCBjb250YWluaW5nIG1lbWJlcnMgZm9yIHRoZSBuZXcgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIGRlcnJpdmVkIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDwvc2lnbmF0dXJlPlxyXG5cdFx0dmFyIGJhc2VDdG9yID0gdGhpcztcclxuXHRcdHZhciBkZXJyaXZlZFByb3RvdHlwZSA9ICh0eXBlb2YgY3JlYXRvciA9PT0gXCJmdW5jdGlvblwiID8gY3JlYXRvci5jYWxsKHRoaXMsIHRoaXMucHJvdG90eXBlLCB0aGlzKSA6IGNyZWF0b3IpIHx8IHt9O1xyXG5cdFx0dmFyIERlcnJpdmVkID0gZGVycml2ZWRQcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykgPyBkZXJyaXZlZFByb3RvdHlwZS5jb25zdHJ1Y3RvciA6IGZ1bmN0aW9uIGluaGVyaXRXaXRoUHJvdG9EZWZhdWx0Q29uc3RydWN0b3IoKSB7XHJcblx0XHRcdGJhc2VDdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9OyAvL2F1dG9tYXRpYyBjb25zdHJ1Y3RvciBpZiBvbW1pdGVkXHJcblx0XHREZXJyaXZlZC5wcm90b3R5cGUgPSBkZXJyaXZlZFByb3RvdHlwZTtcclxuXHRcdGRlcnJpdmVkUHJvdG90eXBlLl9fcHJvdG9fXyA9IHRoaXMucHJvdG90eXBlO1xyXG5cdFx0Y3JlYXRvciA9IG51bGw7Ly9zZXQgdGhlIGZpcnN0IHBhcmFtZXRlciB0byBudWxsIGFzIHdlIGhhdmUgYWxyZWFkeSAnc2hhcmVkJyB0aGUgYmFzZSBwcm90b3R5cGUgaW50byBkZXJyaXZlZFByb3RvdHlwZSBieSB1c2luZyBfX3Byb3RvX19cclxuXHRcdGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIEZ1bmN0aW9uX3Byb3RvdHlwZS5kZWZpbmUuYXBwbHkoRGVycml2ZWQsIGFyZ3VtZW50cyk7XHJcblx0XHREZXJyaXZlZC5jb25zdHJ1Y3RvciA9IERlcnJpdmVkO1xyXG5cdFx0cmV0dXJuIERlcnJpdmVkO1xyXG5cdH07XHJcblx0RnVuY3Rpb25fcHJvdG90eXBlLmRlZmluZSA9IGZ1bmN0aW9uIGRlZmluZShwcm90b3R5cGUsIG1peGlucykge1xyXG5cdFx0Ly8vIDxzdW1tYXJ5PkRlZmluZSBtZW1iZXJzIG9uIHRoZSBwcm90b3R5cGUgb2YgdGhlIGdpdmVuIGZ1bmN0aW9uIHdpdGggdGhlIGN1c3RvbSBtZXRob2RzIGFuZCBmaWVsZHMgc3BlY2lmaWVkIGluIHRoZSBwcm90b3R5cGUgcGFyYW1ldGVyLjwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cInByb3RvdHlwZVwiIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIj57fSBvciBmdW5jdGlvbihwcm90b3R5cGUsIGN0b3IpIHt9PGJyLz5BIGN1c3RvbSBvYmplY3Qgd2l0aCB0aGUgbWV0aG9kcyBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIG9uIEV4dGVuZGVlLnByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJtaXhpbnNcIiAgdHlwZT1cIkZ1bmN0aW9uIHx8IFBsYWluIE9iamVjdFwiIG9wdGlvbmFsPVwidHJ1ZVwiIHBhcmFtZXRlckFycmF5PVwidHJ1ZVwiPlNwZWNpZnkgb25lIG9yZSBtb3JlIG1peGlucyB0byBiZSBhZGRlZCB0byB0aGlzIGZ1bmN0aW9uJ3MgcHJvdG90eXBlLiA8YnIvPkEgTWl4aW4gaXMgZWl0aGVyIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIHBsYWluIG9iamVjdCwgb3IgYSBwbGFuIG9iamVjdCBpbiBpdHNlbGYuIEl0IGNvbnRhaW5zIG1ldGhvZCBvciBwcm9wZXJ0aWVzIHRvIGJlIGFkZGVkIHRvIHRoaXMgZnVuY3Rpb24ncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0dmFyIGNvbnN0cnVjdG9yID0gdGhpcztcclxuXHRcdHZhciBleHRlbmRlZVByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xyXG5cdFx0dmFyIGNyZWF0b3JSZXN1bHQgPSBwcm90b3R5cGU7XHJcblx0XHRpZiAocHJvdG90eXBlKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgcHJvdG90eXBlID09PSBcImZ1bmN0aW9uXCIpXHJcblx0XHRcdFx0cHJvdG90eXBlID0gcHJvdG90eXBlLmNhbGwoZXh0ZW5kZWVQcm90b3R5cGUsIHRoaXMucHJvdG90eXBlLCB0aGlzKTtcclxuXHRcdFx0Zm9yICh2YXIga2V5IGluIHByb3RvdHlwZSlcclxuXHRcdFx0XHRleHRlbmRlZVByb3RvdHlwZVtrZXldID0gcHJvdG90eXBlW2tleV07XHJcblx0XHR9XHJcblx0XHRwcm90b3R5cGUgPSBudWxsO1xyXG5cdFx0Ly9pbnRlbGxpc2Vuc2UubG9nTWVzc2FnZShcImRlZmluaW5nLi4uLlwiKTtcclxuXHRcdChhcmd1bWVudHMubGVuZ3RoID4gMiB8fCBtaXhpbnMpICYmIChleHRlbmRlZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShcIl9fbWl4aW5zX19cIikgfHwgKE9iamVjdF9kZWZpbmVQcm9wZXJ0aWVzID8gKE9iamVjdF9kZWZpbmVQcm9wZXJ0eShleHRlbmRlZVByb3RvdHlwZSwgXCJfX21peGluc19fXCIsIHsgZW51bWVyYWJsZTogZmFsc2UsIHZhbHVlOiBbXSwgd3JpdGVhYmxlOiBmYWxzZSB9KS5fX21peGluc19fLl9faGlkZGVuID0gdHJ1ZSkgOiBleHRlbmRlZVByb3RvdHlwZS5fX21peGluc19fID0gW10pKSAmJiBBcnJheV9wcm90b3R5cGVfZm9yRWFjaC5jYWxsKGFyZ3VtZW50cywgZnVuY3Rpb24gZm9yRWFjaE1peGluKG1peGluLCBpbmRleCwgbWl4aW5WYWx1ZSwgaXNGdW5jdGlvbikge1xyXG5cdFx0XHRpc0Z1bmN0aW9uID0gdHlwZW9mIG1peGluID09PSAnZnVuY3Rpb24nO1xyXG5cdFx0XHRpZiAoaXNGdW5jdGlvbikge1xyXG5cdFx0XHRcdF9fLnByb3RvdHlwZSA9IG1peGluLnByb3RvdHlwZTtcclxuXHRcdFx0XHRtaXhpblZhbHVlID0gbmV3IG1peGluKGV4dGVuZGVlUHJvdG90eXBlLCBjb25zdHJ1Y3Rvcik7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBtaXhpblZhbHVlID0gbWl4aW47XHJcblx0XHRcdGlmIChtaXhpblZhbHVlKSB7XHJcblx0XHRcdFx0Ly9zdG9yZSB0aGUgZnVuY3Rpb25zIGluIHRoZSBfX21peGluc19fIG1lbWJlciBvbiB0aGUgcHJvdG90eXBlIHNvIHRoZXkgd2lsbCBiZSBjYWxsZWQgb24gRnVuY3Rpb24uaW5pdE1peGlucyhpbnN0YW5jZSkgZnVuY3Rpb25cclxuXHRcdFx0XHRpc0Z1bmN0aW9uICYmIGV4dGVuZGVlUHJvdG90eXBlLl9fbWl4aW5zX18ucHVzaChtaXhpbik7XHJcblx0XHRcdFx0Ly9jb3B5IHRoZSBwcm90b3R5cGUgbWVtYmVycyBmcm9tIHRoZSBtaXhpbi5wcm90b3R5cGUgdG8gZXh0ZW5kZWVQcm90b3R5cGUgc28gd2UgYXJlIG9ubHkgZG9pbmcgdGhpcyBvbmNlXHJcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIG1peGluVmFsdWUpXHJcblx0XHRcdFx0XHRpZiAoa2V5ICE9IFwiY29uc3RydWN0b3JcIiAmJiBrZXkgIT0gXCJwcm90b3R5cGVcIikge1xyXG5cdFx0XHRcdFx0XHQvL2ludGVsbGlzZW5zZS5sb2dNZXNzYWdlKFwiaW5qZWN0aW5nIFwiICsga2V5ICsgXCIgaW50byBcIiArIGV4dGVuZGVlUHJvdG90eXBlLm5hbWUpO1xyXG5cdFx0XHRcdFx0XHRXQXNzZXJ0KHRydWUsIGZ1bmN0aW9uIFdBc3NlcnRJbmplY3RpbmcoKSB7XHJcblx0XHRcdFx0XHRcdFx0Ly90cmlnZ2VyIGludGVsbGlzZW5zZSBvbiBWUzIwMTIgZm9yIG1peGluc1xyXG5cdFx0XHRcdFx0XHRcdGlmIChrZXkgaW4gZXh0ZW5kZWVQcm90b3R5cGUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vYWxsb3cgYWJhc3RyYWN0IG1lbWJlcnMgb24gY2xhc3MvbWl4aW5zIHNvIHRoZXkgY2FuIGJlIHJlcGxhY2VkXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoZXh0ZW5kZWVQcm90b3R5cGVba2V5XSAmJiBleHRlbmRlZVByb3RvdHlwZVtrZXldLmFic3RyYWN0KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHR2YXIgbXNnID0gXCJUaGUgJ3swfScgbWl4aW4gZGVmaW5lcyBhICd7MX0nIG5hbWVkICd7Mn0nIHdoaWNoIGlzIGFscmVhZHkgZGVmaW5lZCBvbiB0aGUgY2xhc3MgezN9IVwiXHJcblx0XHRcdFx0XHRcdFx0XHRcdC5mb3JtYXQoaXNGdW5jdGlvbiAmJiBtaXhpbi5uYW1lIHx8IChpbmRleCAtIDEpLCB0eXBlb2YgbWl4aW5WYWx1ZVtrZXldID09PSBcImZ1bmN0aW9uXCIgPyBcImZ1bmN0aW9uXCIgOiBcIm1lbWJlclwiLCBrZXksIGNvbnN0cnVjdG9yLm5hbWUgPyAoXCInXCIgKyBjb25zdHJ1Y3Rvci5uYW1lICsgXCInXCIpIDogJycpO1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cobXNnKVxyXG5cdFx0XHRcdFx0XHRcdFx0IWlzTm9kZSAmJiB3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGludGVsbGlzZW5zZS5sb2dNZXNzYWdlKG1zZyk7XHJcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBtc2c7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdC8vc2V0IGEgY3VzdG9tIGdseXBoIGljb24gZm9yIG1peGluIGZ1bmN0aW9uc1xyXG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgbWl4aW5WYWx1ZVtrZXldID09PSBcImZ1bmN0aW9uXCIgJiYgbWl4aW4gIT0gbWl4aW5WYWx1ZVtrZXldICYmIG1peGluICE9IGNvbnN0cnVjdG9yICYmIG1peGluICE9PSBleHRlbmRlZVByb3RvdHlwZSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bWl4aW5WYWx1ZVtrZXldLl9fZ2x5cGggPSBcIkdseXBoQ3BwUHJvamVjdFwiO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdGV4dGVuZGVlUHJvdG90eXBlW2tleV0gPSBtaXhpblZhbHVlW2tleV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0V0Fzc2VydCh0cnVlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydEV4dGVuZGluZygpIHtcclxuXHRcdFx0Ly90cmlnZ2VyIGludGVsbGlzZW5zZSBvbiBWUzIwMTIgZm9yIGJhc2UgY2xhc3MgbWVtYmVycywgYmVjYXVzZSBzYW1lIGFzIElFLCBWUzIwMTIgZG9lc24ndCBzdXBwb3J0IF9fcHJvdG9fX1xyXG5cdFx0XHQvL2ZvciAodmFyIGkgaW4gZXh0ZW5kZWVQcm90b3R5cGUpXHJcblx0XHRcdC8vXHRpZiAoIWNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHRcdFx0Ly9cdFx0Y3JlYXRvclJlc3VsdFtpXSA9IGV4dGVuZGVlUHJvdG90eXBlW2ldO1xyXG5cdFx0XHQvL1x0fVxyXG5cdFx0XHQvL2luamVjdCBwcm9wZXJ0aWVzIGZyb20gdGhlIG5ldyBjb25zdHJ1Y3RvclxyXG5cdFx0XHQvL2V4dGVuZGVlUHJvdG90eXBlID0ge307XHJcblx0XHRcdC8vaW50ZWxsaXNlbnNlLmxvZ01lc3NhZ2UoXCJpbmplY3RpbmcgY3Rvci5wcm9wZXJ0aWVzIGludG8gXCIgKyBKU09OLnN0cmluZ2lmeShjcmVhdG9yUmVzdWx0KSArIC9mdW5jdGlvbiAoLiopXFwoLipcXCkvZ2kuZXhlYyhhcmd1bWVudHMuY2FsbGVlLmNhbGxlci5jYWxsZXIuY2FsbGVyLnRvU3RyaW5nKCkpWzFdKVxyXG5cdFx0XHRfXy5wcm90b3R5cGUgPSBleHRlbmRlZVByb3RvdHlwZTtcclxuXHRcdFx0dmFyIHByb3RvID0gbmV3IF9fO1xyXG5cdFx0XHRjb25zdHJ1Y3Rvci5jYWxsKHByb3RvKTtcclxuXHRcdFx0Zm9yICh2YXIgaSBpbiBwcm90bykge1xyXG5cdFx0XHRcdC8vaW50ZWxsaXNlbnNlLmxvZ01lc3NhZ2UoaSlcclxuXHRcdFx0XHRpZiAoaSAhPT0gXCJjb25zdHJ1Y3RvclwiKVxyXG5cdFx0XHRcdFx0Ly9pZiAocHJvdG8uaGFzT3duUHJvcGVydHkoaSkpXHJcblx0XHRcdFx0XHRpZiAoIWNyZWF0b3JSZXN1bHQuaGFzT3duUHJvcGVydHkoaSkpXHJcblx0XHRcdFx0XHRcdGNyZWF0b3JSZXN1bHRbaV0gPSBwcm90b1tpXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH0pO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cclxuXHJcblx0RnVuY3Rpb24uZGVmaW5lID0gZnVuY3Rpb24gRnVuY3Rpb25fZGVmaW5lKGZ1bmMsIHByb3RvdHlwZSwgbWl4aW5zKSB7XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5FeHRlbmRzIHRoZSBnaXZlbiBmdW5jJ3MgcHJvdG90eXBlIHdpdGggcHJvdmlkZWQgbWVtYmVycyBvZiBwcm90b3R5cGUgYW5kIGVuc3VyZXMgY2FsbGluZyB0aGUgbWl4aW5zIGluIHRoZSBjb25zdHJ1Y3Rvcjwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImZ1bmNcIiB0eXBlPVwiRnVuY3Rpb25cIj5TcGVjaWZ5IHRoZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiB5b3Ugd2FudCB0byBkZWZpbmUgaS5lLiBmdW5jdGlvbigpIHt9PC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cInByb3RvdHlwZVwiIHR5cGU9XCJQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIj5TcGVjaWZ5IGFuIG9iamVjdCB0aGF0IGNvbnRhaW4gdGhlIGZ1bmN0aW9ucyBvciBtZW1iZXJzIHRoYXQgc2hvdWxkIGRlZmluZWQgb24gdGhlIHByb3ZpZGVkIGZ1bmMncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIHJldHVybmVkIGZ1bmMncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHQvLy8gPHNpZ25hdHVyZT5cclxuXHRcdC8vLyA8c3VtbWFyeT5FeHRlbmRzIHRoZSBnaXZlbiBjb25zdHJ1Y3RvcidzIHByb3RvdHlwZSB3aXRoIHByb3ZpZGVkIG1lbWJlcnMgb2YgcHJvdG90eXBlIGFuZCBlbnN1cmVzIGNhbGxpbmcgdGhlIG1peGlucyBpbiB0aGUgY29uc3RydWN0b3I8L3N1bW1hcnk+XHJcblx0XHQvLy8gPHBhcmFtIG5hbWU9XCJwcm90b3R5cGVcIiB0eXBlPVwiUGxhaW4gT2JqZWN0XCI+U3BlY2lmeSBhbiBvYmplY3QgdGhhdCBjb250YWluIHRoZSBjb25zdHJ1Y3RvciBhbmQgZnVuY3Rpb25zIG9yIG1lbWJlcnMgdGhhdCBzaG91bGQgZGVmaW5lZCBvbiB0aGUgcHJvdmlkZWQgY29uc3RydWN0b3IncyBwcm90b3R5cGU8L3BhcmFtPlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwibWl4aW5zXCIgIHR5cGU9XCJGdW5jdGlvbiB8fCBQbGFpbiBPYmplY3RcIiBvcHRpb25hbD1cInRydWVcIiBwYXJhbWV0ZXJBcnJheT1cInRydWVcIj5TcGVjaWZ5IG9uZSBvcmUgbW9yZSBtaXhpbnMgdG8gYmUgYWRkZWQgdG8gdGhlIHJldHVybmVkIGZ1bmMncyBwcm90b3R5cGUuIDxici8+QSBNaXhpbiBpcyBlaXRoZXIgYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgcGxhaW4gb2JqZWN0LCBvciBhIHBsYW4gb2JqZWN0IGluIGl0c2VsZi4gSXQgY29udGFpbnMgbWV0aG9kIG9yIHByb3BlcnRpZXMgdG8gYmUgYWRkZWQgdG8gdGhpcyBmdW5jdGlvbidzIHByb3RvdHlwZTwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHR2YXIgcmVzdWx0O1xyXG5cdFx0dmFyIGNvbnN0cnVjdG9yID0gZnVuYyB8fCBmdW5jdGlvbiBkZWZpbmVEZWZhdWx0Q29uc3RydWN0b3IoKSB7IH07IC8vYXV0b21hdGljIGNvbnN0cnVjdG9yIGlmIG9tbWl0ZWRcclxuXHRcdHZhciBhcHBseURlZmluZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxO1xyXG5cdFx0aWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuXHRcdFx0Y29uc3RydWN0b3IgPSBmdW5jLmhhc093blByb3BlcnR5KFwiY29uc3RydWN0b3JcIikgPyBmdW5jLmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gY29uc3RydWN0b3JEZWZhdWx0T2JqQ29uc3RydWN0b3IoKSB7IH07XHJcblxyXG5cdFx0XHRjb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBmdW5jO1xyXG5cdFx0XHRXQXNzZXJ0KHRydWUsICFpc05vZGUgJiYgd2luZG93LmludGVsbGlzZW5zZSAmJiBmdW5jdGlvbiBXQXNzZXJ0KCkge1xyXG5cdFx0XHRcdC8vVlMyMDEyIGludGVsbGlzZW5zZSBkb24ndCBmb3J3YXJkIHRoZSBhY3R1YWwgY3JlYXRvciBhcyB0aGUgZnVuY3Rpb24ncyBwcm90b3R5cGUgYi9jIHdlIHdhbnQgdG8gXCJpbmplY3RcIiBjb25zdHJ1Y3RvcidzIG1lbWJlcnMgaW50byBpdFxyXG5cdFx0XHRcdGZ1bmN0aW9uIGNsb25lKCkge1xyXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSBpbiBmdW5jKVxyXG5cdFx0XHRcdFx0XHRpZiAoZnVuYy5oYXNPd25Qcm9wZXJ0eShpKSlcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldID0gZnVuY1tpXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0Y2xvbmUucHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGZ1bmMpO1xyXG5cdFx0XHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IG5ldyBjbG9uZTtcclxuXHRcdFx0fSk7XHJcblxyXG5cclxuXHRcdFx0YXBwbHlEZWZpbmUgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGZ1bmMgPSBwcm90b3R5cGU7XHJcblx0XHRcdHByb3RvdHlwZSA9IG51bGw7XHJcblx0XHR9XHJcblx0XHRhcHBseURlZmluZSAmJiBGdW5jdGlvbl9wcm90b3R5cGUuZGVmaW5lLmFwcGx5KGNvbnN0cnVjdG9yLCBhcmd1bWVudHMpO1xyXG5cclxuXHRcdHJlc3VsdCA9IGZ1bmN0aW9uIGRlZmluZUluaXRNaXhpbnNDb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0Ly8gYXV0b21hdGljYWxseSBjYWxsIGluaXRNaXhpbnMgYW5kIHRoZW4gdGhlIGZpcnN0IGNvbnN0cnVjdG9yXHJcblx0XHRcdEZ1bmN0aW9uLmluaXRNaXhpbnModGhpcyk7XHJcblx0XHRcdGNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9XHJcblx0XHQvL3dlIGFyZSBzaGFyaW5nIGNvbnN0cnVjdG9yJ3MgcHJvdG90eXBlXHJcblx0XHRyZXN1bHQucHJvdG90eXBlID0gY29uc3RydWN0b3IucHJvdG90eXBlO1xyXG5cdFx0Ly9mb3J3YXJkIHRoZSBWUzIwMTIgaW50ZWxsaXNlbnNlIHRvIHRoZSBnaXZlbiBjb25zdHJ1Y3RvciBmdW5jdGlvblxyXG5cdFx0V0Fzc2VydCh0cnVlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydCgpIHtcclxuXHRcdFx0d2luZG93LmludGVsbGlzZW5zZSAmJiBpbnRlbGxpc2Vuc2UucmVkaXJlY3REZWZpbml0aW9uKHJlc3VsdCwgY29uc3RydWN0b3IpO1xyXG5cdFx0fSk7XHJcblx0XHRyZXN1bHQuY29uc3RydWN0b3IgPSByZXN1bHQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY29uc3RydWN0b3IuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSByZXN1bHQ7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH07XHJcblxyXG5cdEZ1bmN0aW9uX3Byb3RvdHlwZS5kZWZpbmVTdGF0aWMgPSBmdW5jdGlvbiAoY29weVByb3BlcnRpZXNGcm9tKSB7XHJcblx0XHQvLy8gPHN1bW1hcnk+Q29waWVzIGFsbCB0aGUgbWVtYmVycyBvZiB0aGUgZ2l2ZW4gb2JqZWN0LCBpbmNsdWRpbmcgdGhvc2Ugb24gaXRzIHByb3RvdHlwZSBpZiBhbnksIHRvIHRoaXMgZnVuY3Rpb24gKGFuZCBub3Qgb24gaXRzIHByb3RvdHlwZSk8YnIvPkZvciBleHRlbmRpbmcgdGhpcyBmdW5jdGlvbnMnIHByb3RvdHlwZSB1c2UgLmRlZmluZSgpPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwiY29weVByb3BlcnRpZXNGcm9tXCIgdHlwZT1cIk9iamVjdFwiPlRoZSBvYmplY3QgdG8gY29weSB0aGUgcHJvcGVydGllcyBmcm9tPC9wYXJhbT5cclxuXHRcdGlmIChjb3B5UHJvcGVydGllc0Zyb20pXHJcblx0XHRcdGZvciAodmFyIGkgaW4gY29weVByb3BlcnRpZXNGcm9tKSB7XHJcblx0XHRcdFx0dGhpc1tpXSA9IGNvcHlQcm9wZXJ0aWVzRnJvbVtpXTtcclxuXHRcdFx0fVxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIGRlZmF1bHRBYnN0cmFjdE1ldGhvZCgpIHtcclxuXHRcdFdBc3NlcnQoZmFsc2UsIFwiTm90IGltcGxlbWVudGVkXCIpKCk7XHJcblx0fVxyXG5cdGRlZmF1bHRBYnN0cmFjdE1ldGhvZC5kZWZpbmVTdGF0aWMoeyBhYnN0cmFjdDogdHJ1ZSB9KTtcclxuXHRGdW5jdGlvbi5hYnN0cmFjdCA9IGZ1bmN0aW9uIChtZXNzYWdlLCBmdW5jKSB7XHJcblx0XHQvLy8gPHN1bW1hcnk+UmV0dXJucyBhbiBhYnN0cmFjdCBmdW5jdGlvbiB0aGF0IGFzc2VydHMgdGhlIGdpdmVuIG1lc3NhZ2UuIE9wdGlvbmFsbHkgeW91IGNhbiBhZGQgc29tZSBjb2RlIHRvIGhhcHBlbiBiZWZvcmUgYXNzZXJ0aW9uIHRvbzwvc3VtbWFyeT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cIm1lc3NhZ2VcIiB0eXBlPVwiU3RyaW5nIHx8IEZ1bmN0aW9uXCI+VGhlIG1lc3NhZ2UgdG8gYmUgdGhyb3duIHdoZW4gdGhlIG5ld2x5IG1ldGhvZCB3aWxsIGJlIGNhbGxlZC4gPGJyLz5EZWZhdWx0cyB0bzogTm90IGltcGxlbWVudGVkPC9wYXJhbT5cclxuXHRcdC8vLyA8cGFyYW0gbmFtZT1cImZ1bmNcIiB0eXBlPVwiRnVuY3Rpb25cIiBvcHRpb25hbD1cInRydWVcIj5TcGVjaWZ5IGEgY3VzdG9tIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGFzc2VydGlvbiBpcyB0aHJvd24uPC9wYXJhbT5cclxuXHRcdHZhciByZXN1bHQgPSBtZXNzYWdlIHx8IGZ1bmMgPyAoZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0XHRtZXNzYWdlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHRcdGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0aWYgKHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiKVxyXG5cdFx0XHRcdFdBc3NlcnQoZmFsc2UsIG1lc3NhZ2UpKCk7XHJcblx0XHRcdGVsc2UgZGVmYXVsdEFic3RyYWN0TWV0aG9kKCk7XHJcblx0XHR9KS5kZWZpbmVTdGF0aWMoeyBhYnN0cmFjdDogdHJ1ZSB9KSA6IGRlZmF1bHRBYnN0cmFjdE1ldGhvZDtcclxuXHRcdFdBc3NlcnQodHJ1ZSwgIWlzTm9kZSAmJiB3aW5kb3cuaW50ZWxsaXNlbnNlICYmIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0aWYgKHJlc3VsdCAhPSBkZWZhdWx0QWJzdHJhY3RNZXRob2QpIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIG1lc3NhZ2UgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0XHRcdGludGVsbGlzZW5zZS5yZWRpcmVjdERlZmluaXRpb24ocmVzdWx0LCBtZXNzYWdlKTtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGZ1bmMgPT09IFwiZnVuY3Rpb25cIilcclxuXHRcdFx0XHRcdGludGVsbGlzZW5zZS5yZWRpcmVjdERlZmluaXRpb24ocmVzdWx0LCBmdW5jKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0RnVuY3Rpb24uaW5pdE1peGlucyA9IGZ1bmN0aW9uIGluaXRNaXhpbnMob2JqZWN0SW5zdGFuY2UpIHtcclxuXHRcdC8vLyA8c2lnbmF0dXJlPlxyXG5cdFx0Ly8vIDxzdW1tYXJ5PkluaXRpYWxpemVzIHRoZSBtaXhpbnMgb24gYWxsIG9mIHRoZSBwcm90b3R5cGVzIG9mIHRoZSBnaXZlbiBvYmplY3QgaW5zdGFuY2U8YnIvPlRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uY2UgcGVyIG9iamVjdCwgdXN1YWxseSBpbiB0aGUgZmlyc3QgY29uc3RydWN0b3IgKHRoZSBtb3N0IGJhc2UgY2xhc3MpPC9zdW1tYXJ5PlxyXG5cdFx0Ly8vIDxwYXJhbSBuYW1lPVwib2JqZWN0SW5zdGFuY2VcIiB0eXBlPVwiT2JqZWN0XCI+VGhlIG9iamVjdCBpbnN0YW5jZSBmb3Igd2hpY2ggdGhlIG1peGlucyBuZWVkcyB0byBiZSBpbml0aWFsaXplZDwvcGFyYW0+XHJcblx0XHQvLy8gPC9zaWduYXR1cmU+XHJcblx0XHRpZiAob2JqZWN0SW5zdGFuY2UgJiYgIW9iamVjdEluc3RhbmNlLl9faW5pdE1peGluc19fKSB7XHJcblx0XHRcdHZhciBwID0gb2JqZWN0SW5zdGFuY2UsIG1peGlucywgbGVuZ3RoLCBpLCBtaXhpbiwgY2FsbGVkTWl4aW5zID0ge307XHJcblx0XHRcdG9iamVjdEluc3RhbmNlLl9faW5pdE1peGluc19fID0gMTtcclxuXHRcdFx0V0Fzc2VydCh0cnVlLCAhaXNOb2RlICYmIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydCgpIHtcclxuXHRcdFx0XHQvL2hpZGUgX19pbml0TWl4aW5zIGZyb20gVlMyMDEyIGludGVsbGlzZW5zZVxyXG5cdFx0XHRcdG9iamVjdEluc3RhbmNlLl9faW5pdE1peGluc19fID0geyBfX2hpZGRlbjogdHJ1ZSB9O1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0d2hpbGUgKHApIHtcclxuXHRcdFx0XHRwID0gc3VwcG9ydHNQcm90byA/IHAuX19wcm90b19fIDogT2JqZWN0LmdldFByb3RvdHlwZU9mKHApO1xyXG5cdFx0XHRcdGlmIChwICYmIHAuaGFzT3duUHJvcGVydHkoXCJfX21peGluc19fXCIpICYmIChtaXhpbnMgPSBwLl9fbWl4aW5zX18pICYmIChsZW5ndGggPSBtaXhpbnMubGVuZ3RoKSlcclxuXHRcdFx0XHRcdGZvciAoaSA9IDA7IG1peGluID0gbWl4aW5zW2ldLCBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0Ly9XQXNzZXJ0KHRydWUsIHdpbmRvdy5pbnRlbGxpc2Vuc2UgJiYgZnVuY3Rpb24gV0Fzc2VydCgpIHtcclxuXHRcdFx0XHRcdFx0Ly9cdC8vZm9yIGNvcnJlY3QgVlMyMDEyIGludGVsbGlzZW5zZSwgYXQgdGhlIHRpbWUgb2YgbWl4aW4gZGVjbGFyYXRpb24gd2UgbmVlZCB0byBleGVjdXRlIG5ldyBtaXhpbigpIHJhdGhlciB0aGFuIG1peGluLmNhbGwob2JqZWN0SW5zdGFuY2UsIHAsIHAuY29uc3RydWN0b3IpIG90aGVyd2lzZSB0aGUgZ2x5cGggaWNvbnMgd2lsbCBsb29rIGxpa2UgdGhleSBhcmUgZGVmaW5lZCBvbiBtaXhpbiAvIHByb3RvdHlwZSByYXRoZXIgdGhhbiBvbiB0aGUgbWl4aW4gaXRzZWxmXHJcblx0XHRcdFx0XHRcdC8vXHRpZiAoIShtaXhpbiBpbiBjYWxsZWRNaXhpbnMpKSB7XHJcblx0XHRcdFx0XHRcdC8vXHRcdGNhbGxlZE1peGluc1ttaXhpbl0gPSAxO1xyXG5cdFx0XHRcdFx0XHQvL1x0XHRuZXcgbWl4aW4ocCwgcC5jb25zdHJ1Y3Rvcik7XHJcblx0XHRcdFx0XHRcdC8vXHR9XHJcblx0XHRcdFx0XHRcdC8vfSk7XHJcblx0XHRcdFx0XHRcdGlmICghKG1peGluIGluIGNhbGxlZE1peGlucykpIHtcclxuXHRcdFx0XHRcdFx0XHRjYWxsZWRNaXhpbnNbbWl4aW5dID0gMTtcclxuXHRcdFx0XHRcdFx0XHRtaXhpbi5jYWxsKG9iamVjdEluc3RhbmNlLCBwLCBwLmNvbnN0cnVjdG9yKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGRlbGV0ZSBvYmplY3RJbnN0YW5jZS5fX2luaXRNaXhpbnNfXztcclxuXHRcdH1cclxuXHR9O1xyXG5cclxuXHRpZiAoT2JqZWN0X2RlZmluZVByb3BlcnRpZXMpIHtcclxuXHRcdHZhciBvID0ge1xyXG5cdFx0XHQwOiBbRnVuY3Rpb24sIFwiaW5pdE1peGluc1wiLCBcImRlZmluZVwiLCBcImFic3RyYWN0XCJdLFxyXG5cdFx0XHQxOiBbRnVuY3Rpb25fcHJvdG90eXBlLCBcImZhc3RDbGFzc1wiLCBcImluaGVyaXRXaXRoXCIsIFwiZGVmaW5lXCIsIFwiZGVmaW5lU3RhdGljXCJdXHJcblx0XHR9XHJcblx0XHRmb3IgKHZhciBwIGluIG8pXHJcblx0XHRcdGZvciAodmFyIHByb3BzID0gb1twXSwgb2JqID0gcHJvcHNbMF0sIGkgPSAxLCBwcm9wOyBwcm9wID0gcHJvcHNbaV0sIGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdE9iamVjdF9kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIHsgZW51bWVyYWJsZTogZmFsc2UsIHZhbHVlOiBvYmpbcHJvcF0gfSk7XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG59KSgpO1xyXG4vLy8vVW5jb21tZW50IHRoaXMgZm9yIGEgcXVpY2sgZGVtbyAmIHNlbGYgdGVzdFxyXG4vLy8vLy8vLy8vLy8vLy8vLy9PUFRJT04gMTogaW5oZXJpdFdpdGgvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vL1VzaW5nIERlZmluZTogXHJcbi8vLy9GdW5jdGlvbi5wcm90b3R5cGUuZGVmaW5lKHByb3RvKSBjb3BpZXMgdGhlIGdpdmVuIHZhbHVlIGZyb20gcHJvdG8gdG8gZnVuY3Rpb24ucHJvdG90eXBlIGkuZS4gQSBpbiB0aGlzIGNhc2VcclxuXHJcbi8vLy8vL0F0ZXJuYXRpdmUgZm9yIEZ1bmN0aW9uLmRlZmluZSB3ZSBjYW4gZG8gdGhpczpcclxuLy8vL3ZhciBBID0gZnVuY3Rpb24gKHZhbCkge1xyXG4vLy8vICAgICBGdW5jdGlvbi5pbml0TWl4aW5zKHRoaXMpOy8vIHNpbmNlIHRoaXMgaXMgYSB0b3AgZnVuY3Rpb24sIHdlIG5lZWQgdG8gY2FsbCBpbml0TWl4aW5zIHRvIG1ha2Ugc3VyZSB0aGV5IHdpbGwgYmUgaW5pdGlhbGl6ZWQuXHJcbi8vLy9cdHRoaXMudmFsID0gdmFsO1xyXG4vLy8vfS5kZWZpbmUoe1xyXG4vLy8vXHRtZXRob2QxOiBmdW5jdGlvbiAoeCwgeSwgeikge1xyXG4vLy8vXHRcdHRoaXMueCA9IHg7XHJcbi8vLy9cdFx0dGhpcy55ID0geTtcclxuLy8vL1x0XHR0aGlzLnogPSB6O1xyXG4vLy8vXHR9XHJcbi8vLy99KTtcclxuXHJcbi8vLy9UbyBkZWZpbmUgdGhlIHRvcCBsZXZlbCAoZmlyc3QpIGZ1bmN0aW9uIHRoZXJlIGlzIGEgc3VnYXIgKGFzIHdlbGwgYXMgdGhlIGFib3ZlIGFsdGVybmF0aXZlKVxyXG4vL3ZhciBBID0gRnVuY3Rpb24uZGVmaW5lKGZ1bmN0aW9uKHZhbCkge1xyXG4vLyAgICAgLy8gd2hlbiB3ZSBhcmUgZGVmaW5pbiBhIHRvcCBmdW5jdGlvbiB3aXRoIEZ1bmN0aW9uLmRlZmluZSB3ZSBET04nVCBuZWVkIHRvIGNhbGwgaW5pdE1peGlucyBiZWNhdXNlIHRoZXkgd2lsbCBiZSBjYWxsZWQgYXV0b21hdGljYWxseSBmb3IgdXNcclxuLy9cdHRoaXMudmFsID0gdmFsO1xyXG4vL30sIHtcclxuLy9cdG1ldGhvZDE6IGZ1bmN0aW9uICh4LCB5LCB6KSB7XHJcbi8vXHRcdHRoaXMueCA9IHg7XHJcbi8vXHRcdHRoaXMueSA9IHk7XHJcbi8vXHRcdHRoaXMueiA9IHo7XHJcbi8vXHR9XHJcbi8vfSk7XHJcblxyXG5cclxuLy8vL0ZvbGxvdyBkZXJyaXZhdGlvbnMgdXNpbmcgaW5oZXJpdFdpdGhcclxuXHJcbi8vdmFyIEIgPSBBLmluaGVyaXRXaXRoKGZ1bmN0aW9uIChiYXNlLCBiYXNlQ3Rvcikge1xyXG4vL1x0cmV0dXJuIHtcclxuLy9cdFx0Y29uc3RydWN0b3I6IGZ1bmN0aW9uICh2YWwpIHsgYmFzZUN0b3IuY2FsbCh0aGlzLCB2YWwpIH0sXHJcbi8vXHRcdG1ldGhvZDE6IGZ1bmN0aW9uICh5LCB6KSB7XHJcbi8vXHRcdFx0YmFzZS5tZXRob2QxLmNhbGwodGhpcywgJ3gnLCAneScsIHopO1xyXG4vL1x0XHR9XHJcbi8vXHR9O1xyXG4vL30pO1xyXG5cclxuLy92YXIgQyA9IEIuaW5oZXJpdFdpdGgoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHRyZXR1cm4ge1xyXG4vL1x0XHRjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbCkgeyBiYXNlQ3Rvci5jYWxsKHRoaXMsIHZhbCkgfSxcclxuLy9cdFx0bWV0aG9kMTogZnVuY3Rpb24gKHopIHtcclxuLy9cdFx0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCAneScsIHopO1xyXG4vL1x0XHR9XHJcbi8vXHR9O1xyXG4vL30pO1xyXG5cclxuLy92YXIgRCA9IEMuaW5oZXJpdFdpdGgoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHRyZXR1cm4ge1xyXG4vL1x0XHRjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHZhbCkgeyBiYXNlQ3Rvci5jYWxsKHRoaXMsIHZhbCkgfSxcclxuLy9cdFx0bWV0aG9kMTogZnVuY3Rpb24gKHopIHtcclxuLy9cdFx0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCB6KTtcclxuLy9cdFx0fVxyXG4vL1x0fTtcclxuLy99KTtcclxuXHJcblxyXG4vL3NlbGZUZXN0KCk7XHJcblxyXG4vLy8vLy8vLy8vLy8vLy8vLy9PUFRJT04gMjogZmFzdENsYXNzLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbi8vLy9Vc2luZyBEZWZpbmU6XHJcblxyXG4vLy8vQXRlcm5hdGl2ZSBmb3IgRnVuY3Rpb24uZGVmaW5lIHdlIGNhbiBkbyB0aGlzOlxyXG4vL3ZhciBBID0gZnVuY3Rpb24gKHZhbCkge1xyXG4vLyAgICAgRnVuY3Rpb24uaW5pdE1peGlucyh0aGlzKTsvLyBzaW5jZSB0aGlzIGlzIGEgdG9wIGZ1bmN0aW9uLCB3ZSBuZWVkIHRvIGNhbGwgaW5pdE1peGlucyB0byBtYWtlIHN1cmUgdGhleSB3aWxsIGJlIGluaXRpYWxpemVkLlxyXG4vL1x0dGhpcy52YWwgPSB2YWw7XHJcbi8vfS5kZWZpbmUoe1xyXG4vL1x0bWV0aG9kMTogZnVuY3Rpb24gKHgsIHksIHopIHtcclxuLy9cdFx0dGhpcy54ID0geDtcclxuLy9cdFx0dGhpcy55ID0geTtcclxuLy9cdFx0dGhpcy56ID0gejtcclxuLy9cdH1cclxuLy99KTtcclxuXHJcbi8vLy9UbyBkZWZpbmUgdGhlIHRvcCBsZXZlbCAoZmlyc3QpIGZ1bmN0aW9uIHRoZXJlIGlzIGEgc3VnYXIgKGFzIHdlbGwgYXMgdGhlIGFib3ZlIGFsdGVybmF0aXZlKVxyXG4vL3ZhciBBID0gRnVuY3Rpb24uZGVmaW5lKGZ1bmN0aW9uIEEodmFsKSB7XHJcbi8vICAgICAvLyB3aGVuIHdlIGFyZSBkZWZpbmluIGEgdG9wIGZ1bmN0aW9uIHdpdGggRnVuY3Rpb24uZGVmaW5lIHdlIERPTidUIG5lZWQgdG8gY2FsbCBpbml0TWl4aW5zIGJlY2F1c2UgdGhleSB3aWxsIGJlIGNhbGxlZCBhdXRvbWF0aWNhbGx5IGZvciB1c1xyXG4vL1x0dGhpcy52YWwgPSB2YWw7XHJcbi8vfSwge1xyXG4vL1x0bWV0aG9kMTogZnVuY3Rpb24gKHgsIHksIHopIHtcclxuLy9cdFx0dGhpcy54ID0geDtcclxuLy9cdFx0dGhpcy55ID0geTtcclxuLy9cdFx0dGhpcy56ID0gejtcclxuLy9cdH1cclxuLy99KTtcclxuXHJcblxyXG4vLy8vRm9sbG93IGRlcnJpdmF0aW9ucyB1c2luZyBmYXN0Q2xhc3NcclxuLy92YXIgQiA9IEEuZmFzdENsYXNzKGZ1bmN0aW9uIChiYXNlLCBiYXNlQ3Rvcikge1xyXG4vL1x0dGhpcy5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIEIodmFsKSB7IGJhc2VDdG9yLmNhbGwodGhpcywgdmFsKSB9O1xyXG4vL1x0dGhpcy5tZXRob2QxID0gZnVuY3Rpb24gKHksIHopIHtcclxuLy9cdFx0YmFzZS5tZXRob2QxLmNhbGwodGhpcywgJ3gnLCB5LCB6KTtcclxuLy9cdH1cclxuLy99KTtcclxuLy92YXIgQyA9IEIuZmFzdENsYXNzKGZ1bmN0aW9uIChiYXNlLCBiYXNlQ3Rvcikge1xyXG4vL1x0dGhpcy5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIEModmFsKSB7IGJhc2VDdG9yLmNhbGwodGhpcywgdmFsKSB9O1xyXG4vL1x0dGhpcy5tZXRob2QxID0gZnVuY3Rpb24gKHopIHtcclxuLy9cdFx0YmFzZS5tZXRob2QxLmNhbGwodGhpcywgJ3knLCB6KTtcclxuLy9cdH07XHJcbi8vfSk7XHJcblxyXG4vL3ZhciBEID0gQy5mYXN0Q2xhc3MoZnVuY3Rpb24gKGJhc2UsIGJhc2VDdG9yKSB7XHJcbi8vXHR0aGlzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24gRCh2YWwpIHsgYmFzZUN0b3IuY2FsbCh0aGlzLCB2YWwpIH07XHJcbi8vXHR0aGlzLm1ldGhvZDEgPSBmdW5jdGlvbiAoeikge1xyXG4vL1x0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCB6KTtcclxuLy9cdH07XHJcbi8vfSk7XHJcblxyXG4vLy8vc2VsZlRlc3QoKTtcclxuXHJcbi8vZnVuY3Rpb24gc2VsZlRlc3QoKSB7XHJcbi8vXHR2YXIgYSA9IG5ldyBBKFwiYVwiKTtcclxuLy9cdGEubWV0aG9kMShcInhcIiwgXCJ5XCIsIFwielwiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGEueCA9PSBcInhcIiwgXCJhLnggc2hvdWxkIGJlIHNldCB0byAneCdcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChhLnkgPT0gXCJ5XCIsIFwiYS55IHNob3VsZCBiZSBzZXQgdG8gJ3knXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYS56ID09IFwielwiLCBcImEueiBzaG91bGQgYmUgc2V0IHRvICd6J1wiKTtcclxuLy9cdHZhciBiID0gbmV3IEIoXCJiXCIpO1xyXG4vL1x0Yi5tZXRob2QxKFwieVwiLCBcInpcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChiLnggPT0gXCJ4XCIsIFwiYi54IHNob3VsZCBiZSBzZXQgdG8gJ3gnXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYi55ID09IFwieVwiLCBcImIueSBzaG91bGQgYmUgc2V0IHRvICd5J1wiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGIueiA9PSBcInpcIiwgXCJiLnogc2hvdWxkIGJlIHNldCB0byAneidcIik7XHJcbi8vXHR2YXIgYyA9IG5ldyBDKFwiY1wiKTtcclxuLy9cdGMubWV0aG9kMShcInpcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChjLnggPT0gXCJ4XCIsIFwiYy54IHNob3VsZCBiZSBzZXQgdG8gJ3gnXCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoYy55ID09IFwieVwiLCBcImMueSBzaG91bGQgYmUgc2V0IHRvICd5J1wiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGMueiA9PSBcInpcIiwgXCJjLnogc2hvdWxkIGJlIHNldCB0byAneidcIik7XHJcblxyXG4vL1x0dmFyIGQgPSBuZXcgRChcImRcIik7XHJcbi8vXHRkLm1ldGhvZDEoXCJ3XCIpO1xyXG4vL1x0Y29uc29sZS5hc3NlcnQoZC54ID09IFwieFwiLCBcImQueCBzaG91bGQgYmUgc2V0IHRvICd4J1wiKTtcclxuLy9cdGNvbnNvbGUuYXNzZXJ0KGQueSA9PSBcInlcIiwgXCJkLnkgc2hvdWxkIGJlIHNldCB0byAneSdcIik7XHJcbi8vXHRjb25zb2xlLmFzc2VydChkLnogPT0gXCJ3XCIsIFwiZC56IHNob3VsZCBiZSBzZXQgdG8gJ3cnXCIpO1xyXG5cclxuLy9cdHZhciBleHBlY3RlZHMgPSB7XHJcbi8vXHRcdFwiZCBpbnN0YW5jZW9mIEFcIjogdHJ1ZSxcclxuLy9cdFx0XCJkIGluc3RhbmNlb2YgQlwiOiB0cnVlLFxyXG4vL1x0XHRcImQgaW5zdGFuY2VvZiBDXCI6IHRydWUsXHJcbi8vXHRcdFwiZCBpbnN0YW5jZW9mIERcIjogdHJ1ZSxcclxuLy9cdFx0XCJjIGluc3RhbmNlb2YgQVwiOiB0cnVlLFxyXG4vL1x0XHRcImMgaW5zdGFuY2VvZiBCXCI6IHRydWUsXHJcbi8vXHRcdFwiYyBpbnN0YW5jZW9mIENcIjogdHJ1ZSxcclxuLy9cdFx0XCJiIGluc3RhbmNlb2YgQVwiOiB0cnVlLFxyXG4vL1x0XHRcImIgaW5zdGFuY2VvZiBCXCI6IHRydWUsXHJcbi8vXHRcdFwiYiBpbnN0YW5jZW9mIENcIjogZmFsc2UsXHJcbi8vXHRcdFwiYSBpbnN0YW5jZW9mIEFcIjogdHJ1ZSxcclxuLy9cdFx0XCJhIGluc3RhbmNlb2YgQlwiOiBmYWxzZSxcclxuLy9cdFx0XCJhIGluc3RhbmNlb2YgQ1wiOiBmYWxzZSxcclxuLy9cIkEucHJvdG90eXBlLmNvbnN0cnVjdG9yID09PSBhLmNvbnN0cnVjdG9yICYmIGEuY29uc3RydWN0b3IgPT09IEEuY29uc3RydWN0b3JcIjogdHJ1ZSwvL3RoaXMgc2hvdWxkIG5vdCBlcXVhbCB0byBBIGl0c2VsZiBkdWUgdG8gbWl4aW5zIGJhc2UgZnVuY3Rpb25cclxuLy9cIkIucHJvdG90eXBlLmNvbnN0cnVjdG9yID09PSBiLmNvbnN0cnVjdG9yICYmIGIuY29uc3RydWN0b3IgPT09IEIgJiYgQiA9PSBCLmNvbnN0cnVjdG9yXCI6IHRydWUsXHJcbi8vXCJDLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9PT0gYy5jb25zdHJ1Y3RvciAmJiBjLmNvbnN0cnVjdG9yID09PSBDICYmIEIgPT0gQi5jb25zdHJ1Y3RvclwiOiB0cnVlLFxyXG4vL1wiRC5wcm90b3R5cGUuY29uc3RydWN0b3IgPT09IGQuY29uc3RydWN0b3IgJiYgZC5jb25zdHJ1Y3RvciA9PT0gRCAmJiBCID09IEIuY29uc3RydWN0b3JcIjogdHJ1ZSxcclxuLy99XHJcbi8vXHRmb3IgKHZhciBleHBlY3RlZEtleSBpbiBleHBlY3RlZHMpIHtcclxuLy9cdFx0dmFyIGV4cGVjdGVkID0gZXhwZWN0ZWRzW2V4cGVjdGVkS2V5XTtcclxuLy9cdFx0dmFyIGFjdHVhbCA9IGV2YWwoZXhwZWN0ZWRLZXkpOy8vdXNpbmcgZXZhbCBmb3IgcXVpY2sgZGVtbyBzZWxmIHRlc3QgcHVycG9zaW5nIC0tIHVzaW5nIGV2YWwgaXMgbm90IHJlY29tbWVuZGVkIG90aGVyd2lzZVxyXG4vL1x0XHRjb25zb2xlLmFzc2VydCghKGV4cGVjdGVkIF4gYWN0dWFsKSwgZXhwZWN0ZWRLZXkgKyBcIiBleHBlY3RlZDogXCIgKyBleHBlY3RlZCArIFwiLCBhY3R1YWw6IFwiICsgYWN0dWFsKTtcclxuLy9cdH1cclxuLy99XHJcbi8vY29uc29sZS5sb2coXCJJZiB0aGVyZSBhcmUgbm8gYXNzZXJ0cyBpbiB0aGUgY29uc29sZSB0aGVuIGFsbCB0ZXN0cyBoYXZlIHBhc3NlZCEgeWV5IDopXCIpXHJcblxyXG4vLy8vZGVmaW5pbmcgYSBtaXhpblxyXG4vL3ZhciBQb2ludCA9IGZ1bmN0aW9uIFBvaW50KCkge1xyXG4vL1x0dGhpcy5wb2ludCA9IHsgeDogMSwgeTogMiB9O1xyXG4vL30uZGVmaW5lKHtcclxuLy9cdHg6IGZ1bmN0aW9uIHgoeCkge1xyXG4vL1x0XHQvLy8gPHBhcmFtIG5hbWU9XCJ4XCIgb3B0aW9uYWw9XCJ0cnVlXCI+U3BlY2lmeSBhIHZhbHVlIHRvIHNldCB0aGUgcG9pbnQueC4gRG9uJ3Qgc3BlY2lmeSBhbnl0aGluZyB3aWxsIHJldHJpZXZlIHBvaW50Lng8L3BhcmFtPlxyXG4vL1x0XHRyZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0aGlzLnBvaW50LnggPSB4KSAmJiB0aGlzIHx8IHRoaXMgOiB0aGlzLnBvaW50Lng7XHJcbi8vXHR9LFxyXG4vL1x0eTogZnVuY3Rpb24geSh5KSB7XHJcbi8vXHRcdC8vLyA8cGFyYW0gbmFtZT1cInlcIiBvcHRpb25hbD1cInRydWVcIj5TcGVjaWZ5IGEgdmFsdWUgdG8gc2V0IHRoZSBwb2ludC55LiBEb24ndCBzcGVjaWZ5IGFueXRoaW5nIHdpbGwgcmV0cmlldmUgcG9pbnQueTwvcGFyYW0+XHJcbi8vXHRcdHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHRoaXMucG9pbnQueSA9IHkpICYmIHRoaXMgfHwgdGhpcyA6IHRoaXMucG9pbnQueTtcclxuLy9cdH1cclxuLy99KTtcclxuXHJcbi8vLy9yZWZlcmVuY2luZyB0aGUgbWl4aW46XHJcbi8vdmFyIEUgPSBELmluaGVyaXRXaXRoKGZ1bmN0aW9uIChiYXNlLCBiYXNlQ3Rvcikge1xyXG4vL1x0cmV0dXJuIHtcclxuLy9cdFx0Ly9ubyBjb25zdHJ1Y3RvciAhISAtIGl0IHdpbGwgYmUgYWRkZWQgYXV0b21hdGljYWxseSBmb3IgdXNcclxuLy9cdFx0bWV0aG9kMTogZnVuY3Rpb24gKHopIHtcclxuLy9cdFx0XHRiYXNlLm1ldGhvZDEuY2FsbCh0aGlzLCB6KTtcclxuLy9cdFx0fVxyXG4vL1x0fTtcclxuLy99LCBQb2ludC8vc3BlY2lmeWluZyB6ZXJvIG9yIG1vcmUgbWl4aW5zIC0gY29tbWEgc2VwYXJhdGVkXHJcbi8vKTtcclxuXHJcbi8vdmFyIGUgPSBuZXcgRSgpO1xyXG4vL2UueCgyKTsvL3NldHMgZS5wb2ludC54IHRvIDJcclxuLy9jb25zb2xlLmxvZyhcIm1peGluIFBvaW50LnggZXhwZWN0ZWQgdG8gcmV0dXJuIDIuIEFjdHVhbDogXCIsIGUueCgpKTsvL3JldHVybnMgMlxyXG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLy8gS25vY2tvdXQgSmF2YVNjcmlwdCBsaWJyYXJ5IHYzLjEuMFxuLy8gKGMpIFN0ZXZlbiBTYW5kZXJzb24gLSBodHRwOi8va25vY2tvdXRqcy5jb20vXG4vLyBMaWNlbnNlOiBNSVQgKGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwKVxuXG4oZnVuY3Rpb24oKXtcbnZhciBERUJVRz10cnVlO1xuKGZ1bmN0aW9uKHVuZGVmaW5lZCl7XG4gICAgLy8gKDAsIGV2YWwpKCd0aGlzJykgaXMgYSByb2J1c3Qgd2F5IG9mIGdldHRpbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3RcbiAgICAvLyBGb3IgZGV0YWlscywgc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQxMTk5ODgvcmV0dXJuLXRoaXMtMC1ldmFsdGhpcy8xNDEyMDAyMyMxNDEyMDAyM1xuICAgIHZhciB3aW5kb3cgPSB0aGlzIHx8ICgwLCBldmFsKSgndGhpcycpLFxuICAgICAgICBkb2N1bWVudCA9IHdpbmRvd1snZG9jdW1lbnQnXSxcbiAgICAgICAgbmF2aWdhdG9yID0gd2luZG93WyduYXZpZ2F0b3InXSxcbiAgICAgICAgalF1ZXJ5ID0gd2luZG93W1wialF1ZXJ5XCJdLFxuICAgICAgICBKU09OID0gd2luZG93W1wiSlNPTlwiXTtcbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgLy8gU3VwcG9ydCB0aHJlZSBtb2R1bGUgbG9hZGluZyBzY2VuYXJpb3NcbiAgICBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIFsxXSBDb21tb25KUy9Ob2RlLmpzXG4gICAgICAgIHZhciB0YXJnZXQgPSBtb2R1bGVbJ2V4cG9ydHMnXSB8fCBleHBvcnRzOyAvLyBtb2R1bGUuZXhwb3J0cyBpcyBmb3IgTm9kZS5qc1xuICAgICAgICBmYWN0b3J5KHRhcmdldCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pIHtcbiAgICAgICAgLy8gWzJdIEFNRCBhbm9ueW1vdXMgbW9kdWxlXG4gICAgICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gWzNdIE5vIG1vZHVsZSBsb2FkZXIgKHBsYWluIDxzY3JpcHQ+IHRhZykgLSBwdXQgZGlyZWN0bHkgaW4gZ2xvYmFsIG5hbWVzcGFjZVxuICAgICAgICBmYWN0b3J5KHdpbmRvd1sna28nXSA9IHt9KTtcbiAgICB9XG59KGZ1bmN0aW9uKGtvRXhwb3J0cyl7XG4vLyBJbnRlcm5hbGx5LCBhbGwgS08gb2JqZWN0cyBhcmUgYXR0YWNoZWQgdG8ga29FeHBvcnRzIChldmVuIHRoZSBub24tZXhwb3J0ZWQgb25lcyB3aG9zZSBuYW1lcyB3aWxsIGJlIG1pbmlmaWVkIGJ5IHRoZSBjbG9zdXJlIGNvbXBpbGVyKS5cbi8vIEluIHRoZSBmdXR1cmUsIHRoZSBmb2xsb3dpbmcgXCJrb1wiIHZhcmlhYmxlIG1heSBiZSBtYWRlIGRpc3RpbmN0IGZyb20gXCJrb0V4cG9ydHNcIiBzbyB0aGF0IHByaXZhdGUgb2JqZWN0cyBhcmUgbm90IGV4dGVybmFsbHkgcmVhY2hhYmxlLlxudmFyIGtvID0gdHlwZW9mIGtvRXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgPyBrb0V4cG9ydHMgOiB7fTtcbi8vIEdvb2dsZSBDbG9zdXJlIENvbXBpbGVyIGhlbHBlcnMgKHVzZWQgb25seSB0byBtYWtlIHRoZSBtaW5pZmllZCBmaWxlIHNtYWxsZXIpXG5rby5leHBvcnRTeW1ib2wgPSBmdW5jdGlvbihrb1BhdGgsIG9iamVjdCkge1xuXHR2YXIgdG9rZW5zID0ga29QYXRoLnNwbGl0KFwiLlwiKTtcblxuXHQvLyBJbiB0aGUgZnV0dXJlLCBcImtvXCIgbWF5IGJlY29tZSBkaXN0aW5jdCBmcm9tIFwia29FeHBvcnRzXCIgKHNvIHRoYXQgbm9uLWV4cG9ydGVkIG9iamVjdHMgYXJlIG5vdCByZWFjaGFibGUpXG5cdC8vIEF0IHRoYXQgcG9pbnQsIFwidGFyZ2V0XCIgd291bGQgYmUgc2V0IHRvOiAodHlwZW9mIGtvRXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIiA/IGtvRXhwb3J0cyA6IGtvKVxuXHR2YXIgdGFyZ2V0ID0ga287XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoIC0gMTsgaSsrKVxuXHRcdHRhcmdldCA9IHRhcmdldFt0b2tlbnNbaV1dO1xuXHR0YXJnZXRbdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXV0gPSBvYmplY3Q7XG59O1xua28uZXhwb3J0UHJvcGVydHkgPSBmdW5jdGlvbihvd25lciwgcHVibGljTmFtZSwgb2JqZWN0KSB7XG4gIG93bmVyW3B1YmxpY05hbWVdID0gb2JqZWN0O1xufTtcbmtvLnZlcnNpb24gPSBcIjMuMS4wXCI7XG5cbmtvLmV4cG9ydFN5bWJvbCgndmVyc2lvbicsIGtvLnZlcnNpb24pO1xua28udXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIG9iamVjdEZvckVhY2gob2JqLCBhY3Rpb24pIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb24ocHJvcCwgb2JqW3Byb3BdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQsIHNvdXJjZSkge1xuICAgICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgICAgICBmb3IodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYoc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihvYmosIHByb3RvKSB7XG4gICAgICAgIG9iai5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG5cbiAgICB2YXIgY2FuU2V0UHJvdG90eXBlID0gKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkpO1xuXG4gICAgLy8gUmVwcmVzZW50IHRoZSBrbm93biBldmVudCB0eXBlcyBpbiBhIGNvbXBhY3Qgd2F5LCB0aGVuIGF0IHJ1bnRpbWUgdHJhbnNmb3JtIGl0IGludG8gYSBoYXNoIHdpdGggZXZlbnQgbmFtZSBhcyBrZXkgKGZvciBmYXN0IGxvb2t1cClcbiAgICB2YXIga25vd25FdmVudHMgPSB7fSwga25vd25FdmVudFR5cGVzQnlFdmVudE5hbWUgPSB7fTtcbiAgICB2YXIga2V5RXZlbnRUeXBlTmFtZSA9IChuYXZpZ2F0b3IgJiYgL0ZpcmVmb3hcXC8yL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkgPyAnS2V5Ym9hcmRFdmVudCcgOiAnVUlFdmVudHMnO1xuICAgIGtub3duRXZlbnRzW2tleUV2ZW50VHlwZU5hbWVdID0gWydrZXl1cCcsICdrZXlkb3duJywgJ2tleXByZXNzJ107XG4gICAga25vd25FdmVudHNbJ01vdXNlRXZlbnRzJ10gPSBbJ2NsaWNrJywgJ2RibGNsaWNrJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlbW92ZScsICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJ107XG4gICAgb2JqZWN0Rm9yRWFjaChrbm93bkV2ZW50cywgZnVuY3Rpb24oZXZlbnRUeXBlLCBrbm93bkV2ZW50c0ZvclR5cGUpIHtcbiAgICAgICAgaWYgKGtub3duRXZlbnRzRm9yVHlwZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0ga25vd25FdmVudHNGb3JUeXBlLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBrbm93bkV2ZW50VHlwZXNCeUV2ZW50TmFtZVtrbm93bkV2ZW50c0ZvclR5cGVbaV1dID0gZXZlbnRUeXBlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdmFyIGV2ZW50c1RoYXRNdXN0QmVSZWdpc3RlcmVkVXNpbmdBdHRhY2hFdmVudCA9IHsgJ3Byb3BlcnR5Y2hhbmdlJzogdHJ1ZSB9OyAvLyBXb3JrYXJvdW5kIGZvciBhbiBJRTkgaXNzdWUgLSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzQwNlxuXG4gICAgLy8gRGV0ZWN0IElFIHZlcnNpb25zIGZvciBidWcgd29ya2Fyb3VuZHMgKHVzZXMgSUUgY29uZGl0aW9uYWxzLCBub3QgVUEgc3RyaW5nLCBmb3Igcm9idXN0bmVzcylcbiAgICAvLyBOb3RlIHRoYXQsIHNpbmNlIElFIDEwIGRvZXMgbm90IHN1cHBvcnQgY29uZGl0aW9uYWwgY29tbWVudHMsIHRoZSBmb2xsb3dpbmcgbG9naWMgb25seSBkZXRlY3RzIElFIDwgMTAuXG4gICAgLy8gQ3VycmVudGx5IHRoaXMgaXMgYnkgZGVzaWduLCBzaW5jZSBJRSAxMCsgYmVoYXZlcyBjb3JyZWN0bHkgd2hlbiB0cmVhdGVkIGFzIGEgc3RhbmRhcmQgYnJvd3Nlci5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIGZ1dHVyZSBuZWVkIHRvIGRldGVjdCBzcGVjaWZpYyB2ZXJzaW9ucyBvZiBJRTEwKywgd2Ugd2lsbCBhbWVuZCB0aGlzLlxuICAgIHZhciBpZVZlcnNpb24gPSBkb2N1bWVudCAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2ZXJzaW9uID0gMywgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIGlFbGVtcyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaScpO1xuXG4gICAgICAgIC8vIEtlZXAgY29uc3RydWN0aW5nIGNvbmRpdGlvbmFsIEhUTUwgYmxvY2tzIHVudGlsIHdlIGhpdCBvbmUgdGhhdCByZXNvbHZlcyB0byBhbiBlbXB0eSBmcmFnbWVudFxuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0gJzwhLS1baWYgZ3QgSUUgJyArICgrK3ZlcnNpb24pICsgJ10+PGk+PC9pPjwhW2VuZGlmXS0tPicsXG4gICAgICAgICAgICBpRWxlbXNbMF1cbiAgICAgICAgKSB7fVxuICAgICAgICByZXR1cm4gdmVyc2lvbiA+IDQgPyB2ZXJzaW9uIDogdW5kZWZpbmVkO1xuICAgIH0oKSk7XG4gICAgdmFyIGlzSWU2ID0gaWVWZXJzaW9uID09PSA2LFxuICAgICAgICBpc0llNyA9IGllVmVyc2lvbiA9PT0gNztcblxuICAgIGZ1bmN0aW9uIGlzQ2xpY2tPbkNoZWNrYWJsZUVsZW1lbnQoZWxlbWVudCwgZXZlbnRUeXBlKSB7XG4gICAgICAgIGlmICgoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpICE9PSBcImlucHV0XCIpIHx8ICFlbGVtZW50LnR5cGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpICE9IFwiY2xpY2tcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgaW5wdXRUeXBlID0gZWxlbWVudC50eXBlO1xuICAgICAgICByZXR1cm4gKGlucHV0VHlwZSA9PSBcImNoZWNrYm94XCIpIHx8IChpbnB1dFR5cGUgPT0gXCJyYWRpb1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmaWVsZHNJbmNsdWRlZFdpdGhKc29uUG9zdDogWydhdXRoZW50aWNpdHlfdG9rZW4nLCAvXl9fUmVxdWVzdFZlcmlmaWNhdGlvblRva2VuKF8uKik/JC9dLFxuXG4gICAgICAgIGFycmF5Rm9yRWFjaDogZnVuY3Rpb24gKGFycmF5LCBhY3Rpb24pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIGFjdGlvbihhcnJheVtpXSwgaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlJbmRleE9mOiBmdW5jdGlvbiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGFycmF5LCBpdGVtKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gYXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlGaXJzdDogZnVuY3Rpb24gKGFycmF5LCBwcmVkaWNhdGUsIHByZWRpY2F0ZU93bmVyKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlLmNhbGwocHJlZGljYXRlT3duZXIsIGFycmF5W2ldLCBpKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5W2ldO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlSZW1vdmVJdGVtOiBmdW5jdGlvbiAoYXJyYXksIGl0ZW1Ub1JlbW92ZSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0ga28udXRpbHMuYXJyYXlJbmRleE9mKGFycmF5LCBpdGVtVG9SZW1vdmUpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGFycmF5LnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXJyYXlHZXREaXN0aW5jdFZhbHVlczogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgICAgICAgICBhcnJheSA9IGFycmF5IHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoa28udXRpbHMuYXJyYXlJbmRleE9mKHJlc3VsdCwgYXJyYXlbaV0pIDwgMClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheU1hcDogZnVuY3Rpb24gKGFycmF5LCBtYXBwaW5nKSB7XG4gICAgICAgICAgICBhcnJheSA9IGFycmF5IHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBhcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobWFwcGluZyhhcnJheVtpXSwgaSkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheUZpbHRlcjogZnVuY3Rpb24gKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICAgICAgICAgIGFycmF5ID0gYXJyYXkgfHwgW107XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICBpZiAocHJlZGljYXRlKGFycmF5W2ldLCBpKSlcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBhcnJheVB1c2hBbGw6IGZ1bmN0aW9uIChhcnJheSwgdmFsdWVzVG9QdXNoKSB7XG4gICAgICAgICAgICBpZiAodmFsdWVzVG9QdXNoIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaC5hcHBseShhcnJheSwgdmFsdWVzVG9QdXNoKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZhbHVlc1RvUHVzaC5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWVzVG9QdXNoW2ldKTtcbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRPclJlbW92ZUl0ZW06IGZ1bmN0aW9uKGFycmF5LCB2YWx1ZSwgaW5jbHVkZWQpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZ0VudHJ5SW5kZXggPSBrby51dGlscy5hcnJheUluZGV4T2Yoa28udXRpbHMucGVla09ic2VydmFibGUoYXJyYXkpLCB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdFbnRyeUluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlZClcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghaW5jbHVkZWQpXG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnNwbGljZShleGlzdGluZ0VudHJ5SW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhblNldFByb3RvdHlwZTogY2FuU2V0UHJvdG90eXBlLFxuXG4gICAgICAgIGV4dGVuZDogZXh0ZW5kLFxuXG4gICAgICAgIHNldFByb3RvdHlwZU9mOiBzZXRQcm90b3R5cGVPZixcblxuICAgICAgICBzZXRQcm90b3R5cGVPZk9yRXh0ZW5kOiBjYW5TZXRQcm90b3R5cGUgPyBzZXRQcm90b3R5cGVPZiA6IGV4dGVuZCxcblxuICAgICAgICBvYmplY3RGb3JFYWNoOiBvYmplY3RGb3JFYWNoLFxuXG4gICAgICAgIG9iamVjdE1hcDogZnVuY3Rpb24oc291cmNlLCBtYXBwaW5nKSB7XG4gICAgICAgICAgICBpZiAoIXNvdXJjZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IG1hcHBpbmcoc291cmNlW3Byb3BdLCBwcm9wLCBzb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW1wdHlEb21Ob2RlOiBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgd2hpbGUgKGRvbU5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGtvLnJlbW92ZU5vZGUoZG9tTm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlQ2xlYW5lZE5vZGVzVG9Db250YWluZXJFbGVtZW50OiBmdW5jdGlvbihub2Rlcykge1xuICAgICAgICAgICAgLy8gRW5zdXJlIGl0J3MgYSByZWFsIGFycmF5LCBhcyB3ZSdyZSBhYm91dCB0byByZXBhcmVudCB0aGUgbm9kZXMgYW5kXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRoZSB1bmRlcmx5aW5nIGNvbGxlY3Rpb24gdG8gY2hhbmdlIHdoaWxlIHdlJ3JlIGRvaW5nIHRoYXQuXG4gICAgICAgICAgICB2YXIgbm9kZXNBcnJheSA9IGtvLnV0aWxzLm1ha2VBcnJheShub2Rlcyk7XG5cbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbm9kZXNBcnJheS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoa28uY2xlYW5Ob2RlKG5vZGVzQXJyYXlbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvbmVOb2RlczogZnVuY3Rpb24gKG5vZGVzQXJyYXksIHNob3VsZENsZWFuTm9kZXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gbm9kZXNBcnJheS5sZW5ndGgsIG5ld05vZGVzQXJyYXkgPSBbXTsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjbG9uZWROb2RlID0gbm9kZXNBcnJheVtpXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgbmV3Tm9kZXNBcnJheS5wdXNoKHNob3VsZENsZWFuTm9kZXMgPyBrby5jbGVhbk5vZGUoY2xvbmVkTm9kZSkgOiBjbG9uZWROb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXdOb2Rlc0FycmF5O1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldERvbU5vZGVDaGlsZHJlbjogZnVuY3Rpb24gKGRvbU5vZGUsIGNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmVtcHR5RG9tTm9kZShkb21Ob2RlKTtcbiAgICAgICAgICAgIGlmIChjaGlsZE5vZGVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBjaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGo7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5hcHBlbmRDaGlsZChjaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXBsYWNlRG9tTm9kZXM6IGZ1bmN0aW9uIChub2RlVG9SZXBsYWNlT3JOb2RlQXJyYXksIG5ld05vZGVzQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBub2Rlc1RvUmVwbGFjZUFycmF5ID0gbm9kZVRvUmVwbGFjZU9yTm9kZUFycmF5Lm5vZGVUeXBlID8gW25vZGVUb1JlcGxhY2VPck5vZGVBcnJheV0gOiBub2RlVG9SZXBsYWNlT3JOb2RlQXJyYXk7XG4gICAgICAgICAgICBpZiAobm9kZXNUb1JlcGxhY2VBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluc2VydGlvblBvaW50ID0gbm9kZXNUb1JlcGxhY2VBcnJheVswXTtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50ID0gaW5zZXJ0aW9uUG9pbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IG5ld05vZGVzQXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5ld05vZGVzQXJyYXlbaV0sIGluc2VydGlvblBvaW50KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IG5vZGVzVG9SZXBsYWNlQXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnJlbW92ZU5vZGUobm9kZXNUb1JlcGxhY2VBcnJheVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFVwQ29udGludW91c05vZGVBcnJheTogZnVuY3Rpb24oY29udGludW91c05vZGVBcnJheSwgcGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgLy8gQmVmb3JlIGFjdGluZyBvbiBhIHNldCBvZiBub2RlcyB0aGF0IHdlcmUgcHJldmlvdXNseSBvdXRwdXR0ZWQgYnkgYSB0ZW1wbGF0ZSBmdW5jdGlvbiwgd2UgaGF2ZSB0byByZWNvbmNpbGVcbiAgICAgICAgICAgIC8vIHRoZW0gYWdhaW5zdCB3aGF0IGlzIGluIHRoZSBET00gcmlnaHQgbm93LiBJdCBtYXkgYmUgdGhhdCBzb21lIG9mIHRoZSBub2RlcyBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkLCBvciB0aGF0XG4gICAgICAgICAgICAvLyBuZXcgbm9kZXMgbWlnaHQgaGF2ZSBiZWVuIGluc2VydGVkIGluIHRoZSBtaWRkbGUsIGZvciBleGFtcGxlIGJ5IGEgYmluZGluZy4gQWxzbywgdGhlcmUgbWF5IHByZXZpb3VzbHkgaGF2ZSBiZWVuXG4gICAgICAgICAgICAvLyBsZWFkaW5nIGNvbW1lbnQgbm9kZXMgKGNyZWF0ZWQgYnkgcmV3cml0dGVuIHN0cmluZy1iYXNlZCB0ZW1wbGF0ZXMpIHRoYXQgaGF2ZSBzaW5jZSBiZWVuIHJlbW92ZWQgZHVyaW5nIGJpbmRpbmcuXG4gICAgICAgICAgICAvLyBTbywgdGhpcyBmdW5jdGlvbiB0cmFuc2xhdGVzIHRoZSBvbGQgXCJtYXBcIiBvdXRwdXQgYXJyYXkgaW50byBpdHMgYmVzdCBndWVzcyBvZiB0aGUgc2V0IG9mIGN1cnJlbnQgRE9NIG5vZGVzLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFJ1bGVzOlxuICAgICAgICAgICAgLy8gICBbQV0gQW55IGxlYWRpbmcgbm9kZXMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCBzaG91bGQgYmUgaWdub3JlZFxuICAgICAgICAgICAgLy8gICAgICAgVGhlc2UgbW9zdCBsaWtlbHkgY29ycmVzcG9uZCB0byBtZW1vaXphdGlvbiBub2RlcyB0aGF0IHdlcmUgYWxyZWFkeSByZW1vdmVkIGR1cmluZyBiaW5kaW5nXG4gICAgICAgICAgICAvLyAgICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L3B1bGwvNDQwXG4gICAgICAgICAgICAvLyAgIFtCXSBXZSB3YW50IHRvIG91dHB1dCBhIGNvbnRpbnVvdXMgc2VyaWVzIG9mIG5vZGVzLiBTbywgaWdub3JlIGFueSBub2RlcyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIHJlbW92ZWQsXG4gICAgICAgICAgICAvLyAgICAgICBhbmQgaW5jbHVkZSBhbnkgbm9kZXMgdGhhdCBoYXZlIGJlZW4gaW5zZXJ0ZWQgYW1vbmcgdGhlIHByZXZpb3VzIGNvbGxlY3Rpb25cblxuICAgICAgICAgICAgaWYgKGNvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHBhcmVudCBub2RlIGNhbiBiZSBhIHZpcnR1YWwgZWxlbWVudDsgc28gZ2V0IHRoZSByZWFsIHBhcmVudCBub2RlXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IChwYXJlbnROb2RlLm5vZGVUeXBlID09PSA4ICYmIHBhcmVudE5vZGUucGFyZW50Tm9kZSkgfHwgcGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgIC8vIFJ1bGUgW0FdXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoICYmIGNvbnRpbnVvdXNOb2RlQXJyYXlbMF0ucGFyZW50Tm9kZSAhPT0gcGFyZW50Tm9kZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5zaGlmdCgpO1xuXG4gICAgICAgICAgICAgICAgLy8gUnVsZSBbQl1cbiAgICAgICAgICAgICAgICBpZiAoY29udGludW91c05vZGVBcnJheS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50ID0gY29udGludW91c05vZGVBcnJheVswXSwgbGFzdCA9IGNvbnRpbnVvdXNOb2RlQXJyYXlbY29udGludW91c05vZGVBcnJheS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVwbGFjZSB3aXRoIHRoZSBhY3R1YWwgbmV3IGNvbnRpbnVvdXMgbm9kZSBzZXRcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudCAhPT0gbGFzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5wdXNoKGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnQpIC8vIFdvbid0IGhhcHBlbiwgZXhjZXB0IGlmIHRoZSBkZXZlbG9wZXIgaGFzIG1hbnVhbGx5IHJlbW92ZWQgc29tZSBET00gZWxlbWVudHMgKHRoZW4gd2UncmUgaW4gYW4gdW5kZWZpbmVkIHNjZW5hcmlvKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb250aW51b3VzTm9kZUFycmF5LnB1c2gobGFzdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbnRpbnVvdXNOb2RlQXJyYXk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0T3B0aW9uTm9kZVNlbGVjdGlvblN0YXRlOiBmdW5jdGlvbiAob3B0aW9uTm9kZSwgaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgLy8gSUU2IHNvbWV0aW1lcyB0aHJvd3MgXCJ1bmtub3duIGVycm9yXCIgaWYgeW91IHRyeSB0byB3cml0ZSB0byAuc2VsZWN0ZWQgZGlyZWN0bHksIHdoZXJlYXMgRmlyZWZveCBzdHJ1Z2dsZXMgd2l0aCBzZXRBdHRyaWJ1dGUuIFBpY2sgb25lIGJhc2VkIG9uIGJyb3dzZXIuXG4gICAgICAgICAgICBpZiAoaWVWZXJzaW9uIDwgNylcbiAgICAgICAgICAgICAgICBvcHRpb25Ob2RlLnNldEF0dHJpYnV0ZShcInNlbGVjdGVkXCIsIGlzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9wdGlvbk5vZGUuc2VsZWN0ZWQgPSBpc1NlbGVjdGVkO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0cmluZ1RyaW06IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcgPT09IG51bGwgfHwgc3RyaW5nID09PSB1bmRlZmluZWQgPyAnJyA6XG4gICAgICAgICAgICAgICAgc3RyaW5nLnRyaW0gP1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcudHJpbSgpIDpcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nLnRvU3RyaW5nKCkucmVwbGFjZSgvXltcXHNcXHhhMF0rfFtcXHNcXHhhMF0rJC9nLCAnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyaW5nVG9rZW5pemU6IGZ1bmN0aW9uIChzdHJpbmcsIGRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgdmFyIHRva2VucyA9IChzdHJpbmcgfHwgXCJcIikuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gdG9rZW5zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB0cmltbWVkID0ga28udXRpbHMuc3RyaW5nVHJpbSh0b2tlbnNbaV0pO1xuICAgICAgICAgICAgICAgIGlmICh0cmltbWVkICE9PSBcIlwiKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0cmltbWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyaW5nU3RhcnRzV2l0aDogZnVuY3Rpb24gKHN0cmluZywgc3RhcnRzV2l0aCkge1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nIHx8IFwiXCI7XG4gICAgICAgICAgICBpZiAoc3RhcnRzV2l0aC5sZW5ndGggPiBzdHJpbmcubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuc3Vic3RyaW5nKDAsIHN0YXJ0c1dpdGgubGVuZ3RoKSA9PT0gc3RhcnRzV2l0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBkb21Ob2RlSXNDb250YWluZWRCeTogZnVuY3Rpb24gKG5vZGUsIGNvbnRhaW5lZEJ5Tm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUgPT09IGNvbnRhaW5lZEJ5Tm9kZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEZpeGVzIGlzc3VlICMxMTYyIC0gY2FuJ3QgdXNlIG5vZGUuY29udGFpbnMgZm9yIGRvY3VtZW50IGZyYWdtZW50cyBvbiBJRThcbiAgICAgICAgICAgIGlmIChjb250YWluZWRCeU5vZGUuY29udGFpbnMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lZEJ5Tm9kZS5jb250YWlucyhub2RlLm5vZGVUeXBlID09PSAzID8gbm9kZS5wYXJlbnROb2RlIDogbm9kZSk7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVkQnlOb2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIHJldHVybiAoY29udGFpbmVkQnlOb2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5vZGUpICYgMTYpID09IDE2O1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPSBjb250YWluZWRCeU5vZGUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICEhbm9kZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQ6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4ga28udXRpbHMuZG9tTm9kZUlzQ29udGFpbmVkQnkobm9kZSwgbm9kZS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYW55RG9tTm9kZUlzQXR0YWNoZWRUb0RvY3VtZW50OiBmdW5jdGlvbihub2Rlcykge1xuICAgICAgICAgICAgcmV0dXJuICEha28udXRpbHMuYXJyYXlGaXJzdChub2Rlcywga28udXRpbHMuZG9tTm9kZUlzQXR0YWNoZWRUb0RvY3VtZW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICB0YWdOYW1lTG93ZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIEZvciBIVE1MIGVsZW1lbnRzLCB0YWdOYW1lIHdpbGwgYWx3YXlzIGJlIHVwcGVyIGNhc2U7IGZvciBYSFRNTCBlbGVtZW50cywgaXQnbGwgYmUgbG93ZXIgY2FzZS5cbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIGZ1dHVyZSBvcHRpbWl6YXRpb246IElmIHdlIGtub3cgaXQncyBhbiBlbGVtZW50IGZyb20gYW4gWEhUTUwgZG9jdW1lbnQgKG5vdCBIVE1MKSxcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZG8gdGhlIC50b0xvd2VyQ2FzZSgpIGFzIGl0IHdpbGwgYWx3YXlzIGJlIGxvd2VyIGNhc2UgYW55d2F5LlxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudC50YWdOYW1lICYmIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVyOiBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnRUeXBlLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICB2YXIgbXVzdFVzZUF0dGFjaEV2ZW50ID0gaWVWZXJzaW9uICYmIGV2ZW50c1RoYXRNdXN0QmVSZWdpc3RlcmVkVXNpbmdBdHRhY2hFdmVudFtldmVudFR5cGVdO1xuICAgICAgICAgICAgaWYgKCFtdXN0VXNlQXR0YWNoRXZlbnQgJiYgalF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KGVsZW1lbnQpWydiaW5kJ10oZXZlbnRUeXBlLCBoYW5kbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIW11c3RVc2VBdHRhY2hFdmVudCAmJiB0eXBlb2YgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyID09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZWxlbWVudC5hdHRhY2hFdmVudCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF0dGFjaEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkgeyBoYW5kbGVyLmNhbGwoZWxlbWVudCwgZXZlbnQpOyB9LFxuICAgICAgICAgICAgICAgICAgICBhdHRhY2hFdmVudE5hbWUgPSBcIm9uXCIgKyBldmVudFR5cGU7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hdHRhY2hFdmVudChhdHRhY2hFdmVudE5hbWUsIGF0dGFjaEV2ZW50SGFuZGxlcik7XG5cbiAgICAgICAgICAgICAgICAvLyBJRSBkb2VzIG5vdCBkaXNwb3NlIGF0dGFjaEV2ZW50IGhhbmRsZXJzIGF1dG9tYXRpY2FsbHkgKHVubGlrZSB3aXRoIGFkZEV2ZW50TGlzdGVuZXIpXG4gICAgICAgICAgICAgICAgLy8gc28gdG8gYXZvaWQgbGVha3MsIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZW0gbWFudWFsbHkuIFNlZSBidWcgIzg1NlxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5hZGREaXNwb3NlQ2FsbGJhY2soZWxlbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGV0YWNoRXZlbnQoYXR0YWNoRXZlbnROYW1lLCBhdHRhY2hFdmVudEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudFwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmlnZ2VyRXZlbnQ6IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudFR5cGUpIHtcbiAgICAgICAgICAgIGlmICghKGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlVHlwZSkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZWxlbWVudCBtdXN0IGJlIGEgRE9NIG5vZGUgd2hlbiBjYWxsaW5nIHRyaWdnZXJFdmVudFwiKTtcblxuICAgICAgICAgICAgLy8gRm9yIGNsaWNrIGV2ZW50cyBvbiBjaGVja2JveGVzIGFuZCByYWRpbyBidXR0b25zLCBqUXVlcnkgdG9nZ2xlcyB0aGUgZWxlbWVudCBjaGVja2VkIHN0YXRlICphZnRlciogdGhlXG4gICAgICAgICAgICAvLyBldmVudCBoYW5kbGVyIHJ1bnMgaW5zdGVhZCBvZiAqYmVmb3JlKi4gKFRoaXMgd2FzIGZpeGVkIGluIDEuOSBmb3IgY2hlY2tib3hlcyBidXQgbm90IGZvciByYWRpbyBidXR0b25zLilcbiAgICAgICAgICAgIC8vIElFIGRvZXNuJ3QgY2hhbmdlIHRoZSBjaGVja2VkIHN0YXRlIHdoZW4geW91IHRyaWdnZXIgdGhlIGNsaWNrIGV2ZW50IHVzaW5nIFwiZmlyZUV2ZW50XCIuXG4gICAgICAgICAgICAvLyBJbiBib3RoIGNhc2VzLCB3ZSdsbCB1c2UgdGhlIGNsaWNrIG1ldGhvZCBpbnN0ZWFkLlxuICAgICAgICAgICAgdmFyIHVzZUNsaWNrV29ya2Fyb3VuZCA9IGlzQ2xpY2tPbkNoZWNrYWJsZUVsZW1lbnQoZWxlbWVudCwgZXZlbnRUeXBlKTtcblxuICAgICAgICAgICAgaWYgKGpRdWVyeSAmJiAhdXNlQ2xpY2tXb3JrYXJvdW5kKSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KGVsZW1lbnQpWyd0cmlnZ2VyJ10oZXZlbnRUeXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5kaXNwYXRjaEV2ZW50ID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnRDYXRlZ29yeSA9IGtub3duRXZlbnRUeXBlc0J5RXZlbnROYW1lW2V2ZW50VHlwZV0gfHwgXCJIVE1MRXZlbnRzXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KGV2ZW50Q2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDAsIDAsIDAsIDAsIDAsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgZWxlbWVudCBkb2Vzbid0IHN1cHBvcnQgZGlzcGF0Y2hFdmVudFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlQ2xpY2tXb3JrYXJvdW5kICYmIGVsZW1lbnQuY2xpY2spIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsaWNrKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtZW50LmZpcmVFdmVudCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5maXJlRXZlbnQoXCJvblwiICsgZXZlbnRUeXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdHJpZ2dlcmluZyBldmVudHNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW53cmFwT2JzZXJ2YWJsZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4ga28uaXNPYnNlcnZhYmxlKHZhbHVlKSA/IHZhbHVlKCkgOiB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBwZWVrT2JzZXJ2YWJsZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4ga28uaXNPYnNlcnZhYmxlKHZhbHVlKSA/IHZhbHVlLnBlZWsoKSA6IHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZURvbU5vZGVDc3NDbGFzczogZnVuY3Rpb24gKG5vZGUsIGNsYXNzTmFtZXMsIHNob3VsZEhhdmVDbGFzcykge1xuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3NzQ2xhc3NOYW1lUmVnZXggPSAvXFxTKy9nLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q2xhc3NOYW1lcyA9IG5vZGUuY2xhc3NOYW1lLm1hdGNoKGNzc0NsYXNzTmFtZVJlZ2V4KSB8fCBbXTtcbiAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2goY2xhc3NOYW1lcy5tYXRjaChjc3NDbGFzc05hbWVSZWdleCksIGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hZGRPclJlbW92ZUl0ZW0oY3VycmVudENsYXNzTmFtZXMsIGNsYXNzTmFtZSwgc2hvdWxkSGF2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBub2RlLmNsYXNzTmFtZSA9IGN1cnJlbnRDbGFzc05hbWVzLmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRleHRDb250ZW50OiBmdW5jdGlvbihlbGVtZW50LCB0ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh0ZXh0Q29udGVudCk7XG4gICAgICAgICAgICBpZiAoKHZhbHVlID09PSBudWxsKSB8fCAodmFsdWUgPT09IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBcIlwiO1xuXG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRoZXJlIHRvIGJlIGV4YWN0bHkgb25lIGNoaWxkOiBhIHRleHQgbm9kZS5cbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBjaGlsZHJlbiwgbW9yZSB0aGFuIG9uZSwgb3IgaWYgaXQncyBub3QgYSB0ZXh0IG5vZGUsXG4gICAgICAgICAgICAvLyB3ZSdsbCBjbGVhciBldmVyeXRoaW5nIGFuZCBjcmVhdGUgYSBzaW5nbGUgdGV4dCBub2RlLlxuICAgICAgICAgICAgdmFyIGlubmVyVGV4dE5vZGUgPSBrby52aXJ0dWFsRWxlbWVudHMuZmlyc3RDaGlsZChlbGVtZW50KTtcbiAgICAgICAgICAgIGlmICghaW5uZXJUZXh0Tm9kZSB8fCBpbm5lclRleHROb2RlLm5vZGVUeXBlICE9IDMgfHwga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGlubmVyVGV4dE5vZGUpKSB7XG4gICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLnNldERvbU5vZGVDaGlsZHJlbihlbGVtZW50LCBbZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZhbHVlKV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbm5lclRleHROb2RlLmRhdGEgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAga28udXRpbHMuZm9yY2VSZWZyZXNoKGVsZW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldEVsZW1lbnROYW1lOiBmdW5jdGlvbihlbGVtZW50LCBuYW1lKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm5hbWUgPSBuYW1lO1xuXG4gICAgICAgICAgICAvLyBXb3JrYXJvdW5kIElFIDYvNyBpc3N1ZVxuICAgICAgICAgICAgLy8gLSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzE5N1xuICAgICAgICAgICAgLy8gLSBodHRwOi8vd3d3Lm1hdHRzNDExLmNvbS9wb3N0L3NldHRpbmdfdGhlX25hbWVfYXR0cmlidXRlX2luX2llX2RvbS9cbiAgICAgICAgICAgIGlmIChpZVZlcnNpb24gPD0gNykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQubWVyZ2VBdHRyaWJ1dGVzKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCI8aW5wdXQgbmFtZT0nXCIgKyBlbGVtZW50Lm5hbWUgKyBcIicvPlwiKSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaChlKSB7fSAvLyBGb3IgSUU5IHdpdGggZG9jIG1vZGUgXCJJRTkgU3RhbmRhcmRzXCIgYW5kIGJyb3dzZXIgbW9kZSBcIklFOSBDb21wYXRpYmlsaXR5IFZpZXdcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZvcmNlUmVmcmVzaDogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgYW4gSUU5IHJlbmRlcmluZyBidWcgLSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzIwOVxuICAgICAgICAgICAgaWYgKGllVmVyc2lvbiA+PSA5KSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIHRleHQgbm9kZXMgYW5kIGNvbW1lbnQgbm9kZXMgKG1vc3QgbGlrZWx5IHZpcnR1YWwgZWxlbWVudHMpLCB3ZSB3aWxsIGhhdmUgdG8gcmVmcmVzaCB0aGUgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgdmFyIGVsZW0gPSBub2RlLm5vZGVUeXBlID09IDEgPyBub2RlIDogbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChlbGVtLnN0eWxlKVxuICAgICAgICAgICAgICAgICAgICBlbGVtLnN0eWxlLnpvb20gPSBlbGVtLnN0eWxlLnpvb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5zdXJlU2VsZWN0RWxlbWVudElzUmVuZGVyZWRDb3JyZWN0bHk6IGZ1bmN0aW9uKHNlbGVjdEVsZW1lbnQpIHtcbiAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIElFOSByZW5kZXJpbmcgYnVnIC0gaXQgZG9lc24ndCByZWxpYWJseSBkaXNwbGF5IGFsbCB0aGUgdGV4dCBpbiBkeW5hbWljYWxseS1hZGRlZCBzZWxlY3QgYm94ZXMgdW5sZXNzIHlvdSBmb3JjZSBpdCB0byByZS1yZW5kZXIgYnkgdXBkYXRpbmcgdGhlIHdpZHRoLlxuICAgICAgICAgICAgLy8gKFNlZSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzMxMiwgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81OTA4NDk0L3NlbGVjdC1vbmx5LXNob3dzLWZpcnN0LWNoYXItb2Ytc2VsZWN0ZWQtb3B0aW9uKVxuICAgICAgICAgICAgLy8gQWxzbyBmaXhlcyBJRTcgYW5kIElFOCBidWcgdGhhdCBjYXVzZXMgc2VsZWN0cyB0byBiZSB6ZXJvIHdpZHRoIGlmIGVuY2xvc2VkIGJ5ICdpZicgb3IgJ3dpdGgnLiAoU2VlIGlzc3VlICM4MzkpXG4gICAgICAgICAgICBpZiAoaWVWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsV2lkdGggPSBzZWxlY3RFbGVtZW50LnN0eWxlLndpZHRoO1xuICAgICAgICAgICAgICAgIHNlbGVjdEVsZW1lbnQuc3R5bGUud2lkdGggPSAwO1xuICAgICAgICAgICAgICAgIHNlbGVjdEVsZW1lbnQuc3R5bGUud2lkdGggPSBvcmlnaW5hbFdpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJhbmdlOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgICAgICAgICAgIG1pbiA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUobWluKTtcbiAgICAgICAgICAgIG1heCA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUobWF4KTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBtaW47IGkgPD0gbWF4OyBpKyspXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LFxuXG4gICAgICAgIG1ha2VBcnJheTogZnVuY3Rpb24oYXJyYXlMaWtlT2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGFycmF5TGlrZU9iamVjdC5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChhcnJheUxpa2VPYmplY3RbaV0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNJZTYgOiBpc0llNixcbiAgICAgICAgaXNJZTcgOiBpc0llNyxcbiAgICAgICAgaWVWZXJzaW9uIDogaWVWZXJzaW9uLFxuXG4gICAgICAgIGdldEZvcm1GaWVsZHM6IGZ1bmN0aW9uKGZvcm0sIGZpZWxkTmFtZSkge1xuICAgICAgICAgICAgdmFyIGZpZWxkcyA9IGtvLnV0aWxzLm1ha2VBcnJheShmb3JtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW5wdXRcIikpLmNvbmNhdChrby51dGlscy5tYWtlQXJyYXkoZm9ybS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInRleHRhcmVhXCIpKSk7XG4gICAgICAgICAgICB2YXIgaXNNYXRjaGluZ0ZpZWxkID0gKHR5cGVvZiBmaWVsZE5hbWUgPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgPyBmdW5jdGlvbihmaWVsZCkgeyByZXR1cm4gZmllbGQubmFtZSA9PT0gZmllbGROYW1lIH1cbiAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uKGZpZWxkKSB7IHJldHVybiBmaWVsZE5hbWUudGVzdChmaWVsZC5uYW1lKSB9OyAvLyBUcmVhdCBmaWVsZE5hbWUgYXMgcmVnZXggb3Igb2JqZWN0IGNvbnRhaW5pbmcgcHJlZGljYXRlXG4gICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGZpZWxkcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChpc01hdGNoaW5nRmllbGQoZmllbGRzW2ldKSlcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcy5wdXNoKGZpZWxkc1tpXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VKc29uOiBmdW5jdGlvbiAoanNvblN0cmluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBqc29uU3RyaW5nID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBqc29uU3RyaW5nID0ga28udXRpbHMuc3RyaW5nVHJpbShqc29uU3RyaW5nKTtcbiAgICAgICAgICAgICAgICBpZiAoanNvblN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoSlNPTiAmJiBKU09OLnBhcnNlKSAvLyBVc2UgbmF0aXZlIHBhcnNpbmcgd2hlcmUgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChuZXcgRnVuY3Rpb24oXCJyZXR1cm4gXCIgKyBqc29uU3RyaW5nKSkoKTsgLy8gRmFsbGJhY2sgb24gbGVzcyBzYWZlIHBhcnNpbmcgZm9yIG9sZGVyIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RyaW5naWZ5SnNvbjogZnVuY3Rpb24gKGRhdGEsIHJlcGxhY2VyLCBzcGFjZSkgeyAgIC8vIHJlcGxhY2VyIGFuZCBzcGFjZSBhcmUgb3B0aW9uYWxcbiAgICAgICAgICAgIGlmICghSlNPTiB8fCAhSlNPTi5zdHJpbmdpZnkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgSlNPTi5zdHJpbmdpZnkoKS4gU29tZSBicm93c2VycyAoZS5nLiwgSUUgPCA4KSBkb24ndCBzdXBwb3J0IGl0IG5hdGl2ZWx5LCBidXQgeW91IGNhbiBvdmVyY29tZSB0aGlzIGJ5IGFkZGluZyBhIHNjcmlwdCByZWZlcmVuY2UgdG8ganNvbjIuanMsIGRvd25sb2FkYWJsZSBmcm9tIGh0dHA6Ly93d3cuanNvbi5vcmcvanNvbjIuanNcIik7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoa28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShkYXRhKSwgcmVwbGFjZXIsIHNwYWNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0SnNvbjogZnVuY3Rpb24gKHVybE9yRm9ybSwgZGF0YSwgb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0gb3B0aW9uc1sncGFyYW1zJ10gfHwge307XG4gICAgICAgICAgICB2YXIgaW5jbHVkZUZpZWxkcyA9IG9wdGlvbnNbJ2luY2x1ZGVGaWVsZHMnXSB8fCB0aGlzLmZpZWxkc0luY2x1ZGVkV2l0aEpzb25Qb3N0O1xuICAgICAgICAgICAgdmFyIHVybCA9IHVybE9yRm9ybTtcblxuICAgICAgICAgICAgLy8gSWYgd2Ugd2VyZSBnaXZlbiBhIGZvcm0sIHVzZSBpdHMgJ2FjdGlvbicgVVJMIGFuZCBwaWNrIG91dCBhbnkgcmVxdWVzdGVkIGZpZWxkIHZhbHVlc1xuICAgICAgICAgICAgaWYoKHR5cGVvZiB1cmxPckZvcm0gPT0gJ29iamVjdCcpICYmIChrby51dGlscy50YWdOYW1lTG93ZXIodXJsT3JGb3JtKSA9PT0gXCJmb3JtXCIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsRm9ybSA9IHVybE9yRm9ybTtcbiAgICAgICAgICAgICAgICB1cmwgPSBvcmlnaW5hbEZvcm0uYWN0aW9uO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBpbmNsdWRlRmllbGRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZHMgPSBrby51dGlscy5nZXRGb3JtRmllbGRzKG9yaWdpbmFsRm9ybSwgaW5jbHVkZUZpZWxkc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBmaWVsZHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXNbZmllbGRzW2pdLm5hbWVdID0gZmllbGRzW2pdLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YSk7XG4gICAgICAgICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJmb3JtXCIpO1xuICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBmb3JtLmFjdGlvbiA9IHVybDtcbiAgICAgICAgICAgIGZvcm0ubWV0aG9kID0gXCJwb3N0XCI7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIFNpbmNlICdkYXRhJyB0aGlzIGlzIGEgbW9kZWwgb2JqZWN0LCB3ZSBpbmNsdWRlIGFsbCBwcm9wZXJ0aWVzIGluY2x1ZGluZyB0aG9zZSBpbmhlcml0ZWQgZnJvbSBpdHMgcHJvdG90eXBlXG4gICAgICAgICAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgICAgIGlucHV0Lm5hbWUgPSBrZXk7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBrby51dGlscy5zdHJpbmdpZnlKc29uKGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoZGF0YVtrZXldKSk7XG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvYmplY3RGb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgICAgICBpbnB1dC5uYW1lID0ga2V5O1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgICAgICAgICBvcHRpb25zWydzdWJtaXR0ZXInXSA/IG9wdGlvbnNbJ3N1Ym1pdHRlciddKGZvcm0pIDogZm9ybS5zdWJtaXQoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBmb3JtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZm9ybSk7IH0sIDApO1xuICAgICAgICB9XG4gICAgfVxufSgpKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscycsIGtvLnV0aWxzKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlGb3JFYWNoJywga28udXRpbHMuYXJyYXlGb3JFYWNoKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlGaXJzdCcsIGtvLnV0aWxzLmFycmF5Rmlyc3QpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheUZpbHRlcicsIGtvLnV0aWxzLmFycmF5RmlsdGVyKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlHZXREaXN0aW5jdFZhbHVlcycsIGtvLnV0aWxzLmFycmF5R2V0RGlzdGluY3RWYWx1ZXMpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheUluZGV4T2YnLCBrby51dGlscy5hcnJheUluZGV4T2YpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5hcnJheU1hcCcsIGtvLnV0aWxzLmFycmF5TWFwKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlQdXNoQWxsJywga28udXRpbHMuYXJyYXlQdXNoQWxsKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuYXJyYXlSZW1vdmVJdGVtJywga28udXRpbHMuYXJyYXlSZW1vdmVJdGVtKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZXh0ZW5kJywga28udXRpbHMuZXh0ZW5kKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZmllbGRzSW5jbHVkZWRXaXRoSnNvblBvc3QnLCBrby51dGlscy5maWVsZHNJbmNsdWRlZFdpdGhKc29uUG9zdCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmdldEZvcm1GaWVsZHMnLCBrby51dGlscy5nZXRGb3JtRmllbGRzKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMucGVla09ic2VydmFibGUnLCBrby51dGlscy5wZWVrT2JzZXJ2YWJsZSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLnBvc3RKc29uJywga28udXRpbHMucG9zdEpzb24pO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5wYXJzZUpzb24nLCBrby51dGlscy5wYXJzZUpzb24pO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcicsIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuc3RyaW5naWZ5SnNvbicsIGtvLnV0aWxzLnN0cmluZ2lmeUpzb24pO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5yYW5nZScsIGtvLnV0aWxzLnJhbmdlKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzJywga28udXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMudHJpZ2dlckV2ZW50Jywga28udXRpbHMudHJpZ2dlckV2ZW50KTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMudW53cmFwT2JzZXJ2YWJsZScsIGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5vYmplY3RGb3JFYWNoJywga28udXRpbHMub2JqZWN0Rm9yRWFjaCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmFkZE9yUmVtb3ZlSXRlbScsIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbSk7XG5rby5leHBvcnRTeW1ib2woJ3Vud3JhcCcsIGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUpOyAvLyBDb252ZW5pZW50IHNob3J0aGFuZCwgYmVjYXVzZSB0aGlzIGlzIHVzZWQgc28gY29tbW9ubHlcblxuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGVbJ2JpbmQnXSkge1xuICAgIC8vIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIGlzIGEgc3RhbmRhcmQgcGFydCBvZiBFQ01BU2NyaXB0IDV0aCBFZGl0aW9uIChEZWNlbWJlciAyMDA5LCBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvcHVibGljYXRpb25zL2ZpbGVzL0VDTUEtU1QvRUNNQS0yNjIucGRmKVxuICAgIC8vIEluIGNhc2UgdGhlIGJyb3dzZXIgZG9lc24ndCBpbXBsZW1lbnQgaXQgbmF0aXZlbHksIHByb3ZpZGUgYSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uLiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIGJhc2VkIG9uIHRoZSBvbmUgaW4gcHJvdG90eXBlLmpzXG4gICAgRnVuY3Rpb24ucHJvdG90eXBlWydiaW5kJ10gPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICAgIHZhciBvcmlnaW5hbEZ1bmN0aW9uID0gdGhpcywgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksIG9iamVjdCA9IGFyZ3Muc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEZ1bmN0aW9uLmFwcGx5KG9iamVjdCwgYXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbmtvLnV0aWxzLmRvbURhdGEgPSBuZXcgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pcXVlSWQgPSAwO1xuICAgIHZhciBkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lID0gXCJfX2tvX19cIiArIChuZXcgRGF0ZSkuZ2V0VGltZSgpO1xuICAgIHZhciBkYXRhU3RvcmUgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGdldEFsbChub2RlLCBjcmVhdGVJZk5vdEZvdW5kKSB7XG4gICAgICAgIHZhciBkYXRhU3RvcmVLZXkgPSBub2RlW2RhdGFTdG9yZUtleUV4cGFuZG9Qcm9wZXJ0eU5hbWVdO1xuICAgICAgICB2YXIgaGFzRXhpc3RpbmdEYXRhU3RvcmUgPSBkYXRhU3RvcmVLZXkgJiYgKGRhdGFTdG9yZUtleSAhPT0gXCJudWxsXCIpICYmIGRhdGFTdG9yZVtkYXRhU3RvcmVLZXldO1xuICAgICAgICBpZiAoIWhhc0V4aXN0aW5nRGF0YVN0b3JlKSB7XG4gICAgICAgICAgICBpZiAoIWNyZWF0ZUlmTm90Rm91bmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGRhdGFTdG9yZUtleSA9IG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV0gPSBcImtvXCIgKyB1bmlxdWVJZCsrO1xuICAgICAgICAgICAgZGF0YVN0b3JlW2RhdGFTdG9yZUtleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YVN0b3JlW2RhdGFTdG9yZUtleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAobm9kZSwga2V5KSB7XG4gICAgICAgICAgICB2YXIgYWxsRGF0YUZvck5vZGUgPSBnZXRBbGwobm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuIGFsbERhdGFGb3JOb2RlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhbGxEYXRhRm9yTm9kZVtrZXldO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChub2RlLCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBkb24ndCBhY3R1YWxseSBjcmVhdGUgYSBuZXcgZG9tRGF0YSBrZXkgaWYgd2UgYXJlIGFjdHVhbGx5IGRlbGV0aW5nIGEgdmFsdWVcbiAgICAgICAgICAgICAgICBpZiAoZ2V0QWxsKG5vZGUsIGZhbHNlKSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYWxsRGF0YUZvck5vZGUgPSBnZXRBbGwobm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICBhbGxEYXRhRm9yTm9kZVtrZXldID0gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgdmFyIGRhdGFTdG9yZUtleSA9IG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV07XG4gICAgICAgICAgICBpZiAoZGF0YVN0b3JlS2V5KSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRhdGFTdG9yZVtkYXRhU3RvcmVLZXldO1xuICAgICAgICAgICAgICAgIG5vZGVbZGF0YVN0b3JlS2V5RXhwYW5kb1Byb3BlcnR5TmFtZV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBFeHBvc2luZyBcImRpZCBjbGVhblwiIGZsYWcgcHVyZWx5IHNvIHNwZWNzIGNhbiBpbmZlciB3aGV0aGVyIHRoaW5ncyBoYXZlIGJlZW4gY2xlYW5lZCB1cCBhcyBpbnRlbmRlZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHRLZXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAodW5pcXVlSWQrKykgKyBkYXRhU3RvcmVLZXlFeHBhbmRvUHJvcGVydHlOYW1lO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZG9tRGF0YScsIGtvLnV0aWxzLmRvbURhdGEpO1xua28uZXhwb3J0U3ltYm9sKCd1dGlscy5kb21EYXRhLmNsZWFyJywga28udXRpbHMuZG9tRGF0YS5jbGVhcik7IC8vIEV4cG9ydGluZyBvbmx5IHNvIHNwZWNzIGNhbiBjbGVhciB1cCBhZnRlciB0aGVtc2VsdmVzIGZ1bGx5XG5cbmtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbCA9IG5ldyAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBkb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG4gICAgdmFyIGNsZWFuYWJsZU5vZGVUeXBlcyA9IHsgMTogdHJ1ZSwgODogdHJ1ZSwgOTogdHJ1ZSB9OyAgICAgICAvLyBFbGVtZW50LCBDb21tZW50LCBEb2N1bWVudFxuICAgIHZhciBjbGVhbmFibGVOb2RlVHlwZXNXaXRoRGVzY2VuZGFudHMgPSB7IDE6IHRydWUsIDk6IHRydWUgfTsgLy8gRWxlbWVudCwgRG9jdW1lbnRcblxuICAgIGZ1bmN0aW9uIGdldERpc3Bvc2VDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUsIGNyZWF0ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgdmFyIGFsbERpc3Bvc2VDYWxsYmFja3MgPSBrby51dGlscy5kb21EYXRhLmdldChub2RlLCBkb21EYXRhS2V5KTtcbiAgICAgICAgaWYgKChhbGxEaXNwb3NlQ2FsbGJhY2tzID09PSB1bmRlZmluZWQpICYmIGNyZWF0ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgICAgIGFsbERpc3Bvc2VDYWxsYmFja3MgPSBbXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIGRvbURhdGFLZXksIGFsbERpc3Bvc2VDYWxsYmFja3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxEaXNwb3NlQ2FsbGJhY2tzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZXN0cm95Q2FsbGJhY2tzQ29sbGVjdGlvbihub2RlKSB7XG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIGRvbURhdGFLZXksIHVuZGVmaW5lZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW5TaW5nbGVOb2RlKG5vZGUpIHtcbiAgICAgICAgLy8gUnVuIGFsbCB0aGUgZGlzcG9zZSBjYWxsYmFja3NcbiAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGdldERpc3Bvc2VDYWxsYmFja3NDb2xsZWN0aW9uKG5vZGUsIGZhbHNlKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAgICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApOyAvLyBDbG9uZSwgYXMgdGhlIGFycmF5IG1heSBiZSBtb2RpZmllZCBkdXJpbmcgaXRlcmF0aW9uICh0eXBpY2FsbHksIGNhbGxiYWNrcyB3aWxsIHJlbW92ZSB0aGVtc2VsdmVzKVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzW2ldKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRXJhc2UgdGhlIERPTSBkYXRhXG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuY2xlYXIobm9kZSk7XG5cbiAgICAgICAgLy8gUGVyZm9ybSBjbGVhbnVwIG5lZWRlZCBieSBleHRlcm5hbCBsaWJyYXJpZXMgKGN1cnJlbnRseSBvbmx5IGpRdWVyeSwgYnV0IGNhbiBiZSBleHRlbmRlZClcbiAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsW1wiY2xlYW5FeHRlcm5hbERhdGFcIl0obm9kZSk7XG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGltbWVkaWF0ZS1jaGlsZCBjb21tZW50IG5vZGVzLCBhcyB0aGVzZSB3b3VsZG4ndCBoYXZlIGJlZW4gZm91bmQgYnlcbiAgICAgICAgLy8gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIikgaW4gY2xlYW5Ob2RlKCkgKGNvbW1lbnQgbm9kZXMgYXJlbid0IGVsZW1lbnRzKVxuICAgICAgICBpZiAoY2xlYW5hYmxlTm9kZVR5cGVzV2l0aERlc2NlbmRhbnRzW25vZGUubm9kZVR5cGVdKVxuICAgICAgICAgICAgY2xlYW5JbW1lZGlhdGVDb21tZW50VHlwZUNoaWxkcmVuKG5vZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFuSW1tZWRpYXRlQ29tbWVudFR5cGVDaGlsZHJlbihub2RlV2l0aENoaWxkcmVuKSB7XG4gICAgICAgIHZhciBjaGlsZCwgbmV4dENoaWxkID0gbm9kZVdpdGhDaGlsZHJlbi5maXJzdENoaWxkO1xuICAgICAgICB3aGlsZSAoY2hpbGQgPSBuZXh0Q2hpbGQpIHtcbiAgICAgICAgICAgIG5leHRDaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgaWYgKGNoaWxkLm5vZGVUeXBlID09PSA4KVxuICAgICAgICAgICAgICAgIGNsZWFuU2luZ2xlTm9kZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGREaXNwb3NlQ2FsbGJhY2sgOiBmdW5jdGlvbihub2RlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgdHJ1ZSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlRGlzcG9zZUNhbGxiYWNrIDogZnVuY3Rpb24obm9kZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3NDb2xsZWN0aW9uID0gZ2V0RGlzcG9zZUNhbGxiYWNrc0NvbGxlY3Rpb24obm9kZSwgZmFsc2UpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrc0NvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVJlbW92ZUl0ZW0oY2FsbGJhY2tzQ29sbGVjdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3NDb2xsZWN0aW9uLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgICAgICAgICBkZXN0cm95Q2FsbGJhY2tzQ29sbGVjdGlvbihub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhbk5vZGUgOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAvLyBGaXJzdCBjbGVhbiB0aGlzIG5vZGUsIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgICAgIGlmIChjbGVhbmFibGVOb2RlVHlwZXNbbm9kZS5ub2RlVHlwZV0pIHtcbiAgICAgICAgICAgICAgICBjbGVhblNpbmdsZU5vZGUobm9kZSk7XG5cbiAgICAgICAgICAgICAgICAvLyAuLi4gdGhlbiBpdHMgZGVzY2VuZGFudHMsIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgICAgICAgICBpZiAoY2xlYW5hYmxlTm9kZVR5cGVzV2l0aERlc2NlbmRhbnRzW25vZGUubm9kZVR5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsb25lIHRoZSBkZXNjZW5kYW50cyBsaXN0IGluIGNhc2UgaXQgY2hhbmdlcyBkdXJpbmcgaXRlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZXNjZW5kYW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoZGVzY2VuZGFudHMsIG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBkZXNjZW5kYW50cy5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhblNpbmdsZU5vZGUoZGVzY2VuZGFudHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZU5vZGUgOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBrby5jbGVhbk5vZGUobm9kZSk7XG4gICAgICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKVxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBcImNsZWFuRXh0ZXJuYWxEYXRhXCIgOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBzdXBwb3J0IGZvciBqUXVlcnkgaGVyZSBiZWNhdXNlIGl0J3Mgc28gY29tbW9ubHkgdXNlZC5cbiAgICAgICAgICAgIC8vIE1hbnkgalF1ZXJ5IHBsdWdpbnMgKGluY2x1ZGluZyBqcXVlcnkudG1wbCkgc3RvcmUgZGF0YSB1c2luZyBqUXVlcnkncyBlcXVpdmFsZW50IG9mIGRvbURhdGFcbiAgICAgICAgICAgIC8vIHNvIG5vdGlmeSBpdCB0byB0ZWFyIGRvd24gYW55IHJlc291cmNlcyBhc3NvY2lhdGVkIHdpdGggdGhlIG5vZGUgJiBkZXNjZW5kYW50cyBoZXJlLlxuICAgICAgICAgICAgaWYgKGpRdWVyeSAmJiAodHlwZW9mIGpRdWVyeVsnY2xlYW5EYXRhJ10gPT0gXCJmdW5jdGlvblwiKSlcbiAgICAgICAgICAgICAgICBqUXVlcnlbJ2NsZWFuRGF0YSddKFtub2RlXSk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xua28uY2xlYW5Ob2RlID0ga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmNsZWFuTm9kZTsgLy8gU2hvcnRoYW5kIG5hbWUgZm9yIGNvbnZlbmllbmNlXG5rby5yZW1vdmVOb2RlID0ga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLnJlbW92ZU5vZGU7IC8vIFNob3J0aGFuZCBuYW1lIGZvciBjb252ZW5pZW5jZVxua28uZXhwb3J0U3ltYm9sKCdjbGVhbk5vZGUnLCBrby5jbGVhbk5vZGUpO1xua28uZXhwb3J0U3ltYm9sKCdyZW1vdmVOb2RlJywga28ucmVtb3ZlTm9kZSk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmRvbU5vZGVEaXNwb3NhbCcsIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbCk7XG5rby5leHBvcnRTeW1ib2woJ3V0aWxzLmRvbU5vZGVEaXNwb3NhbC5hZGREaXNwb3NlQ2FsbGJhY2snLCBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwuYWRkRGlzcG9zZUNhbGxiYWNrKTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuZG9tTm9kZURpc3Bvc2FsLnJlbW92ZURpc3Bvc2VDYWxsYmFjaycsIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5yZW1vdmVEaXNwb3NlQ2FsbGJhY2spO1xuKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGVhZGluZ0NvbW1lbnRSZWdleCA9IC9eKFxccyopPCEtLSguKj8pLS0+LztcblxuICAgIGZ1bmN0aW9uIHNpbXBsZUh0bWxQYXJzZShodG1sKSB7XG4gICAgICAgIC8vIEJhc2VkIG9uIGpRdWVyeSdzIFwiY2xlYW5cIiBmdW5jdGlvbiwgYnV0IG9ubHkgYWNjb3VudGluZyBmb3IgdGFibGUtcmVsYXRlZCBlbGVtZW50cy5cbiAgICAgICAgLy8gSWYgeW91IGhhdmUgcmVmZXJlbmNlZCBqUXVlcnksIHRoaXMgd29uJ3QgYmUgdXNlZCBhbnl3YXkgLSBLTyB3aWxsIHVzZSBqUXVlcnkncyBcImNsZWFuXCIgZnVuY3Rpb24gZGlyZWN0bHlcblxuICAgICAgICAvLyBOb3RlIHRoYXQgdGhlcmUncyBzdGlsbCBhbiBpc3N1ZSBpbiBJRSA8IDkgd2hlcmVieSBpdCB3aWxsIGRpc2NhcmQgY29tbWVudCBub2RlcyB0aGF0IGFyZSB0aGUgZmlyc3QgY2hpbGQgb2ZcbiAgICAgICAgLy8gYSBkZXNjZW5kYW50IG5vZGUuIEZvciBleGFtcGxlOiBcIjxkaXY+PCEtLSBteWNvbW1lbnQgLS0+YWJjPC9kaXY+XCIgd2lsbCBnZXQgcGFyc2VkIGFzIFwiPGRpdj5hYmM8L2Rpdj5cIlxuICAgICAgICAvLyBUaGlzIHdvbid0IGFmZmVjdCBhbnlvbmUgd2hvIGhhcyByZWZlcmVuY2VkIGpRdWVyeSwgYW5kIHRoZXJlJ3MgYWx3YXlzIHRoZSB3b3JrYXJvdW5kIG9mIGluc2VydGluZyBhIGR1bW15IG5vZGVcbiAgICAgICAgLy8gKHBvc3NpYmx5IGEgdGV4dCBub2RlKSBpbiBmcm9udCBvZiB0aGUgY29tbWVudC4gU28sIEtPIGRvZXMgbm90IGF0dGVtcHQgdG8gd29ya2Fyb3VuZCB0aGlzIElFIGlzc3VlIGF1dG9tYXRpY2FsbHkgYXQgcHJlc2VudC5cblxuICAgICAgICAvLyBUcmltIHdoaXRlc3BhY2UsIG90aGVyd2lzZSBpbmRleE9mIHdvbid0IHdvcmsgYXMgZXhwZWN0ZWRcbiAgICAgICAgdmFyIHRhZ3MgPSBrby51dGlscy5zdHJpbmdUcmltKGh0bWwpLnRvTG93ZXJDYXNlKCksIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICAgICAgLy8gRmluZHMgdGhlIGZpcnN0IG1hdGNoIGZyb20gdGhlIGxlZnQgY29sdW1uLCBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBcIndyYXBcIiBkYXRhIGZyb20gdGhlIHJpZ2h0IGNvbHVtblxuICAgICAgICB2YXIgd3JhcCA9IHRhZ3MubWF0Y2goL148KHRoZWFkfHRib2R5fHRmb290KS8pICAgICAgICAgICAgICAmJiBbMSwgXCI8dGFibGU+XCIsIFwiPC90YWJsZT5cIl0gfHxcbiAgICAgICAgICAgICAgICAgICAhdGFncy5pbmRleE9mKFwiPHRyXCIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiBbMiwgXCI8dGFibGU+PHRib2R5PlwiLCBcIjwvdGJvZHk+PC90YWJsZT5cIl0gfHxcbiAgICAgICAgICAgICAgICAgICAoIXRhZ3MuaW5kZXhPZihcIjx0ZFwiKSB8fCAhdGFncy5pbmRleE9mKFwiPHRoXCIpKSAgICYmIFszLCBcIjx0YWJsZT48dGJvZHk+PHRyPlwiLCBcIjwvdHI+PC90Ym9keT48L3RhYmxlPlwiXSB8fFxuICAgICAgICAgICAgICAgICAgIC8qIGFueXRoaW5nIGVsc2UgKi8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgXCJcIiwgXCJcIl07XG5cbiAgICAgICAgLy8gR28gdG8gaHRtbCBhbmQgYmFjaywgdGhlbiBwZWVsIG9mZiBleHRyYSB3cmFwcGVyc1xuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgYWx3YXlzIHByZWZpeCB3aXRoIHNvbWUgZHVtbXkgdGV4dCwgYmVjYXVzZSBvdGhlcndpc2UsIElFPDkgd2lsbCBzdHJpcCBvdXQgbGVhZGluZyBjb21tZW50IG5vZGVzIGluIGRlc2NlbmRhbnRzLiBUb3RhbCBtYWRuZXNzLlxuICAgICAgICB2YXIgbWFya3VwID0gXCJpZ25vcmVkPGRpdj5cIiArIHdyYXBbMV0gKyBodG1sICsgd3JhcFsyXSArIFwiPC9kaXY+XCI7XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93Wydpbm5lclNoaXYnXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCh3aW5kb3dbJ2lubmVyU2hpdiddKG1hcmt1cCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGl2LmlubmVySFRNTCA9IG1hcmt1cDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1vdmUgdG8gdGhlIHJpZ2h0IGRlcHRoXG4gICAgICAgIHdoaWxlICh3cmFwWzBdLS0pXG4gICAgICAgICAgICBkaXYgPSBkaXYubGFzdENoaWxkO1xuXG4gICAgICAgIHJldHVybiBrby51dGlscy5tYWtlQXJyYXkoZGl2Lmxhc3RDaGlsZC5jaGlsZE5vZGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBqUXVlcnlIdG1sUGFyc2UoaHRtbCkge1xuICAgICAgICAvLyBqUXVlcnkncyBcInBhcnNlSFRNTFwiIGZ1bmN0aW9uIHdhcyBpbnRyb2R1Y2VkIGluIGpRdWVyeSAxLjguMCBhbmQgaXMgYSBkb2N1bWVudGVkIHB1YmxpYyBBUEkuXG4gICAgICAgIGlmIChqUXVlcnlbJ3BhcnNlSFRNTCddKSB7XG4gICAgICAgICAgICByZXR1cm4galF1ZXJ5WydwYXJzZUhUTUwnXShodG1sKSB8fCBbXTsgLy8gRW5zdXJlIHdlIGFsd2F5cyByZXR1cm4gYW4gYXJyYXkgYW5kIG5ldmVyIG51bGxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBqUXVlcnkgPCAxLjguMCwgd2UgZmFsbCBiYWNrIG9uIHRoZSB1bmRvY3VtZW50ZWQgaW50ZXJuYWwgXCJjbGVhblwiIGZ1bmN0aW9uLlxuICAgICAgICAgICAgdmFyIGVsZW1zID0galF1ZXJ5WydjbGVhbiddKFtodG1sXSk7XG5cbiAgICAgICAgICAgIC8vIEFzIG9mIGpRdWVyeSAxLjcuMSwgalF1ZXJ5IHBhcnNlcyB0aGUgSFRNTCBieSBhcHBlbmRpbmcgaXQgdG8gc29tZSBkdW1teSBwYXJlbnQgbm9kZXMgaGVsZCBpbiBhbiBpbi1tZW1vcnkgZG9jdW1lbnQgZnJhZ21lbnQuXG4gICAgICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5LCBpdCBuZXZlciBjbGVhcnMgdGhlIGR1bW15IHBhcmVudCBub2RlcyBmcm9tIHRoZSBkb2N1bWVudCBmcmFnbWVudCwgc28gaXQgbGVha3MgbWVtb3J5IG92ZXIgdGltZS5cbiAgICAgICAgICAgIC8vIEZpeCB0aGlzIGJ5IGZpbmRpbmcgdGhlIHRvcC1tb3N0IGR1bW15IHBhcmVudCBlbGVtZW50LCBhbmQgZGV0YWNoaW5nIGl0IGZyb20gaXRzIG93bmVyIGZyYWdtZW50LlxuICAgICAgICAgICAgaWYgKGVsZW1zICYmIGVsZW1zWzBdKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgdG9wLW1vc3QgcGFyZW50IGVsZW1lbnQgdGhhdCdzIGEgZGlyZWN0IGNoaWxkIG9mIGEgZG9jdW1lbnQgZnJhZ21lbnRcbiAgICAgICAgICAgICAgICB2YXIgZWxlbSA9IGVsZW1zWzBdO1xuICAgICAgICAgICAgICAgIHdoaWxlIChlbGVtLnBhcmVudE5vZGUgJiYgZWxlbS5wYXJlbnROb2RlLm5vZGVUeXBlICE9PSAxMSAvKiBpLmUuLCBEb2N1bWVudEZyYWdtZW50ICovKVxuICAgICAgICAgICAgICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIC8vIC4uLiB0aGVuIGRldGFjaCBpdFxuICAgICAgICAgICAgICAgIGlmIChlbGVtLnBhcmVudE5vZGUpXG4gICAgICAgICAgICAgICAgICAgIGVsZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsZW1zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQgPSBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHJldHVybiBqUXVlcnkgPyBqUXVlcnlIdG1sUGFyc2UoaHRtbCkgICAvLyBBcyBiZWxvdywgYmVuZWZpdCBmcm9tIGpRdWVyeSdzIG9wdGltaXNhdGlvbnMgd2hlcmUgcG9zc2libGVcbiAgICAgICAgICAgICAgICAgICAgICA6IHNpbXBsZUh0bWxQYXJzZShodG1sKTsgIC8vIC4uLiBvdGhlcndpc2UsIHRoaXMgc2ltcGxlIGxvZ2ljIHdpbGwgZG8gaW4gbW9zdCBjb21tb24gY2FzZXMuXG4gICAgfTtcblxuICAgIGtvLnV0aWxzLnNldEh0bWwgPSBmdW5jdGlvbihub2RlLCBodG1sKSB7XG4gICAgICAgIGtvLnV0aWxzLmVtcHR5RG9tTm9kZShub2RlKTtcblxuICAgICAgICAvLyBUaGVyZSdzIG5vIGxlZ2l0aW1hdGUgcmVhc29uIHRvIGRpc3BsYXkgYSBzdHJpbmdpZmllZCBvYnNlcnZhYmxlIHdpdGhvdXQgdW53cmFwcGluZyBpdCwgc28gd2UnbGwgdW53cmFwIGl0XG4gICAgICAgIGh0bWwgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGh0bWwpO1xuXG4gICAgICAgIGlmICgoaHRtbCAhPT0gbnVsbCkgJiYgKGh0bWwgIT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaHRtbCAhPSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICBodG1sID0gaHRtbC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICAvLyBqUXVlcnkgY29udGFpbnMgYSBsb3Qgb2Ygc29waGlzdGljYXRlZCBjb2RlIHRvIHBhcnNlIGFyYml0cmFyeSBIVE1MIGZyYWdtZW50cyxcbiAgICAgICAgICAgIC8vIGZvciBleGFtcGxlIDx0cj4gZWxlbWVudHMgd2hpY2ggYXJlIG5vdCBub3JtYWxseSBhbGxvd2VkIHRvIGV4aXN0IG9uIHRoZWlyIG93bi5cbiAgICAgICAgICAgIC8vIElmIHlvdSd2ZSByZWZlcmVuY2VkIGpRdWVyeSB3ZSdsbCB1c2UgdGhhdCByYXRoZXIgdGhhbiBkdXBsaWNhdGluZyBpdHMgY29kZS5cbiAgICAgICAgICAgIGlmIChqUXVlcnkpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkobm9kZSlbJ2h0bWwnXShodG1sKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gLi4uIG90aGVyd2lzZSwgdXNlIEtPJ3Mgb3duIHBhcnNpbmcgbG9naWMuXG4gICAgICAgICAgICAgICAgdmFyIHBhcnNlZE5vZGVzID0ga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQoaHRtbCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJzZWROb2Rlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChwYXJzZWROb2Rlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5wYXJzZUh0bWxGcmFnbWVudCcsIGtvLnV0aWxzLnBhcnNlSHRtbEZyYWdtZW50KTtcbmtvLmV4cG9ydFN5bWJvbCgndXRpbHMuc2V0SHRtbCcsIGtvLnV0aWxzLnNldEh0bWwpO1xuXG5rby5tZW1vaXphdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1lbW9zID0ge307XG5cbiAgICBmdW5jdGlvbiByYW5kb21NYXg4SGV4Q2hhcnMoKSB7XG4gICAgICAgIHJldHVybiAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwMDAwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbUlkKCkge1xuICAgICAgICByZXR1cm4gcmFuZG9tTWF4OEhleENoYXJzKCkgKyByYW5kb21NYXg4SGV4Q2hhcnMoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmluZE1lbW9Ob2Rlcyhyb290Tm9kZSwgYXBwZW5kVG9BcnJheSkge1xuICAgICAgICBpZiAoIXJvb3ROb2RlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAocm9vdE5vZGUubm9kZVR5cGUgPT0gOCkge1xuICAgICAgICAgICAgdmFyIG1lbW9JZCA9IGtvLm1lbW9pemF0aW9uLnBhcnNlTWVtb1RleHQocm9vdE5vZGUubm9kZVZhbHVlKTtcbiAgICAgICAgICAgIGlmIChtZW1vSWQgIT0gbnVsbClcbiAgICAgICAgICAgICAgICBhcHBlbmRUb0FycmF5LnB1c2goeyBkb21Ob2RlOiByb290Tm9kZSwgbWVtb0lkOiBtZW1vSWQgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocm9vdE5vZGUubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGNoaWxkTm9kZXMgPSByb290Tm9kZS5jaGlsZE5vZGVzLCBqID0gY2hpbGROb2Rlcy5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgZmluZE1lbW9Ob2RlcyhjaGlsZE5vZGVzW2ldLCBhcHBlbmRUb0FycmF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG1lbW9pemU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSBcImZ1bmN0aW9uXCIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbiBvbmx5IHBhc3MgYSBmdW5jdGlvbiB0byBrby5tZW1vaXphdGlvbi5tZW1vaXplKClcIik7XG4gICAgICAgICAgICB2YXIgbWVtb0lkID0gZ2VuZXJhdGVSYW5kb21JZCgpO1xuICAgICAgICAgICAgbWVtb3NbbWVtb0lkXSA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgcmV0dXJuIFwiPCEtLVtrb19tZW1vOlwiICsgbWVtb0lkICsgXCJdLS0+XCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5tZW1vaXplOiBmdW5jdGlvbiAobWVtb0lkLCBjYWxsYmFja1BhcmFtcykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gbWVtb3NbbWVtb0lkXTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYW55IG1lbW8gd2l0aCBJRCBcIiArIG1lbW9JZCArIFwiLiBQZXJoYXBzIGl0J3MgYWxyZWFkeSBiZWVuIHVubWVtb2l6ZWQuXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBjYWxsYmFja1BhcmFtcyB8fCBbXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHsgZGVsZXRlIG1lbW9zW21lbW9JZF07IH1cbiAgICAgICAgfSxcblxuICAgICAgICB1bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHM6IGZ1bmN0aW9uIChkb21Ob2RlLCBleHRyYUNhbGxiYWNrUGFyYW1zQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBtZW1vcyA9IFtdO1xuICAgICAgICAgICAgZmluZE1lbW9Ob2Rlcyhkb21Ob2RlLCBtZW1vcyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IG1lbW9zLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gbWVtb3NbaV0uZG9tTm9kZTtcbiAgICAgICAgICAgICAgICB2YXIgY29tYmluZWRQYXJhbXMgPSBbbm9kZV07XG4gICAgICAgICAgICAgICAgaWYgKGV4dHJhQ2FsbGJhY2tQYXJhbXNBcnJheSlcbiAgICAgICAgICAgICAgICAgICAga28udXRpbHMuYXJyYXlQdXNoQWxsKGNvbWJpbmVkUGFyYW1zLCBleHRyYUNhbGxiYWNrUGFyYW1zQXJyYXkpO1xuICAgICAgICAgICAgICAgIGtvLm1lbW9pemF0aW9uLnVubWVtb2l6ZShtZW1vc1tpXS5tZW1vSWQsIGNvbWJpbmVkUGFyYW1zKTtcbiAgICAgICAgICAgICAgICBub2RlLm5vZGVWYWx1ZSA9IFwiXCI7IC8vIE5ldXRlciB0aGlzIG5vZGUgc28gd2UgZG9uJ3QgdHJ5IHRvIHVubWVtb2l6ZSBpdCBhZ2FpblxuICAgICAgICAgICAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTsgLy8gSWYgcG9zc2libGUsIGVyYXNlIGl0IHRvdGFsbHkgKG5vdCBhbHdheXMgcG9zc2libGUgLSBzb21lb25lIGVsc2UgbWlnaHQganVzdCBob2xkIGEgcmVmZXJlbmNlIHRvIGl0IHRoZW4gY2FsbCB1bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMgYWdhaW4pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2VNZW1vVGV4dDogZnVuY3Rpb24gKG1lbW9UZXh0KSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2ggPSBtZW1vVGV4dC5tYXRjaCgvXlxcW2tvX21lbW9cXDooLio/KVxcXSQvKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ21lbW9pemF0aW9uJywga28ubWVtb2l6YXRpb24pO1xua28uZXhwb3J0U3ltYm9sKCdtZW1vaXphdGlvbi5tZW1vaXplJywga28ubWVtb2l6YXRpb24ubWVtb2l6ZSk7XG5rby5leHBvcnRTeW1ib2woJ21lbW9pemF0aW9uLnVubWVtb2l6ZScsIGtvLm1lbW9pemF0aW9uLnVubWVtb2l6ZSk7XG5rby5leHBvcnRTeW1ib2woJ21lbW9pemF0aW9uLnBhcnNlTWVtb1RleHQnLCBrby5tZW1vaXphdGlvbi5wYXJzZU1lbW9UZXh0KTtcbmtvLmV4cG9ydFN5bWJvbCgnbWVtb2l6YXRpb24udW5tZW1vaXplRG9tTm9kZUFuZERlc2NlbmRhbnRzJywga28ubWVtb2l6YXRpb24udW5tZW1vaXplRG9tTm9kZUFuZERlc2NlbmRhbnRzKTtcbmtvLmV4dGVuZGVycyA9IHtcbiAgICAndGhyb3R0bGUnOiBmdW5jdGlvbih0YXJnZXQsIHRpbWVvdXQpIHtcbiAgICAgICAgLy8gVGhyb3R0bGluZyBtZWFucyB0d28gdGhpbmdzOlxuXG4gICAgICAgIC8vICgxKSBGb3IgZGVwZW5kZW50IG9ic2VydmFibGVzLCB3ZSB0aHJvdHRsZSAqZXZhbHVhdGlvbnMqIHNvIHRoYXQsIG5vIG1hdHRlciBob3cgZmFzdCBpdHMgZGVwZW5kZW5jaWVzXG4gICAgICAgIC8vICAgICBub3RpZnkgdXBkYXRlcywgdGhlIHRhcmdldCBkb2Vzbid0IHJlLWV2YWx1YXRlIChhbmQgaGVuY2UgZG9lc24ndCBub3RpZnkpIGZhc3RlciB0aGFuIGEgY2VydGFpbiByYXRlXG4gICAgICAgIHRhcmdldFsndGhyb3R0bGVFdmFsdWF0aW9uJ10gPSB0aW1lb3V0O1xuXG4gICAgICAgIC8vICgyKSBGb3Igd3JpdGFibGUgdGFyZ2V0cyAob2JzZXJ2YWJsZXMsIG9yIHdyaXRhYmxlIGRlcGVuZGVudCBvYnNlcnZhYmxlcyksIHdlIHRocm90dGxlICp3cml0ZXMqXG4gICAgICAgIC8vICAgICBzbyB0aGUgdGFyZ2V0IGNhbm5vdCBjaGFuZ2UgdmFsdWUgc3luY2hyb25vdXNseSBvciBmYXN0ZXIgdGhhbiBhIGNlcnRhaW4gcmF0ZVxuICAgICAgICB2YXIgd3JpdGVUaW1lb3V0SW5zdGFuY2UgPSBudWxsO1xuICAgICAgICByZXR1cm4ga28uZGVwZW5kZW50T2JzZXJ2YWJsZSh7XG4gICAgICAgICAgICAncmVhZCc6IHRhcmdldCxcbiAgICAgICAgICAgICd3cml0ZSc6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHdyaXRlVGltZW91dEluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICB3cml0ZVRpbWVvdXRJbnN0YW5jZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAncmF0ZUxpbWl0JzogZnVuY3Rpb24odGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB0aW1lb3V0LCBtZXRob2QsIGxpbWl0RnVuY3Rpb247XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aW1lb3V0ID0gb3B0aW9ucztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBvcHRpb25zWyd0aW1lb3V0J107XG4gICAgICAgICAgICBtZXRob2QgPSBvcHRpb25zWydtZXRob2QnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbWl0RnVuY3Rpb24gPSBtZXRob2QgPT0gJ25vdGlmeVdoZW5DaGFuZ2VzU3RvcCcgPyAgZGVib3VuY2UgOiB0aHJvdHRsZTtcbiAgICAgICAgdGFyZ2V0LmxpbWl0KGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gbGltaXRGdW5jdGlvbihjYWxsYmFjaywgdGltZW91dCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAnbm90aWZ5JzogZnVuY3Rpb24odGFyZ2V0LCBub3RpZnlXaGVuKSB7XG4gICAgICAgIHRhcmdldFtcImVxdWFsaXR5Q29tcGFyZXJcIl0gPSBub3RpZnlXaGVuID09IFwiYWx3YXlzXCIgP1xuICAgICAgICAgICAgbnVsbCA6ICAvLyBudWxsIGVxdWFsaXR5Q29tcGFyZXIgbWVhbnMgdG8gYWx3YXlzIG5vdGlmeVxuICAgICAgICAgICAgdmFsdWVzQXJlUHJpbWl0aXZlQW5kRXF1YWw7XG4gICAgfVxufTtcblxudmFyIHByaW1pdGl2ZVR5cGVzID0geyAndW5kZWZpbmVkJzoxLCAnYm9vbGVhbic6MSwgJ251bWJlcic6MSwgJ3N0cmluZyc6MSB9O1xuZnVuY3Rpb24gdmFsdWVzQXJlUHJpbWl0aXZlQW5kRXF1YWwoYSwgYikge1xuICAgIHZhciBvbGRWYWx1ZUlzUHJpbWl0aXZlID0gKGEgPT09IG51bGwpIHx8ICh0eXBlb2YoYSkgaW4gcHJpbWl0aXZlVHlwZXMpO1xuICAgIHJldHVybiBvbGRWYWx1ZUlzUHJpbWl0aXZlID8gKGEgPT09IGIpIDogZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHRocm90dGxlKGNhbGxiYWNrLCB0aW1lb3V0KSB7XG4gICAgdmFyIHRpbWVvdXRJbnN0YW5jZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRpbWVvdXRJbnN0YW5jZSkge1xuICAgICAgICAgICAgdGltZW91dEluc3RhbmNlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0SW5zdGFuY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZGVib3VuY2UoY2FsbGJhY2ssIHRpbWVvdXQpIHtcbiAgICB2YXIgdGltZW91dEluc3RhbmNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SW5zdGFuY2UpO1xuICAgICAgICB0aW1lb3V0SW5zdGFuY2UgPSBzZXRUaW1lb3V0KGNhbGxiYWNrLCB0aW1lb3V0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhcHBseUV4dGVuZGVycyhyZXF1ZXN0ZWRFeHRlbmRlcnMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcztcbiAgICBpZiAocmVxdWVzdGVkRXh0ZW5kZXJzKSB7XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2gocmVxdWVzdGVkRXh0ZW5kZXJzLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5kZXJIYW5kbGVyID0ga28uZXh0ZW5kZXJzW2tleV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4dGVuZGVySGFuZGxlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXh0ZW5kZXJIYW5kbGVyKHRhcmdldCwgdmFsdWUpIHx8IHRhcmdldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmtvLmV4cG9ydFN5bWJvbCgnZXh0ZW5kZXJzJywga28uZXh0ZW5kZXJzKTtcblxua28uc3Vic2NyaXB0aW9uID0gZnVuY3Rpb24gKHRhcmdldCwgY2FsbGJhY2ssIGRpc3Bvc2VDYWxsYmFjaykge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmRpc3Bvc2VDYWxsYmFjayA9IGRpc3Bvc2VDYWxsYmFjaztcbiAgICB0aGlzLmlzRGlzcG9zZWQgPSBmYWxzZTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eSh0aGlzLCAnZGlzcG9zZScsIHRoaXMuZGlzcG9zZSk7XG59O1xua28uc3Vic2NyaXB0aW9uLnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgdGhpcy5kaXNwb3NlQ2FsbGJhY2soKTtcbn07XG5cbmtvLnN1YnNjcmliYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKHRoaXMsIGtvLnN1YnNjcmliYWJsZVsnZm4nXSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IHt9O1xufVxuXG52YXIgZGVmYXVsdEV2ZW50ID0gXCJjaGFuZ2VcIjtcblxudmFyIGtvX3N1YnNjcmliYWJsZV9mbiA9IHtcbiAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIChjYWxsYmFjaywgY2FsbGJhY2tUYXJnZXQsIGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICBldmVudCA9IGV2ZW50IHx8IGRlZmF1bHRFdmVudDtcbiAgICAgICAgdmFyIGJvdW5kQ2FsbGJhY2sgPSBjYWxsYmFja1RhcmdldCA/IGNhbGxiYWNrLmJpbmQoY2FsbGJhY2tUYXJnZXQpIDogY2FsbGJhY2s7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IG5ldyBrby5zdWJzY3JpcHRpb24oc2VsZiwgYm91bmRDYWxsYmFjaywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAga28udXRpbHMuYXJyYXlSZW1vdmVJdGVtKHNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUaGlzIHdpbGwgZm9yY2UgYSBjb21wdXRlZCB3aXRoIGRlZmVyRXZhbHVhdGlvbiB0byBldmFsdWF0ZSBiZWZvcmUgYW55IHN1YnNjcmlwdGlvbnNcbiAgICAgICAgLy8gYXJlIHJlZ2lzdGVyZWQuXG4gICAgICAgIGlmIChzZWxmLnBlZWspIHtcbiAgICAgICAgICAgIHNlbGYucGVlaygpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZWxmLl9zdWJzY3JpcHRpb25zW2V2ZW50XSlcbiAgICAgICAgICAgIHNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdID0gW107XG4gICAgICAgIHNlbGYuX3N1YnNjcmlwdGlvbnNbZXZlbnRdLnB1c2goc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9LFxuXG4gICAgXCJub3RpZnlTdWJzY3JpYmVyc1wiOiBmdW5jdGlvbiAodmFsdWVUb05vdGlmeSwgZXZlbnQpIHtcbiAgICAgICAgZXZlbnQgPSBldmVudCB8fCBkZWZhdWx0RXZlbnQ7XG4gICAgICAgIGlmICh0aGlzLmhhc1N1YnNjcmlwdGlvbnNGb3JFdmVudChldmVudCkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5iZWdpbigpOyAvLyBCZWdpbiBzdXBwcmVzc2luZyBkZXBlbmRlbmN5IGRldGVjdGlvbiAoYnkgc2V0dGluZyB0aGUgdG9wIGZyYW1lIHRvIHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhID0gdGhpcy5fc3Vic2NyaXB0aW9uc1tldmVudF0uc2xpY2UoMCksIGkgPSAwLCBzdWJzY3JpcHRpb247IHN1YnNjcmlwdGlvbiA9IGFbaV07ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBjYXNlIGEgc3Vic2NyaXB0aW9uIHdhcyBkaXNwb3NlZCBkdXJpbmcgdGhlIGFycmF5Rm9yRWFjaCBjeWNsZSwgY2hlY2tcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIGlzRGlzcG9zZWQgb24gZWFjaCBzdWJzY3JpcHRpb24gYmVmb3JlIGludm9raW5nIGl0cyBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbi5pc0Rpc3Bvc2VkKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmNhbGxiYWNrKHZhbHVlVG9Ob3RpZnkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5lbmQoKTsgLy8gRW5kIHN1cHByZXNzaW5nIGRlcGVuZGVuY3kgZGV0ZWN0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbGltaXQ6IGZ1bmN0aW9uKGxpbWl0RnVuY3Rpb24pIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLCBzZWxmSXNPYnNlcnZhYmxlID0ga28uaXNPYnNlcnZhYmxlKHNlbGYpLFxuICAgICAgICAgICAgaXNQZW5kaW5nLCBwcmV2aW91c1ZhbHVlLCBwZW5kaW5nVmFsdWUsIGJlZm9yZUNoYW5nZSA9ICdiZWZvcmVDaGFuZ2UnO1xuXG4gICAgICAgIGlmICghc2VsZi5fb3JpZ05vdGlmeVN1YnNjcmliZXJzKSB7XG4gICAgICAgICAgICBzZWxmLl9vcmlnTm90aWZ5U3Vic2NyaWJlcnMgPSBzZWxmW1wibm90aWZ5U3Vic2NyaWJlcnNcIl07XG4gICAgICAgICAgICBzZWxmW1wibm90aWZ5U3Vic2NyaWJlcnNcIl0gPSBmdW5jdGlvbih2YWx1ZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2ZW50IHx8IGV2ZW50ID09PSBkZWZhdWx0RXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmF0ZUxpbWl0ZWRDaGFuZ2UodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQgPT09IGJlZm9yZUNoYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yYXRlTGltaXRlZEJlZm9yZUNoYW5nZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fb3JpZ05vdGlmeVN1YnNjcmliZXJzKHZhbHVlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaW5pc2ggPSBsaW1pdEZ1bmN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gSWYgYW4gb2JzZXJ2YWJsZSBwcm92aWRlZCBhIHJlZmVyZW5jZSB0byBpdHNlbGYsIGFjY2VzcyBpdCB0byBnZXQgdGhlIGxhdGVzdCB2YWx1ZS5cbiAgICAgICAgICAgIC8vIFRoaXMgYWxsb3dzIGNvbXB1dGVkIG9ic2VydmFibGVzIHRvIGRlbGF5IGNhbGN1bGF0aW5nIHRoZWlyIHZhbHVlIHVudGlsIG5lZWRlZC5cbiAgICAgICAgICAgIGlmIChzZWxmSXNPYnNlcnZhYmxlICYmIHBlbmRpbmdWYWx1ZSA9PT0gc2VsZikge1xuICAgICAgICAgICAgICAgIHBlbmRpbmdWYWx1ZSA9IHNlbGYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlzUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHNlbGYuaXNEaWZmZXJlbnQocHJldmlvdXNWYWx1ZSwgcGVuZGluZ1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX29yaWdOb3RpZnlTdWJzY3JpYmVycyhwcmV2aW91c1ZhbHVlID0gcGVuZGluZ1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5fcmF0ZUxpbWl0ZWRDaGFuZ2UgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaXNQZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHBlbmRpbmdWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgZmluaXNoKCk7XG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuX3JhdGVMaW1pdGVkQmVmb3JlQ2hhbmdlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGlmICghaXNQZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHNlbGYuX29yaWdOb3RpZnlTdWJzY3JpYmVycyh2YWx1ZSwgYmVmb3JlQ2hhbmdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgaGFzU3Vic2NyaXB0aW9uc0ZvckV2ZW50OiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3Vic2NyaXB0aW9uc1tldmVudF0gJiYgdGhpcy5fc3Vic2NyaXB0aW9uc1tldmVudF0ubGVuZ3RoO1xuICAgIH0sXG5cbiAgICBnZXRTdWJzY3JpcHRpb25zQ291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaCh0aGlzLl9zdWJzY3JpcHRpb25zLCBmdW5jdGlvbihldmVudE5hbWUsIHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgIHRvdGFsICs9IHN1YnNjcmlwdGlvbnMubGVuZ3RoO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH0sXG5cbiAgICBpc0RpZmZlcmVudDogZnVuY3Rpb24ob2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIHJldHVybiAhdGhpc1snZXF1YWxpdHlDb21wYXJlciddIHx8ICF0aGlzWydlcXVhbGl0eUNvbXBhcmVyJ10ob2xkVmFsdWUsIG5ld1ZhbHVlKTtcbiAgICB9LFxuXG4gICAgZXh0ZW5kOiBhcHBseUV4dGVuZGVyc1xufTtcblxua28uZXhwb3J0UHJvcGVydHkoa29fc3Vic2NyaWJhYmxlX2ZuLCAnc3Vic2NyaWJlJywga29fc3Vic2NyaWJhYmxlX2ZuLnN1YnNjcmliZSk7XG5rby5leHBvcnRQcm9wZXJ0eShrb19zdWJzY3JpYmFibGVfZm4sICdleHRlbmQnLCBrb19zdWJzY3JpYmFibGVfZm4uZXh0ZW5kKTtcbmtvLmV4cG9ydFByb3BlcnR5KGtvX3N1YnNjcmliYWJsZV9mbiwgJ2dldFN1YnNjcmlwdGlvbnNDb3VudCcsIGtvX3N1YnNjcmliYWJsZV9mbi5nZXRTdWJzY3JpcHRpb25zQ291bnQpO1xuXG4vLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IHByb3RvIGFzc2lnbm1lbnQsIHdlIG92ZXJ3cml0ZSB0aGUgcHJvdG90eXBlIG9mIGVhY2hcbi8vIG9ic2VydmFibGUgaW5zdGFuY2UuIFNpbmNlIG9ic2VydmFibGVzIGFyZSBmdW5jdGlvbnMsIHdlIG5lZWQgRnVuY3Rpb24ucHJvdG90eXBlXG4vLyB0byBzdGlsbCBiZSBpbiB0aGUgcHJvdG90eXBlIGNoYWluLlxuaWYgKGtvLnV0aWxzLmNhblNldFByb3RvdHlwZSkge1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mKGtvX3N1YnNjcmliYWJsZV9mbiwgRnVuY3Rpb24ucHJvdG90eXBlKTtcbn1cblxua28uc3Vic2NyaWJhYmxlWydmbiddID0ga29fc3Vic2NyaWJhYmxlX2ZuO1xuXG5cbmtvLmlzU3Vic2NyaWJhYmxlID0gZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlICE9IG51bGwgJiYgdHlwZW9mIGluc3RhbmNlLnN1YnNjcmliZSA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGluc3RhbmNlW1wibm90aWZ5U3Vic2NyaWJlcnNcIl0gPT0gXCJmdW5jdGlvblwiO1xufTtcblxua28uZXhwb3J0U3ltYm9sKCdzdWJzY3JpYmFibGUnLCBrby5zdWJzY3JpYmFibGUpO1xua28uZXhwb3J0U3ltYm9sKCdpc1N1YnNjcmliYWJsZScsIGtvLmlzU3Vic2NyaWJhYmxlKTtcblxua28uY29tcHV0ZWRDb250ZXh0ID0ga28uZGVwZW5kZW5jeURldGVjdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG91dGVyRnJhbWVzID0gW10sXG4gICAgICAgIGN1cnJlbnRGcmFtZSxcbiAgICAgICAgbGFzdElkID0gMDtcblxuICAgIC8vIFJldHVybiBhIHVuaXF1ZSBJRCB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBhbiBvYnNlcnZhYmxlIGZvciBkZXBlbmRlbmN5IHRyYWNraW5nLlxuICAgIC8vIFRoZW9yZXRpY2FsbHksIHlvdSBjb3VsZCBldmVudHVhbGx5IG92ZXJmbG93IHRoZSBudW1iZXIgc3RvcmFnZSBzaXplLCByZXN1bHRpbmdcbiAgICAvLyBpbiBkdXBsaWNhdGUgSURzLiBCdXQgaW4gSmF2YVNjcmlwdCwgdGhlIGxhcmdlc3QgZXhhY3QgaW50ZWdyYWwgdmFsdWUgaXMgMl41M1xuICAgIC8vIG9yIDksMDA3LDE5OSwyNTQsNzQwLDk5Mi4gSWYgeW91IGNyZWF0ZWQgMSwwMDAsMDAwIElEcyBwZXIgc2Vjb25kLCBpdCB3b3VsZFxuICAgIC8vIHRha2Ugb3ZlciAyODUgeWVhcnMgdG8gcmVhY2ggdGhhdCBudW1iZXIuXG4gICAgLy8gUmVmZXJlbmNlIGh0dHA6Ly9ibG9nLnZqZXV4LmNvbS8yMDEwL2phdmFzY3JpcHQvamF2YXNjcmlwdC1tYXhfaW50LW51bWJlci1saW1pdHMuaHRtbFxuICAgIGZ1bmN0aW9uIGdldElkKCkge1xuICAgICAgICByZXR1cm4gKytsYXN0SWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmVnaW4ob3B0aW9ucykge1xuICAgICAgICBvdXRlckZyYW1lcy5wdXNoKGN1cnJlbnRGcmFtZSk7XG4gICAgICAgIGN1cnJlbnRGcmFtZSA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kKCkge1xuICAgICAgICBjdXJyZW50RnJhbWUgPSBvdXRlckZyYW1lcy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBiZWdpbjogYmVnaW4sXG5cbiAgICAgICAgZW5kOiBlbmQsXG5cbiAgICAgICAgcmVnaXN0ZXJEZXBlbmRlbmN5OiBmdW5jdGlvbiAoc3Vic2NyaWJhYmxlKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudEZyYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFrby5pc1N1YnNjcmliYWJsZShzdWJzY3JpYmFibGUpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IHN1YnNjcmliYWJsZSB0aGluZ3MgY2FuIGFjdCBhcyBkZXBlbmRlbmNpZXNcIik7XG4gICAgICAgICAgICAgICAgY3VycmVudEZyYW1lLmNhbGxiYWNrKHN1YnNjcmliYWJsZSwgc3Vic2NyaWJhYmxlLl9pZCB8fCAoc3Vic2NyaWJhYmxlLl9pZCA9IGdldElkKCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpZ25vcmU6IGZ1bmN0aW9uIChjYWxsYmFjaywgY2FsbGJhY2tUYXJnZXQsIGNhbGxiYWNrQXJncykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBiZWdpbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseShjYWxsYmFja1RhcmdldCwgY2FsbGJhY2tBcmdzIHx8IFtdKTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0RGVwZW5kZW5jaWVzQ291bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50RnJhbWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGcmFtZS5jb21wdXRlZC5nZXREZXBlbmRlbmNpZXNDb3VudCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzSW5pdGlhbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudEZyYW1lKVxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RnJhbWUuaXNJbml0aWFsO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgnY29tcHV0ZWRDb250ZXh0Jywga28uY29tcHV0ZWRDb250ZXh0KTtcbmtvLmV4cG9ydFN5bWJvbCgnY29tcHV0ZWRDb250ZXh0LmdldERlcGVuZGVuY2llc0NvdW50Jywga28uY29tcHV0ZWRDb250ZXh0LmdldERlcGVuZGVuY2llc0NvdW50KTtcbmtvLmV4cG9ydFN5bWJvbCgnY29tcHV0ZWRDb250ZXh0LmlzSW5pdGlhbCcsIGtvLmNvbXB1dGVkQ29udGV4dC5pc0luaXRpYWwpO1xua28ub2JzZXJ2YWJsZSA9IGZ1bmN0aW9uIChpbml0aWFsVmFsdWUpIHtcbiAgICB2YXIgX2xhdGVzdFZhbHVlID0gaW5pdGlhbFZhbHVlO1xuXG4gICAgZnVuY3Rpb24gb2JzZXJ2YWJsZSgpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBXcml0ZVxuXG4gICAgICAgICAgICAvLyBJZ25vcmUgd3JpdGVzIGlmIHRoZSB2YWx1ZSBoYXNuJ3QgY2hhbmdlZFxuICAgICAgICAgICAgaWYgKG9ic2VydmFibGUuaXNEaWZmZXJlbnQoX2xhdGVzdFZhbHVlLCBhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZS52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgICAgICAgICBfbGF0ZXN0VmFsdWUgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKSBvYnNlcnZhYmxlLl9sYXRlc3RWYWx1ZSA9IF9sYXRlc3RWYWx1ZTtcbiAgICAgICAgICAgICAgICBvYnNlcnZhYmxlLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7IC8vIFBlcm1pdHMgY2hhaW5lZCBhc3NpZ25tZW50c1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gUmVhZFxuICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5yZWdpc3RlckRlcGVuZGVuY3kob2JzZXJ2YWJsZSk7IC8vIFRoZSBjYWxsZXIgb25seSBuZWVkcyB0byBiZSBub3RpZmllZCBvZiBjaGFuZ2VzIGlmIHRoZXkgZGlkIGEgXCJyZWFkXCIgb3BlcmF0aW9uXG4gICAgICAgICAgICByZXR1cm4gX2xhdGVzdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGtvLnN1YnNjcmliYWJsZS5jYWxsKG9ic2VydmFibGUpO1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mT3JFeHRlbmQob2JzZXJ2YWJsZSwga28ub2JzZXJ2YWJsZVsnZm4nXSk7XG5cbiAgICBpZiAoREVCVUcpIG9ic2VydmFibGUuX2xhdGVzdFZhbHVlID0gX2xhdGVzdFZhbHVlO1xuICAgIG9ic2VydmFibGUucGVlayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gX2xhdGVzdFZhbHVlIH07XG4gICAgb2JzZXJ2YWJsZS52YWx1ZUhhc011dGF0ZWQgPSBmdW5jdGlvbiAoKSB7IG9ic2VydmFibGVbXCJub3RpZnlTdWJzY3JpYmVyc1wiXShfbGF0ZXN0VmFsdWUpOyB9XG4gICAgb2JzZXJ2YWJsZS52YWx1ZVdpbGxNdXRhdGUgPSBmdW5jdGlvbiAoKSB7IG9ic2VydmFibGVbXCJub3RpZnlTdWJzY3JpYmVyc1wiXShfbGF0ZXN0VmFsdWUsIFwiYmVmb3JlQ2hhbmdlXCIpOyB9XG5cbiAgICBrby5leHBvcnRQcm9wZXJ0eShvYnNlcnZhYmxlLCAncGVlaycsIG9ic2VydmFibGUucGVlayk7XG4gICAga28uZXhwb3J0UHJvcGVydHkob2JzZXJ2YWJsZSwgXCJ2YWx1ZUhhc011dGF0ZWRcIiwgb2JzZXJ2YWJsZS52YWx1ZUhhc011dGF0ZWQpO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KG9ic2VydmFibGUsIFwidmFsdWVXaWxsTXV0YXRlXCIsIG9ic2VydmFibGUudmFsdWVXaWxsTXV0YXRlKTtcblxuICAgIHJldHVybiBvYnNlcnZhYmxlO1xufVxuXG5rby5vYnNlcnZhYmxlWydmbiddID0ge1xuICAgIFwiZXF1YWxpdHlDb21wYXJlclwiOiB2YWx1ZXNBcmVQcmltaXRpdmVBbmRFcXVhbFxufTtcblxudmFyIHByb3RvUHJvcGVydHkgPSBrby5vYnNlcnZhYmxlLnByb3RvUHJvcGVydHkgPSBcIl9fa29fcHJvdG9fX1wiO1xua28ub2JzZXJ2YWJsZVsnZm4nXVtwcm90b1Byb3BlcnR5XSA9IGtvLm9ic2VydmFibGU7XG5cbi8vIE5vdGUgdGhhdCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHByb3RvIGFzc2lnbm1lbnQsIHRoZVxuLy8gaW5oZXJpdGFuY2UgY2hhaW4gaXMgY3JlYXRlZCBtYW51YWxseSBpbiB0aGUga28ub2JzZXJ2YWJsZSBjb25zdHJ1Y3RvclxuaWYgKGtvLnV0aWxzLmNhblNldFByb3RvdHlwZSkge1xuICAgIGtvLnV0aWxzLnNldFByb3RvdHlwZU9mKGtvLm9ic2VydmFibGVbJ2ZuJ10sIGtvLnN1YnNjcmliYWJsZVsnZm4nXSk7XG59XG5cbmtvLmhhc1Byb3RvdHlwZSA9IGZ1bmN0aW9uKGluc3RhbmNlLCBwcm90b3R5cGUpIHtcbiAgICBpZiAoKGluc3RhbmNlID09PSBudWxsKSB8fCAoaW5zdGFuY2UgPT09IHVuZGVmaW5lZCkgfHwgKGluc3RhbmNlW3Byb3RvUHJvcGVydHldID09PSB1bmRlZmluZWQpKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGluc3RhbmNlW3Byb3RvUHJvcGVydHldID09PSBwcm90b3R5cGUpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBrby5oYXNQcm90b3R5cGUoaW5zdGFuY2VbcHJvdG9Qcm9wZXJ0eV0sIHByb3RvdHlwZSk7IC8vIFdhbGsgdGhlIHByb3RvdHlwZSBjaGFpblxufTtcblxua28uaXNPYnNlcnZhYmxlID0gZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGtvLmhhc1Byb3RvdHlwZShpbnN0YW5jZSwga28ub2JzZXJ2YWJsZSk7XG59XG5rby5pc1dyaXRlYWJsZU9ic2VydmFibGUgPSBmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAvLyBPYnNlcnZhYmxlXG4gICAgaWYgKCh0eXBlb2YgaW5zdGFuY2UgPT0gXCJmdW5jdGlvblwiKSAmJiBpbnN0YW5jZVtwcm90b1Byb3BlcnR5XSA9PT0ga28ub2JzZXJ2YWJsZSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gV3JpdGVhYmxlIGRlcGVuZGVudCBvYnNlcnZhYmxlXG4gICAgaWYgKCh0eXBlb2YgaW5zdGFuY2UgPT0gXCJmdW5jdGlvblwiKSAmJiAoaW5zdGFuY2VbcHJvdG9Qcm9wZXJ0eV0gPT09IGtvLmRlcGVuZGVudE9ic2VydmFibGUpICYmIChpbnN0YW5jZS5oYXNXcml0ZUZ1bmN0aW9uKSlcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgLy8gQW55dGhpbmcgZWxzZVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuXG5rby5leHBvcnRTeW1ib2woJ29ic2VydmFibGUnLCBrby5vYnNlcnZhYmxlKTtcbmtvLmV4cG9ydFN5bWJvbCgnaXNPYnNlcnZhYmxlJywga28uaXNPYnNlcnZhYmxlKTtcbmtvLmV4cG9ydFN5bWJvbCgnaXNXcml0ZWFibGVPYnNlcnZhYmxlJywga28uaXNXcml0ZWFibGVPYnNlcnZhYmxlKTtcbmtvLm9ic2VydmFibGVBcnJheSA9IGZ1bmN0aW9uIChpbml0aWFsVmFsdWVzKSB7XG4gICAgaW5pdGlhbFZhbHVlcyA9IGluaXRpYWxWYWx1ZXMgfHwgW107XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxWYWx1ZXMgIT0gJ29iamVjdCcgfHwgISgnbGVuZ3RoJyBpbiBpbml0aWFsVmFsdWVzKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGFyZ3VtZW50IHBhc3NlZCB3aGVuIGluaXRpYWxpemluZyBhbiBvYnNlcnZhYmxlIGFycmF5IG11c3QgYmUgYW4gYXJyYXksIG9yIG51bGwsIG9yIHVuZGVmaW5lZC5cIik7XG5cbiAgICB2YXIgcmVzdWx0ID0ga28ub2JzZXJ2YWJsZShpbml0aWFsVmFsdWVzKTtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKHJlc3VsdCwga28ub2JzZXJ2YWJsZUFycmF5WydmbiddKTtcbiAgICByZXR1cm4gcmVzdWx0LmV4dGVuZCh7J3RyYWNrQXJyYXlDaGFuZ2VzJzp0cnVlfSk7XG59O1xuXG5rby5vYnNlcnZhYmxlQXJyYXlbJ2ZuJ10gPSB7XG4gICAgJ3JlbW92ZSc6IGZ1bmN0aW9uICh2YWx1ZU9yUHJlZGljYXRlKSB7XG4gICAgICAgIHZhciB1bmRlcmx5aW5nQXJyYXkgPSB0aGlzLnBlZWsoKTtcbiAgICAgICAgdmFyIHJlbW92ZWRWYWx1ZXMgPSBbXTtcbiAgICAgICAgdmFyIHByZWRpY2F0ZSA9IHR5cGVvZiB2YWx1ZU9yUHJlZGljYXRlID09IFwiZnVuY3Rpb25cIiAmJiAha28uaXNPYnNlcnZhYmxlKHZhbHVlT3JQcmVkaWNhdGUpID8gdmFsdWVPclByZWRpY2F0ZSA6IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgPT09IHZhbHVlT3JQcmVkaWNhdGU7IH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5kZXJseWluZ0FycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB1bmRlcmx5aW5nQXJyYXlbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVkVmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZW1vdmVkVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgIHVuZGVybHlpbmdBcnJheS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1vdmVkVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZUhhc011dGF0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtb3ZlZFZhbHVlcztcbiAgICB9LFxuXG4gICAgJ3JlbW92ZUFsbCc6IGZ1bmN0aW9uIChhcnJheU9mVmFsdWVzKSB7XG4gICAgICAgIC8vIElmIHlvdSBwYXNzZWQgemVybyBhcmdzLCB3ZSByZW1vdmUgZXZlcnl0aGluZ1xuICAgICAgICBpZiAoYXJyYXlPZlZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcy5wZWVrKCk7XG4gICAgICAgICAgICB2YXIgYWxsVmFsdWVzID0gdW5kZXJseWluZ0FycmF5LnNsaWNlKDApO1xuICAgICAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgICAgIHVuZGVybHlpbmdBcnJheS5zcGxpY2UoMCwgdW5kZXJseWluZ0FycmF5Lmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGFsbFZhbHVlcztcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB5b3UgcGFzc2VkIGFuIGFyZywgd2UgaW50ZXJwcmV0IGl0IGFzIGFuIGFycmF5IG9mIGVudHJpZXMgdG8gcmVtb3ZlXG4gICAgICAgIGlmICghYXJyYXlPZlZhbHVlcylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIHRoaXNbJ3JlbW92ZSddKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZihhcnJheU9mVmFsdWVzLCB2YWx1ZSkgPj0gMDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdkZXN0cm95JzogZnVuY3Rpb24gKHZhbHVlT3JQcmVkaWNhdGUpIHtcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMucGVlaygpO1xuICAgICAgICB2YXIgcHJlZGljYXRlID0gdHlwZW9mIHZhbHVlT3JQcmVkaWNhdGUgPT0gXCJmdW5jdGlvblwiICYmICFrby5pc09ic2VydmFibGUodmFsdWVPclByZWRpY2F0ZSkgPyB2YWx1ZU9yUHJlZGljYXRlIDogZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB2YWx1ZSA9PT0gdmFsdWVPclByZWRpY2F0ZTsgfTtcbiAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHVuZGVybHlpbmdBcnJheS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdW5kZXJseWluZ0FycmF5W2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgdW5kZXJseWluZ0FycmF5W2ldW1wiX2Rlc3Ryb3lcIl0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmFsdWVIYXNNdXRhdGVkKCk7XG4gICAgfSxcblxuICAgICdkZXN0cm95QWxsJzogZnVuY3Rpb24gKGFycmF5T2ZWYWx1ZXMpIHtcbiAgICAgICAgLy8gSWYgeW91IHBhc3NlZCB6ZXJvIGFyZ3MsIHdlIGRlc3Ryb3kgZXZlcnl0aGluZ1xuICAgICAgICBpZiAoYXJyYXlPZlZhbHVlcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ2Rlc3Ryb3knXShmdW5jdGlvbigpIHsgcmV0dXJuIHRydWUgfSk7XG5cbiAgICAgICAgLy8gSWYgeW91IHBhc3NlZCBhbiBhcmcsIHdlIGludGVycHJldCBpdCBhcyBhbiBhcnJheSBvZiBlbnRyaWVzIHRvIGRlc3Ryb3lcbiAgICAgICAgaWYgKCFhcnJheU9mVmFsdWVzKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gdGhpc1snZGVzdHJveSddKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZihhcnJheU9mVmFsdWVzLCB2YWx1ZSkgPj0gMDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgICdpbmRleE9mJzogZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMoKTtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmFycmF5SW5kZXhPZih1bmRlcmx5aW5nQXJyYXksIGl0ZW0pO1xuICAgIH0sXG5cbiAgICAncmVwbGFjZSc6IGZ1bmN0aW9uKG9sZEl0ZW0sIG5ld0l0ZW0pIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpc1snaW5kZXhPZiddKG9sZEl0ZW0pO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy52YWx1ZVdpbGxNdXRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucGVlaygpW2luZGV4XSA9IG5ld0l0ZW07XG4gICAgICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gUG9wdWxhdGUga28ub2JzZXJ2YWJsZUFycmF5LmZuIHdpdGggcmVhZC93cml0ZSBmdW5jdGlvbnMgZnJvbSBuYXRpdmUgYXJyYXlzXG4vLyBJbXBvcnRhbnQ6IERvIG5vdCBhZGQgYW55IGFkZGl0aW9uYWwgZnVuY3Rpb25zIGhlcmUgdGhhdCBtYXkgcmVhc29uYWJseSBiZSB1c2VkIHRvICpyZWFkKiBkYXRhIGZyb20gdGhlIGFycmF5XG4vLyBiZWNhdXNlIHdlJ2xsIGV2YWwgdGhlbSB3aXRob3V0IGNhdXNpbmcgc3Vic2NyaXB0aW9ucywgc28ga28uY29tcHV0ZWQgb3V0cHV0IGNvdWxkIGVuZCB1cCBnZXR0aW5nIHN0YWxlXG5rby51dGlscy5hcnJheUZvckVhY2goW1wicG9wXCIsIFwicHVzaFwiLCBcInJldmVyc2VcIiwgXCJzaGlmdFwiLCBcInNvcnRcIiwgXCJzcGxpY2VcIiwgXCJ1bnNoaWZ0XCJdLCBmdW5jdGlvbiAobWV0aG9kTmFtZSkge1xuICAgIGtvLm9ic2VydmFibGVBcnJheVsnZm4nXVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gVXNlIFwicGVla1wiIHRvIGF2b2lkIGNyZWF0aW5nIGEgc3Vic2NyaXB0aW9uIGluIGFueSBjb21wdXRlZCB0aGF0IHdlJ3JlIGV4ZWN1dGluZyBpbiB0aGUgY29udGV4dCBvZlxuICAgICAgICAvLyAoZm9yIGNvbnNpc3RlbmN5IHdpdGggbXV0YXRpbmcgcmVndWxhciBvYnNlcnZhYmxlcylcbiAgICAgICAgdmFyIHVuZGVybHlpbmdBcnJheSA9IHRoaXMucGVlaygpO1xuICAgICAgICB0aGlzLnZhbHVlV2lsbE11dGF0ZSgpO1xuICAgICAgICB0aGlzLmNhY2hlRGlmZkZvcktub3duT3BlcmF0aW9uKHVuZGVybHlpbmdBcnJheSwgbWV0aG9kTmFtZSwgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIG1ldGhvZENhbGxSZXN1bHQgPSB1bmRlcmx5aW5nQXJyYXlbbWV0aG9kTmFtZV0uYXBwbHkodW5kZXJseWluZ0FycmF5LCBhcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnZhbHVlSGFzTXV0YXRlZCgpO1xuICAgICAgICByZXR1cm4gbWV0aG9kQ2FsbFJlc3VsdDtcbiAgICB9O1xufSk7XG5cbi8vIFBvcHVsYXRlIGtvLm9ic2VydmFibGVBcnJheS5mbiB3aXRoIHJlYWQtb25seSBmdW5jdGlvbnMgZnJvbSBuYXRpdmUgYXJyYXlzXG5rby51dGlscy5hcnJheUZvckVhY2goW1wic2xpY2VcIl0sIGZ1bmN0aW9uIChtZXRob2ROYW1lKSB7XG4gICAga28ub2JzZXJ2YWJsZUFycmF5WydmbiddW21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdW5kZXJseWluZ0FycmF5ID0gdGhpcygpO1xuICAgICAgICByZXR1cm4gdW5kZXJseWluZ0FycmF5W21ldGhvZE5hbWVdLmFwcGx5KHVuZGVybHlpbmdBcnJheSwgYXJndW1lbnRzKTtcbiAgICB9O1xufSk7XG5cbi8vIE5vdGUgdGhhdCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHByb3RvIGFzc2lnbm1lbnQsIHRoZVxuLy8gaW5oZXJpdGFuY2UgY2hhaW4gaXMgY3JlYXRlZCBtYW51YWxseSBpbiB0aGUga28ub2JzZXJ2YWJsZUFycmF5IGNvbnN0cnVjdG9yXG5pZiAoa28udXRpbHMuY2FuU2V0UHJvdG90eXBlKSB7XG4gICAga28udXRpbHMuc2V0UHJvdG90eXBlT2Yoa28ub2JzZXJ2YWJsZUFycmF5WydmbiddLCBrby5vYnNlcnZhYmxlWydmbiddKTtcbn1cblxua28uZXhwb3J0U3ltYm9sKCdvYnNlcnZhYmxlQXJyYXknLCBrby5vYnNlcnZhYmxlQXJyYXkpO1xudmFyIGFycmF5Q2hhbmdlRXZlbnROYW1lID0gJ2FycmF5Q2hhbmdlJztcbmtvLmV4dGVuZGVyc1sndHJhY2tBcnJheUNoYW5nZXMnXSA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIC8vIE9ubHkgbW9kaWZ5IHRoZSB0YXJnZXQgb2JzZXJ2YWJsZSBvbmNlXG4gICAgaWYgKHRhcmdldC5jYWNoZURpZmZGb3JLbm93bk9wZXJhdGlvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0cmFja2luZ0NoYW5nZXMgPSBmYWxzZSxcbiAgICAgICAgY2FjaGVkRGlmZiA9IG51bGwsXG4gICAgICAgIHBlbmRpbmdOb3RpZmljYXRpb25zID0gMCxcbiAgICAgICAgdW5kZXJseWluZ1N1YnNjcmliZUZ1bmN0aW9uID0gdGFyZ2V0LnN1YnNjcmliZTtcblxuICAgIC8vIEludGVyY2VwdCBcInN1YnNjcmliZVwiIGNhbGxzLCBhbmQgZm9yIGFycmF5IGNoYW5nZSBldmVudHMsIGVuc3VyZSBjaGFuZ2UgdHJhY2tpbmcgaXMgZW5hYmxlZFxuICAgIHRhcmdldC5zdWJzY3JpYmUgPSB0YXJnZXRbJ3N1YnNjcmliZSddID0gZnVuY3Rpb24oY2FsbGJhY2ssIGNhbGxiYWNrVGFyZ2V0LCBldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQgPT09IGFycmF5Q2hhbmdlRXZlbnROYW1lKSB7XG4gICAgICAgICAgICB0cmFja0NoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZXJseWluZ1N1YnNjcmliZUZ1bmN0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHRyYWNrQ2hhbmdlcygpIHtcbiAgICAgICAgLy8gQ2FsbGluZyAndHJhY2tDaGFuZ2VzJyBtdWx0aXBsZSB0aW1lcyBpcyB0aGUgc2FtZSBhcyBjYWxsaW5nIGl0IG9uY2VcbiAgICAgICAgaWYgKHRyYWNraW5nQ2hhbmdlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJhY2tpbmdDaGFuZ2VzID0gdHJ1ZTtcblxuICAgICAgICAvLyBJbnRlcmNlcHQgXCJub3RpZnlTdWJzY3JpYmVyc1wiIHRvIHRyYWNrIGhvdyBtYW55IHRpbWVzIGl0IHdhcyBjYWxsZWQuXG4gICAgICAgIHZhciB1bmRlcmx5aW5nTm90aWZ5U3Vic2NyaWJlcnNGdW5jdGlvbiA9IHRhcmdldFsnbm90aWZ5U3Vic2NyaWJlcnMnXTtcbiAgICAgICAgdGFyZ2V0Wydub3RpZnlTdWJzY3JpYmVycyddID0gZnVuY3Rpb24odmFsdWVUb05vdGlmeSwgZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghZXZlbnQgfHwgZXZlbnQgPT09IGRlZmF1bHRFdmVudCkge1xuICAgICAgICAgICAgICAgICsrcGVuZGluZ05vdGlmaWNhdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5kZXJseWluZ05vdGlmeVN1YnNjcmliZXJzRnVuY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBFYWNoIHRpbWUgdGhlIGFycmF5IGNoYW5nZXMgdmFsdWUsIGNhcHR1cmUgYSBjbG9uZSBzbyB0aGF0IG9uIHRoZSBuZXh0XG4gICAgICAgIC8vIGNoYW5nZSBpdCdzIHBvc3NpYmxlIHRvIHByb2R1Y2UgYSBkaWZmXG4gICAgICAgIHZhciBwcmV2aW91c0NvbnRlbnRzID0gW10uY29uY2F0KHRhcmdldC5wZWVrKCkgfHwgW10pO1xuICAgICAgICBjYWNoZWREaWZmID0gbnVsbDtcbiAgICAgICAgdGFyZ2V0LnN1YnNjcmliZShmdW5jdGlvbihjdXJyZW50Q29udGVudHMpIHtcbiAgICAgICAgICAgIC8vIE1ha2UgYSBjb3B5IG9mIHRoZSBjdXJyZW50IGNvbnRlbnRzIGFuZCBlbnN1cmUgaXQncyBhbiBhcnJheVxuICAgICAgICAgICAgY3VycmVudENvbnRlbnRzID0gW10uY29uY2F0KGN1cnJlbnRDb250ZW50cyB8fCBbXSk7XG5cbiAgICAgICAgICAgIC8vIENvbXB1dGUgdGhlIGRpZmYgYW5kIGlzc3VlIG5vdGlmaWNhdGlvbnMsIGJ1dCBvbmx5IGlmIHNvbWVvbmUgaXMgbGlzdGVuaW5nXG4gICAgICAgICAgICBpZiAodGFyZ2V0Lmhhc1N1YnNjcmlwdGlvbnNGb3JFdmVudChhcnJheUNoYW5nZUV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hhbmdlcyA9IGdldENoYW5nZXMocHJldmlvdXNDb250ZW50cywgY3VycmVudENvbnRlbnRzKTtcbiAgICAgICAgICAgICAgICBpZiAoY2hhbmdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Wydub3RpZnlTdWJzY3JpYmVycyddKGNoYW5nZXMsIGFycmF5Q2hhbmdlRXZlbnROYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVsaW1pbmF0ZSByZWZlcmVuY2VzIHRvIHRoZSBvbGQsIHJlbW92ZWQgaXRlbXMsIHNvIHRoZXkgY2FuIGJlIEdDZWRcbiAgICAgICAgICAgIHByZXZpb3VzQ29udGVudHMgPSBjdXJyZW50Q29udGVudHM7XG4gICAgICAgICAgICBjYWNoZWREaWZmID0gbnVsbDtcbiAgICAgICAgICAgIHBlbmRpbmdOb3RpZmljYXRpb25zID0gMDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2hhbmdlcyhwcmV2aW91c0NvbnRlbnRzLCBjdXJyZW50Q29udGVudHMpIHtcbiAgICAgICAgLy8gV2UgdHJ5IHRvIHJlLXVzZSBjYWNoZWQgZGlmZnMuXG4gICAgICAgIC8vIFRoZSBzY2VuYXJpb3Mgd2hlcmUgcGVuZGluZ05vdGlmaWNhdGlvbnMgPiAxIGFyZSB3aGVuIHVzaW5nIHJhdGUtbGltaXRpbmcgb3IgdGhlIERlZmVycmVkIFVwZGF0ZXNcbiAgICAgICAgLy8gcGx1Z2luLCB3aGljaCB3aXRob3V0IHRoaXMgY2hlY2sgd291bGQgbm90IGJlIGNvbXBhdGlibGUgd2l0aCBhcnJheUNoYW5nZSBub3RpZmljYXRpb25zLiBOb3JtYWxseSxcbiAgICAgICAgLy8gbm90aWZpY2F0aW9ucyBhcmUgaXNzdWVkIGltbWVkaWF0ZWx5IHNvIHdlIHdvdWxkbid0IGJlIHF1ZXVlaW5nIHVwIG1vcmUgdGhhbiBvbmUuXG4gICAgICAgIGlmICghY2FjaGVkRGlmZiB8fCBwZW5kaW5nTm90aWZpY2F0aW9ucyA+IDEpIHtcbiAgICAgICAgICAgIGNhY2hlZERpZmYgPSBrby51dGlscy5jb21wYXJlQXJyYXlzKHByZXZpb3VzQ29udGVudHMsIGN1cnJlbnRDb250ZW50cywgeyAnc3BhcnNlJzogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjYWNoZWREaWZmO1xuICAgIH1cblxuICAgIHRhcmdldC5jYWNoZURpZmZGb3JLbm93bk9wZXJhdGlvbiA9IGZ1bmN0aW9uKHJhd0FycmF5LCBvcGVyYXRpb25OYW1lLCBhcmdzKSB7XG4gICAgICAgIC8vIE9ubHkgcnVuIGlmIHdlJ3JlIGN1cnJlbnRseSB0cmFja2luZyBjaGFuZ2VzIGZvciB0aGlzIG9ic2VydmFibGUgYXJyYXlcbiAgICAgICAgLy8gYW5kIHRoZXJlIGFyZW4ndCBhbnkgcGVuZGluZyBkZWZlcnJlZCBub3RpZmljYXRpb25zLlxuICAgICAgICBpZiAoIXRyYWNraW5nQ2hhbmdlcyB8fCBwZW5kaW5nTm90aWZpY2F0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkaWZmID0gW10sXG4gICAgICAgICAgICBhcnJheUxlbmd0aCA9IHJhd0FycmF5Lmxlbmd0aCxcbiAgICAgICAgICAgIGFyZ3NMZW5ndGggPSBhcmdzLmxlbmd0aCxcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gcHVzaERpZmYoc3RhdHVzLCB2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmW2RpZmYubGVuZ3RoXSA9IHsgJ3N0YXR1cyc6IHN0YXR1cywgJ3ZhbHVlJzogdmFsdWUsICdpbmRleCc6IGluZGV4IH07XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChvcGVyYXRpb25OYW1lKSB7XG4gICAgICAgICAgICBjYXNlICdwdXNoJzpcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBhcnJheUxlbmd0aDtcbiAgICAgICAgICAgIGNhc2UgJ3Vuc2hpZnQnOlxuICAgICAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBhcmdzTGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHB1c2hEaWZmKCdhZGRlZCcsIGFyZ3NbaW5kZXhdLCBvZmZzZXQgKyBpbmRleCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdwb3AnOlxuICAgICAgICAgICAgICAgIG9mZnNldCA9IGFycmF5TGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGNhc2UgJ3NoaWZ0JzpcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXlMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcHVzaERpZmYoJ2RlbGV0ZWQnLCByYXdBcnJheVtvZmZzZXRdLCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnc3BsaWNlJzpcbiAgICAgICAgICAgICAgICAvLyBOZWdhdGl2ZSBzdGFydCBpbmRleCBtZWFucyAnZnJvbSBlbmQgb2YgYXJyYXknLiBBZnRlciB0aGF0IHdlIGNsYW1wIHRvIFswLi4uYXJyYXlMZW5ndGhdLlxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9zcGxpY2VcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRJbmRleCA9IE1hdGgubWluKE1hdGgubWF4KDAsIGFyZ3NbMF0gPCAwID8gYXJyYXlMZW5ndGggKyBhcmdzWzBdIDogYXJnc1swXSksIGFycmF5TGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kRGVsZXRlSW5kZXggPSBhcmdzTGVuZ3RoID09PSAxID8gYXJyYXlMZW5ndGggOiBNYXRoLm1pbihzdGFydEluZGV4ICsgKGFyZ3NbMV0gfHwgMCksIGFycmF5TGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kQWRkSW5kZXggPSBzdGFydEluZGV4ICsgYXJnc0xlbmd0aCAtIDIsXG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gTWF0aC5tYXgoZW5kRGVsZXRlSW5kZXgsIGVuZEFkZEluZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25zID0gW10sIGRlbGV0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gc3RhcnRJbmRleCwgYXJnc0luZGV4ID0gMjsgaW5kZXggPCBlbmRJbmRleDsgKytpbmRleCwgKythcmdzSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgZW5kRGVsZXRlSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGlvbnMucHVzaChwdXNoRGlmZignZGVsZXRlZCcsIHJhd0FycmF5W2luZGV4XSwgaW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgZW5kQWRkSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbnMucHVzaChwdXNoRGlmZignYWRkZWQnLCBhcmdzW2FyZ3NJbmRleF0sIGluZGV4KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmZpbmRNb3Zlc0luQXJyYXlDb21wYXJpc29uKGRlbGV0aW9ucywgYWRkaXRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FjaGVkRGlmZiA9IGRpZmY7XG4gICAgfTtcbn07XG5rby5jb21wdXRlZCA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUgPSBmdW5jdGlvbiAoZXZhbHVhdG9yRnVuY3Rpb25Pck9wdGlvbnMsIGV2YWx1YXRvckZ1bmN0aW9uVGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgdmFyIF9sYXRlc3RWYWx1ZSxcbiAgICAgICAgX25lZWRzRXZhbHVhdGlvbiA9IHRydWUsXG4gICAgICAgIF9pc0JlaW5nRXZhbHVhdGVkID0gZmFsc2UsXG4gICAgICAgIF9zdXBwcmVzc0Rpc3Bvc2FsVW50aWxEaXNwb3NlV2hlblJldHVybnNGYWxzZSA9IGZhbHNlLFxuICAgICAgICBfaXNEaXNwb3NlZCA9IGZhbHNlLFxuICAgICAgICByZWFkRnVuY3Rpb24gPSBldmFsdWF0b3JGdW5jdGlvbk9yT3B0aW9ucztcblxuICAgIGlmIChyZWFkRnVuY3Rpb24gJiYgdHlwZW9mIHJlYWRGdW5jdGlvbiA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIC8vIFNpbmdsZS1wYXJhbWV0ZXIgc3ludGF4IC0gZXZlcnl0aGluZyBpcyBvbiB0aGlzIFwib3B0aW9uc1wiIHBhcmFtXG4gICAgICAgIG9wdGlvbnMgPSByZWFkRnVuY3Rpb247XG4gICAgICAgIHJlYWRGdW5jdGlvbiA9IG9wdGlvbnNbXCJyZWFkXCJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE11bHRpLXBhcmFtZXRlciBzeW50YXggLSBjb25zdHJ1Y3QgdGhlIG9wdGlvbnMgYWNjb3JkaW5nIHRvIHRoZSBwYXJhbXMgcGFzc2VkXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBpZiAoIXJlYWRGdW5jdGlvbilcbiAgICAgICAgICAgIHJlYWRGdW5jdGlvbiA9IG9wdGlvbnNbXCJyZWFkXCJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlYWRGdW5jdGlvbiAhPSBcImZ1bmN0aW9uXCIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhc3MgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBrby5jb21wdXRlZFwiKTtcblxuICAgIGZ1bmN0aW9uIGFkZFN1YnNjcmlwdGlvblRvRGVwZW5kZW5jeShzdWJzY3JpYmFibGUsIGlkKSB7XG4gICAgICAgIGlmICghX3N1YnNjcmlwdGlvbnNUb0RlcGVuZGVuY2llc1tpZF0pIHtcbiAgICAgICAgICAgIF9zdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXNbaWRdID0gc3Vic2NyaWJhYmxlLnN1YnNjcmliZShldmFsdWF0ZVBvc3NpYmx5QXN5bmMpO1xuICAgICAgICAgICAgKytfZGVwZW5kZW5jaWVzQ291bnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXNwb3NlQWxsU3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzKCkge1xuICAgICAgICBfaXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICAgIGtvLnV0aWxzLm9iamVjdEZvckVhY2goX3N1YnNjcmlwdGlvbnNUb0RlcGVuZGVuY2llcywgZnVuY3Rpb24gKGlkLCBzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzID0ge307XG4gICAgICAgIF9kZXBlbmRlbmNpZXNDb3VudCA9IDA7XG4gICAgICAgIF9uZWVkc0V2YWx1YXRpb24gPSBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBldmFsdWF0ZVBvc3NpYmx5QXN5bmMoKSB7XG4gICAgICAgIHZhciB0aHJvdHRsZUV2YWx1YXRpb25UaW1lb3V0ID0gZGVwZW5kZW50T2JzZXJ2YWJsZVsndGhyb3R0bGVFdmFsdWF0aW9uJ107XG4gICAgICAgIGlmICh0aHJvdHRsZUV2YWx1YXRpb25UaW1lb3V0ICYmIHRocm90dGxlRXZhbHVhdGlvblRpbWVvdXQgPj0gMCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGV2YWx1YXRpb25UaW1lb3V0SW5zdGFuY2UpO1xuICAgICAgICAgICAgZXZhbHVhdGlvblRpbWVvdXRJbnN0YW5jZSA9IHNldFRpbWVvdXQoZXZhbHVhdGVJbW1lZGlhdGUsIHRocm90dGxlRXZhbHVhdGlvblRpbWVvdXQpO1xuICAgICAgICB9IGVsc2UgaWYgKGRlcGVuZGVudE9ic2VydmFibGUuX2V2YWxSYXRlTGltaXRlZCkge1xuICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5fZXZhbFJhdGVMaW1pdGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmFsdWF0ZUltbWVkaWF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXZhbHVhdGVJbW1lZGlhdGUoKSB7XG4gICAgICAgIGlmIChfaXNCZWluZ0V2YWx1YXRlZCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGV2YWx1YXRpb24gb2YgYSBrby5jb21wdXRlZCBjYXVzZXMgc2lkZSBlZmZlY3RzLCBpdCdzIHBvc3NpYmxlIHRoYXQgaXQgd2lsbCB0cmlnZ2VyIGl0cyBvd24gcmUtZXZhbHVhdGlvbi5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgbm90IGRlc2lyYWJsZSAoaXQncyBoYXJkIGZvciBhIGRldmVsb3BlciB0byByZWFsaXNlIGEgY2hhaW4gb2YgZGVwZW5kZW5jaWVzIG1pZ2h0IGNhdXNlIHRoaXMsIGFuZCB0aGV5IGFsbW9zdFxuICAgICAgICAgICAgLy8gY2VydGFpbmx5IGRpZG4ndCBpbnRlbmQgaW5maW5pdGUgcmUtZXZhbHVhdGlvbnMpLiBTbywgZm9yIHByZWRpY3RhYmlsaXR5LCB3ZSBzaW1wbHkgcHJldmVudCBrby5jb21wdXRlZHMgZnJvbSBjYXVzaW5nXG4gICAgICAgICAgICAvLyB0aGVpciBvd24gcmUtZXZhbHVhdGlvbi4gRnVydGhlciBkaXNjdXNzaW9uIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9wdWxsLzM4N1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gbm90IGV2YWx1YXRlIChhbmQgcG9zc2libHkgY2FwdHVyZSBuZXcgZGVwZW5kZW5jaWVzKSBpZiBkaXNwb3NlZFxuICAgICAgICBpZiAoX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkaXNwb3NlV2hlbiAmJiBkaXNwb3NlV2hlbigpKSB7XG4gICAgICAgICAgICAvLyBTZWUgY29tbWVudCBiZWxvdyBhYm91dCBfc3VwcHJlc3NEaXNwb3NhbFVudGlsRGlzcG9zZVdoZW5SZXR1cm5zRmFsc2VcbiAgICAgICAgICAgIGlmICghX3N1cHByZXNzRGlzcG9zYWxVbnRpbERpc3Bvc2VXaGVuUmV0dXJuc0ZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEl0IGp1c3QgZGlkIHJldHVybiBmYWxzZSwgc28gd2UgY2FuIHN0b3Agc3VwcHJlc3Npbmcgbm93XG4gICAgICAgICAgICBfc3VwcHJlc3NEaXNwb3NhbFVudGlsRGlzcG9zZVdoZW5SZXR1cm5zRmFsc2UgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9pc0JlaW5nRXZhbHVhdGVkID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgd2UgYXNzdW1lIHRoYXQgbm9uZSBvZiB0aGUgc3Vic2NyaXB0aW9ucyBhcmUgc3RpbGwgYmVpbmcgdXNlZCAoaS5lLiwgYWxsIGFyZSBjYW5kaWRhdGVzIGZvciBkaXNwb3NhbCkuXG4gICAgICAgICAgICAvLyBUaGVuLCBkdXJpbmcgZXZhbHVhdGlvbiwgd2UgY3Jvc3Mgb2ZmIGFueSB0aGF0IGFyZSBpbiBmYWN0IHN0aWxsIGJlaW5nIHVzZWQuXG4gICAgICAgICAgICB2YXIgZGlzcG9zYWxDYW5kaWRhdGVzID0gX3N1YnNjcmlwdGlvbnNUb0RlcGVuZGVuY2llcywgZGlzcG9zYWxDb3VudCA9IF9kZXBlbmRlbmNpZXNDb3VudDtcbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uYmVnaW4oe1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihzdWJzY3JpYmFibGUsIGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX2lzRGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXNwb3NhbENvdW50ICYmIGRpc3Bvc2FsQ2FuZGlkYXRlc1tpZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb24ndCB3YW50IHRvIGRpc3Bvc2UgdGhpcyBzdWJzY3JpcHRpb24sIGFzIGl0J3Mgc3RpbGwgYmVpbmcgdXNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25zVG9EZXBlbmRlbmNpZXNbaWRdID0gZGlzcG9zYWxDYW5kaWRhdGVzW2lkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArK19kZXBlbmRlbmNpZXNDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGlzcG9zYWxDYW5kaWRhdGVzW2lkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLWRpc3Bvc2FsQ291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJyYW5kIG5ldyBzdWJzY3JpcHRpb24gLSBhZGQgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRTdWJzY3JpcHRpb25Ub0RlcGVuZGVuY3koc3Vic2NyaWJhYmxlLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXB1dGVkOiBkZXBlbmRlbnRPYnNlcnZhYmxlLFxuICAgICAgICAgICAgICAgIGlzSW5pdGlhbDogIV9kZXBlbmRlbmNpZXNDb3VudCAgICAgICAgLy8gSWYgd2UncmUgZXZhbHVhdGluZyB3aGVuIHRoZXJlIGFyZSBubyBwcmV2aW91cyBkZXBlbmRlbmNpZXMsIGl0IG11c3QgYmUgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzID0ge307XG4gICAgICAgICAgICBfZGVwZW5kZW5jaWVzQ291bnQgPSAwO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IGV2YWx1YXRvckZ1bmN0aW9uVGFyZ2V0ID8gcmVhZEZ1bmN0aW9uLmNhbGwoZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQpIDogcmVhZEZ1bmN0aW9uKCk7XG5cbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5lbmQoKTtcblxuICAgICAgICAgICAgICAgIC8vIEZvciBlYWNoIHN1YnNjcmlwdGlvbiBubyBsb25nZXIgYmVpbmcgdXNlZCwgcmVtb3ZlIGl0IGZyb20gdGhlIGFjdGl2ZSBzdWJzY3JpcHRpb25zIGxpc3QgYW5kIGRpc3Bvc2UgaXRcbiAgICAgICAgICAgICAgICBpZiAoZGlzcG9zYWxDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKGRpc3Bvc2FsQ2FuZGlkYXRlcywgZnVuY3Rpb24oaWQsIHRvRGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9EaXNwb3NlLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgX25lZWRzRXZhbHVhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGVwZW5kZW50T2JzZXJ2YWJsZS5pc0RpZmZlcmVudChfbGF0ZXN0VmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGRlcGVuZGVudE9ic2VydmFibGVbXCJub3RpZnlTdWJzY3JpYmVyc1wiXShfbGF0ZXN0VmFsdWUsIFwiYmVmb3JlQ2hhbmdlXCIpO1xuXG4gICAgICAgICAgICAgICAgX2xhdGVzdFZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKERFQlVHKSBkZXBlbmRlbnRPYnNlcnZhYmxlLl9sYXRlc3RWYWx1ZSA9IF9sYXRlc3RWYWx1ZTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHJhdGUtbGltaXRlZCwgdGhlIG5vdGlmaWNhdGlvbiB3aWxsIGhhcHBlbiB3aXRoaW4gdGhlIGxpbWl0IGZ1bmN0aW9uLiBPdGhlcndpc2UsXG4gICAgICAgICAgICAgICAgLy8gbm90aWZ5IGFzIHNvb24gYXMgdGhlIHZhbHVlIGNoYW5nZXMuIENoZWNrIHNwZWNpZmljYWxseSBmb3IgdGhlIHRocm90dGxlIHNldHRpbmcgc2luY2VcbiAgICAgICAgICAgICAgICAvLyBpdCBvdmVycmlkZXMgcmF0ZUxpbWl0LlxuICAgICAgICAgICAgICAgIGlmICghZGVwZW5kZW50T2JzZXJ2YWJsZS5fZXZhbFJhdGVMaW1pdGVkIHx8IGRlcGVuZGVudE9ic2VydmFibGVbJ3Rocm90dGxlRXZhbHVhdGlvbiddKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlcGVuZGVudE9ic2VydmFibGVbXCJub3RpZnlTdWJzY3JpYmVyc1wiXShfbGF0ZXN0VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIF9pc0JlaW5nRXZhbHVhdGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV9kZXBlbmRlbmNpZXNDb3VudClcbiAgICAgICAgICAgIGRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXBlbmRlbnRPYnNlcnZhYmxlKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JpdGVGdW5jdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gV3JpdGluZyBhIHZhbHVlXG4gICAgICAgICAgICAgICAgd3JpdGVGdW5jdGlvbi5hcHBseShldmFsdWF0b3JGdW5jdGlvblRhcmdldCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHdyaXRlIGEgdmFsdWUgdG8gYSBrby5jb21wdXRlZCB1bmxlc3MgeW91IHNwZWNpZnkgYSAnd3JpdGUnIG9wdGlvbi4gSWYgeW91IHdpc2ggdG8gcmVhZCB0aGUgY3VycmVudCB2YWx1ZSwgZG9uJ3QgcGFzcyBhbnkgcGFyYW1ldGVycy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpczsgLy8gUGVybWl0cyBjaGFpbmVkIGFzc2lnbm1lbnRzXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZWFkaW5nIHRoZSB2YWx1ZVxuICAgICAgICAgICAgaWYgKF9uZWVkc0V2YWx1YXRpb24pXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVJbW1lZGlhdGUoKTtcbiAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24ucmVnaXN0ZXJEZXBlbmRlbmN5KGRlcGVuZGVudE9ic2VydmFibGUpO1xuICAgICAgICAgICAgcmV0dXJuIF9sYXRlc3RWYWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZWsoKSB7XG4gICAgICAgIC8vIFBlZWsgd29uJ3QgcmUtZXZhbHVhdGUsIGV4Y2VwdCB0byBnZXQgdGhlIGluaXRpYWwgdmFsdWUgd2hlbiBcImRlZmVyRXZhbHVhdGlvblwiIGlzIHNldC5cbiAgICAgICAgLy8gVGhhdCdzIHRoZSBvbmx5IHRpbWUgdGhhdCBib3RoIG9mIHRoZXNlIGNvbmRpdGlvbnMgd2lsbCBiZSBzYXRpc2ZpZWQuXG4gICAgICAgIGlmIChfbmVlZHNFdmFsdWF0aW9uICYmICFfZGVwZW5kZW5jaWVzQ291bnQpXG4gICAgICAgICAgICBldmFsdWF0ZUltbWVkaWF0ZSgpO1xuICAgICAgICByZXR1cm4gX2xhdGVzdFZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQWN0aXZlKCkge1xuICAgICAgICByZXR1cm4gX25lZWRzRXZhbHVhdGlvbiB8fCBfZGVwZW5kZW5jaWVzQ291bnQgPiAwO1xuICAgIH1cblxuICAgIC8vIEJ5IGhlcmUsIFwib3B0aW9uc1wiIGlzIGFsd2F5cyBub24tbnVsbFxuICAgIHZhciB3cml0ZUZ1bmN0aW9uID0gb3B0aW9uc1tcIndyaXRlXCJdLFxuICAgICAgICBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQgPSBvcHRpb25zW1wiZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkXCJdIHx8IG9wdGlvbnMuZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkIHx8IG51bGwsXG4gICAgICAgIGRpc3Bvc2VXaGVuT3B0aW9uID0gb3B0aW9uc1tcImRpc3Bvc2VXaGVuXCJdIHx8IG9wdGlvbnMuZGlzcG9zZVdoZW4sXG4gICAgICAgIGRpc3Bvc2VXaGVuID0gZGlzcG9zZVdoZW5PcHRpb24sXG4gICAgICAgIGRpc3Bvc2UgPSBkaXNwb3NlQWxsU3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzLFxuICAgICAgICBfc3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzID0ge30sXG4gICAgICAgIF9kZXBlbmRlbmNpZXNDb3VudCA9IDAsXG4gICAgICAgIGV2YWx1YXRpb25UaW1lb3V0SW5zdGFuY2UgPSBudWxsO1xuXG4gICAgaWYgKCFldmFsdWF0b3JGdW5jdGlvblRhcmdldClcbiAgICAgICAgZXZhbHVhdG9yRnVuY3Rpb25UYXJnZXQgPSBvcHRpb25zW1wib3duZXJcIl07XG5cbiAgICBrby5zdWJzY3JpYmFibGUuY2FsbChkZXBlbmRlbnRPYnNlcnZhYmxlKTtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZk9yRXh0ZW5kKGRlcGVuZGVudE9ic2VydmFibGUsIGtvLmRlcGVuZGVudE9ic2VydmFibGVbJ2ZuJ10pO1xuXG4gICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5wZWVrID0gcGVlaztcbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLmdldERlcGVuZGVuY2llc0NvdW50ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gX2RlcGVuZGVuY2llc0NvdW50OyB9O1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUuaGFzV3JpdGVGdW5jdGlvbiA9IHR5cGVvZiBvcHRpb25zW1wid3JpdGVcIl0gPT09IFwiZnVuY3Rpb25cIjtcbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7IGRpc3Bvc2UoKTsgfTtcbiAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLmlzQWN0aXZlID0gaXNBY3RpdmU7XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBsaW1pdCBmdW5jdGlvbiB3aXRoIG9uZSB0aGF0IGRlbGF5cyBldmFsdWF0aW9uIGFzIHdlbGwuXG4gICAgdmFyIG9yaWdpbmFsTGltaXQgPSBkZXBlbmRlbnRPYnNlcnZhYmxlLmxpbWl0O1xuICAgIGRlcGVuZGVudE9ic2VydmFibGUubGltaXQgPSBmdW5jdGlvbihsaW1pdEZ1bmN0aW9uKSB7XG4gICAgICAgIG9yaWdpbmFsTGltaXQuY2FsbChkZXBlbmRlbnRPYnNlcnZhYmxlLCBsaW1pdEZ1bmN0aW9uKTtcbiAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5fZXZhbFJhdGVMaW1pdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBkZXBlbmRlbnRPYnNlcnZhYmxlLl9yYXRlTGltaXRlZEJlZm9yZUNoYW5nZShfbGF0ZXN0VmFsdWUpO1xuXG4gICAgICAgICAgICBfbmVlZHNFdmFsdWF0aW9uID0gdHJ1ZTsgICAgLy8gTWFyayBhcyBkaXJ0eVxuXG4gICAgICAgICAgICAvLyBQYXNzIHRoZSBvYnNlcnZhYmxlIHRvIHRoZSByYXRlLWxpbWl0IGNvZGUsIHdoaWNoIHdpbGwgYWNjZXNzIGl0IHdoZW5cbiAgICAgICAgICAgIC8vIGl0J3MgdGltZSB0byBkbyB0aGUgbm90aWZpY2F0aW9uLlxuICAgICAgICAgICAgZGVwZW5kZW50T2JzZXJ2YWJsZS5fcmF0ZUxpbWl0ZWRDaGFuZ2UoZGVwZW5kZW50T2JzZXJ2YWJsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28uZXhwb3J0UHJvcGVydHkoZGVwZW5kZW50T2JzZXJ2YWJsZSwgJ3BlZWsnLCBkZXBlbmRlbnRPYnNlcnZhYmxlLnBlZWspO1xuICAgIGtvLmV4cG9ydFByb3BlcnR5KGRlcGVuZGVudE9ic2VydmFibGUsICdkaXNwb3NlJywgZGVwZW5kZW50T2JzZXJ2YWJsZS5kaXNwb3NlKTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eShkZXBlbmRlbnRPYnNlcnZhYmxlLCAnaXNBY3RpdmUnLCBkZXBlbmRlbnRPYnNlcnZhYmxlLmlzQWN0aXZlKTtcbiAgICBrby5leHBvcnRQcm9wZXJ0eShkZXBlbmRlbnRPYnNlcnZhYmxlLCAnZ2V0RGVwZW5kZW5jaWVzQ291bnQnLCBkZXBlbmRlbnRPYnNlcnZhYmxlLmdldERlcGVuZGVuY2llc0NvdW50KTtcblxuICAgIC8vIEFkZCBhIFwiZGlzcG9zZVdoZW5cIiBjYWxsYmFjayB0aGF0LCBvbiBlYWNoIGV2YWx1YXRpb24sIGRpc3Bvc2VzIGlmIHRoZSBub2RlIHdhcyByZW1vdmVkIHdpdGhvdXQgdXNpbmcga28ucmVtb3ZlTm9kZS5cbiAgICBpZiAoZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkKSB7XG4gICAgICAgIC8vIFNpbmNlIHRoaXMgY29tcHV0ZWQgaXMgYXNzb2NpYXRlZCB3aXRoIGEgRE9NIG5vZGUsIGFuZCB3ZSBkb24ndCB3YW50IHRvIGRpc3Bvc2UgdGhlIGNvbXB1dGVkXG4gICAgICAgIC8vIHVudGlsIHRoZSBET00gbm9kZSBpcyAqcmVtb3ZlZCogZnJvbSB0aGUgZG9jdW1lbnQgKGFzIG9wcG9zZWQgdG8gbmV2ZXIgaGF2aW5nIGJlZW4gaW4gdGhlIGRvY3VtZW50KSxcbiAgICAgICAgLy8gd2UnbGwgcHJldmVudCBkaXNwb3NhbCB1bnRpbCBcImRpc3Bvc2VXaGVuXCIgZmlyc3QgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgX3N1cHByZXNzRGlzcG9zYWxVbnRpbERpc3Bvc2VXaGVuUmV0dXJuc0ZhbHNlID0gdHJ1ZTtcblxuICAgICAgICAvLyBPbmx5IHdhdGNoIGZvciB0aGUgbm9kZSdzIGRpc3Bvc2FsIGlmIHRoZSB2YWx1ZSByZWFsbHkgaXMgYSBub2RlLiBJdCBtaWdodCBub3QgYmUsXG4gICAgICAgIC8vIGUuZy4sIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiB0cnVlIH0gY2FuIGJlIHVzZWQgdG8gb3B0IGludG8gdGhlIFwib25seSBkaXNwb3NlXG4gICAgICAgIC8vIGFmdGVyIGZpcnN0IGZhbHNlIHJlc3VsdFwiIGJlaGF2aW91ciBldmVuIGlmIHRoZXJlJ3Mgbm8gc3BlY2lmaWMgbm9kZSB0byB3YXRjaC4gVGhpc1xuICAgICAgICAvLyB0ZWNobmlxdWUgaXMgaW50ZW5kZWQgZm9yIEtPJ3MgaW50ZXJuYWwgdXNlIG9ubHkgYW5kIHNob3VsZG4ndCBiZSBkb2N1bWVudGVkIG9yIHVzZWRcbiAgICAgICAgLy8gYnkgYXBwbGljYXRpb24gY29kZSwgYXMgaXQncyBsaWtlbHkgdG8gY2hhbmdlIGluIGEgZnV0dXJlIHZlcnNpb24gb2YgS08uXG4gICAgICAgIGlmIChkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIGRpc3Bvc2VXaGVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAha28udXRpbHMuZG9tTm9kZUlzQXR0YWNoZWRUb0RvY3VtZW50KGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCkgfHwgKGRpc3Bvc2VXaGVuT3B0aW9uICYmIGRpc3Bvc2VXaGVuT3B0aW9uKCkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV2YWx1YXRlLCB1bmxlc3MgZGVmZXJFdmFsdWF0aW9uIGlzIHRydWVcbiAgICBpZiAob3B0aW9uc1snZGVmZXJFdmFsdWF0aW9uJ10gIT09IHRydWUpXG4gICAgICAgIGV2YWx1YXRlSW1tZWRpYXRlKCk7XG5cbiAgICAvLyBBdHRhY2ggYSBET00gbm9kZSBkaXNwb3NhbCBjYWxsYmFjayBzbyB0aGF0IHRoZSBjb21wdXRlZCB3aWxsIGJlIHByb2FjdGl2ZWx5IGRpc3Bvc2VkIGFzIHNvb24gYXMgdGhlIG5vZGUgaXNcbiAgICAvLyByZW1vdmVkIHVzaW5nIGtvLnJlbW92ZU5vZGUuIEJ1dCBza2lwIGlmIGlzQWN0aXZlIGlzIGZhbHNlICh0aGVyZSB3aWxsIG5ldmVyIGJlIGFueSBkZXBlbmRlbmNpZXMgdG8gZGlzcG9zZSkuXG4gICAgaWYgKGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCAmJiBpc0FjdGl2ZSgpICYmIGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZC5ub2RlVHlwZSkge1xuICAgICAgICBkaXNwb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBrby51dGlscy5kb21Ob2RlRGlzcG9zYWwucmVtb3ZlRGlzcG9zZUNhbGxiYWNrKGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZCwgZGlzcG9zZSk7XG4gICAgICAgICAgICBkaXNwb3NlQWxsU3Vic2NyaXB0aW9uc1RvRGVwZW5kZW5jaWVzKCk7XG4gICAgICAgIH07XG4gICAgICAgIGtvLnV0aWxzLmRvbU5vZGVEaXNwb3NhbC5hZGREaXNwb3NlQ2FsbGJhY2soZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkLCBkaXNwb3NlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVwZW5kZW50T2JzZXJ2YWJsZTtcbn07XG5cbmtvLmlzQ29tcHV0ZWQgPSBmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgIHJldHVybiBrby5oYXNQcm90b3R5cGUoaW5zdGFuY2UsIGtvLmRlcGVuZGVudE9ic2VydmFibGUpO1xufTtcblxudmFyIHByb3RvUHJvcCA9IGtvLm9ic2VydmFibGUucHJvdG9Qcm9wZXJ0eTsgLy8gPT0gXCJfX2tvX3Byb3RvX19cIlxua28uZGVwZW5kZW50T2JzZXJ2YWJsZVtwcm90b1Byb3BdID0ga28ub2JzZXJ2YWJsZTtcblxua28uZGVwZW5kZW50T2JzZXJ2YWJsZVsnZm4nXSA9IHtcbiAgICBcImVxdWFsaXR5Q29tcGFyZXJcIjogdmFsdWVzQXJlUHJpbWl0aXZlQW5kRXF1YWxcbn07XG5rby5kZXBlbmRlbnRPYnNlcnZhYmxlWydmbiddW3Byb3RvUHJvcF0gPSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlO1xuXG4vLyBOb3RlIHRoYXQgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBwcm90byBhc3NpZ25tZW50LCB0aGVcbi8vIGluaGVyaXRhbmNlIGNoYWluIGlzIGNyZWF0ZWQgbWFudWFsbHkgaW4gdGhlIGtvLmRlcGVuZGVudE9ic2VydmFibGUgY29uc3RydWN0b3JcbmlmIChrby51dGlscy5jYW5TZXRQcm90b3R5cGUpIHtcbiAgICBrby51dGlscy5zZXRQcm90b3R5cGVPZihrby5kZXBlbmRlbnRPYnNlcnZhYmxlWydmbiddLCBrby5zdWJzY3JpYmFibGVbJ2ZuJ10pO1xufVxuXG5rby5leHBvcnRTeW1ib2woJ2RlcGVuZGVudE9ic2VydmFibGUnLCBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKTtcbmtvLmV4cG9ydFN5bWJvbCgnY29tcHV0ZWQnLCBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKTsgLy8gTWFrZSBcImtvLmNvbXB1dGVkXCIgYW4gYWxpYXMgZm9yIFwia28uZGVwZW5kZW50T2JzZXJ2YWJsZVwiXG5rby5leHBvcnRTeW1ib2woJ2lzQ29tcHV0ZWQnLCBrby5pc0NvbXB1dGVkKTtcblxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXhOZXN0ZWRPYnNlcnZhYmxlRGVwdGggPSAxMDsgLy8gRXNjYXBlIHRoZSAodW5saWtlbHkpIHBhdGhhbG9naWNhbCBjYXNlIHdoZXJlIGFuIG9ic2VydmFibGUncyBjdXJyZW50IHZhbHVlIGlzIGl0c2VsZiAob3Igc2ltaWxhciByZWZlcmVuY2UgY3ljbGUpXG5cbiAgICBrby50b0pTID0gZnVuY3Rpb24ocm9vdE9iamVjdCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiBjYWxsaW5nIGtvLnRvSlMsIHBhc3MgdGhlIG9iamVjdCB5b3Ugd2FudCB0byBjb252ZXJ0LlwiKTtcblxuICAgICAgICAvLyBXZSBqdXN0IHVud3JhcCBldmVyeXRoaW5nIGF0IGV2ZXJ5IGxldmVsIGluIHRoZSBvYmplY3QgZ3JhcGhcbiAgICAgICAgcmV0dXJuIG1hcEpzT2JqZWN0R3JhcGgocm9vdE9iamVjdCwgZnVuY3Rpb24odmFsdWVUb01hcCkge1xuICAgICAgICAgICAgLy8gTG9vcCBiZWNhdXNlIGFuIG9ic2VydmFibGUncyB2YWx1ZSBtaWdodCBpbiB0dXJuIGJlIGFub3RoZXIgb2JzZXJ2YWJsZSB3cmFwcGVyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsga28uaXNPYnNlcnZhYmxlKHZhbHVlVG9NYXApICYmIChpIDwgbWF4TmVzdGVkT2JzZXJ2YWJsZURlcHRoKTsgaSsrKVxuICAgICAgICAgICAgICAgIHZhbHVlVG9NYXAgPSB2YWx1ZVRvTWFwKCk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVUb01hcDtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGtvLnRvSlNPTiA9IGZ1bmN0aW9uKHJvb3RPYmplY3QsIHJlcGxhY2VyLCBzcGFjZSkgeyAgICAgLy8gcmVwbGFjZXIgYW5kIHNwYWNlIGFyZSBvcHRpb25hbFxuICAgICAgICB2YXIgcGxhaW5KYXZhU2NyaXB0T2JqZWN0ID0ga28udG9KUyhyb290T2JqZWN0KTtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLnN0cmluZ2lmeUpzb24ocGxhaW5KYXZhU2NyaXB0T2JqZWN0LCByZXBsYWNlciwgc3BhY2UpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBtYXBKc09iamVjdEdyYXBoKHJvb3RPYmplY3QsIG1hcElucHV0Q2FsbGJhY2ssIHZpc2l0ZWRPYmplY3RzKSB7XG4gICAgICAgIHZpc2l0ZWRPYmplY3RzID0gdmlzaXRlZE9iamVjdHMgfHwgbmV3IG9iamVjdExvb2t1cCgpO1xuXG4gICAgICAgIHJvb3RPYmplY3QgPSBtYXBJbnB1dENhbGxiYWNrKHJvb3RPYmplY3QpO1xuICAgICAgICB2YXIgY2FuSGF2ZVByb3BlcnRpZXMgPSAodHlwZW9mIHJvb3RPYmplY3QgPT0gXCJvYmplY3RcIikgJiYgKHJvb3RPYmplY3QgIT09IG51bGwpICYmIChyb290T2JqZWN0ICE9PSB1bmRlZmluZWQpICYmICghKHJvb3RPYmplY3QgaW5zdGFuY2VvZiBEYXRlKSkgJiYgKCEocm9vdE9iamVjdCBpbnN0YW5jZW9mIFN0cmluZykpICYmICghKHJvb3RPYmplY3QgaW5zdGFuY2VvZiBOdW1iZXIpKSAmJiAoIShyb290T2JqZWN0IGluc3RhbmNlb2YgQm9vbGVhbikpO1xuICAgICAgICBpZiAoIWNhbkhhdmVQcm9wZXJ0aWVzKVxuICAgICAgICAgICAgcmV0dXJuIHJvb3RPYmplY3Q7XG5cbiAgICAgICAgdmFyIG91dHB1dFByb3BlcnRpZXMgPSByb290T2JqZWN0IGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICB2aXNpdGVkT2JqZWN0cy5zYXZlKHJvb3RPYmplY3QsIG91dHB1dFByb3BlcnRpZXMpO1xuXG4gICAgICAgIHZpc2l0UHJvcGVydGllc09yQXJyYXlFbnRyaWVzKHJvb3RPYmplY3QsIGZ1bmN0aW9uKGluZGV4ZXIpIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eVZhbHVlID0gbWFwSW5wdXRDYWxsYmFjayhyb290T2JqZWN0W2luZGV4ZXJdKTtcblxuICAgICAgICAgICAgc3dpdGNoICh0eXBlb2YgcHJvcGVydHlWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0UHJvcGVydGllc1tpbmRleGVyXSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmV2aW91c2x5TWFwcGVkVmFsdWUgPSB2aXNpdGVkT2JqZWN0cy5nZXQocHJvcGVydHlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFByb3BlcnRpZXNbaW5kZXhlcl0gPSAocHJldmlvdXNseU1hcHBlZFZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHByZXZpb3VzbHlNYXBwZWRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBtYXBKc09iamVjdEdyYXBoKHByb3BlcnR5VmFsdWUsIG1hcElucHV0Q2FsbGJhY2ssIHZpc2l0ZWRPYmplY3RzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBvdXRwdXRQcm9wZXJ0aWVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZpc2l0UHJvcGVydGllc09yQXJyYXlFbnRyaWVzKHJvb3RPYmplY3QsIHZpc2l0b3JDYWxsYmFjaykge1xuICAgICAgICBpZiAocm9vdE9iamVjdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvb3RPYmplY3QubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKGkpO1xuXG4gICAgICAgICAgICAvLyBGb3IgYXJyYXlzLCBhbHNvIHJlc3BlY3QgdG9KU09OIHByb3BlcnR5IGZvciBjdXN0b20gbWFwcGluZ3MgKGZpeGVzICMyNzgpXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvb3RPYmplY3RbJ3RvSlNPTiddID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKCd0b0pTT04nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiByb290T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgdmlzaXRvckNhbGxiYWNrKHByb3BlcnR5TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb2JqZWN0TG9va3VwKCkge1xuICAgICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICB9O1xuXG4gICAgb2JqZWN0TG9va3VwLnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IG9iamVjdExvb2t1cCxcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nSW5kZXggPSBrby51dGlscy5hcnJheUluZGV4T2YodGhpcy5rZXlzLCBrZXkpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nSW5kZXggPj0gMClcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlc1tleGlzdGluZ0luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZ0luZGV4ID0ga28udXRpbHMuYXJyYXlJbmRleE9mKHRoaXMua2V5cywga2V5KTtcbiAgICAgICAgICAgIHJldHVybiAoZXhpc3RpbmdJbmRleCA+PSAwKSA/IHRoaXMudmFsdWVzW2V4aXN0aW5nSW5kZXhdIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfTtcbn0pKCk7XG5cbmtvLmV4cG9ydFN5bWJvbCgndG9KUycsIGtvLnRvSlMpO1xua28uZXhwb3J0U3ltYm9sKCd0b0pTT04nLCBrby50b0pTT04pO1xuKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eSA9ICdfX2tvX19oYXNEb21EYXRhT3B0aW9uVmFsdWVfXyc7XG5cbiAgICAvLyBOb3JtYWxseSwgU0VMRUNUIGVsZW1lbnRzIGFuZCB0aGVpciBPUFRJT05zIGNhbiBvbmx5IHRha2UgdmFsdWUgb2YgdHlwZSAnc3RyaW5nJyAoYmVjYXVzZSB0aGUgdmFsdWVzXG4gICAgLy8gYXJlIHN0b3JlZCBvbiBET00gYXR0cmlidXRlcykuIGtvLnNlbGVjdEV4dGVuc2lvbnMgcHJvdmlkZXMgYSB3YXkgZm9yIFNFTEVDVHMvT1BUSU9OcyB0byBoYXZlIHZhbHVlc1xuICAgIC8vIHRoYXQgYXJlIGFyYml0cmFyeSBvYmplY3RzLiBUaGlzIGlzIHZlcnkgY29udmVuaWVudCB3aGVuIGltcGxlbWVudGluZyB0aGluZ3MgbGlrZSBjYXNjYWRpbmcgZHJvcGRvd25zLlxuICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMgPSB7XG4gICAgICAgIHJlYWRWYWx1ZSA6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa28udXRpbHMudGFnTmFtZUxvd2VyKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnb3B0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRbaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eV0gPT09IHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udXRpbHMuZG9tRGF0YS5nZXQoZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzLm9wdGlvbnMub3B0aW9uVmFsdWVEb21EYXRhS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmllVmVyc2lvbiA8PSA3XG4gICAgICAgICAgICAgICAgICAgICAgICA/IChlbGVtZW50LmdldEF0dHJpYnV0ZU5vZGUoJ3ZhbHVlJykgJiYgZWxlbWVudC5nZXRBdHRyaWJ1dGVOb2RlKCd2YWx1ZScpLnNwZWNpZmllZCA/IGVsZW1lbnQudmFsdWUgOiBlbGVtZW50LnRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA+PSAwID8ga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudC5vcHRpb25zW2VsZW1lbnQuc2VsZWN0ZWRJbmRleF0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHdyaXRlVmFsdWU6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlLCBhbGxvd1Vuc2V0KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ29wdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCh0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrby51dGlscy5kb21EYXRhLnNldChlbGVtZW50LCBrby5iaW5kaW5nSGFuZGxlcnMub3B0aW9ucy5vcHRpb25WYWx1ZURvbURhdGFLZXksIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhc0RvbURhdGFFeHBhbmRvUHJvcGVydHkgaW4gZWxlbWVudCkgeyAvLyBJRSA8PSA4IHRocm93cyBlcnJvcnMgaWYgeW91IGRlbGV0ZSBub24tZXhpc3RlbnQgcHJvcGVydGllcyBmcm9tIGEgRE9NIG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnRbaGFzRG9tRGF0YUV4cGFuZG9Qcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcmUgYXJiaXRyYXJ5IG9iamVjdCB1c2luZyBEb21EYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQoZWxlbWVudCwga28uYmluZGluZ0hhbmRsZXJzLm9wdGlvbnMub3B0aW9uVmFsdWVEb21EYXRhS2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudFtoYXNEb21EYXRhRXhwYW5kb1Byb3BlcnR5XSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcGVjaWFsIHRyZWF0bWVudCBvZiBudW1iZXJzIGlzIGp1c3QgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuIEtPIDEuMi4xIHdyb3RlIG51bWVyaWNhbCB2YWx1ZXMgdG8gZWxlbWVudC52YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiID8gdmFsdWUgOiBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCJcIiB8fCB2YWx1ZSA9PT0gbnVsbCkgICAgICAgLy8gQSBibGFuayBzdHJpbmcgb3IgbnVsbCB2YWx1ZSB3aWxsIHNlbGVjdCB0aGUgY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3Rpb24gPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBlbGVtZW50Lm9wdGlvbnMubGVuZ3RoLCBvcHRpb25WYWx1ZTsgaSA8IG47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uVmFsdWUgPSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW5jbHVkZSBzcGVjaWFsIGNoZWNrIHRvIGhhbmRsZSBzZWxlY3RpbmcgYSBjYXB0aW9uIHdpdGggYSBibGFuayBzdHJpbmcgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25WYWx1ZSA9PSB2YWx1ZSB8fCAob3B0aW9uVmFsdWUgPT0gXCJcIiAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbiA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGFsbG93VW5zZXQgfHwgc2VsZWN0aW9uID49IDAgfHwgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgZWxlbWVudC5zaXplID4gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA9IHNlbGVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoKHZhbHVlID09PSBudWxsKSB8fCAodmFsdWUgPT09IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCdzZWxlY3RFeHRlbnNpb25zJywga28uc2VsZWN0RXh0ZW5zaW9ucyk7XG5rby5leHBvcnRTeW1ib2woJ3NlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlJywga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUpO1xua28uZXhwb3J0U3ltYm9sKCdzZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUnLCBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUpO1xua28uZXhwcmVzc2lvblJld3JpdGluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGphdmFTY3JpcHRSZXNlcnZlZFdvcmRzID0gW1widHJ1ZVwiLCBcImZhbHNlXCIsIFwibnVsbFwiLCBcInVuZGVmaW5lZFwiXTtcblxuICAgIC8vIE1hdGNoZXMgc29tZXRoaW5nIHRoYXQgY2FuIGJlIGFzc2lnbmVkIHRvLS1laXRoZXIgYW4gaXNvbGF0ZWQgaWRlbnRpZmllciBvciBzb21ldGhpbmcgZW5kaW5nIHdpdGggYSBwcm9wZXJ0eSBhY2Nlc3NvclxuICAgIC8vIFRoaXMgaXMgZGVzaWduZWQgdG8gYmUgc2ltcGxlIGFuZCBhdm9pZCBmYWxzZSBuZWdhdGl2ZXMsIGJ1dCBjb3VsZCBwcm9kdWNlIGZhbHNlIHBvc2l0aXZlcyAoZS5nLiwgYStiLmMpLlxuICAgIC8vIFRoaXMgYWxzbyB3aWxsIG5vdCBwcm9wZXJseSBoYW5kbGUgbmVzdGVkIGJyYWNrZXRzIChlLmcuLCBvYmoxW29iajJbJ3Byb3AnXV07IHNlZSAjOTExKS5cbiAgICB2YXIgamF2YVNjcmlwdEFzc2lnbm1lbnRUYXJnZXQgPSAvXig/OlskX2Etel1bJFxcd10qfCguKykoXFwuXFxzKlskX2Etel1bJFxcd10qfFxcWy4rXFxdKSkkL2k7XG5cbiAgICBmdW5jdGlvbiBnZXRXcml0ZWFibGVWYWx1ZShleHByZXNzaW9uKSB7XG4gICAgICAgIGlmIChrby51dGlscy5hcnJheUluZGV4T2YoamF2YVNjcmlwdFJlc2VydmVkV29yZHMsIGV4cHJlc3Npb24pID49IDApXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBtYXRjaCA9IGV4cHJlc3Npb24ubWF0Y2goamF2YVNjcmlwdEFzc2lnbm1lbnRUYXJnZXQpO1xuICAgICAgICByZXR1cm4gbWF0Y2ggPT09IG51bGwgPyBmYWxzZSA6IG1hdGNoWzFdID8gKCdPYmplY3QoJyArIG1hdGNoWzFdICsgJyknICsgbWF0Y2hbMl0pIDogZXhwcmVzc2lvbjtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMgd2lsbCBiZSB1c2VkIHRvIHNwbGl0IGFuIG9iamVjdC1saXRlcmFsIHN0cmluZyBpbnRvIHRva2Vuc1xuXG4gICAgICAgIC8vIFRoZXNlIHR3byBtYXRjaCBzdHJpbmdzLCBlaXRoZXIgd2l0aCBkb3VibGUgcXVvdGVzIG9yIHNpbmdsZSBxdW90ZXNcbiAgICB2YXIgc3RyaW5nRG91YmxlID0gJ1wiKD86W15cIlxcXFxcXFxcXXxcXFxcXFxcXC4pKlwiJyxcbiAgICAgICAgc3RyaW5nU2luZ2xlID0gXCInKD86W14nXFxcXFxcXFxdfFxcXFxcXFxcLikqJ1wiLFxuICAgICAgICAvLyBNYXRjaGVzIGEgcmVndWxhciBleHByZXNzaW9uICh0ZXh0IGVuY2xvc2VkIGJ5IHNsYXNoZXMpLCBidXQgd2lsbCBhbHNvIG1hdGNoIHNldHMgb2YgZGl2aXNpb25zXG4gICAgICAgIC8vIGFzIGEgcmVndWxhciBleHByZXNzaW9uICh0aGlzIGlzIGhhbmRsZWQgYnkgdGhlIHBhcnNpbmcgbG9vcCBiZWxvdykuXG4gICAgICAgIHN0cmluZ1JlZ2V4cCA9ICcvKD86W14vXFxcXFxcXFxdfFxcXFxcXFxcLikqL1xcdyonLFxuICAgICAgICAvLyBUaGVzZSBjaGFyYWN0ZXJzIGhhdmUgc3BlY2lhbCBtZWFuaW5nIHRvIHRoZSBwYXJzZXIgYW5kIG11c3Qgbm90IGFwcGVhciBpbiB0aGUgbWlkZGxlIG9mIGFcbiAgICAgICAgLy8gdG9rZW4sIGV4Y2VwdCBhcyBwYXJ0IG9mIGEgc3RyaW5nLlxuICAgICAgICBzcGVjaWFscyA9ICcsXCJcXCd7fSgpLzpbXFxcXF0nLFxuICAgICAgICAvLyBNYXRjaCB0ZXh0IChhdCBsZWFzdCB0d28gY2hhcmFjdGVycykgdGhhdCBkb2VzIG5vdCBjb250YWluIGFueSBvZiB0aGUgYWJvdmUgc3BlY2lhbCBjaGFyYWN0ZXJzLFxuICAgICAgICAvLyBhbHRob3VnaCBzb21lIG9mIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgYXJlIGFsbG93ZWQgdG8gc3RhcnQgaXQgKGFsbCBidXQgdGhlIGNvbG9uIGFuZCBjb21tYSkuXG4gICAgICAgIC8vIFRoZSB0ZXh0IGNhbiBjb250YWluIHNwYWNlcywgYnV0IGxlYWRpbmcgb3IgdHJhaWxpbmcgc3BhY2VzIGFyZSBza2lwcGVkLlxuICAgICAgICBldmVyeVRoaW5nRWxzZSA9ICdbXlxcXFxzOiwvXVteJyArIHNwZWNpYWxzICsgJ10qW15cXFxccycgKyBzcGVjaWFscyArICddJyxcbiAgICAgICAgLy8gTWF0Y2ggYW55IG5vbi1zcGFjZSBjaGFyYWN0ZXIgbm90IG1hdGNoZWQgYWxyZWFkeS4gVGhpcyB3aWxsIG1hdGNoIGNvbG9ucyBhbmQgY29tbWFzLCBzaW5jZSB0aGV5J3JlXG4gICAgICAgIC8vIG5vdCBtYXRjaGVkIGJ5IFwiZXZlcnlUaGluZ0Vsc2VcIiwgYnV0IHdpbGwgYWxzbyBtYXRjaCBhbnkgb3RoZXIgc2luZ2xlIGNoYXJhY3RlciB0aGF0IHdhc24ndCBhbHJlYWR5XG4gICAgICAgIC8vIG1hdGNoZWQgKGZvciBleGFtcGxlOiBpbiBcImE6IDEsIGI6IDJcIiwgZWFjaCBvZiB0aGUgbm9uLXNwYWNlIGNoYXJhY3RlcnMgd2lsbCBiZSBtYXRjaGVkIGJ5IG9uZU5vdFNwYWNlKS5cbiAgICAgICAgb25lTm90U3BhY2UgPSAnW15cXFxcc10nLFxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYWN0dWFsIHJlZ3VsYXIgZXhwcmVzc2lvbiBieSBvci1pbmcgdGhlIGFib3ZlIHN0cmluZ3MuIFRoZSBvcmRlciBpcyBpbXBvcnRhbnQuXG4gICAgICAgIGJpbmRpbmdUb2tlbiA9IFJlZ0V4cChzdHJpbmdEb3VibGUgKyAnfCcgKyBzdHJpbmdTaW5nbGUgKyAnfCcgKyBzdHJpbmdSZWdleHAgKyAnfCcgKyBldmVyeVRoaW5nRWxzZSArICd8JyArIG9uZU5vdFNwYWNlLCAnZycpLFxuXG4gICAgICAgIC8vIE1hdGNoIGVuZCBvZiBwcmV2aW91cyB0b2tlbiB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNsYXNoIGlzIGEgZGl2aXNpb24gb3IgcmVnZXguXG4gICAgICAgIGRpdmlzaW9uTG9va0JlaGluZCA9IC9bXFxdKVwiJ0EtWmEtejAtOV8kXSskLyxcbiAgICAgICAga2V5d29yZFJlZ2V4TG9va0JlaGluZCA9IHsnaW4nOjEsJ3JldHVybic6MSwndHlwZW9mJzoxfTtcblxuICAgIGZ1bmN0aW9uIHBhcnNlT2JqZWN0TGl0ZXJhbChvYmplY3RMaXRlcmFsU3RyaW5nKSB7XG4gICAgICAgIC8vIFRyaW0gbGVhZGluZyBhbmQgdHJhaWxpbmcgc3BhY2VzIGZyb20gdGhlIHN0cmluZ1xuICAgICAgICB2YXIgc3RyID0ga28udXRpbHMuc3RyaW5nVHJpbShvYmplY3RMaXRlcmFsU3RyaW5nKTtcblxuICAgICAgICAvLyBUcmltIGJyYWNlcyAneycgc3Vycm91bmRpbmcgdGhlIHdob2xlIG9iamVjdCBsaXRlcmFsXG4gICAgICAgIGlmIChzdHIuY2hhckNvZGVBdCgwKSA9PT0gMTIzKSBzdHIgPSBzdHIuc2xpY2UoMSwgLTEpO1xuXG4gICAgICAgIC8vIFNwbGl0IGludG8gdG9rZW5zXG4gICAgICAgIHZhciByZXN1bHQgPSBbXSwgdG9rcyA9IHN0ci5tYXRjaChiaW5kaW5nVG9rZW4pLCBrZXksIHZhbHVlcywgZGVwdGggPSAwO1xuXG4gICAgICAgIGlmICh0b2tzKSB7XG4gICAgICAgICAgICAvLyBBcHBlbmQgYSBjb21tYSBzbyB0aGF0IHdlIGRvbid0IG5lZWQgYSBzZXBhcmF0ZSBjb2RlIGJsb2NrIHRvIGRlYWwgd2l0aCB0aGUgbGFzdCBpdGVtXG4gICAgICAgICAgICB0b2tzLnB1c2goJywnKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIHRvazsgdG9rID0gdG9rc1tpXTsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGMgPSB0b2suY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgICAgICAvLyBBIGNvbW1hIHNpZ25hbHMgdGhlIGVuZCBvZiBhIGtleS92YWx1ZSBwYWlyIGlmIGRlcHRoIGlzIHplcm9cbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gNDQpIHsgLy8gXCIsXCJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlcHRoIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWVzID8ge2tleToga2V5LCB2YWx1ZTogdmFsdWVzLmpvaW4oJycpfSA6IHsndW5rbm93bic6IGtleX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0gdmFsdWVzID0gZGVwdGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTaW1wbHkgc2tpcCB0aGUgY29sb24gdGhhdCBzZXBhcmF0ZXMgdGhlIG5hbWUgYW5kIHZhbHVlXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA1OCkgeyAvLyBcIjpcIlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vIEEgc2V0IG9mIHNsYXNoZXMgaXMgaW5pdGlhbGx5IG1hdGNoZWQgYXMgYSByZWd1bGFyIGV4cHJlc3Npb24sIGJ1dCBjb3VsZCBiZSBkaXZpc2lvblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gNDcgJiYgaSAmJiB0b2subGVuZ3RoID4gMSkgeyAgLy8gXCIvXCJcbiAgICAgICAgICAgICAgICAgICAgLy8gTG9vayBhdCB0aGUgZW5kIG9mIHRoZSBwcmV2aW91cyB0b2tlbiB0byBkZXRlcm1pbmUgaWYgdGhlIHNsYXNoIGlzIGFjdHVhbGx5IGRpdmlzaW9uXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IHRva3NbaS0xXS5tYXRjaChkaXZpc2lvbkxvb2tCZWhpbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2ggJiYgIWtleXdvcmRSZWdleExvb2tCZWhpbmRbbWF0Y2hbMF1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgc2xhc2ggaXMgYWN0dWFsbHkgYSBkaXZpc2lvbiBwdW5jdHVhdG9yOyByZS1wYXJzZSB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdHJpbmcgKG5vdCBpbmNsdWRpbmcgdGhlIHNsYXNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cihzdHIuaW5kZXhPZih0b2spICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tzID0gc3RyLm1hdGNoKGJpbmRpbmdUb2tlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tzLnB1c2goJywnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGgganVzdCB0aGUgc2xhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvayA9ICcvJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEluY3JlbWVudCBkZXB0aCBmb3IgcGFyZW50aGVzZXMsIGJyYWNlcywgYW5kIGJyYWNrZXRzIHNvIHRoYXQgaW50ZXJpb3IgY29tbWFzIGFyZSBpZ25vcmVkXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSA0MCB8fCBjID09PSAxMjMgfHwgYyA9PT0gOTEpIHsgLy8gJygnLCAneycsICdbJ1xuICAgICAgICAgICAgICAgICAgICArK2RlcHRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gNDEgfHwgYyA9PT0gMTI1IHx8IGMgPT09IDkzKSB7IC8vICcpJywgJ30nLCAnXSdcbiAgICAgICAgICAgICAgICAgICAgLS1kZXB0aDtcbiAgICAgICAgICAgICAgICAvLyBUaGUga2V5IG11c3QgYmUgYSBzaW5nbGUgdG9rZW47IGlmIGl0J3MgYSBzdHJpbmcsIHRyaW0gdGhlIHF1b3Rlc1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWtleSAmJiAhdmFsdWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IChjID09PSAzNCB8fCBjID09PSAzOSkgLyogJ1wiJywgXCInXCIgKi8gPyB0b2suc2xpY2UoMSwgLTEpIDogdG9rO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlcylcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnB1c2godG9rKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcyA9IFt0b2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gVHdvLXdheSBiaW5kaW5ncyBpbmNsdWRlIGEgd3JpdGUgZnVuY3Rpb24gdGhhdCBhbGxvdyB0aGUgaGFuZGxlciB0byB1cGRhdGUgdGhlIHZhbHVlIGV2ZW4gaWYgaXQncyBub3QgYW4gb2JzZXJ2YWJsZS5cbiAgICB2YXIgdHdvV2F5QmluZGluZ3MgPSB7fTtcblxuICAgIGZ1bmN0aW9uIHByZVByb2Nlc3NCaW5kaW5ncyhiaW5kaW5nc1N0cmluZ09yS2V5VmFsdWVBcnJheSwgYmluZGluZ09wdGlvbnMpIHtcbiAgICAgICAgYmluZGluZ09wdGlvbnMgPSBiaW5kaW5nT3B0aW9ucyB8fCB7fTtcblxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzS2V5VmFsdWUoa2V5LCB2YWwpIHtcbiAgICAgICAgICAgIHZhciB3cml0YWJsZVZhbDtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxQcmVwcm9jZXNzSG9vayhvYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iaiAmJiBvYmpbJ3ByZXByb2Nlc3MnXSkgPyAodmFsID0gb2JqWydwcmVwcm9jZXNzJ10odmFsLCBrZXksIHByb2Nlc3NLZXlWYWx1ZSkpIDogdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY2FsbFByZXByb2Nlc3NIb29rKGtvWydnZXRCaW5kaW5nSGFuZGxlciddKGtleSkpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHR3b1dheUJpbmRpbmdzW2tleV0gJiYgKHdyaXRhYmxlVmFsID0gZ2V0V3JpdGVhYmxlVmFsdWUodmFsKSkpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgdHdvLXdheSBiaW5kaW5ncywgcHJvdmlkZSBhIHdyaXRlIG1ldGhvZCBpbiBjYXNlIHRoZSB2YWx1ZVxuICAgICAgICAgICAgICAgIC8vIGlzbid0IGEgd3JpdGFibGUgb2JzZXJ2YWJsZS5cbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUFjY2Vzc29yUmVzdWx0U3RyaW5ncy5wdXNoKFwiJ1wiICsga2V5ICsgXCInOmZ1bmN0aW9uKF96KXtcIiArIHdyaXRhYmxlVmFsICsgXCI9X3p9XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBWYWx1ZXMgYXJlIHdyYXBwZWQgaW4gYSBmdW5jdGlvbiBzbyB0aGF0IGVhY2ggdmFsdWUgY2FuIGJlIGFjY2Vzc2VkIGluZGVwZW5kZW50bHlcbiAgICAgICAgICAgIGlmIChtYWtlVmFsdWVBY2Nlc3NvcnMpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSAnZnVuY3Rpb24oKXtyZXR1cm4gJyArIHZhbCArICcgfSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRTdHJpbmdzLnB1c2goXCInXCIgKyBrZXkgKyBcIic6XCIgKyB2YWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdFN0cmluZ3MgPSBbXSxcbiAgICAgICAgICAgIHByb3BlcnR5QWNjZXNzb3JSZXN1bHRTdHJpbmdzID0gW10sXG4gICAgICAgICAgICBtYWtlVmFsdWVBY2Nlc3NvcnMgPSBiaW5kaW5nT3B0aW9uc1sndmFsdWVBY2Nlc3NvcnMnXSxcbiAgICAgICAgICAgIGtleVZhbHVlQXJyYXkgPSB0eXBlb2YgYmluZGluZ3NTdHJpbmdPcktleVZhbHVlQXJyYXkgPT09IFwic3RyaW5nXCIgP1xuICAgICAgICAgICAgICAgIHBhcnNlT2JqZWN0TGl0ZXJhbChiaW5kaW5nc1N0cmluZ09yS2V5VmFsdWVBcnJheSkgOiBiaW5kaW5nc1N0cmluZ09yS2V5VmFsdWVBcnJheTtcblxuICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2goa2V5VmFsdWVBcnJheSwgZnVuY3Rpb24oa2V5VmFsdWUpIHtcbiAgICAgICAgICAgIHByb2Nlc3NLZXlWYWx1ZShrZXlWYWx1ZS5rZXkgfHwga2V5VmFsdWVbJ3Vua25vd24nXSwga2V5VmFsdWUudmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvcGVydHlBY2Nlc3NvclJlc3VsdFN0cmluZ3MubGVuZ3RoKVxuICAgICAgICAgICAgcHJvY2Vzc0tleVZhbHVlKCdfa29fcHJvcGVydHlfd3JpdGVycycsIFwie1wiICsgcHJvcGVydHlBY2Nlc3NvclJlc3VsdFN0cmluZ3Muam9pbihcIixcIikgKyBcIiB9XCIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHRTdHJpbmdzLmpvaW4oXCIsXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGJpbmRpbmdSZXdyaXRlVmFsaWRhdG9yczogW10sXG5cbiAgICAgICAgdHdvV2F5QmluZGluZ3M6IHR3b1dheUJpbmRpbmdzLFxuXG4gICAgICAgIHBhcnNlT2JqZWN0TGl0ZXJhbDogcGFyc2VPYmplY3RMaXRlcmFsLFxuXG4gICAgICAgIHByZVByb2Nlc3NCaW5kaW5nczogcHJlUHJvY2Vzc0JpbmRpbmdzLFxuXG4gICAgICAgIGtleVZhbHVlQXJyYXlDb250YWluc0tleTogZnVuY3Rpb24oa2V5VmFsdWVBcnJheSwga2V5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleVZhbHVlQXJyYXkubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgaWYgKGtleVZhbHVlQXJyYXlbaV1bJ2tleSddID09IGtleSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gSW50ZXJuYWwsIHByaXZhdGUgS08gdXRpbGl0eSBmb3IgdXBkYXRpbmcgbW9kZWwgcHJvcGVydGllcyBmcm9tIHdpdGhpbiBiaW5kaW5nc1xuICAgICAgICAvLyBwcm9wZXJ0eTogICAgICAgICAgICBJZiB0aGUgcHJvcGVydHkgYmVpbmcgdXBkYXRlZCBpcyAob3IgbWlnaHQgYmUpIGFuIG9ic2VydmFibGUsIHBhc3MgaXQgaGVyZVxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICBJZiBpdCB0dXJucyBvdXQgdG8gYmUgYSB3cml0YWJsZSBvYnNlcnZhYmxlLCBpdCB3aWxsIGJlIHdyaXR0ZW4gdG8gZGlyZWN0bHlcbiAgICAgICAgLy8gYWxsQmluZGluZ3M6ICAgICAgICAgQW4gb2JqZWN0IHdpdGggYSBnZXQgbWV0aG9kIHRvIHJldHJpZXZlIGJpbmRpbmdzIGluIHRoZSBjdXJyZW50IGV4ZWN1dGlvbiBjb250ZXh0LlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICBUaGlzIHdpbGwgYmUgc2VhcmNoZWQgZm9yIGEgJ19rb19wcm9wZXJ0eV93cml0ZXJzJyBwcm9wZXJ0eSBpbiBjYXNlIHlvdSdyZSB3cml0aW5nIHRvIGEgbm9uLW9ic2VydmFibGVcbiAgICAgICAgLy8ga2V5OiAgICAgICAgICAgICAgICAgVGhlIGtleSBpZGVudGlmeWluZyB0aGUgcHJvcGVydHkgdG8gYmUgd3JpdHRlbi4gRXhhbXBsZTogZm9yIHsgaGFzRm9jdXM6IG15VmFsdWUgfSwgd3JpdGUgdG8gJ215VmFsdWUnIGJ5IHNwZWNpZnlpbmcgdGhlIGtleSAnaGFzRm9jdXMnXG4gICAgICAgIC8vIHZhbHVlOiAgICAgICAgICAgICAgIFRoZSB2YWx1ZSB0byBiZSB3cml0dGVuXG4gICAgICAgIC8vIGNoZWNrSWZEaWZmZXJlbnQ6ICAgIElmIHRydWUsIGFuZCBpZiB0aGUgcHJvcGVydHkgYmVpbmcgd3JpdHRlbiBpcyBhIHdyaXRhYmxlIG9ic2VydmFibGUsIHRoZSB2YWx1ZSB3aWxsIG9ubHkgYmUgd3JpdHRlbiBpZlxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICBpdCBpcyAhPT0gZXhpc3RpbmcgdmFsdWUgb24gdGhhdCB3cml0YWJsZSBvYnNlcnZhYmxlXG4gICAgICAgIHdyaXRlVmFsdWVUb1Byb3BlcnR5OiBmdW5jdGlvbihwcm9wZXJ0eSwgYWxsQmluZGluZ3MsIGtleSwgdmFsdWUsIGNoZWNrSWZEaWZmZXJlbnQpIHtcbiAgICAgICAgICAgIGlmICghcHJvcGVydHkgfHwgIWtvLmlzT2JzZXJ2YWJsZShwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcFdyaXRlcnMgPSBhbGxCaW5kaW5ncy5nZXQoJ19rb19wcm9wZXJ0eV93cml0ZXJzJyk7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BXcml0ZXJzICYmIHByb3BXcml0ZXJzW2tleV0pXG4gICAgICAgICAgICAgICAgICAgIHByb3BXcml0ZXJzW2tleV0odmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrby5pc1dyaXRlYWJsZU9ic2VydmFibGUocHJvcGVydHkpICYmICghY2hlY2tJZkRpZmZlcmVudCB8fCBwcm9wZXJ0eS5wZWVrKCkgIT09IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcnLCBrby5leHByZXNzaW9uUmV3cml0aW5nKTtcbmtvLmV4cG9ydFN5bWJvbCgnZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnMnLCBrby5leHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9ycyk7XG5rby5leHBvcnRTeW1ib2woJ2V4cHJlc3Npb25SZXdyaXRpbmcucGFyc2VPYmplY3RMaXRlcmFsJywga28uZXhwcmVzc2lvblJld3JpdGluZy5wYXJzZU9iamVjdExpdGVyYWwpO1xua28uZXhwb3J0U3ltYm9sKCdleHByZXNzaW9uUmV3cml0aW5nLnByZVByb2Nlc3NCaW5kaW5ncycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKTtcblxuLy8gTWFraW5nIGJpbmRpbmdzIGV4cGxpY2l0bHkgZGVjbGFyZSB0aGVtc2VsdmVzIGFzIFwidHdvIHdheVwiIGlzbid0IGlkZWFsIGluIHRoZSBsb25nIHRlcm0gKGl0IHdvdWxkIGJlIGJldHRlciBpZlxuLy8gYWxsIGJpbmRpbmdzIGNvdWxkIHVzZSBhbiBvZmZpY2lhbCAncHJvcGVydHkgd3JpdGVyJyBBUEkgd2l0aG91dCBuZWVkaW5nIHRvIGRlY2xhcmUgdGhhdCB0aGV5IG1pZ2h0KS4gSG93ZXZlcixcbi8vIHNpbmNlIHRoaXMgaXMgbm90LCBhbmQgaGFzIG5ldmVyIGJlZW4sIGEgcHVibGljIEFQSSAoX2tvX3Byb3BlcnR5X3dyaXRlcnMgd2FzIG5ldmVyIGRvY3VtZW50ZWQpLCBpdCdzIGFjY2VwdGFibGVcbi8vIGFzIGFuIGludGVybmFsIGltcGxlbWVudGF0aW9uIGRldGFpbCBpbiB0aGUgc2hvcnQgdGVybS5cbi8vIEZvciB0aG9zZSBkZXZlbG9wZXJzIHdobyByZWx5IG9uIF9rb19wcm9wZXJ0eV93cml0ZXJzIGluIHRoZWlyIGN1c3RvbSBiaW5kaW5ncywgd2UgZXhwb3NlIF90d29XYXlCaW5kaW5ncyBhcyBhblxuLy8gdW5kb2N1bWVudGVkIGZlYXR1cmUgdGhhdCBtYWtlcyBpdCByZWxhdGl2ZWx5IGVhc3kgdG8gdXBncmFkZSB0byBLTyAzLjAuIEhvd2V2ZXIsIHRoaXMgaXMgc3RpbGwgbm90IGFuIG9mZmljaWFsXG4vLyBwdWJsaWMgQVBJLCBhbmQgd2UgcmVzZXJ2ZSB0aGUgcmlnaHQgdG8gcmVtb3ZlIGl0IGF0IGFueSB0aW1lIGlmIHdlIGNyZWF0ZSBhIHJlYWwgcHVibGljIHByb3BlcnR5IHdyaXRlcnMgQVBJLlxua28uZXhwb3J0U3ltYm9sKCdleHByZXNzaW9uUmV3cml0aW5nLl90d29XYXlCaW5kaW5ncycsIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcudHdvV2F5QmluZGluZ3MpO1xuXG4vLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgZGVmaW5lIHRoZSBmb2xsb3dpbmcgYWxpYXNlcy4gKFByZXZpb3VzbHksIHRoZXNlIGZ1bmN0aW9uIG5hbWVzIHdlcmUgbWlzbGVhZGluZyBiZWNhdXNlXG4vLyB0aGV5IHJlZmVycmVkIHRvIEpTT04gc3BlY2lmaWNhbGx5LCBldmVuIHRob3VnaCB0aGV5IGFjdHVhbGx5IHdvcmsgd2l0aCBhcmJpdHJhcnkgSmF2YVNjcmlwdCBvYmplY3QgbGl0ZXJhbCBleHByZXNzaW9ucy4pXG5rby5leHBvcnRTeW1ib2woJ2pzb25FeHByZXNzaW9uUmV3cml0aW5nJywga28uZXhwcmVzc2lvblJld3JpdGluZyk7XG5rby5leHBvcnRTeW1ib2woJ2pzb25FeHByZXNzaW9uUmV3cml0aW5nLmluc2VydFByb3BlcnR5QWNjZXNzb3JzSW50b0pzb24nLCBrby5leHByZXNzaW9uUmV3cml0aW5nLnByZVByb2Nlc3NCaW5kaW5ncyk7XG4oZnVuY3Rpb24oKSB7XG4gICAgLy8gXCJWaXJ0dWFsIGVsZW1lbnRzXCIgaXMgYW4gYWJzdHJhY3Rpb24gb24gdG9wIG9mIHRoZSB1c3VhbCBET00gQVBJIHdoaWNoIHVuZGVyc3RhbmRzIHRoZSBub3Rpb24gdGhhdCBjb21tZW50IG5vZGVzXG4gICAgLy8gbWF5IGJlIHVzZWQgdG8gcmVwcmVzZW50IGhpZXJhcmNoeSAoaW4gYWRkaXRpb24gdG8gdGhlIERPTSdzIG5hdHVyYWwgaGllcmFyY2h5KS5cbiAgICAvLyBJZiB5b3UgY2FsbCB0aGUgRE9NLW1hbmlwdWxhdGluZyBmdW5jdGlvbnMgb24ga28udmlydHVhbEVsZW1lbnRzLCB5b3Ugd2lsbCBiZSBhYmxlIHRvIHJlYWQgYW5kIHdyaXRlIHRoZSBzdGF0ZVxuICAgIC8vIG9mIHRoYXQgdmlydHVhbCBoaWVyYXJjaHlcbiAgICAvL1xuICAgIC8vIFRoZSBwb2ludCBvZiBhbGwgdGhpcyBpcyB0byBzdXBwb3J0IGNvbnRhaW5lcmxlc3MgdGVtcGxhdGVzIChlLmcuLCA8IS0tIGtvIGZvcmVhY2g6c29tZUNvbGxlY3Rpb24gLS0+YmxhaDwhLS0gL2tvIC0tPilcbiAgICAvLyB3aXRob3V0IGhhdmluZyB0byBzY2F0dGVyIHNwZWNpYWwgY2FzZXMgYWxsIG92ZXIgdGhlIGJpbmRpbmcgYW5kIHRlbXBsYXRpbmcgY29kZS5cblxuICAgIC8vIElFIDkgY2Fubm90IHJlbGlhYmx5IHJlYWQgdGhlIFwibm9kZVZhbHVlXCIgcHJvcGVydHkgb2YgYSBjb21tZW50IG5vZGUgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzE4NilcbiAgICAvLyBidXQgaXQgZG9lcyBnaXZlIHRoZW0gYSBub25zdGFuZGFyZCBhbHRlcm5hdGl2ZSBwcm9wZXJ0eSBjYWxsZWQgXCJ0ZXh0XCIgdGhhdCBpdCBjYW4gcmVhZCByZWxpYWJseS4gT3RoZXIgYnJvd3NlcnMgZG9uJ3QgaGF2ZSB0aGF0IHByb3BlcnR5LlxuICAgIC8vIFNvLCB1c2Ugbm9kZS50ZXh0IHdoZXJlIGF2YWlsYWJsZSwgYW5kIG5vZGUubm9kZVZhbHVlIGVsc2V3aGVyZVxuICAgIHZhciBjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuY3JlYXRlQ29tbWVudChcInRlc3RcIikudGV4dCA9PT0gXCI8IS0tdGVzdC0tPlwiO1xuXG4gICAgdmFyIHN0YXJ0Q29tbWVudFJlZ2V4ID0gY29tbWVudE5vZGVzSGF2ZVRleHRQcm9wZXJ0eSA/IC9ePCEtLVxccyprbyg/OlxccysoW1xcc1xcU10rKSk/XFxzKi0tPiQvIDogL15cXHMqa28oPzpcXHMrKFtcXHNcXFNdKykpP1xccyokLztcbiAgICB2YXIgZW5kQ29tbWVudFJlZ2V4ID0gICBjb21tZW50Tm9kZXNIYXZlVGV4dFByb3BlcnR5ID8gL148IS0tXFxzKlxcL2tvXFxzKi0tPiQvIDogL15cXHMqXFwva29cXHMqJC87XG4gICAgdmFyIGh0bWxUYWdzV2l0aE9wdGlvbmFsbHlDbG9zaW5nQ2hpbGRyZW4gPSB7ICd1bCc6IHRydWUsICdvbCc6IHRydWUgfTtcblxuICAgIGZ1bmN0aW9uIGlzU3RhcnRDb21tZW50KG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIChub2RlLm5vZGVUeXBlID09IDgpICYmIHN0YXJ0Q29tbWVudFJlZ2V4LnRlc3QoY29tbWVudE5vZGVzSGF2ZVRleHRQcm9wZXJ0eSA/IG5vZGUudGV4dCA6IG5vZGUubm9kZVZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0VuZENvbW1lbnQobm9kZSkge1xuICAgICAgICByZXR1cm4gKG5vZGUubm9kZVR5cGUgPT0gOCkgJiYgZW5kQ29tbWVudFJlZ2V4LnRlc3QoY29tbWVudE5vZGVzSGF2ZVRleHRQcm9wZXJ0eSA/IG5vZGUudGV4dCA6IG5vZGUubm9kZVZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRWaXJ0dWFsQ2hpbGRyZW4oc3RhcnRDb21tZW50LCBhbGxvd1VuYmFsYW5jZWQpIHtcbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gc3RhcnRDb21tZW50O1xuICAgICAgICB2YXIgZGVwdGggPSAxO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBbXTtcbiAgICAgICAgd2hpbGUgKGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChpc0VuZENvbW1lbnQoY3VycmVudE5vZGUpKSB7XG4gICAgICAgICAgICAgICAgZGVwdGgtLTtcbiAgICAgICAgICAgICAgICBpZiAoZGVwdGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjdXJyZW50Tm9kZSk7XG5cbiAgICAgICAgICAgIGlmIChpc1N0YXJ0Q29tbWVudChjdXJyZW50Tm9kZSkpXG4gICAgICAgICAgICAgICAgZGVwdGgrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWFsbG93VW5iYWxhbmNlZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIGNsb3NpbmcgY29tbWVudCB0YWcgdG8gbWF0Y2g6IFwiICsgc3RhcnRDb21tZW50Lm5vZGVWYWx1ZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE1hdGNoaW5nRW5kQ29tbWVudChzdGFydENvbW1lbnQsIGFsbG93VW5iYWxhbmNlZCkge1xuICAgICAgICB2YXIgYWxsVmlydHVhbENoaWxkcmVuID0gZ2V0VmlydHVhbENoaWxkcmVuKHN0YXJ0Q29tbWVudCwgYWxsb3dVbmJhbGFuY2VkKTtcbiAgICAgICAgaWYgKGFsbFZpcnR1YWxDaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKGFsbFZpcnR1YWxDaGlsZHJlbi5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBhbGxWaXJ0dWFsQ2hpbGRyZW5bYWxsVmlydHVhbENoaWxkcmVuLmxlbmd0aCAtIDFdLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXJ0Q29tbWVudC5uZXh0U2libGluZztcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gTXVzdCBoYXZlIG5vIG1hdGNoaW5nIGVuZCBjb21tZW50LCBhbmQgYWxsb3dVbmJhbGFuY2VkIGlzIHRydWVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRVbmJhbGFuY2VkQ2hpbGRUYWdzKG5vZGUpIHtcbiAgICAgICAgLy8gZS5nLiwgZnJvbSA8ZGl2Pk9LPC9kaXY+PCEtLSBrbyBibGFoIC0tPjxzcGFuPkFub3RoZXI8L3NwYW4+LCByZXR1cm5zOiA8IS0tIGtvIGJsYWggLS0+PHNwYW4+QW5vdGhlcjwvc3Bhbj5cbiAgICAgICAgLy8gICAgICAgZnJvbSA8ZGl2Pk9LPC9kaXY+PCEtLSAva28gLS0+PCEtLSAva28gLS0+LCAgICAgICAgICAgICByZXR1cm5zOiA8IS0tIC9rbyAtLT48IS0tIC9rbyAtLT5cbiAgICAgICAgdmFyIGNoaWxkTm9kZSA9IG5vZGUuZmlyc3RDaGlsZCwgY2FwdHVyZVJlbWFpbmluZyA9IG51bGw7XG4gICAgICAgIGlmIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FwdHVyZVJlbWFpbmluZykgICAgICAgICAgICAgICAgICAgLy8gV2UgYWxyZWFkeSBoaXQgYW4gdW5iYWxhbmNlZCBub2RlIGFuZCBhcmUgbm93IGp1c3Qgc2Nvb3BpbmcgdXAgYWxsIHN1YnNlcXVlbnQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZVJlbWFpbmluZy5wdXNoKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNTdGFydENvbW1lbnQoY2hpbGROb2RlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hpbmdFbmRDb21tZW50ID0gZ2V0TWF0Y2hpbmdFbmRDb21tZW50KGNoaWxkTm9kZSwgLyogYWxsb3dVbmJhbGFuY2VkOiAqLyB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nRW5kQ29tbWVudCkgICAgICAgICAgICAgLy8gSXQncyBhIGJhbGFuY2VkIHRhZywgc28gc2tpcCBpbW1lZGlhdGVseSB0byB0aGUgZW5kIG9mIHRoaXMgdmlydHVhbCBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTm9kZSA9IG1hdGNoaW5nRW5kQ29tbWVudDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyZVJlbWFpbmluZyA9IFtjaGlsZE5vZGVdOyAvLyBJdCdzIHVuYmFsYW5jZWQsIHNvIHN0YXJ0IGNhcHR1cmluZyBmcm9tIHRoaXMgcG9pbnRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzRW5kQ29tbWVudChjaGlsZE5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcHR1cmVSZW1haW5pbmcgPSBbY2hpbGROb2RlXTsgICAgIC8vIEl0J3MgdW5iYWxhbmNlZCAoaWYgaXQgd2Fzbid0LCB3ZSdkIGhhdmUgc2tpcHBlZCBvdmVyIGl0IGFscmVhZHkpLCBzbyBzdGFydCBjYXB0dXJpbmdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChjaGlsZE5vZGUgPSBjaGlsZE5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXB0dXJlUmVtYWluaW5nO1xuICAgIH1cblxuICAgIGtvLnZpcnR1YWxFbGVtZW50cyA9IHtcbiAgICAgICAgYWxsb3dlZEJpbmRpbmdzOiB7fSxcblxuICAgICAgICBjaGlsZE5vZGVzOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNTdGFydENvbW1lbnQobm9kZSkgPyBnZXRWaXJ0dWFsQ2hpbGRyZW4obm9kZSkgOiBub2RlLmNoaWxkTm9kZXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW1wdHlOb2RlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBpZiAoIWlzU3RhcnRDb21tZW50KG5vZGUpKVxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmVtcHR5RG9tTm9kZShub2RlKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB2aXJ0dWFsQ2hpbGRyZW4gPSBrby52aXJ0dWFsRWxlbWVudHMuY2hpbGROb2Rlcyhub2RlKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZpcnR1YWxDaGlsZHJlbi5sZW5ndGg7IGkgPCBqOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIGtvLnJlbW92ZU5vZGUodmlydHVhbENoaWxkcmVuW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXREb21Ob2RlQ2hpbGRyZW46IGZ1bmN0aW9uKG5vZGUsIGNoaWxkTm9kZXMpIHtcbiAgICAgICAgICAgIGlmICghaXNTdGFydENvbW1lbnQobm9kZSkpXG4gICAgICAgICAgICAgICAga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuKG5vZGUsIGNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLmVtcHR5Tm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kQ29tbWVudE5vZGUgPSBub2RlLm5leHRTaWJsaW5nOyAvLyBNdXN0IGJlIHRoZSBuZXh0IHNpYmxpbmcsIGFzIHdlIGp1c3QgZW1wdGllZCB0aGUgY2hpbGRyZW5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IGNoaWxkTm9kZXMubGVuZ3RoOyBpIDwgajsgaSsrKVxuICAgICAgICAgICAgICAgICAgICBlbmRDb21tZW50Tm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjaGlsZE5vZGVzW2ldLCBlbmRDb21tZW50Tm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJlcGVuZDogZnVuY3Rpb24oY29udGFpbmVyTm9kZSwgbm9kZVRvUHJlcGVuZCkge1xuICAgICAgICAgICAgaWYgKCFpc1N0YXJ0Q29tbWVudChjb250YWluZXJOb2RlKSkge1xuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXJOb2RlLmZpcnN0Q2hpbGQpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lck5vZGUuaW5zZXJ0QmVmb3JlKG5vZGVUb1ByZXBlbmQsIGNvbnRhaW5lck5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLmFwcGVuZENoaWxkKG5vZGVUb1ByZXBlbmQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBjb21tZW50cyBtdXN0IGFsd2F5cyBoYXZlIGEgcGFyZW50IGFuZCBhdCBsZWFzdCBvbmUgZm9sbG93aW5nIHNpYmxpbmcgKHRoZSBlbmQgY29tbWVudClcbiAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGVUb1ByZXBlbmQsIGNvbnRhaW5lck5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihjb250YWluZXJOb2RlLCBub2RlVG9JbnNlcnQsIGluc2VydEFmdGVyTm9kZSkge1xuICAgICAgICAgICAgaWYgKCFpbnNlcnRBZnRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMucHJlcGVuZChjb250YWluZXJOb2RlLCBub2RlVG9JbnNlcnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNTdGFydENvbW1lbnQoY29udGFpbmVyTm9kZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYWZ0ZXIgaW5zZXJ0aW9uIHBvaW50XG4gICAgICAgICAgICAgICAgaWYgKGluc2VydEFmdGVyTm9kZS5uZXh0U2libGluZylcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5pbnNlcnRCZWZvcmUobm9kZVRvSW5zZXJ0LCBpbnNlcnRBZnRlck5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTm9kZS5hcHBlbmRDaGlsZChub2RlVG9JbnNlcnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDaGlsZHJlbiBvZiBzdGFydCBjb21tZW50cyBtdXN0IGFsd2F5cyBoYXZlIGEgcGFyZW50IGFuZCBhdCBsZWFzdCBvbmUgZm9sbG93aW5nIHNpYmxpbmcgKHRoZSBlbmQgY29tbWVudClcbiAgICAgICAgICAgICAgICBjb250YWluZXJOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGVUb0luc2VydCwgaW5zZXJ0QWZ0ZXJOb2RlLm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaXJzdENoaWxkOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICBpZiAoIWlzU3RhcnRDb21tZW50KG5vZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICBpZiAoIW5vZGUubmV4dFNpYmxpbmcgfHwgaXNFbmRDb21tZW50KG5vZGUubmV4dFNpYmxpbmcpKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV4dFNpYmxpbmc6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChpc1N0YXJ0Q29tbWVudChub2RlKSlcbiAgICAgICAgICAgICAgICBub2RlID0gZ2V0TWF0Y2hpbmdFbmRDb21tZW50KG5vZGUpO1xuICAgICAgICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcgJiYgaXNFbmRDb21tZW50KG5vZGUubmV4dFNpYmxpbmcpKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzQmluZGluZ1ZhbHVlOiBpc1N0YXJ0Q29tbWVudCxcblxuICAgICAgICB2aXJ0dWFsTm9kZUJpbmRpbmdWYWx1ZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgdmFyIHJlZ2V4TWF0Y2ggPSAoY29tbWVudE5vZGVzSGF2ZVRleHRQcm9wZXJ0eSA/IG5vZGUudGV4dCA6IG5vZGUubm9kZVZhbHVlKS5tYXRjaChzdGFydENvbW1lbnRSZWdleCk7XG4gICAgICAgICAgICByZXR1cm4gcmVnZXhNYXRjaCA/IHJlZ2V4TWF0Y2hbMV0gOiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5vcm1hbGlzZVZpcnR1YWxFbGVtZW50RG9tU3RydWN0dXJlOiBmdW5jdGlvbihlbGVtZW50VmVyaWZpZWQpIHtcbiAgICAgICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9TdGV2ZVNhbmRlcnNvbi9rbm9ja291dC9pc3N1ZXMvMTU1XG4gICAgICAgICAgICAvLyAoSUUgPD0gOCBvciBJRSA5IHF1aXJrcyBtb2RlIHBhcnNlcyB5b3VyIEhUTUwgd2VpcmRseSwgdHJlYXRpbmcgY2xvc2luZyA8L2xpPiB0YWdzIGFzIGlmIHRoZXkgZG9uJ3QgZXhpc3QsIHRoZXJlYnkgbW92aW5nIGNvbW1lbnQgbm9kZXNcbiAgICAgICAgICAgIC8vIHRoYXQgYXJlIGRpcmVjdCBkZXNjZW5kYW50cyBvZiA8dWw+IGludG8gdGhlIHByZWNlZGluZyA8bGk+KVxuICAgICAgICAgICAgaWYgKCFodG1sVGFnc1dpdGhPcHRpb25hbGx5Q2xvc2luZ0NoaWxkcmVuW2tvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50VmVyaWZpZWQpXSlcbiAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIFNjYW4gaW1tZWRpYXRlIGNoaWxkcmVuIHRvIHNlZSBpZiB0aGV5IGNvbnRhaW4gdW5iYWxhbmNlZCBjb21tZW50IHRhZ3MuIElmIHRoZXkgZG8sIHRob3NlIGNvbW1lbnQgdGFnc1xuICAgICAgICAgICAgLy8gbXVzdCBiZSBpbnRlbmRlZCB0byBhcHBlYXIgKmFmdGVyKiB0aGF0IGNoaWxkLCBzbyBtb3ZlIHRoZW0gdGhlcmUuXG4gICAgICAgICAgICB2YXIgY2hpbGROb2RlID0gZWxlbWVudFZlcmlmaWVkLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICBpZiAoY2hpbGROb2RlKSB7XG4gICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5iYWxhbmNlZFRhZ3MgPSBnZXRVbmJhbGFuY2VkQ2hpbGRUYWdzKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5iYWxhbmNlZFRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXggdXAgdGhlIERPTSBieSBtb3ZpbmcgdGhlIHVuYmFsYW5jZWQgdGFncyB0byB3aGVyZSB0aGV5IG1vc3QgbGlrZWx5IHdlcmUgaW50ZW5kZWQgdG8gYmUgcGxhY2VkIC0gKmFmdGVyKiB0aGUgY2hpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZVRvSW5zZXJ0QmVmb3JlID0gY2hpbGROb2RlLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5iYWxhbmNlZFRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGVUb0luc2VydEJlZm9yZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRWZXJpZmllZC5pbnNlcnRCZWZvcmUodW5iYWxhbmNlZFRhZ3NbaV0sIG5vZGVUb0luc2VydEJlZm9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRWZXJpZmllZC5hcHBlbmRDaGlsZCh1bmJhbGFuY2VkVGFnc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSB3aGlsZSAoY2hpbGROb2RlID0gY2hpbGROb2RlLm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KSgpO1xua28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMnLCBrby52aXJ0dWFsRWxlbWVudHMpO1xua28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzJywga28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5ncyk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5lbXB0eU5vZGUnLCBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKTtcbi8va28uZXhwb3J0U3ltYm9sKCd2aXJ0dWFsRWxlbWVudHMuZmlyc3RDaGlsZCcsIGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKTsgICAgIC8vIGZpcnN0Q2hpbGQgaXMgbm90IG1pbmlmaWVkXG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5pbnNlcnRBZnRlcicsIGtvLnZpcnR1YWxFbGVtZW50cy5pbnNlcnRBZnRlcik7XG4vL2tvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nJywga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKTsgICAvLyBuZXh0U2libGluZyBpcyBub3QgbWluaWZpZWRcbmtvLmV4cG9ydFN5bWJvbCgndmlydHVhbEVsZW1lbnRzLnByZXBlbmQnLCBrby52aXJ0dWFsRWxlbWVudHMucHJlcGVuZCk7XG5rby5leHBvcnRTeW1ib2woJ3ZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4nLCBrby52aXJ0dWFsRWxlbWVudHMuc2V0RG9tTm9kZUNoaWxkcmVuKTtcbihmdW5jdGlvbigpIHtcbiAgICB2YXIgZGVmYXVsdEJpbmRpbmdBdHRyaWJ1dGVOYW1lID0gXCJkYXRhLWJpbmRcIjtcblxuICAgIGtvLmJpbmRpbmdQcm92aWRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmJpbmRpbmdDYWNoZSA9IHt9O1xuICAgIH07XG5cbiAgICBrby51dGlscy5leHRlbmQoa28uYmluZGluZ1Byb3ZpZGVyLnByb3RvdHlwZSwge1xuICAgICAgICAnbm9kZUhhc0JpbmRpbmdzJzogZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoZGVmYXVsdEJpbmRpbmdBdHRyaWJ1dGVOYW1lKSAhPSBudWxsOyAgIC8vIEVsZW1lbnRcbiAgICAgICAgICAgICAgICBjYXNlIDg6IHJldHVybiBrby52aXJ0dWFsRWxlbWVudHMuaGFzQmluZGluZ1ZhbHVlKG5vZGUpOyAvLyBDb21tZW50IG5vZGVcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgJ2dldEJpbmRpbmdzJzogZnVuY3Rpb24obm9kZSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBiaW5kaW5nc1N0cmluZyA9IHRoaXNbJ2dldEJpbmRpbmdzU3RyaW5nJ10obm9kZSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmdzU3RyaW5nID8gdGhpc1sncGFyc2VCaW5kaW5nc1N0cmluZyddKGJpbmRpbmdzU3RyaW5nLCBiaW5kaW5nQ29udGV4dCwgbm9kZSkgOiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgICdnZXRCaW5kaW5nQWNjZXNzb3JzJzogZnVuY3Rpb24obm9kZSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBiaW5kaW5nc1N0cmluZyA9IHRoaXNbJ2dldEJpbmRpbmdzU3RyaW5nJ10obm9kZSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGJpbmRpbmdzU3RyaW5nID8gdGhpc1sncGFyc2VCaW5kaW5nc1N0cmluZyddKGJpbmRpbmdzU3RyaW5nLCBiaW5kaW5nQ29udGV4dCwgbm9kZSwgeyd2YWx1ZUFjY2Vzc29ycyc6dHJ1ZX0pIDogbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoaXMgZGVmYXVsdCBwcm92aWRlci5cbiAgICAgICAgLy8gSXQncyBub3QgcGFydCBvZiB0aGUgaW50ZXJmYWNlIGRlZmluaXRpb24gZm9yIGEgZ2VuZXJhbCBiaW5kaW5nIHByb3ZpZGVyLlxuICAgICAgICAnZ2V0QmluZGluZ3NTdHJpbmcnOiBmdW5jdGlvbihub2RlLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoZGVmYXVsdEJpbmRpbmdBdHRyaWJ1dGVOYW1lKTsgICAvLyBFbGVtZW50XG4gICAgICAgICAgICAgICAgY2FzZSA4OiByZXR1cm4ga28udmlydHVhbEVsZW1lbnRzLnZpcnR1YWxOb2RlQmluZGluZ1ZhbHVlKG5vZGUpOyAvLyBDb21tZW50IG5vZGVcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoaXMgZGVmYXVsdCBwcm92aWRlci5cbiAgICAgICAgLy8gSXQncyBub3QgcGFydCBvZiB0aGUgaW50ZXJmYWNlIGRlZmluaXRpb24gZm9yIGEgZ2VuZXJhbCBiaW5kaW5nIHByb3ZpZGVyLlxuICAgICAgICAncGFyc2VCaW5kaW5nc1N0cmluZyc6IGZ1bmN0aW9uKGJpbmRpbmdzU3RyaW5nLCBiaW5kaW5nQ29udGV4dCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgYmluZGluZ0Z1bmN0aW9uID0gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3JWaWFDYWNoZShiaW5kaW5nc1N0cmluZywgdGhpcy5iaW5kaW5nQ2FjaGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5nRnVuY3Rpb24oYmluZGluZ0NvbnRleHQsIG5vZGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgICAgICBleC5tZXNzYWdlID0gXCJVbmFibGUgdG8gcGFyc2UgYmluZGluZ3MuXFxuQmluZGluZ3MgdmFsdWU6IFwiICsgYmluZGluZ3NTdHJpbmcgKyBcIlxcbk1lc3NhZ2U6IFwiICsgZXgubWVzc2FnZTtcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddID0gbmV3IGtvLmJpbmRpbmdQcm92aWRlcigpO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3JWaWFDYWNoZShiaW5kaW5nc1N0cmluZywgY2FjaGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGNhY2hlS2V5ID0gYmluZGluZ3NTdHJpbmcgKyAob3B0aW9ucyAmJiBvcHRpb25zWyd2YWx1ZUFjY2Vzc29ycyddIHx8ICcnKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlW2NhY2hlS2V5XVxuICAgICAgICAgICAgfHwgKGNhY2hlW2NhY2hlS2V5XSA9IGNyZWF0ZUJpbmRpbmdzU3RyaW5nRXZhbHVhdG9yKGJpbmRpbmdzU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQmluZGluZ3NTdHJpbmdFdmFsdWF0b3IoYmluZGluZ3NTdHJpbmcsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gQnVpbGQgdGhlIHNvdXJjZSBmb3IgYSBmdW5jdGlvbiB0aGF0IGV2YWx1YXRlcyBcImV4cHJlc3Npb25cIlxuICAgICAgICAvLyBGb3IgZWFjaCBzY29wZSB2YXJpYWJsZSwgYWRkIGFuIGV4dHJhIGxldmVsIG9mIFwid2l0aFwiIG5lc3RpbmdcbiAgICAgICAgLy8gRXhhbXBsZSByZXN1bHQ6IHdpdGgoc2MxKSB7IHdpdGgoc2MwKSB7IHJldHVybiAoZXhwcmVzc2lvbikgfSB9XG4gICAgICAgIHZhciByZXdyaXR0ZW5CaW5kaW5ncyA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKGJpbmRpbmdzU3RyaW5nLCBvcHRpb25zKSxcbiAgICAgICAgICAgIGZ1bmN0aW9uQm9keSA9IFwid2l0aCgkY29udGV4dCl7d2l0aCgkZGF0YXx8e30pe3JldHVybntcIiArIHJld3JpdHRlbkJpbmRpbmdzICsgXCJ9fX1cIjtcbiAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihcIiRjb250ZXh0XCIsIFwiJGVsZW1lbnRcIiwgZnVuY3Rpb25Cb2R5KTtcbiAgICB9XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ2JpbmRpbmdQcm92aWRlcicsIGtvLmJpbmRpbmdQcm92aWRlcik7XG4oZnVuY3Rpb24gKCkge1xuICAgIGtvLmJpbmRpbmdIYW5kbGVycyA9IHt9O1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBlbGVtZW50IHR5cGVzIHdpbGwgbm90IGJlIHJlY3Vyc2VkIGludG8gZHVyaW5nIGJpbmRpbmcuIEluIHRoZSBmdXR1cmUsIHdlXG4gICAgLy8gbWF5IGNvbnNpZGVyIGFkZGluZyA8dGVtcGxhdGU+IHRvIHRoaXMgbGlzdCwgYmVjYXVzZSBzdWNoIGVsZW1lbnRzJyBjb250ZW50cyBhcmUgYWx3YXlzXG4gICAgLy8gaW50ZW5kZWQgdG8gYmUgYm91bmQgaW4gYSBkaWZmZXJlbnQgY29udGV4dCBmcm9tIHdoZXJlIHRoZXkgYXBwZWFyIGluIHRoZSBkb2N1bWVudC5cbiAgICB2YXIgYmluZGluZ0RvZXNOb3RSZWN1cnNlSW50b0VsZW1lbnRUeXBlcyA9IHtcbiAgICAgICAgLy8gRG9uJ3Qgd2FudCBiaW5kaW5ncyB0aGF0IG9wZXJhdGUgb24gdGV4dCBub2RlcyB0byBtdXRhdGUgPHNjcmlwdD4gY29udGVudHMsXG4gICAgICAgIC8vIGJlY2F1c2UgaXQncyB1bmV4cGVjdGVkIGFuZCBhIHBvdGVudGlhbCBYU1MgaXNzdWVcbiAgICAgICAgJ3NjcmlwdCc6IHRydWVcbiAgICB9O1xuXG4gICAgLy8gVXNlIGFuIG92ZXJyaWRhYmxlIG1ldGhvZCBmb3IgcmV0cmlldmluZyBiaW5kaW5nIGhhbmRsZXJzIHNvIHRoYXQgYSBwbHVnaW5zIG1heSBzdXBwb3J0IGR5bmFtaWNhbGx5IGNyZWF0ZWQgaGFuZGxlcnNcbiAgICBrb1snZ2V0QmluZGluZ0hhbmRsZXInXSA9IGZ1bmN0aW9uKGJpbmRpbmdLZXkpIHtcbiAgICAgICAgcmV0dXJuIGtvLmJpbmRpbmdIYW5kbGVyc1tiaW5kaW5nS2V5XTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIGtvLmJpbmRpbmdDb250ZXh0IGNvbnN0cnVjdG9yIGlzIG9ubHkgY2FsbGVkIGRpcmVjdGx5IHRvIGNyZWF0ZSB0aGUgcm9vdCBjb250ZXh0LiBGb3IgY2hpbGRcbiAgICAvLyBjb250ZXh0cywgdXNlIGJpbmRpbmdDb250ZXh0LmNyZWF0ZUNoaWxkQ29udGV4dCBvciBiaW5kaW5nQ29udGV4dC5leHRlbmQuXG4gICAga28uYmluZGluZ0NvbnRleHQgPSBmdW5jdGlvbihkYXRhSXRlbU9yQWNjZXNzb3IsIHBhcmVudENvbnRleHQsIGRhdGFJdGVtQWxpYXMsIGV4dGVuZENhbGxiYWNrKSB7XG5cbiAgICAgICAgLy8gVGhlIGJpbmRpbmcgY29udGV4dCBvYmplY3QgaW5jbHVkZXMgc3RhdGljIHByb3BlcnRpZXMgZm9yIHRoZSBjdXJyZW50LCBwYXJlbnQsIGFuZCByb290IHZpZXcgbW9kZWxzLlxuICAgICAgICAvLyBJZiBhIHZpZXcgbW9kZWwgaXMgYWN0dWFsbHkgc3RvcmVkIGluIGFuIG9ic2VydmFibGUsIHRoZSBjb3JyZXNwb25kaW5nIGJpbmRpbmcgY29udGV4dCBvYmplY3QsIGFuZFxuICAgICAgICAvLyBhbnkgY2hpbGQgY29udGV4dHMsIG11c3QgYmUgdXBkYXRlZCB3aGVuIHRoZSB2aWV3IG1vZGVsIGlzIGNoYW5nZWQuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbnRleHQoKSB7XG4gICAgICAgICAgICAvLyBNb3N0IG9mIHRoZSB0aW1lLCB0aGUgY29udGV4dCB3aWxsIGRpcmVjdGx5IGdldCBhIHZpZXcgbW9kZWwgb2JqZWN0LCBidXQgaWYgYSBmdW5jdGlvbiBpcyBnaXZlbixcbiAgICAgICAgICAgIC8vIHdlIGNhbGwgdGhlIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSB2aWV3IG1vZGVsLiBJZiB0aGUgZnVuY3Rpb24gYWNjZXNzZXMgYW55IG9ic2V2YWJsZXMgb3IgcmV0dXJuc1xuICAgICAgICAgICAgLy8gYW4gb2JzZXJ2YWJsZSwgdGhlIGRlcGVuZGVuY3kgaXMgdHJhY2tlZCwgYW5kIHRob3NlIG9ic2VydmFibGVzIGNhbiBsYXRlciBjYXVzZSB0aGUgYmluZGluZ1xuICAgICAgICAgICAgLy8gY29udGV4dCB0byBiZSB1cGRhdGVkLlxuICAgICAgICAgICAgdmFyIGRhdGFJdGVtT3JPYnNlcnZhYmxlID0gaXNGdW5jID8gZGF0YUl0ZW1PckFjY2Vzc29yKCkgOiBkYXRhSXRlbU9yQWNjZXNzb3IsXG4gICAgICAgICAgICAgICAgZGF0YUl0ZW0gPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGFJdGVtT3JPYnNlcnZhYmxlKTtcblxuICAgICAgICAgICAgaWYgKHBhcmVudENvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAvLyBXaGVuIGEgXCJwYXJlbnRcIiBjb250ZXh0IGlzIGdpdmVuLCByZWdpc3RlciBhIGRlcGVuZGVuY3kgb24gdGhlIHBhcmVudCBjb250ZXh0LiBUaHVzIHdoZW5ldmVyIHRoZVxuICAgICAgICAgICAgICAgIC8vIHBhcmVudCBjb250ZXh0IGlzIHVwZGF0ZWQsIHRoaXMgY29udGV4dCB3aWxsIGFsc28gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Q29udGV4dC5fc3Vic2NyaWJhYmxlKVxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRDb250ZXh0Ll9zdWJzY3JpYmFibGUoKTtcblxuICAgICAgICAgICAgICAgIC8vIENvcHkgJHJvb3QgYW5kIGFueSBjdXN0b20gcHJvcGVydGllcyBmcm9tIHRoZSBwYXJlbnQgY29udGV4dFxuICAgICAgICAgICAgICAgIGtvLnV0aWxzLmV4dGVuZChzZWxmLCBwYXJlbnRDb250ZXh0KTtcblxuICAgICAgICAgICAgICAgIC8vIEJlY2F1c2UgdGhlIGFib3ZlIGNvcHkgb3ZlcndyaXRlcyBvdXIgb3duIHByb3BlcnRpZXMsIHdlIG5lZWQgdG8gcmVzZXQgdGhlbS5cbiAgICAgICAgICAgICAgICAvLyBEdXJpbmcgdGhlIGZpcnN0IGV4ZWN1dGlvbiwgXCJzdWJzY3JpYmFibGVcIiBpc24ndCBzZXQsIHNvIGRvbid0IGJvdGhlciBkb2luZyB0aGUgdXBkYXRlIHRoZW4uXG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmliYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9zdWJzY3JpYmFibGUgPSBzdWJzY3JpYmFibGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmWyckcGFyZW50cyddID0gW107XG4gICAgICAgICAgICAgICAgc2VsZlsnJHJvb3QnXSA9IGRhdGFJdGVtO1xuXG4gICAgICAgICAgICAgICAgLy8gRXhwb3J0ICdrbycgaW4gdGhlIGJpbmRpbmcgY29udGV4dCBzbyBpdCB3aWxsIGJlIGF2YWlsYWJsZSBpbiBiaW5kaW5ncyBhbmQgdGVtcGxhdGVzXG4gICAgICAgICAgICAgICAgLy8gZXZlbiBpZiAna28nIGlzbid0IGV4cG9ydGVkIGFzIGEgZ2xvYmFsLCBzdWNoIGFzIHdoZW4gdXNpbmcgYW4gQU1EIGxvYWRlci5cbiAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy80OTBcbiAgICAgICAgICAgICAgICBzZWxmWydrbyddID0ga287XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmWyckcmF3RGF0YSddID0gZGF0YUl0ZW1Pck9ic2VydmFibGU7XG4gICAgICAgICAgICBzZWxmWyckZGF0YSddID0gZGF0YUl0ZW07XG4gICAgICAgICAgICBpZiAoZGF0YUl0ZW1BbGlhcylcbiAgICAgICAgICAgICAgICBzZWxmW2RhdGFJdGVtQWxpYXNdID0gZGF0YUl0ZW07XG5cbiAgICAgICAgICAgIC8vIFRoZSBleHRlbmRDYWxsYmFjayBmdW5jdGlvbiBpcyBwcm92aWRlZCB3aGVuIGNyZWF0aW5nIGEgY2hpbGQgY29udGV4dCBvciBleHRlbmRpbmcgYSBjb250ZXh0LlxuICAgICAgICAgICAgLy8gSXQgaGFuZGxlcyB0aGUgc3BlY2lmaWMgYWN0aW9ucyBuZWVkZWQgdG8gZmluaXNoIHNldHRpbmcgdXAgdGhlIGJpbmRpbmcgY29udGV4dC4gQWN0aW9ucyBpbiB0aGlzXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBjb3VsZCBhbHNvIGFkZCBkZXBlbmRlbmNpZXMgdG8gdGhpcyBiaW5kaW5nIGNvbnRleHQuXG4gICAgICAgICAgICBpZiAoZXh0ZW5kQ2FsbGJhY2spXG4gICAgICAgICAgICAgICAgZXh0ZW5kQ2FsbGJhY2soc2VsZiwgcGFyZW50Q29udGV4dCwgZGF0YUl0ZW0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc2VsZlsnJGRhdGEnXTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkaXNwb3NlV2hlbigpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlcyAmJiAha28udXRpbHMuYW55RG9tTm9kZUlzQXR0YWNoZWRUb0RvY3VtZW50KG5vZGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIGlzRnVuYyA9IHR5cGVvZihkYXRhSXRlbU9yQWNjZXNzb3IpID09IFwiZnVuY3Rpb25cIiAmJiAha28uaXNPYnNlcnZhYmxlKGRhdGFJdGVtT3JBY2Nlc3NvciksXG4gICAgICAgICAgICBub2RlcyxcbiAgICAgICAgICAgIHN1YnNjcmliYWJsZSA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUodXBkYXRlQ29udGV4dCwgbnVsbCwgeyBkaXNwb3NlV2hlbjogZGlzcG9zZVdoZW4sIGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogdHJ1ZSB9KTtcblxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgYmluZGluZyBjb250ZXh0IGhhcyBiZWVuIGluaXRpYWxpemVkLCBhbmQgdGhlIFwic3Vic2NyaWJhYmxlXCIgY29tcHV0ZWQgb2JzZXJ2YWJsZSBpc1xuICAgICAgICAvLyBzdWJzY3JpYmVkIHRvIGFueSBvYnNlcnZhYmxlcyB0aGF0IHdlcmUgYWNjZXNzZWQgaW4gdGhlIHByb2Nlc3MuIElmIHRoZXJlIGlzIG5vdGhpbmcgdG8gdHJhY2ssIHRoZVxuICAgICAgICAvLyBjb21wdXRlZCB3aWxsIGJlIGluYWN0aXZlLCBhbmQgd2UgY2FuIHNhZmVseSB0aHJvdyBpdCBhd2F5LiBJZiBpdCdzIGFjdGl2ZSwgdGhlIGNvbXB1dGVkIGlzIHN0b3JlZCBpblxuICAgICAgICAvLyB0aGUgY29udGV4dCBvYmplY3QuXG4gICAgICAgIGlmIChzdWJzY3JpYmFibGUuaXNBY3RpdmUoKSkge1xuICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJhYmxlID0gc3Vic2NyaWJhYmxlO1xuXG4gICAgICAgICAgICAvLyBBbHdheXMgbm90aWZ5IGJlY2F1c2UgZXZlbiBpZiB0aGUgbW9kZWwgKCRkYXRhKSBoYXNuJ3QgY2hhbmdlZCwgb3RoZXIgY29udGV4dCBwcm9wZXJ0aWVzIG1pZ2h0IGhhdmUgY2hhbmdlZFxuICAgICAgICAgICAgc3Vic2NyaWJhYmxlWydlcXVhbGl0eUNvbXBhcmVyJ10gPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGJlIGFibGUgdG8gZGlzcG9zZSBvZiB0aGlzIGNvbXB1dGVkIG9ic2VydmFibGUgd2hlbiBpdCdzIG5vIGxvbmdlciBuZWVkZWQuIFRoaXMgd291bGQgYmVcbiAgICAgICAgICAgIC8vIGVhc3kgaWYgd2UgaGFkIGEgc2luZ2xlIG5vZGUgdG8gd2F0Y2gsIGJ1dCBiaW5kaW5nIGNvbnRleHRzIGNhbiBiZSB1c2VkIGJ5IG1hbnkgZGlmZmVyZW50IG5vZGVzLCBhbmRcbiAgICAgICAgICAgIC8vIHdlIGNhbm5vdCBhc3N1bWUgdGhhdCB0aG9zZSBub2RlcyBoYXZlIGFueSByZWxhdGlvbiB0byBlYWNoIG90aGVyLiBTbyBpbnN0ZWFkIHdlIHRyYWNrIGFueSBub2RlIHRoYXRcbiAgICAgICAgICAgIC8vIHRoZSBjb250ZXh0IGlzIGF0dGFjaGVkIHRvLCBhbmQgZGlzcG9zZSB0aGUgY29tcHV0ZWQgd2hlbiBhbGwgb2YgdGhvc2Ugbm9kZXMgaGF2ZSBiZWVuIGNsZWFuZWQuXG5cbiAgICAgICAgICAgIC8vIEFkZCBwcm9wZXJ0aWVzIHRvICpzdWJzY3JpYmFibGUqIGluc3RlYWQgb2YgKnNlbGYqIGJlY2F1c2UgYW55IHByb3BlcnRpZXMgYWRkZWQgdG8gKnNlbGYqIG1heSBiZSBvdmVyd3JpdHRlbiBvbiB1cGRhdGVzXG4gICAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgICAgc3Vic2NyaWJhYmxlLl9hZGROb2RlID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgICAgICAga28udXRpbHMuZG9tTm9kZURpc3Bvc2FsLmFkZERpc3Bvc2VDYWxsYmFjayhub2RlLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5UmVtb3ZlSXRlbShub2Rlcywgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpYmFibGUuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fc3Vic2NyaWJhYmxlID0gc3Vic2NyaWJhYmxlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRXh0ZW5kIHRoZSBiaW5kaW5nIGNvbnRleHQgaGllcmFyY2h5IHdpdGggYSBuZXcgdmlldyBtb2RlbCBvYmplY3QuIElmIHRoZSBwYXJlbnQgY29udGV4dCBpcyB3YXRjaGluZ1xuICAgIC8vIGFueSBvYnNldmFibGVzLCB0aGUgbmV3IGNoaWxkIGNvbnRleHQgd2lsbCBhdXRvbWF0aWNhbGx5IGdldCBhIGRlcGVuZGVuY3kgb24gdGhlIHBhcmVudCBjb250ZXh0LlxuICAgIC8vIEJ1dCB0aGlzIGRvZXMgbm90IG1lYW4gdGhhdCB0aGUgJGRhdGEgdmFsdWUgb2YgdGhlIGNoaWxkIGNvbnRleHQgd2lsbCBhbHNvIGdldCB1cGRhdGVkLiBJZiB0aGUgY2hpbGRcbiAgICAvLyB2aWV3IG1vZGVsIGFsc28gZGVwZW5kcyBvbiB0aGUgcGFyZW50IHZpZXcgbW9kZWwsIHlvdSBtdXN0IHByb3ZpZGUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNvcnJlY3RcbiAgICAvLyB2aWV3IG1vZGVsIG9uIGVhY2ggdXBkYXRlLlxuICAgIGtvLmJpbmRpbmdDb250ZXh0LnByb3RvdHlwZVsnY3JlYXRlQ2hpbGRDb250ZXh0J10gPSBmdW5jdGlvbiAoZGF0YUl0ZW1PckFjY2Vzc29yLCBkYXRhSXRlbUFsaWFzLCBleHRlbmRDYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gbmV3IGtvLmJpbmRpbmdDb250ZXh0KGRhdGFJdGVtT3JBY2Nlc3NvciwgdGhpcywgZGF0YUl0ZW1BbGlhcywgZnVuY3Rpb24oc2VsZiwgcGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgLy8gRXh0ZW5kIHRoZSBjb250ZXh0IGhpZXJhcmNoeSBieSBzZXR0aW5nIHRoZSBhcHByb3ByaWF0ZSBwb2ludGVyc1xuICAgICAgICAgICAgc2VsZlsnJHBhcmVudENvbnRleHQnXSA9IHBhcmVudENvbnRleHQ7XG4gICAgICAgICAgICBzZWxmWyckcGFyZW50J10gPSBwYXJlbnRDb250ZXh0WyckZGF0YSddO1xuICAgICAgICAgICAgc2VsZlsnJHBhcmVudHMnXSA9IChwYXJlbnRDb250ZXh0WyckcGFyZW50cyddIHx8IFtdKS5zbGljZSgwKTtcbiAgICAgICAgICAgIHNlbGZbJyRwYXJlbnRzJ10udW5zaGlmdChzZWxmWyckcGFyZW50J10pO1xuICAgICAgICAgICAgaWYgKGV4dGVuZENhbGxiYWNrKVxuICAgICAgICAgICAgICAgIGV4dGVuZENhbGxiYWNrKHNlbGYpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gRXh0ZW5kIHRoZSBiaW5kaW5nIGNvbnRleHQgd2l0aCBuZXcgY3VzdG9tIHByb3BlcnRpZXMuIFRoaXMgZG9lc24ndCBjaGFuZ2UgdGhlIGNvbnRleHQgaGllcmFyY2h5LlxuICAgIC8vIFNpbWlsYXJseSB0byBcImNoaWxkXCIgY29udGV4dHMsIHByb3ZpZGUgYSBmdW5jdGlvbiBoZXJlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBjb3JyZWN0IHZhbHVlcyBhcmUgc2V0XG4gICAgLy8gd2hlbiBhbiBvYnNlcnZhYmxlIHZpZXcgbW9kZWwgaXMgdXBkYXRlZC5cbiAgICBrby5iaW5kaW5nQ29udGV4dC5wcm90b3R5cGVbJ2V4dGVuZCddID0gZnVuY3Rpb24ocHJvcGVydGllcykge1xuICAgICAgICAvLyBJZiB0aGUgcGFyZW50IGNvbnRleHQgcmVmZXJlbmNlcyBhbiBvYnNlcnZhYmxlIHZpZXcgbW9kZWwsIFwiX3N1YnNjcmliYWJsZVwiIHdpbGwgYWx3YXlzIGJlIHRoZVxuICAgICAgICAvLyBsYXRlc3QgdmlldyBtb2RlbCBvYmplY3QuIElmIG5vdCwgXCJfc3Vic2NyaWJhYmxlXCIgaXNuJ3Qgc2V0LCBhbmQgd2UgY2FuIHVzZSB0aGUgc3RhdGljIFwiJGRhdGFcIiB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIG5ldyBrby5iaW5kaW5nQ29udGV4dCh0aGlzLl9zdWJzY3JpYmFibGUgfHwgdGhpc1snJGRhdGEnXSwgdGhpcywgbnVsbCwgZnVuY3Rpb24oc2VsZiwgcGFyZW50Q29udGV4dCkge1xuICAgICAgICAgICAgLy8gVGhpcyBcImNoaWxkXCIgY29udGV4dCBkb2Vzbid0IGRpcmVjdGx5IHRyYWNrIGEgcGFyZW50IG9ic2VydmFibGUgdmlldyBtb2RlbCxcbiAgICAgICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gbWFudWFsbHkgc2V0IHRoZSAkcmF3RGF0YSB2YWx1ZSB0byBtYXRjaCB0aGUgcGFyZW50LlxuICAgICAgICAgICAgc2VsZlsnJHJhd0RhdGEnXSA9IHBhcmVudENvbnRleHRbJyRyYXdEYXRhJ107XG4gICAgICAgICAgICBrby51dGlscy5leHRlbmQoc2VsZiwgdHlwZW9mKHByb3BlcnRpZXMpID09IFwiZnVuY3Rpb25cIiA/IHByb3BlcnRpZXMoKSA6IHByb3BlcnRpZXMpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJucyB0aGUgdmFsdWVBY2Nlc29yIGZ1bmN0aW9uIGZvciBhIGJpbmRpbmcgdmFsdWVcbiAgICBmdW5jdGlvbiBtYWtlVmFsdWVBY2Nlc3Nvcih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYSB2YWx1ZUFjY2Vzc29yIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlQWNjZXNzb3IoKTtcbiAgICB9XG5cbiAgICAvLyBHaXZlbiBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBiaW5kaW5ncywgY3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgb2JqZWN0IHRoYXQgY29udGFpbnNcbiAgICAvLyBiaW5kaW5nIHZhbHVlLWFjY2Vzc29ycyBmdW5jdGlvbnMuIEVhY2ggYWNjZXNzb3IgZnVuY3Rpb24gY2FsbHMgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uXG4gICAgLy8gc28gdGhhdCBpdCBhbHdheXMgZ2V0cyB0aGUgbGF0ZXN0IHZhbHVlIGFuZCBhbGwgZGVwZW5kZW5jaWVzIGFyZSBjYXB0dXJlZC4gVGhpcyBpcyB1c2VkXG4gICAgLy8gYnkga28uYXBwbHlCaW5kaW5nc1RvTm9kZSBhbmQgZ2V0QmluZGluZ3NBbmRNYWtlQWNjZXNzb3JzLlxuICAgIGZ1bmN0aW9uIG1ha2VBY2Nlc3NvcnNGcm9tRnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm9iamVjdE1hcChrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShjYWxsYmFjayksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKVtrZXldO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gR2l2ZW4gYSBiaW5kaW5ncyBmdW5jdGlvbiBvciBvYmplY3QsIGNyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IG9iamVjdCB0aGF0IGNvbnRhaW5zXG4gICAgLy8gYmluZGluZyB2YWx1ZS1hY2Nlc3NvcnMgZnVuY3Rpb25zLiBUaGlzIGlzIHVzZWQgYnkga28uYXBwbHlCaW5kaW5nc1RvTm9kZS5cbiAgICBmdW5jdGlvbiBtYWtlQmluZGluZ0FjY2Vzc29ycyhiaW5kaW5ncywgY29udGV4dCwgbm9kZSkge1xuICAgICAgICBpZiAodHlwZW9mIGJpbmRpbmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFrZUFjY2Vzc29yc0Zyb21GdW5jdGlvbihiaW5kaW5ncy5iaW5kKG51bGwsIGNvbnRleHQsIG5vZGUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5vYmplY3RNYXAoYmluZGluZ3MsIG1ha2VWYWx1ZUFjY2Vzc29yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpZiB0aGUgYmluZGluZyBwcm92aWRlciBkb2Vzbid0IGluY2x1ZGUgYSBnZXRCaW5kaW5nQWNjZXNzb3JzIGZ1bmN0aW9uLlxuICAgIC8vIEl0IG11c3QgYmUgY2FsbGVkIHdpdGggJ3RoaXMnIHNldCB0byB0aGUgcHJvdmlkZXIgaW5zdGFuY2UuXG4gICAgZnVuY3Rpb24gZ2V0QmluZGluZ3NBbmRNYWtlQWNjZXNzb3JzKG5vZGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIG1ha2VBY2Nlc3NvcnNGcm9tRnVuY3Rpb24odGhpc1snZ2V0QmluZGluZ3MnXS5iaW5kKHRoaXMsIG5vZGUsIGNvbnRleHQpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZVRoYXRCaW5kaW5nSXNBbGxvd2VkRm9yVmlydHVhbEVsZW1lbnRzKGJpbmRpbmdOYW1lKSB7XG4gICAgICAgIHZhciB2YWxpZGF0b3IgPSBrby52aXJ0dWFsRWxlbWVudHMuYWxsb3dlZEJpbmRpbmdzW2JpbmRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCF2YWxpZGF0b3IpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYmluZGluZyAnXCIgKyBiaW5kaW5nTmFtZSArIFwiJyBjYW5ub3QgYmUgdXNlZCB3aXRoIHZpcnR1YWwgZWxlbWVudHNcIilcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsIChiaW5kaW5nQ29udGV4dCwgZWxlbWVudE9yVmlydHVhbEVsZW1lbnQsIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KSB7XG4gICAgICAgIHZhciBjdXJyZW50Q2hpbGQsXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGVsZW1lbnRPclZpcnR1YWxFbGVtZW50KSxcbiAgICAgICAgICAgIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgcHJlcHJvY2Vzc05vZGUgPSBwcm92aWRlclsncHJlcHJvY2Vzc05vZGUnXTtcblxuICAgICAgICAvLyBQcmVwcm9jZXNzaW5nIGFsbG93cyBhIGJpbmRpbmcgcHJvdmlkZXIgdG8gbXV0YXRlIGEgbm9kZSBiZWZvcmUgYmluZGluZ3MgYXJlIGFwcGxpZWQgdG8gaXQuIEZvciBleGFtcGxlIGl0J3NcbiAgICAgICAgLy8gcG9zc2libGUgdG8gaW5zZXJ0IG5ldyBzaWJsaW5ncyBhZnRlciBpdCwgYW5kL29yIHJlcGxhY2UgdGhlIG5vZGUgd2l0aCBhIGRpZmZlcmVudCBvbmUuIFRoaXMgY2FuIGJlIHVzZWQgdG9cbiAgICAgICAgLy8gaW1wbGVtZW50IGN1c3RvbSBiaW5kaW5nIHN5bnRheGVzLCBzdWNoIGFzIHt7IHZhbHVlIH19IGZvciBzdHJpbmcgaW50ZXJwb2xhdGlvbiwgb3IgY3VzdG9tIGVsZW1lbnQgdHlwZXMgdGhhdFxuICAgICAgICAvLyB0cmlnZ2VyIGluc2VydGlvbiBvZiA8dGVtcGxhdGU+IGNvbnRlbnRzIGF0IHRoYXQgcG9pbnQgaW4gdGhlIGRvY3VtZW50LlxuICAgICAgICBpZiAocHJlcHJvY2Vzc05vZGUpIHtcbiAgICAgICAgICAgIHdoaWxlIChjdXJyZW50Q2hpbGQgPSBuZXh0SW5RdWV1ZSkge1xuICAgICAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGN1cnJlbnRDaGlsZCk7XG4gICAgICAgICAgICAgICAgcHJlcHJvY2Vzc05vZGUuY2FsbChwcm92aWRlciwgY3VycmVudENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFJlc2V0IG5leHRJblF1ZXVlIGZvciB0aGUgbmV4dCBsb29wXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5maXJzdENoaWxkKGVsZW1lbnRPclZpcnR1YWxFbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChjdXJyZW50Q2hpbGQgPSBuZXh0SW5RdWV1ZSkge1xuICAgICAgICAgICAgLy8gS2VlcCBhIHJlY29yZCBvZiB0aGUgbmV4dCBjaGlsZCAqYmVmb3JlKiBhcHBseWluZyBiaW5kaW5ncywgaW4gY2FzZSB0aGUgYmluZGluZyByZW1vdmVzIHRoZSBjdXJyZW50IGNoaWxkIGZyb20gaXRzIHBvc2l0aW9uXG4gICAgICAgICAgICBuZXh0SW5RdWV1ZSA9IGtvLnZpcnR1YWxFbGVtZW50cy5uZXh0U2libGluZyhjdXJyZW50Q2hpbGQpO1xuICAgICAgICAgICAgYXBwbHlCaW5kaW5nc1RvTm9kZUFuZERlc2NlbmRhbnRzSW50ZXJuYWwoYmluZGluZ0NvbnRleHQsIGN1cnJlbnRDaGlsZCwgYmluZGluZ0NvbnRleHRzTWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHlCaW5kaW5nc1RvTm9kZUFuZERlc2NlbmRhbnRzSW50ZXJuYWwgKGJpbmRpbmdDb250ZXh0LCBub2RlVmVyaWZpZWQsIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgdmFyIHNob3VsZEJpbmREZXNjZW5kYW50cyA9IHRydWU7XG5cbiAgICAgICAgLy8gUGVyZiBvcHRpbWlzYXRpb246IEFwcGx5IGJpbmRpbmdzIG9ubHkgaWYuLi5cbiAgICAgICAgLy8gKDEpIFdlIG5lZWQgdG8gc3RvcmUgdGhlIGJpbmRpbmcgY29udGV4dCBvbiB0aGlzIG5vZGUgKGJlY2F1c2UgaXQgbWF5IGRpZmZlciBmcm9tIHRoZSBET00gcGFyZW50IG5vZGUncyBiaW5kaW5nIGNvbnRleHQpXG4gICAgICAgIC8vICAgICBOb3RlIHRoYXQgd2UgY2FuJ3Qgc3RvcmUgYmluZGluZyBjb250ZXh0cyBvbiBub24tZWxlbWVudHMgKGUuZy4sIHRleHQgbm9kZXMpLCBhcyBJRSBkb2Vzbid0IGFsbG93IGV4cGFuZG8gcHJvcGVydGllcyBmb3IgdGhvc2VcbiAgICAgICAgLy8gKDIpIEl0IG1pZ2h0IGhhdmUgYmluZGluZ3MgKGUuZy4sIGl0IGhhcyBhIGRhdGEtYmluZCBhdHRyaWJ1dGUsIG9yIGl0J3MgYSBtYXJrZXIgZm9yIGEgY29udGFpbmVybGVzcyB0ZW1wbGF0ZSlcbiAgICAgICAgdmFyIGlzRWxlbWVudCA9IChub2RlVmVyaWZpZWQubm9kZVR5cGUgPT09IDEpO1xuICAgICAgICBpZiAoaXNFbGVtZW50KSAvLyBXb3JrYXJvdW5kIElFIDw9IDggSFRNTCBwYXJzaW5nIHdlaXJkbmVzc1xuICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLm5vcm1hbGlzZVZpcnR1YWxFbGVtZW50RG9tU3RydWN0dXJlKG5vZGVWZXJpZmllZCk7XG5cbiAgICAgICAgdmFyIHNob3VsZEFwcGx5QmluZGluZ3MgPSAoaXNFbGVtZW50ICYmIGJpbmRpbmdDb250ZXh0TWF5RGlmZmVyRnJvbURvbVBhcmVudEVsZW1lbnQpICAgICAgICAgICAgIC8vIENhc2UgKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddWydub2RlSGFzQmluZGluZ3MnXShub2RlVmVyaWZpZWQpOyAgICAgICAvLyBDYXNlICgyKVxuICAgICAgICBpZiAoc2hvdWxkQXBwbHlCaW5kaW5ncylcbiAgICAgICAgICAgIHNob3VsZEJpbmREZXNjZW5kYW50cyA9IGFwcGx5QmluZGluZ3NUb05vZGVJbnRlcm5hbChub2RlVmVyaWZpZWQsIG51bGwsIGJpbmRpbmdDb250ZXh0LCBiaW5kaW5nQ29udGV4dE1heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KVsnc2hvdWxkQmluZERlc2NlbmRhbnRzJ107XG5cbiAgICAgICAgaWYgKHNob3VsZEJpbmREZXNjZW5kYW50cyAmJiAhYmluZGluZ0RvZXNOb3RSZWN1cnNlSW50b0VsZW1lbnRUeXBlc1trby51dGlscy50YWdOYW1lTG93ZXIobm9kZVZlcmlmaWVkKV0pIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIHJlY3Vyc2luZyBhdXRvbWF0aWNhbGx5IGludG8gKHJlYWwgb3IgdmlydHVhbCkgY2hpbGQgbm9kZXMgd2l0aG91dCBjaGFuZ2luZyBiaW5kaW5nIGNvbnRleHRzLiBTbyxcbiAgICAgICAgICAgIC8vICAqIEZvciBjaGlsZHJlbiBvZiBhICpyZWFsKiBlbGVtZW50LCB0aGUgYmluZGluZyBjb250ZXh0IGlzIGNlcnRhaW5seSB0aGUgc2FtZSBhcyBvbiB0aGVpciBET00gLnBhcmVudE5vZGUsXG4gICAgICAgICAgICAvLyAgICBoZW5jZSBiaW5kaW5nQ29udGV4dHNNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCBpcyBmYWxzZVxuICAgICAgICAgICAgLy8gICogRm9yIGNoaWxkcmVuIG9mIGEgKnZpcnR1YWwqIGVsZW1lbnQsIHdlIGNhbid0IGJlIHN1cmUuIEV2YWx1YXRpbmcgLnBhcmVudE5vZGUgb24gdGhvc2UgY2hpbGRyZW4gbWF5XG4gICAgICAgICAgICAvLyAgICBza2lwIG92ZXIgYW55IG51bWJlciBvZiBpbnRlcm1lZGlhdGUgdmlydHVhbCBlbGVtZW50cywgYW55IG9mIHdoaWNoIG1pZ2h0IGRlZmluZSBhIGN1c3RvbSBiaW5kaW5nIGNvbnRleHQsXG4gICAgICAgICAgICAvLyAgICBoZW5jZSBiaW5kaW5nQ29udGV4dHNNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCBpcyB0cnVlXG4gICAgICAgICAgICBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsKGJpbmRpbmdDb250ZXh0LCBub2RlVmVyaWZpZWQsIC8qIGJpbmRpbmdDb250ZXh0c01heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50OiAqLyAhaXNFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBib3VuZEVsZW1lbnREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG5cblxuICAgIGZ1bmN0aW9uIHRvcG9sb2dpY2FsU29ydEJpbmRpbmdzKGJpbmRpbmdzKSB7XG4gICAgICAgIC8vIERlcHRoLWZpcnN0IHNvcnRcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCAgICAgICAgICAgICAgICAvLyBUaGUgbGlzdCBvZiBrZXkvaGFuZGxlciBwYWlycyB0aGF0IHdlIHdpbGwgcmV0dXJuXG4gICAgICAgICAgICBiaW5kaW5nc0NvbnNpZGVyZWQgPSB7fSwgICAgLy8gQSB0ZW1wb3JhcnkgcmVjb3JkIG9mIHdoaWNoIGJpbmRpbmdzIGFyZSBhbHJlYWR5IGluICdyZXN1bHQnXG4gICAgICAgICAgICBjeWNsaWNEZXBlbmRlbmN5U3RhY2sgPSBbXTsgLy8gS2VlcHMgdHJhY2sgb2YgYSBkZXB0aC1zZWFyY2ggc28gdGhhdCwgaWYgdGhlcmUncyBhIGN5Y2xlLCB3ZSBrbm93IHdoaWNoIGJpbmRpbmdzIGNhdXNlZCBpdFxuICAgICAgICBrby51dGlscy5vYmplY3RGb3JFYWNoKGJpbmRpbmdzLCBmdW5jdGlvbiBwdXNoQmluZGluZyhiaW5kaW5nS2V5KSB7XG4gICAgICAgICAgICBpZiAoIWJpbmRpbmdzQ29uc2lkZXJlZFtiaW5kaW5nS2V5XSkge1xuICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nID0ga29bJ2dldEJpbmRpbmdIYW5kbGVyJ10oYmluZGluZ0tleSk7XG4gICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QgYWRkIGRlcGVuZGVuY2llcyAoaWYgYW55KSBvZiB0aGUgY3VycmVudCBiaW5kaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nWydhZnRlciddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjeWNsaWNEZXBlbmRlbmN5U3RhY2sucHVzaChiaW5kaW5nS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChiaW5kaW5nWydhZnRlciddLCBmdW5jdGlvbihiaW5kaW5nRGVwZW5kZW5jeUtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nc1tiaW5kaW5nRGVwZW5kZW5jeUtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtvLnV0aWxzLmFycmF5SW5kZXhPZihjeWNsaWNEZXBlbmRlbmN5U3RhY2ssIGJpbmRpbmdEZXBlbmRlbmN5S2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiQ2Fubm90IGNvbWJpbmUgdGhlIGZvbGxvd2luZyBiaW5kaW5ncywgYmVjYXVzZSB0aGV5IGhhdmUgYSBjeWNsaWMgZGVwZW5kZW5jeTogXCIgKyBjeWNsaWNEZXBlbmRlbmN5U3RhY2suam9pbihcIiwgXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hCaW5kaW5nKGJpbmRpbmdEZXBlbmRlbmN5S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3ljbGljRGVwZW5kZW5jeVN0YWNrLmxlbmd0aC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE5leHQgYWRkIHRoZSBjdXJyZW50IGJpbmRpbmdcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goeyBrZXk6IGJpbmRpbmdLZXksIGhhbmRsZXI6IGJpbmRpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJpbmRpbmdzQ29uc2lkZXJlZFtiaW5kaW5nS2V5XSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHlCaW5kaW5nc1RvTm9kZUludGVybmFsKG5vZGUsIHNvdXJjZUJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dCwgYmluZGluZ0NvbnRleHRNYXlEaWZmZXJGcm9tRG9tUGFyZW50RWxlbWVudCkge1xuICAgICAgICAvLyBQcmV2ZW50IG11bHRpcGxlIGFwcGx5QmluZGluZ3MgY2FsbHMgZm9yIHRoZSBzYW1lIG5vZGUsIGV4Y2VwdCB3aGVuIGEgYmluZGluZyB2YWx1ZSBpcyBzcGVjaWZpZWRcbiAgICAgICAgdmFyIGFscmVhZHlCb3VuZCA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KG5vZGUsIGJvdW5kRWxlbWVudERvbURhdGFLZXkpO1xuICAgICAgICBpZiAoIXNvdXJjZUJpbmRpbmdzKSB7XG4gICAgICAgICAgICBpZiAoYWxyZWFkeUJvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJZb3UgY2Fubm90IGFwcGx5IGJpbmRpbmdzIG11bHRpcGxlIHRpbWVzIHRvIHRoZSBzYW1lIGVsZW1lbnQuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQobm9kZSwgYm91bmRFbGVtZW50RG9tRGF0YUtleSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IERvbid0IHN0b3JlIHRoZSBiaW5kaW5nIGNvbnRleHQgb24gdGhpcyBub2RlIGlmIGl0J3MgZGVmaW5pdGVseSB0aGUgc2FtZSBhcyBvbiBub2RlLnBhcmVudE5vZGUsIGJlY2F1c2VcbiAgICAgICAgLy8gd2UgY2FuIGVhc2lseSByZWNvdmVyIGl0IGp1c3QgYnkgc2Nhbm5pbmcgdXAgdGhlIG5vZGUncyBhbmNlc3RvcnMgaW4gdGhlIERPTVxuICAgICAgICAvLyAobm90ZTogaGVyZSwgcGFyZW50IG5vZGUgbWVhbnMgXCJyZWFsIERPTSBwYXJlbnRcIiBub3QgXCJ2aXJ0dWFsIHBhcmVudFwiLCBhcyB0aGVyZSdzIG5vIE8oMSkgd2F5IHRvIGZpbmQgdGhlIHZpcnR1YWwgcGFyZW50KVxuICAgICAgICBpZiAoIWFscmVhZHlCb3VuZCAmJiBiaW5kaW5nQ29udGV4dE1heURpZmZlckZyb21Eb21QYXJlbnRFbGVtZW50KVxuICAgICAgICAgICAga28uc3RvcmVkQmluZGluZ0NvbnRleHRGb3JOb2RlKG5vZGUsIGJpbmRpbmdDb250ZXh0KTtcblxuICAgICAgICAvLyBVc2UgYmluZGluZ3MgaWYgZ2l2ZW4sIG90aGVyd2lzZSBmYWxsIGJhY2sgb24gYXNraW5nIHRoZSBiaW5kaW5ncyBwcm92aWRlciB0byBnaXZlIHVzIHNvbWUgYmluZGluZ3NcbiAgICAgICAgdmFyIGJpbmRpbmdzO1xuICAgICAgICBpZiAoc291cmNlQmluZGluZ3MgJiYgdHlwZW9mIHNvdXJjZUJpbmRpbmdzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBiaW5kaW5ncyA9IHNvdXJjZUJpbmRpbmdzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgICAgIGdldEJpbmRpbmdzID0gcHJvdmlkZXJbJ2dldEJpbmRpbmdBY2Nlc3NvcnMnXSB8fCBnZXRCaW5kaW5nc0FuZE1ha2VBY2Nlc3NvcnM7XG5cbiAgICAgICAgICAgIC8vIEdldCB0aGUgYmluZGluZyBmcm9tIHRoZSBwcm92aWRlciB3aXRoaW4gYSBjb21wdXRlZCBvYnNlcnZhYmxlIHNvIHRoYXQgd2UgY2FuIHVwZGF0ZSB0aGUgYmluZGluZ3Mgd2hlbmV2ZXJcbiAgICAgICAgICAgIC8vIHRoZSBiaW5kaW5nIGNvbnRleHQgaXMgdXBkYXRlZCBvciBpZiB0aGUgYmluZGluZyBwcm92aWRlciBhY2Nlc3NlcyBvYnNlcnZhYmxlcy5cbiAgICAgICAgICAgIHZhciBiaW5kaW5nc1VwZGF0ZXIgPSBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5ncyA9IHNvdXJjZUJpbmRpbmdzID8gc291cmNlQmluZGluZ3MoYmluZGluZ0NvbnRleHQsIG5vZGUpIDogZ2V0QmluZGluZ3MuY2FsbChwcm92aWRlciwgbm9kZSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWdpc3RlciBhIGRlcGVuZGVuY3kgb24gdGhlIGJpbmRpbmcgY29udGV4dCB0byBzdXBwb3J0IG9ic2V2YWJsZSB2aWV3IG1vZGVscy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJpbmRpbmdzICYmIGJpbmRpbmdDb250ZXh0Ll9zdWJzY3JpYmFibGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nQ29udGV4dC5fc3Vic2NyaWJhYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5ncztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBub2RlIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICghYmluZGluZ3MgfHwgIWJpbmRpbmdzVXBkYXRlci5pc0FjdGl2ZSgpKVxuICAgICAgICAgICAgICAgIGJpbmRpbmdzVXBkYXRlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3M7XG4gICAgICAgIGlmIChiaW5kaW5ncykge1xuICAgICAgICAgICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBhY2Nlc3NvciBmb3IgYSBnaXZlbiBiaW5kaW5nLiBXaGVuIGJpbmRpbmdzIGFyZSBzdGF0aWMgKHdvbid0IGJlIHVwZGF0ZWQgYmVjYXVzZSBvZiBhIGJpbmRpbmdcbiAgICAgICAgICAgIC8vIGNvbnRleHQgdXBkYXRlKSwganVzdCByZXR1cm4gdGhlIHZhbHVlIGFjY2Vzc29yIGZyb20gdGhlIGJpbmRpbmcuIE90aGVyd2lzZSwgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBhbHdheXMgZ2V0c1xuICAgICAgICAgICAgLy8gdGhlIGxhdGVzdCBiaW5kaW5nIHZhbHVlIGFuZCByZWdpc3RlcnMgYSBkZXBlbmRlbmN5IG9uIHRoZSBiaW5kaW5nIHVwZGF0ZXIuXG4gICAgICAgICAgICB2YXIgZ2V0VmFsdWVBY2Nlc3NvciA9IGJpbmRpbmdzVXBkYXRlclxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24oYmluZGluZ0tleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKGJpbmRpbmdzVXBkYXRlcigpW2JpbmRpbmdLZXldKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IDogZnVuY3Rpb24oYmluZGluZ0tleSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmluZGluZ3NbYmluZGluZ0tleV07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gVXNlIG9mIGFsbEJpbmRpbmdzIGFzIGEgZnVuY3Rpb24gaXMgbWFpbnRhaW5lZCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIGJ1dCBpdHMgdXNlIGlzIGRlcHJlY2F0ZWRcbiAgICAgICAgICAgIGZ1bmN0aW9uIGFsbEJpbmRpbmdzKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrby51dGlscy5vYmplY3RNYXAoYmluZGluZ3NVcGRhdGVyID8gYmluZGluZ3NVcGRhdGVyKCkgOiBiaW5kaW5ncywgZXZhbHVhdGVWYWx1ZUFjY2Vzc29yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgaXMgdGhlIDMueCBhbGxCaW5kaW5ncyBBUElcbiAgICAgICAgICAgIGFsbEJpbmRpbmdzWydnZXQnXSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBiaW5kaW5nc1trZXldICYmIGV2YWx1YXRlVmFsdWVBY2Nlc3NvcihnZXRWYWx1ZUFjY2Vzc29yKGtleSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFsbEJpbmRpbmdzWydoYXMnXSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXkgaW4gYmluZGluZ3M7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBGaXJzdCBwdXQgdGhlIGJpbmRpbmdzIGludG8gdGhlIHJpZ2h0IG9yZGVyXG4gICAgICAgICAgICB2YXIgb3JkZXJlZEJpbmRpbmdzID0gdG9wb2xvZ2ljYWxTb3J0QmluZGluZ3MoYmluZGluZ3MpO1xuXG4gICAgICAgICAgICAvLyBHbyB0aHJvdWdoIHRoZSBzb3J0ZWQgYmluZGluZ3MsIGNhbGxpbmcgaW5pdCBhbmQgdXBkYXRlIGZvciBlYWNoXG4gICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2gob3JkZXJlZEJpbmRpbmdzLCBmdW5jdGlvbihiaW5kaW5nS2V5QW5kSGFuZGxlcikge1xuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB0b3BvbG9naWNhbFNvcnRCaW5kaW5ncyBoYXMgYWxyZWFkeSBmaWx0ZXJlZCBvdXQgYW55IG5vbmV4aXN0ZW50IGJpbmRpbmcgaGFuZGxlcnMsXG4gICAgICAgICAgICAgICAgLy8gc28gYmluZGluZ0tleUFuZEhhbmRsZXIuaGFuZGxlciB3aWxsIGFsd2F5cyBiZSBub25udWxsLlxuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVySW5pdEZuID0gYmluZGluZ0tleUFuZEhhbmRsZXIuaGFuZGxlcltcImluaXRcIl0sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJVcGRhdGVGbiA9IGJpbmRpbmdLZXlBbmRIYW5kbGVyLmhhbmRsZXJbXCJ1cGRhdGVcIl0sXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdLZXkgPSBiaW5kaW5nS2V5QW5kSGFuZGxlci5rZXk7XG5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZVRoYXRCaW5kaW5nSXNBbGxvd2VkRm9yVmlydHVhbEVsZW1lbnRzKGJpbmRpbmdLZXkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJ1biBpbml0LCBpZ25vcmluZyBhbnkgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaGFuZGxlckluaXRGbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbml0UmVzdWx0ID0gaGFuZGxlckluaXRGbihub2RlLCBnZXRWYWx1ZUFjY2Vzc29yKGJpbmRpbmdLZXkpLCBhbGxCaW5kaW5ncywgYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgYmluZGluZyBoYW5kbGVyIGNsYWltcyB0byBjb250cm9sIGRlc2NlbmRhbnQgYmluZGluZ3MsIG1ha2UgYSBub3RlIG9mIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdFJlc3VsdCAmJiBpbml0UmVzdWx0Wydjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgYmluZGluZ3MgKFwiICsgYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MgKyBcIiBhbmQgXCIgKyBiaW5kaW5nS2V5ICsgXCIpIGFyZSB0cnlpbmcgdG8gY29udHJvbCBkZXNjZW5kYW50IGJpbmRpbmdzIG9mIHRoZSBzYW1lIGVsZW1lbnQuIFlvdSBjYW5ub3QgdXNlIHRoZXNlIGJpbmRpbmdzIHRvZ2V0aGVyIG9uIHRoZSBzYW1lIGVsZW1lbnQuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5kaW5nSGFuZGxlclRoYXRDb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyA9IGJpbmRpbmdLZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBSdW4gdXBkYXRlIGluIGl0cyBvd24gY29tcHV0ZWQgd3JhcHBlclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXJVcGRhdGVGbiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVudE9ic2VydmFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJVcGRhdGVGbihub2RlLCBnZXRWYWx1ZUFjY2Vzc29yKGJpbmRpbmdLZXkpLCBhbGxCaW5kaW5ncywgYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IG5vZGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV4Lm1lc3NhZ2UgPSBcIlVuYWJsZSB0byBwcm9jZXNzIGJpbmRpbmcgXFxcIlwiICsgYmluZGluZ0tleSArIFwiOiBcIiArIGJpbmRpbmdzW2JpbmRpbmdLZXldICsgXCJcXFwiXFxuTWVzc2FnZTogXCIgKyBleC5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnc2hvdWxkQmluZERlc2NlbmRhbnRzJzogYmluZGluZ0hhbmRsZXJUaGF0Q29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MgPT09IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICB2YXIgc3RvcmVkQmluZGluZ0NvbnRleHREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG4gICAga28uc3RvcmVkQmluZGluZ0NvbnRleHRGb3JOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KG5vZGUsIHN0b3JlZEJpbmRpbmdDb250ZXh0RG9tRGF0YUtleSwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGJpbmRpbmdDb250ZXh0Ll9zdWJzY3JpYmFibGUpXG4gICAgICAgICAgICAgICAgYmluZGluZ0NvbnRleHQuX3N1YnNjcmliYWJsZS5fYWRkTm9kZShub2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBrby51dGlscy5kb21EYXRhLmdldChub2RlLCBzdG9yZWRCaW5kaW5nQ29udGV4dERvbURhdGFLZXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCkge1xuICAgICAgICByZXR1cm4gdmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCAmJiAodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCBpbnN0YW5jZW9mIGtvLmJpbmRpbmdDb250ZXh0KVxuICAgICAgICAgICAgPyB2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0XG4gICAgICAgICAgICA6IG5ldyBrby5iaW5kaW5nQ29udGV4dCh2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KTtcbiAgICB9XG5cbiAgICBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUgPSBmdW5jdGlvbiAobm9kZSwgYmluZGluZ3MsIHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIC8vIElmIGl0J3MgYW4gZWxlbWVudCwgd29ya2Fyb3VuZCBJRSA8PSA4IEhUTUwgcGFyc2luZyB3ZWlyZG5lc3NcbiAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5ub3JtYWxpc2VWaXJ0dWFsRWxlbWVudERvbVN0cnVjdHVyZShub2RlKTtcbiAgICAgICAgcmV0dXJuIGFwcGx5QmluZGluZ3NUb05vZGVJbnRlcm5hbChub2RlLCBiaW5kaW5ncywgZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCksIHRydWUpO1xuICAgIH07XG5cbiAgICBrby5hcHBseUJpbmRpbmdzVG9Ob2RlID0gZnVuY3Rpb24gKG5vZGUsIGJpbmRpbmdzLCB2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gZ2V0QmluZGluZ0NvbnRleHQodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCk7XG4gICAgICAgIHJldHVybiBrby5hcHBseUJpbmRpbmdBY2Nlc3NvcnNUb05vZGUobm9kZSwgbWFrZUJpbmRpbmdBY2Nlc3NvcnMoYmluZGluZ3MsIGNvbnRleHQsIG5vZGUpLCBjb250ZXh0KTtcbiAgICB9O1xuXG4gICAga28uYXBwbHlCaW5kaW5nc1RvRGVzY2VuZGFudHMgPSBmdW5jdGlvbih2aWV3TW9kZWxPckJpbmRpbmdDb250ZXh0LCByb290Tm9kZSkge1xuICAgICAgICBpZiAocm9vdE5vZGUubm9kZVR5cGUgPT09IDEgfHwgcm9vdE5vZGUubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICBhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50c0ludGVybmFsKGdldEJpbmRpbmdDb250ZXh0KHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpLCByb290Tm9kZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIGtvLmFwcGx5QmluZGluZ3MgPSBmdW5jdGlvbiAodmlld01vZGVsT3JCaW5kaW5nQ29udGV4dCwgcm9vdE5vZGUpIHtcbiAgICAgICAgLy8gSWYgalF1ZXJ5IGlzIGxvYWRlZCBhZnRlciBLbm9ja291dCwgd2Ugd29uJ3QgaW5pdGlhbGx5IGhhdmUgYWNjZXNzIHRvIGl0LiBTbyBzYXZlIGl0IGhlcmUuXG4gICAgICAgIGlmICghalF1ZXJ5ICYmIHdpbmRvd1snalF1ZXJ5J10pIHtcbiAgICAgICAgICAgIGpRdWVyeSA9IHdpbmRvd1snalF1ZXJ5J107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocm9vdE5vZGUgJiYgKHJvb3ROb2RlLm5vZGVUeXBlICE9PSAxKSAmJiAocm9vdE5vZGUubm9kZVR5cGUgIT09IDgpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwia28uYXBwbHlCaW5kaW5nczogZmlyc3QgcGFyYW1ldGVyIHNob3VsZCBiZSB5b3VyIHZpZXcgbW9kZWw7IHNlY29uZCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgRE9NIG5vZGVcIik7XG4gICAgICAgIHJvb3ROb2RlID0gcm9vdE5vZGUgfHwgd2luZG93LmRvY3VtZW50LmJvZHk7IC8vIE1ha2UgXCJyb290Tm9kZVwiIHBhcmFtZXRlciBvcHRpb25hbFxuXG4gICAgICAgIGFwcGx5QmluZGluZ3NUb05vZGVBbmREZXNjZW5kYW50c0ludGVybmFsKGdldEJpbmRpbmdDb250ZXh0KHZpZXdNb2RlbE9yQmluZGluZ0NvbnRleHQpLCByb290Tm9kZSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIC8vIFJldHJpZXZpbmcgYmluZGluZyBjb250ZXh0IGZyb20gYXJiaXRyYXJ5IG5vZGVzXG4gICAga28uY29udGV4dEZvciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgLy8gV2UgY2FuIG9ubHkgZG8gc29tZXRoaW5nIG1lYW5pbmdmdWwgZm9yIGVsZW1lbnRzIGFuZCBjb21tZW50IG5vZGVzIChpbiBwYXJ0aWN1bGFyLCBub3QgdGV4dCBub2RlcywgYXMgSUUgY2FuJ3Qgc3RvcmUgZG9tZGF0YSBmb3IgdGhlbSlcbiAgICAgICAgc3dpdGNoIChub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBrby5zdG9yZWRCaW5kaW5nQ29udGV4dEZvck5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHQpIHJldHVybiBjb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHJldHVybiBrby5jb250ZXh0Rm9yKG5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIGtvLmRhdGFGb3IgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0ga28uY29udGV4dEZvcihub2RlKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgPyBjb250ZXh0WyckZGF0YSddIDogdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICBrby5leHBvcnRTeW1ib2woJ2JpbmRpbmdIYW5kbGVycycsIGtvLmJpbmRpbmdIYW5kbGVycyk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdhcHBseUJpbmRpbmdzJywga28uYXBwbHlCaW5kaW5ncyk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdhcHBseUJpbmRpbmdzVG9EZXNjZW5kYW50cycsIGtvLmFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ2FwcGx5QmluZGluZ0FjY2Vzc29yc1RvTm9kZScsIGtvLmFwcGx5QmluZGluZ0FjY2Vzc29yc1RvTm9kZSk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdhcHBseUJpbmRpbmdzVG9Ob2RlJywga28uYXBwbHlCaW5kaW5nc1RvTm9kZSk7XG4gICAga28uZXhwb3J0U3ltYm9sKCdjb250ZXh0Rm9yJywga28uY29udGV4dEZvcik7XG4gICAga28uZXhwb3J0U3ltYm9sKCdkYXRhRm9yJywga28uZGF0YUZvcik7XG59KSgpO1xudmFyIGF0dHJIdG1sVG9KYXZhc2NyaXB0TWFwID0geyAnY2xhc3MnOiAnY2xhc3NOYW1lJywgJ2Zvcic6ICdodG1sRm9yJyB9O1xua28uYmluZGluZ0hhbmRsZXJzWydhdHRyJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKSB8fCB7fTtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24oYXR0ck5hbWUsIGF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgYXR0clZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhdHRyVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBUbyBjb3ZlciBjYXNlcyBsaWtlIFwiYXR0cjogeyBjaGVja2VkOnNvbWVQcm9wIH1cIiwgd2Ugd2FudCB0byByZW1vdmUgdGhlIGF0dHJpYnV0ZSBlbnRpcmVseVxuICAgICAgICAgICAgLy8gd2hlbiBzb21lUHJvcCBpcyBhIFwibm8gdmFsdWVcIi1saWtlIHZhbHVlIChzdHJpY3RseSBudWxsLCBmYWxzZSwgb3IgdW5kZWZpbmVkKVxuICAgICAgICAgICAgLy8gKGJlY2F1c2UgdGhlIGFic2VuY2Ugb2YgdGhlIFwiY2hlY2tlZFwiIGF0dHIgaXMgaG93IHRvIG1hcmsgYW4gZWxlbWVudCBhcyBub3QgY2hlY2tlZCwgZXRjLilcbiAgICAgICAgICAgIHZhciB0b1JlbW92ZSA9IChhdHRyVmFsdWUgPT09IGZhbHNlKSB8fCAoYXR0clZhbHVlID09PSBudWxsKSB8fCAoYXR0clZhbHVlID09PSB1bmRlZmluZWQpO1xuICAgICAgICAgICAgaWYgKHRvUmVtb3ZlKVxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcblxuICAgICAgICAgICAgLy8gSW4gSUUgPD0gNyBhbmQgSUU4IFF1aXJrcyBNb2RlLCB5b3UgaGF2ZSB0byB1c2UgdGhlIEphdmFzY3JpcHQgcHJvcGVydHkgbmFtZSBpbnN0ZWFkIG9mIHRoZVxuICAgICAgICAgICAgLy8gSFRNTCBhdHRyaWJ1dGUgbmFtZSBmb3IgY2VydGFpbiBhdHRyaWJ1dGVzLiBJRTggU3RhbmRhcmRzIE1vZGUgc3VwcG9ydHMgdGhlIGNvcnJlY3QgYmVoYXZpb3IsXG4gICAgICAgICAgICAvLyBidXQgaW5zdGVhZCBvZiBmaWd1cmluZyBvdXQgdGhlIG1vZGUsIHdlJ2xsIGp1c3Qgc2V0IHRoZSBhdHRyaWJ1dGUgdGhyb3VnaCB0aGUgSmF2YXNjcmlwdFxuICAgICAgICAgICAgLy8gcHJvcGVydHkgZm9yIElFIDw9IDguXG4gICAgICAgICAgICBpZiAoa28udXRpbHMuaWVWZXJzaW9uIDw9IDggJiYgYXR0ck5hbWUgaW4gYXR0ckh0bWxUb0phdmFzY3JpcHRNYXApIHtcbiAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHJIdG1sVG9KYXZhc2NyaXB0TWFwW2F0dHJOYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRbYXR0ck5hbWVdID0gYXR0clZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdG9SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUcmVhdCBcIm5hbWVcIiBzcGVjaWFsbHkgLSBhbHRob3VnaCB5b3UgY2FuIHRoaW5rIG9mIGl0IGFzIGFuIGF0dHJpYnV0ZSwgaXQgYWxzbyBuZWVkc1xuICAgICAgICAgICAgLy8gc3BlY2lhbCBoYW5kbGluZyBvbiBvbGRlciB2ZXJzaW9ucyBvZiBJRSAoaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L3B1bGwvMzMzKVxuICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGJlaW5nIGNhc2Utc2Vuc2l0aXZlIGhlcmUgYmVjYXVzZSBYSFRNTCB3b3VsZCByZWdhcmQgXCJOYW1lXCIgYXMgYSBkaWZmZXJlbnQgdGhpbmdcbiAgICAgICAgICAgIC8vIGVudGlyZWx5LCBhbmQgdGhlcmUncyBubyBzdHJvbmcgcmVhc29uIHRvIGFsbG93IGZvciBzdWNoIGNhc2luZyBpbiBIVE1MLlxuICAgICAgICAgICAgaWYgKGF0dHJOYW1lID09PSBcIm5hbWVcIikge1xuICAgICAgICAgICAgICAgIGtvLnV0aWxzLnNldEVsZW1lbnROYW1lKGVsZW1lbnQsIHRvUmVtb3ZlID8gXCJcIiA6IGF0dHJWYWx1ZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcbihmdW5jdGlvbigpIHtcblxua28uYmluZGluZ0hhbmRsZXJzWydjaGVja2VkJ10gPSB7XG4gICAgJ2FmdGVyJzogWyd2YWx1ZScsICdhdHRyJ10sXG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tlZFZhbHVlKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFsbEJpbmRpbmdzWydoYXMnXSgnY2hlY2tlZFZhbHVlJylcbiAgICAgICAgICAgICAgICA/IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoYWxsQmluZGluZ3MuZ2V0KCdjaGVja2VkVmFsdWUnKSlcbiAgICAgICAgICAgICAgICA6IGVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVNb2RlbCgpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgdXBkYXRlcyB0aGUgbW9kZWwgdmFsdWUgZnJvbSB0aGUgdmlldyB2YWx1ZS5cbiAgICAgICAgICAgIC8vIEl0IHJ1bnMgaW4gcmVzcG9uc2UgdG8gRE9NIGV2ZW50cyAoY2xpY2spIGFuZCBjaGFuZ2VzIGluIGNoZWNrZWRWYWx1ZS5cbiAgICAgICAgICAgIHZhciBpc0NoZWNrZWQgPSBlbGVtZW50LmNoZWNrZWQsXG4gICAgICAgICAgICAgICAgZWxlbVZhbHVlID0gdXNlQ2hlY2tlZFZhbHVlID8gY2hlY2tlZFZhbHVlKCkgOiBpc0NoZWNrZWQ7XG5cbiAgICAgICAgICAgIC8vIFdoZW4gd2UncmUgZmlyc3Qgc2V0dGluZyB1cCB0aGlzIGNvbXB1dGVkLCBkb24ndCBjaGFuZ2UgYW55IG1vZGVsIHN0YXRlLlxuICAgICAgICAgICAgaWYgKGtvLmNvbXB1dGVkQ29udGV4dC5pc0luaXRpYWwoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2UgY2FuIGlnbm9yZSB1bmNoZWNrZWQgcmFkaW8gYnV0dG9ucywgYmVjYXVzZSBzb21lIG90aGVyIHJhZGlvXG4gICAgICAgICAgICAvLyBidXR0b24gd2lsbCBiZSBnZXR0aW5nIGNoZWNrZWQsIGFuZCB0aGF0IG9uZSBjYW4gdGFrZSBjYXJlIG9mIHVwZGF0aW5nIHN0YXRlLlxuICAgICAgICAgICAgaWYgKGlzUmFkaW8gJiYgIWlzQ2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1vZGVsVmFsdWUgPSBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZSh2YWx1ZUFjY2Vzc29yKTtcbiAgICAgICAgICAgIGlmIChpc1ZhbHVlQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkRWxlbVZhbHVlICE9PSBlbGVtVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2hlbiB3ZSdyZSByZXNwb25kaW5nIHRvIHRoZSBjaGVja2VkVmFsdWUgY2hhbmdpbmcsIGFuZCB0aGUgZWxlbWVudCBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCwgcmVwbGFjZSB0aGUgb2xkIGVsZW0gdmFsdWUgd2l0aCB0aGUgbmV3IGVsZW0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgLy8gaW4gdGhlIG1vZGVsIGFycmF5LlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hZGRPclJlbW92ZUl0ZW0obW9kZWxWYWx1ZSwgZWxlbVZhbHVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFkZE9yUmVtb3ZlSXRlbShtb2RlbFZhbHVlLCBvbGRFbGVtVmFsdWUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9sZEVsZW1WYWx1ZSA9IGVsZW1WYWx1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHdlJ3JlIHJlc3BvbmRpbmcgdG8gdGhlIHVzZXIgaGF2aW5nIGNoZWNrZWQvdW5jaGVja2VkIGEgY2hlY2tib3gsXG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZC9yZW1vdmUgdGhlIGVsZW1lbnQgdmFsdWUgdG8gdGhlIG1vZGVsIGFycmF5LlxuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5hZGRPclJlbW92ZUl0ZW0obW9kZWxWYWx1ZSwgZWxlbVZhbHVlLCBpc0NoZWNrZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga28uZXhwcmVzc2lvblJld3JpdGluZy53cml0ZVZhbHVlVG9Qcm9wZXJ0eShtb2RlbFZhbHVlLCBhbGxCaW5kaW5ncywgJ2NoZWNrZWQnLCBlbGVtVmFsdWUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHVwZGF0ZXMgdGhlIHZpZXcgdmFsdWUgZnJvbSB0aGUgbW9kZWwgdmFsdWUuXG4gICAgICAgICAgICAvLyBJdCBydW5zIGluIHJlc3BvbnNlIHRvIGNoYW5nZXMgaW4gdGhlIGJvdW5kIChjaGVja2VkKSB2YWx1ZS5cbiAgICAgICAgICAgIHZhciBtb2RlbFZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuXG4gICAgICAgICAgICBpZiAoaXNWYWx1ZUFycmF5KSB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiBhIGNoZWNrYm94IGlzIGJvdW5kIHRvIGFuIGFycmF5LCBiZWluZyBjaGVja2VkIHJlcHJlc2VudHMgaXRzIHZhbHVlIGJlaW5nIHByZXNlbnQgaW4gdGhhdCBhcnJheVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IGtvLnV0aWxzLmFycmF5SW5kZXhPZihtb2RlbFZhbHVlLCBjaGVja2VkVmFsdWUoKSkgPj0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNDaGVja2JveCkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gYSBjaGVja2JveCBpcyBib3VuZCB0byBhbnkgb3RoZXIgdmFsdWUgKG5vdCBhbiBhcnJheSksIGJlaW5nIGNoZWNrZWQgcmVwcmVzZW50cyB0aGUgdmFsdWUgYmVpbmcgdHJ1ZWlzaFxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IG1vZGVsVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciByYWRpbyBidXR0b25zLCBiZWluZyBjaGVja2VkIG1lYW5zIHRoYXQgdGhlIHJhZGlvIGJ1dHRvbidzIHZhbHVlIGNvcnJlc3BvbmRzIHRvIHRoZSBtb2RlbCB2YWx1ZVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IChjaGVja2VkVmFsdWUoKSA9PT0gbW9kZWxWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGlzQ2hlY2tib3ggPSBlbGVtZW50LnR5cGUgPT0gXCJjaGVja2JveFwiLFxuICAgICAgICAgICAgaXNSYWRpbyA9IGVsZW1lbnQudHlwZSA9PSBcInJhZGlvXCI7XG5cbiAgICAgICAgLy8gT25seSBiaW5kIHRvIGNoZWNrIGJveGVzIGFuZCByYWRpbyBidXR0b25zXG4gICAgICAgIGlmICghaXNDaGVja2JveCAmJiAhaXNSYWRpbykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGlzVmFsdWVBcnJheSA9IGlzQ2hlY2tib3ggJiYgKGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKSBpbnN0YW5jZW9mIEFycmF5KSxcbiAgICAgICAgICAgIG9sZEVsZW1WYWx1ZSA9IGlzVmFsdWVBcnJheSA/IGNoZWNrZWRWYWx1ZSgpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdXNlQ2hlY2tlZFZhbHVlID0gaXNSYWRpbyB8fCBpc1ZhbHVlQXJyYXk7XG5cbiAgICAgICAgLy8gSUUgNiB3b24ndCBhbGxvdyByYWRpbyBidXR0b25zIHRvIGJlIHNlbGVjdGVkIHVubGVzcyB0aGV5IGhhdmUgYSBuYW1lXG4gICAgICAgIGlmIChpc1JhZGlvICYmICFlbGVtZW50Lm5hbWUpXG4gICAgICAgICAgICBrby5iaW5kaW5nSGFuZGxlcnNbJ3VuaXF1ZU5hbWUnXVsnaW5pdCddKGVsZW1lbnQsIGZ1bmN0aW9uKCkgeyByZXR1cm4gdHJ1ZSB9KTtcblxuICAgICAgICAvLyBTZXQgdXAgdHdvIGNvbXB1dGVkcyB0byB1cGRhdGUgdGhlIGJpbmRpbmc6XG5cbiAgICAgICAgLy8gVGhlIGZpcnN0IHJlc3BvbmRzIHRvIGNoYW5nZXMgaW4gdGhlIGNoZWNrZWRWYWx1ZSB2YWx1ZSBhbmQgdG8gZWxlbWVudCBjbGlja3NcbiAgICAgICAga28uY29tcHV0ZWQodXBkYXRlTW9kZWwsIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtZW50IH0pO1xuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImNsaWNrXCIsIHVwZGF0ZU1vZGVsKTtcblxuICAgICAgICAvLyBUaGUgc2Vjb25kIHJlc3BvbmRzIHRvIGNoYW5nZXMgaW4gdGhlIG1vZGVsIHZhbHVlICh0aGUgb25lIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2hlY2tlZCBiaW5kaW5nKVxuICAgICAgICBrby5jb21wdXRlZCh1cGRhdGVWaWV3LCBudWxsLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogZWxlbWVudCB9KTtcbiAgICB9XG59O1xua28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5nc1snY2hlY2tlZCddID0gdHJ1ZTtcblxua28uYmluZGluZ0hhbmRsZXJzWydjaGVja2VkVmFsdWUnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgZWxlbWVudC52YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICB9XG59O1xuXG59KSgpO3ZhciBjbGFzc2VzV3JpdHRlbkJ5QmluZGluZ0tleSA9ICdfX2tvX19jc3NWYWx1ZSc7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ2NzcyddID0ge1xuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICB2YXIgdmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24oY2xhc3NOYW1lLCBzaG91bGRIYXZlQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRIYXZlQ2xhc3MgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHNob3VsZEhhdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAga28udXRpbHMudG9nZ2xlRG9tTm9kZUNzc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSwgc2hvdWxkSGF2ZUNsYXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUgfHwgJycpOyAvLyBNYWtlIHN1cmUgd2UgZG9uJ3QgdHJ5IHRvIHN0b3JlIG9yIHNldCBhIG5vbi1zdHJpbmcgdmFsdWVcbiAgICAgICAgICAgIGtvLnV0aWxzLnRvZ2dsZURvbU5vZGVDc3NDbGFzcyhlbGVtZW50LCBlbGVtZW50W2NsYXNzZXNXcml0dGVuQnlCaW5kaW5nS2V5XSwgZmFsc2UpO1xuICAgICAgICAgICAgZWxlbWVudFtjbGFzc2VzV3JpdHRlbkJ5QmluZGluZ0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGtvLnV0aWxzLnRvZ2dsZURvbU5vZGVDc3NDbGFzcyhlbGVtZW50LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xua28uYmluZGluZ0hhbmRsZXJzWydlbmFibGUnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICBpZiAodmFsdWUgJiYgZWxlbWVudC5kaXNhYmxlZClcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIGVsc2UgaWYgKCghdmFsdWUpICYmICghZWxlbWVudC5kaXNhYmxlZCkpXG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICB9XG59O1xuXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2Rpc2FibGUnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAga28uYmluZGluZ0hhbmRsZXJzWydlbmFibGUnXVsndXBkYXRlJ10oZWxlbWVudCwgZnVuY3Rpb24oKSB7IHJldHVybiAha28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpIH0pO1xuICAgIH1cbn07XG4vLyBGb3IgY2VydGFpbiBjb21tb24gZXZlbnRzIChjdXJyZW50bHkganVzdCAnY2xpY2snKSwgYWxsb3cgYSBzaW1wbGlmaWVkIGRhdGEtYmluZGluZyBzeW50YXhcbi8vIGUuZy4gY2xpY2s6aGFuZGxlciBpbnN0ZWFkIG9mIHRoZSB1c3VhbCBmdWxsLWxlbmd0aCBldmVudDp7Y2xpY2s6aGFuZGxlcn1cbmZ1bmN0aW9uIG1ha2VFdmVudEhhbmRsZXJTaG9ydGN1dChldmVudE5hbWUpIHtcbiAgICBrby5iaW5kaW5nSGFuZGxlcnNbZXZlbnROYW1lXSA9IHtcbiAgICAgICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlQWNjZXNzb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgICAgIHJlc3VsdFtldmVudE5hbWVdID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGtvLmJpbmRpbmdIYW5kbGVyc1snZXZlbnQnXVsnaW5pdCddLmNhbGwodGhpcywgZWxlbWVudCwgbmV3VmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2V2ZW50J10gPSB7XG4gICAgJ2luaXQnIDogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHZhciBldmVudHNUb0hhbmRsZSA9IHZhbHVlQWNjZXNzb3IoKSB8fCB7fTtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaChldmVudHNUb0hhbmRsZSwgZnVuY3Rpb24oZXZlbnROYW1lKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50TmFtZSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgZXZlbnROYW1lLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhbmRsZXJSZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhbmRsZXJGdW5jdGlvbiA9IHZhbHVlQWNjZXNzb3IoKVtldmVudE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWhhbmRsZXJGdW5jdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGFrZSBhbGwgdGhlIGV2ZW50IGFyZ3MsIGFuZCBwcmVmaXggd2l0aCB0aGUgdmlld21vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJnc0ZvckhhbmRsZXIgPSBrby51dGlscy5tYWtlQXJyYXkoYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdNb2RlbCA9IGJpbmRpbmdDb250ZXh0WyckZGF0YSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJnc0ZvckhhbmRsZXIudW5zaGlmdCh2aWV3TW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlclJldHVyblZhbHVlID0gaGFuZGxlckZ1bmN0aW9uLmFwcGx5KHZpZXdNb2RlbCwgYXJnc0ZvckhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJSZXR1cm5WYWx1ZSAhPT0gdHJ1ZSkgeyAvLyBOb3JtYWxseSB3ZSB3YW50IHRvIHByZXZlbnQgZGVmYXVsdCBhY3Rpb24uIERldmVsb3BlciBjYW4gb3ZlcnJpZGUgdGhpcyBiZSBleHBsaWNpdGx5IHJldHVybmluZyB0cnVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgYnViYmxlID0gYWxsQmluZGluZ3MuZ2V0KGV2ZW50TmFtZSArICdCdWJibGUnKSAhPT0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYnViYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuLy8gXCJmb3JlYWNoOiBzb21lRXhwcmVzc2lvblwiIGlzIGVxdWl2YWxlbnQgdG8gXCJ0ZW1wbGF0ZTogeyBmb3JlYWNoOiBzb21lRXhwcmVzc2lvbiB9XCJcbi8vIFwiZm9yZWFjaDogeyBkYXRhOiBzb21lRXhwcmVzc2lvbiwgYWZ0ZXJBZGQ6IG15Zm4gfVwiIGlzIGVxdWl2YWxlbnQgdG8gXCJ0ZW1wbGF0ZTogeyBmb3JlYWNoOiBzb21lRXhwcmVzc2lvbiwgYWZ0ZXJBZGQ6IG15Zm4gfVwiXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2ZvcmVhY2gnXSA9IHtcbiAgICBtYWtlVGVtcGxhdGVWYWx1ZUFjY2Vzc29yOiBmdW5jdGlvbih2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBtb2RlbFZhbHVlID0gdmFsdWVBY2Nlc3NvcigpLFxuICAgICAgICAgICAgICAgIHVud3JhcHBlZFZhbHVlID0ga28udXRpbHMucGVla09ic2VydmFibGUobW9kZWxWYWx1ZSk7ICAgIC8vIFVud3JhcCB3aXRob3V0IHNldHRpbmcgYSBkZXBlbmRlbmN5IGhlcmVcblxuICAgICAgICAgICAgLy8gSWYgdW53cmFwcGVkVmFsdWUgaXMgdGhlIGFycmF5LCBwYXNzIGluIHRoZSB3cmFwcGVkIHZhbHVlIG9uIGl0cyBvd25cbiAgICAgICAgICAgIC8vIFRoZSB2YWx1ZSB3aWxsIGJlIHVud3JhcHBlZCBhbmQgdHJhY2tlZCB3aXRoaW4gdGhlIHRlbXBsYXRlIGJpbmRpbmdcbiAgICAgICAgICAgIC8vIChTZWUgaHR0cHM6Ly9naXRodWIuY29tL1N0ZXZlU2FuZGVyc29uL2tub2Nrb3V0L2lzc3Vlcy81MjMpXG4gICAgICAgICAgICBpZiAoKCF1bndyYXBwZWRWYWx1ZSkgfHwgdHlwZW9mIHVud3JhcHBlZFZhbHVlLmxlbmd0aCA9PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgICAgIHJldHVybiB7ICdmb3JlYWNoJzogbW9kZWxWYWx1ZSwgJ3RlbXBsYXRlRW5naW5lJzoga28ubmF0aXZlVGVtcGxhdGVFbmdpbmUuaW5zdGFuY2UgfTtcblxuICAgICAgICAgICAgLy8gSWYgdW53cmFwcGVkVmFsdWUuZGF0YSBpcyB0aGUgYXJyYXksIHByZXNlcnZlIGFsbCByZWxldmFudCBvcHRpb25zIGFuZCB1bndyYXAgYWdhaW4gdmFsdWUgc28gd2UgZ2V0IHVwZGF0ZXNcbiAgICAgICAgICAgIGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUobW9kZWxWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdmb3JlYWNoJzogdW53cmFwcGVkVmFsdWVbJ2RhdGEnXSxcbiAgICAgICAgICAgICAgICAnYXMnOiB1bndyYXBwZWRWYWx1ZVsnYXMnXSxcbiAgICAgICAgICAgICAgICAnaW5jbHVkZURlc3Ryb3llZCc6IHVud3JhcHBlZFZhbHVlWydpbmNsdWRlRGVzdHJveWVkJ10sXG4gICAgICAgICAgICAgICAgJ2FmdGVyQWRkJzogdW53cmFwcGVkVmFsdWVbJ2FmdGVyQWRkJ10sXG4gICAgICAgICAgICAgICAgJ2JlZm9yZVJlbW92ZSc6IHVud3JhcHBlZFZhbHVlWydiZWZvcmVSZW1vdmUnXSxcbiAgICAgICAgICAgICAgICAnYWZ0ZXJSZW5kZXInOiB1bndyYXBwZWRWYWx1ZVsnYWZ0ZXJSZW5kZXInXSxcbiAgICAgICAgICAgICAgICAnYmVmb3JlTW92ZSc6IHVud3JhcHBlZFZhbHVlWydiZWZvcmVNb3ZlJ10sXG4gICAgICAgICAgICAgICAgJ2FmdGVyTW92ZSc6IHVud3JhcHBlZFZhbHVlWydhZnRlck1vdmUnXSxcbiAgICAgICAgICAgICAgICAndGVtcGxhdGVFbmdpbmUnOiBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5pbnN0YW5jZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9LFxuICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MsIHZpZXdNb2RlbCwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIGtvLmJpbmRpbmdIYW5kbGVyc1sndGVtcGxhdGUnXVsnaW5pdCddKGVsZW1lbnQsIGtvLmJpbmRpbmdIYW5kbGVyc1snZm9yZWFjaCddLm1ha2VUZW1wbGF0ZVZhbHVlQWNjZXNzb3IodmFsdWVBY2Nlc3NvcikpO1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBrby5iaW5kaW5nSGFuZGxlcnNbJ3RlbXBsYXRlJ11bJ3VwZGF0ZSddKGVsZW1lbnQsIGtvLmJpbmRpbmdIYW5kbGVyc1snZm9yZWFjaCddLm1ha2VUZW1wbGF0ZVZhbHVlQWNjZXNzb3IodmFsdWVBY2Nlc3NvciksIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KTtcbiAgICB9XG59O1xua28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnNbJ2ZvcmVhY2gnXSA9IGZhbHNlOyAvLyBDYW4ndCByZXdyaXRlIGNvbnRyb2wgZmxvdyBiaW5kaW5nc1xua28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5nc1snZm9yZWFjaCddID0gdHJ1ZTtcbnZhciBoYXNmb2N1c1VwZGF0aW5nUHJvcGVydHkgPSAnX19rb19oYXNmb2N1c1VwZGF0aW5nJztcbnZhciBoYXNmb2N1c0xhc3RWYWx1ZSA9ICdfX2tvX2hhc2ZvY3VzTGFzdFZhbHVlJztcbmtvLmJpbmRpbmdIYW5kbGVyc1snaGFzZm9jdXMnXSA9IHtcbiAgICAnaW5pdCc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzKSB7XG4gICAgICAgIHZhciBoYW5kbGVFbGVtZW50Rm9jdXNDaGFuZ2UgPSBmdW5jdGlvbihpc0ZvY3VzZWQpIHtcbiAgICAgICAgICAgIC8vIFdoZXJlIHBvc3NpYmxlLCBpZ25vcmUgd2hpY2ggZXZlbnQgd2FzIHJhaXNlZCBhbmQgZGV0ZXJtaW5lIGZvY3VzIHN0YXRlIHVzaW5nIGFjdGl2ZUVsZW1lbnQsXG4gICAgICAgICAgICAvLyBhcyB0aGlzIGF2b2lkcyBwaGFudG9tIGZvY3VzL2JsdXIgZXZlbnRzIHJhaXNlZCB3aGVuIGNoYW5naW5nIHRhYnMgaW4gbW9kZXJuIGJyb3dzZXJzLlxuICAgICAgICAgICAgLy8gSG93ZXZlciwgbm90IGFsbCBLTy10YXJnZXRlZCBicm93c2VycyAoRmlyZWZveCAyKSBzdXBwb3J0IGFjdGl2ZUVsZW1lbnQuIEZvciB0aG9zZSBicm93c2VycyxcbiAgICAgICAgICAgIC8vIHByZXZlbnQgYSBsb3NzIG9mIGZvY3VzIHdoZW4gY2hhbmdpbmcgdGFicy93aW5kb3dzIGJ5IHNldHRpbmcgYSBmbGFnIHRoYXQgcHJldmVudHMgaGFzZm9jdXNcbiAgICAgICAgICAgIC8vIGZyb20gY2FsbGluZyAnYmx1cigpJyBvbiB0aGUgZWxlbWVudCB3aGVuIGl0IGxvc2VzIGZvY3VzLlxuICAgICAgICAgICAgLy8gRGlzY3Vzc2lvbiBhdCBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvcHVsbC8zNTJcbiAgICAgICAgICAgIGVsZW1lbnRbaGFzZm9jdXNVcGRhdGluZ1Byb3BlcnR5XSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgb3duZXJEb2MgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgICAgICAgICBpZiAoXCJhY3RpdmVFbGVtZW50XCIgaW4gb3duZXJEb2MpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZSA9IG93bmVyRG9jLmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElFOSB0aHJvd3MgaWYgeW91IGFjY2VzcyBhY3RpdmVFbGVtZW50IGR1cmluZyBwYWdlIGxvYWQgKHNlZSBpc3N1ZSAjNzAzKVxuICAgICAgICAgICAgICAgICAgICBhY3RpdmUgPSBvd25lckRvYy5ib2R5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpc0ZvY3VzZWQgPSAoYWN0aXZlID09PSBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBtb2RlbFZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICAgICAga28uZXhwcmVzc2lvblJld3JpdGluZy53cml0ZVZhbHVlVG9Qcm9wZXJ0eShtb2RlbFZhbHVlLCBhbGxCaW5kaW5ncywgJ2hhc2ZvY3VzJywgaXNGb2N1c2VkLCB0cnVlKTtcblxuICAgICAgICAgICAgLy9jYWNoZSB0aGUgbGF0ZXN0IHZhbHVlLCBzbyB3ZSBjYW4gYXZvaWQgdW5uZWNlc3NhcmlseSBjYWxsaW5nIGZvY3VzL2JsdXIgaW4gdGhlIHVwZGF0ZSBmdW5jdGlvblxuICAgICAgICAgICAgZWxlbWVudFtoYXNmb2N1c0xhc3RWYWx1ZV0gPSBpc0ZvY3VzZWQ7XG4gICAgICAgICAgICBlbGVtZW50W2hhc2ZvY3VzVXBkYXRpbmdQcm9wZXJ0eV0gPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGhhbmRsZUVsZW1lbnRGb2N1c0luID0gaGFuZGxlRWxlbWVudEZvY3VzQ2hhbmdlLmJpbmQobnVsbCwgdHJ1ZSk7XG4gICAgICAgIHZhciBoYW5kbGVFbGVtZW50Rm9jdXNPdXQgPSBoYW5kbGVFbGVtZW50Rm9jdXNDaGFuZ2UuYmluZChudWxsLCBmYWxzZSk7XG5cbiAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJmb2N1c1wiLCBoYW5kbGVFbGVtZW50Rm9jdXNJbik7XG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiZm9jdXNpblwiLCBoYW5kbGVFbGVtZW50Rm9jdXNJbik7IC8vIEZvciBJRVxuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImJsdXJcIiwgIGhhbmRsZUVsZW1lbnRGb2N1c091dCk7XG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiZm9jdXNvdXRcIiwgIGhhbmRsZUVsZW1lbnRGb2N1c091dCk7IC8vIEZvciBJRVxuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gISFrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7IC8vZm9yY2UgYm9vbGVhbiB0byBjb21wYXJlIHdpdGggbGFzdCB2YWx1ZVxuICAgICAgICBpZiAoIWVsZW1lbnRbaGFzZm9jdXNVcGRhdGluZ1Byb3BlcnR5XSAmJiBlbGVtZW50W2hhc2ZvY3VzTGFzdFZhbHVlXSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlID8gZWxlbWVudC5mb2N1cygpIDogZWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShrby51dGlscy50cmlnZ2VyRXZlbnQsIG51bGwsIFtlbGVtZW50LCB2YWx1ZSA/IFwiZm9jdXNpblwiIDogXCJmb2N1c291dFwiXSk7IC8vIEZvciBJRSwgd2hpY2ggZG9lc24ndCByZWxpYWJseSBmaXJlIFwiZm9jdXNcIiBvciBcImJsdXJcIiBldmVudHMgc3luY2hyb25vdXNseVxuICAgICAgICB9XG4gICAgfVxufTtcbmtvLmV4cHJlc3Npb25SZXdyaXRpbmcudHdvV2F5QmluZGluZ3NbJ2hhc2ZvY3VzJ10gPSB0cnVlO1xuXG5rby5iaW5kaW5nSGFuZGxlcnNbJ2hhc0ZvY3VzJ10gPSBrby5iaW5kaW5nSGFuZGxlcnNbJ2hhc2ZvY3VzJ107IC8vIE1ha2UgXCJoYXNGb2N1c1wiIGFuIGFsaWFzXG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWydoYXNGb2N1cyddID0gdHJ1ZTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snaHRtbCddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFByZXZlbnQgYmluZGluZyBvbiB0aGUgZHluYW1pY2FsbHktaW5qZWN0ZWQgSFRNTCAoYXMgZGV2ZWxvcGVycyBhcmUgdW5saWtlbHkgdG8gZXhwZWN0IHRoYXQsIGFuZCBpdCBoYXMgc2VjdXJpdHkgaW1wbGljYXRpb25zKVxuICAgICAgICByZXR1cm4geyAnY29udHJvbHNEZXNjZW5kYW50QmluZGluZ3MnOiB0cnVlIH07XG4gICAgfSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgLy8gc2V0SHRtbCB3aWxsIHVud3JhcCB0aGUgdmFsdWUgaWYgbmVlZGVkXG4gICAgICAgIGtvLnV0aWxzLnNldEh0bWwoZWxlbWVudCwgdmFsdWVBY2Nlc3NvcigpKTtcbiAgICB9XG59O1xuLy8gTWFrZXMgYSBiaW5kaW5nIGxpa2Ugd2l0aCBvciBpZlxuZnVuY3Rpb24gbWFrZVdpdGhJZkJpbmRpbmcoYmluZGluZ0tleSwgaXNXaXRoLCBpc05vdCwgbWFrZUNvbnRleHRDYWxsYmFjaykge1xuICAgIGtvLmJpbmRpbmdIYW5kbGVyc1tiaW5kaW5nS2V5XSA9IHtcbiAgICAgICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncywgdmlld01vZGVsLCBiaW5kaW5nQ29udGV4dCkge1xuICAgICAgICAgICAgdmFyIGRpZERpc3BsYXlPbkxhc3RVcGRhdGUsXG4gICAgICAgICAgICAgICAgc2F2ZWROb2RlcztcbiAgICAgICAgICAgIGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhVmFsdWUgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSksXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZERpc3BsYXkgPSAhaXNOb3QgIT09ICFkYXRhVmFsdWUsIC8vIGVxdWl2YWxlbnQgdG8gaXNOb3QgPyAhZGF0YVZhbHVlIDogISFkYXRhVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaXNGaXJzdFJlbmRlciA9ICFzYXZlZE5vZGVzLFxuICAgICAgICAgICAgICAgICAgICBuZWVkc1JlZnJlc2ggPSBpc0ZpcnN0UmVuZGVyIHx8IGlzV2l0aCB8fCAoc2hvdWxkRGlzcGxheSAhPT0gZGlkRGlzcGxheU9uTGFzdFVwZGF0ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobmVlZHNSZWZyZXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgYSBjb3B5IG9mIHRoZSBpbm5lciBub2RlcyBvbiB0aGUgaW5pdGlhbCB1cGRhdGUsIGJ1dCBvbmx5IGlmIHdlIGhhdmUgZGVwZW5kZW5jaWVzLlxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNGaXJzdFJlbmRlciAmJiBrby5jb21wdXRlZENvbnRleHQuZ2V0RGVwZW5kZW5jaWVzQ291bnQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZWROb2RlcyA9IGtvLnV0aWxzLmNsb25lTm9kZXMoa28udmlydHVhbEVsZW1lbnRzLmNoaWxkTm9kZXMoZWxlbWVudCksIHRydWUgLyogc2hvdWxkQ2xlYW5Ob2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkRGlzcGxheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0UmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLnNldERvbU5vZGVDaGlsZHJlbihlbGVtZW50LCBrby51dGlscy5jbG9uZU5vZGVzKHNhdmVkTm9kZXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLmFwcGx5QmluZGluZ3NUb0Rlc2NlbmRhbnRzKG1ha2VDb250ZXh0Q2FsbGJhY2sgPyBtYWtlQ29udGV4dENhbGxiYWNrKGJpbmRpbmdDb250ZXh0LCBkYXRhVmFsdWUpIDogYmluZGluZ0NvbnRleHQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLmVtcHR5Tm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGRpZERpc3BsYXlPbkxhc3RVcGRhdGUgPSBzaG91bGREaXNwbGF5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIG51bGwsIHsgZGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkOiBlbGVtZW50IH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLmJpbmRpbmdSZXdyaXRlVmFsaWRhdG9yc1tiaW5kaW5nS2V5XSA9IGZhbHNlOyAvLyBDYW4ndCByZXdyaXRlIGNvbnRyb2wgZmxvdyBiaW5kaW5nc1xuICAgIGtvLnZpcnR1YWxFbGVtZW50cy5hbGxvd2VkQmluZGluZ3NbYmluZGluZ0tleV0gPSB0cnVlO1xufVxuXG4vLyBDb25zdHJ1Y3QgdGhlIGFjdHVhbCBiaW5kaW5nIGhhbmRsZXJzXG5tYWtlV2l0aElmQmluZGluZygnaWYnKTtcbm1ha2VXaXRoSWZCaW5kaW5nKCdpZm5vdCcsIGZhbHNlIC8qIGlzV2l0aCAqLywgdHJ1ZSAvKiBpc05vdCAqLyk7XG5tYWtlV2l0aElmQmluZGluZygnd2l0aCcsIHRydWUgLyogaXNXaXRoICovLCBmYWxzZSAvKiBpc05vdCAqLyxcbiAgICBmdW5jdGlvbihiaW5kaW5nQ29udGV4dCwgZGF0YVZhbHVlKSB7XG4gICAgICAgIHJldHVybiBiaW5kaW5nQ29udGV4dFsnY3JlYXRlQ2hpbGRDb250ZXh0J10oZGF0YVZhbHVlKTtcbiAgICB9XG4pO1xudmFyIGNhcHRpb25QbGFjZWhvbGRlciA9IHt9O1xua28uYmluZGluZ0hhbmRsZXJzWydvcHRpb25zJ10gPSB7XG4gICAgJ2luaXQnOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmIChrby51dGlscy50YWdOYW1lTG93ZXIoZWxlbWVudCkgIT09IFwic2VsZWN0XCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zIGJpbmRpbmcgYXBwbGllcyBvbmx5IHRvIFNFTEVDVCBlbGVtZW50c1wiKTtcblxuICAgICAgICAvLyBSZW1vdmUgYWxsIGV4aXN0aW5nIDxvcHRpb24+cy5cbiAgICAgICAgd2hpbGUgKGVsZW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmVzIHRoYXQgdGhlIGJpbmRpbmcgcHJvY2Vzc29yIGRvZXNuJ3QgdHJ5IHRvIGJpbmQgdGhlIG9wdGlvbnNcbiAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICBmdW5jdGlvbiBzZWxlY3RlZE9wdGlvbnMoKSB7XG4gICAgICAgICAgICByZXR1cm4ga28udXRpbHMuYXJyYXlGaWx0ZXIoZWxlbWVudC5vcHRpb25zLCBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gbm9kZS5zZWxlY3RlZDsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZWN0V2FzUHJldmlvdXNseUVtcHR5ID0gZWxlbWVudC5sZW5ndGggPT0gMDtcbiAgICAgICAgdmFyIHByZXZpb3VzU2Nyb2xsVG9wID0gKCFzZWxlY3RXYXNQcmV2aW91c2x5RW1wdHkgJiYgZWxlbWVudC5tdWx0aXBsZSkgPyBlbGVtZW50LnNjcm9sbFRvcCA6IG51bGw7XG4gICAgICAgIHZhciB1bndyYXBwZWRBcnJheSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpKTtcbiAgICAgICAgdmFyIGluY2x1ZGVEZXN0cm95ZWQgPSBhbGxCaW5kaW5ncy5nZXQoJ29wdGlvbnNJbmNsdWRlRGVzdHJveWVkJyk7XG4gICAgICAgIHZhciBhcnJheVRvRG9tTm9kZUNoaWxkcmVuT3B0aW9ucyA9IHt9O1xuICAgICAgICB2YXIgY2FwdGlvblZhbHVlO1xuICAgICAgICB2YXIgZmlsdGVyZWRBcnJheTtcbiAgICAgICAgdmFyIHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXM7XG5cbiAgICAgICAgaWYgKGVsZW1lbnQubXVsdGlwbGUpIHtcbiAgICAgICAgICAgIHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMgPSBrby51dGlscy5hcnJheU1hcChzZWxlY3RlZE9wdGlvbnMoKSwga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJldmlvdXNTZWxlY3RlZFZhbHVlcyA9IGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA+PSAwID8gWyBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50Lm9wdGlvbnNbZWxlbWVudC5zZWxlY3RlZEluZGV4XSkgXSA6IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHVud3JhcHBlZEFycmF5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHVud3JhcHBlZEFycmF5Lmxlbmd0aCA9PSBcInVuZGVmaW5lZFwiKSAvLyBDb2VyY2Ugc2luZ2xlIHZhbHVlIGludG8gYXJyYXlcbiAgICAgICAgICAgICAgICB1bndyYXBwZWRBcnJheSA9IFt1bndyYXBwZWRBcnJheV07XG5cbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYW55IGVudHJpZXMgbWFya2VkIGFzIGRlc3Ryb3llZFxuICAgICAgICAgICAgZmlsdGVyZWRBcnJheSA9IGtvLnV0aWxzLmFycmF5RmlsdGVyKHVud3JhcHBlZEFycmF5LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluY2x1ZGVEZXN0cm95ZWQgfHwgaXRlbSA9PT0gdW5kZWZpbmVkIHx8IGl0ZW0gPT09IG51bGwgfHwgIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoaXRlbVsnX2Rlc3Ryb3knXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gSWYgY2FwdGlvbiBpcyBpbmNsdWRlZCwgYWRkIGl0IHRvIHRoZSBhcnJheVxuICAgICAgICAgICAgaWYgKGFsbEJpbmRpbmdzWydoYXMnXSgnb3B0aW9uc0NhcHRpb24nKSkge1xuICAgICAgICAgICAgICAgIGNhcHRpb25WYWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zQ2FwdGlvbicpKTtcbiAgICAgICAgICAgICAgICAvLyBJZiBjYXB0aW9uIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLCBkb24ndCBzaG93IGEgY2FwdGlvblxuICAgICAgICAgICAgICAgIGlmIChjYXB0aW9uVmFsdWUgIT09IG51bGwgJiYgY2FwdGlvblZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRBcnJheS51bnNoaWZ0KGNhcHRpb25QbGFjZWhvbGRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgYSBmYWxzeSB2YWx1ZSBpcyBwcm92aWRlZCAoZS5nLiBudWxsKSwgd2UnbGwgc2ltcGx5IGVtcHR5IHRoZSBzZWxlY3QgZWxlbWVudFxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYXBwbHlUb09iamVjdChvYmplY3QsIHByZWRpY2F0ZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgcHJlZGljYXRlVHlwZSA9IHR5cGVvZiBwcmVkaWNhdGU7XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlVHlwZSA9PSBcImZ1bmN0aW9uXCIpICAgIC8vIEdpdmVuIGEgZnVuY3Rpb247IHJ1biBpdCBhZ2FpbnN0IHRoZSBkYXRhIHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZWRpY2F0ZShvYmplY3QpO1xuICAgICAgICAgICAgZWxzZSBpZiAocHJlZGljYXRlVHlwZSA9PSBcInN0cmluZ1wiKSAvLyBHaXZlbiBhIHN0cmluZzsgdHJlYXQgaXQgYXMgYSBwcm9wZXJ0eSBuYW1lIG9uIHRoZSBkYXRhIHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdFtwcmVkaWNhdGVdO1xuICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4gbm8gb3B0aW9uc1RleHQgYXJnOyB1c2UgdGhlIGRhdGEgdmFsdWUgaXRzZWxmXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIGNhbiBydW4gYXQgdHdvIGRpZmZlcmVudCB0aW1lczpcbiAgICAgICAgLy8gVGhlIGZpcnN0IGlzIHdoZW4gdGhlIHdob2xlIGFycmF5IGlzIGJlaW5nIHVwZGF0ZWQgZGlyZWN0bHkgZnJvbSB0aGlzIGJpbmRpbmcgaGFuZGxlci5cbiAgICAgICAgLy8gVGhlIHNlY29uZCBpcyB3aGVuIGFuIG9ic2VydmFibGUgdmFsdWUgZm9yIGEgc3BlY2lmaWMgYXJyYXkgZW50cnkgaXMgdXBkYXRlZC5cbiAgICAgICAgLy8gb2xkT3B0aW9ucyB3aWxsIGJlIGVtcHR5IGluIHRoZSBmaXJzdCBjYXNlLCBidXQgd2lsbCBiZSBmaWxsZWQgd2l0aCB0aGUgcHJldmlvdXNseSBnZW5lcmF0ZWQgb3B0aW9uIGluIHRoZSBzZWNvbmQuXG4gICAgICAgIHZhciBpdGVtVXBkYXRlID0gZmFsc2U7XG4gICAgICAgIGZ1bmN0aW9uIG9wdGlvbkZvckFycmF5SXRlbShhcnJheUVudHJ5LCBpbmRleCwgb2xkT3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9sZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNTZWxlY3RlZFZhbHVlcyA9IG9sZE9wdGlvbnNbMF0uc2VsZWN0ZWQgPyBbIGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKG9sZE9wdGlvbnNbMF0pIF0gOiBbXTtcbiAgICAgICAgICAgICAgICBpdGVtVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBvcHRpb24gPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICAgICAgICAgIGlmIChhcnJheUVudHJ5ID09PSBjYXB0aW9uUGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRUZXh0Q29udGVudChvcHRpb24sIGFsbEJpbmRpbmdzLmdldCgnb3B0aW9uc0NhcHRpb24nKSk7XG4gICAgICAgICAgICAgICAga28uc2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlKG9wdGlvbiwgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQXBwbHkgYSB2YWx1ZSB0byB0aGUgb3B0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uVmFsdWUgPSBhcHBseVRvT2JqZWN0KGFycmF5RW50cnksIGFsbEJpbmRpbmdzLmdldCgnb3B0aW9uc1ZhbHVlJyksIGFycmF5RW50cnkpO1xuICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShvcHRpb24sIGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUob3B0aW9uVmFsdWUpKTtcblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IHNvbWUgdGV4dCB0byB0aGUgb3B0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9uVGV4dCA9IGFwcGx5VG9PYmplY3QoYXJyYXlFbnRyeSwgYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zVGV4dCcpLCBvcHRpb25WYWx1ZSk7XG4gICAgICAgICAgICAgICAga28udXRpbHMuc2V0VGV4dENvbnRlbnQob3B0aW9uLCBvcHRpb25UZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbb3B0aW9uXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ5IHVzaW5nIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrLCB3ZSBkZWxheSB0aGUgcmVtb3ZhbCB1bnRpbCBhZnRlciBuZXcgaXRlbXMgYXJlIGFkZGVkLiBUaGlzIGZpeGVzIGEgc2VsZWN0aW9uXG4gICAgICAgIC8vIHByb2JsZW0gaW4gSUU8PTggYW5kIEZpcmVmb3guIFNlZSBodHRwczovL2dpdGh1Yi5jb20va25vY2tvdXQva25vY2tvdXQvaXNzdWVzLzEyMDhcbiAgICAgICAgYXJyYXlUb0RvbU5vZGVDaGlsZHJlbk9wdGlvbnNbJ2JlZm9yZVJlbW92ZSddID1cbiAgICAgICAgICAgIGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNoaWxkKG9wdGlvbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHNldFNlbGVjdGlvbkNhbGxiYWNrKGFycmF5RW50cnksIG5ld09wdGlvbnMpIHtcbiAgICAgICAgICAgIC8vIElFNiBkb2Vzbid0IGxpa2UgdXMgdG8gYXNzaWduIHNlbGVjdGlvbiB0byBPUFRJT04gbm9kZXMgYmVmb3JlIHRoZXkncmUgYWRkZWQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAgICAgICAgLy8gVGhhdCdzIHdoeSB3ZSBmaXJzdCBhZGRlZCB0aGVtIHdpdGhvdXQgc2VsZWN0aW9uLiBOb3cgaXQncyB0aW1lIHRvIHNldCB0aGUgc2VsZWN0aW9uLlxuICAgICAgICAgICAgaWYgKHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzU2VsZWN0ZWQgPSBrby51dGlscy5hcnJheUluZGV4T2YocHJldmlvdXNTZWxlY3RlZFZhbHVlcywga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUobmV3T3B0aW9uc1swXSkpID49IDA7XG4gICAgICAgICAgICAgICAga28udXRpbHMuc2V0T3B0aW9uTm9kZVNlbGVjdGlvblN0YXRlKG5ld09wdGlvbnNbMF0sIGlzU2VsZWN0ZWQpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBvcHRpb24gd2FzIGNoYW5nZWQgZnJvbSBiZWluZyBzZWxlY3RlZCBkdXJpbmcgYSBzaW5nbGUtaXRlbSB1cGRhdGUsIG5vdGlmeSB0aGUgY2hhbmdlXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1VcGRhdGUgJiYgIWlzU2VsZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnRyaWdnZXJFdmVudCwgbnVsbCwgW2VsZW1lbnQsIFwiY2hhbmdlXCJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjYWxsYmFjayA9IHNldFNlbGVjdGlvbkNhbGxiYWNrO1xuICAgICAgICBpZiAoYWxsQmluZGluZ3NbJ2hhcyddKCdvcHRpb25zQWZ0ZXJSZW5kZXInKSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbihhcnJheUVudHJ5LCBuZXdPcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uQ2FsbGJhY2soYXJyYXlFbnRyeSwgbmV3T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAga28uZGVwZW5kZW5jeURldGVjdGlvbi5pZ25vcmUoYWxsQmluZGluZ3MuZ2V0KCdvcHRpb25zQWZ0ZXJSZW5kZXInKSwgbnVsbCwgW25ld09wdGlvbnNbMF0sIGFycmF5RW50cnkgIT09IGNhcHRpb25QbGFjZWhvbGRlciA/IGFycmF5RW50cnkgOiB1bmRlZmluZWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGtvLnV0aWxzLnNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcoZWxlbWVudCwgZmlsdGVyZWRBcnJheSwgb3B0aW9uRm9yQXJyYXlJdGVtLCBhcnJheVRvRG9tTm9kZUNoaWxkcmVuT3B0aW9ucywgY2FsbGJhY2spO1xuXG4gICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlQWxsb3dVbnNldCcpICYmIGFsbEJpbmRpbmdzWydoYXMnXSgndmFsdWUnKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBtb2RlbCB2YWx1ZSBpcyBhdXRob3JpdGF0aXZlLCBzbyBtYWtlIHN1cmUgaXRzIHZhbHVlIGlzIHRoZSBvbmUgc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICBrby5zZWxlY3RFeHRlbnNpb25zLndyaXRlVmFsdWUoZWxlbWVudCwga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShhbGxCaW5kaW5ncy5nZXQoJ3ZhbHVlJykpLCB0cnVlIC8qIGFsbG93VW5zZXQgKi8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgaWYgdGhlIHNlbGVjdGlvbiBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiB1cGRhdGluZyB0aGUgb3B0aW9ucyBsaXN0XG4gICAgICAgICAgICAgICAgdmFyIHNlbGVjdGlvbkNoYW5nZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQubXVsdGlwbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGEgbXVsdGlwbGUtc2VsZWN0IGJveCwgY29tcGFyZSB0aGUgbmV3IHNlbGVjdGlvbiBjb3VudCB0byB0aGUgcHJldmlvdXMgb25lXG4gICAgICAgICAgICAgICAgICAgIC8vIEJ1dCBpZiBub3RoaW5nIHdhcyBzZWxlY3RlZCBiZWZvcmUsIHRoZSBzZWxlY3Rpb24gY2FuJ3QgaGF2ZSBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkNoYW5nZWQgPSBwcmV2aW91c1NlbGVjdGVkVmFsdWVzLmxlbmd0aCAmJiBzZWxlY3RlZE9wdGlvbnMoKS5sZW5ndGggPCBwcmV2aW91c1NlbGVjdGVkVmFsdWVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgYSBzaW5nbGUtc2VsZWN0IGJveCwgY29tcGFyZSB0aGUgY3VycmVudCB2YWx1ZSB0byB0aGUgcHJldmlvdXMgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgLy8gQnV0IGlmIG5vdGhpbmcgd2FzIHNlbGVjdGVkIGJlZm9yZSBvciBub3RoaW5nIGlzIHNlbGVjdGVkIG5vdywganVzdCBsb29rIGZvciBhIGNoYW5nZSBpbiBzZWxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uQ2hhbmdlZCA9IChwcmV2aW91c1NlbGVjdGVkVmFsdWVzLmxlbmd0aCAmJiBlbGVtZW50LnNlbGVjdGVkSW5kZXggPj0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgID8gKGtvLnNlbGVjdEV4dGVuc2lvbnMucmVhZFZhbHVlKGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdKSAhPT0gcHJldmlvdXNTZWxlY3RlZFZhbHVlc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogKHByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMubGVuZ3RoIHx8IGVsZW1lbnQuc2VsZWN0ZWRJbmRleCA+PSAwKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgY29uc2lzdGVuY3kgYmV0d2VlbiBtb2RlbCB2YWx1ZSBhbmQgc2VsZWN0ZWQgb3B0aW9uLlxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBkcm9wZG93biB3YXMgY2hhbmdlZCBzbyB0aGF0IHNlbGVjdGlvbiBpcyBubyBsb25nZXIgdGhlIHNhbWUsXG4gICAgICAgICAgICAgICAgLy8gbm90aWZ5IHRoZSB2YWx1ZSBvciBzZWxlY3RlZE9wdGlvbnMgYmluZGluZy5cbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy50cmlnZ2VyRXZlbnQoZWxlbWVudCwgXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBJRSBidWdcbiAgICAgICAga28udXRpbHMuZW5zdXJlU2VsZWN0RWxlbWVudElzUmVuZGVyZWRDb3JyZWN0bHkoZWxlbWVudCk7XG5cbiAgICAgICAgaWYgKHByZXZpb3VzU2Nyb2xsVG9wICYmIE1hdGguYWJzKHByZXZpb3VzU2Nyb2xsVG9wIC0gZWxlbWVudC5zY3JvbGxUb3ApID4gMjApXG4gICAgICAgICAgICBlbGVtZW50LnNjcm9sbFRvcCA9IHByZXZpb3VzU2Nyb2xsVG9wO1xuICAgIH1cbn07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ29wdGlvbnMnXS5vcHRpb25WYWx1ZURvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbmtvLmJpbmRpbmdIYW5kbGVyc1snc2VsZWN0ZWRPcHRpb25zJ10gPSB7XG4gICAgJ2FmdGVyJzogWydvcHRpb25zJywgJ2ZvcmVhY2gnXSxcbiAgICAnaW5pdCc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yLCBhbGxCaW5kaW5ncykge1xuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCksIHZhbHVlVG9Xcml0ZSA9IFtdO1xuICAgICAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJvcHRpb25cIiksIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5zZWxlY3RlZClcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVUb1dyaXRlLnB1c2goa28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUobm9kZSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBrby5leHByZXNzaW9uUmV3cml0aW5nLndyaXRlVmFsdWVUb1Byb3BlcnR5KHZhbHVlLCBhbGxCaW5kaW5ncywgJ3NlbGVjdGVkT3B0aW9ucycsIHZhbHVlVG9Xcml0ZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIGlmIChrby51dGlscy50YWdOYW1lTG93ZXIoZWxlbWVudCkgIT0gXCJzZWxlY3RcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlcyBiaW5kaW5nIGFwcGxpZXMgb25seSB0byBTRUxFQ1QgZWxlbWVudHNcIik7XG5cbiAgICAgICAgdmFyIG5ld1ZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICBpZiAobmV3VmFsdWUgJiYgdHlwZW9mIG5ld1ZhbHVlLmxlbmd0aCA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBrby51dGlscy5hcnJheUZvckVhY2goZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm9wdGlvblwiKSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBpc1NlbGVjdGVkID0ga28udXRpbHMuYXJyYXlJbmRleE9mKG5ld1ZhbHVlLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShub2RlKSkgPj0gMDtcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRPcHRpb25Ob2RlU2VsZWN0aW9uU3RhdGUobm9kZSwgaXNTZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5rby5leHByZXNzaW9uUmV3cml0aW5nLnR3b1dheUJpbmRpbmdzWydzZWxlY3RlZE9wdGlvbnMnXSA9IHRydWU7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3N0eWxlJ10gPSB7XG4gICAgJ3VwZGF0ZSc6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUodmFsdWVBY2Nlc3NvcigpIHx8IHt9KTtcbiAgICAgICAga28udXRpbHMub2JqZWN0Rm9yRWFjaCh2YWx1ZSwgZnVuY3Rpb24oc3R5bGVOYW1lLCBzdHlsZVZhbHVlKSB7XG4gICAgICAgICAgICBzdHlsZVZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShzdHlsZVZhbHVlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWUgfHwgXCJcIjsgLy8gRW1wdHkgc3RyaW5nIHJlbW92ZXMgdGhlIHZhbHVlLCB3aGVyZWFzIG51bGwvdW5kZWZpbmVkIGhhdmUgbm8gZWZmZWN0XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3N1Ym1pdCddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWVBY2Nlc3NvcigpICE9IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSB2YWx1ZSBmb3IgYSBzdWJtaXQgYmluZGluZyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwic3VibWl0XCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXJSZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIHRyeSB7IGhhbmRsZXJSZXR1cm5WYWx1ZSA9IHZhbHVlLmNhbGwoYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGVsZW1lbnQpOyB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAoaGFuZGxlclJldHVyblZhbHVlICE9PSB0cnVlKSB7IC8vIE5vcm1hbGx5IHdlIHdhbnQgdG8gcHJldmVudCBkZWZhdWx0IGFjdGlvbi4gRGV2ZWxvcGVyIGNhbiBvdmVycmlkZSB0aGlzIGJlIGV4cGxpY2l0bHkgcmV0dXJuaW5nIHRydWUuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xua28uYmluZGluZ0hhbmRsZXJzWyd0ZXh0J10gPSB7XG5cdCdpbml0JzogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gUHJldmVudCBiaW5kaW5nIG9uIHRoZSBkeW5hbWljYWxseS1pbmplY3RlZCB0ZXh0IG5vZGUgKGFzIGRldmVsb3BlcnMgYXJlIHVubGlrZWx5IHRvIGV4cGVjdCB0aGF0LCBhbmQgaXQgaGFzIHNlY3VyaXR5IGltcGxpY2F0aW9ucykuXG5cdFx0Ly8gSXQgc2hvdWxkIGFsc28gbWFrZSB0aGluZ3MgZmFzdGVyLCBhcyB3ZSBubyBsb25nZXIgaGF2ZSB0byBjb25zaWRlciB3aGV0aGVyIHRoZSB0ZXh0IG5vZGUgbWlnaHQgYmUgYmluZGFibGUuXG4gICAgICAgIHJldHVybiB7ICdjb250cm9sc0Rlc2NlbmRhbnRCaW5kaW5ncyc6IHRydWUgfTtcblx0fSxcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAga28udXRpbHMuc2V0VGV4dENvbnRlbnQoZWxlbWVudCwgdmFsdWVBY2Nlc3NvcigpKTtcbiAgICB9XG59O1xua28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5nc1sndGV4dCddID0gdHJ1ZTtcbmtvLmJpbmRpbmdIYW5kbGVyc1sndW5pcXVlTmFtZSddID0ge1xuICAgICdpbml0JzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgaWYgKHZhbHVlQWNjZXNzb3IoKSkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBcImtvX3VuaXF1ZV9cIiArICgrK2tvLmJpbmRpbmdIYW5kbGVyc1sndW5pcXVlTmFtZSddLmN1cnJlbnRJbmRleCk7XG4gICAgICAgICAgICBrby51dGlscy5zZXRFbGVtZW50TmFtZShlbGVtZW50LCBuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3VuaXF1ZU5hbWUnXS5jdXJyZW50SW5kZXggPSAwO1xua28uYmluZGluZ0hhbmRsZXJzWyd2YWx1ZSddID0ge1xuICAgICdhZnRlcic6IFsnb3B0aW9ucycsICdmb3JlYWNoJ10sXG4gICAgJ2luaXQnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgLy8gQWx3YXlzIGNhdGNoIFwiY2hhbmdlXCIgZXZlbnQ7IHBvc3NpYmx5IG90aGVyIGV2ZW50cyB0b28gaWYgYXNrZWRcbiAgICAgICAgdmFyIGV2ZW50c1RvQ2F0Y2ggPSBbXCJjaGFuZ2VcIl07XG4gICAgICAgIHZhciByZXF1ZXN0ZWRFdmVudHNUb0NhdGNoID0gYWxsQmluZGluZ3MuZ2V0KFwidmFsdWVVcGRhdGVcIik7XG4gICAgICAgIHZhciBwcm9wZXJ0eUNoYW5nZWRGaXJlZCA9IGZhbHNlO1xuICAgICAgICBpZiAocmVxdWVzdGVkRXZlbnRzVG9DYXRjaCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0ZWRFdmVudHNUb0NhdGNoID09IFwic3RyaW5nXCIpIC8vIEFsbG93IGJvdGggaW5kaXZpZHVhbCBldmVudCBuYW1lcywgYW5kIGFycmF5cyBvZiBldmVudCBuYW1lc1xuICAgICAgICAgICAgICAgIHJlcXVlc3RlZEV2ZW50c1RvQ2F0Y2ggPSBbcmVxdWVzdGVkRXZlbnRzVG9DYXRjaF07XG4gICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwoZXZlbnRzVG9DYXRjaCwgcmVxdWVzdGVkRXZlbnRzVG9DYXRjaCk7XG4gICAgICAgICAgICBldmVudHNUb0NhdGNoID0ga28udXRpbHMuYXJyYXlHZXREaXN0aW5jdFZhbHVlcyhldmVudHNUb0NhdGNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2YWx1ZVVwZGF0ZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgbW9kZWxWYWx1ZSA9IHZhbHVlQWNjZXNzb3IoKTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50VmFsdWUgPSBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgICAgIGtvLmV4cHJlc3Npb25SZXdyaXRpbmcud3JpdGVWYWx1ZVRvUHJvcGVydHkobW9kZWxWYWx1ZSwgYWxsQmluZGluZ3MsICd2YWx1ZScsIGVsZW1lbnRWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vU3RldmVTYW5kZXJzb24va25vY2tvdXQvaXNzdWVzLzEyMlxuICAgICAgICAvLyBJRSBkb2Vzbid0IGZpcmUgXCJjaGFuZ2VcIiBldmVudHMgb24gdGV4dGJveGVzIGlmIHRoZSB1c2VyIHNlbGVjdHMgYSB2YWx1ZSBmcm9tIGl0cyBhdXRvY29tcGxldGUgbGlzdFxuICAgICAgICB2YXIgaWVBdXRvQ29tcGxldGVIYWNrTmVlZGVkID0ga28udXRpbHMuaWVWZXJzaW9uICYmIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiaW5wdXRcIiAmJiBlbGVtZW50LnR5cGUgPT0gXCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGVsZW1lbnQuYXV0b2NvbXBsZXRlICE9IFwib2ZmXCIgJiYgKCFlbGVtZW50LmZvcm0gfHwgZWxlbWVudC5mb3JtLmF1dG9jb21wbGV0ZSAhPSBcIm9mZlwiKTtcbiAgICAgICAgaWYgKGllQXV0b0NvbXBsZXRlSGFja05lZWRlZCAmJiBrby51dGlscy5hcnJheUluZGV4T2YoZXZlbnRzVG9DYXRjaCwgXCJwcm9wZXJ0eWNoYW5nZVwiKSA9PSAtMSkge1xuICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJwcm9wZXJ0eWNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7IHByb3BlcnR5Q2hhbmdlZEZpcmVkID0gdHJ1ZSB9KTtcbiAgICAgICAgICAgIGtvLnV0aWxzLnJlZ2lzdGVyRXZlbnRIYW5kbGVyKGVsZW1lbnQsIFwiZm9jdXNcIiwgZnVuY3Rpb24gKCkgeyBwcm9wZXJ0eUNoYW5nZWRGaXJlZCA9IGZhbHNlIH0pO1xuICAgICAgICAgICAga28udXRpbHMucmVnaXN0ZXJFdmVudEhhbmRsZXIoZWxlbWVudCwgXCJibHVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eUNoYW5nZWRGaXJlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZVVwZGF0ZUhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChldmVudHNUb0NhdGNoLCBmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgICAgIC8vIFRoZSBzeW50YXggXCJhZnRlcjxldmVudG5hbWU+XCIgbWVhbnMgXCJydW4gdGhlIGhhbmRsZXIgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIGV2ZW50XCJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdXNlZnVsLCBmb3IgZXhhbXBsZSwgdG8gY2F0Y2ggXCJrZXlkb3duXCIgZXZlbnRzIGFmdGVyIHRoZSBicm93c2VyIGhhcyB1cGRhdGVkIHRoZSBjb250cm9sXG4gICAgICAgICAgICAvLyAob3RoZXJ3aXNlLCBrby5zZWxlY3RFeHRlbnNpb25zLnJlYWRWYWx1ZSh0aGlzKSB3aWxsIHJlY2VpdmUgdGhlIGNvbnRyb2wncyB2YWx1ZSAqYmVmb3JlKiB0aGUga2V5IGV2ZW50KVxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSB2YWx1ZVVwZGF0ZUhhbmRsZXI7XG4gICAgICAgICAgICBpZiAoa28udXRpbHMuc3RyaW5nU3RhcnRzV2l0aChldmVudE5hbWUsIFwiYWZ0ZXJcIikpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24oKSB7IHNldFRpbWVvdXQodmFsdWVVcGRhdGVIYW5kbGVyLCAwKSB9O1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZSA9IGV2ZW50TmFtZS5zdWJzdHJpbmcoXCJhZnRlclwiLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbGVtZW50LCBldmVudE5hbWUsIGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgICd1cGRhdGUnOiBmdW5jdGlvbiAoZWxlbWVudCwgdmFsdWVBY2Nlc3NvciwgYWxsQmluZGluZ3MpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICB2YXIgZWxlbWVudFZhbHVlID0ga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudCk7XG4gICAgICAgIHZhciB2YWx1ZUhhc0NoYW5nZWQgPSAobmV3VmFsdWUgIT09IGVsZW1lbnRWYWx1ZSk7XG5cbiAgICAgICAgaWYgKHZhbHVlSGFzQ2hhbmdlZCkge1xuICAgICAgICAgICAgaWYgKGtvLnV0aWxzLnRhZ05hbWVMb3dlcihlbGVtZW50KSA9PT0gXCJzZWxlY3RcIikge1xuICAgICAgICAgICAgICAgIHZhciBhbGxvd1Vuc2V0ID0gYWxsQmluZGluZ3MuZ2V0KCd2YWx1ZUFsbG93VW5zZXQnKTtcbiAgICAgICAgICAgICAgICB2YXIgYXBwbHlWYWx1ZUFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAga28uc2VsZWN0RXh0ZW5zaW9ucy53cml0ZVZhbHVlKGVsZW1lbnQsIG5ld1ZhbHVlLCBhbGxvd1Vuc2V0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFwcGx5VmFsdWVBY3Rpb24oKTtcblxuICAgICAgICAgICAgICAgIGlmICghYWxsb3dVbnNldCAmJiBuZXdWYWx1ZSAhPT0ga28uc2VsZWN0RXh0ZW5zaW9ucy5yZWFkVmFsdWUoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgeW91IHRyeSB0byBzZXQgYSBtb2RlbCB2YWx1ZSB0aGF0IGNhbid0IGJlIHJlcHJlc2VudGVkIGluIGFuIGFscmVhZHktcG9wdWxhdGVkIGRyb3Bkb3duLCByZWplY3QgdGhhdCBjaGFuZ2UsXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgeW91J3JlIG5vdCBhbGxvd2VkIHRvIGhhdmUgYSBtb2RlbCB2YWx1ZSB0aGF0IGRpc2FncmVlcyB3aXRoIGEgdmlzaWJsZSBVSSBzZWxlY3Rpb24uXG4gICAgICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKGtvLnV0aWxzLnRyaWdnZXJFdmVudCwgbnVsbCwgW2VsZW1lbnQsIFwiY2hhbmdlXCJdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBJRTYgYnVnOiBJdCB3b24ndCByZWxpYWJseSBhcHBseSB2YWx1ZXMgdG8gU0VMRUNUIG5vZGVzIGR1cmluZyB0aGUgc2FtZSBleGVjdXRpb24gdGhyZWFkXG4gICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0IGFmdGVyIHlvdSd2ZSBjaGFuZ2VkIHRoZSBzZXQgb2YgT1BUSU9OIG5vZGVzIG9uIGl0LiBTbyBmb3IgdGhhdCBub2RlIHR5cGUsIHdlJ2xsIHNjaGVkdWxlIGEgc2Vjb25kIHRocmVhZFxuICAgICAgICAgICAgICAgICAgICAvLyB0byBhcHBseSB0aGUgdmFsdWUgYXMgd2VsbC5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhcHBseVZhbHVlQWN0aW9uLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtvLnNlbGVjdEV4dGVuc2lvbnMud3JpdGVWYWx1ZShlbGVtZW50LCBuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xua28uZXhwcmVzc2lvblJld3JpdGluZy50d29XYXlCaW5kaW5nc1sndmFsdWUnXSA9IHRydWU7XG5rby5iaW5kaW5nSGFuZGxlcnNbJ3Zpc2libGUnXSA9IHtcbiAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICB2YXIgaXNDdXJyZW50bHlWaXNpYmxlID0gIShlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT0gXCJub25lXCIpO1xuICAgICAgICBpZiAodmFsdWUgJiYgIWlzQ3VycmVudGx5VmlzaWJsZSlcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgIGVsc2UgaWYgKCghdmFsdWUpICYmIGlzQ3VycmVudGx5VmlzaWJsZSlcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbn07XG4vLyAnY2xpY2snIGlzIGp1c3QgYSBzaG9ydGhhbmQgZm9yIHRoZSB1c3VhbCBmdWxsLWxlbmd0aCBldmVudDp7Y2xpY2s6aGFuZGxlcn1cbm1ha2VFdmVudEhhbmRsZXJTaG9ydGN1dCgnY2xpY2snKTtcbi8vIElmIHlvdSB3YW50IHRvIG1ha2UgYSBjdXN0b20gdGVtcGxhdGUgZW5naW5lLFxuLy9cbi8vIFsxXSBJbmhlcml0IGZyb20gdGhpcyBjbGFzcyAobGlrZSBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSBkb2VzKVxuLy8gWzJdIE92ZXJyaWRlICdyZW5kZXJUZW1wbGF0ZVNvdXJjZScsIHN1cHBseWluZyBhIGZ1bmN0aW9uIHdpdGggdGhpcyBzaWduYXR1cmU6XG4vL1xuLy8gICAgICAgIGZ1bmN0aW9uICh0ZW1wbGF0ZVNvdXJjZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpIHtcbi8vICAgICAgICAgICAgLy8gLSB0ZW1wbGF0ZVNvdXJjZS50ZXh0KCkgaXMgdGhlIHRleHQgb2YgdGhlIHRlbXBsYXRlIHlvdSBzaG91bGQgcmVuZGVyXG4vLyAgICAgICAgICAgIC8vIC0gYmluZGluZ0NvbnRleHQuJGRhdGEgaXMgdGhlIGRhdGEgeW91IHNob3VsZCBwYXNzIGludG8gdGhlIHRlbXBsYXRlXG4vLyAgICAgICAgICAgIC8vICAgLSB5b3UgbWlnaHQgYWxzbyB3YW50IHRvIG1ha2UgYmluZGluZ0NvbnRleHQuJHBhcmVudCwgYmluZGluZ0NvbnRleHQuJHBhcmVudHMsXG4vLyAgICAgICAgICAgIC8vICAgICBhbmQgYmluZGluZ0NvbnRleHQuJHJvb3QgYXZhaWxhYmxlIGluIHRoZSB0ZW1wbGF0ZSB0b29cbi8vICAgICAgICAgICAgLy8gLSBvcHRpb25zIGdpdmVzIHlvdSBhY2Nlc3MgdG8gYW55IG90aGVyIHByb3BlcnRpZXMgc2V0IG9uIFwiZGF0YS1iaW5kOiB7IHRlbXBsYXRlOiBvcHRpb25zIH1cIlxuLy8gICAgICAgICAgICAvL1xuLy8gICAgICAgICAgICAvLyBSZXR1cm4gdmFsdWU6IGFuIGFycmF5IG9mIERPTSBub2Rlc1xuLy8gICAgICAgIH1cbi8vXG4vLyBbM10gT3ZlcnJpZGUgJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jaycsIHN1cHBseWluZyBhIGZ1bmN0aW9uIHdpdGggdGhpcyBzaWduYXR1cmU6XG4vL1xuLy8gICAgICAgIGZ1bmN0aW9uIChzY3JpcHQpIHtcbi8vICAgICAgICAgICAgLy8gUmV0dXJuIHZhbHVlOiBXaGF0ZXZlciBzeW50YXggbWVhbnMgXCJFdmFsdWF0ZSB0aGUgSmF2YVNjcmlwdCBzdGF0ZW1lbnQgJ3NjcmlwdCcgYW5kIG91dHB1dCB0aGUgcmVzdWx0XCJcbi8vICAgICAgICAgICAgLy8gICAgICAgICAgICAgICBGb3IgZXhhbXBsZSwgdGhlIGpxdWVyeS50bXBsIHRlbXBsYXRlIGVuZ2luZSBjb252ZXJ0cyAnc29tZVNjcmlwdCcgdG8gJyR7IHNvbWVTY3JpcHQgfSdcbi8vICAgICAgICB9XG4vL1xuLy8gICAgIFRoaXMgaXMgb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gYWxsb3cgZGF0YS1iaW5kIGF0dHJpYnV0ZXMgdG8gcmVmZXJlbmNlIGFyYml0cmFyeSB0ZW1wbGF0ZSB2YXJpYWJsZXMuXG4vLyAgICAgSWYgeW91IGRvbid0IHdhbnQgdG8gYWxsb3cgdGhhdCwgeW91IGNhbiBzZXQgdGhlIHByb3BlcnR5ICdhbGxvd1RlbXBsYXRlUmV3cml0aW5nJyB0byBmYWxzZSAobGlrZSBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSBkb2VzKVxuLy8gICAgIGFuZCB0aGVuIHlvdSBkb24ndCBuZWVkIHRvIG92ZXJyaWRlICdjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2snLlxuXG5rby50ZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHsgfTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZW5kZXJUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24gKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk92ZXJyaWRlIHJlbmRlclRlbXBsYXRlU291cmNlXCIpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2snXSA9IGZ1bmN0aW9uIChzY3JpcHQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPdmVycmlkZSBjcmVhdGVKYXZhU2NyaXB0RXZhbHVhdG9yQmxvY2tcIik7XG59O1xuXG5rby50ZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGVbJ21ha2VUZW1wbGF0ZVNvdXJjZSddID0gZnVuY3Rpb24odGVtcGxhdGUsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICAvLyBOYW1lZCB0ZW1wbGF0ZVxuICAgIGlmICh0eXBlb2YgdGVtcGxhdGUgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0ZW1wbGF0ZURvY3VtZW50ID0gdGVtcGxhdGVEb2N1bWVudCB8fCBkb2N1bWVudDtcbiAgICAgICAgdmFyIGVsZW0gPSB0ZW1wbGF0ZURvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlKTtcbiAgICAgICAgaWYgKCFlbGVtKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgdGVtcGxhdGUgd2l0aCBJRCBcIiArIHRlbXBsYXRlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudChlbGVtKTtcbiAgICB9IGVsc2UgaWYgKCh0ZW1wbGF0ZS5ub2RlVHlwZSA9PSAxKSB8fCAodGVtcGxhdGUubm9kZVR5cGUgPT0gOCkpIHtcbiAgICAgICAgLy8gQW5vbnltb3VzIHRlbXBsYXRlXG4gICAgICAgIHJldHVybiBuZXcga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICB9IGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0ZW1wbGF0ZSB0eXBlOiBcIiArIHRlbXBsYXRlKTtcbn07XG5cbmtvLnRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsncmVuZGVyVGVtcGxhdGUnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICB2YXIgdGVtcGxhdGVTb3VyY2UgPSB0aGlzWydtYWtlVGVtcGxhdGVTb3VyY2UnXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudCk7XG4gICAgcmV0dXJuIHRoaXNbJ3JlbmRlclRlbXBsYXRlU291cmNlJ10odGVtcGxhdGVTb3VyY2UsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zKTtcbn07XG5cbmtvLnRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsnaXNUZW1wbGF0ZVJld3JpdHRlbiddID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KSB7XG4gICAgLy8gU2tpcCByZXdyaXRpbmcgaWYgcmVxdWVzdGVkXG4gICAgaWYgKHRoaXNbJ2FsbG93VGVtcGxhdGVSZXdyaXRpbmcnXSA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIHJldHVybiB0aGlzWydtYWtlVGVtcGxhdGVTb3VyY2UnXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudClbJ2RhdGEnXShcImlzUmV3cml0dGVuXCIpO1xufTtcblxua28udGVtcGxhdGVFbmdpbmUucHJvdG90eXBlWydyZXdyaXRlVGVtcGxhdGUnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgcmV3cml0ZXJDYWxsYmFjaywgdGVtcGxhdGVEb2N1bWVudCkge1xuICAgIHZhciB0ZW1wbGF0ZVNvdXJjZSA9IHRoaXNbJ21ha2VUZW1wbGF0ZVNvdXJjZSddKHRlbXBsYXRlLCB0ZW1wbGF0ZURvY3VtZW50KTtcbiAgICB2YXIgcmV3cml0dGVuID0gcmV3cml0ZXJDYWxsYmFjayh0ZW1wbGF0ZVNvdXJjZVsndGV4dCddKCkpO1xuICAgIHRlbXBsYXRlU291cmNlWyd0ZXh0J10ocmV3cml0dGVuKTtcbiAgICB0ZW1wbGF0ZVNvdXJjZVsnZGF0YSddKFwiaXNSZXdyaXR0ZW5cIiwgdHJ1ZSk7XG59O1xuXG5rby5leHBvcnRTeW1ib2woJ3RlbXBsYXRlRW5naW5lJywga28udGVtcGxhdGVFbmdpbmUpO1xuXG5rby50ZW1wbGF0ZVJld3JpdGluZyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1lbW9pemVEYXRhQmluZGluZ0F0dHJpYnV0ZVN5bnRheFJlZ2V4ID0gLyg8KFthLXpdK1xcZCopKD86XFxzKyg/IWRhdGEtYmluZFxccyo9XFxzKilbYS16MC05XFwtXSsoPzo9KD86XFxcIlteXFxcIl0qXFxcInxcXCdbXlxcJ10qXFwnKSk/KSpcXHMrKWRhdGEtYmluZFxccyo9XFxzKihbXCInXSkoW1xcc1xcU10qPylcXDMvZ2k7XG4gICAgdmFyIG1lbW9pemVWaXJ0dWFsQ29udGFpbmVyQmluZGluZ1N5bnRheFJlZ2V4ID0gLzwhLS1cXHMqa29cXGJcXHMqKFtcXHNcXFNdKj8pXFxzKi0tPi9nO1xuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVEYXRhQmluZFZhbHVlc0ZvclJld3JpdGluZyhrZXlWYWx1ZUFycmF5KSB7XG4gICAgICAgIHZhciBhbGxWYWxpZGF0b3JzID0ga28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsdWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGtleVZhbHVlQXJyYXlbaV1bJ2tleSddO1xuICAgICAgICAgICAgaWYgKGFsbFZhbGlkYXRvcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSBhbGxWYWxpZGF0b3JzW2tleV07XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbGlkYXRvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwb3NzaWJsZUVycm9yTWVzc2FnZSA9IHZhbGlkYXRvcihrZXlWYWx1ZUFycmF5W2ldWyd2YWx1ZSddKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlRXJyb3JNZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHBvc3NpYmxlRXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF2YWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyB0ZW1wbGF0ZSBlbmdpbmUgZG9lcyBub3Qgc3VwcG9ydCB0aGUgJ1wiICsga2V5ICsgXCInIGJpbmRpbmcgd2l0aGluIGl0cyB0ZW1wbGF0ZXNcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uc3RydWN0TWVtb2l6ZWRUYWdSZXBsYWNlbWVudChkYXRhQmluZEF0dHJpYnV0ZVZhbHVlLCB0YWdUb1JldGFpbiwgbm9kZU5hbWUsIHRlbXBsYXRlRW5naW5lKSB7XG4gICAgICAgIHZhciBkYXRhQmluZEtleVZhbHVlQXJyYXkgPSBrby5leHByZXNzaW9uUmV3cml0aW5nLnBhcnNlT2JqZWN0TGl0ZXJhbChkYXRhQmluZEF0dHJpYnV0ZVZhbHVlKTtcbiAgICAgICAgdmFsaWRhdGVEYXRhQmluZFZhbHVlc0ZvclJld3JpdGluZyhkYXRhQmluZEtleVZhbHVlQXJyYXkpO1xuICAgICAgICB2YXIgcmV3cml0dGVuRGF0YUJpbmRBdHRyaWJ1dGVWYWx1ZSA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucHJlUHJvY2Vzc0JpbmRpbmdzKGRhdGFCaW5kS2V5VmFsdWVBcnJheSwgeyd2YWx1ZUFjY2Vzc29ycyc6dHJ1ZX0pO1xuXG4gICAgICAgIC8vIEZvciBubyBvYnZpb3VzIHJlYXNvbiwgT3BlcmEgZmFpbHMgdG8gZXZhbHVhdGUgcmV3cml0dGVuRGF0YUJpbmRBdHRyaWJ1dGVWYWx1ZSB1bmxlc3MgaXQncyB3cmFwcGVkIGluIGFuIGFkZGl0aW9uYWxcbiAgICAgICAgLy8gYW5vbnltb3VzIGZ1bmN0aW9uLCBldmVuIHRob3VnaCBPcGVyYSdzIGJ1aWx0LWluIGRlYnVnZ2VyIGNhbiBldmFsdWF0ZSBpdCBhbnl3YXkuIE5vIG90aGVyIGJyb3dzZXIgcmVxdWlyZXMgdGhpc1xuICAgICAgICAvLyBleHRyYSBpbmRpcmVjdGlvbi5cbiAgICAgICAgdmFyIGFwcGx5QmluZGluZ3NUb05leHRTaWJsaW5nU2NyaXB0ID1cbiAgICAgICAgICAgIFwia28uX190cl9hbWJ0bnMoZnVuY3Rpb24oJGNvbnRleHQsJGVsZW1lbnQpe3JldHVybihmdW5jdGlvbigpe3JldHVybnsgXCIgKyByZXdyaXR0ZW5EYXRhQmluZEF0dHJpYnV0ZVZhbHVlICsgXCIgfSB9KSgpfSwnXCIgKyBub2RlTmFtZS50b0xvd2VyQ2FzZSgpICsgXCInKVwiO1xuICAgICAgICByZXR1cm4gdGVtcGxhdGVFbmdpbmVbJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jayddKGFwcGx5QmluZGluZ3NUb05leHRTaWJsaW5nU2NyaXB0KSArIHRhZ1RvUmV0YWluO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGVuc3VyZVRlbXBsYXRlSXNSZXdyaXR0ZW46IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGVtcGxhdGVFbmdpbmUsIHRlbXBsYXRlRG9jdW1lbnQpIHtcbiAgICAgICAgICAgIGlmICghdGVtcGxhdGVFbmdpbmVbJ2lzVGVtcGxhdGVSZXdyaXR0ZW4nXSh0ZW1wbGF0ZSwgdGVtcGxhdGVEb2N1bWVudCkpXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVFbmdpbmVbJ3Jld3JpdGVUZW1wbGF0ZSddKHRlbXBsYXRlLCBmdW5jdGlvbiAoaHRtbFN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga28udGVtcGxhdGVSZXdyaXRpbmcubWVtb2l6ZUJpbmRpbmdBdHRyaWJ1dGVTeW50YXgoaHRtbFN0cmluZywgdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICAgICAgICAgIH0sIHRlbXBsYXRlRG9jdW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1lbW9pemVCaW5kaW5nQXR0cmlidXRlU3ludGF4OiBmdW5jdGlvbiAoaHRtbFN0cmluZywgdGVtcGxhdGVFbmdpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBodG1sU3RyaW5nLnJlcGxhY2UobWVtb2l6ZURhdGFCaW5kaW5nQXR0cmlidXRlU3ludGF4UmVnZXgsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc3RydWN0TWVtb2l6ZWRUYWdSZXBsYWNlbWVudCgvKiBkYXRhQmluZEF0dHJpYnV0ZVZhbHVlOiAqLyBhcmd1bWVudHNbNF0sIC8qIHRhZ1RvUmV0YWluOiAqLyBhcmd1bWVudHNbMV0sIC8qIG5vZGVOYW1lOiAqLyBhcmd1bWVudHNbMl0sIHRlbXBsYXRlRW5naW5lKTtcbiAgICAgICAgICAgIH0pLnJlcGxhY2UobWVtb2l6ZVZpcnR1YWxDb250YWluZXJCaW5kaW5nU3ludGF4UmVnZXgsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdHJ1Y3RNZW1vaXplZFRhZ1JlcGxhY2VtZW50KC8qIGRhdGFCaW5kQXR0cmlidXRlVmFsdWU6ICovIGFyZ3VtZW50c1sxXSwgLyogdGFnVG9SZXRhaW46ICovIFwiPCEtLSBrbyAtLT5cIiwgLyogbm9kZU5hbWU6ICovIFwiI2NvbW1lbnRcIiwgdGVtcGxhdGVFbmdpbmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwbHlNZW1vaXplZEJpbmRpbmdzVG9OZXh0U2libGluZzogZnVuY3Rpb24gKGJpbmRpbmdzLCBub2RlTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLm1lbW9pemF0aW9uLm1lbW9pemUoZnVuY3Rpb24gKGRvbU5vZGUsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGVUb0JpbmQgPSBkb21Ob2RlLm5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIGlmIChub2RlVG9CaW5kICYmIG5vZGVUb0JpbmQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAga28uYXBwbHlCaW5kaW5nQWNjZXNzb3JzVG9Ob2RlKG5vZGVUb0JpbmQsIGJpbmRpbmdzLCBiaW5kaW5nQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59KSgpO1xuXG5cbi8vIEV4cG9ydGVkIG9ubHkgYmVjYXVzZSBpdCBoYXMgdG8gYmUgcmVmZXJlbmNlZCBieSBzdHJpbmcgbG9va3VwIGZyb20gd2l0aGluIHJld3JpdHRlbiB0ZW1wbGF0ZVxua28uZXhwb3J0U3ltYm9sKCdfX3RyX2FtYnRucycsIGtvLnRlbXBsYXRlUmV3cml0aW5nLmFwcGx5TWVtb2l6ZWRCaW5kaW5nc1RvTmV4dFNpYmxpbmcpO1xuKGZ1bmN0aW9uKCkge1xuICAgIC8vIEEgdGVtcGxhdGUgc291cmNlIHJlcHJlc2VudHMgYSByZWFkL3dyaXRlIHdheSBvZiBhY2Nlc3NpbmcgYSB0ZW1wbGF0ZS4gVGhpcyBpcyB0byBlbGltaW5hdGUgdGhlIG5lZWQgZm9yIHRlbXBsYXRlIGxvYWRpbmcvc2F2aW5nXG4gICAgLy8gbG9naWMgdG8gYmUgZHVwbGljYXRlZCBpbiBldmVyeSB0ZW1wbGF0ZSBlbmdpbmUgKGFuZCBtZWFucyB0aGV5IGNhbiBhbGwgd29yayB3aXRoIGFub255bW91cyB0ZW1wbGF0ZXMsIGV0Yy4pXG4gICAgLy9cbiAgICAvLyBUd28gYXJlIHByb3ZpZGVkIGJ5IGRlZmF1bHQ6XG4gICAgLy8gIDEuIGtvLnRlbXBsYXRlU291cmNlcy5kb21FbGVtZW50ICAgICAgIC0gcmVhZHMvd3JpdGVzIHRoZSB0ZXh0IGNvbnRlbnQgb2YgYW4gYXJiaXRyYXJ5IERPTSBlbGVtZW50XG4gICAgLy8gIDIuIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNFbGVtZW50IC0gdXNlcyBrby51dGlscy5kb21EYXRhIHRvIHJlYWQvd3JpdGUgdGV4dCAqYXNzb2NpYXRlZCogd2l0aCB0aGUgRE9NIGVsZW1lbnQsIGJ1dFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGhvdXQgcmVhZGluZy93cml0aW5nIHRoZSBhY3R1YWwgZWxlbWVudCB0ZXh0IGNvbnRlbnQsIHNpbmNlIGl0IHdpbGwgYmUgb3ZlcndyaXR0ZW5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZSBvdXRwdXQuXG4gICAgLy8gWW91IGNhbiBpbXBsZW1lbnQgeW91ciBvd24gdGVtcGxhdGUgc291cmNlIGlmIHlvdSB3YW50IHRvIGZldGNoL3N0b3JlIHRlbXBsYXRlcyBzb21ld2hlcmUgb3RoZXIgdGhhbiBpbiBET00gZWxlbWVudHMuXG4gICAgLy8gVGVtcGxhdGUgc291cmNlcyBuZWVkIHRvIGhhdmUgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gICAgLy8gICB0ZXh0KCkgXHRcdFx0LSByZXR1cm5zIHRoZSB0ZW1wbGF0ZSB0ZXh0IGZyb20geW91ciBzdG9yYWdlIGxvY2F0aW9uXG4gICAgLy8gICB0ZXh0KHZhbHVlKVx0XHQtIHdyaXRlcyB0aGUgc3VwcGxpZWQgdGVtcGxhdGUgdGV4dCB0byB5b3VyIHN0b3JhZ2UgbG9jYXRpb25cbiAgICAvLyAgIGRhdGEoa2V5KVx0XHRcdC0gcmVhZHMgdmFsdWVzIHN0b3JlZCB1c2luZyBkYXRhKGtleSwgdmFsdWUpIC0gc2VlIGJlbG93XG4gICAgLy8gICBkYXRhKGtleSwgdmFsdWUpXHQtIGFzc29jaWF0ZXMgXCJ2YWx1ZVwiIHdpdGggdGhpcyB0ZW1wbGF0ZSBhbmQgdGhlIGtleSBcImtleVwiLiBJcyB1c2VkIHRvIHN0b3JlIGluZm9ybWF0aW9uIGxpa2UgXCJpc1Jld3JpdHRlblwiLlxuICAgIC8vXG4gICAgLy8gT3B0aW9uYWxseSwgdGVtcGxhdGUgc291cmNlcyBjYW4gYWxzbyBoYXZlIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICAgIC8vICAgbm9kZXMoKSAgICAgICAgICAgIC0gcmV0dXJucyBhIERPTSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG5vZGVzIG9mIHRoaXMgdGVtcGxhdGUsIHdoZXJlIGF2YWlsYWJsZVxuICAgIC8vICAgbm9kZXModmFsdWUpICAgICAgIC0gd3JpdGVzIHRoZSBnaXZlbiBET00gZWxlbWVudCB0byB5b3VyIHN0b3JhZ2UgbG9jYXRpb25cbiAgICAvLyBJZiBhIERPTSBlbGVtZW50IGlzIGF2YWlsYWJsZSBmb3IgYSBnaXZlbiB0ZW1wbGF0ZSBzb3VyY2UsIHRlbXBsYXRlIGVuZ2luZXMgYXJlIGVuY291cmFnZWQgdG8gdXNlIGl0IGluIHByZWZlcmVuY2Ugb3ZlciB0ZXh0KClcbiAgICAvLyBmb3IgaW1wcm92ZWQgc3BlZWQuIEhvd2V2ZXIsIGFsbCB0ZW1wbGF0ZVNvdXJjZXMgbXVzdCBzdXBwbHkgdGV4dCgpIGV2ZW4gaWYgdGhleSBkb24ndCBzdXBwbHkgbm9kZXMoKS5cbiAgICAvL1xuICAgIC8vIE9uY2UgeW91J3ZlIGltcGxlbWVudGVkIGEgdGVtcGxhdGVTb3VyY2UsIG1ha2UgeW91ciB0ZW1wbGF0ZSBlbmdpbmUgdXNlIGl0IGJ5IHN1YmNsYXNzaW5nIHdoYXRldmVyIHRlbXBsYXRlIGVuZ2luZSB5b3Ugd2VyZVxuICAgIC8vIHVzaW5nIGFuZCBvdmVycmlkaW5nIFwibWFrZVRlbXBsYXRlU291cmNlXCIgdG8gcmV0dXJuIGFuIGluc3RhbmNlIG9mIHlvdXIgY3VzdG9tIHRlbXBsYXRlIHNvdXJjZS5cblxuICAgIGtvLnRlbXBsYXRlU291cmNlcyA9IHt9O1xuXG4gICAgLy8gLS0tLSBrby50ZW1wbGF0ZVNvdXJjZXMuZG9tRWxlbWVudCAtLS0tLVxuXG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWyd0ZXh0J10gPSBmdW5jdGlvbigvKiB2YWx1ZVRvV3JpdGUgKi8pIHtcbiAgICAgICAgdmFyIHRhZ05hbWVMb3dlciA9IGtvLnV0aWxzLnRhZ05hbWVMb3dlcih0aGlzLmRvbUVsZW1lbnQpLFxuICAgICAgICAgICAgZWxlbUNvbnRlbnRzUHJvcGVydHkgPSB0YWdOYW1lTG93ZXIgPT09IFwic2NyaXB0XCIgPyBcInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0YWdOYW1lTG93ZXIgPT09IFwidGV4dGFyZWFcIiA/IFwidmFsdWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcImlubmVySFRNTFwiO1xuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRvbUVsZW1lbnRbZWxlbUNvbnRlbnRzUHJvcGVydHldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGlmIChlbGVtQ29udGVudHNQcm9wZXJ0eSA9PT0gXCJpbm5lckhUTUxcIilcbiAgICAgICAgICAgICAgICBrby51dGlscy5zZXRIdG1sKHRoaXMuZG9tRWxlbWVudCwgdmFsdWVUb1dyaXRlKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmRvbUVsZW1lbnRbZWxlbUNvbnRlbnRzUHJvcGVydHldID0gdmFsdWVUb1dyaXRlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkYXRhRG9tRGF0YVByZWZpeCA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpICsgXCJfXCI7XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWydkYXRhJ10gPSBmdW5jdGlvbihrZXkgLyosIHZhbHVlVG9Xcml0ZSAqLykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGtvLnV0aWxzLmRvbURhdGEuZ2V0KHRoaXMuZG9tRWxlbWVudCwgZGF0YURvbURhdGFQcmVmaXggKyBrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQodGhpcy5kb21FbGVtZW50LCBkYXRhRG9tRGF0YVByZWZpeCArIGtleSwgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyAtLS0tIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZSAtLS0tLVxuICAgIC8vIEFub255bW91cyB0ZW1wbGF0ZXMgYXJlIG5vcm1hbGx5IHNhdmVkL3JldHJpZXZlZCBhcyBET00gbm9kZXMgdGhyb3VnaCBcIm5vZGVzXCIuXG4gICAgLy8gRm9yIGNvbXBhdGliaWxpdHksIHlvdSBjYW4gYWxzbyByZWFkIFwidGV4dFwiOyBpdCB3aWxsIGJlIHNlcmlhbGl6ZWQgZnJvbSB0aGUgbm9kZXMgb24gZGVtYW5kLlxuICAgIC8vIFdyaXRpbmcgdG8gXCJ0ZXh0XCIgaXMgc3RpbGwgc3VwcG9ydGVkLCBidXQgdGhlbiB0aGUgdGVtcGxhdGUgZGF0YSB3aWxsIG5vdCBiZSBhdmFpbGFibGUgYXMgRE9NIG5vZGVzLlxuXG4gICAgdmFyIGFub255bW91c1RlbXBsYXRlc0RvbURhdGFLZXkgPSBrby51dGlscy5kb21EYXRhLm5leHRLZXkoKTtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZS5wcm90b3R5cGUgPSBuZXcga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQoKTtcbiAgICBrby50ZW1wbGF0ZVNvdXJjZXMuYW5vbnltb3VzVGVtcGxhdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0ga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlO1xuICAgIGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZS5wcm90b3R5cGVbJ3RleHQnXSA9IGZ1bmN0aW9uKC8qIHZhbHVlVG9Xcml0ZSAqLykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICB2YXIgdGVtcGxhdGVEYXRhID0ga28udXRpbHMuZG9tRGF0YS5nZXQodGhpcy5kb21FbGVtZW50LCBhbm9ueW1vdXNUZW1wbGF0ZXNEb21EYXRhS2V5KSB8fCB7fTtcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZURhdGEudGV4dERhdGEgPT09IHVuZGVmaW5lZCAmJiB0ZW1wbGF0ZURhdGEuY29udGFpbmVyRGF0YSlcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZURhdGEudGV4dERhdGEgPSB0ZW1wbGF0ZURhdGEuY29udGFpbmVyRGF0YS5pbm5lckhUTUw7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGVEYXRhLnRleHREYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KHRoaXMuZG9tRWxlbWVudCwgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSwge3RleHREYXRhOiB2YWx1ZVRvV3JpdGV9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQucHJvdG90eXBlWydub2RlcyddID0gZnVuY3Rpb24oLyogdmFsdWVUb1dyaXRlICovKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZURhdGEgPSBrby51dGlscy5kb21EYXRhLmdldCh0aGlzLmRvbUVsZW1lbnQsIGFub255bW91c1RlbXBsYXRlc0RvbURhdGFLZXkpIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlRGF0YS5jb250YWluZXJEYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHZhbHVlVG9Xcml0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KHRoaXMuZG9tRWxlbWVudCwgYW5vbnltb3VzVGVtcGxhdGVzRG9tRGF0YUtleSwge2NvbnRhaW5lckRhdGE6IHZhbHVlVG9Xcml0ZX0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVTb3VyY2VzJywga28udGVtcGxhdGVTb3VyY2VzKTtcbiAgICBrby5leHBvcnRTeW1ib2woJ3RlbXBsYXRlU291cmNlcy5kb21FbGVtZW50Jywga28udGVtcGxhdGVTb3VyY2VzLmRvbUVsZW1lbnQpO1xuICAgIGtvLmV4cG9ydFN5bWJvbCgndGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlJywga28udGVtcGxhdGVTb3VyY2VzLmFub255bW91c1RlbXBsYXRlKTtcbn0pKCk7XG4oZnVuY3Rpb24gKCkge1xuICAgIHZhciBfdGVtcGxhdGVFbmdpbmU7XG4gICAga28uc2V0VGVtcGxhdGVFbmdpbmUgPSBmdW5jdGlvbiAodGVtcGxhdGVFbmdpbmUpIHtcbiAgICAgICAgaWYgKCh0ZW1wbGF0ZUVuZ2luZSAhPSB1bmRlZmluZWQpICYmICEodGVtcGxhdGVFbmdpbmUgaW5zdGFuY2VvZiBrby50ZW1wbGF0ZUVuZ2luZSkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0ZW1wbGF0ZUVuZ2luZSBtdXN0IGluaGVyaXQgZnJvbSBrby50ZW1wbGF0ZUVuZ2luZVwiKTtcbiAgICAgICAgX3RlbXBsYXRlRW5naW5lID0gdGVtcGxhdGVFbmdpbmU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW52b2tlRm9yRWFjaE5vZGVJbkNvbnRpbnVvdXNSYW5nZShmaXJzdE5vZGUsIGxhc3ROb2RlLCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIG5vZGUsIG5leHRJblF1ZXVlID0gZmlyc3ROb2RlLCBmaXJzdE91dE9mUmFuZ2VOb2RlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKGxhc3ROb2RlKTtcbiAgICAgICAgd2hpbGUgKG5leHRJblF1ZXVlICYmICgobm9kZSA9IG5leHRJblF1ZXVlKSAhPT0gZmlyc3RPdXRPZlJhbmdlTm9kZSkpIHtcbiAgICAgICAgICAgIG5leHRJblF1ZXVlID0ga28udmlydHVhbEVsZW1lbnRzLm5leHRTaWJsaW5nKG5vZGUpO1xuICAgICAgICAgICAgYWN0aW9uKG5vZGUsIG5leHRJblF1ZXVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFjdGl2YXRlQmluZGluZ3NPbkNvbnRpbnVvdXNOb2RlQXJyYXkoY29udGludW91c05vZGVBcnJheSwgYmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgLy8gVG8gYmUgdXNlZCBvbiBhbnkgbm9kZXMgdGhhdCBoYXZlIGJlZW4gcmVuZGVyZWQgYnkgYSB0ZW1wbGF0ZSBhbmQgaGF2ZSBiZWVuIGluc2VydGVkIGludG8gc29tZSBwYXJlbnQgZWxlbWVudFxuICAgICAgICAvLyBXYWxrcyB0aHJvdWdoIGNvbnRpbnVvdXNOb2RlQXJyYXkgKHdoaWNoICptdXN0KiBiZSBjb250aW51b3VzLCBpLmUuLCBhbiB1bmludGVycnVwdGVkIHNlcXVlbmNlIG9mIHNpYmxpbmcgbm9kZXMsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIGFsZ29yaXRobSBmb3Igd2Fsa2luZyB0aGVtIHJlbGllcyBvbiB0aGlzKSwgYW5kIGZvciBlYWNoIHRvcC1sZXZlbCBpdGVtIGluIHRoZSB2aXJ0dWFsLWVsZW1lbnQgc2Vuc2UsXG4gICAgICAgIC8vICgxKSBEb2VzIGEgcmVndWxhciBcImFwcGx5QmluZGluZ3NcIiB0byBhc3NvY2lhdGUgYmluZGluZ0NvbnRleHQgd2l0aCB0aGlzIG5vZGUgYW5kIHRvIGFjdGl2YXRlIGFueSBub24tbWVtb2l6ZWQgYmluZGluZ3NcbiAgICAgICAgLy8gKDIpIFVubWVtb2l6ZXMgYW55IG1lbW9zIGluIHRoZSBET00gc3VidHJlZSAoZS5nLiwgdG8gYWN0aXZhdGUgYmluZGluZ3MgdGhhdCBoYWQgYmVlbiBtZW1vaXplZCBkdXJpbmcgdGVtcGxhdGUgcmV3cml0aW5nKVxuXG4gICAgICAgIGlmIChjb250aW51b3VzTm9kZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGZpcnN0Tm9kZSA9IGNvbnRpbnVvdXNOb2RlQXJyYXlbMF0sXG4gICAgICAgICAgICAgICAgbGFzdE5vZGUgPSBjb250aW51b3VzTm9kZUFycmF5W2NvbnRpbnVvdXNOb2RlQXJyYXkubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGZpcnN0Tm9kZS5wYXJlbnROb2RlLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyID0ga28uYmluZGluZ1Byb3ZpZGVyWydpbnN0YW5jZSddLFxuICAgICAgICAgICAgICAgIHByZXByb2Nlc3NOb2RlID0gcHJvdmlkZXJbJ3ByZXByb2Nlc3NOb2RlJ107XG5cbiAgICAgICAgICAgIGlmIChwcmVwcm9jZXNzTm9kZSkge1xuICAgICAgICAgICAgICAgIGludm9rZUZvckVhY2hOb2RlSW5Db250aW51b3VzUmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSwgZnVuY3Rpb24obm9kZSwgbmV4dE5vZGVJblJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlUHJldmlvdXNTaWJsaW5nID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdOb2RlcyA9IHByZXByb2Nlc3NOb2RlLmNhbGwocHJvdmlkZXIsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlID09PSBmaXJzdE5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROb2RlID0gbmV3Tm9kZXNbMF0gfHwgbmV4dE5vZGVJblJhbmdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUgPT09IGxhc3ROb2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROb2RlID0gbmV3Tm9kZXNbbmV3Tm9kZXMubGVuZ3RoIC0gMV0gfHwgbm9kZVByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gQmVjYXVzZSBwcmVwcm9jZXNzTm9kZSBjYW4gY2hhbmdlIHRoZSBub2RlcywgaW5jbHVkaW5nIHRoZSBmaXJzdCBhbmQgbGFzdCBub2RlcywgdXBkYXRlIGNvbnRpbnVvdXNOb2RlQXJyYXkgdG8gbWF0Y2guXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0aGUgZnVsbCBzZXQsIGluY2x1ZGluZyBpbm5lciBub2RlcywgYmVjYXVzZSB0aGUgdW5tZW1vaXplIHN0ZXAgbWlnaHQgcmVtb3ZlIHRoZSBmaXJzdCBub2RlIChhbmQgc28gdGhlIHJlYWxcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBub2RlIG5lZWRzIHRvIGJlIGluIHRoZSBhcnJheSkuXG4gICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgIGlmICghZmlyc3ROb2RlKSB7IC8vIHByZXByb2Nlc3NOb2RlIG1pZ2h0IGhhdmUgcmVtb3ZlZCBhbGwgdGhlIG5vZGVzLCBpbiB3aGljaCBjYXNlIHRoZXJlJ3Mgbm90aGluZyBsZWZ0IHRvIGRvXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Tm9kZSA9PT0gbGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5wdXNoKGZpcnN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludW91c05vZGVBcnJheS5wdXNoKGZpcnN0Tm9kZSwgbGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBrby51dGlscy5maXhVcENvbnRpbnVvdXNOb2RlQXJyYXkoY29udGludW91c05vZGVBcnJheSwgcGFyZW50Tm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOZWVkIHRvIGFwcGx5QmluZGluZ3MgKmJlZm9yZSogdW5tZW1vemlhdGlvbiwgYmVjYXVzZSB1bm1lbW9pemF0aW9uIG1pZ2h0IGludHJvZHVjZSBleHRyYSBub2RlcyAodGhhdCB3ZSBkb24ndCB3YW50IHRvIHJlLWJpbmQpXG4gICAgICAgICAgICAvLyB3aGVyZWFzIGEgcmVndWxhciBhcHBseUJpbmRpbmdzIHdvbid0IGludHJvZHVjZSBuZXcgbWVtb2l6ZWQgbm9kZXNcbiAgICAgICAgICAgIGludm9rZUZvckVhY2hOb2RlSW5Db250aW51b3VzUmFuZ2UoZmlyc3ROb2RlLCBsYXN0Tm9kZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxIHx8IG5vZGUubm9kZVR5cGUgPT09IDgpXG4gICAgICAgICAgICAgICAgICAgIGtvLmFwcGx5QmluZGluZ3MoYmluZGluZ0NvbnRleHQsIG5vZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbnZva2VGb3JFYWNoTm9kZUluQ29udGludW91c1JhbmdlKGZpcnN0Tm9kZSwgbGFzdE5vZGUsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSB8fCBub2RlLm5vZGVUeXBlID09PSA4KVxuICAgICAgICAgICAgICAgICAgICBrby5tZW1vaXphdGlvbi51bm1lbW9pemVEb21Ob2RlQW5kRGVzY2VuZGFudHMobm9kZSwgW2JpbmRpbmdDb250ZXh0XSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIGFueSBjaGFuZ2VzIGRvbmUgYnkgYXBwbHlCaW5kaW5ncyBvciB1bm1lbW9pemUgYXJlIHJlZmxlY3RlZCBpbiB0aGUgYXJyYXlcbiAgICAgICAgICAgIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShjb250aW51b3VzTm9kZUFycmF5LCBwYXJlbnROb2RlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEZpcnN0Tm9kZUZyb21Qb3NzaWJsZUFycmF5KG5vZGVPck5vZGVBcnJheSkge1xuICAgICAgICByZXR1cm4gbm9kZU9yTm9kZUFycmF5Lm5vZGVUeXBlID8gbm9kZU9yTm9kZUFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBub2RlT3JOb2RlQXJyYXkubGVuZ3RoID4gMCA/IG5vZGVPck5vZGVBcnJheVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleGVjdXRlVGVtcGxhdGUodGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJNb2RlLCB0ZW1wbGF0ZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHZhciBmaXJzdFRhcmdldE5vZGUgPSB0YXJnZXROb2RlT3JOb2RlQXJyYXkgJiYgZ2V0Rmlyc3ROb2RlRnJvbVBvc3NpYmxlQXJyYXkodGFyZ2V0Tm9kZU9yTm9kZUFycmF5KTtcbiAgICAgICAgdmFyIHRlbXBsYXRlRG9jdW1lbnQgPSBmaXJzdFRhcmdldE5vZGUgJiYgZmlyc3RUYXJnZXROb2RlLm93bmVyRG9jdW1lbnQ7XG4gICAgICAgIHZhciB0ZW1wbGF0ZUVuZ2luZVRvVXNlID0gKG9wdGlvbnNbJ3RlbXBsYXRlRW5naW5lJ10gfHwgX3RlbXBsYXRlRW5naW5lKTtcbiAgICAgICAga28udGVtcGxhdGVSZXdyaXRpbmcuZW5zdXJlVGVtcGxhdGVJc1Jld3JpdHRlbih0ZW1wbGF0ZSwgdGVtcGxhdGVFbmdpbmVUb1VzZSwgdGVtcGxhdGVEb2N1bWVudCk7XG4gICAgICAgIHZhciByZW5kZXJlZE5vZGVzQXJyYXkgPSB0ZW1wbGF0ZUVuZ2luZVRvVXNlWydyZW5kZXJUZW1wbGF0ZSddKHRlbXBsYXRlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucywgdGVtcGxhdGVEb2N1bWVudCk7XG5cbiAgICAgICAgLy8gTG9vc2VseSBjaGVjayByZXN1bHQgaXMgYW4gYXJyYXkgb2YgRE9NIG5vZGVzXG4gICAgICAgIGlmICgodHlwZW9mIHJlbmRlcmVkTm9kZXNBcnJheS5sZW5ndGggIT0gXCJudW1iZXJcIikgfHwgKHJlbmRlcmVkTm9kZXNBcnJheS5sZW5ndGggPiAwICYmIHR5cGVvZiByZW5kZXJlZE5vZGVzQXJyYXlbMF0ubm9kZVR5cGUgIT0gXCJudW1iZXJcIikpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUZW1wbGF0ZSBlbmdpbmUgbXVzdCByZXR1cm4gYW4gYXJyYXkgb2YgRE9NIG5vZGVzXCIpO1xuXG4gICAgICAgIHZhciBoYXZlQWRkZWROb2Rlc1RvUGFyZW50ID0gZmFsc2U7XG4gICAgICAgIHN3aXRjaCAocmVuZGVyTW9kZSkge1xuICAgICAgICAgICAgY2FzZSBcInJlcGxhY2VDaGlsZHJlblwiOlxuICAgICAgICAgICAgICAgIGtvLnZpcnR1YWxFbGVtZW50cy5zZXREb21Ob2RlQ2hpbGRyZW4odGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJlZE5vZGVzQXJyYXkpO1xuICAgICAgICAgICAgICAgIGhhdmVBZGRlZE5vZGVzVG9QYXJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInJlcGxhY2VOb2RlXCI6XG4gICAgICAgICAgICAgICAga28udXRpbHMucmVwbGFjZURvbU5vZGVzKHRhcmdldE5vZGVPck5vZGVBcnJheSwgcmVuZGVyZWROb2Rlc0FycmF5KTtcbiAgICAgICAgICAgICAgICBoYXZlQWRkZWROb2Rlc1RvUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpZ25vcmVUYXJnZXROb2RlXCI6IGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHJlbmRlck1vZGU6IFwiICsgcmVuZGVyTW9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGF2ZUFkZGVkTm9kZXNUb1BhcmVudCkge1xuICAgICAgICAgICAgYWN0aXZhdGVCaW5kaW5nc09uQ29udGludW91c05vZGVBcnJheShyZW5kZXJlZE5vZGVzQXJyYXksIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zWydhZnRlclJlbmRlciddKVxuICAgICAgICAgICAgICAgIGtvLmRlcGVuZGVuY3lEZXRlY3Rpb24uaWdub3JlKG9wdGlvbnNbJ2FmdGVyUmVuZGVyJ10sIG51bGwsIFtyZW5kZXJlZE5vZGVzQXJyYXksIGJpbmRpbmdDb250ZXh0WyckZGF0YSddXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVuZGVyZWROb2Rlc0FycmF5O1xuICAgIH1cblxuICAgIGtvLnJlbmRlclRlbXBsYXRlID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBkYXRhT3JCaW5kaW5nQ29udGV4dCwgb3B0aW9ucywgdGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJNb2RlKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBpZiAoKG9wdGlvbnNbJ3RlbXBsYXRlRW5naW5lJ10gfHwgX3RlbXBsYXRlRW5naW5lKSA9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXQgYSB0ZW1wbGF0ZSBlbmdpbmUgYmVmb3JlIGNhbGxpbmcgcmVuZGVyVGVtcGxhdGVcIik7XG4gICAgICAgIHJlbmRlck1vZGUgPSByZW5kZXJNb2RlIHx8IFwicmVwbGFjZUNoaWxkcmVuXCI7XG5cbiAgICAgICAgaWYgKHRhcmdldE5vZGVPck5vZGVBcnJheSkge1xuICAgICAgICAgICAgdmFyIGZpcnN0VGFyZ2V0Tm9kZSA9IGdldEZpcnN0Tm9kZUZyb21Qb3NzaWJsZUFycmF5KHRhcmdldE5vZGVPck5vZGVBcnJheSk7XG5cbiAgICAgICAgICAgIHZhciB3aGVuVG9EaXNwb3NlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gKCFmaXJzdFRhcmdldE5vZGUpIHx8ICFrby51dGlscy5kb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQoZmlyc3RUYXJnZXROb2RlKTsgfTsgLy8gUGFzc2l2ZSBkaXNwb3NhbCAob24gbmV4dCBldmFsdWF0aW9uKVxuICAgICAgICAgICAgdmFyIGFjdGl2ZWx5RGlzcG9zZVdoZW5Ob2RlSXNSZW1vdmVkID0gKGZpcnN0VGFyZ2V0Tm9kZSAmJiByZW5kZXJNb2RlID09IFwicmVwbGFjZU5vZGVcIikgPyBmaXJzdFRhcmdldE5vZGUucGFyZW50Tm9kZSA6IGZpcnN0VGFyZ2V0Tm9kZTtcblxuICAgICAgICAgICAgcmV0dXJuIGtvLmRlcGVuZGVudE9ic2VydmFibGUoIC8vIFNvIHRoZSBET00gaXMgYXV0b21hdGljYWxseSB1cGRhdGVkIHdoZW4gYW55IGRlcGVuZGVuY3kgY2hhbmdlc1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIHdlJ3ZlIGdvdCBhIHByb3BlciBiaW5kaW5nIGNvbnRleHQgdG8gd29yayB3aXRoXG4gICAgICAgICAgICAgICAgICAgIHZhciBiaW5kaW5nQ29udGV4dCA9IChkYXRhT3JCaW5kaW5nQ29udGV4dCAmJiAoZGF0YU9yQmluZGluZ0NvbnRleHQgaW5zdGFuY2VvZiBrby5iaW5kaW5nQ29udGV4dCkpXG4gICAgICAgICAgICAgICAgICAgICAgICA/IGRhdGFPckJpbmRpbmdDb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyBrby5iaW5kaW5nQ29udGV4dChrby51dGlscy51bndyYXBPYnNlcnZhYmxlKGRhdGFPckJpbmRpbmdDb250ZXh0KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU3VwcG9ydCBzZWxlY3RpbmcgdGVtcGxhdGUgYXMgYSBmdW5jdGlvbiBvZiB0aGUgZGF0YSBiZWluZyByZW5kZXJlZFxuICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVOYW1lID0ga28uaXNPYnNlcnZhYmxlKHRlbXBsYXRlKSA/IHRlbXBsYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIDogdHlwZW9mKHRlbXBsYXRlKSA9PSAnZnVuY3Rpb24nID8gdGVtcGxhdGUoYmluZGluZ0NvbnRleHRbJyRkYXRhJ10sIGJpbmRpbmdDb250ZXh0KSA6IHRlbXBsYXRlO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZW5kZXJlZE5vZGVzQXJyYXkgPSBleGVjdXRlVGVtcGxhdGUodGFyZ2V0Tm9kZU9yTm9kZUFycmF5LCByZW5kZXJNb2RlLCB0ZW1wbGF0ZU5hbWUsIGJpbmRpbmdDb250ZXh0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbmRlck1vZGUgPT0gXCJyZXBsYWNlTm9kZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROb2RlT3JOb2RlQXJyYXkgPSByZW5kZXJlZE5vZGVzQXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFRhcmdldE5vZGUgPSBnZXRGaXJzdE5vZGVGcm9tUG9zc2libGVBcnJheSh0YXJnZXROb2RlT3JOb2RlQXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHsgZGlzcG9zZVdoZW46IHdoZW5Ub0Rpc3Bvc2UsIGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogYWN0aXZlbHlEaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHlldCBoYXZlIGEgRE9NIG5vZGUgdG8gZXZhbHVhdGUsIHNvIHVzZSBhIG1lbW8gYW5kIHJlbmRlciB0aGUgdGVtcGxhdGUgbGF0ZXIgd2hlbiB0aGVyZSBpcyBhIERPTSBub2RlXG4gICAgICAgICAgICByZXR1cm4ga28ubWVtb2l6YXRpb24ubWVtb2l6ZShmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgICAgIGtvLnJlbmRlclRlbXBsYXRlKHRlbXBsYXRlLCBkYXRhT3JCaW5kaW5nQ29udGV4dCwgb3B0aW9ucywgZG9tTm9kZSwgXCJyZXBsYWNlTm9kZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGtvLnJlbmRlclRlbXBsYXRlRm9yRWFjaCA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgYXJyYXlPck9ic2VydmFibGVBcnJheSwgb3B0aW9ucywgdGFyZ2V0Tm9kZSwgcGFyZW50QmluZGluZ0NvbnRleHQpIHtcbiAgICAgICAgLy8gU2luY2Ugc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyBhbHdheXMgY2FsbHMgZXhlY3V0ZVRlbXBsYXRlRm9yQXJyYXlJdGVtIGFuZCB0aGVuXG4gICAgICAgIC8vIGFjdGl2YXRlQmluZGluZ3NDYWxsYmFjayBmb3IgYWRkZWQgaXRlbXMsIHdlIGNhbiBzdG9yZSB0aGUgYmluZGluZyBjb250ZXh0IGluIHRoZSBmb3JtZXIgdG8gdXNlIGluIHRoZSBsYXR0ZXIuXG4gICAgICAgIHZhciBhcnJheUl0ZW1Db250ZXh0O1xuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgYnkgc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyB0byBnZXQgdGhlIG5vZGVzIHRvIGFkZCB0byB0YXJnZXROb2RlXG4gICAgICAgIHZhciBleGVjdXRlVGVtcGxhdGVGb3JBcnJheUl0ZW0gPSBmdW5jdGlvbiAoYXJyYXlWYWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIC8vIFN1cHBvcnQgc2VsZWN0aW5nIHRlbXBsYXRlIGFzIGEgZnVuY3Rpb24gb2YgdGhlIGRhdGEgYmVpbmcgcmVuZGVyZWRcbiAgICAgICAgICAgIGFycmF5SXRlbUNvbnRleHQgPSBwYXJlbnRCaW5kaW5nQ29udGV4dFsnY3JlYXRlQ2hpbGRDb250ZXh0J10oYXJyYXlWYWx1ZSwgb3B0aW9uc1snYXMnXSwgZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHRbJyRpbmRleCddID0gaW5kZXg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZU5hbWUgPSB0eXBlb2YodGVtcGxhdGUpID09ICdmdW5jdGlvbicgPyB0ZW1wbGF0ZShhcnJheVZhbHVlLCBhcnJheUl0ZW1Db250ZXh0KSA6IHRlbXBsYXRlO1xuICAgICAgICAgICAgcmV0dXJuIGV4ZWN1dGVUZW1wbGF0ZShudWxsLCBcImlnbm9yZVRhcmdldE5vZGVcIiwgdGVtcGxhdGVOYW1lLCBhcnJheUl0ZW1Db250ZXh0LCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyBoYXMgYWRkZWQgbm9kZXMgdG8gdGFyZ2V0Tm9kZVxuICAgICAgICB2YXIgYWN0aXZhdGVCaW5kaW5nc0NhbGxiYWNrID0gZnVuY3Rpb24oYXJyYXlWYWx1ZSwgYWRkZWROb2Rlc0FycmF5LCBpbmRleCkge1xuICAgICAgICAgICAgYWN0aXZhdGVCaW5kaW5nc09uQ29udGludW91c05vZGVBcnJheShhZGRlZE5vZGVzQXJyYXksIGFycmF5SXRlbUNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnNbJ2FmdGVyUmVuZGVyJ10pXG4gICAgICAgICAgICAgICAgb3B0aW9uc1snYWZ0ZXJSZW5kZXInXShhZGRlZE5vZGVzQXJyYXksIGFycmF5VmFsdWUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBrby5kZXBlbmRlbnRPYnNlcnZhYmxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB1bndyYXBwZWRBcnJheSA9IGtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoYXJyYXlPck9ic2VydmFibGVBcnJheSkgfHwgW107XG4gICAgICAgICAgICBpZiAodHlwZW9mIHVud3JhcHBlZEFycmF5Lmxlbmd0aCA9PSBcInVuZGVmaW5lZFwiKSAvLyBDb2VyY2Ugc2luZ2xlIHZhbHVlIGludG8gYXJyYXlcbiAgICAgICAgICAgICAgICB1bndyYXBwZWRBcnJheSA9IFt1bndyYXBwZWRBcnJheV07XG5cbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYW55IGVudHJpZXMgbWFya2VkIGFzIGRlc3Ryb3llZFxuICAgICAgICAgICAgdmFyIGZpbHRlcmVkQXJyYXkgPSBrby51dGlscy5hcnJheUZpbHRlcih1bndyYXBwZWRBcnJheSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zWydpbmNsdWRlRGVzdHJveWVkJ10gfHwgaXRlbSA9PT0gdW5kZWZpbmVkIHx8IGl0ZW0gPT09IG51bGwgfHwgIWtvLnV0aWxzLnVud3JhcE9ic2VydmFibGUoaXRlbVsnX2Rlc3Ryb3knXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gQ2FsbCBzZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nLCBpZ25vcmluZyBhbnkgb2JzZXJ2YWJsZXMgdW53cmFwcGVkIHdpdGhpbiAobW9zdCBsaWtlbHkgZnJvbSBhIGNhbGxiYWNrIGZ1bmN0aW9uKS5cbiAgICAgICAgICAgIC8vIElmIHRoZSBhcnJheSBpdGVtcyBhcmUgb2JzZXJ2YWJsZXMsIHRob3VnaCwgdGhleSB3aWxsIGJlIHVud3JhcHBlZCBpbiBleGVjdXRlVGVtcGxhdGVGb3JBcnJheUl0ZW0gYW5kIG1hbmFnZWQgd2l0aGluIHNldERvbU5vZGVDaGlsZHJlbkZyb21BcnJheU1hcHBpbmcuXG4gICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShrby51dGlscy5zZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nLCBudWxsLCBbdGFyZ2V0Tm9kZSwgZmlsdGVyZWRBcnJheSwgZXhlY3V0ZVRlbXBsYXRlRm9yQXJyYXlJdGVtLCBvcHRpb25zLCBhY3RpdmF0ZUJpbmRpbmdzQ2FsbGJhY2tdKTtcblxuICAgICAgICB9LCBudWxsLCB7IGRpc3Bvc2VXaGVuTm9kZUlzUmVtb3ZlZDogdGFyZ2V0Tm9kZSB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHRlbXBsYXRlQ29tcHV0ZWREb21EYXRhS2V5ID0ga28udXRpbHMuZG9tRGF0YS5uZXh0S2V5KCk7XG4gICAgZnVuY3Rpb24gZGlzcG9zZU9sZENvbXB1dGVkQW5kU3RvcmVOZXdPbmUoZWxlbWVudCwgbmV3Q29tcHV0ZWQpIHtcbiAgICAgICAgdmFyIG9sZENvbXB1dGVkID0ga28udXRpbHMuZG9tRGF0YS5nZXQoZWxlbWVudCwgdGVtcGxhdGVDb21wdXRlZERvbURhdGFLZXkpO1xuICAgICAgICBpZiAob2xkQ29tcHV0ZWQgJiYgKHR5cGVvZihvbGRDb21wdXRlZC5kaXNwb3NlKSA9PSAnZnVuY3Rpb24nKSlcbiAgICAgICAgICAgIG9sZENvbXB1dGVkLmRpc3Bvc2UoKTtcbiAgICAgICAga28udXRpbHMuZG9tRGF0YS5zZXQoZWxlbWVudCwgdGVtcGxhdGVDb21wdXRlZERvbURhdGFLZXksIChuZXdDb21wdXRlZCAmJiBuZXdDb21wdXRlZC5pc0FjdGl2ZSgpKSA/IG5ld0NvbXB1dGVkIDogdW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICBrby5iaW5kaW5nSGFuZGxlcnNbJ3RlbXBsYXRlJ10gPSB7XG4gICAgICAgICdpbml0JzogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVBY2Nlc3Nvcikge1xuICAgICAgICAgICAgLy8gU3VwcG9ydCBhbm9ueW1vdXMgdGVtcGxhdGVzXG4gICAgICAgICAgICB2YXIgYmluZGluZ1ZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZSh2YWx1ZUFjY2Vzc29yKCkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiaW5kaW5nVmFsdWUgPT0gXCJzdHJpbmdcIiB8fCBiaW5kaW5nVmFsdWVbJ25hbWUnXSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYSBuYW1lZCB0ZW1wbGF0ZSAtIGNsZWFyIHRoZSBlbGVtZW50XG4gICAgICAgICAgICAgICAga28udmlydHVhbEVsZW1lbnRzLmVtcHR5Tm9kZShlbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBhbiBhbm9ueW1vdXMgdGVtcGxhdGUgLSBzdG9yZSB0aGUgZWxlbWVudCBjb250ZW50cywgdGhlbiBjbGVhciB0aGUgZWxlbWVudFxuICAgICAgICAgICAgICAgIHZhciB0ZW1wbGF0ZU5vZGVzID0ga28udmlydHVhbEVsZW1lbnRzLmNoaWxkTm9kZXMoZWxlbWVudCksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGtvLnV0aWxzLm1vdmVDbGVhbmVkTm9kZXNUb0NvbnRhaW5lckVsZW1lbnQodGVtcGxhdGVOb2Rlcyk7IC8vIFRoaXMgYWxzbyByZW1vdmVzIHRoZSBub2RlcyBmcm9tIHRoZWlyIGN1cnJlbnQgcGFyZW50XG4gICAgICAgICAgICAgICAgbmV3IGtvLnRlbXBsYXRlU291cmNlcy5hbm9ueW1vdXNUZW1wbGF0ZShlbGVtZW50KVsnbm9kZXMnXShjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgJ2NvbnRyb2xzRGVzY2VuZGFudEJpbmRpbmdzJzogdHJ1ZSB9O1xuICAgICAgICB9LFxuICAgICAgICAndXBkYXRlJzogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IsIGFsbEJpbmRpbmdzLCB2aWV3TW9kZWwsIGJpbmRpbmdDb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB2YWx1ZUFjY2Vzc29yKCksXG4gICAgICAgICAgICAgICAgZGF0YVZhbHVlLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlKSxcbiAgICAgICAgICAgICAgICBzaG91bGREaXNwbGF5ID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbXB1dGVkID0gbnVsbCxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVOYW1lID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZU5hbWUgPSBvcHRpb25zWyduYW1lJ107XG5cbiAgICAgICAgICAgICAgICAvLyBTdXBwb3J0IFwiaWZcIi9cImlmbm90XCIgY29uZGl0aW9uc1xuICAgICAgICAgICAgICAgIGlmICgnaWYnIGluIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZERpc3BsYXkgPSBrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG9wdGlvbnNbJ2lmJ10pO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGREaXNwbGF5ICYmICdpZm5vdCcgaW4gb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkRGlzcGxheSA9ICFrby51dGlscy51bndyYXBPYnNlcnZhYmxlKG9wdGlvbnNbJ2lmbm90J10pO1xuXG4gICAgICAgICAgICAgICAgZGF0YVZhbHVlID0ga28udXRpbHMudW53cmFwT2JzZXJ2YWJsZShvcHRpb25zWydkYXRhJ10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJ2ZvcmVhY2gnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgb25jZSBmb3IgZWFjaCBkYXRhIHBvaW50ICh0cmVhdGluZyBkYXRhIHNldCBhcyBlbXB0eSBpZiBzaG91bGREaXNwbGF5PT1mYWxzZSlcbiAgICAgICAgICAgICAgICB2YXIgZGF0YUFycmF5ID0gKHNob3VsZERpc3BsYXkgJiYgb3B0aW9uc1snZm9yZWFjaCddKSB8fCBbXTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZUNvbXB1dGVkID0ga28ucmVuZGVyVGVtcGxhdGVGb3JFYWNoKHRlbXBsYXRlTmFtZSB8fCBlbGVtZW50LCBkYXRhQXJyYXksIG9wdGlvbnMsIGVsZW1lbnQsIGJpbmRpbmdDb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXNob3VsZERpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuZW1wdHlOb2RlKGVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBSZW5kZXIgb25jZSBmb3IgdGhpcyBzaW5nbGUgZGF0YSBwb2ludCAob3IgdXNlIHRoZSB2aWV3TW9kZWwgaWYgbm8gZGF0YSB3YXMgcHJvdmlkZWQpXG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQmluZGluZ0NvbnRleHQgPSAoJ2RhdGEnIGluIG9wdGlvbnMpID9cbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ0NvbnRleHRbJ2NyZWF0ZUNoaWxkQ29udGV4dCddKGRhdGFWYWx1ZSwgb3B0aW9uc1snYXMnXSkgOiAgLy8gR2l2ZW4gYW4gZXhwbGl0aXQgJ2RhdGEnIHZhbHVlLCB3ZSBjcmVhdGUgYSBjaGlsZCBiaW5kaW5nIGNvbnRleHQgZm9yIGl0XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdDb250ZXh0OyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2l2ZW4gbm8gZXhwbGljaXQgJ2RhdGEnIHZhbHVlLCB3ZSByZXRhaW4gdGhlIHNhbWUgYmluZGluZyBjb250ZXh0XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVDb21wdXRlZCA9IGtvLnJlbmRlclRlbXBsYXRlKHRlbXBsYXRlTmFtZSB8fCBlbGVtZW50LCBpbm5lckJpbmRpbmdDb250ZXh0LCBvcHRpb25zLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSXQgb25seSBtYWtlcyBzZW5zZSB0byBoYXZlIGEgc2luZ2xlIHRlbXBsYXRlIGNvbXB1dGVkIHBlciBlbGVtZW50IChvdGhlcndpc2Ugd2hpY2ggb25lIHNob3VsZCBoYXZlIGl0cyBvdXRwdXQgZGlzcGxheWVkPylcbiAgICAgICAgICAgIGRpc3Bvc2VPbGRDb21wdXRlZEFuZFN0b3JlTmV3T25lKGVsZW1lbnQsIHRlbXBsYXRlQ29tcHV0ZWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFub255bW91cyB0ZW1wbGF0ZXMgY2FuJ3QgYmUgcmV3cml0dGVuLiBHaXZlIGEgbmljZSBlcnJvciBtZXNzYWdlIGlmIHlvdSB0cnkgdG8gZG8gaXQuXG4gICAga28uZXhwcmVzc2lvblJld3JpdGluZy5iaW5kaW5nUmV3cml0ZVZhbGlkYXRvcnNbJ3RlbXBsYXRlJ10gPSBmdW5jdGlvbihiaW5kaW5nVmFsdWUpIHtcbiAgICAgICAgdmFyIHBhcnNlZEJpbmRpbmdWYWx1ZSA9IGtvLmV4cHJlc3Npb25SZXdyaXRpbmcucGFyc2VPYmplY3RMaXRlcmFsKGJpbmRpbmdWYWx1ZSk7XG5cbiAgICAgICAgaWYgKChwYXJzZWRCaW5kaW5nVmFsdWUubGVuZ3RoID09IDEpICYmIHBhcnNlZEJpbmRpbmdWYWx1ZVswXVsndW5rbm93biddKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIEl0IGxvb2tzIGxpa2UgYSBzdHJpbmcgbGl0ZXJhbCwgbm90IGFuIG9iamVjdCBsaXRlcmFsLCBzbyB0cmVhdCBpdCBhcyBhIG5hbWVkIHRlbXBsYXRlICh3aGljaCBpcyBhbGxvd2VkIGZvciByZXdyaXRpbmcpXG5cbiAgICAgICAgaWYgKGtvLmV4cHJlc3Npb25SZXdyaXRpbmcua2V5VmFsdWVBcnJheUNvbnRhaW5zS2V5KHBhcnNlZEJpbmRpbmdWYWx1ZSwgXCJuYW1lXCIpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIE5hbWVkIHRlbXBsYXRlcyBjYW4gYmUgcmV3cml0dGVuLCBzbyByZXR1cm4gXCJubyBlcnJvclwiXG4gICAgICAgIHJldHVybiBcIlRoaXMgdGVtcGxhdGUgZW5naW5lIGRvZXMgbm90IHN1cHBvcnQgYW5vbnltb3VzIHRlbXBsYXRlcyBuZXN0ZWQgd2l0aGluIGl0cyB0ZW1wbGF0ZXNcIjtcbiAgICB9O1xuXG4gICAga28udmlydHVhbEVsZW1lbnRzLmFsbG93ZWRCaW5kaW5nc1sndGVtcGxhdGUnXSA9IHRydWU7XG59KSgpO1xuXG5rby5leHBvcnRTeW1ib2woJ3NldFRlbXBsYXRlRW5naW5lJywga28uc2V0VGVtcGxhdGVFbmdpbmUpO1xua28uZXhwb3J0U3ltYm9sKCdyZW5kZXJUZW1wbGF0ZScsIGtvLnJlbmRlclRlbXBsYXRlKTtcbi8vIEdvIHRocm91Z2ggdGhlIGl0ZW1zIHRoYXQgaGF2ZSBiZWVuIGFkZGVkIGFuZCBkZWxldGVkIGFuZCB0cnkgdG8gZmluZCBtYXRjaGVzIGJldHdlZW4gdGhlbS5cbmtvLnV0aWxzLmZpbmRNb3Zlc0luQXJyYXlDb21wYXJpc29uID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0LCBsaW1pdEZhaWxlZENvbXBhcmVzKSB7XG4gICAgaWYgKGxlZnQubGVuZ3RoICYmIHJpZ2h0Lmxlbmd0aCkge1xuICAgICAgICB2YXIgZmFpbGVkQ29tcGFyZXMsIGwsIHIsIGxlZnRJdGVtLCByaWdodEl0ZW07XG4gICAgICAgIGZvciAoZmFpbGVkQ29tcGFyZXMgPSBsID0gMDsgKCFsaW1pdEZhaWxlZENvbXBhcmVzIHx8IGZhaWxlZENvbXBhcmVzIDwgbGltaXRGYWlsZWRDb21wYXJlcykgJiYgKGxlZnRJdGVtID0gbGVmdFtsXSk7ICsrbCkge1xuICAgICAgICAgICAgZm9yIChyID0gMDsgcmlnaHRJdGVtID0gcmlnaHRbcl07ICsrcikge1xuICAgICAgICAgICAgICAgIGlmIChsZWZ0SXRlbVsndmFsdWUnXSA9PT0gcmlnaHRJdGVtWyd2YWx1ZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnRJdGVtWydtb3ZlZCddID0gcmlnaHRJdGVtWydpbmRleCddO1xuICAgICAgICAgICAgICAgICAgICByaWdodEl0ZW1bJ21vdmVkJ10gPSBsZWZ0SXRlbVsnaW5kZXgnXTtcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQuc3BsaWNlKHIsIDEpOyAgICAgICAgIC8vIFRoaXMgaXRlbSBpcyBtYXJrZWQgYXMgbW92ZWQ7IHNvIHJlbW92ZSBpdCBmcm9tIHJpZ2h0IGxpc3RcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkQ29tcGFyZXMgPSByID0gMDsgICAgIC8vIFJlc2V0IGZhaWxlZCBjb21wYXJlcyBjb3VudCBiZWNhdXNlIHdlJ3JlIGNoZWNraW5nIGZvciBjb25zZWN1dGl2ZSBmYWlsdXJlc1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmYWlsZWRDb21wYXJlcyArPSByO1xuICAgICAgICB9XG4gICAgfVxufTtcblxua28udXRpbHMuY29tcGFyZUFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXR1c05vdEluT2xkID0gJ2FkZGVkJywgc3RhdHVzTm90SW5OZXcgPSAnZGVsZXRlZCc7XG5cbiAgICAvLyBTaW1wbGUgY2FsY3VsYXRpb24gYmFzZWQgb24gTGV2ZW5zaHRlaW4gZGlzdGFuY2UuXG4gICAgZnVuY3Rpb24gY29tcGFyZUFycmF5cyhvbGRBcnJheSwgbmV3QXJyYXksIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIGlmIHRoZSB0aGlyZCBhcmcgaXMgYWN0dWFsbHkgYSBib29sLCBpbnRlcnByZXRcbiAgICAgICAgLy8gaXQgYXMgdGhlIG9sZCBwYXJhbWV0ZXIgJ2RvbnRMaW1pdE1vdmVzJy4gTmV3ZXIgY29kZSBzaG91bGQgdXNlIHsgZG9udExpbWl0TW92ZXM6IHRydWUgfS5cbiAgICAgICAgb3B0aW9ucyA9ICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Jvb2xlYW4nKSA/IHsgJ2RvbnRMaW1pdE1vdmVzJzogb3B0aW9ucyB9IDogKG9wdGlvbnMgfHwge30pO1xuICAgICAgICBvbGRBcnJheSA9IG9sZEFycmF5IHx8IFtdO1xuICAgICAgICBuZXdBcnJheSA9IG5ld0FycmF5IHx8IFtdO1xuXG4gICAgICAgIGlmIChvbGRBcnJheS5sZW5ndGggPD0gbmV3QXJyYXkubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVTbWFsbEFycmF5VG9CaWdBcnJheShvbGRBcnJheSwgbmV3QXJyYXksIHN0YXR1c05vdEluT2xkLCBzdGF0dXNOb3RJbk5ldywgb3B0aW9ucyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlU21hbGxBcnJheVRvQmlnQXJyYXkobmV3QXJyYXksIG9sZEFycmF5LCBzdGF0dXNOb3RJbk5ldywgc3RhdHVzTm90SW5PbGQsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBhcmVTbWFsbEFycmF5VG9CaWdBcnJheShzbWxBcnJheSwgYmlnQXJyYXksIHN0YXR1c05vdEluU21sLCBzdGF0dXNOb3RJbkJpZywgb3B0aW9ucykge1xuICAgICAgICB2YXIgbXlNaW4gPSBNYXRoLm1pbixcbiAgICAgICAgICAgIG15TWF4ID0gTWF0aC5tYXgsXG4gICAgICAgICAgICBlZGl0RGlzdGFuY2VNYXRyaXggPSBbXSxcbiAgICAgICAgICAgIHNtbEluZGV4LCBzbWxJbmRleE1heCA9IHNtbEFycmF5Lmxlbmd0aCxcbiAgICAgICAgICAgIGJpZ0luZGV4LCBiaWdJbmRleE1heCA9IGJpZ0FycmF5Lmxlbmd0aCxcbiAgICAgICAgICAgIGNvbXBhcmVSYW5nZSA9IChiaWdJbmRleE1heCAtIHNtbEluZGV4TWF4KSB8fCAxLFxuICAgICAgICAgICAgbWF4RGlzdGFuY2UgPSBzbWxJbmRleE1heCArIGJpZ0luZGV4TWF4ICsgMSxcbiAgICAgICAgICAgIHRoaXNSb3csIGxhc3RSb3csXG4gICAgICAgICAgICBiaWdJbmRleE1heEZvclJvdywgYmlnSW5kZXhNaW5Gb3JSb3c7XG5cbiAgICAgICAgZm9yIChzbWxJbmRleCA9IDA7IHNtbEluZGV4IDw9IHNtbEluZGV4TWF4OyBzbWxJbmRleCsrKSB7XG4gICAgICAgICAgICBsYXN0Um93ID0gdGhpc1JvdztcbiAgICAgICAgICAgIGVkaXREaXN0YW5jZU1hdHJpeC5wdXNoKHRoaXNSb3cgPSBbXSk7XG4gICAgICAgICAgICBiaWdJbmRleE1heEZvclJvdyA9IG15TWluKGJpZ0luZGV4TWF4LCBzbWxJbmRleCArIGNvbXBhcmVSYW5nZSk7XG4gICAgICAgICAgICBiaWdJbmRleE1pbkZvclJvdyA9IG15TWF4KDAsIHNtbEluZGV4IC0gMSk7XG4gICAgICAgICAgICBmb3IgKGJpZ0luZGV4ID0gYmlnSW5kZXhNaW5Gb3JSb3c7IGJpZ0luZGV4IDw9IGJpZ0luZGV4TWF4Rm9yUm93OyBiaWdJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFiaWdJbmRleClcbiAgICAgICAgICAgICAgICAgICAgdGhpc1Jvd1tiaWdJbmRleF0gPSBzbWxJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXNtbEluZGV4KSAgLy8gVG9wIHJvdyAtIHRyYW5zZm9ybSBlbXB0eSBhcnJheSBpbnRvIG5ldyBhcnJheSB2aWEgYWRkaXRpb25zXG4gICAgICAgICAgICAgICAgICAgIHRoaXNSb3dbYmlnSW5kZXhdID0gYmlnSW5kZXggKyAxO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNtbEFycmF5W3NtbEluZGV4IC0gMV0gPT09IGJpZ0FycmF5W2JpZ0luZGV4IC0gMV0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXNSb3dbYmlnSW5kZXhdID0gbGFzdFJvd1tiaWdJbmRleCAtIDFdOyAgICAgICAgICAgICAgICAgIC8vIGNvcHkgdmFsdWUgKG5vIGVkaXQpXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3J0aERpc3RhbmNlID0gbGFzdFJvd1tiaWdJbmRleF0gfHwgbWF4RGlzdGFuY2U7ICAgICAgIC8vIG5vdCBpbiBiaWcgKGRlbGV0aW9uKVxuICAgICAgICAgICAgICAgICAgICB2YXIgd2VzdERpc3RhbmNlID0gdGhpc1Jvd1tiaWdJbmRleCAtIDFdIHx8IG1heERpc3RhbmNlOyAgICAvLyBub3QgaW4gc21hbGwgKGFkZGl0aW9uKVxuICAgICAgICAgICAgICAgICAgICB0aGlzUm93W2JpZ0luZGV4XSA9IG15TWluKG5vcnRoRGlzdGFuY2UsIHdlc3REaXN0YW5jZSkgKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlZGl0U2NyaXB0ID0gW10sIG1lTWludXNPbmUsIG5vdEluU21sID0gW10sIG5vdEluQmlnID0gW107XG4gICAgICAgIGZvciAoc21sSW5kZXggPSBzbWxJbmRleE1heCwgYmlnSW5kZXggPSBiaWdJbmRleE1heDsgc21sSW5kZXggfHwgYmlnSW5kZXg7KSB7XG4gICAgICAgICAgICBtZU1pbnVzT25lID0gZWRpdERpc3RhbmNlTWF0cml4W3NtbEluZGV4XVtiaWdJbmRleF0gLSAxO1xuICAgICAgICAgICAgaWYgKGJpZ0luZGV4ICYmIG1lTWludXNPbmUgPT09IGVkaXREaXN0YW5jZU1hdHJpeFtzbWxJbmRleF1bYmlnSW5kZXgtMV0pIHtcbiAgICAgICAgICAgICAgICBub3RJblNtbC5wdXNoKGVkaXRTY3JpcHRbZWRpdFNjcmlwdC5sZW5ndGhdID0geyAgICAgLy8gYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cyc6IHN0YXR1c05vdEluU21sLFxuICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBiaWdBcnJheVstLWJpZ0luZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgJ2luZGV4JzogYmlnSW5kZXggfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNtbEluZGV4ICYmIG1lTWludXNPbmUgPT09IGVkaXREaXN0YW5jZU1hdHJpeFtzbWxJbmRleCAtIDFdW2JpZ0luZGV4XSkge1xuICAgICAgICAgICAgICAgIG5vdEluQmlnLnB1c2goZWRpdFNjcmlwdFtlZGl0U2NyaXB0Lmxlbmd0aF0gPSB7ICAgICAvLyBkZWxldGVkXG4gICAgICAgICAgICAgICAgICAgICdzdGF0dXMnOiBzdGF0dXNOb3RJbkJpZyxcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogc21sQXJyYXlbLS1zbWxJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgICdpbmRleCc6IHNtbEluZGV4IH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAtLWJpZ0luZGV4O1xuICAgICAgICAgICAgICAgIC0tc21sSW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zWydzcGFyc2UnXSkge1xuICAgICAgICAgICAgICAgICAgICBlZGl0U2NyaXB0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cyc6IFwicmV0YWluZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IGJpZ0FycmF5W2JpZ0luZGV4XSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgYSBsaW1pdCBvbiB0aGUgbnVtYmVyIG9mIGNvbnNlY3V0aXZlIG5vbi1tYXRjaGluZyBjb21wYXJpc29uczsgaGF2aW5nIGl0IGEgbXVsdGlwbGUgb2ZcbiAgICAgICAgLy8gc21sSW5kZXhNYXgga2VlcHMgdGhlIHRpbWUgY29tcGxleGl0eSBvZiB0aGlzIGFsZ29yaXRobSBsaW5lYXIuXG4gICAgICAgIGtvLnV0aWxzLmZpbmRNb3Zlc0luQXJyYXlDb21wYXJpc29uKG5vdEluU21sLCBub3RJbkJpZywgc21sSW5kZXhNYXggKiAxMCk7XG5cbiAgICAgICAgcmV0dXJuIGVkaXRTY3JpcHQucmV2ZXJzZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb21wYXJlQXJyYXlzO1xufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5jb21wYXJlQXJyYXlzJywga28udXRpbHMuY29tcGFyZUFycmF5cyk7XG4oZnVuY3Rpb24gKCkge1xuICAgIC8vIE9iamVjdGl2ZTpcbiAgICAvLyAqIEdpdmVuIGFuIGlucHV0IGFycmF5LCBhIGNvbnRhaW5lciBET00gbm9kZSwgYW5kIGEgZnVuY3Rpb24gZnJvbSBhcnJheSBlbGVtZW50cyB0byBhcnJheXMgb2YgRE9NIG5vZGVzLFxuICAgIC8vICAgbWFwIHRoZSBhcnJheSBlbGVtZW50cyB0byBhcnJheXMgb2YgRE9NIG5vZGVzLCBjb25jYXRlbmF0ZSB0b2dldGhlciBhbGwgdGhlc2UgYXJyYXlzLCBhbmQgdXNlIHRoZW0gdG8gcG9wdWxhdGUgdGhlIGNvbnRhaW5lciBET00gbm9kZVxuICAgIC8vICogTmV4dCB0aW1lIHdlJ3JlIGdpdmVuIHRoZSBzYW1lIGNvbWJpbmF0aW9uIG9mIHRoaW5ncyAod2l0aCB0aGUgYXJyYXkgcG9zc2libHkgaGF2aW5nIG11dGF0ZWQpLCB1cGRhdGUgdGhlIGNvbnRhaW5lciBET00gbm9kZVxuICAgIC8vICAgc28gdGhhdCBpdHMgY2hpbGRyZW4gaXMgYWdhaW4gdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIG1hcHBpbmdzIG9mIHRoZSBhcnJheSBlbGVtZW50cywgYnV0IGRvbid0IHJlLW1hcCBhbnkgYXJyYXkgZWxlbWVudHMgdGhhdCB3ZVxuICAgIC8vICAgcHJldmlvdXNseSBtYXBwZWQgLSByZXRhaW4gdGhvc2Ugbm9kZXMsIGFuZCBqdXN0IGluc2VydC9kZWxldGUgb3RoZXIgb25lc1xuXG4gICAgLy8gXCJjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXNcIiB3aWxsIGJlIGludm9rZWQgYWZ0ZXIgYW55IFwibWFwcGluZ1wiLWdlbmVyYXRlZCBub2RlcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyIG5vZGVcbiAgICAvLyBZb3UgY2FuIHVzZSB0aGlzLCBmb3IgZXhhbXBsZSwgdG8gYWN0aXZhdGUgYmluZGluZ3Mgb24gdGhvc2Ugbm9kZXMuXG5cbiAgICBmdW5jdGlvbiBtYXBOb2RlQW5kUmVmcmVzaFdoZW5DaGFuZ2VkKGNvbnRhaW5lck5vZGUsIG1hcHBpbmcsIHZhbHVlVG9NYXAsIGNhbGxiYWNrQWZ0ZXJBZGRpbmdOb2RlcywgaW5kZXgpIHtcbiAgICAgICAgLy8gTWFwIHRoaXMgYXJyYXkgdmFsdWUgaW5zaWRlIGEgZGVwZW5kZW50T2JzZXJ2YWJsZSBzbyB3ZSByZS1tYXAgd2hlbiBhbnkgZGVwZW5kZW5jeSBjaGFuZ2VzXG4gICAgICAgIHZhciBtYXBwZWROb2RlcyA9IFtdO1xuICAgICAgICB2YXIgZGVwZW5kZW50T2JzZXJ2YWJsZSA9IGtvLmRlcGVuZGVudE9ic2VydmFibGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbmV3TWFwcGVkTm9kZXMgPSBtYXBwaW5nKHZhbHVlVG9NYXAsIGluZGV4LCBrby51dGlscy5maXhVcENvbnRpbnVvdXNOb2RlQXJyYXkobWFwcGVkTm9kZXMsIGNvbnRhaW5lck5vZGUpKSB8fCBbXTtcblxuICAgICAgICAgICAgLy8gT24gc3Vic2VxdWVudCBldmFsdWF0aW9ucywganVzdCByZXBsYWNlIHRoZSBwcmV2aW91c2x5LWluc2VydGVkIERPTSBub2Rlc1xuICAgICAgICAgICAgaWYgKG1hcHBlZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBrby51dGlscy5yZXBsYWNlRG9tTm9kZXMobWFwcGVkTm9kZXMsIG5ld01hcHBlZE5vZGVzKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2tBZnRlckFkZGluZ05vZGVzKVxuICAgICAgICAgICAgICAgICAgICBrby5kZXBlbmRlbmN5RGV0ZWN0aW9uLmlnbm9yZShjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMsIG51bGwsIFt2YWx1ZVRvTWFwLCBuZXdNYXBwZWROb2RlcywgaW5kZXhdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgY29udGVudHMgb2YgdGhlIG1hcHBlZE5vZGVzIGFycmF5LCB0aGVyZWJ5IHVwZGF0aW5nIHRoZSByZWNvcmRcbiAgICAgICAgICAgIC8vIG9mIHdoaWNoIG5vZGVzIHdvdWxkIGJlIGRlbGV0ZWQgaWYgdmFsdWVUb01hcCB3YXMgaXRzZWxmIGxhdGVyIHJlbW92ZWRcbiAgICAgICAgICAgIG1hcHBlZE5vZGVzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBrby51dGlscy5hcnJheVB1c2hBbGwobWFwcGVkTm9kZXMsIG5ld01hcHBlZE5vZGVzKTtcbiAgICAgICAgfSwgbnVsbCwgeyBkaXNwb3NlV2hlbk5vZGVJc1JlbW92ZWQ6IGNvbnRhaW5lck5vZGUsIGRpc3Bvc2VXaGVuOiBmdW5jdGlvbigpIHsgcmV0dXJuICFrby51dGlscy5hbnlEb21Ob2RlSXNBdHRhY2hlZFRvRG9jdW1lbnQobWFwcGVkTm9kZXMpOyB9IH0pO1xuICAgICAgICByZXR1cm4geyBtYXBwZWROb2RlcyA6IG1hcHBlZE5vZGVzLCBkZXBlbmRlbnRPYnNlcnZhYmxlIDogKGRlcGVuZGVudE9ic2VydmFibGUuaXNBY3RpdmUoKSA/IGRlcGVuZGVudE9ic2VydmFibGUgOiB1bmRlZmluZWQpIH07XG4gICAgfVxuXG4gICAgdmFyIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSA9IGtvLnV0aWxzLmRvbURhdGEubmV4dEtleSgpO1xuXG4gICAga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyA9IGZ1bmN0aW9uIChkb21Ob2RlLCBhcnJheSwgbWFwcGluZywgb3B0aW9ucywgY2FsbGJhY2tBZnRlckFkZGluZ05vZGVzKSB7XG4gICAgICAgIC8vIENvbXBhcmUgdGhlIHByb3ZpZGVkIGFycmF5IGFnYWluc3QgdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICBhcnJheSA9IGFycmF5IHx8IFtdO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgdmFyIGlzRmlyc3RFeGVjdXRpb24gPSBrby51dGlscy5kb21EYXRhLmdldChkb21Ob2RlLCBsYXN0TWFwcGluZ1Jlc3VsdERvbURhdGFLZXkpID09PSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBsYXN0TWFwcGluZ1Jlc3VsdCA9IGtvLnV0aWxzLmRvbURhdGEuZ2V0KGRvbU5vZGUsIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSkgfHwgW107XG4gICAgICAgIHZhciBsYXN0QXJyYXkgPSBrby51dGlscy5hcnJheU1hcChsYXN0TWFwcGluZ1Jlc3VsdCwgZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHguYXJyYXlFbnRyeTsgfSk7XG4gICAgICAgIHZhciBlZGl0U2NyaXB0ID0ga28udXRpbHMuY29tcGFyZUFycmF5cyhsYXN0QXJyYXksIGFycmF5LCBvcHRpb25zWydkb250TGltaXRNb3ZlcyddKTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgbmV3IG1hcHBpbmcgcmVzdWx0XG4gICAgICAgIHZhciBuZXdNYXBwaW5nUmVzdWx0ID0gW107XG4gICAgICAgIHZhciBsYXN0TWFwcGluZ1Jlc3VsdEluZGV4ID0gMDtcbiAgICAgICAgdmFyIG5ld01hcHBpbmdSZXN1bHRJbmRleCA9IDA7XG5cbiAgICAgICAgdmFyIG5vZGVzVG9EZWxldGUgPSBbXTtcbiAgICAgICAgdmFyIGl0ZW1zVG9Qcm9jZXNzID0gW107XG4gICAgICAgIHZhciBpdGVtc0ZvckJlZm9yZVJlbW92ZUNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB2YXIgaXRlbXNGb3JNb3ZlQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHZhciBpdGVtc0ZvckFmdGVyQWRkQ2FsbGJhY2tzID0gW107XG4gICAgICAgIHZhciBtYXBEYXRhO1xuXG4gICAgICAgIGZ1bmN0aW9uIGl0ZW1Nb3ZlZE9yUmV0YWluZWQoZWRpdFNjcmlwdEluZGV4LCBvbGRQb3NpdGlvbikge1xuICAgICAgICAgICAgbWFwRGF0YSA9IGxhc3RNYXBwaW5nUmVzdWx0W29sZFBvc2l0aW9uXTtcbiAgICAgICAgICAgIGlmIChuZXdNYXBwaW5nUmVzdWx0SW5kZXggIT09IG9sZFBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIGl0ZW1zRm9yTW92ZUNhbGxiYWNrc1tlZGl0U2NyaXB0SW5kZXhdID0gbWFwRGF0YTtcbiAgICAgICAgICAgIC8vIFNpbmNlIHVwZGF0aW5nIHRoZSBpbmRleCBtaWdodCBjaGFuZ2UgdGhlIG5vZGVzLCBkbyBzbyBiZWZvcmUgY2FsbGluZyBmaXhVcENvbnRpbnVvdXNOb2RlQXJyYXlcbiAgICAgICAgICAgIG1hcERhdGEuaW5kZXhPYnNlcnZhYmxlKG5ld01hcHBpbmdSZXN1bHRJbmRleCsrKTtcbiAgICAgICAgICAgIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShtYXBEYXRhLm1hcHBlZE5vZGVzLCBkb21Ob2RlKTtcbiAgICAgICAgICAgIG5ld01hcHBpbmdSZXN1bHQucHVzaChtYXBEYXRhKTtcbiAgICAgICAgICAgIGl0ZW1zVG9Qcm9jZXNzLnB1c2gobWFwRGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjYWxsQ2FsbGJhY2soY2FsbGJhY2ssIGl0ZW1zKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGl0ZW1zLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtvLnV0aWxzLmFycmF5Rm9yRWFjaChpdGVtc1tpXS5tYXBwZWROb2RlcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5vZGUsIGksIGl0ZW1zW2ldLmFycmF5RW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgZWRpdFNjcmlwdEl0ZW0sIG1vdmVkSW5kZXg7IGVkaXRTY3JpcHRJdGVtID0gZWRpdFNjcmlwdFtpXTsgaSsrKSB7XG4gICAgICAgICAgICBtb3ZlZEluZGV4ID0gZWRpdFNjcmlwdEl0ZW1bJ21vdmVkJ107XG4gICAgICAgICAgICBzd2l0Y2ggKGVkaXRTY3JpcHRJdGVtWydzdGF0dXMnXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJkZWxldGVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb3ZlZEluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcERhdGEgPSBsYXN0TWFwcGluZ1Jlc3VsdFtsYXN0TWFwcGluZ1Jlc3VsdEluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCB0cmFja2luZyBjaGFuZ2VzIHRvIHRoZSBtYXBwaW5nIGZvciB0aGVzZSBub2Rlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcERhdGEuZGVwZW5kZW50T2JzZXJ2YWJsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBEYXRhLmRlcGVuZGVudE9ic2VydmFibGUuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBRdWV1ZSB0aGVzZSBub2RlcyBmb3IgbGF0ZXIgcmVtb3ZhbFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXNUb0RlbGV0ZS5wdXNoLmFwcGx5KG5vZGVzVG9EZWxldGUsIGtvLnV0aWxzLmZpeFVwQ29udGludW91c05vZGVBcnJheShtYXBEYXRhLm1hcHBlZE5vZGVzLCBkb21Ob2RlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtc0ZvckJlZm9yZVJlbW92ZUNhbGxiYWNrc1tpXSA9IG1hcERhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXNUb1Byb2Nlc3MucHVzaChtYXBEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsYXN0TWFwcGluZ1Jlc3VsdEluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBcInJldGFpbmVkXCI6XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Nb3ZlZE9yUmV0YWluZWQoaSwgbGFzdE1hcHBpbmdSZXN1bHRJbmRleCsrKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBjYXNlIFwiYWRkZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vdmVkSW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbU1vdmVkT3JSZXRhaW5lZChpLCBtb3ZlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcERhdGEgPSB7IGFycmF5RW50cnk6IGVkaXRTY3JpcHRJdGVtWyd2YWx1ZSddLCBpbmRleE9ic2VydmFibGU6IGtvLm9ic2VydmFibGUobmV3TWFwcGluZ1Jlc3VsdEluZGV4KyspIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdNYXBwaW5nUmVzdWx0LnB1c2gobWFwRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtc1RvUHJvY2Vzcy5wdXNoKG1hcERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpcnN0RXhlY3V0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zRm9yQWZ0ZXJBZGRDYWxsYmFja3NbaV0gPSBtYXBEYXRhO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbCBiZWZvcmVNb3ZlIGZpcnN0IGJlZm9yZSBhbnkgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIGNhbGxDYWxsYmFjayhvcHRpb25zWydiZWZvcmVNb3ZlJ10sIGl0ZW1zRm9yTW92ZUNhbGxiYWNrcyk7XG5cbiAgICAgICAgLy8gTmV4dCByZW1vdmUgbm9kZXMgZm9yIGRlbGV0ZWQgaXRlbXMgKG9yIGp1c3QgY2xlYW4gaWYgdGhlcmUncyBhIGJlZm9yZVJlbW92ZSBjYWxsYmFjaylcbiAgICAgICAga28udXRpbHMuYXJyYXlGb3JFYWNoKG5vZGVzVG9EZWxldGUsIG9wdGlvbnNbJ2JlZm9yZVJlbW92ZSddID8ga28uY2xlYW5Ob2RlIDoga28ucmVtb3ZlTm9kZSk7XG5cbiAgICAgICAgLy8gTmV4dCBhZGQvcmVvcmRlciB0aGUgcmVtYWluaW5nIGl0ZW1zICh3aWxsIGluY2x1ZGUgZGVsZXRlZCBpdGVtcyBpZiB0aGVyZSdzIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbmV4dE5vZGUgPSBrby52aXJ0dWFsRWxlbWVudHMuZmlyc3RDaGlsZChkb21Ob2RlKSwgbGFzdE5vZGUsIG5vZGU7IG1hcERhdGEgPSBpdGVtc1RvUHJvY2Vzc1tpXTsgaSsrKSB7XG4gICAgICAgICAgICAvLyBHZXQgbm9kZXMgZm9yIG5ld2x5IGFkZGVkIGl0ZW1zXG4gICAgICAgICAgICBpZiAoIW1hcERhdGEubWFwcGVkTm9kZXMpXG4gICAgICAgICAgICAgICAga28udXRpbHMuZXh0ZW5kKG1hcERhdGEsIG1hcE5vZGVBbmRSZWZyZXNoV2hlbkNoYW5nZWQoZG9tTm9kZSwgbWFwcGluZywgbWFwRGF0YS5hcnJheUVudHJ5LCBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMsIG1hcERhdGEuaW5kZXhPYnNlcnZhYmxlKSk7XG5cbiAgICAgICAgICAgIC8vIFB1dCBub2RlcyBpbiB0aGUgcmlnaHQgcGxhY2UgaWYgdGhleSBhcmVuJ3QgdGhlcmUgYWxyZWFkeVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IG5vZGUgPSBtYXBEYXRhLm1hcHBlZE5vZGVzW2pdOyBuZXh0Tm9kZSA9IG5vZGUubmV4dFNpYmxpbmcsIGxhc3ROb2RlID0gbm9kZSwgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUgIT09IG5leHROb2RlKVxuICAgICAgICAgICAgICAgICAgICBrby52aXJ0dWFsRWxlbWVudHMuaW5zZXJ0QWZ0ZXIoZG9tTm9kZSwgbm9kZSwgbGFzdE5vZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSdW4gdGhlIGNhbGxiYWNrcyBmb3IgbmV3bHkgYWRkZWQgbm9kZXMgKGZvciBleGFtcGxlLCB0byBhcHBseSBiaW5kaW5ncywgZXRjLilcbiAgICAgICAgICAgIGlmICghbWFwRGF0YS5pbml0aWFsaXplZCAmJiBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFja0FmdGVyQWRkaW5nTm9kZXMobWFwRGF0YS5hcnJheUVudHJ5LCBtYXBEYXRhLm1hcHBlZE5vZGVzLCBtYXBEYXRhLmluZGV4T2JzZXJ2YWJsZSk7XG4gICAgICAgICAgICAgICAgbWFwRGF0YS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSdzIGEgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrLCBjYWxsIGl0IGFmdGVyIHJlb3JkZXJpbmcuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBhc3N1bWUgdGhhdCB0aGUgYmVmb3JlUmVtb3ZlIGNhbGxiYWNrIHdpbGwgdXN1YWxseSBiZSB1c2VkIHRvIHJlbW92ZSB0aGUgbm9kZXMgdXNpbmdcbiAgICAgICAgLy8gc29tZSBzb3J0IG9mIGFuaW1hdGlvbiwgd2hpY2ggaXMgd2h5IHdlIGZpcnN0IHJlb3JkZXIgdGhlIG5vZGVzIHRoYXQgd2lsbCBiZSByZW1vdmVkLiBJZiB0aGVcbiAgICAgICAgLy8gY2FsbGJhY2sgaW5zdGVhZCByZW1vdmVzIHRoZSBub2RlcyByaWdodCBhd2F5LCBpdCB3b3VsZCBiZSBtb3JlIGVmZmljaWVudCB0byBza2lwIHJlb3JkZXJpbmcgdGhlbS5cbiAgICAgICAgLy8gUGVyaGFwcyB3ZSdsbCBtYWtlIHRoYXQgY2hhbmdlIGluIHRoZSBmdXR1cmUgaWYgdGhpcyBzY2VuYXJpbyBiZWNvbWVzIG1vcmUgY29tbW9uLlxuICAgICAgICBjYWxsQ2FsbGJhY2sob3B0aW9uc1snYmVmb3JlUmVtb3ZlJ10sIGl0ZW1zRm9yQmVmb3JlUmVtb3ZlQ2FsbGJhY2tzKTtcblxuICAgICAgICAvLyBGaW5hbGx5IGNhbGwgYWZ0ZXJNb3ZlIGFuZCBhZnRlckFkZCBjYWxsYmFja3NcbiAgICAgICAgY2FsbENhbGxiYWNrKG9wdGlvbnNbJ2FmdGVyTW92ZSddLCBpdGVtc0Zvck1vdmVDYWxsYmFja3MpO1xuICAgICAgICBjYWxsQ2FsbGJhY2sob3B0aW9uc1snYWZ0ZXJBZGQnXSwgaXRlbXNGb3JBZnRlckFkZENhbGxiYWNrcyk7XG5cbiAgICAgICAgLy8gU3RvcmUgYSBjb3B5IG9mIHRoZSBhcnJheSBpdGVtcyB3ZSBqdXN0IGNvbnNpZGVyZWQgc28gd2UgY2FuIGRpZmZlcmVuY2UgaXQgbmV4dCB0aW1lXG4gICAgICAgIGtvLnV0aWxzLmRvbURhdGEuc2V0KGRvbU5vZGUsIGxhc3RNYXBwaW5nUmVzdWx0RG9tRGF0YUtleSwgbmV3TWFwcGluZ1Jlc3VsdCk7XG4gICAgfVxufSkoKTtcblxua28uZXhwb3J0U3ltYm9sKCd1dGlscy5zZXREb21Ob2RlQ2hpbGRyZW5Gcm9tQXJyYXlNYXBwaW5nJywga28udXRpbHMuc2V0RG9tTm9kZUNoaWxkcmVuRnJvbUFycmF5TWFwcGluZyk7XG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzWydhbGxvd1RlbXBsYXRlUmV3cml0aW5nJ10gPSBmYWxzZTtcbn1cblxua28ubmF0aXZlVGVtcGxhdGVFbmdpbmUucHJvdG90eXBlID0gbmV3IGtvLnRlbXBsYXRlRW5naW5lKCk7XG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZTtcbmtvLm5hdGl2ZVRlbXBsYXRlRW5naW5lLnByb3RvdHlwZVsncmVuZGVyVGVtcGxhdGVTb3VyY2UnXSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZVNvdXJjZSwgYmluZGluZ0NvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgdXNlTm9kZXNJZkF2YWlsYWJsZSA9ICEoa28udXRpbHMuaWVWZXJzaW9uIDwgOSksIC8vIElFPDkgY2xvbmVOb2RlIGRvZXNuJ3Qgd29yayBwcm9wZXJseVxuICAgICAgICB0ZW1wbGF0ZU5vZGVzRnVuYyA9IHVzZU5vZGVzSWZBdmFpbGFibGUgPyB0ZW1wbGF0ZVNvdXJjZVsnbm9kZXMnXSA6IG51bGwsXG4gICAgICAgIHRlbXBsYXRlTm9kZXMgPSB0ZW1wbGF0ZU5vZGVzRnVuYyA/IHRlbXBsYXRlU291cmNlWydub2RlcyddKCkgOiBudWxsO1xuXG4gICAgaWYgKHRlbXBsYXRlTm9kZXMpIHtcbiAgICAgICAgcmV0dXJuIGtvLnV0aWxzLm1ha2VBcnJheSh0ZW1wbGF0ZU5vZGVzLmNsb25lTm9kZSh0cnVlKS5jaGlsZE5vZGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGVtcGxhdGVUZXh0ID0gdGVtcGxhdGVTb3VyY2VbJ3RleHQnXSgpO1xuICAgICAgICByZXR1cm4ga28udXRpbHMucGFyc2VIdG1sRnJhZ21lbnQodGVtcGxhdGVUZXh0KTtcbiAgICB9XG59O1xuXG5rby5uYXRpdmVUZW1wbGF0ZUVuZ2luZS5pbnN0YW5jZSA9IG5ldyBrby5uYXRpdmVUZW1wbGF0ZUVuZ2luZSgpO1xua28uc2V0VGVtcGxhdGVFbmdpbmUoa28ubmF0aXZlVGVtcGxhdGVFbmdpbmUuaW5zdGFuY2UpO1xuXG5rby5leHBvcnRTeW1ib2woJ25hdGl2ZVRlbXBsYXRlRW5naW5lJywga28ubmF0aXZlVGVtcGxhdGVFbmdpbmUpO1xuKGZ1bmN0aW9uKCkge1xuICAgIGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHdoaWNoIHZlcnNpb24gb2YganF1ZXJ5LXRtcGwgeW91J3JlIHVzaW5nLiBVbmZvcnR1bmF0ZWx5IGpxdWVyeS10bXBsXG4gICAgICAgIC8vIGRvZXNuJ3QgZXhwb3NlIGEgdmVyc2lvbiBudW1iZXIsIHNvIHdlIGhhdmUgdG8gaW5mZXIgaXQuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBhcyBvZiBLbm9ja291dCAxLjMsIHdlIG9ubHkgc3VwcG9ydCBqUXVlcnkudG1wbCAxLjAuMHByZSBhbmQgbGF0ZXIsXG4gICAgICAgIC8vIHdoaWNoIEtPIGludGVybmFsbHkgcmVmZXJzIHRvIGFzIHZlcnNpb24gXCIyXCIsIHNvIG9sZGVyIHZlcnNpb25zIGFyZSBubyBsb25nZXIgZGV0ZWN0ZWQuXG4gICAgICAgIHZhciBqUXVlcnlUbXBsVmVyc2lvbiA9IHRoaXMualF1ZXJ5VG1wbFZlcnNpb24gPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWpRdWVyeSB8fCAhKGpRdWVyeVsndG1wbCddKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIC8vIFNpbmNlIGl0IGV4cG9zZXMgbm8gb2ZmaWNpYWwgdmVyc2lvbiBudW1iZXIsIHdlIHVzZSBvdXIgb3duIG51bWJlcmluZyBzeXN0ZW0uIFRvIGJlIHVwZGF0ZWQgYXMganF1ZXJ5LXRtcGwgZXZvbHZlcy5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKGpRdWVyeVsndG1wbCddWyd0YWcnXVsndG1wbCddWydvcGVuJ10udG9TdHJpbmcoKS5pbmRleE9mKCdfXycpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgMS4wLjBwcmUsIGN1c3RvbSB0YWdzIHNob3VsZCBhcHBlbmQgbWFya3VwIHRvIGFuIGFycmF5IGNhbGxlZCBcIl9fXCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDI7IC8vIEZpbmFsIHZlcnNpb24gb2YganF1ZXJ5LnRtcGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoKGV4KSB7IC8qIEFwcGFyZW50bHkgbm90IHRoZSB2ZXJzaW9uIHdlIHdlcmUgbG9va2luZyBmb3IgKi8gfVxuXG4gICAgICAgICAgICByZXR1cm4gMTsgLy8gQW55IG9sZGVyIHZlcnNpb24gdGhhdCB3ZSBkb24ndCBzdXBwb3J0XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZW5zdXJlSGFzUmVmZXJlbmNlZEpRdWVyeVRlbXBsYXRlcygpIHtcbiAgICAgICAgICAgIGlmIChqUXVlcnlUbXBsVmVyc2lvbiA8IDIpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91ciB2ZXJzaW9uIG9mIGpRdWVyeS50bXBsIGlzIHRvbyBvbGQuIFBsZWFzZSB1cGdyYWRlIHRvIGpRdWVyeS50bXBsIDEuMC4wcHJlIG9yIGxhdGVyLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGV4ZWN1dGVUZW1wbGF0ZShjb21waWxlZFRlbXBsYXRlLCBkYXRhLCBqUXVlcnlUZW1wbGF0ZU9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnlbJ3RtcGwnXShjb21waWxlZFRlbXBsYXRlLCBkYXRhLCBqUXVlcnlUZW1wbGF0ZU9wdGlvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1sncmVuZGVyVGVtcGxhdGVTb3VyY2UnXSA9IGZ1bmN0aW9uKHRlbXBsYXRlU291cmNlLCBiaW5kaW5nQ29udGV4dCwgb3B0aW9ucykge1xuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICBlbnN1cmVIYXNSZWZlcmVuY2VkSlF1ZXJ5VGVtcGxhdGVzKCk7XG5cbiAgICAgICAgICAgIC8vIEVuc3VyZSB3ZSBoYXZlIHN0b3JlZCBhIHByZWNvbXBpbGVkIHZlcnNpb24gb2YgdGhpcyB0ZW1wbGF0ZSAoZG9uJ3Qgd2FudCB0byByZXBhcnNlIG9uIGV2ZXJ5IHJlbmRlcilcbiAgICAgICAgICAgIHZhciBwcmVjb21waWxlZCA9IHRlbXBsYXRlU291cmNlWydkYXRhJ10oJ3ByZWNvbXBpbGVkJyk7XG4gICAgICAgICAgICBpZiAoIXByZWNvbXBpbGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRlbXBsYXRlVGV4dCA9IHRlbXBsYXRlU291cmNlWyd0ZXh0J10oKSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIC8vIFdyYXAgaW4gXCJ3aXRoKCR3aGF0ZXZlci5rb0JpbmRpbmdDb250ZXh0KSB7IC4uLiB9XCJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVRleHQgPSBcInt7a29fd2l0aCAkaXRlbS5rb0JpbmRpbmdDb250ZXh0fX1cIiArIHRlbXBsYXRlVGV4dCArIFwie3sva29fd2l0aH19XCI7XG5cbiAgICAgICAgICAgICAgICBwcmVjb21waWxlZCA9IGpRdWVyeVsndGVtcGxhdGUnXShudWxsLCB0ZW1wbGF0ZVRleHQpO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlU291cmNlWydkYXRhJ10oJ3ByZWNvbXBpbGVkJywgcHJlY29tcGlsZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtiaW5kaW5nQ29udGV4dFsnJGRhdGEnXV07IC8vIFByZXdyYXAgdGhlIGRhdGEgaW4gYW4gYXJyYXkgdG8gc3RvcCBqcXVlcnkudG1wbCBmcm9tIHRyeWluZyB0byB1bndyYXAgYW55IGFycmF5c1xuICAgICAgICAgICAgdmFyIGpRdWVyeVRlbXBsYXRlT3B0aW9ucyA9IGpRdWVyeVsnZXh0ZW5kJ10oeyAna29CaW5kaW5nQ29udGV4dCc6IGJpbmRpbmdDb250ZXh0IH0sIG9wdGlvbnNbJ3RlbXBsYXRlT3B0aW9ucyddKTtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdE5vZGVzID0gZXhlY3V0ZVRlbXBsYXRlKHByZWNvbXBpbGVkLCBkYXRhLCBqUXVlcnlUZW1wbGF0ZU9wdGlvbnMpO1xuICAgICAgICAgICAgcmVzdWx0Tm9kZXNbJ2FwcGVuZFRvJ10oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7IC8vIFVzaW5nIFwiYXBwZW5kVG9cIiBmb3JjZXMgalF1ZXJ5L2pRdWVyeS50bXBsIHRvIHBlcmZvcm0gbmVjZXNzYXJ5IGNsZWFudXAgd29ya1xuXG4gICAgICAgICAgICBqUXVlcnlbJ2ZyYWdtZW50cyddID0ge307IC8vIENsZWFyIGpRdWVyeSdzIGZyYWdtZW50IGNhY2hlIHRvIGF2b2lkIGEgbWVtb3J5IGxlYWsgYWZ0ZXIgYSBsYXJnZSBudW1iZXIgb2YgdGVtcGxhdGUgcmVuZGVyc1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXNbJ2NyZWF0ZUphdmFTY3JpcHRFdmFsdWF0b3JCbG9jayddID0gZnVuY3Rpb24oc2NyaXB0KSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7e2tvX2NvZGUgKChmdW5jdGlvbigpIHsgcmV0dXJuIFwiICsgc2NyaXB0ICsgXCIgfSkoKSkgfX1cIjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzWydhZGRUZW1wbGF0ZSddID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCB0ZW1wbGF0ZU1hcmt1cCkge1xuICAgICAgICAgICAgZG9jdW1lbnQud3JpdGUoXCI8c2NyaXB0IHR5cGU9J3RleHQvaHRtbCcgaWQ9J1wiICsgdGVtcGxhdGVOYW1lICsgXCInPlwiICsgdGVtcGxhdGVNYXJrdXAgKyBcIjxcIiArIFwiL3NjcmlwdD5cIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGpRdWVyeVRtcGxWZXJzaW9uID4gMCkge1xuICAgICAgICAgICAgalF1ZXJ5Wyd0bXBsJ11bJ3RhZyddWydrb19jb2RlJ10gPSB7XG4gICAgICAgICAgICAgICAgb3BlbjogXCJfXy5wdXNoKCQxIHx8ICcnKTtcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGpRdWVyeVsndG1wbCddWyd0YWcnXVsna29fd2l0aCddID0ge1xuICAgICAgICAgICAgICAgIG9wZW46IFwid2l0aCgkMSkge1wiLFxuICAgICAgICAgICAgICAgIGNsb3NlOiBcIn0gXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAga28uanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lLnByb3RvdHlwZSA9IG5ldyBrby50ZW1wbGF0ZUVuZ2luZSgpO1xuICAgIGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBrby5qcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmU7XG5cbiAgICAvLyBVc2UgdGhpcyBvbmUgYnkgZGVmYXVsdCAqb25seSBpZiBqcXVlcnkudG1wbCBpcyByZWZlcmVuY2VkKlxuICAgIHZhciBqcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmVJbnN0YW5jZSA9IG5ldyBrby5qcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmUoKTtcbiAgICBpZiAoanF1ZXJ5VG1wbFRlbXBsYXRlRW5naW5lSW5zdGFuY2UualF1ZXJ5VG1wbFZlcnNpb24gPiAwKVxuICAgICAgICBrby5zZXRUZW1wbGF0ZUVuZ2luZShqcXVlcnlUbXBsVGVtcGxhdGVFbmdpbmVJbnN0YW5jZSk7XG5cbiAgICBrby5leHBvcnRTeW1ib2woJ2pxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZScsIGtvLmpxdWVyeVRtcGxUZW1wbGF0ZUVuZ2luZSk7XG59KSgpO1xufSkpO1xufSgpKTtcbn0pKCk7XG4iLCIvKiEgU29ja2V0LklPLmpzIGJ1aWxkOjAuOS4xNiwgZGV2ZWxvcG1lbnQuIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT4gTUlUIExpY2Vuc2VkICovXG5cbnZhciBpbyA9ICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIG1vZHVsZSA/IHt9IDogbW9kdWxlLmV4cG9ydHMpO1xuKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogSU8gbmFtZXNwYWNlLlxuICAgKlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuXG4gIHZhciBpbyA9IGV4cG9ydHM7XG5cbiAgLyoqXG4gICAqIFNvY2tldC5JTyB2ZXJzaW9uXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnZlcnNpb24gPSAnMC45LjE2JztcblxuICAvKipcbiAgICogUHJvdG9jb2wgaW1wbGVtZW50ZWQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnByb3RvY29sID0gMTtcblxuICAvKipcbiAgICogQXZhaWxhYmxlIHRyYW5zcG9ydHMsIHRoZXNlIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggdGhlIGF2YWlsYWJsZSB0cmFuc3BvcnRzXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMgPSBbXTtcblxuICAvKipcbiAgICogS2VlcCB0cmFjayBvZiBqc29ucCBjYWxsYmFja3MuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby5qID0gW107XG5cbiAgLyoqXG4gICAqIEtlZXAgdHJhY2sgb2Ygb3VyIGlvLlNvY2tldHNcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBpby5zb2NrZXRzID0ge307XG5cblxuICAvKipcbiAgICogTWFuYWdlcyBjb25uZWN0aW9ucyB0byBob3N0cy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVyaVxuICAgKiBAUGFyYW0ge0Jvb2xlYW59IGZvcmNlIGNyZWF0aW9uIG9mIG5ldyBzb2NrZXQgKGRlZmF1bHRzIHRvIGZhbHNlKVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBpby5jb25uZWN0ID0gZnVuY3Rpb24gKGhvc3QsIGRldGFpbHMpIHtcbiAgICB2YXIgdXJpID0gaW8udXRpbC5wYXJzZVVyaShob3N0KVxuICAgICAgLCB1dXJpXG4gICAgICAsIHNvY2tldDtcblxuICAgIGlmIChnbG9iYWwgJiYgZ2xvYmFsLmxvY2F0aW9uKSB7XG4gICAgICB1cmkucHJvdG9jb2wgPSB1cmkucHJvdG9jb2wgfHwgZ2xvYmFsLmxvY2F0aW9uLnByb3RvY29sLnNsaWNlKDAsIC0xKTtcbiAgICAgIHVyaS5ob3N0ID0gdXJpLmhvc3QgfHwgKGdsb2JhbC5kb2N1bWVudFxuICAgICAgICA/IGdsb2JhbC5kb2N1bWVudC5kb21haW4gOiBnbG9iYWwubG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgdXJpLnBvcnQgPSB1cmkucG9ydCB8fCBnbG9iYWwubG9jYXRpb24ucG9ydDtcbiAgICB9XG5cbiAgICB1dXJpID0gaW8udXRpbC51bmlxdWVVcmkodXJpKTtcblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBob3N0OiB1cmkuaG9zdFxuICAgICAgLCBzZWN1cmU6ICdodHRwcycgPT0gdXJpLnByb3RvY29sXG4gICAgICAsIHBvcnQ6IHVyaS5wb3J0IHx8ICgnaHR0cHMnID09IHVyaS5wcm90b2NvbCA/IDQ0MyA6IDgwKVxuICAgICAgLCBxdWVyeTogdXJpLnF1ZXJ5IHx8ICcnXG4gICAgfTtcblxuICAgIGlvLnV0aWwubWVyZ2Uob3B0aW9ucywgZGV0YWlscyk7XG5cbiAgICBpZiAob3B0aW9uc1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSB8fCAhaW8uc29ja2V0c1t1dXJpXSkge1xuICAgICAgc29ja2V0ID0gbmV3IGlvLlNvY2tldChvcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnNbJ2ZvcmNlIG5ldyBjb25uZWN0aW9uJ10gJiYgc29ja2V0KSB7XG4gICAgICBpby5zb2NrZXRzW3V1cmldID0gc29ja2V0O1xuICAgIH1cblxuICAgIHNvY2tldCA9IHNvY2tldCB8fCBpby5zb2NrZXRzW3V1cmldO1xuXG4gICAgLy8gaWYgcGF0aCBpcyBkaWZmZXJlbnQgZnJvbSAnJyBvciAvXG4gICAgcmV0dXJuIHNvY2tldC5vZih1cmkucGF0aC5sZW5ndGggPiAxID8gdXJpLnBhdGggOiAnJyk7XG4gIH07XG5cbn0pKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiAodGhpcy5pbyA9IHt9KSwgdGhpcyk7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogVXRpbGl0aWVzIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB2YXIgdXRpbCA9IGV4cG9ydHMudXRpbCA9IHt9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW4gVVJJXG4gICAqXG4gICAqIEBhdXRob3IgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+IChNSVQgbGljZW5zZSlcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdmFyIHJlID0gL14oPzooPyFbXjpAXSs6W146QFxcL10qQCkoW146XFwvPyMuXSspOik/KD86XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPyhbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvO1xuXG4gIHZhciBwYXJ0cyA9IFsnc291cmNlJywgJ3Byb3RvY29sJywgJ2F1dGhvcml0eScsICd1c2VySW5mbycsICd1c2VyJywgJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICdob3N0JywgJ3BvcnQnLCAncmVsYXRpdmUnLCAncGF0aCcsICdkaXJlY3RvcnknLCAnZmlsZScsICdxdWVyeScsXG4gICAgICAgICAgICAgICAnYW5jaG9yJ107XG5cbiAgdXRpbC5wYXJzZVVyaSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICB2YXIgbSA9IHJlLmV4ZWMoc3RyIHx8ICcnKVxuICAgICAgLCB1cmkgPSB7fVxuICAgICAgLCBpID0gMTQ7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB1cmlbcGFydHNbaV1dID0gbVtpXSB8fCAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdXJpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIHVuaXF1ZSB1cmwgdGhhdCBpZGVudGlmaWVzIGEgU29ja2V0LklPIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cmlcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51bmlxdWVVcmkgPSBmdW5jdGlvbiAodXJpKSB7XG4gICAgdmFyIHByb3RvY29sID0gdXJpLnByb3RvY29sXG4gICAgICAsIGhvc3QgPSB1cmkuaG9zdFxuICAgICAgLCBwb3J0ID0gdXJpLnBvcnQ7XG5cbiAgICBpZiAoJ2RvY3VtZW50JyBpbiBnbG9iYWwpIHtcbiAgICAgIGhvc3QgPSBob3N0IHx8IGRvY3VtZW50LmRvbWFpbjtcbiAgICAgIHBvcnQgPSBwb3J0IHx8IChwcm90b2NvbCA9PSAnaHR0cHMnXG4gICAgICAgICYmIGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sICE9PSAnaHR0cHM6JyA/IDQ0MyA6IGRvY3VtZW50LmxvY2F0aW9uLnBvcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBob3N0ID0gaG9zdCB8fCAnbG9jYWxob3N0JztcblxuICAgICAgaWYgKCFwb3J0ICYmIHByb3RvY29sID09ICdodHRwcycpIHtcbiAgICAgICAgcG9ydCA9IDQ0MztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gKHByb3RvY29sIHx8ICdodHRwJykgKyAnOi8vJyArIGhvc3QgKyAnOicgKyAocG9ydCB8fCA4MCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1lcmdlc3QgMiBxdWVyeSBzdHJpbmdzIGluIHRvIG9uY2UgdW5pcXVlIHF1ZXJ5IHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gYmFzZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gYWRkaXRpb25cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5xdWVyeSA9IGZ1bmN0aW9uIChiYXNlLCBhZGRpdGlvbikge1xuICAgIHZhciBxdWVyeSA9IHV0aWwuY2h1bmtRdWVyeShiYXNlIHx8ICcnKVxuICAgICAgLCBjb21wb25lbnRzID0gW107XG5cbiAgICB1dGlsLm1lcmdlKHF1ZXJ5LCB1dGlsLmNodW5rUXVlcnkoYWRkaXRpb24gfHwgJycpKTtcbiAgICBmb3IgKHZhciBwYXJ0IGluIHF1ZXJ5KSB7XG4gICAgICBpZiAocXVlcnkuaGFzT3duUHJvcGVydHkocGFydCkpIHtcbiAgICAgICAgY29tcG9uZW50cy5wdXNoKHBhcnQgKyAnPScgKyBxdWVyeVtwYXJ0XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudHMubGVuZ3RoID8gJz8nICsgY29tcG9uZW50cy5qb2luKCcmJykgOiAnJztcbiAgfTtcblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBhIHF1ZXJ5c3RyaW5nIGluIHRvIGFuIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcXNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5jaHVua1F1ZXJ5ID0gZnVuY3Rpb24gKHFzKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge31cbiAgICAgICwgcGFyYW1zID0gcXMuc3BsaXQoJyYnKVxuICAgICAgLCBpID0gMFxuICAgICAgLCBsID0gcGFyYW1zLmxlbmd0aFxuICAgICAgLCBrdjtcblxuICAgIGZvciAoOyBpIDwgbDsgKytpKSB7XG4gICAgICBrdiA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuICAgICAgaWYgKGt2WzBdKSB7XG4gICAgICAgIHF1ZXJ5W2t2WzBdXSA9IGt2WzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBxdWVyeTtcbiAgfTtcblxuICAvKipcbiAgICogRXhlY3V0ZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHdoZW4gdGhlIHBhZ2UgaXMgbG9hZGVkLlxuICAgKlxuICAgKiAgICAgaW8udXRpbC5sb2FkKGZ1bmN0aW9uICgpIHsgY29uc29sZS5sb2coJ3BhZ2UgbG9hZGVkJyk7IH0pO1xuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB2YXIgcGFnZUxvYWRlZCA9IGZhbHNlO1xuXG4gIHV0aWwubG9hZCA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCAmJiBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnIHx8IHBhZ2VMb2FkZWQpIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH1cblxuICAgIHV0aWwub24oZ2xvYmFsLCAnbG9hZCcsIGZuLCBmYWxzZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICB1dGlsLm9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50LCBmbiwgY2FwdHVyZSkge1xuICAgIGlmIChlbGVtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudCwgZm4pO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBjYXB0dXJlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlcyB0aGUgY29ycmVjdCBgWE1MSHR0cFJlcXVlc3RgIGZvciByZWd1bGFyIGFuZCBjcm9zcyBkb21haW4gcmVxdWVzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3hkb21haW5dIENyZWF0ZSBhIHJlcXVlc3QgdGhhdCBjYW4gYmUgdXNlZCBjcm9zcyBkb21haW4uXG4gICAqIEByZXR1cm5zIHtYTUxIdHRwUmVxdWVzdHxmYWxzZX0gSWYgd2UgY2FuIGNyZWF0ZSBhIFhNTEh0dHBSZXF1ZXN0LlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgdXRpbC5yZXF1ZXN0ID0gZnVuY3Rpb24gKHhkb21haW4pIHtcblxuICAgIGlmICh4ZG9tYWluICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBYRG9tYWluUmVxdWVzdCAmJiAhdXRpbC51YS5oYXNDT1JTKSB7XG4gICAgICByZXR1cm4gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAmJiAoIXhkb21haW4gfHwgdXRpbC51YS5oYXNDT1JTKSkge1xuICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIH1cblxuICAgIGlmICgheGRvbWFpbikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyB3aW5kb3dbKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSgnTWljcm9zb2Z0LlhNTEhUVFAnKTtcbiAgICAgIH0gY2F0Y2goZSkgeyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIFhIUiBiYXNlZCB0cmFuc3BvcnQgY29uc3RydWN0b3IuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBpbnRlcm5hbCBwYWdlTG9hZGVkIHZhbHVlLlxuICAgKi9cblxuICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIHdpbmRvdykge1xuICAgIHV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBwYWdlTG9hZGVkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZlcnMgYSBmdW5jdGlvbiB0byBlbnN1cmUgYSBzcGlubmVyIGlzIG5vdCBkaXNwbGF5ZWQgYnkgdGhlIGJyb3dzZXJcbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5kZWZlciA9IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICghdXRpbC51YS53ZWJraXQgfHwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGltcG9ydFNjcmlwdHMpIHtcbiAgICAgIHJldHVybiBmbigpO1xuICAgIH1cblxuICAgIHV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZuLCAxMDApO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgdHdvIG9iamVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwubWVyZ2UgPSBmdW5jdGlvbiBtZXJnZSAodGFyZ2V0LCBhZGRpdGlvbmFsLCBkZWVwLCBsYXN0c2Vlbikge1xuICAgIHZhciBzZWVuID0gbGFzdHNlZW4gfHwgW11cbiAgICAgICwgZGVwdGggPSB0eXBlb2YgZGVlcCA9PSAndW5kZWZpbmVkJyA/IDIgOiBkZWVwXG4gICAgICAsIHByb3A7XG5cbiAgICBmb3IgKHByb3AgaW4gYWRkaXRpb25hbCkge1xuICAgICAgaWYgKGFkZGl0aW9uYWwuaGFzT3duUHJvcGVydHkocHJvcCkgJiYgdXRpbC5pbmRleE9mKHNlZW4sIHByb3ApIDwgMCkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtwcm9wXSAhPT0gJ29iamVjdCcgfHwgIWRlcHRoKSB7XG4gICAgICAgICAgdGFyZ2V0W3Byb3BdID0gYWRkaXRpb25hbFtwcm9wXTtcbiAgICAgICAgICBzZWVuLnB1c2goYWRkaXRpb25hbFtwcm9wXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXRpbC5tZXJnZSh0YXJnZXRbcHJvcF0sIGFkZGl0aW9uYWxbcHJvcF0sIGRlcHRoIC0gMSwgc2Vlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBNZXJnZXMgcHJvdG90eXBlcyBmcm9tIG9iamVjdHNcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5taXhpbiA9IGZ1bmN0aW9uIChjdG9yLCBjdG9yMikge1xuICAgIHV0aWwubWVyZ2UoY3Rvci5wcm90b3R5cGUsIGN0b3IyLnByb3RvdHlwZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3J0Y3V0IGZvciBwcm90b3R5cGljYWwgYW5kIHN0YXRpYyBpbmhlcml0YW5jZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHV0aWwuaW5oZXJpdCA9IGZ1bmN0aW9uIChjdG9yLCBjdG9yMikge1xuICAgIGZ1bmN0aW9uIGYoKSB7fTtcbiAgICBmLnByb3RvdHlwZSA9IGN0b3IyLnByb3RvdHlwZTtcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBBcnJheS5cbiAgICpcbiAgICogICAgIGlvLnV0aWwuaXNBcnJheShbXSk7IC8vIHRydWVcbiAgICogICAgIGlvLnV0aWwuaXNBcnJheSh7fSk7IC8vIGZhbHNlXG4gICAqXG4gICAqIEBwYXJhbSBPYmplY3Qgb2JqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvKipcbiAgICogSW50ZXJzZWN0cyB2YWx1ZXMgb2YgdHdvIGFycmF5cyBpbnRvIGEgdGhpcmRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC5pbnRlcnNlY3QgPSBmdW5jdGlvbiAoYXJyLCBhcnIyKSB7XG4gICAgdmFyIHJldCA9IFtdXG4gICAgICAsIGxvbmdlc3QgPSBhcnIubGVuZ3RoID4gYXJyMi5sZW5ndGggPyBhcnIgOiBhcnIyXG4gICAgICAsIHNob3J0ZXN0ID0gYXJyLmxlbmd0aCA+IGFycjIubGVuZ3RoID8gYXJyMiA6IGFycjtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gc2hvcnRlc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAofnV0aWwuaW5kZXhPZihsb25nZXN0LCBzaG9ydGVzdFtpXSkpXG4gICAgICAgIHJldC5wdXNoKHNob3J0ZXN0W2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcnJheSBpbmRleE9mIGNvbXBhdGliaWxpdHkuXG4gICAqXG4gICAqIEBzZWUgYml0Lmx5L2E1RHhhMlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB1dGlsLmluZGV4T2YgPSBmdW5jdGlvbiAoYXJyLCBvLCBpKSB7XG5cbiAgICBmb3IgKHZhciBqID0gYXJyLmxlbmd0aCwgaSA9IGkgPCAwID8gaSArIGogPCAwID8gMCA6IGkgKyBqIDogaSB8fCAwO1xuICAgICAgICAgaSA8IGogJiYgYXJyW2ldICE9PSBvOyBpKyspIHt9XG5cbiAgICByZXR1cm4gaiA8PSBpID8gLTEgOiBpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBlbnVtZXJhYmxlcyB0byBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC50b0FycmF5ID0gZnVuY3Rpb24gKGVudSkge1xuICAgIHZhciBhcnIgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZW51Lmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgIGFyci5wdXNoKGVudVtpXSk7XG5cbiAgICByZXR1cm4gYXJyO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVQSAvIGVuZ2luZXMgZGV0ZWN0aW9uIG5hbWVzcGFjZS5cbiAgICpcbiAgICogQG5hbWVzcGFjZVxuICAgKi9cblxuICB1dGlsLnVhID0ge307XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIFVBIHN1cHBvcnRzIENPUlMgZm9yIFhIUi5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgdXRpbC51YS5oYXNDT1JTID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICYmIChmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBhLndpdGhDcmVkZW50aWFscyAhPSB1bmRlZmluZWQ7XG4gIH0pKCk7XG5cbiAgLyoqXG4gICAqIERldGVjdCB3ZWJraXQuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEud2Via2l0ID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG5hdmlnYXRvclxuICAgICYmIC93ZWJraXQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAvKipcbiAgICogRGV0ZWN0IGlQYWQvaVBob25lL2lQb2QuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHV0aWwudWEuaURldmljZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3JcbiAgICAgICYmIC9pUGFkfGlQaG9uZXxpUG9kL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxufSkoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0cywgdGhpcyk7XG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4gIC8qKlxuICAgKiBFdmVudCBlbWl0dGVyIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpYy5cbiAgICovXG5cbiAgZnVuY3Rpb24gRXZlbnRFbWl0dGVyICgpIHt9O1xuXG4gIC8qKlxuICAgKiBBZGRzIGEgbGlzdGVuZXJcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGlmICghdGhpcy4kZXZlbnRzKSB7XG4gICAgICB0aGlzLiRldmVudHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuJGV2ZW50c1tuYW1lXSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdID0gZm47XG4gICAgfSBlbHNlIGlmIChpby51dGlsLmlzQXJyYXkodGhpcy4kZXZlbnRzW25hbWVdKSkge1xuICAgICAgdGhpcy4kZXZlbnRzW25hbWVdLnB1c2goZm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbdGhpcy4kZXZlbnRzW25hbWVdLCBmbl07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbiAgLyoqXG4gICAqIEFkZHMgYSB2b2xhdGlsZSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gb24gKCkge1xuICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcihuYW1lLCBvbik7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICBvbi5saXN0ZW5lciA9IGZuO1xuICAgIHRoaXMub24obmFtZSwgb24pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGlmICh0aGlzLiRldmVudHMgJiYgdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB2YXIgbGlzdCA9IHRoaXMuJGV2ZW50c1tuYW1lXTtcblxuICAgICAgaWYgKGlvLnV0aWwuaXNBcnJheShsaXN0KSkge1xuICAgICAgICB2YXIgcG9zID0gLTE7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmIChsaXN0W2ldID09PSBmbiB8fCAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBmbikpIHtcbiAgICAgICAgICAgIHBvcyA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zIDwgMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5zcGxpY2UocG9zLCAxKTtcblxuICAgICAgICBpZiAoIWxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuJGV2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsaXN0ID09PSBmbiB8fCAobGlzdC5saXN0ZW5lciAmJiBsaXN0Lmxpc3RlbmVyID09PSBmbikpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuJGV2ZW50c1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzIGZvciBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChuYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuJGV2ZW50cyAmJiB0aGlzLiRldmVudHNbbmFtZV0pIHtcbiAgICAgIHRoaXMuJGV2ZW50c1tuYW1lXSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGxpc3RlbmVycyBmb3IgYSBjZXJ0YWluIGV2ZW50LlxuICAgKlxuICAgKiBAYXBpIHB1YmxjaVxuICAgKi9cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLiRldmVudHMpIHtcbiAgICAgIHRoaXMuJGV2ZW50cyA9IHt9O1xuICAgIH1cblxuICAgIGlmICghdGhpcy4kZXZlbnRzW25hbWVdKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoIWlvLnV0aWwuaXNBcnJheSh0aGlzLiRldmVudHNbbmFtZV0pKSB7XG4gICAgICB0aGlzLiRldmVudHNbbmFtZV0gPSBbdGhpcy4kZXZlbnRzW25hbWVdXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy4kZXZlbnRzW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFbWl0cyBhbiBldmVudC5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuJGV2ZW50cykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBoYW5kbGVyID0gdGhpcy4kZXZlbnRzW25hbWVdO1xuXG4gICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGhhbmRsZXIpIHtcbiAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSBlbHNlIGlmIChpby51dGlsLmlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyoqXG4gKiBCYXNlZCBvbiBKU09OMiAoaHR0cDovL3d3dy5KU09OLm9yZy9qcy5odG1sKS5cbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIG5hdGl2ZUpTT04pIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLy8gdXNlIG5hdGl2ZSBKU09OIGlmIGl0J3MgYXZhaWxhYmxlXG4gIGlmIChuYXRpdmVKU09OICYmIG5hdGl2ZUpTT04ucGFyc2Upe1xuICAgIHJldHVybiBleHBvcnRzLkpTT04gPSB7XG4gICAgICBwYXJzZTogbmF0aXZlSlNPTi5wYXJzZVxuICAgICwgc3RyaW5naWZ5OiBuYXRpdmVKU09OLnN0cmluZ2lmeVxuICAgIH07XG4gIH1cblxuICB2YXIgSlNPTiA9IGV4cG9ydHMuSlNPTiA9IHt9O1xuXG4gIGZ1bmN0aW9uIGYobikge1xuICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuIDogbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRhdGUoZCwga2V5KSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKGQudmFsdWVPZigpKSA/XG4gICAgICAgIGQuZ2V0VVRDRnVsbFllYXIoKSAgICAgKyAnLScgK1xuICAgICAgICBmKGQuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgZihkLmdldFVUQ0RhdGUoKSkgICAgICArICdUJyArXG4gICAgICAgIGYoZC5nZXRVVENIb3VycygpKSAgICAgKyAnOicgK1xuICAgICAgICBmKGQuZ2V0VVRDTWludXRlcygpKSAgICsgJzonICtcbiAgICAgICAgZihkLmdldFVUQ1NlY29uZHMoKSkgICArICdaJyA6IG51bGw7XG4gIH07XG5cbiAgdmFyIGN4ID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICBlc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgZ2FwLFxuICAgICAgaW5kZW50LFxuICAgICAgbWV0YSA9IHsgICAgLy8gdGFibGUgb2YgY2hhcmFjdGVyIHN1YnN0aXR1dGlvbnNcbiAgICAgICAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgICAnXFxuJzogJ1xcXFxuJyxcbiAgICAgICAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgICAnXCInIDogJ1xcXFxcIicsXG4gICAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgICB9LFxuICAgICAgcmVwO1xuXG5cbiAgZnVuY3Rpb24gcXVvdGUoc3RyaW5nKSB7XG5cbi8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbi8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4vLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbi8vIHNlcXVlbmNlcy5cblxuICAgICAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgICByZXR1cm4gZXNjYXBhYmxlLnRlc3Qoc3RyaW5nKSA/ICdcIicgKyBzdHJpbmcucmVwbGFjZShlc2NhcGFibGUsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICAgIHJldHVybiB0eXBlb2YgYyA9PT0gJ3N0cmluZycgPyBjIDpcbiAgICAgICAgICAgICAgJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICB9KSArICdcIicgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbiAgfVxuXG5cbiAgZnVuY3Rpb24gc3RyKGtleSwgaG9sZGVyKSB7XG5cbi8vIFByb2R1Y2UgYSBzdHJpbmcgZnJvbSBob2xkZXJba2V5XS5cblxuICAgICAgdmFyIGksICAgICAgICAgIC8vIFRoZSBsb29wIGNvdW50ZXIuXG4gICAgICAgICAgaywgICAgICAgICAgLy8gVGhlIG1lbWJlciBrZXkuXG4gICAgICAgICAgdiwgICAgICAgICAgLy8gVGhlIG1lbWJlciB2YWx1ZS5cbiAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgbWluZCA9IGdhcCxcbiAgICAgICAgICBwYXJ0aWFsLFxuICAgICAgICAgIHZhbHVlID0gaG9sZGVyW2tleV07XG5cbi8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgdmFsdWUgPSBkYXRlKGtleSk7XG4gICAgICB9XG5cbi8vIElmIHdlIHdlcmUgY2FsbGVkIHdpdGggYSByZXBsYWNlciBmdW5jdGlvbiwgdGhlbiBjYWxsIHRoZSByZXBsYWNlciB0b1xuLy8gb2J0YWluIGEgcmVwbGFjZW1lbnQgdmFsdWUuXG5cbiAgICAgIGlmICh0eXBlb2YgcmVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdmFsdWUgPSByZXAuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuXG4vLyBXaGF0IGhhcHBlbnMgbmV4dCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSdzIHR5cGUuXG5cbiAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgIHJldHVybiBxdW90ZSh2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ251bWJlcic6XG5cbi8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gRW5jb2RlIG5vbi1maW5pdGUgbnVtYmVycyBhcyBudWxsLlxuXG4gICAgICAgICAgcmV0dXJuIGlzRmluaXRlKHZhbHVlKSA/IFN0cmluZyh2YWx1ZSkgOiAnbnVsbCc7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVsbCc6XG5cbi8vIElmIHRoZSB2YWx1ZSBpcyBhIGJvb2xlYW4gb3IgbnVsbCwgY29udmVydCBpdCB0byBhIHN0cmluZy4gTm90ZTpcbi8vIHR5cGVvZiBudWxsIGRvZXMgbm90IHByb2R1Y2UgJ251bGwnLiBUaGUgY2FzZSBpcyBpbmNsdWRlZCBoZXJlIGluXG4vLyB0aGUgcmVtb3RlIGNoYW5jZSB0aGF0IHRoaXMgZ2V0cyBmaXhlZCBzb21lZGF5LlxuXG4gICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG5cbi8vIElmIHRoZSB0eXBlIGlzICdvYmplY3QnLCB3ZSBtaWdodCBiZSBkZWFsaW5nIHdpdGggYW4gb2JqZWN0IG9yIGFuIGFycmF5IG9yXG4vLyBudWxsLlxuXG4gICAgICBjYXNlICdvYmplY3QnOlxuXG4vLyBEdWUgdG8gYSBzcGVjaWZpY2F0aW9uIGJsdW5kZXIgaW4gRUNNQVNjcmlwdCwgdHlwZW9mIG51bGwgaXMgJ29iamVjdCcsXG4vLyBzbyB3YXRjaCBvdXQgZm9yIHRoYXQgY2FzZS5cblxuICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgICAgICB9XG5cbi8vIE1ha2UgYW4gYXJyYXkgdG8gaG9sZCB0aGUgcGFydGlhbCByZXN1bHRzIG9mIHN0cmluZ2lmeWluZyB0aGlzIG9iamVjdCB2YWx1ZS5cblxuICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgcGFydGlhbCA9IFtdO1xuXG4vLyBJcyB0aGUgdmFsdWUgYW4gYXJyYXk/XG5cbiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcblxuLy8gVGhlIHZhbHVlIGlzIGFuIGFycmF5LiBTdHJpbmdpZnkgZXZlcnkgZWxlbWVudC4gVXNlIG51bGwgYXMgYSBwbGFjZWhvbGRlclxuLy8gZm9yIG5vbi1KU09OIHZhbHVlcy5cblxuICAgICAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgcGFydGlhbFtpXSA9IHN0cihpLCB2YWx1ZSkgfHwgJ251bGwnO1xuICAgICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBlbGVtZW50cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLCBhbmQgd3JhcCB0aGVtIGluXG4vLyBicmFja2V0cy5cblxuICAgICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDAgPyAnW10nIDogZ2FwID9cbiAgICAgICAgICAgICAgICAgICdbXFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ10nIDpcbiAgICAgICAgICAgICAgICAgICdbJyArIHBhcnRpYWwuam9pbignLCcpICsgJ10nO1xuICAgICAgICAgICAgICBnYXAgPSBtaW5kO1xuICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICB9XG5cbi8vIElmIHRoZSByZXBsYWNlciBpcyBhbiBhcnJheSwgdXNlIGl0IHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzdHJpbmdpZmllZC5cblxuICAgICAgICAgIGlmIChyZXAgJiYgdHlwZW9mIHJlcCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgbGVuZ3RoID0gcmVwLmxlbmd0aDtcbiAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlcFtpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICBrID0gcmVwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpYWwucHVzaChxdW90ZShrKSArIChnYXAgPyAnOiAnIDogJzonKSArIHYpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG5cbi8vIE90aGVyd2lzZSwgaXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuXG4gICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBtZW1iZXIgdGV4dHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcyxcbi8vIGFuZCB3cmFwIHRoZW0gaW4gYnJhY2VzLlxuXG4gICAgICAgICAgdiA9IHBhcnRpYWwubGVuZ3RoID09PSAwID8gJ3t9JyA6IGdhcCA/XG4gICAgICAgICAgICAgICd7XFxuJyArIGdhcCArIHBhcnRpYWwuam9pbignLFxcbicgKyBnYXApICsgJ1xcbicgKyBtaW5kICsgJ30nIDpcbiAgICAgICAgICAgICAgJ3snICsgcGFydGlhbC5qb2luKCcsJykgKyAnfSc7XG4gICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICByZXR1cm4gdjtcbiAgICAgIH1cbiAgfVxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBzdHJpbmdpZnkgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICBKU09OLnN0cmluZ2lmeSA9IGZ1bmN0aW9uICh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKSB7XG5cbi8vIFRoZSBzdHJpbmdpZnkgbWV0aG9kIHRha2VzIGEgdmFsdWUgYW5kIGFuIG9wdGlvbmFsIHJlcGxhY2VyLCBhbmQgYW4gb3B0aW9uYWxcbi8vIHNwYWNlIHBhcmFtZXRlciwgYW5kIHJldHVybnMgYSBKU09OIHRleHQuIFRoZSByZXBsYWNlciBjYW4gYmUgYSBmdW5jdGlvblxuLy8gdGhhdCBjYW4gcmVwbGFjZSB2YWx1ZXMsIG9yIGFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCB3aWxsIHNlbGVjdCB0aGUga2V5cy5cbi8vIEEgZGVmYXVsdCByZXBsYWNlciBtZXRob2QgY2FuIGJlIHByb3ZpZGVkLiBVc2Ugb2YgdGhlIHNwYWNlIHBhcmFtZXRlciBjYW5cbi8vIHByb2R1Y2UgdGV4dCB0aGF0IGlzIG1vcmUgZWFzaWx5IHJlYWRhYmxlLlxuXG4gICAgICB2YXIgaTtcbiAgICAgIGdhcCA9ICcnO1xuICAgICAgaW5kZW50ID0gJyc7XG5cbi8vIElmIHRoZSBzcGFjZSBwYXJhbWV0ZXIgaXMgYSBudW1iZXIsIG1ha2UgYW4gaW5kZW50IHN0cmluZyBjb250YWluaW5nIHRoYXRcbi8vIG1hbnkgc3BhY2VzLlxuXG4gICAgICBpZiAodHlwZW9mIHNwYWNlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzcGFjZTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgIGluZGVudCArPSAnICc7XG4gICAgICAgICAgfVxuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgc3RyaW5nLCBpdCB3aWxsIGJlIHVzZWQgYXMgdGhlIGluZGVudCBzdHJpbmcuXG5cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGluZGVudCA9IHNwYWNlO1xuICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJlcGxhY2VyLCBpdCBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXkuXG4vLyBPdGhlcndpc2UsIHRocm93IGFuIGVycm9yLlxuXG4gICAgICByZXAgPSByZXBsYWNlcjtcbiAgICAgIGlmIChyZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgIT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgICAgKHR5cGVvZiByZXBsYWNlciAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICAgICAgdHlwZW9mIHJlcGxhY2VyLmxlbmd0aCAhPT0gJ251bWJlcicpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdKU09OLnN0cmluZ2lmeScpO1xuICAgICAgfVxuXG4vLyBNYWtlIGEgZmFrZSByb290IG9iamVjdCBjb250YWluaW5nIG91ciB2YWx1ZSB1bmRlciB0aGUga2V5IG9mICcnLlxuLy8gUmV0dXJuIHRoZSByZXN1bHQgb2Ygc3RyaW5naWZ5aW5nIHRoZSB2YWx1ZS5cblxuICAgICAgcmV0dXJuIHN0cignJywgeycnOiB2YWx1ZX0pO1xuICB9O1xuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBwYXJzZSBtZXRob2QsIGdpdmUgaXQgb25lLlxuXG4gIEpTT04ucGFyc2UgPSBmdW5jdGlvbiAodGV4dCwgcmV2aXZlcikge1xuICAvLyBUaGUgcGFyc2UgbWV0aG9kIHRha2VzIGEgdGV4dCBhbmQgYW4gb3B0aW9uYWwgcmV2aXZlciBmdW5jdGlvbiwgYW5kIHJldHVybnNcbiAgLy8gYSBKYXZhU2NyaXB0IHZhbHVlIGlmIHRoZSB0ZXh0IGlzIGEgdmFsaWQgSlNPTiB0ZXh0LlxuXG4gICAgICB2YXIgajtcblxuICAgICAgZnVuY3Rpb24gd2Fsayhob2xkZXIsIGtleSkge1xuXG4gIC8vIFRoZSB3YWxrIG1ldGhvZCBpcyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIHJlc3VsdGluZyBzdHJ1Y3R1cmUgc29cbiAgLy8gdGhhdCBtb2RpZmljYXRpb25zIGNhbiBiZSBtYWRlLlxuXG4gICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgdmFsdWVba107XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgIH1cblxuXG4gIC8vIFBhcnNpbmcgaGFwcGVucyBpbiBmb3VyIHN0YWdlcy4gSW4gdGhlIGZpcnN0IHN0YWdlLCB3ZSByZXBsYWNlIGNlcnRhaW5cbiAgLy8gVW5pY29kZSBjaGFyYWN0ZXJzIHdpdGggZXNjYXBlIHNlcXVlbmNlcy4gSmF2YVNjcmlwdCBoYW5kbGVzIG1hbnkgY2hhcmFjdGVyc1xuICAvLyBpbmNvcnJlY3RseSwgZWl0aGVyIHNpbGVudGx5IGRlbGV0aW5nIHRoZW0sIG9yIHRyZWF0aW5nIHRoZW0gYXMgbGluZSBlbmRpbmdzLlxuXG4gICAgICB0ZXh0ID0gU3RyaW5nKHRleHQpO1xuICAgICAgY3gubGFzdEluZGV4ID0gMDtcbiAgICAgIGlmIChjeC50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShjeCwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdcXFxcdScgK1xuICAgICAgICAgICAgICAgICAgKCcwMDAwJyArIGEuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC00KTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAvLyBJbiB0aGUgc2Vjb25kIHN0YWdlLCB3ZSBydW4gdGhlIHRleHQgYWdhaW5zdCByZWd1bGFyIGV4cHJlc3Npb25zIHRoYXQgbG9va1xuICAvLyBmb3Igbm9uLUpTT04gcGF0dGVybnMuIFdlIGFyZSBlc3BlY2lhbGx5IGNvbmNlcm5lZCB3aXRoICcoKScgYW5kICduZXcnXG4gIC8vIGJlY2F1c2UgdGhleSBjYW4gY2F1c2UgaW52b2NhdGlvbiwgYW5kICc9JyBiZWNhdXNlIGl0IGNhbiBjYXVzZSBtdXRhdGlvbi5cbiAgLy8gQnV0IGp1c3QgdG8gYmUgc2FmZSwgd2Ugd2FudCB0byByZWplY3QgYWxsIHVuZXhwZWN0ZWQgZm9ybXMuXG5cbiAgLy8gV2Ugc3BsaXQgdGhlIHNlY29uZCBzdGFnZSBpbnRvIDQgcmVnZXhwIG9wZXJhdGlvbnMgaW4gb3JkZXIgdG8gd29yayBhcm91bmRcbiAgLy8gY3JpcHBsaW5nIGluZWZmaWNpZW5jaWVzIGluIElFJ3MgYW5kIFNhZmFyaSdzIHJlZ2V4cCBlbmdpbmVzLiBGaXJzdCB3ZVxuICAvLyByZXBsYWNlIHRoZSBKU09OIGJhY2tzbGFzaCBwYWlycyB3aXRoICdAJyAoYSBub24tSlNPTiBjaGFyYWN0ZXIpLiBTZWNvbmQsIHdlXG4gIC8vIHJlcGxhY2UgYWxsIHNpbXBsZSB2YWx1ZSB0b2tlbnMgd2l0aCAnXScgY2hhcmFjdGVycy4gVGhpcmQsIHdlIGRlbGV0ZSBhbGxcbiAgLy8gb3BlbiBicmFja2V0cyB0aGF0IGZvbGxvdyBhIGNvbG9uIG9yIGNvbW1hIG9yIHRoYXQgYmVnaW4gdGhlIHRleHQuIEZpbmFsbHksXG4gIC8vIHdlIGxvb2sgdG8gc2VlIHRoYXQgdGhlIHJlbWFpbmluZyBjaGFyYWN0ZXJzIGFyZSBvbmx5IHdoaXRlc3BhY2Ugb3IgJ10nIG9yXG4gIC8vICcsJyBvciAnOicgb3IgJ3snIG9yICd9Jy4gSWYgdGhhdCBpcyBzbywgdGhlbiB0aGUgdGV4dCBpcyBzYWZlIGZvciBldmFsLlxuXG4gICAgICBpZiAoL15bXFxdLDp7fVxcc10qJC9cbiAgICAgICAgICAgICAgLnRlc3QodGV4dC5yZXBsYWNlKC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1WzAtOWEtZkEtRl17NH0pL2csICdAJylcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZywgJ10nKVxuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58OnwsKSg/OlxccypcXFspKy9nLCAnJykpKSB7XG5cbiAgLy8gSW4gdGhlIHRoaXJkIHN0YWdlIHdlIHVzZSB0aGUgZXZhbCBmdW5jdGlvbiB0byBjb21waWxlIHRoZSB0ZXh0IGludG8gYVxuICAvLyBKYXZhU2NyaXB0IHN0cnVjdHVyZS4gVGhlICd7JyBvcGVyYXRvciBpcyBzdWJqZWN0IHRvIGEgc3ludGFjdGljIGFtYmlndWl0eVxuICAvLyBpbiBKYXZhU2NyaXB0OiBpdCBjYW4gYmVnaW4gYSBibG9jayBvciBhbiBvYmplY3QgbGl0ZXJhbC4gV2Ugd3JhcCB0aGUgdGV4dFxuICAvLyBpbiBwYXJlbnMgdG8gZWxpbWluYXRlIHRoZSBhbWJpZ3VpdHkuXG5cbiAgICAgICAgICBqID0gZXZhbCgnKCcgKyB0ZXh0ICsgJyknKTtcblxuICAvLyBJbiB0aGUgb3B0aW9uYWwgZm91cnRoIHN0YWdlLCB3ZSByZWN1cnNpdmVseSB3YWxrIHRoZSBuZXcgc3RydWN0dXJlLCBwYXNzaW5nXG4gIC8vIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIGEgcmV2aXZlciBmdW5jdGlvbiBmb3IgcG9zc2libGUgdHJhbnNmb3JtYXRpb24uXG5cbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbicgP1xuICAgICAgICAgICAgICB3YWxrKHsnJzogan0sICcnKSA6IGo7XG4gICAgICB9XG5cbiAgLy8gSWYgdGhlIHRleHQgaXMgbm90IEpTT04gcGFyc2VhYmxlLCB0aGVuIGEgU3ludGF4RXJyb3IgaXMgdGhyb3duLlxuXG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0pTT04ucGFyc2UnKTtcbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsIHR5cGVvZiBKU09OICE9PSAndW5kZWZpbmVkJyA/IEpTT04gOiB1bmRlZmluZWRcbik7XG5cbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIFBhcnNlciBuYW1lc3BhY2UuXG4gICAqXG4gICAqIEBuYW1lc3BhY2VcbiAgICovXG5cbiAgdmFyIHBhcnNlciA9IGV4cG9ydHMucGFyc2VyID0ge307XG5cbiAgLyoqXG4gICAqIFBhY2tldCB0eXBlcy5cbiAgICovXG5cbiAgdmFyIHBhY2tldHMgPSBwYXJzZXIucGFja2V0cyA9IFtcbiAgICAgICdkaXNjb25uZWN0J1xuICAgICwgJ2Nvbm5lY3QnXG4gICAgLCAnaGVhcnRiZWF0J1xuICAgICwgJ21lc3NhZ2UnXG4gICAgLCAnanNvbidcbiAgICAsICdldmVudCdcbiAgICAsICdhY2snXG4gICAgLCAnZXJyb3InXG4gICAgLCAnbm9vcCdcbiAgXTtcblxuICAvKipcbiAgICogRXJyb3JzIHJlYXNvbnMuXG4gICAqL1xuXG4gIHZhciByZWFzb25zID0gcGFyc2VyLnJlYXNvbnMgPSBbXG4gICAgICAndHJhbnNwb3J0IG5vdCBzdXBwb3J0ZWQnXG4gICAgLCAnY2xpZW50IG5vdCBoYW5kc2hha2VuJ1xuICAgICwgJ3VuYXV0aG9yaXplZCdcbiAgXTtcblxuICAvKipcbiAgICogRXJyb3JzIGFkdmljZS5cbiAgICovXG5cbiAgdmFyIGFkdmljZSA9IHBhcnNlci5hZHZpY2UgPSBbXG4gICAgICAncmVjb25uZWN0J1xuICBdO1xuXG4gIC8qKlxuICAgKiBTaG9ydGN1dHMuXG4gICAqL1xuXG4gIHZhciBKU09OID0gaW8uSlNPTlxuICAgICwgaW5kZXhPZiA9IGlvLnV0aWwuaW5kZXhPZjtcblxuICAvKipcbiAgICogRW5jb2RlcyBhIHBhY2tldC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHBhcnNlci5lbmNvZGVQYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgdmFyIHR5cGUgPSBpbmRleE9mKHBhY2tldHMsIHBhY2tldC50eXBlKVxuICAgICAgLCBpZCA9IHBhY2tldC5pZCB8fCAnJ1xuICAgICAgLCBlbmRwb2ludCA9IHBhY2tldC5lbmRwb2ludCB8fCAnJ1xuICAgICAgLCBhY2sgPSBwYWNrZXQuYWNrXG4gICAgICAsIGRhdGEgPSBudWxsO1xuXG4gICAgc3dpdGNoIChwYWNrZXQudHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICB2YXIgcmVhc29uID0gcGFja2V0LnJlYXNvbiA/IGluZGV4T2YocmVhc29ucywgcGFja2V0LnJlYXNvbikgOiAnJ1xuICAgICAgICAgICwgYWR2ID0gcGFja2V0LmFkdmljZSA/IGluZGV4T2YoYWR2aWNlLCBwYWNrZXQuYWR2aWNlKSA6ICcnO1xuXG4gICAgICAgIGlmIChyZWFzb24gIT09ICcnIHx8IGFkdiAhPT0gJycpXG4gICAgICAgICAgZGF0YSA9IHJlYXNvbiArIChhZHYgIT09ICcnID8gKCcrJyArIGFkdikgOiAnJyk7XG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ21lc3NhZ2UnOlxuICAgICAgICBpZiAocGFja2V0LmRhdGEgIT09ICcnKVxuICAgICAgICAgIGRhdGEgPSBwYWNrZXQuZGF0YTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2V2ZW50JzpcbiAgICAgICAgdmFyIGV2ID0geyBuYW1lOiBwYWNrZXQubmFtZSB9O1xuXG4gICAgICAgIGlmIChwYWNrZXQuYXJncyAmJiBwYWNrZXQuYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICBldi5hcmdzID0gcGFja2V0LmFyZ3M7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoZXYpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnanNvbic6XG4gICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeShwYWNrZXQuZGF0YSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgaWYgKHBhY2tldC5xcylcbiAgICAgICAgICBkYXRhID0gcGFja2V0LnFzO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgZGF0YSA9IHBhY2tldC5hY2tJZFxuICAgICAgICAgICsgKHBhY2tldC5hcmdzICYmIHBhY2tldC5hcmdzLmxlbmd0aFxuICAgICAgICAgICAgICA/ICcrJyArIEpTT04uc3RyaW5naWZ5KHBhY2tldC5hcmdzKSA6ICcnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gY29uc3RydWN0IHBhY2tldCB3aXRoIHJlcXVpcmVkIGZyYWdtZW50c1xuICAgIHZhciBlbmNvZGVkID0gW1xuICAgICAgICB0eXBlXG4gICAgICAsIGlkICsgKGFjayA9PSAnZGF0YScgPyAnKycgOiAnJylcbiAgICAgICwgZW5kcG9pbnRcbiAgICBdO1xuXG4gICAgLy8gZGF0YSBmcmFnbWVudCBpcyBvcHRpb25hbFxuICAgIGlmIChkYXRhICE9PSBudWxsICYmIGRhdGEgIT09IHVuZGVmaW5lZClcbiAgICAgIGVuY29kZWQucHVzaChkYXRhKTtcblxuICAgIHJldHVybiBlbmNvZGVkLmpvaW4oJzonKTtcbiAgfTtcblxuICAvKipcbiAgICogRW5jb2RlcyBtdWx0aXBsZSBtZXNzYWdlcyAocGF5bG9hZCkuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IG1lc3NhZ2VzXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBwYXJzZXIuZW5jb2RlUGF5bG9hZCA9IGZ1bmN0aW9uIChwYWNrZXRzKSB7XG4gICAgdmFyIGRlY29kZWQgPSAnJztcblxuICAgIGlmIChwYWNrZXRzLmxlbmd0aCA9PSAxKVxuICAgICAgcmV0dXJuIHBhY2tldHNbMF07XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHBhY2tldHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgcGFja2V0ID0gcGFja2V0c1tpXTtcbiAgICAgIGRlY29kZWQgKz0gJ1xcdWZmZmQnICsgcGFja2V0Lmxlbmd0aCArICdcXHVmZmZkJyArIHBhY2tldHNbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29kZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY29kZXMgYSBwYWNrZXRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHZhciByZWdleHAgPSAvKFteOl0rKTooWzAtOV0rKT8oXFwrKT86KFteOl0rKT86PyhbXFxzXFxTXSopPy87XG5cbiAgcGFyc2VyLmRlY29kZVBhY2tldCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHBpZWNlcyA9IGRhdGEubWF0Y2gocmVnZXhwKTtcblxuICAgIGlmICghcGllY2VzKSByZXR1cm4ge307XG5cbiAgICB2YXIgaWQgPSBwaWVjZXNbMl0gfHwgJydcbiAgICAgICwgZGF0YSA9IHBpZWNlc1s1XSB8fCAnJ1xuICAgICAgLCBwYWNrZXQgPSB7XG4gICAgICAgICAgICB0eXBlOiBwYWNrZXRzW3BpZWNlc1sxXV1cbiAgICAgICAgICAsIGVuZHBvaW50OiBwaWVjZXNbNF0gfHwgJydcbiAgICAgICAgfTtcblxuICAgIC8vIHdoZXRoZXIgd2UgbmVlZCB0byBhY2tub3dsZWRnZSB0aGUgcGFja2V0XG4gICAgaWYgKGlkKSB7XG4gICAgICBwYWNrZXQuaWQgPSBpZDtcbiAgICAgIGlmIChwaWVjZXNbM10pXG4gICAgICAgIHBhY2tldC5hY2sgPSAnZGF0YSc7XG4gICAgICBlbHNlXG4gICAgICAgIHBhY2tldC5hY2sgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBkaWZmZXJlbnQgcGFja2V0IHR5cGVzXG4gICAgc3dpdGNoIChwYWNrZXQudHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICB2YXIgcGllY2VzID0gZGF0YS5zcGxpdCgnKycpO1xuICAgICAgICBwYWNrZXQucmVhc29uID0gcmVhc29uc1twaWVjZXNbMF1dIHx8ICcnO1xuICAgICAgICBwYWNrZXQuYWR2aWNlID0gYWR2aWNlW3BpZWNlc1sxXV0gfHwgJyc7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdtZXNzYWdlJzpcbiAgICAgICAgcGFja2V0LmRhdGEgPSBkYXRhIHx8ICcnO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBvcHRzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICBwYWNrZXQubmFtZSA9IG9wdHMubmFtZTtcbiAgICAgICAgICBwYWNrZXQuYXJncyA9IG9wdHMuYXJncztcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG5cbiAgICAgICAgcGFja2V0LmFyZ3MgPSBwYWNrZXQuYXJncyB8fCBbXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhY2tldC5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgcGFja2V0LnFzID0gZGF0YSB8fCAnJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Fjayc6XG4gICAgICAgIHZhciBwaWVjZXMgPSBkYXRhLm1hdGNoKC9eKFswLTldKykoXFwrKT8oLiopLyk7XG4gICAgICAgIGlmIChwaWVjZXMpIHtcbiAgICAgICAgICBwYWNrZXQuYWNrSWQgPSBwaWVjZXNbMV07XG4gICAgICAgICAgcGFja2V0LmFyZ3MgPSBbXTtcblxuICAgICAgICAgIGlmIChwaWVjZXNbM10pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHBhY2tldC5hcmdzID0gcGllY2VzWzNdID8gSlNPTi5wYXJzZShwaWVjZXNbM10pIDogW107XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Rpc2Nvbm5lY3QnOlxuICAgICAgY2FzZSAnaGVhcnRiZWF0JzpcbiAgICAgICAgYnJlYWs7XG4gICAgfTtcblxuICAgIHJldHVybiBwYWNrZXQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY29kZXMgZGF0YSBwYXlsb2FkLiBEZXRlY3RzIG11bHRpcGxlIG1lc3NhZ2VzXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fSBtZXNzYWdlc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYXJzZXIuZGVjb2RlUGF5bG9hZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgLy8gSUUgZG9lc24ndCBsaWtlIGRhdGFbaV0gZm9yIHVuaWNvZGUgY2hhcnMsIGNoYXJBdCB3b3JrcyBmaW5lXG4gICAgaWYgKGRhdGEuY2hhckF0KDApID09ICdcXHVmZmZkJykge1xuICAgICAgdmFyIHJldCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gJyc7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhLmNoYXJBdChpKSA9PSAnXFx1ZmZmZCcpIHtcbiAgICAgICAgICByZXQucHVzaChwYXJzZXIuZGVjb2RlUGFja2V0KGRhdGEuc3Vic3RyKGkgKyAxKS5zdWJzdHIoMCwgbGVuZ3RoKSkpO1xuICAgICAgICAgIGkgKz0gTnVtYmVyKGxlbmd0aCkgKyAxO1xuICAgICAgICAgIGxlbmd0aCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlbmd0aCArPSBkYXRhLmNoYXJBdChpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW3BhcnNlci5kZWNvZGVQYWNrZXQoZGF0YSldO1xuICAgIH1cbiAgfTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlRyYW5zcG9ydCA9IFRyYW5zcG9ydDtcblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgdHJhbnNwb3J0IHRlbXBsYXRlIGZvciBhbGwgc3VwcG9ydGVkIHRyYW5zcG9ydCBtZXRob2RzLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gVHJhbnNwb3J0IChzb2NrZXQsIHNlc3NpZCkge1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuc2Vzc2lkID0gc2Vzc2lkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBseSBFdmVudEVtaXR0ZXIgbWl4aW4uXG4gICAqL1xuXG4gIGlvLnV0aWwubWl4aW4oVHJhbnNwb3J0LCBpby5FdmVudEVtaXR0ZXIpO1xuXG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIGhlYXJ0YmVhdHMgaXMgZW5hYmxlZCBmb3IgdGhpcyB0cmFuc3BvcnRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUuaGVhcnRiZWF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLiBXaGVuIGEgbmV3IHJlc3BvbnNlIGlzIHJlY2VpdmVkXG4gICAqIGl0IHdpbGwgYXV0b21hdGljYWxseSB1cGRhdGUgdGhlIHRpbWVvdXQsIGRlY29kZSB0aGUgbWVzc2FnZSBhbmRcbiAgICogZm9yd2FyZHMgdGhlIHJlc3BvbnNlIHRvIHRoZSBvbk1lc3NhZ2UgZnVuY3Rpb24gZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgUmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMuY2xlYXJDbG9zZVRpbWVvdXQoKTtcblxuICAgIC8vIElmIHRoZSBjb25uZWN0aW9uIGluIGN1cnJlbnRseSBvcGVuIChvciBpbiBhIHJlb3BlbmluZyBzdGF0ZSkgcmVzZXQgdGhlIGNsb3NlXG4gICAgLy8gdGltZW91dCBzaW5jZSB3ZSBoYXZlIGp1c3QgcmVjZWl2ZWQgZGF0YS4gVGhpcyBjaGVjayBpcyBuZWNlc3Nhcnkgc29cbiAgICAvLyB0aGF0IHdlIGRvbid0IHJlc2V0IHRoZSB0aW1lb3V0IG9uIGFuIGV4cGxpY2l0bHkgZGlzY29ubmVjdGVkIGNvbm5lY3Rpb24uXG4gICAgaWYgKHRoaXMuc29ja2V0LmNvbm5lY3RlZCB8fCB0aGlzLnNvY2tldC5jb25uZWN0aW5nIHx8IHRoaXMuc29ja2V0LnJlY29ubmVjdGluZykge1xuICAgICAgdGhpcy5zZXRDbG9zZVRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSAhPT0gJycpIHtcbiAgICAgIC8vIHRvZG86IHdlIHNob3VsZCBvbmx5IGRvIGRlY29kZVBheWxvYWQgZm9yIHhociB0cmFuc3BvcnRzXG4gICAgICB2YXIgbXNncyA9IGlvLnBhcnNlci5kZWNvZGVQYXlsb2FkKGRhdGEpO1xuXG4gICAgICBpZiAobXNncyAmJiBtc2dzLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1zZ3MubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5vblBhY2tldChtc2dzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHBhY2tldHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHRoaXMuc29ja2V0LnNldEhlYXJ0YmVhdFRpbWVvdXQoKTtcblxuICAgIGlmIChwYWNrZXQudHlwZSA9PSAnaGVhcnRiZWF0Jykge1xuICAgICAgcmV0dXJuIHRoaXMub25IZWFydGJlYXQoKTtcbiAgICB9XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2Nvbm5lY3QnICYmIHBhY2tldC5lbmRwb2ludCA9PSAnJykge1xuICAgICAgdGhpcy5vbkNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT0gJ2Vycm9yJyAmJiBwYWNrZXQuYWR2aWNlID09ICdyZWNvbm5lY3QnKSB7XG4gICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9uUGFja2V0KHBhY2tldCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyBjbG9zZSB0aW1lb3V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnNldENsb3NlVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuY2xvc2VUaW1lb3V0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuY2xvc2VUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYub25EaXNjb25uZWN0KCk7XG4gICAgICB9LCB0aGlzLnNvY2tldC5jbG9zZVRpbWVvdXQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdHJhbnNwb3J0IGRpc2Nvbm5lY3RzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRpc2Nvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy5jbGVhclRpbWVvdXRzKCk7XG4gICAgdGhpcy5zb2NrZXQub25EaXNjb25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRyYW5zcG9ydCBjb25uZWN0c1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkNvbm5lY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zb2NrZXQub25Db25uZWN0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFycyBjbG9zZSB0aW1lb3V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLmNsZWFyQ2xvc2VUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNsb3NlVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY2xvc2VUaW1lb3V0KTtcbiAgICAgIHRoaXMuY2xvc2VUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENsZWFyIHRpbWVvdXRzXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLmNsZWFyVGltZW91dHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jbGVhckNsb3NlVGltZW91dCgpO1xuXG4gICAgaWYgKHRoaXMucmVvcGVuVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVvcGVuVGltZW91dCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHBhY2tldFxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFja2V0IG9iamVjdC5cbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFRyYW5zcG9ydC5wcm90b3R5cGUucGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHRoaXMuc2VuZChpby5wYXJzZXIuZW5jb2RlUGFja2V0KHBhY2tldCkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIHRoZSByZWNlaXZlZCBoZWFydGJlYXQgbWVzc2FnZSBiYWNrIHRvIHNlcnZlci4gU28gdGhlIHNlcnZlclxuICAgKiBrbm93cyB3ZSBhcmUgc3RpbGwgY29ubmVjdGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaGVhcnRiZWF0IEhlYXJ0YmVhdCByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uSGVhcnRiZWF0ID0gZnVuY3Rpb24gKGhlYXJ0YmVhdCkge1xuICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2hlYXJ0YmVhdCcgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgb3BlbnMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XG4gICAgdGhpcy5jbGVhckNsb3NlVGltZW91dCgpO1xuICAgIHRoaXMuc29ja2V0Lm9uT3BlbigpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBOb3RpZmllcyB0aGUgYmFzZSB3aGVuIHRoZSBjb25uZWN0aW9uIHdpdGggdGhlIFNvY2tldC5JTyBzZXJ2ZXJcbiAgICogaGFzIGJlZW4gZGlzY29ubmVjdGVkLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5vbkNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8qIEZJWE1FOiByZW9wZW4gZGVsYXkgY2F1c2luZyBhIGluZmluaXQgbG9vcFxuICAgIHRoaXMucmVvcGVuVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vcGVuKCk7XG4gICAgfSwgdGhpcy5zb2NrZXQub3B0aW9uc1sncmVvcGVuIGRlbGF5J10pOyovXG5cbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuc29ja2V0Lm9uQ2xvc2UoKTtcbiAgICB0aGlzLm9uRGlzY29ubmVjdCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSBjb25uZWN0aW9uIHVybCBiYXNlZCBvbiB0aGUgU29ja2V0LklPIFVSTCBQcm90b2NvbC5cbiAgICogU2VlIDxodHRwczovL2dpdGh1Yi5jb20vbGVhcm5ib29zdC9zb2NrZXQuaW8tbm9kZS8+IGZvciBtb3JlIGRldGFpbHMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IENvbm5lY3Rpb24gdXJsXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBUcmFuc3BvcnQucHJvdG90eXBlLnByZXBhcmVVcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLnNvY2tldC5vcHRpb25zO1xuXG4gICAgcmV0dXJuIHRoaXMuc2NoZW1lKCkgKyAnOi8vJ1xuICAgICAgKyBvcHRpb25zLmhvc3QgKyAnOicgKyBvcHRpb25zLnBvcnQgKyAnLydcbiAgICAgICsgb3B0aW9ucy5yZXNvdXJjZSArICcvJyArIGlvLnByb3RvY29sXG4gICAgICArICcvJyArIHRoaXMubmFtZSArICcvJyArIHRoaXMuc2Vzc2lkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHRyYW5zcG9ydCBpcyByZWFkeSB0byBzdGFydCBhIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgVHJhbnNwb3J0LnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgZm4uY2FsbCh0aGlzKTtcbiAgfTtcbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvLCBnbG9iYWwpIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlNvY2tldCA9IFNvY2tldDtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBTb2NrZXQuSU8gY2xpZW50YCB3aGljaCBjYW4gZXN0YWJsaXNoIGEgcGVyc2lzdGVudFxuICAgKiBjb25uZWN0aW9uIHdpdGggYSBTb2NrZXQuSU8gZW5hYmxlZCBzZXJ2ZXIuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldCAob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgcG9ydDogODBcbiAgICAgICwgc2VjdXJlOiBmYWxzZVxuICAgICAgLCBkb2N1bWVudDogJ2RvY3VtZW50JyBpbiBnbG9iYWwgPyBkb2N1bWVudCA6IGZhbHNlXG4gICAgICAsIHJlc291cmNlOiAnc29ja2V0LmlvJ1xuICAgICAgLCB0cmFuc3BvcnRzOiBpby50cmFuc3BvcnRzXG4gICAgICAsICdjb25uZWN0IHRpbWVvdXQnOiAxMDAwMFxuICAgICAgLCAndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnOiB0cnVlXG4gICAgICAsICdyZWNvbm5lY3QnOiB0cnVlXG4gICAgICAsICdyZWNvbm5lY3Rpb24gZGVsYXknOiA1MDBcbiAgICAgICwgJ3JlY29ubmVjdGlvbiBsaW1pdCc6IEluZmluaXR5XG4gICAgICAsICdyZW9wZW4gZGVsYXknOiAzMDAwXG4gICAgICAsICdtYXggcmVjb25uZWN0aW9uIGF0dGVtcHRzJzogMTBcbiAgICAgICwgJ3N5bmMgZGlzY29ubmVjdCBvbiB1bmxvYWQnOiBmYWxzZVxuICAgICAgLCAnYXV0byBjb25uZWN0JzogdHJ1ZVxuICAgICAgLCAnZmxhc2ggcG9saWN5IHBvcnQnOiAxMDg0M1xuICAgICAgLCAnbWFudWFsRmx1c2gnOiBmYWxzZVxuICAgIH07XG5cbiAgICBpby51dGlsLm1lcmdlKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5uYW1lc3BhY2VzID0ge307XG4gICAgdGhpcy5idWZmZXIgPSBbXTtcbiAgICB0aGlzLmRvQnVmZmVyID0gZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zWydzeW5jIGRpc2Nvbm5lY3Qgb24gdW5sb2FkJ10gJiZcbiAgICAgICAgKCF0aGlzLmlzWERvbWFpbigpIHx8IGlvLnV0aWwudWEuaGFzQ09SUykpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlvLnV0aWwub24oZ2xvYmFsLCAnYmVmb3JldW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmRpc2Nvbm5lY3RTeW5jKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9uc1snYXV0byBjb25uZWN0J10pIHtcbiAgICAgIHRoaXMuY29ubmVjdCgpO1xuICAgIH1cbn07XG5cbiAgLyoqXG4gICAqIEFwcGx5IEV2ZW50RW1pdHRlciBtaXhpbi5cbiAgICovXG5cbiAgaW8udXRpbC5taXhpbihTb2NrZXQsIGlvLkV2ZW50RW1pdHRlcik7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuYW1lc3BhY2UgbGlzdGVuZXIvZW1pdHRlciBmb3IgdGhpcyBzb2NrZXRcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLm5hbWVzcGFjZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMubmFtZXNwYWNlc1tuYW1lXSA9IG5ldyBpby5Tb2NrZXROYW1lc3BhY2UodGhpcywgbmFtZSk7XG5cbiAgICAgIGlmIChuYW1lICE9PSAnJykge1xuICAgICAgICB0aGlzLm5hbWVzcGFjZXNbbmFtZV0ucGFja2V0KHsgdHlwZTogJ2Nvbm5lY3QnIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZXNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBnaXZlbiBldmVudCB0byB0aGUgU29ja2V0IGFuZCBhbGwgbmFtZXNwYWNlc1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5wdWJsaXNoID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdmFyIG5zcDtcblxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5uYW1lc3BhY2VzKSB7XG4gICAgICBpZiAodGhpcy5uYW1lc3BhY2VzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIG5zcCA9IHRoaXMub2YoaSk7XG4gICAgICAgIG5zcC4kZW1pdC5hcHBseShuc3AsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgaGFuZHNoYWtlXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBlbXB0eSAoKSB7IH07XG5cbiAgU29ja2V0LnByb3RvdHlwZS5oYW5kc2hha2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlIChkYXRhKSB7XG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHNlbGYuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLm9uRXJyb3IoZGF0YS5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGRhdGEuc3BsaXQoJzonKSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciB1cmwgPSBbXG4gICAgICAgICAgJ2h0dHAnICsgKG9wdGlvbnMuc2VjdXJlID8gJ3MnIDogJycpICsgJzovJ1xuICAgICAgICAsIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAsIG9wdGlvbnMucmVzb3VyY2VcbiAgICAgICAgLCBpby5wcm90b2NvbFxuICAgICAgICAsIGlvLnV0aWwucXVlcnkodGhpcy5vcHRpb25zLnF1ZXJ5LCAndD0nICsgK25ldyBEYXRlKVxuICAgICAgXS5qb2luKCcvJyk7XG5cbiAgICBpZiAodGhpcy5pc1hEb21haW4oKSAmJiAhaW8udXRpbC51YS5oYXNDT1JTKSB7XG4gICAgICB2YXIgaW5zZXJ0QXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF1cbiAgICAgICAgLCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuICAgICAgc2NyaXB0LnNyYyA9IHVybCArICcmanNvbnA9JyArIGlvLmoubGVuZ3RoO1xuICAgICAgaW5zZXJ0QXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2NyaXB0LCBpbnNlcnRBdCk7XG5cbiAgICAgIGlvLmoucHVzaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBjb21wbGV0ZShkYXRhKTtcbiAgICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgeGhyID0gaW8udXRpbC5yZXF1ZXN0KCk7XG5cbiAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgaWYgKHRoaXMuaXNYRG9tYWluKCkpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcblxuICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAgICAgY29tcGxldGUoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgfSBlbHNlIGlmICh4aHIuc3RhdHVzID09IDQwMykge1xuICAgICAgICAgICAgc2VsZi5vbkVycm9yKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSBmYWxzZTsgICAgICAgICAgICBcbiAgICAgICAgICAgICFzZWxmLnJlY29ubmVjdGluZyAmJiBzZWxmLm9uRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgeGhyLnNlbmQobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGaW5kIGFuIGF2YWlsYWJsZSB0cmFuc3BvcnQgYmFzZWQgb24gdGhlIG9wdGlvbnMgc3VwcGxpZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5nZXRUcmFuc3BvcnQgPSBmdW5jdGlvbiAob3ZlcnJpZGUpIHtcbiAgICB2YXIgdHJhbnNwb3J0cyA9IG92ZXJyaWRlIHx8IHRoaXMudHJhbnNwb3J0cywgbWF0Y2g7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgdHJhbnNwb3J0OyB0cmFuc3BvcnQgPSB0cmFuc3BvcnRzW2ldOyBpKyspIHtcbiAgICAgIGlmIChpby5UcmFuc3BvcnRbdHJhbnNwb3J0XVxuICAgICAgICAmJiBpby5UcmFuc3BvcnRbdHJhbnNwb3J0XS5jaGVjayh0aGlzKVxuICAgICAgICAmJiAoIXRoaXMuaXNYRG9tYWluKCkgfHwgaW8uVHJhbnNwb3J0W3RyYW5zcG9ydF0ueGRvbWFpbkNoZWNrKHRoaXMpKSkge1xuICAgICAgICByZXR1cm4gbmV3IGlvLlRyYW5zcG9ydFt0cmFuc3BvcnRdKHRoaXMsIHRoaXMuc2Vzc2lvbmlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICAvKipcbiAgICogQ29ubmVjdHMgdG8gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXSBDYWxsYmFjay5cbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgaWYgKHRoaXMuY29ubmVjdGluZykge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuY29ubmVjdGluZyA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5oYW5kc2hha2UoZnVuY3Rpb24gKHNpZCwgaGVhcnRiZWF0LCBjbG9zZSwgdHJhbnNwb3J0cykge1xuICAgICAgc2VsZi5zZXNzaW9uaWQgPSBzaWQ7XG4gICAgICBzZWxmLmNsb3NlVGltZW91dCA9IGNsb3NlICogMTAwMDtcbiAgICAgIHNlbGYuaGVhcnRiZWF0VGltZW91dCA9IGhlYXJ0YmVhdCAqIDEwMDA7XG4gICAgICBpZighc2VsZi50cmFuc3BvcnRzKVxuICAgICAgICAgIHNlbGYudHJhbnNwb3J0cyA9IHNlbGYub3JpZ1RyYW5zcG9ydHMgPSAodHJhbnNwb3J0cyA/IGlvLnV0aWwuaW50ZXJzZWN0KFxuICAgICAgICAgICAgICB0cmFuc3BvcnRzLnNwbGl0KCcsJylcbiAgICAgICAgICAgICwgc2VsZi5vcHRpb25zLnRyYW5zcG9ydHNcbiAgICAgICAgICApIDogc2VsZi5vcHRpb25zLnRyYW5zcG9ydHMpO1xuXG4gICAgICBzZWxmLnNldEhlYXJ0YmVhdFRpbWVvdXQoKTtcblxuICAgICAgZnVuY3Rpb24gY29ubmVjdCAodHJhbnNwb3J0cyl7XG4gICAgICAgIGlmIChzZWxmLnRyYW5zcG9ydCkgc2VsZi50cmFuc3BvcnQuY2xlYXJUaW1lb3V0cygpO1xuXG4gICAgICAgIHNlbGYudHJhbnNwb3J0ID0gc2VsZi5nZXRUcmFuc3BvcnQodHJhbnNwb3J0cyk7XG4gICAgICAgIGlmICghc2VsZi50cmFuc3BvcnQpIHJldHVybiBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RfZmFpbGVkJyk7XG5cbiAgICAgICAgLy8gb25jZSB0aGUgdHJhbnNwb3J0IGlzIHJlYWR5XG4gICAgICAgIHNlbGYudHJhbnNwb3J0LnJlYWR5KHNlbGYsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLmNvbm5lY3RpbmcgPSB0cnVlO1xuICAgICAgICAgIHNlbGYucHVibGlzaCgnY29ubmVjdGluZycsIHNlbGYudHJhbnNwb3J0Lm5hbWUpO1xuICAgICAgICAgIHNlbGYudHJhbnNwb3J0Lm9wZW4oKTtcblxuICAgICAgICAgIGlmIChzZWxmLm9wdGlvbnNbJ2Nvbm5lY3QgdGltZW91dCddKSB7XG4gICAgICAgICAgICBzZWxmLmNvbm5lY3RUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKCFzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY29ubmVjdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYub3B0aW9uc1sndHJ5IG11bHRpcGxlIHRyYW5zcG9ydHMnXSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHNlbGYudHJhbnNwb3J0cztcblxuICAgICAgICAgICAgICAgICAgd2hpbGUgKHJlbWFpbmluZy5sZW5ndGggPiAwICYmIHJlbWFpbmluZy5zcGxpY2UoMCwxKVswXSAhPVxuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0Lm5hbWUpIHt9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZy5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3QocmVtYWluaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBzZWxmLnB1Ymxpc2goJ2Nvbm5lY3RfZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHNlbGYub3B0aW9uc1snY29ubmVjdCB0aW1lb3V0J10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbm5lY3Qoc2VsZi50cmFuc3BvcnRzKTtcblxuICAgICAgc2VsZi5vbmNlKCdjb25uZWN0JywgZnVuY3Rpb24gKCl7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLmNvbm5lY3RUaW1lb3V0VGltZXIpO1xuXG4gICAgICAgIGZuICYmIHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nICYmIGZuKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgYW5kIHNldHMgYSBuZXcgaGVhcnRiZWF0IHRpbWVvdXQgdXNpbmcgdGhlIHZhbHVlIGdpdmVuIGJ5IHRoZVxuICAgKiBzZXJ2ZXIgZHVyaW5nIHRoZSBoYW5kc2hha2UuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLnNldEhlYXJ0YmVhdFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGVhcnRiZWF0VGltZW91dFRpbWVyKTtcbiAgICBpZih0aGlzLnRyYW5zcG9ydCAmJiAhdGhpcy50cmFuc3BvcnQuaGVhcnRiZWF0cygpKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5oZWFydGJlYXRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYudHJhbnNwb3J0Lm9uQ2xvc2UoKTtcbiAgICB9LCB0aGlzLmhlYXJ0YmVhdFRpbWVvdXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIHBhY2tldC5cbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCAmJiAhdGhpcy5kb0J1ZmZlcikge1xuICAgICAgdGhpcy50cmFuc3BvcnQucGFja2V0KGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXRzIGJ1ZmZlciBzdGF0ZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5zZXRCdWZmZXIgPSBmdW5jdGlvbiAodikge1xuICAgIHRoaXMuZG9CdWZmZXIgPSB2O1xuXG4gICAgaWYgKCF2ICYmIHRoaXMuY29ubmVjdGVkICYmIHRoaXMuYnVmZmVyLmxlbmd0aCkge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnNbJ21hbnVhbEZsdXNoJ10pIHtcbiAgICAgICAgdGhpcy5mbHVzaEJ1ZmZlcigpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRmx1c2hlcyB0aGUgYnVmZmVyIGRhdGEgb3ZlciB0aGUgd2lyZS5cbiAgICogVG8gYmUgaW52b2tlZCBtYW51YWxseSB3aGVuICdtYW51YWxGbHVzaCcgaXMgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZmx1c2hCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyYW5zcG9ydC5wYXlsb2FkKHRoaXMuYnVmZmVyKTtcbiAgICB0aGlzLmJ1ZmZlciA9IFtdO1xuICB9O1xuICBcblxuICAvKipcbiAgICogRGlzY29ubmVjdCB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdC5cbiAgICpcbiAgICogQHJldHVybnMge2lvLlNvY2tldH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmNvbm5lY3RlZCB8fCB0aGlzLmNvbm5lY3RpbmcpIHtcbiAgICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgICAgdGhpcy5vZignJykucGFja2V0KHsgdHlwZTogJ2Rpc2Nvbm5lY3QnIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBoYW5kbGUgZGlzY29ubmVjdGlvbiBpbW1lZGlhdGVseVxuICAgICAgdGhpcy5vbkRpc2Nvbm5lY3QoJ2Jvb3RlZCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgc29ja2V0IHdpdGggYSBzeW5jIFhIUi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUuZGlzY29ubmVjdFN5bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZW5zdXJlIGRpc2Nvbm5lY3Rpb25cbiAgICB2YXIgeGhyID0gaW8udXRpbC5yZXF1ZXN0KCk7XG4gICAgdmFyIHVyaSA9IFtcbiAgICAgICAgJ2h0dHAnICsgKHRoaXMub3B0aW9ucy5zZWN1cmUgPyAncycgOiAnJykgKyAnOi8nXG4gICAgICAsIHRoaXMub3B0aW9ucy5ob3N0ICsgJzonICsgdGhpcy5vcHRpb25zLnBvcnRcbiAgICAgICwgdGhpcy5vcHRpb25zLnJlc291cmNlXG4gICAgICAsIGlvLnByb3RvY29sXG4gICAgICAsICcnXG4gICAgICAsIHRoaXMuc2Vzc2lvbmlkXG4gICAgXS5qb2luKCcvJykgKyAnLz9kaXNjb25uZWN0PTEnO1xuXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHVyaSwgZmFsc2UpO1xuICAgIHhoci5zZW5kKG51bGwpO1xuXG4gICAgLy8gaGFuZGxlIGRpc2Nvbm5lY3Rpb24gaW1tZWRpYXRlbHlcbiAgICB0aGlzLm9uRGlzY29ubmVjdCgnYm9vdGVkJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHdlIG5lZWQgdG8gdXNlIGNyb3NzIGRvbWFpbiBlbmFibGVkIHRyYW5zcG9ydHMuIENyb3NzIGRvbWFpbiB3b3VsZFxuICAgKiBiZSBhIGRpZmZlcmVudCBwb3J0IG9yIGRpZmZlcmVudCBkb21haW4gbmFtZS5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLmlzWERvbWFpbiA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBwb3J0ID0gZ2xvYmFsLmxvY2F0aW9uLnBvcnQgfHxcbiAgICAgICgnaHR0cHM6JyA9PSBnbG9iYWwubG9jYXRpb24ucHJvdG9jb2wgPyA0NDMgOiA4MCk7XG5cbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmhvc3QgIT09IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSBcbiAgICAgIHx8IHRoaXMub3B0aW9ucy5wb3J0ICE9IHBvcnQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIGhhbmRzaGFrZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25Db25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29ubmVjdGluZyA9IGZhbHNlO1xuICAgICAgaWYgKCF0aGlzLmRvQnVmZmVyKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0byBmbHVzaCB0aGUgYnVmZmVyXG4gICAgICAgIHRoaXMuc2V0QnVmZmVyKGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBvcGVuc1xuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBjbG9zZXMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaGVhcnRiZWF0VGltZW91dFRpbWVyKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zcG9ydCBmaXJzdCBvcGVucyBhIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHBhcmFtIHRleHRcbiAgICovXG5cbiAgU29ja2V0LnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICB0aGlzLm9mKHBhY2tldC5lbmRwb2ludCkub25QYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhbiBlcnJvci5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICBpZiAoZXJyICYmIGVyci5hZHZpY2UpIHtcbiAgICAgIGlmIChlcnIuYWR2aWNlID09PSAncmVjb25uZWN0JyAmJiAodGhpcy5jb25uZWN0ZWQgfHwgdGhpcy5jb25uZWN0aW5nKSkge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZWNvbm5lY3QpIHtcbiAgICAgICAgICB0aGlzLnJlY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wdWJsaXNoKCdlcnJvcicsIGVyciAmJiBlcnIucmVhc29uID8gZXJyLnJlYXNvbiA6IGVycik7XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc3BvcnQgZGlzY29ubmVjdHMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXQucHJvdG90eXBlLm9uRGlzY29ubmVjdCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB2YXIgd2FzQ29ubmVjdGVkID0gdGhpcy5jb25uZWN0ZWRcbiAgICAgICwgd2FzQ29ubmVjdGluZyA9IHRoaXMuY29ubmVjdGluZztcblxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdGhpcy5jb25uZWN0aW5nID0gZmFsc2U7XG4gICAgdGhpcy5vcGVuID0gZmFsc2U7XG5cbiAgICBpZiAod2FzQ29ubmVjdGVkIHx8IHdhc0Nvbm5lY3RpbmcpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0LmNsb3NlKCk7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5jbGVhclRpbWVvdXRzKCk7XG4gICAgICBpZiAod2FzQ29ubmVjdGVkKSB7XG4gICAgICAgIHRoaXMucHVibGlzaCgnZGlzY29ubmVjdCcsIHJlYXNvbik7XG5cbiAgICAgICAgaWYgKCdib290ZWQnICE9IHJlYXNvbiAmJiB0aGlzLm9wdGlvbnMucmVjb25uZWN0ICYmICF0aGlzLnJlY29ubmVjdGluZykge1xuICAgICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIENhbGxlZCB1cG9uIHJlY29ubmVjdGlvbi5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFNvY2tldC5wcm90b3R5cGUucmVjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVjb25uZWN0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkF0dGVtcHRzID0gMDtcbiAgICB0aGlzLnJlY29ubmVjdGlvbkRlbGF5ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gZGVsYXknXTtcblxuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBtYXhBdHRlbXB0cyA9IHRoaXMub3B0aW9uc1snbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyddXG4gICAgICAsIHRyeU11bHRpcGxlID0gdGhpcy5vcHRpb25zWyd0cnkgbXVsdGlwbGUgdHJhbnNwb3J0cyddXG4gICAgICAsIGxpbWl0ID0gdGhpcy5vcHRpb25zWydyZWNvbm5lY3Rpb24gbGltaXQnXTtcblxuICAgIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICAgIGlmIChzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICBmb3IgKHZhciBpIGluIHNlbGYubmFtZXNwYWNlcykge1xuICAgICAgICAgIGlmIChzZWxmLm5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkoaSkgJiYgJycgIT09IGkpIHtcbiAgICAgICAgICAgICAgc2VsZi5uYW1lc3BhY2VzW2ldLnBhY2tldCh7IHR5cGU6ICdjb25uZWN0JyB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3QnLCBzZWxmLnRyYW5zcG9ydC5uYW1lLCBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKTtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYucmVjb25uZWN0aW9uVGltZXIpO1xuXG4gICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKCdjb25uZWN0X2ZhaWxlZCcsIG1heWJlUmVjb25uZWN0KTtcbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoJ2Nvbm5lY3QnLCBtYXliZVJlY29ubmVjdCk7XG5cbiAgICAgIHNlbGYucmVjb25uZWN0aW5nID0gZmFsc2U7XG5cbiAgICAgIGRlbGV0ZSBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzO1xuICAgICAgZGVsZXRlIHNlbGYucmVjb25uZWN0aW9uRGVsYXk7XG4gICAgICBkZWxldGUgc2VsZi5yZWNvbm5lY3Rpb25UaW1lcjtcbiAgICAgIGRlbGV0ZSBzZWxmLnJlZG9UcmFuc3BvcnRzO1xuXG4gICAgICBzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSB0cnlNdWx0aXBsZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWF5YmVSZWNvbm5lY3QgKCkge1xuICAgICAgaWYgKCFzZWxmLnJlY29ubmVjdGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLmNvbm5lY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVzZXQoKTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChzZWxmLmNvbm5lY3RpbmcgJiYgc2VsZi5yZWNvbm5lY3RpbmcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYucmVjb25uZWN0aW9uVGltZXIgPSBzZXRUaW1lb3V0KG1heWJlUmVjb25uZWN0LCAxMDAwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYucmVjb25uZWN0aW9uQXR0ZW1wdHMrKyA+PSBtYXhBdHRlbXB0cykge1xuICAgICAgICBpZiAoIXNlbGYucmVkb1RyYW5zcG9ydHMpIHtcbiAgICAgICAgICBzZWxmLm9uKCdjb25uZWN0X2ZhaWxlZCcsIG1heWJlUmVjb25uZWN0KTtcbiAgICAgICAgICBzZWxmLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSB0cnVlO1xuICAgICAgICAgIHNlbGYudHJhbnNwb3J0cyA9IHNlbGYub3JpZ1RyYW5zcG9ydHM7XG4gICAgICAgICAgc2VsZi50cmFuc3BvcnQgPSBzZWxmLmdldFRyYW5zcG9ydCgpO1xuICAgICAgICAgIHNlbGYucmVkb1RyYW5zcG9ydHMgPSB0cnVlO1xuICAgICAgICAgIHNlbGYuY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYucHVibGlzaCgncmVjb25uZWN0X2ZhaWxlZCcpO1xuICAgICAgICAgIHJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzZWxmLnJlY29ubmVjdGlvbkRlbGF5IDwgbGltaXQpIHtcbiAgICAgICAgICBzZWxmLnJlY29ubmVjdGlvbkRlbGF5ICo9IDI7IC8vIGV4cG9uZW50aWFsIGJhY2sgb2ZmXG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmNvbm5lY3QoKTtcbiAgICAgICAgc2VsZi5wdWJsaXNoKCdyZWNvbm5lY3RpbmcnLCBzZWxmLnJlY29ubmVjdGlvbkRlbGF5LCBzZWxmLnJlY29ubmVjdGlvbkF0dGVtcHRzKTtcbiAgICAgICAgc2VsZi5yZWNvbm5lY3Rpb25UaW1lciA9IHNldFRpbWVvdXQobWF5YmVSZWNvbm5lY3QsIHNlbGYucmVjb25uZWN0aW9uRGVsYXkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm9wdGlvbnNbJ3RyeSBtdWx0aXBsZSB0cmFuc3BvcnRzJ10gPSBmYWxzZTtcbiAgICB0aGlzLnJlY29ubmVjdGlvblRpbWVyID0gc2V0VGltZW91dChtYXliZVJlY29ubmVjdCwgdGhpcy5yZWNvbm5lY3Rpb25EZWxheSk7XG5cbiAgICB0aGlzLm9uKCdjb25uZWN0JywgbWF5YmVSZWNvbm5lY3QpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8pIHtcblxuICAvKipcbiAgICogRXhwb3NlIGNvbnN0cnVjdG9yLlxuICAgKi9cblxuICBleHBvcnRzLlNvY2tldE5hbWVzcGFjZSA9IFNvY2tldE5hbWVzcGFjZTtcblxuICAvKipcbiAgICogU29ja2V0IG5hbWVzcGFjZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFNvY2tldE5hbWVzcGFjZSAoc29ja2V0LCBuYW1lKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnJztcbiAgICB0aGlzLmZsYWdzID0ge307XG4gICAgdGhpcy5qc29uID0gbmV3IEZsYWcodGhpcywgJ2pzb24nKTtcbiAgICB0aGlzLmFja1BhY2tldHMgPSAwO1xuICAgIHRoaXMuYWNrcyA9IHt9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBBcHBseSBFdmVudEVtaXR0ZXIgbWl4aW4uXG4gICAqL1xuXG4gIGlvLnV0aWwubWl4aW4oU29ja2V0TmFtZXNwYWNlLCBpby5FdmVudEVtaXR0ZXIpO1xuXG4gIC8qKlxuICAgKiBDb3BpZXMgZW1pdCBzaW5jZSB3ZSBvdmVycmlkZSBpdFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS4kZW1pdCA9IGlvLkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdDtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBuYW1lc3BhY2UsIGJ5IHByb3h5aW5nIHRoZSByZXF1ZXN0IHRvIHRoZSBzb2NrZXQuIFRoaXNcbiAgICogYWxsb3dzIHVzIHRvIHVzZSB0aGUgc3luYXggYXMgd2UgZG8gb24gdGhlIHNlcnZlci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5vZiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQub2YuYXBwbHkodGhpcy5zb2NrZXQsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgcGFja2V0LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgcGFja2V0LmVuZHBvaW50ID0gdGhpcy5uYW1lO1xuICAgIHRoaXMuc29ja2V0LnBhY2tldChwYWNrZXQpO1xuICAgIHRoaXMuZmxhZ3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2VuZHMgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFNvY2tldE5hbWVzcGFjZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhLCBmbikge1xuICAgIHZhciBwYWNrZXQgPSB7XG4gICAgICAgIHR5cGU6IHRoaXMuZmxhZ3MuanNvbiA/ICdqc29uJyA6ICdtZXNzYWdlJ1xuICAgICAgLCBkYXRhOiBkYXRhXG4gICAgfTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBmbikge1xuICAgICAgcGFja2V0LmlkID0gKyt0aGlzLmFja1BhY2tldHM7XG4gICAgICBwYWNrZXQuYWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWNrc1twYWNrZXQuaWRdID0gZm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGFja2V0KHBhY2tldCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEVtaXRzIGFuIGV2ZW50XG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBcbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAgICwgbGFzdEFyZyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXVxuICAgICAgLCBwYWNrZXQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnZXZlbnQnXG4gICAgICAgICAgLCBuYW1lOiBuYW1lXG4gICAgICAgIH07XG5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgbGFzdEFyZykge1xuICAgICAgcGFja2V0LmlkID0gKyt0aGlzLmFja1BhY2tldHM7XG4gICAgICBwYWNrZXQuYWNrID0gJ2RhdGEnO1xuICAgICAgdGhpcy5hY2tzW3BhY2tldC5pZF0gPSBsYXN0QXJnO1xuICAgICAgYXJncyA9IGFyZ3Muc2xpY2UoMCwgYXJncy5sZW5ndGggLSAxKTtcbiAgICB9XG5cbiAgICBwYWNrZXQuYXJncyA9IGFyZ3M7XG5cbiAgICByZXR1cm4gdGhpcy5wYWNrZXQocGFja2V0KTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIG5hbWVzcGFjZVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgU29ja2V0TmFtZXNwYWNlLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm5hbWUgPT09ICcnKSB7XG4gICAgICB0aGlzLnNvY2tldC5kaXNjb25uZWN0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGFja2V0KHsgdHlwZTogJ2Rpc2Nvbm5lY3QnIH0pO1xuICAgICAgdGhpcy4kZW1pdCgnZGlzY29ubmVjdCcpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgcGFja2V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBTb2NrZXROYW1lc3BhY2UucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24gKHBhY2tldCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGFjayAoKSB7XG4gICAgICBzZWxmLnBhY2tldCh7XG4gICAgICAgICAgdHlwZTogJ2FjaydcbiAgICAgICAgLCBhcmdzOiBpby51dGlsLnRvQXJyYXkoYXJndW1lbnRzKVxuICAgICAgICAsIGFja0lkOiBwYWNrZXQuaWRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzd2l0Y2ggKHBhY2tldC50eXBlKSB7XG4gICAgICBjYXNlICdjb25uZWN0JzpcbiAgICAgICAgdGhpcy4kZW1pdCgnY29ubmVjdCcpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZGlzY29ubmVjdCc6XG4gICAgICAgIGlmICh0aGlzLm5hbWUgPT09ICcnKSB7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25EaXNjb25uZWN0KHBhY2tldC5yZWFzb24gfHwgJ2Jvb3RlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuJGVtaXQoJ2Rpc2Nvbm5lY3QnLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnbWVzc2FnZSc6XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgdmFyIHBhcmFtcyA9IFsnbWVzc2FnZScsIHBhY2tldC5kYXRhXTtcblxuICAgICAgICBpZiAocGFja2V0LmFjayA9PSAnZGF0YScpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaChhY2spO1xuICAgICAgICB9IGVsc2UgaWYgKHBhY2tldC5hY2spIHtcbiAgICAgICAgICB0aGlzLnBhY2tldCh7IHR5cGU6ICdhY2snLCBhY2tJZDogcGFja2V0LmlkIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kZW1pdC5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZXZlbnQnOlxuICAgICAgICB2YXIgcGFyYW1zID0gW3BhY2tldC5uYW1lXS5jb25jYXQocGFja2V0LmFyZ3MpO1xuXG4gICAgICAgIGlmIChwYWNrZXQuYWNrID09ICdkYXRhJylcbiAgICAgICAgICBwYXJhbXMucHVzaChhY2spO1xuXG4gICAgICAgIHRoaXMuJGVtaXQuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Fjayc6XG4gICAgICAgIGlmICh0aGlzLmFja3NbcGFja2V0LmFja0lkXSkge1xuICAgICAgICAgIHRoaXMuYWNrc1twYWNrZXQuYWNrSWRdLmFwcGx5KHRoaXMsIHBhY2tldC5hcmdzKTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5hY2tzW3BhY2tldC5hY2tJZF07XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgaWYgKHBhY2tldC5hZHZpY2Upe1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uRXJyb3IocGFja2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGFja2V0LnJlYXNvbiA9PSAndW5hdXRob3JpemVkJykge1xuICAgICAgICAgICAgdGhpcy4kZW1pdCgnY29ubmVjdF9mYWlsZWQnLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kZW1pdCgnZXJyb3InLCBwYWNrZXQucmVhc29uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBGbGFnIGludGVyZmFjZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEZsYWcgKG5zcCwgbmFtZSkge1xuICAgIHRoaXMubmFtZXNwYWNlID0gbnNwO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYWcucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UuZmxhZ3NbdGhpcy5uYW1lXSA9IHRydWU7XG4gICAgdGhpcy5uYW1lc3BhY2Uuc2VuZC5hcHBseSh0aGlzLm5hbWVzcGFjZSwgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogRW1pdCBhbiBldmVudFxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFnLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubmFtZXNwYWNlLmZsYWdzW3RoaXMubmFtZV0gPSB0cnVlO1xuICAgIHRoaXMubmFtZXNwYWNlLmVtaXQuYXBwbHkodGhpcy5uYW1lc3BhY2UsIGFyZ3VtZW50cyk7XG4gIH07XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMud2Vic29ja2V0ID0gV1M7XG5cbiAgLyoqXG4gICAqIFRoZSBXZWJTb2NrZXQgdHJhbnNwb3J0IHVzZXMgdGhlIEhUTUw1IFdlYlNvY2tldCBBUEkgdG8gZXN0YWJsaXNoIGFuXG4gICAqIHBlcnNpc3RlbnQgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBUaGlzIHRyYW5zcG9ydCB3aWxsIGFsc29cbiAgICogYmUgaW5oZXJpdGVkIGJ5IHRoZSBGbGFzaFNvY2tldCBmYWxsYmFjayBhcyBpdCBwcm92aWRlcyBhIEFQSSBjb21wYXRpYmxlXG4gICAqIHBvbHlmaWxsIGZvciB0aGUgV2ViU29ja2V0cy5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBleHRlbmRzIHtpby5UcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFdTIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChXUywgaW8uVHJhbnNwb3J0KTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MucHJvdG90eXBlLm5hbWUgPSAnd2Vic29ja2V0JztcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYSBuZXcgYFdlYlNvY2tldGAgY29ubmVjdGlvbiB3aXRoIHRoZSBTb2NrZXQuSU8gc2VydmVyLiBXZSBhdHRhY2hcbiAgICogYWxsIHRoZSBhcHByb3ByaWF0ZSBsaXN0ZW5lcnMgdG8gaGFuZGxlIHRoZSByZXNwb25zZXMgZnJvbSB0aGUgc2VydmVyLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBXUy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnkpXG4gICAgICAsIHNlbGYgPSB0aGlzXG4gICAgICAsIFNvY2tldFxuXG5cbiAgICBpZiAoIVNvY2tldCkge1xuICAgICAgU29ja2V0ID0gZ2xvYmFsLk1veldlYlNvY2tldCB8fCBnbG9iYWwuV2ViU29ja2V0O1xuICAgIH1cblxuICAgIHRoaXMud2Vic29ja2V0ID0gbmV3IFNvY2tldCh0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5KTtcblxuICAgIHRoaXMud2Vic29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub25PcGVuKCk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIH07XG4gICAgdGhpcy53ZWJzb2NrZXQub25tZXNzYWdlID0gZnVuY3Rpb24gKGV2KSB7XG4gICAgICBzZWxmLm9uRGF0YShldi5kYXRhKTtcbiAgICB9O1xuICAgIHRoaXMud2Vic29ja2V0Lm9uY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcih0cnVlKTtcbiAgICB9O1xuICAgIHRoaXMud2Vic29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgc2VsZi5vbkVycm9yKGUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuIFRoZSBtZXNzYWdlIHdpbGwgYXV0b21hdGljYWxseSBiZVxuICAgKiBlbmNvZGVkIGluIHRoZSBjb3JyZWN0IG1lc3NhZ2UgZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICAvLyBEbyB0byBhIGJ1ZyBpbiB0aGUgY3VycmVudCBJRGV2aWNlcyBicm93c2VyLCB3ZSBuZWVkIHRvIHdyYXAgdGhlIHNlbmQgaW4gYSBcbiAgLy8gc2V0VGltZW91dCwgd2hlbiB0aGV5IHJlc3VtZSBmcm9tIHNsZWVwaW5nIHRoZSBicm93c2VyIHdpbGwgY3Jhc2ggaWYgXG4gIC8vIHdlIGRvbid0IGFsbG93IHRoZSBicm93c2VyIHRpbWUgdG8gZGV0ZWN0IHRoZSBzb2NrZXQgaGFzIGJlZW4gY2xvc2VkXG4gIGlmIChpby51dGlsLnVhLmlEZXZpY2UpIHtcbiAgICBXUy5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgc2VsZi53ZWJzb2NrZXQuc2VuZChkYXRhKTtcbiAgICAgIH0sMCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIFdTLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIHRoaXMud2Vic29ja2V0LnNlbmQoZGF0YSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBheWxvYWRcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5wYXlsb2FkID0gZnVuY3Rpb24gKGFycikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5wYWNrZXQoYXJyW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIGVzdGFibGlzaGVkIGBXZWJTb2NrZXRgIGNvbm5lY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLndlYnNvY2tldC5jbG9zZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGVycm9ycyB0aGF0IGBXZWJTb2NrZXRgIG1pZ2h0IGJlIGdpdmluZyB3aGVuIHdlXG4gICAqIGFyZSBhdHRlbXB0aW5nIHRvIGNvbm5lY3Qgb3Igc2VuZCBtZXNzYWdlcy5cbiAgICpcbiAgICogQHBhcmFtIHtFcnJvcn0gZSBUaGUgZXJyb3IuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBXUy5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdGhpcy5zb2NrZXQub25FcnJvcihlKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgc2NoZW1lIGZvciB0aGUgVVJJIGdlbmVyYXRpb24uXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgV1MucHJvdG90eXBlLnNjaGVtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQub3B0aW9ucy5zZWN1cmUgPyAnd3NzJyA6ICd3cyc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgYnJvd3NlciBoYXMgc3VwcG9ydCBmb3IgbmF0aXZlIGBXZWJTb2NrZXRzYCBhbmQgdGhhdFxuICAgKiBpdCdzIG5vdCB0aGUgcG9seWZpbGwgY3JlYXRlZCBmb3IgdGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgV1MuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICgnV2ViU29ja2V0JyBpbiBnbG9iYWwgJiYgISgnX19hZGRUYXNrJyBpbiBXZWJTb2NrZXQpKVxuICAgICAgICAgIHx8ICdNb3pXZWJTb2NrZXQnIGluIGdsb2JhbDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGBXZWJTb2NrZXRgIHRyYW5zcG9ydCBzdXBwb3J0IGNyb3NzIGRvbWFpbiBjb21tdW5pY2F0aW9ucy5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFdTLnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnd2Vic29ja2V0Jyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbykge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHMuZmxhc2hzb2NrZXQgPSBGbGFzaHNvY2tldDtcblxuICAvKipcbiAgICogVGhlIEZsYXNoU29ja2V0IHRyYW5zcG9ydC4gVGhpcyBpcyBhIEFQSSB3cmFwcGVyIGZvciB0aGUgSFRNTDUgV2ViU29ja2V0XG4gICAqIHNwZWNpZmljYXRpb24uIEl0IHVzZXMgYSAuc3dmIGZpbGUgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgc2VydmVyLiBJZiB5b3Ugd2FudFxuICAgKiB0byBzZXJ2ZSB0aGUgLnN3ZiBmaWxlIGZyb20gYSBvdGhlciBzZXJ2ZXIgdGhhbiB3aGVyZSB0aGUgU29ja2V0LklPIHNjcmlwdCBpc1xuICAgKiBjb21pbmcgZnJvbSB5b3UgbmVlZCB0byB1c2UgdGhlIGluc2VjdXJlIHZlcnNpb24gb2YgdGhlIC5zd2YuIE1vcmUgaW5mb3JtYXRpb25cbiAgICogYWJvdXQgdGhpcyBjYW4gYmUgZm91bmQgb24gdGhlIGdpdGh1YiBwYWdlLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC53ZWJzb2NrZXR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEZsYXNoc29ja2V0ICgpIHtcbiAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoRmxhc2hzb2NrZXQsIGlvLlRyYW5zcG9ydC53ZWJzb2NrZXQpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBGbGFzaHNvY2tldC5wcm90b3R5cGUubmFtZSA9ICdmbGFzaHNvY2tldCc7XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3QgdGhlIGVzdGFibGlzaGVkIGBGbGFzaFNvY2tldGAgY29ubmVjdGlvbi4gVGhpcyBpcyBkb25lIGJ5IGFkZGluZyBhIFxuICAgKiBuZXcgdGFzayB0byB0aGUgRmxhc2hTb2NrZXQuIFRoZSByZXN0IHdpbGwgYmUgaGFuZGxlZCBvZmYgYnkgdGhlIGBXZWJTb2NrZXRgIFxuICAgKiB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc3BvcnR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgV2ViU29ja2V0Ll9fYWRkVGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICBpby5UcmFuc3BvcnQud2Vic29ja2V0LnByb3RvdHlwZS5vcGVuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgU29ja2V0LklPIHNlcnZlci4gVGhpcyBpcyBkb25lIGJ5IGFkZGluZyBhIG5ld1xuICAgKiB0YXNrIHRvIHRoZSBGbGFzaFNvY2tldC4gVGhlIHJlc3Qgd2lsbCBiZSBoYW5kbGVkIG9mZiBieSB0aGUgYFdlYlNvY2tldGAgXG4gICAqIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgIFdlYlNvY2tldC5fX2FkZFRhc2soZnVuY3Rpb24gKCkge1xuICAgICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUuc2VuZC5hcHBseShzZWxmLCBhcmdzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIGVzdGFibGlzaGVkIGBGbGFzaFNvY2tldGAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgRmxhc2hzb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgIFdlYlNvY2tldC5fX3Rhc2tzLmxlbmd0aCA9IDA7XG4gICAgaW8uVHJhbnNwb3J0LndlYnNvY2tldC5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogVGhlIFdlYlNvY2tldCBmYWxsIGJhY2sgbmVlZHMgdG8gYXBwZW5kIHRoZSBmbGFzaCBjb250YWluZXIgdG8gdGhlIGJvZHlcbiAgICogZWxlbWVudCwgc28gd2UgbmVlZCB0byBtYWtlIHN1cmUgd2UgaGF2ZSBhY2Nlc3MgdG8gaXQuIE9yIGRlZmVyIHRoZSBjYWxsXG4gICAqIHVudGlsIHdlIGFyZSBzdXJlIHRoZXJlIGlzIGEgYm9keSBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHNvY2tldC5vcHRpb25zXG4gICAgICAgICwgcG9ydCA9IG9wdGlvbnNbJ2ZsYXNoIHBvbGljeSBwb3J0J11cbiAgICAgICAgLCBwYXRoID0gW1xuICAgICAgICAgICAgICAnaHR0cCcgKyAob3B0aW9ucy5zZWN1cmUgPyAncycgOiAnJykgKyAnOi8nXG4gICAgICAgICAgICAsIG9wdGlvbnMuaG9zdCArICc6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAgICAgLCBvcHRpb25zLnJlc291cmNlXG4gICAgICAgICAgICAsICdzdGF0aWMvZmxhc2hzb2NrZXQnXG4gICAgICAgICAgICAsICdXZWJTb2NrZXRNYWluJyArIChzb2NrZXQuaXNYRG9tYWluKCkgPyAnSW5zZWN1cmUnIDogJycpICsgJy5zd2YnXG4gICAgICAgICAgXTtcblxuICAgICAgLy8gT25seSBzdGFydCBkb3dubG9hZGluZyB0aGUgc3dmIGZpbGUgd2hlbiB0aGUgY2hlY2tlZCB0aGF0IHRoaXMgYnJvd3NlclxuICAgICAgLy8gYWN0dWFsbHkgc3VwcG9ydHMgaXRcbiAgICAgIGlmICghRmxhc2hzb2NrZXQubG9hZGVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgV0VCX1NPQ0tFVF9TV0ZfTE9DQVRJT04gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gU2V0IHRoZSBjb3JyZWN0IGZpbGUgYmFzZWQgb24gdGhlIFhEb21haW4gc2V0dGluZ3NcbiAgICAgICAgICBXRUJfU09DS0VUX1NXRl9MT0NBVElPTiA9IHBhdGguam9pbignLycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvcnQgIT09IDg0Mykge1xuICAgICAgICAgIFdlYlNvY2tldC5sb2FkRmxhc2hQb2xpY3lGaWxlKCd4bWxzb2NrZXQ6Ly8nICsgb3B0aW9ucy5ob3N0ICsgJzonICsgcG9ydCk7XG4gICAgICAgIH1cblxuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICAgIEZsYXNoc29ja2V0LmxvYWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChkb2N1bWVudC5ib2R5KSByZXR1cm4gaW5pdCgpO1xuXG4gICAgaW8udXRpbC5sb2FkKGluaXQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgRmxhc2hTb2NrZXQgdHJhbnNwb3J0IGlzIHN1cHBvcnRlZCBhcyBpdCByZXF1aXJlcyB0aGF0IHRoZSBBZG9iZVxuICAgKiBGbGFzaCBQbGF5ZXIgcGx1Zy1pbiB2ZXJzaW9uIGAxMC4wLjBgIG9yIGdyZWF0ZXIgaXMgaW5zdGFsbGVkLiBBbmQgYWxzbyBjaGVjayBpZlxuICAgKiB0aGUgcG9seWZpbGwgaXMgY29ycmVjdGx5IGxvYWRlZC5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0LmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcbiAgICAgICAgdHlwZW9mIFdlYlNvY2tldCA9PSAndW5kZWZpbmVkJ1xuICAgICAgfHwgISgnX19pbml0aWFsaXplJyBpbiBXZWJTb2NrZXQpIHx8ICFzd2ZvYmplY3RcbiAgICApIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBzd2ZvYmplY3QuZ2V0Rmxhc2hQbGF5ZXJWZXJzaW9uKCkubWFqb3IgPj0gMTA7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBGbGFzaFNvY2tldCB0cmFuc3BvcnQgY2FuIGJlIHVzZWQgYXMgY3Jvc3MgZG9tYWluIC8gY3Jvc3Mgb3JpZ2luIFxuICAgKiB0cmFuc3BvcnQuIEJlY2F1c2Ugd2UgY2FuJ3Qgc2VlIHdoaWNoIHR5cGUgKHNlY3VyZSBvciBpbnNlY3VyZSkgb2YgLnN3ZiBpcyB1c2VkXG4gICAqIHdlIHdpbGwganVzdCByZXR1cm4gdHJ1ZS5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEZsYXNoc29ja2V0Lnhkb21haW5DaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogRGlzYWJsZSBBVVRPX0lOSVRJQUxJWkFUSU9OXG4gICAqL1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgV0VCX1NPQ0tFVF9ESVNBQkxFX0FVVE9fSU5JVElBTElaQVRJT04gPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ2ZsYXNoc29ja2V0Jyk7XG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4pO1xuLypcdFNXRk9iamVjdCB2Mi4yIDxodHRwOi8vY29kZS5nb29nbGUuY29tL3Avc3dmb2JqZWN0Lz4gXG5cdGlzIHJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSA8aHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHA+IFxuKi9cbmlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2Ygd2luZG93KSB7XG52YXIgc3dmb2JqZWN0PWZ1bmN0aW9uKCl7dmFyIEQ9XCJ1bmRlZmluZWRcIixyPVwib2JqZWN0XCIsUz1cIlNob2Nrd2F2ZSBGbGFzaFwiLFc9XCJTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaFwiLHE9XCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFI9XCJTV0ZPYmplY3RFeHBySW5zdFwiLHg9XCJvbnJlYWR5c3RhdGVjaGFuZ2VcIixPPXdpbmRvdyxqPWRvY3VtZW50LHQ9bmF2aWdhdG9yLFQ9ZmFsc2UsVT1baF0sbz1bXSxOPVtdLEk9W10sbCxRLEUsQixKPWZhbHNlLGE9ZmFsc2UsbixHLG09dHJ1ZSxNPWZ1bmN0aW9uKCl7dmFyIGFhPXR5cGVvZiBqLmdldEVsZW1lbnRCeUlkIT1EJiZ0eXBlb2Ygai5nZXRFbGVtZW50c0J5VGFnTmFtZSE9RCYmdHlwZW9mIGouY3JlYXRlRWxlbWVudCE9RCxhaD10LnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFk9dC5wbGF0Zm9ybS50b0xvd2VyQ2FzZSgpLGFlPVk/L3dpbi8udGVzdChZKTovd2luLy50ZXN0KGFoKSxhYz1ZPy9tYWMvLnRlc3QoWSk6L21hYy8udGVzdChhaCksYWY9L3dlYmtpdC8udGVzdChhaCk/cGFyc2VGbG9hdChhaC5yZXBsYWNlKC9eLip3ZWJraXRcXC8oXFxkKyhcXC5cXGQrKT8pLiokLyxcIiQxXCIpKTpmYWxzZSxYPSErXCJcXHYxXCIsYWc9WzAsMCwwXSxhYj1udWxsO2lmKHR5cGVvZiB0LnBsdWdpbnMhPUQmJnR5cGVvZiB0LnBsdWdpbnNbU109PXIpe2FiPXQucGx1Z2luc1tTXS5kZXNjcmlwdGlvbjtpZihhYiYmISh0eXBlb2YgdC5taW1lVHlwZXMhPUQmJnQubWltZVR5cGVzW3FdJiYhdC5taW1lVHlwZXNbcV0uZW5hYmxlZFBsdWdpbikpe1Q9dHJ1ZTtYPWZhbHNlO2FiPWFiLnJlcGxhY2UoL14uKlxccysoXFxTK1xccytcXFMrJCkvLFwiJDFcIik7YWdbMF09cGFyc2VJbnQoYWIucmVwbGFjZSgvXiguKilcXC4uKiQvLFwiJDFcIiksMTApO2FnWzFdPXBhcnNlSW50KGFiLnJlcGxhY2UoL14uKlxcLiguKilcXHMuKiQvLFwiJDFcIiksMTApO2FnWzJdPS9bYS16QS1aXS8udGVzdChhYik/cGFyc2VJbnQoYWIucmVwbGFjZSgvXi4qW2EtekEtWl0rKC4qKSQvLFwiJDFcIiksMTApOjB9fWVsc2V7aWYodHlwZW9mIE9bKFsnQWN0aXZlJ10uY29uY2F0KCdPYmplY3QnKS5qb2luKCdYJykpXSE9RCl7dHJ5e3ZhciBhZD1uZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oVyk7aWYoYWQpe2FiPWFkLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe1g9dHJ1ZTthYj1hYi5zcGxpdChcIiBcIilbMV0uc3BsaXQoXCIsXCIpO2FnPVtwYXJzZUludChhYlswXSwxMCkscGFyc2VJbnQoYWJbMV0sMTApLHBhcnNlSW50KGFiWzJdLDEwKV19fX1jYXRjaChaKXt9fX1yZXR1cm57dzM6YWEscHY6YWcsd2s6YWYsaWU6WCx3aW46YWUsbWFjOmFjfX0oKSxrPWZ1bmN0aW9uKCl7aWYoIU0udzMpe3JldHVybn1pZigodHlwZW9mIGoucmVhZHlTdGF0ZSE9RCYmai5yZWFkeVN0YXRlPT1cImNvbXBsZXRlXCIpfHwodHlwZW9mIGoucmVhZHlTdGF0ZT09RCYmKGouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdfHxqLmJvZHkpKSl7ZigpfWlmKCFKKXtpZih0eXBlb2Ygai5hZGRFdmVudExpc3RlbmVyIT1EKXtqLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZixmYWxzZSl9aWYoTS5pZSYmTS53aW4pe2ouYXR0YWNoRXZlbnQoeCxmdW5jdGlvbigpe2lmKGoucmVhZHlTdGF0ZT09XCJjb21wbGV0ZVwiKXtqLmRldGFjaEV2ZW50KHgsYXJndW1lbnRzLmNhbGxlZSk7ZigpfX0pO2lmKE89PXRvcCl7KGZ1bmN0aW9uKCl7aWYoSil7cmV0dXJufXRyeXtqLmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbChcImxlZnRcIil9Y2F0Y2goWCl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfX1pZihNLndrKXsoZnVuY3Rpb24oKXtpZihKKXtyZXR1cm59aWYoIS9sb2FkZWR8Y29tcGxldGUvLnRlc3Qoai5yZWFkeVN0YXRlKSl7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDApO3JldHVybn1mKCl9KSgpfXMoZil9fSgpO2Z1bmN0aW9uIGYoKXtpZihKKXtyZXR1cm59dHJ5e3ZhciBaPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKEMoXCJzcGFuXCIpKTtaLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWil9Y2F0Y2goYWEpe3JldHVybn1KPXRydWU7dmFyIFg9VS5sZW5ndGg7Zm9yKHZhciBZPTA7WTxYO1krKyl7VVtZXSgpfX1mdW5jdGlvbiBLKFgpe2lmKEope1goKX1lbHNle1VbVS5sZW5ndGhdPVh9fWZ1bmN0aW9uIHMoWSl7aWYodHlwZW9mIE8uYWRkRXZlbnRMaXN0ZW5lciE9RCl7Ty5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIGouYWRkRXZlbnRMaXN0ZW5lciE9RCl7ai5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLFksZmFsc2UpfWVsc2V7aWYodHlwZW9mIE8uYXR0YWNoRXZlbnQhPUQpe2koTyxcIm9ubG9hZFwiLFkpfWVsc2V7aWYodHlwZW9mIE8ub25sb2FkPT1cImZ1bmN0aW9uXCIpe3ZhciBYPU8ub25sb2FkO08ub25sb2FkPWZ1bmN0aW9uKCl7WCgpO1koKX19ZWxzZXtPLm9ubG9hZD1ZfX19fX1mdW5jdGlvbiBoKCl7aWYoVCl7VigpfWVsc2V7SCgpfX1mdW5jdGlvbiBWKCl7dmFyIFg9ai5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07dmFyIGFhPUMocik7YWEuc2V0QXR0cmlidXRlKFwidHlwZVwiLHEpO3ZhciBaPVguYXBwZW5kQ2hpbGQoYWEpO2lmKFope3ZhciBZPTA7KGZ1bmN0aW9uKCl7aWYodHlwZW9mIFouR2V0VmFyaWFibGUhPUQpe3ZhciBhYj1aLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWIpe2FiPWFiLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7TS5wdj1bcGFyc2VJbnQoYWJbMF0sMTApLHBhcnNlSW50KGFiWzFdLDEwKSxwYXJzZUludChhYlsyXSwxMCldfX1lbHNle2lmKFk8MTApe1krKztzZXRUaW1lb3V0KGFyZ3VtZW50cy5jYWxsZWUsMTApO3JldHVybn19WC5yZW1vdmVDaGlsZChhYSk7Wj1udWxsO0goKX0pKCl9ZWxzZXtIKCl9fWZ1bmN0aW9uIEgoKXt2YXIgYWc9by5sZW5ndGg7aWYoYWc+MCl7Zm9yKHZhciBhZj0wO2FmPGFnO2FmKyspe3ZhciBZPW9bYWZdLmlkO3ZhciBhYj1vW2FmXS5jYWxsYmFja0ZuO3ZhciBhYT17c3VjY2VzczpmYWxzZSxpZDpZfTtpZihNLnB2WzBdPjApe3ZhciBhZT1jKFkpO2lmKGFlKXtpZihGKG9bYWZdLnN3ZlZlcnNpb24pJiYhKE0ud2smJk0ud2s8MzEyKSl7dyhZLHRydWUpO2lmKGFiKXthYS5zdWNjZXNzPXRydWU7YWEucmVmPXooWSk7YWIoYWEpfX1lbHNle2lmKG9bYWZdLmV4cHJlc3NJbnN0YWxsJiZBKCkpe3ZhciBhaT17fTthaS5kYXRhPW9bYWZdLmV4cHJlc3NJbnN0YWxsO2FpLndpZHRoPWFlLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpfHxcIjBcIjthaS5oZWlnaHQ9YWUuZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpfHxcIjBcIjtpZihhZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSl7YWkuc3R5bGVjbGFzcz1hZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKX1pZihhZS5nZXRBdHRyaWJ1dGUoXCJhbGlnblwiKSl7YWkuYWxpZ249YWUuZ2V0QXR0cmlidXRlKFwiYWxpZ25cIil9dmFyIGFoPXt9O3ZhciBYPWFlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGFyYW1cIik7dmFyIGFjPVgubGVuZ3RoO2Zvcih2YXIgYWQ9MDthZDxhYzthZCsrKXtpZihYW2FkXS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLnRvTG93ZXJDYXNlKCkhPVwibW92aWVcIil7YWhbWFthZF0uZ2V0QXR0cmlidXRlKFwibmFtZVwiKV09WFthZF0uZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9fVAoYWksYWgsWSxhYil9ZWxzZXtwKGFlKTtpZihhYil7YWIoYWEpfX19fX1lbHNle3coWSx0cnVlKTtpZihhYil7dmFyIFo9eihZKTtpZihaJiZ0eXBlb2YgWi5TZXRWYXJpYWJsZSE9RCl7YWEuc3VjY2Vzcz10cnVlO2FhLnJlZj1afWFiKGFhKX19fX19ZnVuY3Rpb24geihhYSl7dmFyIFg9bnVsbDt2YXIgWT1jKGFhKTtpZihZJiZZLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtpZih0eXBlb2YgWS5TZXRWYXJpYWJsZSE9RCl7WD1ZfWVsc2V7dmFyIFo9WS5nZXRFbGVtZW50c0J5VGFnTmFtZShyKVswXTtpZihaKXtYPVp9fX1yZXR1cm4gWH1mdW5jdGlvbiBBKCl7cmV0dXJuICFhJiZGKFwiNi4wLjY1XCIpJiYoTS53aW58fE0ubWFjKSYmIShNLndrJiZNLndrPDMxMil9ZnVuY3Rpb24gUChhYSxhYixYLFope2E9dHJ1ZTtFPVp8fG51bGw7Qj17c3VjY2VzczpmYWxzZSxpZDpYfTt2YXIgYWU9YyhYKTtpZihhZSl7aWYoYWUubm9kZU5hbWU9PVwiT0JKRUNUXCIpe2w9ZyhhZSk7UT1udWxsfWVsc2V7bD1hZTtRPVh9YWEuaWQ9UjtpZih0eXBlb2YgYWEud2lkdGg9PUR8fCghLyUkLy50ZXN0KGFhLndpZHRoKSYmcGFyc2VJbnQoYWEud2lkdGgsMTApPDMxMCkpe2FhLndpZHRoPVwiMzEwXCJ9aWYodHlwZW9mIGFhLmhlaWdodD09RHx8KCEvJSQvLnRlc3QoYWEuaGVpZ2h0KSYmcGFyc2VJbnQoYWEuaGVpZ2h0LDEwKTwxMzcpKXthYS5oZWlnaHQ9XCIxMzdcIn1qLnRpdGxlPWoudGl0bGUuc2xpY2UoMCw0NykrXCIgLSBGbGFzaCBQbGF5ZXIgSW5zdGFsbGF0aW9uXCI7dmFyIGFkPU0uaWUmJk0ud2luPyhbJ0FjdGl2ZSddLmNvbmNhdCgnJykuam9pbignWCcpKTpcIlBsdWdJblwiLGFjPVwiTU1yZWRpcmVjdFVSTD1cIitPLmxvY2F0aW9uLnRvU3RyaW5nKCkucmVwbGFjZSgvJi9nLFwiJTI2XCIpK1wiJk1NcGxheWVyVHlwZT1cIithZCtcIiZNTWRvY3RpdGxlPVwiK2oudGl0bGU7aWYodHlwZW9mIGFiLmZsYXNodmFycyE9RCl7YWIuZmxhc2h2YXJzKz1cIiZcIithY31lbHNle2FiLmZsYXNodmFycz1hY31pZihNLmllJiZNLndpbiYmYWUucmVhZHlTdGF0ZSE9NCl7dmFyIFk9QyhcImRpdlwiKTtYKz1cIlNXRk9iamVjdE5ld1wiO1kuc2V0QXR0cmlidXRlKFwiaWRcIixYKTthZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShZLGFlKTthZS5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKGFlLnJlYWR5U3RhdGU9PTQpe2FlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWUpfWVsc2V7c2V0VGltZW91dChhcmd1bWVudHMuY2FsbGVlLDEwKX19KSgpfXUoYWEsYWIsWCl9fWZ1bmN0aW9uIHAoWSl7aWYoTS5pZSYmTS53aW4mJlkucmVhZHlTdGF0ZSE9NCl7dmFyIFg9QyhcImRpdlwiKTtZLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFgsWSk7WC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChnKFkpLFgpO1kuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjsoZnVuY3Rpb24oKXtpZihZLnJlYWR5U3RhdGU9PTQpe1kucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChZKX1lbHNle3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCl9fSkoKX1lbHNle1kucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZyhZKSxZKX19ZnVuY3Rpb24gZyhhYil7dmFyIGFhPUMoXCJkaXZcIik7aWYoTS53aW4mJk0uaWUpe2FhLmlubmVySFRNTD1hYi5pbm5lckhUTUx9ZWxzZXt2YXIgWT1hYi5nZXRFbGVtZW50c0J5VGFnTmFtZShyKVswXTtpZihZKXt2YXIgYWQ9WS5jaGlsZE5vZGVzO2lmKGFkKXt2YXIgWD1hZC5sZW5ndGg7Zm9yKHZhciBaPTA7WjxYO1orKyl7aWYoIShhZFtaXS5ub2RlVHlwZT09MSYmYWRbWl0ubm9kZU5hbWU9PVwiUEFSQU1cIikmJiEoYWRbWl0ubm9kZVR5cGU9PTgpKXthYS5hcHBlbmRDaGlsZChhZFtaXS5jbG9uZU5vZGUodHJ1ZSkpfX19fX1yZXR1cm4gYWF9ZnVuY3Rpb24gdShhaSxhZyxZKXt2YXIgWCxhYT1jKFkpO2lmKE0ud2smJk0ud2s8MzEyKXtyZXR1cm4gWH1pZihhYSl7aWYodHlwZW9mIGFpLmlkPT1EKXthaS5pZD1ZfWlmKE0uaWUmJk0ud2luKXt2YXIgYWg9XCJcIjtmb3IodmFyIGFlIGluIGFpKXtpZihhaVthZV0hPU9iamVjdC5wcm90b3R5cGVbYWVdKXtpZihhZS50b0xvd2VyQ2FzZSgpPT1cImRhdGFcIil7YWcubW92aWU9YWlbYWVdfWVsc2V7aWYoYWUudG9Mb3dlckNhc2UoKT09XCJzdHlsZWNsYXNzXCIpe2FoKz0nIGNsYXNzPVwiJythaVthZV0rJ1wiJ31lbHNle2lmKGFlLnRvTG93ZXJDYXNlKCkhPVwiY2xhc3NpZFwiKXthaCs9XCIgXCIrYWUrJz1cIicrYWlbYWVdKydcIid9fX19fXZhciBhZj1cIlwiO2Zvcih2YXIgYWQgaW4gYWcpe2lmKGFnW2FkXSE9T2JqZWN0LnByb3RvdHlwZVthZF0pe2FmKz0nPHBhcmFtIG5hbWU9XCInK2FkKydcIiB2YWx1ZT1cIicrYWdbYWRdKydcIiAvPid9fWFhLm91dGVySFRNTD0nPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCInK2FoK1wiPlwiK2FmK1wiPC9vYmplY3Q+XCI7TltOLmxlbmd0aF09YWkuaWQ7WD1jKGFpLmlkKX1lbHNle3ZhciBaPUMocik7Wi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIscSk7Zm9yKHZhciBhYyBpbiBhaSl7aWYoYWlbYWNdIT1PYmplY3QucHJvdG90eXBlW2FjXSl7aWYoYWMudG9Mb3dlckNhc2UoKT09XCJzdHlsZWNsYXNzXCIpe1ouc2V0QXR0cmlidXRlKFwiY2xhc3NcIixhaVthY10pfWVsc2V7aWYoYWMudG9Mb3dlckNhc2UoKSE9XCJjbGFzc2lkXCIpe1ouc2V0QXR0cmlidXRlKGFjLGFpW2FjXSl9fX19Zm9yKHZhciBhYiBpbiBhZyl7aWYoYWdbYWJdIT1PYmplY3QucHJvdG90eXBlW2FiXSYmYWIudG9Mb3dlckNhc2UoKSE9XCJtb3ZpZVwiKXtlKFosYWIsYWdbYWJdKX19YWEucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoWixhYSk7WD1afX1yZXR1cm4gWH1mdW5jdGlvbiBlKFosWCxZKXt2YXIgYWE9QyhcInBhcmFtXCIpO2FhLnNldEF0dHJpYnV0ZShcIm5hbWVcIixYKTthYS5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLFkpO1ouYXBwZW5kQ2hpbGQoYWEpfWZ1bmN0aW9uIHkoWSl7dmFyIFg9YyhZKTtpZihYJiZYLm5vZGVOYW1lPT1cIk9CSkVDVFwiKXtpZihNLmllJiZNLndpbil7WC5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbigpe2lmKFgucmVhZHlTdGF0ZT09NCl7YihZKX1lbHNle3NldFRpbWVvdXQoYXJndW1lbnRzLmNhbGxlZSwxMCl9fSkoKX1lbHNle1gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChYKX19fWZ1bmN0aW9uIGIoWil7dmFyIFk9YyhaKTtpZihZKXtmb3IodmFyIFggaW4gWSl7aWYodHlwZW9mIFlbWF09PVwiZnVuY3Rpb25cIil7WVtYXT1udWxsfX1ZLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoWSl9fWZ1bmN0aW9uIGMoWil7dmFyIFg9bnVsbDt0cnl7WD1qLmdldEVsZW1lbnRCeUlkKFopfWNhdGNoKFkpe31yZXR1cm4gWH1mdW5jdGlvbiBDKFgpe3JldHVybiBqLmNyZWF0ZUVsZW1lbnQoWCl9ZnVuY3Rpb24gaShaLFgsWSl7Wi5hdHRhY2hFdmVudChYLFkpO0lbSS5sZW5ndGhdPVtaLFgsWV19ZnVuY3Rpb24gRihaKXt2YXIgWT1NLnB2LFg9Wi5zcGxpdChcIi5cIik7WFswXT1wYXJzZUludChYWzBdLDEwKTtYWzFdPXBhcnNlSW50KFhbMV0sMTApfHwwO1hbMl09cGFyc2VJbnQoWFsyXSwxMCl8fDA7cmV0dXJuKFlbMF0+WFswXXx8KFlbMF09PVhbMF0mJllbMV0+WFsxXSl8fChZWzBdPT1YWzBdJiZZWzFdPT1YWzFdJiZZWzJdPj1YWzJdKSk/dHJ1ZTpmYWxzZX1mdW5jdGlvbiB2KGFjLFksYWQsYWIpe2lmKE0uaWUmJk0ubWFjKXtyZXR1cm59dmFyIGFhPWouZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO2lmKCFhYSl7cmV0dXJufXZhciBYPShhZCYmdHlwZW9mIGFkPT1cInN0cmluZ1wiKT9hZDpcInNjcmVlblwiO2lmKGFiKXtuPW51bGw7Rz1udWxsfWlmKCFufHxHIT1YKXt2YXIgWj1DKFwic3R5bGVcIik7Wi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJ0ZXh0L2Nzc1wiKTtaLnNldEF0dHJpYnV0ZShcIm1lZGlhXCIsWCk7bj1hYS5hcHBlbmRDaGlsZChaKTtpZihNLmllJiZNLndpbiYmdHlwZW9mIGouc3R5bGVTaGVldHMhPUQmJmouc3R5bGVTaGVldHMubGVuZ3RoPjApe249ai5zdHlsZVNoZWV0c1tqLnN0eWxlU2hlZXRzLmxlbmd0aC0xXX1HPVh9aWYoTS5pZSYmTS53aW4pe2lmKG4mJnR5cGVvZiBuLmFkZFJ1bGU9PXIpe24uYWRkUnVsZShhYyxZKX19ZWxzZXtpZihuJiZ0eXBlb2Ygai5jcmVhdGVUZXh0Tm9kZSE9RCl7bi5hcHBlbmRDaGlsZChqLmNyZWF0ZVRleHROb2RlKGFjK1wiIHtcIitZK1wifVwiKSl9fX1mdW5jdGlvbiB3KFosWCl7aWYoIW0pe3JldHVybn12YXIgWT1YP1widmlzaWJsZVwiOlwiaGlkZGVuXCI7aWYoSiYmYyhaKSl7YyhaKS5zdHlsZS52aXNpYmlsaXR5PVl9ZWxzZXt2KFwiI1wiK1osXCJ2aXNpYmlsaXR5OlwiK1kpfX1mdW5jdGlvbiBMKFkpe3ZhciBaPS9bXFxcXFxcXCI8PlxcLjtdLzt2YXIgWD1aLmV4ZWMoWSkhPW51bGw7cmV0dXJuIFgmJnR5cGVvZiBlbmNvZGVVUklDb21wb25lbnQhPUQ/ZW5jb2RlVVJJQ29tcG9uZW50KFkpOll9dmFyIGQ9ZnVuY3Rpb24oKXtpZihNLmllJiZNLndpbil7d2luZG93LmF0dGFjaEV2ZW50KFwib251bmxvYWRcIixmdW5jdGlvbigpe3ZhciBhYz1JLmxlbmd0aDtmb3IodmFyIGFiPTA7YWI8YWM7YWIrKyl7SVthYl1bMF0uZGV0YWNoRXZlbnQoSVthYl1bMV0sSVthYl1bMl0pfXZhciBaPU4ubGVuZ3RoO2Zvcih2YXIgYWE9MDthYTxaO2FhKyspe3koTlthYV0pfWZvcih2YXIgWSBpbiBNKXtNW1ldPW51bGx9TT1udWxsO2Zvcih2YXIgWCBpbiBzd2ZvYmplY3Qpe3N3Zm9iamVjdFtYXT1udWxsfXN3Zm9iamVjdD1udWxsfSl9fSgpO3JldHVybntyZWdpc3Rlck9iamVjdDpmdW5jdGlvbihhYixYLGFhLFope2lmKE0udzMmJmFiJiZYKXt2YXIgWT17fTtZLmlkPWFiO1kuc3dmVmVyc2lvbj1YO1kuZXhwcmVzc0luc3RhbGw9YWE7WS5jYWxsYmFja0ZuPVo7b1tvLmxlbmd0aF09WTt3KGFiLGZhbHNlKX1lbHNle2lmKFope1ooe3N1Y2Nlc3M6ZmFsc2UsaWQ6YWJ9KX19fSxnZXRPYmplY3RCeUlkOmZ1bmN0aW9uKFgpe2lmKE0udzMpe3JldHVybiB6KFgpfX0sZW1iZWRTV0Y6ZnVuY3Rpb24oYWIsYWgsYWUsYWcsWSxhYSxaLGFkLGFmLGFjKXt2YXIgWD17c3VjY2VzczpmYWxzZSxpZDphaH07aWYoTS53MyYmIShNLndrJiZNLndrPDMxMikmJmFiJiZhaCYmYWUmJmFnJiZZKXt3KGFoLGZhbHNlKTtLKGZ1bmN0aW9uKCl7YWUrPVwiXCI7YWcrPVwiXCI7dmFyIGFqPXt9O2lmKGFmJiZ0eXBlb2YgYWY9PT1yKXtmb3IodmFyIGFsIGluIGFmKXthalthbF09YWZbYWxdfX1hai5kYXRhPWFiO2FqLndpZHRoPWFlO2FqLmhlaWdodD1hZzt2YXIgYW09e307aWYoYWQmJnR5cGVvZiBhZD09PXIpe2Zvcih2YXIgYWsgaW4gYWQpe2FtW2FrXT1hZFtha119fWlmKFomJnR5cGVvZiBaPT09cil7Zm9yKHZhciBhaSBpbiBaKXtpZih0eXBlb2YgYW0uZmxhc2h2YXJzIT1EKXthbS5mbGFzaHZhcnMrPVwiJlwiK2FpK1wiPVwiK1pbYWldfWVsc2V7YW0uZmxhc2h2YXJzPWFpK1wiPVwiK1pbYWldfX19aWYoRihZKSl7dmFyIGFuPXUoYWosYW0sYWgpO2lmKGFqLmlkPT1haCl7dyhhaCx0cnVlKX1YLnN1Y2Nlc3M9dHJ1ZTtYLnJlZj1hbn1lbHNle2lmKGFhJiZBKCkpe2FqLmRhdGE9YWE7UChhaixhbSxhaCxhYyk7cmV0dXJufWVsc2V7dyhhaCx0cnVlKX19aWYoYWMpe2FjKFgpfX0pfWVsc2V7aWYoYWMpe2FjKFgpfX19LHN3aXRjaE9mZkF1dG9IaWRlU2hvdzpmdW5jdGlvbigpe209ZmFsc2V9LHVhOk0sZ2V0Rmxhc2hQbGF5ZXJWZXJzaW9uOmZ1bmN0aW9uKCl7cmV0dXJue21ham9yOk0ucHZbMF0sbWlub3I6TS5wdlsxXSxyZWxlYXNlOk0ucHZbMl19fSxoYXNGbGFzaFBsYXllclZlcnNpb246RixjcmVhdGVTV0Y6ZnVuY3Rpb24oWixZLFgpe2lmKE0udzMpe3JldHVybiB1KFosWSxYKX1lbHNle3JldHVybiB1bmRlZmluZWR9fSxzaG93RXhwcmVzc0luc3RhbGw6ZnVuY3Rpb24oWixhYSxYLFkpe2lmKE0udzMmJkEoKSl7UChaLGFhLFgsWSl9fSxyZW1vdmVTV0Y6ZnVuY3Rpb24oWCl7aWYoTS53Myl7eShYKX19LGNyZWF0ZUNTUzpmdW5jdGlvbihhYSxaLFksWCl7aWYoTS53Myl7dihhYSxaLFksWCl9fSxhZGREb21Mb2FkRXZlbnQ6SyxhZGRMb2FkRXZlbnQ6cyxnZXRRdWVyeVBhcmFtVmFsdWU6ZnVuY3Rpb24oYWEpe3ZhciBaPWoubG9jYXRpb24uc2VhcmNofHxqLmxvY2F0aW9uLmhhc2g7aWYoWil7aWYoL1xcPy8udGVzdChaKSl7Wj1aLnNwbGl0KFwiP1wiKVsxXX1pZihhYT09bnVsbCl7cmV0dXJuIEwoWil9dmFyIFk9Wi5zcGxpdChcIiZcIik7Zm9yKHZhciBYPTA7WDxZLmxlbmd0aDtYKyspe2lmKFlbWF0uc3Vic3RyaW5nKDAsWVtYXS5pbmRleE9mKFwiPVwiKSk9PWFhKXtyZXR1cm4gTChZW1hdLnN1YnN0cmluZygoWVtYXS5pbmRleE9mKFwiPVwiKSsxKSkpfX19cmV0dXJuXCJcIn0sZXhwcmVzc0luc3RhbGxDYWxsYmFjazpmdW5jdGlvbigpe2lmKGEpe3ZhciBYPWMoUik7aWYoWCYmbCl7WC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChsLFgpO2lmKFEpe3coUSx0cnVlKTtpZihNLmllJiZNLndpbil7bC5zdHlsZS5kaXNwbGF5PVwiYmxvY2tcIn19aWYoRSl7RShCKX19YT1mYWxzZX19fX0oKTtcbn1cbi8vIENvcHlyaWdodDogSGlyb3NoaSBJY2hpa2F3YSA8aHR0cDovL2dpbWl0ZS5uZXQvZW4vPlxuLy8gTGljZW5zZTogTmV3IEJTRCBMaWNlbnNlXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3dlYnNvY2tldHMvXG4vLyBSZWZlcmVuY2U6IGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2RyYWZ0LWhpeGllLXRoZXdlYnNvY2tldHByb3RvY29sXG5cbihmdW5jdGlvbigpIHtcbiAgXG4gIGlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93IHx8IHdpbmRvdy5XZWJTb2NrZXQpIHJldHVybjtcblxuICB2YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuICBpZiAoIWNvbnNvbGUgfHwgIWNvbnNvbGUubG9nIHx8ICFjb25zb2xlLmVycm9yKSB7XG4gICAgY29uc29sZSA9IHtsb2c6IGZ1bmN0aW9uKCl7IH0sIGVycm9yOiBmdW5jdGlvbigpeyB9fTtcbiAgfVxuICBcbiAgaWYgKCFzd2ZvYmplY3QuaGFzRmxhc2hQbGF5ZXJWZXJzaW9uKFwiMTAuMC4wXCIpKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkZsYXNoIFBsYXllciA+PSAxMC4wLjAgaXMgcmVxdWlyZWQuXCIpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobG9jYXRpb24ucHJvdG9jb2wgPT0gXCJmaWxlOlwiKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgIFwiV0FSTklORzogd2ViLXNvY2tldC1qcyBkb2Vzbid0IHdvcmsgaW4gZmlsZTovLy8uLi4gVVJMIFwiICtcbiAgICAgIFwidW5sZXNzIHlvdSBzZXQgRmxhc2ggU2VjdXJpdHkgU2V0dGluZ3MgcHJvcGVybHkuIFwiICtcbiAgICAgIFwiT3BlbiB0aGUgcGFnZSB2aWEgV2ViIHNlcnZlciBpLmUuIGh0dHA6Ly8uLi5cIik7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgZmF1eCB3ZWIgc29ja2V0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEBwYXJhbSB7YXJyYXkgb3Igc3RyaW5nfSBwcm90b2NvbHNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3h5SG9zdFxuICAgKiBAcGFyYW0ge2ludH0gcHJveHlQb3J0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJzXG4gICAqL1xuICBXZWJTb2NrZXQgPSBmdW5jdGlvbih1cmwsIHByb3RvY29scywgcHJveHlIb3N0LCBwcm94eVBvcnQsIGhlYWRlcnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fX2lkID0gV2ViU29ja2V0Ll9fbmV4dElkKys7XG4gICAgV2ViU29ja2V0Ll9faW5zdGFuY2VzW3NlbGYuX19pZF0gPSBzZWxmO1xuICAgIHNlbGYucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DT05ORUNUSU5HO1xuICAgIHNlbGYuYnVmZmVyZWRBbW91bnQgPSAwO1xuICAgIHNlbGYuX19ldmVudHMgPSB7fTtcbiAgICBpZiAoIXByb3RvY29scykge1xuICAgICAgcHJvdG9jb2xzID0gW107XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvdG9jb2xzID09IFwic3RyaW5nXCIpIHtcbiAgICAgIHByb3RvY29scyA9IFtwcm90b2NvbHNdO1xuICAgIH1cbiAgICAvLyBVc2VzIHNldFRpbWVvdXQoKSB0byBtYWtlIHN1cmUgX19jcmVhdGVGbGFzaCgpIHJ1bnMgYWZ0ZXIgdGhlIGNhbGxlciBzZXRzIHdzLm9ub3BlbiBldGMuXG4gICAgLy8gT3RoZXJ3aXNlLCB3aGVuIG9ub3BlbiBmaXJlcyBpbW1lZGlhdGVseSwgb25vcGVuIGlzIGNhbGxlZCBiZWZvcmUgaXQgaXMgc2V0LlxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBXZWJTb2NrZXQuX19mbGFzaC5jcmVhdGUoXG4gICAgICAgICAgICBzZWxmLl9faWQsIHVybCwgcHJvdG9jb2xzLCBwcm94eUhvc3QgfHwgbnVsbCwgcHJveHlQb3J0IHx8IDAsIGhlYWRlcnMgfHwgbnVsbCk7XG4gICAgICB9KTtcbiAgICB9LCAwKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSB3ZWIgc29ja2V0LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAgVGhlIGRhdGEgdG8gc2VuZCB0byB0aGUgc29ja2V0LlxuICAgKiBAcmV0dXJuIHtib29sZWFufSAgVHJ1ZSBmb3Igc3VjY2VzcywgZmFsc2UgZm9yIGZhaWx1cmUuXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgdGhyb3cgXCJJTlZBTElEX1NUQVRFX0VSUjogV2ViIFNvY2tldCBjb25uZWN0aW9uIGhhcyBub3QgYmVlbiBlc3RhYmxpc2hlZFwiO1xuICAgIH1cbiAgICAvLyBXZSB1c2UgZW5jb2RlVVJJQ29tcG9uZW50KCkgaGVyZSwgYmVjYXVzZSBGQUJyaWRnZSBkb2Vzbid0IHdvcmsgaWZcbiAgICAvLyB0aGUgYXJndW1lbnQgaW5jbHVkZXMgc29tZSBjaGFyYWN0ZXJzLiBXZSBkb24ndCB1c2UgZXNjYXBlKCkgaGVyZVxuICAgIC8vIGJlY2F1c2Ugb2YgdGhpczpcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9Db3JlX0phdmFTY3JpcHRfMS41X0d1aWRlL0Z1bmN0aW9ucyNlc2NhcGVfYW5kX3VuZXNjYXBlX0Z1bmN0aW9uc1xuICAgIC8vIEJ1dCBpdCBsb29rcyBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlVVJJQ29tcG9uZW50KHMpKSBkb2Vzbid0XG4gICAgLy8gcHJlc2VydmUgYWxsIFVuaWNvZGUgY2hhcmFjdGVycyBlaXRoZXIgZS5nLiBcIlxcdWZmZmZcIiBpbiBGaXJlZm94LlxuICAgIC8vIE5vdGUgYnkgd3RyaXRjaDogSG9wZWZ1bGx5IHRoaXMgd2lsbCBub3QgYmUgbmVjZXNzYXJ5IHVzaW5nIEV4dGVybmFsSW50ZXJmYWNlLiAgV2lsbCByZXF1aXJlXG4gICAgLy8gYWRkaXRpb25hbCB0ZXN0aW5nLlxuICAgIHZhciByZXN1bHQgPSBXZWJTb2NrZXQuX19mbGFzaC5zZW5kKHRoaXMuX19pZCwgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpKTtcbiAgICBpZiAocmVzdWx0IDwgMCkgeyAvLyBzdWNjZXNzXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXJlZEFtb3VudCArPSByZXN1bHQ7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGlzIHdlYiBzb2NrZXQgZ3JhY2VmdWxseS5cbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DTE9TRUQgfHwgdGhpcy5yZWFkeVN0YXRlID09IFdlYlNvY2tldC5DTE9TSU5HKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TSU5HO1xuICAgIFdlYlNvY2tldC5fX2ZsYXNoLmNsb3NlKHRoaXMuX19pZCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHtAbGluayA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTItRXZlbnRzL2V2ZW50cy5odG1sI0V2ZW50cy1yZWdpc3RyYXRpb25cIj5ET00gMiBFdmVudFRhcmdldCBJbnRlcmZhY2U8L2E+fVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVzZUNhcHR1cmVcbiAgICogQHJldHVybiB2b2lkXG4gICAqL1xuICBXZWJTb2NrZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgIGlmICghKHR5cGUgaW4gdGhpcy5fX2V2ZW50cykpIHtcbiAgICAgIHRoaXMuX19ldmVudHNbdHlwZV0gPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZVxuICAgKiBAcmV0dXJuIHZvaWRcbiAgICovXG4gIFdlYlNvY2tldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgaWYgKCEodHlwZSBpbiB0aGlzLl9fZXZlbnRzKSkgcmV0dXJuO1xuICAgIHZhciBldmVudHMgPSB0aGlzLl9fZXZlbnRzW3R5cGVdO1xuICAgIGZvciAodmFyIGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIGlmIChldmVudHNbaV0gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGV2ZW50cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2Yge0BsaW5rIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMi1FdmVudHMvZXZlbnRzLmh0bWwjRXZlbnRzLXJlZ2lzdHJhdGlvblwiPkRPTSAyIEV2ZW50VGFyZ2V0IEludGVyZmFjZTwvYT59XG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gICAqIEByZXR1cm4gdm9pZFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fX2V2ZW50c1tldmVudC50eXBlXSB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgZXZlbnRzW2ldKGV2ZW50KTtcbiAgICB9XG4gICAgdmFyIGhhbmRsZXIgPSB0aGlzW1wib25cIiArIGV2ZW50LnR5cGVdO1xuICAgIGlmIChoYW5kbGVyKSBoYW5kbGVyKGV2ZW50KTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlcyBhbiBldmVudCBmcm9tIEZsYXNoLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZmxhc2hFdmVudFxuICAgKi9cbiAgV2ViU29ja2V0LnByb3RvdHlwZS5fX2hhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZmxhc2hFdmVudCkge1xuICAgIGlmIChcInJlYWR5U3RhdGVcIiBpbiBmbGFzaEV2ZW50KSB7XG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBmbGFzaEV2ZW50LnJlYWR5U3RhdGU7XG4gICAgfVxuICAgIGlmIChcInByb3RvY29sXCIgaW4gZmxhc2hFdmVudCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IGZsYXNoRXZlbnQucHJvdG9jb2w7XG4gICAgfVxuICAgIFxuICAgIHZhciBqc0V2ZW50O1xuICAgIGlmIChmbGFzaEV2ZW50LnR5cGUgPT0gXCJvcGVuXCIgfHwgZmxhc2hFdmVudC50eXBlID09IFwiZXJyb3JcIikge1xuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVTaW1wbGVFdmVudChmbGFzaEV2ZW50LnR5cGUpO1xuICAgIH0gZWxzZSBpZiAoZmxhc2hFdmVudC50eXBlID09IFwiY2xvc2VcIikge1xuICAgICAgLy8gVE9ETyBpbXBsZW1lbnQganNFdmVudC53YXNDbGVhblxuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVTaW1wbGVFdmVudChcImNsb3NlXCIpO1xuICAgIH0gZWxzZSBpZiAoZmxhc2hFdmVudC50eXBlID09IFwibWVzc2FnZVwiKSB7XG4gICAgICB2YXIgZGF0YSA9IGRlY29kZVVSSUNvbXBvbmVudChmbGFzaEV2ZW50Lm1lc3NhZ2UpO1xuICAgICAganNFdmVudCA9IHRoaXMuX19jcmVhdGVNZXNzYWdlRXZlbnQoXCJtZXNzYWdlXCIsIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBcInVua25vd24gZXZlbnQgdHlwZTogXCIgKyBmbGFzaEV2ZW50LnR5cGU7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChqc0V2ZW50KTtcbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5wcm90b3R5cGUuX19jcmVhdGVTaW1wbGVFdmVudCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQgJiYgd2luZG93LkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO1xuICAgICAgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7dHlwZTogdHlwZSwgYnViYmxlczogZmFsc2UsIGNhbmNlbGFibGU6IGZhbHNlfTtcbiAgICB9XG4gIH07XG4gIFxuICBXZWJTb2NrZXQucHJvdG90eXBlLl9fY3JlYXRlTWVzc2FnZUV2ZW50ID0gZnVuY3Rpb24odHlwZSwgZGF0YSkge1xuICAgIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCAmJiB3aW5kb3cuTWVzc2FnZUV2ZW50ICYmICF3aW5kb3cub3BlcmEpIHtcbiAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTWVzc2FnZUV2ZW50XCIpO1xuICAgICAgZXZlbnQuaW5pdE1lc3NhZ2VFdmVudChcIm1lc3NhZ2VcIiwgZmFsc2UsIGZhbHNlLCBkYXRhLCBudWxsLCBudWxsLCB3aW5kb3csIG51bGwpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRSBhbmQgT3BlcmEsIHRoZSBsYXR0ZXIgb25lIHRydW5jYXRlcyB0aGUgZGF0YSBwYXJhbWV0ZXIgYWZ0ZXIgYW55IDB4MDAgYnl0ZXMuXG4gICAgICByZXR1cm4ge3R5cGU6IHR5cGUsIGRhdGE6IGRhdGEsIGJ1YmJsZXM6IGZhbHNlLCBjYW5jZWxhYmxlOiBmYWxzZX07XG4gICAgfVxuICB9O1xuICBcbiAgLyoqXG4gICAqIERlZmluZSB0aGUgV2ViU29ja2V0IHJlYWR5U3RhdGUgZW51bWVyYXRpb24uXG4gICAqL1xuICBXZWJTb2NrZXQuQ09OTkVDVElORyA9IDA7XG4gIFdlYlNvY2tldC5PUEVOID0gMTtcbiAgV2ViU29ja2V0LkNMT1NJTkcgPSAyO1xuICBXZWJTb2NrZXQuQ0xPU0VEID0gMztcblxuICBXZWJTb2NrZXQuX19mbGFzaCA9IG51bGw7XG4gIFdlYlNvY2tldC5fX2luc3RhbmNlcyA9IHt9O1xuICBXZWJTb2NrZXQuX190YXNrcyA9IFtdO1xuICBXZWJTb2NrZXQuX19uZXh0SWQgPSAwO1xuICBcbiAgLyoqXG4gICAqIExvYWQgYSBuZXcgZmxhc2ggc2VjdXJpdHkgcG9saWN5IGZpbGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICovXG4gIFdlYlNvY2tldC5sb2FkRmxhc2hQb2xpY3lGaWxlID0gZnVuY3Rpb24odXJsKXtcbiAgICBXZWJTb2NrZXQuX19hZGRUYXNrKGZ1bmN0aW9uKCkge1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2gubG9hZE1hbnVhbFBvbGljeUZpbGUodXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogTG9hZHMgV2ViU29ja2V0TWFpbi5zd2YgYW5kIGNyZWF0ZXMgV2ViU29ja2V0TWFpbiBvYmplY3QgaW4gRmxhc2guXG4gICAqL1xuICBXZWJTb2NrZXQuX19pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKFdlYlNvY2tldC5fX2ZsYXNoKSByZXR1cm47XG4gICAgXG4gICAgaWYgKFdlYlNvY2tldC5fX3N3ZkxvY2F0aW9uKSB7XG4gICAgICAvLyBGb3IgYmFja3dvcmQgY29tcGF0aWJpbGl0eS5cbiAgICAgIHdpbmRvdy5XRUJfU09DS0VUX1NXRl9MT0NBVElPTiA9IFdlYlNvY2tldC5fX3N3ZkxvY2F0aW9uO1xuICAgIH1cbiAgICBpZiAoIXdpbmRvdy5XRUJfU09DS0VUX1NXRl9MT0NBVElPTikge1xuICAgICAgY29uc29sZS5lcnJvcihcIltXZWJTb2NrZXRdIHNldCBXRUJfU09DS0VUX1NXRl9MT0NBVElPTiB0byBsb2NhdGlvbiBvZiBXZWJTb2NrZXRNYWluLnN3ZlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGFpbmVyLmlkID0gXCJ3ZWJTb2NrZXRDb250YWluZXJcIjtcbiAgICAvLyBIaWRlcyBGbGFzaCBib3guIFdlIGNhbm5vdCB1c2UgZGlzcGxheTogbm9uZSBvciB2aXNpYmlsaXR5OiBoaWRkZW4gYmVjYXVzZSBpdCBwcmV2ZW50c1xuICAgIC8vIEZsYXNoIGZyb20gbG9hZGluZyBhdCBsZWFzdCBpbiBJRS4gU28gd2UgbW92ZSBpdCBvdXQgb2YgdGhlIHNjcmVlbiBhdCAoLTEwMCwgLTEwMCkuXG4gICAgLy8gQnV0IHRoaXMgZXZlbiBkb2Vzbid0IHdvcmsgd2l0aCBGbGFzaCBMaXRlIChlLmcuIGluIERyb2lkIEluY3JlZGlibGUpLiBTbyB3aXRoIEZsYXNoXG4gICAgLy8gTGl0ZSwgd2UgcHV0IGl0IGF0ICgwLCAwKS4gVGhpcyBzaG93cyAxeDEgYm94IHZpc2libGUgYXQgbGVmdC10b3AgY29ybmVyIGJ1dCB0aGlzIGlzXG4gICAgLy8gdGhlIGJlc3Qgd2UgY2FuIGRvIGFzIGZhciBhcyB3ZSBrbm93IG5vdy5cbiAgICBjb250YWluZXIuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgaWYgKFdlYlNvY2tldC5fX2lzRmxhc2hMaXRlKCkpIHtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS5sZWZ0ID0gXCIwcHhcIjtcbiAgICAgIGNvbnRhaW5lci5zdHlsZS50b3AgPSBcIjBweFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuc3R5bGUubGVmdCA9IFwiLTEwMHB4XCI7XG4gICAgICBjb250YWluZXIuc3R5bGUudG9wID0gXCItMTAwcHhcIjtcbiAgICB9XG4gICAgdmFyIGhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaG9sZGVyLmlkID0gXCJ3ZWJTb2NrZXRGbGFzaFwiO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChob2xkZXIpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICAvLyBTZWUgdGhpcyBhcnRpY2xlIGZvciBoYXNQcmlvcml0eTpcbiAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvYXMzL21vYmlsZS9XUzRiZWJjZDY2YTc0Mjc1YzM2Y2ZiODEzNzEyNDMxOGVlYmM2LTdmZmQuaHRtbFxuICAgIHN3Zm9iamVjdC5lbWJlZFNXRihcbiAgICAgIFdFQl9TT0NLRVRfU1dGX0xPQ0FUSU9OLFxuICAgICAgXCJ3ZWJTb2NrZXRGbGFzaFwiLFxuICAgICAgXCIxXCIgLyogd2lkdGggKi8sXG4gICAgICBcIjFcIiAvKiBoZWlnaHQgKi8sXG4gICAgICBcIjEwLjAuMFwiIC8qIFNXRiB2ZXJzaW9uICovLFxuICAgICAgbnVsbCxcbiAgICAgIG51bGwsXG4gICAgICB7aGFzUHJpb3JpdHk6IHRydWUsIHN3bGl2ZWNvbm5lY3QgOiB0cnVlLCBhbGxvd1NjcmlwdEFjY2VzczogXCJhbHdheXNcIn0sXG4gICAgICBudWxsLFxuICAgICAgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWUuc3VjY2Vzcykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbV2ViU29ja2V0XSBzd2ZvYmplY3QuZW1iZWRTV0YgZmFpbGVkXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgRmxhc2ggdG8gbm90aWZ5IEpTIHRoYXQgaXQncyBmdWxseSBsb2FkZWQgYW5kIHJlYWR5XG4gICAqIGZvciBjb21tdW5pY2F0aW9uLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9fb25GbGFzaEluaXRpYWxpemVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gV2UgbmVlZCB0byBzZXQgYSB0aW1lb3V0IGhlcmUgdG8gYXZvaWQgcm91bmQtdHJpcCBjYWxsc1xuICAgIC8vIHRvIGZsYXNoIGR1cmluZyB0aGUgaW5pdGlhbGl6YXRpb24gcHJvY2Vzcy5cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIndlYlNvY2tldEZsYXNoXCIpO1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2guc2V0Q2FsbGVyVXJsKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgV2ViU29ja2V0Ll9fZmxhc2guc2V0RGVidWcoISF3aW5kb3cuV0VCX1NPQ0tFVF9ERUJVRyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IFdlYlNvY2tldC5fX3Rhc2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIFdlYlNvY2tldC5fX3Rhc2tzW2ldKCk7XG4gICAgICB9XG4gICAgICBXZWJTb2NrZXQuX190YXNrcyA9IFtdO1xuICAgIH0sIDApO1xuICB9O1xuICBcbiAgLyoqXG4gICAqIENhbGxlZCBieSBGbGFzaCB0byBub3RpZnkgV2ViU29ja2V0cyBldmVudHMgYXJlIGZpcmVkLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9fb25GbGFzaEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEdldHMgZXZlbnRzIHVzaW5nIHJlY2VpdmVFdmVudHMoKSBpbnN0ZWFkIG9mIGdldHRpbmcgaXQgZnJvbSBldmVudCBvYmplY3RcbiAgICAgICAgLy8gb2YgRmxhc2ggZXZlbnQuIFRoaXMgaXMgdG8gbWFrZSBzdXJlIHRvIGtlZXAgbWVzc2FnZSBvcmRlci5cbiAgICAgICAgLy8gSXQgc2VlbXMgc29tZXRpbWVzIEZsYXNoIGV2ZW50cyBkb24ndCBhcnJpdmUgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhleSBhcmUgc2VudC5cbiAgICAgICAgdmFyIGV2ZW50cyA9IFdlYlNvY2tldC5fX2ZsYXNoLnJlY2VpdmVFdmVudHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBXZWJTb2NrZXQuX19pbnN0YW5jZXNbZXZlbnRzW2ldLndlYlNvY2tldElkXS5fX2hhbmRsZUV2ZW50KGV2ZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICB9LCAwKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgXG4gIC8vIENhbGxlZCBieSBGbGFzaC5cbiAgV2ViU29ja2V0Ll9fbG9nID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKGRlY29kZVVSSUNvbXBvbmVudChtZXNzYWdlKSk7XG4gIH07XG4gIFxuICAvLyBDYWxsZWQgYnkgRmxhc2guXG4gIFdlYlNvY2tldC5fX2Vycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZGVjb2RlVVJJQ29tcG9uZW50KG1lc3NhZ2UpKTtcbiAgfTtcbiAgXG4gIFdlYlNvY2tldC5fX2FkZFRhc2sgPSBmdW5jdGlvbih0YXNrKSB7XG4gICAgaWYgKFdlYlNvY2tldC5fX2ZsYXNoKSB7XG4gICAgICB0YXNrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFdlYlNvY2tldC5fX3Rhc2tzLnB1c2godGFzayk7XG4gICAgfVxuICB9O1xuICBcbiAgLyoqXG4gICAqIFRlc3QgaWYgdGhlIGJyb3dzZXIgaXMgcnVubmluZyBmbGFzaCBsaXRlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGZsYXNoIGxpdGUgaXMgcnVubmluZywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgV2ViU29ja2V0Ll9faXNGbGFzaExpdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXdpbmRvdy5uYXZpZ2F0b3IgfHwgIXdpbmRvdy5uYXZpZ2F0b3IubWltZVR5cGVzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBtaW1lVHlwZSA9IHdpbmRvdy5uYXZpZ2F0b3IubWltZVR5cGVzW1wiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIl07XG4gICAgaWYgKCFtaW1lVHlwZSB8fCAhbWltZVR5cGUuZW5hYmxlZFBsdWdpbiB8fCAhbWltZVR5cGUuZW5hYmxlZFBsdWdpbi5maWxlbmFtZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbWltZVR5cGUuZW5hYmxlZFBsdWdpbi5maWxlbmFtZS5tYXRjaCgvZmxhc2hsaXRlL2kpID8gdHJ1ZSA6IGZhbHNlO1xuICB9O1xuICBcbiAgaWYgKCF3aW5kb3cuV0VCX1NPQ0tFVF9ESVNBQkxFX0FVVE9fSU5JVElBTElaQVRJT04pIHtcbiAgICBpZiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICBXZWJTb2NrZXQuX19pbml0aWFsaXplKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG59KSgpO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZXhwb3J0cy5YSFIgPSBYSFI7XG5cbiAgLyoqXG4gICAqIFhIUiBjb25zdHJ1Y3RvclxuICAgKlxuICAgKiBAY29zdHJ1Y3RvclxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBYSFIgKHNvY2tldCkge1xuICAgIGlmICghc29ja2V0KSByZXR1cm47XG5cbiAgICBpby5UcmFuc3BvcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNlbmRCdWZmZXIgPSBbXTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChYSFIsIGlvLlRyYW5zcG9ydCk7XG5cbiAgLyoqXG4gICAqIEVzdGFibGlzaCBhIGNvbm5lY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgdGhpcy5vbk9wZW4oKTtcbiAgICB0aGlzLmdldCgpO1xuXG4gICAgLy8gd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhlIHJlcXVlc3Qgc3VjY2VlZHMgc2luY2Ugd2UgaGF2ZSBubyBpbmRpY2F0aW9uXG4gICAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBvcGVuZWQgb3Igbm90IHVudGlsIGl0IHN1Y2NlZWRlZC5cbiAgICB0aGlzLnNldENsb3NlVGltZW91dCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHdlIG5lZWQgdG8gc2VuZCBkYXRhIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLCBpZiB3ZSBoYXZlIGRhdGEgaW4gb3VyXG4gICAqIGJ1ZmZlciB3ZSBlbmNvZGUgaXQgYW5kIGZvcndhcmQgaXQgdG8gdGhlIGBwb3N0YCBtZXRob2QuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnBheWxvYWQgPSBmdW5jdGlvbiAocGF5bG9hZCkge1xuICAgIHZhciBtc2dzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHBheWxvYWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBtc2dzLnB1c2goaW8ucGFyc2VyLmVuY29kZVBhY2tldChwYXlsb2FkW2ldKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZW5kKGlvLnBhcnNlci5lbmNvZGVQYXlsb2FkKG1zZ3MpKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBkYXRhIHRvIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHRoaXMucG9zdChkYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUG9zdHMgYSBlbmNvZGVkIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhIEEgZW5jb2RlZCBtZXNzYWdlLlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gZW1wdHkgKCkgeyB9O1xuXG4gIFhIUi5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuc29ja2V0LnNldEJ1ZmZlcih0cnVlKTtcblxuICAgIGZ1bmN0aW9uIHN0YXRlQ2hhbmdlICgpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICB0aGlzLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGVtcHR5O1xuICAgICAgICBzZWxmLnBvc3RpbmcgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKXtcbiAgICAgICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYub25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25sb2FkICgpIHtcbiAgICAgIHRoaXMub25sb2FkID0gZW1wdHk7XG4gICAgICBzZWxmLnNvY2tldC5zZXRCdWZmZXIoZmFsc2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnNlbmRYSFIgPSB0aGlzLnJlcXVlc3QoJ1BPU1QnKTtcblxuICAgIGlmIChnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgdGhpcy5zZW5kWEhSIGluc3RhbmNlb2YgWERvbWFpblJlcXVlc3QpIHtcbiAgICAgIHRoaXMuc2VuZFhIUi5vbmxvYWQgPSB0aGlzLnNlbmRYSFIub25lcnJvciA9IG9ubG9hZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kWEhSLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHN0YXRlQ2hhbmdlO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZFhIUi5zZW5kKGRhdGEpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgZXN0YWJsaXNoZWQgYFhIUmAgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9uQ2xvc2UoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgY29uZmlndXJlZCBYSFIgcmVxdWVzdFxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSB1cmwgdGhhdCBuZWVkcyB0byBiZSByZXF1ZXN0ZWQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2QgVGhlIG1ldGhvZCB0aGUgcmVxdWVzdCBzaG91bGQgdXNlLlxuICAgKiBAcmV0dXJucyB7WE1MSHR0cFJlcXVlc3R9XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSFIucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgdmFyIHJlcSA9IGlvLnV0aWwucmVxdWVzdCh0aGlzLnNvY2tldC5pc1hEb21haW4oKSlcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnksICd0PScgKyArbmV3IERhdGUpO1xuXG4gICAgcmVxLm9wZW4obWV0aG9kIHx8ICdHRVQnLCB0aGlzLnByZXBhcmVVcmwoKSArIHF1ZXJ5LCB0cnVlKTtcblxuICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmVxLnNldFJlcXVlc3RIZWFkZXIpIHtcbiAgICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0XG4gICAgICAgICAgcmVxLmNvbnRlbnRUeXBlID0gJ3RleHQvcGxhaW4nO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIHJldHVybiByZXE7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNjaGVtZSB0byB1c2UgZm9yIHRoZSB0cmFuc3BvcnQgVVJMcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUi5wcm90b3R5cGUuc2NoZW1lID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5vcHRpb25zLnNlY3VyZSA/ICdodHRwcycgOiAnaHR0cCc7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBYSFIgdHJhbnNwb3J0cyBhcmUgc3VwcG9ydGVkXG4gICAqXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0geGRvbWFpbiBDaGVjayBpZiB3ZSBzdXBwb3J0IGNyb3NzIGRvbWFpbiByZXF1ZXN0cy5cbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi5jaGVjayA9IGZ1bmN0aW9uIChzb2NrZXQsIHhkb21haW4pIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBpby51dGlsLnJlcXVlc3QoeGRvbWFpbiksXG4gICAgICAgICAgdXNlc1hEb21SZXEgPSAoZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmIHJlcXVlc3QgaW5zdGFuY2VvZiBYRG9tYWluUmVxdWVzdCksXG4gICAgICAgICAgc29ja2V0UHJvdG9jb2wgPSAoc29ja2V0ICYmIHNvY2tldC5vcHRpb25zICYmIHNvY2tldC5vcHRpb25zLnNlY3VyZSA/ICdodHRwczonIDogJ2h0dHA6JyksXG4gICAgICAgICAgaXNYUHJvdG9jb2wgPSAoZ2xvYmFsLmxvY2F0aW9uICYmIHNvY2tldFByb3RvY29sICE9IGdsb2JhbC5sb2NhdGlvbi5wcm90b2NvbCk7XG4gICAgICBpZiAocmVxdWVzdCAmJiAhKHVzZXNYRG9tUmVxICYmIGlzWFByb3RvY29sKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGUpIHt9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBYSFIgdHJhbnNwb3J0IHN1cHBvcnRzIGNyb3NzIGRvbWFpbiByZXF1ZXN0cy5cbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFhIUi54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgcmV0dXJuIFhIUi5jaGVjayhzb2NrZXQsIHRydWUpO1xuICB9O1xuXG59KShcbiAgICAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpby5UcmFuc3BvcnQgOiBtb2R1bGUuZXhwb3J0c1xuICAsICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvIDogbW9kdWxlLnBhcmVudC5leHBvcnRzXG4gICwgdGhpc1xuKTtcbi8qKlxuICogc29ja2V0LmlvXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBMZWFybkJvb3N0IDxkZXZAbGVhcm5ib29zdC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4oZnVuY3Rpb24gKGV4cG9ydHMsIGlvKSB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBjb25zdHJ1Y3Rvci5cbiAgICovXG5cbiAgZXhwb3J0cy5odG1sZmlsZSA9IEhUTUxGaWxlO1xuXG4gIC8qKlxuICAgKiBUaGUgSFRNTEZpbGUgdHJhbnNwb3J0IGNyZWF0ZXMgYSBgZm9yZXZlciBpZnJhbWVgIGJhc2VkIHRyYW5zcG9ydFxuICAgKiBmb3IgSW50ZXJuZXQgRXhwbG9yZXIuIFJlZ3VsYXIgZm9yZXZlciBpZnJhbWUgaW1wbGVtZW50YXRpb25zIHdpbGwgXG4gICAqIGNvbnRpbnVvdXNseSB0cmlnZ2VyIHRoZSBicm93c2VycyBidXp5IGluZGljYXRvcnMuIElmIHRoZSBmb3JldmVyIGlmcmFtZVxuICAgKiBpcyBjcmVhdGVkIGluc2lkZSBhIGBodG1sZmlsZWAgdGhlc2UgaW5kaWNhdG9ycyB3aWxsIG5vdCBiZSB0cmlnZ2VkLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC5YSFJ9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEhUTUxGaWxlIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaGVyaXRzIGZyb20gWEhSIHRyYW5zcG9ydC5cbiAgICovXG5cbiAgaW8udXRpbC5pbmhlcml0KEhUTUxGaWxlLCBpby5UcmFuc3BvcnQuWEhSKTtcblxuICAvKipcbiAgICogVHJhbnNwb3J0IG5hbWVcbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLm5hbWUgPSAnaHRtbGZpbGUnO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEFjLi4uZVggYGh0bWxmaWxlYCB3aXRoIGEgZm9yZXZlciBsb2FkaW5nIGlmcmFtZVxuICAgKiB0aGF0IGNhbiBiZSB1c2VkIHRvIGxpc3RlbiB0byBtZXNzYWdlcy4gSW5zaWRlIHRoZSBnZW5lcmF0ZWRcbiAgICogYGh0bWxmaWxlYCBhIHJlZmVyZW5jZSB3aWxsIGJlIG1hZGUgdG8gdGhlIEhUTUxGaWxlIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kb2MgPSBuZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oJ2h0bWxmaWxlJyk7XG4gICAgdGhpcy5kb2Mub3BlbigpO1xuICAgIHRoaXMuZG9jLndyaXRlKCc8aHRtbD48L2h0bWw+Jyk7XG4gICAgdGhpcy5kb2MuY2xvc2UoKTtcbiAgICB0aGlzLmRvYy5wYXJlbnRXaW5kb3cucyA9IHRoaXM7XG5cbiAgICB2YXIgaWZyYW1lQyA9IHRoaXMuZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGlmcmFtZUMuY2xhc3NOYW1lID0gJ3NvY2tldGlvJztcblxuICAgIHRoaXMuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lQyk7XG4gICAgdGhpcy5pZnJhbWUgPSB0aGlzLmRvYy5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcblxuICAgIGlmcmFtZUMuYXBwZW5kQ2hpbGQodGhpcy5pZnJhbWUpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAsIHF1ZXJ5ID0gaW8udXRpbC5xdWVyeSh0aGlzLnNvY2tldC5vcHRpb25zLnF1ZXJ5LCAndD0nKyArbmV3IERhdGUpO1xuXG4gICAgdGhpcy5pZnJhbWUuc3JjID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcblxuICAgIGlvLnV0aWwub24od2luZG93LCAndW5sb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBTb2NrZXQuSU8gc2VydmVyIHdpbGwgd3JpdGUgc2NyaXB0IHRhZ3MgaW5zaWRlIHRoZSBmb3JldmVyXG4gICAqIGlmcmFtZSwgdGhpcyBmdW5jdGlvbiB3aWxsIGJlIHVzZWQgYXMgY2FsbGJhY2sgZm9yIHRoZSBpbmNvbWluZ1xuICAgKiBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgVGhlIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtkb2N1bWVudH0gZG9jIFJlZmVyZW5jZSB0byB0aGUgY29udGV4dFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLl8gPSBmdW5jdGlvbiAoZGF0YSwgZG9jKSB7XG4gICAgLy8gdW5lc2NhcGUgYWxsIGZvcndhcmQgc2xhc2hlcy4gc2VlIEdILTEyNTFcbiAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC9cXFxcXFwvL2csICcvJyk7XG4gICAgdGhpcy5vbkRhdGEoZGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBzY3JpcHQgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdO1xuICAgICAgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICB9IGNhdGNoIChlKSB7IH1cbiAgfTtcblxuICAvKipcbiAgICogRGVzdHJveSB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdGlvbiwgaWZyYW1lIGFuZCBgaHRtbGZpbGVgLlxuICAgKiBBbmQgY2FsbHMgdGhlIGBDb2xsZWN0R2FyYmFnZWAgZnVuY3Rpb24gb2YgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICogdG8gcmVsZWFzZSB0aGUgbWVtb3J5LlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSFRNTEZpbGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuaWZyYW1lKXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICB9IGNhdGNoKGUpe31cblxuICAgICAgdGhpcy5kb2MgPSBudWxsO1xuICAgICAgdGhpcy5pZnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmlmcmFtZSk7XG4gICAgICB0aGlzLmlmcmFtZSA9IG51bGw7XG5cbiAgICAgIENvbGxlY3RHYXJiYWdlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyB0aGUgZXN0YWJsaXNoZWQgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zcG9ydH0gQ2hhaW5pbmcuXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEhUTUxGaWxlLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gaW8uVHJhbnNwb3J0LlhIUi5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIHRoaXMgdHJhbnNwb3J0LiBUaGUgYnJvd3NlclxuICAgKiBtdXN0IGhhdmUgYW4gYEFjLi4uZVhPYmplY3RgIGltcGxlbWVudGF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBIVE1MRmlsZS5jaGVjayA9IGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiICYmIChbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKSBpbiB3aW5kb3cpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIGEgPSBuZXcgd2luZG93WyhbJ0FjdGl2ZSddLmNvbmNhdCgnT2JqZWN0Jykuam9pbignWCcpKV0oJ2h0bWxmaWxlJyk7XG4gICAgICAgIHJldHVybiBhICYmIGlvLlRyYW5zcG9ydC5YSFIuY2hlY2soc29ja2V0KTtcbiAgICAgIH0gY2F0Y2goZSl7fVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGNyb3NzIGRvbWFpbiByZXF1ZXN0cyBhcmUgc3VwcG9ydGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSFRNTEZpbGUueGRvbWFpbkNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHdlIGNhbiBwcm9iYWJseSBkbyBoYW5kbGluZyBmb3Igc3ViLWRvbWFpbnMsIHdlIHNob3VsZFxuICAgIC8vIHRlc3QgdGhhdCBpdCdzIGNyb3NzIGRvbWFpbiBidXQgYSBzdWJkb21haW4gaGVyZVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIHRoZSB0cmFuc3BvcnQgdG8geW91ciBwdWJsaWMgaW8udHJhbnNwb3J0cyBhcnJheS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGlvLnRyYW5zcG9ydHMucHVzaCgnaHRtbGZpbGUnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuKTtcblxuLyoqXG4gKiBzb2NrZXQuaW9cbiAqIENvcHlyaWdodChjKSAyMDExIExlYXJuQm9vc3QgPGRldkBsZWFybmJvb3N0LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbihmdW5jdGlvbiAoZXhwb3J0cywgaW8sIGdsb2JhbCkge1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHNbJ3hoci1wb2xsaW5nJ10gPSBYSFJQb2xsaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgWEhSLXBvbGxpbmcgdHJhbnNwb3J0IHVzZXMgbG9uZyBwb2xsaW5nIFhIUiByZXF1ZXN0cyB0byBjcmVhdGUgYVxuICAgKiBcInBlcnNpc3RlbnRcIiBjb25uZWN0aW9uIHdpdGggdGhlIHNlcnZlci5cbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFhIUlBvbGxpbmcgKCkge1xuICAgIGlvLlRyYW5zcG9ydC5YSFIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgdHJhbnNwb3J0LlxuICAgKi9cblxuICBpby51dGlsLmluaGVyaXQoWEhSUG9sbGluZywgaW8uVHJhbnNwb3J0LlhIUik7XG5cbiAgLyoqXG4gICAqIE1lcmdlIHRoZSBwcm9wZXJ0aWVzIGZyb20gWEhSIHRyYW5zcG9ydFxuICAgKi9cblxuICBpby51dGlsLm1lcmdlKFhIUlBvbGxpbmcsIGlvLlRyYW5zcG9ydC5YSFIpO1xuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnQgbmFtZVxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBYSFJQb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ3hoci1wb2xsaW5nJztcblxuICAvKipcbiAgICogSW5kaWNhdGVzIHdoZXRoZXIgaGVhcnRiZWF0cyBpcyBlbmFibGVkIGZvciB0aGlzIHRyYW5zcG9ydFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUuaGVhcnRiZWF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqIFxuICAgKiBFc3RhYmxpc2ggYSBjb25uZWN0aW9uLCBmb3IgaVBob25lIGFuZCBBbmRyb2lkIHRoaXMgd2lsbCBiZSBkb25lIG9uY2UgdGhlIHBhZ2VcbiAgICogaXMgbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VHJhbnNwb3J0fSBDaGFpbmluZy5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5vcGVuLmNhbGwoc2VsZik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgYSBYSFIgcmVxdWVzdCB0byB3YWl0IGZvciBpbmNvbWluZyBtZXNzYWdlcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVtcHR5ICgpIHt9O1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNPcGVuKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09IDQpIHtcbiAgICAgICAgdGhpcy5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgc2VsZi5vbkRhdGEodGhpcy5yZXNwb25zZVRleHQpO1xuICAgICAgICAgIHNlbGYuZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5vbkNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkICgpIHtcbiAgICAgIHRoaXMub25sb2FkID0gZW1wdHk7XG4gICAgICB0aGlzLm9uZXJyb3IgPSBlbXB0eTtcbiAgICAgIHNlbGYucmV0cnlDb3VudGVyID0gMTtcbiAgICAgIHNlbGYub25EYXRhKHRoaXMucmVzcG9uc2VUZXh0KTtcbiAgICAgIHNlbGYuZ2V0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9uZXJyb3IgKCkge1xuICAgICAgc2VsZi5yZXRyeUNvdW50ZXIgKys7XG4gICAgICBpZighc2VsZi5yZXRyeUNvdW50ZXIgfHwgc2VsZi5yZXRyeUNvdW50ZXIgPiAzKSB7XG4gICAgICAgIHNlbGYub25DbG9zZSgpOyAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLmdldCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnhociA9IHRoaXMucmVxdWVzdCgpO1xuXG4gICAgaWYgKGdsb2JhbC5YRG9tYWluUmVxdWVzdCAmJiB0aGlzLnhociBpbnN0YW5jZW9mIFhEb21haW5SZXF1ZXN0KSB7XG4gICAgICB0aGlzLnhoci5vbmxvYWQgPSBvbmxvYWQ7XG4gICAgICB0aGlzLnhoci5vbmVycm9yID0gb25lcnJvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gc3RhdGVDaGFuZ2U7XG4gICAgfVxuXG4gICAgdGhpcy54aHIuc2VuZChudWxsKTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIHRoZSB1bmNsZWFuIGNsb3NlIGJlaGF2aW9yLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgWEhSUG9sbGluZy5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpby5UcmFuc3BvcnQuWEhSLnByb3RvdHlwZS5vbkNsb3NlLmNhbGwodGhpcyk7XG5cbiAgICBpZiAodGhpcy54aHIpIHtcbiAgICAgIHRoaXMueGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IHRoaXMueGhyLm9ubG9hZCA9IHRoaXMueGhyLm9uZXJyb3IgPSBlbXB0eTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMueGhyLmFib3J0KCk7XG4gICAgICB9IGNhdGNoKGUpe31cbiAgICAgIHRoaXMueGhyID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFdlYmtpdCBiYXNlZCBicm93c2VycyBzaG93IGEgaW5maW5pdCBzcGlubmVyIHdoZW4geW91IHN0YXJ0IGEgWEhSIHJlcXVlc3RcbiAgICogYmVmb3JlIHRoZSBicm93c2VycyBvbmxvYWQgZXZlbnQgaXMgY2FsbGVkIHNvIHdlIG5lZWQgdG8gZGVmZXIgb3BlbmluZyBvZlxuICAgKiB0aGUgdHJhbnNwb3J0IHVudGlsIHRoZSBvbmxvYWQgZXZlbnQgaXMgY2FsbGVkLiBXcmFwcGluZyB0aGUgY2IgaW4gb3VyXG4gICAqIGRlZmVyIG1ldGhvZCBzb2x2ZSB0aGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0IFRoZSBzb2NrZXQgaW5zdGFuY2UgdGhhdCBuZWVkcyBhIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2tcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIFhIUlBvbGxpbmcucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gKHNvY2tldCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpby51dGlsLmRlZmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmNhbGwoc2VsZik7XG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ3hoci1wb2xsaW5nJyk7XG5cbn0pKFxuICAgICd1bmRlZmluZWQnICE9IHR5cGVvZiBpbyA/IGlvLlRyYW5zcG9ydCA6IG1vZHVsZS5leHBvcnRzXG4gICwgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8gOiBtb2R1bGUucGFyZW50LmV4cG9ydHNcbiAgLCB0aGlzXG4pO1xuXG4vKipcbiAqIHNvY2tldC5pb1xuICogQ29weXJpZ2h0KGMpIDIwMTEgTGVhcm5Cb29zdCA8ZGV2QGxlYXJuYm9vc3QuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuKGZ1bmN0aW9uIChleHBvcnRzLCBpbywgZ2xvYmFsKSB7XG4gIC8qKlxuICAgKiBUaGVyZSBpcyBhIHdheSB0byBoaWRlIHRoZSBsb2FkaW5nIGluZGljYXRvciBpbiBGaXJlZm94LiBJZiB5b3UgY3JlYXRlIGFuZFxuICAgKiByZW1vdmUgYSBpZnJhbWUgaXQgd2lsbCBzdG9wIHNob3dpbmcgdGhlIGN1cnJlbnQgbG9hZGluZyBpbmRpY2F0b3IuXG4gICAqIFVuZm9ydHVuYXRlbHkgd2UgY2FuJ3QgZmVhdHVyZSBkZXRlY3QgdGhhdCBhbmQgVUEgc25pZmZpbmcgaXMgZXZpbC5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHZhciBpbmRpY2F0b3IgPSBnbG9iYWwuZG9jdW1lbnQgJiYgXCJNb3pBcHBlYXJhbmNlXCIgaW5cbiAgICBnbG9iYWwuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY29uc3RydWN0b3IuXG4gICAqL1xuXG4gIGV4cG9ydHNbJ2pzb25wLXBvbGxpbmcnXSA9IEpTT05QUG9sbGluZztcblxuICAvKipcbiAgICogVGhlIEpTT05QIHRyYW5zcG9ydCBjcmVhdGVzIGFuIHBlcnNpc3RlbnQgY29ubmVjdGlvbiBieSBkeW5hbWljYWxseVxuICAgKiBpbnNlcnRpbmcgYSBzY3JpcHQgdGFnIGluIHRoZSBwYWdlLiBUaGlzIHNjcmlwdCB0YWcgd2lsbCByZWNlaXZlIHRoZVxuICAgKiBpbmZvcm1hdGlvbiBvZiB0aGUgU29ja2V0LklPIHNlcnZlci4gV2hlbiBuZXcgaW5mb3JtYXRpb24gaXMgcmVjZWl2ZWRcbiAgICogaXQgY3JlYXRlcyBhIG5ldyBzY3JpcHQgdGFnIGZvciB0aGUgbmV3IGRhdGEgc3RyZWFtLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQGV4dGVuZHMge2lvLlRyYW5zcG9ydC54aHItcG9sbGluZ31cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gSlNPTlBQb2xsaW5nIChzb2NrZXQpIHtcbiAgICBpby5UcmFuc3BvcnRbJ3hoci1wb2xsaW5nJ10uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuaW5kZXggPSBpby5qLmxlbmd0aDtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlvLmoucHVzaChmdW5jdGlvbiAobXNnKSB7XG4gICAgICBzZWxmLl8obXNnKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogSW5oZXJpdHMgZnJvbSBYSFIgcG9sbGluZyB0cmFuc3BvcnQuXG4gICAqL1xuXG4gIGlvLnV0aWwuaW5oZXJpdChKU09OUFBvbGxpbmcsIGlvLlRyYW5zcG9ydFsneGhyLXBvbGxpbmcnXSk7XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydCBuYW1lXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy5wcm90b3R5cGUubmFtZSA9ICdqc29ucC1wb2xsaW5nJztcblxuICAvKipcbiAgICogUG9zdHMgYSBlbmNvZGVkIG1lc3NhZ2UgdG8gdGhlIFNvY2tldC5JTyBzZXJ2ZXIgdXNpbmcgYW4gaWZyYW1lLlxuICAgKiBUaGUgaWZyYW1lIGlzIHVzZWQgYmVjYXVzZSBzY3JpcHQgdGFncyBjYW4gY3JlYXRlIFBPU1QgYmFzZWQgcmVxdWVzdHMuXG4gICAqIFRoZSBpZnJhbWUgaXMgcG9zaXRpb25lZCBvdXRzaWRlIG9mIHRoZSB2aWV3IHNvIHRoZSB1c2VyIGRvZXMgbm90XG4gICAqIG5vdGljZSBpdCdzIGV4aXN0ZW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgQSBlbmNvZGVkIG1lc3NhZ2UuXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLnBvc3QgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgLCBxdWVyeSA9IGlvLnV0aWwucXVlcnkoXG4gICAgICAgICAgICAgdGhpcy5zb2NrZXQub3B0aW9ucy5xdWVyeVxuICAgICAgICAgICwgJ3Q9JysgKCtuZXcgRGF0ZSkgKyAnJmk9JyArIHRoaXMuaW5kZXhcbiAgICAgICAgKTtcblxuICAgIGlmICghdGhpcy5mb3JtKSB7XG4gICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKVxuICAgICAgICAsIGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gICAgICAgICwgaWQgPSB0aGlzLmlmcmFtZUlkID0gJ3NvY2tldGlvX2lmcmFtZV8nICsgdGhpcy5pbmRleFxuICAgICAgICAsIGlmcmFtZTtcblxuICAgICAgZm9ybS5jbGFzc05hbWUgPSAnc29ja2V0aW8nO1xuICAgICAgZm9ybS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBmb3JtLnN0eWxlLnRvcCA9ICcwcHgnO1xuICAgICAgZm9ybS5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICBmb3JtLnRhcmdldCA9IGlkO1xuICAgICAgZm9ybS5tZXRob2QgPSAnUE9TVCc7XG4gICAgICBmb3JtLnNldEF0dHJpYnV0ZSgnYWNjZXB0LWNoYXJzZXQnLCAndXRmLTgnKTtcbiAgICAgIGFyZWEubmFtZSA9ICdkJztcbiAgICAgIGZvcm0uYXBwZW5kQ2hpbGQoYXJlYSk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgdGhpcy5hcmVhID0gYXJlYTtcbiAgICB9XG5cbiAgICB0aGlzLmZvcm0uYWN0aW9uID0gdGhpcy5wcmVwYXJlVXJsKCkgKyBxdWVyeTtcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlICgpIHtcbiAgICAgIGluaXRJZnJhbWUoKTtcbiAgICAgIHNlbGYuc29ja2V0LnNldEJ1ZmZlcihmYWxzZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGluaXRJZnJhbWUgKCkge1xuICAgICAgaWYgKHNlbGYuaWZyYW1lKSB7XG4gICAgICAgIHNlbGYuZm9ybS5yZW1vdmVDaGlsZChzZWxmLmlmcmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIGllNiBkeW5hbWljIGlmcmFtZXMgd2l0aCB0YXJnZXQ9XCJcIiBzdXBwb3J0ICh0aGFua3MgQ2hyaXMgTGFtYmFjaGVyKVxuICAgICAgICBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCc8aWZyYW1lIG5hbWU9XCInKyBzZWxmLmlmcmFtZUlkICsnXCI+Jyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgICAgICBpZnJhbWUubmFtZSA9IHNlbGYuaWZyYW1lSWQ7XG4gICAgICB9XG5cbiAgICAgIGlmcmFtZS5pZCA9IHNlbGYuaWZyYW1lSWQ7XG5cbiAgICAgIHNlbGYuZm9ybS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgc2VsZi5pZnJhbWUgPSBpZnJhbWU7XG4gICAgfTtcblxuICAgIGluaXRJZnJhbWUoKTtcblxuICAgIC8vIHdlIHRlbXBvcmFyaWx5IHN0cmluZ2lmeSB1bnRpbCB3ZSBmaWd1cmUgb3V0IGhvdyB0byBwcmV2ZW50XG4gICAgLy8gYnJvd3NlcnMgZnJvbSB0dXJuaW5nIGBcXG5gIGludG8gYFxcclxcbmAgaW4gZm9ybSBpbnB1dHNcbiAgICB0aGlzLmFyZWEudmFsdWUgPSBpby5KU09OLnN0cmluZ2lmeShkYXRhKTtcblxuICAgIHRyeSB7XG4gICAgICB0aGlzLmZvcm0uc3VibWl0KCk7XG4gICAgfSBjYXRjaChlKSB7fVxuXG4gICAgaWYgKHRoaXMuaWZyYW1lLmF0dGFjaEV2ZW50KSB7XG4gICAgICBpZnJhbWUub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZi5pZnJhbWUucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgY29tcGxldGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pZnJhbWUub25sb2FkID0gY29tcGxldGU7XG4gICAgfVxuXG4gICAgdGhpcy5zb2NrZXQuc2V0QnVmZmVyKHRydWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEpTT05QIHBvbGwgdGhhdCBjYW4gYmUgdXNlZCB0byBsaXN0ZW5cbiAgICogZm9yIG1lc3NhZ2VzIGZyb20gdGhlIFNvY2tldC5JTyBzZXJ2ZXIuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBKU09OUFBvbGxpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICAgICwgcXVlcnkgPSBpby51dGlsLnF1ZXJ5KFxuICAgICAgICAgICAgIHRoaXMuc29ja2V0Lm9wdGlvbnMucXVlcnlcbiAgICAgICAgICAsICd0PScrICgrbmV3IERhdGUpICsgJyZpPScgKyB0aGlzLmluZGV4XG4gICAgICAgICk7XG5cbiAgICBpZiAodGhpcy5zY3JpcHQpIHtcbiAgICAgIHRoaXMuc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5zY3JpcHQpO1xuICAgICAgdGhpcy5zY3JpcHQgPSBudWxsO1xuICAgIH1cblxuICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgc2NyaXB0LnNyYyA9IHRoaXMucHJlcGFyZVVybCgpICsgcXVlcnk7XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9uQ2xvc2UoKTtcbiAgICB9O1xuXG4gICAgdmFyIGluc2VydEF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdO1xuICAgIGluc2VydEF0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNjcmlwdCwgaW5zZXJ0QXQpO1xuICAgIHRoaXMuc2NyaXB0ID0gc2NyaXB0O1xuXG4gICAgaWYgKGluZGljYXRvcikge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlmcmFtZSk7XG4gICAgICB9LCAxMDApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBpbmNvbWluZyBtZXNzYWdlIHN0cmVhbSBmcm9tIHRoZSBTb2NrZXQuSU8gc2VydmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YSBUaGUgbWVzc2FnZVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5fID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMub25EYXRhKG1zZyk7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLmdldCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogVGhlIGluZGljYXRvciBoYWNrIG9ubHkgd29ya3MgYWZ0ZXIgb25sb2FkXG4gICAqXG4gICAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXQgVGhlIHNvY2tldCBpbnN0YW5jZSB0aGF0IG5lZWRzIGEgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFja1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uIChzb2NrZXQsIGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghaW5kaWNhdG9yKSByZXR1cm4gZm4uY2FsbCh0aGlzKTtcblxuICAgIGlvLnV0aWwubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5jYWxsKHNlbGYpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYnJvd3NlciBzdXBwb3J0cyB0aGlzIHRyYW5zcG9ydC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgSlNPTlBQb2xsaW5nLmNoZWNrID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAnZG9jdW1lbnQnIGluIGdsb2JhbDtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgaWYgY3Jvc3MgZG9tYWluIHJlcXVlc3RzIGFyZSBzdXBwb3J0ZWRcbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEpTT05QUG9sbGluZy54ZG9tYWluQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgdHJhbnNwb3J0IHRvIHlvdXIgcHVibGljIGlvLnRyYW5zcG9ydHMgYXJyYXkuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBpby50cmFuc3BvcnRzLnB1c2goJ2pzb25wLXBvbGxpbmcnKTtcblxufSkoXG4gICAgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGlvID8gaW8uVHJhbnNwb3J0IDogbW9kdWxlLmV4cG9ydHNcbiAgLCAndW5kZWZpbmVkJyAhPSB0eXBlb2YgaW8gPyBpbyA6IG1vZHVsZS5wYXJlbnQuZXhwb3J0c1xuICAsIHRoaXNcbik7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIGlvOyB9KTtcbn1cbn0pKCk7IiwidmFyIGlvYyA9IHJlcXVpcmUoJ3NvY2tldC5pby9ub2RlX21vZHVsZXMvc29ja2V0LmlvLWNsaWVudCcpO1xyXG5yZXF1aXJlKCcuLi8uLi8uLi9jb21tb24vdXRpbHMuanMnKTtcclxudmFyIE1zZyA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbi9Nc2cuanMnKTtcclxucmVxdWlyZSgnLi9xdGlwLmpzJyk7XHJcbnZhciBrbyA9IHJlcXVpcmUoJ2tub2Nrb3V0Jyk7XHJcbnZhciBFbGFwc2VkID0gcmVxdWlyZSgnZWxhcHNlZCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTZXJ2ZXJCcm93c2VyO1xyXG52YXIgaW5Ccm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XHJcbmlmIChpbkJyb3dzZXIpIHtcclxuICAgIHdpbmRvdy5TZXJ2ZXJCcm93c2VyID0gU2VydmVyQnJvd3NlcjtcclxuICAgIHdpbmRvdy5rbyA9IGtvO1xyXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJ1tkYXRldGltZV0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgkdGhpcy5hdHRyKCdkYXRldGltZScpKTtcclxuICAgICAgICAgICAgdmFyIGZvcm1hdCA9ICR0aGlzLmF0dHIoJ2RhdGV0aW1lLWZvcm1hdCcpO1xyXG4gICAgICAgICAgICB2YXIgZWxhcHNlZCA9IGRhdGUuZWxhcHNlZCgpO1xyXG4gICAgICAgICAgICAkdGhpcy50ZXh0KGVsYXBzZWQgJiYgKGZvcm1hdCA/IGZvcm1hdC5mb3JtYXQoZWxhcHNlZCkgOiBlbGFwc2VkKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG52YXIgb2JzZXJ2YWJsZSA9IGtvLm9ic2VydmFibGU7XHJcbnZhciBvYnNlcnZhYmxlQXJyYXkgPSBrby5vYnNlcnZhYmxlQXJyYXk7XHJcbndpbmRvdy51bndyYXAgPSBrby51bndyYXA7XHJcbmtvLmJpbmRpbmdIYW5kbGVycy5oaWRkZW4gPSB7XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChlbGVtZW50LCB2YWx1ZUFjY2Vzc29yKSB7XHJcbiAgICAgICAgdmFyIGlzVmlzaWJsZSA9ICFrby51dGlscy51bndyYXBPYnNlcnZhYmxlKHZhbHVlQWNjZXNzb3IoKSk7XHJcbiAgICAgICAga28uYmluZGluZ0hhbmRsZXJzLnZpc2libGUudXBkYXRlKGVsZW1lbnQsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIGlzVmlzaWJsZTsgfSk7XHJcbiAgICB9XHJcbn07XHJcbmZ1bmN0aW9uIFNlcnZlckJyb3dzZXIoY29uZikge1xyXG4gICAgdGhpcy5jb25mID0gY29uZjtcclxuICAgIHRoaXMubG9ncyA9IG9ic2VydmFibGVBcnJheShbXSk7XHJcbiAgICB0aGlzLmFnZW50cyA9IG9ic2VydmFibGVBcnJheShbXSk7XHJcbiAgICB0aGlzLmJ1aWxkcyA9IG9ic2VydmFibGVBcnJheShbXSk7XHJcbiAgICB0aGlzLmNsaWVudHMgPSBvYnNlcnZhYmxlQXJyYXkoW10pO1xyXG4gICAgdGhpcy5zZWxlY3RlZEJ1aWxkID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy5zZWxlY3RlZEJ1aWxkID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy5zZWxlY3RlZEJ1aWxkLnRhYiA9IG9ic2VydmFibGUoJyNub0J1aWxkJyk7XHJcbiAgICB0aGlzLnN0YXR1cyA9IG9ic2VydmFibGUoJ2Nvbm5lY3RpbmcnKTtcclxuICAgIHRoaXMuZGlzY29ubmVjdGVkU2luY2UgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB2YXIgdXJsID0gJ3swfTovL3sxfXsyfS97M30nLmZvcm1hdChjb25mLnByb3RvY29sIHx8ICdodHRwJywgY29uZi5ob3N0IHx8ICdsb2NhbGhvc3QnLCBjb25mLnBvcnQgPT0gODAgPyAnJyA6ICc6JyArIGNvbmYucG9ydCwgJ3d3dycpO1xyXG4gICAgdmFyIGFzID0gJC5jb29raWUoJ2FzJykgIT09ICdmYWxzZSc7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhcycsIGFzKTtcbiAgICB0aGlzLmFzID0gb2JzZXJ2YWJsZShhcyk7XG4gICAgdGhpcy5hcy5zdWJzY3JpYmUoZnVuY3Rpb24oYXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FzJywgYXMpO1xuICAgICAgICAkLmNvb2tpZSgnYXMnLCBhcyx7ZXhwaXJlczozNjV9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXHJcbiAgICBpbkJyb3dzZXIgJiYga28uYXBwbHlCaW5kaW5ncyh0aGlzLCBkb2N1bWVudC5ib2R5KTtcclxuICAgIHRoaXMuY29ubmVjdCh1cmwpO1xyXG59XHJcblNlcnZlckJyb3dzZXIuZGVmaW5lKHtcclxuICAgIHN0YXR1c2VzOiB7XHJcbiAgICAgICAgJ2J1aWxkaW5nJzogJ2ltZy9wbGF0Zm9ybXMvYnVpbGRpbmcuZ2lmJyxcclxuICAgICAgICAndXBsb2FkaW5nJzogJ2ltZy9wbGF0Zm9ybXMvd29ya2luZy5naWYnLFxyXG4gICAgICAgICdxdWV1ZWQnOiAnaW1nL3BsYXRmb3Jtcy9xdWV1ZS5naWYnLFxyXG4gICAgICAgICd3b3JraW5nJzogJ2ltZy9wbGF0Zm9ybXMvd29ya2luZy5naWYnLFxyXG4gICAgICAgICdmYWlsZWQnOiAnaW1nL3BsYXRmb3Jtcy9mYWlsLnBuZycsXHJcbiAgICAgICAgJ3Vua25vd24nOiAnaW1nL3BsYXRmb3Jtcy91bmtub3duLnBuZycsXHJcbiAgICB9LFxyXG4gICAgcGxhdGZvcm1OYW1lczoge1xyXG4gICAgICAgICdpb3MnOiAnSU9TJyxcclxuICAgICAgICAnd3A4JzogJ1dpbmRvd3MgUGhvbmUgOCcsXHJcbiAgICAgICAgJ2FuZHJvaWQnOiAnQW5kcm9pZCcsXHJcbiAgICB9LFxyXG4gICAgY29ubmVjdDogZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgIHRoaXMuc29ja2V0ID0gaW9jLmNvbm5lY3QodXJsKTtcclxuICAgICAgICB0aGlzLnNvY2tldC5oZWFydGJlYXRUaW1lb3V0ID0gMTAwMDsgLy8gcmVjb25uZWN0IGlmIG5vdCByZWNlaXZlZCBoZWFydGJlYXQgZm9yIDIwIHNlY29uZHNcclxuXHJcbiAgICAgICAgdGhpcy5zb2NrZXQub24oe1xyXG4gICAgICAgICAgICAnY29ubmVjdCc6IHRoaXMub25Db25uZWN0LFxyXG4gICAgICAgICAgICAnZGlzY29ubmVjdCc6IHRoaXMub25EaXNjb25uZWN0LFxyXG4gICAgICAgICAgICAnc3RhdHVzJzogdGhpcy5vblN0YXR1cyxcclxuICAgICAgICAgICAgJ25ld3MnOiB0aGlzLm9uUGFydGlhbFN0YXR1cyxcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgIH0sXHJcbiAgICAnb25Db25uZWN0JzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzKCdjb25uZWN0ZWQnKTtcclxuICAgIH0sXHJcbiAgICAnb25EaXNjb25uZWN0JzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZGlzY29ubmVjdGVkU2luY2UobmV3IERhdGUoKSk7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMoJ2Rpc2Nvbm5lY3RlZCcpO1xyXG4gICAgICAgIHRoaXMuYWdlbnRzKFtdKTtcclxuICAgICAgICB0aGlzLmJ1aWxkcyhbXSk7XHJcbiAgICAgICAgdGhpcy5jbGllbnRzKFtdKTtcclxuICAgICAgICAvL3RoaXMubG9ncyhbXSk7ICAtLSBkbyBub3QgY2xlYXIgbG9nc1xyXG4gICAgICAgIHRoaXMuYWdlbnRzLm1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuYnVpbGRzLm1hcCA9IHt9O1xyXG4gICAgICAgIHRoaXMuY2xpZW50cy5tYXAgPSB7fTtcclxuICAgICAgICB0aGlzLmxvZ3MubWFwID0ge307XHJcbiAgICB9LFxyXG4gICAgJ29uUGFydGlhbFN0YXR1cyc6IGZ1bmN0aW9uIChzdGF0dXMpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ3BhcnRpYWwgc3RhdHVzJywgc3RhdHVzKTtcclxuICAgICAgICBzd2l0Y2ggKHN0YXR1cyAmJiBzdGF0dXMud2hhdCkge1xyXG4gICAgICAgICAgICBjYXNlICdhZ2VudCc6XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUuY2FsbCh0aGlzLCB0aGlzLmFnZW50cyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnYnVpbGQnOlxyXG4gICAgICAgICAgICAgICAgdXBkYXRlLmNhbGwodGhpcywgdGhpcy5idWlsZHMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2NsaWVudCc6XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUuY2FsbCh0aGlzLCB0aGlzLmNsaWVudHMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xvZyc6XHJcbiAgICAgICAgICAgICAgICB1cGRhdGUuY2FsbCh0aGlzLCB0aGlzLmxvZ3MpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZShsaXN0KSB7XHJcbiAgICAgICAgICAgIGxpc3QubWFwID0gbGlzdC5tYXAgfHwge307XHJcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdHVzICYmIHN0YXR1cy5raW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsb2cnOlxyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QudW5zaGlmdChuZXcgTXNnKHN0YXR1cy5vYmopKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9nJywgc3RhdHVzLm9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdxdWV1ZWQnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnYnVpbGRpbmcnOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZmFpbGVkJzpcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWFwID0gbGlzdC5tYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ1aWxkID0gc3RhdHVzLm9iajtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXV0b1NlbGVjdEJ1aWxkID0gdGhpcy5hcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RCdWlsZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRCdWlsZCA9IHRoaXMuc2VsZWN0ZWRCdWlsZDtcclxuICAgICAgICAgICAgICAgICAgICBidWlsZCA9IGZ1bmN0aW9uIChidWlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZC5jb25mICYmIChidWlsZC5jb25mLmxvZ3MgPSAoYnVpbGQuY29uZi5sb2dzIHx8IFtdKS5tYXAoZnVuY3Rpb24obG9nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE1zZyhsb2cpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2bSA9IG1hcFtidWlsZC5pZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2bSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0udXBkYXRlKGJ1aWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0gPSBuZXcgQnVpbGRWTShidWlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBbYnVpbGQuaWRdID0gdm07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dG9TZWxlY3RCdWlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0QnVpbGQgPSB2bTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQodm0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSAgdGhpcy5wbGF0Zm9ybXMucHVzaCh2bSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMgIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVySWQgPSB0aGlzICYmIHRoaXMuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5tYXN0ZXIgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChhcmd1bWVudHMuY2FsbGVlLmJpbmQodm0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdEJ1aWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRCdWlsZChzZWxlY3RCdWlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2bTtcclxuICAgICAgICAgICAgICAgICAgICB9LmNhbGwoMSwgYnVpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChidWlsZCAmJiAhc2VsZWN0ZWRCdWlsZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQnVpbGQoYnVpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVkJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbyA9IGxpc3QubWFwW3N0YXR1cy5vYmouaWRdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gbGlzdC5pbmRleE9mKG8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgPCAwID8gbGlzdC51bnNoaWZ0KHN0YXR1cy5vYmopIDogbGlzdFtpXSA9IHN0YXR1cy5vYmo7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5tYXBbc3RhdHVzLm9iai5pZF0gPSBvO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ0xJU1QnLCBzdGF0dXMsIGxpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZGlzY29ubmVjdGVkJzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBzdGF0dXMub2JqLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucmVtb3ZlKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmlkID09IGlkO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBsaXN0Lm1hcFtzdGF0dXMub2JqLmlkXTtcclxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMSVNUJywgc3RhdHVzLm9iai5pZCwgc3RhdHVzLCBsaXN0Lm1hcCwgbGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXR1cy5vYmo7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgICdvblN0YXR1cyc6IGZ1bmN0aW9uIChzdGF0dXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnc3RhdHVzJywgc3RhdHVzKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYgKHN0YXR1cykge1xyXG4gICAgICAgICAgICBzdGF0dXMuYWdlbnRzID0gc3RhdHVzLmFnZW50cyB8fCBbXTtcclxuICAgICAgICAgICAgdGhpcy5sb2dzKChzdGF0dXMubG9ncyB8fFtdKS5tYXAoZnVuY3Rpb24obG9nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE1zZyhsb2cpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWdlbnRzLm1hcCA9IHt9O1xyXG4gICAgICAgICAgICBzdGF0dXMuYWdlbnRzICYmIHN0YXR1cy5hZ2VudHMuZm9yRWFjaChmdW5jdGlvbiAoYWdlbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWdlbnRzLm1hcFthZ2VudC5pZF0gPSBhZ2VudDtcclxuICAgICAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBtYXAgPSB0aGlzLmJ1aWxkcy5tYXAgPSB7fTtcclxuICAgICAgICAgICAgdmFyIGJ1aWxkcyA9IFtdO1xyXG4gICAgICAgICAgICBzdGF0dXMuYnVpbGRzICYmIHN0YXR1cy5idWlsZHMuZm9yRWFjaChmdW5jdGlvbiAoYnVpbGQpIHtcclxuICAgICAgICAgICAgICAgICBidWlsZC5jb25mICYmIChidWlsZC5jb25mLmxvZ3MgPSAoYnVpbGQuY29uZi5sb2dzIHx8IFtdKS5tYXAoZnVuY3Rpb24obG9nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBNc2cobG9nKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIHZhciB2bSA9IG1hcFtidWlsZC5pZF07XHJcbiAgICAgICAgICAgICAgICBpZiAodm0pIHtcclxuICAgICAgICAgICAgICAgICAgICB2bS51cGRhdGUoYnVpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2bSA9IG5ldyBCdWlsZFZNKGJ1aWxkKTtcclxuICAgICAgICAgICAgICAgICAgICBtYXBbYnVpbGQuaWRdID0gdm07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcyA9PSAxID8gYnVpbGRzLnVuc2hpZnQodm0pIDogdGhpcy5wbGF0Zm9ybXMucHVzaCh2bSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcyAhPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVySWQgPSB0aGlzICYmIHRoaXMuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdm0ubWFzdGVyID0gdGhpcztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChhcmd1bWVudHMuY2FsbGVlLmJpbmQodm0pKTtcclxuICAgICAgICAgICAgfS5iaW5kKDEpKTtcclxuICAgICAgICAgICAgdGhpcy5hZ2VudHMoc3RhdHVzLmFnZW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVpbGRzKGJ1aWxkcyk7XHJcbiAgICAgICAgICAgIGlmIChidWlsZHNbMF0gJiYgIXRoaXMuc2VsZWN0ZWRCdWlsZCgpKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEJ1aWxkKGJ1aWxkc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBhcnNlc2VsZWN0ZWRCdWlsZDogZnVuY3Rpb24gKGJ1aWxkKSB7XHJcbiAgICAgICAgaWYgKGJ1aWxkKSB7XHJcbiAgICAgICAgICAgIGJ1aWxkLnFyID0gdGhpcy5zdGF0dXNlc1tidWlsZC5zdGF0dXNdIHx8IHRoaXMuZ2VuZXJhdGVRUignL2Rvd25sb2FkLycgKyBidWlsZC5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJ1aWxkLnBsYXRmb3JtcyAmJiBidWlsZC5wbGF0Zm9ybXMuZm9yRWFjaChmdW5jdGlvbiAocGxhdGZvcm0pIHtcclxuICAgICAgICAgICAgcGxhdGZvcm0ucXIgPSB0aGlzLnN0YXR1c2VzW2J1aWxkLnN0YXR1c10gfHwgdGhpcy5nZW5lcmF0ZVFSKCcvZG93bmxvYWQvJyArIGJ1aWxkLmlkKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkQnVpbGQoYnVpbGQpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlUVI6IGZ1bmN0aW9uICh1cmwsIGxldmVsKSB7XHJcbiAgICAgICAgdmFyIHVyaSA9IHFyLnRvRGF0YVVSTCh7XHJcbiAgICAgICAgICAgIHZhbHVlOiB1cmwsXHJcbiAgICAgICAgICAgIGxldmVsOiBsZXZlbCB8fCAnSCcsXHJcbiAgICAgICAgICAgIHNpemU6IDEwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnNvbGUud2Fybih1cmkpO1xyXG4gICAgICAgIHJldHVybiB1cmk7XHJcbiAgICB9LFxyXG4gICAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgncmVmcmVzaCcpO1xyXG4gICAgfSxcclxufSk7XHJcbmZ1bmN0aW9uIEJ1aWxkVk0oYnVpbGQpIHtcclxuICAgIHRoaXMuY29uZiA9IGJ1aWxkICYmIGJ1aWxkLmNvbmY7XHJcbiAgICB0aGlzLm5hbWUgPSBvYnNlcnZhYmxlKCk7XHJcbiAgICB0aGlzLmlkID0gYnVpbGQgJiYgYnVpbGQuaWQ7XHJcbiAgICB0aGlzLnBsYXRmb3JtcyA9IG9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5wbGF0Zm9ybSA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMuc3RhcnRlZCA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMuY29tcGxldGVkID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy5kdXJhdGlvbiA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMuc3RhdHVzID0gb2JzZXJ2YWJsZSgpO1xyXG4gICAgdGhpcy5xciA9IG9ic2VydmFibGUoKTtcclxuICAgIHRoaXMudXBkYXRlKGJ1aWxkKTtcclxufVxyXG52YXIgc3RhdHVzZXMgPSBbJ3Vua25vd24nLCAncGxhbm5lZCcsICdzdWNjZXNzJywgJ3F1ZXVlZCcsICdidWlsZGluZycsICd1cGxvYWRpbmcnLCAnZmFpbGVkJ11cclxuQnVpbGRWTS5kZWZpbmUoe1xyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoYnVpbGQpIHtcclxuICAgICAgICBpZiAoYnVpbGQgJiYgYnVpbGQuY29uZikge1xyXG4gICAgICAgICAgICB2YXIgY29uZiA9IGJ1aWxkLmNvbmY7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZiA9IGNvbmY7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZShjb25mLm5hbWUpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtKGNvbmYucGxhdGZvcm0pO1xyXG4gICAgICAgICAgICB0aGlzLmlkID0gYnVpbGQuaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZChjb25mLnN0YXJ0ZWQgJiYgbmV3IERhdGUoY29uZi5zdGFydGVkKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGVkKGNvbmYuY29tcGxldGVkICYmIG5ldyBEYXRlKGNvbmYuY29tcGxldGVkKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZHVyYXRpb24oY29uZi5kdXJhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzKGNvbmYuc3RhdHVzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWFzdGVyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzdGVyU3RhdHVzID0gMDtcclxuICAgICAgICAgICAgICAgIHZhciBwbGF0Zm9ybUJ1aWxkcyA9IHRoaXMubWFzdGVyLnBsYXRmb3JtcygpO1xyXG4gICAgICAgICAgICAgICAgcGxhdGZvcm1CdWlsZHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQsIGkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpID0gc3RhdHVzZXMuaW5kZXhPZihjaGlsZC5zdGF0dXMoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPiBtYXN0ZXJTdGF0dXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hc3RlclN0YXR1cyA9IGk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXN0ZXJTdGF0dXMgPSBzdGF0dXNlc1ttYXN0ZXJTdGF0dXNdIHx8ICd1bmtvd24nO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXN0ZXIuY29uZi5zdGF0dXMgPSBtYXN0ZXJTdGF0dXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hc3Rlci5zdGF0dXMobWFzdGVyU3RhdHVzKTtcclxuICAgICAgICAgICAgICAgIHZhciBxciA9IG1hc3RlclN0YXR1cyA9PSAnc3VjY2VzcycgPyB0aGlzLm1hc3Rlci5fX3FyIDogU2VydmVyQnJvd3Nlci5wcm90b3R5cGUuc3RhdHVzZXNbbWFzdGVyU3RhdHVzXTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFzdGVyLnFyKHFyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3FyICE9IGJ1aWxkLmlkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9xciA9IGJ1aWxkLmlkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fX3FyID0gdGhpcy5RUigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBxciA9IGNvbmYuc3RhdHVzID09ICdzdWNjZXNzJyA/IHRoaXMuX19xciA6IFNlcnZlckJyb3dzZXIucHJvdG90eXBlLnN0YXR1c2VzW2NvbmYuc3RhdHVzIHx8ICd1bmtvd24nXTtcclxuICAgICAgICAgICAgdGhpcy5xcihxcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFFSOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIFNlcnZlckJyb3dzZXIucHJvdG90eXBlLmdlbmVyYXRlUVIoJ2h0dHA6Ly9sb2NhbGhvc3QvZG93bmxvYWQvJyArIHRoaXMuaWQpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbiIsIiFmdW5jdGlvbigkKSB7XHJcbiAgICAvKiBDT05GSUcgKi9cclxuXHJcbiAgICB4T2Zmc2V0ID0gMTA7XHJcbiAgICB5T2Zmc2V0ID0gMzA7XHJcblxyXG4gICAgLy8gdGhlc2UgMiB2YXJpYWJsZSBkZXRlcm1pbmUgcG9wdXAncyBkaXN0YW5jZSBmcm9tIHRoZSBjdXJzb3JcclxuICAgIC8vIHlvdSBtaWdodCB3YW50IHRvIGFkanVzdCB0byBnZXQgdGhlIHJpZ2h0IHJlc3VsdFxyXG5cclxuICAgIC8qIEVORCBDT05GSUcgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKFwibW91c2VlbnRlclwiLCBcIi5wcmV2aWV3XCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcclxuICAgICAgICB0aGlzLnQgPSAkdGhpcy5hdHRyKFwidGl0bGVcIik7XHJcbiAgICAgICAgaWYgKCF0aGlzLnQgJiYgIXJlbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnRpdGxlID0gXCJcIjtcclxuICAgICAgICB2YXIgYyA9ICh0aGlzLnQgIT0gXCJcIikgPyBcIjxici8+XCIgKyB0aGlzLnQgOiBcIlwiO1xyXG4gICAgICAgIHZhciByZWwgPSAkdGhpcy5hdHRyKFwicmVsXCIpO1xyXG4gICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChbXCI8ZGl2IGlkPSdzY3JlZW5zaG90Jz5cIiwgcmVsID8gXCI8aW1nIHNyYz0nXCIgOiBcIlwiLCByZWwsIHJlbCA/IFwiJyBhbHQ9J3VybCBwcmV2aWV3JyAvPlwiOiBcIlwiLCAgYywgXCI8L2Rpdj5cIl0uam9pbignJykpO1xyXG4gICAgICAgICQoXCIjc2NyZWVuc2hvdFwiKVxyXG4gICAgICAgICAgICAuY3NzKFwidG9wXCIsIChlLnBhZ2VZIC0geE9mZnNldCkgKyBcInB4XCIpXHJcbiAgICAgICAgICAgIC5jc3MoXCJsZWZ0XCIsIChlLnBhZ2VYICsgeU9mZnNldCkgKyBcInB4XCIpXHJcbiAgICAgICAgICAgIC5mYWRlSW4oXCJmYXN0XCIpO1xyXG4gICAgfSkub24oXCJtb3VzZWxlYXZlXCIsIFwiLnByZXZpZXdcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGhpcy50O1xyXG4gICAgICAgICQoXCIjc2NyZWVuc2hvdFwiKS5yZW1vdmUoKTtcclxuICAgIH0pLm9uKFwibW91c2Vtb3ZlXCIsIFwiLnByZXZpZXdcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAkKFwiI3NjcmVlbnNob3RcIilcclxuICAgICAgICAgICAgLmNzcyhcInRvcFwiLCAoZS5wYWdlWSAtIHhPZmZzZXQpICsgXCJweFwiKVxyXG4gICAgICAgICAgICAuY3NzKFwibGVmdFwiLCAoZS5wYWdlWCArIHlPZmZzZXQpICsgXCJweFwiKTtcclxuICAgIH0pO1x0XHJcbn0oalF1ZXJ5KTtcclxuIl19
