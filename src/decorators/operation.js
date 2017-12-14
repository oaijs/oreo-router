import _ from 'lodash';

import { assertDecFun, assertOperation } from '../util/assert';
import { toDecorator } from './helper/decorate';

function beforeHandler(target, name, descriptor, constructor, decoratorName, ...args) {
  const keyword = _.camelCase(decoratorName);

  assertDecFun(target, name, descriptor, decoratorName);
  assertOperation(keyword, args[0], decoratorName);

  constructor.endpointRegister.set(name, keyword, ...args);
}

const Summary = toDecorator({
  name: 'Summary',
  maxDecorate: 1,
  beforeHandler,
});

const Deprecated = toDecorator({
  name: 'Deprecated',
  maxDecorate: 1,
  beforeHandler,
});

const Description = toDecorator({
  name: 'Description',
  maxDecorate: 1,
  beforeHandler,
});

const Tags = toDecorator({
  name: 'Tags',
  maxDecorate: 1,
  beforeHandler,
});

const Consumes = toDecorator({
  name: 'Consumes',
  maxDecorate: 1,
  beforeHandler,
});

const Produces = toDecorator({
  name: 'Produces',
  maxDecorate: 1,
  beforeHandler,
});

const Schemes = toDecorator({
  name: 'Schemes',
  maxDecorate: 1,
  beforeHandler,
});

const Responses = toDecorator({
  name: 'Responses',
  maxDecorate: 1,
  beforeHandler,
});

const ExternalDocs = toDecorator({
  name: 'ExternalDocs',
  maxDecorate: 1,
  beforeHandler,
});

export {
  Summary,
  Deprecated,
  Description,
  Tags,
  Consumes,
  Produces,
  Schemes,
  Responses,
  ExternalDocs,
};