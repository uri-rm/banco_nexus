import { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaPlusCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { addDestinyAccount } from '@/api/conf';

export default function ModalAgregarCuenta({ isOpen, onClose, onAdded }) {
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setNumber('');
      setError('');
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleAdd = async () => {
    setError('');
    if (!name.trim()) return setError('Nombre requerido');
    if (!number.trim()) return setError('Número de cuenta requerido');

    setLoading(true);
    try {
      await addDestinyAccount(number.trim(), { name: name.trim() });
      setSuccess(true);
      onAdded?.();
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al agregar la cuenta destino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-sky-500/10 rounded-lg">
          <FaPlusCircle className="text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-neutral-100 font-semibold">Agregar cuenta destino</h2>
          <p className="text-neutral-400 text-xs">Guarda cuentas para depositos rápidos.</p>
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="p-3 bg-green-500/10 rounded-full">
            <FaCheckCircle className="text-green-400 text-3xl" />
          </div>
          <p className="text-neutral-100">Cuenta guardada</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Input label="Nombre" placeholder="Ej. Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Número de cuenta destino" placeholder="1800000123" value={number} onChange={(e) => setNumber(e.target.value)} />

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400">
              <FaExclamationCircle />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="danger" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="success" onClick={handleAdd} disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
