import { CACHE } from '../../constants';
import { IDashboard } from '../../types/hr';
import { CacheService, cacheService } from '../../utils/cache';
import { EmployeeRepository, employeeRepository } from '../employees/employee.repository';
import { DashboardRepository, dashboardRepository } from './dashboard.repository';

export class DashboardService {
  constructor(private readonly repo: DashboardRepository, private readonly employees: EmployeeRepository, private readonly cache: CacheService) {}

  async get(): Promise<IDashboard> {
    const cached = await this.cache.get<IDashboard>(CACHE.DASHBOARD_KEY);
    if (cached) return cached;
    const [totals, by_department, hires_by_month, recent] = await Promise.all([
      this.repo.totals(), this.repo.byDepartment(), this.repo.hiresByMonth(),
      this.employees.list({ sort: 'hire_date', dir: 'desc', limit: 5, offset: 0 }),
    ]);
    const dashboard: IDashboard = { ...totals, by_department, hires_by_month, recent_hires: recent.rows };
    await this.cache.set(CACHE.DASHBOARD_KEY, dashboard, CACHE.TTL_SECONDS);
    return dashboard;
  }
}
export const dashboardService = new DashboardService(dashboardRepository, employeeRepository, cacheService);
