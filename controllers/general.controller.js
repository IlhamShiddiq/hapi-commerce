const resp = require('../utils/response.util')

const welcome = async (request, h) => {
    return resp.HttpOk(h, 'Welcome to hapi-commerce API')
}

module.exports = {
    welcome,
}
