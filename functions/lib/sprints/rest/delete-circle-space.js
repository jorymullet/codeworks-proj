"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const circle = require("../../utils/circle");
const fs = admin.firestore();
exports.deleteCircleSpace = async (req, res) => {
    // -- Validate
    const sprintId = req.params.sprintId;
    const user = req.user.data;
    if (!(sprintId && user))
        return res.status(400).send({ message: 'Must include sprint ID and user.' });
    const sprint = (await fs.doc(`sprints/${sprintId}`).get()).data();
    if (!sprint)
        return res.status(400).send({ message: 'Sprint does not exists.' });
    // -- Authenticate
    const isAuthenticated = (user.role === 'SUPER_ADMIN')
        || (sprint.org_id === user.org_id);
    if (!isAuthenticated)
        return res.status(400).send({ message: 'User is not authenticated.' });
    const org = (await fs.doc(`orgs/${sprint.org_id}`).get()).data();
    if (!(org && org.circle_id))
        return res.status(400).send({ message: 'Cannot create sprint: Org no longer exists.' });
    // -- Delete Space
    const deleteOptions = {
        id: sprint.space_id,
        communityId: org.circle_id,
    };
    let response;
    try {
        response = await circle.spaces.delete(deleteOptions);
    }
    catch (err) {
        console.error(err);
        return res.status(400).send({ message: 'Cannot create sprint: Couldn\'t create circle commuity space.' });
    }
    if (response.success === false) {
        return res.status(200).send({ message: response.errors });
    }
    res.send('OK');
};
//# sourceMappingURL=delete-circle-space.js.map