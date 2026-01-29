import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { normalizeError } from '../utils/error-maps';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const requestId = request.headers['x-request-id'] || 'system';

    const internalMessage = exceptionResponse['message'] || exception.message || 'Error occurred';
    const internalError = exceptionResponse['error'] || exception.name || 'HttpException';

    // Map internal error to public safe response
    const publicError = normalizeError(internalError, Array.isArray(internalMessage) ? internalMessage[0] : internalMessage);

    // Log the full error internally with requestId
    logger.error(`[${requestId}] ${internalError}: ${Array.isArray(internalMessage) ? internalMessage.join(', ') : internalMessage}`, {
      stack: exception.stack,
      path: request.url,
      method: request.method,
    });

    const errorResponse = {
      success: false,
      requestId,
      error: {
        statusCode: publicError.statusCode || status,
        type: publicError.type,
        message: publicError.message,
        ...(Array.isArray(internalMessage) && { details: internalMessage }), // Include validation details if they exist
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(errorResponse.error.statusCode).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] || 'system';

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()['message'] || exception.message
      : exception instanceof Error ? exception.message : 'Internal server error';

    const errorType = exception instanceof HttpException
      ? exception.getResponse()['error'] || exception.name
      : exception instanceof Error ? exception.name : 'InternalServerError';

    // Log the full unexpected error internally
    logger.error(`[${requestId}] UNHANDLED_EXCEPTION: ${message}`, {
      stack: exception instanceof Error ? exception.stack : undefined,
      path: request.url,
      method: request.method,
    });

    const errorResponse = {
      success: false,
      requestId,
      error: {
        statusCode: status,
        type: errorType,
        message: status === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred. Please contact support.'
          : message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }
}