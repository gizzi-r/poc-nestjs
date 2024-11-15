import { HttpStatus } from "@nestjs/common";
import ProductException from "./product.exception";

export default class ProductNotFoundException extends ProductException{

    constructor(productName: string){
        super("Il prodotto '"+productName+"' non esiste",null,HttpStatus.NOT_FOUND);
    }
}