"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const signrequest_1 = require("../../utils/signrequest");
const email_1 = require("../../utils/email");
const methods_1 = require("../../utils/methods");
exports.postAppealForm = async (req, res) => {
    const applicationId = req.body.applicationId;
    const form = req.body.form;
    const origin = req.body.origin;
    if (!(applicationId && origin))
        return res.status(400).send({ message: 'Post must include applicationId, and origin' });
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
    let signRequest;
    try {
        signRequest = await createDocument(form, origin);
    }
    catch (err) {
        console.error('Trouble with creating Sign Request document:', err);
        return res.status(400).send({ message: 'Could not send Sign Request.' });
    }
    try {
        await admin.firestore().collection('applications').doc(applicationId).update({ sign_request_id: signRequest.uuid });
    }
    catch (err) {
        console.error('Trouble with saving document ID:', err);
        return res.status(400).send({ message: 'Could not save appeal form ID.' });
    }
    try {
        await sendApplicantEmail(application);
    }
    catch (err) {
        console.error('Could not send applicant email after appeal form created:', err);
        return res.status(400).send({ message: 'Could not send applicant email.' });
    }
    res.send('OK');
};
const sendApplicantEmail = application => new Promise(async (resolve, reject) => {
    //this ebook file must be kept in the 'utils' directory in order to be found by the util function
    const ebook = methods_1.getLocalFile('Appealing Your Assessment, What Your Assessor Won’t Tell You.pdf');
    const evidenceFiles = await Promise.all(application.evidence.map(evidence => email_1.getFirebaseFileBase64(`evidence/${application.id}/${evidence.name}`)));
    try {
        await email_1.send({
            to: application.email,
            html: '_',
            template: 'appeal_form_created_to_applicant',
            replyTo: 'beth@correctpropertytax.com',
            substitutions: {
                user_name: application.name,
            },
            // first, attach the ebook and then any evidence thereafter
            attachments: [
                {
                    content: ebook,
                    filename: 'Appealing Your Assessment, What Your Assessor Won’t Tell You.pdf',
                    type: 'application/pdf',
                },
                ...evidenceFiles.map((file, idx) => ({
                    content: file,
                    filename: application.evidence[idx].name,
                    type: application.evidence[idx].type,
                }))
            ],
        });
        resolve();
    }
    catch (err) {
        reject(err);
    }
});
const createDocument = (form, origin) => new Promise(async (resolve, reject) => {
    const apiInstance = new signrequest_1.default.SignrequestQuickCreateApi();
    const data = new signrequest_1.default.SignRequestQuickCreate();
    // this template_id can be found and changed at https://codeworks.signrequest.com/api/v1/templates/
    const systemIds = (await admin.firestore().collection('system').doc('ids').get()).data();
    data.template = systemIds ? systemIds.sign_request_template : '';
    data.from_email = methods_1.isLocal() ? 'josh@southbendcodeschool.com' : 'beth@correctpropertytax.com';
    data.redirect_url = `${origin}/signed-success`; //brings the user back to our site instead of SignRequest's site
    data.signers = [{
            email: form.email,
        }];
    //must delete reasons_for_request because the 'text' field is an array which causes an error
    const reasonsForRequest = form.reasons_for_request;
    delete form.reasons_for_request;
    data.prefill_tags = [
        ...Object.keys(form).map(field => ({ external_id: field, text: form[field] })),
        {
            external_id: 'year',
            text: String(new Date().getFullYear() - 2000),
        },
        {
            external_id: 'phone_area_code',
            text: form.phone.slice(-10, -7),
        },
        {
            external_id: 'phone_remaining',
            text: form.phone.slice(-7),
        },
        ...reasonsForRequest.map((reason, idx) => ({ external_id: `reasons_for_request_${idx}`, text: reason })),
    ];
    //prevents people from filling in text that just isn't filled in
    data.disable_text = true;
    apiInstance.signrequestQuickCreateCreate(data, (error, resData) => {
        if (error)
            return reject(error);
        resolve(resData);
    });
});
//# sourceMappingURL=post-appeal-form.js.map