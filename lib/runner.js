"use strict";
/**
 * Tests runner
 *
 * @module
 */

var fs = require("fs");

require("./globals");

session(() => {

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
