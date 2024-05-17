import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const { message } = exception.getResponse() as any;
    response.status(status).json({
      status: status >= 200 && status < 300,
      message: Array.isArray(message)
        ? message.join('\n')
        : message ?? exception.message,
    });
  }
}
