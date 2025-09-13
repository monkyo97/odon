import React, { useState } from 'react';
import { ToothSVG } from './ToothSVG';
import { ConditionModal } from './ConditionModal';
import { EditConditionModal } from './EditConditionModal';
import { OdontogramLegend } from './OdontogramLegend';
import { OdontogramNotes } from './OdontogramNotes';
import { useToothConditions } from '../hooks/useToothConditions';
import { Edit, Trash2, Plus, FileText, AlertCircle } from 'lucide-react';

export interface ToothCondition {
  id: string;
  toothNumber: number;
  surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal' | 'completa';
  condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura' | 'ausente' | 'puente' | 'carilla' | 'infeccion_apical' | 'reconstruccion_defectuosa';
  status: 'planificado' | 'en_proceso' | 'completado';
  notes: string;
  date: string;
  severity?: 'leve' | 'moderado' | 'severo';
  material?: string;
}

interface OdontogramProps {
  patientId: string;
}

export const Odontogram: React.FC<OdontogramProps> = ({ patientId }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition | null>(null);
  const [activeView, setActiveView] = useState<'visual' | 'list' | 'notes'>('visual');
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
      fractura: 'Fractura',
      ausente: 'Ausente',
      puente: 'Puente',
      carilla: 'Carilla',
      infeccion_apical: 'Infección Apical',
      reconstruccion_defectuosa: 'Reconstrucción Defectuosa'
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
      incisal: 'Incisal',
      completa: 'Completa'
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

  const getSeverityColor = (severity?: string) => {
    const colors = {
      leve: 'bg-yellow-100 text-yellow-800',
      moderado: 'bg-orange-100 text-orange-800',
      severo: 'bg-red-100 text-red-800'
    };
    return severity ? colors[severity as keyof typeof colors] : '';
  };

  // Statistics
  const totalConditions = conditions.length;
  const completedTreatments = conditions.filter(c => c.status === 'completado').length;
  const pendingTreatments = conditions.filter(c => c.status !== 'completado').length;
  const urgentConditions = conditions.filter(c => 
    c.condition === 'caries' || c.condition === 'infeccion_apical' || c.condition === 'fractura'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Odontograma Digital</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Total: </span>
              <span className="font-semibold text-gray-900">{totalConditions}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Completados: </span>
              <span className="font-semibold text-green-600">{completedTreatments}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Pendientes: </span>
              <span className="font-semibold text-blue-600">{pendingTreatments}</span>
            </div>
            {urgentConditions > 0 && (
              <div className="text-sm flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-gray-600">Urgentes: </span>
                <span className="font-semibold text-red-600">{urgentConditions}</span>
              </div>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveView('visual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'visual' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vista Visual
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lista Detallada
          </button>
          <button
            onClick={() => setActiveView('notes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'notes' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Observaciones
          </button>
        </div>

        {/* Visual Odontogram */}
        {activeView === 'visual' && (
          <div className="space-y-6">
            <OdontogramLegend />
            
            <div className="bg-gray-50 rounded-xl p-8">
              {/* Upper Teeth */}
              <div className="mb-12">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Arcada Superior</h4>
                </div>
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
              <div className="border-t border-gray-300 my-8 relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-4">
                  <span className="text-xs text-gray-500">Línea Media</span>
                </div>
              </div>

              {/* Lower Teeth */}
              <div>
                <div className="flex justify-center space-x-2 text-xs text-gray-500 mb-2">
                  {lowerTeeth.map((toothNumber) => (
                    <div key={toothNumber} className="w-12 text-center">
                      {toothNumber}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-start space-x-2 mb-4">
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
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700">Arcada Inferior</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : conditions.length > 0 ? (
              <div className="space-y-3">
                {conditions
                  .sort((a, b) => a.toothNumber - b.toothNumber)
                  .map((condition) => (
                  <div key={condition.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded">
                          Pieza {condition.toothNumber}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700 font-medium">{getConditionLabel(condition.condition)}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700">{getSurfaceLabel(condition.surface)}</span>
                        {condition.severity && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                              {condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          condition.status === 'completado' ? 'bg-green-100 text-green-800' :
                          condition.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusLabel(condition.status)}
                        </span>
                        <span>{new Date(condition.date).toLocaleDateString('es-ES')}</span>
                        {condition.material && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            {condition.material}
                          </span>
                        )}
                      </div>
                      
                      {condition.notes && (
                        <p className="text-sm text-gray-600 bg-white p-2 rounded border">{condition.notes}</p>
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
        )}

        {/* Notes View */}
        {activeView === 'notes' && (
          <OdontogramNotes patientId={patientId} />
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