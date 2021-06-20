"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
exports.stripe = require('stripe')((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.key);
//# sourceMappingURL=stripe.js.map