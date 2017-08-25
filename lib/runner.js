"use strict";
/**
 * Tests runner
 *
 * @module
 */
require("./globals");

scope("Session", () => {

    var loadTests = testsDir => {
        for (var fileName of fs.readdirSync(testsDir)) {
            var filePath = path.resolve(testsDir, fileName);

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

