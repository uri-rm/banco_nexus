const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

async function conectar() {
  if (!db) {
    await client.connect();
    db = client.db('banco_nexus');
    console.log('Conectado a MongoDB');
  }
  return db;
}

module.exports = { conectar };