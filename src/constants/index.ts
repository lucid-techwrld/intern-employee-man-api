export const EMPLOYEE_STATUSES = ['Active', 'On leave', 'Terminated'] as const;
export const EMPLOYEE_SORTS = ['name', 'department', 'salary', 'hire_date'] as const;
export const PAGINATION = { DEFAULT_LIMIT: 10, MAX_LIMIT: 50 } as const;
export const EXPORT_LIMIT = 5000;
export const CACHE = { DASHBOARD_KEY: 'hr:dashboard', DEPARTMENTS_KEY: 'hr:departments', TTL_SECONDS: 30 } as const;
export const PG_ERROR = { UNIQUE_VIOLATION: '23505', CHECK_VIOLATION: '23514', INVALID_TEXT: '22P02', FK_VIOLATION: '23503' } as const;
export const AUTH = { COOKIE_NAME: 'session', TTL_SECONDS: 8 * 60 * 60, MAX_ATTEMPTS: 5, WINDOW_MS: 15 * 60 * 1000 } as const;
