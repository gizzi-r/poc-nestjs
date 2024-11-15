import { HttpException, HttpStatus } from "@nestjs/common";
import Order from "../entities/order.entity";

export default class OrderException extends HttpException{
    product: Order | null;

    constructor(message: string, product:Order | null, status: HttpStatus | null){
        super(message,status || HttpStatus.BAD_REQUEST);
        this.product = product;
    }
}