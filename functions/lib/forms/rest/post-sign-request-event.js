"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
exports.postSignRequestEvent = (req, res) => {
    const event = req.body;
    if (event.event_type === 'signed')
        return handleSignedEvent(event, res);
    return res.send('OK');
};
const handleSignedEvent = async (event, res) => {
    let applicationsSS;
    let signrequestId;
    const applicationsRef = admin.firestore().collection('applications');
    try {
        signrequestId = event.document.signrequest.uuid;
        applicationsSS = (await applicationsRef.where('sign_request_id', '==', signrequestId).get());
    }
    catch (err) {
        console.error('Trouble finding application: ', err);
        return res.send('OK');
    }
    if (applicationsSS.empty) {
        console.error(`Sign Request webhook could not find application associated with ${signrequestId} whose pdf is at ${event.document.pdf}.`);
        return res.send('OK');
    }
    const application = applicationsSS.docs[0].data();
    let appealFormUrl;
    try {
        appealFormUrl = await email_1.downloadFileFromURL(event.document.pdf, `forms/${application.id}/appeal_form.pdf`);
    }
    catch (err) {
        return res.status(400).send({ message: 'Could not download and upload to Firebase the appeal form.', err });
    }
    try {
        await applicationsRef.doc(application.id).update({ appeal_form_url: appealFormUrl });
    }
    catch (err) {
        console.error('Could not update application with ID:', err);
        return res.send('OK');
    }
    res.send('OK');
};
//# sourceMappingURL=post-sign-request-event.js.map