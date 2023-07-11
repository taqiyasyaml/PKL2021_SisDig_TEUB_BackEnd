module.exports = (componentId, { input, output }) => {
    if (componentId == undefined)
        return {}
    let content = componentId
    let input_arr = []
    input = input || {}
    output = output || {}
    let output_arr = []

    const map_dev = (io, label, arr, props = {}) => io.forEach(id => arr.push({ id, label, ...props }))

    if (componentId.length >= 10) {
        let componentType = componentId.substring(0, 10).toUpperCase()
        content = componentId.substring(10)
        if (componentType == 'OR_4_SYMB_'
            || componentType == 'AND_4_SYM_') {
            if (componentType == 'OR_4_SYMB_') {
                content = 'OR ' + content
            } else if (componentType == 'AND_4_SYM_') {
                content = 'AND ' + content
            }
            //Inputs
            if (input['I0'] != undefined) {
                map_dev(input['I0'], 'I0', input_arr)
                delete input['I0']
            }
            if (input['I1'] != undefined) {
                map_dev(input['I1'], 'I1', input_arr)
                delete input['I1']
            }
            if (input['I2'] != undefined) {
                map_dev(input['I2'], 'I2', input_arr)
                delete input['I2']
            }
            if (input['I3'] != undefined) {
                map_dev(input['I3'], 'I3', input_arr)
                delete input['I3']
            }
            //Outputs
            if (output['O'] != undefined) {
                map_dev(output['O'], 'O', output_arr)
                delete output['O']
            }
        } else if (componentType == 'AND_3_SYM_') {
            if (componentType == 'AND_3_SYM_') {
                content = 'AND ' + content
            }
            //Inputs
            if (input['I0'] != undefined) {
                map_dev(input['I0'], 'I0', input_arr)
                delete input['I0']
            }
            if (input['I1'] != undefined) {
                map_dev(input['I1'], 'I1', input_arr)
                delete input['I1']
            }
            if (input['I2'] != undefined) {
                map_dev(input['I2'], 'I2', input_arr)
                delete input['I2']
            }
            //Outputs
            if (output['O'] != undefined) {
                map_dev(output['O'], 'O', output_arr)
                delete output['O']
            }
            console.log(content)
        } else if (componentType == 'NAND_2_SM_'
            || componentType == 'NOR_2_SYM_'
            || componentType == 'AND_2_SYM_'
            || componentType == 'OR_2_SYMB_'
            || componentType == 'XOR_2_SYM_') {
            if (componentType == 'NAND_2_SM_') {
                content = 'NAND ' + content
            } else if (componentType == 'NOR_2_SYM_') {
                content = 'NOR ' + content
            } else if (componentType == 'AND_2_SYM_') {
                content = 'AND ' + content
            } else if (componentType == 'OR_2_SYMB_') {
                content = 'OR ' + content
            } else if (componentType == 'XOR_2_SYM_') {
                content = 'XOR ' + content
            }
            //Inputs
            if (input['I0'] != undefined) {
                map_dev(input['I0'], 'I0', input_arr)
                delete input['I0']
            }
            if (input['I1'] != undefined) {
                map_dev(input['I1'], 'I1', input_arr)
                delete input['I1']
            }
            //Outputs
            if (output['O'] != undefined) {
                map_dev(output['O'], 'O', output_arr)
                delete output['O']
            }
        } else if (componentType == 'NOT_1_SYM_') {
            if (componentType == 'NOT_1_SYM_') {
                content = 'NOT ' + content
            }
            //Inputs
            if (input['I'] != undefined) {
                map_dev(input['I'], 'I', input_arr)
                delete input['I']
            }
            //Outputs
            if (output['O'] != undefined) {
                map_dev(output['O'], 'O', output_arr)
                delete output['O']
            }
        } else
            content = componentId
    }

    for (pin in input)
        map_dev(input[pin], pin, input_arr , {alignment: 'left'})
    for (pin in output)
        map_dev(output[pin], pin, output_arr, {alignment: 'right'})
    return {
        id: componentId,
        content,
        inputs: input_arr.length > 0 ? input_arr : undefined,
        outputs: output_arr.length > 0 ? output_arr : undefined
    }
}