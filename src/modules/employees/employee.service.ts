import { CACHE, EXPORT_LIMIT } from '../../constants';
import { IPaginationMeta } from '../../types/common';
import { IEmployee } from '../../types/hr';
import { AppError } from '../../utils/AppError';
import { CacheService, cacheService } from '../../utils/cache';
import { CsvUtil } from '../../utils/csv';
import { CreateEmployeeDto, ExportEmployeesQuery, ListEmployeesQuery, UpdateEmployeeDto } from './employee.dto';
import { EmployeeRepository, employeeRepository } from './employee.repository';

export class EmployeeService {
  constructor(private readonly repo: EmployeeRepository, private readonly cache: CacheService) {}

  private async invalidate() {
    await Promise.all([this.cache.del(CACHE.DASHBOARD_KEY), this.cache.del(CACHE.DEPARTMENTS_KEY)]);
  }

  private async assertEmailFree(email: string, ownId?: number) {
    const existing = await this.repo.findByEmail(email);
    if (existing && existing.id !== ownId) throw AppError.validation({ email: 'This email is already registered' });
  }

  private async assertDepartment(id: number) {
    if (!(await this.repo.departmentExists(id))) throw AppError.validation({ department_id: 'Pick a department' });
  }

  private filters(q: ExportEmployeesQuery) {
    return { q: q.q ? q.q.replace(/[\\%_]/g, '\\$&') : undefined, department_id: q.department_id, status: q.status, sort: q.sort, dir: q.dir };
  }

  async list(q: ListEmployeesQuery): Promise<{ data: IEmployee[]; meta: IPaginationMeta }> {
    const { rows, total } = await this.repo.list({ ...this.filters(q), limit: q.limit, offset: (q.page - 1) * q.limit });
    return { data: rows, meta: { page: q.page, limit: q.limit, total } };
  }

  async exportCsv(q: ExportEmployeesQuery): Promise<string> {
    const { rows } = await this.repo.list({ ...this.filters(q), limit: EXPORT_LIMIT, offset: 0 });
    return CsvUtil.build(
      ['Employee ID', 'First name', 'Last name', 'Email', 'Phone', 'Department', 'Job title', 'Monthly salary', 'Hire date', 'Status'],
      rows.map((e) => [e.employee_code, e.first_name, e.last_name, e.email, e.phone, e.department_name, e.job_title, e.salary, e.hire_date, e.status]),
    );
  }

  async getById(id: number): Promise<IEmployee> {
    const employee = await this.repo.findById(id);
    if (!employee) throw AppError.notFound('Employee not found');
    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<IEmployee> {
    await this.assertEmailFree(dto.email);
    await this.assertDepartment(dto.department_id);
    const employee = await this.repo.create(dto);
    await this.invalidate();
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<IEmployee> {
    await this.getById(id);
    if (dto.email) await this.assertEmailFree(dto.email, id);
    if (dto.department_id) await this.assertDepartment(dto.department_id);
    const employee = await this.repo.update(id, dto);
    if (!employee) throw AppError.notFound('Employee not found');
    await this.invalidate();
    return employee;
  }

  async remove(id: number): Promise<void> {
    if (!(await this.repo.remove(id))) throw AppError.notFound('Employee not found');
    await this.invalidate();
  }
}
export const employeeService = new EmployeeService(employeeRepository, cacheService);
