import { MigrationInterface, QueryRunner } from "typeorm"

const category = [
    {
        id: 1,
        name: "Electronics",
        parent_id: 0,
        cat_path: "/0/1/"
    },
    {
        id: 2,
        name: "Laptop",
        parent_id: 1,
        cat_path: "/0/1/2/"
    },
    {
        id: 3,
        name: "Computer",
        parent_id: 1,
        cat_path: "/0/1/3/"
    },
    {
        id: 4,
        name: "Mobile Phone",
        parent_id: 1,
        cat_path: "/0/1/4/"
    },
    {
        id: 5,
        name: "Console",
        parent_id: 1,
        cat_path: "/0/1/5/"
    },
    {
        id: 6,
        name: "Fashion",
        parent_id: 0,
        cat_path: "/0/6/"
    },
    {
        id: 7,
        name: "T-Shirt",
        parent_id: 6,
        cat_path: "/0/6/7/"
    },
    {
        id: 8,
        name: "Trousers",
        parent_id: 6,
        cat_path: "/0/6/8/"
    },
    {
        id: 9,
        name: "Shoes",
        parent_id: 6,
        cat_path: "/0/6/9/"
    }
]

export class InsertProductCategories1701752181610 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const cat of category) {
            await queryRunner.query(
                `INSERT INTO product_category(name, parent_id, cat_path)
                VALUES(?, ?, ?)`, [cat.name, cat.parent_id, cat.cat_path]
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE product_category;`)
    }

}
