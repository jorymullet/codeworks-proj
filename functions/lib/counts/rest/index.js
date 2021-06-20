"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
const restRouter = routers_1.default.admin;
const count_org_entities_1 = require("./count-org-entities");
restRouter.get('/:orgId/refresh', count_org_entities_1.countOrgEntities);
exports.default = restRouter;
//# sourceMappingURL=index.js.map