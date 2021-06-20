"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const oauthApp = express();
const rest_1 = require("./rest");
oauthApp.use('', rest_1.default);
exports.oauth = functions.https.onRequest(oauthApp);
//# sourceMappingURL=index.js.map