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
      caries: '#EF4444',      // Red
      restauracion: '#3B82F6', // Blue
      corona: '#F59E0B',       // Yellow
      endodoncia: '#8B5CF6',   // Purple
      extraccion: '#6B7280',   // Gray
      implante: '#10B981',     // Green
      fractura: '#F97316'      // Orange
    };
    return colors[condition as keyof typeof colors] || '#6B7280';
  };

  const hasConditions = conditions.length > 0;

  // Determine if it's a molar, premolar, canine, or incisor for shape
  const toothType = getToothType(toothNumber);

  return (
    <div 
      className="cursor-pointer group"
      onClick={onClick}
      title={`Pieza ${toothNumber}${hasConditions ? ` - ${conditions.length} condición(es)` : ''}`}
    >
      <svg 
        width="40" 
        height="50" 
        viewBox="0 0 48 60"
        className="w-8 h-10 sm:w-12 sm:h-15 hover:scale-105 transition-transform duration-200"
      >
        {/* Tooth outline */}
        <path
          d={getToothPath(toothType, isUpper)}
          fill={hasConditions ? getConditionColor(conditions[0].condition) : '#F8FAFC'}
          stroke="#E2E8F0"
          strokeWidth="2"
          className="group-hover:stroke-blue-400 transition-colors duration-200"
        />
        
        {/* Root lines for visual detail */}
        {toothType === 'molar' && (
          <>
            <line x1="16" y1="35" x2="16" y2="50" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="32" y1="35" x2="32" y2="50" stroke="#E2E8F0" strokeWidth="1" />
          </>
        )}
        
        {/* Multiple conditions indicator */}
        {conditions.length > 1 && (
          <circle
            cx="40"
            cy="8"
            r="6"
            fill="#F59E0B"
            stroke="white"
            strokeWidth="2"
          />
        )}
        
        {/* Condition status indicator */}
        {hasConditions && (
          <circle
            cx="8"
            cy="8"
            r="4"
            fill={
              conditions[0].status === 'completado' ? '#10B981' :
              conditions[0].status === 'en_proceso' ? '#F59E0B' : '#6B7280'
            }
          />
        )}
      </svg>
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