require('dotenv').config();
const app = require('./app');
const db  = require('./db');

async function migrate() {
  await db.raw(`
    ALTER TABLE audit_logs
      MODIFY COLUMN action  VARCHAR(30)  NOT NULL,
      MODIFY COLUMN status  VARCHAR(20)  NOT NULL,
      MODIFY COLUMN detail  VARCHAR(255) NULL
  `);
  console.log('Migración audit_logs aplicada');
}

migrate()
  .catch(err => console.error('Error en migración:', err.message))
  .finally(() => app.listen(8000, '0.0.0.0', () => console.log('API en http://0.0.0.0:8000')));
