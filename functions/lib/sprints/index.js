"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const sprintsApp = express();
const rest_1 = require("./rest");
sprintsApp.use('', rest_1.default);
exports.sprints = functions.https.onRequest(sprintsApp);
__export(require("./cron"));
//# sourceMappingURL=index.js.map