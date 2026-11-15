INSERT INTO departments (name, description) VALUES
  ('Engineering', 'Builds and maintains our products'),
  ('Product', 'Roadmap, research and design'),
  ('Sales', 'Customer acquisition and accounts'),
  ('Marketing', 'Brand, content and growth'),
  ('Finance', 'Accounting, payroll and budgeting'),
  ('People', 'Hiring, culture and employee support');

INSERT INTO employees (employee_code, first_name, last_name, email, phone, department_id, job_title, salary, hire_date, status)
SELECT 'EMP-' || lpad(nextval('employee_code_seq')::text, 4, '0'), v.first, v.last,
       lower(v.first || '.' || v.last) || '@seed.corp', '0803' || lpad((1000000 + row_number() OVER ())::text, 7, '0'),
       d.id, v.title, v.salary, current_date - v.days, v.status
FROM (VALUES
  ('Tunde','Bello','Engineering','Senior Engineer',950000,900,'Active'),
  ('Amara','Okafor','Engineering','Frontend Developer',720000,420,'Active'),
  ('Ife','Adeyemi','Engineering','DevOps Engineer',850000,210,'Active'),
  ('Kelechi','Nwosu','Engineering','Backend Developer',780000,60,'Active'),
  ('Musa','Ibrahim','Engineering','QA Engineer',560000,500,'Terminated'),
  ('Zainab','Musa','Product','Product Manager',900000,640,'Active'),
  ('Chidi','Eze','Product','Product Designer',680000,330,'Active'),
  ('Fatima','Yusuf','Sales','Sales Lead',600000,1100,'Active'),
  ('Segun','Alabi','Sales','Account Executive',420000,150,'Active'),
  ('Ngozi','Obi','Sales','Sales Associate',350000,20,'Active'),
  ('Halima','Sani','Marketing','Marketing Manager',650000,800,'Active'),
  ('Bayo','Ojo','Marketing','Content Strategist',400000,95,'Active'),
  ('Ada','Nnamdi','Marketing','Social Media Lead',380000,12,'Active'),
  ('Emeka','Okoro','Finance','Finance Controller',880000,1500,'Active'),
  ('Yetunde','Ajayi','Finance','Accountant',450000,260,'Active'),
  ('Hauwa','Garba','People','HR Manager',640000,980,'Active'),
  ('Tola','Bankole','People','Recruiter',360000,40,'On leave')
) AS v(first, last, dept, title, salary, days, status)
JOIN departments d ON d.name = v.dept;
