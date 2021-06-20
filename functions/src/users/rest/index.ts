import routers from '../../utils/routers'

export const unsecureRestRouter = routers.unsecure
export const whitelistedRestRouter = routers.whitelisted
export const adminRestRouter = routers.admin

import { post } from './create-and-sign-in'
whitelistedRestRouter.post('', post)

import { getByEmail } from './getByEmail'
unsecureRestRouter.get('/byEmail/:email', getByEmail)

import { _delete } from './delete'
adminRestRouter.delete('/:userId', _delete)