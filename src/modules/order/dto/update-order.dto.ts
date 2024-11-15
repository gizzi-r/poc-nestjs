import { ApiProperty } from "@nestjs/swagger";
import Point from "../../../utils/point";
import ProductQuantityDto from "../../warehouse/dto/product-quantity.dto";

export default class UpdateOrderDto {
  @ApiProperty()
  address: Point;

  @ApiProperty({
    type: ProductQuantityDto,
    isArray:true
  })
  products: ProductQuantityDto[];
}
