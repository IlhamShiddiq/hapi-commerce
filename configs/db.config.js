const { Client: PgClient } = require("pg");

const dbCon = new PgClient({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

const connectDb = async () => {
    await dbCon.connect();
}

module.exports = {
    dbCon,
    connectDb,
}