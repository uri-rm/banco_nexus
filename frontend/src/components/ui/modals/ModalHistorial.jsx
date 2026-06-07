import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function ModalHistorial({ isOpen, onClose, userData, datos }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (index) => setExpandedIndex(prev => prev === index ? null : index);

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
          <ul className="max-h-80 overflow-y-auto space-y-2 p-4 rounded">
            {datos.map((tx, index) => {
              const fecha = tx.fecha || tx.date;
              const tipo = tx.tipo || tx.type;
              const monto = tx.monto ?? tx.amount;
              const descripcion = tx.descripcion || tx.description;
              const saldo = tx.saldo ?? tx.balance_after;
              const sucursal = tx.sucursal;
              const isOpen = expandedIndex === index;

              return (
                <li key={index} className="border border-sky-700 rounded text-sm text-neutral-300 overflow-hidden">
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-800 transition duration-75 cursor-pointer text-left"
                  >
                    <span className="flex gap-6">
                      <span>{fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-sky-400">{tipo || 'N/A'}</span>
                      <span className="font-semibold">${monto ?? 'N/A'}</span>
                    </span>
                    {isOpen ? <FaChevronUp className="shrink-0 text-neutral-500" /> : <FaChevronDown className="shrink-0 text-neutral-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-sky-900 space-y-1 text-neutral-400 text-xs">
                      <p><strong className="text-neutral-300">Hora:</strong> {fecha ? new Date(fecha).toLocaleTimeString() : 'N/A'}</p>
                      <p><strong className="text-neutral-300">Descripción:</strong> {descripcion || 'N/A'}</p>
                      <p><strong className="text-neutral-300">Sucursal:</strong> {sucursal?.sucursal ?? 'N/A'}{sucursal?.direccion ? ` - ${sucursal.direccion}` : ''}</p>
                      <p><strong className="text-neutral-300">Saldo tras operación:</strong> ${saldo ?? 'N/A'}</p>
                    </div>
                  )}
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
