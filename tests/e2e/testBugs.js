"use strict";

scope("Fixed Bugs", () => {
    var i = 0;

    test("https://github.com/glacejs/glace-core/issues/87", { retry: 1 }, () => {

        before(async () => {
            await $.limitProxySpeed(1024);
        });

        after(() => {
            i++;
        });

        chunk(() => {
            if (!i) throw new Error("BOOM!");
        });
    });
});
