import { toDecorator } from './helper/decorate';

function beforeHandlerWrap(type) {
  return function beforeHandler(target, name, descriptor, constructor, decoratorName, ...args) {
    if (name && descriptor) {
      // Decorating target is function
      constructor.middlewareRegister.lPush(name, type, ...args);
    } else {
      // Decorating target is class
      constructor.middlewareRegister.lPush(type, ...args);
    }
  };
}

const UseBefore = toDecorator({
  name: 'UseBefore',
  maxDecorate: Number.MAX_SAFE_INTEGER,
  beforeHandler: beforeHandlerWrap('before'),
});

const Use = toDecorator({
  name: 'Use',
  maxDecorate: Number.MAX_SAFE_INTEGER,
  beforeHandler: beforeHandlerWrap('now'),
});

const UseAfter = toDecorator({
  name: 'UseAfter',
  maxDecorate: Number.MAX_SAFE_INTEGER,
  beforeHandler: beforeHandlerWrap('after'),
});

export {
  UseBefore,
  Use,
  UseAfter,
};
