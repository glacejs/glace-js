module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "globals": {
        "SS": true,
        "expect": true,
        "chunk": true,
        "test": true,
        "sinon": true,
        "CONF": true,
        "beforeChunk": true,
        "afterChunk": true,
        "fxXvfb": true,
        "after": true,
        "before": true,
        "scope": true,
        "rewire": true,
        "fxWebdriver": true,
        "fxVideo": true,
        "fxKillWebdriver": true,
        "fxBrowser": true,
        "fxSelenium": true,
        "document": true,
        "window": true,
        "html2canvas": true,
        "session": true,
        "fxGlobalProxy": true,
        "fxHttpProxy": true,
        "fxScreenOnFail": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "no-console": 0,
        "no-extra-semi": 0,
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
