import { Request, Response } from 'express';
import { ParamUtil } from '../../utils/params';
import { ResponseUtil } from '../../utils/response';
import { CreateEmployeeDto, ExportEmployeesQuery, ListEmployeesQuery, UpdateEmployeeDto } from './employee.dto';
import { EmployeeService, employeeService } from './employee.service';

export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  list = async (req: Request, res: Response) => { const { data, meta } = await this.service.list(req.validated as ListEmployeesQuery); ResponseUtil.success(res, data, 200, meta); };
  exportCsv = async (req: Request, res: Response) => {
    const csv = await this.service.exportCsv(req.validated as ExportEmployeesQuery);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csv);
  };
  getOne = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.getById(ParamUtil.id(req)));
  create = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.create(req.validated as CreateEmployeeDto), 201);
  update = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.update(ParamUtil.id(req), req.validated as UpdateEmployeeDto));
  remove = async (req: Request, res: Response) => { await this.service.remove(ParamUtil.id(req)); ResponseUtil.noContent(res); };
}
export const employeeController = new EmployeeController(employeeService);
