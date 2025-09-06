const app = require('./app/startup/serverStartup');
const { PORT } = require('./config/config');

const startNodeServer = async () => {
  try {
    await require('./app/migrations/initMigrations')();
    const pool = await require('./app/startup/databaseConnection');
    console.log('Connected to database successfully');
  } catch (err) {
    console.log('Error connecting to database', err);
    process.exit(1);
  }
};

startNodeServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error running the server', err);
  });
