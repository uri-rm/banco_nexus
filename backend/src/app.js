const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/auth',         require('./routes/auth'));
app.use('/users',        require('./routes/users'));
app.use('/transactions', require('./routes/transactions'));

module.exports = app;
