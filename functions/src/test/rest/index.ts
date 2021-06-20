import routers from '../../utils/routers'

const restRouter = routers.unsecure

import { get } from './get'
restRouter.get('', get)

export default restRouter