import { MigrationInterface, QueryRunner } from "typeorm"

const products = [
    {
        product_id: 1,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg",
        public_id: "tokopaedi/products/iphone-9.jpg"
    },
    {
        product_id: 2,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712315/tokopaedi/products/iphone-x.jpg",
        public_id: "tokopaedi/products/iphone-x.jpg"
    },
    {
        product_id: 3,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712300/tokopaedi/products/samsung-universe-94.jpg",
        public_id: "tokopaedi/products/samsung-universe-94.jpg"
    },
    {
        product_id: 4,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712173/tokopaedi/products/oppo-f19.jpg",
        public_id: "tokopaedi/products/oppo-f19.jpg"
    },
    {
        product_id: 5,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712164/tokopaedi/products/huawei-p30.jpg",
        public_id: "tokopaedi/products/huawei-p30.jpg"
    },
    {
        product_id: 6,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712144/tokopaedi/products/macbook-pro.jpg",
        public_id: "tokopaedi/products/macbook-pro.jpg"
    },
    {
        product_id: 7,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712131/tokopaedi/products/samsung-galaxy-book.jpg",
        public_id: "tokopaedi/products/samsung-galaxy-book.jpg"
    },
    {
        product_id: 8,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712122/tokopaedi/products/microsoft-surface-pro-4.jpg",
        public_id: "tokopaedi/products/microsoft-surface-pro-4.jpg"
    },
    {
        product_id: 9,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712108/tokopaedi/products/infinix-inbook-x1.jpg",
        public_id: "tokopaedi/products/infinix-inbook-x1.jpg"
    },
    {
        product_id: 10,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704714272/tokopaedi/products/hp-pavilion-15-DK1056WM.jpg",
        public_id: "tokopaedi/products/hp-pavilion-15-DK1056WM"
    },
    {
        product_id: 11,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732319/tokopaedi/products/20240212170516-playstation-5.jpg",
        public_id: "tokopaedi/products/20240212170516-playstation-5"
    },
    {
        product_id: 12,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732219/tokopaedi/products/20240212170336-retro-gaming-tshirt.jpg",
        public_id: "tokopaedi/products/20240212170336-retro-gaming-tshirt"
    },
    {
        product_id: 13,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732370/tokopaedi/products/20240212170607-urban-cargo-pants.png",
        public_id: "tokopaedi/products/20240212170607-urban-cargo-pants"
    },
    {
        product_id: 14,
        img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1707732411/tokopaedi/products/20240212170647-nike-air-max-720.png",
        public_id: "tokopaedi/products/20240212170647-nike-air-max-720"
    }
]

export class InsertSampleGallery1708927063797 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const prod of products) {
            await queryRunner.query(`INSERT INTO product_gallery(product_id, img_src, public_id, thumbnail, display_order) VALUES (?, ?, ?, ?, ?)
            `, [prod.product_id, prod.img_src, prod.public_id, 1, 1])
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        TRUNCATE TABLE product_gallery;
        `)
    }

}
