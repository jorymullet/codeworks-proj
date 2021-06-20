"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const usersApp = express();
const routers = require("./rest");
usersApp.use('', routers.unsecureRestRouter);
usersApp.use('', routers.whitelistedRestRouter);
usersApp.use('', routers.adminRestRouter);
exports.users = functions.https.onRequest(usersApp);
//# sourceMappingURL=index.js.map