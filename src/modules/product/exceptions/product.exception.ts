import { HttpException, HttpStatus } from "@nestjs/common";
import Product from "../entities/product.entity";

export default class ProductException extends HttpException{
    product: Product | null;

    constructor(message: string, product:Product | null, status: HttpStatus | null){
        super(message,status || HttpStatus.BAD_REQUEST);
        this.product = product;
    }
}