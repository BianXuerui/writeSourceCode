const webpack = require("./lib/webpack.js");

const config = require("./webpack.config.js");

new webpack(config).run();
