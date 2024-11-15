import * as dotenv from "dotenv";
import { DataSource } from "typeorm";

dotenv.config({ path: `stage.${process.env.STAGE}.env` });

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  logger: "file",
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/migrations/**/*.js"],
  migrationsRun: true,
  migrationsTableName: "migrations"
});
