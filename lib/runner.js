"use strict";
/**
 * Makes tests root session.
 *
 * - runner loads root `conftest.js` if it is located on one level with
 *   `CONF.testsDir`;
 * - if `CONF.testsDir` is file with tests, runner loads and executes it;
 * - if `CONF.testsDir` is folder runner loads files inside recursive if
 *   file name starts with `test` and ends with `.js`;
 * - inside each subfolder of `CONF.testsDir` runner loads `conftest.js`
 *   file if it is present;
 *
 * @module
 */

var fs = require("fs");
var path = require("path")

require("./globals");

session(() => {

    var rootConftest = path.resolve(path.dirname(CONF.testsDir),
                                    "conftest.js");
    if (fs.existsSync(rootConftest)) require(rootConftest);

    if (!fs.statSync(CONF.testsDir).isDirectory()) {
        require(CONF.testsDir);
        return;
    };

    var loadTests = testsDir => {
        for (var fileName of fs.readdirSync(testsDir)) {
            var filePath = path.resolve(testsDir, fileName);

            if (fileName === "conftest.js") require(filePath);

            if (fileName.startsWith("test") && fileName.endsWith(".js")) {
                require(filePath);
            };
            if (fs.lstatSync(filePath).isDirectory()) {
                loadTests(filePath);
            };
        };
    };
    loadTests(CONF.testsDir);
});
