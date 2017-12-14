
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

* [Oreo-Router](#oreo-router)
* [Features](#features)
* [Installation](#installation)
	* [Requirement](#requirement)
* [Getting Started](#getting-started)
* [Usage Guides](#usage-guides)
* [Pattern](#pattern)
* [References](#references)
	* [Router](#router)
	* [Decorators](#decorators)
		* [Controller Decorators](#controller-decorators)
		* [Controller Action Decorators](#controller-action-decorators)
		* [Middleware Decorators](#middleware-decorators)
* [Plan](#plan)

<!-- /code_chunk_output -->

# Oreo-Router


# Features
* [装饰器](https://github.com/tc39/proposal-decorators) 风格
* 内置大量常用装饰器，并支持配置个性化处理中间件
* 内置[Swagger-ui](https://github.com/swagger-api/swagger-ui)，可视化管理接口
* 支持[OpenAPI 2.0](https://github.com/OAI/OpenAPI-Specification)协议
* 支持自定义装饰器
* 自动识别并加载接口类，并根据装饰参数挂载成员方法路由

# Installation
```sh
# npm
npm install oreo-router --save

# yarn
yarn install oreo-router --save
```

## Requirement
* [Koa2](https://github.com/koajs/koa)
* [Babel decorators transform](http://babeljs.io/docs/plugins/transform-decorators)


# Getting Started
TODO...

# Usage Guides
TODO...

# Pattern
TODO...

# References
TODO...

## Router

## Decorators
### Controller Decorators
| Decorator Name                     | Target | Description |
| ---------------------------------- | ------ | ----------- |
| `@Middleware(routePrefix: string)` | class  |             |

### Controller Action Decorators
| Decorator Name                      | Target   | Description |
| ----------------------------------- | -------- | ----------- |
| `@Get(route: string)`               | function |             |
| `@Post(route: string)`              | function |             |
| `@Put(route: string)`               | function |             |
| `@Patch(route: string)`             | function |             |
| `@Delete(route: string)`            | function |             |
| `@Head(route: string)`              | function |             |
| `@Summary(summary: string)`         | function |             |
| `@Description(description: string)` | function |             |
| `@Tags(tags: [string])`             | function |             |
| `@Consumes(consumes: [string])`     | function |             |
| `@Produces(produces: [string])`     | function |             |
| `@Schemes(schemes: [string])`       | function |             |
| `@Deprecated(deprecated: boolean)`  | function |             |
| `@Security()`                       | function |             |
| `@Query(query: object)`             | function |             |
| `@Param(params: object)`            | function |             |
| `@Body(body: object)`               | function |             |
| `@FormData(form: object)`           | function |             |
| `@Header(headers: object)`          | function |             |
| `@Response(responses: object)`      | function |             |

### Middleware Decorators
| Decorator Name                  | Target          | Description |
| ------------------------------- | --------------- | ----------- |
| `@UseBefore(middle: KoaMiddle)` | class, function |             |
| `@Use(middle: KoaMiddle)`       | class, function |             |
| `@UseAfter(middle: KoaMiddle)`  | class, function |             |

# Plan
TODO...
