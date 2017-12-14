import _ from 'lodash';

// import debug from '../util/debug';

class Register {
  constructor(options = {}) {
    this.options = options;

    this.store = {};
    this.storeGlobal = {};

    this.order = [];
    this.orderGlobal = [];
  }

  getAll() {
    return this.store;
  }

  each(path, handler) {
    _.each(_.get(this, path), handler);
  }

  set(...args) {
    if (args.length === 3 && !_.isUndefined(args[0])) {
      this.setScope(...args);
    } else if (args.length === 3 && _.isUndefined(args[0])) {
      this.setGlobal(args[1], args[2]);
    } else if (args.length === 2) {
      this.setGlobal(args[0], args[1]);
    }
  }

  setScope(scopeName, keyword, value) {
    // debug('setScope:', scopeName, keyword, value);
    const oldValue = this.store[scopeName];
    const newValue = _.set({}, keyword, value);
    this.store[scopeName] = _.merge({}, oldValue, newValue);
  }

  setGlobal(keyword, value) {
    // debug('setGlobal:', keyword, value);
    this.storeGlobal[keyword] = value;
  }

  get(...args) {
    if (args.length === 2 && !_.isUndefined(args[0])) {
      return this.getScope(...args);
    } else if (args.length === 2 && _.isUndefined(args[0])) {
      return this.getGlobal(args[1]);
    } else if (args.length === 1) {
      return this.getGlobal(...args);
    }

    return null;
  }

  getScope(scopeName, keyword) {
    // debug('getScope', scopeName, keyword);
    return _.get(this.store, `${scopeName}.${keyword}`);
  }

  getGlobal(keyword) {
    // debug('getGlobal', keyword);
    return _.get(this.storeGlobal, keyword);
  }

  lPush(...args) {
    if (args.length === 3 && !_.isUndefined(args[0])) {
      this.lPushScope(...args);
    } else if (args.length === 3 && _.isUndefined(args[0])) {
      this.lPushGlobal(args[1], args[2]);
    } else if (args.length === 2) {
      this.lPushGlobal(args[0], args[1]);
    }
  }

  lPushScope(scopeName, keyword, value) {
    // debug('lPushScope:', scopeName, keyword, value);

    const oldValue = this.get(scopeName, keyword);
    const newValue = _.compact(_.union([value], oldValue));

    this.setScope(scopeName, keyword, newValue);
    this.setScopeOrder(scopeName, keyword);

    return newValue;
  }

  lPushGlobal(keyword, value) {
    // debug('lPushGlobal:', keyword, value);

    const oldValue = this.get(keyword);
    const newValue = _.compact(_.union([value], oldValue));

    this.setGlobal(keyword, newValue);
    this.setGlobalOrder(keyword);
  }

  setScopeOrder(functionName, decoratorName) {
    const oldOrder = this.order[functionName];
    const newOrder = _.compact(_.concat([decoratorName], oldOrder));
    this.order[functionName] = newOrder;
  }

  setGlobalOrder(value) {
    const newOrder = _.compact(_.concat(value, this.orderGlobal));
    this.orderGlobal = newOrder;
  }

}

export default Register;
