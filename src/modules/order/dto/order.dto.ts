import { ApiProperty } from "@nestjs/swagger";
import Order from "../entities/order.entity";
import ProductQuantityDto from "../../warehouse/dto/product-quantity.dto";
import Point from "../../../utils/point";

export default class OrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  address: Point;

  @ApiProperty()
  products: ProductQuantityDto[];

  @ApiProperty()
  associated_warehouse: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  created_date: Date;

  @ApiProperty()
  last_update_date: Date;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
    this.associated_warehouse = partial.warehouse?.name;
    // this.created_date = partial.autid?.createdDate;
    // this.last_update_date = partial.autid?.lastUpdateDate;
  }
}
