import { z } from 'zod';
import { EMPLOYEE_SORTS, EMPLOYEE_STATUSES, PAGINATION } from '../../constants';

const hireDate = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a hire date')
  .refine((v) => { const d = new Date(v); return !isNaN(d.getTime()) && d <= new Date(); }, 'Hire date can’t be in the future');

export const createEmployeeSchema = z.object({
  first_name: z.string().trim().min(1, 'Enter a first name').max(80),
  last_name: z.string().trim().min(1, 'Enter a last name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
  phone: z.string().trim().max(20, 'Phone is too long').optional().transform((v) => v || null),
  department_id: z.coerce.number({ invalid_type_error: 'Pick a department' }).int().positive('Pick a department'),
  job_title: z.string().trim().min(1, 'Enter a job title').max(120),
  salary: z.coerce.number({ invalid_type_error: 'Enter a salary' }).min(0, 'Salary can’t be negative').max(1_000_000_000),
  hire_date: hireDate,
  status: z.enum(EMPLOYEE_STATUSES).default('Active'),
});
export const updateEmployeeSchema = createEmployeeSchema.partial();

const filters = {
  q: z.string().trim().optional(),
  department_id: z.coerce.number().int().positive().optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  sort: z.enum(EMPLOYEE_SORTS).default('name'),
  dir: z.enum(['asc', 'desc']).default('asc'),
};
export const listEmployeesSchema = z.object({
  ...filters,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});
export const exportEmployeesSchema = z.object(filters);

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesSchema>;
export type ExportEmployeesQuery = z.infer<typeof exportEmployeesSchema>;
