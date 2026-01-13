import React, { useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Patient } from '@/hooks/usePatients';
import { FormInput } from '@/components/FormInput';
import { FormDateInput } from '@/components/FormDateInput';
import { FormTextArea } from '@/components/FormTextArea';
import { FormSelect } from '@/components/FormSelect';
import { Notifications } from '@/components/Notifications';

// 🧠 Zod validation
const patientSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Correo inválido'),
  phone: z
    .string()
    .min(6, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  birth_date: z.string().nonempty('La fecha de nacimiento es obligatoria'),
  address: z.string().optional(),
  medical_history: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  status: z.enum(['1', '0']).default('1').nonoptional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patientData: Partial<Patient>) => Promise<void>;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      medical_history: '',
      emergency_contact: '',
      emergency_phone: '',
      status: '1',
    },
  });

  // 🔄 Updates form when patient is selected
  useEffect(() => {
    if (patient) reset(patient);
  }, [patient, reset]);

  if (!isOpen || !patient) return null;

  const onSubmit = async (data: PatientFormData) => {
    try {
      await onSave(data);
      onClose();
      Notifications.success('Paciente actualizado correctamente.');
    } catch (error) {
      console.error('Error updating patient:', error);
      Notifications.error('Error al actualizar el paciente. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre completo *"
              iconLeft={<User className="h-4 w-4" />}
              registration={register('name')}
              error={errors.name}
              placeholder="Ej: María González López"
            />

            <FormDateInput
              label="Fecha de nacimiento *"
              registration={register('birth_date')}
              error={errors.birth_date}
            />

            <FormInput
              type="email"
              label="Correo electrónico *"
              iconLeft={<Mail className="h-4 w-4" />}
              registration={register('email')}
              error={errors.email}
              placeholder="maria@email.com"
            />

            <FormInput
              type="tel"
              label="Teléfono *"
              iconLeft={<Phone className="h-4 w-4" />}
              registration={register('phone')}
              error={errors.phone}
              placeholder="+593 99 123 4567"
            />

            <FormSelect
              label="Estado"
              registration={register('status')}
              error={errors.status}
              options={[
                { value: '1', label: 'Activo' },
                { value: '0', label: 'Inactivo' },
              ]}
            />
          </div>

          {/* Address */}
          <FormInput
            label="Dirección"
            registration={register('address')}
            error={errors.address}
            placeholder="Calle, número, ciudad, código postal"
          />

          {/* Emergency contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Contacto de emergencia"
              registration={register('emergency_contact')}
              error={errors.emergency_contact}
              placeholder="Nombre del contacto"
            />

            <FormInput
              type="tel"
              label="Teléfono de emergencia"
              registration={register('emergency_phone')}
              error={errors.emergency_phone}
              placeholder="+593 98 765 4321"
            />
          </div>

          {/* Medical history */}
          <FormTextArea
            label="Historia médica"
            registration={register('medical_history')}
            error={errors.medical_history}
            placeholder="Alergias, medicamentos, condiciones médicas relevantes..."
            rows={4}
          />

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Actualizando...' : 'Actualizar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
