const fs = require('fs')
const wss_and_send = require('./../helper/wss_and_send')

const def = {
    set_write: {
        req: "set_write",
        esp_time: 0,
        server_time: (new Date()).getTime(),
        o_0: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_1: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_2: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_3: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_4: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_5: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_6: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        o_7: {
            i_0: false,
            i_1: false,
            i_2: false,
            i_3: false,
            i_4: false,
            i_5: false,
            i_6: false,
            i_7: false
        },
        i_7_no: false
    },
    set_read: {
        req: "set_read",
        esp_time: 0,
        server_time: (new Date()).getTime(),
        i_margin: -1,
        o_margin: -1,
        i_0: 0.0,
        i_1: 0.0,
        i_2: 0.0,
        i_3: 0.0,
        i_4: 0.0,
        i_5: 0.0,
        i_6: 0.0,
        i_7: 0.0,
        o_0: 0.0,
        o_1: 0.0,
        o_2: 0.0,
        o_3: 0.0,
        o_4: 0.0,
        o_5: 0.0,
        o_6: 0.0,
        o_7: 0.02
    }
}

const save_device_state = (dev_id, req, data) => {
    let old_data = get_device_state(dev_id)
    old_data[req] = {
        ...data,
        server_time: (new Date()).getTime()
    }
    fs.writeFileSync(__dirname + '/../storage/device_state/' + encodeURI(dev_id) + '.json', JSON.stringify(old_data))
}

const reset_device_state = (dev_id) => {
    fs.writeFileSync(__dirname + '/../storage/device_state/' + encodeURI(dev_id) + '.json', JSON.stringify(def))
}

const get_device_state = dev_id => {
    const is_online = wss_and_send.getWssDevice()[dev_id] != undefined && wss_and_send.getWssDevice()[dev_id].readyState == 1
    try {
        if (is_online !== true)
            throw 'device ' + dev_id + ' offline'
        const data = JSON.parse(fs.readFileSync(__dirname + '/../storage/device_state/' + encodeURI(dev_id) + '.json'))
        return {
            is_online,
            set_write: data.set_write || def.set_write,
            set_read: data.set_read || def.set_read,
        }
    } catch (e) {
        console.log(e)
        return {
            is_online,
            ...def
        }
    }
}

module.exports = {
    save_device_state,
    reset_device_state,
    get_device_state
}