import { Request } from 'express';
import { AppError } from './AppError';

export const ParamUtil = {
  id(req: Request, name = 'id'): number {
    const id = Number(req.params[name]);
    if (!Number.isInteger(id) || id < 1) throw AppError.badRequest(`Invalid ${name}`);
    return id;
  },
};
