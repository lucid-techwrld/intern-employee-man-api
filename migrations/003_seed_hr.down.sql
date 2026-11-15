DELETE FROM employees WHERE email LIKE '%@seed.corp';
DELETE FROM departments WHERE name IN ('Engineering','Product','Sales','Marketing','Finance','People')
  AND NOT EXISTS (SELECT 1 FROM employees WHERE employees.department_id = departments.id);
