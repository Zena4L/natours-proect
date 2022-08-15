const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log('UnhandledRejection, shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('DB connected successfully');
  });

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`server is live on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
