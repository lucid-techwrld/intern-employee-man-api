import { CACHE } from '../../constants';
import { IDepartment } from '../../types/hr';
import { AppError } from '../../utils/AppError';
import { CacheService, cacheService } from '../../utils/cache';
import { DepartmentDto } from './department.dto';
import { DepartmentRepository, departmentRepository } from './department.repository';

export class DepartmentService {
  constructor(private readonly repo: DepartmentRepository, private readonly cache: CacheService) {}

  private async invalidate() {
    await Promise.all([this.cache.del(CACHE.DEPARTMENTS_KEY), this.cache.del(CACHE.DASHBOARD_KEY)]);
  }

  private async assertNameFree(name: string, ownId?: number) {
    const existing = await this.repo.findByName(name);
    if (existing && existing.id !== ownId) throw AppError.validation({ name: 'A department with this name already exists' });
  }

  async list(): Promise<IDepartment[]> {
    const cached = await this.cache.get<IDepartment[]>(CACHE.DEPARTMENTS_KEY);
    if (cached) return cached;
    const rows = await this.repo.list();
    await this.cache.set(CACHE.DEPARTMENTS_KEY, rows, CACHE.TTL_SECONDS);
    return rows;
  }

  async create(dto: DepartmentDto): Promise<IDepartment> {
    await this.assertNameFree(dto.name);
    const department = await this.repo.create(dto);
    await this.invalidate();
    return department;
  }

  async update(id: number, dto: DepartmentDto): Promise<IDepartment> {
    if (!(await this.repo.findById(id))) throw AppError.notFound('Department not found');
    await this.assertNameFree(dto.name, id);
    const department = await this.repo.update(id, dto);
    if (!department) throw AppError.notFound('Department not found');
    await this.invalidate();
    return department;
  }

  async remove(id: number): Promise<void> {
    if (!(await this.repo.findById(id))) throw AppError.notFound('Department not found');
    if ((await this.repo.countEmployees(id)) > 0) throw new AppError(409, 'This department still has employees. Move them first.');
    await this.repo.remove(id);
    await this.invalidate();
  }
}
export const departmentService = new DepartmentService(departmentRepository, cacheService);
