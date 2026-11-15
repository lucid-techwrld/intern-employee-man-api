CREATE SEQUENCE employee_code_seq START 1;

CREATE TABLE employees (
  id            BIGSERIAL PRIMARY KEY,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name    VARCHAR(80) NOT NULL,
  last_name     VARCHAR(80) NOT NULL,
  email         VARCHAR(160) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  job_title     VARCHAR(120) NOT NULL,
  salary        NUMERIC(14,2) NOT NULL CHECK (salary >= 0),
  hire_date     DATE NOT NULL,
  status        VARCHAR(12) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On leave', 'Terminated')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_employees_department ON employees (department_id);
CREATE INDEX idx_employees_status ON employees (status);
CREATE INDEX idx_employees_hire_date ON employees (hire_date DESC);
CREATE INDEX idx_employees_name ON employees (last_name, first_name);
