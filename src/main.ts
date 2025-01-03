import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationError } from 'class-validator';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Server } from 'http';
import { Context } from 'aws-lambda';
import { Logger } from '@nestjs/common';

// Initialize the logger
const logger = new Logger('Bootstrap');

let server: Server;

function setupSwagger(nestApp: INestApplication): void {
  let serverPath = '';
  if (process.env.LAMBDA_TASK_ROOT) {
    serverPath = '/prod';
  }
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Task API')
    .setDescription('Task API Documentation')
    .setVersion('1.0')
    .addServer(serverPath)
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);

  SwaggerModule.setup('swagger', nestApp, document, {
    customSiteTitle: 'Task API Docs',
    swaggerOptions: {
      docExpansion: 'none',
      operationSorter: 'alpha',
      tagSorter: 'alpha',
    },
  });
}

async function bootstrap(): Promise<Server | void> {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'],
  });
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return new BadRequestException(formattedErrors);
      },
    }),
  );
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Cookies', 'Authorization'],
    exposedHeaders: [
      'Content-Length',
      'Date',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    optionsSuccessStatus: 204,
  });

  setupSwagger(app);

  if (process.env.LAMBDA_TASK_ROOT) {
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return awsServerlessExpress.createServer(expressApp);
  } else {
    await app.listen(3000);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  }
}

exports.handler = async (event: any, context: Context) => {
  try {
    if (!server) {
      server = (await bootstrap()) as Server;
    }

    event.path =
      event.path.includes('swagger-ui') || event.path.includes('swagger')
        ? event.path.replace('/api', '')
        : event.path;

    const response = await awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
    return response;
  } catch (error) {
    Logger.error('Error in awsServerlessExpress.proxy:', error, 'Main');
    throw error;
  }
};

// Bootstrap the application if running locally
if (!process.env.LAMBDA_TASK_ROOT) {
  bootstrap();
}
