`GlaceJS` supports follow command line arguments:

- `<paths>` (**optional**) - Sequence of file or folder paths, where tests are located. For example, `glace myTests.js` or `glace path/to/tests-folder`. In folder it loads files with tests recursively. If file with tests is not specified directly, it loads files with prefix `test` and extension `.js` only. If argument is not specified, it looks inside folder `tests` in current work directory.
- `--web` (**optional**) - Activates steps for web testing in browser via selenium. If option is specified, selenium server and browser will launched automatically on session begin and will be stopped at session end.
- `--dont-install-drivers` (**optional**) - Don't install selenium webdrivers on session start.
- `--platform <type>` (**optional**) - Platfrom type. Supported values are `pc`, `android`, `ios`. Default value is `pc`. For example, `--platform android`.
- `--browser <name>` (**optional**) - Browser name. Default value is specific for platform: `chrome` for `pc`, `chrome` for `android`, `safari` for `ios`. For example, `--browser firefox`.
- `--selenium-addr <address>` (**optional**) - Selenium or appium network address. For example, `--selenium-addr 192.168.0.9:4004`. If it is not specified, local selenium server with default options will be started.
- `--device <name>` (**optional**) - Mobile device name. For example, `--device "My iPhone"` or `--device Our_Android`. Look for actual value for mobile device in its settings.
- `--os-version <version>` (**optional**) - Mobile OS version. For example, `--os-version 9.0.3` or `--os-version 5.0.5`.
- `--udid <UDID>` (**optional**) - Mobile device UDID.
- `--ios-engine <engineName>` (**optional**) - iOS driver engine name. Default value is `XCUITest`.
- `--retry <times>` (**optional**) - Number of times to retry a failed test case.
- `--stdout-log` (**optional**) - Print log to console stdout.
- `--allow-uncaught` (**optional**) - Use mochajs processing of uncaught exceptions.
