import { Database } from '../../db/database';
import { IEmployee } from '../../types/hr';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';

const SELECT = `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone, e.department_id, d.name AS department_name,
  e.job_title, e.salary, e.hire_date, e.status, e.created_at, e.updated_at
  FROM employees e JOIN departments d ON d.id = e.department_id`;
const SORTS: Record<string, (dir: string) => string> = {
  name: (d) => `e.last_name ${d}, e.first_name ${d}`,
  department: (d) => `d.name ${d}`,
  salary: (d) => `e.salary ${d}`,
  hire_date: (d) => `e.hire_date ${d}`,
};
const EDITABLE = ['first_name', 'last_name', 'email', 'phone', 'department_id', 'job_title', 'salary', 'hire_date', 'status'] as const;

export interface IEmployeeFilters { q?: string; department_id?: number; status?: string; sort: string; dir: 'asc' | 'desc'; limit: number; offset: number }

export class EmployeeRepository {
  async list(f: IEmployeeFilters): Promise<{ rows: IEmployee[]; total: number }> {
    const [rows, total] = await Promise.all([
      Database.query<IEmployee>(
        `${SELECT}
         WHERE ($1::text IS NULL OR (e.first_name || ' ' || e.last_name || ' ' || e.email || ' ' || e.employee_code || ' ' || e.job_title) ILIKE '%' || $1 || '%')
           AND ($2::bigint IS NULL OR e.department_id = $2)
           AND ($3::text IS NULL OR e.status = $3)
         ORDER BY ${SORTS[f.sort](f.dir === 'desc' ? 'DESC' : 'ASC')}, e.id ASC LIMIT $4 OFFSET $5`,
        [f.q ?? null, f.department_id ?? null, f.status ?? null, f.limit, f.offset],
      ),
      this.count(f),
    ]);
    return { rows: rows.rows, total };
  }

  private async count(f: IEmployeeFilters): Promise<number> {
    return (await Database.query<{ n: number }>(
      `SELECT COUNT(*) AS n FROM employees e
       WHERE ($1::text IS NULL OR (e.first_name || ' ' || e.last_name || ' ' || e.email || ' ' || e.employee_code || ' ' || e.job_title) ILIKE '%' || $1 || '%')
         AND ($2::bigint IS NULL OR e.department_id = $2) AND ($3::text IS NULL OR e.status = $3)`,
      [f.q ?? null, f.department_id ?? null, f.status ?? null])).rows[0].n;
  }

  async findById(id: number): Promise<IEmployee | null> {
    return (await Database.query<IEmployee>(`${SELECT} WHERE e.id = $1`, [id])).rows[0] ?? null;
  }
  async findByEmail(email: string): Promise<IEmployee | null> {
    return (await Database.query<IEmployee>(`${SELECT} WHERE e.email = $1`, [email])).rows[0] ?? null;
  }
  async departmentExists(id: number): Promise<boolean> {
    return ((await Database.query('SELECT 1 FROM departments WHERE id = $1', [id])).rowCount ?? 0) > 0;
  }

  async create(d: CreateEmployeeDto): Promise<IEmployee> {
    const { rows } = await Database.query<{ id: number }>(
      `INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, job_title, salary, hire_date, status)
       VALUES ('EMP-' || lpad(nextval('employee_code_seq')::text, 4, '0'), $1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [d.first_name, d.last_name, d.email, d.phone, d.department_id, d.job_title, d.salary, d.hire_date, d.status]);
    return (await this.findById(rows[0].id)) as IEmployee;
  }

  async update(id: number, d: UpdateEmployeeDto): Promise<IEmployee | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    EDITABLE.forEach((k) => { if (d[k] !== undefined) { values.push(d[k]); sets.push(`${k} = $${values.length}`); } });
    if (!sets.length) return this.findById(id);
    values.push(id);
    const res = await Database.query(`UPDATE employees SET ${sets.join(', ')}, updated_at = now() WHERE id = $${values.length}`, values);
    return (res.rowCount ?? 0) > 0 ? this.findById(id) : null;
  }

  async remove(id: number): Promise<boolean> {
    return ((await Database.query('DELETE FROM employees WHERE id = $1', [id])).rowCount ?? 0) > 0;
  }
}
export const employeeRepository = new EmployeeRepository();
