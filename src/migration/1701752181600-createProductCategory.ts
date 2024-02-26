import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductCategory1701752181600 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE product_category (        
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50),
                parent_id INT NULL,
                cat_path VARCHAR(50),
                FOREIGN KEY(parent_id) REFERENCES product_category(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE product_category
        `)
    }

}
