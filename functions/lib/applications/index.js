"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const applicationsApp = express();
const routers = require("./rest");
applicationsApp.use('', routers.restRouter);
applicationsApp.use('', routers.adminRouter);
exports.applications = functions.https.onRequest(applicationsApp);
//# sourceMappingURL=index.js.map