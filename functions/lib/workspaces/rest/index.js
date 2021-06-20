"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
const restRouter = routers_1.default.secure;
const get_1 = require("./get");
restRouter.get('', get_1.get);
exports.default = restRouter;
//# sourceMappingURL=index.js.map