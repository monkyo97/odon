import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface RadioOption {
  label: string;
  value: string | number | boolean;
}

interface FormRadioGroupProps {
  label: string;
  options: RadioOption[];
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
  inline?: boolean; // controla si van en fila o en columna
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  registration,
  error,
  inline = true,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div
        className={`flex ${
          inline ? 'flex-row space-x-4' : 'flex-col space-y-2'
        } mb-2`}
      >
        {options.map((opt) => (
          <label key={opt.value.toString()} className="flex items-center space-x-2">
            <input
              type="radio"
              value={opt.value.toString()}
              checked={value === opt.value}
              onChange={() => onChange?.(opt.value)}
              {...registration}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
