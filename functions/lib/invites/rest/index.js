"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
exports.restAdminRouter = routers_1.default.admin;
exports.restWhitelistedRouter = routers_1.default.unsecure;
const post_1 = require("./post");
exports.restAdminRouter.post('', post_1.postInvite);
const update_invite_1 = require("./update-invite");
exports.restWhitelistedRouter.put('/:inviteId', update_invite_1.updateInvite);
//# sourceMappingURL=index.js.map