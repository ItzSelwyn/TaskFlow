import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { sendSuccess } from '../utils/response';
import { z } from 'zod';
import { TaskPriority, TaskStatus } from '../types/enums';

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  assignedToId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

const updateSchema = createSchema.partial();

const filtersSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.string().optional().transform((v) => v?.split(',')),
  page: z.string().optional().transform((v) => v ? parseInt(v) : 1),
  limit: z.string().optional().transform((v) => v ? Math.min(parseInt(v), 100) : 20),
  dueBefore: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  dueAfter: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
});

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = filtersSchema.parse(req.query);
    const result = await taskService.getTasks(req.user! as any, filters);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTaskById(req.user! as any, req.params.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body);
    const task = await taskService.createTask(req.user! as any, data);
    sendSuccess(res, task, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSchema.parse(req.body);
    const task = await taskService.updateTask(req.user! as any, req.params.id, data);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await taskService.deleteTask(req.user! as any, req.params.id);
    sendSuccess(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

export const exportCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await taskService.exportTasksCSV(req.user! as any);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
