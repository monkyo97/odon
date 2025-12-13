import React from 'react';
import { X, User, Mail, Phone, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/FormInput';
import { FormDateInput } from '@/components/FormDateInput';
import { FormTextArea } from '@/components/FormTextArea';
import { Notifications } from '@/components/Notifications';

// 🧠 Esquema de validación con Zod
const patientSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\s-]{6,20}$/.test(v), {
      message: 'Número de teléfono inválido',
    }),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\s-]{6,20}$/.test(v), {
      message: 'Número de teléfono inválido',
    }),
  clinic_id: z.string().uuid('ID de clínica inválido'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: PatientFormData) => Promise<void>;
}

export const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSave }) => {
  //const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      medicalHistory: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: PatientFormData) => {
    try {
      await onSave(data);
      reset();
      onClose();
      Notifications.success('Paciente creado correctamente.');
    } catch (error) {
      console.error('Error creando paciente:', error);
      Notifications.error('Error al crear el paciente. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Datos personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre completo *"
              iconLeft={<User className="h-4 w-4" />}
              placeholder="Ej: María González López"
              registration={register('name')}
              error={errors.name}
            />

            <FormDateInput
              label="Fecha de nacimiento"
              registration={register('birthDate')}
              error={errors.birthDate}
            />

            <FormInput
              type="email"
              label="Correo electrónico"
              iconLeft={<Mail className="h-4 w-4" />}
              placeholder="maria@email.com"
              registration={register('email')}
              error={errors.email}
            />

            <FormInput
              type="tel"
              label="Teléfono"
              iconLeft={<Phone className="h-4 w-4" />}
              placeholder="+593 99 123 4567"
              registration={register('phone')}
              error={errors.phone}
            />
          </div>

          {/* Dirección */}
          <FormInput
            label="Dirección"
            placeholder="Calle, número, ciudad, código postal"
            registration={register('address')}
            error={errors.address}
          />

          {/* Contacto de emergencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Contacto de emergencia"
              placeholder="Nombre del contacto"
              registration={register('emergencyContact')}
              error={errors.emergencyContact}
            />

            <FormInput
              type="tel"
              label="Teléfono de emergencia"
              placeholder="+593 98 765 4321"
              registration={register('emergencyPhone')}
              error={errors.emergencyPhone}
            />
          </div>

          {/* Historia médica */}
          <FormTextArea
            label="Historia médica"
            placeholder="Alergias, medicamentos, condiciones médicas relevantes..."
            registration={register('medicalHistory')}
            error={errors.medicalHistory}
            rows={4}
          />

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
