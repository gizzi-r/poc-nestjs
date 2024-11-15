import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import Order from "./entities/order.entity";
import OrderQuantity from "./entities/order-quantity.entity";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { WarehouseModule } from "../warehouse/warehouse.module";

@Module({
  imports: [TypeOrmModule.forFeature([Order,OrderQuantity]), AuthModule,WarehouseModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
