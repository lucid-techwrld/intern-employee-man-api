import { Router } from 'express';
import { ValidateMiddleware } from '../../middleware/validate';
import { AsyncUtil } from '../../utils/asyncHandler';
import { createEmployeeSchema, exportEmployeesSchema, listEmployeesSchema, updateEmployeeSchema } from './employee.dto';
import { employeeController as c } from './employee.controller';

const router = Router();
router.get('/', ValidateMiddleware.handle(listEmployeesSchema, 'query'), AsyncUtil.wrap(c.list));
router.get('/export', ValidateMiddleware.handle(exportEmployeesSchema, 'query'), AsyncUtil.wrap(c.exportCsv));
router.get('/:id', AsyncUtil.wrap(c.getOne));
router.post('/', ValidateMiddleware.handle(createEmployeeSchema, 'body'), AsyncUtil.wrap(c.create));
router.put('/:id', ValidateMiddleware.handle(updateEmployeeSchema, 'body'), AsyncUtil.wrap(c.update));
router.delete('/:id', AsyncUtil.wrap(c.remove));
export { router as employeeRoutes };
