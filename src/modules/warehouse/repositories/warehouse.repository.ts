import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import Warehouse from "../entities/warehouse.entity";

export class WarehouseRepository extends Repository<Warehouse> {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {
    super(
        warehouseRepository.target,
        warehouseRepository.manager,
        warehouseRepository.queryRunner,
    );
  }

}
