const checkForAdmin = async (request, response, next) => {
    if(request.user && request.user.role !== 'admin'){
        return response.status(401).json({ message: "You don't have permission to perfrom action" })
    }

    next();
}

module.exports = checkForAdmin;