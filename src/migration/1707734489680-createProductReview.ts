import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductReview1707734489680 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE product_review(
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                product_id INT,
                rating DECIMAL(2, 1),
                comment TEXT,
                created_at INT,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE
            )`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE product_review`)
    }
}
