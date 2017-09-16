`GlaceJS` supports follow command line arguments:

- `<path>` (**optional**) - File or folder path, where tests are located. For example, `glace myTests.js` or `glace path/to/tests-folder`. In folder it loads files with tests recursively. If file with tests is not specified directly, it loads files with prefix `test` and extension `.js` only. If argument is not specified, it looks inside folder `tests` in current work directory.
- `--web` (**optional**) - Activates steps for web testing in browser via selenium. If option is specified, selenium server and browser will launched automatically on session begin and will be stopped at session end.
- `--install-drivers` (**optional**) - Installs selenium webdrivers on session start.
