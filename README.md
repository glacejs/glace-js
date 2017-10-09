**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

![GlaceJS logo](glace.png)

`GlaceJS` is a functional testing framework based on [mochajs](http://mochajs.org/).

## Binary software may be used

- `java` for selenium server usage;
- `chrome` browser for web tests;
- `imagemagick` (**unix only**) for images comparison (on windows will be installed together with framework);
- `avconv` (**linux only**) for video capture. On windows `ffmpeg` is used which will be installed together with framework. On macOS isn't implemented still;
- compiler for native nodejs modules. On windows may be installed with `npm i -g windows-build-tools`;

## How to install

Use `npm`:

```
npm i glacejs
```

Or clone repository:

```
git clone https://github.com/schipiga/glacejs.git
cd glacejs
npm i
```

## How to launch tests

If you clone repository and install it as developer, you may find a plenty of [examples](https://github.com/schipiga/glacejs/tree/master/examples) with commands how to launch them.

After `npm` installation you may use command `glace` to launch tests. Use `glace -h` to get info about available options, or read about [CLI options](tutorial-console-args.html) in documentation.

## How to write tests

Please look through [examples](https://github.com/schipiga/glacejs/tree/master/examples) to see how to write tests. In documentation also you may find description of all supported steps.

## Bugs and feedbacks

Please fill free to create an [issue](https://github.com/schipiga/glacejs/issues) on github.
