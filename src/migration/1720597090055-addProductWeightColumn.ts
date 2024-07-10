import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProductWeightColumn1720597090055 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product ADD COLUMN weight INT(5) DEFAULT '1000' COMMENT 'In gram' AFTER category`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product DROP COLUMN weight`)
    }

}
