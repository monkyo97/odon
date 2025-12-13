import React, { useState } from 'react';
import { Trash2, Edit, Clock, User, Plus, FileText, Copy, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { useTreatments, Treatment } from '../../../../hooks/useTreatments';
import { TreatmentModal } from './TreatmentModal';
import { EditTreatmentModal } from './EditTreatmentModal';
import { TREATMENT_STATUSES, STATUS_LABELS } from '@/constants/odontogram';
import { Notifications } from '@/components/Notifications';
import { useDentists } from '@/hooks/useDentists';

// Import Standard Components
import { FormInput } from '@/components/FormInput';
import { FormSelect } from '@/components/FormSelect';
import { FormDateInput } from '@/components/FormDateInput';

interface TreatmentHistoryProps {
  patientId: string;
  defaultDentistId?: string;
}

export const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ patientId, defaultDentistId }) => {
  // Use Hook with internal filter logic
  const {
    treatments,
    loading,
    totalPages,
    totalCount,
    page,
    setPage,
    formMethods,
    resetFilters,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    duplicateTreatment
  } = useTreatments(patientId);

  const { register, watch, setValue } = formMethods;
  const filters = watch();

  const { dentists } = useDentists();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const handleCreateTreatment = async (treatmentData: Omit<Treatment, 'id' | 'dentist'> & { dentistId?: string }) => {
    try {
      await createTreatment(treatmentData);
      setIsModalOpen(false);
      Notifications.success('Tratamiento creado exitosamente');
    } catch (error) {
      console.error('Error creating treatment:', error);
      Notifications.error('Error al crear el tratamiento');
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
      Notifications.success('Tratamiento actualizado');
    } catch (error) {
      console.error('Error updating treatment:', error);
      Notifications.error('Error al actualizar el tratamiento');
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      try {
        await deleteTreatment(treatmentId);
        Notifications.success('Tratamiento eliminado');
      } catch (error) {
        console.error('Error deleting treatment:', error);
        Notifications.error('Error al eliminar el tratamiento');
      }
    }
  };

  const handleDuplicateTreatment = async (treatment: Treatment) => {
    try {
      await duplicateTreatment(treatment);
      Notifications.success('Tratamiento duplicado correctamente');
    } catch (error) {
      console.error('Error duplicating treatment:', error);
      Notifications.error('Error al duplicar tratamiento');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      [TREATMENT_STATUSES.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
      [TREATMENT_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [TREATMENT_STATUSES.PLANNED]: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  // Convert options for FormSelect
  const statusOptions = [
    { value: TREATMENT_STATUSES.COMPLETED, label: STATUS_LABELS[TREATMENT_STATUSES.COMPLETED] },
    { value: TREATMENT_STATUSES.IN_PROGRESS, label: STATUS_LABELS[TREATMENT_STATUSES.IN_PROGRESS] },
    { value: TREATMENT_STATUSES.PLANNED, label: STATUS_LABELS[TREATMENT_STATUSES.PLANNED] }
  ];

  const dentistOptions = dentists.map(d => ({ value: d.id, label: d.name }));

  const hasActiveFilters = !!(filters.status || filters.dentistId || filters.date || filters.procedure);

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

      {/* Filters Form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">

        <FormSelect
          label="Estado"
          options={statusOptions}
          placeholder="Todos"
          registration={register('status')}
        />

        <FormSelect
          label="Odontólogo"
          options={dentistOptions}
          placeholder="Todos"
          registration={register('dentistId')}
        />

        <FormDateInput
          label="Fecha"
          registration={register('date')}
        />

        <FormInput
          label="Procedimiento"
          placeholder="Buscar..."
          iconLeft={<Search className="h-4 w-4" />}
          iconRight={filters.procedure ? <X className="h-4 w-4" /> : undefined}
          onIconRightClick={() => setValue('procedure', '')}
          registration={register('procedure')}
        />

        {/* Active Filters Summary / Clear Button */}
        {hasActiveFilters && (
          <div className="md:col-span-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-800 flex items-center font-medium"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : treatments.length > 0 ? (
        <>
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section: Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(treatment.status)}`}>
                        {getStatusLabel(treatment.status)}
                      </span>
                      <h4 className="font-semibold text-gray-900 truncate" title={treatment.procedure}>{treatment.procedure}</h4>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {formatDate(treatment.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-1">
                      {(treatment.toothNumber && treatment.toothNumber !== 'General') && (
                        <div className="flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                          <span className="font-medium text-gray-700">Diente {treatment.toothNumber}</span>
                          {treatment.surface && <span className="ml-1 text-gray-500">({treatment.surface})</span>}
                        </div>
                      )}

                      <div className="flex items-center" title="Dentista asignado">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {treatment.dentist}
                      </div>
                    </div>

                    {treatment.notes && (
                      <p className="text-sm text-gray-600 truncate mt-1 pl-1 border-l-2 border-gray-200">
                        {treatment.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Section: Cost & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold text-gray-900 text-lg">
                      {treatment.cost > 0 ? `S/ ${treatment.cost.toFixed(2)}` : 'S/ 0.00'}
                    </span>

                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDuplicateTreatment(treatment)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Duplicar tratamiento"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTreatment(treatment)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTreatment(treatment.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-center mt-6 space-y-2 border-t border-gray-100 pt-6">
            <div className="text-xs text-gray-500">
              {`Total: ${totalCount} • Página ${page} de ${totalPages}`}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No se encontraron tratamientos con los filtros seleccionados.</p>
          <button
            onClick={() => { resetFilters(); setIsModalOpen(true); }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Agregar tratamiento
          </button>
        </div>
      )}

      <TreatmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patientId={patientId}
        onSave={handleCreateTreatment}
        defaultDentistId={defaultDentistId}
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