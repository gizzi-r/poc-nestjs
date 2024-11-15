import { HttpStatus } from "@nestjs/common";
import WarehouseException from "./warehouse.exception";
import Warehouse from "../entities/warehouse.entity";

export default class WarehouseTooFarException extends WarehouseException{

    constructor(warehouse: Warehouse, distance: number){
        super("Magazzino troppo distante ("+Math.floor(distance/1000)+" km)",warehouse,HttpStatus.BAD_REQUEST);
    }
}