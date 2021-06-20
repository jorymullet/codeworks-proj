"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const fs = admin.firestore();
const progressesRef = fs.collection('progresses');
exports.get = async (req, res) => {
    //createSuperAdmin('auth0|60a6b5b101db420071aaff89', 'kerrie@invanti.co')
    return res.send('hi');
};
//# sourceMappingURL=get.js.map