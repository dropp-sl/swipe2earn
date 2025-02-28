import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: any = null;

    console.log('exception', exception); // Use when there is an unknown error

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = 'Validation failed';

      if (
        exception.getResponse &&
        typeof exception.getResponse === 'function'
      ) {
        message = exception.getResponse();
        message = message?.message || message || 'Validation failed';
      }
    }

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
