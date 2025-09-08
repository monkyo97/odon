import React, { useState } from 'react';
import { ToothSVG } from './ToothSVG';
import { ConditionModal } from './ConditionModal';
import { EditConditionModal } from './EditConditionModal';
import { useToothConditions } from '../hooks/useToothConditions';
import { Edit, Trash2, Plus } from 'lucide-react';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition | null>(null);
  const { conditions, loading, createCondition, updateCondition, deleteCondition } = useToothConditions(patientId);

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
    try {
      await createCondition(condition);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding condition:', error);
      alert('Error al agregar la condición');
    }
  };

  const handleEditCondition = (condition: ToothCondition) => {
    setSelectedCondition(condition);
    setIsEditModalOpen(true);
  };

  const handleUpdateCondition = async (updatedCondition: ToothCondition) => {
    try {
      await updateCondition(updatedCondition.id, updatedCondition);
      setIsEditModalOpen(false);
      setSelectedCondition(null);
    } catch (error) {
      console.error('Error updating condition:', error);
      alert('Error al actualizar la condición');
    }
  };

  const handleDeleteCondition = async (conditionId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta condición?')) {
      try {
        await deleteCondition(conditionId);
      } catch (error) {
        console.error('Error deleting condition:', error);
        alert('Error al eliminar la condición');
      }
    }
  };

  const getConditionLabel = (condition: string) => {
    const labels = {
      caries: 'Caries',
      restauracion: 'Restauración',
      corona: 'Corona',
      endodoncia: 'Endodoncia',
      extraccion: 'Extracción',
      implante: 'Implante',
      fractura: 'Fractura'
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  const getSurfaceLabel = (surface: string) => {
    const labels = {
      oclusal: 'Oclusal',
      vestibular: 'Vestibular',
      lingual: 'Lingual',
      mesial: 'Mesial',
      distal: 'Distal',
      incisal: 'Incisal'
    };
    return labels[surface as keyof typeof labels] || surface;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planificado: 'Planificado',
      en_proceso: 'En Proceso',
      completado: 'Completado'
    };
    return labels[status as keyof typeof labels] || status;
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Condiciones Registradas</h4>
          <span className="text-sm text-gray-500">
            {conditions.length} condición{conditions.length !== 1 ? 'es' : ''}
          </span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : conditions.length > 0 ? (
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div key={condition.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">Pieza {condition.toothNumber}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-700">{getSurfaceLabel(condition.surface)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-700">{getConditionLabel(condition.condition)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      condition.status === 'completado' ? 'bg-green-100 text-green-800' :
                      condition.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(condition.status)}
                    </span>
                    <span>{new Date(condition.date).toLocaleDateString('es-ES')}</span>
                  </div>
                  
                  {condition.notes && (
                    <p className="text-sm text-gray-600 mt-2">{condition.notes}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditCondition(condition)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar condición"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCondition(condition.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar condición"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-2">No hay condiciones registradas</p>
            <p className="text-sm text-gray-400">Haz clic en cualquier diente para agregar una condición</p>
          </div>
        )}
      </div>

      <ConditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toothNumber={selectedTooth}
        onSave={handleAddCondition}
      />

      <EditConditionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCondition(null);
        }}
        condition={selectedCondition}
        onSave={handleUpdateCondition}
      />
    </div>
  );
};