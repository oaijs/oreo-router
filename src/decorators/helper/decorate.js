import _ from 'lodash';

import debug from '../../util/debug';
import MiddlewareRegister from '../../register/middleware';
import EndpointRegister from '../../register/endpoint';
import DecoratorRegister from '../../register/decorator';
import { assertInteger, assertString, assertFunction, assertMaxDecorate } from '../../util/assert';

/**
 * Get the constructor of target.
 * When decorating class or static member function, the target is constructor of target class.
 * When decorating member function, the target is prototype
 * Other situation throw error.
 * @param {object|function} target
 * @returns {function} constructor function.
 */
function getConstructorOf(target) {
  if (_.isFunction(target)) {
    return target;
  } else if (_.isObject(target) && _.isFunction(target.constructor)) {
    return target.constructor;
  }

  throw new Error('Invalid target.');
}

/**
 * Get constructor from target and set middlewareRegister, endpointRegister, decoratorRegister
 * to constructor.
 * @param {object} target
 * @param {string} name
 * @param {object} descriptor
 * @returns {function} constructor function.
 */
function getSafeConstructorOf(target, name, descriptor) {
  const constructor = getConstructorOf(target);
  const defaults = {
    middlewareRegister: new MiddlewareRegister(),
    endpointRegister: new EndpointRegister(),
    decoratorRegister: new DecoratorRegister(),
  };

  _.defaults(constructor, defaults);

  return constructor;
}

/**
 * Wrap a handler to decorator with ...opts arguments.
 * @param {function} handler decorator's handler.
 *  handler with arguments: (
 *    target,           // target
 *    name,             // function name, field name or undefined if decorating class.
 *    descriptor,       //
 *    constructor,
 *    ...args,
 *  )
 * @param {any[]} args decorator's arguments.
 * @returns {function} decorator
 */
function decorate(handler, ...args) {
  return (target, name, descriptor) => {
    const constructor = getSafeConstructorOf(target);

    handler(target, name, descriptor, constructor, ...args);

    return descriptor;
  };
}

/**
 * Wrap a middleware to decorator and register it in decoratorRegister.
 * @public
 * @param {object} options
 * @param {string} options.name
 * @param {function} options.middleware
 * @param {number} options.maxDecorate
 * @param {function} options.beforeHandler
 * @param {function} options.afterHandler
 * @returns {function} decorator function
 */
function toDecorator(options) {
  const {
    name: decoratorName,
    middleware,
    maxDecorate = 1,
    beforeHandler = _.noop,
    afterHandler = _.noop,
  } = options;
  debug('toDecorator', options);

  assertString(decoratorName, 'decoratorName must be string!');
  assertFunction(middleware || _.noop, 'middleware must be function!');
  assertInteger(maxDecorate, 'maxDecorate must be integer!');
  assertFunction(beforeHandler, 'beforeHandler must be function!');
  assertFunction(afterHandler, 'afterHandler must be function!');

  function middlewareHandler(target, name, descriptor, constructor, ...entryArgs) {
    beforeHandler(target, name, descriptor, constructor, decoratorName, ...entryArgs);

    constructor.decoratorRegister.lPush(name, decoratorName, { args: entryArgs, middleware });
    assertMaxDecorate(constructor, name, decoratorName, maxDecorate);

    afterHandler(target, name, descriptor, constructor, decoratorName, ...entryArgs);
  }

  return function decorator(...entryArgs) {
    return decorate(middlewareHandler, ...entryArgs);
  };
}

export {
  decorate,
  toDecorator,
};
