"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.createSuperAdmin = (uid, email) => new Promise(async (resolve, reject) => {
    const auth = { uid, email };
    const user = {
        role: 'SUPER_ADMIN',
        id: uid,
        created_at: Date.now(),
        email,
    };
    try {
        await admin.auth().createUser(auth);
        await admin.firestore().doc(`users/${uid}`).set(user);
        resolve('OK');
    }
    catch (err) {
        console.error(err);
        reject(err);
    }
});
//# sourceMappingURL=utils.js.map