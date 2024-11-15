import { HttpException, HttpStatus } from "@nestjs/common";
import Warehouse from "../entities/warehouse.entity";

export default class WarehouseException extends HttpException{
    warehouse: Warehouse | null;

    constructor(message: string, warehouse:Warehouse | null, status: HttpStatus | null){
        super(message,status || HttpStatus.BAD_REQUEST);
        this.warehouse = warehouse;
    }
}