"use strict";
/**
 * Gulp tasks.
 *
 * @module
 */

var gulp = require("gulp");
var clean = require("gulp-clean");
var spawn = require("cross-spawn");

gulp.task("mk-docs", () => {
    spawn.sync("jsdoc", [ "-c", "jsdoc.json", "-d", "docs" ]);
});

gulp.task("rm-docs", () => {
    gulp.src("docs", {read: false}).pipe(clean());
});

gulp.task("test-xvfb", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/integration/testXvfb.js",
                   "--web",
                   "--video",
                   "--xvfb"
               ],
               { stdio: "inherit" });
});

gulp.task("test-fixtures", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/integration/testFixtures.js",
                   "--web-url", "https://yandex.ru",
               ],
               { stdio: "inherit" });
});

gulp.task("test-all", [
    "test-xvfb",
    "test-fixtures",
], () => {
});
