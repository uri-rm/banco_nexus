import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from "../components/ui/modal";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardBancoNexus() {
  const [cuenta, setCuenta] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({});
  const [dataGrafico, setDataGrafico] = useState([]);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositMonto, setDepositMonto] = useState('');
  const [depositDescripcion, setDepositDescripcion] = useState('');
  const [depositSucursal, setDepositSucursal] = useState('');
  const [depositDireccion, setDepositDireccion] = useState('');
  const [depositError, setDepositError] = useState('');
  const [withdrawMonto, setWithdrawMonto] = useState('');
  const [withdrawDescripcion, setWithdrawDescripcion] = useState('');
  const [withdrawSucursal, setWithdrawSucursal] = useState('');
  const [withdrawDireccion, setWithdrawDireccion] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const cargarHistorial = async () => {
    if (!cuenta) {
      setError('Ingrese un número de cuenta.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`http://localhost:8000/api/cuenta/${cuenta}`);

      setDatos(res.data.transacciones || []);
      console.log('Transacciones recibidas:', res.data.transacciones);
      const formated = (res.data.transacciones || []).map(tx => ({
        fecha: tx.fecha,
        saldo: tx.saldo,
      }));
      setDataGrafico(formated);
      setUserData(res.data.cliente || {});
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  const resetDepositForm = () => {
    setDepositMonto('');
    setDepositDescripcion('');
    setDepositSucursal('');
    setDepositDireccion('');
  };

  const resetWithdrawForm = () => {
    setWithdrawMonto('');
    setWithdrawDescripcion('');
    setWithdrawSucursal('');
    setWithdrawDireccion('');
  };

  const handleDeposit = async () => {
    if (!cuenta) {
      setDepositError('Carga primero la cuenta antes de depositar.');
      return;
    }
    if (!depositMonto || Number(depositMonto) <= 0) {
      setDepositError('Ingrese un monto de depósito válido.');
      return;
    }

    try {
      setLoading(true);
      setDepositError('');
      setError('');
      await axios.post('http://localhost:8000/api/deposito', {
        cuenta,
        fecha: new Date().toISOString(),
        tipo: 'deposito',
        monto: Number(depositMonto),
        descripcion: depositDescripcion,
        sucursal: {
          sucursal: depositSucursal,
          direccion: depositDireccion,
        },
      });
      resetDepositForm();
      setIsDepositOpen(false);
      await cargarHistorial();
    } catch (err) {
      setDepositError(err.response?.data?.detail || err.message || 'Error al realizar depósito');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!cuenta) {
      setWithdrawError('Carga primero la cuenta antes de retirar.');
      return;
    }
    
    if (!withdrawMonto || Number(withdrawMonto) <= 0) {
      setWithdrawError('Ingrese un monto de retiro válido.');
      return;
    }

    try {
      setLoading(true);
      setWithdrawError('');
      setError('');
      await axios.post('http://localhost:8000/api/retiro', {
        cuenta,
        fecha: new Date().toISOString(),
        tipo: 'retiro',
        monto: Number(withdrawMonto),
        descripcion: withdrawDescripcion,
        sucursal: {
          sucursal: withdrawSucursal,
          direccion: withdrawDireccion,
        },
      });
      resetWithdrawForm();
      setIsWithdrawOpen(false);
      await cargarHistorial();
    } catch (err) {
      setWithdrawError(err.response?.data?.detail || err.message || 'Error al realizar retiro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">Dashboard Financiero - Banco Nexus</h2>

      <div className="form-row">
        <Input
          placeholder="Número de cuenta"
          value={cuenta}
          onChange={(e) => setCuenta(e.target.value)}
        />
        <Button onClick={cargarHistorial}>Ver evolución de saldo</Button>
      </div>

      {datos.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-4">
          <Button onClick={() => setIsTransactionsOpen(true)}>Ver transacciones</Button>
          <Button onClick={() => {
            setDepositError('');
            setIsDepositOpen(true);
          }}>Depositar</Button>
          <Button onClick={() => {
            setWithdrawError('');
            setIsWithdrawOpen(true);
          }}>Retirar</Button>
        </div>
      )}
      <Card className="dashboard-card border-gray-300 p-4 rounded">
        <div>
          <CardContent>
            {loading && <p>Cargando historial...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && dataGrafico.length === 0 && <p>Ingrese un número de cuenta para ver el historial.</p>}
            {dataGrafico.length > 0 && (
              <>
                <p className='title-name'><strong>{userData.nombre}</strong></p>
                <LineChart width={500} height={300} data={dataGrafico}>
                  <Line type="monotone" dataKey="saldo" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </>
            )}
          </CardContent>
        </div>
      </Card>

      <Modal isOpen={isTransactionsOpen} onClose={() => setIsTransactionsOpen(false)}>
        <h2>Transacciones de {userData.nombre}</h2>
        {datos.length === 0 ? (
          <p>No hay transacciones para mostrar.</p>
        ) : (
          <ul>
            {datos.map((tx, index) => (
              <li key={index} className="mb-4 p-4 border rounded">
                <p><strong>Fecha:</strong> {new Date(tx.fecha).toLocaleString()}</p>
                <p><strong>Tipo:</strong> {tx.tipo}</p>
                <p><strong>Monto:</strong> ${tx.monto}</p>
                <p><strong>Descripción:</strong> {tx.descripcion}</p>
                <p><strong>Sucursal:</strong> {tx.sucursal.sucursal} - {tx.sucursal.direccion}</p>
                <p><strong>Saldo:</strong> ${tx.saldo}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)}>
        <h2>Depósito</h2>
        <div className="space-y-3">
          <Input
            placeholder="Monto"
            type="number"
            value={depositMonto}
            onChange={(e) => setDepositMonto(e.target.value)}
          />
          <Input
            placeholder="Descripción"
            value={depositDescripcion}
            onChange={(e) => setDepositDescripcion(e.target.value)}
          />
          {depositError && <p className="error-message">{depositError}</p>}
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsDepositOpen(false)}>Cancelar</Button>
            <Button onClick={handleDeposit}>Confirmar depósito</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)}>
        <h2>Retiro</h2>
        <div className="space-y-3">
          <Input
            placeholder="Monto"
            type="number"
            value={withdrawMonto}
            onChange={(e) => setWithdrawMonto(e.target.value)}
          />
          <Input
            placeholder="Descripción"
            value={withdrawDescripcion}
            onChange={(e) => setWithdrawDescripcion(e.target.value)}
          />
          {withdrawError && <p className="error-message">{withdrawError}</p>}
          <div className="flex justify-end gap-3">
              <Button onClick={() => setIsWithdrawOpen(false)}>Cancelar</Button>
            <Button onClick={handleWithdraw}>Confirmar retiro</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
