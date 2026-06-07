const knex = require('knex');
const fs = require('fs');

const sslCaPath = process.env.DB_SSL_CA;

module.exports = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(sslCaPath ? { ssl: { ca: fs.readFileSync(sslCaPath) } } : {}),
  },
  pool: { min: 2, max: 5 },
});
