module.exports = () => {

    const start = async (dependencies) => {
        console.log('Starting service with configuration', dependencies)
    }

    const stop = async () => {
        console.log('Stopping service')
    }

    return {
        start, stop
    }
}