import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function ModalConsultarSaldo({ isOpen, onClose, userData, datos, loading, error, onConsultar, dataGrafico }) {
  const [cuentaLocal, setCuentaLocal] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} className=" text-neutral-100" size="lg">
      <h2 className="text-lg font-semibold mb-4">Consultar Saldo</h2>
      <div className="space-y-3">
        
        {userData?.nombre && (
          <div className="mt-4 p-3 rounded border border-sky-700">
            <p className="text-neutral-200"><strong>Cliente:</strong> {userData.nombre}</p>
            {datos.length > 0 && (
              <p className="text-neutral-200"><strong>Saldo actual:</strong> ${datos[datos.length - 1].saldo}</p>
            )}
          </div>
        )}

         <Card className="border border-sky-700 p-4 rounded mx-4">
                      <CardContent>
                        <p className='mb-2 text-neutral-200'><strong>{userData?.nombre}</strong></p>
                        <LineChart width={500} height={300} data={dataGrafico}>
                          <Line type="monotone" dataKey="saldo" stroke="#38bdf8" />
                          <CartesianGrid stroke="#404040" />
                          <XAxis dataKey="fecha" stroke="#737373" />
                          <YAxis stroke="#737373" />
                          <Tooltip contentStyle={{ backgroundColor: '#262626', border: 'none', color: '#e5e5e5' }} />
                        </LineChart>
                      </CardContent>
                    </Card>
      </div>
    </Modal>
  );
}