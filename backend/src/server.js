require('dotenv').config();
const app = require('./app');

app.listen(8000, '0.0.0.0', () => console.log('API en http://0.0.0.0:8000'));
