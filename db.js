const mysql = require('mysql2');
const { constants } = require('./env');
require('dotenv').config();

//connection pool
const pool = mysql.createPool({
    host: constants.DB_HOST,
    user: constants.DB_USER,
    password: process.env.DB_PASSWORD,
    database: constants.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

module.exports = pool;