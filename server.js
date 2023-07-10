const express = require("express");
const routes = require("./routes");
const server = express();
const cors = require('cors');

server.use(express.json());
server.use(cors());
server.use(routes);

module.exports = server;
