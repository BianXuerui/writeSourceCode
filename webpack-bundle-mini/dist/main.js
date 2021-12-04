(function (modulesInfo) {
  function require(modulePath) {
    /**
     * 切换一下require的路径，因为modulePath是拿到的一个入口文件的路径‘./other.js’而不是‘./src/other.js’，所以要进行一下切换
     */
    function newRequire(relativePath) {
      return require(modulesInfo[modulePath].dependencies[relativePath]);
    }

    const exports = {};

    (function (require, code) {
      eval(code);
    })(newRequire, modulesInfo[modulePath].code);

    return exports;
  }

  require("./src/index.js"); //./src/index.js
})({
  "./src/index.js": {
    dependencies: { "./other.js": "./src/other.js" },
    code: '"use strict";\n\nvar _other = require("./other.js");\n\nconsole.log("hello wabpack" + _other.str);\n\nfunction test() {}',
  },
  "./src/other.js": {
    dependencies: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.str = void 0;\nvar str = "bundle";\nexports.str = str;',
  },
});
