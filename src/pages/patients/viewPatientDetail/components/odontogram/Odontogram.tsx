// src/components/odontogram/Odontogram.tsx
import React, { useState } from 'react';
import { UPPER_FDI, LOWER_FDI, STATUS_FLOW } from '@constants/odontogram';
import { useParams } from 'react-router-dom';
import { useToothConditions } from '@hooks/useToothConditions';
import { useOdontogramState } from '@hooks/useOdontogramState';
import { Notifications } from '@components/Notifications';
import { Tooth } from './Tooth';
import { DiagnosticModal } from './DiagnosticModal';
import { OdontogramSidebar } from './OdontogramSidebar';
import { Loader2 } from 'lucide-react';

export const Odontogram: React.FC = () => {
  const { id: patientId } = useParams<{ id: string }>();
  const { conditions, loading, createCondition, refetch } = useToothConditions(patientId);
  const { selectedTooth, setSelectedTooth, resetSelection } = useOdontogramState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTreatment, setPendingTreatment] = useState<string | null>(null);

  const handleToothClick = (n: number) => {
    setSelectedTooth(n);
    setIsModalOpen(true);
  };

  const onPickTreatment = (name: string) => {
    setPendingTreatment(name);
    if (!selectedTooth) setIsModalOpen(true);
  };

  const handleSave = async (form: any) => {
    try {
      for (const surface of form.surfaces) {
        await createCondition.mutateAsync({
          patient_id: patientId!,
          tooth_number: form.toothNumber,
          surface,
          condition: pendingTreatment || form.condition,
          status_tooth_conditions: form.status,
          notes: form.notes,
          date: new Date().toISOString().slice(0,10),
        });
      }
      Notifications.success('Diagnóstico guardado');
      setIsModalOpen(false);
      setPendingTreatment(null);
      resetSelection();
      await refetch();
    } catch (e: any) {
      Notifications.error(e.message ?? 'Error guardando diagnóstico');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,20rem] gap-4">
      <div className="bg-white border rounded-xl p-4 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Odontograma Internacional FDI</h3>
          <div className="text-sm text-gray-500">
            Completados:
            <span className="ml-1 text-green-600 font-medium">
              {conditions.filter(c => c.status_tooth_conditions==='completado').length}
            </span>
            {' '}• Pendientes:
            <span className="ml-1 text-yellow-600 font-medium">
              {conditions.filter(c => c.status_tooth_conditions!=='completado').length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cargando…
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px] mx-auto space-y-4">
              <p className="text-center text-gray-600">Arcada Superior</p>
              <div className="flex justify-center flex-wrap gap-3">
                {UPPER_FDI.map(n => (
                  <Tooth
                    key={n}
                    number={n}
                    conditions={conditions.filter(c => c.tooth_number === n)}
                    selected={selectedTooth === n}
                    onClick={() => handleToothClick(n)}
                  />
                ))}
              </div>

              <p className="text-center text-gray-400 text-sm">Línea Media</p>

              <p className="text-center text-gray-600">Arcada Inferior</p>
              <div className="flex justify-center flex-wrap gap-3">
                {LOWER_FDI.map(n => (
                  <Tooth
                    key={n}
                    number={n}
                    conditions={conditions.filter(c => c.tooth_number === n)}
                    selected={selectedTooth === n}
                    onClick={() => handleToothClick(n)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* leyenda simple */}
        <div className="border-t pt-3 text-xs text-gray-600 flex gap-4 flex-wrap">
          {STATUS_FLOW.map(s => (
            <span key={s.value} className="inline-flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <OdontogramSidebar onPickTreatment={onPickTreatment} />

      {isModalOpen && selectedTooth && (
        <DiagnosticModal
          isOpen
          toothNumber={selectedTooth}
          onClose={() => { setIsModalOpen(false); }}
          onSave={handleSave}
          defaultSurfaces={['oclusal']}
        />
      )}
    </div>
  );
};
