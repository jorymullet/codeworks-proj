import routers from '../../utils/routers'

const restRouter = routers.secure

import { get } from './get'
restRouter.get('', get)

export default restRouter