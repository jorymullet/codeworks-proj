"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const circle = require("../../utils/circle");
const fs = admin.firestore();
exports.leaveCircleSpace = async (req, res) => {
    // -- Validate
    const { sprintId, userId } = req.params;
    if (!(sprintId && userId))
        return res.status(400).send({ message: 'Must include sprint ID and user ID.' });
    const [sprint, user] = (await Promise.all([
        fs.doc(`sprints/${sprintId}`).get(),
        fs.doc(`users/${userId}`).get()
    ])).map(doc => doc.data());
    if (!(sprint && user))
        return res.status(400).send({ message: 'Sprint and/or user do not exist.' });
    // -- Authenticate
    const authUser = req.user.data;
    const isAuthenticated = (authUser.role === 'SUPER_ADMIN')
        || (sprint.org_id === user.org_id);
    if (!isAuthenticated)
        return res.status(400).send({ message: 'User is not authenticated.' });
    const org = (await fs.doc(`orgs/${sprint.org_id}`).get()).data();
    if (!(org && org.circle_id))
        return res.status(400).send({ message: 'Cannot create sprint: Org no longer exists.' });
    // -- Join Space
    const spaceOptions = {
        community_id: org.circle_id,
        email: user.email,
        space_id: sprint.space_id,
    };
    let response;
    try {
        response = await circle.spaces.leave(spaceOptions);
        console.log(response);
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Cannot leave circle sprint.', error: err, });
    }
    if (response.success === false) {
        console.error(response);
        if (response.message === '')
            return res.status(200).send(); // it's cool that the user was already deleted
        return res.status(400).send({ message: response.errors });
    }
    return res.status(200).send();
};
//# sourceMappingURL=leave-circle-space.js.map