const assert = require('assert')
const runner = require('../index')

describe('systemic service runner', () => {

    let system
    let exit

    beforeEach(() => {
        system = createSystem()
        exit = process.exit
    })

    afterEach(() => {
        process.removeAllListeners()
        process.exit = exit
    })

    it('should start a system', done => {
        runner(system).start(() =>  {
            assert(system.started)
            done()
        })
    })

    it('should stop a system', done => {
        runner(system).stop(() => {
            assert(system.stopped)
            done()
        })
    })

    it('should stop on unhandled error', done => {
        process.exit = code => {
            assert(system.stopped)
            assert.equal(code, 1)
            done()
        }
        const logger = {
            error: message =>  assert.equal(message, 'Unhandled error. Invoking shutdown.')
        }
        runner(system, { logger }).start(() => {
            assert(system.started)
            setTimeout(() => process.emit('error'))
        })
    })

    it('should stop on unhandled rejection', done => {
        process.exit = code => {
            assert(system.stopped)
            assert.equal(code, 1)
            done()
        }
        const logger = {
            error: message => assert.equal(message, 'Unhandled rejection. Invoking shutdown.')
        }
        runner(system, { logger }).start(() => {
            assert(system.started)
            setTimeout(() => process.emit('unhandledRejection'))
        })
    })

    it('should stop on SIGINT', done => {
        process.exit = code => {
            assert(system.stopped)
            assert.equal(code, 0)
            done()
        }
        const logger = {
            info: message => assert.equal(message, 'Received SIGINT. Attempting to shutdown gracefully.')
        }
        runner(system, { logger }).start(() => {
            assert(system.started)
            setTimeout(() => process.emit('SIGINT'))
        })
    })

    it('should stop on SIGTERM', done => {
        process.exit = code => {
            assert(system.stopped)
            assert.equal(code, 0)
            done()
        }
        var logger = {
            info: message => assert.equal(message, 'Received SIGTERM. Attempting to shutdown gracefully.')
        }
        runner(system, { logger }).start(() => {
            assert(system.started)
            setTimeout(() => process.emit('SIGTERM'))
        })
    })

    function createSystem() {
        return {
            started: false,
            stopped: false,
            restarted: false,
            start: function(cb) {
                this.started = true
                cb()
            },
            stop: function(cb) {
                this.stopped = true
                cb()
            }
        }
    }
})
