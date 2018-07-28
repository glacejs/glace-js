**Glace** (fr. *glacé* — ice, frozen) is a cold drink based on **coffee** with addition of **ice cream**.

<img src="glace.png" alt="GlaceJS logo" style="width: 250px; height: 250px;"/>

`GlaceJS` is a quick-start functional testing framework based on [mocha](http://mochajs.org/) and extensible with [plugins](https://github.com/glacejs).

`glace-js` is aggregation project which includes [glace-core](https://glacejs.github.io/glace-core) and its [plugins](https://github.com/glacejs):
- [glace-image](https://glacejs.github.io/glace-image)
- [glace-proxy](https://glacejs.github.io/glace-proxy)
- [glace-testgen](https://glacejs.github.io/glace-testgen)
- [glace-video](https://glacejs.github.io/glace-video)
- [glace-web](https://glacejs.github.io/glace-web)
- [glace-xvfb](https://glacejs.github.io/glace-xvfb)

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
```

## How to use

```
glace [options] [sequence-of-test-files-or-folders]
```

In order to see all CLI options use command (plugin commands will be shown too):

```
glace -h
```

## CLI options

`Arguments`
- `--config [path], -c` - Path to JSON file with CLI arguments. Default is `cwd/config.json` (if it exists).

**Note!** All options below may be set via `.json` file (see option `--config` above).

`Log`
- `--stdout-log` - Print log messages to stdout.
- `--log [path]` - Path to log file. Default is `cwd/glace.log`.
- `--log-level [level]` - Log level. Default is `debug`.

`Core`
- `--user-config [path]` - Path to JS file with configuration which will be merged with override default configuration. Default is `cwd/config.js` (if it exists).
- `--session-name [name]` - Tests run session name. Default value includes word `session` and datetime.
- `--grep <pattern>, -g` - Filter tests by name or name chunk (by mocha).
- `--include <sequence>` - Sequence of test name chunks separated by ` | ` in order to choose tests for run.
- `--exclude <sequence>` - Sequence of test name chunks separated by ` | ` in order to exclude tests from run.
- `--precise` - Precise tests inclusion or exclusion (not substring pattern).
- `--report [path]` - Path to reports folder. Default is `cwd/report`.
- `--dont-clear-report` - Don't clear previous report on tests run.
- `--dont-check-names` - Don't check test names uniqueness (_usually useful in unit testing_).
- `--failed-tests-path [path]` - Path to save failed tests in JSON format. Default is `cwd/report/failed-tests.json`.
- `--root-conftest <path>` - Path to root conftest.js which will be loaded before all.
- `--languages <sequence>` - List of tested languages separated with comma.
- `--retry [times]` - Number of times to retry failed test. Default is `0`.
- `--chunk-retry [times]` - Number of times to retry failed chunk. Default is `0`.
- `--chunk-timeout [sec]` - Time to execute chunk or hook, sec. Default is `180`.
- `--uncaught [type]` - Strategy to process uncaught exceptions. Default value is `log`. Supported values are `log`, `fail`, `mocha`. See details in https://glacejs.github.io/glace-core.
- `--kill-procs <sequence>` - List of process names separated with comma, which will be killed before tests run.
- `--debug-on-fail` - Enter to interactive debug mode on step failure.
- `--exit-on-fail` - Finish test run on first failure.
- `--errors-now` - Print error message immediately when it happened.
- `--interactive, -i` - Launch interactive mode to execute steps manually in terminal.

`Plugins`
- `--list-plugins` - List installed plugins and exit.
- `--plugins-dir [path]` - Path to custom plugins folder. By default it searches plugins inside folder, where `glace-core` is installed.
- `--disable-default-plugins` - Disable default plugins.

`xUnit`
- `--xunit` - Activate xUnit reporter.
- `--xunit-path [path]` - Path to xUnit report. Default is `cwd/report/xunit.xml`.
- `--xunit-suite-name [name]` - Tests suite name in xUnit report. By default it's the same as session name.

`Allure`
- `--allure` - Activate [Allure](https://docs.qameta.io/allure/) reporter.
- `--allure-dir [path]` - Path to allure reports folder. Default is `cwd/report/allure`.

`TestRail`
- `--testrail` - Activate testrail reporter.
- `--testrail-host <host>` - TestRail host.
- `--testrail-user <user>` - TestRail username or email.
- `--testrail-token <token>` - TestRail token.
- `--testrail-project-id <id>` - TestRail project id.
- `--testrail-suite-id <id>` - TestRail suite id.
- `--testrail-run-name <name>` - TestRail run name.
- `--testrail-run-desc <description>` - TestRail run description.

`Tools`
- `--testrail-check` - Check TestRail cases consistency with implemented tests.
- `--list-steps [filter]` - List available steps and exit.
- `--list-tests [filter]` - List collected tests and exit.
- `--list-fixtures [filter]` - List available fixtures and exit.

`Image`
- `--screenshot-on-fail` - Capture screenshot on chunk fail.

`Proxy`
- `--http-proxy` - Use http proxy.
- `--http-proxy-port [number]` - Port for http proxy. Default is `random`.
- `--global-proxy` - Use transparent global proxy.
- `--global-proxy-port [number]` - Port for transparent global proxy. Default is `8888`.
- `--cache` - Enable middleware to cache proxy responses to disk.
- `--existing-cache` - Use existing cache if it exists.
- `--cache-folder [folder]` - Folder to put cached server responses. Default is `cwd/.proxy-cache`.
- `--speed <value>` - Proxy speed, kb/s.
- `--install-certificate` - Install global proxy certificate as trusted. Requires administrator permissions.
- `--ssl-ca-dir [folder]` - Folder to put generated self-signed SSL certificates.
- `--reconnect [number]` - Number of proxy reconnects on request error. Default is `2`.

`Test-gen`
- `--gen-steps-filter <chunk>` - Chunk of step name to filter tests.
- `--gen-steps-uniq [number]` - Number of steps in unique sequence to filter tests. Default is `unlimited`.
- `--gen-steps-limit [number]` - Maximum amount of steps per test. Default is `unlimited`.
- `--gen-steps-usage <number>` - Number of steps usage in test case.
- `--gen-steps-files <sequence>` - Space-separated sequence of paths to steps file (yaml or json format). As alternate to specify path to steps file in plugin mode.
- `--gen-tests-limit [number]` - Maximum amount of generated tests per iteration. Default is `1000000`.
- `--gen-tests-max <number>` - Maximum amount of final tests.
- `--gen-tests-files <sequence>` - Space-separated sequence of paths to files with pregenerated tests (yaml or json format).
- `--gen-tests-only` - Flag to exclude other found tests and launch only generated tests in plugin mode.
- `--gen-tests-shuffle` - Shuffle tests during generating. Provides more steps sequence randomization, but tests will be different in generating runs.
- `--gen-load-train <path>` - Path to file with pretrained model, which will be loaded before generating.
- `--gen-train-before <path>` - Path to file with tests for training before generating.
- `--gen-names-only` - Flag to print only step names.

`Video`
- `--video` - Capture video of executed tests. Video will be removed if test is passed.
- `--video-save` - Capture video of executed tests. Video will be saved even if test is passed.

`Selenium`
- `--update-web-drivers` - Update installed selenium drivers on tests run.
- `--web` - Flag to launch tests in browser.
- `--web-url <URL>` - Web URL which will be used for web tests.
- `--web-resolution <widthxheight>` - Browser viewport size (`pc` platform only).
- `--selenium-address <host:port>` - Connect to launched selenium server with this address.
- `--platform [type]` - Specify platform type where tests will be executed. Default is `pc`. Supported values are `pc`, `android`, `ios`.
- `--browser <name>` - Name of browser where web tests will be executed. Default value is platform specific.

`Appium`
- `--device <name>` - Mobile device name.
- `--os-version <value>` - Mobile operating system version.
- `--ios-engine <name>` - iOS automation engine name.
- `--udid <value>` - Mobile device UDID.

`Chrome`
- `--chrome-incognito` - Launch chrome in incognito mode.
- `--chrome-headless` - Launch chrome in headless mode.
- `--chrome-options` - Provide space-separated chrome options with `key=value` style.

`Virtual display`
- `--xvfb [<width>x<height>]` - Use [xvfb](https://en.wikipedia.org/wiki/Xvfb) for headless testing.

`Common`
- `--version` - Show version number.
- `-h, --help` - Show help.

## Examples

See `glace-core` [e2e tests](https://github.com/glacejs/glace-core/tree/master/tests/e2e) in order to explore basic examples.

See `glace-js` [e2e tests](https://github.com/glacejs/glace-js/tree/master/tests/e2e) in order to explore plugin examples.

## Tests and quality

- Project tests report is <a href="allure-report/index.html" target="_blank">here</a>
