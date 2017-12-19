import _ from 'lodash';
import assert from 'assert';
import Ajv from 'ajv-oai';
import isClass from 'is-class';

import swaggerSchema from './openapi-schema-2.0.json';
import { DECORATORS_OPTION, DECORATORS_GROUP } from '../../decorators/helper/decorate';

/**
 * Check int is natural number.
 * @param {number} int
 * @param {string} msg
 */
function assertNaturalNumber(int, msg = 'must be a natural number.') {
  assert(_.isInteger(int) && int >= 0, msg);
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
 * Check is decorating class or class member function.
 * @param {object} target
 * @param {string} name
 * @param {object} descriptor
 * @param {string} decoratorName
 */
function assertDec(target, name, descriptor, decoratorName) {
  const msg = `[${decoratorName}] must decorate class or class member function.`;

  function isDecClass() {
    return isClass(target) && name === undefined && descriptor === undefined;
  }

  function isDecMethod() {
    return !isClass(target) && name !== undefined && descriptor !== undefined;
  }

  assert(isDecClass() || isDecMethod(), msg);
}

/**
 * Check decorator decorate times is valid.
 * @param {string} decoratorName
 * @param {number} minDecorate
 * @param {number} maxDecorate
 * @param {string[]} groups
 * @param {object} decoratorCounter
 */
function assertDecorateTimesSingle(decoratorName, minDecorate, maxDecorate, groups, decoratorCounter) {
  function getGroupsStatus(groupsArray) {
    return _.sumBy(groupsArray, (decName) => {
      return decoratorCounter[decName];
    }) || 0;
  }

  const count = getGroupsStatus(groups);
  const assertMsg = `${groups.join(' or ')} decorate times is ${count}, not in range: ${minDecorate} - ${maxDecorate}`;
  assert(minDecorate <= count && count <= maxDecorate, assertMsg);
}

/**
 * Check decorator decorate times is valid by decoratorCounter.
 * @param {boolean} global
 * @param {object} decoratorCounter
 */
function assertDecorateTimes(global, decoratorCounter) {
  _.each(DECORATORS_OPTION, (decoratorOpts, decoratorName) => {
    const {
      group = decoratorName,
      targetType = 'any',
      maxDecorate = 1,
      minDecorate = 0,
      } = decoratorOpts;
    const groups = DECORATORS_GROUP[group || decoratorName];


    if (global && (targetType === 'any' || targetType === 'class')) {
      assertDecorateTimesSingle(decoratorName, minDecorate, maxDecorate, groups, decoratorCounter);
    } else if (!global && targetType === 'function') {
      assertDecorateTimesSingle(decoratorName, minDecorate, maxDecorate, groups, decoratorCounter);
    }
  });
}

/**
 * Check decorated target type is valid.
 * @param {string} targetType
 * @param {string} decoratorName
 * @param {object} target
 * @param {string} name
 * @param {object} descriptor
 */
function assertTargetType(targetType, decoratorName, target, name, descriptor) {
  if (targetType === 'class') {
    assertDecClass(target, name, descriptor, decoratorName);
  } else if (targetType === 'function') {
    assertDecFun(target, name, descriptor, decoratorName);
  } else if (targetType === 'any') {
    assertDec(target, name, descriptor, decoratorName);
  } else {
    assert(false, `targetType of decorator ${decoratorName} must be one of any,class,function!`);
  }
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
  assertNaturalNumber,
  assertString,
  assertFunction,
  assertDecClass,
  assertDecFun,
  assertDec,
  assertDecorateTimesSingle,
  assertDecorateTimes,
  assertTargetType,
  assertPath,
  assertOAISchema,
  assertOperation,
  assertParameter,
};
