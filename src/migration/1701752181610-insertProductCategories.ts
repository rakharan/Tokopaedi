import { MigrationInterface, QueryRunner } from "typeorm"

const category = [
    {
        id: 1,
        name: "Electronics",
        parent_id: null,
        cat_path: "/0/1/"
    },
    {
        id: 2,
        name: "Phones & Accessories",
        parent_id: 1,
        cat_path: "/0/1/2/"
    },
    {
        id: 3,
        name: "Smartphones",
        parent_id: 2,
        cat_path: "/0/1/2/3/"
    },
    {
        id: 4,
        name: "Phone Cases",
        parent_id: 2,
        cat_path: "/0/1/2/4/"
    },
    {
        id: 5,
        name: "Chargers & Cables",
        parent_id: 2,
        cat_path: "/0/1/2/5/"
    },
    {
        id: 6,
        name: "Computers & Accessories",
        parent_id: 1,
        cat_path: "/0/1/6/"
    },
    {
        id: 7,
        name: "Laptops",
        parent_id: 6,
        cat_path: "/0/1/6/7/"
    },
    {
        id: 8,
        name: "Desktops",
        parent_id: 6,
        cat_path: "/0/1/6/8/"
    },
    {
        id: 9,
        name: "Computer Components",
        parent_id: 6,
        cat_path: "/0/1/6/9/"
    },
    {
        id: 10,
        name: "Fashion",
        parent_id: null,
        cat_path: "/0/10/"
    },
    {
        id: 11,
        name: "Clothing",
        parent_id: 10,
        cat_path: "/0/10/11/"
    },
    {
        id: 12,
        name: "Men's Clothing",
        parent_id: 11,
        cat_path: "/0/10/11/12/"
    },
    {
        id: 13,
        name: "Women's Clothing",
        parent_id: 11,
        cat_path: "/0/10/11/13/"
    },
    {
        id: 14,
        name: "Kids' Clothing",
        parent_id: 11,
        cat_path: "/0/10/11/14/"
    },
    {
        id: 15,
        name: "Shoes",
        parent_id: 10,
        cat_path: "/0/10/15/"
    },
    {
        id: 16,
        name: "Men's Shoes",
        parent_id: 15,
        cat_path: "/0/10/15/16/"
    },
    {
        id: 17,
        name: "Women's Shoes",
        parent_id: 15,
        cat_path: "/0/10/15/17/"
    },
    {
        id: 18,
        name: "Kids' Shoes",
        parent_id: 15,
        cat_path: "/0/10/15/18/"
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
