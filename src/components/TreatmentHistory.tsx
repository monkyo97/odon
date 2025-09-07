import React from 'react';
import { Clock, User } from 'lucide-react';

interface TreatmentHistoryProps {
  patientId: string;
}

export const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ patientId }) => {
  const treatments = [
    {
      id: '1',
      date: '2025-01-10',
      procedure: 'Restauración con resina compuesta',
      tooth: '36',
      surface: 'Oclusal',
      dentist: 'Dr. María González',
      notes: 'Restauración realizada sin complicaciones. Paciente toleró bien el procedimiento.',
      cost: '75€'
    },
    {
      id: '2',
      date: '2024-12-20',
      procedure: 'Limpieza dental y fluorización',
      tooth: 'General',
      surface: '-',
      dentist: 'Dr. María González',
      notes: 'Limpieza profunda. Se detectó caries en pieza 16. Recomendada revisión en 6 meses.',
      cost: '60€'
    },
    {
      id: '3',
      date: '2024-11-15',
      procedure: 'Radiografía panorámica',
      tooth: 'General',
      surface: '-',
      dentist: 'Dr. María González',
      notes: 'Estudio radiográfico de rutina. Estado general satisfactorio.',
      cost: '35€'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Tratamientos</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Nuevo Tratamiento
        </button>
      </div>

      <div className="space-y-4">
        {treatments.map((treatment) => (
          <div key={treatment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{treatment.procedure}</h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(treatment.date).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {treatment.dentist}
                  </div>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                {treatment.cost}
              </span>
            </div>

            {treatment.tooth !== 'General' && (
              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Pieza dental:</span>
                  <span className="ml-2 font-medium text-gray-900">{treatment.tooth}</span>
                </div>
                <div>
                  <span className="text-gray-500">Superficie:</span>
                  <span className="ml-2 font-medium text-gray-900">{treatment.surface}</span>
                </div>
              </div>
            )}

            <div className="bg-white p-3 rounded border border-gray-100">
              <p className="text-sm text-gray-700">{treatment.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};