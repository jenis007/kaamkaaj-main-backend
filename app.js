require("dotenv").config();
const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');
const cron = require('./utils/cron');
const app = express();
const errorMiddleware = require('./errors/error');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const socketManager = require('./utils/socketManager');
const server = http.createServer(app);
socketManager.initSocket(server);

app.use(express.json());

// Schedule the cron job
cron.start();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.get('/:folderName/:imageName', (req, res) => {
  const { imageName, folderName } = req.params;
  const imagePath = path.join(__dirname, `assets/${folderName}/`, imageName);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(500).send('Error displaying image');
    }
  });
});

// Route imports
const routeIndex = require('./routes/index');
app.use('/api/v1', routeIndex);

app.use(errorMiddleware);

module.exports = { app, server };