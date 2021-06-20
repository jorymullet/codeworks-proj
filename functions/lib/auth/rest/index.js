"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
const restRouter = routers_1.default.unsecure;
const get_1 = require("./get");
restRouter.get('', get_1.get);
const authorize_1 = require("./authorize");
restRouter.get('/authorize', authorize_1.authorize);
exports.default = restRouter;
//# sourceMappingURL=index.js.map