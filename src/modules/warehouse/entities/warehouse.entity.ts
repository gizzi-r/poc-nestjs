import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import ProductAvailability from "./product-availability.entity";
import Point from "../../../utils/point";
import { Auditable } from "../../../support/auditable.interface";
import Order from "../../order/entities/order.entity";
import Audit from "../../../utils/audit";

@Entity()
export default class Warehouse implements Auditable {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  @Column(() => Point, { prefix: "address_" })
  point: Point;

  @OneToMany(() => Order, (po) => po.warehouse)
  orders: Order[];

  @OneToMany(() => ProductAvailability, (ap) => ap.warehouse, {
    eager: true,
  })
  availableProducts: ProductAvailability[];

  @Column(() => Audit)
  autid: Audit;

  getAudit(): Audit {
    return this.autid;
  }

  setAudit(audit: Audit): void {
    this.autid = audit;
  }
}
