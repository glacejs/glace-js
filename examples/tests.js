"use strict";

// scope("My tests", () => {
//     test("my test", () => {
//         chunk("my step", () => {
//             throw new Error("boom");
//         });
//     });

//     test("my another test", () => {
//         chunk("my step", () => {
//             throw new Error("boom");
//         });
//     });
// });

test("failed before", () => {
    // before(() => {
    //     throw new Error("boom");
    // });
    chunk("my step", () => {});
});
