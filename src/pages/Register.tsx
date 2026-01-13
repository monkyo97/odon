import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, User, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { especialities } from '../constants/globalConstants';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    clinicName: '',
    clinicAddress: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, register, isLoading } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ Validations
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    // ✅ Call register method from AuthContext
    const { user: createdUser, error } = await register({
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      specialty: formData.specialty || 'Odontología General',
      licenseNumber: formData.licenseNumber.trim(),
      clinicName: formData.clinicName.trim() || formData.name.trim(),
      clinicAddress: formData.clinicAddress.trim()
    });

    if (error || !createdUser) {
      console.error('Error al crear cuenta:', error);
      setError('Error al crear la cuenta. Verifica el correo o intenta más tarde.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-600 mt-2">Registro para clínicas odontológicas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🔹 Personal Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="name"
                label="Nombre completo *"
                iconLeft={<User />}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. María González"
                required
              />

              <InputField
                id="email"
                label="Correo electrónico *"
                iconLeft={<Mail />}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="doctor@email.com"
                required
              />

              <InputField
                id="phone"
                label="Teléfono"
                iconLeft={<Phone />}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+593 999 123 456"
              />

              <SelectField
                id="specialty"
                label="Especialidad"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />

              {/* <InputField
                id="licenseNumber"
                label="Número de colegiado"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="COL-12345"
              /> */}


            </div>
            <InputField
              id="clinicName"
              label="Nombre de la clínica"
              iconLeft={<Building />}
              value={formData.clinicName}
              onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
              placeholder="Clínica Dental González"
            />
            <InputField
              id="clinicAddress"
              label="Dirección de la clínica"
              value={formData.clinicAddress}
              onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
              placeholder="Av. Amazonas 123, Quito"
            />

            {/* 🔹 Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordField
                id="password"
                label="Contraseña *"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                show={showPassword}
                toggleShow={() => setShowPassword(!showPassword)}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirmar contraseña *"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                show={showConfirmPassword}
                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🧩 Auxiliary components for code cleanliness
interface InputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

const InputField: React.FC<InputProps> = ({ id, label, icon, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4">{icon}</div>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
      />
    </div>
  </div>
);

interface PasswordProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  toggleShow: () => void;
}

const PasswordField: React.FC<PasswordProps> = ({ id, label, value, onChange, show, toggleShow }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
        placeholder="Mínimo 6 caracteres"
        required
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField: React.FC<SelectProps> = ({ id, label, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
    >
      {especialities.map((especiality) => (
        <option key={especiality.value} value={especiality.value}>
          {especiality.label}
        </option>
      ))}
    </select>
  </div>
);
