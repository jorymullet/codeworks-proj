"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
exports.unsecureRestRouter = routers_1.default.unsecure;
exports.whitelistedRestRouter = routers_1.default.whitelisted;
exports.adminRestRouter = routers_1.default.admin;
const create_and_sign_in_1 = require("./create-and-sign-in");
exports.whitelistedRestRouter.post('', create_and_sign_in_1.post);
const getByEmail_1 = require("./getByEmail");
exports.unsecureRestRouter.get('/byEmail/:email', getByEmail_1.getByEmail);
const delete_1 = require("./delete");
exports.adminRestRouter.delete('/:userId', delete_1._delete);
//# sourceMappingURL=index.js.map