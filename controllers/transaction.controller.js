const { v4: uuidV4 } = require("uuid");

const resp = require('../utils/response.util')

const { getCurrentTime } = require("../utils/general.util");
const { dbCon } = require("../configs/db.config");

const getAll = async (request, h) => {
    try {
        const { per_page = 10, page = 1 } = request.query
        const offset = (page - 1) * per_page

        const query = `
            SELECT at.id, at.sku, at.qty, (at.qty * p.price) AS amount 
            FROM adjustment_transactions at 
            INNER JOIN products p 
            ON at.sku = p.sku 
            ORDER BY at.created_at DESC 
            LIMIT ${per_page} 
            OFFSET ${offset};
        `;

        const res = await dbCon.query(query)

        return resp.HttpOk(h, 'Fetching transactions success', { transactions: res.rows })
    } catch (error) {
        console.error('Error fetching transactions: ', error)
        return resp.InternalServerError(h)
    }
}

const getDetail = async (request, h) => {
    try {
        const { id } = request.params

        let detail = null
        if (id) {
            const query = `
                SELECT at.id, at.sku, at.qty, (at.qty * p.price) AS amount 
                FROM adjustment_transactions at 
                INNER JOIN products p 
                ON at.sku = p.sku 
                WHERE at.id::text ILIKE '${id}';
            `;

            const res = await dbCon.query(query)

            detail = (res.rows.length > 0) ? res.rows[0] : null
        }

        if (!detail) return resp.NotFound(h);

        return resp.HttpOk(h, 'Fetching transaction success', { transaction: detail });
    } catch (error) {
        console.error('Error fetching transaction: ', error)
        return resp.InternalServerError(h)
    }
}

const create = async (request, h) => {
    try {
        const { sku, qty } = request.payload
        if (!sku || !qty) return resp.BadRequest(h, 'Please fill all required fields')

        const selectQuery = `
            SELECT SUM(qty)::int AS stock 
            FROM adjustment_transactions at 
            INNER JOIN products p 
            ON at.sku = p.sku 
            WHERE at.sku = '${sku}'
        `;
        const stock = await dbCon.query(selectQuery)

        if (!stock.rows[0].stock && qty < 0) return resp.BadRequest(h, 'Cannot fill qty below 0 value')

        const currentTime = getCurrentTime();
        const query = `
            INSERT INTO adjustment_transactions (id, sku, qty, created_at, updated_at) 
            VALUES (
                '${uuidV4()}', 
                '${sku}', 
                '${qty}', 
                '${currentTime}', 
                '${currentTime}');
            `;

        await dbCon.query(query);

        return resp.Created(h, 'Create transaction success')
    } catch (error) {
        console.error('Error create transaction: ', error)
        return resp.InternalServerError(h)
    }
}

const update = async (request, h) => {
    try {
        const { id } = request.params
        const { sku, qty } = request.payload
        if (!sku || !qty) return resp.BadRequest(h, 'Please fill all required fields')

        const checkTransactionQuery = `SELECT id FROM adjustment_transactions WHERE id::text ILIKE '${id}'`;
        const checkTransaction = await dbCon.query(checkTransactionQuery);
        if (checkTransaction.rows.length === 0) return resp.NotFound(h);

        const query = `UPDATE adjustment_transactions SET sku='${sku}', qty='${qty}' WHERE id::text ILIKE '${id}';`
        await dbCon.query(query);

        return resp.HttpOk(h, 'Update transaction success')
    } catch (error) {
        console.error('Error update transaction: ', error)
        return resp.InternalServerError(h)
    }
}

const destroy = async (request, h) => {
    try {
        const { id } = request.params
        const query = `DELETE FROM adjustment_transactions WHERE id::text ILIKE '${id}'`
        await dbCon.query(query)

        return resp.HttpOk(h, 'Delete transaction success')
    } catch (error) {
        console.error('Error delete transaction: ', error)
        return resp.InternalServerError(h)
    }
}

module.exports = {
    getAll,
    getDetail,
    create,
    update,
    destroy,
}