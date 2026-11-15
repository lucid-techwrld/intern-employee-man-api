import { Database } from '../../db/database';
import { IDepartment } from '../../types/hr';
import { DepartmentDto } from './department.dto';

const SELECT = `SELECT d.id, d.name, d.description, d.created_at,
  COUNT(e.id) FILTER (WHERE e.status <> 'Terminated')::int AS headcount
  FROM departments d LEFT JOIN employees e ON e.department_id = d.id`;

export class DepartmentRepository {
  async list(): Promise<IDepartment[]> {
    return (await Database.query<IDepartment>(`${SELECT} GROUP BY d.id ORDER BY d.name`)).rows;
  }
  async findById(id: number): Promise<IDepartment | null> {
    return (await Database.query<IDepartment>(`${SELECT} WHERE d.id = $1 GROUP BY d.id`, [id])).rows[0] ?? null;
  }
  async findByName(name: string): Promise<IDepartment | null> {
    return (await Database.query<IDepartment>(`${SELECT} WHERE lower(d.name) = lower($1) GROUP BY d.id`, [name])).rows[0] ?? null;
  }
  async create(d: DepartmentDto): Promise<IDepartment> {
    const { rows } = await Database.query<{ id: number }>('INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING id', [d.name, d.description]);
    return (await this.findById(rows[0].id)) as IDepartment;
  }
  async update(id: number, d: DepartmentDto): Promise<IDepartment | null> {
    const res = await Database.query('UPDATE departments SET name = $2, description = $3 WHERE id = $1', [id, d.name, d.description]);
    return (res.rowCount ?? 0) > 0 ? this.findById(id) : null;
  }
  async countEmployees(id: number): Promise<number> {
    return (await Database.query<{ n: number }>('SELECT COUNT(*) AS n FROM employees WHERE department_id = $1', [id])).rows[0].n;
  }
  async remove(id: number): Promise<boolean> {
    return ((await Database.query('DELETE FROM departments WHERE id = $1', [id])).rowCount ?? 0) > 0;
  }
}
export const departmentRepository = new DepartmentRepository();
