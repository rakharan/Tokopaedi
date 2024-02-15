import { MigrationInterface, QueryRunner } from "typeorm"

const collection = [
    {
        user_id: 6,
        name: "Clothes"
    },
    {
        user_id: 6,
        name: "Phones"
    },
    {
        user_id: 6,
        name: "Laptops"
    },
]

export class InsertSampleWishlistCollection1707991984450 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const sample of collection) {
            await queryRunner.query(`
                INSERT INTO wishlist_collections(user_id, name)
                VALUES(?, ?)
            `, [sample.user_id, sample.name])
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE wishlist_collection`)
    }

}
