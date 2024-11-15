import { HttpStatus } from "@nestjs/common";
import OrderException from "./order.exception";

export default class DeliveryOrderException  extends OrderException{

    constructor(msg : string){
        super(msg,null,HttpStatus.BAD_REQUEST);
    }
}