import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import express from 'express';

let server: any;
const logger = new Logger('Lambda');

async function bootstrap(): Promise<any> {
  if (!server) {
    logger.log('Initializing NestJS application...');
    
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // Configure CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // Set global prefix
    app.setGlobalPrefix('api');

    await app.init();

    server = serverlessExpress({ 
      app: expressApp,
    });

    logger.log('NestJS application initialized successfully');
  }

  return server;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const server = await bootstrap();
    return await server(event, context);
  } catch (error) {
    logger.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
};