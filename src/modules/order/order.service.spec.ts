import { Test } from "@nestjs/testing";
import { OrderService } from "./order.service";
import { DBTestingModule } from "../../../test/db-testing.module";
import { WarehouseService } from "../warehouse/warehouse.service";
import { OrderRepository } from "./repositories/order.repository";
import { DbTestSeeding } from "../../../test/db-test-seeding";
import { EntityManager } from "typeorm";
import { ProductAvailabilityRepository } from "../warehouse/repositories/product-availability.repository";
import CreateOrderDto from "./dto/create-order.dto";
import Point from "../../utils/point";
import ProductQuantityDto from "../warehouse/dto/product-quantity.dto";
import Product from "../product/entities/product.entity";
import { User } from "../auth/entities/user.entity";
import { WarehouseRepository } from "../warehouse/repositories/warehouse.repository";
import { OrderQuantityRepository } from "../warehouse/repositories/order-quantity.repository";
import WarehouseTooFarException from "../warehouse/exceptions/warehouseTooFar.exception";
import ProductNotFoundException from "../product/exceptions/productNotFound.exception";
import { OrderStatus } from "./entities/order-status.enum";
import ProductNotAvailableException from "../product/exceptions/productNotAvailable.exception";
import UpdateOrderDto from "./dto/update-order.dto";
import OrderNotEditableException from "./exceptions/order-not-editable.exception";
import OrderFilter from "./filters/order.filter";

// const mockWarehouseService = () => ({
// 	getNearestWareHouse: jest.fn()
// });

describe("OrderService", () => {
	let orderService: OrderService;
	let user : User;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			imports: [...DBTestingModule()],
			providers: [
				OrderService,
				OrderRepository,
				WarehouseService,
				EntityManager,
				WarehouseRepository,
				ProductAvailabilityRepository,
				OrderQuantityRepository
			]
		}).compile();

		orderService = module.get(OrderService);
		user = new User();
		user.username = "TestUser"
		await DbTestSeeding(module.get(EntityManager));
	});

	describe("root", () => {

		it("should create and get order",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10}),
				new ProductQuantityDto({product: new Product("Olio"),qta:6}),
				new ProductQuantityDto({product: new Product("Tonno"),qta:15}),
				new ProductQuantityDto({product: new Product("Fagioli"),qta:3}),
				new ProductQuantityDto({product: new Product("Piselli"),qta:4}),
				new ProductQuantityDto({product: new Product("Cereali"),qta:5}),
			]
			const order = await orderService.createOrder(orderDto,user);
			expect(order).toBeDefined();

			const orderSaved = await orderService.getOrder(order.id);
			expect(orderSaved.id).toBe(order.id);
		})

		it("should not create with warehouse too far",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(0.0,0.0);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const orderPromise = orderService.createOrder(orderDto,user);
			await expect(orderPromise).rejects.toThrow(WarehouseTooFarException);
		})

		it("should not create with product not found",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Prodotto"),qta:10})
			]
			const orderPromise = orderService.createOrder(orderDto,user);
			await expect(orderPromise).rejects.toThrow(ProductNotFoundException);
		})

		it("should not create with product not available",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:1000})
			]
			const orderPromise = orderService.createOrder(orderDto,user);
			await expect(orderPromise).rejects.toThrow(ProductNotAvailableException);
		})

		it("should find orders",async  () => {
			const filter = new OrderFilter();
			filter.pageSize = 5;
			filter.page = 0;
			const orders = await  orderService.getAll(filter);
			expect(orders.content).toHaveLength(0);

			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			await orderService.createOrder(orderDto,user);

			const orders2 = await  orderService.getAll(filter);
			expect(orders2.content).toHaveLength(1);

			filter.status = OrderStatus.SHIPPED.toString();
			const orderShipped = await orderService.getAll(filter);
			expect(orderShipped.content).toHaveLength(0);
		})

		it("should update order",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);

			let updateOrderDto = new UpdateOrderDto();
			updateOrderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:5})
			]
			let updatedProduct = await orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			expect(updatedProduct.products[0].qta).toBe(5)

			updateOrderDto = new UpdateOrderDto();
			updateOrderDto.address = new Point(45.411591, 9.32181);
			updatedProduct = await orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			expect(updatedProduct.address.lat).toBe(45.411591);

			updateOrderDto = new UpdateOrderDto();
			updateOrderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:5}),
				new ProductQuantityDto({product: new Product("Olio"),qta:3})
			]
			updatedProduct = await orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			expect(updatedProduct.products).toHaveLength(2);
		});

		it("should not update order (ProductNotFoundException)",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);

			const updateOrderDto = new UpdateOrderDto();
			updateOrderDto.products = [
				new ProductQuantityDto({product: new Product("TestProdottoNonDisponibile"),qta:5})
			]
			const updateOrderPromise = orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			await expect(updateOrderPromise).rejects.toThrow(ProductNotFoundException);
		});

		it("should not update order (ProductNotFoundException)",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);

			const updateOrderDto = new UpdateOrderDto();
			updateOrderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:1000})
			]
			const updateOrderPromise = orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			await expect(updateOrderPromise).rejects.toThrow(ProductNotAvailableException);
		});

		it("should not update order (WarehouseTooFarException)",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);

			const updateOrderDto = new UpdateOrderDto();
			updateOrderDto.address  = new Point(0,0);
			const updateOrderPromise = orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			await expect(updateOrderPromise).rejects.toThrow(WarehouseTooFarException);
		});

		it("should delete order",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);
			const deleteOrderPromise = orderService.deleteOrder(savedOrder.id,user);
			await expect(deleteOrderPromise).resolves.not.toThrow(Error);

		});

		it("should not update deleted order",async  () => {
			const orderDto = new CreateOrderDto();
			orderDto.address = new Point(45.511591,9.32181);
			orderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:10})
			]
			const savedOrder = await orderService.createOrder(orderDto,user);
			await orderService.deleteOrder(savedOrder.id,user);

			const updateOrderDto = new UpdateOrderDto();
			updateOrderDto.products = [
				new ProductQuantityDto({product: new Product("Passata"),qta:15})
			]
			const updateOrderPromise = orderService.updateOrder(savedOrder.id,updateOrderDto,user);
			await expect(updateOrderPromise).rejects.toThrow(OrderNotEditableException);
		});
	});
});
