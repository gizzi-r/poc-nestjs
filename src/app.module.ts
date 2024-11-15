import { MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configValidationSchema } from "./config/config.schema";
import { ProductModule } from "src/modules/product/product.module";
import { OrderModule } from "src/modules/order/order.module";
import { WarehouseModule } from "src/modules/warehouse/warehouse.module";
import { AuditSubscriber } from "./support/audit-subscriber";
import { RequestLoggerMiddleware } from "./middlewares/request-logger.middleware";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`stage.${process.env.STAGE}.env`],
			validationSchema: configValidationSchema
		}),
		ProductModule,
		OrderModule,
		WarehouseModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: "postgres",
				autoLoadEntities: true,
				// synchronize: false,
				host: configService.get("DB_HOST"),
				port: configService.get("DB_PORT"),
				username: configService.get("DB_USERNAME"),
				password: configService.get("DB_PASSWORD"),
				database: configService.get("DB_DATABASE"),
				logging: false,
				dropSchema: true,
				subscribers: [AuditSubscriber],
				migrations: ["dist/migrations/**/*.js"],
				entities: ["dist/**/*.entity.js"],
				migrationsRun: true,
				migrationsTableName: "migrations"
			})
		}),
		AuthModule
	],
	controllers: [],
	providers: [
		AuditSubscriber,
		// {
		// 	provide: APP_GUARD,
		// 	useClass: RolesGuard
		// }
	]
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestLoggerMiddleware).forRoutes('*');
	}
}
