/*
 * @文件描述:
 * @公司: 漫蝌网
 * @作者: 卞雪瑞
 * @Date: 2021-12-04 13:31:13
 * @LastEditors: 卞雪瑞
 * @LastEditTime: 2021-12-04 13:36:00
 */

const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "./dist"),
  },
  mode: "development",
};
