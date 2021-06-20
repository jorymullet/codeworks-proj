"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fs = admin.firestore();
const wsStatsRef = fs.doc('stats/workspaces');
exports.get = async (req, res) => {
    const orgId = req.query.orgId;
    const userId = req.query.userId;
    if (!(orgId || userId))
        return res.status(400).send({ message: 'Must include orgId or userId in query.' });
    const isProjectWorkspaces = !!orgId;
    const invoker = req.user.data;
    let user, org;
    if (isProjectWorkspaces) {
        org = (await fs.doc(`orgs/${orgId}`).get()).data();
        if (!org)
            return res.status(400).send({ message: 'No such org exists.' });
    }
    else {
        user = (await fs.doc(`users/${userId}`).get()).data();
        if (!user)
            return res.status(400).send({ message: 'No such user exists.' });
    }
    const isAuthenticated = (invoker.role === 'SUPER_ADMIN') // Has all power
        || (isProjectWorkspaces && (invoker.org_id === orgId)) // if project and invoker is part of org
        || (!isProjectWorkspaces && ( // is Founder and part of org as MEMBER or ADMIN
        ((invoker.role === 'ADMIN') && (invoker.org_id === user.org_id))
            || (invoker.id === userId)));
    if (!isAuthenticated)
        return res.status(400).send({ message: 'Not authenticated to get workspaces.' });
    const types = isProjectWorkspaces ? org.workspace_types || [] : ['Founder'];
    // -- Check to see all types exist and collect their ids for the transaction
    const getPromises = types.map(type => fs.collection('workspaces').where('type', '==', type).limit(1).get());
    let workspaces;
    try {
        const results = (await Promise.all(getPromises)).map((qs) => qs.docs);
        const noneOfType = types.filter((type, idx) => !results[idx].length);
        if (noneOfType.length)
            return res.status(400)
                .send({ message: `There are no more workspaces of the following type: ${noneOfType.join(', ')}. Please contact administration.` });
        workspaces = results.map(docs => docs[0].data());
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Problems reading workspaces.' });
    }
    const workspaceRefs = workspaces.map(ws => fs.doc(`workspaces/${ws.id}`));
    fs.runTransaction(async (trans) => {
        // we look again to make sure all the workspaces exists
        const docs = await trans.getAll(...workspaceRefs);
        const allStillExist = !docs.find(doc => !doc.exists);
        if (!allStillExist) {
            res.status(500).send({ message: 'Conflict when getting workspaces. Please try again.' });
            return Promise.resolve();
        }
        res.send({ workspaces });
        // update stats
        const stats = (await trans.get(wsStatsRef)).data() || {};
        types.forEach(type => {
            if (!stats[type]) {
                stats[type] = 0;
            }
            else {
                stats[type] -= 1;
            }
        });
        await trans.update(wsStatsRef, stats);
        // delete from resouvoiur
        workspaceRefs.forEach(ref => {
            trans.delete(ref);
        });
        return Promise.resolve();
    });
};
//# sourceMappingURL=get.js.map