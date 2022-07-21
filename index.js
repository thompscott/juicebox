const express = require('express');
const server = express();
const { PORT = 3000 } = process.env;
const apiRouter = require('./api');
const morgan = require('morgan');
require('dotenv').config();

//1)MIDDLEWARES
server.use(express.json());

server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});
server.use(morgan('dev'));
server.use('/api', apiRouter);

//2)Routes

// SERVER
const { client, getUserByUsername } = require('./db');
client.connect();

server.listen(PORT, () => {
  console.log(`Running on server: ${PORT}`);
});
