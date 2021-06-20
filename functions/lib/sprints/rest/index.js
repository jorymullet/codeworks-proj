"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
const restRouter = routers_1.default.secure;
const create_circle_space_1 = require("./create-circle-space");
restRouter.post('/circle-space', create_circle_space_1.createCircleSpace);
const delete_circle_space_1 = require("./delete-circle-space");
restRouter.delete('/:sprintId/circle-space', delete_circle_space_1.deleteCircleSpace);
const join_circle_space_1 = require("./join-circle-space");
restRouter.put('/:sprintId/users/:userId', join_circle_space_1.joinCircleSpace);
const leave_circle_space_1 = require("./leave-circle-space");
restRouter.delete('/:sprintId/users/:userId', leave_circle_space_1.leaveCircleSpace);
const invite_users_to_sprint_1 = require("./invite-users-to-sprint");
restRouter.post('/:sprintId/invites', invite_users_to_sprint_1.inviteUsersToSprint);
exports.default = restRouter;
//# sourceMappingURL=index.js.map