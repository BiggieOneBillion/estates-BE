import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { normalizeError, ERROR_MAPS } from '../utils/error-maps';

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

    // Map internal error to public safe response
    const publicError = normalizeError(errorType, message);

    // If it was a generic 500 but normalized to something else (like CONFLICT), update status
    const finalStatus = status === HttpStatus.INTERNAL_SERVER_ERROR && publicError.statusCode !== HttpStatus.INTERNAL_SERVER_ERROR
      ? publicError.statusCode
      : status;

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
        statusCode: finalStatus,
        type: publicError.type,
        message: finalStatus === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production'
          ? ERROR_MAPS['InternalServerError'].message
          : publicError.message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(finalStatus).json(errorResponse);
  }
}