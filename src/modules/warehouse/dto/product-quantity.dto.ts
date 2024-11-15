import { ApiProperty } from "@nestjs/swagger";
import ProductAvailability from "../entities/product-availability.entity";
import OrderQuantity from "../../order/entities/order-quantity.entity";


export default class ProductQuantityDto {
    @ApiProperty()
    name: string;
    
    @ApiProperty()
    qta: number;
      
  
    constructor(partial: Partial<ProductAvailability | OrderQuantity>) {
        this.name = partial.product?.name;
        this.qta = partial.qta;
    }
  }
  