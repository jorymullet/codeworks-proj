"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const __1 = require("..");
const fs = admin.firestore();
exports.countOrgEntities = async (req, res) => {
    // -- Validate
    const { orgId } = req.params;
    if (!(orgId))
        return res.status(400).send({ message: 'Must include orgId.' });
    const [org,] = (await Promise.all([
        fs.doc(`orgs/${orgId}`).get(),
    ])).map(doc => doc.data());
    if (!org)
        return res.status(400).send({ message: 'Could not find org.' });
    // -- Authenticate
    const authUser = req.user.data;
    const isAuthenticated = (authUser.role === 'SUPER_ADMIN')
        || (orgId === authUser.org_id);
    if (!isAuthenticated)
        return res.status(400).send({ message: 'User is not authenticated.' });
    const orgCounts = __1.countCollections.reduce((obj, coll) => {
        obj[coll] = -1;
        return obj;
    }, {});
    const isComplete = () => Object.values(orgCounts).every((num) => num > -1);
    const checkIfDone = () => {
        if (!isComplete())
            return;
        fs.doc(`stats/orgs/byOrg/${orgId}`).set(orgCounts);
    };
    __1.countCollections.forEach(async (coll) => {
        const amount = (await fs.collection(coll).where('org_id', '==', orgId).get()).docs.length;
        orgCounts[coll] = amount;
        checkIfDone();
    });
    return res.status(200).send();
};
//# sourceMappingURL=count-org-entities.js.map