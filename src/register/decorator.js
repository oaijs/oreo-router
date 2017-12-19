import _ from 'lodash';

import Register from './base';
import debug from '../util/debug';
import { assertDecorateTimes } from '../util/assert';

class DecoratorRegister extends Register {
  /**
   * Get the functionName's decorator middleware stack.
   * @private
   * @param {boolean} global
   * @param {string} functionName
   * @param {function} defaultMiddlewares
   */
  getMiddlewares(global, functionName, defaultMiddlewares) {
    const middlewareStack = [];

    this.eachDecorateOrder(global, functionName, (decoratorName, middleware, ...args) => {
      const defaultMiddleware = defaultMiddlewares[decoratorName];

      debug('decoratorName', decoratorName);
      debug('decoratorArgs', args);

      if (middleware) {
        middlewareStack.push(middleware(...args));
      } else if (defaultMiddleware) {
        middlewareStack.push(defaultMiddleware(...args));
      }
    });

    return middlewareStack;
  }

  /**
   * Iterates over orderGlobal or order of functionName's decorator
   * and invokes iteratee for each element.
   * @private
   * @param {boolean} global
   * @param {string} functionName
   * @param {function} handler
   */
  eachDecorateOrder(global, functionName, handler) {
    const decoratorCounter = {};
    const decoratorSequence = _.get(this, global ? 'orderGlobal' : `order.${functionName}`) || [];

    decoratorSequence.forEach((decoratorName) => {
      // Set decorate times to zero default.
      if (_.isUndefined(decoratorCounter[decoratorName])) {
        decoratorCounter[decoratorName] = 0;
      }

      // Get decorate args and middleware.
      const decoratorArgsArray = global ?
        this.get(decoratorName) :
        this.get(functionName, decoratorName);
      const { args, middleware } = _.get(decoratorArgsArray, decoratorCounter[decoratorName]) || {};

      handler(decoratorName, middleware, ...args);

      // Count decorator.
      decoratorCounter[decoratorName] += 1;
    });

    assertDecorateTimes(global, decoratorCounter);
  }

  /**
   * Get middleware sequences of class.
   * @public
   * @param {string} functionName
   * @param {object} defaultMiddlewares
   * @returns {function[]}
   */
  getClassMiddlewares(functionName, defaultMiddlewares) {
    return this.getMiddlewares(true, functionName, defaultMiddlewares);
  }

  /**
   * Get middleware sequences of class function.
   * @param {string} functionName
   * @param {object} defaultMiddlewares
   * @returns {function[]}
   */
  getFunctionMiddlewares(functionName, defaultMiddlewares) {
    return this.getMiddlewares(false, functionName, defaultMiddlewares);
  }
}

export default DecoratorRegister;
