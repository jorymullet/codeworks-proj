"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postApplication = async (req, res) => {
    const application = req.body.application;
    const origin = req.body.origin;
    const firestore = admin.firestore();
    // Ready application for database, then saves
    const applicationsRef = firestore.collection('applications');
    const applicationId = applicationsRef.doc().id;
    application.id = applicationId;
    application.status = 'PENDING';
    application.paid = false;
    application.archived = 0; //will change into larger number after archiving occurs
    application.questionnaire_submitted = false;
    application.admin_notes = '';
    application.sign_request_id = null;
    application.appeal_form_url = null;
    application.appeal_filed_date = null;
    application.evidence = [];
    application.created = Date.now();
    try {
        await firestore.collection('applications').doc(applicationId).set(application);
    }
    catch (err) {
        console.error('Trouble with saving application: ', err);
        return res.status(400).send({ message: 'Could not save application.' });
    }
    // Sends emails to new applicant and admins
    const adminsToEmail = await email_1.getNotifiees('new_applicant');
    const emailOptions = [
        ...adminsToEmail.map(email => ({
            to: email,
            substitutions: Object.assign({ origin }, application),
            template: 'new_application_to_admin',
        })),
        {
            to: application.email,
            substitutions: {
                applicant_name: application.name,
            },
            template: 'new_application_to_applicant',
        },
    ];
    try {
        await Promise.all(emailOptions.map(options => email_1.send(options)));
    }
    catch (err) {
        console.error('Trouble sending email', err);
        return res.status(400).send({ message: 'Could not send emails after success' });
    }
    return res.send({ message: 'OK' });
};
//# sourceMappingURL=post-application.js.map