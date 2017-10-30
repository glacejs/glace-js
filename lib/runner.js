"use strict";
/**
 * Makes tests root session.
 *
 * - runner loads root `conftest.js` if it is located on one level with
 *   each of `CONF.testDirs`;
 * - if each of `CONF.testDirs` is file with tests, runner loads and executes it;
 * - if each of `CONF.testDirs` is folder runner loads files inside recursive if
 *   file name starts with `test` and ends with `.js`;
 * - inside each subfolder of each of `CONF.testDirs` runner loads `conftest.js`
 *   file if it is present;
 *
 * @module
 */

var fs = require("fs");
var path = require("path")

require("./globals");

session(() => {

    for (var testDir of CONF.testDirs) {

        if (!fs.statSync(testDir).isDirectory()) {
            require(testDir);
            continue;
        };

        var loadTests = dir => {
            for (var fileName of fs.readdirSync(dir)) {
                var filePath = path.resolve(dir, fileName);

                if (fileName === "conftest.js") require(filePath);

                if (fileName.startsWith("test") && fileName.endsWith(".js")) {
                    require(filePath);
                };
                if (fs.lstatSync(filePath).isDirectory()) {
                    loadTests(filePath);
                };
            };
        };
        loadTests(testDir);
    };
});
