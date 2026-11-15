import { Database } from '../../db/database';
import { IDashboard } from '../../types/hr';

export class DashboardRepository {
  async totals() {
    return (await Database.query<Pick<IDashboard, 'total' | 'active' | 'on_leave' | 'new_hires_30d' | 'monthly_payroll' | 'avg_salary'>>(
      `SELECT COUNT(*) FILTER (WHERE status <> 'Terminated') AS total,
              COUNT(*) FILTER (WHERE status = 'Active') AS active,
              COUNT(*) FILTER (WHERE status = 'On leave') AS on_leave,
              COUNT(*) FILTER (WHERE status <> 'Terminated' AND hire_date >= current_date - 30) AS new_hires_30d,
              COALESCE(SUM(salary) FILTER (WHERE status <> 'Terminated'), 0) AS monthly_payroll,
              COALESCE(AVG(salary) FILTER (WHERE status <> 'Terminated'), 0) AS avg_salary
       FROM employees`)).rows[0];
  }
  async byDepartment() {
    return (await Database.query<IDashboard['by_department'][number]>(
      `SELECT d.id, d.name,
              COUNT(e.id) FILTER (WHERE e.status <> 'Terminated')::int AS headcount,
              COALESCE(AVG(e.salary) FILTER (WHERE e.status <> 'Terminated'), 0) AS avg_salary,
              COALESCE(SUM(e.salary) FILTER (WHERE e.status <> 'Terminated'), 0) AS payroll
       FROM departments d LEFT JOIN employees e ON e.department_id = d.id
       GROUP BY d.id ORDER BY headcount DESC, d.name`)).rows;
  }
  async hiresByMonth() {
    return (await Database.query<IDashboard['hires_by_month'][number]>(
      `SELECT to_char(g.m, 'YYYY-MM') AS month,
              (SELECT COUNT(*) FROM employees WHERE date_trunc('month', hire_date) = g.m)::int AS hires
       FROM generate_series(date_trunc('month', current_date) - interval '5 months', date_trunc('month', current_date), interval '1 month') AS g(m)
       ORDER BY g.m`)).rows;
  }
}
export const dashboardRepository = new DashboardRepository();
