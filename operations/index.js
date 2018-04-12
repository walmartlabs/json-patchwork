var _ = require('../common');
var PatchworkError = require('../error');
var shape = require('./shape');

/** @type {Function} */
exports.execute = execute;

/** @type {Function} */
exports.register = register;

/** @type {Function} */
exports.registered = registered;

/** @type {Function} */
exports.unregister = unregister;

/**
 * Global operation store.
 * @type {Object}
 */
var registry = {
  core: {
    shape: shape
  },
  local: {}
};

/**
 * Execute a registered operation.
 * @param {Object} operation An operation object.
 * @param {Object} input An object to operator on.
 * @returns {Object}
 */
function execute(operation, input, ctx) {
  var type = formatType(operation.type);
  var fn;

  if (_.has(registry.local, type)) {
    fn = registry.local[type];
  } else if (_.has(registry.core, type)) {
    fn = registry.core[type];
  } else {
    throw new PatchworkError('Operator [' + type + '] is not registered.');
  }

  return fn(operation, input, ctx);
}

/**
 * Register a local operation.
 * @override
 * @param {string} type Operation name.
 * @param {Function} fn Operation implementation.
 */
function register(type, fn) {
  type = formatType(type);
  registry.local[type] = fn;
}

/**
 * Checks to see if an operation is registered.
 * @param {String} type Name of operation to check.
 * @returns {Boolean}
 */
function registered(type) {
  var isRegistered = _.has(registry.local, type);

  if (isRegistered === false) {
    isRegistered = _.has(registry.core, type);
  }

  return isRegistered;
}

/**
 * Unregister a local operation.
 * @override
 * @param {string} type Operation name.
 */
function unregister(type) {
  type = formatType(type);

  if (_.has(registry.local, type) === false) {
    throw new PatchworkError('Operator [' + type + '] is not registered.');
  }

  delete registry.local[type];
}

/**
 * Format a supplied type.
 * @param {string} type Operation name.
 * @returns {string}
 */
function formatType(type) {
  return type.toLowerCase();
}
