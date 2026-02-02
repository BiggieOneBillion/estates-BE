"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_1 = require("../utils/logger");
const error_maps_1 = require("../utils/error-maps");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const requestId = request.headers['x-request-id'] || 'system';
        const internalMessage = exceptionResponse['message'] || exception.message || 'Error occurred';
        const internalError = exceptionResponse['error'] || exception.name || 'HttpException';
        const publicError = (0, error_maps_1.normalizeError)(internalError, Array.isArray(internalMessage) ? internalMessage[0] : internalMessage);
        logger_1.logger.error(`[${requestId}] ${internalError}: ${Array.isArray(internalMessage) ? internalMessage.join(', ') : internalMessage}`, {
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
                ...(Array.isArray(internalMessage) && { details: internalMessage }),
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        response.status(errorResponse.error.statusCode).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.headers['x-request-id'] || 'system';
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()['message'] || exception.message
            : exception instanceof Error ? exception.message : 'Internal server error';
        const errorType = exception instanceof common_1.HttpException
            ? exception.getResponse()['error'] || exception.name
            : exception instanceof Error ? exception.name : 'InternalServerError';
        const publicError = (0, error_maps_1.normalizeError)(errorType, message);
        const finalStatus = status === common_1.HttpStatus.INTERNAL_SERVER_ERROR && publicError.statusCode !== common_1.HttpStatus.INTERNAL_SERVER_ERROR
            ? publicError.statusCode
            : status;
        logger_1.logger.error(`[${requestId}] UNHANDLED_EXCEPTION: ${message}`, {
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
                message: finalStatus === common_1.HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production'
                    ? error_maps_1.ERROR_MAPS['InternalServerError'].message
                    : publicError.message,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        response.status(finalStatus).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map