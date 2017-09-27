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
scope ("My tests", () => {

    // after(() => {
    //     throw new Error("before boom");
    // });

    test("failed before", () => {
        after(() => {
            console.log("after #1");
            throw new Error("boom");
        });
        after(() => {
            console.log('after #2');
            // throw new Error("another boom");
        });
        chunk("my step", () => {});
    });  
});
