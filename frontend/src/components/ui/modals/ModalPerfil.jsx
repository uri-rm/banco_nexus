import { useEffect, useState } from 'react';
import { getMe, updateMe } from '@/api/conf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { FaCheckCircle, FaExclamationCircle, FaUserEdit } from 'react-icons/fa';

export default function ModalPerfil({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setAccountNumber('');
    setBalance(null);
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMe();
        const user = response.data;
        setUsername(user.username || '');
        setEmail(user.email || '');
        setAccountNumber(user.number || '');
        setBalance(user.balance ?? 0);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'No se pudieron cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (!email.trim()) {
      setError('El correo es obligatorio.');
      return;
    }

    const payload = {
      username: username.trim(),
      email: email.trim(),
    };

    if (password.trim()) {
      payload.password = password;
    }

    setLoading(true);
    setError('');

    try {
      await updateMe(payload);
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => { handleClose(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al actualizar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <FaUserEdit className="text-yellow-400 text-xl" />
        </div>
        <div>
          <h2 className="text-neutral-100 font-semibold text-lg leading-none">Datos generales</h2>
          <p className="text-neutral-500 text-xs mt-1">Consulta y actualiza tu nombre, correo o contraseña.</p>
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="p-4 bg-green-500/10 rounded-full">
            <FaCheckCircle className="text-green-400 text-5xl" />
          </div>
          <div className="text-center">
            <p className="text-neutral-100 font-semibold text-lg">Datos actualizados</p>
            <p className="text-neutral-400 text-sm mt-1">Tus cambios se guardaron correctamente.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading && (
            <div className="rounded border border-sky-700 bg-sky-900/40 p-3 text-sm text-sky-200">
              Cargando datos del perfil...
            </div>
          )}

          <div className="grid gap-3">
            <Input label="Número de cuenta" value={accountNumber} disabled />
            <Input label="Saldo actual" value={`$${balance ?? 0}`} disabled />
            <Input label="Nombre" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Contraseña nueva" type="password" placeholder="Déjalo en blanco para mantener la misma" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <FaExclamationCircle className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="danger" onClick={handleClose} disabled={loading}>Cerrar</Button>
            <Button variant="success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar datos'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
