const express = require('express')
const app = express()
const appWs = require('express-ws')(app)
const router = require('./system/route')
const config = require('./system/config')
const ngrok = require('ngrok')
const path = require('path')

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'..','frontend','build')))
app.use(router)

const listener = app.listen(config.PORT, async () => {
    if(config.USE_NGROK){
        const ngrok_url = await ngrok.connect({
            addr:listener.address().port,
            authtoken:config.NGROK_AUTH_TOKEN
        })
        console.log(ngrok_url)
    }else{
        console.log(`http://localhost:${listener.address().port}`)
    }
})