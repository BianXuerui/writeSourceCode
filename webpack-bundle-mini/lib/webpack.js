const fs = require("fs");
const path = require("path");
const BabelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");

module.exports = class webpack {
  constructor(options) {
    // 读取配置信息
    this.entry = options.entry;
    this.output = options.output;

    this.modulesInfo = [];
  }
  run() {
    const moduleParserInfo = this.parser(this.entry);
    this.modulesInfo.push(moduleParserInfo);

    // 双重for循环来遍历是否含有依赖
    for (let i = 0; i < this.modulesInfo.length; i++) {
      const dependencies = this.modulesInfo[i].dependencies;
      if (dependencies) {
        for (let j in dependencies) {
          this.modulesInfo.push(this.parser(dependencies[j]));
        }
      }
    }
    // 数据结构转换
    let obj = {};
    this.modulesInfo.forEach((item) => {
      obj[item.modulePath] = {
        dependencies: item.dependencies,
        code: item.code,
      };
    });
    this.bundleFile(obj);
  }
  parser(modulePath) {
    // 编译模块 参数：接受一个模块的路径
    // 1. 分析模块是否有依赖？有依赖提取依赖的路径
    // 2. 生成chunk
    // 前提：拿到该模块的内容？ 读取模块的内容

    const content = fs.readFileSync(modulePath, "utf-8");
    const ast = BabelParser.parse(content, { sourceType: "module" });

    const dependencies = {}; //保存依赖的路径
    traverse(ast, {
      ImportDeclaration({ node }) {
        const newPath =
          "./" + path.join(path.dirname(modulePath), node.source.value);
        dependencies[node.source.value] = newPath;
      },
    });

    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });

    return {
      modulePath,
      dependencies,
      code,
    };
  }

  bundleFile(obj) {
    // 生成bundle文件
    const bundlePath = path.join(this.output.path, this.output.filename);
    const dependenciesInfo = JSON.stringify(obj);
    const content = `(function(modulesInfo){
       
      function require(modulePath){

        /**
         * 切换一下require的路径，因为modulePath是拿到的一个入口文件的路径‘./other.js’而不是‘./src/other.js’，所以要进行一下切换
         */
        function newRequire(relativePath){
          return require(modulesInfo[modulePath].dependencies[relativePath]);
        }

        const exports = {};

        (function(require, code){
          eval(code);

        })(newRequire, modulesInfo[modulePath].code)

        return exports;
      }



      require('${this.entry}'); //./src/index.js
    })(${dependenciesInfo})`;

    fs.writeFileSync(bundlePath, content, "utf-8");
  }
};
