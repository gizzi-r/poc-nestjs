import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./roles";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: Role;
}
