import { Repository } from "typeorm";
import ProductAvailability from "../entities/product-availability.entity";
import { InjectRepository } from "@nestjs/typeorm";
import Warehouse from "../entities/warehouse.entity";

export class ProductAvailabilityRepository extends Repository<ProductAvailability>{
    constructor(
        @InjectRepository(ProductAvailability) private productAvailabilityRepository: Repository<ProductAvailability>
    ){
       super(productAvailabilityRepository.target,productAvailabilityRepository.manager,productAvailabilityRepository.queryRunner); 
    }

    /**
     * Trova la disponibilità dei prodotti per nome in un magazzino specifico.
     *
     * @param {Warehouse} warehouse - Il magazzino dove viene verificata la disponibilità dei prodotti.
     * @param {string[]} productsName - Un array di nomi di prodotti per controllare la disponibilità.
     * @return {Promise<ProductAvailability[]>} - Una promessa che si risolve in un array di oggetti di disponibilità dei prodotti.
     */
    async findByWarehouseAndProductNameIn(warehouse:Warehouse, productsName: string[]): Promise<ProductAvailability[]>{
       //Prendo la lista della disponibilità effettiva dei prodotti
        return this.productAvailabilityRepository.createQueryBuilder("productAvailability")
            .leftJoinAndSelect('productAvailability.product', 'product')
            .where({ warehouse })
            .andWhere('product.name in (:...productsName)', { productsName }).getMany();
    }
}