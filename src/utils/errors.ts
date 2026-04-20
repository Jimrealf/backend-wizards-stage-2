import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "../types/api.js";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string): AppError =>
  new AppError(400, message);

export const unprocessable = (message: string): AppError =>
  new AppError(422, message);

export const notFound = (message: string): AppError =>
  new AppError(404, message);

export const badGateway = (message: string): AppError =>
  new AppError(502, message);

export const serverError = (message: string): AppError =>
  new AppError(500, message);

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    const framework = err as Error & { statusCode?: number; status?: number };
    const frameworkStatus = framework.statusCode ?? framework.status;
    if (typeof frameworkStatus === "number" && frameworkStatus >= 400 && frameworkStatus < 500) {
      statusCode = frameworkStatus;
      message = "Invalid request body";
    }
  }

  const correlationId = Math.random().toString(36).substring(2, 10);
  console.error(`[${correlationId}] ${err.message}`, err.stack);

  const body: ApiErrorResponse = { status: "error", message };
  res.status(statusCode).json(body);
}
