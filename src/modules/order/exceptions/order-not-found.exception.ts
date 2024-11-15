import { HttpStatus } from "@nestjs/common";
import OrderException from "./order.exception";

export default class OrderNotFoundException extends OrderException{

    constructor(idOrder: number){
        super("L'ordine '"+idOrder+"' non è stato trovato",null,HttpStatus.NOT_FOUND);
    }
}