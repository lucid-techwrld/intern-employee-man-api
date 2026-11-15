import { Router } from 'express';
import { ValidateMiddleware } from '../../middleware/validate';
import { AsyncUtil } from '../../utils/asyncHandler';
import { departmentSchema } from './department.dto';
import { departmentController as c } from './department.controller';

const router = Router();
router.get('/', AsyncUtil.wrap(c.list));
router.post('/', ValidateMiddleware.handle(departmentSchema, 'body'), AsyncUtil.wrap(c.create));
router.put('/:id', ValidateMiddleware.handle(departmentSchema, 'body'), AsyncUtil.wrap(c.update));
router.delete('/:id', AsyncUtil.wrap(c.remove));
export { router as departmentRoutes };
