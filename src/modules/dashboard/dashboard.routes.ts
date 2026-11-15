import { Request, Response, Router } from 'express';
import { AsyncUtil } from '../../utils/asyncHandler';
import { ResponseUtil } from '../../utils/response';
import { dashboardService } from './dashboard.service';

const router = Router();
router.get('/', AsyncUtil.wrap(async (_req: Request, res: Response) => ResponseUtil.success(res, await dashboardService.get())));
export { router as dashboardRoutes };
