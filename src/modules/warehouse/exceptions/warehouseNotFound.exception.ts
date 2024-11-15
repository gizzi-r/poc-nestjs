import { HttpStatus } from "@nestjs/common";
import WarehouseException from "./warehouse.exception";

export default class WarehouseNotFoundException extends WarehouseException{

    constructor(){
        super("Magazzino non trovato",null,HttpStatus.NOT_FOUND);
    }
}