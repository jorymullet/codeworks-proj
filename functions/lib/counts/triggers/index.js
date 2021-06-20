"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fs = admin.firestore();
const listeners = __1.countCollections.map(coll => functions.firestore.document(`${coll}/{id}`).onWrite(async (change) => {
    let increment = 0;
    const isNew = !change.before.exists;
    if (isNew)
        increment = 1;
    const isDeleted = !change.after.exists;
    if (isDeleted)
        increment = -1;
    if (increment) {
        const entity = change.after.data() || change.before.data() || {};
        if (!entity.org_id)
            return;
        const orgStatsRef = fs.doc(`stats/orgs/byOrg/${entity.org_id}`);
        const orgStats = (await orgStatsRef.get()).data() || {};
        const currentAmount = orgStats[coll] || 0;
        orgStats[coll] = currentAmount + increment;
        return orgStatsRef.set(orgStats);
    }
    return null;
})).reduce((obj, listener, idx) => {
    obj[__1.countCollections[idx]] = listener;
    return obj;
}, {});
exports.default = listeners;
//# sourceMappingURL=index.js.map