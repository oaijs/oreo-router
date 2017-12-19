import _ from 'lodash';

import debug from '../../util/debug';
import MiddlewareRegister from '../../register/middleware';
import EndpointRegister from '../../register/endpoint';
import DecoratorRegister from '../../register/decorator';
import { assertNaturalNumber, assertString, assertFunction, assertTargetType } from '../../util/assert';

const DECORATORS_OPTION = {};
const DECORATORS_GROUP = {};

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
 * @param {string} options.targetType any,class,function
 * @param {number} options.maxDecorate
 * @param {number} options.minDecorate
 * @param {function} options.beforeHandler
 * @param {function} options.afterHandler
 * @returns {function} decorator function
 */
function toDecorator(options) {
  const {
    name: decoratorName,
    middleware,
    beforeHandler = _.noop,
    afterHandler = _.noop,
    group = options.name,
    targetType = 'any',
    maxDecorate = 1,
    minDecorate = 0,
  } = options;
  debug('toDecorator', options);

  assertString(decoratorName, 'decoratorName must be string!');
  assertFunction(middleware || _.noop, 'middleware must be function!');
  assertFunction(beforeHandler, 'beforeHandler must be function!');
  assertFunction(afterHandler, 'afterHandler must be function!');
  assertString(group, 'group must be string!');
  assertString(targetType, 'targetType must be string!');
  assertNaturalNumber(maxDecorate, 'maxDecorate must be natural number!');
  assertNaturalNumber(minDecorate, 'minDecorate must be natural number!');

  DECORATORS_OPTION[decoratorName] = options;
  DECORATORS_GROUP[group] = _.union([decoratorName], DECORATORS_GROUP[group]);

  function middlewareHandler(target, name, descriptor, constructor, ...entryArgs) {
    assertTargetType(targetType, decoratorName, target, name, descriptor);

    beforeHandler(target, name, descriptor, constructor, decoratorName, ...entryArgs);

    constructor.decoratorRegister.lPush(name, decoratorName, { args: entryArgs, middleware });

    afterHandler(target, name, descriptor, constructor, decoratorName, ...entryArgs);
  }

  return function decorator(...entryArgs) {
    return decorate(middlewareHandler, ...entryArgs);
  };
}

export {
  DECORATORS_OPTION,
  DECORATORS_GROUP,
  decorate,
  toDecorator,
};
