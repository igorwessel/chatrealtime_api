'use strict';
require('dotenv').config();

const port = process.env.PORT || 3333;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const server = require('http').Server(app);
const variables = require('./bin/configuration/variables');
const userRouter = require('./modules/user/routes');
const chatRouter = require('./modules/chat/routes');
const io = require('socket.io')(server);

const connectedUsers = {};

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(variables.Database.connection, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);

server.listen(port, () => {
  io.on('connection', (socket) => {
    console.log('[SOCKER.USER]: ' + socket.handshake.query)
    const { user_id } = socket.handshake.query;
    connectedUsers[user_id] = socket.id;
  });
  console.log('Rodando...');
});
