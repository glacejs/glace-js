File `conftest.js` is used to make some configuration before tests loading. It may be located with tests file or inside each folder containing tests files.

In order to make some functions available inside a test, you may use `global` namespace:

```javascript
// conftest.js
global.someFunc = () => console.log("hello world");
```

```javascript
test("My test", () => {
    chunk(() => someFunc());
});
```
