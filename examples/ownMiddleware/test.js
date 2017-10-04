// npm test -- examples/ownMiddleware/test.js --web --proxy --global-proxy --app https://yandex.ru
var middleware = require("../../lib").middleware;

var myMiddleWare = function () {

    var res = this.res;
    var req = this.req;

    var resWrite = res.write;

    res.write = function (chunk) {
        console.log(req.headers.host + req.url,
                    "| chunk size:",
                    chunk.length,
                    "bytes");
        resWrite.apply(this, arguments);
    };

    return false;
};

middleware.unshift(myMiddleWare);

test("Own middleware", () => {
    chunk(async () => await SS.openApp());
});
