import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { WarehouseController } from "./warehouse.controller";
import { WarehouseService } from "./warehouse.service";
import Warehouse from "./entities/warehouse.entity";
import ProductAvailability from "./entities/product-availability.entity";
import { ProductAvailabilityRepository } from "./repositories/product-availability.repository";
import OrderQuantity from "../order/entities/order-quantity.entity";
import { OrderQuantityRepository } from "./repositories/order-quantity.repository";
import { WarehouseRepository } from "./repositories/warehouse.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      ProductAvailability,
      OrderQuantity
    ]),
    AuthModule,
  ],
  controllers: [WarehouseController],
  providers: [
    WarehouseService,
    WarehouseRepository,
    ProductAvailabilityRepository,
    OrderQuantityRepository,
  ],
  exports: [WarehouseService],
})
export class WarehouseModule {}
