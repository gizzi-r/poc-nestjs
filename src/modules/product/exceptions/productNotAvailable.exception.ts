import ProductException from "./product.exception";

export default class ProductNotAvailableException extends ProductException{

    constructor(productName: string){
        super("Il prodotto '"+productName+"' non è disponibile nelle quantità richieste",null,null);
    }
}