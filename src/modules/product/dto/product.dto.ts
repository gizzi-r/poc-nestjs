import Product from "../entities/product.entity";

export default class ProductDto{
    id : number;

    name: string;

    constructor(partial: Partial<Product>) {
        Object.assign(this,partial);
    }
}