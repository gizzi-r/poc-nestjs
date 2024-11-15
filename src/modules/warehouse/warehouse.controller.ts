import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { WarehouseService } from "./warehouse.service";
import {
	ApiBearerAuth,
	ApiBody,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiOperation,
	ApiResponse,
	ApiTags
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/guards/roles.guard";
import WarehouseDto from "./dto/warehouse.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/entities/roles";
import CreateWarehouseDto from "./dto/create-warehouse.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../auth/entities/user.entity";

@ApiTags("Warehouse")
@Controller("/api/v1/warehouses")
@ApiBearerAuth()
@UseGuards(AuthGuard(),RolesGuard)
export class WarehouseController {
	constructor(private warehouseService: WarehouseService) {}

	@ApiOperation({
		summary: "Ritorna la lista dei magazzini"
	})
	@ApiOkResponse({
		status: 200,
		description: "Lista dei magazzini",
		type: WarehouseDto,
		isArray: true,
	})
	@ApiForbiddenResponse({ description: "Forbidden." })
	@Roles(Role.ADMIN)
	@Get()
	getAll(): Promise<WarehouseDto[]> {
		return this.warehouseService.getAll();
	}

	@Post()
	@ApiOperation({
		summary: "Creazione di un Warehouse",
	})
	@ApiResponse({
		status: 201,
		description: "Magazzino creato.",
	})
	@ApiResponse({ status: 403, description: "Forbidden." })
	@ApiBody({
		type: CreateWarehouseDto,
		description: "Struttura Json di un Magazzino",
	})
	@Roles(Role.ADMIN)
	addWarehouse(
		@Body() body: CreateWarehouseDto,
		@GetUser() user: User
	): Promise<WarehouseDto> {
		return this.warehouseService.createWarehouse(body, user);
	}
}
