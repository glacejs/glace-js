First please see [example](https://github.com/schipiga/glacejs/tree/master/examples/ownMiddleware) how to develop and include own proxy middleware.

By default `GlaceJS` supports 3 middlewares:
- to gather responses info
- to manage responses speed
- to cache and replay responses

Your middleware may be registered just adding it to array (see example).
Middleware will be used in all supported proxies and executed inside proxy context.
If you want to prevent middleware calling after your middleware you should `return true` inside it.
