"use strict";

scope("My tests", () => {
    // test("my test", () => {
    //     chunk("my step", () => {
    //         throw new Error("fuck world");
    //     });
    // });

    test("my another test", () => {
        chunk("my step", () => {
            // throw new Error("fuck world");
        });
    });
});
