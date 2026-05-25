import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import FlashMessages from './ui/flashMessages';
import { FaDollarSign, FaWallet, FaMoneyBillWave, FaArrowCircleDown, FaHistory } from 'react-icons/fa';
import ModalConsultarSaldo from '@/components/ui/modals/ModalConsultarSaldo';
import ModalRetiro         from '@/components/ui/modals/ModalRetiro';
import ModalDeposito       from '@/components/ui/modals/ModalDeposito';
import ModalHistorial      from '@/components/ui/modals/ModalHistorial';
import { API_BASE_URL } from '@/config';

export default function DashboardBancoNexus() {

  // ── Modales ──
  const [historialModalOpen,      setHistorialModalOpen]      = useState(false);
  const [retirosModalOpen,        setRetirosModalOpen]        = useState(false);
  const [depositosModalOpen,      setDepositosModalOpen]      = useState(false);
  const [transferenciasModalOpen, setTransferenciasModalOpen] = useState(false);

  // ── Estado de cuenta ──
  const [cuenta,      setCuenta]      = useState('');
  const [datos,       setDatos]       = useState([]);
  const [userData,    setUserData]    = useState(null);
  const [dataGrafico, setDataGrafico] = useState([]);

  // ── UI ──
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Fetch principal ──
  const cargarHistorial = async (numeroCuenta) => {
    const c = numeroCuenta ?? cuenta;
    if (!c) { setError('Ingrese un número de cuenta.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cuenta/${c}`);
      setCuenta(c);
      setDatos(res.data.transacciones || []);
      setDataGrafico((res.data.transacciones || []).map(tx => ({ fecha: tx.fecha, saldo: tx.saldo })));
      setUserData(res.data.cliente || null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* ── Header ── */}
      <header className='py-2 px-4 border-b-2 border-sky-700 mb-6 flex items-center justify-between'>
        <div className="flex items-center gap-2">
          <FaDollarSign className="text-4xl text-green-500" />
          <h2 className="font-bold text-neutral-100">Dashboard Financiero - Banco Nexus</h2>
        </div>
      </header>
      <div className="relative w-full max-w-2xl mx-auto mb-6">
        <FlashMessages
          messages={error ? [{ type: 'error', text: error }] : []}
          open={!!error}
          onClose={() => setError('')}
        />
      </div>

         {/* ── Titulo ── */}
          <h2 className="text-2xl font-bold text-center text-neutral-100 mb-6">
            {userData ? `Bienvenido, ${userData.nombre}` : 'Ingrese su número de cuenta para comenzar'}
          </h2>
      
         {/* ── Buscador ── */}
          <div className="flex justify-center gap-3 mb-6 px-4">
            <div className='flex justify-center items-center'>
              <Input
                placeholder="Ingrese su número de cuenta"
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
              />
            <Button variant="success" onClick={() => cargarHistorial()}>
              {loading ? 'Cargando...' : 'Consultar'}
            </Button>
            </div>
          </div>
          
          {userData && (
            <>
              {/* ── Grid de acciones ── */}
          <main className='flex justify-center mb-6'>
            <div className='border border-sky-700 p-6 grid md:grid-cols-2 gap-6 rounded w-full max-w-xl slide'>

              <button
                onClick={() => { setError(''); setHistorialModalOpen(true); }}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-sky-700 hover:border-sky-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaWallet className="text-3xl text-sky-400" />
                <h3 className="font-medium">Consultar Saldo</h3>
              </button>

              <button
                onClick={() => setRetirosModalOpen(true)}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-red-700 hover:border-red-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaArrowCircleDown className="text-3xl text-red-400" />
                <h3 className="font-medium">Retirar</h3>
              </button>

              <button
                onClick={() => setDepositosModalOpen(true)}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-green-700 hover:border-green-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaMoneyBillWave className="text-3xl text-green-400" />
                <h3 className="font-medium">Depositar</h3>
              </button>

              <button
                onClick={() => { setError(''); setTransferenciasModalOpen(true); }}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-sky-700 hover:border-sky-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaHistory className="text-3xl text-sky-400" />
                <h3 className="font-medium">Ver historial</h3>
              </button>

            </div>
          </main>

          {/* ── Modales ── */}
          <ModalConsultarSaldo
            isOpen={historialModalOpen}
            onClose={() => setHistorialModalOpen(false)}
            userData={userData}
            datos={datos}
            loading={loading}
            error={error}
            dataGrafico={dataGrafico}
            size={'lg'}
            onConsultar={async (c) => { await cargarHistorial(c); setHistorialModalOpen(false); }}
          />

          <ModalRetiro
            isOpen={retirosModalOpen}
            onClose={() => setRetirosModalOpen(false)}
            cuenta={cuenta}
            onSuccess={() => cargarHistorial()}
          />

          <ModalDeposito
            isOpen={depositosModalOpen}
            onClose={() => setDepositosModalOpen(false)}
            cuenta={cuenta}
            onSuccess={() => cargarHistorial()}
          />

          <ModalHistorial
            isOpen={transferenciasModalOpen}
            onClose={() => setTransferenciasModalOpen(false)}
            userData={userData}
            datos={datos}
          />

            </>
          )}
           
    </div>
  );
}