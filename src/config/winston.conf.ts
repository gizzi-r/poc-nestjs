import { WinstonModuleOptions } from "nest-winston/dist/winston.interfaces";
import "winston-daily-rotate-file";
import { format, transports } from "winston";
import * as dotenv from "dotenv";

dotenv.config({ path: `stage.${process.env.STAGE}.env` });


export const winstonConf: WinstonModuleOptions = {
	level: process.env.LOG_LEVEL || 'info',
	transports: [
		// file on daily rotation (error only)
		new transports.DailyRotateFile({
			// %DATE will be replaced by the current date
			filename: `logs/%DATE%-error.log`,
			level: 'error',
			format: format.combine(format.timestamp(), format.json()),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: false, // don't want to zip our logs
			maxFiles: '30d', // will keep log until they are older than 30 days
		}),
		// same for all levels
		new transports.DailyRotateFile({
			filename: `logs/%DATE%-combined.log`,
			format: format.combine(format.timestamp(), format.json()),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: false,
			maxFiles: '30d',
		}),
		new transports.Console({
			format: format.combine(
				format.timestamp(),
				format.colorize(),
				format.simple()
			),
		}),
	],
}
