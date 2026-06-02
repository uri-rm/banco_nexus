import { useEffect, useState } from 'react';
import { createTransaction, getDestinyAccounts } from '@/api/conf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { FaExchangeAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function ModalTransferencia({ isOpen, onClose, onSuccess, sourceAccount, destinyReload }) {
  const [destinyAccount, setDestinyAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [destinyAccounts, setDestinyAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDestinyAccounts = async () => {
        try {
            const response = await getDestinyAccounts();
            console.log('Cuentas destino cargadas:', response.data);
            setDestinyAccounts(response.data || []);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Error al cargar las cuentas destino.');
        }
    };

    loadDestinyAccounts();
  }, [isOpen]);

  const reset = () => {
    setDestinyAccount('');
    setAmount('');
    setDescription('');
    setDestinyAccounts([]);
    setError('');
    setSuccess(false);
    setAccountsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    if (!destinyAccount.trim()) {
      setError('Ingrese un número de cuenta válido.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Ingrese un monto mayor a cero.');
      return;
    }
    if (destinyAccount.trim() === sourceAccount) {
      setError('No puede transferir a la misma cuenta.');
      return;
    }

    setLoading(true);
    try {
      await createTransaction(destinyAccount.trim(), {
        type: 'deposit',
        amount: Number(amount),
        description: description.trim() || 'Transferencia',
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al enviar la transferencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadDestinyAccounts = async () => {
      setAccountsLoading(true);
      try {
        const response = await getDestinyAccounts();
        const accounts = response.data || [];
        setDestinyAccounts(accounts);
        if (accounts.length > 0) {
          setDestinyAccount(accounts[0].number_user);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'No se pudieron cargar las cuentas destino.');
        setDestinyAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    };

    loadDestinyAccounts();
  }, [isOpen, destinyReload]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-sky-500/10 rounded-lg">
          <FaExchangeAlt className="text-sky-400 text-xl" />
        </div>
        <div>
          <h2 className="text-neutral-100 font-semibold text-lg leading-none">Transferir a otra cuenta</h2>
          <p className="text-neutral-500 text-xs mt-1">Cuenta origen: {sourceAccount || 'No disponible'}</p>
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="p-4 bg-green-500/10 rounded-full">
            <FaCheckCircle className="text-green-400 text-5xl" />
          </div>
          <div className="text-center">
            <p className="text-neutral-100 font-semibold text-lg">¡Transferencia enviada!</p>
            <p className="text-neutral-400 text-sm mt-1">La transferencia se procesó correctamente.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {accountsLoading ? (
            <p className="text-sm text-neutral-400">Cargando cuentas destino...</p>
          ) : destinyAccounts.length > 0 ? (
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Cuenta destino</label>
              <select
                className="w-full px-3 py-2 rounded-md text-sm bg-gray-800 text-neutral-100 border border-neutral-700 outline-none transition-all duration-200 placeholder:text-neutral-500 hover:border-sky-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-neutral-900"
                value={destinyAccount}
                onChange={(e) => setDestinyAccount(e.target.value)}
              >
                <option value="">Selecciona una cuenta destino</option>
                {destinyAccounts.map((account) => (
                  <option key={account.number_user} value={account.number_user}>
                    {account.name} — {account.number_user}
                  </option>
                ))}
              </select>

              <Input
                    label="Monto"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                    label="Descripción"
                    placeholder="Concepto de la transferencia"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                    <FaExclamationCircle className="shrink-0" />
                    <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-1">
                    <Button variant="danger" onClick={handleClose} disabled={loading}>Cancelar</Button>
                    <Button variant="success" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar transferencia'}
                    </Button>
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-neutral-400 text-sm">No tienes cuentas destino agregadas.</p>
                <p className="text-neutral-500 text-xs">Ve a <strong className="text-sky-400">Agregar destino</strong> para añadir una cuenta.</p>
            </div>
          )}
         

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="danger" onClick={handleClose} disabled={loading}>Cerrar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
