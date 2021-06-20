"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const formsApp = express();
const routers = require("./rest");
formsApp.use('', routers.unsecureRouter);
formsApp.use('', routers.adminRouter);
exports.forms = functions.https.onRequest(formsApp);
//# sourceMappingURL=index.js.map