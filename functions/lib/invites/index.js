"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const functions = require("firebase-functions");
const invitesApp = express();
const routers = require("./rest");
// the ordering of these routers is vital to the only-whitelisted one to work
invitesApp.use('', routers.restWhitelistedRouter);
invitesApp.use('', routers.restAdminRouter);
exports.invites = functions.https.onRequest(invitesApp);
//# sourceMappingURL=index.js.map