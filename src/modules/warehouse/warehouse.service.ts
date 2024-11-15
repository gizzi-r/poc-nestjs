import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import Warehouse from "./entities/warehouse.entity";
import CreateWarehouseDto from "./dto/create-warehouse.dto";
import WarehouseDto from "./dto/warehouse.dto";
import Order from "../order/entities/order.entity";
import ProductAvailability from "./entities/product-availability.entity";
import { ProductAvailabilityRepository } from "./repositories/product-availability.repository";
import OrderQuantity from "../order/entities/order-quantity.entity";
import { OrderQuantityRepository } from "./repositories/order-quantity.repository";
import { OrderStatus } from "../order/entities/order-status.enum";
import Point from "src/utils/point";
import WarehouseNotFoundException from "./exceptions/warehouseNotFound.exception";
import WarehouseTooFarException from "./exceptions/warehouseTooFar.exception";
import { User } from "../auth/entities/user.entity";
import { WarehouseRepository } from "./repositories/warehouse.repository";

@Injectable()
export class WarehouseService {
	private readonly logger = new Logger("WarehouseService", { timestamp: true });
	private readonly MAX_WH_DISTANCE = 150000;

	constructor(
		@InjectRepository(Warehouse)
		private warehouseRepository: WarehouseRepository,
		private productAvailabilityRepository: ProductAvailabilityRepository,
		private orderQuantityRepository: OrderQuantityRepository
	) {
	}

	/**
	 * Retrieves all warehouse records from the database and maps them to WarehouseDto objects.
	 *
	 * @return {Promise<WarehouseDto[]>} A promise that resolves to an array of WarehouseDto objects representing the warehouse records.
	 * @throws {Error} Throws an error if there is an issue retrieving the warehouse records.
	 */
	async getAll(): Promise<WarehouseDto[]> {
		try {
			const query = this.warehouseRepository.createQueryBuilder("warehouse");
			const whs = await query.getMany();
			return whs.map((wh) => new WarehouseDto(wh));
		} catch (error) {
			this.logger.error(error.message);
			throw new HttpException(`Errore durante il recupero dei magazzini: ${error.message}`,HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Crea un nuovo magazzino e lo salva nel repository.
	 *
	 * @param {CreateWarehouseDto} dto - L'oggetto di trasferimento dati contenente i dettagli del nuovo magazzino.
	 * @param {User} user - L'utente che sta creando il magazzino.
	 * @return {Promise<WarehouseDto>} Una promise che risolve nell'oggetto di trasferimento dati del magazzino creato.
	 */
	async createWarehouse(
		dto: CreateWarehouseDto,
		user: User
	): Promise<WarehouseDto> {
		try {
		const { name, point } = dto;
		const wh = this.warehouseRepository.create({
			name,
			point
		});
		await this.warehouseRepository.save(wh, { data: { user } });
		return new WarehouseDto({
			name: wh.name,
			point: wh.point
		});
		} catch (error) {
			this.logger.error('Error creating warehouse', { dto, error });
			// Decidere qual è l'errore specifico da lanciare
			throw new HttpException('Errore nella creazione del magazzino', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Recupera il magazzino più vicino a un punto dato.
	 *
	 * @param {Point} point - Il punto da cui calcolare la distanza ai magazzini.
	 * @return {Promise<Warehouse | null>} - Una promise che risolve nel magazzino più vicino, o null se non sono definiti magazzini.
	 * @throws {WarehouseNotFoundException} se non sono trovati magazzini nel repository.
	 * @throws {WarehouseTooFarException} se il magazzino più vicino si trova oltre la distanza massima consentita.
	 */
	public async getNearestWareHouse(point: Point): Promise<Warehouse | null> {
		// Recupera la lista dei magazzini dal repository
		const warehouseList = await this.warehouseRepository.find();
		let nearest: Warehouse | null = null;
		let nearestDistance: number = Number.MAX_VALUE;

		// Calcola la distanza dal punto dato a ogni magazzino e trova il più vicino
		warehouseList.forEach((wh) => {
			const distance = wh.point.distance(point);
			if (nearestDistance == null || nearestDistance > distance) {
				nearest = wh;
				nearestDistance = distance;
			}
		});

		// Se non ci sono magazzini, lancia un'eccezione
		if (!warehouseList.length) {
			this.logger.error("Non sono stati definiti dei Magazzini");
			throw new WarehouseNotFoundException();
		}

		// Se il magazzino più vicino è troppo lontano, lancia un'eccezione
		if (nearestDistance > this.MAX_WH_DISTANCE && nearest) {
			this.logger.error(
				`L'indirizzo ${point} si trova troppo distante (${nearestDistance} m) dal magazzino più vicino ${nearest}`
			);
			throw new WarehouseTooFarException(nearest, nearestDistance);
		}

		// Restituisce il magazzino più vicino
		return nearest;
	}


	/**
	 * Verifica la disponibilità di una lista di prodotti in un magazzino specificato, considerando gli ordini esistenti.
	 *
	 * @param {Warehouse} warehouse - Il magazzino in cui verificare la disponibilità dei prodotti.
	 * @param {Order | null} order - L'ordine attuale o null se non viene fornito un contesto d'ordine.
	 * @param {string[]} products - Lista dei nomi dei prodotti di cui verificare la disponibilità.
	 * @return {Promise<ProductAvailability[]>} Una promise che risolve in una lista di disponibilità dei prodotti, aggiustata per le quantità in sospeso degli ordini.
	 */
	public async areProductsAvailable(
		warehouse: Warehouse,
		order: Order | null,
		products: string[]
	): Promise<ProductAvailability[]> {
		// Prendo la lista della disponibilità effettiva dei prodotti
		const productAvailabilityList = await this.productAvailabilityRepository.findByWarehouseAndProductNameIn(warehouse, products);

		// Prendo le quantità in pending per gli ordini non spediti
		let poq: OrderQuantity[];
		if (order == null) {
			// Recupero le quantità degli ordini nello stato 'CREATED' per il magazzino specificato
			poq = await this.orderQuantityRepository.findByOrderWarehouseAndOrderStatus(warehouse, OrderStatus.CREATED);
		} else {
			// Recupero le quantità degli ordini nello stato 'CREATED' escludendo l'ordine attuale
			poq = await this.orderQuantityRepository.findByOrderWarehouseAndOrderStatusAndOrderIdNot(warehouse, OrderStatus.CREATED, order.id);
		}

		// Aggiorno le quantità disponibili nel magazzino
		const newProductAvailabilityList = productAvailabilityList.map(
			(productAvailability) => new ProductAvailability(productAvailability)
		);
		// Sconto le quantità degli ordini trovati
		poq.forEach((orderQuantity) => {
			const q = newProductAvailabilityList.find(
				(pa) => pa.productId === orderQuantity.product.id
			);
			if (q) {
				q.qta -= orderQuantity.qta;
			}
		});

		// Ritorno la lista aggiornata di disponibilità dei prodotti
		return newProductAvailabilityList;
	}
}
