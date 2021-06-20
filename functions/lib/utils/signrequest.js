"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SignrequestClient = require("signrequest-client");
const functions = require("firebase-functions");
const defaultClient = SignrequestClient.ApiClient.instance;
const Token = defaultClient.authentications['Token'];
Token.apiKey = functions.config().sign_request.key;
Token.apiKeyPrefix = 'Token';
exports.default = SignrequestClient;
//# sourceMappingURL=signrequest.js.map