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
            Cliente: <strong className="text-neutral-200">{userData?.username || userData?.nombre}</strong>
          </p>
          <ul className="max-h-80 overflow-y-auto space-y-2 p-4  rounded">
            {datos.map((tx, index) => {
              const fecha = tx.fecha || tx.date;
              const tipo = tx.tipo || tx.type;
              const monto = tx.monto ?? tx.amount;
              const descripcion = tx.descripcion || tx.description;
              const saldo = tx.saldo ?? tx.balance_after;
              const sucursal = tx.sucursal;

              return (
                <li key={index} className="p-3 border border-sky-700 w-120 rounded text-sm text-neutral-300 
              hover:bg-gray-800 transition duration-75 cursor-pointer">
                  <p><strong>Fecha:</strong>       {fecha ? new Date(fecha).toLocaleString() : 'N/A'}</p>
                  <p><strong>Tipo:</strong>        {tipo || 'N/A'}</p>
                  <p><strong>Monto:</strong>       ${monto ?? 'N/A'}</p>
                  <p><strong>Descripción:</strong> {descripcion || 'N/A'}</p>
                  <p><strong>Sucursal:</strong>    {sucursal?.sucursal ?? 'N/A'}{sucursal?.direccion ? ` - ${sucursal.direccion}` : ''}</p>
                  <p><strong>Saldo:</strong>       ${saldo ?? 'N/A'}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <div className="flex justify-end mt-4">
        <Button variant='danger' onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
}