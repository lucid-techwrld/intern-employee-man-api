import { EMPLOYEE_STATUSES } from '../constants';

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export interface IDepartment { id: number; name: string; description: string | null; headcount: number; created_at: string }
export interface IEmployee {
  id: number; employee_code: string; first_name: string; last_name: string; email: string; phone: string | null;
  department_id: number; department_name: string; job_title: string; salary: number; hire_date: string;
  status: EmployeeStatus; created_at: string; updated_at: string;
}
export interface IDashboard {
  total: number; active: number; on_leave: number; new_hires_30d: number; monthly_payroll: number; avg_salary: number;
  by_department: { id: number; name: string; headcount: number; avg_salary: number; payroll: number }[];
  hires_by_month: { month: string; hires: number }[];
  recent_hires: IEmployee[];
}
