[koa]: https://github.com/koajs/koa
[koa-router]: https://github.com/alexmingoia/koa-router
[proposal-decorators]: https://github.com/tc39/proposal-decorators
[oai2.0]: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md
[swagger-ui]: https://github.com/swagger-api/swagger-ui
[babel-transform-decorators]: http://babeljs.io/docs/plugins/transform-decorators

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

* [Oreo-Router](#oreo-router)
* [Warning](#warning)
* [Features](#features)
* [Installation](#installation)
	* [Requirement](#requirement)
* [Getting Started](#getting-started)
	* [Creating koa app and router](#creating-koa-app-and-router)
	* [Creating controller](#creating-controller)
	* [Enjoying api-explorer](#enjoying-api-explorer)
* [Documentation](#documentation)

<!-- /code_chunk_output -->

# Oreo-Router
像奥利奥夹心饼干一样。通过装饰器的方式，轻松愉快的将服务的业务逻辑包装成接口，自动打包成一组API服务。当然还可以根据你的口味加一些你爱的调料！

# Warning
```sh
Pre-alpha版本，不建议在生产环境中使用。
```

# Features
* [装饰器][proposal-decorators] 风格
* 内置大量常用装饰器，并支持配置个性化处理中间件
* 内置[Swagger-ui][swagger-ui]，可视化管理接口
* 支持[OpenAPI 2.0][oai2.0]协议
* 支持自定义装饰器
* 自动识别并加载接口类，并根据装饰参数挂载成员方法路由
* 继承自[Koa-Router][koa-router]，保持原功能、特性，性能。

# Installation
```sh
# npm
npm install oreo-router --save

# yarn
yarn install oreo-router --save
```

## Requirement
* [Koa2][koa]
* [Babel decorators transform][babel-transform-decorators]

# Getting Started

## Creating koa app and router
```js
// index.js

import Koa from 'koa';
import { OreoRouter } from 'oreo-router';

const app = new Koa();

const router = new OreoRouter({
  // 显示api-explorer(又叫swagger-ui)
  apiExplorerEnable: true,
  // 业务类的目录
  middleware: {
    dir: './controllers',
  },
});

// 挂载所有从选项middleware中识别出来的路由
app.use(router.routes());

app.listen(3000, () => {
  console.log(`
Listening Port : 3000
Api-Explorer   : http://127.0.0.1:3000/api-explorer
  `);
});
```

## Creating controller
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
现在，我们已经完成了hello world接口的开发。让我们来简单了解一下上面例子中使用的各个装饰的作用吧。
* **Get**装饰器说明该接口是一个HTTP GET方法，并且子路径是/。
* **Summary**装饰器对该接口进行简单的描述。
* **Description**装饰器对该接口进行一个详细的描述。
* **Tags**装饰器可以对接口进行分组，相同tag的接口会展示在同一个组中。
* **Query**装饰器对接口的query入参进行描述。
* **Response**装饰器对接口的响应结果进行描述。
* **hello**成员方法是我们的业务逻辑实现，是一个Koa中间件。

通过这些装饰器，我们可以方便快捷的完成接口开发，当然我们还顺便完成了接口文档的编写哦：）。
当然啦，功能远远不止于此。我们还可以为每个内置装饰器配置处理器中间件，以便做一些个性化的业务。比如我们可以为**Query**装饰器配置处理器中间件，来实现query表单的校验哦。更多玩法等你来挖掘！

## Enjoying api-explorer
使用浏览器打开api-explorer：**http://127.0.0.1:3000/api-explorer**，在这里你可以方便的查看服务提供的所有接口，以及每个接口的基本信息，入参格式、类型，返回结果的状态码、格式等等，甚至你还可以这里直接的调用它。
![hello-world](/docs/hello-world.png)

# Documentation
* [Usage Guides](./docs/usage-guides.md)
* [References](./docs/references.md)
* [Examples](https://github.com/BiteBit/oreo-router-examples)
