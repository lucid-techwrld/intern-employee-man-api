import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().trim().min(1, 'Enter a department name').max(80),
  description: z.string().trim().max(200, 'Keep the description under 200 characters').optional().transform((v) => v || null),
});
export type DepartmentDto = z.infer<typeof departmentSchema>;
