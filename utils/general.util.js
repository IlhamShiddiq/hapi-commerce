const moment = require("moment");

const validateString = (string) => string.replace(/'/g, "''")

const getCurrentTime = () => moment().format('YYYY-MM-DD HH:mm:ss')

module.exports = {
    validateString,
    getCurrentTime,
}