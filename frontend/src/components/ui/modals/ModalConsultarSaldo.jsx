import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModalConsultarSaldo({ isOpen, onClose, userData, datos, loading, error, onConsultar, dataGrafico }) {
  useEffect(() => {
    if (!isOpen || !onConsultar) {
      return;
    }
    onConsultar();
  }, [isOpen]);

  const saldoActual = datos?.length > 0 ? datos[datos.length - 1].saldo : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className=" space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-700 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-100">Consultar Saldo</h2>
            {userData?.username && (
              <p className="text-sm text-neutral-400 mt-0.5">{userData.username}</p>
            )}
          </div>
          {saldoActual !== null && (
            <div className="text-right pe-6">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-0.5">Saldo actual</p>
              <p className="text-2xl font-bold text-sky-400">
                ${Number(saldoActual).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
        </div>

        {/* Gráfico */}
        <Card className="bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
          <CardContent className="p-4 ">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4 w-100">Historial de saldo</p>
            {dataGrafico?.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dataGrafico}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2a2a2a" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#525252"
                    tick={{ fill: '#737373', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#e5e5e5',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Saldo']}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    dot={{ fill: '#38bdf8', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex w-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-700 bg-neutral-950/50 text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">Sin historial disponible</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-neutral-700">
          <Button
            onClick={onClose}
            variant="danger"
          >
            Cerrar
          </Button>
        </div>

      </div>
    </Modal>
  );
}