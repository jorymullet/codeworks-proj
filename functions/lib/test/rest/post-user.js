"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.postUser = async (req, res) => {
    const { name, email, password, organization_name, } = req.body;
    let userRecord;
    try {
        userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
    }
    catch (err) {
        return res.status(400).send(err);
    }
    const firestore = admin.firestore();
    const user_id = userRecord.uid;
    const org_id = firestore.collection('orgs').doc().id;
    const saveWithId = (refString, body) => {
        const ref = firestore.collection(refString);
        const entityId = body.id ? body.id : ref.doc().id;
        return ref.doc(entityId).set(Object.assign({ id: entityId, created: Date.now(), deleted: false }, body));
    };
    try {
        await Promise.all([
            saveWithId('users', { name, id: user_id, }),
            saveWithId('orgs', { id: org_id, name: organization_name, }),
            saveWithId('roles', { id: `${org_id}${user_id}`, org_id, user_id, title: 'OWNER', }),
            saveWithId('private/entities/users', { id: user_id, email, type: 'PATRON' }),
            saveWithId('private/entities/orgs', { id: org_id, tier: 'BASIC', type: 'PERSONAL', }),
        ]);
    }
    catch (err) {
        console.error(err);
        await admin.auth().deleteUser(user_id);
        return res.status(400).send(err);
    }
    const authToken = await admin.auth().createCustomToken(user_id);
    return res.send({ authToken });
};
//# sourceMappingURL=post-user.js.map