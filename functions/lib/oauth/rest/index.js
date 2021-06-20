"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
const restRouter = routers_1.default.whitelisted;
const firebase_token_1 = require("./firebase-token");
restRouter.post('/firebase-token', firebase_token_1.swapFirebaseToken);
exports.default = restRouter;
//# sourceMappingURL=index.js.map