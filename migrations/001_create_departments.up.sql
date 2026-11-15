CREATE TABLE departments (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(80) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
