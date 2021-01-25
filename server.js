'use strict';
require('dotenv').config();
const app = require('./bin/express');
const server = require('http').Server(app);

const port = process.env.PORT || 3333;

server.listen(port, () => {
  console.log(process.env);
  console.log('Rodando...');
});
