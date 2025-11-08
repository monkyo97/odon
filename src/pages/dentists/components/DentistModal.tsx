import React from 'react';
import { X, User, Mail, Phone, Briefcase } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { Notifications } from '@/components/Notifications';
import { FormSelect } from '@/components/FormSelect';
import { especialities } from '@/constants/globalConstants';

// 🧠 Validación con Zod
const dentistSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio'),
  email: z.string().email('Correo inválido'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[0-9+\s-]{6,20}$/.test(v), {
      message: 'Número de teléfono inválido',
    }),
  specialty: z.string().optional(),
  license_number: z.string().optional(),
  status: z.enum(['1', '0']).default('1').nonoptional(),
});

type DentistFormData = z.infer<typeof dentistSchema>;

interface DentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dentistData: DentistFormData) => Promise<void>;
}

export const DentistModal: React.FC<DentistModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DentistFormData>({
    resolver: zodResolver(dentistSchema),
    defaultValues: { status: '1' },
  });

  if (!isOpen) return null;
  
  const onSubmit = async (data: DentistFormData) => {
    try {
      await onSave(data);
      reset();
      onClose();
      Notifications.success('Odontólogo registrado correctamente.');
    } catch (error) {
      console.error('Error creando odontólogo:', error);
      Notifications.error('No se pudo registrar el odontólogo. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Odontólogo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Nombre completo *"
              iconLeft={<User className="h-4 w-4" />}
              placeholder="Ej: Dra. María Pérez"
              registration={register('name')}
              error={errors.name}
            />

            <FormInput
              type="email"
              label="Correo electrónico *"
              iconLeft={<Mail className="h-4 w-4" />}
              placeholder="odontologo@correo.com"
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

            {/* <FormInput
              label="Especialidad"
              iconLeft={<Briefcase className="h-4 w-4" />}
              placeholder="Ortodoncia, Endodoncia, etc."
              registration={register('specialty')}
              error={errors.specialty}
            /> */}

            <FormSelect
              label="Especialidad *"
              registration={register('specialty')}
              error={errors.specialty}
              options={
                especialities.map((especiality) => ({
                  label: especiality.label,
                  value: especiality.value,
                }))
              }
            />

            <FormInput
              label="N° de Licencia"
              placeholder="Ej: 09-OD-2023"
              registration={register('license_number')}
              error={errors.license_number}
            />
            {/* <FormSelect
              label="Estado"
              registration={register('status')}
              error={errors.status}
              options={statusOptions}
            /> */}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
