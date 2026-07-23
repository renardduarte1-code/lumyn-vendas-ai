import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './CustomError';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      code: error.code,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      issues: error.errors,
    });
  }

  if ((error as FastifyError).validation) {
    return reply.status(400).send({
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
