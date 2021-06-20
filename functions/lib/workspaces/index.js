"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const workspacesApp = express();
const rest_1 = require("./rest");
workspacesApp.use('', rest_1.default);
__export(require("./triggers"));
exports.workspaces = functions.https.onRequest(workspacesApp);
//# sourceMappingURL=index.js.map