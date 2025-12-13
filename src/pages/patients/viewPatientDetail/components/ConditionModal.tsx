import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { ToothCondition } from './odontogram/Odontogram';
import { FormDateInput } from '@/components/FormDateInput';

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothNumber: number | null;
  onSave: (condition: ToothCondition) => void;
}

export const ConditionModal: React.FC<ConditionModalProps> = ({
  isOpen,
  onClose,
  toothNumber,
  onSave
}) => {
  const [formData, setFormData] = useState({
    surface: 'oclusal' as const,
    condition: 'caries' as const,
    status: 'planificado' as const,
    notes: '',
    date: new Date().toISOString().split('T')[0],
    severity: 'moderado' as const,
    material: ''
  });

  if (!isOpen || !toothNumber) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: '',
      toothNumber,
      ...formData
    });
    setFormData({
      surface: 'oclusal',
      condition: 'caries',
      status: 'planificado',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      severity: 'moderado',
      material: ''
    });
  };

  const surfaces = [
    { value: 'oclusal', label: 'Oclusal' },
    { value: 'vestibular', label: 'Vestibular' },
    { value: 'lingual', label: 'Lingual' },
    { value: 'mesial', label: 'Mesial' },
    { value: 'distal', label: 'Distal' },
    { value: 'incisal', label: 'Incisal' },
    { value: 'completa', label: 'Completa' }
  ];

  const conditions = [
    { value: 'caries', label: 'Caries', color: '#EF4444' },
    { value: 'restauracion', label: 'Restauración', color: '#3B82F6' },
    { value: 'corona', label: 'Corona', color: '#F59E0B' },
    { value: 'endodoncia', label: 'Endodoncia', color: '#8B5CF6' },
    { value: 'extraccion', label: 'Extracción', color: '#6B7280' },
    { value: 'implante', label: 'Implante', color: '#10B981' },
    { value: 'fractura', label: 'Fractura', color: '#F97316' },
    { value: 'ausente', label: 'Ausente', color: '#6B7280' },
    { value: 'puente', label: 'Puente', color: '#EC4899' },
    { value: 'carilla', label: 'Carilla', color: '#06B6D4' },
    { value: 'infeccion_apical', label: 'Infección Apical', color: '#DC2626' },
    { value: 'reconstruccion_defectuosa', label: 'Reconstrucción Defectuosa', color: '#7C2D12' }
  ];

  const statuses = [
    { value: 'planificado', label: 'Planificado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' }
  ];

  const severities = [
    { value: 'leve', label: 'Leve', color: '#FEF3C7' },
    { value: 'moderado', label: 'Moderado', color: '#FED7AA' },
    { value: 'severo', label: 'Severo', color: '#FECACA' }
  ];

  const materials = [
    'Amalgama',
    'Resina compuesta',
    'Porcelana',
    'Oro',
    'Titanio',
    'Zirconia',
    'Cerámica',
    'Composite',
    'Ionómero de vidrio',
    'Otro'
  ];

  const needsMaterial = ['restauracion', 'corona', 'implante', 'puente', 'carilla'].includes(formData.condition);
  const needsSeverity = ['caries', 'fractura', 'infeccion_apical', 'reconstruccion_defectuosa'].includes(formData.condition);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Registrar Condición - Pieza Dental {toothNumber}
          </h3>
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
                Condición/Tratamiento *
              </label>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <label key={condition.value} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: condition.color }}
                      ></div>
                      <span className="text-sm">{condition.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Superficie Afectada *
                </label>
                <select
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {surfaces.map((surface) => (
                    <option key={surface.value} value={surface.value}>
                      {surface.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Tratamiento *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {needsSeverity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severidad
                  </label>
                  <div className="space-y-2">
                    {severities.map((severity) => (
                      <label key={severity.value} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="severity"
                          value={severity.value}
                          checked={formData.severity === severity.value}
                          onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                            style={{ backgroundColor: severity.color }}
                          ></div>
                          <span className="text-sm">{severity.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {needsMaterial && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Utilizado
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar material</option>
                    {materials.map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas y Observaciones
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe detalles adicionales, observaciones clínicas, recomendaciones..."
            />
          </div>

          {(formData.condition === 'caries' || formData.condition === 'infeccion_apical') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Atención Requerida</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta condición puede requerir tratamiento prioritario. Considera programar una cita pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Registrar Condición
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};