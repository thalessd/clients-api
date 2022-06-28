import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

type ExceptionInfo = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const requestPath = httpAdapter.getRequestUrl(request);
    const requestMethod = httpAdapter.getRequestMethod(request);

    let httpExceptionInfo = this.extractHttpExceptionInfo(
      new InternalServerErrorException(),
    );

    if (exception instanceof HttpException) {
      httpExceptionInfo = this.extractHttpExceptionInfo(exception);
      this.logger.log(
        `HTTP - ${httpExceptionInfo.error} {${requestPath}, ${requestMethod}, ${httpExceptionInfo.statusCode}}`,
      );
    }

    const responseBodyExtra = {
      timestamp: new Date().toISOString(),
      path: requestPath,
    };

    if (httpExceptionInfo.statusCode === 500) {
      this.logger.error(exception.message, exception.stack);
    }

    const responseBody = {
      ...responseBodyExtra,
      ...httpExceptionInfo,
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      httpExceptionInfo.statusCode,
    );
  }

  private extractHttpExceptionInfo(exception: HttpException): ExceptionInfo {
    const baseResponse = exception.getResponse() as {
      message: string;
      statusCode: number;
      error?: string;
    };

    return {
      error: baseResponse.message,
      ...baseResponse,
    };
  }
}
