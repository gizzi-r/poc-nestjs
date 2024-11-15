import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Product {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  constructor(name : string) {
    this.name = name
  }
}
