import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import Order from "../entities/order.entity";

export class OrderRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    super(
        orderRepository.target,
        orderRepository.manager,
        orderRepository.queryRunner,
    );
  }

}
