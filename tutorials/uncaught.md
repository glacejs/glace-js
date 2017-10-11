Uncaught exceptions is really dangerous thing, that may break your `mochajs` tests queue.

Let's consider code example with async calls and uncaught exceptions.

```javascript
/* sample.js */
var sleep = timeout => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`I was sleeping ${timeout} ms`);
            resolve();
        }, timeout);
    });
};

var error = timeout => {
    setTimeout(() => {
        throw new Error("BOOM!!!");
    }, timeout);
};

describe("scope", () => {
    it ("test #1", async () => {
        error(1000);
        await sleep(1000);
    });
    it ("test #2", async () => await sleep(1000));
    it ("test #3", async () => {
        error(1000);
        await sleep(1000);
    });
    it ("test #4", async () => await sleep(1000));
    it ("test #5", async () => await sleep(1000));
    it ("test #6", async () => await sleep(1000));
});
```

Execute it and get something really strange in report:

```
$ mocha sample.js


  scope
    1) test #1  # in console it colored as red (failed)
I was sleeping 1000 ms
    √ test #1 (1012ms)
    2) test #3  # in console it colored as red (failed)
I was sleeping 1000 ms
I was sleeping 1000 ms
    √ test #4
    √ test #4
I was sleeping 1000 ms
I was sleeping 1000 ms
I was sleeping 1000 ms
    √ test #6 (1002ms)
    √ test #6 (1002ms)
    √ test #6 (1003ms)

  6 passing (3s)
  2 failing

  1) scope
       test #1:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15)

  2) scope
       test #3:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15)





  6 passing (3s)
  2 failing

  1) scope
       test #1:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15)

  2) scope
       test #3:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15)




  6 passing (3s)
  2 failing

  1) scope
       test #1:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15)

  2) scope
       test #3:
     Uncaught Error: BOOM!!!
      at Timeout.setTimeout [as _onTimeout] (proba.js:12:15
```

1. Pay attention, that `test #1` is mentioned twice: as passed and as failed!
1. `test #2` & `test #5` are absent in report!
1. You may see concurrent printing of messages `I was sleeping 1000 ms`, 1 time, 2 times, 3 times.

Let's see why it happens.
The problem, that by default `mochajs` processes `uncaught exceptions`: https://github.com/mochajs/mocha/blob/master/lib/runner.js#L698. And if such exception happens, `mochajs` fails currently executed test. And it doesn't matter whether such exception happens in current test or was born many tests ago (due to unstopped timer, for example). This processing is implemented via listener, and in above example very interesting things happen:

1. In `test #1` on one hand `uncaught exception` happens after 1 second and its processing starts. On the other hand, `test #1` waits for `sleep` finishing 1 second and then `mochajs` marks it as passed.
1. Due to async of `JavaScript`, there are two concurrently `test #1` processors, that leads to `test #1` reporting twice.
1. More over, since there are two places, which emit events to start new test execution. And factically, there are two tests queues.
1. In `test #3` previous situation repeats. And there are 3 concurrently executed tests queues! The evidence is a number of printed messages `I was sleeping 1000 ms`.

**How to fix**

Simple and working variant is to suppress `uncaught exception`.

```javascript
var Mocha = require("mocha");
Mocha.Runner.prototype.uncaught = function (err) {
    logger.error("UNCAUGHT ERROR", err);
};
```

It's better to get one failed test and in test finalizers to close all descriptors, to stop proxies, to kill processes and so on, than to get fully failed tests queue in nightly build.

That's why mechanism to suppress `uncaught exceptions` is enabled by default in `GlaceJS`. But it may be disabled with option `--allow-uncaught`.
