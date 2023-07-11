const model_project = require('./../model/project')
const model_device = require('./../model/device')
const controller_project = require('./../controller_ws/project')
const config = require('./../system/config')
const wss_and_send = require('./../helper/wss_and_send')

const send_data_project = (deviceId) => {
    const projects = model_project.get_projects_by_dev(deviceId)
    projects.forEach(pr => controller_project.send_data(pr))
}

const ws_handler = (ws, req) => {
    let pingInterval
    let pongTimeout
    const deviceId = req.params.deviceId
    if (deviceId == undefined) {
        ws.close()
        return
    }
    ws.deviceId = deviceId
    if (wss_and_send.getWssDevice()[deviceId] != undefined && wss_and_send.getWssDevice()[deviceId].readyState <= 1) {
        wss_and_send.sendDevice({
        }, wss_and_send.getWssDevice()[deviceId])
        wss_and_send.getWssDevice()[deviceId].send(JSON.stringify({
            req:'multi_device',
            server_time:new Date().getTime()
        }))
        wss_and_send.getWssDevice()[deviceId].close()
        ws.send(JSON.stringify({
            req:'multi_device',
            server_time:new Date().getTime()
        }))
        ws.close()
        return;
    }
    wss_and_send.getWssDevice()[deviceId] = ws
    console.log('device ' + deviceId + ' connected')
    wss_and_send.sendDevice({
        req: "sync"
    }, { ws })
    model_device.reset_device_state(deviceId)
    send_data_project(deviceId)

    pingInterval = setInterval(() => {
        clearTimeout(pongTimeout)
        ws.ping()
        pongTimeout = setTimeout(() => {
            ws.close()
        }, config.DEV_PONG_TIMEOUT_MS)
    }, config.DEV_PING_INTERVAL_MS)

    ws.on('message', data => {
        wss_and_send.sendWssDevClient(deviceId, data)
        try {
            data = JSON.parse(data)
            if (data.req != undefined) {
                model_device.save_device_state(deviceId, data.req, data)
                send_data_project(deviceId)
            }
        } catch (e) {
            console.log(e)
        }
    })

    ws.on('pong', () => {
        console.log('device ' + deviceId + ' reply pong')
        clearTimeout(pongTimeout)
    })

    ws.on('error', (...props) => {
        console.log(wsId + ' error')
        console.log(props)
        ws.close()
    })

    ws.on('close', () => {
        console.log('device ' + deviceId + ' disconnected')
        model_device.reset_device_state(deviceId)
        send_data_project(deviceId)
        delete wss_and_send.getWssDevice()[deviceId]
    })
}

module.exports = {
    ws_handler,
}