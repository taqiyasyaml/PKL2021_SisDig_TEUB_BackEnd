const model_project = require('./../model/project')
const wss_and_send = require('./../helper/wss_and_send')

const send_setup = (projectId, { ws, type } = {}) => {
    if (projectId == undefined)
        return;
    if (type == undefined || type == 'setup')
        wss_and_send.sendProject({
            req: "setup_project",
            data: model_project.get_setup_project(projectId)
        }, { projectId, ws, type: 'setup' })
    const project_detail = model_project.get_setup_project_detail(projectId)
    if (type == undefined || type == 'matrix')
        wss_and_send.sendProject({
            req: "setup_matrix",
            data: project_detail.setup_matrix
        }, { projectId, ws, type: 'matrix' })
    if (type == undefined || type == 'component')
        wss_and_send.sendProject({
            req: "setup_component",
            data: project_detail.setup_component
        }, { projectId, ws, type: 'component' })
}

const send_data = (projectId, { ws, type } = {}) => {
    if (projectId == undefined)
        return;
    const project_data = model_project.get_all_data_project(projectId)
    wss_and_send.sendProject({
        req: "data_main_matrix",
        data: project_data.data_main_matrix
    }, { ws, projectId, type: 'matrix' })
    if (type == undefined || type == 'matrix')
        wss_and_send.sendProject({
            req: "data_matrix",
            data: project_data.data_matrix_data
        }, { ws, projectId, type: 'matrix' })
    if (type == undefined || type == 'component')
        wss_and_send.sendProject({
            req: "data_component",
            data: project_data.data_component
        }, { ws, projectId, type: 'component' })
}

const set_dev_connection = (projectId, o, i, val = false, nama) => {
    if (projectId == undefined || o == undefined || i == undefined)
        return
    if (o.substring(0, 1) == i.substring(0, 1))
        return
    else if (o.substring(0, 1) == 'i' && i.substring(0, 1) == 'o')
        [o, i] = [i, o]
    else if (o.substring(0, 1) != 'o' || i.substring(0, 1) != 'i') {
        return
    }
    const matrix_oi = model_project.get_setup_project_detail(projectId).dev_matrix
    if (matrix_oi[o] !== undefined && matrix_oi[o][i] !== undefined) {
        const project_depedency = model_project.get_projects_by_dev(matrix_oi[o][i].dev_id)
        project_depedency.forEach(pr => {
            const msg = `${val === true ? 'Menyambungkan' : 'Memutuskan'} ${matrix_oi[o][i].out} dengan ${matrix_oi[o][i].in} pada ${matrix_oi[o][i].dev_id} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'set_write',
            [matrix_oi[o][i].out]: {
                [matrix_oi[o][i].in]: val === true
            }
        }, { deviceId: matrix_oi[o][i].dev_id })
    }
}

const sync_dev = (projectId, nama) => {
    if (projectId == undefined)
        return
    const devs = model_project.get_devs_by_project(projectId)
    devs.forEach(dev => {
        const project_depedency = model_project.get_projects_by_dev(dev)
        project_depedency.forEach(pr => {
            const msg = `Mensinkronisasikan ${dev} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'sync'
        }, { deviceId: dev })
    })
}

const reset_out_all = (projectId, nama) => {
    if (projectId == undefined)
        return
    const devs = model_project.get_devs_by_project(projectId)
    devs.forEach(dev => {
        const project_depedency = model_project.get_projects_by_dev(dev)
        project_depedency.forEach(pr => {
            const msg = `Mereset total ${dev} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'reset_out',
            all: true
        }, { deviceId: dev })
    })
}

const reset_out_one = (projectId, out, nama) => {
    if (projectId == undefined)
        return
    const devs = model_project.get_devs_by_reset_out_project(projectId, out)
    devs.forEach(dev => {
        const project_depedency = model_project.get_projects_by_dev(dev.dev_id)
        project_depedency.forEach(pr => {
            const msg = `Mereset ${dev.out} pada ${dev.dev_id} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'reset_out',
            [dev.out]: true
        }, { deviceId: dev.dev_id })
    })
}

const read_io = (projectId, r_out = false, r_in = false, nama) => {
    if (projectId == undefined || (r_out !== true && r_in !== true))
        return
    const devs = model_project.get_devs_by_project(projectId)
    devs.forEach(dev => {
        const project_depedency = model_project.get_projects_by_dev(dev)
        project_depedency.forEach(pr => {
            const msg = `Membaca I/O pada ${dev} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'read_io',
            i: r_in === true,
            o: r_out === true
        }, { deviceId: dev })
    })
}

const set_read = (projectId, dataRaw, nama) => {
    if (projectId == undefined || dataRaw == undefined)
        return
    let dataFix = {}
    if (!isNaN(dataRaw.dly_r_min_ms))
        dataFix.dly_r_min_ms = parseInt(dataRaw.dly_r_min_ms)
    if (!isNaN(dataRaw.o_margin))
        dataFix.o_margin = parseFloat(dataRaw.o_margin)
    if (!isNaN(dataRaw.i_margin))
        dataFix.i_margin = parseFloat(dataRaw.i_margin)
    const devs = model_project.get_devs_by_project(projectId)
    devs.forEach(dev => {
        const project_depedency = model_project.get_projects_by_dev(dev)
        project_depedency.forEach(pr => {
            const msg = `Mengubah pengaturan pembacaan I/O pada ${dev} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'set_read',
            ...dataFix
        }, { deviceId: dev })
    })
}

const set_in_7 = (projectId, in_7, dataRaw) => {
    if (projectId == undefined || in_7 == undefined || dataRaw == undefined)
        return
    const matrix_oi = model_project.get_setup_project_detail(projectId).dev_matrix
    if (matrix_oi !== undefined && matrix_oi.o_0 !== undefined && matrix_oi.o_0[in_7] !== undefined) {
        let dataFix = {}
        if (dataRaw.i_7_no !== undefined)
            dataFix.i_7_no = dataRaw.i_7_no === true
        if (!isNaN(dataRaw.dly_us))
            dataFix.dly_us = parseInt(dataRaw.dly_us)
        if (!isNaN(dataRaw.dly_ms))
            dataFix.dly_ms = parseInt(dataRaw.dly_ms)
        const dev = matrix_oi.o_0[in_7]
        const project_depedency = model_project.get_projects_by_dev(dev)
        project_depedency.forEach(pr => {
            const msg = `Mengubah pengaturan I_7 pada ${dev} oleh ${pr == projectId ? nama : `projek ${projectId}`}`
            wss_and_send.sendProject({
                req: 'notification',
                data: msg
            }, { projectId: pr, type: 'notification' })
        })
        wss_and_send.sendDevice({
            req: 'set_in_7',
            ...dataFix
        }, { deviceId: dev.dev_id })
    }
}

const ws_handler = async (ws, req) => {
    const projectId = req.params.projectId
    const type = req.params.type
    if (projectId == undefined || !['setup', 'module', 'matrix', 'component', 'notification'].includes(type)) {
        ws.close()
        return
    }
    ws.projectId = projectId
    const wsId = `pr_${type}_${encodeURI(projectId)}_${(new Date()).getTime().toString()}_${Math.floor(Math.random() * 10)}`
    ws.wsId = wsId
    wss_and_send.getWssProject(projectId, type).push(ws)
    console.log(wsId + ' connected')
    console.log('Total ' + wss_and_send.getWssProject(projectId, type).length + ' connection ' + type + ' (' + projectId + '  project)')

    send_setup(projectId, { ws, type })
    send_data(projectId, { ws, type })

    ws.on('message', data => {
        try {
            data = JSON.parse(data)
            if (data.req == 'setup_project') {
                model_project.save_setup_project(ws.projectId, data.data)
                send_setup(ws.projectId)
                send_data(ws.projectId)
                wss_and_send.sendProject({
                    req: "notification",
                    data: `Terdapat perubahan pengaturan projek oleh ${data.nama}`
                }, { projectId, type: 'notification' })
            } else if (data.req == 'connect_io') {
                if (data.data == undefined || data.data.i == undefined || data.data.o == undefined)
                    return
                set_dev_connection(projectId, data.data.o, data.data.i, true, data.nama)
            } else if (data.req == 'disconnect_io') {
                if (data.data == undefined || data.data.i == undefined || data.data.o == undefined)
                    return
                set_dev_connection(projectId, data.data.o, data.data.i, false, data.nama)
            } else if (data.req == 'sync') {
                sync_dev(projectId, data.nama)
            } else if (data.req == 'reset_all') {
                reset_out_all(projectId, data.nama)
            } else if (data.req == 'reset_out') {
                reset_out_one(projectId, data.data, data.nama)
            } else if (data.req == 'read_io') {
                read_io(projectId, data.data.o, data.data.i, data.nama)
            } else if (data.req == 'set_read') {
                set_read(projectId, data.data, data.nama)
            } else if (data.req == 'set_in_7') {
                set_in_7(projectId, data.data.i, data.data, data.nama)
            }
        } catch (e) {
            console.log(e)
        }
    })

    ws.on('error', (...props) => {
        console.log(wsId + ' error')
        console.log(props)
        ws.close()
    })

    ws.on('close', () => {
        for (const i_ws in wss_and_send.getWssProject(projectId, type)) {
            if (wss_and_send.getWssProject(projectId, type)[i_ws].wsId) {
                wss_and_send.getWssProject(projectId, type).splice(i_ws, 1)
                break
            }
        }
        console.log(wsId + ' disconnected')
        console.log(wss_and_send.getWssProject(projectId, type).length + ' left connection ' + type + '(' + projectId + ' project)')
    })
}

module.exports = {
    ws_handler,
    send_data
}