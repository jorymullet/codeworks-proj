import routers from '../../utils/routers'

export const restAdminRouter = routers.admin
export const restWhitelistedRouter = routers.unsecure

import { postInvite } from './post'
restAdminRouter.post('', postInvite)

import { updateInvite } from './update-invite'
restWhitelistedRouter.put('/:inviteId', updateInvite)
