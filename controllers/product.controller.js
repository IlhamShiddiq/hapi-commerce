const axios = require("axios");
const { v4: uuidV4 } = require("uuid");

const resp = require('../utils/response.util')

const { dbCon } = require("../configs/db.config");
const { urls } = require('../configs/url.config')
const { validateString, getCurrentTime } = require('../utils/general.util')

const getDummy = async (request, h) => {
    try {
        const response = await axios.get(urls.products_dummy_json_base_url)
        const { products } = response.data

        let query = 'INSERT INTO products (id, title, image, sku, price, description, created_at, updated_at) VALUES'
        let prevSku
        products.forEach((product) => {
            const currentTime = getCurrentTime();
            let { title, thumbnail, sku, price, description } = product

            if (prevSku !== sku) {
                title = validateString(title);
                thumbnail = validateString(thumbnail);
                description = description ? validateString(description) : null;
                const productQuery = `
                (
                    '${uuidV4()}', 
                    '${title}', 
                    '${thumbnail}', 
                    '${sku}', 
                    '${price}', 
                    '${description}',
                    '${currentTime}', 
                    '${currentTime}'
                ),`

                query = `${query} ${productQuery}`
            }

            prevSku = sku
        })

        await dbCon.query(query.slice(0, -1) + ';')

        return resp.HttpOk(h, 'Fetching dummy products success');
    } catch (error) {
        console.error('Error fetching dummy products: ', error)
        return resp.InternalServerError(h)
    }
}

const getAll = async (request, h) => {
    try {
        const { per_page = 10, page = 1 } = request.query
        const offset = (page - 1) * per_page

        const query = `
            SELECT id, title, sku, image, price, (
                SELECT COALESCE(SUM(qty), 0) FROM adjustment_transactions WHERE sku = p.sku
            )::int AS stock 
            FROM products p 
            ORDER BY created_at DESC 
            LIMIT ${per_page} 
            OFFSET ${offset}
        `;

        const res = await dbCon.query(query)

        return resp.HttpOk(h, 'Fetching products success', { products: res.rows })
    } catch (error) {
        console.error('Error fetching products: ', error)
        return resp.InternalServerError(h)
    }
}

const getDetail = async (request, h) => {
    try {
        const { id } = request.params

        let detail = null
        if (id) {
            const query = `
                SELECT id, title, sku, image, price, description, (
                    SELECT COALESCE(SUM(qty), 0) FROM adjustment_transactions WHERE sku = p.sku
                )::int AS stock 
                FROM products p 
                WHERE id::text ILIKE '${id}' OR sku = '${id}';
            `;

            const res = await dbCon.query(query);

            detail = (res.rows.length > 0) ? res.rows[0] : null;
        }

        if (!detail) return resp.NotFound(h);

        return resp.HttpOk(h, 'Fetching product success', { product: detail });
    } catch (error) {
        console.error('Error fetching product: ', error)
        return resp.InternalServerError(h)
    }
}

const create = async (request, h) => {
    try {
        let { title, sku, image, price, description } = request.payload
        if (!title || !sku || !image || !price) return resp.BadRequest(h, 'Please fill all required fields')

        const selectQuery = `SELECT id FROM products WHERE sku = '${sku}'`
        const checkProduct = await dbCon.query(selectQuery)
        if (checkProduct.rows.length > 0) return resp.BadRequest(h, 'SKU is used')

        title = validateString(title);
        image = validateString(image);
        description = description ? `'${validateString(description)}'` : null;
        const currentTime = getCurrentTime();

        const query = `
            INSERT INTO products (id, title, image, sku, price, description, created_at, updated_at) 
            VALUES (
                '${uuidV4()}', 
                '${title}', 
                '${image}', 
                '${sku}', 
                '${price}', 
                ${description}, 
                '${currentTime}', 
                '${currentTime}'
            );
        `;

        await dbCon.query(query);

        return resp.Created(h, 'Create product success')
    } catch (error) {
        console.error('Error create product: ', error)
        return resp.InternalServerError(h)
    }
}

const update = async (request, h) => {
    try {
        const { id } = request.params
        let { title, image, price, description } = request.payload
        if (!title || !image || !price) return resp.BadRequest(h, 'Please fill all required fields')

        const checkProductQuery = `SELECT id FROM products WHERE id::text ILIKE '${id}' OR sku = '${id}'`;
        const checkProduct = await dbCon.query(checkProductQuery);
        if (checkProduct.rows.length === 0) return resp.NotFound(h);

        title = validateString(title);
        image = validateString(image);
        description = description ? `'${validateString(description)}'` : null;

        const query = `
            UPDATE products 
            SET title='${title}', image='${image}', price='${price}', description=${description} 
            WHERE id::text ILIKE '${id}' OR sku = '${id}';
        `;

        await dbCon.query(query);

        return resp.HttpOk(h, 'Update product success')
    } catch (error) {
        console.error('Error update product: ', error)
        return resp.InternalServerError(h)
    }
}

const destroy = async (request, h) => {
    try {
        const { id } = request.params
        const query = `DELETE FROM products WHERE id::text ILIKE '${id}' OR sku = '${id}';`
        await dbCon.query(query)

        return resp.HttpOk(h, 'Delete product success')
    } catch (error) {
        console.error('Error delete product: ', error)
        return resp.InternalServerError(h)
    }
}

module.exports = {
    getDummy,
    getAll,
    getDetail,
    create,
    update,
    destroy,
}
