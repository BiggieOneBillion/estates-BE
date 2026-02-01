import { HttpStatus } from '@nestjs/common';

export interface ErrorMap {
  statusCode: number;
  type: string;
  message: string;
}

export const ERROR_MAPS: Record<string, ErrorMap> = {
  // Database Errors
  'MongoServerError: 11000': {
    statusCode: HttpStatus.CONFLICT,
    type: 'DUPLICATE_RESOURCE',
    message: 'A resource with this information already exists in our system.',
  },
  'CastError': {
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'INVALID_ID',
    message: 'The provided ID format is invalid.',
  },
  'ValidationError': {
    statusCode: HttpStatus.BAD_REQUEST,
    type: 'VALIDATION_FAILED',
    message: 'One or more fields failed validation.',
  },

  // Auth Errors
  'UnauthorizedException': {
    statusCode: HttpStatus.UNAUTHORIZED,
    type: 'UNAUTHORIZED',
    message: 'You are not authorized to perform this action.',
  },
  'ForbiddenException': {
    statusCode: HttpStatus.FORBIDDEN,
    type: 'FORBIDDEN_ACCESS',
    message: 'You do not have permission to access this resource.',
  },

  // Generic Fallback
  'InternalServerError': {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'SERVER_ERROR',
    message: 'An unexpected error occurred. Our engineers have been notified.',
  },
};

/**
 * Normalizes an error name or code into a public ErrorMap object.
 */
export function normalizeError(errorName: string, defaultMessage?: string): ErrorMap {
  // Check for specific Mongo error codes
  if (errorName.includes('E11000')) {
    return ERROR_MAPS['MongoServerError: 11000'];
  }

  const map = ERROR_MAPS[errorName];
  if (map) {
    return map;
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    type: 'UNKNOWN_ERROR',
    message: defaultMessage || ERROR_MAPS['InternalServerError'].message,
  };
}
