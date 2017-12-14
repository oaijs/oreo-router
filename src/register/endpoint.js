import Register from './base';
import { formatOperationPath, funMeta2OAIOperation, mergeNewPaths } from '../util/oai';

class EndpointRegister extends Register {
  toOpenApi() {
    const subPaths = {};
    const baseRoute = this.storeGlobal.baseRoute;

    this.each('store', (functionMeta, functionName) => {
      const { method, subRoute } = functionMeta;
      const operationPath = formatOperationPath(method, baseRoute, subRoute);
      const operationData = funMeta2OAIOperation(functionName, functionMeta);

      mergeNewPaths(subPaths, operationPath, operationData);
    });

    return subPaths;
  }
}

export default EndpointRegister;
