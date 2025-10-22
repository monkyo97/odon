// src/components/FormInput.tsx
import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  textarea?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  registration,
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
        <input
            {...registration}
            {...props}
            className={`${baseClasses} ${borderColor}`}
          />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
