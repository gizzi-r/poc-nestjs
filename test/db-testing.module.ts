import { TypeOrmModule } from "@nestjs/typeorm";
import Warehouse from "../src/modules/warehouse/entities/warehouse.entity";
import ProductAvailability from "../src/modules/warehouse/entities/product-availability.entity";
import OrderQuantity from "../src/modules/order/entities/order-quantity.entity";
import Product from "../src/modules/product/entities/product.entity";
import Order from "../src/modules/order/entities/order.entity";


export const DBTestingModule = () => [
	TypeOrmModule.forRoot({
		type: 'sqlite',
		database: ':memory:',
		dropSchema: true,
		autoLoadEntities:true,
		synchronize: true
	}),
	TypeOrmModule.forFeature([Warehouse,ProductAvailability,OrderQuantity,Product,Order]),
];