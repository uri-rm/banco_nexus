// crearBaseDeDatos.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function crearBD() {
  try {
    await client.connect();
    const db = client.db('banco_nexus');

    const clientes = db.collection('clientes');
    const cuentas = db.collection('cuentas');
    const transacciones = db.collection('transacciones');

    await clientes.insertMany([
      { nombre: 'Ana Ruiz',          curp: 'RUAA900101MDFXXX01' },
      { nombre: 'Luis Pérez',        curp: 'RELU850203HDFXXX02' },
      { nombre: 'María González',    curp: 'GOMM920415MDFXXX03' },
      { nombre: 'Carlos Hernández',  curp: 'HECC880720HDFXXX04' },
      { nombre: 'Sofía Torres',      curp: 'TOSS950312MDFXXX05' },
      { nombre: 'Jorge Ramírez',     curp: 'RAJJ910630HDFXXX06' },
      { nombre: 'Valeria López',     curp: 'LOVV001118MDFXXX07' },
      { nombre: 'Diego Morales',     curp: 'MODD870914HDFXXX08' },
      { nombre: 'Fernanda Castro',   curp: 'CAFF930225MDFXXX09' },
      { nombre: 'Andrés Jiménez',    curp: 'JIAA960507HDFXXX10' },
      { nombre: 'Lucía Mendoza',     curp: 'MELL780811MDFXXX11' },
      { nombre: 'Roberto Vargas',    curp: 'VARR830429HDFXXX12' }
    ]);

    await cuentas.insertMany([
      { cuenta: '001', cliente: 'RUAA900101MDFXXX01', saldo: 5000  },
      { cuenta: '002', cliente: 'RELU850203HDFXXX02', saldo: 8000  },
      { cuenta: '003', cliente: 'GOMM920415MDFXXX03', saldo: 12000 },
      { cuenta: '004', cliente: 'HECC880720HDFXXX04', saldo: 3500  },
      { cuenta: '005', cliente: 'TOSS950312MDFXXX05', saldo: 7200  },
      { cuenta: '006', cliente: 'RAJJ910630HDFXXX06', saldo: 15000 },
      { cuenta: '007', cliente: 'LOVV001118MDFXXX07', saldo: 900   },
      { cuenta: '008', cliente: 'MODD870914HDFXXX08', saldo: 4300  },
      { cuenta: '009', cliente: 'CAFF930225MDFXXX09', saldo: 6750  },
      { cuenta: '010', cliente: 'JIAA960507HDFXXX10', saldo: 2100  },
      { cuenta: '011', cliente: 'MELL780811MDFXXX11', saldo: 9800  },
      { cuenta: '012', cliente: 'VARR830429HDFXXX12', saldo: 5500  }
    ]);

    await transacciones.insertMany([
      // Cuenta 001 - Ana Ruiz
      { cuenta: '001', fecha: new Date('2026-05-01T10:15:00Z'), tipo: 'deposito', monto: 2500, descripcion: 'Depósito nómina' },
      { cuenta: '001', fecha: new Date('2026-05-03T14:30:00Z'), tipo: 'retiro',   monto: 400,  descripcion: 'Pago de servicios' },
      { cuenta: '001', fecha: new Date('2026-05-05T09:00:00Z'), tipo: 'retiro',   monto: 120,  descripcion: 'Compra en supermercado' },

      // Cuenta 002 - Luis Pérez
      { cuenta: '002', fecha: new Date('2026-05-02T11:45:00Z'), tipo: 'deposito', monto: 3000, descripcion: 'Transferencia recibida' },
      { cuenta: '002', fecha: new Date('2026-05-04T16:20:00Z'), tipo: 'retiro',   monto: 650,  descripcion: 'Compra en tienda' },
      { cuenta: '002', fecha: new Date('2026-05-06T08:30:00Z'), tipo: 'retiro',   monto: 220,  descripcion: 'Pago de gasolina' },

      // Cuenta 003 - María González
      { cuenta: '003', fecha: new Date('2026-05-01T08:00:00Z'), tipo: 'deposito', monto: 5000, descripcion: 'Depósito nómina' },
      { cuenta: '003', fecha: new Date('2026-05-02T13:00:00Z'), tipo: 'retiro',   monto: 800,  descripcion: 'Pago renta' },
      { cuenta: '003', fecha: new Date('2026-05-05T17:45:00Z'), tipo: 'retiro',   monto: 300,  descripcion: 'Restaurante' },

      // Cuenta 004 - Carlos Hernández
      { cuenta: '004', fecha: new Date('2026-05-01T09:30:00Z'), tipo: 'deposito', monto: 1500, descripcion: 'Depósito en ventanilla' },
      { cuenta: '004', fecha: new Date('2026-05-03T11:00:00Z'), tipo: 'retiro',   monto: 200,  descripcion: 'Retiro en cajero' },
      { cuenta: '004', fecha: new Date('2026-05-06T15:00:00Z'), tipo: 'retiro',   monto: 450,  descripcion: 'Pago de luz' },

      // Cuenta 005 - Sofía Torres
      { cuenta: '005', fecha: new Date('2026-05-02T10:00:00Z'), tipo: 'deposito', monto: 2200, descripcion: 'Transferencia recibida' },
      { cuenta: '005', fecha: new Date('2026-05-04T12:30:00Z'), tipo: 'retiro',   monto: 500,  descripcion: 'Compra en línea' },
      { cuenta: '005', fecha: new Date('2026-05-07T08:00:00Z'), tipo: 'deposito', monto: 1000, descripcion: 'Depósito nómina' },

      // Cuenta 006 - Jorge Ramírez
      { cuenta: '006', fecha: new Date('2026-05-01T07:45:00Z'), tipo: 'deposito', monto: 8000, descripcion: 'Depósito nómina' },
      { cuenta: '006', fecha: new Date('2026-05-03T10:15:00Z'), tipo: 'retiro',   monto: 1200, descripcion: 'Pago hipoteca' },
      { cuenta: '006', fecha: new Date('2026-05-05T14:00:00Z'), tipo: 'retiro',   monto: 600,  descripcion: 'Compra supermercado' },

      // Cuenta 007 - Valeria López
      { cuenta: '007', fecha: new Date('2026-05-03T09:00:00Z'), tipo: 'deposito', monto: 500,  descripcion: 'Depósito en efectivo' },
      { cuenta: '007', fecha: new Date('2026-05-05T16:00:00Z'), tipo: 'retiro',   monto: 150,  descripcion: 'Pago de internet' },
      { cuenta: '007', fecha: new Date('2026-05-07T11:30:00Z'), tipo: 'retiro',   monto: 80,   descripcion: 'Compra farmacia' },

      // Cuenta 008 - Diego Morales
      { cuenta: '008', fecha: new Date('2026-05-01T08:30:00Z'), tipo: 'deposito', monto: 1800, descripcion: 'Depósito nómina' },
      { cuenta: '008', fecha: new Date('2026-05-04T13:45:00Z'), tipo: 'retiro',   monto: 350,  descripcion: 'Pago de agua' },
      { cuenta: '008', fecha: new Date('2026-05-06T10:00:00Z'), tipo: 'retiro',   monto: 275,  descripcion: 'Gasolina' },

      // Cuenta 009 - Fernanda Castro
      { cuenta: '009', fecha: new Date('2026-05-02T09:15:00Z'), tipo: 'deposito', monto: 3200, descripcion: 'Transferencia recibida' },
      { cuenta: '009', fecha: new Date('2026-05-04T14:00:00Z'), tipo: 'retiro',   monto: 700,  descripcion: 'Pago tarjeta crédito' },
      { cuenta: '009', fecha: new Date('2026-05-06T17:00:00Z'), tipo: 'retiro',   monto: 190,  descripcion: 'Suscripciones' },

      // Cuenta 010 - Andrés Jiménez
      { cuenta: '010', fecha: new Date('2026-05-01T11:00:00Z'), tipo: 'deposito', monto: 900,  descripcion: 'Depósito en ventanilla' },
      { cuenta: '010', fecha: new Date('2026-05-03T15:30:00Z'), tipo: 'retiro',   monto: 250,  descripcion: 'Retiro cajero' },
      { cuenta: '010', fecha: new Date('2026-05-07T09:45:00Z'), tipo: 'retiro',   monto: 100,  descripcion: 'Pago de transporte' },

      // Cuenta 011 - Lucía Mendoza
      { cuenta: '011', fecha: new Date('2026-05-01T07:00:00Z'), tipo: 'deposito', monto: 4500, descripcion: 'Depósito nómina' },
      { cuenta: '011', fecha: new Date('2026-05-03T12:00:00Z'), tipo: 'retiro',   monto: 1000, descripcion: 'Pago renta' },
      { cuenta: '011', fecha: new Date('2026-05-05T16:30:00Z'), tipo: 'retiro',   monto: 420,  descripcion: 'Compra en línea' },

      // Cuenta 012 - Roberto Vargas
      { cuenta: '012', fecha: new Date('2026-05-02T08:45:00Z'), tipo: 'deposito', monto: 2000, descripcion: 'Transferencia recibida' },
      { cuenta: '012', fecha: new Date('2026-05-04T11:30:00Z'), tipo: 'retiro',   monto: 550,  descripcion: 'Compra supermercado' },
      { cuenta: '012', fecha: new Date('2026-05-06T14:15:00Z'), tipo: 'retiro',   monto: 310,  descripcion: 'Pago servicios' }
    ]);

    console.log('Base de datos inicial creada con éxito.');
  } finally {
    await client.close();
  }
}

crearBD();