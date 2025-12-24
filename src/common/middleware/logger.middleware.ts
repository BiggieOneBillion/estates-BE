import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, headers } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || req.connection.remoteAddress;

    const start = Date.now();

    logger.info(`REQUEST STARTED ➡️ [${method}] ${originalUrl}`);
    // logger.info(`IP: ${ip}, User-Agent: ${userAgent}`);
    // logger.info(`Headers: ${JSON.stringify(headers)}`);
    logger.info(`Body: ${JSON.stringify(body)}`);

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;

      logger.info(
        `RESPONSE ⬅️ [${method}] ${originalUrl} ${statusCode} - ${duration}ms`,
      );
      logger.info("------------------------------------------------------------------")
    });

    // Capture errors
    res.on('error', (err) => {
      logger.error(`❌ RESPONSE ERROR for [${method}] ${originalUrl}: ${err}`);
    });

    next();
  }
}