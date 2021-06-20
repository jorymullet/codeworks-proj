"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postApplicationQuestionnaire = async (req, res) => {
    const applicationId = req.params.applicationId;
    const questionnaire = req.body.questionnaire;
    const origin = req.body.origin;
    if (!(applicationId && questionnaire && origin))
        return res.status(400).send({ message: 'Post must include applicationId, questionnaire, and origin' });
    const firestore = admin.firestore();
    const applicationsRef = firestore.collection('applications');
    let application;
    try {
        application = (await applicationsRef.doc(applicationId).get()).data();
    }
    catch (err) {
        console.error('Trouble retrieving application:', err);
        return res.status(400).send({ message: 'Could not retrieve application.' });
    }
    if (!application)
        return res.status(400).send({ message: 'No application associated with the applicationId.' });
    if (!application.paid)
        return res.status(400).send({ message: 'Must pay for service before submitting questionnaire.' });
    if (application.questionnaire_submitted)
        return res.status(400).send({ message: 'Questionnaire has already been submitted.' });
    try {
        await applicationsRef.doc(applicationId).update({
            questionnaire_submitted: true,
            questionnaire,
        });
    }
    catch (err) {
        console.error('Trouble with saving application: ', err);
        return res.status(400).send({ message: 'Could not save application.' });
    }
    // Sends emails to questionnaire submitter and admins
    const notifications = (await firestore.collection('system').doc('notifications').get()).data();
    const adminsToEmail = notifications ? notifications.questionnaire_submitted : [];
    const emailOptions = [
        ...adminsToEmail.map(email => ({
            to: email,
            substitutions: Object.assign({ origin }, application),
            template: 'questionnaire_submitted_to_admin',
        })),
        {
            to: application.email,
            substitutions: {
                applicant_name: application.name,
            },
            template: 'questionnaire_submitted_to_applicant',
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
//# sourceMappingURL=post-application-questionnaire.js.map