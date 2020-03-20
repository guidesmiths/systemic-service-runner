const System = require('./system')
const runner = require('..')

runner(System, {
    restart: {
        window: '5s'
    }
}).start((err, components) => {
    if (err) throw err

    setInterval(() => {
        process.emit('systemic_restart')
    }, 5000)
})