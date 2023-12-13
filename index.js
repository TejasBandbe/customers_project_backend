const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const { constants } = require('./env');
require('dotenv').config();

const app = express();

app.use(cors('*'));
app.use(express.json());
app.use('/api', usersRouter);
app.all('*', (req, res) => {
    res.status(404).send("resource not available");
});

app.listen(constants.SERVER_PORT, '0.0.0.0', () => {
    console.log("server started at "+constants.SERVER_PORT+"...");
});