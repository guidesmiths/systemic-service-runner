module.exports = options => {

    const start = async () => {
        console.log('Starting config')
        return {
            service: {
                foo: 1
            }
        }
    }

    const stop = async () => {
        console.log('Stopping config')
    }

    return {
        start, stop
    }
}