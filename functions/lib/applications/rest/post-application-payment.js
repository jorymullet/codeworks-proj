"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const email_1 = require("../../utils/email");
const stripe_1 = require("./../../utils/stripe");
exports.postApplicationPayment = async (req, res) => {
    const applicationId = req.params.applicationId;
    if (!applicationId)
        return res.status(400).send({ message: 'Must include application id' });
    const applicationsRef = admin.firestore().collection('applications');
    const origin = req.body.origin;
    const token = req.body.token;
    const application = (await applicationsRef.doc(applicationId).get()).data();
    if (!(application && token && origin))
        return res.status(400).send({ message: 'Must include valid application and token.' });
    if (application.paid)
        return res.status(400).send({ message: 'This has already been paid. No need to pay again!', code: 'ALREADY_PAID' });
    // amount is standardized but can be overridden if the override_price is declared on the application
    let amount = application.override_price;
    if (!amount) {
        const prices = (await admin.firestore().collection('system').doc('prices').get()).data();
        amount = prices && prices.residential;
    }
    // create customer in case we'd ever want to use this info
    let customer;
    try {
        customer = await stripe_1.stripe.customers.create({
            name: application.name,
            email: application.email,
            source: token.id,
        });
    }
    catch (err) {
        console.error('Trouble creating customer at application payment: ', err);
        return res.status(400).send({ message: err.raw.message });
    }
    // save charge in case we need to use this ish later
    let charge;
    try {
        charge = await stripe_1.stripe.charges.create({
            amount,
            currency: 'usd',
            customer: customer.id,
            receipt_email: application.email,
        });
    }
    catch (err) {
        console.error('Error charging customer at application payment: ', err);
        stripe_1.stripe.customers.del(customer.id);
        return res.status(400).send({ message: err.raw.message });
    }
    // a payment for us will simply be a culmination of info that ties application and charge and customer together
    const paymentRef = admin.firestore().collection('payments');
    const paymentId = paymentRef.doc().id;
    const payment = {
        id: paymentId,
        customer_id: customer.id,
        charge_id: charge.id,
        application_id: applicationId,
        amount,
        created: Date.now(),
        type: 'APPLICATION',
    };
    // saves payment and updates application
    try {
        await Promise.all([
            paymentRef.doc(paymentId).set(payment),
            applicationsRef.doc(applicationId).update({ paid: true }),
        ]);
    }
    catch (err) {
        console.error('Trouble saving entities in FireStore on application payment: ', err);
        return res.status(400).send({ message: 'Payment was successful but other error occured. Contact help on website for more info.' });
    }
    // Sends emails to applicant and admins
    const adminsToEmail = await email_1.getNotifiees('applicant_paid');
    const emailsOptions = [
        ...adminsToEmail.map(email => ({
            to: email,
            substitutions: {
                applicants_url: `${origin}/admin/applicants?statusKey=approvedPaid`,
                applicant_name: application.name,
            },
            template: 'application_paid_to_admin',
        })),
        {
            to: application.email,
            substitutions: {
                applicant_name: application.name,
                questions_link: `${origin}/appeal-questionnaire?applicationId=${application.id}`,
            },
            template: 'application_paid_to_applicant',
        },
    ];
    try {
        await Promise.all(emailsOptions.map(emailOptions => email_1.send(emailOptions)));
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Application paid but could not send emails. This is not your fault. We have been alerted and will look into it.' });
    }
    return res.send({ message: 'OK' });
};
//# sourceMappingURL=post-application-payment.js.map