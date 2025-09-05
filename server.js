const express = require('express');

const { PORT } = require('./config/config');

const app = express();

const startNodeServer = async () => {
    try{
        await require('./app/migrations/initMigrations')();
        const pool = await require('./app/startup/databaseConnection');
        console.log('Connected to database successfully');
        await require('./app/startup/serverStartup')(app);
    }catch(err){
        console.log('Error connecting to database', err);
    }
}

startNodeServer()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT: ${PORT}`)
    })
}).catch((err) => {
    console.log('Error running the server', err);
})