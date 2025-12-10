import { CONDITION_COLORS, TREATMENT_STATUSES, STATUS_LABELS } from '@/constants/odontogram';

export const OdontogramLegend: React.FC = () => {
  const conditions = [
    { color: CONDITION_COLORS.caries, label: 'Caries' },
    { color: CONDITION_COLORS.restoration, label: 'Restauración' },
    { color: CONDITION_COLORS.crown, label: 'Corona' },
    { color: CONDITION_COLORS.endodontics, label: 'Endodoncia' },
    { color: CONDITION_COLORS.missing, label: 'Extracción/Ausente' },
    { color: CONDITION_COLORS.implant, label: 'Implante' },
    { color: CONDITION_COLORS.fracture, label: 'Fractura' },
    { color: CONDITION_COLORS.bridge, label: 'Puente' }, // Bridge typically blue
    // { color: '#06B6D4', label: 'Carilla', icon: '●' }, // Not in standard constants?
    { color: CONDITION_COLORS.extraction_planned, label: 'Infección Apical' }, // Reusing color or need new? Legend says 'Infección Apical' is Red. 'extraction_planned' is red.
    // { color: '#7C2D12', label: 'Reconstrucción Defectuosa', icon: '●' } 
  ];

  // Using a simplified manual list for now to match visual expectation but using constants where possible.
  // Actually, let's keep it clean and use explicit values if not in constants, but attempt to match.

  const statuses = [
    { color: '#10B981', label: STATUS_LABELS[TREATMENT_STATUSES.COMPLETED] },
    { color: '#F59E0B', label: STATUS_LABELS[TREATMENT_STATUSES.IN_PROGRESS] },
    { color: '#6B7280', label: STATUS_LABELS[TREATMENT_STATUSES.PLANNED] }
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