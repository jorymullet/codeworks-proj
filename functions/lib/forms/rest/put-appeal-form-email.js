"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signrequest_1 = require("../../utils/signrequest");
exports.putAppealFormEmail = async (req, res) => {
    const signrequestId = req.params.signrequestId;
    const apiInstance = new signrequest_1.default.SignrequestsApi();
    apiInstance.signrequestsResendSignrequestEmail(signrequestId, (error, data, response) => {
        if (error) {
            console.error(error);
            return res.status(400).send({ message: 'Could not resend email.' });
        }
        res.send('OK');
    });
};
//# sourceMappingURL=put-appeal-form-email.js.map