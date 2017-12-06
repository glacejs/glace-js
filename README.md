**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

![GlaceJS logo](glace.png)

`GlaceJS` is a functional testing framework based on [mochajs](http://mochajs.org/).

## Features

- Cross-platform
- Uses `mochajs` as test runner
- Has own tests and reports system
- Oriented to complex functional scenarios
- Supports multiple independent verifications (`chunks`) inside a test
- Supports parameterization inside and outside of test
- Has built-in mechanism to retry failed tests or chunks
- Has built-in reporters to terminal, `report.log` file and TestRail
- Launches selenium server if external selenium address isn't specified
- Supports STEPS architecture and Page Object Pattern
- Has mechanism to compare two images
- Has mechanism to search one image inside another image
- Supports video capture of executed tests
- Supports `xvfb` virtual display and video capture of it
- Includes two proxies: simple http proxy and global transparent proxy
- Supports a set of middlewares for both proxies
- Includes middleware to cache server responses
- Includes middleware to manage proxy responses speed
- Includes middleware to gather server responses information
- Supports `JSON` config for `CLI` options
- Supports extending default config with user config

## Binary software may be used

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

Or clone repository:

```
git clone https://github.com/glacejs/glace-js.git
cd glacejs
npm i
```

## How to launch tests

If you clone repository and install it as developer, you may find a plenty of [examples](https://github.com/glacejs/glace-js/tree/master/examples) with commands how to launch them.

After `npm` installation you may use command `glace` to launch tests. Use `glace -h` to get info about available options, or read about [CLI options](tutorial-console-args.html) in documentation.

## How to write tests

Please look through [examples](https://github.com/glacejs/glace-js/tree/master/examples) to see how to write tests. In documentation also you may find description of all supported steps.

## Bugs and feedbacks

Please fill free to create an [issue](https://github.com/glacejs/glace-js/issues) on github.
