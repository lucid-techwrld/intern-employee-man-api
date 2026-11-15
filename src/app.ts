import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { AuthMiddleware } from './middleware/auth';
import { ErrorMiddleware } from './middleware/error';
import { authRoutes } from './modules/auth/auth.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { departmentRoutes } from './modules/departments/department.routes';
import { employeeRoutes } from './modules/employees/employee.routes';
import { logger } from './utils/logger';

export class App {
  readonly app: Express = express();

  constructor() { this.middleware(); this.routes(); this.errors(); }

  private middleware() {
    this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
    this.app.use(express.json({ limit: '100kb' }));
    this.app.use(cookieParser());
    this.app.use(morgan('tiny', { stream: { write: (m) => logger.http(m.trim()) } }));
  }
  private routes() {
    this.app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    this.app.use('/api', AuthMiddleware.csrfGuard);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api', AuthMiddleware.requireAuth);
    this.app.use('/api/employees', employeeRoutes);
    this.app.use('/api/departments', departmentRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
  }
  private errors() {
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handle);
  }
}
export default new App().app;
