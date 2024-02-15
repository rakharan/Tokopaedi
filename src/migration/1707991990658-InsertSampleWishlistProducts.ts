import { MigrationInterface, QueryRunner } from "typeorm"

const wishlistProducts = [
    {
        product_id: 12,
        collection_id: 1 //clothes
    },
    {
        product_id: 13,
        collection_id: 1 //clothes
    },
    {
        product_id: 1,
        collection_id: 2 //phones
    },
    {
        product_id: 2,
        collection_id: 2 //phones
    },
    {
        product_id: 8,
        collection_id: 3 //laptops
    },
    {
        product_id: 9,
        collection_id: 3 //laptops
    }
]

export class InsertSampleWishlistProducts1707991990658 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for(const prod of wishlistProducts) {
            await queryRunner.query(`
            INSERT INTO wishlist(product_id, collection_id)
            VALUES(?, ?)
            `, [prod.product_id, prod.collection_id])
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE wishlist`)
    }

}
