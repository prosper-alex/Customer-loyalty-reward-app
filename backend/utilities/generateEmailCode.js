const crypto = require('crypto');

const generateVerificationCode = () => {
    return crypto.randomInt(100000, 1000000).toString();

};

module.exports = generateVerificationCode;