import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { FaExclamationCircle, FaArrowCircleDown, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '@/config';

export default function ModalRetiro({ isOpen, onClose, cuenta, onSuccess }) {
  const [monto,       setMonto]       = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sucursal,    setSucursal]    = useState('');
  const [direccion,   setDireccion]   = useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  const reset = () => { setMonto(''); setDescripcion(''); setSucursal(''); setDireccion(''); setError(''); };

  const handleClose = () => { reset(); setSuccess(false); onClose(); };

  const handleSubmit = async () => {
    if (!cuenta)                      { setError('No hay cuenta cargada.'); return; }
    if (!monto || Number(monto) <= 0) { setError('Ingrese un monto válido.'); return; }
    try {
      setLoading(true); setError('');
      await axios.post(`${API_BASE_URL}/api/retiro`, {
        cuenta,
        fecha: new Date().toISOString(),
        tipo: 'retiro',
        monto: Number(monto),
        descripcion,
        sucursal: { sucursal, direccion },
      });
      setSuccess(true);
      onSuccess();
      setTimeout(() => { handleClose(); }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al realizar retiro');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>

      {/* ── Título ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <FaArrowCircleDown className="text-red-400 text-xl" />
        </div>
        <div>
          <h2 className="text-neutral-100 font-semibold text-lg leading-none">Retirar</h2>
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
            <p className="text-neutral-100 font-semibold text-lg">¡Retiro exitoso!</p>
            <p className="text-neutral-400 text-sm mt-1">
              Se retiraron <span className="text-red-400 font-medium">${monto}</span> de la cuenta {cuenta}
            </p>
          </div>
          <p className="text-neutral-600 text-xs">Cerrando automáticamente...</p>
        </div>

      ) : (

        /* ── Formulario ── */
        <div className="space-y-3">
          <Input placeholder="Monto a retirar"       type="number" value={monto}       onChange={(e) => setMonto(e.target.value)} />
          <Input placeholder="Descripción"           value={descripcion}               onChange={(e) => setDescripcion(e.target.value)} />
          <Input placeholder="Sucursal"              value={sucursal}                  onChange={(e) => setSucursal(e.target.value)} />
          <Input placeholder="Dirección de sucursal" value={direccion}                 onChange={(e) => setDireccion(e.target.value)} />

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
              {loading ? 'Procesando...' : 'Confirmar retiro'}
            </Button>
          </div>
        </div>
      )}

    </Modal>
  );
}