"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const fs = require("fs");
const path = require("path");
exports.isLocal = () => os.hostname() === 'Joshuas-MacBook-Pro.local';
exports.getLocalFile = (pathName) => fs.readFileSync(path.resolve(__dirname, pathName)).toString('base64');
exports.to2 = str => String(str).length === 2 ? str : `0${str}`;
//# sourceMappingURL=methods.js.map