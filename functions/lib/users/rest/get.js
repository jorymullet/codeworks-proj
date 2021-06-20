"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const usersRef = admin.firestore().collection('users');
/**
 * This endpoint works to both authenticate the user in Auth0 AND can be used
 * to create new users.
 */
exports.get = async (req, res) => {
    console.log(req.headers);
    return res.send({
        //id: '678418zzz',
        //id: '678418',
        //name: 'Joshua Mullet',
        //email: 'rtlive4g@gmail.com',
        email: 'joshua@sbcodeworks.com',
    });
};
//# sourceMappingURL=get.js.map