const router = require('express').Router()
const project_ws = require('./../controller_ws/project.js')
const device_ws = require('./../controller_ws/device.js')
const dev_client_ws = require('./../controller_ws/dev_client.js')
const path = require('path')

router.ws('/project/:projectId/:type',project_ws.ws_handler)
router.ws('/device/:deviceId/client',dev_client_ws.ws_handler)
router.ws('/device/:deviceId',device_ws.ws_handler)

router.get('*',(req,res)=>res.sendFile(path.join(__dirname,'..','..','frontend','build','index.html')))

module.exports = router