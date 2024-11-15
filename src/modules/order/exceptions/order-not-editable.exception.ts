import { HttpStatus } from "@nestjs/common";
import OrderException from "./order.exception";

export default class OrderNotEditableException extends OrderException{

    constructor(idOrder: number){
        super("L'ordine '"+idOrder+"'  non può essere modificato",null,HttpStatus.BAD_REQUEST);
    }
}