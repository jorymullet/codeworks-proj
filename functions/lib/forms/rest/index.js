"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routers_1 = require("../../utils/routers");
/// export const restRouter = routers.whitelisted
exports.adminRouter = routers_1.default.admin;
exports.unsecureRouter = routers_1.default.unsecure;
const post_appeal_form_1 = require("./post-appeal-form");
exports.adminRouter.post('/appeal-form', post_appeal_form_1.postAppealForm);
const post_sign_request_event_1 = require("./post-sign-request-event");
exports.unsecureRouter.post('/sign-request-event', post_sign_request_event_1.postSignRequestEvent);
const put_appeal_form_email_1 = require("./put-appeal-form-email");
exports.adminRouter.put('/appeal-forms/:signrequestId/email', put_appeal_form_email_1.putAppealFormEmail);
//# sourceMappingURL=index.js.map