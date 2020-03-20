const duration = require('parse-duration')
const format = require('util').format
const signals = ['SIGINT', 'SIGTERM']

module.exports = (system, options = {}) => {

    if (!system) throw new Error('system is required')

    const config = Object.assign({ restart: { window: '60s' }}, options)
    const logger = options.logger || console
    let timeout

    const start = cb => {
        system.start((err, components) => {
            if (err) return cb(err)

            const scheduleRestart = () => {
                const delay = Math.ceil(Math.random() * duration(config.restart.window) / 1000) * 1000
                logger.info(format('Service will restart in %s seconds.', delay / 1000))

                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    system.restart(err => {
                        if (err) {
                            logger.error('Error restarting system.')
                            logger.error(err)
                            process.exit(1)
                        }
                    })
                }, delay)
                timeout.unref()
            }
            
            process.on('systemic_restart', scheduleRestart)

            process.on('error', err => {
                logger.error('Unhandled error. Invoking shutdown.')
                if (err) logger.error(err.stack)
                system.stop(() => process.exit(1))
            })

            process.on('unhandledRejection', err => {
                logger.error('Unhandled rejection. Invoking shutdown.')
                if (err) logger.error(err.stack)
                system.stop(() => process.exit(1))
            })

            signals.forEach(signal => {
                process.on(signal, () => {
                    logger.info(format('Received %s. Attempting to shutdown gracefully.', signal))
                    system.stop(() => process.exit(0))
                })
            })

            cb(null, components)
        })
    }

    const stop  = cb => system.stop(cb) 

    return {
        start,
        stop
    }
}
