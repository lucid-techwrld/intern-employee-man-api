import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { CacheService } from '../../utils/cache';
import { CsvUtil } from '../../utils/csv';
import { IEmployee } from '../../types/hr';

const employee: IEmployee = { id: 1, employee_code: 'EMP-0001', first_name: 'Amara', last_name: 'Okafor', email: 'amara@corp.com', phone: null, department_id: 2, department_name: 'Product', job_title: 'Designer', salary: 500000, hire_date: '2024-01-10', status: 'Active', created_at: '', updated_at: '' };
const input = { first_name: 'Amara', last_name: 'Okafor', email: 'amara@corp.com', phone: null, department_id: 2, job_title: 'Designer', salary: 500000, hire_date: '2024-01-10', status: 'Active' as const };

let repo: Record<string, ReturnType<typeof vi.fn>>;
let cache: Record<string, ReturnType<typeof vi.fn>>;
let service: EmployeeService;

beforeEach(() => {
  repo = { list: vi.fn().mockResolvedValue({ rows: [employee], total: 1 }), findById: vi.fn().mockResolvedValue(employee), findByEmail: vi.fn().mockResolvedValue(null), departmentExists: vi.fn().mockResolvedValue(true), create: vi.fn().mockResolvedValue(employee), update: vi.fn().mockResolvedValue(employee), remove: vi.fn().mockResolvedValue(true) };
  cache = { get: vi.fn(), set: vi.fn(), del: vi.fn() };
  service = new EmployeeService(repo as unknown as EmployeeRepository, cache as unknown as CacheService);
});

describe('EmployeeService', () => {
  it('creates an employee and clears cached reports', async () => {
    await expect(service.create(input)).resolves.toEqual(employee);
    expect(cache.del).toHaveBeenCalledTimes(2);
  });
  it('rejects a duplicate email', async () => {
    repo.findByEmail.mockResolvedValue({ ...employee, id: 9 });
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 422, errors: { email: expect.any(String) } });
  });
  it('rejects an unknown department', async () => {
    repo.departmentExists.mockResolvedValue(false);
    await expect(service.create(input)).rejects.toMatchObject({ statusCode: 422, errors: { department_id: expect.any(String) } });
  });
  it('lets an employee keep their own email on update', async () => {
    repo.findByEmail.mockResolvedValue(employee);
    await expect(service.update(1, { email: 'amara@corp.com' })).resolves.toEqual(employee);
  });
  it('404s when updating or deleting a missing employee', async () => {
    repo.findById.mockResolvedValue(null); repo.remove.mockResolvedValue(false);
    await expect(service.update(5, { job_title: 'x' })).rejects.toMatchObject({ statusCode: 404 });
    await expect(service.remove(5)).rejects.toMatchObject({ statusCode: 404 });
  });
  it('escapes search wildcards and paginates', async () => {
    await service.list({ q: '100%', sort: 'name', dir: 'asc', page: 3, limit: 10 });
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ q: '100\\%', offset: 20, limit: 10 }));
  });
  it('exports a CSV with a header row', async () => {
    const csv = await service.exportCsv({ sort: 'name', dir: 'asc' });
    expect(csv.split('\r\n')[0]).toContain('"Employee ID"');
    expect(csv).toContain('"EMP-0001"');
  });
});

describe('CsvUtil', () => {
  it('neutralises spreadsheet formulas and escapes quotes', () => {
    expect(CsvUtil.cell('=SUM(A1)')).toBe(`"'=SUM(A1)"`);
    expect(CsvUtil.cell('say "hi"')).toBe('"say ""hi"""');
  });
});
