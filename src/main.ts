import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { TransformInterceptor } from "./config/transform.interceptor";
import useSwagger from "./config/swagger.conf";
import { winstonConf } from "./config/winston.conf";
import { WinstonModule } from "nest-winston";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger : WinstonModule.createLogger(winstonConf)
  });
  const logger = new Logger();
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  useSwagger(app);
  const port = 3000;

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap().then(r => r);
