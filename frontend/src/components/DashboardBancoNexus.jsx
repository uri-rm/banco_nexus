import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardBancoNexus() {
  const [cuenta, setCuenta] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({});

  const cargarHistorial = async () => {
    setDatos([]);
    setCuenta('');
    if (!cuenta) {
      setError('Ingrese un número de cuenta.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res  = await axios.get(`http://localhost:3000/api/cuenta/${cuenta}`);

      console.log(res.data, 'sdfcds');

      const transactions = res.data.transacciones.map((t) => ({
        fecha: t.fecha,
        saldo: res.data.saldo + (t.tipo === 'deposito' ? t.monto : -t.monto)
        }));
      console.log(transactions)
      setDatos(transactions);
      setUserData(res.data.cliente);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
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

      <Card className="dashboard-card">
        <CardContent>
          {loading && <p>Cargando historial...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && datos.length === 0 && <p>Ingrese un número de cuenta para ver el historial.</p>}
          {datos.length > 0 && (
            <>
            <p className='title-name'><strong>{userData.nombre}</strong></p>
            <LineChart width={500} height={300} data={datos}>
              <Line type="monotone" dataKey="saldo" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
            </LineChart>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
