const logger = async (request, response, next) => {
    response.on('finish', () => {
        // console.log(request.cookie);
    })
    next();
}

module.exports = logger;