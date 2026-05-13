const express = require('express');
const cors = require('cors');
const { conectar } = require('./db');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Obtener todos los clientes
app.get('/clientes', async (req, res) => {
  const db = await conectar();
  const clientes = await db.collection('clientes').find().toArray();
  res.json(clientes);
});


// Consulta de saldo y transacciones por número de cuenta
app.get('/api/cuenta/:cuenta', async (req, res) => {
  try {
    const db = await conectar();
    const { cuenta } = req.params;

    const cuentaDoc = await db.collection('cuentas').findOne({ cuenta });
    if (!cuentaDoc) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const cliente = await db.collection('clientes').findOne({ curp: cuentaDoc.cliente });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const transacciones = await db
      .collection('transacciones')
      .find({ cuenta: cuentaDoc.cuenta })
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      cuenta: cuentaDoc.cuenta,
      saldo: cuentaDoc.saldo,
      tipo: cuentaDoc.tipo,
      moneda: cuentaDoc.moneda,
      cliente: {
        nombre: cliente.nombre,
        curp: cliente.curp
      },
      transacciones
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar la cuenta' });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor en http://192.168.1.171:3000');
});