"use strict";

scope ("My tests", () => {
    test("failed before", () => {
        chunk("my step", () => {});
    });  
});
