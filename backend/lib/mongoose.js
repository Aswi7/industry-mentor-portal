const path = require("path");
const { createRequire } = require("module");

// Force backend files to reuse the app's top-level mongoose installation.
const rootRequire = createRequire(path.resolve(__dirname, "../../package.json"));

module.exports = rootRequire("mongoose");
