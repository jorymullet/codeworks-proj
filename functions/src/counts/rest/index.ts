import routers from '../../utils/routers'

const restRouter = routers.admin

import { countOrgEntities } from './count-org-entities'
restRouter.get('/:orgId/refresh', countOrgEntities)

export default restRouter