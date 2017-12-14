import _ from 'lodash';
import isClass from 'is-class';
import requireDir from 'require-directory';
import path from 'path';

import debug from './util/debug';

let modules = [];

/**
 * Filter decorated class.
 * @param {object[]} classes
 */
function filterClass(classes) {
  const filters = _.map(_.compact(classes), (claxx) => {
    if (
      _.isObject(claxx.middlewareRegister) &&
      _.isObject(claxx.endpointRegister) &&
      _.isObject(claxx.decoratorRegister)
    ) return claxx;

    console.warn(`Class:${claxx.name} is not decorated by Middleware or other decorator!`);
    return null;
  });

  return _.compact(filters);
}

/**
 * Record require loaded module and valid class in module.
 * @param {object} obj
 */
function visitor(obj) {
  let classes = [];

  // May be babel `export default`.
  // May be class directly.
  // May be `export {classA, classB}`.
  if (isClass(obj.default) && _.isEqual(_.keys(obj), ['default'])) {
    classes = [obj.default];
  } else if (isClass(obj)) {
    classes = [obj];
  } else if (_.isObject(obj)) {
    classes = _.map(obj, (middlewareClass) => {
      return isClass(middlewareClass) ? middlewareClass : null;
    });
  }

  modules = _.union(modules, filterClass(classes));

  return obj;
}

/**
 * Load decorated classes from directory.
 * Invalid class will not be loaded with a console.warn.
 * Options: https://github.com/troygoode/node-require-directory#options
 * @param {object} param0
 * @param {string} param0.dir
 * @param {string} param0.include
 * @param {string} param0.exclude
 * @param {string} param0.recurse
 * @returns {class[]} middleware classes array.
 */
function load({ dir, include, exclude, recurse = true }) {
  const options = {
    include,
    exclude,
    recurse,
    visit: visitor,
  };
  const absoluteDir = path.resolve(process.cwd(), dir);

  debug('load options:', absoluteDir, options);
  requireDir(module, absoluteDir, options);

  return modules;
}

export default load;
