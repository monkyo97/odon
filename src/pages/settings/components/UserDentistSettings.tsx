import React, { useEffect } from 'react';
import { Save, Loader2, User } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { FormSelect } from '@components/FormSelect';
import { useUserProfile } from '@hooks/useUserProfile';
import { especialities } from '../../../constants/globalConstants';
import { Notifications } from '@/components/Notifications';

// ✅ Zod validation
const profileSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  license_number: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const UserSettings: React.FC = () => {
  const { profile, loading, updateUserProfile } = useUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        specialty: profile.specialty || '',
        license_number: profile.license_number || ''
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (profile?.id) {
        await updateUserProfile.mutateAsync(data);
        Notifications.success('Perfil actualizado correctamente.');
      }
    } catch (err: any) {
      Notifications.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-600">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cargando información...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600" /> Usuario Principal
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Nombre completo *" registration={register('name')} error={errors.name} />
        <FormInput label="Correo electrónico " registration={register('email')} error={errors.email} disabled classNameInput='bg-gray-300' />
        <FormInput label="Teléfono" registration={register('phone')} error={errors.phone} />
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
        <FormInput label="Número de licencia" registration={register('license_number')} error={errors.license_number} />
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar
        </button>
      </div>
    </form>
  );
};
