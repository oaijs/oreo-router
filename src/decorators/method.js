import { assertPath } from '../util/assert';
import { toDecorator } from './helper/decorate';
import { koa2oai } from '../util/route';

function beforeHandler(target, name, descriptor, constructor, decoratorName, subRoute) {
  const method = decoratorName;

  assertPath(subRoute, decoratorName);

  constructor.endpointRegister.set(name, 'method', method);
  constructor.endpointRegister.set(name, 'operationId', name);
  constructor.endpointRegister.set(name, 'subRoute', koa2oai(subRoute));
}

const Get = toDecorator({
  name: 'Get',
  group: 'method',
  minDecorate: 1,
  maxDecorate: 1,
  targetType: 'function',
  beforeHandler,
});

const Post = toDecorator({
  name: 'Post',
  group: 'method',
  minDecorate: 1,
  maxDecorate: 1,
  targetType: 'function',
  beforeHandler,
});

const Delete = toDecorator({
  name: 'Delete',
  group: 'method',
  minDecorate: 1,
  maxDecorate: 1,
  targetType: 'function',
  beforeHandler,
});

const Put = toDecorator({
  name: 'Put',
  group: 'method',
  minDecorate: 1,
  maxDecorate: 1,
  targetType: 'function',
  beforeHandler,
});

const Patch = toDecorator({
  name: 'Patch',
  group: 'method',
  minDecorate: 1,
  maxDecorate: 1,
  targetType: 'function',
  beforeHandler,
});

export {
  Get,
  Post,
  Delete,
  Put,
  Patch,
};
