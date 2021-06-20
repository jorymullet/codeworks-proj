"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const authApp = express();
const rest_1 = require("./rest");
authApp.use('', rest_1.default);
exports.auth = functions.https.onRequest(authApp);
//# sourceMappingURL=index.js.map