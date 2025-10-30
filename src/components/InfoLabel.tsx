// src/components/InfoLabel.tsx
import React from 'react';

interface InfoLabelProps {
  label: string | React.ReactNode;
  icon?: React.ElementType;
  labelClassName?: string;
  iconClassName?: string;
  direction?: 'row' | 'col';
  onClick?: () => void;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({
  label,
  icon: Icon,
  labelClassName = 'text-sm text-gray-800',
  iconClassName = 'h-4 w-4 mr-2 text-gray-500',
  direction = 'row',
  onClick,
}) => {
  const hasIcon = !!Icon;

  return (
    <div
      className={`flex ${
        direction === 'col' ? 'flex-col items-start' : 'flex-row items-center'
      } ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      {hasIcon && <Icon className={iconClassName} />}
      <span className={labelClassName}>{label}</span>
    </div>
  );
};
