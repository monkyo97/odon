import React, { useState } from 'react';
import { FieldError } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
  description?: string;
}

interface FormSearchSelectProps {
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  options: Option[];
  onSelect: (option: Option) => void;
  onSearch?: (term: string) => void; // opcional si se busca desde API
  error?: FieldError;
  value?: string;
}

export const FormSearchSelect: React.FC<FormSearchSelectProps> = ({
  label,
  icon,
  placeholder = 'Buscar...',
  options,
  onSelect,
  onSearch,
  error,
  value = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    onSearch?.(term);
  };

  const handleSelect = (option: Option) => {
    setSearchTerm(option.label);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4">
            {icon}
          </span>
        )}

        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)} // permite clickar opciones
          className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-4 py-2 border rounded-lg ${
            error ? 'border-red-400' : 'border-gray-300'
          } focus:ring-2 focus:ring-blue-500`}
          placeholder={placeholder}
        />

        {isOpen && searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.length > 0 ? (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  {opt.description && (
                    <div className="text-sm text-gray-600">{opt.description}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm">Sin resultados</div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
