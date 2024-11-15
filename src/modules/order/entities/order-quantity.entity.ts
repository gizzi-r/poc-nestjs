import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import Order from "./order.entity";
import Product from "../../product/entities/product.entity";

@Entity()
export default class OrderQuantity {
  @PrimaryColumn()
  productId: number;

  @PrimaryColumn()
  orderId: number;

  @ManyToOne(() => Product, (product) => product.id,{lazy:false})
  @JoinColumn({ name: "productId" })
  product: Product;

  @ManyToOne(() => Order, (po) => po.id,{lazy:false})
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column({type: 'double precision'})
  qta: number;

  constructor(partial: Partial<OrderQuantity>) {
    Object.assign(this, partial);
  }
}
