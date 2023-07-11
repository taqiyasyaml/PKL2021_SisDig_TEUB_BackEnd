const wss = {
    project:new Object(),
    device:new Object(),
    dev_client: new Object()
};

const getWssProject = (projectId, type) => {
    if (wss.project[projectId] == undefined)
        wss.project[projectId] = new Object()
    if (wss.project[projectId][type] == undefined)
        wss.project[projectId][type] = new Array()
    return wss.project[projectId][type]
}

const sendProject = (data_json, { ws, projectId, type }) => {
    const data_str = JSON.stringify(data_json)
    if (ws != undefined) {
        if (ws.readyState == 1) {
            console.log('send ' + data_json.req + ' to ' + ws.wsId)
            ws.send(data_str)
        }
    } else if (projectId != undefined && type != undefined) {
        const sendWss = getWssProject(projectId, type)
        console.log('send ' + data_json.req + ' to ' + sendWss.length + ' connection (' + type + ' ' + projectId + ')')
        sendWss.forEach(e_ws => {
            if (e_ws.readyState == 1)
                e_ws.send(data_str)
        });
    }
}

const getWssDevice = () => wss.device

const sendDevice = (data_json, { ws, deviceId }) => {
    if (ws == undefined && deviceId != undefined)
        ws = wss.device[deviceId]
    data_json['server_time'] = Math.round((new Date()).getTime() / 1000)
    if (ws !== undefined && ws.readyState == 1) {
        console.log('send ' + data_json.req + ' to ' + ws.deviceId + ' device')
        ws.send(JSON.stringify(data_json))
    } else {
        ws = ws || {}
        console.log('can\'t send ' + data_json.req + ' to ' + ws.deviceId + ' device (' + ws.readyState + ')')
    }
}

const getWssDevClient = (deviceId) => {
    if (wss.dev_client[deviceId] == undefined)
        wss.dev_client[deviceId] = new Array()
    return wss.dev_client[deviceId]
}

const sendWssDevClient = (deviceId, data) => {
    getWssDevClient(deviceId).forEach(ws => {
        if (ws.readyState == 1)
            ws.send(data)
    })
}

module.exports = {
    wss,
    getWssProject,
    sendProject,
    getWssDevice,
    sendDevice,
    getWssDevClient,
    sendWssDevClient
}