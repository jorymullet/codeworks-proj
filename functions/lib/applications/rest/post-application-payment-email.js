"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postApplicationPaymentEmail = async (req, res) => {
    const applicationId = req.params.applicationId;
    if (!applicationId)
        return res.status(400).send({ message: 'Must include application id' });
    const applicationsRef = admin.firestore().collection('applications');
    const origin = req.body.origin;
    const application = (await applicationsRef.doc(applicationId).get()).data();
    if (!(application && origin))
        return res.status(400).send({ message: 'Must include valid application and origin.' });
    try {
        await email_1.send({
            to: application.email,
            template: 'application_approved_to_applicant',
            substitutions: {
                applicant_name: application.name,
                link_to_pay: `${origin}/agreement-and-payment?applicationId=${applicationId}`,
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Could not send email.' });
    }
    return res.send({ message: 'OK' });
};
//# sourceMappingURL=post-application-payment-email.js.map