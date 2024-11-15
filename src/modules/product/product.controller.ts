import { Controller, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";


@ApiTags("Product")
@Controller('/api/v1/products')
@UseGuards(AuthGuard())
export class ProductController {
  // private logger = new Logger('ProductController',{timestamp:true});
}