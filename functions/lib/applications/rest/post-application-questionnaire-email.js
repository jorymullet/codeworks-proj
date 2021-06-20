"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postApplicationQuestionnaireEmail = async (req, res) => {
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
            substitutions: {
                applicant_name: application.name,
                questions_link: `${origin}/appeal-questionnaire?applicationId=${application.id}`,
            },
            template: 'application_paid_to_applicant',
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Could not send email.' });
    }
    return res.send({ message: 'OK' });
};
//# sourceMappingURL=post-application-questionnaire-email.js.map