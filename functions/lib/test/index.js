"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const testApp = express();
const rest_1 = require("./rest");
testApp.use('', rest_1.default);
exports.test = functions.https.onRequest(testApp);
//# sourceMappingURL=index.js.map