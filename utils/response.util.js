const HttpOk = (h, message = null, data) => {
    return h.response({
        status_code: 200,
        message: message || 'Ok',
        data,
    }).code(200)
}

const Created = (h, message = null) => {
    return h.response({
        status_code: 201,
        message: message || 'Data Created',
    }).code(201)
}

const BadRequest = (h, message = null) => {
    return h.response({
        status_code: 400,
        message: message || 'Bad Request',
    }).code(400)
}

const NotFound = (h, message = null) => {
    return h.response({
        status_code: 404,
        message: message || 'Data Not Found',
    }).code(404)
}

const InternalServerError = (h, message = null) => {
    return h.response({
        status_code: 500,
        message: message || 'Internal Server Error',
    }).code(500)
}

module.exports = {
    HttpOk,
    Created,
    BadRequest,
    NotFound,
    InternalServerError,
}
