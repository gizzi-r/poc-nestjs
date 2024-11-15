import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";
import Order from "./entities/order.entity";
import OrderDto from "./dto/order.dto";
import OrderNotFoundException from "./exceptions/order-not-found.exception";
import OrderFilter from "./filters/order.filter";
import { WarehouseService } from "../warehouse/warehouse.service";
import CreateOrderDto from "./dto/create-order.dto";
import { OrderStatus } from "./entities/order-status.enum";
import OrderQuantity from "./entities/order-quantity.entity";
import ProductQuantityDto from "../warehouse/dto/product-quantity.dto";
import ProductNotFoundException from "../product/exceptions/productNotFound.exception";
import ProductNotAvailableException from "../product/exceptions/productNotAvailable.exception";
import ProductAvailability from "../warehouse/entities/product-availability.entity";
import OrderNotEditableException from "./exceptions/order-not-editable.exception";
import UpdateOrderDto from "./dto/update-order.dto";
import { validate } from "class-validator";
import DeliveryOrderException from "./exceptions/delivery-order.exception";
import { User } from "../auth/entities/user.entity";
import { SortOrder } from "../../utils/sort-order.enum";
import Page from "../../utils/page";
import { OrderRepository } from "./repositories/order.repository";

@Injectable()
export class OrderService {
	private logger = new Logger(OrderService.name, { timestamp: true });

	constructor(
		@InjectRepository(Order) private orderRepository: OrderRepository,
		private warehouseService: WarehouseService
	) {
	}


	/**
	 * Retrieves the order with the specified ID.
	 *
	 * @param {number} idOrder - The ID of the order to retrieve.
	 * @return {Promise<OrderDto>} A promise that resolves with the order data transfer object.
	 * @throws {OrderNotFoundException} If no order is found with the specified ID.
	 */
	async getOrder(idOrder: number): Promise<OrderDto> {
		let order: Order | null = null;
		try {
			order = await this.orderRepository.findOne({
				where: { id: idOrder }
			});
		} catch (error) {
			this.logger.error(`Failed to retrieve order with id ${idOrder}: ${error.message}`, error.stack);
			if (error.code !== "22P02"){
				throw new error;
			}
		}
		if (order) {
			return new OrderDto(order);
		}
		throw new OrderNotFoundException(idOrder);
	}

	
	/**
	 * Retrieves a paginated list of orders based on the provided filter criteria.
	 *
	 * @param {Partial<OrderFilter>} filter - The filter criteria to apply to the orders query.
	 * @return {Promise<Page<OrderDto>>} - Returns a promise that resolves to a paginated list of OrderDto objects.
	 */
	async getAll(filter: Partial<OrderFilter>): Promise<Page<OrderDto>> {
		const orderBy = { id: SortOrder.DESC };

		const where = {};
		const join: any = { alias: "order" };
		if (filter.warehouseName) {
			join.leftJoinAndSelect("order.warehouse", "warehouse");
			where["warehouse.name"] = filter.warehouseName;
		}
		if (filter.status) {
			where["status"] = filter.status;
		}

		const result = this.orderRepository.findAndCount({
			order: orderBy,
			skip: (filter.page - 1) * (filter.pageSize + 1),
			take: filter.pageSize,
			where
		});

		const query = await result;
		const dtoContent = query[0].map((o) => new OrderDto(o));

		return new Page(dtoContent, query[1], filter.page, filter.pageSize);
	}

	
	/**
	 * Creates a new order for the given user based on the provided order details.
	 *
	 * @param {CreateOrderDto} orderDto - Data transfer object containing order details.
	 * @param {User} user - The user who is placing the order.
	 * @return {Promise<OrderDto>} A promise that resolves to an OrderDto object.
	 */
	async createOrder(orderDto: CreateOrderDto, user: User): Promise<OrderDto> {
		const order = this.orderRepository.create({});
		const wh = await this.warehouseService.getNearestWareHouse(
			orderDto.address
		);
		order.warehouse = wh;
		order.address = wh.point;
		order.status = OrderStatus.CREATED;
		await this.updateProductOrderQuantity(order, orderDto.products);
		await this.orderRepository.save(order, { data: { user } });
		return new OrderDto(order);
	}

	/**
	 * Aggiorna un ordine esistente con i dettagli forniti.
	 *
	 * @param {number} idOrder - L'ID dell'ordine da aggiornare.
	 * @param {UpdateOrderDto} orderDto - I dettagli con cui aggiornare l'ordine.
	 * @param {User} user - L'utente che esegue l'operazione di aggiornamento.
	 * @return {Promise<OrderDto>} - I dettagli aggiornati dell'ordine.
	 * @throws {OrderNotFoundException} Se non viene trovato un ordine con l'ID fornito.
	 * @throws {OrderNotEditableException} Se l'ordine non può essere modificato a causa del suo stato.
	 * @throws {BadRequestException} Se i dettagli dell'ordine forniti non sono validi.
	 */
	async updateOrder(
		idOrder: number,
		orderDto: UpdateOrderDto,
		user: User
	): Promise<OrderDto> {
		let orderDB = null;
		try {
			// Recupera l'ordine dal repository tramite l'ID
			orderDB = await this.orderRepository.findOneBy({ id: idOrder });
		} catch (error) {
			// Logga l'errore e rilancia se il codice errore non è "22P02"
			if (error.code !== "22P02") {
				this.logger.error(error);
				throw error;
			}
		}
		if (!orderDB) {
			// Logga un errore e lancia un'eccezione se l'ordine non viene trovato
			this.logger.error(`Ordine con id ${idOrder} non trovato`);
			throw new OrderNotFoundException(idOrder);
		}
		if (orderDB.status != OrderStatus.CREATED) {
			// Logga un errore e lancia un'eccezione se lo stato dell'ordine non è 'CREATED'
			this.logger.error(
				`Ordine con id ${idOrder} non può essere modificato in quanto è in stato '${orderDB.status}'`
			);
			throw new OrderNotEditableException(idOrder);
		}

		if (orderDto.address) {
			await validate(orderDto.address).then(async (errors) => {
				// Valida e aggiorna l'indirizzo dell'ordine
				if (errors.length > 0) {
					this.logger.error(
						`Update dell'ordine con id ${idOrder} con indirizzo errato ${orderDto.address}`
					);
					throw new BadRequestException(errors);
				} else {
					const wh = await this.warehouseService.getNearestWareHouse(
						orderDto.address
					);
					orderDB.address = orderDto.address;
					orderDB.warehouse = wh;
				}
			});
		}

		if (orderDto.products) {
			await validate(orderDto.products).then(async (errors) => {
				// Valida e aggiorna i prodotti dell'ordine
				if (errors.length > 0) {
					this.logger.error(
						`Update dell'ordine con id ${idOrder} con lista prodotti non valida ${orderDto.products}`
					);
					throw new BadRequestException(errors);
				} else {
					await this.updateProductOrderQuantity(
						orderDB,
						orderDto.products
					);
				}
			});
		}
		// Salva l'ordine aggiornato nel repository
		await this.orderRepository.save(orderDB, { data: { user } });

		// Restituisce l'ordine aggiornato come data transfer object
		return new OrderDto(orderDB);
	}

	/**
	 * Cancella un ordine esistente aggiornando il suo stato a "CANCELLATO".
	 *
	 * @param {number} idOrder - L'ID dell'ordine da cancellare.
	 * @param {User} user - L'utente che sta eseguendo l'azione di cancellazione.
	 * @return {Promise<void>} - Una promessa che si risolve quando l'ordine è stato aggiornato con successo o viene rigettata con un errore.
	 * @throws {OrderNotFoundException} - Se l'ordine con l'ID specificato non è stato trovato.
	 * @throws {OrderNotEditableException} - Se l'ordine non può essere modificato a causa del suo stato attuale.
	 */
	async deleteOrder(idOrder: number, user: User): Promise<void> {
		const order = await this.orderRepository.findOneBy({ id: idOrder });
		if (!order) {
			this.logger.error(`Ordine con id ${idOrder} non trovato`);
			throw new OrderNotFoundException(idOrder);
		}
		if (order.status != OrderStatus.CREATED) {
			this.logger.error(
				`Ordine con id ${idOrder} non può essere modificato in quanto è in stato '${order.status}'`
			);
			throw new OrderNotEditableException(idOrder);
		}
		order.status = OrderStatus.DELETED;
		await this.orderRepository.save(order, { data: { user } });
	}

	/**
	 * Aggiorna la quantità di prodotti in un ordine in base agli oggetti di trasferimento dati (DTO) della quantità di prodotto forniti.
	 *
	 * @param {Order} order - L'ordine per il quale si stanno aggiornando le quantità dei prodotti.
	 * @param {ProductQuantityDto[]} productQuantityDtos - Un array di DTO contenenti i nomi dei prodotti e le quantità desiderate.
	 * @return {Promise<void>} - Una promessa che si risolve quando le quantità dei prodotti nell'ordine sono state aggiornate con successo.
	 * @throws {ProductNotFoundException} - Se un prodotto specificato nei DTO non esiste nel magazzino.
	 * @throws {ProductNotAvailableException} - Se la quantità desiderata di un prodotto non è disponibile nel magazzino.
	 */
	private async updateProductOrderQuantity(
		order: Order,
		productQuantityDtos: ProductQuantityDto[]
	): Promise<void> {
		// Estrai i nomi dei prodotti dai DTO
		const productNames = productQuantityDtos.map((p) => p.name);

		// Prendi la lista dei prodotti disponibili nel magazzino selezionato
		const productAvailabilities =
			await this.warehouseService.areProductsAvailable(
				order.warehouse,
				order,
				productNames
			);

		// Mappa di disponibilità dei prodotti
		const productAvailabilityMap = {};
		productAvailabilities.forEach((pa) => {
			productAvailabilityMap[pa.product.name] = pa;
		});

		const newProductOrderQuantityList: OrderQuantity[] = [];
		// Itera su ogni DTO della quantità di prodotto
		productQuantityDtos.forEach((pqd) => {
			const pa: ProductAvailability = productAvailabilityMap[pqd.name];
			if (pa == null) {
				// Log error nel caso in cui il prodotto non sia trovato e lancia un'eccezione
				this.logger.error(`Prodotto con nome ${pqd.name} non trovato`);
				throw new ProductNotFoundException(pqd.name);
			}

			const qta = pa.qta;
			if (qta < pqd.qta) {
				// Log error nel caso in cui il prodotto non sia disponibile in quantità sufficiente e lancia un'eccezione
				this.logger.error(
					`Il Prodotto con nome ${pqd.name} non è disponibile nel magazzino di riferimento ${order.warehouse.name}. Quantità ordinata: ${pqd.qta}/${qta}`
				);
				throw new ProductNotAvailableException(pqd.name);
			}

			// Crea una nuova quantità ordine prodotto
			const poq = new OrderQuantity({
				product: pa.product,
				order,
				qta: pqd.qta
			});
			newProductOrderQuantityList.push(poq);
		});

		// Assegna le nuove quantità all'ordine
		order.products = newProductOrderQuantityList;
	}

	/**
	 * Calcola la consegna per il dato elenco di ID degli ordini.
	 *
	 * @param {number[]} orderIdList - L'elenco degli ID degli ordini per cui calcolare la consegna.
	 * @return {Promise<OrderDto[]>} - Una promessa che si risolve in un array di DTO dell'ordine.
	 * @throws {DeliveryOrderException} - Viene lanciata se tutti gli ordini non sono associati allo stesso magazzino o non sono nello stato corretto.
	 */
	async calculateDelivery(orderIdList: number[]): Promise<OrderDto[]> {
		const orders = await this.orderRepository.findBy({
			id: In(orderIdList)
		});
		if (orders.length) {
			return [];
		}
		//controllo che tutti gli ordini siano associati allo stesso magazzino
		//viene anche verificato che tutti gli ordini siano nello stato corretto
		const wh = orders[0].warehouse;
		const sameWh = orders.every((o) => o.warehouse === wh);
		if (!sameWh) {
			this.logger.error(
				`Non tutti gli ordini sono associati allo stesso magazzino`
			);
			throw new DeliveryOrderException(
				"Non tutti gli ordini sono associati allo stesso magazzino"
			);
		}

		const anyWrongStatus = orders.some(
			(o) => o.status !== OrderStatus.CREATED
		);
		if (anyWrongStatus) {
			this.logger.error(
				`Non tutti gli ordini sono associati allo stesso magazzino`
			);
			throw new DeliveryOrderException(
				"Non tutti gli ordini sono associati allo stesso magazzino"
			);
		}
	}
}
