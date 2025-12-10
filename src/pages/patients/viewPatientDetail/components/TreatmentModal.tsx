import React, { useState } from 'react';
import { X, Save, FileText, DollarSign } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import type { Treatment } from './TreatmentHistory';
import { TREATMENT_STATUSES, STATUS_LABELS, SURFACE_IDS } from '@/constants/odontogram';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSave: (treatmentData: Omit<Treatment, 'id'>) => Promise<void>;
}

export const TreatmentModal: React.FC<TreatmentModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onSave
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    toothNumber: '',
    procedure: '',
    surface: '',
    notes: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    status: TREATMENT_STATUSES.COMPLETED
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        dentist: user?.user_metadata?.name || 'Dr. Usuario',
        notes: formData.notes,
        cost: parseFloat(formData.cost) || 0,
        date: formData.date,
        status: formData.status
      });

      setFormData({
        toothNumber: '',
        procedure: '',
        surface: '',
        notes: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        status: TREATMENT_STATUSES.COMPLETED
      });
    } catch (error) {
      console.error('Error creating treatment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const procedures = [
    'Consulta inicial',
    'Limpieza dental',
    'Empaste/Restauración',
    'Endodoncia',
    'Extracción simple',
    'Extracción quirúrgica',
    'Corona dental',
    'Implante dental',
    'Blanqueamiento',
    'Ortodoncia',
    'Cirugía periodontal',
    'Radiografía',
    'Fluorización',
    'Sellado de fisuras',
    'Prótesis parcial',
    'Prótesis completa',
    'Otro'
  ];

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
                onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar procedimiento</option>
                {procedures.map((procedure) => (
                  <option key={procedure} value={procedure}>{procedure}</option>
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
                Costo (€)
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