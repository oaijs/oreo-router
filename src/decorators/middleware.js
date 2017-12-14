import { assertPath } from '../util/assert';
import { toDecorator } from './helper/decorate';

function beforeHandler(target, name, descriptor, constructor, decoratorName, baseRoute) {
  assertPath(baseRoute, decoratorName);

  constructor.endpointRegister.set(name, 'baseRoute', baseRoute);
}

const Middleware = toDecorator({
  name: 'Middleware',
  maxDecorate: 1,
  beforeHandler,
});

export {
  Middleware,
};
