import { MigrationInterface, QueryRunner } from "typeorm";
import Warehouse from "../modules/warehouse/entities/warehouse.entity";
import Product from "../modules/product/entities/product.entity";
import Order from "../modules/order/entities/order.entity";
import { OrderStatus } from "../modules/order/entities/order-status.enum";
import ProductAvailability from "../modules/warehouse/entities/product-availability.entity";

export class SchemaUpdate1731007747265 implements MigrationInterface {
	name = "SchemaUpdate1731007747265";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
		await queryRunner.query(`CREATE TABLE "order_quantity" ("productId" uuid NOT NULL, "orderId" uuid NOT NULL, "qta" double precision NOT NULL, CONSTRAINT "PK_29e537c521492740f649964af19" PRIMARY KEY ("productId", "orderId"))`);
		await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" integer NOT NULL, "warehouseId" uuid, "addressLat" double precision NOT NULL, "addressLng" double precision NOT NULL, "autidCreateddate" TIMESTAMP, "autidCreated_by" character varying, "autidLastupdatedate" TIMESTAMP, "autidUpdated_by" character varying, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
		await queryRunner
			.query(`CREATE TABLE "warehouse" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address_Lat" double precision NOT NULL, "address_Lng" double precision NOT NULL, "autidCreateddate" TIMESTAMP, "autidCreated_by" character varying, "autidLastupdatedate" TIMESTAMP, "autidUpdated_by" character varying, CONSTRAINT "PK_965abf9f99ae8c5983ae74ebde8" PRIMARY KEY ("id"))`);
		await queryRunner.query(`CREATE TABLE "product_availability" ("productId" uuid NOT NULL, "warehouseId" uuid NOT NULL, "qta" double precision NOT NULL, CONSTRAINT "PK_c0b129915593da97594b6820b17" PRIMARY KEY ("productId", "warehouseId"))`);
		await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
		await queryRunner.query(`ALTER TABLE "order_quantity" ADD CONSTRAINT "FK_b5722db2a5eaa36f02eec5b4e85" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "order_quantity" ADD CONSTRAINT "FK_b4b4b2443b4950530f9cd37cf55" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_6f10934b8f62950faf398a2c293" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "product_availability" ADD CONSTRAINT "FK_32b2f8e6768a58cefee46a39f34" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
		await queryRunner.query(`ALTER TABLE "product_availability" ADD CONSTRAINT "FK_5ebe10fecd1da20ed646a61068a" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

		//await queryRunner.query("INSERT into product(name) VALUES ('Passata'),('Olio'),('Tonno'),('Pasta'),('Fagioli'),('Piselli'),('Cereali'),('Caffe')");
		// await queryRunner.connection.createQueryBuilder().insert().into(Warehouse)
		//   .values([
		//       { name: "test" }
		//   ])
		//   .execute();
		await queryRunner.commitTransaction().then(async () => {
			await queryRunner.startTransaction().then(async () => {
				const productNames = ["Passata", "Olio", "Tonno", "Pasta", "Fagioli", "Piselli", "Cereali", "Caffe"];
				const products = await queryRunner.connection.getRepository(Product).insert(productNames.map(name => {
					return { name };
				}))

				const productsId = products.generatedMaps.map(obj => obj.id);
``

				const result = await queryRunner.connection.getRepository(Warehouse).insert({
					name: "Pioltello",
					point: {
						lat: 45.511591,
						lng: 9.32181
					}
				});
				const warehouseId = result.generatedMaps[0].id;

				await queryRunner.connection.getRepository(ProductAvailability).insert(productsId.map( pid => {
					return {
						product:{id:pid},
						warehouse:{id:warehouseId},
						qta:100
					}
				}))

				const baseOrder = {
					warehouse: { id: warehouseId },
					status: OrderStatus.CREATED,
					address: { lat: 45.511591, lng: 9.32181 },
					autid: {
						createdDate: new Date("2024-09-03 00:00:00.000000"),
						lastUpdateDate: new Date("2024-09-03 00:00:00.000000")
					},
					products: []

				};
				const orders = await queryRunner.connection.getRepository(Order).insert([
					{
						...baseOrder
					},
					{
						...baseOrder,
						address: { lat: 45.521591, lng: 9.32181 },
						autid: {
							createdDate: new Date("2024-09-02 00:00:00.000000"),
							lastUpdateDate: new Date("2024-09-02 00:00:00.000000")
						}
					},
					{
						...baseOrder,
						address: { lat: 45.531591, lng: 9.33181 },
						autid: {
							createdDate: new Date("2024-09-01 00:00:00.000000"),
							lastUpdateDate: new Date("2024-09-01 00:00:00.000000")
						}
					},
					{
						...baseOrder,
						address: { lat: 45.541591, lng: 9.34181 },
						autid: {
							createdDate: new Date("2024-09-03 00:00:00.000000"),
							lastUpdateDate: new Date("2024-09-03 00:00:00.000000")
						}
					},
					{
						...baseOrder,
						address: { lat: 45.551591, lng: 9.35181 },
						autid: {
							createdDate: new Date("2024-09-03 00:00:00.000000"),
							lastUpdateDate: new Date("2024-09-03 00:00:00.000000")
						}
					},
					{
						...baseOrder,
						address: { lat: 45.561591, lng: 9.37181 },
						autid: {
							createdDate: new Date("2024-09-03 00:00:00.000000"),
							lastUpdateDate: new Date("2024-09-03 00:00:00.000000")
						}
					}
				]);

				const ordersId = orders.generatedMaps.map(obj => obj.id);

				await queryRunner.query(`INSERT into order_quantity ("orderId","productId","qta") VALUES 
				('${ordersId[0]}','${productsId[0]}',10),
				('${ordersId[0]}','${productsId[1]}',6),
				('${ordersId[0]}','${productsId[2]}',15),
				('${ordersId[0]}','${productsId[4]}',3),
				('${ordersId[0]}','${productsId[5]}',4),
				('${ordersId[0]}','${productsId[6]}',5),
				
				('${ordersId[1]}','${productsId[2]}',1),
				('${ordersId[1]}','${productsId[4]}',1),
				('${ordersId[1]}','${productsId[5]}',3),
				('${ordersId[1]}','${productsId[6]}',3),

				('${ordersId[2]}','${productsId[0]}',10),
				('${ordersId[2]}','${productsId[1]}',6),
				('${ordersId[2]}','${productsId[2]}',15),

				('${ordersId[5]}','${productsId[2]}',1),
				('${ordersId[5]}','${productsId[4]}',2),
				('${ordersId[5]}','${productsId[5]}',3),
				('${ordersId[5]}','${productsId[6]}',3),

				('${ordersId[4]}','${productsId[5]}',4),
				('${ordersId[4]}','${productsId[6]}',4),

				('${ordersId[5]}','${productsId[1]}',3),
				('${ordersId[5]}','${productsId[0]}',3)
				`)

				// await queryRunner.connection.getRepository(OrderQuantity).insert(orders.generatedMaps.map(obj => {
				// 	return {
				// 		product: {
				// 			id: products.generatedMaps[1].id
				// 		},
				// 		order: {
				// 			id: obj.id
				// 		},
				// 		qta: 10
				// 	};
				// }));

			});
		});
		//await queryRunner.query(`// INSERT into "warehouse" (name,"address_Lat","address_Lng") VALUES ('Pioltello',45.511591,9.32181);`);

// (1,'CREATED',45.541591,9.34181,'2024-09-03 00:00:00.000000','2024-09-03 00:00:00.000000'),
// (1,'SHIPPED',45.551591,9.35181,'2024-09-03 00:00:00.000000','2024-09-03 00:00:00.000000'),
// (1,'DELETED',45.561591,9.37181,'2024-09-03 00:00:00.000000','2024-09-03 00:00:00.000000')`);


	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "product_availability" DROP CONSTRAINT "FK_5ebe10fecd1da20ed646a61068a"`);
		await queryRunner.query(`ALTER TABLE "product_availability" DROP CONSTRAINT "FK_32b2f8e6768a58cefee46a39f34"`);
		await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_6f10934b8f62950faf398a2c293"`);
		await queryRunner.query(`ALTER TABLE "order_quantity" DROP CONSTRAINT "FK_b4b4b2443b4950530f9cd37cf55"`);
		await queryRunner.query(`ALTER TABLE "order_quantity" DROP CONSTRAINT "FK_b5722db2a5eaa36f02eec5b4e85"`);
		await queryRunner.query(`DROP TABLE "users"`);
		await queryRunner.query(`DROP TABLE "product_availability"`);
		await queryRunner.query(`DROP TABLE "warehouse"`);
		await queryRunner.query(`DROP TABLE "order"`);
		await queryRunner.query(`DROP TABLE "order_quantity"`);
		await queryRunner.query(`DROP TABLE "product"`);
	}

}
