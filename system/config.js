const dotenv = require('dotenv').config()
module.exports={
    PORT:process.env.PORT || 3001,
    DEV_PING_INTERVAL_MS:process.env.DEV_PING_INTERVAL_MS || 30000,
    DEV_PONG_TIMEOUT_MS:process.env.DEV_PONG_TIMEOUT_MS || 10000,
    USE_NGROK: process.env.USE_NGROK === true || process.env.USE_NGROK === 'true',
    NGROK_AUTH_TOKEN: process.env.NGROK_AUTH_TOKEN
}