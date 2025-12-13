import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: React.ReactNode;
  options: Option[];
  error?: FieldError;
  registration?: UseFormRegisterReturn;
  placeholder?: string;
  showEmptyOption?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  icon,
  options,
  error,
  registration,
  placeholder,
  showEmptyOption = true,
  ...props
}) => {
  const baseClasses =
    'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500';
  const borderColor = error ? 'border-red-400' : 'border-gray-300';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4">
            {icon}
          </span>
        )}
        <select
          {...(registration || {})}
          {...props}
          className={`${baseClasses} ${borderColor} ${icon ? 'pl-10' : 'pl-3'}`}
        >
          {showEmptyOption && (
            <option value="">{placeholder || 'Seleccionar una opción'}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
