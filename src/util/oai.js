import _ from 'lodash';

import { urlJoin } from './route';

const parameterKeys = [
  'query',
  'param',
  'body',
  'formData',
  'header',
];

const operationKeys = [
  'tags',
  'summary',
  'description',
  'externalDocs',
  'operationId',
  'consumes',
  'produces',
  'parameters',
  'responses',
  'schemes',
  'deprecated',
  'security',
];

/**
 * Convert to OpenAPI path of _.get(obj, path).
 * {
 *   /api/xxx: {
 *     get: {
 *       xxx
 *     }
 *   }
 * }
 * toOaiOperationPath('get', '/api/xxx') ==> '/api/xxx.get'
 * @param {string} method get,post,put,patch,delete. etc http verp.
 * @param {string[]} urlSegment url segments.
 * @returns {string} path.
 */
function formatOperationPath(method, ...urlSegment) {
  return `${urlJoin(...urlSegment)}.${_.lowerCase(method)}`;
}

/**
 * Convert api meta from object query,param,body,formData,header to array.
 * {
 *   query: [],
 *   param: [],
 *   body: [],
 *   formData: [],
 *   header: [],
 * } ==> [...query, ...param, ...body, ...formData, ...header]
 * @param {object} meta
 */
function unionParameters(meta) {
  return _.union(..._.at(meta, parameterKeys));
}

/**
 * Convert meta of middleware classs function to OpenApi operation meta.
 * @param {string} functionName
 * @param {object} functionMeta
 * @returns {object}
 */
function funMeta2OAIOperation(functionName, functionMeta) {
  const spec = _.pick(functionMeta, operationKeys);

  spec.operationId = functionName;
  spec.parameters = unionParameters(functionMeta);

  return spec;
}

/**
 * Merge paths of middleware classs.
 * @param {object} oldPaths
 * @param {string} operationPath
 * @param {object} operationMeta
 * @returns {object}
 */
function mergeNewPaths(oldPaths, operationPath, operationMeta) {
  return _.merge(oldPaths, _.set({}, operationPath, operationMeta));
}

export {
  formatOperationPath,
  unionParameters,
  mergeNewPaths,
  funMeta2OAIOperation,
};
