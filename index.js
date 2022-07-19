const express = require('express');
const server = express();
const port = 3000;
const apiRouter = require('./api');
const morgan = require('morgan');
require('dotenv').config();

//1)MIDDLEWARES

server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});
server.use(morgan('dev'));
server.use('/api', apiRouter);
server.use(express.json());

//2)Routes

// SERVER
const { client } = require('./db');
client.connect();

server.listen(port, () => {
  console.log(`Running on server: ${port}`);
});
