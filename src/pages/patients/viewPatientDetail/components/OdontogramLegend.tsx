import React from 'react';

export const OdontogramLegend: React.FC = () => {
  const conditions = [
    { color: '#EF4444', label: 'Caries', icon: '●' },
    { color: '#3B82F6', label: 'Restauración', icon: '●' },
    { color: '#F59E0B', label: 'Corona', icon: '●' },
    { color: '#8B5CF6', label: 'Endodoncia', icon: '●' },
    { color: '#6B7280', label: 'Extracción/Ausente', icon: '●' },
    { color: '#10B981', label: 'Implante', icon: '●' },
    { color: '#F97316', label: 'Fractura', icon: '●' },
    { color: '#EC4899', label: 'Puente', icon: '●' },
    { color: '#06B6D4', label: 'Carilla', icon: '●' },
    { color: '#DC2626', label: 'Infección Apical', icon: '●' },
    { color: '#7C2D12', label: 'Reconstrucción Defectuosa', icon: '●' }
  ];

  const statuses = [
    { color: '#10B981', label: 'Completado', icon: '●' },
    { color: '#F59E0B', label: 'En Proceso', icon: '●' },
    { color: '#6B7280', label: 'Planificado', icon: '●' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Leyenda del Odontograma</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Condiciones Dentales</h5>
          <div className="grid grid-cols-2 gap-2">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center text-xs">
                <span 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: condition.color }}
                ></span>
                <span className="text-gray-700 truncate">{condition.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Estados de Tratamiento</h5>
          <div className="space-y-2">
            {statuses.map((status, index) => (
              <div key={index} className="flex items-center text-xs">
                <span 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: status.color }}
                ></span>
                <span className="text-gray-700">{status.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Indicadores</h5>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Múltiples condiciones: Número en esquina superior</div>
              <div>• Estado del tratamiento: Punto en esquina inferior</div>
              <div>• Haz clic en cualquier diente para agregar/ver condiciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};