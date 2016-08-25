/**
 * A generic Patchwork error.
 * @constructor
 * @param {(Error|String)} message Message for error.
 */
module.exports = function PatchworkError(message) {
  if (this instanceof PatchworkError === false) {
    return new PatchworkError(message);
  }

  this.constructor.prototype.__proto__ = Error.prototype;

  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message instanceof Error ?
    message.message : message;
};
