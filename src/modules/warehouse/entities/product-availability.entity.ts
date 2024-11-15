import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Warehouse from "./warehouse.entity";
import Product from "../../product/entities/product.entity";

@Entity()
export default class ProductAvailability {
  @PrimaryColumn()
  productId: number;

  @PrimaryColumn()
  warehouseId: number;

  @ManyToOne(() => Product, (product) => product.id,{lazy:false})
  @JoinColumn({ name: "productId" })
  product: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.id)
  @JoinColumn({ name: "warehouseId" })
  warehouse: Warehouse;

  @Column({type:"double precision"})
  qta: number;

  constructor(partial: Partial<ProductAvailability>) {
    Object.assign(this, partial);
  }
}
