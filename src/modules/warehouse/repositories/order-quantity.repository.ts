import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import Warehouse from "../entities/warehouse.entity";
import { OrderStatus } from "../../order/entities/order-status.enum";
import OrderQuantity from "../../order/entities/order-quantity.entity";

export class OrderQuantityRepository extends Repository<OrderQuantity> {
	constructor(
		@InjectRepository(OrderQuantity)
		private orderQuantityRepository: Repository<OrderQuantity>
	) {
		super(
			orderQuantityRepository.target,
			orderQuantityRepository.manager,
			orderQuantityRepository.queryRunner
		);
	}

	/**
     * Finds and returns the list of OrderQuantity entities filtered by the given warehouse and order status.
     *
     * @param {Warehouse} warehouse - The warehouse to filter the orders by.
     * @param {OrderStatus} status - The status to filter the orders by.
     * @return {Promise<OrderQuantity[]>} A promise that resolves to an array of OrderQuantity entities matching the given criteria.
     */
    findByOrderWarehouseAndOrderStatus(warehouse: Warehouse, status: OrderStatus): Promise<OrderQuantity[]> {
		return this.orderQuantityRepository.createQueryBuilder("orderQuantity")
			.leftJoinAndSelect("orderQuantity.order", "order")
			.leftJoinAndSelect("order.warehouse", "warehouse")
			.where({ warehouse })
			.andWhere("order.status = :status", { status }).getMany();
	}

	/**
     * Retrieves a list of OrderQuantity objects filtered by the given warehouse, order status,
     * and excluding a specific order ID.
     *
     * @param {Warehouse} warehouse - The warehouse to filter the orders by.
     * @param {OrderStatus} status - The status to filter the orders by.
     * @param {number} orderId - The ID of the order to exclude from the results.
     * @return {Promise<OrderQuantity[]>} A Promise that resolves to an array of matching OrderQuantity objects.
     */
    findByOrderWarehouseAndOrderStatusAndOrderIdNot(warehouse: Warehouse, status: OrderStatus, orderId: number): Promise<OrderQuantity[]> {
		return this.orderQuantityRepository.createQueryBuilder("orderQuantity")
			.leftJoinAndSelect("orderQuantity.order", "order")
			.leftJoinAndSelect("order.warehouse", "warehouse")
			.where({ order: { warehouse } })
			.andWhere("order.status = :status", { status })
			.andWhere("order.id != :orderId", { orderId })
			.getMany();
	}

}
