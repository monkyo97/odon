import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormTextAreaProps {
  label: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  rows?: number;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  placeholder,
  registration,
  error,
  rows = 3,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      {...registration}
      rows={rows}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-400' : 'border-gray-300'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);
