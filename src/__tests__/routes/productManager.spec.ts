import buildServer from "../../index"

import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import path from "path"
import { DeleteImage } from "../../helpers/utils/image/imageHelper"
import { Product } from "../../domain/model/BaseClass/Product"
import ProductAppService from "../../application/service/Product"
import ProductDomainService from "../../domain/service/ProductDomainService"
import dotenvFlow from 'dotenv-flow';

//configuration for dotenv
dotenvFlow.config({ path: path.resolve(__dirname, `../../../`) });

describe('Lists of routes accessible to product manager', () => {
    let app;
    let superAdminJwt: string;
    let newImageFilepath: string;
    let updateImageFilepath: string;
    let bigImageFilepath: string;
    let newProductRequestData: Record<string, string | number>;
    let newlyCreatedProduct: Product;
    let newlyCreatedProductId: number;
    let updateProductRequest
    let newHeadCategory
    let newSubCategory

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
        newImageFilepath = path.resolve(__dirname, '../__mocks__/tokopaedi.jpg');
        updateImageFilepath = path.resolve(__dirname, '../__mocks__/lupabapak.jpg');
        bigImageFilepath = path.resolve(__dirname, '../__mocks__/big-image.jpg');
        newProductRequestData = {
            name: "Black T-Shirt",
            description: "A plain black t-shirt",
            price: 1000,
            stock: 100,
            category: 12, // Men's Clothing category
        };

        newHeadCategory = {
            id: 0,
            name: "Daily Needs",
            parent_id: 0,
            cat_path: ""
        }

        newSubCategory = {
            id: 0,
            name: "HealthCare",
            parent_id: 0, // will be updated to be the everyday's need id.
            cat_path: ""
        }
    })

    afterAll(async () => {
        await app.close()
        await ProductDomainService.HardDeleteProductDomain(newlyCreatedProductId)
    })

    const productColumnName = ['id', 'name', 'description', 'category', 'price', 'stock', 'rating', 'review_count', 'public_id', 'img_src']

    const productDetailColumnName = ['id', 'name', 'description', 'category_name', 'price', 'stock', 'rating', 'review_count', 'public_id', 'img_src']

    const paginationResponseBodyProperty = ['data', 'column', 'lastId', 'hasNext', 'currentPageDataCount']

    const productReviewColumnName = ['id', 'user_id', 'name', 'product_id', 'rating', 'comment', 'created_at']

    const productCategoryColumnName = ['id', 'parent_id', 'name', 'cat_path']

    it('Should create a product', async function () {

        /**
         * Test create product api
         * .set is to set header to the request.
         * .attach is to attach a file, used to file upload into request.files
         */
        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/create')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .field('name', newProductRequestData.name)
            .field('description', newProductRequestData.description)
            .field('price', newProductRequestData.price)
            .field('stock', newProductRequestData.stock)
            .field('category', newProductRequestData.category)
            .attach('image', newImageFilepath, { contentType: 'image/jpeg' })

        expect(body.message).toEqual(true)
        expect(statusCode).toBe(200)
    })

    it('Should return list of products in ascending sort.', async () => {

        //sample of requestBody.
        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC"
        }
        //extract the response body.
        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)

        //extract the data
        const data = body.message.data

        const dataLength = data.length

        //extract the last element.
        const lastElement = data[dataLength - 1]
        const firstElement = data[0]

        expect(data).toHaveLength(5)
        expect(body.message.column).toHaveLength(10)
        productColumnName.forEach(element => expect(body.message.column).toContain(element))
        paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        expect(body.message).toHaveProperty("hasNext", true)

        //because sort is ASC, we need to test that the sort is working.
        //Product index 0 is the id.
        expect(firstElement[0]).toEqual(reqBody.lastId + 1)
        expect(lastElement[0]).toBeGreaterThan(firstElement[0])
    })

    it('Should return list of products in descending sort.', async () => {

        //sample of requestBody.
        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC"
        }
        //extract the response body.
        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)

        //extract the data
        const data = body.message.data

        const dataLength = data.length

        //extract the last element.
        const lastElement = data[dataLength - 1]
        const firstElement = data[0]

        expect(data).toHaveLength(5)
        expect(body.message.column).toHaveLength(10)
        productColumnName.forEach(element => expect(body.message.column).toContain(element))
        paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        expect(body.message).toHaveProperty("hasNext", true)

        //because sort is ASC, we need to test that the sort is working.
        //Product index 0 is the id.
        expect(firstElement[0]).toEqual(reqBody.lastId + 1)
        expect(lastElement[0]).toBeGreaterThan(firstElement[0])
    })

    it('Should return a single/list of products with search filter', async () => {

        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC",
            search: `({name} = '${newProductRequestData.name}')`
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)

        //assign the response to the newlyCreatedProduct to use later on.
        newlyCreatedProduct = body.message.data[0]
        newlyCreatedProductId = newlyCreatedProduct[0]

        //extract the data
        const productName = body.message.data[0][1]
        const productDescrtiption = body.message.data[0][2]
        const productPrice = body.message.data[0][4]
        const productStock = body.message.data[0][5]

        expect(productName).toEqual(newProductRequestData.name)
        expect(productDescrtiption).toEqual(newProductRequestData.description)
        expect(productPrice).toEqual(parseFloat(newProductRequestData.price.toString()).toFixed(2));
        expect(productStock).toEqual(newProductRequestData.stock)
    });

    it('Should return details of a product', async () => {

        const productData = {
            id: 1,
            name: "iPhone 9",
            description: "An apple mobile which is nothing like apple",
            category_name: "Smartphones",
            price: 549,
            stock: 100,
            rating: 4,
            is_wishlisted: false,
            review_count: 1,
            public_id: "tokopaedi/products/iphone-9.jpg",
            img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg"
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/product/detail')
            .send({ id: 1 })
            .expect(200)

        expect(body.message).toEqual(productData)
        expect(body.message.id).toEqual(1)
        productDetailColumnName.forEach(element => expect(body.message).toHaveProperty(element))
    })

    it('Should update a single product', async () => {
        updateProductRequest = {
            id: newlyCreatedProductId,
            name: "Product is just updated",
            stock: 50,
            description: "Product just updated",
            price: 10000
        }

        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/update')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .set('Authorization', superAdminJwt)
            .field('id', updateProductRequest.id)
            .field('name', updateProductRequest.name)
            .field('description', updateProductRequest.description)
            .field('price', updateProductRequest.price)
            .field('stock', updateProductRequest.stock)
            .attach('image', updateImageFilepath, { contentType: 'image/jpeg' })

        expect(statusCode).toBe(200)
        expect(body.message).toEqual(true)
    });

    it('Should check low stock products', async () => {
        const response = await ProductAppService.CheckLowStockProduct()
        expect(response).toEqual(true)
    });

    describe.sequential(`Product review endpoint.`, async () => {
        it('Should return a list of a single product reviews', async () => {
            //sample of requestBody.
            const reqBody = {
                id: 2,
                limit: 1,
                lastId: 0,
                sort: "ASC"
            }
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/product/review/list')
                .send(reqBody)
                .expect(200)

            //extract the data
            const data = body.message.data

            //extract the first element.
            const firstElement = data[0]

            // expect the review id is matching
            expect(firstElement[0]).toBe(2)

            expect(data).toHaveLength(1)
            expect(body.message.column).toHaveLength(7)
            productReviewColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("hasNext", false)
        })

        it('Should return the detail of a single review', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/product/review/detail')
                .send({ id: 2 })
                .expect(200)

            //extract the data
            const data = body.message

            expect(data.id).toEqual(2)
            expect(data.user_id).toEqual(6)

            productReviewColumnName.forEach(element => expect(body.message).toHaveProperty(element))
        })
    })

    describe.sequential('Product category endpoint', () => {

        it('Should create a new head category (0 as parent_id)', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/category/create')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ name: newHeadCategory.name, parent_id: newHeadCategory.parent_id })

            console.log({ body })
            expect(body.message).toEqual(true)
        })

        it('Should return a category list with name filter (newly created head category)', async () => {
            const reqBody = {
                lastId: 0,
                sort: "ASC",
                search: `({name} = '${newHeadCategory.name}')`
            }
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/product/category/list')
                .send(reqBody)

            console.log({ body })

            //extract the data
            const data = body.message.data[0]

            const id = data[0]
            const name = data[1]
            const parent_id = data[2]
            const cat_path = data[3]

            // assigning all property above to the head category object.
            newHeadCategory.id = id
            newHeadCategory.cat_path = cat_path

            // assigning id to newSubCategory parent_id
            newSubCategory.parent_id = id

            expect(name).toEqual(newHeadCategory.name)
            expect(parent_id).toEqual(0)

            // expecting category path to be /0/id/ because this is the head category
            expect(cat_path).toEqual(`/0/${id}/`)

            expect(data).toHaveLength(4)
            expect(body.message.column).toHaveLength(4)
            productCategoryColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("hasNext", false)
        })

        it('Should create a new sub category of newly created head category', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/category/create')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ name: newSubCategory.name, parent_id: newSubCategory.parent_id })
                .expect(200)

            expect(body.message).toEqual(true)
        })

        it('Should return a category list with name filter (newly created sub category)', async () => {
            const reqBody = {
                lastId: 0,
                sort: "ASC",
                search: `({name} = '${newSubCategory.name}')`
            }
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/product/category/list')
                .send(reqBody)
                .expect(200)

            //extract the data
            const data = body.message.data[0]

            const id = data[0]
            const name = data[1]
            const parent_id = data[2]
            const cat_path = data[3]

            // assigning all property above to the sub category object.
            newSubCategory.id = id
            newSubCategory.cat_path = cat_path

            expect(name).toEqual(newSubCategory.name)
            expect(parent_id).toEqual(newHeadCategory.id)

            // expecting category path to be (parent_cat_path/id/) because this is the sub category
            const parent_cat_path = newHeadCategory.cat_path
            expect(cat_path).toEqual(`${parent_cat_path}${id}/`)

            expect(data).toHaveLength(4)
            expect(body.message.column).toHaveLength(4)
            productCategoryColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("hasNext", false)
        })

        it('Should update the name of a newly created sub-category', async () => {
            const reqBody = {
                id: newSubCategory.id,
                name: "Food"
            }

            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/category/update')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(reqBody)

            console.log({ body, reqBody })

            expect(body.message).toEqual(true)
        })
    })

    describe('Fail scenario test', () => {

        describe('Create product', () => {
            it('Should fail to create a product with prohibited name', async () => {

                /**
                 * Test create product api
                 * .set is to set header to the request.
                 * .attach is to attach a file, used to file upload into request.files
                 */
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/create')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .field('name', "bajingan")
                    .field('description', newProductRequestData.description)
                    .field('price', newProductRequestData.price)
                    .field('stock', newProductRequestData.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', newImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("You can't use this name!")
            })

            it('Should fail to create a product with wrong image mimetype', async () => {

                /**
                 * Test create product api
                 * .set is to set header to the request.
                 * .attach is to attach a file, used to file upload into request.files
                 */
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/create')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .field('name', newProductRequestData.name)
                    .field('description', newProductRequestData.description)
                    .field('price', newProductRequestData.price)
                    .field('stock', newProductRequestData.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', newImageFilepath, { contentType: 'text/csv' })

                expect(statusCode).toEqual(400)
                expect(body.message).toEqual("Only .jpg and .png format allowed!")
            })

            it('Should fail to create a product with too big image size', async () => {

                /**
                 * Test create product api
                 * .set is to set header to the request.
                 * .attach is to attach a file, used to file upload into request.files
                 */
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/create')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .field('name', newProductRequestData.name)
                    .field('description', newProductRequestData.description)
                    .field('price', newProductRequestData.price)
                    .field('stock', newProductRequestData.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', bigImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("File too large")
            })
        })

        describe('Update product', () => {
            it('Should fail to update a product with prohibited name', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', "bajingan")
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', updateImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toBe(500)
                expect(body.message).toEqual("You can't use this name!")
            });

            it('Should fail to update a product with wrong image mimetype', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', updateProductRequest.name)
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', updateImageFilepath, { contentType: 'text/csv' })

                expect(statusCode).toEqual(400)
                expect(body.message).toEqual("Only .jpg and .png format allowed!")
            });

            it('Should fail to update a product with wrong image mimetype', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', updateProductRequest.name)
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .field('category', newProductRequestData.category)
                    .attach('image', bigImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("File too large")
            });
        })

        describe('Category endpoint', () => {
            describe('Should fail to create new category', () => {
                it('with existing category name', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/create')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ name: "Electronics", parent_id: 0 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("SAME_CATEGORY_ALREADY_EXISTS")
                })

                it('with badwords in category name', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/create')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ name: "Anjing", parent_id: 0 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
                })

                it('with non existent category as parent_id', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/create')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ name: "test", parent_id: 696969 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("CATEGORY_DETAIL_NOT_FOUND")
                })
            })

            describe('Should fail to update a category', () => {
                it('with existing category name', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/update')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ id: 2, name: "Electronics", parent_id: 0 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("SAME_CATEGORY_ALREADY_EXISTS")
                })

                it('with badwords in category name', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/update')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ id: 1, name: "Anjing", parent_id: 0 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
                })

                it('with non existent category as parent_id', async () => {
                    const { body } = await supertest(app.server)
                        .post('/api/v1/admin/category/update')
                        .set('Authorization', superAdminJwt)
                        .set('user-agent', "Test")
                        .send({ id: 1, name: "test", parent_id: 696969 })
                        .expect(400)

                    expect(body.code).toEqual("BadInputError")
                    expect(body.message).toEqual("CATEGORY_DETAIL_NOT_FOUND")
                })
            })
        })
    })

    describe('Final step to delete product', () => {
        let public_id: string;

        it('Should return a detail of newly updated product', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/product/detail')
                .send({ id: newlyCreatedProductId })
                .expect(200)

            public_id = body.message.public_id

            productDetailColumnName.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should delete a single product', async () => {

            const { body, statusCode } = await supertest(app.server)
                .post('/api/v1/admin/product/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedProductId })

            expect(statusCode).toBe(200)
            expect(body.message).toEqual(true)

            //always delete image on cloudinary after successful test.
            //fifth index is the public_id of the image that we use to delete the image on cloudinary.
            await DeleteImage(public_id)
        });

        it('Should delete a newly created head category', async () => {
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/category/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ id: newHeadCategory.id })
                .expect(200)

            expect(body.message).toEqual(true)
        })

        it('Should delete a newly created sub-category', async () => {
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/category/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ id: newSubCategory.id })
                .expect(200)

            expect(body.message).toEqual(true)
        })
    })
}) 