const { Client: PgClient } = require("pg");

const dbCon = new PgClient({
    user: 'postgres',
    host: 'localhost',
    database: 'hapi-commerce',
    password: 'postgres',
    port: 5434,
});

const connectDb = async () => {
    await dbCon.connect();
}

module.exports = {
    dbCon,
    connectDb,
}