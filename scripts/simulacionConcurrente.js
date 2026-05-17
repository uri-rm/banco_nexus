// simulacionConcurrente.js
// Integrante 4 - Banco Nexus: Simulación de operaciones concurrentes desde 5 sucursales
// Sucursales: Central, Norte, Sur, Este, Oeste
// Ejecuta: node simulacionConcurrente.js

const BASE_URL = 'http://localhost:8000';

// Mapa de sucursales con su dirección (igual que en el seed)
const SUCURSALES = {
  Central: 'Av. Principal 123, Ciudad',
  Norte:   'Calle Norte 456, Ciudad',
  Sur:     'Calle Sur 789, Ciudad',
  Este:    'Calle Este 321, Ciudad',
  Oeste:   'Calle Oeste 654, Ciudad',
};

function buildBody(cuenta, monto, tipo, sucursalNombre, descripcion) {
  return {
    cuenta,
    fecha: new Date().toISOString(),
    tipo,
    monto,
    descripcion,
    sucursal: {
      sucursal:  sucursalNombre,
      direccion: SUCURSALES[sucursalNombre],
    },
  };
}

async function depositar(cuenta, monto, sucursal, descripcion = 'Depósito sucursal') {
  const res = await fetch(`${BASE_URL}/api/deposito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(cuenta, monto, 'deposito', sucursal, descripcion)),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, sucursal, operacion: 'deposito', monto, ...data };
}

async function retirar(cuenta, monto, sucursal, descripcion = 'Retiro sucursal') {
  const res = await fetch(`${BASE_URL}/api/retiro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(cuenta, monto, 'retiro', sucursal, descripcion)),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, sucursal, operacion: 'retiro', monto, ...data };
}

async function obtenerCuenta(cuenta) {
  const res = await fetch(`${BASE_URL}/api/cuenta/${cuenta}`);
  if (!res.ok) throw new Error(`Error al obtener cuenta ${cuenta}: ${res.status}`);
  return await res.json();
}

async function operacionSucursalCentral(cuenta) {
  console.log('\n[Central] Iniciando operaciones...');
  const r1 = await depositar(cuenta, 2500, 'Central', 'Depósito nómina Central');
  console.log(`[Central] Depósito $2500 → saldo: ${r1.nuevo_saldo ?? r1.detail}`);
  const r2 = await retirar(cuenta, 400, 'Central', 'Pago servicios Central');
  console.log(`[Central] Retiro   $400  → saldo: ${r2.nuevo_saldo ?? r2.detail}`);
  return [r1, r2];
}

async function operacionSucursalNorte(cuenta) {
  console.log('\n[Norte]   Iniciando operaciones...');
  const r1 = await depositar(cuenta, 1800, 'Norte', 'Depósito ventanilla Norte');
  console.log(`[Norte]   Depósito $1800 → saldo: ${r1.nuevo_saldo ?? r1.detail}`);
  const r2 = await retirar(cuenta, 600, 'Norte', 'Retiro cajero Norte');
  console.log(`[Norte]   Retiro   $600  → saldo: ${r2.nuevo_saldo ?? r2.detail}`);
  return [r1, r2];
}

async function operacionSucursalSur(cuenta) {
  console.log('\n[Sur]     Iniciando operaciones...');
  const r1 = await depositar(cuenta, 1000, 'Sur', 'Transferencia recibida Sur');
  console.log(`[Sur]     Depósito $1000 → saldo: ${r1.nuevo_saldo ?? r1.detail}`);
  const r2 = await retirar(cuenta, 300, 'Sur', 'Compra supermercado Sur');
  console.log(`[Sur]     Retiro   $300  → saldo: ${r2.nuevo_saldo ?? r2.detail}`);
  return [r1, r2];
}

async function operacionSucursalEste(cuenta) {
  console.log('\n[Este]    Iniciando operaciones...');
  const r1 = await depositar(cuenta, 750, 'Este', 'Depósito en efectivo Este');
  console.log(`[Este]    Depósito $750  → saldo: ${r1.nuevo_saldo ?? r1.detail}`);
  const r2 = await retirar(cuenta, 200, 'Este', 'Pago de servicios Este');
  console.log(`[Este]    Retiro   $200  → saldo: ${r2.nuevo_saldo ?? r2.detail}`);
  return [r1, r2];
}

async function operacionSucursalOeste(cuenta) {
  console.log('\n[Oeste]   Iniciando operaciones...');
  const r1 = await depositar(cuenta, 500, 'Oeste', 'Depósito en efectivo Oeste');
  console.log(`[Oeste]   Depósito $500  → saldo: ${r1.nuevo_saldo ?? r1.detail}`);
  const r2 = await retirar(cuenta, 100, 'Oeste', 'Retiro cajero Oeste');
  console.log(`[Oeste]   Retiro   $100  → saldo: ${r2.nuevo_saldo ?? r2.detail}`);
  return [r1, r2];
}

// Análisis de resultados

function analizarResultados(resultados, saldoInicial, saldoFinal) {
  console.log('\n══════════════════════════════════════════════');
  console.log('           ANÁLISIS DE CONCURRENCIA');
  console.log('══════════════════════════════════════════════');

  const flat = resultados.flat();
  const exitosas = flat.filter((r) => r.ok);
  const fallidas = flat.filter((r) => !r.ok);

  // Calcular saldo esperado con solo las operaciones exitosas
  let saldoEsperado = saldoInicial;
  exitosas.forEach((r) => {
    if (r.operacion === 'deposito') saldoEsperado += r.monto;
    else saldoEsperado -= r.monto;
  });

  console.log(`\nOperaciones totales  : ${flat.length}`);
  console.log(`  ✔ Exitosas         : ${exitosas.length}`);
  console.log(`  ✘ Fallidas         : ${fallidas.length}`);

  if (fallidas.length > 0) {
    console.log('\nDetalle de fallidas:');
    fallidas.forEach((r) => {
      console.log(`  [${r.sucursal}] ${r.operacion} $${r.monto} → ${r.detail}`);
    });
  }

  const saldosIntermedios = exitosas
    .map((r) => r.nuevo_saldo)
    .filter((s) => s !== undefined)
    .sort((a, b) => a - b);

  console.log(`\nSaldo inicial        : $${saldoInicial}`);
  console.log(`Saldo esperado       : $${saldoEsperado}`);
  console.log(`Saldo final real     : $${saldoFinal}`);
  console.log(`Saldos intermedios   : [${[...new Set(saldosIntermedios)].join(', ')}]`);

  const hayColision = typeof saldoFinal === 'number' && saldoFinal !== saldoEsperado;
  if (hayColision) {
    console.log('\n !!! COLISIÓN / INCONSISTENCIA DETECTADA');
    console.log(`   Diferencia: $${saldoFinal - saldoEsperado}`);
    console.log('   Causa probable: race condition en lectura-modificación-escritura.');
    console.log('   Solución: find_one_and_update con $inc ya aplicada en el backend.');
  } else {
    console.log('\n Sin inconsistencias detectadas.');
    console.log('   El $inc atómico de MongoDB garantizó consistencia entre sucursales.');
  }

  console.log('\n──────────────────────────────────────────────');
  console.log('=> Resumen por sucursal:');
  ['Central', 'Norte', 'Sur', 'Este', 'Oeste'].forEach((s) => {
    const ops = flat.filter((r) => r.sucursal === s);
    const ok  = ops.filter((r) => r.ok).length;
    console.log(`  ${s.padEnd(8)}: ${ok}/${ops.length} exitosas`);
  });
  console.log('══════════════════════════════════════════════\n');
}

// Main: ejecución paralela con Promise.all

async function main() {
  const CUENTA = '001'; // Ana Ruiz
  const SALDO_INICIAL = 5000; 

  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Banco Nexus - Simulación Concurrente        ║');
  console.log('║  Integrante 4 - 5 Sucursales simultáneas     ║');
  console.log('║  Central | Norte | Sur | Este | Oeste        ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`\nCuenta          : ${CUENTA} (Ana Ruiz)`);
  console.log(`Saldo inicial   : $${SALDO_INICIAL}`);
  console.log('Lanzando Promise.all con las 5 sucursales...\n');

  const inicio = Date.now();

  // Todas operan AL MISMO TIEMPO
  const resultados = await Promise.all([
    operacionSucursalCentral(CUENTA),
    operacionSucursalNorte(CUENTA),
    operacionSucursalSur(CUENTA),
    operacionSucursalEste(CUENTA),
    operacionSucursalOeste(CUENTA),
  ]);

  const fin = Date.now();
  console.log(`\n⏱  Tiempo total concurrente: ${fin - inicio} ms`);

  // Leer saldo final desde la BD
  let saldoFinal = '(error)';
  try {
    const cuentaData = await obtenerCuenta(CUENTA);
    saldoFinal = cuentaData.saldo;
  } catch (e) {
    console.warn('No se pudo leer saldo final:', e.message);
  }

  analizarResultados(resultados, SALDO_INICIAL, saldoFinal);
}

main().catch((err) => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
