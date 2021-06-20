"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postApplicationAssessorsEmail = async (req, res) => {
    const applicationId = req.params.applicationId;
    if (!applicationId)
        return res.status(400).send({ message: 'Must include application id' });
    const applicationsRef = admin.firestore().collection('applications');
    const form = req.body.form;
    const application = (await applicationsRef.doc(applicationId).get()).data();
    if (!(application && form))
        return res.status(400).send({ message: 'Must include valid application and form.' });
    let attachment;
    try {
        attachment = await email_1.getFirebaseFileBase64(`forms/${application.id}/appeal_form.pdf`);
    }
    catch (err) {
        console.error('Could not get remote file base 64: ', err);
        return res.status(400).send({ message: 'Could not attach appeal form and did not send' });
    }
    const htmlBody = form.body.replace(/\n/g, '<br/>') + '<br/><br/>';
    const evidenceFiles = await Promise.all(application.evidence.map(evidence => email_1.getFirebaseFileBase64(`evidence/${application.id}/${evidence.name}`)));
    try {
        await email_1.send({
            to: form.to,
            html: htmlBody,
            subject: `Property Reassement: ${application.name}`,
            replyTo: form.from,
            bcc: form.bcc,
            attachments: [
                {
                    content: attachment,
                    filename: `Appeal Form for ${application.name}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment',
                },
                ...evidenceFiles.map((file, idx) => ({
                    content: file,
                    filename: application.evidence[idx].name,
                    type: application.evidence[idx].type,
                }))
            ],
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Could not send email to assessor.' });
    }
    try {
        await email_1.send({
            to: application.email,
            template: 'appeal_form_filed_to_applicant',
            fromEmail: 'beth@correctpropertytax.com',
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Send email to assessor but no to client.' });
    }
    await admin.firestore().collection('applications').doc(application.id).update({ 'appeal_filed_date': new Date() });
    return res.send({ message: 'OK' });
};
//# sourceMappingURL=post-application-assessors-email.js.map