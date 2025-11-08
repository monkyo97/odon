import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface DiagnosticOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: 'preexistencias' | 'patologias' | 'tratamientos';
}

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothNumber: number | null;
  selectedSurfaces: string[];
  onSave: (diagnostic: any) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  toothNumber,
  selectedSurfaces,
  onSave
}) => {
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<'preexistencias' | 'patologias' | 'tratamientos'>('preexistencias');

  if (!isOpen || !toothNumber) return null;

  const diagnosticOptions: DiagnosticOption[] = [
    // Preexistencias
    {
      id: 'corona',
      name: 'Corona',
      icon: <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-600"></div>,
      color: '#3B82F6',
      category: 'preexistencias'
    },
    {
      id: 'corona_provisoria',
      name: 'Corona provisoria',
      icon: <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-blue-400 flex items-center justify-center text-xs font-bold text-white">P</div>,
      color: '#93C5FD',
      category: 'preexistencias'
    },
    {
      id: 'endodoncia',
      name: 'Endodoncia',
      icon: <div className="w-8 h-8 bg-blue-500 relative"><div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-white"></div></div>,
      color: '#3B82F6',
      category: 'preexistencias'
    },
    {
      id: 'restauracion',
      name: 'Restauración',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-3 h-3 bg-blue-500 rounded-full"></div></div>,
      color: '#3B82F6',
      category: 'preexistencias'
    },
    {
      id: 'implante',
      name: 'Implante',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-2 h-6 bg-blue-500"></div></div>,
      color: '#10B981',
      category: 'preexistencias'
    },
    {
      id: 'perno_munon',
      name: 'Perno muñón',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-1 h-4 bg-blue-600"></div></div>,
      color: '#1E40AF',
      category: 'preexistencias'
    },
    {
      id: 'protesis_removible',
      name: 'Prótesis removible',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-6 h-1 bg-blue-500"></div></div>,
      color: '#06B6D4',
      category: 'preexistencias'
    },
    {
      id: 'amalgama',
      name: 'Amalgama',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-3 h-3 bg-gray-600 rounded-full"></div></div>,
      color: '#4B5563',
      category: 'preexistencias'
    },
    {
      id: 'sellante',
      name: 'Sellante',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-4 h-1 bg-cyan-500 rounded"></div></div>,
      color: '#0EA5E9',
      category: 'preexistencias'
    },

    // Patologías
    {
      id: 'caries',
      name: 'Caries',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-3 h-3 bg-red-500 rounded-full"></div></div>,
      color: '#EF4444',
      category: 'patologias'
    },
    {
      id: 'fractura',
      name: 'Fractura',
      icon: <div className="w-8 h-8 bg-gray-200 rounded relative"><div className="absolute top-0 left-1/2 w-0.5 h-8 bg-red-500 transform -translate-x-1/2 rotate-12"></div></div>,
      color: '#F97316',
      category: 'patologias'
    },
    {
      id: 'infeccion_apical',
      name: 'Infección apical',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><div className="w-2 h-2 bg-red-600 rounded-full"></div></div>,
      color: '#DC2626',
      category: 'patologias'
    },
    {
      id: 'ausente',
      name: 'Ausente',
      icon: <div className="w-8 h-8 bg-gray-200 rounded relative"><div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-lg">×</div></div>,
      color: '#6B7280',
      category: 'patologias'
    },

    // Tratamientos mal estado
    {
      id: 'corona_mal_estado',
      name: 'Corona (mal estado)',
      icon: <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-600 relative"><div className="absolute inset-0 bg-red-500 opacity-30 rounded-full"></div></div>,
      color: '#DC2626',
      category: 'tratamientos'
    },
    {
      id: 'restauracion_mal_estado',
      name: 'Restauración (mal estado)',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center relative"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><div className="absolute inset-0 bg-red-500 opacity-30 rounded"></div></div>,
      color: '#DC2626',
      category: 'tratamientos'
    },
    {
      id: 'amalgama_mal_estado',
      name: 'Amalgama (mal estado)',
      icon: <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center relative"><div className="w-3 h-3 bg-gray-600 rounded-full"></div><div className="absolute inset-0 bg-red-500 opacity-30 rounded"></div></div>,
      color: '#DC2626',
      category: 'tratamientos'
    }
  ];

  const categories = [
    { id: 'preexistencias', name: 'Preexistencias', count: diagnosticOptions.filter(d => d.category === 'preexistencias').length },
    { id: 'patologias', name: 'Patologías', count: diagnosticOptions.filter(d => d.category === 'patologias').length },
    { id: 'tratamientos', name: 'Mal Estado', count: diagnosticOptions.filter(d => d.category === 'tratamientos').length }
  ];

  const filteredOptions = diagnosticOptions.filter(option => option.category === activeCategory);

  const handleSave = () => {
    if (!selectedDiagnostic) return;

    const diagnostic = {
      toothNumber,
      surfaces: selectedSurfaces,
      condition: selectedDiagnostic,
      notes,
      date: new Date().toISOString().split('T')[0],
      status: 'completado'
    };

    onSave(diagnostic);
    setSelectedDiagnostic('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Definir diagnóstico - Pieza {toothNumber}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Category Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Diagnostic Options Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedDiagnostic(option.id)}
                className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                  selectedDiagnostic === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {option.icon}
                  <span className="text-sm font-medium text-gray-900">{option.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Surfaces */}
          {selectedSurfaces.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Superficies seleccionadas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSurfaces.map((surface) => (
                  <span key={surface} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {surface.charAt(0).toUpperCase() + surface.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios adicionales
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese un comentario para este diagnóstico..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedDiagnostic}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              Agregar al odontograma
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};