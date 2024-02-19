import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryPathTrigger1707817454703 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE TRIGGER create_category_path
            BEFORE INSERT
            ON product_category FOR EACH ROW
            BEGIN
            DECLARE new_id INT;
            SET new_id = (SELECT AUTO_INCREMENT FROM information_schema.tables
                          WHERE table_schema = DATABASE() AND table_name = 'product_category');
            SET NEW.cat_path = CONCAT(NEW.cat_path, new_id, "/");
            END
       `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS create_category_path`);
    }

}