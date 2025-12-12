import React, { useState, useEffect } from 'react';
import { X, Save, FileText, DollarSign, Clock, User } from 'lucide-react';

import { useDentists } from '../../../../hooks/useDentists';
import { useTreatmentCatalog } from '@/hooks/useTreatmentCatalog';
import type { Treatment } from './TreatmentHistory';
import { TREATMENT_STATUSES, STATUS_LABELS, SURFACE_IDS } from '@/constants/odontogram';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSave: (treatmentData: Omit<Treatment, 'id' | 'dentist'> & { dentistId?: string }) => Promise<void>;
  initialData?: Partial<Treatment>; // To pre-fill from Odontogram
  defaultDentistId?: string; // Explicit default
}

export const TreatmentModal: React.FC<TreatmentModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSave,
  initialData,
  defaultDentistId
}) => {
  const { dentists } = useDentists();
  const { catalog, getCostForTreatment, loading: loadingCatalog } = useTreatmentCatalog();

  const [formData, setFormData] = useState({
    toothNumber: '',
    procedure: '',
    surface: '',
    notes: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    status: TREATMENT_STATUSES.PLANNED,
    duration: '',
    materials: '',
    complications: '',
    followUpDate: '',
    dentistId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initialData or defaults when opening
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(prev => ({
          ...prev,
          toothNumber: initialData.toothNumber || '',
          procedure: initialData.procedure || '',
          surface: initialData.surface || '',
          notes: initialData.notes || '',
          cost: initialData.cost ? initialData.cost.toString() : '',
          // Priority: initialData > defaultDentistId
          dentistId: initialData.dentistId || defaultDentistId || '',
          date: initialData.date || new Date().toISOString().split('T')[0],
          status: (initialData.status as any) || TREATMENT_STATUSES.PLANNED,
        }));
      } else {
        // Reset if no initial data (clean slate) - Use defaultDentistId
        setFormData({
          toothNumber: '',
          procedure: '',
          surface: '',
          notes: '',
          cost: '',
          date: new Date().toISOString().split('T')[0],
          status: TREATMENT_STATUSES.PLANNED,
          duration: '',
          materials: '',
          complications: '',
          followUpDate: '',
          dentistId: defaultDentistId || ''
        });
      }
    }
  }, [isOpen, initialData, defaultDentistId]);

  // Set default dentist when dentists are loaded (fallback if still empty)
  useEffect(() => {
    if (dentists.length > 0 && !formData.dentistId && !initialData?.dentistId && !defaultDentistId) {
      setFormData(prev => ({ ...prev, dentistId: dentists[0].id }));
    }
  }, [dentists, formData.dentistId, initialData, defaultDentistId]);

  // Update cost when procedure changes
  useEffect(() => {
    // Only auto-update cost if user hasn't typed a cost manually?
    // Requirement: "Al crear un tratamiento nuevo: El costo configurado debe cargarse automáticamente."
    // If we are opening with initialData (e.g. from Odontogram), cost might be 0 or set.
    // If user *changes* procedure, we should update cost.
    if (formData.procedure && catalog.length > 0) {
      // Check if the current cost matches the initial/previous procedure cost or is empty?
      // Simplest behavior: IF procedure changes, update cost.
      // We need to know if this useEffect is triggered by user change or initial load.
      // For now, let's just update cost if the field is empty or if we want to force it.
      // Better UX: Update cost only if it's empty OR if the user explicitly changed the procedure dropdown.
      // To track "user changed", we could use the onChange handler directly instead of useEffect.
      // I will move cost update logic to onChange handler.
    }
  }, [formData.procedure]);
  // Commented out to move logic to onChange

  const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProcedure = e.target.value;
    const defaultCost = getCostForTreatment(newProcedure);
    setFormData(prev => ({
      ...prev,
      procedure: newProcedure,
      cost: defaultCost > 0 ? defaultCost.toString() : prev.cost // Update cost if we found a default
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        patientId,
        toothNumber: formData.toothNumber,
        procedure: formData.procedure,
        surface: formData.surface,
        dentistId: formData.dentistId,
        notes: formData.notes,
        cost: parseFloat(formData.cost) || 0,
        date: formData.date,
        status: formData.status as any,
        duration: parseInt(formData.duration) || 0,
        materials: formData.materials,
        complications: formData.complications,
        followUpDate: formData.followUpDate || undefined
      });
      onClose(); // Close on success
    } catch (error) {
      console.error('Error creating treatment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const surfaces = [
    { value: '', label: 'No aplica' },
    { value: SURFACE_IDS.OCCLUSAL, label: 'Oclusal' },
    { value: SURFACE_IDS.VESTIBULAR, label: 'Vestibular' },
    { value: SURFACE_IDS.LINGUAL, label: 'Lingual' },
    { value: SURFACE_IDS.MESIAL, label: 'Mesial' },
    { value: SURFACE_IDS.DISTAL, label: 'Distal' },
    { value: SURFACE_IDS.INCISAL, label: 'Incisal' },
    { value: 'Múltiples', label: 'Múltiples superficies' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Tratamiento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedimiento *
              </label>
              <select
                value={formData.procedure}
                onChange={handleProcedureChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loadingCatalog}
              >
                <option value="">Seleccionar procedimiento</option>
                {catalog.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={TREATMENT_STATUSES.COMPLETED}>{STATUS_LABELS[TREATMENT_STATUSES.COMPLETED]}</option>
                <option value={TREATMENT_STATUSES.IN_PROGRESS}>{STATUS_LABELS[TREATMENT_STATUSES.IN_PROGRESS]}</option>
                <option value={TREATMENT_STATUSES.PLANNED}>{STATUS_LABELS[TREATMENT_STATUSES.PLANNED]}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pieza dental
              </label>
              <input
                type="text"
                value={formData.toothNumber}
                onChange={(e) => setFormData({ ...formData, toothNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 16, 21, General"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superficie
              </label>
              <select
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {surfaces.map((surface) => (
                  <option key={surface.value} value={surface.value}>{surface.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dentista
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={formData.dentistId}
                  onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar dentista</option>
                  {dentists.map((dentist) => (
                    <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo / Importe (€)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (min)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Seguimiento
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Full width inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materiales usados
            </label>
            <input
              type="text"
              value={formData.materials}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Resina A2, Anestesia..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complicaciones
            </label>
            <textarea
              value={formData.complications}
              onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Complicaciones durante el procedimiento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas del tratamiento
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detalles del procedimiento, observaciones, recomendaciones..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Tratamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};