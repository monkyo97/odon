import React from 'react';
import type { ToothCondition } from './Odontogram';

interface ToothSVGProps {
  toothNumber: number;
  conditions: ToothCondition[];
  onClick: () => void;
  isUpper: boolean;
}

export const ToothSVG: React.FC<ToothSVGProps> = ({ 
  toothNumber, 
  conditions, 
  onClick, 
  isUpper 
}) => {
  const getConditionColor = (condition: string) => {
    const colors = {
      caries: '#EF4444',                    // Red
      restauracion: '#3B82F6',             // Blue
      corona: '#F59E0B',                   // Yellow
      endodoncia: '#8B5CF6',               // Purple
      extraccion: '#6B7280',               // Gray
      implante: '#10B981',                 // Green
      fractura: '#F97316',                 // Orange
      ausente: '#374151',                  // Dark Gray
      puente: '#EC4899',                   // Pink
      carilla: '#06B6D4',                  // Cyan
      infeccion_apical: '#DC2626',         // Dark Red
      reconstruccion_defectuosa: '#7C2D12' // Brown
    };
    return colors[condition as keyof typeof colors] || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completado: '#10B981',  // Green
      en_proceso: '#F59E0B',  // Yellow
      planificado: '#6B7280'  // Gray
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const hasConditions = conditions.length > 0;
  const primaryCondition = conditions[0];
  const isAbsent = conditions.some(c => c.condition === 'ausente' || c.condition === 'extraccion');

  // Determine if it's a molar, premolar, canine, or incisor for shape
  const toothType = getToothType(toothNumber);

  return (
    <div 
      className="cursor-pointer group relative"
      onClick={onClick}
      title={`Pieza ${toothNumber}${hasConditions ? ` - ${conditions.length} condición(es)` : ''}`}
    >
      <svg 
        width="48" 
        height="60" 
        viewBox="0 0 48 60"
        className="w-10 h-12 sm:w-12 sm:h-15 hover:scale-105 transition-transform duration-200"
      >
        {/* Tooth outline */}
        <path
          d={getToothPath(toothType, isUpper)}
          fill={isAbsent ? '#F3F4F6' : (hasConditions ? getConditionColor(primaryCondition.condition) : '#FFFFFF')}
          stroke={isAbsent ? '#D1D5DB' : '#E5E7EB'}
          strokeWidth="2"
          className="group-hover:stroke-blue-400 transition-colors duration-200"
          opacity={isAbsent ? 0.5 : 1}
        />
        
        {/* Absent tooth indicator */}
        {isAbsent && (
          <>
            <line x1="12" y1="12" x2="36" y2="36" stroke="#EF4444" strokeWidth="3" />
            <line x1="36" y1="12" x2="12" y2="36" stroke="#EF4444" strokeWidth="3" />
          </>
        )}
        
        {/* Root lines for visual detail */}
        {toothType === 'molar' && !isAbsent && (
          <>
            <line x1="18" y1="35" x2="18" y2="50" stroke="#E5E7EB" strokeWidth="1" />
            <line x1="30" y1="35" x2="30" y2="50" stroke="#E5E7EB" strokeWidth="1" />
          </>
        )}
        
        {/* Surface indicators for multiple conditions */}
        {conditions.length > 1 && !isAbsent && (
          <g>
            {conditions.slice(1, 4).map((condition, index) => (
              <circle
                key={index}
                cx={32 + (index * 4)}
                cy={8 + (index * 4)}
                r="2"
                fill={getConditionColor(condition.condition)}
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </g>
        )}
        
        {/* Multiple conditions counter */}
        {conditions.length > 1 && (
          <g>
            <circle
              cx="40"
              cy="8"
              r="6"
              fill="#1F2937"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="40"
              y="12"
              textAnchor="middle"
              className="text-xs fill-white font-bold"
              fontSize="8"
            >
              {conditions.length}
            </text>
          </g>
        )}
        
        {/* Status indicator */}
        {hasConditions && !isAbsent && (
          <circle
            cx="8"
            cy="52"
            r="4"
            fill={getStatusColor(primaryCondition.status)}
            stroke="white"
            strokeWidth="1"
          />
        )}

        {/* Severity indicator for urgent conditions */}
        {hasConditions && !isAbsent && 
         ['caries', 'infeccion_apical', 'fractura'].includes(primaryCondition.condition) && 
         primaryCondition.severity === 'severo' && (
          <g>
            <circle cx="40" cy="52" r="5" fill="#DC2626" />
            <text x="40" y="55" textAnchor="middle" className="text-xs fill-white font-bold" fontSize="10">!</text>
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        Pieza {toothNumber}
        {hasConditions && (
          <div className="text-xs">
            {conditions.map((c, i) => (
              <div key={i}>{c.condition} - {c.status}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function getToothType(toothNumber: number): 'molar' | 'premolar' | 'canine' | 'incisor' {
  const lastDigit = toothNumber % 10;
  if (lastDigit >= 6) return 'molar';
  if (lastDigit >= 4) return 'premolar';
  if (lastDigit === 3) return 'canine';
  return 'incisor';
}

function getToothPath(type: string, isUpper: boolean): string {
  const paths = {
    molar: isUpper 
      ? "M8 12 Q8 8 12 8 L36 8 Q40 8 40 12 L40 32 Q40 36 36 36 L12 36 Q8 36 8 32 Z M12 36 L12 52 Q12 56 16 56 Q20 56 20 52 L20 36 M28 36 L28 52 Q28 56 32 56 Q36 56 36 52 L36 36"
      : "M8 24 Q8 20 12 20 L36 20 Q40 20 40 24 L40 44 Q40 48 36 48 L12 48 Q8 48 8 44 Z M12 8 Q12 4 16 4 Q20 4 20 8 L20 20 M28 8 Q28 4 32 4 Q36 4 36 8 L36 20",
    premolar: isUpper
      ? "M12 12 Q12 8 16 8 L32 8 Q36 8 36 12 L36 30 Q36 34 32 34 L16 34 Q12 34 12 30 Z M20 34 L20 50 Q20 54 24 54 Q28 54 28 50 L28 34"
      : "M12 22 Q12 18 16 18 L32 18 Q36 18 36 22 L36 40 Q36 44 32 44 L16 44 Q12 44 12 40 Z M20 8 Q20 4 24 4 Q28 4 28 8 L28 18",
    canine: isUpper
      ? "M16 12 Q16 8 20 8 L28 8 Q32 8 32 12 L32 28 Q32 32 28 32 L20 32 Q16 32 16 28 Z M20 32 L20 52 Q20 56 24 56 Q28 56 28 52 L28 32"
      : "M16 20 Q16 16 20 16 L28 16 Q32 16 32 20 L32 36 Q32 40 28 40 L20 40 Q16 40 16 36 Z M20 8 Q20 4 24 4 Q28 4 28 8 L28 16",
    incisor: isUpper
      ? "M18 12 Q18 8 22 8 L26 8 Q30 8 30 12 L30 26 Q30 30 26 30 L22 30 Q18 30 18 26 Z M22 30 L22 50 Q22 54 24 54 Q26 54 26 50 L26 30"
      : "M18 22 Q18 18 22 18 L26 18 Q30 18 30 22 L30 36 Q30 40 26 40 L22 40 Q18 40 18 36 Z M22 8 Q22 4 24 4 Q26 4 26 8 L26 18"
  };
  
  return paths[type as keyof typeof paths];
}