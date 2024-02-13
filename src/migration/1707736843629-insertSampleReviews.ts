import { MigrationInterface, QueryRunner } from "typeorm"

const productReviews = [
    {
        user_id: 6,
        product_id: 1,
        rating: 4,
        comment: "Great phone, smooth performance.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 2,
        rating: 5,
        comment: "Absolutely love it, the display is stunning!",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 3,
        rating: 3,
        comment: "Decent phone, but overpriced.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 4,
        rating: 2,
        comment: "Disappointed with the performance, wouldn't recommend.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 5,
        rating: 4,
        comment: "Good value for money, but limited stock.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 6,
        rating: 5,
        comment: "Amazing laptop, worth every penny.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 7,
        rating: 4,
        comment: "Sleek design, powerful performance.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 8,
        rating: 3,
        comment: "Decent laptop, but there are better options available.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 9,
        rating: 4,
        comment: "Good specs for the price, happy with my purchase.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 10,
        rating: 5,
        comment: "Excellent gaming laptop, highly recommend!",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 11,
        rating: 4,
        comment: "Great console, but availability is an issue.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 12,
        rating: 5,
        comment: "Love the retro design, very comfortable!",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 13,
        rating: 3,
        comment: "Decent pants, but the quality could be better.",
        created_at: 1707736820
    },
    {
        user_id: 6,
        product_id: 14,
        rating: 4.0,
        comment: "Comfortable shoes, great for running.",
        created_at: 1707736820
    }
];



export class InsertSampleReviews1707736843629 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const review of productReviews) {
            await queryRunner.query(
                `INSERT INTO product_review(user_id, product_id, rating, comment, created_at)
                VALUES(?, ?, ?, ?, ?)`, [review.user_id, review.product_id, review.rating, review.comment, review.created_at]
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM product_review`)
    }

}
