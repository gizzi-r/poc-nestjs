import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Warehouse from "../../warehouse/entities/warehouse.entity";
import { OrderStatus } from "./order-status.enum";
import OrderQuantity from "./order-quantity.entity";
import { Auditable } from "../../../support/auditable.interface";
import Point from "../../../utils/point";
import Audit from "../../../utils/audit";

@Entity()
export default class Order implements Auditable {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column(() => Point)
  address: Point;

  @ManyToOne(() => Warehouse, (wh) => wh.orders, { eager: true })
  warehouse: Warehouse;

  @Column(() => Audit)
  autid: Audit;

  @Column()
  status: OrderStatus = OrderStatus.CREATED;

  @OneToMany(() => OrderQuantity, (oq) => oq.order, {
    eager: true,
    nullable:false,
    orphanedRowAction: "delete",
  })
  products: OrderQuantity[];

  getAudit(): Audit {
    return this.autid;
  }

  setAudit(audit: Audit): void {
    this.autid = audit;
  }
}
