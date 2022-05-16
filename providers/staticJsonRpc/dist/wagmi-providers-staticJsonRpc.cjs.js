'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./wagmi-providers-staticJsonRpc.cjs.prod.js");
} else {
  module.exports = require("./wagmi-providers-staticJsonRpc.cjs.dev.js");
}
