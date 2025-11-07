import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  classNameInput?: string;
  onIconRightClick?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  iconLeft,
  iconRight,
  error,
  registration,
  classNameInput,
  onIconRightClick,
  ...props
}) => {
  const hasIconLeft = !!iconLeft;
  const hasIconRight = !!iconRight;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {hasIconLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4">
            {iconLeft}
          </span>
        )}

        <input
          {...registration}
          {...props}
          className={`w-full border rounded-lg text-sm py-2 ${
            hasIconLeft ? 'pl-10' : 'pl-4'
          } ${hasIconRight ? 'pr-10' : 'pr-4'}
          focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${classNameInput || ''}`}
        />

        {hasIconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            {iconRight}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
