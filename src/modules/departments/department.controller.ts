import { Request, Response } from 'express';
import { ParamUtil } from '../../utils/params';
import { ResponseUtil } from '../../utils/response';
import { DepartmentDto } from './department.dto';
import { DepartmentService, departmentService } from './department.service';

export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}
  list = async (_req: Request, res: Response) => ResponseUtil.success(res, await this.service.list());
  create = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.create(req.validated as DepartmentDto), 201);
  update = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.update(ParamUtil.id(req), req.validated as DepartmentDto));
  remove = async (req: Request, res: Response) => { await this.service.remove(ParamUtil.id(req)); ResponseUtil.noContent(res); };
}
export const departmentController = new DepartmentController(departmentService);
