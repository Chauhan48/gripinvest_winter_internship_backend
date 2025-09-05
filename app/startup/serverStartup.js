const userRoutes = require('../routes/userRoutes');

module.exports = async(app) => {

    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('cors')());
    app.use(require('cookie-parser')());
    app.use('/user', userRoutes);
}