import React, { useEffect } from 'react';
import { X, User, Mail, Phone, BookMarked, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { FormSelect } from '@components/FormSelect';
import { especialities, statusOptions } from '../../../constants/globalConstants';
import { Notifications } from '@/components/Notifications';

// 🧠 Zod validation
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
  status: z.enum(['1', '0'], 'Debe seleccionar un estado').default('1').nonoptional(),
});

export type DentistFormData = z.infer<typeof dentistSchema>;

interface EditDentistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DentistFormData) => void | Promise<void>;
  dentist: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    license_number?: string;
    status: '1' | '0';
  };
  isLoading?: boolean;
}

export const EditDentistModal: React.FC<EditDentistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dentist,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DentistFormData>({
    resolver: zodResolver(dentistSchema),
    defaultValues: dentist,
  });

  // 🔄 Syncs values when dentist changes
  useEffect(() => {
    if (dentist) reset(dentist);
  }, [dentist, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: DentistFormData) => {
    try {
      await onSave(data);
      Notifications.success('Odontólogo actualizado correctamente.');
    } catch (error) {
      console.error('Error actualizando odontólogo:', error);
      Notifications.error('Error al actualizar odontólogo. Inténtalo nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Odontólogo</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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
              placeholder="odontologo@ejemplo.com"
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
              iconLeft={<BookMarked className="h-4 w-4" />}
              placeholder="Ej: 09-OD-2023"
              registration={register('license_number')}
              error={errors.license_number}
            />

            <FormSelect
              label="Estado"
              registration={register('status')}
              error={errors.status}
              options={statusOptions}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting || isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
