"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logger_1 = require("../utils/logger");
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        const { method, originalUrl, body, headers } = req;
        const userAgent = req.get('user-agent') || '';
        const ip = req.ip || req.connection.remoteAddress;
        const start = Date.now();
        logger_1.logger.info(`REQUEST STARTED ➡️ [${method}] ${originalUrl}`);
        logger_1.logger.info(`Body: ${JSON.stringify(body)}`);
        res.on('finish', () => {
            const duration = Date.now() - start;
            const statusCode = res.statusCode;
            logger_1.logger.info(`RESPONSE ⬅️ [${method}] ${originalUrl} ${statusCode} - ${duration}ms`);
            logger_1.logger.info("------------------------------------------------------------------");
        });
        res.on('error', (err) => {
            logger_1.logger.error(`❌ RESPONSE ERROR for [${method}] ${originalUrl}: ${err}`);
        });
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
//# sourceMappingURL=logger.middleware.js.map