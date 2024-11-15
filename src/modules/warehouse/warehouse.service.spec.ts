import { Test } from "@nestjs/testing";
import { WarehouseService } from "./warehouse.service";
import { ProductAvailabilityRepository } from "./repositories/product-availability.repository";
import { OrderQuantityRepository } from "./repositories/order-quantity.repository";
import { WarehouseRepository } from "./repositories/warehouse.repository";
import { DBTestingModule } from "../../../test/db-testing.module";
import { DbTestSeeding } from "../../../test/db-test-seeding";
import { EntityManager } from "typeorm";

// const mockTasksRepository = () => ({
//   getAll: jest.fn()
// });

describe("WarehouseService", () => {
	let warehouseService: WarehouseService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			imports: [...DBTestingModule()],
			providers: [
				WarehouseService,
				ProductAvailabilityRepository,
				OrderQuantityRepository,
				WarehouseRepository,
				EntityManager
			]
		}).compile();

		warehouseService = module.get(WarehouseService);
		await DbTestSeeding(module.get(EntityManager));
	});

	describe("root", () => {

		it("should return warehouses", () => {
			warehouseService.getAll().then( whList => {
				expect(whList).toHaveLength(1);
			})
		});
	});
});
