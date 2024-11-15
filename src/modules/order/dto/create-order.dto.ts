import { ApiProperty } from "@nestjs/swagger";
import Point from "../../../utils/point";
import ProductQuantityDto from "../../warehouse/dto/product-quantity.dto";

export default class CreateOrderDto {
  @ApiProperty({
    required: true,
  })
  address: Point;

  @ApiProperty({
    required: true,
    type: ProductQuantityDto,
    isArray:true
  })
  products: ProductQuantityDto[];
}
