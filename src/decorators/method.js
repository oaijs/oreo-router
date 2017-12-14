import { assertPath } from '../util/assert';
import { toDecorator } from './helper/decorate';
import { koa2oai } from '../util/route';

function beforeHandler(target, name, descriptor, constructor, decoratorName, ...args) {
  const method = decoratorName;
  const [subRoute] = [...args];

  assertPath(subRoute, decoratorName);

  constructor.endpointRegister.set(name, 'method', method);
  constructor.endpointRegister.set(name, 'operationId', name);
  constructor.endpointRegister.set(name, 'subRoute', koa2oai(subRoute));
}

const Get = toDecorator({
  name: 'Get',
  maxDecorate: 1,
  beforeHandler,
});

const Post = toDecorator({
  name: 'Post',
  maxDecorate: 1,
  beforeHandler,
});

const Delete = toDecorator({
  name: 'Delete',
  maxDecorate: 1,
  beforeHandler,
});

const Put = toDecorator({
  name: 'Put',
  maxDecorate: 1,
  beforeHandler,
});

const Patch = toDecorator({
  name: 'Patch',
  maxDecorate: 1,
  beforeHandler,
});

export {
  Get,
  Post,
  Delete,
  Put,
  Patch,
};
