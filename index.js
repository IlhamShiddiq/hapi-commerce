'use strict';

require('dotenv').config()

const Hapi = require('@hapi/hapi');
const { connectDb } = require('./configs/db.config')

const generalController = require('./controllers/general.controller');
const productController = require('./controllers/product.controller');
const transactionController = require('./controllers/transaction.controller');

const init = async () => {

    const server = Hapi.server({
        port: process.env.APP_PORT,
        host: process.env.APP_HOST
    });

    await connectDb()

    // General
    server.route({
        method: 'GET',
        path: '/',
        handler: generalController.welcome
    });

    // Product
    server.route({
        method: 'GET',
        path: '/products',
        handler: productController.getAll
    });

    server.route({
        method: 'GET',
        path: '/products/get-dummy',
        handler: productController.getDummy
    });

    server.route({
        method: 'GET',
        path: '/products/{id}',
        handler: productController.getDetail
    });

    server.route({
        method: 'POST',
        path: '/products',
        handler: productController.create
    });

    server.route({
        method: 'PUT',
        path: '/products/{id}',
        handler: productController.update
    });

    server.route({
        method: 'DELETE',
        path: '/products/{id}',
        handler: productController.destroy
    });

    // Transaction
    server.route({
        method: 'GET',
        path: '/transactions',
        handler: transactionController.getAll
    });

    server.route({
        method: 'GET',
        path: '/transactions/{id}',
        handler: transactionController.getDetail
    });

    server.route({
        method: 'POST',
        path: '/transactions',
        handler: transactionController.create
    });

    server.route({
        method: 'PUT',
        path: '/transactions/{id}',
        handler: transactionController.update
    });

    server.route({
        method: 'DELETE',
        path: '/transactions/{id}',
        handler: transactionController.destroy
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();