import { Injectable } from "@nestjs/common";
import Product from "./entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async getProducts(): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');

    const products = await query.getMany();

    return products;
  }
}
