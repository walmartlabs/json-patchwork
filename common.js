/** @see http://lodash.com/docs#has */
exports.has = require('lodash/has');

/** @see http://lodash.com/docs#get */
exports.get = require('lodash/get');

/** @see http://lodash.com/docs#set */
exports.set = require('lodash/set');

/** @see http://lodash.com/docs#update */
exports.update = require('lodash/update');

/** @see http://lodash.com/docs#extend */
exports.extend = require('lodash/extend');

/** @see http://lodash.com/docs#uniqWith */
exports.uniqWith = require('lodash/uniqWith');

/** @see http://lodash.com/docs#isEqual */
exports.isEqual = require('lodash/isEqual');

/** @see http://lodash.com/docs#some */
exports.some = require('lodash/some');

/** @see http://lodash.com/docs#every */
exports.every = require('lodash/every');

/** @see http://lodash.com/docs#map */
exports.map = require('lodash/map');

/** @see http://lodash.com/docs#mapValues */
exports.mapValues = require('lodash/mapValues');

/** @see http://lodash.com/docs#flatMap */
exports.flatMap = require('lodash/flatMap');

/** @see http://lodash.com/docs#partial */
exports.partial = require('lodash/partial');

/** @see http://lodash.com/docs#find */
exports.find = require('lodash/find');

/** @see http://lodash.com/docs#filter */
exports.filter = require('lodash/filter');

/**
 * Regular expression used for matching leading and
 * trailing whitespace...
 * @type {RegEx}
 */
var RX_TRIM_WHITESPACE = /^\s+|\s+$/g;

/**
 * Remove leading and trailing whitespace.
 * @param {String} input Value to trim.
 * @returns {String}
 */
exports.trim = function trim(input) {
  return String(input).replace(RX_TRIM_WHITESPACE, '');
};

/**
 * Returns whether supplied value is a `RegExp`
 * @param {mixed} input Value to check.
 * @returns {Boolean}
 */
exports.isRegExp = function isRegExp(input) {
  return '[object RegExp]' === asString(input);
};

/**
 * Returns whether supplied value is an `Array`
 * @param {mixed} input Value to check.
 * @returns {Boolean}
 */
exports.isArray = function isArray(input) {
  return '[object Array]' === asString(input);
};

/**
 * Returns whether supplied value is an `Array`
 * @param {mixed} input Value to check.
 * @returns {Boolean}
 */
exports.isArrayLike = function isArrayLike(input) {
  return (
    exports.isArray(input) ||
    (exports.isObject(input) && input.length > 0 && input.length < Number.MAX_SAFE_INTEGER)
  );
};

/**
 * Returns whether supplied value is a POJO `Object`
 * @param {mixed} input Value to check.
 * @returns {Boolean}
 */
exports.isPlainObject = function isPlainObject(input) {
  return '[object Object]' === asString(input);
};

/**
 * Returns whether supplied value is an `Object`
 * @param {mixed} input Value to check.
 * @returns {Boolean}
 */
exports.isObject = function isObject(input) {
  return input instanceof Object;
};

/**
 * Convert a value to an integer.
 * @param {mixed} input Value to convert.
 * @param {mixed} def Default value.
 * @param {Number} radix Radix to use in conversion. Default: 10
 * @returns {Number}
 */
exports.toInt = function toInt(input, def, radix) {
  return parseInt(input, radix || 10) || def;
};

/**
 * Convert an array-like value to an array.
 * @param {mixed} input Value to convert.
 * @returns {Number}
 */
exports.toArray = function toInt(input) {
  return Array.prototype.slice.call(input);
};

/**
 * Convert an object to it's string interpretation.
 * @param {Object} value Object to convert to string.
 * @returns {String}
 */
function asString(value) {
  return Object.prototype.toString.call(value);
}
