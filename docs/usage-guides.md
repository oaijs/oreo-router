[oai2.0-schema]: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#schema

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=3 orderedList=false} -->
<!-- code_chunk_output -->

* [为OpenApi设置基础信息](#为openapi设置基础信息)
	* [编写入口文件](#编写入口文件)
	* [编写业务接口类](#编写业务接口类)
	* [体验api-explorer](#体验api-explorer)
	* [测试接口](#测试接口)
* [为内置装饰器配置中间件](#为内置装饰器配置中间件)
	* [编写入口文件](#编写入口文件-1)
	* [编写业务接口类](#编写业务接口类-1)
	* [编写装饰器处理器](#编写装饰器处理器)
	* [测试接口](#测试接口-1)
		* [请求携带name参数](#请求携带name参数)
		* [请求未携带name参数](#请求未携带name参数)
* [Koa中间件的使用](#koa中间件的使用)
	* [编写入口文件](#编写入口文件-2)
	* [编写koa中间件](#编写koa中间件)
	* [编写业务接口类](#编写业务接口类-2)
	* [测试接口](#测试接口-2)
		* [请求未使用中间件的接口](#请求未使用中间件的接口)
		* [请求使用中间件的接口](#请求使用中间件的接口)
* [装饰器的自定义](#装饰器的自定义)
	* [编写入口文件](#编写入口文件-3)
	* [编写装饰器](#编写装饰器)
	* [编写业务接口类](#编写业务接口类-3)
	* [测试接口](#测试接口-3)
* [装饰器中间件的执行顺序](#装饰器中间件的执行顺序)
	* [编写入口文件](#编写入口文件-4)
	* [编写中间件](#编写中间件)
	* [编写装饰器](#编写装饰器-1)
	* [编写内置装饰器处理器](#编写内置装饰器处理器)
	* [编写业务接口类](#编写业务接口类-4)
	* [测试接口](#测试接口-4)

<!-- /code_chunk_output -->

---

[例子源代码](https://github.com/BiteBit/oreo-router-examples)

---

# 为OpenApi设置基础信息
有时候我们需要为OpenAPI设置一些描述信息，比如说设置API的版本，联系人信息。我们可以通过设置Router的**api**选项来预设一些信息。更多支持预设的字段以及数据结构请参考[OpenAPI2.0 Schema][oai2.0-schema]。

## 编写入口文件
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

const app = new Koa();

const router = new OreoRouter({
  api: {
    // API基础信息
    info: {
      // API文档的标题
      title: 'title',
      // API文档的描述
      description: 'description',
      // API文档的版本信息
      version: '1.0.0',
      // API文档的联系人信息
      contact: {
        // 联系人/组织的姓名
        name: 'API Support',
        // 联系人/组织的主页地址
        url: 'http://www.swagger.io/support',
        // 联系人/组织的邮箱
        email: 'support@swagger.io',
      },
    },
  },
  apiExplorerEnable: true,
  middleware: {
    dir: './controllers',
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## 编写业务接口类
```js
// controllers/hello.js

import {
  Middleware,   // Mean this is a api class.
  Get,          // A definition of a GET operation on this path.
  Summary,      // A short summary of what the operation does.
  Description,  // A verbose explanation of the operation behavior.
  Tags,         // A list of tags for API documentation control. Tags can be used for logical
  Query,        // Parameters that are appended to the URL. For example, in /items?id=###, the query parameter is id.
  Responses,    // The list of possible responses as they are returned from executing this operation.
} from 'oreo-router';

@Middleware('/hello')
export default class ExampleController {
  @Get('/')
  @Summary('hello')
  @Description('oreo-router is awesome!')
  @Tags(['example'])
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  hello(ctx, next) {
    ctx.response.body = `hello world! ${ctx.request.query.name}`;
  }
}
```

## 体验api-explorer
现在你就可以使用api-explorer，可以看到预设的API基础信息以及API信息了。
![hello-world](/docs/config-openapi.png)

## 测试接口
```sh
> curl -X GET "http://127.0.0.1:3000/api/hello?name=bitebit" -H "accept: application/json"
> hello world! bitebit
```

# 为内置装饰器配置中间件
在项目实践中，我们经常需要使用表单校验功能，检查某个入参是否符合特定的条件，检验通过之后才交由后续中间件处理。比如说我们现在需要增加query表单校验功能，那么我们可以为Query装饰器设置处理器中间件，来进行表单校验。提示：**如果想在最开始的时候校验表单，那么Query装饰器应当使用的尽量靠前**。关于装饰器中间件的执行顺序问题，请参考后文[《装饰器中间件的执行顺序》](#装饰器中间件的执行顺序)。

## 编写入口文件
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

import queryMiddlewareWrapper from './decorator-middleware/query';

const app = new Koa();

const router = new OreoRouter({
  apiExplorerEnable: true,
  internalDecoratorHandlers: {
    // 为内置装饰器Query配置处理器中间件
    Query: queryMiddlewareWrapper,
  },
  middleware: {
    dir: './controllers',
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## 编写业务接口类
```js
// controllers/hello.js

import {
  Middleware,
  Get,
  Summary,
  Description,
  Tags,
  Query,
  Responses,
} from 'oreo-router';

@Middleware('/hello')
export default class ExampleController {
  @Get('/')
  @Summary('hello')
  @Description('oreo-router is awesome!')
  @Tags(['example'])
  // 装饰器Query的参数将会被传递给上一步配置的中间件处理器中。
  // 接口入参必须包含一个name字段。
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  //  返回hellow world {{name}}
  hello(ctx, next) {
    ctx.response.body = `hello world! ${ctx.request.query.name}`;
  }
}
```

## 编写装饰器处理器
```js
// querySchema 为装饰器Query的参数
// 如果name是必须字段且query入参不包含name，那么提示“Please enter name”
// 否者校验通过
export default function queryMiddlewareWrapper(querySchema) {
  return async (ctx, next) => {
    if (querySchema.name.required === true) {
      if (!ctx.request.query.name) {
        ctx.throw(400, 'Please enter name');
      } else {
        await next();
      }
    } else {
      await next();
    }
  };
}
```

## 测试接口
### 请求携带name参数
```sh
> curl -X GET "http://127.0.0.1:3000/api/hello?name=bitebit" -H "accept: application/json"
> hello world! bitebit
```
提示”hello world! bitebit“，说明表单校验通过，业务中间件处理了请求。

### 请求未携带name参数
```sh
> curl -X GET "http://127.0.0.1:3000/api/hello" -H "accept: application/json"
> Please enter name
```
提示“Please enter name“，说明表单校验未通过，我们成功了。

# Koa中间件的使用
Koa生态有大量好用的中间件，如果不能使用的话，那是非常遗憾的。我们提供了**UseBefore**，**Use**，**UseAfter**装饰器可以便捷的将koa原生中间件引入进来。**UseBefore**，**Use**，**UseAfter**不仅可以应用在类的方法上来挂载到指定方法的前后，还可以应用在类上来挂载到该类所有的方法前后。

## 编写入口文件
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

const app = new Koa();

const router = new OreoRouter({
  apiExplorerEnable: true,
  middleware: {
    dir: './controllers',
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## 编写koa中间件
```js
// ./middlewares/logger.js

export default async function (ctx, next) {
  const path = ctx.path;
  const method = ctx.method;

  console.log(`-> ${new Date().toISOString()} ${method} ${path}`);

  await next();

  console.log(`<- ${new Date().toISOString()} ${method} ${path}`);
}
```

## 编写业务接口类
```js
// ./controllers/hello.js

import {
  Middleware,
  Use,
  Get,
  Summary,
  Description,
  Tags,
  Query,
  Responses,
} from 'oreo-router';

import logger from '../middlewares/logger';

@Middleware('/hello')
export default class ExampleController {
  @Get('/log')
  @Summary('hello')
  @Description('oreo-router is awesome!')
  @Tags(['example'])
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  @Use(logger)
  log(ctx, next) {
    ctx.response.body = `hello world! ${ctx.request.query.name}`;
  }

  @Get('/no-log')
  @Summary('hello but no log')
  @Description('oreo-router is awesome!')
  @Tags(['example'])
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  nolog(ctx, next) {
    ctx.response.body = `hello world! ${ctx.request.query.name}`;
  }
}
```

## 测试接口
### 请求未使用中间件的接口
```sh
> curl curl -X GET "http://127.0.0.1:3000/api/hello/no-log?name=bitebit" -H "accept: application/json"
> hello world! bitebit
```

服务器控制台未输出任何请求日志
```sh
>
```

### 请求使用中间件的接口
```sh
> curl -X GET "http://127.0.0.1:3000/api/hello/log?name=bitebit" -H "accept: application/json"
>
```

服务器控制台输出请求如下日志
```sh
> -> 2017-12-15T13:18:12.678Z GET /api/hello/log
> <- 2017-12-15T13:18:12.681Z GET /api/hello/log
```

# 装饰器的自定义
## 编写入口文件
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

const app = new Koa();

const router = new OreoRouter({
  apiExplorerEnable: true,
  middleware: {
    dir: './controllers',
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## 编写装饰器
```js
// ./decorators/logger.js

import { toDecorator } from 'oreo-router';

export default toDecorator({
  name: 'Log',
  middleware: (label) => {
    return async (ctx, next) => {
      const path = ctx.path;
      const method = ctx.method;

      console.log(`${label} -> ${new Date().toISOString()} ${method} ${path}`);

      await next();

      console.log(`${label} <- ${new Date().toISOString()} ${method} ${path}`);
    };
  },
});
```

## 编写业务接口类
```js
// ./controllers/hello.js

import {
  Middleware,
  Get,
  Summary,
  Description,
  Tags,
  Query,
  Responses,
} from 'oreo-router';

import Log from '../decorators/logger';

@Middleware('/hello')
export default class ExampleController {
  @Get('/')
  @Summary('hello')
  @Description('oreo-router is awesome!')
  @Tags(['example'])
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  @Log('hello logger...')
  hello(ctx, next) {
    ctx.response.body = `hello world! ${ctx.request.query.name}`;
  }
}
```

## 测试接口
```sh
> curl http://127.0.0.1:3000/api/hello?name=name
> hello logger... -> 2017-12-15T13:28:50.398Z GET /api/hello
> hello logger... <- 2017-12-15T13:28:50.399Z GET /api/hello
```

# 装饰器中间件的执行顺序
装饰器中间件的调用顺序分为外序和内序，但是无论是外序还是内序，都是由上至下先后调用的。
外序指的是**UseBefore**、**Use**、**UseAfter**、**Decorator(泛指其他装饰器)** 四者之间的顺序关系。
内序指的是**UseBefore**、**Use**、**UseAfter**、**Decorator(泛指其他装饰器)** 同时装饰一个方法时与自己的顺序关系，比如两个**UseBefore**同时装饰一个方法的时候，在前面的**UseBefore**先执行。

![call](/docs/call-sequences.png)

## 编写入口文件
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

import { queryMiddlewareWrapper } from './decorators/query';

const app = new Koa();

const router = new OreoRouter({
  apiExplorerEnable: true,
  middleware: {
    dir: './controllers',
  },
  internalDecoratorHandlers: {
    Query: queryMiddlewareWrapper,
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## 编写中间件
```js
// ./middlewares/log.js

export default function log(label) {
  return (ctx, next) => {
    console.log(label);

    return next();
  };
}
```

## 编写装饰器
```js
// ./decorators/cache.js

import { toDecorator } from 'oreo-router';

export default toDecorator({
  name: 'Cache',
  maxDecorate: 10,
  middleware: (label) => {
    return (ctx, next) => {
      console.log(label);

      return next();
    };
  },
});
```

## 编写内置装饰器处理器
```js
// ./decorators/query.js

import { toDecorator } from 'oreo-router';

function queryMiddlewareWrapper(querySchema) {
  return async (ctx, next) => {
    console.log('Decorator Query', querySchema);

    await next();
  };
}

const Query = toDecorator({
  name: 'Query',
  maxDecorate: 1,
  middleware: queryMiddlewareWrapper,
});

export {
  queryMiddlewareWrapper,
  Query,
};
```

## 编写业务接口类
```js
// ./controllers/hello.js

import {
  Middleware,
  Get,
  Summary,
  Description,
  Tags,
  Query,
  Responses,
  UseBefore,
  Use,
  UseAfter,
} from 'oreo-router';

import Cache from '../decorators/cache';
import logger from '../middlewares/log';

@Middleware('/hello')
@Cache('Decorator Class')
@UseBefore(logger('UseBefore Class '))
@Use(logger('Use Class'))
@UseAfter(logger('UseAfter Class'))
export default class ExampleController {
  @Get('/')
  @Summary('hello')
  @Description('oreo-router is awesome!')
  @Cache('Decorator function 0')
  @Tags(['example'])
  @Query({
    name: {
      type: 'string',
      required: true,
    },
  })
  @Cache('Decorator function 1')
  @Responses({
    200: {
      description: 'Request success.',
    },
  })
  @Cache('Decorator function 2')
  @UseBefore(logger('UseBefore Class function'))
  @Use(logger('Use Class function'))
  @UseAfter(logger('UseAfter Class function'))
  hello(ctx, next) {
    console.log('hello world!');
    ctx.response.body = `hello world! ${ctx.request.query.name}`;

    return next();
  }
}
```

## 测试接口
```sh
> curl -X GET "http://127.0.0.1:3000/api/hello?name=bitebit" -H "accept: application/json"
> hello world! bitebit
```

服务器控制台输出如下：
```sh
> UseBefore Class
> Decorator Class
> Use Class
> UseBefore Class function
> Decorator function 0
> Decorator Query { name: { type: 'string', required: true } }
> Decorator function 1
> Decorator function 2
> Use Class function
> hello world!
> UseAfter Class function
> UseAfter Class
```