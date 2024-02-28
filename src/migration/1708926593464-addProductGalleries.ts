import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProductGalleries1708926593464 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE product_gallery(
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT,
            img_src VARCHAR(150),
            public_id VARCHAR(100),
            thumbnail TINYINT(1),
            display_order INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES product(id) ON UPDATE CASCADE ON DELETE CASCADE
        )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DROP TABLE product_gallery
        `)
    }

}
