import _ from 'lodash';

/**
 * OpenApi Specification 2.x
 * @link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
 */
export default class SwaggerApi {
  swagger = '2.0';
  info = {};
  host = '';
  basePath = '/api';
  schemes = ['http'];
  consumes = ['application/json'];
  produces = ['application/json'];
  paths = {};
  definitions = {};
  parameters = {};
  responses = {};
  securityDefinitions = {};
  security = [];
  tags = [];
  externalDocs = {};

  constructor(opts) {
    this.set(opts);
  }

  set(opts = {}) {
    _.merge(this, _.pick(opts, _.keys(this)));
    return this;
  }

  build() {
    return _.toPlainObject(this);
  }
}
