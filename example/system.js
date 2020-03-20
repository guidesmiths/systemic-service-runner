var Systemic = require('systemic')
var Config = require('./components/config')
var Service = require('./components/service')

module.exports = Systemic()
    .add('config', Config())
    .add('service', Service()).dependsOn('config')
