import _ from 'lodash';
import assert from 'assert';
import Ajv from 'ajv-oai';
import isClass from 'is-class';

import swaggerSchema from './openapi-schema-2.0.json';

/**
 * Check int is integer.
 * @param {number} int
 * @param {string} msg
 */
function assertInteger(int, msg = 'must be integer.') {
  assert(_.isInteger(int), msg);
}

/**
 * Check str is string.
 * @param {string} str
 * @param {string} msg
 */
function assertString(str, msg = 'must be string.') {
  assert(_.isString(str), msg);
}

/**
 * Check fun is function.
 * @param {function} fun
 * @param {string} msg
 */
function assertFunction(fun, msg = 'must be function.') {
  assert(_.isFunction(fun), msg);
}

/**
 * Check target is a class.
 * @param {function} target
 * @param {string} decoratorName
 */
function assertDecClass(target, name, descriptor, decoratorName) {
  const msg = `[${decoratorName}] must decorate class.`;
  assert(name === undefined, msg);
  assert(descriptor === undefined, msg);
  assert(isClass(target), msg);
}

/**
 * Check target is not class.
 * @param {function} target
 * @param {string} decoratorName
 */
function assertDecFun(target, name, descriptor, decoratorName) {
  const msg = `[${decoratorName}] must decorate class member function.`;
  assert(name !== undefined, msg);
  assert(descriptor !== undefined, msg);
  assert(!isClass(target), msg);
}

/**
 * Check decorator decorate times is valid.
 * @param {function} constructor
 * @param {string} name
 * @param {string} decoratorName
 * @param {number} maxDecorate
 */
function assertMaxDecorate(constructor, name, decoratorName, maxDecorate) {
  const decoratedArgs = constructor.decoratorRegister.get(name, decoratorName);
  const assertMsg = `@${decoratorName} max decorate ${constructor.name}${name ? '.' : ''}${name || ''} ${maxDecorate} times.`;
  assert(decoratedArgs.length <= maxDecorate, assertMsg);
}

/**
 * Check the data is valid by schemaPath.
 * @param {string} schemaPath
 * @param {object} data
 */
function assertOAISchema(schemaPath, data, decoratorName = '') {
  const ajv = new Ajv({ useDefaults: false });
  const schema = {
    type: 'object',
    properties: {
      data: _.get(swaggerSchema, schemaPath),
    },
    definitions: swaggerSchema.definitions,
  };
  const ret = ajv.validate(schema, { data });
  const errMsg = _.get(ajv.errors, '0.message', ajv.errorsText());

  assert(ret, `@${decoratorName}(${JSON.stringify(data)}) ${errMsg}`);
}

/**
 * Check schema of operation field is valid.
 * @param {string} field
 * @param {object} data
 */
function assertOperation(field, data, decoratorName) {
  assertOAISchema(`definitions.operation.properties.${field}`, data, decoratorName);
}

/**
 * Check query,body,path,formData,header schema is valid.
 * @param {object} data
 */
function assertParameter(data, decoratorName) {
  assertOAISchema('definitions.parametersList', data, decoratorName);
}

/**
 * Check path is valid path segment
 * @param {string} path
 */
function assertPath(path, decoratorName) {
  assert(_.isString(path) && _.startsWith(path, '/'), `@${decoratorName}(${path}) must be string and start with /`);
}

export {
  assertInteger,
  assertString,
  assertFunction,
  assertDecClass,
  assertDecFun,
  assertMaxDecorate,
  assertPath,
  assertOAISchema,
  assertOperation,
  assertParameter,
};
