"use strict";

if (!global.i) global.i = 0;

scope("Fixed Bugs", () => {

    test("https://github.com/glacejs/glace-core/issues/87", { retry: 1 }, () => {

        before(async () => {
            await $.limitProxySpeed(1024);
        });

        after(() => {
            global.i++;
        });

        chunk(() => {
            if (!global.i) throw new Error("BOOM!");
        });
    });
});
