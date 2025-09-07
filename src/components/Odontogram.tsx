import React, { useState } from 'react';
import { ToothSVG } from './ToothSVG';
import { ConditionModal } from './ConditionModal';
import { useToothConditions } from '../hooks/useToothConditions';

export interface ToothCondition {
  id: string;
  toothNumber: number;
  surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal';
  condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura';
  status: 'planificado' | 'en_proceso' | 'completado';
  notes: string;
  date: string;
}

interface OdontogramProps {
  patientId: string;
}

export const Odontogram: React.FC<OdontogramProps> = ({ patientId }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { conditions, loading, createCondition } = useToothConditions(patientId);

  // Adult teeth numbering (FDI notation)
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    setIsModalOpen(true);
  };

  const getToothConditions = (toothNumber: number) => {
    return conditions.filter(condition => condition.toothNumber === toothNumber);
  };

  const handleAddCondition = async (condition: ToothCondition) => {
    await createCondition(condition);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Odontograma Interactivo</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Caries</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Restauración</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Corona</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Endodoncia</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-8">
        {/* Upper Teeth */}
        <div className="mb-12">
          <div className="flex justify-center items-end space-x-2 mb-2">
            {upperTeeth.map((toothNumber) => (
              <ToothSVG
                key={toothNumber}
                toothNumber={toothNumber}
                conditions={getToothConditions(toothNumber)}
                onClick={() => handleToothClick(toothNumber)}
                isUpper={true}
              />
            ))}
          </div>
          <div className="flex justify-center space-x-2 text-xs text-gray-500">
            {upperTeeth.map((toothNumber) => (
              <div key={toothNumber} className="w-12 text-center">
                {toothNumber}
              </div>
            ))}
          </div>
        </div>

        {/* Dental Arch Separator */}
        <div className="border-t border-gray-300 my-8"></div>

        {/* Lower Teeth */}
        <div>
          <div className="flex justify-center space-x-2 text-xs text-gray-500 mb-2">
            {lowerTeeth.map((toothNumber) => (
              <div key={toothNumber} className="w-12 text-center">
                {toothNumber}
              </div>
            ))}
          </div>
          <div className="flex justify-center items-start space-x-2">
            {lowerTeeth.map((toothNumber) => (
              <ToothSVG
                key={toothNumber}
                toothNumber={toothNumber}
                conditions={getToothConditions(toothNumber)}
                onClick={() => handleToothClick(toothNumber)}
                isUpper={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Conditions Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Condiciones Registradas</h4>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : conditions.length > 0 ? (
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Pieza {condition.toothNumber}</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-700 capitalize">{condition.surface}</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-700 capitalize">{condition.condition}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  condition.status === 'completado' ? 'bg-green-100 text-green-800' :
                  condition.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {condition.status === 'completado' ? 'Completado' :
                   condition.status === 'en_proceso' ? 'En Proceso' : 'Planificado'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay condiciones registradas</p>
        )}
      </div>

      <ConditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toothNumber={selectedTooth}
        onSave={handleAddCondition}
      />
    </div>
  );
};