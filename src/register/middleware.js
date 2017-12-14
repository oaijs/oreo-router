import Register from './base';

class MiddlewareRegister extends Register {
  getBeforeMiddlewares(functionName) {
    return this.get(functionName, 'before') || [];
  }

  getNowMiddlewares(functionName) {
    return this.get(functionName, 'now') || [];
  }

  getAfterMiddlewares(functionName) {
    return this.get(functionName, 'after') || [];
  }

  getClassBeforeMiddlewares() {
    return this.get('before') || [];
  }

  getClassNowMiddlewares() {
    return this.get('now') || [];
  }

  getClassAfterMiddlewares() {
    return this.get('after') || [];
  }
}

export default MiddlewareRegister;
