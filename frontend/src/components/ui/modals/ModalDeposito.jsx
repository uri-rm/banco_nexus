import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { FaExclamationCircle, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '@/config';

export default function ModalDeposito({ isOpen, onClose, cuenta, onSuccess }) {
  const [monto,       setMonto]       = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sucursal,    setSucursal]    = useState('');
  const [direccion,   setDireccion]   = useState('');
  const [sucursales,  setSucursales]  = useState([]);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  const reset = () => { setMonto(''); setDescripcion(''); setSucursal(''); setDireccion(''); setError(''); };

  const handleClose = () => { reset(); setSuccess(false); onClose(); };

  useEffect(() => {
    // cargar sucursales cuando se abra el modal
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/sucursales`);
        setSucursales(res.data || []);
      } catch (e) {
        // no bloquear al usuario si falla la carga
        console.error('No se pudieron cargar sucursales', e);
      }
    };
    if (isOpen) load();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!cuenta)                      { setError('No hay cuenta cargada.'); return; }
    if (!monto || Number(monto) <= 0) { setError('Ingrese un monto válido.'); return; }
    try {
      setLoading(true); setError('');
      // find direccion from selected sucursal if available
      const sucursalObj = sucursales.find(s => s.sucursal === sucursal) || { direccion };
      await axios.post(`${API_BASE_URL}/api/deposito`, {
        cuenta,
        fecha: new Date().toISOString(),
        tipo: 'deposito',
        monto: Number(monto),
        descripcion,
        sucursal: { sucursal, direccion: sucursalObj.direccion },
      });
      setSuccess(true);
      onSuccess();
      // cierra automáticamente después de 2s
      setTimeout(() => { handleClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al realizar depósito');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>

      {/* ── Título ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <FaMoneyBillWave className="text-green-400 text-xl" />
        </div>
        <div>
          <h2 className="text-neutral-100 font-semibold text-lg leading-none">Depositar</h2>
          <p className="text-neutral-500 text-xs mt-1">Cuenta: {cuenta}</p>
        </div>
      </div>

      {/* ── Vista de éxito ── */}
      {success ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8
                        animate-[slideDown_0.3s_ease_forwards]">
          <div className="p-4 bg-green-500/10 rounded-full">
            <FaCheckCircle className="text-green-400 text-5xl" />
          </div>
          <div className="text-center">
            <p className="text-neutral-100 font-semibold text-lg">¡Depósito exitoso!</p>
            <p className="text-neutral-400 text-sm mt-1">
              Se depositaron <span className="text-green-400 font-medium">${monto}</span> a la cuenta {cuenta}
            </p>
          </div>
          <p className="text-neutral-600 text-xs">Cerrando automáticamente...</p>
        </div>

      ) : (

        /* ── Formulario ── */
        <div className="space-y-3">
          <Input placeholder="Monto a depositar"     type="number" value={monto}       onChange={(e) => setMonto(e.target.value)} />
          <Input placeholder="Descripción"           value={descripcion}               onChange={(e) => setDescripcion(e.target.value)} />

          {/* Sucursal select poblado desde API */}
          <div>
            <label className="text-neutral-400 text-xs">Sucursal</label>
            <select
              className="w-full bg-gray-900 border border-neutral-700 rounded-md px-2 py-1 mt-1 text-neutral-100"
              value={sucursal}
              onChange={(e) => {
                const val = e.target.value;
                setSucursal(val);
                const found = sucursales.find(s => s.sucursal === val);
                setDireccion(found?.direccion || '');
              }}
            >
              <option value="">Seleccione una sucursal</option>
              {sucursales.map((s) => (
                <option key={s.sucursal} value={s.sucursal}>{s.sucursal}</option>
              ))}
            </select>
          </div>

          {/* Dirección autocompletada (readonly) */}
          <Input placeholder="Dirección de sucursal" value={direccion} readOnly />

          {/* ── Error ── */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                            bg-red-500/10 border border-red-500/30
                            animate-[slideDown_0.25s_ease_forwards]">
              <FaExclamationCircle className="text-red-400 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* ── Acciones ── */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="danger" onClick={handleClose}>Cancelar</Button>
            <Button variant="success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar depósito'}
            </Button>
          </div>
        </div>
      )}

    </Modal>
  );
}