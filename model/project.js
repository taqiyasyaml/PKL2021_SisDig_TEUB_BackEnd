const fs = require('fs')
const parse_component = require('./../helper/parse_component')
const model_device = require('./device')

const get_all_setup_project = () => {
    try {
        return JSON.parse(fs.readFileSync(__dirname + '/../storage/projects.json'))
    } catch (e) {
        console.log(e)
        return {}
    }
}

const get_setup_project = project_id => {
    const data = get_all_setup_project()[encodeURI(project_id)]
    return data || {
        in: [],
        out: [],
        dev_position: [[]]
    }
}

const mapping_device_matrix = data => {
    if (data == undefined || !Array.isArray(data.in) || !Array.isArray(data.out))
        return {}
    let dev_matrix = {}

    for (let t = 0; t < Math.ceil(data.in.length / 8); t++) {
        for (let l = 0; l < Math.ceil(data.out.length / 8); l++) {
            let dev_id = null
            if (Array.isArray(data.dev_position) && Array.isArray(data.dev_position[t]) && data.dev_position[t][l] !== undefined)
                dev_id = data.dev_position[t][l]
            for (let out_dev = 0, out_pr = l * 8; out_dev < 8; out_dev++, out_pr++) {
                if (dev_matrix['o_' + out_pr] == undefined)
                    dev_matrix['o_' + out_pr] = {}
                for (let in_dev = 0, in_pr = t * 8; in_dev < 8; in_dev++, in_pr++) {
                    dev_matrix['o_' + out_pr]['i_' + in_pr] = {
                        dev_id,
                        in: 'i_' + in_dev,
                        out: 'o_' + out_dev
                    }
                }
            }
        }
    }
    return dev_matrix
}

const mapping_matrix_io = data => {
    if (data == undefined || !Array.isArray(data.in) || !Array.isArray(data.out))
        return {}
    let matrix_io = {
        i: {},
        o: {}
    }
    for (let in_pr = 0; in_pr < data.in.length; in_pr++)
        matrix_io.i['i_' + in_pr] = data.in[in_pr].component_id + ' (' + data.in[in_pr].component_pin + ')'
    for (let out_pr = 0; out_pr < data.out.length; out_pr++)
        matrix_io.o['o_' + out_pr] = data.out[out_pr].component_id + ' (' + data.out[out_pr].component_pin + ')'
    return matrix_io
}

const mapping_component = data => {
    if (data == undefined || !Array.isArray(data.in) || !Array.isArray(data.out))
        return {}
    let component_raw = {}
    for (let in_pr = 0; in_pr < data.in.length; in_pr++) {
        if (component_raw[data.in[in_pr].component_id] == undefined)
            component_raw[data.in[in_pr].component_id] = {
                input: {},
                output: {}
            }
        if (component_raw[data.in[in_pr].component_id].output[data.in[in_pr].component_pin] == undefined)
            component_raw[data.in[in_pr].component_id].output[data.in[in_pr].component_pin] = []
        component_raw[data.in[in_pr].component_id].output[data.in[in_pr].component_pin].push('i_' + in_pr)
    }
    for (let out_pr = 0; out_pr < data.out.length; out_pr++) {
        if (component_raw[data.out[out_pr].component_id] == undefined)
            component_raw[data.out[out_pr].component_id] = {
                input: {},
                output: {}
            }
        if (component_raw[data.out[out_pr].component_id].input[data.out[out_pr].component_pin] == undefined)
            component_raw[data.out[out_pr].component_id].input[data.out[out_pr].component_pin] = []
        component_raw[data.out[out_pr].component_id].input[data.out[out_pr].component_pin].push('o_' + out_pr)
    }

    let component_fix = []
    for (const component_id in component_raw) {
        const fix = parse_component(component_id, component_raw[component_id])
        component_fix.push(fix)
    }

    return component_fix
}

const get_setup_project_detail = project_id => {
    try {
        return JSON.parse(fs.readFileSync(__dirname + '/../storage/project_detail/' + encodeURI(project_id) + '.json'))
    } catch (e) {
        console.log(e)
        const data = {
            in: [],
            out: [],
            dev_position: [[]]
        }
        return {
            setup_matrix: mapping_matrix_io(data),
            setup_component: mapping_component(data),
            dev_matrix: mapping_device_matrix(data)
        }
    }
}

const save_setup_project = (project_id, data) => {
    const project_details = {
        setup_matrix: mapping_matrix_io(data),
        setup_component: mapping_component(data),
        dev_matrix: mapping_device_matrix(data)
    }
    let projects = get_all_setup_project()
    projects[encodeURI(project_id)] = data
    fs.writeFileSync(__dirname + '/../storage/projects.json', JSON.stringify(projects))
    fs.writeFileSync(__dirname + '/../storage/project_detail/' + encodeURI(project_id) + '.json', JSON.stringify(project_details))
}

const get_projects_by_dev = dev_id => {
    const data_project = get_all_setup_project()
    let projects = []
    for (const projectId in data_project) {
        let filtered = false
        for (const dev_t of data_project[projectId].dev_position) {
            if (filtered == false) {
                for (const dev_l of dev_t) {
                    if (dev_l == dev_id) {
                        filtered = true
                        break;
                    }
                }
            } else
                break;
        }
        if (filtered === true)
            projects.push(projectId)
    }
    return projects
}

const get_devs_by_project = project_id => {
    const data = get_setup_project(project_id)
    let devs = []
    if (Array.isArray(data.dev_position)) {
        for (const dev_t of data.dev_position) {
            if (Array.isArray(dev_t)) {
                for (const dev_l of dev_t) {
                    if (!devs.includes(dev_l))
                        devs.push(dev_l)
                }
            }
        }
    }
    return devs
}

const mapping_main_matrix_dev = matrix => {
    let dev = {}
    let matrix_fix = {}
    for (let out_i in matrix) {
        matrix_fix[out_i] = {}
        for (let in_i in matrix[out_i]) {
            let curr_dev = matrix[out_i][in_i]
            if (dev[curr_dev.dev_id] == undefined)
                dev[curr_dev.dev_id] = model_device.get_device_state(curr_dev.dev_id)
            matrix_fix[out_i][in_i] = {
                is_online: dev[curr_dev.dev_id].is_online === true,
                wired: dev[curr_dev.dev_id].set_write[curr_dev.out][curr_dev.in] === true,
                in: dev[curr_dev.dev_id].set_read[curr_dev.in],
                out: dev[curr_dev.dev_id].set_read[curr_dev.out]
            }
            if(!isNaN(in_i.substring(2)) && parseInt(in_i.substring(2)) % 8 == 7)
                matrix_fix[out_i][in_i].no=dev[curr_dev.dev_id].set_write.i_7_no===true 
        }
    }
    return matrix_fix
}

const mapping_matrix_fix_to_matrix = matrix_fix => {
    let matrix = {}
    for (let out_i in matrix_fix) {
        if (matrix[out_i] == undefined)
            matrix[out_i] = []
        for (let in_i in matrix_fix[out_i]) {
            if (matrix[in_i] == undefined)
                matrix[in_i] = []
            if(matrix_fix[out_i][in_i].wired===true){
                matrix[out_i].push(in_i)
                matrix[in_i].push(out_i)
            }
        }
    }
    return matrix
}

const mapping_matrix_fix_to_component = matrix_fix => {
    let links = []
    for (let out_i in matrix_fix) {
        for (let in_i in matrix_fix[out_i]) {
            if(matrix_fix[out_i][in_i].wired===true){
                links.push({
                    input:out_i,
                    output:in_i,
                    label:`${in_i} --> ${out_i} (${matrix_fix[out_i][in_i].in.toFixed(1)} V / ${matrix_fix[out_i][in_i].out.toFixed(1)} V)`
                })
            }
        }
    }
    return links
}

const get_all_data_project = projectId => {
    const data_detail = get_setup_project_detail(projectId)
    const data_main_matrix = mapping_main_matrix_dev(data_detail.dev_matrix)
    return {
        data_main_matrix,
        data_matrix_data:mapping_matrix_fix_to_matrix(data_main_matrix),
        data_component:mapping_matrix_fix_to_component(data_main_matrix)
    }
}

const get_devs_by_reset_out_project = (projectId, out) => {
    const dev_matrix = get_setup_project_detail(projectId).dev_matrix[out]
    if(dev_matrix==undefined)
        return []
    let devs = []
    for(const in_i in dev_matrix){
        if(devs.findIndex(dev=>dev.dev_id==dev_matrix[in_i].dev_id && dev.out==dev_matrix[in_i].out) <0)
            devs.push({dev_id:dev_matrix[in_i].dev_id, out:dev_matrix[in_i].out})
    }
    return devs
}

module.exports = {
    get_setup_project,
    save_setup_project,
    get_setup_project_detail,
    get_projects_by_dev,
    get_devs_by_project,
    get_all_data_project,
    get_devs_by_reset_out_project
}