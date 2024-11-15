import { ApiProperty } from "@nestjs/swagger";
import Warehouse from "../entities/warehouse.entity";
import ProductQuantityDto from "./product-quantity.dto";
import Point from "../../../utils/point";

export default class WarehouseDto {
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  point: Point;
  
  @ApiProperty()
  products: ProductQuantityDto[];


  constructor(partial: Partial<Warehouse>) {
  this.name = partial.name;
  this.point = partial.point;
  this.products = partial.availableProducts?.map(p => new ProductQuantityDto(p));
  }
}
