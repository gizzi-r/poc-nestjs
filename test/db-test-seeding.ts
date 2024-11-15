import { EntityManager } from "typeorm";
import Warehouse from "../src/modules/warehouse/entities/warehouse.entity";
import Product from "../src/modules/product/entities/product.entity";
import ProductAvailability from "../src/modules/warehouse/entities/product-availability.entity";

export const DbTestSeeding = async (entityManager: EntityManager) => {

	const productNames = ["Passata", "Olio", "Tonno", "Pasta", "Fagioli", "Piselli", "Cereali", "Caffe"];
	const productsId = (await entityManager.getRepository(Product).insert(productNames.map(name => {
		return { name };
	}))).generatedMaps.map(map => map.id)


	const warehouseId = (await entityManager.getRepository(Warehouse).insert({
		name: "Pioltello",
		point: {
			lat: 45.511591,
			lng: 9.32181
		}
	})).generatedMaps[0].id;

	await entityManager.getRepository(ProductAvailability).insert([
		{
			product:{id:productsId[0]},
			warehouse:{id:warehouseId},
			qta:10
		},
		{
			product:{id:productsId[1]},
			warehouse:{id:warehouseId},
			qta:6
		},
		{
			product:{id:productsId[2]},
			warehouse:{id:warehouseId},
			qta:15
		},
		{
			product:{id:productsId[4]},
			warehouse:{id:warehouseId},
			qta:3
		},
		{
			product:{id:productsId[5]},
			warehouse:{id:warehouseId},
			qta:4
		},
		{
			product:{id:productsId[6]},
			warehouse:{id:warehouseId},
			qta:5
		},

	])
};