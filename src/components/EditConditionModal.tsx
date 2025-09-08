import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ToothCondition } from './Odontogram';

interface EditConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  condition: ToothCondition | null;
  onSave: (condition: ToothCondition) => void;
}

export const EditConditionModal: React.FC<EditConditionModalProps> = ({
  isOpen,
  onClose,
  condition,
  onSave
}) => {
  const [formData, setFormData] = useState({
    surface: 'oclusal' as const,
    condition: 'caries' as const,
    status: 'planificado' as const,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (condition) {
      setFormData({
        surface: condition.surface,
        condition: condition.condition,
        status: condition.status,
        notes: condition.notes,
        date: condition.date
      });
    }
  }, [condition]);

  if (!isOpen || !condition) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...condition,
      ...formData
    });
  };

  const surfaces = [
    { value: 'oclusal', label: 'Oclusal' },
    { value: 'vestibular', label: 'Vestibular' },
    { value: 'lingual', label: 'Lingual' },
    { value: 'mesial', label: 'Mesial' },
    { value: 'distal', label: 'Distal' },
    { value: 'incisal', label: 'Incisal' }
  ];

  const conditions = [
    { value: 'caries', label: 'Caries' },
    { value: 'restauracion', label: 'Restauración' },
    { value: 'corona', label: 'Corona' },
    { value: 'endodoncia', label: 'Endodoncia' },
    { value: 'extraccion', label: 'Extracción' },
    { value: 'implante', label: 'Implante' },
    { value: 'fractura', label: 'Fractura' }
  ];

  const statuses = [
    { value: 'planificado', label: 'Planificado' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Condición - Pieza {condition.toothNumber}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Superficie *
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
              Condición *
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
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
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observaciones adicionales..."
            />
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};