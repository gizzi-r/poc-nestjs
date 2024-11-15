import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OrderService } from "./order.service";
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/guards/roles.guard";
import OrderDto from "./dto/order.dto";
import Page from "../../utils/page";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/entities/roles";
import OrderFilter from "./filters/order.filter";
import CreateOrderDto from "./dto/create-order.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../auth/entities/user.entity";
import UpdateOrderDto from "./dto/update-order.dto";

@ApiTags("Order")
@Controller('/api/v1/orders')
@UseGuards(AuthGuard(),RolesGuard)
export class OrderController {

  constructor(private orderService: OrderService) {}

  @ApiOperation({
		summary: "Ricerca un ordine tramite id",
    parameters:[
      { name:"oderId", in: "path", required:true}
    ]
	})
  @ApiOkResponse({
    description: "Ordine Trovato",
		type: OrderDto,
  })
  @ApiNotFoundResponse({
    description: "Ordine non Trovato",
  })
  @ApiForbiddenResponse({ description: "Forbidden." })
  @Get('/:orderId')
  @Roles(Role.ADMIN,Role.USER)
  getOrder(@Param('orderId') orderId: number): Promise<OrderDto> {
    return this.orderService.getOrder(orderId);
  }

  @ApiOperation({
    summary: "Ricerca paginata degli ordini",
  })
  @ApiOkResponse({
    description: "Pagini contenente gli ordini trovati",
    type: Page<OrderDto>,
  })
  @Get()
  @Roles(Role.ADMIN,Role.USER)
  getOrderList(@Query() filter: OrderFilter): Promise<Page<OrderDto>> {
    return this.orderService.getAll(filter);
  }

  @ApiOperation({
    summary: "Ricerca paginata degli ordini",
  })
  @ApiOkResponse({
    description: "Pagini contenente gli ordini Trovat",
    type: Page<OrderDto>,
  })
  @Post()
  @Roles(Role.ADMIN,Role.USER)
  @HttpCode(HttpStatus.CREATED)
  createOrder(@Body() orderDto: CreateOrderDto,@GetUser() user: User): Promise<OrderDto> {
    return this.orderService.createOrder(orderDto,user);
  }

  @Patch("/:orderId")
  @Roles(Role.ADMIN,Role.USER)
  updateOrder(@Param('orderId') orderId: number,@Body() orderDto: UpdateOrderDto,@GetUser() user: User): Promise<OrderDto> {
    return this.orderService.updateOrder(orderId,orderDto,user);
  }

  @Delete("/:orderId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN,Role.USER)
  deleteOrder(@Param('orderId') orderId: number,@GetUser() user: User): Promise<void> {
    return this.orderService.deleteOrder(orderId,user);
  }

  @Post("/delivery")
  @Roles(Role.ADMIN)
  calculateDelivery(@Body() orderIdList: number[]): Promise<OrderDto[]> {
    return this.orderService.calculateDelivery(orderIdList);
  }
}
