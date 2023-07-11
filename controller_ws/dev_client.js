const wss_and_send = require('./../helper/wss_and_send')
const ws_handler = (ws, req) => {
    const dev_id = req.params.deviceId
    if (dev_id == undefined) {
        ws.close()
        return
    }
    ws.dev_id = dev_id
    const wsId = `dev_cl_${encodeURI(dev_id)}_${(new Date()).getTime().toString()}_${Math.floor(Math.random() * 10)}`
    ws.wsId = wsId
    console.log(dev_id + ' connected')
    wss_and_send.getWssDevClient(dev_id).push(ws)
    console.log('Total ' + wss_and_send.getWssDevClient(dev_id).length + ' connection (' + dev_id + '  client device)')

    ws.on('message',e=>{
        try{
            wss_and_send.sendDevice(JSON.parse(e),{deviceId:dev_id})
        }catch(err){
            console.log(err);
            console.log(e);
        }
    })
    ws.on('close',()=>{
        for (const i_ws in wss_and_send.getWssDevClient(dev_id)) {
            if (wss_and_send.getWssDevClient(dev_id)[i_ws].wsId) {
                wss_and_send.getWssDevClient(dev_id).splice(i_ws, 1)
                break
            }
        }
        console.log(wsId + ' disconnected')
        console.log(wss_and_send.getWssDevice(dev_id).length + ' left connection (' + dev_id + ' client device)')
    })
}

module.exports = {
    ws_handler
}