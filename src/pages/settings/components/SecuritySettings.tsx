import React, { useState } from 'react';
import { Save, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@components/FormInput';
import { useUserProfile } from '@hooks/useUserProfile';
import { Notifications } from '@components/Notifications';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'La contraseña actual es obligatoria'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Debe confirmar la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SecuritySettings: React.FC = () => {
  const { changePassword } = useUserProfile();
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      Notifications.success('Contraseña actualizada correctamente.');
    } catch (err: any) {
      Notifications.error(`No se pudo actualizar la contraseña.`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" /> Cambiar Contraseña
      </h3>

      <FormInput
        label="Contraseña actual *"
        type={show.current ? 'text' : 'password'}
        registration={register('currentPassword')}
        error={errors.currentPassword}
        iconLeft={<Shield className="h-4 w-4" />}
        iconRight={show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        onIconRightClick={() => setShow((p) => ({ ...p, current: !p.current }))}
      />

      <FormInput
        label="Nueva contraseña *"
        type={show.new ? 'text' : 'password'}
        registration={register('newPassword')}
        error={errors.newPassword}
        iconLeft={<Shield className="h-4 w-4" />}
        iconRight={show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        onIconRightClick={() => setShow((p) => ({ ...p, new: !p.new }))}
      />

      <FormInput
        label="Confirmar nueva contraseña *"
        type={show.confirm ? 'text' : 'password'}
        registration={register('confirmPassword')}
        error={errors.confirmPassword}
        iconLeft={<Shield className="h-4 w-4" />}
        iconRight={show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        onIconRightClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
      />

      <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
        <button
          type="submit"
          disabled={isSubmitting || changePassword.isPending}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {(isSubmitting || changePassword.isPending) ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Contraseña
        </button>
      </div>
    </form>
  );
};
