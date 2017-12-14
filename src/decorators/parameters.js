import _ from 'lodash';
import { jsonSchemaToParameters } from 'jsonschema-oai-parameters';

import { assertDecFun, assertParameter } from '../util/assert';
import { toDecorator } from './helper/decorate';

function beforeHandler(target, name, descriptor, constructor, decoratorName, ...args) {
  const keyword = _.camelCase(decoratorName);
  const { parameters } = jsonSchemaToParameters(keyword, args[0]);

  assertDecFun(target, name, descriptor, decoratorName);
  assertParameter(parameters, decoratorName);

  constructor.endpointRegister.set(name, keyword, parameters);
}

const Query = toDecorator({
  name: 'Query',
  maxDecorate: 1,
  beforeHandler,
});

const Body = toDecorator({
  name: 'Body',
  maxDecorate: 1,
  beforeHandler,
});

const FormData = toDecorator({
  name: 'FormData',
  maxDecorate: 1,
  beforeHandler,
});

const Param = toDecorator({
  name: 'Param',
  maxDecorate: 1,
  beforeHandler,
});

const Header = toDecorator({
  name: 'Header',
  maxDecorate: 1,
  beforeHandler,
});

export {
  Query,
  Body,
  FormData,
  Param,
  Header,
};
