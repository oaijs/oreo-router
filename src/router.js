import _ from 'lodash';
import Router from 'koa-router';

import loadClass from './class-loader';
import SwaggerApi from './swagger-api';
import swaggerHTML from './swagger-html';
import debug from './util/debug';
import { oai2koaUrlJoin, urlJoin } from './util/route';

class OreoRouter extends Router {
  constructor(opts = {}) {
    debug('origin options:', opts);

    super({ prefix: opts.prefix });

    // router options
    this.options = {
      apiExplorerEnable: opts.apiExplorerEnable,

      // internal decorators middleware handler.
      // {decoratorName: middlewareWrapper}
      internalDecoratorHandlers: opts.internalDecoratorHandlers || {},

      // koa-router's options
      prefix: opts.prefix,
      // require-directory's options
      middleware: {
        dir: _.isString(opts.middleware) ? opts.middleware : opts.middleware.dir,
        include: _.isString(opts.middleware) ? null : opts.middleware.include,
        exclude: _.isString(opts.middleware) ? null : opts.middleware.exclude,
        recurse: _.isString(opts.middleware) ? null : opts.middleware.recurse,
      },
    };
    debug('really options:', this.options);

    // middlewares array
    this.middlewares = loadClass(this.options.middleware);
    debug('load middlewares:', this.middlewares);

    this.apiBuilder = new SwaggerApi();
  }

  /**
   * Returns router middleware which dispatches a route matching the request.
   * @public
   */
  routes() {
    if (!this.routesCalled) {
      this.registerRoutes();
      this.registerApiExplorerRoutes();
      this.routesCalled = true;
    }

    return super.routes();
  }

  /**
   * Wrap a middleware to decorator.
   * @public
   * @param {object} param0
   * @param {string} param0.decoratorName
   * @param {function} param0.middleware
   * @param {number} param0.maxDecorate
   * @param {function} param0.beforeHandler
   * @param {function} param0.afterHandler
   * @returns {function} decorator function
   */
  registerDecorator(opts) {
    const { decoratorName, middleware } = opts;
    this.options.internalDecoratorHandlers[decoratorName] = middleware;
  }

  /**
   * Find and register routes in classes middleware.
   * @private
   */
  registerRoutes() {
    const { prefix } = this.options;
    const { basePath } = this.apiBuilder.build();
    this.apiBuilder.set({ basePath: prefix ? urlJoin(prefix, basePath) : basePath });

    this.middlewares.forEach((middlewareClass) => {
      const { decoratorRegister, endpointRegister, middlewareRegister } = middlewareClass;

      debug(`${middlewareClass.name}.decoratorRegister:`, JSON.stringify(decoratorRegister, null, 2));
      debug(`${middlewareClass.name}.endpointRegister:`, JSON.stringify(endpointRegister, null, 2));
      debug(`${middlewareClass.name}.middlewareRegister:`, JSON.stringify(middlewareRegister, null, 2));

      this.apiBuilder.set({ paths: endpointRegister.toOpenApi() });
      this.registerRoutesInClass(basePath, middlewareClass);
    });
  }

  /**
   * Find and register routes in middleware class.
   * @private
   * @param {string} basePath
   * @param {class} middlewareClass
   */
  registerRoutesInClass(basePath, middlewareClass) {
    const { endpointRegister } = middlewareClass;
    const { baseRoute } = endpointRegister.storeGlobal;

    endpointRegister.each('store', (endpointMeta, functionName) => {
      const { method, subRoute, operationId } = endpointMeta;
      const route = oai2koaUrlJoin(basePath, baseRoute, subRoute);
      const debugMsg = `${middlewareClass.name}.${operationId}`;
      const middlewares = this.loadMiddlewaresFromClassFunction(middlewareClass, functionName);
      const middlewareSequence = [
        ...middlewares.classMiddlewaresBefore,
        ...middlewares.classMiddlewaresDecorator,
        ...middlewares.classMiddlewaresNow,
        ...middlewares.functionMiddlewareBefore,
        ...middlewares.functionMiddlewaresDecorator,
        ...middlewares.functionMiddlewareNow,
        Object.create(middlewareClass.prototype)[operationId],
        ...middlewares.functionMiddlewareAfter,
        ...middlewares.classMiddlewaresAfter,
      ];

      this.registerRoute(method, route, middlewareSequence, debugMsg);
    });
  }

  /**
   * Register a endpoint with middlewares
   * @private
   * @param {string} method HTTP method
   * @param {string} endpoint endpoint,route
   * @param {function[]} middlewares route's middleware
   * @param {string} debugMsg just for debug
   */
  registerRoute(method, endpoint, middlewares, debugMsg = '') {
    debug('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ register route ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓', '');
    debug(_.padEnd(method, 8), _.padEnd(debugMsg, 40), endpoint);
    debug('↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ register route ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑', '');

    this[_.toLower(method)](endpoint, ...middlewares);
  }

  /**
   * Register api-explorer's route.
   * @private
   */
  registerApiExplorerRoutes() {
    const apiDoc = this.apiBuilder.build();
    const apiExplorerHtml = swaggerHTML();
    const apiExplorerConfig = {
      urls: [{ name: 'api-doc', url: urlJoin(this.options.prefix, 'api.json') }],
      displayOperationId: true,
      displayRequestDuration: true,
    };

    if (!this.options.apiExplorerEnable) return;

    debug(`apiExplorer: ${urlJoin(this.options.prefix, 'api-explorer')}`);

    this.get('/api.json', (ctx) => {
      ctx.response.body = apiDoc;
    });

    this.get('/api-explorer-config.json', (ctx) => {
      ctx.response.body = apiExplorerConfig;
    });

    this.get('/api-explorer', (ctx) => {
      ctx.response.body = apiExplorerHtml;
    });
  }

  /**
   * Load middlewares from class by function name.
   * @private
   * @param {class} middlewareClass
   * @param {string} functionName
   * @returns {object} function's middleware object.
   */
  loadMiddlewaresFromClassFunction(middlewareClass, functionName) {
    const decoratorHandlers = this.options.internalDecoratorHandlers;
    const { decoratorRegister: decReg, middlewareRegister: midReg } = middlewareClass;

    return {
      classMiddlewaresBefore: midReg.getClassBeforeMiddlewares(),
      classMiddlewaresNow: midReg.getClassNowMiddlewares(),
      classMiddlewaresAfter: midReg.getClassAfterMiddlewares(),
      classMiddlewaresDecorator: decReg.getClassMiddlewares(functionName, decoratorHandlers),
      functionMiddlewareBefore: midReg.getBeforeMiddlewares(functionName),
      functionMiddlewareNow: midReg.getNowMiddlewares(functionName),
      functionMiddlewareAfter: midReg.getAfterMiddlewares(functionName),
      functionMiddlewaresDecorator: decReg.getFunctionMiddlewares(functionName, decoratorHandlers),
    };
  }
}

export {
  OreoRouter,
};
