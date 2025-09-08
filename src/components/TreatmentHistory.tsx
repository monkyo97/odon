import React, { useState } from 'react';
import { Clock, User, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useTreatments } from '../hooks/useTreatments';
import { TreatmentModal } from './TreatmentModal';
import { EditTreatmentModal } from './EditTreatmentModal';

interface TreatmentHistoryProps {
  patientId: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  toothNumber: string;
  procedure: string;
  surface: string;
  dentist: string;
  notes: string;
  cost: number;
  date: string;
  status: 'completed' | 'in_progress' | 'planned';
}

export const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ patientId }) => {
  const { treatments, loading, createTreatment, updateTreatment, deleteTreatment } = useTreatments(patientId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const handleCreateTreatment = async (treatmentData: Omit<Treatment, 'id'>) => {
    try {
      await createTreatment(treatmentData);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating treatment:', error);
      alert('Error al crear el tratamiento');
    }
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsEditModalOpen(true);
  };

  const handleUpdateTreatment = async (updatedTreatment: Treatment) => {
    try {
      await updateTreatment(updatedTreatment.id, updatedTreatment);
      setIsEditModalOpen(false);
      setSelectedTreatment(null);
    } catch (error) {
      console.error('Error updating treatment:', error);
      alert('Error al actualizar el tratamiento');
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      try {
        await deleteTreatment(treatmentId);
      } catch (error) {
        console.error('Error deleting treatment:', error);
        alert('Error al eliminar el tratamiento');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      planned: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Completado',
      in_progress: 'En Proceso',
      planned: 'Planificado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Tratamientos</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tratamiento
        </button>
      </div>

      {treatments.length > 0 ? (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{treatment.procedure}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                      {getStatusLabel(treatment.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(treatment.date).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {treatment.dentist}
                    </div>
                  </div>

                  {treatment.toothNumber && treatment.toothNumber !== 'General' && (
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Pieza dental:</span>
                        <span className="ml-2 font-medium text-gray-900">{treatment.toothNumber}</span>
                      </div>
                      {treatment.surface && (
                        <div>
                          <span className="text-gray-500">Superficie:</span>
                          <span className="ml-2 font-medium text-gray-900">{treatment.surface}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {treatment.notes && (
                    <div className="bg-white p-3 rounded border border-gray-100 mb-2">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-sm text-gray-700">{treatment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                    {treatment.cost > 0 ? `${treatment.cost}€` : 'Sin costo'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleEditTreatment(treatment)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteTreatment(treatment.id)}
                  className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay tratamientos registrados</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Agregar primer tratamiento
          </button>
        </div>
      )}

      <TreatmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId}
        onSave={handleCreateTreatment}
      />

      <EditTreatmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTreatment(null);
        }}
        treatment={selectedTreatment}
        onSave={handleUpdateTreatment}
      />
    </div>
  );
};