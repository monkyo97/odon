import React from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Calendar } from 'lucide-react';

interface FormDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    registration?: UseFormRegisterReturn;
}

export const FormDateInput: React.FC<FormDateInputProps> = ({
    label,
    error,
    registration,
    className,
    ...props
}) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Calendar className="h-4 w-4" />
                </span>
                <input
                    type="date"
                    {...(registration || {})}
                    {...props}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-400' : 'border-gray-300'}
            ${className || ''}`}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    );
};
