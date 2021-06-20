import routers from '../../utils/routers'

const restRouter = routers.secure

import { createCircleSpace } from './create-circle-space'
restRouter.post('/circle-space', createCircleSpace)

import { deleteCircleSpace } from './delete-circle-space'
restRouter.delete('/:sprintId/circle-space', deleteCircleSpace)

import { joinCircleSpace } from './join-circle-space'
restRouter.put('/:sprintId/users/:userId', joinCircleSpace)

import { leaveCircleSpace } from './leave-circle-space'
restRouter.delete('/:sprintId/users/:userId', leaveCircleSpace)

import { inviteUsersToSprint } from './invite-users-to-sprint'
restRouter.post('/:sprintId/invites', inviteUsersToSprint)

export default restRouter