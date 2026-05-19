import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';

export default function ModalHistorial({ isOpen, onClose, userData, datos }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <h2 className="text-lg font-semibold mb-4">Historial de transacciones</h2>
      {datos.length === 0 ? (
        <p className="text-neutral-400 text-sm">No hay transacciones para mostrar.</p>
      ) : (
        <>
          <p className="text-sm text-neutral-400 mb-3">
            Cliente: <strong className="text-neutral-200">{userData?.nombre}</strong>
          </p>
          <ul className="max-h-80 overflow-y-auto space-y-2 p-4  rounded">
            {datos.map((tx, index) => (
              <li key={index} className="p-3 border border-sky-700 w-120 rounded text-sm text-neutral-300 
              hover:bg-gray-800 transition duration-75 cursor-pointer">
                <p><strong>Fecha:</strong>       {new Date(tx.fecha).toLocaleString()}</p>
                <p><strong>Tipo:</strong>        {tx.tipo}</p>
                <p><strong>Monto:</strong>       ${tx.monto}</p>
                <p><strong>Descripción:</strong> {tx.descripcion}</p>
                <p><strong>Sucursal:</strong>    {tx.sucursal?.sucursal} - {tx.sucursal?.direccion}</p>
                <p><strong>Saldo:</strong>       ${tx.saldo}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="flex justify-end mt-4">
        <Button variant='danger' onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
}