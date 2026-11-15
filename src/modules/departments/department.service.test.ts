import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DepartmentService } from './department.service';
import { DepartmentRepository } from './department.repository';
import { CacheService } from '../../utils/cache';
import { IDepartment } from '../../types/hr';

const dept: IDepartment = { id: 1, name: 'Sales', description: null, headcount: 3, created_at: '' };
let repo: Record<string, ReturnType<typeof vi.fn>>;
let cache: Record<string, ReturnType<typeof vi.fn>>;
let service: DepartmentService;

beforeEach(() => {
  repo = { list: vi.fn(), findById: vi.fn().mockResolvedValue(dept), findByName: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue(dept), update: vi.fn().mockResolvedValue(dept), countEmployees: vi.fn().mockResolvedValue(0), remove: vi.fn() };
  cache = { get: vi.fn().mockResolvedValue(null), set: vi.fn(), del: vi.fn() };
  service = new DepartmentService(repo as unknown as DepartmentRepository, cache as unknown as CacheService);
});

describe('DepartmentService', () => {
  it('rejects a duplicate name', async () => {
    repo.findByName.mockResolvedValue({ ...dept, id: 2 });
    await expect(service.create({ name: 'Sales', description: null })).rejects.toMatchObject({ statusCode: 422, errors: { name: expect.any(String) } });
  });
  it('lets a department keep its own name when editing', async () => {
    repo.findByName.mockResolvedValue(dept);
    await expect(service.update(1, { name: 'Sales', description: 'Revenue' })).resolves.toEqual(dept);
  });
  it('refuses to delete a department that still has employees', async () => {
    repo.countEmployees.mockResolvedValue(2);
    await expect(service.remove(1)).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.remove).not.toHaveBeenCalled();
  });
  it('deletes an empty department and clears the cache', async () => {
    await service.remove(1);
    expect(repo.remove).toHaveBeenCalledWith(1);
    expect(cache.del).toHaveBeenCalled();
  });
  it('serves the list from cache when present', async () => {
    cache.get.mockResolvedValue([dept]);
    expect(await service.list()).toEqual([dept]);
    expect(repo.list).not.toHaveBeenCalled();
  });
});
