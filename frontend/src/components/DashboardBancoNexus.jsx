import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import FlashMessages from './ui/flashMessages';
import { FaDollarSign, FaWallet, FaMoneyBillWave, FaArrowCircleDown, FaHistory, FaExchangeAlt, FaUserEdit, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import ModalConsultarSaldo from '@/components/ui/modals/ModalConsultarSaldo';
import ModalRetiro         from '@/components/ui/modals/ModalRetiro';
import ModalDeposito       from '@/components/ui/modals/ModalDeposito';
import ModalHistorial      from '@/components/ui/modals/ModalHistorial';
import ModalTransferencia from '@/components/ui/modals/ModalTransferencia';
import ModalPerfil        from '@/components/ui/modals/ModalPerfil';
import ModalAgregarCuenta from '@/components/ui/modals/ModalAgregarCuenta';
import { getMe, getTransactions } from '@/api/conf';

export default function DashboardBancoNexus() {
  const navigate = useNavigate();
  // Modales
  const [historialModalOpen,      setHistorialModalOpen]      = useState(false);
  const [retirosModalOpen,        setRetirosModalOpen]        = useState(false);
  const [depositosModalOpen,      setDepositosModalOpen]      = useState(false);
  const [transferenciasModalOpen, setTransferenciasModalOpen] = useState(false);
  const [transferenciaModalOpen,  setTransferenciaModalOpen]  = useState(false);
  const [perfilModalOpen,         setPerfilModalOpen]         = useState(false);
  const [agregarCuentaOpen,       setAgregarCuentaOpen]       = useState(false);
  const [destinyReload,           setDestinyReload]           = useState(0);

  // Estado de cuenta 
  const [cuenta,      setCuenta]      = useState('');
  const [datos,       setDatos]       = useState([]);
  const [userData,    setUserData]    = useState(null);
  const [dataGrafico, setDataGrafico] = useState([]);

  // UI 
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch principal
  const cargarHistorial = async () => {
    setLoading(true);
    setError('');
    try {
      const userRes = await getMe();
      const txRes = await getTransactions();

      const user = userRes.data;
      const normalized = txRes.data.map((tx) => ({
        ...tx,
        fecha: tx.date,
        saldo: tx.balance_after,
        tipo: tx.type,
        monto: tx.amount,
        descripcion: tx.description,
        sucursal: tx.sucursal || null,
      }));
      
      const updatedUser = {
        ...user,
        balance: normalized.length > 0 ? normalized[normalized.length - 1].saldo : user.balance,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setCuenta(user.number);
      setDatos(normalized);
      setDataGrafico(normalized.map(tx => ({ fecha: tx.fecha, saldo: tx.saldo })));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  const openHistorial = async () => {
    setError('');
    await cargarHistorial();
    setTransferenciasModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>

      {/* ── Header ── */}
      <header className='py-2 px-4 border-b-2 border-sky-700 mb-6 flex items-center justify-between'>
        <div className="flex items-center gap-2">
          <FaDollarSign className="text-4xl text-green-500" />
          <h2 className="font-bold text-neutral-100">Dashboard Financiero - Banco Nexus</h2>
        </div>
        <button
          onClick={handleLogout}
          className='flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-neutral-100 transition-colors duration-200'
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
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
            {userData ? `Hola, ${userData.username}` : 'Ingrese su número de cuenta para comenzar'}
          </h2>
          
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
                onClick={() => setPerfilModalOpen(true)}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-yellow-700 hover:border-yellow-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaUserEdit className="text-3xl text-yellow-400" />
                <h3 className="font-medium">Mi perfil</h3>
              </button>

              <button
                onClick={() => setAgregarCuentaOpen(true)}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-sky-700 hover:border-sky-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaPlusCircle className="text-3xl text-sky-400" />
                <h3 className="font-medium">Agregar destino</h3>
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
                onClick={() => setTransferenciaModalOpen(true)}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-purple-700 hover:border-purple-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaExchangeAlt className="text-3xl text-purple-400" />
                <h3 className="font-medium">Transferir</h3>
              </button>

              <button
                onClick={openHistorial}
                className='flex flex-col items-center gap-2 p-4 border border-neutral-700 text-neutral-200 hover:shadow-md hover:shadow-sky-700 hover:border-sky-600 hover:scale-105 transition-all duration-200 cursor-pointer rounded'
              >
                <FaHistory className="text-3xl text-sky-400" />
                <h3 className="font-medium">Ver historial </h3>
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
            onConsultar={cargarHistorial}
          />

          <ModalRetiro
            isOpen={retirosModalOpen}
            onClose={() => setRetirosModalOpen(false)}
            cuenta={userData ? userData.number : ''}
            onSuccess={() => cargarHistorial()}
          />

          <ModalDeposito
            isOpen={depositosModalOpen}
            onClose={() => setDepositosModalOpen(false)}
            cuenta={userData ? userData.number : ''}
            onSuccess={() => cargarHistorial()}
          />

          <ModalTransferencia
            isOpen={transferenciaModalOpen}
            onClose={() => setTransferenciaModalOpen(false)}
            sourceAccount={userData ? userData.number : ''}
            destinyReload={destinyReload}
            onSuccess={() => cargarHistorial()}
            onOpenAgregarCuenta={() => { setTransferenciaModalOpen(false); setAgregarCuentaOpen(true); }}
          />

          <ModalAgregarCuenta
            isOpen={agregarCuentaOpen}
            onClose={() => setAgregarCuentaOpen(false)}
            onAdded={() => setDestinyReload((prev) => prev + 1)}
          />

          <ModalPerfil
            isOpen={perfilModalOpen}
            onClose={() => setPerfilModalOpen(false)}
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