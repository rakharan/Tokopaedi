import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateWishlistTable1707990375276 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE wishlist(
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT,
                collection_id INT,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (collection_id) REFERENCES wishlist_collections(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE wishlist`)
    }

}
