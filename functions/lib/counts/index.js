"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCollections = ['users', 'projects', 'conversations', 'resources', 'progresses', 'sprints',];
const express = require("express");
const functions = require("firebase-functions");
const countsApp = express();
const rest_1 = require("./rest");
countsApp.use('', rest_1.default);
exports.counts = functions.https.onRequest(countsApp);
__export(require("./triggers"));
//# sourceMappingURL=index.js.map