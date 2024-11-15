import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1731007887938 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("INSERT INTO users (username, password, role) VALUES ('administrator','$2b$10$8wEXnFCTzSN9u6eZPmCboOoqqMCpS9xNsFRMzt.I0wCjjWkS9z56u','ADMIN')")//Pass: Admin123
    await queryRunner.query("INSERT INTO users (username, password, role) VALUES ('useraccount','$2b$10$Yay01XLTXMnyFlt0ZYREg.wa6Zs6d/z0xd6yJ.b/6CSRd3qEXgwM.','USER')") //Pass : User1234
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE from users where username='administrator'")
    await queryRunner.query("DELETE from users where username='useraccount'");
  }
}
