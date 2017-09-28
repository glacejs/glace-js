"use strict";

var shouldFail = true;

scope ("My tests", () => {
    test("failed before", () => {
        chunk("my step", () => {
            // if (shouldFail) {
            //     shouldFail = false;
            //     throw new Error("Invalid step");
            // };
        });
    });  
});
