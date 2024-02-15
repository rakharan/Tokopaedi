import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryPathTrigger1707817454703 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE TRIGGER create_category_path
            BEFORE INSERT
            ON product_category FOR EACH ROW
            BEGIN
                 SET new.cat_path = CONCAT(NEW.cat_path, (SELECT MAX(id) + 1 FROM product_category), "/");
            END
       `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS create_category_path`);
    }

}