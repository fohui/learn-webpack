const Complier = require("./lib/compiler");
const options = require("./webpack.config");
new Complier(options).run();