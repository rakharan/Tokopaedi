import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDummyUser1707735114049 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at, is_verified) VALUES ('Tokopaedi User', 'user.tokopaedi@gmail.com', '$2a$10$on3rrDVNqJjHQzsTOQgnaewQ0B7Mc4UVMuDF43KEmIdUsDXc16yEa', 3, 1701856885, 1)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE name = "Tokopaedi User"`
        await queryRunner.query(query)
    }
}
