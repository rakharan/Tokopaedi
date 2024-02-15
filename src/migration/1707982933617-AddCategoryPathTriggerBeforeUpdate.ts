import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCategoryPathTriggerBeforeUpdate1707982933617 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TRIGGER update_category_path
            BEFORE UPDATE
                ON product_category FOR EACH ROW
            BEGIN
                IF NEW.parent_id <> OLD.parent_id THEN
                    SET NEW.cat_path = CONCAT(NEW.cat_path, NEW.id, "/");
                END IF;
            END
       `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_category_path`);
    }

}
