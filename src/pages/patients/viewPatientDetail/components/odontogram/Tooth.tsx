// src/components/odontogram/Tooth.tsx
import React from 'react';
import { COLORS_BY_CONDITION } from '@constants/odontogram';
import type { ToothCondition } from '@hooks/useToothConditions';

type Props = {
  number: number;
  conditions: ToothCondition[];
  selected: boolean;
  onClick: () => void;
};

export const Tooth: React.FC<Props> = ({ number, conditions, selected, onClick }) => {
  // takes the first one for visual "main status"
  const color = COLORS_BY_CONDITION[conditions[0]?.condition || ''] || 'transparent';

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer relative flex flex-col items-center justify-center w-10 h-14 rounded-md border transition-all duration-150 ${selected ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-100'
        }`}
    >
      {/* Simplified SVG */}
      <svg width="24" height="26" viewBox="0 0 24 26" className="text-gray-400">
        <path
          d="M12 1c5 0 8 3.5 8 8.5S16 24 12 24 4 14.5 4 9.5 7 1 12 1z"
          fill="#fff" stroke="#9CA3AF" strokeWidth="1.2"
        />
        {/* color block to indicate "status" */}
        <rect x="6" y="10" width="12" height="6" rx="2" fill={color} />
      </svg>
      <span className="text-[11px] text-gray-700 mt-1">{number}</span>
    </div>
  );
};
