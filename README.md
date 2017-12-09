**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

![GlaceJS logo](glace.png)

`GlaceJS` is a quick-start functional testing framework based on [mocha](http://mochajs.org/) and extensible with [plugins](https://github.com/glacejs).

`glace-js` is aggregation project which includes [glace-core](https://glacejs.github.io/glace-core) and its [plugins](https://github.com/glacejs).

## Binary software which may be used

- `java` for selenium server usage;
- `chrome` browser for web tests;
- `imagemagick` (**unix only**) for images comparison (on windows will be installed together with framework);
- `avconv` (**linux only**) for video capture. On windows `ffmpeg` is used which will be installed together with framework. On macOS isn't implemented still;
- compiler for native nodejs modules. On windows may be installed with `npm i -g windows-build-tools`;

## How to install

Use `npm`:

```
npm i glace-js
```

For development:

```
git clone https://github.com/glacejs/glace-js.git
cd glace-js
npm i
gulp test-all // launch all integration tests
gulp --tasks // list all tasks
```

## How to use

```
glace [options] [sequence-of-test-files-or-folders]
```

In order to see all CLI options use command (plugin commands will be shown too):

```
glace -h
```

## Test examples

See `glace-core` [integration tests](https://github.com/glacejs/glace-core/tree/master/tests/integration) in order to explore basic examples.

See `glace-js` [integration tests](https://github.com/glacejs/glace-js/tree/master/tests/integration) in order to explore plugin examples.
